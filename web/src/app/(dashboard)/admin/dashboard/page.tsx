"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminDashboard } from "@/hooks/use-api";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: dashboard, isLoading } = useAdminDashboard();

  const stats = [
    {
      label: "Total Users",
      value: dashboard?.totalUsers?.toLocaleString() ?? "--",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Companies",
      value: dashboard?.totalCompanies?.toLocaleString() ?? "--",
      icon: Building2,
      href: "/admin/companies",
    },
    {
      label: "Active Jobs",
      value: dashboard?.activeJobsCount?.toLocaleString() ?? "--",
      icon: Briefcase,
      href: "/admin/jobs",
    },
    {
      label: "Applications",
      value: dashboard?.totalApplications?.toLocaleString() ?? "--",
      icon: FileText,
      href: "/admin/applications",
    },
  ];

  const platformMetrics = [
    {
      label: "Total Jobs (All Statuses)",
      value: dashboard?.totalJobs?.toLocaleString() ?? "--",
    },
    {
      label: "New Users This Week",
      value: dashboard?.newUsersThisWeek?.toLocaleString() ?? "--",
    },
    {
      label: "New Applications This Week",
      value: dashboard?.newApplicationsThisWeek?.toLocaleString() ?? "--",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || "Admin"}. Here&apos;s your platform overview.
        </p>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs text-muted-foreground">
                        Live data
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Quick stats summary */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Platform Summary</CardTitle>
                  <CardDescription>
                    Key numbers across the platform
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 shrink-0 text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Total Users</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.totalUsers?.toLocaleString() ?? 0} registered users on the platform
                      </p>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap shrink-0">
                      {dashboard?.totalUsers?.toLocaleString() ?? 0}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 shrink-0 text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Companies</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.totalCompanies?.toLocaleString() ?? 0} companies registered
                      </p>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap shrink-0">
                      {dashboard?.totalCompanies?.toLocaleString() ?? 0}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 shrink-0 text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900">
                      <Briefcase className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Active Jobs</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.activeJobsCount?.toLocaleString() ?? 0} currently active out of {dashboard?.totalJobs?.toLocaleString() ?? 0} total
                      </p>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap shrink-0">
                      {dashboard?.activeJobsCount?.toLocaleString() ?? 0}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 shrink-0 text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Applications</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.totalApplications?.toLocaleString() ?? 0} total applications, {dashboard?.newApplicationsThisWeek?.toLocaleString() ?? 0} this week
                      </p>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap shrink-0">
                      {dashboard?.totalApplications?.toLocaleString() ?? 0}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 shrink-0 text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New Users This Week</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.newUsersThisWeek?.toLocaleString() ?? 0} new registrations in the last 7 days
                      </p>
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap shrink-0">
                      {dashboard?.newUsersThisWeek?.toLocaleString() ?? 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform metrics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Platform Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="text-lg font-semibold">{metric.value}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Live
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
                  <Activity className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Analytics chart coming soon
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/admin/analytics">
                      View Analytics
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
