"use client";

import { getProducts } from "@/lib/api/productApi";
import { useQuery } from "@tanstack/react-query";
import { PRODUCTS_PAGE_SIZE, toProductsListData } from "../_lib/products-list.utils";

export function useProductsQuery(page = 1) {
  return useQuery({
    queryKey: ["products", page, PRODUCTS_PAGE_SIZE],
    queryFn: () =>
      getProducts({
        params: {
          page: String(page),
          pageSize: String(PRODUCTS_PAGE_SIZE),
        },
      }),
    select: toProductsListData,
  });
}
