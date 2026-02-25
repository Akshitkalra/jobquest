"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkX,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useSavedJobs, useRemoveSavedJob } from "@/hooks/use-api";

function formatSalary(min: number, max: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

const PAGE_SIZE = 12;

export default function SavedJobsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useSavedJobs(page, PAGE_SIZE);
  const removeMutation = useRemoveSavedJob();

  const savedJobs = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const handleRemoveBookmark = async (jobId: string) => {
    try {
      await removeMutation.mutateAsync(jobId);
      toast.success("Job removed from saved list.");
    } catch {
      toast.error("Failed to remove saved job. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Saved Jobs</h2>
          <p className="text-muted-foreground">
            Something went wrong loading your saved jobs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Saved Jobs</h2>
        <p className="text-muted-foreground">
          Jobs you&apos;ve bookmarked for later review. {totalElements}{" "}
          {totalElements === 1 ? "job" : "jobs"} saved.
        </p>
      </div>

      {/* Empty state */}
      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No saved jobs yet</p>
            <p className="text-muted-foreground mt-1">
              Browse jobs to find opportunities and bookmark them for later.
            </p>
            <Button asChild className="mt-6">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Job cards grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map((job) => (
            <Card key={job.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {job.company.name}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBookmark(job.id)}
                    disabled={removeMutation.isPending}
                    className="shrink-0 text-muted-foreground hover:text-red-600"
                    title="Remove bookmark"
                  >
                    {removeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BookmarkX className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location ?? "Remote"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.workMode}
                  </span>
                </div>

                {job.isSalaryVisible && job.salaryMin != null && job.salaryMax != null && (
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {job.jobType.replace("_", " ")}
                  </Badge>
                  {job.skills.slice(0, 3).map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{job.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Posted{" "}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="link" size="sm" asChild className="p-0 h-auto">
                    <Link href={`/jobs/${job.slug}`}>View Details</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
