import dayjs from "dayjs";
import type { GetProductsResponse, ProductRecord } from "@/lib/api/productApi";
import { matchProductStatusLabel } from "./product-status";
import type {
  PaginationToken,
  ProductViewModel,
  ProductsListData,
} from "./products-list.types";

export const PRODUCTS_PAGE_SIZE = 10;

export function formatProductStatus(status: string) {
  return matchProductStatusLabel(status);
}

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
    updatedAtLabel: formatDate(product.updatedAt),
    displayStatus: formatProductStatus(product.status),
    displayDescription: product.description?.trim() || "无描述",
  };
}

export function toProductsListData(response: GetProductsResponse): ProductsListData {
  const payload = response.data;
  const meta = payload.meta;

  return {
    code: response.code,
    message: response.message,
    products: (payload.data ?? []).map(mapProductToViewModel),
    meta: {
      total: meta?.total ?? 0,
      page: meta?.page ?? 1,
      pageSize: meta?.pageSize ?? PRODUCTS_PAGE_SIZE,
      totalPages: Math.max(1, meta?.totalPages ?? 1),
    },
  };
}

export function getProductsPageRange(meta: ProductsListData["meta"]) {
  if (meta.total === 0) {
    return { start: 0, end: 0 };
  }

  const start = (meta.page - 1) * meta.pageSize + 1;
  const end = Math.min(meta.page * meta.pageSize, meta.total);

  return { start, end };
}

export function buildPaginationTokens(
  currentPage: number,
  totalPages: number,
): PaginationToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: "page" as const,
      value: index + 1,
    }));
  }

  const tokens: PaginationToken[] = [{ type: "page", value: 1 }];

  if (currentPage > 3) {
    tokens.push({ type: "ellipsis", key: "start-ellipsis" });
  }

  const middlePages = new Set([
    Math.max(2, currentPage - 1),
    currentPage,
    Math.min(totalPages - 1, currentPage + 1),
  ]);

  for (const page of [...middlePages].sort((a, b) => a - b)) {
    if (page > 1 && page < totalPages) {
      tokens.push({ type: "page", value: page });
    }
  }

  if (currentPage < totalPages - 2) {
    tokens.push({ type: "ellipsis", key: "end-ellipsis" });
  }

  tokens.push({ type: "page", value: totalPages });

  return tokens;
}
