import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

type SessionBody = {
  access_token?: string;
  remember?: boolean;
};

/** Persist login token in a proper Set-Cookie (middleware can read it on navigation). */
export async function POST(request: Request) {
  let body: SessionBody;
  try {
    body = (await request.json()) as SessionBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const token = body.access_token?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, message: "access_token required" }, { status: 400 });
  }

  const remember = Boolean(body.remember);
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    path: "/",
    sameSite: "lax",
    secure,
    httpOnly: false,
    ...(remember ? { maxAge: SEVEN_DAYS } : {}),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
