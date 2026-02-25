package com.jobportal.api.controller;

import com.jobportal.api.dto.request.ProfileUpdateRequest;
import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.CandidateProfileResponse;
import com.jobportal.api.entity.User;
import com.jobportal.api.security.CustomUserDetails;
import com.jobportal.api.service.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getProfile() {
        User currentUser = getCurrentUser();
        CandidateProfileResponse profile = candidateProfileService.getProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request) {

        User currentUser = getCurrentUser();
        CandidateProfileResponse profile = candidateProfileService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }

    @PostMapping("/me/skills")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> addSkills(
            @RequestBody List<UUID> skillIds) {

        User currentUser = getCurrentUser();
        CandidateProfileResponse profile = candidateProfileService.addSkills(currentUser.getId(), skillIds);
        return ResponseEntity.ok(ApiResponse.success(profile, "Skills added successfully"));
    }

    @DeleteMapping("/me/skills/{skillId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> removeSkill(
            @PathVariable UUID skillId) {

        User currentUser = getCurrentUser();
        CandidateProfileResponse profile = candidateProfileService.removeSkill(currentUser.getId(), skillId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Skill removed successfully"));
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getUser();
    }
}
