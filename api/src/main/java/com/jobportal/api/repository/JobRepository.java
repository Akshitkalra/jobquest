package com.jobportal.api.repository;

import com.jobportal.api.entity.Job;
import com.jobportal.api.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {

    Optional<Job> findBySlug(String slug);

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    Page<Job> findByCompanyId(UUID companyId, Pageable pageable);

    boolean existsBySlug(String slug);

    List<Job> findByIdIn(List<UUID> ids);
}
