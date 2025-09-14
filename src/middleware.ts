import { NextRequest, NextResponse } from "next/server";
import authService from "@/lib/auth_service";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await authService.getMiddlewareSession(req, res);
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    if (session.user) {
      // If user is logged in and tries to access login/signup API, forbid it.
      if (pathname === "/api/auth/login" || pathname === "/api/auth/signup") {
        return new NextResponse(
          JSON.stringify({ success: false, error: "Already authenticated" }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // If user is logged in and tries to access a regular auth page, redirect.
      if (!pathname.startsWith("/api/auth")) {
        return NextResponse.redirect(new URL("/notes", req.url));
      }
    }
    // If user is not logged in, allow access to auth pages/apis.
    // Or if user is logged in and accessing a non-login/signup api route like /me or /logout, allow.
    return res;
  }

  // This block handles non-auth pages.
  if (!session.user) {
    // If not logged in, block access.
    if (pathname.startsWith("/api")) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // If user is logged in and accessing a non-auth page, allow it.
  return res;
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/notes",
    "/auth/:path*",
    "/api/auth/:path*",
    "/api/notes/:path*",
    "/api/tenants/:path*",
  ],
};
