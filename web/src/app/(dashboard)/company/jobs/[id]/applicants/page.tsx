"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useJobApplicants, useUpdateApplicationStatus } from "@/hooks/use-api";
import type { Application } from "@/types";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  REVIEWING: {
    label: "Reviewing",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  },
  INTERVIEW: {
    label: "Interview",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  OFFERED: {
    label: "Offered",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  HIRED: {
    label: "Hired",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  },
};

function getMatchScoreColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-blue-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getMatchScoreTextColor(score: number): string {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-blue-600 dark:text-blue-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getApplicantName(app: Application): string {
  const profile = app.candidateProfile;
  if (profile?.firstName || profile?.lastName) {
    return [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  }
  return "Unknown Applicant";
}

function getApplicantInitials(app: Application): string {
  const profile = app.candidateProfile;
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName[0]}${profile.lastName[0]}`;
  }
  if (profile?.firstName) return profile.firstName[0];
  return "?";
}

export default function ApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useJobApplicants(jobId);
  const updateStatusMutation = useUpdateApplicationStatus();

  const applicants: Application[] = data?.content ?? [];
  const totalApplicants = data?.totalElements ?? 0;

  // Derive job title from the first applicant's job, if available
  const jobTitle = applicants.length > 0 ? applicants[0].job?.title : null;

  const handleStatusChange = (applicantId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { id: applicantId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Applicant status updated successfully.");
        },
        onError: () => {
          toast.error("Failed to update applicant status. Please try again.");
        },
      }
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/company/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Applicants{jobTitle ? ` for ${jobTitle}` : ""}
          </h2>
          <p className="text-muted-foreground">
            {totalApplicants} applicant{totalApplicants !== 1 ? "s" : ""}, ranked by AI match
            score.
          </p>
        </div>
      </div>

      {/* Applicant list */}
      <div className="space-y-4">
        {applicants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No applicants yet. Check back later or share your job listing.
              </p>
            </CardContent>
          </Card>
        ) : (
          applicants.map((applicant) => {
            const name = getApplicantName(applicant);
            const initials = getApplicantInitials(applicant);
            const rawScore = applicant.similarityScore ?? 0;
            const score = rawScore > 1 ? rawScore : Math.round(rawScore * 100);
            const profile = applicant.candidateProfile;
            const resume = applicant.resume;

            return (
              <Card key={applicant.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  {/* Main applicant row */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => toggleExpand(applicant.id)}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={profile?.avatarUrl || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{name}</p>
                        <Badge
                          variant="secondary"
                          className={
                            statusConfig[applicant.status]?.className
                          }
                        >
                          {statusConfig[applicant.status]?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {profile?.headline || profile?.currentTitle || "No headline"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied {applicant.createdAt
                          ? new Date(applicant.createdAt.endsWith?.("Z") ? applicant.createdAt : applicant.createdAt + "Z").toLocaleDateString()
                          : "recently"}
                      </p>
                    </div>

                    {/* Match score */}
                    <div className="shrink-0 text-right mr-2">
                      <p
                        className={`text-2xl font-bold ${getMatchScoreTextColor(score)}`}
                      >
                        {score}%
                      </p>
                      <div className="w-24 h-2 rounded-full bg-muted mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${getMatchScoreColor(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Match Score
                      </p>
                    </div>

                    {/* Status update */}
                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        value={applicant.status}
                        onValueChange={(value) =>
                          handleStatusChange(applicant.id, value)
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="REVIEWING">Reviewing</SelectItem>
                          <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                          <SelectItem value="INTERVIEW">Interview</SelectItem>
                          <SelectItem value="OFFERED">Offered</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                          <SelectItem value="HIRED">Hired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="ghost" size="sm" className="shrink-0">
                      {expandedId === applicant.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded details */}
                  {expandedId === applicant.id && (
                    <div className="border-t px-4 pb-4 pt-3 space-y-4">
                      <Separator className="mb-4" />

                      {/* Cover Letter */}
                      {applicant.coverLetter && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">
                            Cover Letter
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {applicant.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {profile?.skills && profile.skills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill) => (
                              <Badge key={skill.id || skill.name} variant="outline">
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resume download */}
                      {resume && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Resume</h4>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={resume.fileUrl}
                              download={resume.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {resume.fileName}
                            </a>
                          </Button>
                        </div>
                      )}

                      {/* Candidate details */}
                      {profile && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {profile.location && (
                            <div>
                              <span className="font-medium">Location:</span>{" "}
                              <span className="text-muted-foreground">{profile.location}</span>
                            </div>
                          )}
                          {profile.experienceYears > 0 && (
                            <div>
                              <span className="font-medium">Experience:</span>{" "}
                              <span className="text-muted-foreground">{profile.experienceYears} years</span>
                            </div>
                          )}
                          {profile.currentCompany && (
                            <div>
                              <span className="font-medium">Current Company:</span>{" "}
                              <span className="text-muted-foreground">{profile.currentCompany}</span>
                            </div>
                          )}
                          {profile.email && (
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              <span className="text-muted-foreground">{profile.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
