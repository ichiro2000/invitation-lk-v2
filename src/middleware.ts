import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*", "/suspended"],
};
