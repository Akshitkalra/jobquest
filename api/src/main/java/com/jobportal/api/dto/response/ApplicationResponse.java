package com.jobportal.api.dto.response;

import com.jobportal.api.entity.Application;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private UUID id;
    private JobResponse job;
    private CandidateProfileResponse candidateProfile;
    private ResumeResponse resume;
    private String status;
    private BigDecimal similarityScore;
    private String coverLetter;
    private String companyNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ApplicationResponse fromEntity(Application app) {
        JobResponse jobResponse = null;
        if (app.getJob() != null) {
            jobResponse = JobResponse.fromEntity(app.getJob());
        }

        ResumeResponse resumeResponse = null;
        if (app.getResume() != null) {
            resumeResponse = ResumeResponse.fromEntity(app.getResume());
        }

        return ApplicationResponse.builder()
                .id(app.getId())
                .job(jobResponse)
                .resume(resumeResponse)
                .status(app.getStatus() != null ? app.getStatus().name() : null)
                .similarityScore(app.getSimilarityScore())
                .coverLetter(app.getCoverLetter())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    public static ApplicationResponse fromEntityForCompany(Application app) {
        JobResponse jobResponse = null;
        if (app.getJob() != null) {
            jobResponse = JobResponse.fromEntity(app.getJob());
        }

        CandidateProfileResponse candidateProfileResponse = null;
        if (app.getCandidate() != null) {
            candidateProfileResponse = CandidateProfileResponse.fromEntity(app.getCandidate());
        }

        ResumeResponse resumeResponse = null;
        if (app.getResume() != null) {
            resumeResponse = ResumeResponse.fromEntity(app.getResume());
        }

        return ApplicationResponse.builder()
                .id(app.getId())
                .job(jobResponse)
                .candidateProfile(candidateProfileResponse)
                .resume(resumeResponse)
                .status(app.getStatus() != null ? app.getStatus().name() : null)
                .similarityScore(app.getSimilarityScore())
                .coverLetter(app.getCoverLetter())
                .companyNotes(app.getCompanyNotes())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
