# Commit Record

更新时间：2026-04-27

## 本次提交

- 计划提交信息：`feat: localize dashboard and generate swagger api layer`
- 提交范围：
  - 将后台导航、顶部栏、首页、日历、个人资料页、登录页与面包屑等界面文案翻译为中文
  - 基于真实 Swagger 文档生成前端 API 层代码
  - 新增共享 `axios` client 与 API 生成脚本
  - 修正本地 `.codex/config.toml` 中 `user_api` / `order_api` 的 Swagger 端口映射

## 关键文件

- `src/components/Layouts/sidebar/data/index.ts`
- `src/components/Layouts/header/index.tsx`
- `src/components/Breadcrumbs/Breadcrumb.tsx`
- `src/components/CalenderBox/index.tsx`
- `src/app/(home)/_components/overview-cards/index.tsx`
- `src/app/profile/page.tsx`
- `src/app/auth/sign-in/page.tsx`
- `src/components/Auth/Signin/index.tsx`
- `src/components/Auth/SigninWithPassword.tsx`
- `src/lib/api/http.ts`
- `src/lib/api/userApi.ts`
- `src/lib/api/orderApi.ts`
- `scripts/generate-api-from-swagger.mjs`
- `docs/swagger-api-inventory.md`
- `.codex/config.toml`

## 生成说明

- User Service Swagger 来源：`http://localhost:3001/docs-json`
- Order Service Swagger 来源：`http://localhost:3002/docs-json`
- 所有接口函数、请求参数类型和 DTO 类型都严格来自 Swagger
- 对于 Swagger 未声明响应 schema 的接口，返回类型保守生成为 `unknown`

## 验证记录

- 已执行：`npm run generate:api`
- 已执行：`./node_modules/.bin/tsc --noEmit`
