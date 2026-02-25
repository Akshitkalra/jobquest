"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // setTimeout(fn, 0) runs after microtasks. Zustand persist rehydrates
    // via microtasks (Promise.resolve), so by the time this fires the store
    // is guaranteed to have the real localStorage state.
    const timer = setTimeout(() => {
      const { isAuthenticated, user } = useAuthStore.getState();

      // Sync cookies so Next.js middleware can check auth
      if (isAuthenticated && user && typeof document !== "undefined") {
        const maxAge = 60 * 60 * 24 * 7;
        document.cookie = `auth-indicator=true; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `user-type=${user.userType}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      setIsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
