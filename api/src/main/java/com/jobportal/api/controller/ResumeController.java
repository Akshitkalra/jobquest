package com.jobportal.api.controller;

import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.ResumeResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @RequestParam("file") MultipartFile file) {

        User currentUser = getCurrentUser();
        ResumeResponse resume = resumeService.uploadResume(currentUser.getId(), file);
        return ResponseEntity.ok(ApiResponse.success(resume, "Resume uploaded successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getMyResumes() {
        User currentUser = getCurrentUser();
        List<ResumeResponse> resumes = resumeService.getResumes(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(resumes));
    }

    @PutMapping("/{id}/primary")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ResumeResponse>> setPrimaryResume(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        ResumeResponse resume = resumeService.setPrimaryResume(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(resume, "Primary resume set successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> deleteResume(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        resumeService.deleteResume(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Resume deleted successfully"));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
