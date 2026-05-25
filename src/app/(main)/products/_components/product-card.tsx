"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Boxes, Pencil, Trash2 } from "lucide-react";
import {
  getProductAvatarClassName,
  getProductCardClassName,
  getProductStatusBadgeClassName,
} from "../_lib/product-status";
import type { ProductViewModel } from "../_lib/products-list.types";
import { formatAmount } from "../_lib/products-list.utils";

type ProductCardProps = {
  product: ProductViewModel;
  onEdit: (product: ProductViewModel) => void;
  onDelete: (product: ProductViewModel) => void;
};

function getStockLevel(stock: number) {
  if (stock === 0) return "out" as const;
  if (stock < 20) return "low" as const;
  return "ok" as const;
}

const STOCK_BAR_COLORS = {
  out: "bg-destructive",
  low: "bg-orange-500",
  ok: "bg-primary",
} as const;

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const stockLevel = getStockLevel(product.stock);
  const stockPercent = Math.min(100, (product.stock / 100) * 100);
  const hasDescription = product.displayDescription !== "无描述";

  return (
    <Card
      size="sm"
      className={cn(
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        getProductCardClassName(product.status),
      )}
    >
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white shadow-sm bg-gradient-to-br from-primary to-primary/70",
            )}
            aria-hidden
          >
            {product.name.trim().charAt(0) || "?"}   
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="line-clamp-2 text-[0.95rem] leading-snug">
              {product.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              更新于 {product.updatedAtLabel}
            </p>
          </div>
        </div>
        <CardAction>
          <Badge
            variant="outline"
            className={getProductStatusBadgeClassName(product.status)}
          >
            {product.displayStatus}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              售价
            </p>
            <p className="mt-0.5 font-heading text-2xl font-semibold tracking-tight text-foreground">
              <span className="text-base font-medium text-muted-foreground">¥</span>
              {formatAmount(product.amountValue)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground">库存</p>
            <p
              className={cn(
                "mt-0.5 text-lg font-semibold tabular-nums",
                stockLevel === "out" && "text-destructive",
                stockLevel === "low" && "text-orange-600 dark:text-orange-400",
                stockLevel === "ok" && "text-foreground",
              )}
            >
              {product.stock}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Boxes className="size-3.5" />
              库存水位
            </span>
            <span>
              {stockLevel === "out"
                ? "缺货"
                : stockLevel === "low"
                  ? "偏低"
                  : "充足"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                STOCK_BAR_COLORS[stockLevel],
              )}
              style={{ width: `${stockLevel === "out" ? 0 : Math.max(stockPercent, 8)}%` }}
            />
          </div>
        </div>

        {hasDescription && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.displayDescription}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 border-t bg-transparent p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(product)}
        >
          <Pencil className="size-3.5" />
          编辑
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="size-3.5" />
          删除
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card size="sm" className="overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex gap-3">
          <div className="size-11 shrink-0 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <div className="flex justify-between">
          <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-1.5 animate-pulse rounded-full bg-muted" />
      </CardContent>
      <CardFooter className="gap-2 p-3">
        <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
      </CardFooter>
    </Card>
  );
}
