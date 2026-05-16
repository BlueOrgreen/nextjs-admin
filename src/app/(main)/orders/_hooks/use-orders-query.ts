"use client";

import { getOrders } from "@/lib/api/orderApi";
import { useQuery } from "@tanstack/react-query";
import { toOrdersListData } from "../_lib/orders-list.utils";

/**
 * 把 React Query 配置从页面组件中抽离，保持视图层聚焦在状态和渲染。
 */
export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    select: toOrdersListData,
  });
}
