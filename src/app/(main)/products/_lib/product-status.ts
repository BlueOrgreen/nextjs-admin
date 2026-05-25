import type { ProductStatus } from "@/lib/api/productApi";
import { cn } from "@/lib/utils";

export type ProductStatusOption = {
  label: string;
  value: ProductStatus;
};

/** 商品状态映射（展示 label ↔ 接口 value） */
export const PRODUCT_STATUS_OPTIONS: readonly ProductStatusOption[] = [
  { label: "在售", value: "active" },
  { label: "下架", value: "inactive" },
] as const;

const STATUS_LABEL_MAP = Object.fromEntries(
  PRODUCT_STATUS_OPTIONS.map((item) => [item.value, item.label]),
) as Record<string, string>;

const STATUS_VALUE_SET = new Set(
  PRODUCT_STATUS_OPTIONS.map((item) => item.value),
);

/**
 * 根据接口 value 匹配展示文案；未知状态原样返回。
 */
export function matchProductStatusLabel(value: string | undefined | null): string {
  if (!value) return "";
  return STATUS_LABEL_MAP[value] ?? value;
}

/**
 * 根据 label 反查接口 value；未匹配时返回 undefined。
 */
export function matchProductStatusValue(label: string): ProductStatus | undefined {
  const found = PRODUCT_STATUS_OPTIONS.find((item) => item.label === label);
  return found?.value;
}

/**
 * 校验是否为已配置的商品状态 value。
 */
export function isKnownProductStatus(
  value: string | undefined | null,
): value is ProductStatus {
  return Boolean(value && STATUS_VALUE_SET.has(value));
}

export function isProductActive(status: string | undefined | null): boolean {
  return status === "active";
}

/** 列表/卡片状态 Badge 样式 */
export function getProductStatusBadgeClassName(status: string): string {
  return cn(
    isProductActive(status)
      ? "border-transparent bg-emerald-600/90 text-white hover:bg-emerald-600/90"
      : "border-border bg-muted text-muted-foreground",
  );
}

/** 编辑/新建表单状态下拉框样式（在售 vs 下架） */
export function getProductStatusSelectTriggerClassName(status: string): string {
  return cn(
    "w-full font-medium",
    isProductActive(status)
      ? "border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200"
      : "border-orange-300/60 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-200",
  );
}

/** 商品卡片整体样式（在售 vs 下架） */
export function getProductCardClassName(status: string): string {
  return cn(
    isProductActive(status)
      ? "hover:ring-primary/25"
      : "opacity-95 ring-muted-foreground/15 hover:ring-orange-400/30",
  );
}

/** 商品卡片头像块样式 */
export function getProductAvatarClassName(status: string): string {
  return cn(
    isProductActive(status)
      ? "bg-gradient-to-br from-primary to-primary/70"
      : "bg-gradient-to-br from-orange-400/90 to-orange-500/70",
  );
}
