package com.jobportal.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {

    private String headline;

    private String summary;

    private Integer experienceYears;

    private String currentTitle;

    private String currentCompany;

    private String location;

    private String preferredWorkMode;

    private BigDecimal expectedSalaryMin;

    private BigDecimal expectedSalaryMax;

    private String salaryCurrency;

    private Boolean isOpenToWork;

    private String linkedinUrl;

    private String githubUrl;

    private String portfolioUrl;
}
