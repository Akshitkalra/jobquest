"use client";

import Link from "next/link";
import { Bell, Menu, LogOut, User, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { useUnreadNotificationCount } from "@/hooks/use-api";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  title: string;
  onMobileMenuToggle: () => void;
}

export function DashboardHeader({
  title,
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "";

  const profilePath =
    user?.userType === "COMPANY"
      ? "/company/profile"
      : user?.userType === "ADMIN"
        ? "/admin/settings"
        : "/candidate/profile";

  const dashboardPath =
    user?.userType === "COMPANY"
      ? "/company/dashboard"
      : user?.userType === "ADMIN"
        ? "/admin/dashboard"
        : "/candidate/dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      {/* Page title */}
      <h1 className="text-lg font-semibold truncate">{title}</h1>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href={dashboardPath}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center p-0 text-[10px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">
              Notifications ({unreadCount} unread)
            </span>
          </Link>
        </Button>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* User avatar dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center gap-2 rounded-full pl-2 pr-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block text-sm font-medium">
                  {user.firstName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={profilePath}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
