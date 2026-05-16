import { cookies } from "next/headers";

// Constants
export const AUTH_COOKIE_NAME = "access_token";

/**
 * Get token from cookies (sync, client-side readable via document.cookie parsing)
 * Returns null if no token found
 */
export function getAuthCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const cookieArr = document.cookie.split("; ");
  for (const cookie of cookieArr) {
    const [name, value] = cookie.split("=");
    if (name === AUTH_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

/**
 * Set token as httpOnly cookie
 * remember=true → 7 days expiry; remember=false → session cookie (no Max-Age)
 */
export async function setAuthCookie(token: string, remember: boolean): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProduction,
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

/**
 * Delete the auth cookie
 */
export async function deleteAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}