import { NextRequest, NextResponse } from "next/server";
import authService from "@/lib/auth_service";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await authService.getMiddlewareSession(req, res);
  const { user } = session;
  const { pathname } = req.nextUrl;

  // Public routes that do not require authentication
  const publicRoutes = [
    "/",
    "/auth/sign_in",
    "/auth/sign_up",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/health",
  ];

  const isPublicRoute = publicRoutes.includes(pathname);

  if (user) {
    // If the user is logged in and tries to access a public page (like signin),
    // redirect them to the dashboard.
    if (isPublicRoute && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/notes", req.url));
    }
    // If they try to access a public API route (login/signup), return an error.
    if (pathname === "/api/auth/login" || pathname === "/api/auth/signup") {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Already authenticated" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } else {
    // If the user is not logged in and the route is not public, block access.
    if (!isPublicRoute) {
      if (pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL("/auth/sign_in", req.url));
    }
  }

  return res;
}

export const config = {
  runtime: "nodejs",
  matcher: [
    // Match all routes except for static assets and image optimization files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
