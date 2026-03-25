import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token");
  const adminToken = req.cookies.get("admin_token");
  const isSuspended = req.cookies.get("is_suspended")?.value === "true";

  // If user is suspended, redirect to suspended page (except for suspended page itself and logout)
  if (token && isSuspended && !url.pathname.startsWith("/account-suspended")) {
    url.pathname = "/account-suspended";
    return NextResponse.redirect(url);
  }

  // If suspended user tries to access API (except logout), block them
  if (
    token &&
    isSuspended &&
    url.pathname.startsWith("/api/") &&
    !url.pathname.includes("/logout")
  ) {
    return NextResponse.json(
      { error: "Account suspended", isSuspended: true },
      { status: 403 },
    );
  }

  // Admin routes protection
  if (url.pathname.startsWith("/secure/admin")) {
    // Add noindex headers for all admin pages
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    // If trying to access admin login page while already logged in
    if (adminToken && url.pathname === "/secure/admin") {
      url.pathname = "/secure/admin/dashboard";
      return NextResponse.redirect(url);
    }

    // If not logged in and trying to access admin pages (except login)
    if (!adminToken && url.pathname !== "/secure/admin") {
      url.pathname = "/secure/admin";
      return NextResponse.redirect(url);
    }

    return response;
  }

  // If user is logged in and trying to access landing page, redirect to dashboard
  if (token && url.pathname === "/") {
    url.pathname = "/dashboard/overview";
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access login/signup, redirect to dashboard
  if (token && (url.pathname === "/login" || url.pathname === "/signup")) {
    url.pathname = "/dashboard/overview";
    return NextResponse.redirect(url);
  }

  // If user is NOT logged in and trying to access dashboard, redirect to login
  if (!token && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/pricing",
    "/secure/admin/:path*",
    "/account-suspended",
    "/api/:path*",
  ],
};
