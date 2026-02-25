package com.jobportal.api.controller;

import com.jobportal.api.dto.request.CompanyUpdateRequest;
import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.CompanyResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> listCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<CompanyResponse> companies = companyService.getAllCompanies(pageable);
        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyBySlug(@PathVariable String slug) {
        CompanyResponse company = companyService.getCompanyBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(company));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> getOwnCompany() {
        User currentUser = getCurrentUser();
        CompanyResponse company = companyService.getCompanyByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(company));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateOwnCompany(
            @Valid @RequestBody CompanyUpdateRequest request) {

        User currentUser = getCurrentUser();
        CompanyResponse company = companyService.updateCompany(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(company, "Company updated successfully"));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
