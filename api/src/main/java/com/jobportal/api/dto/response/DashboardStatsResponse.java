package com.jobportal.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
    private long activeJobsCount;
    private long newUsersThisWeek;
    private long newApplicationsThisWeek;
}
