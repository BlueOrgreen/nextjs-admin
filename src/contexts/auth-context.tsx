"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { login as authLogin } from "@/lib/auth/auth";
import { setAuthCookie, deleteAuthCookie, getAuthCookie } from "@/lib/auth/cookies";
import { decodeJWTWithoutVerify, type JWTPayload } from "@/lib/auth/jwt";

export interface User {
  userId: string;
  email: string;
  role: string;
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

  // Initialize user from cookie on mount
  useEffect(() => {
    const token = getAuthCookie();
    if (token) {
      const payload = decodeJWTWithoutVerify(token);
      if (payload) {
        setUser({
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await authLogin({ email, password });

        if (response.code !== 200 || !response.data.access_token) {
          return { success: false, error: response.message || "Login failed" };
        }

        await setAuthCookie(response.data.access_token, remember);

        const payload = decodeJWTWithoutVerify(response.data.access_token);
        if (payload) {
          setUser({
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
          });
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: "Network error" };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    deleteAuthCookie();
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