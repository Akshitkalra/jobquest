package com.jobportal.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String requirements;

    private String responsibilities;

    private String benefits;

    @NotBlank(message = "Job type is required")
    private String jobType;

    @NotBlank(message = "Experience level is required")
    private String experienceLevel;

    @NotBlank(message = "Work mode is required")
    private String workMode;

    private String location;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;

    private String salaryCurrency;

    private boolean isSalaryVisible;

    private String applicationDeadline;

    private List<UUID> skillIds;

    private Integer shortlistCount;

    @Builder.Default
    private String status = "ACTIVE";
}
