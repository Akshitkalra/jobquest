"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminUsers } from "@/hooks/use-api";

const userTypeConfig: Record<string, { label: string; className: string }> = {
  CANDIDATE: {
    label: "Candidate",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  COMPANY: {
    label: "Company",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  ADMIN: {
    label: "Admin",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useAdminUsers(
    currentPage,
    pageSize,
    debouncedSearch || undefined,
    typeFilter === "ALL" ? undefined : typeFilter
  );

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage all users registered on the platform.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CANDIDATE">Candidates</SelectItem>
                <SelectItem value="COMPANY">Companies</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No users found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.avatarUrl || undefined}
                              />
                              <AvatarFallback className="text-xs">
                                {user.firstName?.[0] ?? ""}
                                {user.lastName?.[0] ?? ""}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              userTypeConfig[user.userType]?.className
                            }
                          >
                            {userTypeConfig[user.userType]?.label ?? user.userType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className="text-xs"
                              >
                                {role.replace("ROLE_", "")}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Edit Roles
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
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

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to{" "}
                  {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
                  {totalElements} users
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
    </div>
  );
}
