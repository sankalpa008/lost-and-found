import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware for route protection
export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no session and trying to access protected route, redirect to login
  if (!sessionToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If has session and trying to access login/signup, redirect to dashboard
  if (sessionToken && (pathname === "/login" || pathname === "/signup")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - uploads (uploaded images)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|uploads).*)",
  ],
};
