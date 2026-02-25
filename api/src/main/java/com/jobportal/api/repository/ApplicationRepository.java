package com.jobportal.api.repository;

import com.jobportal.api.entity.Application;
import com.jobportal.api.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    Page<Application> findByJobIdOrderBySimilarityScoreDesc(UUID jobId, Pageable pageable);

    Page<Application> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId, Pageable pageable);

    boolean existsByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    Optional<Application> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    List<Application> findByJobIdAndStatusInOrderBySimilarityScoreDesc(
            UUID jobId, List<ApplicationStatus> statuses, Pageable pageable);
}
