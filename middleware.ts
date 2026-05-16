import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./src/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "./src/lib/auth/client-cookies";

// Routes to skip (static assets, API routes, etc.)
const PUBLIC_PATHS = ["/_next", "/api", "/favicon.ico", "/images"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Auth routes: allow access, but redirect if already logged in
  if (pathname.startsWith("/auth")) {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        // Already logged in, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes: require valid token
  if (!token) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - api (API routes)
     * - favicon.ico (favicon)
     * - images (image files)
     */
    "/((?!_next/static|_next/image|api|favicon.ico|images).*)",
  ],
};