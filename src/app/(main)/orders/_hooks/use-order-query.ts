"use client";

import { getOrdersById } from "@/lib/api/orderApi";
import { useQuery } from "@tanstack/react-query";
import { mapOrderToViewModel } from "../_lib/orders-list.utils";

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrdersById({ id: orderId }),
    select: (response) => ({
      code: response.code,
      message: response.message,
      order: mapOrderToViewModel(response.data),
    }),
    enabled: Boolean(orderId),
  });
}
