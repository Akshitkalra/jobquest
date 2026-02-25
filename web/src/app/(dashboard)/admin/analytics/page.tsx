"use client";

import {
  Users,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAdminDashboard } from "@/hooks/use-api";

export default function AdminAnalyticsPage() {
  const { data: dashboard, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Platform-wide metrics and insights.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      label: "Total Users",
      value: dashboard?.totalUsers?.toLocaleString() ?? "0",
      icon: Users,
      detail: `${dashboard?.newUsersThisWeek?.toLocaleString() ?? 0} new this week`,
    },
    {
      label: "Total Companies",
      value: dashboard?.totalCompanies?.toLocaleString() ?? "0",
      icon: Building2,
      detail: "Registered companies on the platform",
    },
    {
      label: "Total Jobs",
      value: dashboard?.totalJobs?.toLocaleString() ?? "0",
      icon: Briefcase,
      detail: `${dashboard?.activeJobsCount?.toLocaleString() ?? 0} currently active`,
    },
    {
      label: "Total Applications",
      value: dashboard?.totalApplications?.toLocaleString() ?? "0",
      icon: FileText,
      detail: `${dashboard?.newApplicationsThisWeek?.toLocaleString() ?? 0} new this week`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Platform-wide metrics and insights.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
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
              <p className="text-xs text-muted-foreground mt-2">
                {stat.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts section - User Growth & Job Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              User Growth
            </CardTitle>
            <CardDescription>
              New user registrations over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart placeholder */}
            <div className="rounded-lg border border-dashed p-12 text-center">
              <LineChart className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                Chart coming soon
              </p>
            </div>

            <Separator />

            {/* Summary data from API */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {dashboard?.totalUsers?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">New This Week</p>
                <p className="text-2xl font-bold">
                  {dashboard?.newUsersThisWeek?.toLocaleString() ?? 0}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
              >
                <TrendingUp className="mr-1 h-3 w-3" />
                Live
              </Badge>
            </div>

            {/* Platform breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Platform Breakdown</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Companies</span>
                  <span className="text-muted-foreground">
                    {dashboard?.totalCompanies?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Active Jobs</span>
                  <span className="text-muted-foreground">
                    {dashboard?.activeJobsCount?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Total Applications</span>
                  <span className="text-muted-foreground">
                    {dashboard?.totalApplications?.toLocaleString() ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Posting Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Job Posting Stats
            </CardTitle>
            <CardDescription>
              Job posting activity and status breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart placeholder */}
            <div className="rounded-lg border border-dashed p-12 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                Chart coming soon
              </p>
            </div>

            <Separator />

            {/* Summary */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Jobs
                </p>
                <p className="text-2xl font-bold">
                  {dashboard?.totalJobs?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Active Jobs
                </p>
                <p className="text-2xl font-bold">
                  {dashboard?.activeJobsCount?.toLocaleString() ?? 0}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
              >
                <TrendingUp className="mr-1 h-3 w-3" />
                Live
              </Badge>
            </div>

            {/* Key stats */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Key Indicators</p>
              <div className="flex items-center justify-between text-sm">
                <span>Active Job Rate</span>
                <Badge variant="outline">
                  {dashboard?.totalJobs
                    ? `${((dashboard.activeJobsCount / dashboard.totalJobs) * 100).toFixed(1)}%`
                    : "0%"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Applications per Job (avg)</span>
                <Badge variant="outline">
                  {dashboard?.totalJobs && dashboard?.totalApplications
                    ? (dashboard.totalApplications / dashboard.totalJobs).toFixed(1)
                    : "0"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>New Applications This Week</span>
                <Badge variant="outline">
                  {dashboard?.newApplicationsThisWeek?.toLocaleString() ?? 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Volume & Platform Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Application Volume
            </CardTitle>
            <CardDescription>
              Application activity and key metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart placeholder */}
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                Chart coming soon
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {dashboard?.totalApplications?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total applications
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {dashboard?.newApplicationsThisWeek?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  New this week
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {dashboard?.totalJobs && dashboard?.totalApplications
                    ? (dashboard.totalApplications / dashboard.totalJobs).toFixed(1)
                    : "0"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg per job
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Platform Summary
            </CardTitle>
            <CardDescription>
              Overall platform health at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart placeholder */}
            <div className="rounded-lg border border-dashed p-12 text-center">
              <PieChart className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                Chart coming soon
              </p>
            </div>

            <Separator />

            {/* Summary table */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Metric</span>
                <span className="text-right">Value</span>
              </div>
              <div className="grid grid-cols-2 items-center text-sm">
                <span className="font-medium">Total Users</span>
                <span className="text-right text-muted-foreground">
                  {dashboard?.totalUsers?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center text-sm">
                <span className="font-medium">Total Companies</span>
                <span className="text-right text-muted-foreground">
                  {dashboard?.totalCompanies?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center text-sm">
                <span className="font-medium">Total Jobs</span>
                <span className="text-right text-muted-foreground">
                  {dashboard?.totalJobs?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center text-sm">
                <span className="font-medium">Active Jobs</span>
                <span className="text-right text-muted-foreground">
                  {dashboard?.activeJobsCount?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center text-sm">
                <span className="font-medium">Total Applications</span>
                <span className="text-right text-muted-foreground">
                  {dashboard?.totalApplications?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center text-sm">
                <span className="font-medium">New Users This Week</span>
                <span className="text-right text-muted-foreground">
                  {dashboard?.newUsersThisWeek?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center text-sm">
                <span className="font-medium">New Apps This Week</span>
                <span className="text-right text-muted-foreground">
                  {dashboard?.newApplicationsThisWeek?.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
