"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, type User } from "@/contexts/auth-context";
import type { CreateOrderDto } from "@/lib/api/orderApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateOrderMutation } from "../_hooks/use-order-mutations";
import { useProductsQuery } from "../_hooks/use-products-query";

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

export function CreateOrderDialog({
  open,
  onOpenChange,
}: CreateOrderDialogProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<CreateOrderDto>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const productsQuery = useProductsQuery(open);
  const createOrder = useCreateOrderMutation();

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setFormError(null);
      return;
    }
    if (user) {
      setForm((current) => ({ ...current, userId: user.userId }));
    }
  }, [open, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.productId) {
      setFormError("请选择商品");
      return;
    }

    if (!Number.isFinite(form.quantity) || form.quantity < 1) {
      setFormError("数量至少为 1");
      return;
    }

    if (!user?.userId) {
      setFormError("未获取到当前用户信息，请重新登录");
      return;
    }

    try {
      await createOrder.mutateAsync({
        userId: (user as User).userId.trim(),
        productId: form.productId,
        quantity: form.quantity,
        description: form.description?.trim() || undefined,
      });
      toast.success("订单创建成功");
      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "创建订单失败，请稍后重试",
      );
    }
  };

  const productPlaceholder = productsQuery.isPending
    ? "加载商品中..."
    : productsQuery.isError
      ? "商品加载失败"
      : "选择商品";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>新建订单</DialogTitle>
          <DialogDescription>
            为当前登录用户创建订单，提交后将自动扣减商品库存。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="order-user">用户</Label>
              <Input
                id="order-user"
                value={user?.name ?? ""}
                disabled
                placeholder="当前登录用户"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order-product">商品</Label>
              <Select
                modal={false}
                value={form.productId || null}
                onValueChange={(productId) =>
                  setForm((current) => ({
                    ...current,
                    productId: productId ?? "",
                  }))
                }
                disabled={productsQuery.isPending || productsQuery.isError}
              >
                <SelectTrigger id="order-product" className="w-full">
                  <SelectValue placeholder={productPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {(productsQuery.data ?? []).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}（库存 {product.stock}，¥{product.price}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order-quantity">数量</Label>
              <Input
                id="order-quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    quantity: Number(event.target.value),
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order-description">备注（可选）</Label>
              <Textarea
                id="order-description"
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="订单备注"
                rows={3}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
