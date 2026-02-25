package com.jobportal.api.dto.request;

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
public class JobUpdateRequest {

    private String title;

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

    private String applicationDeadline;

    private Integer shortlistCount;

    private List<UUID> skillIds;

    private String status;
}
