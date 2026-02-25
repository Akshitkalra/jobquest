"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Users,
  Pause,
  Play,
  Lock,
  Trash2,
  Eye,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCompanyJobs, useUpdateJobStatus, useDeleteJob } from "@/hooks/use-api";
import type { Job } from "@/types";

const PAGE_SIZE = 10;

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  },
  PAUSED: {
    label: "Paused",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  DRAFT: {
    label: "Draft",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
};

export default function CompanyJobsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [closingJobId, setClosingJobId] = useState<string | null>(null);

  const { data, isLoading } = useCompanyJobs(page, PAGE_SIZE);
  const updateStatusMutation = useUpdateJobStatus();
  const deleteJobMutation = useDeleteJob();

  const allJobs: Job[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  // Client-side filtering for tab and search
  const filteredJobs = allJobs.filter((job) => {
    const matchesTab = activeTab === "ALL" || job.status === activeTab;
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleToggleStatus = (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    updateStatusMutation.mutate(
      { id: jobId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `Job ${newStatus === "ACTIVE" ? "activated" : "paused"} successfully.`
          );
        },
        onError: () => {
          toast.error("Failed to update job status. Please try again.");
        },
      }
    );
  };

  const handleCloseJob = (jobId: string) => {
    updateStatusMutation.mutate(
      { id: jobId, status: "CLOSED" },
      {
        onSuccess: () => {
          toast.success("Job closed. Top candidates have been auto-shortlisted.");
          setClosingJobId(null);
        },
        onError: () => {
          toast.error("Failed to close job. Please try again.");
        },
      }
    );
  };

  const handleDelete = (jobId: string) => {
    deleteJobMutation.mutate(jobId, {
      onSuccess: () => {
        toast.success("Job deleted successfully.");
      },
      onError: () => {
        toast.error("Failed to delete job. Please try again.");
      },
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Jobs</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage your job postings.
          </p>
        </div>
        <Button asChild>
          <Link href="/company/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val);
              }}
              className="flex-1"
            >
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                <TabsTrigger value="PAUSED">Paused</TabsTrigger>
                <TabsTrigger value="CLOSED">Closed</TabsTrigger>
                <TabsTrigger value="DRAFT">Draft</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allJobs.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You haven&apos;t posted any jobs yet. Click &quot;Post New Job&quot; to get started.
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No jobs found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Applicants</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusConfig[job.status]?.className}
                        >
                          {statusConfig[job.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {job.applicationsCount ?? 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {job.viewsCount ?? 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/company/jobs/${job.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/company/jobs/${job.id}/applicants`}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                View Applicants
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${job.slug}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Listing
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {job.status === "ACTIVE" && (
                              <DropdownMenuItem
                                disabled={updateStatusMutation.isPending}
                                onClick={() =>
                                  handleToggleStatus(job.id, job.status)
                                }
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Job
                              </DropdownMenuItem>
                            )}
                            {job.status === "PAUSED" && (
                              <DropdownMenuItem
                                disabled={updateStatusMutation.isPending}
                                onClick={() =>
                                  handleToggleStatus(job.id, job.status)
                                }
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Activate Job
                              </DropdownMenuItem>
                            )}
                            {(job.status === "ACTIVE" || job.status === "PAUSED") && (
                              <DropdownMenuItem
                                onClick={() => setClosingJobId(job.id)}
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                Close Applications
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              disabled={deleteJobMutation.isPending}
                              onClick={() => handleDelete(job.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements} jobs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Close Job Confirmation Dialog */}
      <Dialog open={!!closingJobId} onOpenChange={(open) => !open && setClosingJobId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Applications</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this job? This will stop accepting new
              applications and <strong>automatically shortlist the top candidates</strong>{" "}
              based on their match scores. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosingJobId(null)}>
              Cancel
            </Button>
            <Button
              disabled={updateStatusMutation.isPending}
              onClick={() => closingJobId && handleCloseJob(closingJobId)}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Close Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
