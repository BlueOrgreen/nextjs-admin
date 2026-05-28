"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { login as authLogin } from "@/lib/auth/auth";
import { getAuthCookie, AUTH_COOKIE_NAME } from "@/lib/auth/client-cookies";
import { decodeJWTWithoutVerify, type JWTPayload } from "@/lib/auth/jwt";

export interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

function parseUserFromToken(payload: JWTPayload): User | null {
  if (!payload.sub) return null;
  return {
    userId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split("@")[0],
    role: payload.role,
  };
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const persistSession = useCallback(async (token: string, remember: boolean) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ access_token: token, remember }),
    });
    if (!res.ok) {
      throw new Error("Failed to persist session cookie");
    }
  }, []);

  useEffect(() => {
    const token = getAuthCookie();
    if (token) {
      const payload = decodeJWTWithoutVerify(token);
      if (payload) {
        const user = parseUserFromToken(payload);
        if (user) setUser(user);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await authLogin({ email, password });
        
        if (response.code !== 0 || !response.data.access_token) {
          return { success: false, error: response.message || "Login failed" };
        }

        try {
          await persistSession(response.data.access_token, remember);
        } catch {
          return { success: false, error: "登录成功但无法保存会话，请刷新后重试" };
        }

        const payload = decodeJWTWithoutVerify(response.data.access_token);
        
        if (payload) {
          const user = parseUserFromToken(payload);
          if (user) setUser(user);
        }

        return { success: true };
      } catch (err) {
        // Axios error: surface backend message if present
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data = err.response?.data as unknown;

          // Common NestJS error shapes:
          // - { message: string | string[]; error: string; statusCode: number }
          // - { code: number; message: string; data?: any } (our ApiEnvelope-like)
          const backendMessage =
            (typeof data === "object" &&
              data !== null &&
              "message" in data &&
              (typeof (data as any).message === "string"
                ? (data as any).message
                : Array.isArray((data as any).message)
                  ? (data as any).message.join(", ")
                  : undefined)) ||
            undefined;

          if (status === 401) {
            return {
              success: false,
              error: backendMessage || "登录失败：账号或密码错误，或数据库尚未初始化。",
            };
          }

          return {
            success: false,
            error: backendMessage || `请求失败：${status ?? "未知状态码"}`,
          };
        }

        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: `请求异常：${message}` };
      }
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
    } catch {
      // ignore
    }
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
    setUser(null);
    router.push("/auth/sign-in");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}