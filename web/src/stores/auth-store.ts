import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

function setAuthCookies(user: User) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `auth-indicator=true; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user-type=${user.userType}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "auth-indicator=; path=/; max-age=0";
  document.cookie = "user-type=; path=/; max-age=0";
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (accessToken: string, user: User) => {
        setAuthCookies(user);
        set({ accessToken, user, isAuthenticated: true });
      },
      setUser: (user: User) => {
        setAuthCookies(user);
        set({ user });
      },
      clearAuth: () => {
        clearAuthCookies();
        set({ accessToken: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state?.user) {
          setAuthCookies(state.user);
        }
      },
    }
  )
);
