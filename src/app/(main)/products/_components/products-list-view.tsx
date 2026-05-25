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
import { Button } from "@/components/ui-elements/button";

import { ProductCard, ProductCardSkeleton } from "./product-card";
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
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateProductDialog } from "./create-product-dialog";
import { EditProductDialog } from "./edit-product-dialog";
import { useDeleteProductMutation } from "../_hooks/use-product-mutations";
import { useProductsQuery } from "../_hooks/use-products-query";
import type { ProductViewModel } from "../_lib/products-list.types";
import {
  buildPaginationTokens,
  getProductsPageRange,
} from "../_lib/products-list.utils";

export function ProductsListView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductViewModel | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } =
    useProductsQuery(currentPage);
  const deleteProduct = useDeleteProductMutation();

  const products = data?.products ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const paginationTokens = buildPaginationTokens(currentPage, totalPages);
  const pageRange = meta ? getProductsPageRange(meta) : { start: 0, end: 0 };

  const stats = {
    total: meta?.total ?? 0,
    active: products.filter((p) => p.status === "active").length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 20).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleEdit = (product: ProductViewModel) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (product: ProductViewModel) => {
    setSelectedProduct(product);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setDeleteError(null);

    try {
      await deleteProduct.mutateAsync({ id: selectedProduct.id });
      toast.success("商品删除成功");
      setIsDeleteOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除商品失败，请稍后重试";
      setDeleteError(message);
      toast.error(message);
    }
  };

  return (
    <>
      <CreateProductDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditProductDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        product={selectedProduct}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除商品</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除商品 <span className="font-medium">{selectedProduct?.name}</span>{" "}
              吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="px-6 text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDeleteConfirm();
              }}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              {deleteProduct.isPending ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-[18px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-dark dark:text-white xl:mb-2">
                  商品列表
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <Button
                  label="新建商品"
                  variant="primary"
                  shape="rounded"
                  size="small"
                  className="h-11 rounded-xl px-5"
                  onClick={() => setIsCreateOpen(true)}
                />
                <Button
                  label={isFetching ? "刷新中..." : "刷新数据"}
                  variant="outlineDark"
                  shape="rounded"
                  size="small"
                  className="h-11 rounded-xl px-5"
                  onClick={() => {
                    void refetch();
                  }}
                />
              </div>
            </div>

            {!isPending && !isError && data && meta && (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-dark-5 dark:text-dark-6">
                <span>共 {meta.total} 件商品</span>
                <span className="h-1 w-1 rounded-full bg-dark-5/40 dark:bg-dark-6/40" />
                <span>
                  第 {meta.page} / {meta.totalPages} 页，每页 {meta.pageSize} 条
                </span>
                <span className="h-1 w-1 rounded-full bg-dark-5/40 dark:bg-dark-6/40" />
                <span>
                  当前显示 {pageRange.start}-{pageRange.end} 条
                </span>
              </div>
            )}
          </div>

          {isPending ? (
            <ProductsGridSkeleton />
          ) : isError ? (
            <ProductsErrorState
              errorMessage={
                error instanceof Error
                  ? error.message
                  : "商品数据加载失败，请稍后重试。"
              }
              onRetry={() => {
                void refetch();
              }}
            />
          ) : products.length === 0 ? (
            <ProductsEmptyState />
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-5 px-6 py-5 sm:grid-cols-2 transition-opacity",
                  isFetching && "opacity-60",
                )}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>

              <div className="border-t border-stroke px-6 py-4 dark:border-dark-3">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-dark-5 dark:text-dark-6">
                    第 {currentPage} / {totalPages} 页
                    {meta && meta.total > 0
                      ? `，显示 ${pageRange.start}-${pageRange.end} / ${meta.total} 条`
                      : ""}
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
                            currentPage === 1 && "pointer-events-none opacity-50",
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
            </>
          )}
        </section>

        <aside className="overflow-hidden rounded-[18px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          {isPending ? (
            <ProductsSidebarSkeleton />
          ) : (
            <>
              <div className="border-b border-stroke px-6 py-5 dark:border-dark-3">
                <h2 className="text-lg font-bold text-dark dark:text-white">商品统计</h2>
              </div>

              <dl className="divide-y divide-stroke dark:divide-dark-3">
                <SummaryRow label="总商品数" value={String(stats.total)} />
                <SummaryRow
                  label="在售（当前页）"
                  value={String(stats.active)}
                  valueClassName="text-green-dark dark:text-green-light-1"
                />
                <SummaryRow
                  label="低库存（当前页）"
                  value={String(stats.lowStock)}
                  valueClassName="text-orange-500"
                />
                <SummaryRow
                  label="缺货（当前页）"
                  value={String(stats.outOfStock)}
                  valueClassName="text-red-500"
                />
              </dl>

              <div className="border-t border-stroke px-6 py-5 dark:border-dark-3">
                <h3 className="text-sm font-semibold text-dark dark:text-white">说明</h3>
                {/* <div className="mt-3 space-y-2 text-sm leading-6 text-dark-5 dark:text-dark-6">
                  <p>接口：GET /api/products?page=&amp;pageSize=10</p>
                  <p>响应包装：{`{ code, data: { data, meta }, message }`}</p>
                  <p>描述为空时显示「无描述」；status 映射为在售/下架</p>
                </div> */}
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <dt className="text-sm text-dark-5 dark:text-dark-6">{label}</dt>
      <dd
        className={cn(
          "text-base font-semibold text-dark dark:text-white",
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ProductsErrorState({
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
          商品列表加载失败
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

function ProductsEmptyState() {
  return (
    <div className="px-6 py-14">
      <div className="rounded-2xl border border-dashed border-stroke bg-gray-1 px-6 py-12 text-center dark:border-dark-3 dark:bg-dark-2">
        <h2 className="text-base font-semibold text-dark dark:text-white">
          当前还没有商品数据
        </h2>
        <p className="mx-auto mt-2 max-w-[50ch] text-sm leading-6 text-dark-5 dark:text-dark-6">
          接口已经请求成功，但当前返回的商品数组为空。可以点击「新建商品」添加第一条记录。
        </p>
      </div>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

function ProductsSidebarSkeleton() {
  return (
    <div className="space-y-5 px-6 py-5">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
