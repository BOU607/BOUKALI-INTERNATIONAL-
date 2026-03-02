import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/admin")) return NextResponse.next();
  if (path === "/admin/login") return NextResponse.next();

  // Require sign-in for all other /admin routes
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  let token = null;
  try {
    token = await getToken({ req, secret });
  } catch {
    // Invalid or missing JWT config → send to login
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
