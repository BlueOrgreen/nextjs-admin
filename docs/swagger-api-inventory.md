# Swagger API Inventory

生成时间：2026-04-27T08:59:00.643Z

说明：当前 `.codex/config.toml` 中的 MCP 端口映射与真实后端服务不一致。此清单基于实际可访问的 Swagger 文档生成：

- user-service: `http://localhost:3001/docs-json`
- order-service: `http://localhost:3002/docs-json`

## User Service API

- `GET /health`: 数据库健康检查
- `GET /users`: 获取所有用户（按创建时间倒序）
- `POST /users`: 创建新用户
- `DELETE /users/{id}`: 删除用户
- `GET /users/{id}`: 根据 UUID 获取单个用户
- `PATCH /users/{id}`: 部分更新用户信息

## Order Service API

- `GET /health`
- `GET /orders`: 获取所有订单（按创建时间倒序）
- `POST /orders`: 创建订单（含事务：扣库存 + 建订单）
- `GET /orders/user/{userId}`: 获取指定用户的所有订单
- `GET /orders/demo/dirty-read`: 【演示】脏读 (Dirty Read)
- `POST /orders/demo/simulate-dirty-write`: 【演示】制造脏写场景（5秒后 ROLLBACK）
- `GET /orders/demo/non-repeatable-read`: 【演示】不可重复读 (Non-repeatable Read)
- `GET /orders/demo/phantom-read`: 【演示】幻读 (Phantom Read)
- `GET /orders/demo/isolation-level`: 【演示】查询当前 MySQL 会话事务隔离级别
- `GET /orders/demo/isolation-level/read`: 【演示】在指定隔离级别下读取商品库存（等待 2 秒）
- `GET /orders/demo/lock/shared`: 【演示】共享锁 FOR SHARE（持锁 2 秒）
- `GET /orders/demo/lock/exclusive`: 【演示】排他锁 FOR UPDATE（持锁 3 秒）
- `POST /orders/demo/lock/deadlock`: 【演示】死锁
- `DELETE /orders/{id}`: 删除订单
- `GET /orders/{id}`: 根据 ID 获取单个订单
- `PATCH /orders/{id}`: 更新订单信息
- `GET /products`
- `POST /products`
- `DELETE /products/{id}`
- `GET /products/{id}`
- `PATCH /products/{id}`
