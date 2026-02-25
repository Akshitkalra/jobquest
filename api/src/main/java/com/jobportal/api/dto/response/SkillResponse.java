package com.jobportal.api.dto.response;

import com.jobportal.api.entity.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillResponse {

    private UUID id;
    private String name;
    private String category;

    public static SkillResponse fromEntity(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .category(skill.getCategory())
                .build();
    }
}
