# 商品模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现商品模块的列表、新增、编辑、删除功能，与订单模块保持一致的架构和交互模式。

**Architecture:** 采用与订单模块相同的结构：`_components`（视图）、`_hooks`（数据层）、`_lib`（类型和工具函数）。API 层使用已有 `productApi`，补充 category 字段。列表页使用 shadcn Table + 自定义 Dialog 弹窗。

**Tech Stack:** Next.js App Router, React Query, shadcn Table/Pagination/Dialog, sonner toast, 自定义 Dialog 组件

---

## 1. API 类型补充

### 1.1 `ProductRecord` 补充 category字段

**File:** `src/lib/api/orderApi.ts`

```typescript
export type ProductRecord = {
  id: string;
  name: string;
  price: string;
  stock: number;
  category?: string;  // 新增
  description?: string;  // 新增
  createdAt: string;
};
```

### 1.2 `CreateProductDto` 补充可选字段

**File:** `src/lib/api/orderApi.ts`

```typescript
export type CreateProductDto = {
  name: string;
  price: number;
  stock: number;
  category?: string;  // 新增
  description?: string;  // 新增
};
```

### 1.3 `UpdateProductDto` 补充可选字段

```typescript
export type UpdateProductDto = {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;  // 新增
  description?: string;  // 新增
};
```

---

## 2. 目录结构

```
src/app/(main)/products/
  page.tsx                      # Route entry (已有，改造)
  _components/
    products-list-view.tsx       # 列表页主视图（表格 + 侧边栏统计）
    create-product-dialog.tsx    # 新建商品弹窗
    edit-product-dialog.tsx      # 编辑商品弹窗（复用 create 布局）
  _hooks/
    use-products-query.ts        # 商品列表查询（分页 + 筛选）
    use-product-mutations.ts     # Create/Update/Delete mutations
  _lib/
    products-list.types.ts       # 类型定义
    products-list.utils.ts       # 工具函数
    products-list-view-model.ts  # 视图模型映射
```

---

## 3. 类型定义

### 3.1 `products-list.types.ts`

```typescript
import type { ProductRecord } from "@/lib/api/productApi";

export type ProductViewModel = ProductRecord & {
  amountValue: number;  // price 转为 number
  createdAtLabel: string;  // 格式化时间
  displayCategory: string;  // 分类显示（空时显示"无分类"）
  displayDescription: string;  // 描述显示（空时显示"无描述"）
};

export type ProductsListData = {
  code: number;
  message: string;
  products: ProductViewModel[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type StatusFilter = "all" | "low_stock" | "out_of_stock";

export type StatusOption = {
  value: StatusFilter;
  label: string;
};
```

---

## 4. 列表页 `products-list-view.tsx`

### 4.1 布局结构

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb: "商品"                                  │
├─────────────────────────────────────────────────────┤
│  [搜索框]              [+ 新建商品]                   │
├──────────────────────────────────┬──────────────────┤
│  筛选标签: 全部 | 低库存 | 缺货    │  商品统计        │
│                                  │  总数: XX        │
│  ┌────────────────────────────┐  │  低库存: XX      │
│  │ Table                      │  │  缺货: XX        │
│  │ 名称 | 分类 | 价格 | 库存   │  │                 │
│  │ ─────────────────────────  │  │                 │
│  │ 商品1 | 奶茶  | ¥22 | 80   │  │                 │
│  │ 商品2 | 咖啡  | ¥28 | 35   │  │                 │
│  └────────────────────────────┘  │                 │
│                                  │                 │
│  < 1 2 3 ... 5 >                 │                 │
└──────────────────────────────────┴──────────────────┘
```

### 4.2 表格列定义

| 列名 | 字段 | 样式 |
|------|------|------|
| 名称 | name | font-medium |
| 分类 | category | 显示"-"当空 |
| 价格 | price | ¥ + 格式化数字 |
| 库存 | stock | 低于 20 显示红色警告 |
| 操作 | - | 编辑 / 删除按钮 |

### 4.3 侧边栏统计

使用 `dl/dt/dd` 结构：

- 总商品数
- 低库存商品数（stock < 20）
- 缺货商品数（stock === 0）

---

## 5. 新建/编辑商品弹窗

### 5.1 表单字段

| 字段 | 类型 | 验证 | 必填 |
|------|------|------|------|
| 名称 | input | 非空，最大 50 字符 | 是 |
| 分类 | input | 最大 30 字符 | 否 |
| 价格 | number | > 0，最多 2 位小数 | 是 |
| 库存 | number | >= 0，整数 | 是 |
| 描述 | textarea | 最大 200 字符 | 否 |

### 5.2 新建 vs 编辑差异

| 场景 | 标题 | 提交按钮 |
|------|------|----------|
| 新建 | 新建商品 | 创建商品 |
| 编辑 | 编辑商品 | 保存修改 |

编辑时需回填现有数据。

### 5.3 交互反馈

- 提交成功：sonner toast "商品创建成功" / "商品修改成功"
- 提交失败：表单内红色错误提示
- Loading 状态：按钮显示 loading spinner，禁用提交

---

## 6. 删除商品

### 6.1 删除确认

点击删除按钮后，`window.confirm("确认删除该商品？此操作不可恢复。")`。

### 6.2 删除反馈

- 成功：`router.push("/products")` + `router.refresh()` + sonner toast "商品删除成功"
- 失败：sonner toast "删除商品失败，请稍后重试"

---

## 7. Hooks

### 7.1 `use-products-query.ts`

```typescript
"use client";

import { getProducts } from "@/lib/api/productApi";
import { useQuery } from "@tanstack/react-query";
import { mapProductToViewModel, toProductsListData } from "../_lib/products-list.utils";

export function useProductsQuery(params?: { page?: number; keyword?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts({ params }),
    select: (response) => toProductsListData(response.data),
  });
}
```

### 7.2 `use-product-mutations.ts`

```typescript
"use client";

import { createProducts, deleteProductsById, updateProductsById } from "@/lib/api/productApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProducts,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      updateProductsById({ id }, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteProductsById({ id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

---

## 8. `products-list.utils.ts`

### 8.1 工具函数

```typescript
export const PRODUCTS_PAGE_SIZE = 10;

export function mapProductToViewModel(product: ProductRecord): ProductViewModel {
  return {
    ...product,
    amountValue: toSafeNumber(product.price),
    createdAtLabel: formatDate(product.createdAt),
    displayCategory: product.category || "无分类",
    displayDescription: product.description || "无描述",
  };
}

export function toProductsListData(response: GetProductsResponse): ProductsListData {
  const payload = response.data as { data: ProductRecord[]; meta: Meta };
  return {
    code: response.code,
    message: response.message,
    products: (payload.data ?? []).map(mapProductToViewModel),
    meta: payload.meta ?? { total: 0, page: 1, pageSize: 10, totalPages: 1 },
  };
}

export function filterProducts(products: ProductViewModel[], filter: StatusFilter) {
  switch (filter) {
    case "low_stock":
      return products.filter(p => p.stock > 0 && p.stock < 20);
    case "out_of_stock":
      return products.filter(p => p.stock === 0);
    default:
      return products;
  }
}

export function buildProductsPaginationTokens(currentPage: number, totalPages: number): PaginationToken[] {
  // 同 orders-list.utils.ts 的 buildPaginationTokens
}
```

---

## 9. `products/page.tsx`

```typescript
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ProductsListView } from "./_components/products-list-view";

export const metadata: Metadata = {
  title: "商品",
};

export default function Products() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="商品" />
      <ProductsListView />
    </div>
  );
}
```

---

## 10. 依赖关系

```
page.tsx
  └── ProductsListView
        ├── useProductsQuery
        ├── useProductMutations (create/update/delete)
        ├── CreateProductDialog
        ├── EditProductDialog
        └── ProductsSidebar (统计)

products-list.utils.ts
  ├── mapProductToViewModel
  ├── toProductsListData
  ├── filterProducts
  └── buildProductsPaginationTokens

productApi (src/lib/api/productApi.ts)
  ├── getProducts
  ├── getProductsById
  ├── createProducts
  ├── updateProductsById
  └── deleteProductsById
```