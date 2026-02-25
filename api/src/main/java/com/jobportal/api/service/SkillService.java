package com.jobportal.api.service;

import com.jobportal.api.dto.response.SkillResponse;
import com.jobportal.api.entity.Skill;
import com.jobportal.api.exception.DuplicateResourceException;
import com.jobportal.api.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;

    public List<SkillResponse> getAllSkills(String search) {
        List<Skill> skills;
        if (search != null && !search.isBlank()) {
            skills = skillRepository.findByNameContainingIgnoreCase(search);
        } else {
            skills = skillRepository.findAll();
        }

        return skills.stream()
                .map(SkillResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillResponse createSkill(String name, String category) {
        if (skillRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new DuplicateResourceException("Skill", "name", name);
        }

        Skill skill = Skill.builder()
                .name(name)
                .category(category)
                .build();

        Skill savedSkill = skillRepository.save(skill);
        return SkillResponse.fromEntity(savedSkill);
    }
}
