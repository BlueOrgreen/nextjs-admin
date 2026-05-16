# 登录认证系统设计文档

## 1. 选型理由

| 决策 | 选择 | 理由 |
|------|------|------|
| Token 存储 | **httpOnly Cookie** | 相比 localStorage，httpOnly Cookie 无法被 JavaScript 读取（XSS 攻击无法获取 token），安全性更高 |
| 路由保护 | **Next.js Middleware** | 在请求层面拦截，未登录用户直接返回 307 重定向，无需等待客户端渲染，避免页面闪烁 |
| 状态管理 | **React Context** | 项目已有 `SidebarProvider`、`ThemeProvider` 等 Context 模式，在此基础上扩展 AuthContext 符合现有架构 |
| "记住我" | **Cookie 过期时间** | 勾选 → 7 天过期；未勾选 → Session Cookie（关闭浏览器即失效） |

## 2. 登录接口

**请求**
```
POST /auth/login
Content-Type: application/json

{ "email": "alice@example.com", "password": "xxx" }
```

**响应（成功）**
```json
{
  "code": 0,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "ok"
}
```

**JWT Payload 结构**（解码后）
```json
{
  "sub": "23a371f0-343e-4ef5-abf9-75f3bc73369e",
  "email": "alice@example.com",
  "role": "user",
  "iat": 1778917799,
  "exp": 1779004199
}
```

## 3. 系统架构

```
用户请求 /orders
       │
       ▼
┌──────────────────────────────────────┐
│           Middleware                  │
│  检查 cookie: access_token           │
│  路径 /auth/* → 通过                 │
│  其他路径无 token → 重定向 /auth/sign-in │
└──────────────────────────────────────┘
       │
       ▼ (有 token)
┌──────────────────────────────────────┐
│         Next.js Page Render          │
└──────────────────────────────────────┘

用户访问 /auth/sign-in 并登录
       │
       ▼
┌──────────────────────────────────────┐
│       SigninWithPassword              │
│  → POST /auth/login                  │
│  → 成功：setCookie(access_token)     │
│  → redirect to /                    │
└──────────────────────────────────────┘
```

## 4. 核心文件

| 文件 | 职责 |
|------|------|
| `middleware.ts` | 路由保护，拦截所有非 `/auth/*` 请求，检查 `access_token` cookie |
| `src/lib/auth/cookies.ts` | Cookie 读写工具函数（getCookie、setCookie、deleteCookie） |
| `src/lib/auth/auth.ts` | 登录 API 调用封装 |
| `src/contexts/auth-context.tsx` | AuthContext（user 对象、login、logout 方法） |
| `src/app/providers.tsx` | 挂载 AuthProvider |
| `src/app/(auth)/layout.tsx` | Auth 路由专属 Layout（不含 Sidebar/Header） |
| `src/components/Layouts/header/user-info/index.tsx` | 对接 AuthContext，退出登录调用 logout |

## 5. Cookie 设计

| 属性 | 值 |
|------|-----|
| Name | `access_token` |
| httpOnly | `true`（禁止 JS 访问） |
| SameSite | `lax` |
| Path | `/` |
| 过期时间（记住我） | 7 天 |
| 过期时间（不记住） | Session（不设置 Max-Age） |
| 签名字段 | `domain` |

## 6. JWT 解密（Middleware）

Middleware 使用与后端相同的 JWT_SECRET (`my-firstnest-secret-2026`) 验证 token：

1. 从 cookie 读取 `access_token`
2. 使用 `jose` 库（轻量、无需额外依赖）验证并解码 JWT
3. 验证通过 → 放行
4. 验证失败或无 token → 重定向 `/auth/sign-in`

> **注意**：验证失败只重定向到登录页，不返回 401，避免暴露接口逻辑。

## 7. 组件设计

### AuthContext

```typescript
interface User {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}
```

### UserInfo 退出登录

```typescript
const { user, logout } = useAuth();

// 退出逻辑：
// 1. 调用 logout() → 清除 access_token cookie
// 2. 重定向到 /auth/sign-in
// 3. 关闭下拉菜单
```

## 8. 页面/路由清单

| 路由 | 说明 | 保护 |
|------|------|------|
| `/auth/sign-in` | 登录页 | 公开（已登录则跳转 `/`） |
| `/auth/sign-up` | 注册页 | 公开（暂留空） |
| `/` | 首页 | 受保护 |
| `/orders` | 订单列表 | 受保护 |
| `/orders/[id]` | 订单详情 | 受保护 |
| `/profile` | 个人资料 | 受保护 |

## 9. 错误处理

| 场景 | 处理 |
|------|------|
| 登录失败（密码错误） | 显示错误提示，不跳转 |
| Token 过期 | Middleware 检测到无效 token → 重定向登录页 |
| 网络错误 | 显示 `network error` 提示 |
| 注销后访问 | Middleware 检测无 cookie → 重定向 `/auth/sign-in` |

## 10. 待后续实现

- [ ] 注册页面和 API（`/auth/sign-up` + `POST /auth/register`）
- [ ] 忘记密码页面和 API
- [ ] 登录页 Google OAuth 按钮逻辑
- [ ] 路由跳转时携带 `redirect` 查询参数（如 `/auth/sign-in?redirect=/orders`）