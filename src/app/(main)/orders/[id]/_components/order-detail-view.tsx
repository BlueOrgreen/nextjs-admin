"use client";

import { Button } from "@/components/ui-elements/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/lib/api/orderApi";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDeleteOrderMutation,
  useUpdateOrderMutation,
} from "../../_hooks/use-order-mutations";
import { useOrderQuery } from "../../_hooks/use-order-query";
import type { OrderViewModel } from "../../_lib/orders-list.types";
import {
  formatAmount,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_STYLES,
} from "../../_lib/orders-list.utils";

const inputClassName =
  "h-11 w-full rounded-xl border border-stroke bg-gray-1 px-4 text-sm text-dark outline-none transition-colors placeholder:text-dark-5 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6";

type OrderDetailViewProps = {
  orderId: string;
};

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const router = useRouter();
  const orderQuery = useOrderQuery(orderId);
  const updateOrder = useUpdateOrderMutation();
  const deleteOrder = useDeleteOrderMutation();
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const order = orderQuery.data?.order;

  useEffect(() => {
    if (!order) {
      return;
    }

    setStatus(order.status);
    setDescription(order.description);
  }, [order]);

  const handleSave = async () => {
    setFormError(null);
    setActionMessage(null);

    try {
      const response = await updateOrder.mutateAsync({
        id: orderId,
        data: {
          status,
          description: description.trim() || undefined,
        },
      });
      setActionMessage(response.message || "订单已更新。");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "更新订单失败，请稍后重试。",
      );
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("确认删除该订单？此操作不可恢复。");
    if (!confirmed) {
      return;
    }

    setFormError(null);
    setActionMessage(null);

    try {
      await deleteOrder.mutateAsync({ id: orderId });
      router.push("/orders");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "删除订单失败，请稍后重试。",
      );
    }
  };

  if (orderQuery.isPending) {
    return <OrderDetailSkeleton />;
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="rounded-[18px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <h2 className="text-base font-semibold text-dark dark:text-white">
          订单加载失败
        </h2>
        <p className="mt-2 text-sm leading-6 text-dark-5 dark:text-dark-6">
          {orderQuery.error instanceof Error
            ? orderQuery.error.message
            : "无法获取订单详情，请返回列表重试。"}
        </p>
        <div className="mt-5">
          <Link
            href="/orders"
            className="inline-flex rounded-xl border border-stroke px-5 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            返回订单列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-[18px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <DetailHeader orderId={order.id} status={order.status} />

        <dl className="grid gap-0 divide-y divide-stroke px-6 dark:divide-dark-3">
          <DetailRow label="用户 ID" value={order.userId} mono />
          <DetailRow label="商品 ID" value={order.displayProductId} mono />
          <DetailRow label="数量" value={String(order.quantity)} />
          <DetailRow label="金额" value={formatAmount(order.amountValue)} />
          <DetailRow label="创建时间" value={order.createdAtLabel} />
          <DetailRow
            label="接口消息"
            value={orderQuery.data?.message ?? "-"}
          />
        </dl>

        <form
          className="space-y-4 border-t border-stroke px-6 py-6 dark:border-dark-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <h3 className="text-sm font-semibold text-dark dark:text-white">
            更新订单
          </h3>

          <label className="grid gap-2">
            <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
              状态
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
              className={inputClassName}
            >
              {STATUS_OPTIONS.filter((option) => option.value !== "all").map(
                (option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
              备注
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="订单备注"
              className={cn(inputClassName, "h-auto py-3")}
            />
          </label>

          {formError && (
            <p className="text-sm text-red-dark dark:text-red-light-2">
              {formError}
            </p>
          )}

          {actionMessage && (
            <p className="text-sm text-green-dark dark:text-green-light-3">
              {actionMessage}
            </p>
          )}

          <DetailActions
            isSaving={updateOrder.isPending}
            isDeleting={deleteOrder.isPending}
            onDelete={() => {
              void handleDelete();
            }}
          />
        </form>
      </section>

      <DetailSidebar order={order} />
    </div>
  );
}

function DetailHeader({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  return (
    <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DetailTitle orderId={orderId} />
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function DetailTitle({ orderId }: { orderId: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-dark-5 dark:text-dark-6">订单详情</p>
      <h1 className="font-mono text-lg font-bold text-dark dark:text-white">
        {orderId}
      </h1>
    </div>
  );
}

function DetailSidebar({ order }: { order: OrderViewModel }) {
  return (
    <aside className="overflow-hidden rounded-[18px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
        <h2 className="text-lg font-bold text-dark dark:text-white">
          当前状态
        </h2>
        <div className="mt-4">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="space-y-4 px-6 py-5 text-sm leading-6 text-dark-5 dark:text-dark-6">
        <p>详情接口：GET /api/orders/{"{id}"}</p>
        <p>更新接口：PATCH /api/orders/{"{id}"}</p>
        <p>删除接口：DELETE /api/orders/{"{id}"}</p>
      </div>

      <div className="border-t border-stroke px-6 py-5 dark:border-dark-3">
        <Link
          href="/orders"
          className="inline-flex w-full items-center justify-center rounded-xl border border-stroke px-5 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
        >
          返回订单列表
        </Link>
      </div>
    </aside>
  );
}

function DetailActions({
  isSaving,
  isDeleting,
  onDelete,
}: {
  isSaving: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        label={isSaving ? "保存中..." : "保存修改"}
        variant="primary"
        shape="rounded"
        size="small"
        className="rounded-xl px-5"
      />
      <Button
        label={isDeleting ? "删除中..." : "删除订单"}
        variant="outlineDark"
        shape="rounded"
        size="small"
        className="rounded-xl px-5"
        onClick={onDelete}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
      <dt className="text-sm text-dark-5 dark:text-dark-6">{label}</dt>
      <dd
        className={cn(
          "text-sm font-medium text-dark dark:text-white",
          mono && "font-mono text-[13px]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[18px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
