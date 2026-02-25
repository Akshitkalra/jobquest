package com.jobportal.api.controller;

import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.SavedJobService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;

    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> saveJob(@PathVariable UUID jobId) {
        User currentUser = getCurrentUser();
        savedJobService.saveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success(null, "Job saved successfully"));
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(@PathVariable UUID jobId) {
        User currentUser = getCurrentUser();
        savedJobService.unsaveJob(currentUser.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success(null, "Job unsaved successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<JobResponse> savedJobs = savedJobService.getSavedJobs(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(savedJobs));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
