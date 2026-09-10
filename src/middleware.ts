import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const CEO_ONLY_PATHS = ["/dashboard/ceo", "/dashboard/users"];
const BOSS_AND_CEO_PATHS = ["/dashboard/boss", "/dashboard/departments"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (!pathname.startsWith("/dashboard") && pathname !== "/") {
    return NextResponse.next();
  }

  // For client-side auth, middleware cannot read localStorage.
  // Role-based page redirects are enforced client-side within each page.
  // This middleware only handles non-dashboard paths that shouldn't exist.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
