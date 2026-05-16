"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { login as authLogin } from "@/lib/auth/auth";
import { getAuthCookie, AUTH_COOKIE_NAME } from "@/lib/auth/client-cookies";
import { decodeJWTWithoutVerify, type JWTPayload } from "@/lib/auth/jwt";

export interface User {
  userId: string;
  email: string;
  role: string;
}

function parseUserFromToken(payload: JWTPayload): User | null {
  if (!payload.sub) return null;
  return {
    userId: payload.sub,
    email: payload.email,
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
        // console.log("response===yunfna====>", response);
        
        if (response.code !== 0 || !response.data.access_token) {
          return { success: false, error: response.message || "Login failed" };
        }

        // Set cookie via cookie string (client-side)
        const maxAge = remember ? 60 * 60 * 24 * 7 : undefined;
        const expires = remember ? `; expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}` : "";
        document.cookie = `${AUTH_COOKIE_NAME}=${response.data.access_token}; path=/; max-age=${maxAge ?? ""}${expires} SameSite=Lax`;

        const payload = decodeJWTWithoutVerify(response.data.access_token);
        
        if (payload) {
          const user = parseUserFromToken(payload);
          if (user) setUser(user);
        }

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: `Network error: ${message}` };
      }
    },
    [],
  );

  const logout = useCallback(() => {
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