package com.jobportal.api.controller;

import com.jobportal.api.dto.request.SearchRequest;
import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.dto.response.RankedCandidateResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/jobs")
    @PreAuthorize("hasAuthority('search:jobs')")
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> searchJobs(
            @Valid @RequestBody SearchRequest request) {

        User currentUser = getCurrentUser();
        PagedResponse<JobResponse> results = searchService.searchJobsByResume(
                currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/candidates")
    @PreAuthorize("hasAuthority('search:candidates')")
    public ResponseEntity<ApiResponse<PagedResponse<RankedCandidateResponse>>> searchCandidates(
            @Valid @RequestBody SearchRequest request) {

        User currentUser = getCurrentUser();
        PagedResponse<RankedCandidateResponse> results = searchService.searchCandidatesByJob(
                currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
