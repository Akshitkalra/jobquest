package com.jobportal.api.service;

import com.jobportal.api.dto.response.ApplicationResponse;
import com.jobportal.api.dto.response.CandidateProfileResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.dto.response.RankedCandidateResponse;
import com.jobportal.api.entity.Application;
import com.jobportal.api.entity.ApplicationStatusHistory;
import com.jobportal.api.entity.CandidateProfile;
import com.jobportal.api.entity.Company;
import com.jobportal.api.entity.Job;
import com.jobportal.api.entity.Resume;
import com.jobportal.api.entity.User;
import com.jobportal.api.entity.enums.ApplicationStatus;
import com.jobportal.api.entity.enums.JobStatus;
import com.jobportal.api.exception.BadRequestException;
import com.jobportal.api.exception.ForbiddenException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.ApplicationRepository;
import com.jobportal.api.repository.ApplicationStatusHistoryRepository;
import com.jobportal.api.repository.CandidateProfileRepository;
import com.jobportal.api.repository.CompanyRepository;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.ResumeRepository;
import com.jobportal.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ResumeRepository resumeRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final MlServiceClient mlServiceClient;
    private final EmailService emailService;

    public ApplicationResponse apply(UUID userId, UUID jobId, UUID resumeId, String coverLetter) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new BadRequestException("Cannot apply to a job that is not active");
        }

        if (applicationRepository.existsByJobIdAndCandidateId(jobId, profile.getId())) {
            throw new BadRequestException("You have already applied to this job");
        }

        Resume resume = null;
        if (resumeId != null) {
            resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

            if (!resume.getCandidateProfile().getId().equals(profile.getId())) {
                throw new ForbiddenException("You are not authorized to use this resume");
            }
        }

        // Compute similarity score using ML service
        BigDecimal similarityScore = computeSimilarityScore(resume, profile, job);

        Application application = Application.builder()
                .job(job)
                .candidate(profile)
                .resume(resume)
                .coverLetter(coverLetter)
                .status(ApplicationStatus.PENDING)
                .similarityScore(similarityScore)
                .build();

        Application savedApplication = applicationRepository.save(application);

        // Update applications count on the job
        job.setApplicationsCount(job.getApplicationsCount() != null ? job.getApplicationsCount() + 1 : 1);
        jobRepository.save(job);

        // Create initial status history entry
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(savedApplication)
                .newStatus(ApplicationStatus.PENDING)
                .notes("Application submitted")
                .build();
        statusHistoryRepository.save(history);

        // Send confirmation email to candidate
        String candidateEmail = profile.getUser().getEmail();
        String candidateName = profile.getUser().getFirstName();
        emailService.sendApplicationConfirmation(candidateEmail, candidateName, job.getTitle(), job.getCompany().getName());

        // Send new applicant notification to company
        String companyEmail = job.getCompany().getUser().getEmail();
        emailService.sendNewApplicantNotification(
                companyEmail, job.getCompany().getName(),
                candidateName + " " + profile.getUser().getLastName(),
                job.getTitle(), similarityScore
        );

        return ApplicationResponse.fromEntity(savedApplication);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> getCandidateApplications(UUID userId, Pageable pageable) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Page<Application> applicationsPage = applicationRepository.findByCandidateIdOrderByCreatedAtDesc(
                profile.getId(), pageable);
        Page<ApplicationResponse> responsePage = applicationsPage.map(ApplicationResponse::fromEntity);
        return PagedResponse.fromPage(responsePage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> getJobApplicants(UUID userId, UUID jobId, Pageable pageable) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getCompany().getId().equals(company.getId())) {
            throw new ForbiddenException("You are not authorized to view applicants for this job");
        }

        Page<Application> applicationsPage = applicationRepository.findByJobIdOrderBySimilarityScoreDesc(
                jobId, pageable);

        Page<ApplicationResponse> responsePage = applicationsPage.map(ApplicationResponse::fromEntityForCompany);

        return PagedResponse.fromPage(responsePage);
    }

    public ApplicationResponse updateApplicationStatus(UUID userId, UUID applicationId,
                                                        String newStatus, String notes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (!application.getJob().getCompany().getId().equals(company.getId())) {
            throw new ForbiddenException("You are not authorized to update this application");
        }

        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus newAppStatus = ApplicationStatus.valueOf(newStatus);

        application.setStatus(newAppStatus);
        if (notes != null) {
            application.setCompanyNotes(notes);
        }

        Application updatedApplication = applicationRepository.save(application);

        // Create status history entry
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(updatedApplication)
                .oldStatus(oldStatus)
                .newStatus(newAppStatus)
                .changedBy(user)
                .notes(notes)
                .build();
        statusHistoryRepository.save(history);

        // Send status update email to candidate
        String candidateEmail = application.getCandidate().getUser().getEmail();
        String candidateName = application.getCandidate().getUser().getFirstName();
        emailService.sendStatusUpdate(candidateEmail, candidateName,
                application.getJob().getTitle(), oldStatus.name(), newAppStatus.name());

        return ApplicationResponse.fromEntityForCompany(updatedApplication);
    }

    public ApplicationResponse withdrawApplication(UUID userId, UUID applicationId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (!application.getCandidate().getId().equals(profile.getId())) {
            throw new ForbiddenException("You are not authorized to withdraw this application");
        }

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Application is already withdrawn");
        }
        if (application.getStatus() == ApplicationStatus.HIRED) {
            throw new BadRequestException("Cannot withdraw a hired application");
        }
        if (application.getStatus() == ApplicationStatus.REJECTED) {
            throw new BadRequestException("Cannot withdraw a rejected application");
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application updatedApplication = applicationRepository.save(application);

        // Create status history entry
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(updatedApplication)
                .oldStatus(oldStatus)
                .newStatus(ApplicationStatus.WITHDRAWN)
                .notes("Withdrawn by candidate")
                .build();
        statusHistoryRepository.save(history);

        return ApplicationResponse.fromEntity(updatedApplication);
    }

    private BigDecimal computeSimilarityScore(Resume resume, CandidateProfile profile, Job job) {
        try {
            // Build candidate text from resume parsed text, or fall back to profile data
            String candidateText = "";
            if (resume != null && resume.getParsedText() != null && !resume.getParsedText().isBlank()
                    && !"Text extraction pending".equals(resume.getParsedText())) {
                candidateText = resume.getParsedText();
            } else if (profile.getSummary() != null) {
                candidateText = profile.getSummary();
                if (profile.getHeadline() != null) {
                    candidateText = profile.getHeadline() + " " + candidateText;
                }
                if (profile.getCurrentTitle() != null) {
                    candidateText = profile.getCurrentTitle() + " " + candidateText;
                }
            }

            if (candidateText.isBlank()) {
                log.info("No candidate text available for similarity computation, skipping");
                return null;
            }

            // Check if the job has a Pinecone vector
            if (job.getPineconeVectorId() != null) {
                // Use direct similarity computation against the job's vector
                double score = mlServiceClient.computeSimilarity(candidateText, job.getId().toString());
                if (score > 0) {
                    return BigDecimal.valueOf(score).setScale(4, RoundingMode.HALF_UP);
                }
            }

            // Fallback: compute similarity by searching jobs with candidate text
            var results = mlServiceClient.searchJobsByResume(candidateText, 10, null);
            for (var result : results) {
                // The ML service stores IDs as "job_{uuid}"
                String resultJobId = result.getId().replace("job_", "");
                if (resultJobId.equals(job.getId().toString())) {
                    return BigDecimal.valueOf(result.getScore()).setScale(4, RoundingMode.HALF_UP);
                }
            }

            return null;
        } catch (Exception e) {
            log.error("Failed to compute similarity score: {}", e.getMessage());
            return null;
        }
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplication(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        // Check if user is the candidate
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId).orElse(null);
        if (profile != null && application.getCandidate().getId().equals(profile.getId())) {
            return ApplicationResponse.fromEntity(application);
        }

        // Check if user is the company owner
        Company company = companyRepository.findByUserId(userId).orElse(null);
        if (company != null && application.getJob().getCompany().getId().equals(company.getId())) {
            return ApplicationResponse.fromEntityForCompany(application);
        }

        throw new ForbiddenException("You are not authorized to view this application");
    }
}
