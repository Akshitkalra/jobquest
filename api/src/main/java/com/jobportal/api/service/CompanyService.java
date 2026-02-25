package com.jobportal.api.service;

import com.jobportal.api.dto.request.CompanyUpdateRequest;
import com.jobportal.api.dto.response.CompanyResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.Company;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyBySlug(String slug) {
        Company company = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "slug", slug));
        return CompanyResponse.fromEntity(company);
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyByUserId(UUID userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));
        return CompanyResponse.fromEntity(company);
    }

    public CompanyResponse updateCompany(UUID userId, CompanyUpdateRequest request) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "userId", userId));

        if (request.getName() != null) {
            company.setName(request.getName());
        }
        if (request.getDescription() != null) {
            company.setDescription(request.getDescription());
        }
        if (request.getIndustry() != null) {
            company.setIndustry(request.getIndustry());
        }
        if (request.getCompanySize() != null) {
            company.setCompanySize(request.getCompanySize());
        }
        if (request.getWebsite() != null) {
            company.setWebsite(request.getWebsite());
        }
        if (request.getHeadquarters() != null) {
            company.setHeadquarters(request.getHeadquarters());
        }
        if (request.getFoundedYear() != null) {
            company.setFoundedYear(request.getFoundedYear());
        }

        Company updatedCompany = companyRepository.save(company);
        return CompanyResponse.fromEntity(updatedCompany);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CompanyResponse> getAllCompanies(Pageable pageable) {
        Page<Company> companiesPage = companyRepository.findAll(pageable);
        Page<CompanyResponse> responsePage = companiesPage.map(CompanyResponse::fromEntity);
        return PagedResponse.fromPage(responsePage);
    }
}
