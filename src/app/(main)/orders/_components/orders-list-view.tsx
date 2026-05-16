"use client";

import { Button } from "@/components/ui-elements/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderStatus } from "@/lib/api/orderApi";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { CreateOrderDialog } from "./create-order-dialog";
import { useOrdersQuery } from "../_hooks/use-orders-query";
import type { StatusFilter } from "../_lib/orders-list.types";
import {
  buildOrderStatusCounts,
  buildPaginationTokens,
  filterOrders,
  formatAmount,
  getTotalPages,
  ORDERS_PAGE_SIZE,
  paginateOrders,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_STYLES,
  sumOrderAmounts,
} from "../_lib/orders-list.utils";

export function OrdersListView() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const deferredKeyword = useDeferredValue(keyword.trim().toLowerCase());
  const { data, isPending, isError, error, refetch, isFetching } =
    useOrdersQuery();

  const orders = data?.orders ?? [];
  const filteredOrders = filterOrders(orders, deferredKeyword, statusFilter);
  const totalPages = getTotalPages(filteredOrders.length, ORDERS_PAGE_SIZE);
  const paginatedOrders = paginateOrders(
    filteredOrders,
    currentPage,
    ORDERS_PAGE_SIZE,
  );
  const paginationTokens = buildPaginationTokens(currentPage, totalPages);
  const statusCounts = buildOrderStatusCounts(orders);
  const pendingCount = statusCounts.pending;
  const completedCount = statusCounts.completed;
  const totalAmount = sumOrderAmounts(orders);
  const filteredAmount = sumOrderAmounts(filteredOrders);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredKeyword, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = filteredOrders.length
    ? (currentPage - 1) * ORDERS_PAGE_SIZE + 1
    : 0;
  const pageEnd = Math.min(currentPage * ORDERS_PAGE_SIZE, filteredOrders.length);

  return (
    <>
      <CreateOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-[18px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-dark dark:text-white xl:mb-2">
                订单列表
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <Button
                label="新建订单"
                variant="primary"
                shape="rounded"
                size="small"
                className="h-11 rounded-xl px-5"
                onClick={() => setCreateDialogOpen(true)}
              />

            <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_180px_auto]">
              <label className="grid gap-2">
                <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
                  搜索订单
                </span>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="按订单号、用户 ID、商品 ID 或备注搜索"
                  className="h-11 rounded-xl border border-stroke bg-gray-1 px-4 text-sm text-dark outline-none transition-colors placeholder:text-dark-5 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-medium tracking-[0.12em] text-dark-4 dark:text-dark-6">
                  状态筛选
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="h-11 rounded-xl border border-stroke bg-gray-1 px-4 text-sm text-dark outline-none transition-colors focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <Button
                  label={isFetching ? "刷新中..." : "刷新数据"}
                  variant="outlineDark"
                  shape="rounded"
                  size="small"
                  className="h-11 w-full rounded-xl px-5"
                  onClick={() => {
                    void refetch();
                  }}
                />
              </div>
            </div>
            </div>
          </div>

          {!isPending && !isError && data && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-dark-5 dark:text-dark-6">
              <span>共 {orders.length} 条订单</span>
              <span className="h-1 w-1 rounded-full bg-dark-5/40 dark:bg-dark-6/40" />
              <span>当前筛选后 {filteredOrders.length} 条</span>
              <span className="h-1 w-1 rounded-full bg-dark-5/40 dark:bg-dark-6/40" />
              <span>
                当前显示 {pageStart}-{pageEnd} 条
              </span>
              <span className="h-1 w-1 rounded-full bg-dark-5/40 dark:bg-dark-6/40" />
              <span>接口消息：{data.message}</span>
            </div>
          )}
        </div>

        {isPending ? (
          <OrdersTableSkeleton />
        ) : isError ? (
          <OrdersErrorState
            errorMessage={
              error instanceof Error
                ? error.message
                : "订单数据加载失败，请稍后重试。"
            }
            onRetry={() => {
              void refetch();
            }}
          />
        ) : filteredOrders.length === 0 ? (
          <OrdersEmptyState hasOrders={orders.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-stroke dark:border-dark-3">
                  <TableHead className="min-w-[260px]">订单信息</TableHead>
                  <TableHead className="min-w-[180px]">用户 ID</TableHead>
                  <TableHead className="min-w-[180px]">商品 ID</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="min-w-[120px] text-right">数量</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead className="min-w-[160px]">创建时间</TableHead>
                  <TableHead className="min-w-[100px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="space-y-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-[13px] font-medium text-primary hover:underline"
                        >
                          {order.id}
                        </Link>
                        <p className="text-sm leading-6 text-dark-5 dark:text-dark-6">
                          {order.displayDescription}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-dark dark:text-white">
                      {order.userId}
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-dark dark:text-white">
                      {order.displayProductId}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium text-dark dark:text-white">
                      {order.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium text-dark dark:text-white">
                      {formatAmount(order.amountValue)}
                    </TableCell>
                    <TableCell className="text-sm text-dark-5 dark:text-dark-6">
                      {order.createdAtLabel}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        查看
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isPending && !isError && filteredOrders.length > 0 && (
          <div className="border-t border-stroke px-6 py-4 dark:border-dark-3">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-dark-5 dark:text-dark-6">
                第 {currentPage} 页，共 {totalPages} 页
              </p>

              <Pagination className="mx-0 w-auto justify-start md:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text="上一页"
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage((page) => page - 1);
                        }
                      }}
                      className={cn(
                        currentPage === 1 &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>

                  {paginationTokens.map((token) => (
                    <PaginationItem
                      key={
                        token.type === "page"
                          ? `page-${token.value}`
                          : token.key
                      }
                    >
                      {token.type === "page" ? (
                        <PaginationLink
                          href="#"
                          isActive={token.value === currentPage}
                          onClick={(event) => {
                            event.preventDefault();
                            setCurrentPage(token.value);
                          }}
                        >
                          {token.value}
                        </PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text="下一页"
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage((page) => page + 1);
                        }
                      }}
                      className={cn(
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </section>

      <aside className="overflow-hidden rounded-[18px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        {isPending ? (
          <OrdersSidebarSkeleton />
        ) : (
          <>
            <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
              <h2 className="text-lg font-bold text-dark dark:text-white">
                列表摘要
              </h2>
              <p className="mt-2 text-sm leading-6 text-dark-5 dark:text-dark-6">
                这一侧只保留当前页真正有用的数字，帮助你快速判断订单规模、
                处理进度和筛选结果。
              </p>
            </div>

            <dl className="divide-y divide-stroke dark:divide-dark-3">
              <SummaryRow label="订单总数" value={String(orders.length)} />
              <SummaryRow label="筛选结果" value={String(filteredOrders.length)} />
              <SummaryRow label="总金额" value={formatAmount(totalAmount)} />
              <SummaryRow label="筛选后金额" value={formatAmount(filteredAmount)} />
              <SummaryRow label="待处理订单" value={String(pendingCount)} />
              <SummaryRow label="已完成订单" value={String(completedCount)} />
            </dl>

            <div className="border-t border-stroke px-6 py-5 dark:border-dark-3">
              <h3 className="text-sm font-semibold text-dark dark:text-white">
                状态分布
              </h3>
              <div className="mt-4 space-y-3">
                {(
                  Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>
                ).map((status) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-3"
                  >
                    <StatusBadge status={status} />
                    <span className="text-sm font-medium text-dark dark:text-white">
                      {statusCounts[status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-stroke px-6 py-5 dark:border-dark-3">
              <h3 className="text-sm font-semibold text-dark dark:text-white">
                数据说明
              </h3>
              <div className="mt-3 space-y-2 text-sm leading-6 text-dark-5 dark:text-dark-6">
                <p>接口：GET /api/orders</p>
                <p>响应包装：{`{ code, data: { data, meta }, message }`}</p>
                <p>备注为空时，列表统一显示"无备注"</p>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
    </>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold min-w-[60px]",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <dt className="text-sm text-dark-5 dark:text-dark-6">{label}</dt>
      <dd className="text-base font-semibold text-dark dark:text-white">
        {value}
      </dd>
    </div>
  );
}

function OrdersErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="px-6 py-14">
      <div className="rounded-2xl border border-red-light-3 bg-red-light-6 p-6 dark:border-red/20 dark:bg-red/10">
        <h2 className="text-base font-semibold text-red-dark dark:text-red-light-2">
          订单列表加载失败
        </h2>
        <p className="mt-2 max-w-[56ch] text-sm leading-6 text-red-dark/80 dark:text-red-light-3">
          {errorMessage}
        </p>
        <div className="mt-5">
          <Button
            label="重新获取"
            variant="outlineDark"
            shape="rounded"
            size="small"
            className="rounded-xl px-5"
            onClick={onRetry}
          />
        </div>
      </div>
    </div>
  );
}

function OrdersEmptyState({ hasOrders }: { hasOrders: boolean }) {
  return (
    <div className="px-6 py-14">
      <div className="rounded-2xl border border-dashed border-stroke bg-gray-1 px-6 py-12 text-center dark:border-dark-3 dark:bg-dark-2">
        <h2 className="text-base font-semibold text-dark dark:text-white">
          {hasOrders ? "没有符合条件的订单" : "当前还没有订单数据"}
        </h2>
        <p className="mx-auto mt-2 max-w-[50ch] text-sm leading-6 text-dark-5 dark:text-dark-6">
          {hasOrders
            ? "可以尝试清空搜索词或切换状态筛选，重新查看完整列表。"
            : "接口已经请求成功，但当前返回的订单数组为空。"}
        </p>
      </div>
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="px-6 py-5">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-2xl border border-stroke px-4 py-4 dark:border-dark-3 md:grid-cols-[minmax(0,1.7fr)_1fr_1fr_120px_80px_100px_140px]"
          >
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersSidebarSkeleton() {
  return (
    <div className="space-y-5 px-6 py-5">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}