import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/register/candidate",
  "/register/company",
  "/forgot-password",
  "/reset-password",
  "/jobs",
  "/companies",
  "/about",
];

const candidatePaths = ["/candidate"];
const companyPaths = ["/company"];
const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/jobs/") ||
    pathname.startsWith("/companies/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth indicator cookie
  const authStorage = request.cookies.get("auth-indicator");

  if (!authStorage) {
    // Not authenticated, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic role-based route protection
  const userType = request.cookies.get("user-type")?.value;

  // If user-type cookie is missing but auth-indicator exists,
  // let the page load — client-side AuthProvider will handle the refresh
  if (!userType) {
    return NextResponse.next();
  }

  if (candidatePaths.some((p) => pathname.startsWith(p)) && userType !== "CANDIDATE") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (companyPaths.some((p) => pathname.startsWith(p)) && userType !== "COMPANY") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (adminPaths.some((p) => pathname.startsWith(p)) && userType !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
