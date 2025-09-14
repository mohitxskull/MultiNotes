import { NextRequest, NextResponse } from "next/server";
import authService from "@/lib/auth_service";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await authService.getMiddlewareSession(req, res);
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    if (session.user) {
      return NextResponse.redirect(new URL("/notes", req.url));
    }
    return res;
  }

  if (!session.user) {
    if (pathname.startsWith("/api")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return res;
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/notes",
    "/auth/:path*",
    "/api/notes/:path*",
    "/api/tenants/:path*",
  ],
};
