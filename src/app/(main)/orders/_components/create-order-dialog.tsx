"use client";

import { Button } from "@/components/ui-elements/button";
import type { CreateOrderDto } from "@/lib/api/orderApi";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useCreateOrderMutation } from "../_hooks/use-order-mutations";
import { useProductsQuery } from "../_hooks/use-products-query";

const inputClassName =
  "h-11 w-full rounded-xl border border-stroke bg-gray-1 px-4 text-sm text-dark outline-none transition-colors placeholder:text-dark-5 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6";

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

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.userId.trim()) {
      setFormError("请填写用户 ID。");
      return;
    }

    if (!form.productId) {
      setFormError("请选择商品。");
      return;
    }

    if (!Number.isFinite(form.quantity) || form.quantity < 1) {
      setFormError("数量至少为 1。");
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
      setFormError(
        error instanceof Error ? error.message : "创建订单失败，请稍后重试。",
      );
    }
  };

  return (
    <DialogBackdrop onClose={() => onOpenChange(false)}>
      <div
        className="w-full max-w-lg rounded-[18px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-order-title"
      >
        <DialogHeader
          title="新建订单"
          description="提交后将通过 gateway 调用 POST /api/orders，并自动扣减商品库存。"
          onClose={() => onOpenChange(false)}
        />

        <form className="space-y-4 px-6 pb-6" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
              用户 ID
            </span>
            <input
              value={form.userId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  userId: event.target.value,
                }))
              }
              placeholder="输入用户 UUID"
              className={inputClassName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
              商品
            </span>
            <select
              value={form.productId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  productId: event.target.value,
                }))
              }
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
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
              数量
            </span>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  quantity: Number(event.target.value),
                }))
              }
              className={inputClassName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
              备注（可选）
            </span>
            <textarea
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="订单备注"
              rows={3}
              className={cn(inputClassName, "h-auto py-3")}
            />
          </label>

          {formError && (
            <p className="text-sm text-red-dark dark:text-red-light-2">
              {formError}
            </p>
          )}

          <DialogActions>
            <Button
              label="取消"
              variant="outlineDark"
              shape="rounded"
              size="small"
              className="rounded-xl px-5"
              onClick={() => onOpenChange(false)}
            />
            <Button
              label={createOrder.isPending ? "提交中..." : "创建订单"}
              variant="primary"
              shape="rounded"
              size="small"
              className="rounded-xl px-5"
            />
          </DialogActions>
        </form>
      </div>
    </DialogBackdrop>
  );
}

function DialogBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/45 p-4"
      onClick={onClose}
    >
      <div onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DialogHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stroke px-6 py-5 dark:border-dark-3">
      <div className="space-y-2">
        <h2
          id="create-order-title"
          className="text-lg font-bold text-dark dark:text-white"
        >
          {title}
        </h2>
        <p className="text-sm leading-6 text-dark-5 dark:text-dark-6">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-2 py-1 text-sm text-dark-5 transition-colors hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-2 dark:hover:text-white"
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
  );
}

function DialogActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-end gap-3 border-t border-stroke pt-4 dark:border-dark-3">
      {children}
    </div>
  );
}