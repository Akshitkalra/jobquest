package com.jobportal.api.service;

import com.jobportal.api.dto.request.JobCreateRequest;
import com.jobportal.api.dto.request.JobUpdateRequest;
import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.Application;
import com.jobportal.api.entity.ApplicationStatusHistory;
import com.jobportal.api.entity.Company;
import com.jobportal.api.entity.Job;
import com.jobportal.api.entity.Skill;
import com.jobportal.api.entity.enums.ApplicationStatus;
import com.jobportal.api.entity.enums.ExperienceLevel;
import com.jobportal.api.entity.enums.JobStatus;
import com.jobportal.api.entity.enums.JobType;
import com.jobportal.api.entity.enums.WorkMode;
import com.jobportal.api.exception.ForbiddenException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.ApplicationRepository;
import com.jobportal.api.repository.ApplicationStatusHistoryRepository;
import com.jobportal.api.repository.CompanyRepository;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.SavedJobRepository;
import com.jobportal.api.repository.SkillRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final SkillRepository skillRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final SavedJobRepository savedJobRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final MlServiceClient mlServiceClient;

    public JobResponse createJob(UUID userId, JobCreateRequest request) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        Set<Skill> skills = new HashSet<>();
        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
        }

        String slug = generateSlug(request.getTitle());

        Job job = Job.builder()
                .company(company)
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .responsibilities(request.getResponsibilities())
                .benefits(request.getBenefits())
                .jobType(JobType.valueOf(request.getJobType()))
                .experienceLevel(ExperienceLevel.valueOf(request.getExperienceLevel()))
                .workMode(WorkMode.valueOf(request.getWorkMode()))
                .location(request.getLocation())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .salaryCurrency(request.getSalaryCurrency())
                .isSalaryVisible(request.isSalaryVisible())
                .applicationDeadline(parseDeadline(request.getApplicationDeadline()))
                .status(request.getStatus() != null ? JobStatus.valueOf(request.getStatus()) : JobStatus.ACTIVE)
                .viewsCount(0)
                .applicationsCount(0)
                .shortlistCount(request.getShortlistCount())
                .skills(skills)
                .build();

        Job savedJob = jobRepository.save(job);

        // Vectorize the job in Pinecone (async-safe, non-blocking on failure)
        vectorizeJobAsync(savedJob);

        return JobResponse.fromEntity(savedJob);
    }

    public JobResponse updateJob(UUID userId, UUID jobId, JobUpdateRequest request) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getCompany().getId().equals(company.getId())) {
            throw new ForbiddenException("You are not authorized to update this job");
        }

        if (request.getTitle() != null) {
            job.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            job.setDescription(request.getDescription());
        }
        if (request.getRequirements() != null) {
            job.setRequirements(request.getRequirements());
        }
        if (request.getResponsibilities() != null) {
            job.setResponsibilities(request.getResponsibilities());
        }
        if (request.getBenefits() != null) {
            job.setBenefits(request.getBenefits());
        }
        if (request.getJobType() != null) {
            job.setJobType(JobType.valueOf(request.getJobType()));
        }
        if (request.getExperienceLevel() != null) {
            job.setExperienceLevel(ExperienceLevel.valueOf(request.getExperienceLevel()));
        }
        if (request.getWorkMode() != null) {
            job.setWorkMode(WorkMode.valueOf(request.getWorkMode()));
        }
        if (request.getLocation() != null) {
            job.setLocation(request.getLocation());
        }
        if (request.getSalaryMin() != null) {
            job.setSalaryMin(request.getSalaryMin());
        }
        if (request.getSalaryMax() != null) {
            job.setSalaryMax(request.getSalaryMax());
        }
        if (request.getSalaryCurrency() != null) {
            job.setSalaryCurrency(request.getSalaryCurrency());
        }
        if (request.getIsSalaryVisible() != null) {
            job.setIsSalaryVisible(request.getIsSalaryVisible());
        }
        if (request.getApplicationDeadline() != null) {
            job.setApplicationDeadline(parseDeadline(request.getApplicationDeadline()));
        }
        if (request.getStatus() != null) {
            job.setStatus(JobStatus.valueOf(request.getStatus()));
        }
        if (request.getShortlistCount() != null) {
            job.setShortlistCount(request.getShortlistCount());
        }
        if (request.getSkillIds() != null) {
            Set<Skill> skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
            job.setSkills(skills);
        }

        Job updatedJob = jobRepository.save(job);

        // Re-vectorize the job in Pinecone
        vectorizeJobAsync(updatedJob);

        return JobResponse.fromEntity(updatedJob);
    }

    public JobResponse getJobBySlug(String slug) {
        Job job = jobRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "slug", slug));

        job.setViewsCount(job.getViewsCount() != null ? job.getViewsCount() + 1 : 1);
        jobRepository.save(job);

        return JobResponse.fromEntity(job);
    }

    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> getActiveJobs(Pageable pageable, String jobType,
                                                     String experienceLevel, String workMode,
                                                     String location, String keyword) {
        Specification<Job> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("status"), JobStatus.ACTIVE));

            if (jobType != null && !jobType.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("jobType"), JobType.valueOf(jobType)));
            }
            if (experienceLevel != null && !experienceLevel.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("experienceLevel"), ExperienceLevel.valueOf(experienceLevel)));
            }
            if (workMode != null && !workMode.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("workMode"), WorkMode.valueOf(workMode)));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("location")),
                        "%" + location.toLowerCase() + "%"
                ));
            }
            if (keyword != null && !keyword.isBlank()) {
                String lowerKeyword = "%" + keyword.toLowerCase() + "%";
                Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), lowerKeyword);
                Predicate descMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), lowerKeyword);
                predicates.add(criteriaBuilder.or(titleMatch, descMatch));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Job> jobsPage = jobRepository.findAll(spec, pageable);
        Page<JobResponse> responsePage = jobsPage.map(JobResponse::fromEntity);
        return PagedResponse.fromPage(responsePage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> getCompanyJobs(UUID userId, Pageable pageable) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        Page<Job> jobsPage = jobRepository.findByCompanyId(company.getId(), pageable);
        Page<JobResponse> responsePage = jobsPage.map(JobResponse::fromEntity);
        return PagedResponse.fromPage(responsePage);
    }

    public JobResponse updateJobStatus(UUID userId, UUID jobId, String status) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getCompany().getId().equals(company.getId())) {
            throw new ForbiddenException("You are not authorized to update this job");
        }

        JobStatus newStatus = JobStatus.valueOf(status);
        job.setStatus(newStatus);
        Job updatedJob = jobRepository.save(job);

        // Auto-shortlist top N candidates when job is closed
        if (newStatus == JobStatus.CLOSED && updatedJob.getShortlistCount() != null
                && updatedJob.getShortlistCount() > 0) {
            autoShortlistTopCandidates(updatedJob);
        }

        return JobResponse.fromEntity(updatedJob);
    }

    private void autoShortlistTopCandidates(Job job) {
        try {
            int count = job.getShortlistCount();
            List<ApplicationStatus> eligibleStatuses = List.of(
                    ApplicationStatus.PENDING, ApplicationStatus.REVIEWING);

            List<Application> topApps = applicationRepository
                    .findByJobIdAndStatusInOrderBySimilarityScoreDesc(
                            job.getId(), eligibleStatuses, PageRequest.of(0, count));

            for (Application app : topApps) {
                ApplicationStatus oldStatus = app.getStatus();
                app.setStatus(ApplicationStatus.SHORTLISTED);
                applicationRepository.save(app);

                // Create status history entry
                ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                        .application(app)
                        .oldStatus(oldStatus)
                        .newStatus(ApplicationStatus.SHORTLISTED)
                        .notes("Auto-shortlisted — top " + count + " by AI match score on job close")
                        .build();
                statusHistoryRepository.save(history);

                // Send notification to candidate
                UUID candidateUserId = app.getCandidate().getUser().getId();
                notificationService.createNotification(
                        candidateUserId,
                        "Shortlisted!",
                        "You've been shortlisted for " + job.getTitle()
                                + " at " + job.getCompany().getName(),
                        "APPLICATION_UPDATE",
                        "APPLICATION",
                        app.getId());

                // Send email to candidate
                String email = app.getCandidate().getUser().getEmail();
                String candidateName = app.getCandidate().getUser().getFirstName();
                emailService.sendShortlistNotification(
                        email, candidateName, job.getTitle(), job.getCompany().getName());
            }

            log.info("Auto-shortlisted {} candidates for job {} ({})",
                    topApps.size(), job.getId(), job.getTitle());
        } catch (Exception e) {
            log.error("Failed to auto-shortlist for job {}: {}", job.getId(), e.getMessage());
        }
    }

    public void deleteJob(UUID userId, UUID jobId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getCompany().getId().equals(company.getId())) {
            throw new ForbiddenException("You are not authorized to delete this job");
        }

        // Delete vector from Pinecone
        if (job.getPineconeVectorId() != null) {
            mlServiceClient.deleteVector(job.getPineconeVectorId(), "jobs");
        }

        // Clean up saved_jobs entries (not cascade-managed)
        savedJobRepository.deleteByJobId(jobId);

        // Cascade ALL on Job.applications handles deleting applications + status history
        jobRepository.delete(job);

        log.info("Job {} ({}) deleted by company owner", jobId, job.getTitle());
    }

    private void vectorizeJobAsync(Job job) {
        try {
            List<String> skillNames = job.getSkills() != null
                    ? job.getSkills().stream().map(Skill::getName).collect(Collectors.toList())
                    : Collections.emptyList();

            Map<String, String> metadata = new HashMap<>();
            metadata.put("company_id", job.getCompany().getId().toString());
            metadata.put("job_type", job.getJobType() != null ? job.getJobType().name() : "");
            metadata.put("experience_level", job.getExperienceLevel() != null ? job.getExperienceLevel().name() : "");
            metadata.put("work_mode", job.getWorkMode() != null ? job.getWorkMode().name() : "");
            metadata.put("location", job.getLocation() != null ? job.getLocation() : "");
            metadata.put("status", job.getStatus() != null ? job.getStatus().name() : "");

            String vectorId = mlServiceClient.vectorizeJob(
                    job.getId(),
                    job.getTitle(),
                    job.getDescription(),
                    job.getRequirements(),
                    skillNames,
                    metadata
            );

            job.setPineconeVectorId(vectorId);
            jobRepository.save(job);
            log.info("Job {} vectorized successfully with vector_id: {}", job.getId(), vectorId);
        } catch (Exception e) {
            log.error("Failed to vectorize job {}: {}", job.getId(), e.getMessage());
            // Don't fail the main job creation/update flow
        }
    }

    private LocalDateTime parseDeadline(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateStr).atStartOfDay();
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private String generateSlug(String title) {
        String slug = title.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (jobRepository.existsBySlug(slug)) {
            int suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
            slug = slug + "-" + suffix;
        }

        return slug;
    }
}
