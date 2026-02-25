"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  CheckCircle2,
  Eye,
  Building2,
  Globe,
  ShieldCheck,
  ShieldX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminCompanies,
  useAdminVerifyCompany,
  useAdminCompany,
  useAdminDeleteCompany,
} from "@/hooks/use-api";

export default function AdminCompaniesPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useAdminCompanies(currentPage, pageSize);
  const verifyCompany = useAdminVerifyCompany();
  const deleteCompany = useAdminDeleteCompany();
  const { data: companyDetail, isLoading: detailLoading } = useAdminCompany(viewingId);

  const companies = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filteredCompanies = companies.filter((company) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "VERIFIED" && company.isVerified) ||
      (activeTab === "UNVERIFIED" && !company.isVerified);
    const matchesSearch =
      !searchQuery ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleVerify = (companyId: string) => {
    verifyCompany.mutate(companyId, {
      onSuccess: () => {
        toast.success("Company verification updated successfully.");
      },
      onError: () => {
        toast.error("Failed to update company verification.");
      },
    });
  };

  const handleDelete = (companyId: string) => {
    deleteCompany.mutate(companyId, {
      onSuccess: () => {
        toast.success("Company and all associated data deleted.");
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Failed to delete company.");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Company Management
        </h2>
        <p className="text-muted-foreground">
          Manage and verify companies registered on the platform.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1"
            >
              <TabsList>
                <TabsTrigger value="ALL">All Companies</TabsTrigger>
                <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
                <TabsTrigger value="UNVERIFIED">Unverified</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
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
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No companies found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-2 shrink-0">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              {company.companySize && (
                                <p className="text-xs text-muted-foreground">
                                  {company.companySize} employees
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {company.industry ? (
                            <Badge variant="outline" className="text-xs">
                              {company.industry}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {company.isVerified ? (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            >
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(company.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem onClick={() => setViewingId(company.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {company.website && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Globe className="mr-2 h-4 w-4" />
                                    Visit Website
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {!company.isVerified ? (
                                <DropdownMenuItem
                                  onClick={() => handleVerify(company.id)}
                                  disabled={verifyCompany.isPending}
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Verify Company
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleVerify(company.id)}
                                  disabled={verifyCompany.isPending}
                                >
                                  <ShieldX className="mr-2 h-4 w-4" />
                                  Remove Verification
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeletingId(company.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Company
                              </DropdownMenuItem>
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
                  {totalElements} companies
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

      {/* Company Detail Sheet */}
      <Sheet open={!!viewingId} onOpenChange={(open) => !open && setViewingId(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Company Details</SheetTitle>
          </SheetHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : companyDetail ? (
            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{companyDetail.name}</h3>
                  {companyDetail.isVerified ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {companyDetail.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{companyDetail.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {companyDetail.industry && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Industry</p>
                    <p className="text-sm">{companyDetail.industry}</p>
                  </div>
                )}
                {companyDetail.companySize && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Company Size</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3.5 w-3.5" />
                      {companyDetail.companySize}
                    </div>
                  </div>
                )}
                {companyDetail.headquarters && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Headquarters</p>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {companyDetail.headquarters}
                    </div>
                  </div>
                )}
                {companyDetail.foundedYear && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Founded</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {companyDetail.foundedYear}
                    </div>
                  </div>
                )}
                {companyDetail.website && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Website</p>
                    <a
                      href={companyDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {companyDetail.website}
                    </a>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                {!companyDetail.isVerified ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleVerify(companyDetail.id);
                      setViewingId(null);
                    }}
                    disabled={verifyCompany.isPending}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleVerify(companyDetail.id);
                      setViewingId(null);
                    }}
                    disabled={verifyCompany.isPending}
                  >
                    <ShieldX className="mr-2 h-4 w-4" />
                    Remove Verification
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setViewingId(null);
                    setDeletingId(companyDetail.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This will permanently
              remove the company and <strong>all its jobs, applications, and
              associated data</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteCompany.isPending}
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              {deleteCompany.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
