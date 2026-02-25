package com.jobportal.api.repository;

import com.jobportal.api.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findBySlug(String slug);

    Optional<Company> findByUserId(UUID userId);

    boolean existsBySlug(String slug);
}
