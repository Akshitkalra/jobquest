"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useJobs } from "@/hooks/use-api";

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

const workModeColors: Record<string, string> = {
  REMOTE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  HYBRID: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  ONSITE: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
};

function formatSalary(min: number, max: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

function FilterSidebar({
  jobType,
  setJobType,
  experience,
  setExperience,
  workMode,
  setWorkMode,
  onClear,
}: {
  jobType: string;
  setJobType: (v: string) => void;
  experience: string;
  setExperience: (v: string) => void;
  workMode: string;
  setWorkMode: (v: string) => void;
  onClear: () => void;
}) {
  const hasFilters = jobType || experience || workMode;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Job Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Type</label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Experience Level</label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger>
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All levels</SelectItem>
              <SelectItem value="ENTRY">Entry Level</SelectItem>
              <SelectItem value="MID">Mid Level</SelectItem>
              <SelectItem value="SENIOR">Senior</SelectItem>
              <SelectItem value="LEAD">Lead</SelectItem>
              <SelectItem value="EXECUTIVE">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Work Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Work Mode</label>
          <Select value={workMode} onValueChange={setWorkMode}>
            <SelectTrigger>
              <SelectValue placeholder="All modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All modes</SelectItem>
              <SelectItem value="REMOTE">Remote</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
              <SelectItem value="ONSITE">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, isError } = useJobs({
    page: currentPage,
    size: 10,
    jobType: jobType && jobType !== "ALL" ? jobType : undefined,
    experienceLevel: experience && experience !== "ALL" ? experience : undefined,
    workMode: workMode && workMode !== "ALL" ? workMode : undefined,
    keyword: keyword || undefined,
  });

  const jobs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleSearch = () => {
    setKeyword(searchQuery);
    setCurrentPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterChange = (
    setter: (v: string) => void,
    value: string,
  ) => {
    setter(value);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setJobType("");
    setExperience("");
    setWorkMode("");
    setCurrentPage(0);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate which page numbers to show
  const getPageNumbers = (): number[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find Your Dream Job</h1>
        <p className="mt-2 text-muted-foreground">
          Browse through thousands of job opportunities from top companies.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button className="sm:w-auto" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>

        {/* Mobile filter toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filter Jobs</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterSidebar
                jobType={jobType}
                setJobType={(v) => handleFilterChange(setJobType, v)}
                experience={experience}
                setExperience={(v) => handleFilterChange(setExperience, v)}
                workMode={workMode}
                setWorkMode={(v) => handleFilterChange(setWorkMode, v)}
                onClear={clearFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card>
            <CardContent className="p-4">
              <FilterSidebar
                jobType={jobType}
                setJobType={(v) => handleFilterChange(setJobType, v)}
                experience={experience}
                setExperience={(v) => handleFilterChange(setExperience, v)}
                workMode={workMode}
                setWorkMode={(v) => handleFilterChange(setWorkMode, v)}
                onClear={clearFilters}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Job listings */}
        <div className="flex-1 space-y-4">
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                "Loading jobs..."
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-foreground">{jobs.length}</span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">{totalElements}</span>{" "}
                  jobs
                </>
              )}
            </p>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="relevant">Most relevant</SelectItem>
                <SelectItem value="salary_high">Salary: High to Low</SelectItem>
                <SelectItem value="salary_low">Salary: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground">
                Something went wrong while loading jobs. Please try again later.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We could not find any jobs matching your criteria. Try adjusting your
                filters or search query.
              </p>
              {(keyword || jobType || experience || workMode) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    clearFilters();
                    setSearchQuery("");
                    setKeyword("");
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {/* Job cards */}
          {!isLoading &&
            !isError &&
            jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.slug}`}>
                <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Company logo placeholder */}
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-base">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {job.company.name}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={workModeColors[job.workMode]}
                          >
                            {workModeLabels[job.workMode]}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {jobTypeLabels[job.jobType]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {experienceLevelLabels[job.experienceLevel]}
                          </span>
                          {job.isSalaryVisible && job.salaryMin != null && job.salaryMax != null && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.skills.map((skill) => (
                            <Badge key={skill.id} variant="outline" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{job.applicationsCount} applicants</span>
                          <span>Posted {formatRelativeDate(job.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-9"
                  onClick={() => goToPage(page)}
                >
                  {page + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages - 1}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
