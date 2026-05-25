# 商品模块修改

## API 列表响应

```json
{
  "code": 0,
  "data": {
    "data": [ProductRecord],
    "meta": { "total", "page", "pageSize", "totalPages" }
  },
  "message": "ok"
}
```

## ProductRecord 字段

- `id`, `name`, `price` (string), `stock`, `status` (e.g. `active`)
- `description` (nullable)
- `createdAt`, `updatedAt`, `deletedAt` (nullable)

无 `category` 字段。

## 列表页

- 服务端分页：`page` + `pageSize`（默认 20，与接口一致）
- 展示 meta 分页信息与当前页范围
