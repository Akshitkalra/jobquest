package com.jobportal.api.repository;

import com.jobportal.api.entity.SavedJob;
import com.jobportal.api.entity.SavedJobId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, SavedJobId> {

    Page<SavedJob> findByCandidateProfileId(UUID candidateProfileId, Pageable pageable);

    boolean existsByCandidateProfileIdAndJobId(UUID candidateProfileId, UUID jobId);

    void deleteByCandidateProfileIdAndJobId(UUID candidateProfileId, UUID jobId);

    void deleteByJobId(UUID jobId);
}
