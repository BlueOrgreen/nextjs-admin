# 商品模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现商品模块的列表、新增、编辑、删除功能，UI 风格与订单模块不同。

**Architecture:** 目录结构：`_components`（视图）、`_hooks`（数据层）、`_lib`（类型和工具函数）。列表页使用卡片式布局替代表格，侧边栏展示统计信息。新建/编辑使用 shadcn Dialog 组件。

**Tech Stack:** Next.js App Router, React Query, shadcn Dialog/Card/Input/Button/Pagination, sonner toast

---

## 1. API 类型补充（订单模块外部）

### Task 1: 补充 ProductRecord 类型字段

**Files:**
- Modify: `src/lib/api/orderApi.ts:156-165`

- [ ] **Step 1: 添加 category 和 description 字段到 ProductRecord**

```typescript
export type ProductRecord = {
  id: string;
  name: string;
  price: string;
  stock: number;
  category?: string;
  description?: string;
  createdAt: string;
};
```

- [ ] **Step 2: 添加 CreateProductDto 和 UpdateProductDto 的可选字段**

```typescript
export type CreateProductDto = {
  name: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
};

export type UpdateProductDto = {
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  description?: string;
};
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/api/orderApi.ts
git commit -m "feat(products): add category and description fields to ProductRecord"
```

---

## 2. 类型和工具函数

### Task 2: 创建商品模块类型和工具函数

**Files:**
- Create: `src/app/(main)/products/_lib/products-list.types.ts`
- Create: `src/app/(main)/products/_lib/products-list.utils.ts`

- [ ] **Step 1: 创建 products-list.types.ts**

```typescript
import type { ProductRecord } from "@/lib/api/productApi";

export type ProductViewModel = ProductRecord & {
  amountValue: number;
  createdAtLabel: string;
  displayCategory: string;
  displayDescription: string;
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
```

- [ ] **Step 2: 创建 products-list.utils.ts**

```typescript
import dayjs from "dayjs";
import type { ProductRecord } from "@/lib/api/productApi";
import type { ProductViewModel, ProductsListData } from "./products-list.types";

export const PRODUCTS_PAGE_SIZE = 10;

function toSafeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDate(value: string) {
  return dayjs(value).isValid() ? dayjs(value).format("YYYY-MM-DD HH:mm") : value;
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function mapProductToViewModel(product: ProductRecord): ProductViewModel {
  return {
    ...product,
    amountValue: toSafeNumber(product.price),
    createdAtLabel: formatDate(product.createdAt),
    displayCategory: product.category || "无分类",
    displayDescription: product.description || "无描述",
  };
}

export function toProductsListData(response: { data: { data: ProductRecord[]; meta: ProductsListData["meta"] }; code: number; message: string }): ProductsListData {
  const payload = response.data as { data: ProductRecord[]; meta: ProductsListData["meta"] };
  return {
    code: response.code,
    message: response.message,
    products: (payload.data ?? []).map(mapProductToViewModel),
    meta: payload.meta ?? { total: 0, page: 1, pageSize: PRODUCTS_PAGE_SIZE, totalPages: 1 },
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/products/_lib/products-list.types.ts src/app/\(main\)/products/_lib/products-list.utils.ts
git commit -m "feat(products): add types and utils for products module"
```

---

## 3. Hooks

### Task 3: 创建商品模块 hooks

**Files:**
- Create: `src/app/(main)/products/_hooks/use-products-query.ts`
- Create: `src/app/(main)/products/_hooks/use-product-mutations.ts`

- [ ] **Step 1: 创建 use-products-query.ts**

```typescript
"use client";

import { getProducts } from "@/lib/api/productApi";
import { useQuery } from "@tanstack/react-query";
import { toProductsListData } from "../_lib/products-list.utils";

export function useProductsQuery(page = 1) {
  return useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts({ params: { page: String(page) } }),
    select: (response) => toProductsListData(response.data as never),
  });
}
```

- [ ] **Step 2: 创建 use-product-mutations.ts**

```typescript
"use client";

import { createProducts, deleteProductsById, updateProductsById } from "@/lib/api/productApi";
import type { CreateProductDto, UpdateProductDto } from "@/lib/api/productApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) => createProducts(data),
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

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/products/_hooks/use-products-query.ts src/app/\(main\)/products/_hooks/use-product-mutations.ts
git commit -m "feat(products): add React Query hooks for products module"
```

---

## 4. 新建商品弹窗组件

### Task 4: 创建新建商品弹窗

**Files:**
- Create: `src/app/(main)/products/_components/create-product-dialog.tsx`

- [ ] **Step 1: 创建 create-product-dialog.tsx**

```typescript
"use client";

import { Button } from "@/components/ui-elements/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/elements/input"; // 需要创建
import type { CreateProductDto } from "@/lib/api/productApi";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateProductMutation } from "../_hooks/use-product-mutations";

const inputClassName = "h-11 w-full rounded-xl border border-stroke bg-gray-1 px-4 text-sm text-dark outline-none transition-colors placeholder:text-dark-5 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6";

type CreateProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY_FORM: CreateProductDto = {
  name: "",
  price: 0,
  stock: 0,
  category: "",
  description: "",
};

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const [form, setForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const createProduct = useCreateProductMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("请填写商品名称");
      return;
    }
    if (form.price <= 0) {
      setFormError("价格必须大于 0");
      return;
    }
    if (form.stock < 0) {
      setFormError("库存不能为负数");
      return;
    }

    try {
      await createProduct.mutateAsync(form);
      toast.success("商品创建成功");
      onOpenChange(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "创建失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[18px]">
        <DialogHeader>
          <DialogTitle>新建商品</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-dark-4">商品名称 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="输入商品名称"
              className={inputClassName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-dark-4">分类</label>
              <input
                value={form.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="可选"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-dark-4">价格 *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="0.00"
                className={inputClassName}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-dark-4">库存 *</label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              placeholder="0"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-dark-4">描述</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="可选"
              rows={3}
              className={cn(inputClassName, "h-auto py-3")}
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" variant="primary" loading={createProduct.isPending}>创建商品</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(main\)/products/_components/create-product-dialog.tsx
git commit -m "feat(products): add create product dialog"
```

---

## 5. 编辑商品弹窗组件

### Task 5: 创建编辑商品弹窗

**Files:**
- Create: `src/app/(main)/products/_components/edit-product-dialog.tsx`

- [ ] **Step 1: 创建 edit-product-dialog.tsx**

```typescript
"use client";

import { Button } from "@/components/ui-elements/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { ProductViewModel } from "../_lib/products-list.types";
import type { UpdateProductDto } from "@/lib/api/productApi";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateProductMutation } from "../_hooks/use-product-mutations";

const inputClassName = "h-11 w-full rounded-xl border border-stroke bg-gray-1 px-4 text-sm text-dark outline-none transition-colors placeholder:text-dark-5 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6";

type EditProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductViewModel | null;
};

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const [form, setForm] = useState<UpdateProductDto>({});
  const [formError, setFormError] = useState<string | null>(null);
  const updateProduct = useUpdateProductMutation();

  // 当弹窗打开或 product 变化时，重置表单
  useState(() => {
    if (open && product) {
      setForm({
        name: product.name,
        category: product.category,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!product) return;
    if (form.price !== undefined && form.price <= 0) {
      setFormError("价格必须大于 0");
      return;
    }
    if (form.stock !== undefined && form.stock < 0) {
      setFormError("库存不能为负数");
      return;
    }

    try {
      await updateProduct.mutateAsync({ id: product.id, data: form });
      toast.success("商品修改成功");
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "修改失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[18px]">
        <DialogHeader>
          <DialogTitle>编辑商品</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-dark-4">商品名称</label>
            <input
              value={form.name ?? product?.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-dark-4">分类</label>
              <input
                value={form.category ?? product?.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-dark-4">价格</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price ?? product?.price ?? 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={inputClassName}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-dark-4">库存</label>
            <input
              type="number"
              min={0}
              value={form.stock ?? product?.stock ?? 0}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-dark-4">描述</label>
            <textarea
              value={form.description ?? product?.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={cn(inputClassName, "h-auto py-3")}
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" variant="primary" loading={updateProduct.isPending}>保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(main\)/products/_components/edit-product-dialog.tsx
git commit -m "feat(products): add edit product dialog"
```

---

## 6. 商品列表页主视图

### Task 6: 创建商品列表主视图

**Files:**
- Create: `src/app/(main)/products/_components/products-list-view.tsx`

- [ ] **Step 1: 创建 products-list-view.tsx（卡片式布局）**

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // 需要创建
import { Button } from "@/components/ui-elements/button";
import { useProductsQuery } from "../_hooks/use-products-query";
import { useDeleteProductMutation } from "../_hooks/use-product-mutations";
import { useRouter } from "next/navigation";
import { CreateProductDialog } from "./create-product-dialog";
import { EditProductDialog } from "./edit-product-dialog";
import { formatAmount } from "../_lib/products-list.utils";

export function ProductsListView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductViewModel | null>(null);
  
  const { data, isPending, isError, error } = useProductsQuery(currentPage);
  const deleteProduct = useDeleteProductMutation();
  const router = useRouter();

  const handleEdit = (product: ProductViewModel) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleDelete = async (product: ProductViewModel) => {
    if (!window.confirm("确认删除该商品？此操作不可恢复。")) return;
    try {
      await deleteProduct.mutateAsync({ id: product.id });
      toast.success("商品删除成功");
      router.refresh();
    } catch (err) {
      toast.error("删除商品失败，请稍后重试");
    }
  };

  const stats = {
    total: data?.products.length ?? 0,
    lowStock: data?.products.filter(p => p.stock > 0 && p.stock < 20).length ?? 0,
    outOfStock: data?.products.filter(p => p.stock === 0).length ?? 0,
  };

  if (isPending) return <ProductsSkeleton />;
  if (isError) return <div className="text-red-500">加载失败: {error.message}</div>;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
      {/* 商品列表 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">商品列表</h2>
          <Button onClick={() => setIsCreateOpen(true)}>+ 新建商品</Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.products.map(product => (
            <Card key={product.id} className="p-4">
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
                <p className="text-sm text-dark-5">{product.displayCategory}</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-5">价格</span>
                    <span className="font-medium">¥{formatAmount(product.amountValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-5">库存</span>
                    <span className={product.stock === 0 ? "text-red-500" : product.stock < 20 ? "text-orange-500" : ""}>
                      {product.stock}
                    </span>
                  </div>
                  <p className="text-xs text-dark-5">{product.displayDescription}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="small" variant="outline" onClick={() => handleEdit(product)}>编辑</Button>
                  <Button size="small" variant="destructive" onClick={() => handleDelete(product)}>删除</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 分页 */}
        <Pagination>
          <PaginationContent>
            <PaginationPrev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
            {/* 分页逻辑 */}
            <PaginationNext onClick={() => setCurrentPage(p => p + 1)} />
          </PaginationContent>
        </Pagination>
      </div>

      {/* 侧边栏统计 */}
      <aside className="space-y-4">
        <Card>
          <CardHeader><CardTitle>商品统计</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dark-5">总商品数</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-5">低库存</span>
              <span className="font-medium text-orange-500">{stats.lowStock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-5">缺货</span>
              <span className="font-medium text-red-500">{stats.outOfStock}</span>
            </div>
          </CardContent>
        </Card>
      </aside>

      <CreateProductDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditProductDialog open={isEditOpen} onOpenChange={setIsEditOpen} product={selectedProduct} />
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(main\)/products/_components/products-list-view.tsx
git commit -m "feat(products): add products list view with card layout"
```

---

## 7. shadcn Dialog 和 Card 组件

### Task 7: 补充 shadcn 组件

需要确认 shadcn Dialog、Card 组件是否存在，如不存在需要安装：

- [ ] **Step 1: 安装 shadcn Dialog 和 Card**

```bash
npx shadcn@latest add dialog card
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/dialog.tsx src/components/ui/card.tsx
git commit -m "feat(products): add shadcn dialog and card components"
```

---

## 8. 路由入口

### Task 8: 更新商品路由入口

**Files:**
- Modify: `src/app/(main)/products/page.tsx`

- [ ] **Step 1: 更新 products/page.tsx**

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

- [ ] **Step 2: Commit**

```bash
git add src/app/\(main\)/products/page.tsx
git commit -m "feat(products): update products page entry"
```

---

## 任务清单

| # | 任务 | 状态 |
|---|------|------|
| 1 | 补充 ProductRecord 类型字段 | - [ ] |
| 2 | 创建商品模块类型和工具函数 | - [ ] |
| 3 | 创建商品模块 hooks | - [ ] |
| 4 | 创建新建商品弹窗 | - [ ] |
| 5 | 创建编辑商品弹窗 | - [ ] |
| 6 | 创建商品列表主视图 | - [ ] |
| 7 | 补充 shadcn 组件 | - [ ] |
| 8 | 更新商品路由入口 | - [ ] |