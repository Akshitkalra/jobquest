package com.jobportal.api.entity;

import com.jobportal.api.entity.enums.WorkMode;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "candidate_profiles")
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String headline;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "current_title")
    private String currentTitle;

    @Column(name = "current_company")
    private String currentCompany;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_work_mode")
    private WorkMode preferredWorkMode;

    @Column(name = "expected_salary_min")
    private BigDecimal expectedSalaryMin;

    @Column(name = "expected_salary_max")
    private BigDecimal expectedSalaryMax;

    @Column(name = "salary_currency")
    private String salaryCurrency;

    @Column(name = "is_open_to_work")
    private Boolean isOpenToWork;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "pinecone_vector_id")
    private String pineconeVectorId;

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Resume> resumes = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "candidate_skills",
            joinColumns = @JoinColumn(name = "candidate_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
