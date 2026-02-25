package com.jobportal.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyUpdateRequest {

    private String name;

    private String description;

    private String industry;

    private String companySize;

    private String website;

    private String headquarters;

    private Integer foundedYear;
}
