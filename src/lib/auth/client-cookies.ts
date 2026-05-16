"use client";

export const AUTH_COOKIE_NAME = "access_token";

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const cookieArr = document.cookie.split("; ");
  for (const cookie of cookieArr) {
    const [name, ...rest] = cookie.split("=");
    if (name === AUTH_COOKIE_NAME) {
      return rest.join("=") || null;
    }
  }
  return null;
}