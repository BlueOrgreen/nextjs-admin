"use client";

import { getProducts } from "@/lib/api/orderApi";
import { useQuery } from "@tanstack/react-query";

/**
 * 创建订单表单需要商品下拉选项，直连 order-service。
 */
export function useProductsQuery(enabled = true) {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled,
    select: (response) => response.data,
  });
}
