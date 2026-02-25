"use client";

import { use } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Globe,
  Building2,
  Briefcase,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  Loader2,
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
import { useCompany, useJobs } from "@/hooks/use-api";

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

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = use(params);
  const { data: company, isLoading, isError } = useCompany(slug);

  // We search for jobs belonging to this company by keyword (company name)
  // This will be populated once we have the company data
  const { data: jobsData, isLoading: jobsLoading } = useJobs({
    keyword: company?.name,
    size: 20,
  });

  const openPositions = jobsData?.content ?? [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found / error state
  if (isError || !company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/companies">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Companies
          </Link>
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Company Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The company you are looking for does not exist or may have been removed.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/companies">Browse All Companies</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/companies">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Companies
        </Link>
      </Button>

      {/* Company header */}
      <div className="mb-8">
        {/* Cover image placeholder */}
        <div className="h-32 sm:h-48 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 mb-6" />

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 px-4 sm:px-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-background border-4 border-background shadow-md flex items-center justify-center">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              {company.isVerified && (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              )}
            </div>
            {company.industry && (
              <p className="text-muted-foreground">{company.industry}</p>
            )}
          </div>
          {company.website && (
            <Button variant="outline" asChild>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="mr-2 h-4 w-4" />
                Visit Website
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {company.description.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="mb-3 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Open positions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Open Positions
                {!jobsLoading && ` (${openPositions.length})`}
              </h2>
            </div>

            {jobsLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!jobsLoading && openPositions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No open positions at the moment. Check back later!
                </p>
              </div>
            )}

            {!jobsLoading && openPositions.length > 0 && (
              <div className="space-y-3">
                {openPositions.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.slug}`}>
                    <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <h3 className="font-medium">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
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
                              {job.isSalaryVisible && job.salaryMin != null && job.salaryMax != null && (
                                <span className="flex items-center gap-1 font-medium text-foreground">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="secondary"
                              className={workModeColors[job.workMode]}
                            >
                              {workModeLabels[job.workMode]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeDate(job.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                {company.industry && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Industry</p>
                      <p className="font-medium">{company.industry}</p>
                    </div>
                  </div>
                )}

                {company.companySize && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Company Size</p>
                      <p className="font-medium">{company.companySize} employees</p>
                    </div>
                  </div>
                )}

                {company.headquarters && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Headquarters</p>
                      <p className="font-medium">{company.headquarters}</p>
                    </div>
                  </div>
                )}

                {company.foundedYear && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Founded</p>
                      <p className="font-medium">{company.foundedYear}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Open Positions</p>
                    <p className="font-medium text-primary">
                      {jobsLoading ? "Loading..." : `${openPositions.length} jobs available`}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {company.website && (
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Website
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
