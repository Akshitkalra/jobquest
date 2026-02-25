"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  Building2,
  Globe,
  Users,
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { useJob, useApplyToJob, useMyResumes, useMyApplications, useSaveJob, useRemoveSavedJob } from "@/hooks/use-api";
import { toast } from "sonner";

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

const workModeLabels: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const experienceLevelLabels: Record<string, string> = {
  ENTRY: "Entry Level",
  MID: "Mid Level",
  SENIOR: "Senior",
  LEAD: "Lead",
  EXECUTIVE: "Executive",
};

function formatSalary(min: number, max: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}/year`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = use(params);
  const { isAuthenticated, user } = useAuthStore();
  const { data: job, isLoading, isError } = useJob(slug);

  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  const [justApplied, setJustApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isCandidate = !!(isAuthenticated && user?.userType === "CANDIDATE");

  const { data: resumes, isLoading: resumesLoading } = useMyResumes(isCandidate);
  const { data: myApplications } = useMyApplications(0, 100);
  const applyMutation = useApplyToJob();
  const saveMutation = useSaveJob();
  const unsaveMutation = useRemoveSavedJob();

  // Check if candidate already applied to this job
  const existingApplication = isCandidate && myApplications?.content?.find(
    (app) => app.job?.id === job?.id
  );
  const hasApplied = justApplied || !!existingApplication;

  const handleApply = () => {
    if (!job) return;
    applyMutation.mutate(
      {
        jobId: job.id,
        resumeId: selectedResumeId || undefined,
        coverLetter: coverLetter || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Application submitted successfully!");
          setApplyOpen(false);
          setCoverLetter("");
          setSelectedResumeId("");
          setJustApplied(true);
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "Failed to submit application";
          toast.error(msg);
        },
      }
    );
  };

  const handleSaveToggle = () => {
    if (!job) return;
    if (isSaved) {
      unsaveMutation.mutate(job.id, {
        onSuccess: () => {
          setIsSaved(false);
          toast.success("Job removed from saved");
        },
        onError: () => toast.error("Failed to remove saved job"),
      });
    } else {
      saveMutation.mutate(job.id, {
        onSuccess: () => {
          setIsSaved(true);
          toast.success("Job saved!");
        },
        onError: () => toast.error("Failed to save job"),
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: job?.title, url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found / error state
  if (isError || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/jobs">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The job you are looking for does not exist or may have been removed.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/jobs">Browse All Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/jobs">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job header */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {job.title}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {job.company.name}
                  </Link>
                  {job.company.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{jobTypeLabels[job.jobType]}</Badge>
                  <Badge variant="secondary">{workModeLabels[job.workMode]}</Badge>
                  <Badge variant="secondary">
                    {experienceLevelLabels[job.experienceLevel]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key details */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {job.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.isSalaryVisible && job.salaryMin != null && job.salaryMax != null && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{job.applicationsCount} applicants</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills */}
          {job.skills.length > 0 && (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="px-3 py-1">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-3">About This Role</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {job.description.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{req.replace(/^-\s*/, "")}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold mb-3">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((resp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{resp.replace(/^-\s*/, "")}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </>
          )}

          {/* Benefits */}
          {job.benefits && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold mb-3">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{benefit.replace(/^-\s*/, "")}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply card */}
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              {isCandidate ? (
                hasApplied ? (
                  <Button className="w-full" size="lg" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Applied
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={() => setApplyOpen(true)}>
                    Apply Now
                  </Button>
                )
              ) : isAuthenticated ? (
                <p className="text-sm text-muted-foreground text-center">
                  Only candidates can apply for jobs.
                </p>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/login?callbackUrl=/jobs/${slug}`}>Sign In to Apply</Link>
                </Button>
              )}

              <div className="flex gap-2">
                {isCandidate ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSaveToggle}
                    disabled={saveMutation.isPending || unsaveMutation.isPending}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="mr-2 h-4 w-4" />
                    )}
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/login">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              {job.applicationDeadline && (
                <p className="text-xs text-muted-foreground text-center">
                  Application deadline: {formatDate(job.applicationDeadline)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Apply Dialog */}
          <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply to {job.title}</DialogTitle>
                <DialogDescription>
                  at {job.company.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Resume (optional)</Label>
                  {resumesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading resumes...</p>
                  ) : resumes && resumes.length > 0 ? (
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.fileName} {resume.isPrimary && "(Primary)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No resumes uploaded.{" "}
                      <Link href="/candidate/profile" className="text-primary hover:underline">
                        Upload one
                      </Link>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Cover Letter (optional)</Label>
                  <Textarea
                    placeholder="Tell the employer why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setApplyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApply} disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Company card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium">{job.company.name}</p>
                    {job.company.isVerified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                    )}
                  </div>
                  {job.company.industry && (
                    <p className="text-sm text-muted-foreground">
                      {job.company.industry}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {job.company.companySize && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>{job.company.companySize} employees</span>
                  </div>
                )}
                {job.company.headquarters && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{job.company.headquarters}</span>
                  </div>
                )}
                {job.company.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4 shrink-0" />
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Website
                      <ExternalLink className="inline ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/companies/${job.company.slug}`}>
                  View Company Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
