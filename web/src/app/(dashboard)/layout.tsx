"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { Sidebar, MobileSidebar, getNavItemsByUserType } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useAuthStore } from "@/stores/auth-store";

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  // The last meaningful segment becomes the title
  const lastSegment = segments[segments.length - 1] || "Dashboard";

  // Map known paths to readable titles
  const titleMap: Record<string, string> = {
    dashboard: "Dashboard",
    profile: "Profile",
    applications: "Applications",
    "saved-jobs": "Saved Jobs",
    recommendations: "Recommendations",
    settings: "Settings",
    jobs: "Manage Jobs",
    new: "Post New Job",
    "search-candidates": "Search Candidates",
    users: "Users",
    companies: "Companies",
    roles: "Roles & Permissions",
    analytics: "Analytics",
  };

  return titleMap[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated.
  // AuthProvider has already waited for Zustand hydration + token refresh
  // before rendering children, so this is safe to check immediately.
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const navItems = getNavItemsByUserType(user.userType);
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar navItems={navItems} />

      {/* Mobile sidebar */}
      <MobileSidebar
        navItems={navItems}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        <DashboardHeader
          title={pageTitle}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
