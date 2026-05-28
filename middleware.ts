import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { isAccessTokenValid } from "@/lib/auth/middleware-auth";

// Routes to skip (static assets, API routes, etc.)
const PUBLIC_PATHS = ["/_next", "/api", "/favicon.ico", "/images"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const tokenOk = token ? isAccessTokenValid(token) : false;

  if (pathname.startsWith("/auth")) {
    if (tokenOk) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!tokenOk) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|images).*)",
  ],
};
