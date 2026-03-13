import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Security headers applied to every response */
function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  return res;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Apply security headers to all responses
  const next = () => addSecurityHeaders(NextResponse.next());

  if (!path.startsWith("/admin") && !path.startsWith("/seller")) {
    return next();
  }

  // Public seller routes
  if (path === "/seller/login" || path === "/seller/register") {
    return next();
  }

  // Public admin route
  if (path === "/admin/login") {
    return next();
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    const loginUrl = new URL(path.startsWith("/seller") ? "/seller/login" : "/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  let token: { id?: string; role?: string } | null = null;
  try {
    token = await getToken({ req, secret });
  } catch {
    const loginUrl = new URL(path.startsWith("/seller") ? "/seller/login" : "/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (!token) {
    const loginUrl = new URL(path.startsWith("/seller") ? "/seller/login" : "/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (path.startsWith("/seller") && token.role !== "seller") {
    const loginUrl = new URL("/seller/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (path.startsWith("/admin") && token.role !== "admin") {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
