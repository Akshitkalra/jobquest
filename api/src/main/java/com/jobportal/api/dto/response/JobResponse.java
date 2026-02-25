package com.jobportal.api.dto.response;

import com.jobportal.api.entity.Job;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {

    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String requirements;
    private String responsibilities;
    private String benefits;
    private String jobType;
    private String experienceLevel;
    private String workMode;
    private String location;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private Boolean isSalaryVisible;
    private LocalDateTime applicationDeadline;
    private String status;
    private Integer viewsCount;
    private Integer applicationsCount;
    private Integer shortlistCount;
    private CompanyResponse company;
    private List<SkillResponse> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static JobResponse fromEntity(Job job) {
        CompanyResponse companyResponse = null;
        if (job.getCompany() != null) {
            companyResponse = CompanyResponse.fromEntity(job.getCompany());
        }

        List<SkillResponse> skillResponses = null;
        if (job.getSkills() != null) {
            skillResponses = job.getSkills().stream()
                    .map(SkillResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .slug(job.getSlug())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .responsibilities(job.getResponsibilities())
                .benefits(job.getBenefits())
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)
                .workMode(job.getWorkMode() != null ? job.getWorkMode().name() : null)
                .location(job.getLocation())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .salaryCurrency(job.getSalaryCurrency())
                .isSalaryVisible(job.getIsSalaryVisible())
                .applicationDeadline(job.getApplicationDeadline())
                .status(job.getStatus() != null ? job.getStatus().name() : null)
                .viewsCount(job.getViewsCount())
                .applicationsCount(job.getApplicationsCount())
                .shortlistCount(job.getShortlistCount())
                .company(companyResponse)
                .skills(skillResponses)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
