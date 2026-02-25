package com.jobportal.api.service;

import com.jobportal.api.dto.response.CompanyResponse;
import com.jobportal.api.dto.response.DashboardStatsResponse;
import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.dto.response.UserResponse;
import com.jobportal.api.entity.Company;
import com.jobportal.api.entity.Job;
import com.jobportal.api.entity.Permission;
import com.jobportal.api.entity.Role;
import com.jobportal.api.entity.User;
import com.jobportal.api.entity.enums.JobStatus;
import com.jobportal.api.entity.enums.UserType;
import com.jobportal.api.exception.BadRequestException;
import com.jobportal.api.exception.ResourceNotFoundException;
import com.jobportal.api.repository.ApplicationRepository;
import com.jobportal.api.repository.CompanyRepository;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.PermissionRepository;
import com.jobportal.api.repository.RoleRepository;
import com.jobportal.api.repository.SavedJobRepository;
import com.jobportal.api.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SavedJobRepository savedJobRepository;
    private final NotificationService notificationService;
    private final MlServiceClient mlServiceClient;

    /**
     * Get dashboard statistics for the admin panel.
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCompanies = companyRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();

        long activeJobsCount = jobRepository.findByStatus(JobStatus.ACTIVE, Pageable.unpaged())
                .getTotalElements();

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);

        // Count new users this week using specification
        Specification<User> newUsersSpec = (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("createdAt"), oneWeekAgo);
        long newUsersThisWeek = userRepository.count(newUsersSpec);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalCompanies(totalCompanies)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .activeJobsCount(activeJobsCount)
                .newUsersThisWeek(newUsersThisWeek)
                .build();
    }

    /**
     * List users with optional search and user type filtering.
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(Pageable pageable, String search, String userType) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String lowerSearch = "%" + search.toLowerCase() + "%";
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), lowerSearch);
                Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), lowerSearch);
                Predicate lastNameMatch = cb.like(cb.lower(root.get("lastName")), lowerSearch);
                predicates.add(cb.or(emailMatch, firstNameMatch, lastNameMatch));
            }

            if (userType != null && !userType.isBlank()) {
                predicates.add(cb.equal(root.get("userType"), UserType.valueOf(userType)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> usersPage = userRepository.findAll(spec, pageable);
        Page<UserResponse> responsePage = usersPage.map(UserResponse::fromEntity);
        return PagedResponse.fromPage(responsePage);
    }

    /**
     * Update a user's roles to the given set of role IDs.
     */
    public void updateUserRoles(UUID userId, List<UUID> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));

        if (roles.size() != roleIds.size()) {
            throw new BadRequestException("One or more role IDs are invalid");
        }

        user.setRoles(roles);
        userRepository.save(user);

        log.info("Updated roles for user {}: {}", userId, roleIds);
    }

    /**
     * Get all roles.
     */
    @Transactional(readOnly = true)
    public List<Role> getRoles() {
        return roleRepository.findAll();
    }

    /**
     * Create a new non-system role.
     */
    public Role createRole(String name, String description) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Role name is required");
        }

        if (roleRepository.findByName(name).isPresent()) {
            throw new BadRequestException("Role with name '" + name + "' already exists");
        }

        Role role = Role.builder()
                .name(name)
                .description(description)
                .isSystem(false)
                .build();

        return roleRepository.save(role);
    }

    /**
     * Update the permissions assigned to a role.
     */
    public void updateRolePermissions(UUID roleId, List<UUID> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(permissionIds));

        if (permissions.size() != permissionIds.size()) {
            throw new BadRequestException("One or more permission IDs are invalid");
        }

        role.setPermissions(permissions);
        roleRepository.save(role);

        log.info("Updated permissions for role {}: {}", roleId, permissionIds);
    }

    /**
     * Get all permissions.
     */
    @Transactional(readOnly = true)
    public List<Permission> getPermissions() {
        return permissionRepository.findAll();
    }

    /**
     * Moderate a job posting.
     *
     * @param action APPROVE, FLAG, or REMOVE
     * @param reason Moderation reason
     */
    public void moderateJob(UUID jobId, String action, String reason) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        UUID companyOwnerUserId = job.getCompany().getUser().getId();

        switch (action.toUpperCase()) {
            case "APPROVE" -> {
                job.setStatus(JobStatus.ACTIVE);
                jobRepository.save(job);
                notificationService.createNotification(
                        companyOwnerUserId,
                        "Job Approved",
                        "Your job posting '" + job.getTitle() + "' has been approved." +
                                (reason != null ? " Reason: " + reason : ""),
                        "JOB_MODERATION",
                        "Job",
                        jobId
                );
            }
            case "FLAG" -> {
                job.setStatus(JobStatus.PAUSED);
                jobRepository.save(job);
                notificationService.createNotification(
                        companyOwnerUserId,
                        "Job Flagged",
                        "Your job posting '" + job.getTitle() + "' has been flagged for review." +
                                (reason != null ? " Reason: " + reason : ""),
                        "JOB_MODERATION",
                        "Job",
                        jobId
                );
            }
            case "REMOVE" -> {
                job.setStatus(JobStatus.CLOSED);
                // Delete the Pinecone vector if it exists
                if (job.getPineconeVectorId() != null && !job.getPineconeVectorId().isBlank()) {
                    mlServiceClient.deleteVector(job.getPineconeVectorId(), "jobs");
                    job.setPineconeVectorId(null);
                }
                jobRepository.save(job);
                notificationService.createNotification(
                        companyOwnerUserId,
                        "Job Removed",
                        "Your job posting '" + job.getTitle() + "' has been removed by an administrator." +
                                (reason != null ? " Reason: " + reason : ""),
                        "JOB_MODERATION",
                        "Job",
                        jobId
                );
            }
            default -> throw new BadRequestException("Invalid moderation action: " + action +
                    ". Valid actions are: APPROVE, FLAG, REMOVE");
        }

        log.info("Job {} moderated with action '{}': {}", jobId, action, reason);
    }

    /**
     * Verify a company.
     */
    public void verifyCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        company.setIsVerified(true);
        companyRepository.save(company);

        // Notify the company owner
        notificationService.createNotification(
                company.getUser().getId(),
                "Company Verified",
                "Your company '" + company.getName() + "' has been verified.",
                "COMPANY_VERIFICATION",
                "Company",
                companyId
        );

        log.info("Company {} verified", companyId);
    }

    /**
     * Get all jobs for admin moderation (all statuses).
     */
    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> getAllJobs(Pageable pageable) {
        Page<Job> jobsPage = jobRepository.findAll(pageable);
        Page<JobResponse> responsePage = jobsPage.map(JobResponse::fromEntity);
        return PagedResponse.fromPage(responsePage);
    }

    /**
     * Get all companies for admin verification.
     */
    @Transactional(readOnly = true)
    public PagedResponse<CompanyResponse> getAllCompanies(Pageable pageable) {
        Page<Company> companiesPage = companyRepository.findAll(pageable);
        Page<CompanyResponse> responsePage = companiesPage.map(CompanyResponse::fromEntity);
        return PagedResponse.fromPage(responsePage);
    }

    /**
     * Get a single company by ID for admin viewing.
     */
    @Transactional(readOnly = true)
    public CompanyResponse getCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));
        return CompanyResponse.fromEntity(company);
    }

    /**
     * Delete a company and all its associated data (jobs, applications, vectors).
     */
    public void deleteCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        // Delete Pinecone vectors for all company jobs
        for (Job job : company.getJobs()) {
            if (job.getPineconeVectorId() != null) {
                mlServiceClient.deleteVector(job.getPineconeVectorId(), "jobs");
            }
            // Clean up saved_jobs entries for this job
            savedJobRepository.deleteByJobId(job.getId());
        }

        // Cascade will handle jobs -> applications -> status history
        companyRepository.delete(company);

        log.info("Company {} ({}) deleted by admin", companyId, company.getName());
    }
}
