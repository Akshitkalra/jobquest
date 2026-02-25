package com.jobportal.api.controller;

import com.jobportal.api.dto.response.ApiResponse;
import com.jobportal.api.dto.response.CompanyResponse;
import com.jobportal.api.dto.response.DashboardStatsResponse;
import com.jobportal.api.dto.response.JobResponse;
import com.jobportal.api.dto.response.PagedResponse;
import com.jobportal.api.dto.response.UserResponse;
import com.jobportal.api.entity.Permission;
import com.jobportal.api.entity.Role;
import com.jobportal.api.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // -------------------------------------------------------------------------
    // Dashboard
    // -------------------------------------------------------------------------

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // -------------------------------------------------------------------------
    // User Management
    // -------------------------------------------------------------------------

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String userType) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<UserResponse> users = adminService.getUsers(pageable, search, userType);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<ApiResponse<Void>> updateUserRoles(
            @PathVariable UUID id,
            @RequestBody List<UUID> roleIds) {

        adminService.updateUserRoles(id, roleIds);
        return ResponseEntity.ok(ApiResponse.success(null, "User roles updated successfully"));
    }

    // -------------------------------------------------------------------------
    // Role Management
    // -------------------------------------------------------------------------

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<Role>>> getRoles() {
        List<Role> roles = adminService.getRoles();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    @PostMapping("/roles")
    public ResponseEntity<ApiResponse<Role>> createRole(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        Role role = adminService.createRole(name, description);
        return ResponseEntity.ok(ApiResponse.success(role, "Role created successfully"));
    }

    @PutMapping("/roles/{id}/permissions")
    public ResponseEntity<ApiResponse<Void>> updateRolePermissions(
            @PathVariable UUID id,
            @RequestBody List<UUID> permissionIds) {

        adminService.updateRolePermissions(id, permissionIds);
        return ResponseEntity.ok(ApiResponse.success(null, "Role permissions updated successfully"));
    }

    // -------------------------------------------------------------------------
    // Permission Management
    // -------------------------------------------------------------------------

    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<List<Permission>>> getPermissions() {
        List<Permission> permissions = adminService.getPermissions();
        return ResponseEntity.ok(ApiResponse.success(permissions));
    }

    // -------------------------------------------------------------------------
    // Job Moderation
    // -------------------------------------------------------------------------

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<JobResponse> jobs = adminService.getAllJobs(pageable);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @PutMapping("/jobs/{id}/moderate")
    public ResponseEntity<ApiResponse<Void>> moderateJob(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String action = body.get("action");
        String reason = body.get("reason");
        adminService.moderateJob(id, action, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "Job moderated successfully"));
    }

    // -------------------------------------------------------------------------
    // Company Verification
    // -------------------------------------------------------------------------

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<PagedResponse<CompanyResponse>>> getCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<CompanyResponse> companies = adminService.getAllCompanies(pageable);
        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompany(@PathVariable UUID id) {
        CompanyResponse company = adminService.getCompany(id);
        return ResponseEntity.ok(ApiResponse.success(company));
    }

    @PutMapping("/companies/{id}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyCompany(@PathVariable UUID id) {
        adminService.verifyCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Company verified successfully"));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable UUID id) {
        adminService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Company deleted successfully"));
    }
}
