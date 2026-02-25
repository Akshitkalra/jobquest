package com.jobportal.api.dto.response;

import com.jobportal.api.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {

    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String industry;
    private String companySize;
    private String website;
    private String logoUrl;
    private String coverImageUrl;
    private String headquarters;
    private Integer foundedYear;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    public static CompanyResponse fromEntity(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .description(company.getDescription())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .website(company.getWebsite())
                .logoUrl(company.getLogoUrl())
                .coverImageUrl(company.getCoverImageUrl())
                .headquarters(company.getHeadquarters())
                .foundedYear(company.getFoundedYear())
                .isVerified(company.getIsVerified())
                .createdAt(company.getCreatedAt())
                .build();
    }
}
