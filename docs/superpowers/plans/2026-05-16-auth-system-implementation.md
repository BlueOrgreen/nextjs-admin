# 登录认证系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的登录认证系统：登录页、Cookie 存储、Middleware 路由保护、AuthContext 状态管理、退出登录

**Architecture:** 使用 httpOnly Cookie 存储 JWT，Next.js Middleware 拦截非 /auth/* 路由验证 Cookie，React Context 管理用户登录状态

**Tech Stack:** jose（JWT 验证）、React Context、Next.js Middleware、httpOnly Cookie

---

## 文件结构

```
src/
├── lib/auth/
│   ├── cookies.ts          # Cookie 工具函数（get/set/delete）
│   ├── auth.ts             # 登录 API 调用
│   └── jwt.ts              # JWT 解码工具
├── contexts/
│   └── auth-context.tsx    # AuthContext（user + login/logout）
├── middleware.ts           # 路由保护 Middleware
└── app/
    ├── providers.tsx       # 挂载 AuthProvider
    └── (auth)/
        └── layout.tsx      # Auth 路由 Layout（无 Sidebar/Header）

src/components/Layouts/header/user-info/
└── index.tsx               # 对接 AuthContext，退出登录
```

---

## Task 1: Cookie 工具函数

**Files:**
- Create: `src/lib/auth/cookies.ts`

- [ ] **Step 1: 创建 Cookie 工具文件**

```typescript
// src/lib/auth/cookies.ts
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "access_token";

export function getAuthCookie(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function setAuthCookie(
  token: string,
  remember: boolean,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined, // 7天 或 Session
    secure: process.env.NODE_ENV === "production",
  });
}

export async function deleteAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/auth/cookies.ts
git commit -m "feat(auth): add cookie utility functions"
```

---

## Task 2: JWT 解码工具

**Files:**
- Create: `src/lib/auth/jwt.ts`

- [ ] **Step 1: 创建 JWT 解码工具**

```typescript
// src/lib/auth/jwt.ts
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "my-firstnest-secret-2026",
);

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function decodeJWTWithoutVerify(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload as JWTPayload;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: 检查 jose 是否安装，未安装则安装**

```bash
npm list jose 2>/dev/null || npm install jose
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/auth/jwt.ts
git commit -m "feat(auth): add JWT decode utility with jose"
```

---

## Task 3: 登录 API 封装

**Files:**
- Create: `src/lib/auth/auth.ts`

- [ ] **Step 1: 创建登录 API 封装**

```typescript
// src/lib/auth/auth.ts
import type { ApiEnvelope } from "@/lib/api/http";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3010";

interface LoginResponse {
  access_token: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export async function login(
  data: LoginDto,
): Promise<ApiEnvelope<LoginResponse>> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/auth/auth.ts
git commit -m "feat(auth): add login API call wrapper"
```

---

## Task 4: AuthContext

**Files:**
- Create: `src/contexts/auth-context.tsx`

- [ ] **Step 1: 创建 AuthContext**

```typescript
// src/contexts/auth-context.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { login as loginApi } from "@/lib/auth/auth";
import {
  AUTH_COOKIE_NAME,
  deleteAuthCookie,
  setAuthCookie,
} from "@/lib/auth/cookies";
import { decodeJWTWithoutVerify } from "@/lib/auth/jwt";
import { useRouter } from "next/navigation";

export interface User {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化：从 cookie 恢复用户状态
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.split("=")[1];

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
    async (
      email: string,
      password: string,
      remember: boolean,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await loginApi({ email, password });

        if (response.code !== 0 || !response.data?.access_token) {
          return { success: false, error: response.message ?? "登录失败" };
        }

        // 写 cookie（Server Action）
        await setAuthCookie(response.data.access_token, remember);

        // 解析 token 获取用户信息并更新状态
        const payload = decodeJWTWithoutVerify(response.data.access_token);
        if (payload) {
          setUser({
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
          });
        }

        router.push("/");
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "网络错误",
        };
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await deleteAuthCookie();
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/contexts/auth-context.tsx
git commit -m "feat(auth): add AuthContext with login/logout"
```

---

## Task 5: Middleware 路由保护

**Files:**
- Create: `middleware.ts`（项目根目录）

- [ ] **Step 1: 创建 Middleware**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyJWT } from "@/lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /auth/* 路径公开访问
  if (pathname.startsWith("/auth")) {
    // 已登录用户访问 /auth/sign-in → 跳转到首页
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // 其他路径检查登录状态
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/auth/sign-in", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    const loginUrl = new URL("/auth/sign-in", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
```

- [ ] **Step 2: 提交**

```bash
git add middleware.ts
git commit -m "feat(auth): add middleware for route protection"
```

---

## Task 6: 更新 Providers

**Files:**
- Modify: `src/app/providers.tsx`

- [ ] **Step 1: 读取并更新 providers.tsx**

```typescript
// 在现有 providers 中添加 AuthProvider
import { AuthProvider } from "@/contexts/auth-context";

// 包裹在 ThemeProvider 内部或作为同级 provider
<AuthProvider>
  {/* existing providers */}
</AuthProvider>
```

- [ ] **Step 2: 提交**

```bash
git add src/app/providers.tsx
git commit -m "feat(auth): mount AuthProvider in app providers"
```

---

## Task 7: Auth 路由 Layout

**Files:**
- Create: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: 创建 Auth Layout（无 Sidebar/Header）**

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 检查 /auth/sign-in 路由结构**

当前页面：`src/app/auth/sign-in/page.tsx`
路由组 `(auth)` 需要将 `src/app/auth/` 重命名为 `src/app/(auth)/auth/`

- [ ] **Step 3: 提交**

```bash
git add src/app/\(auth\)/layout.tsx
git commit -m "feat(auth): add auth route group layout without sidebar/header"
```

---

## Task 8: 更新 UserInfo 组件

**Files:**
- Modify: `src/components/Layouts/header/user-info/index.tsx`

- [ ] **Step 1: 更新 UserInfo 对接 AuthContext**

```typescript
// 移除硬编码 USER，改为 useAuth()
import { useAuth } from "@/contexts/auth-context";

// 在组件内：
const { user, logout } = useAuth();

// 替换硬编码的 USER.name, USER.email, USER.img
// img 暂时使用默认头像 /images/user/user-03.png

// 退出按钮 onClick:
onClick={() => {
  logout();
  setIsOpen(false);
}}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/Layouts/header/user-info/index.tsx
git commit -m "feat(auth): connect UserInfo logout to AuthContext"
```

---

## Task 9: 更新 SigninWithPassword

**Files:**
- Modify: `src/components/Auth/SigninWithPassword.tsx`

- [ ] **Step 1: 替换模拟登录为真实 API 调用**

```typescript
import { useAuth } from "@/contexts/auth-context";

// 在组件内：
const { login } = useAuth();
const [error, setError] = useState<string | null>(null);

// handleSubmit 改为：
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const result = await login(data.email, data.password, data.remember);

  if (!result.success) {
    setError(result.error ?? "登录失败");
  }
  setLoading(false);
};
```

- [ ] **Step 2: 显示错误信息**

在表单中添加 error 显示逻辑

- [ ] **Step 3: 提交**

```bash
git add src/components/Auth/SigninWithPassword.tsx
git commit -m "feat(auth): connect SigninWithPassword to login API"
```

---

## Task 10: 验证与测试

- [ ] **Step 1: TypeScript 编译检查**

```bash
npx tsc --noEmit 2>&1 | grep -v "sidebar"
```

Expected: 无订单模块相关错误

- [ ] **Step 2: 开发服务器测试**

```bash
npm run dev
# 访问 /auth/sign-in 测试登录
# 访问 /orders 测试未登录重定向
# 测试退出登录
```

---

## 执行方式选择

**1. Subagent-Driven（推荐）** - 我 dispatch 独立 subagent 逐个任务执行，每步审核，快速迭代

**2. Inline Execution** - 在当前 session 内批量执行，带检查点

选择哪种方式？