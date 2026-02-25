"use client";

import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Bookmark,
  Upload,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useMyResumes, useJobs, useSaveJob } from "@/hooks/use-api";

function formatSalary(min: number, max: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

export default function RecommendationsPage() {
  const { data: resumes, isLoading: resumesLoading } = useMyResumes();
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ page: 0, size: 10 });
  const saveMutation = useSaveJob();

  const hasResume = resumes && resumes.length > 0;
  const jobs = jobsData?.content ?? [];

  const handleSaveJob = async (jobId: string) => {
    try {
      await saveMutation.mutateAsync(jobId);
      toast.success("Job saved to your bookmarks.");
    } catch {
      toast.error("Failed to save job. Please try again.");
    }
  };

  if (resumesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No resume uploaded state
  if (!hasResume) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            AI Recommendations
          </h2>
          <p className="text-muted-foreground">
            Get personalized job recommendations based on your resume.
          </p>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">
              Upload a resume to get AI-powered job recommendations
            </p>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              Our AI analyzes your resume to match you with the best job
              opportunities based on your skills, experience, and preferences.
            </p>
            <Button asChild className="mt-6">
              <Link href="/candidate/profile">
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (jobsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Jobs Matched to Your Resume
            </h2>
            <p className="text-muted-foreground">
              AI-powered recommendations based on your profile and experience.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Jobs Matched to Your Resume
            </h2>
            <p className="text-muted-foreground">
              AI-powered recommendations based on your profile and experience.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No recommendations yet</p>
            <p className="text-muted-foreground mt-1">
              Check back soon -- new jobs are posted daily.
            </p>
            <Button asChild className="mt-6">
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Jobs Matched to Your Resume
          </h2>
          <p className="text-muted-foreground">
            Showing available jobs based on your profile and experience.
            Full AI-powered matching coming soon.
          </p>
        </div>
      </div>

      {/* Jobs list */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Job info */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <div className="flex items-start gap-2 flex-wrap">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {job.title}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location ?? "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.workMode} &middot; {job.jobType.replace("_", " ")}
                    </span>
                    {job.isSalaryVisible && job.salaryMin != null && job.salaryMax != null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 lg:text-right space-y-3 lg:min-w-[140px]">
                  <div className="flex flex-col gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/jobs/${job.slug}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Job
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveJob(job.id)}
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Bookmark className="mr-2 h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
