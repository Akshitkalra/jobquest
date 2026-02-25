"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/use-api";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, isError } = useCompanies(currentPage, 12);

  const companies = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

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
        <h1 className="text-3xl font-bold tracking-tight">
          Explore Companies
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover top companies hiring right now and learn about their culture,
          benefits, and open positions.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies by name, industry, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading companies..."
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">{companies.length}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalElements}</span>{" "}
              companies
            </>
          )}
        </p>
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
            Something went wrong while loading companies. Please try again later.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">No companies found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We could not find any companies at the moment. Please check back later.
          </p>
        </div>
      )}

      {/* Company cards grid */}
      {!isLoading && !isError && companies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {companies.map((company) => (
            <Link key={company.id} href={`/companies/${company.slug}`}>
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm truncate">
                          {company.name}
                        </h3>
                        {company.isVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        )}
                      </div>
                      {company.industry && (
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {company.industry}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {company.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {company.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {company.headquarters && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{company.headquarters}</span>
                      </div>
                    )}
                    {company.companySize && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 shrink-0" />
                        <span>{company.companySize} employees</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
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
  );
}
