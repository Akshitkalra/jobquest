"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  CheckCircle2,
  Flag,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminJobs, useAdminModerateJob } from "@/hooks/use-api";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  },
  DRAFT: {
    label: "Draft",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
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
};

export default function AdminJobsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading } = useAdminJobs(currentPage, pageSize);
  const moderateJob = useAdminModerateJob();

  const jobs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  // Client-side filtering for tab and search
  const filteredJobs = jobs.filter((job) => {
    const matchesTab = activeTab === "ALL" || job.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = (jobId: string) => {
    moderateJob.mutate(
      { id: jobId, action: "approve" },
      {
        onSuccess: () => {
          toast.success("Job approved successfully.");
        },
        onError: () => {
          toast.error("Failed to approve job.");
        },
      }
    );
  };

  const handleFlag = (jobId: string) => {
    moderateJob.mutate(
      { id: jobId, action: "flag" },
      {
        onSuccess: () => {
          toast.success("Job flagged successfully.");
        },
        onError: () => {
          toast.error("Failed to flag job.");
        },
      }
    );
  };

  const openRemoveDialog = (jobId: string) => {
    setRemovingJobId(jobId);
    setRemoveReason("");
    setRemoveDialogOpen(true);
  };

  const handleRemove = () => {
    if (!removingJobId) return;
    moderateJob.mutate(
      { id: removingJobId, action: "remove", reason: removeReason },
      {
        onSuccess: () => {
          toast.success("Job removed successfully.");
          setRemoveDialogOpen(false);
          setRemovingJobId(null);
          setRemoveReason("");
        },
        onError: () => {
          toast.error("Failed to remove job.");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Job Moderation</h2>
        <p className="text-muted-foreground">
          Review, approve, and moderate job postings on the platform.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                <TabsTrigger value="DRAFT">Draft</TabsTrigger>
                <TabsTrigger value="PAUSED">Paused</TabsTrigger>
                <TabsTrigger value="CLOSED">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No jobs found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-center">Applications</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium max-w-[250px] truncate">
                          {job.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {job.company?.name ?? "--"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusConfig[job.status]?.className}
                          >
                            {statusConfig[job.status]?.label ?? job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {job.jobType?.replace("_", " ") ?? "--"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {job.applicationsCount ?? 0}
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
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {job.status !== "ACTIVE" && (
                                <DropdownMenuItem
                                  onClick={() => handleApprove(job.id)}
                                  disabled={moderateJob.isPending}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {job.status === "ACTIVE" && (
                                <DropdownMenuItem
                                  onClick={() => handleFlag(job.id)}
                                  disabled={moderateJob.isPending}
                                >
                                  <Flag className="mr-2 h-4 w-4" />
                                  Flag
                                </DropdownMenuItem>
                              )}
                              {job.status !== "CLOSED" && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => openRemoveDialog(job.id)}
                                  disabled={moderateJob.isPending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to{" "}
                  {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
                  {totalElements} jobs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Remove reason dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Job Posting</DialogTitle>
            <DialogDescription>
              Please provide a reason for removing this job posting. The company
              will be notified of the removal and the reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="removeReason">Reason for Removal</Label>
              <Textarea
                id="removeReason"
                placeholder="e.g. Violates posting guidelines, suspicious content, duplicate listing..."
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={!removeReason.trim() || moderateJob.isPending}
            >
              {moderateJob.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remove Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
