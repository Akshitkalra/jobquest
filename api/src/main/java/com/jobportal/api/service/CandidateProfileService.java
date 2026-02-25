package com.jobportal.api.service;

import com.jobportal.api.dto.request.ProfileUpdateRequest;
import com.jobportal.api.dto.response.CandidateProfileResponse;
import com.jobportal.api.entity.CandidateProfile;
import com.jobportal.api.entity.Skill;
import com.jobportal.api.entity.enums.WorkMode;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.CandidateProfileRepository;
import com.jobportal.api.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public CandidateProfileResponse getProfile(UUID userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));
        return CandidateProfileResponse.fromEntity(profile);
    }

    public CandidateProfileResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        if (request.getHeadline() != null) {
            profile.setHeadline(request.getHeadline());
        }
        if (request.getSummary() != null) {
            profile.setSummary(request.getSummary());
        }
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getCurrentTitle() != null) {
            profile.setCurrentTitle(request.getCurrentTitle());
        }
        if (request.getCurrentCompany() != null) {
            profile.setCurrentCompany(request.getCurrentCompany());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getPreferredWorkMode() != null) {
            profile.setPreferredWorkMode(WorkMode.valueOf(request.getPreferredWorkMode()));
        }
        if (request.getExpectedSalaryMin() != null) {
            profile.setExpectedSalaryMin(request.getExpectedSalaryMin());
        }
        if (request.getExpectedSalaryMax() != null) {
            profile.setExpectedSalaryMax(request.getExpectedSalaryMax());
        }
        if (request.getSalaryCurrency() != null) {
            profile.setSalaryCurrency(request.getSalaryCurrency());
        }
        if (request.getIsOpenToWork() != null) {
            profile.setIsOpenToWork(request.getIsOpenToWork());
        }
        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getGithubUrl() != null) {
            profile.setGithubUrl(request.getGithubUrl());
        }
        if (request.getPortfolioUrl() != null) {
            profile.setPortfolioUrl(request.getPortfolioUrl());
        }

        CandidateProfile updatedProfile = candidateProfileRepository.save(profile);
        return CandidateProfileResponse.fromEntity(updatedProfile);
    }

    public CandidateProfileResponse addSkills(UUID userId, List<UUID> skillIds) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        Set<Skill> skills = profile.getSkills();
        List<Skill> newSkills = skillRepository.findAllById(skillIds);
        skills.addAll(newSkills);
        profile.setSkills(skills);

        CandidateProfile updatedProfile = candidateProfileRepository.save(profile);
        return CandidateProfileResponse.fromEntity(updatedProfile);
    }

    public CandidateProfileResponse removeSkill(UUID userId, UUID skillId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateProfile", "userId", userId));

        profile.getSkills().removeIf(skill -> skill.getId().equals(skillId));

        CandidateProfile updatedProfile = candidateProfileRepository.save(profile);
        return CandidateProfileResponse.fromEntity(updatedProfile);
    }
}
