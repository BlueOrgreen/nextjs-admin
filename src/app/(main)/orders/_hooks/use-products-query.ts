"use client";

import { getProducts, selectProductRecords } from "@/lib/api/productApi";
import { useQuery } from "@tanstack/react-query";

/**
 * 创建订单表单需要商品下拉选项。
 */
export function useProductsQuery(enabled = true) {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled,
    select: selectProductRecords,
  });
}
