package com.jobportal.api.service;

import com.jobportal.api.dto.request.SearchRequest;
import com.jobportal.api.dto.response.CandidateProfileResponse;
import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.dto.response.RankedCandidateResponse;
import com.jobportal.api.entity.CandidateProfile;
import com.jobportal.api.entity.Company;
import com.jobportal.api.entity.Job;
import com.jobportal.api.entity.Resume;
import com.jobportal.api.exception.BadRequestException;
import com.jobportal.api.exception.ForbiddenException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.CandidateProfileRepository;
import com.jobportal.api.repository.CompanyRepository;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SearchService {

    private final MlServiceClient mlServiceClient;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;

    /**
     * Search for jobs semantically using a candidate's resume or query text.
     * Combines ML similarity search with database lookups to return full job details.
     */
    public PagedResponse<JobResponse> searchJobsByResume(UUID userId, SearchRequest request) {
        String queryText = resolveQueryText(request, userId);

        if (queryText == null || queryText.isBlank()) {
            throw new BadRequestException("Either resumeId or queryText must be provided");
        }

        Map<String, Object> filter = buildJobFilter(request);
        int topK = request.getTopK() > 0 ? request.getTopK() : 20;

        List<MlServiceClient.SearchResult> searchResults =
                mlServiceClient.searchJobsByResume(queryText, topK, filter);

        if (searchResults.isEmpty()) {
            return PagedResponse.<JobResponse>builder()
                    .content(Collections.emptyList())
                    .page(0)
                    .size(topK)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        // Extract job UUIDs from search results (IDs stored as "job_{uuid}")
        List<UUID> jobIds = searchResults.stream()
                .map(result -> {
                    try {
                        String id = result.getId().replace("job_", "");
                        return UUID.fromString(id);
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid UUID in search result: {}", result.getId());
                        return null;
                    }
                })
                .filter(id -> id != null)
                .toList();

        // Fetch full Job entities from database
        List<Job> jobs = jobRepository.findByIdIn(jobIds);

        // Build a score map for merging (strip "job_" prefix from IDs)
        Map<String, Double> scoreMap = searchResults.stream()
                .collect(Collectors.toMap(
                        r -> r.getId().replace("job_", ""),
                        MlServiceClient.SearchResult::getScore,
                        (a, b) -> a
                ));

        // Convert to responses and sort by score descending
        List<JobResponse> jobResponses = jobs.stream()
                .map(job -> JobResponse.fromEntity(job))
                .sorted((a, b) -> {
                    double scoreA = scoreMap.getOrDefault(a.getId().toString(), 0.0);
                    double scoreB = scoreMap.getOrDefault(b.getId().toString(), 0.0);
                    return Double.compare(scoreB, scoreA);
                })
                .toList();

        return PagedResponse.<JobResponse>builder()
                .content(jobResponses)
                .page(0)
                .size(topK)
                .totalElements(jobResponses.size())
                .totalPages(1)
                .last(true)
                .build();
    }

    /**
     * Search for candidates semantically using a job description or query text.
     * Only company owners can search for candidates against their jobs.
     */
    public PagedResponse<RankedCandidateResponse> searchCandidatesByJob(UUID userId, SearchRequest request) {
        // Verify the user is a company owner
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ForbiddenException("Only company owners can search for candidates"));

        String queryText = resolveJobQueryText(request);

        if (queryText == null || queryText.isBlank()) {
            throw new BadRequestException("queryText must be provided for candidate search");
        }

        Map<String, Object> filter = buildCandidateFilter(request);
        int topK = request.getTopK() > 0 ? request.getTopK() : 20;

        List<MlServiceClient.SearchResult> searchResults =
                mlServiceClient.searchCandidatesByJob(queryText, topK, filter);

        if (searchResults.isEmpty()) {
            return PagedResponse.<RankedCandidateResponse>builder()
                    .content(Collections.emptyList())
                    .page(0)
                    .size(topK)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        // Extract resume UUIDs from search results (IDs stored as "resume_{resumeId}")
        List<UUID> resumeIds = searchResults.stream()
                .map(result -> {
                    try {
                        String id = result.getId().replace("resume_", "");
                        return UUID.fromString(id);
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid UUID in search result: {}", result.getId());
                        return null;
                    }
                })
                .filter(id -> id != null)
                .toList();

        // Fetch resumes, then get their candidate profiles
        List<Resume> resumes = resumeRepository.findAllById(resumeIds);
        Map<UUID, CandidateProfile> profileByResumeId = resumes.stream()
                .filter(r -> r.getCandidateProfile() != null)
                .collect(Collectors.toMap(
                        Resume::getId,
                        Resume::getCandidateProfile,
                        (a, b) -> a
                ));

        // Build a score map keyed by resume ID
        Map<String, Double> scoreMap = searchResults.stream()
                .collect(Collectors.toMap(
                        r -> r.getId().replace("resume_", ""),
                        MlServiceClient.SearchResult::getScore,
                        (a, b) -> a
                ));

        // Convert to ranked candidate responses sorted by score descending
        List<RankedCandidateResponse> rankedCandidates = resumeIds.stream()
                .filter(profileByResumeId::containsKey)
                .map(resumeId -> {
                    CandidateProfile profile = profileByResumeId.get(resumeId);
                    double score = scoreMap.getOrDefault(resumeId.toString(), 0.0);
                    return RankedCandidateResponse.builder()
                            .candidateProfile(CandidateProfileResponse.fromEntity(profile))
                            .similarityScore(BigDecimal.valueOf(score).setScale(4, RoundingMode.HALF_UP))
                            .build();
                })
                .sorted((a, b) -> b.getSimilarityScore().compareTo(a.getSimilarityScore()))
                .toList();

        return PagedResponse.<RankedCandidateResponse>builder()
                .content(rankedCandidates)
                .page(0)
                .size(topK)
                .totalElements(rankedCandidates.size())
                .totalPages(1)
                .last(true)
                .build();
    }

    /**
     * Resolve query text from either a resumeId or direct queryText in the request.
     */
    private String resolveQueryText(SearchRequest request, UUID userId) {
        if (request.getResumeId() != null) {
            Resume resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", request.getResumeId()));

            // Verify the resume belongs to the requesting user
            CandidateProfile profile = resume.getCandidateProfile();
            if (profile != null && profile.getUser() != null
                    && !profile.getUser().getId().equals(userId)) {
                throw new ForbiddenException("You are not authorized to use this resume for search");
            }

            String parsedText = resume.getParsedText();
            if (parsedText != null && !parsedText.isBlank()) {
                return parsedText;
            }
        }

        return request.getQueryText();
    }

    /**
     * Resolve query text for job-based search from the request.
     */
    private String resolveJobQueryText(SearchRequest request) {
        return request.getQueryText();
    }

    /**
     * Build filter map for job search based on request parameters.
     */
    private Map<String, Object> buildJobFilter(SearchRequest request) {
        Map<String, Object> filter = new HashMap<>();

        if (request.getJobType() != null && !request.getJobType().isBlank()) {
            filter.put("job_type", request.getJobType());
        }
        if (request.getWorkMode() != null && !request.getWorkMode().isBlank()) {
            filter.put("work_mode", request.getWorkMode());
        }
        if (request.getExperienceLevel() != null && !request.getExperienceLevel().isBlank()) {
            filter.put("experience_level", request.getExperienceLevel());
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            filter.put("location", request.getLocation());
        }

        return filter;
    }

    /**
     * Build filter map for candidate search based on request parameters.
     */
    private Map<String, Object> buildCandidateFilter(SearchRequest request) {
        Map<String, Object> filter = new HashMap<>();

        if (request.getWorkMode() != null && !request.getWorkMode().isBlank()) {
            filter.put("preferred_work_mode", request.getWorkMode());
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            filter.put("location", request.getLocation());
        }

        return filter;
    }
}
