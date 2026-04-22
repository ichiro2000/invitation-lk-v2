import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import {
  twoFactorCookieName,
  verifyTwoFactorCookieValue,
} from "@/lib/twofactor-cookie";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Suspended users: admins can still reach /admin (nonsense case — admins
  // can't suspend themselves), everyone else is forced to /suspended.
  if (token.suspended && token.role !== "ADMIN") {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }
    if (request.nextUrl.pathname !== "/suspended") {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith("/api/admin") && token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (request.nextUrl.pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2FA challenge gate for admins who have enrolled. The /api/admin/2fa/*
  // endpoints must remain reachable without the already-passed cookie so the
  // admin can run setup/enable/verify. /2fa-challenge is top-level (outside
  // the admin layout) and handled by its own matcher entry below.
  const path = request.nextUrl.pathname;
  const isAdminRoute =
    token.role === "ADMIN" &&
    (path.startsWith("/admin") || path.startsWith("/api/admin"));
  const isChallengeExempt = path.startsWith("/api/admin/2fa/");
  if (token.twoFactorEnabled && isAdminRoute && !isChallengeExempt) {
    const secret = process.env.NEXTAUTH_SECRET ?? "";
    const cookie = request.cookies.get(twoFactorCookieName())?.value;
    const cookieOk = await verifyTwoFactorCookieValue(cookie, secret);
    if (!cookieOk) {
      if (path.startsWith("/api/admin")) {
        return NextResponse.json(
          { error: "Two-factor authentication required" },
          { status: 401 }
        );
      }
      const url = new URL("/2fa-challenge", request.url);
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  // Someone arriving at /2fa-challenge without 2FA enabled, or already past
  // the gate, should go straight to /admin (or whatever `next` says).
  if (path === "/2fa-challenge" && token.role === "ADMIN") {
    const secret = process.env.NEXTAUTH_SECRET ?? "";
    const cookie = request.cookies.get(twoFactorCookieName())?.value;
    const cookieOk = await verifyTwoFactorCookieValue(cookie, secret);
    if (!token.twoFactorEnabled || cookieOk) {
      const next = request.nextUrl.searchParams.get("next") || "/admin";
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/suspended",
    "/2fa-challenge",
  ],
};
