# 订单模块

## Goal

在 web-nest 中交付可对接 order-service / gateway 的订单管理模块：列表、创建、详情查看、状态更新与删除，形成完整业务闭环。

## What I already know

- 侧边栏已有「订单管理 → 订单」入口，路由 `/orders`
- `src/lib/api/orderApi.ts` 已从 Swagger 生成，含 CRUD 与商品接口
- 列表页骨架与 `OrdersListView` 已实现（搜索、筛选、分页、摘要侧栏）
- 数据源：`GET /api/orders`（gateway），商品直连 order-service `GET /products`
- 项目使用 React Query + axios，页面按 `_components` / `_hooks` / `_lib` 拆分

## Requirements

### MVP（本任务）

1. **订单列表** `/orders`
   - 展示全部订单，支持关键词搜索、状态筛选、客户端分页
   - 加载中 / 错误 / 空态
   - 「新建订单」入口
   - 行点击或操作列跳转详情

2. **创建订单**
   - 表单字段：userId、productId（下拉，来自商品列表）、quantity、description（可选）
   - 提交调用 `POST /api/orders`，成功后刷新列表并关闭表单

3. **订单详情** `/orders/[id]`
   - 展示订单完整信息
   - 可更新 status、description
   - 可删除订单，成功后返回列表

### Out of Scope

- 商品管理独立 CRUD 页面
- 事务演示接口（dirty-read 等）
- 服务端分页 / 搜索
- 权限与登录鉴权

## Acceptance Criteria

- [x] `/orders` 可加载真实接口数据，筛选与分页正常
- [x] 可从列表打开创建表单并成功创建订单
- [x] `/orders/[id]` 可查看、更新状态、删除订单
- [x] 错误与 loading 态有明确 UI 反馈
- [x] TypeScript 编译无新增错误（订单模块相关文件）

## Technical Notes

- API 客户端：`orderApiClient`（gateway 3010）、`orderServiceApiClient`（3002 商品）
- 参考：`src/app/orders/_components/orders-list-view.tsx`、`docs/swagger-api-inventory.md`
