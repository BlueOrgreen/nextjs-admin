"use client";

import {
  createOrders,
  deleteOrdersById,
  updateOrdersById,
  type CreateOrderDto,
  type UpdateOrderDto,
} from "@/lib/api/orderApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderDto) => createOrders(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrderDto;
    }) => updateOrdersById({ id }, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteOrdersById({ id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
