"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Search,
  Clock,
  Eye,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyJobs } from "@/hooks/use-api";
import type { Job } from "@/types";

function getMatchScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-blue-600 dark:text-blue-400";
  return "text-amber-600 dark:text-amber-400";
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  REVIEWING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  SHORTLISTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
};

function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function CompanyDashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useCompanyJobs(0, 100);

  const jobs: Job[] = data?.content ?? [];

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((j) => j.status === "ACTIVE");
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicationsCount ?? 0), 0);
    return [
      {
        label: "Active Jobs",
        value: activeJobs.length,
        icon: Briefcase,
        change: `${jobs.length} total jobs`,
      },
      {
        label: "Total Applicants",
        value: totalApplicants,
        icon: Users,
        change: "Across all jobs",
      },
      {
        label: "Total Jobs",
        value: jobs.length,
        icon: TrendingUp,
        change: `${jobs.filter((j) => j.status === "PAUSED").length} paused`,
      },
      {
        label: "Total Views",
        value: jobs.reduce((sum, j) => sum + (j.viewsCount ?? 0), 0),
        icon: Sparkles,
        change: "Across all listings",
      },
    ];
  }, [jobs]);

  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === "ACTIVE").slice(0, 5),
    [jobs]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "there"}!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your job postings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/company/search-candidates">
              <Search className="mr-2 h-4 w-4" />
              Search Candidates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/company/jobs/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent jobs with applicants - takes 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Job Postings</CardTitle>
              <CardDescription>
                Your latest jobs and their applicant counts
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/company/jobs">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No jobs posted yet. Create your first job listing to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.jobType.replace("_", " ")} &middot;{" "}
                        {job.location || "Remote"} &middot;{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">
                        {job.applicationsCount ?? 0} applicants
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          job.status === "ACTIVE"
                            ? statusColors.SHORTLISTED
                            : job.status === "PAUSED"
                              ? statusColors.PENDING
                              : statusColors.REVIEWING
                        }
                      >
                        {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active jobs - takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Active Job Postings</CardTitle>
              <CardDescription>
                Performance of your current listings
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/company/jobs">
                Manage
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No active jobs. Post a new job to start receiving applicants.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job, index) => {
                  const daysLeft = daysUntilDeadline(job.applicationDeadline);
                  return (
                    <div key={job.id} className="space-y-2">
                      <p className="text-sm font-medium truncate">{job.title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.applicationsCount ?? 0} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {job.viewsCount ?? 0} views
                        </span>
                        {daysLeft !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysLeft}d left
                          </span>
                        )}
                      </div>
                      {index !== activeJobs.length - 1 && (
                        <div className="border-b pt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
