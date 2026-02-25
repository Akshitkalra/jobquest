package com.jobportal.api.repository;

import com.jobportal.api.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, UUID> {

    Optional<CandidateProfile> findByUserId(UUID userId);
}
