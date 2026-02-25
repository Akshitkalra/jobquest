package com.jobportal.api.controller;

import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.ApplicationResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @RequestBody Map<String, Object> body) {

        User currentUser = getCurrentUser();
        UUID jobId = UUID.fromString((String) body.get("jobId"));
        UUID resumeId = body.get("resumeId") != null ? UUID.fromString((String) body.get("resumeId")) : null;
        String coverLetter = (String) body.get("coverLetter");

        ApplicationResponse application = applicationService.apply(
                currentUser.getId(), jobId, resumeId, coverLetter);
        return ResponseEntity.ok(ApiResponse.success(application, "Application submitted successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> getCandidateApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<ApplicationResponse> applications = applicationService.getCandidateApplications(
                currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(applications));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplication(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        ApplicationResponse application = applicationService.getApplication(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(application));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        User currentUser = getCurrentUser();
        ApplicationResponse application = applicationService.updateApplicationStatus(
                currentUser.getId(), id, body.get("status"), body.get("notes"));
        return ResponseEntity.ok(ApiResponse.success(application, "Application status updated successfully"));
    }

    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> withdrawApplication(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        ApplicationResponse application = applicationService.withdrawApplication(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(application, "Application withdrawn successfully"));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
