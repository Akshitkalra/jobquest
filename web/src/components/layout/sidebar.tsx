"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Sparkles,
  Settings,
  Building2,
  Briefcase,
  PlusCircle,
  Search,
  Users,
  Shield,
  BarChart3,
  LogOut,
  ChevronLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const candidateNavItems: NavItem[] = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Profile", icon: User },
  { href: "/candidate/applications", label: "Applications", icon: FileText },
  { href: "/candidate/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/candidate/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/candidate/settings", label: "Settings", icon: Settings },
];

const companyNavItems: NavItem[] = [
  { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/company/profile", label: "Company Profile", icon: Building2 },
  { href: "/company/jobs", label: "Manage Jobs", icon: Briefcase },
  { href: "/company/jobs/new", label: "Post New Job", icon: PlusCircle },
  { href: "/company/search-candidates", label: "Search Candidates", icon: Search },
  { href: "/company/settings", label: "Settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function getNavItemsByUserType(
  userType: "CANDIDATE" | "COMPANY" | "ADMIN"
): NavItem[] {
  switch (userType) {
    case "CANDIDATE":
      return candidateNavItems;
    case "COMPANY":
      return companyNavItems;
    case "ADMIN":
      return adminNavItems;
    default:
      return candidateNavItems;
  }
}

function getUserTypeLabel(userType: string): string {
  switch (userType) {
    case "CANDIDATE":
      return "Candidate";
    case "COMPANY":
      return "Company";
    case "ADMIN":
      return "Admin";
    default:
      return userType;
  }
}

function getUserTypeBadgeVariant(
  userType: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (userType) {
    case "ADMIN":
      return "destructive";
    case "COMPANY":
      return "default";
    default:
      return "secondary";
  }
}

interface SidebarContentProps {
  navItems: NavItem[];
  onNavClick?: () => void;
}

function SidebarNavContent({ navItems, onNavClick }: SidebarContentProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">JobPortal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/candidate/dashboard" &&
                item.href !== "/company/dashboard" &&
                item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info & logout */}
      <div className="border-t p-4">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <Badge
                variant={getUserTypeBadgeVariant(user.userType)}
                className="text-[10px] mt-0.5"
              >
                {getUserTypeLabel(user.userType)}
              </Badge>
            </div>
          </div>
        )}
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </div>
  );
}

interface SidebarProps {
  navItems: NavItem[];
}

/** Desktop sidebar - always visible on lg+ screens */
export function Sidebar({ navItems }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 border-r bg-background">
      <SidebarNavContent navItems={navItems} />
    </aside>
  );
}

interface MobileSidebarProps {
  navItems: NavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mobile sidebar - opens as a Sheet on smaller screens */
export function MobileSidebar({
  navItems,
  open,
  onOpenChange,
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarNavContent
          navItems={navItems}
          onNavClick={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
