"use client";

import Link from "next/link";
import {
  FileText,
  Eye,
  Bookmark,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Clock,
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
import { useMyApplications, useMyProfile, useSavedJobs } from "@/hooks/use-api";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  REVIEWING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  SHORTLISTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  INTERVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  OFFERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  HIRED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  WITHDRAWN: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export default function CandidateDashboardPage() {
  const { user } = useAuthStore();
  const { data: applicationsData, isLoading: applicationsLoading } = useMyApplications(0, 50);
  const { data: profileData, isLoading: profileLoading } = useMyProfile();
  const { data: savedJobsData, isLoading: savedJobsLoading } = useSavedJobs(0, 1);

  const isLoading = applicationsLoading || profileLoading || savedJobsLoading;

  const applications = applicationsData?.content ?? [];
  const recentApplications = applications.slice(0, 4);

  const totalApplications = applicationsData?.totalElements ?? 0;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;
  const savedJobsCount = savedJobsData?.totalElements ?? 0;

  const isProfileComplete = !!(
    profileData?.headline &&
    profileData?.summary &&
    profileData?.currentTitle &&
    profileData?.location &&
    profileData?.skills?.length
  );

  const stats = [
    {
      label: "Applications Sent",
      value: totalApplications,
      icon: FileText,
      change: `${applications.length} loaded`,
      href: "/candidate/applications",
    },
    {
      label: "Interviews",
      value: interviewCount,
      icon: CalendarDays,
      change: interviewCount > 0 ? "In progress" : "None yet",
      href: "/candidate/applications",
    },
    {
      label: "Profile Views",
      value: "--",
      icon: Eye,
      change: "Complete profile for views",
      href: "/candidate/profile",
    },
    {
      label: "Saved Jobs",
      value: savedJobsCount,
      icon: Bookmark,
      change: savedJobsCount > 0 ? "Review your bookmarks" : "None saved yet",
      href: "/candidate/saved-jobs",
    },
  ];

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.firstName || "there"}!
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your job search activity.
        </p>
      </div>

      {/* Profile completion banner */}
      {!isProfileComplete && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Complete your profile to increase visibility
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Profiles with all sections filled get 3x more views from recruiters.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href="/candidate/profile">
                Complete Profile
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent applications & quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <CardDescription>
                Your latest job applications and their status
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/candidate/applications">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No applications yet. Start browsing jobs!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-muted p-2 shrink-0">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {app.job.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.job.company.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className={statusColors[app.status]}
                      >
                        {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to help with your job search
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Browse Jobs
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/candidate/recommendations">
                <Eye className="mr-2 h-4 w-4" />
                View Recommendations
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/candidate/profile">
                <FileText className="mr-2 h-4 w-4" />
                Update Resume
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/candidate/saved-jobs">
                <Bookmark className="mr-2 h-4 w-4" />
                Saved Jobs ({savedJobsCount})
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
