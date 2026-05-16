import { jwtVerify, SignJWT } from "jose";

export interface JWTPayload {
  sub: string;      // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Verify JWT with secret (used by Middleware)
// Returns null if invalid/expired
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? "my-firstnest-secret-2026"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Decode JWT without verification (used by AuthContext to extract user info for display)
// Used client-side where we just want to read the payload
export function decodeJWTWithoutVerify(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}