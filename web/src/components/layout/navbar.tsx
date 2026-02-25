"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { useUnreadNotificationCount } from "@/hooks/use-api";
import { ThemeToggle } from "@/components/theme-toggle";

const publicNav = [
  { href: "/jobs", label: "Find Jobs", icon: Briefcase },
  { href: "/companies", label: "Companies", icon: Building2 },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: unreadCount } = useUnreadNotificationCount();

  const dashboardPath =
    user?.userType === "COMPANY"
      ? "/company/dashboard"
      : user?.userType === "ADMIN"
        ? "/admin/dashboard"
        : "/candidate/dashboard";

  const profilePath =
    user?.userType === "COMPANY"
      ? "/company/profile"
      : user?.userType === "ADMIN"
        ? "/admin/settings"
        : "/candidate/profile";

  const settingsPath =
    user?.userType === "COMPANY"
      ? "/company/settings"
      : user?.userType === "ADMIN"
        ? "/admin/settings"
        : "/candidate/settings";

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Briefcase className="h-6 w-6 text-primary" />
            <span>JobQuest</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              {/* Notification bell */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href={dashboardPath}>
                  <Bell className="h-5 w-5" />
                  {(unreadCount ?? 0) > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center p-0 text-[10px]"
                    >
                      {(unreadCount ?? 0) > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">
                    Notifications ({unreadCount ?? 0} unread)
                  </span>
                </Link>
              </Button>

              <Separator orientation="vertical" className="h-6 hidden md:block" />

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={dashboardPath}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={profilePath}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={settingsPath}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
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
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {publicNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-lg"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated && user ? (
                  <>
                    <Separator />
                    <Link
                      href={dashboardPath}
                      className="flex items-center gap-2 text-lg"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      href={profilePath}
                      className="flex items-center gap-2 text-lg"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      href={settingsPath}
                      className="flex items-center gap-2 text-lg"
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                    <Separator />
                    <button
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="flex items-center gap-2 text-lg text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      {logoutMutation.isPending ? "Logging out..." : "Log out"}
                    </button>
                  </>
                ) : (
                  <>
                    <Separator />
                    <Link href="/login" className="text-lg">
                      Sign In
                    </Link>
                    <Link href="/register" className="text-lg font-semibold">
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
