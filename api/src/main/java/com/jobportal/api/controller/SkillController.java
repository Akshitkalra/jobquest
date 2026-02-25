package com.jobportal.api.controller;

import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.SkillResponse;
import com.jobportal.api.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getAllSkills(
            @RequestParam(required = false) String search) {

        List<SkillResponse> skills = skillService.getAllSkills(search);
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SkillResponse>> createSkill(
            @RequestBody Map<String, String> body) {

        SkillResponse skill = skillService.createSkill(body.get("name"), body.get("category"));
        return ResponseEntity.ok(ApiResponse.success(skill, "Skill created successfully"));
    }
}
