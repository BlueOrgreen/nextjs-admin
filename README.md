# web-nest — 全栈管理后台前端

基于 **Next.js 16** 的管理端 Web 应用，与后端 Monorepo [`my-firstnest`](../my-firstnest) 配套使用：网关统一鉴权，前端负责登录、仪表盘、商品、订单等业务页面展示与交互。

| 环境 | 地址 |
|------|------|
| 管理端（生产） | https://www.admin.chenchar.com |
| API 网关（生产） | https://api.chenchar.com |
| 本地开发 | http://localhost:3000 |

---

## 项目定位

`web-nest` 是整套全栈方案中的 **B 端管理界面**，不直接连接 MySQL，所有业务数据通过 **HTTP API** 访问后端网关，由网关转发至 `user-service` / `order-service`。

典型能力包括：

- 邮箱密码登录（JWT）
- 路由级鉴权（未登录跳转登录页）
- 首页仪表盘（概览、图表、渠道数据）
- 商品管理、订单列表与详情
- 个人资料、通知、侧边栏导航等

后端架构、微服务拆分与部署说明见仓库 [`my-firstnest`](../my-firstnest)。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| UI | React 19、Tailwind CSS、shadcn/ui |
| 请求 | Axios、TanStack React Query |
| 图表 | ApexCharts、ECharts |
| 认证 | Cookie + Middleware；API 使用 Bearer JWT |
| 语言 | TypeScript |
| 部署 | Docker standalone（由 `my-firstnest/docker-compose` 构建） |

---

## 目录结构（节选）

```text
src/
├── app/
│   ├── (auth)/auth/sign-in/     # 登录页
│   ├── (main)/                    # 需登录的后台布局
│   │   ├── (home)/                # 仪表盘
│   │   ├── products/              # 商品
│   │   ├── orders/                # 订单
│   │   └── profile/               # 个人资料
│   └── api/auth/session/          # 写入登录 Cookie（Route Handler）
├── components/                    # 布局、表单、表格、图表等
├── contexts/auth-context.tsx      # 登录态与用户信息
├── lib/
│   ├── auth/                      # JWT、Cookie、登录跳转
│   └── api/                       # Axios 封装与业务 API
└── middleware.ts                  # 路由守卫
```

---

## 认证流程

```text
用户提交登录
  → POST {API}/auth/login（网关签发 access_token）
  → POST /api/auth/session（Next 服务端 Set-Cookie）
  → router 跳转首页 /
  → middleware 读取 cookie 校验 token 有效期
  → 业务请求由 Axios 自动附加 Authorization: Bearer <token>
```

要点：

- **页面鉴权**依赖 Cookie（`access_token`），由 `/api/auth/session` 写入，供 Middleware 与部分 Server Component 使用。
- **调用后端 API**使用 Bearer Token，与网关 `JWT_SECRET` 保持一致（生产环境在 compose 中注入 `web-nest` 的 `JWT_SECRET`）。
- 登录成功后若客户端软导航卡住，会使用 **整页跳转兜底**（见 `src/lib/auth/navigate-after-login.ts`）。

---

## 环境变量

本地开发可复制并创建 `.env.local`：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3010
NEXT_PUBLIC_ORDER_API_BASE_URL=http://localhost:3010
NEXT_PUBLIC_ORDER_SERVICE_BASE_URL=http://localhost:3010
NEXT_PUBLIC_USER_API_BASE_URL=http://localhost:3010

# 可选：预填演示账号
NEXT_PUBLIC_DEMO_USER_MAIL=yunfan@example.com
NEXT_PUBLIC_DEMO_USER_PASS=你的密码
```

生产构建时 `NEXT_PUBLIC_*` 会在 **Docker build 阶段**写入客户端 bundle，示例见 `.env.production.example`。

服务端运行时需要（与网关一致）：

```env
JWT_SECRET=my-firstnest-secret-2026
```

---

## 本地开发

**前置条件**：后端 `my-firstnest` 已启动（网关默认 `http://localhost:3010`）。

```bash
npm install
npm run dev
```

浏览器访问：http://localhost:3000

---

## 构建与生产部署

通常不单独部署本仓库，而是作为 `my-firstnest` 的兄弟目录，由根目录 `docker-compose.yml` 构建：

```bash
# 在 my-firstnest 目录
WEB_NEST_PATH=../web-nest docker compose up -d --build web-nest
```

Nginx 将 `www.admin.chenchar.com` 反代至 `web-nest:3000`，API 域名 `api.chenchar.com` 指向网关。

更完整的上线步骤（SSL、双库、数据导入）见 `docs/deploy/tencent-lighthouse.md`。

---

## 主要页面路由

| 路由 | 说明 |
|------|------|
| `/auth/sign-in` | 登录（公开） |
| `/` | 仪表盘 |
| `/products` | 商品管理 |
| `/orders` | 订单列表 |
| `/orders/[id]` | 订单详情 |
| `/profile` | 个人资料 |

---

## 与后端的 API 约定

- 统一响应：`{ code: number, data: T, message: string }`，`code === 0` 表示成功。
- 登录：`POST /auth/login`，body `{ email, password }`。
- 商品 / 订单等：经网关前缀 `/api/products`、`/api/orders` 等转发（详见后端 `proxy-routes.config.ts`）。

---

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run start` | 运行构建产物 |
| `npm run lint` | ESLint |
| `npm run generate:api` | 从 Swagger 生成 API 客户端（可选） |

---

## 相关仓库

- **后端**：[`my-firstnest`](../my-firstnest) — NestJS 网关 + user-service + order-service + Docker / Nginx 编排

---

## License

Private / 按项目实际情况补充许可证说明。
