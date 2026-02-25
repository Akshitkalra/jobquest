package com.jobportal.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

    private UUID resumeId;

    private String queryText;

    @Builder.Default
    private int topK = 20;

    private String jobType;

    private String workMode;

    private String experienceLevel;

    private String location;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;
}
