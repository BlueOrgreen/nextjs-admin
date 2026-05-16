import type {
  GetOrdersResponse,
  OrderRecord,
  OrderStatus,
} from "@/lib/api/orderApi";
import dayjs from "dayjs";
import type {
  OrderStatusCounts,
  OrdersListData,
  OrderViewModel,
  PaginationToken,
  StatusFilter,
  StatusOption,
} from "./orders-list.types";

export const ORDERS_PAGE_SIZE = 6;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "待处理",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:
    "bg-yellow-light-4 text-yellow-dark dark:bg-yellow-dark/15 dark:text-yellow-light",
  paid: "bg-blue-light-5 text-blue dark:bg-blue/15 dark:text-blue-light-2",
  shipped:
    "bg-[rgba(87,80,241,0.12)] text-primary dark:bg-primary/15 dark:text-[#A7A4FF]",
  completed:
    "bg-green-light-6 text-green-dark dark:bg-green/15 dark:text-green-light-3",
  cancelled: "bg-red-light-5 text-red-dark dark:bg-red/15 dark:text-red-light-2",
};

export const STATUS_OPTIONS: StatusOption[] = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "paid", label: STATUS_LABELS.paid },
  { value: "shipped", label: STATUS_LABELS.shipped },
  { value: "completed", label: STATUS_LABELS.completed },
  { value: "cancelled", label: STATUS_LABELS.cancelled },
];

/**
 * 在查询边界把接口响应转成页面模型，避免把解析逻辑散落在组件里。
 * 后端的 amount 是 decimal 字符串，这里额外派生 amountValue 供统计计算使用。
 *
 * 接口实际返回：{ code, data: { data: OrderRecord[], meta }, message }
 */
export function toOrdersListData(
  response: GetOrdersResponse,
): OrdersListData {
  // response.data 本身是 { data: OrderRecord[], meta } 结构
  const payload = response.data as unknown as {
    data: OrderRecord[];
    meta?: unknown;
  };
  return {
    code: response.code,
    message: response.message,
    orders: (payload.data ?? []).map(mapOrderToViewModel),
  };
}

export function filterOrders(
  orders: OrderViewModel[],
  keyword: string,
  statusFilter: StatusFilter,
) {
  // 筛选逻辑保持纯函数，方便后续迁移到服务端搜索或单元测试。
  return orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ? true : order.status === statusFilter;

    if (!matchesStatus) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const haystack = [
      order.id,
      order.userId,
      order.productId,
      order.description,
      STATUS_LABELS[order.status],
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(keyword);
  });
}

export function buildOrderStatusCounts(
  orders: OrderViewModel[],
): OrderStatusCounts {
  // 统一从完整数据集计算状态分布，避免页面里重复写 filter 统计。
  return orders.reduce<OrderStatusCounts>(
    (counts, order) => {
      counts[order.status] += 1;
      return counts;
    },
    {
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    },
  );
}

export function sumOrderAmounts(orders: OrderViewModel[]) {
  return orders.reduce((sum, order) => sum + order.amountValue, 0);
}

export function paginateOrders(
  orders: OrderViewModel[],
  currentPage: number,
  pageSize = ORDERS_PAGE_SIZE,
) {
  const safePage = Math.max(currentPage, 1);
  const startIndex = (safePage - 1) * pageSize;
  return orders.slice(startIndex, startIndex + pageSize);
}

export function getTotalPages(totalItems: number, pageSize = ORDERS_PAGE_SIZE) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
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

  const tokens: PaginationToken[] = [
    { type: "page", value: 1 },
  ];

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

export function formatAmount(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string) {
  return dayjs(value).isValid() ? dayjs(value).format("YYYY-MM-DD HH:mm") : value;
}

export function mapOrderToViewModel(order: OrderRecord): OrderViewModel {
  // 视图层用到的兜底显示值在这里集中派生，组件里只关心展示。
  return {
    ...order,
    amountValue: toSafeNumber(order.amount),
    createdAtLabel: formatDate(order.createdAt),
    displayDescription: order.description || "无备注",
    displayProductId: order.productId || "未关联商品",
  };
}

function toSafeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
