"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateOrderDto, OrderStatus, UpdateOrderDto } from "@/lib/api/orderApi";
import { useEffect, useState } from "react";
import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useUpdateOrderMutation,
} from "../_hooks/use-order-mutations";
import { useProductsQuery } from "../_hooks/use-products-query";
import type { OrderViewModel } from "../_lib/orders-list.types";

const inputClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

type CreateOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY_FORM: CreateOrderDto = {
  userId: "",
  productId: "",
  quantity: 1,
  description: "",
};

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const [form, setForm] = useState<CreateOrderDto>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const productsQuery = useProductsQuery(open);
  const createOrder = useCreateOrderMutation();

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.userId.trim()) {
      setFormError("请填写用户 ID");
      return;
    }

    if (!form.productId) {
      setFormError("请选择商品");
      return;
    }

    if (!Number.isFinite(form.quantity) || form.quantity < 1) {
      setFormError("数量至少为 1");
      return;
    }

    try {
      await createOrder.mutateAsync({
        userId: form.userId.trim(),
        productId: form.productId,
        quantity: form.quantity,
        description: form.description?.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "创建订单失败，请稍后重试");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>新建订单</DialogTitle>
          <DialogDescription>
            提交后将通过 gateway 调用 POST /api/orders，并自动扣减商品库存。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="userId" className="text-sm font-medium">
                用户 ID
              </label>
              <input
                id="userId"
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                placeholder="输入用户 UUID"
                className={inputClassName}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="productId" className="text-sm font-medium">
                商品
              </label>
              <select
                id="productId"
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className={inputClassName}
                disabled={productsQuery.isPending || productsQuery.isError}
              >
                <option value="">
                  {productsQuery.isPending
                    ? "加载商品中..."
                    : productsQuery.isError
                      ? "商品加载失败"
                      : "选择商品"}
                </option>
                {(productsQuery.data ?? []).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}（库存 {product.stock}，¥{product.price}）
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                数量
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                }
                className={inputClassName}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                备注（可选）
              </label>
              <textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="订单备注"
                rows={3}
                className={inputClassName}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? "提交中..." : "创建订单"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type EditOrderDialogProps = {
  order: OrderViewModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EMPTY_EDIT_FORM: UpdateOrderDto = {
  status: undefined,
  description: undefined,
};

export function EditOrderDialog({ order, open, onOpenChange }: EditOrderDialogProps) {
  const [form, setForm] = useState<UpdateOrderDto>(EMPTY_EDIT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const updateOrder = useUpdateOrderMutation();

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_EDIT_FORM);
      setFormError(null);
      return;
    }
    if (order) {
      setForm({
        status: order.status,
        description: order.description || "",
      });
    }
  }, [open, order]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order) return;
    setFormError(null);

    try {
      await updateOrder.mutateAsync({
        id: order.id,
        data: {
          status: form.status,
          description: form.description?.trim() || undefined,
        },
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "更新订单失败，请稍后重试");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>编辑订单</DialogTitle>
          <DialogDescription>
            修改订单状态或备注信息
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">订单号：</span>
              <span className="font-mono">{order?.id}</span>
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-status" className="text-sm font-medium">
                订单状态
              </label>
              <select
                id="edit-status"
                value={form.status ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as OrderStatus,
                  }))
                }
                className={inputClassName}
              >
                <option value="pending">待处理</option>
                <option value="paid">已支付</option>
                <option value="shipped">已发货</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                备注
              </label>
              <textarea
                id="edit-description"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="订单备注"
                rows={3}
                className={inputClassName}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={updateOrder.isPending}>
              {updateOrder.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DeleteOrderDialogProps = {
  order: OrderViewModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteOrderDialog({ order, open, onOpenChange }: DeleteOrderDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const deleteOrder = useDeleteOrderMutation();

  const handleDelete = async () => {
    if (!order) return;
    setFormError(null);

    try {
      await deleteOrder.mutateAsync({ id: order.id });
      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "删除订单失败，请稍后重试");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除订单</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除订单 <span className="font-mono">{order?.id}</span> 吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {formError && (
          <p className="text-sm text-destructive px-6">{formError}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteOrder.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteOrder.isPending ? "删除中..." : "删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}