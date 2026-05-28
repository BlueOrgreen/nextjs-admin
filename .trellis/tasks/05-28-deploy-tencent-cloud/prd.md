# 前端部署到腾讯云（chenchar.com）

## Goal

在腾讯云**轻量应用服务器**上，与后端 `my-firstnest` 同机部署：管理后台通过 **www.admin.chenchar.com** 访问，API 通过 **api.chenchar.com** 访问（网关统一入口）。

## What I already know

* 域名：**chenchar.com**（腾讯云 DNSPod）
* **前端子域名**：`www.admin.chenchar.com`（用户指定；注意与后端仓库现有 `admin.chenchar.com` 配置需对齐）
* **API 子域名**：`api.chenchar.com` → 网关 `gateway:3010`
* **部署形态**：轻量应用服务器 + Docker Compose + Nginx + HTTPS
* **后端项目路径（本机）**：`/Users/heytea/Desktop/yunfan/my-firstnest`
* **前端项目（本仓库）**：`web-nest`，已有 `Dockerfile` + `output: 'standalone'`

### 后端仓库已有能力（`my-firstnest`）

* `docker-compose.yml`：nginx、mysql、gateway、user-service、order-service、web-nest
* `nginx/conf.d/api.chenchar.com.conf` → 反代 `gateway:3010`
* `nginx/conf.d/admin.chenchar.com.conf` → 反代 `web-nest:3000`（当前 `server_name` 为 **admin.chenchar.com**，无 `www`）
* 网关默认端口 **3010**，CORS 目前仅放行 localhost（生产需加入 `https://www.admin.chenchar.com`）
* `docker-compose` 中 `web-nest.build.context` 仍指向旧路径，部署前需改为 `web-nest` 实际路径或通过 CI 构建镜像

## Decision (ADR-lite)

**Context**：单机 Lighthouse，前后端同栈，域名已规划。

**Decision**：

* 采用 **Approach A**：轻量服务器 + **my-firstnest 根目录 `docker-compose`** 统一编排（非 TKE）
* 浏览器侧所有 `NEXT_PUBLIC_*` 统一指向 **`https://api.chenchar.com`**（经网关，不直连 order/user 微服务端口）
* TLS 在宿主机 Nginx 终止（443），HTTP 80 可跳转 HTTPS
* DNS：`www.admin.chenchar.com` 与 `api.chenchar.com` → 轻量服务器公网 IP（A 记录）

**Consequences**：

* 需同时调整 `my-firstnest`（nginx、CORS、compose 路径）与 `web-nest`（生产 env、构建参数）
* `www.admin` 为三级域名，DNS 与 Nginx `server_name` 必须一致

## Requirements

* 轻量服务器安装 Docker / Docker Compose
* 修正 `my-firstnest/docker-compose.yml` 中 `web-nest` 构建上下文与生产环境变量
* Nginx：`www.admin.chenchar.com` → `web-nest:3000`；`api.chenchar.com` → `gateway:3010`
* `web-nest` 构建时注入：
  * `NEXT_PUBLIC_API_BASE_URL=https://api.chenchar.com`
  * `NEXT_PUBLIC_ORDER_API_BASE_URL=https://api.chenchar.com`
  * `NEXT_PUBLIC_USER_API_BASE_URL=https://api.chenchar.com`
  * （订单服务若仍单独配置则与网关策略一致）
* Gateway CORS 增加生产前端源
* DNSPod 解析 + SSL 证书（腾讯云免费证书或 Let's Encrypt）
* 部署文档：`docs/deploy/tencent-lighthouse.md`（两仓库操作步骤）

## Acceptance Criteria

* [ ] `https://www.admin.chenchar.com` 可打开登录页及主要业务页
* [ ] `https://api.chenchar.com` 可访问网关 Swagger/健康检查
* [ ] 登录、订单、商品列表在生产环境可正常请求 API（无 CORS / 混合内容错误）
* [ ] `docker compose up -d` 重启后服务自动恢复
* [x] 部署与回滚步骤有文档（`web-nest/docs/deploy/tencent-lighthouse.md`）
* [x] compose / nginx / Dockerfile / CORS 配置已入库

## Definition of Done

* 生产 env 示例、compose/nginx 变更已提交（`web-nest` + 必要时 `my-firstnest` 说明或 PR）
* 在轻量服务器完成至少一次端到端验证

## Out of Scope (MVP)

* GitHub Actions 自动部署（可后续迭代）
* 数据库异地备份策略
* 多机高可用

## Open Questions

* （已解决）轻量服务器：`43.139.140.110`，Ubuntu，待安装 Docker
* （已解决）子域名：**`www.admin.chenchar.com`**（方案 A）
* （已解决）API：**`api.chenchar.com`**，后端仓库 `/Users/heytea/Desktop/yunfan/my-firstnest`

## Technical Notes

### 推荐拓扑

```text
Internet
   │
   ├─ www.admin.chenchar.com ──► Nginx:443 ──► web-nest:3000
   │
   └─ api.chenchar.com       ──► Nginx:443 ──► gateway:3010 ──► user/order services
                                        └──► mysql:3306
```

### 前端构建示例

```bash
docker build -f Dockerfile \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.chenchar.com \
  --build-arg NEXT_PUBLIC_ORDER_API_BASE_URL=https://api.chenchar.com \
  ...
```

### 待改文件（实施阶段）

| 仓库 | 文件 |
|------|------|
| my-firstnest | `docker-compose.yml`, `nginx/conf.d/admin*.conf`, `apps/gateway/src/main.ts` (CORS) |
| web-nest | `Dockerfile` (ARG), `.env.production.example`, `docs/deploy/` |

## Research References

* 后端已有 compose/nginx 草稿，实施以仓库现状为准，无需重复造轮子
