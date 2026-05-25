import type { ProductRecord } from "@/lib/api/productApi";

export type ProductViewModel = ProductRecord & {
  amountValue: number;
  createdAtLabel: string;
  updatedAtLabel: string;
  displayStatus: string;
  displayDescription: string;
};

export type PaginationToken =
  | { type: "page"; value: number }
  | { type: "ellipsis"; key: string };

export type ProductsListData = {
  code: number;
  message: string;
  products: ProductViewModel[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};
