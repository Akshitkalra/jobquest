package com.jobportal.api.dto.response;

import com.jobportal.api.entity.CandidateProfile;
import com.jobportal.api.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String avatarUrl;
    private String headline;
    private String summary;
    private Integer experienceYears;
    private String currentTitle;
    private String currentCompany;
    private String location;
    private String preferredWorkMode;
    private BigDecimal expectedSalaryMin;
    private BigDecimal expectedSalaryMax;
    private String salaryCurrency;
    private Boolean isOpenToWork;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private List<SkillResponse> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CandidateProfileResponse fromEntity(CandidateProfile profile) {
        User user = profile.getUser();

        List<SkillResponse> skillResponses = null;
        if (profile.getSkills() != null) {
            skillResponses = profile.getSkills().stream()
                    .map(SkillResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .email(user != null ? user.getEmail() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .experienceYears(profile.getExperienceYears())
                .currentTitle(profile.getCurrentTitle())
                .currentCompany(profile.getCurrentCompany())
                .location(profile.getLocation())
                .preferredWorkMode(profile.getPreferredWorkMode() != null ? profile.getPreferredWorkMode().name() : null)
                .expectedSalaryMin(profile.getExpectedSalaryMin())
                .expectedSalaryMax(profile.getExpectedSalaryMax())
                .salaryCurrency(profile.getSalaryCurrency())
                .isOpenToWork(profile.getIsOpenToWork())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .skills(skillResponses)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
