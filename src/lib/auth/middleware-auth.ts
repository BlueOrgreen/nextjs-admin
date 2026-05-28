import type { JWTPayload } from "@/lib/auth/jwt";

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function decodeJwtPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(decodeBase64Url(parts[1])) as JWTPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.sub) return false;
  if (!payload.exp) return true;
  return payload.exp > Math.floor(Date.now() / 1000);
}
