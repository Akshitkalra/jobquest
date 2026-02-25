"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  PagedResponse,
  Job,
  Company,
  Application,
  CandidateProfile,
  Resume,
  Skill,
  Notification,
} from "@/types";

// ============================================
// Jobs
// ============================================

interface JobFilters {
  page?: number;
  size?: number;
  jobType?: string;
  experienceLevel?: string;
  workMode?: string;
  location?: string;
  keyword?: string;
}

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page !== undefined) params.set("page", String(filters.page));
      if (filters.size) params.set("size", String(filters.size));
      if (filters.jobType) params.set("jobType", filters.jobType);
      if (filters.experienceLevel) params.set("experienceLevel", filters.experienceLevel);
      if (filters.workMode) params.set("workMode", filters.workMode);
      if (filters.location) params.set("location", filters.location);
      if (filters.keyword) params.set("keyword", filters.keyword);
      const res = await apiClient.get<ApiResponse<PagedResponse<Job>>>(`/jobs?${params}`);
      return res.data.data;
    },
  });
}

export function useJob(slug: string) {
  return useQuery({
    queryKey: ["job", slug],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Job>>(`/jobs/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });
}

export function useCompanyJobs(page = 0, size = 10) {
  return useQuery({
    queryKey: ["companyJobs", page, size],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Job>>>(`/jobs/company/me?page=${page}&size=${size}`);
      return res.data.data;
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.post<ApiResponse<Job>>("/jobs", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companyJobs"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.put<ApiResponse<Job>>(`/jobs/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companyJobs"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companyJobs"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useJobApplicants(jobId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ["jobApplicants", jobId, page],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Application>>>(`/jobs/${jobId}/applicants?page=${page}&size=${size}`);
      return res.data.data;
    },
    enabled: !!jobId,
  });
}

// ============================================
// Companies
// ============================================

export function useCompanies(page = 0, size = 12) {
  return useQuery({
    queryKey: ["companies", page, size],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Company>>>(`/companies?page=${page}&size=${size}`);
      return res.data.data;
    },
  });
}

export function useCompany(slug: string) {
  return useQuery({
    queryKey: ["company", slug],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Company>>(`/companies/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });
}

export function useMyCompany() {
  return useQuery({
    queryKey: ["myCompany"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Company>>("/companies/me");
      return res.data.data;
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.put<ApiResponse<Company>>("/companies/me", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myCompany"] });
    },
  });
}

// ============================================
// Search
// ============================================

interface SearchCandidatesRequest {
  queryText?: string;
  topK?: number;
  jobType?: string;
  workMode?: string;
  experienceLevel?: string;
  location?: string;
}

export interface RankedCandidate {
  candidateProfile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    avatarUrl: string | null;
    headline: string | null;
    summary: string | null;
    experienceYears: number | null;
    currentTitle: string | null;
    currentCompany: string | null;
    location: string | null;
    preferredWorkMode: string | null;
    isOpenToWork: boolean | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    skills: Skill[];
  };
  similarityScore: number;
  applicationId: string | null;
  status: string | null;
}

export function useSearchCandidates() {
  return useMutation({
    mutationFn: async (data: SearchCandidatesRequest) => {
      const res = await apiClient.post<ApiResponse<PagedResponse<RankedCandidate>>>(
        "/search/candidates",
        data
      );
      return res.data.data;
    },
  });
}

// ============================================
// Applications
// ============================================

export function useMyApplications(page = 0, size = 10, enabled = true) {
  return useQuery({
    queryKey: ["myApplications", page, size],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Application>>>(`/applications/me?page=${page}&size=${size}`);
      return res.data.data;
    },
    enabled,
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { jobId: string; resumeId?: string; coverLetter?: string }) => {
      const res = await apiClient.post<ApiResponse<Application>>("/applications", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myApplications"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put<ApiResponse<Application>>(`/applications/${id}/withdraw`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await apiClient.put<ApiResponse<Application>>(`/applications/${id}/status`, { status, notes });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobApplicants"] });
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

// ============================================
// Candidate Profile
// ============================================

export function useMyProfile() {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CandidateProfile>>("/candidates/me/profile");
      return res.data.data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.put<ApiResponse<CandidateProfile>>("/candidates/me/profile", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ============================================
// Resumes
// ============================================

export function useMyResumes(enabled = true) {
  return useQuery({
    queryKey: ["myResumes"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Resume[]>>("/resumes/me");
      return res.data.data;
    },
    enabled,
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post<ApiResponse<Resume>>("/resumes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myResumes"] });
    },
  });
}

export function useSetPrimaryResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put<ApiResponse<Resume>>(`/resumes/${id}/primary`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myResumes"] });
    },
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myResumes"] });
    },
  });
}

// ============================================
// Saved Jobs
// ============================================

export function useSavedJobs(page = 0, size = 10) {
  return useQuery({
    queryKey: ["savedJobs", page, size],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Job>>>(`/saved-jobs?page=${page}&size=${size}`);
      return res.data.data;
    },
  });
}

export function useSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      await apiClient.post(`/saved-jobs/${jobId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savedJobs"] });
    },
  });
}

export function useRemoveSavedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      await apiClient.delete(`/saved-jobs/${jobId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savedJobs"] });
    },
  });
}

// ============================================
// Skills
// ============================================

export function useSkills(search?: string) {
  return useQuery({
    queryKey: ["skills", search],
    queryFn: async () => {
      const url = search ? `/skills?search=${encodeURIComponent(search)}` : "/skills";
      const res = await apiClient.get<ApiResponse<Skill[]>>(url);
      return res.data.data;
    },
  });
}

// ============================================
// Notifications
// ============================================

export function useNotifications(page = 0, size = 10) {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Notification>>>(`/notifications?page=${page}&size=${size}`);
      return res.data.data;
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<number>>("/notifications/unread-count");
      return res.data.data;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });
}

// ============================================
// Admin
// ============================================

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{
        totalUsers: number;
        totalCompanies: number;
        totalJobs: number;
        totalApplications: number;
        activeJobsCount: number;
        newUsersThisWeek: number;
        newApplicationsThisWeek: number;
      }>>("/admin/dashboard");
      return res.data.data;
    },
  });
}

export function useAdminUsers(page = 0, size = 10, search?: string, userType?: string) {
  return useQuery({
    queryKey: ["adminUsers", page, size, search, userType],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (search) params.set("search", search);
      if (userType) params.set("userType", userType);
      const res = await apiClient.get<ApiResponse<PagedResponse<import("@/types").User>>>(`/admin/users?${params}`);
      return res.data.data;
    },
  });
}

export function useAdminJobs(page = 0, size = 10) {
  return useQuery({
    queryKey: ["adminJobs", page, size],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Job>>>(`/admin/jobs?page=${page}&size=${size}`);
      return res.data.data;
    },
  });
}

export function useAdminCompanies(page = 0, size = 10) {
  return useQuery({
    queryKey: ["adminCompanies", page, size],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PagedResponse<Company>>>(`/admin/companies?page=${page}&size=${size}`);
      return res.data.data;
    },
  });
}

export function useAdminVerifyCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/admin/companies/${id}/verify`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCompanies"] });
    },
  });
}

export function useAdminCompany(id: string | null) {
  return useQuery({
    queryKey: ["adminCompany", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Company>>(`/admin/companies/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useAdminDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/companies/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminCompanies"] });
    },
  });
}

export function useAdminModerateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: string; reason?: string }) => {
      await apiClient.put(`/admin/jobs/${id}/moderate`, { action, reason });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminJobs"] });
    },
  });
}

export function useAdminRoles() {
  return useQuery({
    queryKey: ["adminRoles"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Array<{ id: string; name: string; description: string; isSystem: boolean }>>>("/admin/roles");
      return res.data.data;
    },
  });
}

export function useAdminPermissions() {
  return useQuery({
    queryKey: ["adminPermissions"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Array<{ id: string; name: string; module: string }>>>("/admin/permissions");
      return res.data.data;
    },
  });
}

export function useAdminUpdateUserRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: string; roleIds: string[] }) => {
      await apiClient.put(`/admin/users/${userId}/roles`, roleIds);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}
