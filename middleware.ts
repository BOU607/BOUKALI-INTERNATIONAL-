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
  if (!path.startsWith("/admin")) {
    const res = NextResponse.next();
    return addSecurityHeaders(res);
  }
  if (path === "/admin/login") {
    return addSecurityHeaders(NextResponse.next());
  }

  // Require sign-in for all other /admin routes
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  let token = null;
  try {
    token = await getToken({ req, secret });
  } catch {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
