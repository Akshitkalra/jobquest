"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import type { ApiResponse, AuthResponse } from "@/types";

interface LoginData {
  email: string;
  password: string;
}

interface CandidateRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface CompanyRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  industry?: string;
  companySize?: string;
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);

      // Check for callbackUrl from middleware redirect
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        router.push(callbackUrl);
        return;
      }

      const redirectMap: Record<string, string> = {
        CANDIDATE: "/candidate/dashboard",
        COMPANY: "/company/dashboard",
        ADMIN: "/admin/dashboard",
      };
      router.push(redirectMap[data.user.userType] || "/");
    },
  });
}

export function useRegisterCandidate() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CandidateRegisterData) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/register/candidate",
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      router.push("/candidate/dashboard");
    },
  });
}

export function useRegisterCompany() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CompanyRegisterData) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/register/company",
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      router.push("/company/dashboard");
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      router.push("/login");
    },
  });
}
