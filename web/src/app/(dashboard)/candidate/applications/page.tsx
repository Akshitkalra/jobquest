"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  AlertCircle,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMyApplications, useWithdrawApplication } from "@/hooks/use-api";

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
  WITHDRAWN: {
    label: "Withdrawn",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
};

const PAGE_SIZE = 10;

export default function CandidateApplicationsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useMyApplications(page, PAGE_SIZE);
  const withdrawMutation = useWithdrawApplication();

  const applications = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "ALL") return true;
    return app.status === activeTab;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleWithdraw = async (applicationId: string) => {
    try {
      await withdrawMutation.mutateAsync(applicationId);
      toast.success("Application withdrawn successfully.");
      setWithdrawingId(null);
    } catch {
      toast.error("Failed to withdraw application. Please try again.");
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
          <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
          <p className="text-muted-foreground">
            Track the status of all your job applications.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">Failed to load applications</p>
            <p className="text-muted-foreground">
              Something went wrong. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
        <p className="text-muted-foreground">
          Track the status of all your job applications.
          {totalElements > 0 && ` ${totalElements} total.`}
        </p>
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); }}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="REVIEWING">Reviewing</TabsTrigger>
          <TabsTrigger value="SHORTLISTED">Shortlisted</TabsTrigger>
          <TabsTrigger value="INTERVIEW">Interview</TabsTrigger>
          <TabsTrigger value="OFFERED">Offered</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Applications list */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No applications found</p>
            <p className="text-muted-foreground">
              {activeTab === "ALL"
                ? "You haven't applied to any jobs yet."
                : `No applications with status "${statusConfig[activeTab]?.label}".`}
            </p>
            <Button asChild className="mt-4">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((application) => (
            <Card
              key={application.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-0">
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => toggleExpand(application.id)}
                >
                  <div className="rounded-lg bg-muted p-2.5 shrink-0">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{application.job.title}</p>
                      <Badge
                        variant="secondary"
                        className={
                          statusConfig[application.status]?.className
                        }
                      >
                        {statusConfig[application.status]?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {application.job.company.name} &middot;{" "}
                      {application.job.location ?? "Remote"} &middot;{" "}
                      {application.job.jobType.replace("_", " ")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Applied{" "}
                        {application.createdAt
                          ? new Date(application.createdAt.endsWith?.("Z") ? application.createdAt : application.createdAt + "Z").toLocaleDateString()
                          : "recently"}
                      </p>
                    </div>
                  </div>

                  {/* Match score */}
                  {application.similarityScore != null && application.similarityScore > 0 && (
                    <div className="shrink-0 text-right">
                      {(() => {
                        const score = application.similarityScore > 1
                          ? application.similarityScore
                          : Math.round(application.similarityScore * 100);
                        return (
                          <>
                            <p
                              className={`text-lg font-bold ${
                                score >= 85
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : score >= 70
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {score}%
                            </p>
                            <p className="text-xs text-muted-foreground">Match</p>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <Button variant="ghost" size="sm" className="shrink-0">
                    {expandedId === application.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded details */}
                {expandedId === application.id && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    <Separator className="mb-4" />

                    {application.coverLetter && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">
                          Your Cover Letter
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/jobs/${application.job.slug}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Job Listing
                        </Link>
                      </Button>

                      {(application.status !== "WITHDRAWN" && application.status !== "HIRED" && application.status !== "REJECTED") && (
                        <Dialog
                          open={withdrawingId === application.id}
                          onOpenChange={(open) =>
                            setWithdrawingId(open ? application.id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Withdraw Application
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Withdraw Application</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to withdraw your
                                application for{" "}
                                <strong>{application.job.title}</strong> at{" "}
                                <strong>{application.job.company.name}</strong>?
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setWithdrawingId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                disabled={withdrawMutation.isPending}
                                onClick={() =>
                                  handleWithdraw(application.id)
                                }
                              >
                                {withdrawMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Withdraw
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
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
