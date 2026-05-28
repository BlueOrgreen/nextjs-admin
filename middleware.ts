import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./src/lib/auth/client-cookies";

// Routes to skip (static assets, API routes, etc.)
const PUBLIC_PATHS = ["/_next", "/api", "/favicon.ico", "/images"];

function decodeJwtPayload(token: string): null | { exp?: number } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenLikelyValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true; // no exp claim, treat as present
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Auth routes: allow access, but redirect if already logged in
  if (pathname.startsWith("/auth")) {
    if (token && isTokenLikelyValid(token)) {
      // Already logged in, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: require valid token
  if (!token) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isTokenLikelyValid(token)) {
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