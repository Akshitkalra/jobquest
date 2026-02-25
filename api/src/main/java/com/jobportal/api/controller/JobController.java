package com.jobportal.api.controller;

import com.jobportal.api.dto.request.JobCreateRequest;
import com.jobportal.api.dto.request.JobUpdateRequest;
import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.ApplicationResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.ApplicationService;
import com.jobportal.api.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> listActiveJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<JobResponse> jobs = jobService.getActiveJobs(pageable, jobType,
                experienceLevel, workMode, location, keyword);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobBySlug(@PathVariable String slug) {
        JobResponse job = jobService.getJobBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(job));
    }

    @GetMapping("/company/me")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> getCompanyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<JobResponse> jobs = jobService.getCompanyJobs(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('job:create')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody JobCreateRequest request) {

        User currentUser = getCurrentUser();
        JobResponse job = jobService.createJob(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(job, "Job created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobUpdateRequest request) {

        User currentUser = getCurrentUser();
        JobResponse job = jobService.updateJob(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(job, "Job updated successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        User currentUser = getCurrentUser();
        JobResponse job = jobService.updateJobStatus(currentUser.getId(), id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success(job, "Job status updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        jobService.deleteJob(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Job deleted successfully"));
    }

    @GetMapping("/{id}/applicants")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> getJobApplicants(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<ApplicationResponse> applicants = applicationService.getJobApplicants(
                currentUser.getId(), id, pageable);
        return ResponseEntity.ok(ApiResponse.success(applicants));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
