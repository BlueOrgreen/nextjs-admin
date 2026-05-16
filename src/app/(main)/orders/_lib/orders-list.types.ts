import type { OrderRecord, OrderStatus } from "@/lib/api/orderApi";

export type StatusFilter = "all" | OrderStatus;

export type StatusOption = {
  value: StatusFilter;
  label: string;
};

export type OrderViewModel = OrderRecord & {
  amountValue: number;
  createdAtLabel: string;
  displayDescription: string;
  displayProductId: string;
};

export type OrdersListData = {
  code: number;
  message: string;
  orders: OrderViewModel[];
};

export type OrderStatusCounts = Record<OrderStatus, number>;

export type PaginationToken =
  | {
      type: "page";
      value: number;
    }
  | {
      type: "ellipsis";
      key: string;
    };
