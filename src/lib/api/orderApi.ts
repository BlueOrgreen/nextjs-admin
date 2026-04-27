/**
 * Auto-generated from Order Service API
 * Source: http://localhost:3002/docs-json
 * Generated at: 2026-04-27T08:59:00.642Z
 */

import { createApiClient, buildPath, mergeQueryConfig, type ApiRequestConfig } from "./http";

export const orderApiClient = createApiClient(
  process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:3002",
);

export type CreateOrderDto = {
  userId: string;
  productId: string;
  quantity: number;
  description?: string;
};

export type CreateProductDto = Record<string, never>;

export type UpdateOrderDto = {
  description?: string;
  amount?: number;
  status?: "pending" | "paid" | "shipped" | "completed" | "cancelled";
};

export type UpdateProductDto = Record<string, never>;

export type GetHealthResponse = {
  status?: string;
  info?: {
    [key: string]: {
      status: string;
      [key: string]: unknown;
    };
  } | null;
  error?: {
    [key: string]: {
      status: string;
      [key: string]: unknown;
    };
  } | null;
  details?: {
    [key: string]: {
      status: string;
      [key: string]: unknown;
    };
  };
};

export type GetOrdersResponse = unknown;

export type CreateOrdersResponse = unknown;

export interface GetOrdersUserByUserIdPathParams {
  userId: string;
}

export type GetOrdersUserByUserIdResponse = unknown;

export interface GetOrdersDemoDirtyReadQueryParams {
  productId: string;
}

export type GetOrdersDemoDirtyReadResponse = unknown;

export type CreateOrdersDemoSimulateDirtyWriteRequestBody = {
  productId: string;
  dirtyStock: number;
};

export type CreateOrdersDemoSimulateDirtyWriteResponse = unknown;

export interface GetOrdersDemoNonRepeatableReadQueryParams {
  productId: string;
}

export type GetOrdersDemoNonRepeatableReadResponse = unknown;

export interface GetOrdersDemoPhantomReadQueryParams {
  userId: string;
}

export type GetOrdersDemoPhantomReadResponse = unknown;

export type GetOrdersDemoIsolationLevelResponse = unknown;

export interface GetOrdersDemoIsolationLevelReadQueryParams {
  productId: string;
  level?: "READ_UNCOMMITTED" | "READ_COMMITTED" | "REPEATABLE_READ" | "SERIALIZABLE";
}

export type GetOrdersDemoIsolationLevelReadResponse = unknown;

export interface GetOrdersDemoLockSharedQueryParams {
  productId: string;
}

export type GetOrdersDemoLockSharedResponse = unknown;

export interface GetOrdersDemoLockExclusiveQueryParams {
  productId: string;
}

export type GetOrdersDemoLockExclusiveResponse = unknown;

export type CreateOrdersDemoLockDeadlockRequestBody = {
  productIdA: string;
  productIdB: string;
};

export type CreateOrdersDemoLockDeadlockResponse = unknown;

export interface DeleteOrdersByIdPathParams {
  id: string;
}

export type DeleteOrdersByIdResponse = void;

export interface GetOrdersByIdPathParams {
  id: string;
}

export type GetOrdersByIdResponse = unknown;

export interface UpdateOrdersByIdPathParams {
  id: string;
}

export type UpdateOrdersByIdResponse = unknown;

export type GetProductsResponse = unknown;

export type CreateProductsResponse = unknown;

export interface DeleteProductsByIdPathParams {
  id: string;
}

export type DeleteProductsByIdResponse = void;

export interface GetProductsByIdPathParams {
  id: string;
}

export type GetProductsByIdResponse = unknown;

export interface UpdateProductsByIdPathParams {
  id: string;
}

export type UpdateProductsByIdResponse = unknown;

export async function getHealth(
  config?: ApiRequestConfig,
): Promise<GetHealthResponse> {
  const response = await orderApiClient.get<GetHealthResponse>(
    "/health",
    config,
  );

  return response.data;
}

/**
 * 获取所有订单（按创建时间倒序）
 */
export async function getOrders(
  config?: ApiRequestConfig,
): Promise<GetOrdersResponse> {
  const response = await orderApiClient.get<GetOrdersResponse>(
    "/orders",
    config,
  );

  return response.data;
}

/**
 * 创建订单（含事务：扣库存 + 建订单）
 */
export async function createOrders(
  data: CreateOrderDto,
  config?: ApiRequestConfig,
): Promise<CreateOrdersResponse> {
  const response = await orderApiClient.post<CreateOrdersResponse>(
    "/orders",
    data,
    config,
  );

  return response.data;
}

/**
 * 获取指定用户的所有订单
 */
export async function getOrdersUserByUserId(
  pathParams: GetOrdersUserByUserIdPathParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersUserByUserIdResponse> {
  const response = await orderApiClient.get<GetOrdersUserByUserIdResponse>(
    buildPath("/orders/user/{userId}", pathParams),
    config,
  );

  return response.data;
}

/**
 * 【演示】脏读 (Dirty Read)
 */
export async function getOrdersDemoDirtyRead(
  query: GetOrdersDemoDirtyReadQueryParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersDemoDirtyReadResponse> {
  const response = await orderApiClient.get<GetOrdersDemoDirtyReadResponse>(
    "/orders/demo/dirty-read",
    mergeQueryConfig(query, config),
  );

  return response.data;
}

/**
 * 【演示】制造脏写场景（5秒后 ROLLBACK）
 */
export async function createOrdersDemoSimulateDirtyWrite(
  data: CreateOrdersDemoSimulateDirtyWriteRequestBody,
  config?: ApiRequestConfig,
): Promise<CreateOrdersDemoSimulateDirtyWriteResponse> {
  const response = await orderApiClient.post<CreateOrdersDemoSimulateDirtyWriteResponse>(
    "/orders/demo/simulate-dirty-write",
    data,
    config,
  );

  return response.data;
}

/**
 * 【演示】不可重复读 (Non-repeatable Read)
 */
export async function getOrdersDemoNonRepeatableRead(
  query: GetOrdersDemoNonRepeatableReadQueryParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersDemoNonRepeatableReadResponse> {
  const response = await orderApiClient.get<GetOrdersDemoNonRepeatableReadResponse>(
    "/orders/demo/non-repeatable-read",
    mergeQueryConfig(query, config),
  );

  return response.data;
}

/**
 * 【演示】幻读 (Phantom Read)
 */
export async function getOrdersDemoPhantomRead(
  query: GetOrdersDemoPhantomReadQueryParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersDemoPhantomReadResponse> {
  const response = await orderApiClient.get<GetOrdersDemoPhantomReadResponse>(
    "/orders/demo/phantom-read",
    mergeQueryConfig(query, config),
  );

  return response.data;
}

/**
 * 【演示】查询当前 MySQL 会话事务隔离级别
 */
export async function getOrdersDemoIsolationLevel(
  config?: ApiRequestConfig,
): Promise<GetOrdersDemoIsolationLevelResponse> {
  const response = await orderApiClient.get<GetOrdersDemoIsolationLevelResponse>(
    "/orders/demo/isolation-level",
    config,
  );

  return response.data;
}

/**
 * 【演示】在指定隔离级别下读取商品库存（等待 2 秒）
 */
export async function getOrdersDemoIsolationLevelRead(
  query: GetOrdersDemoIsolationLevelReadQueryParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersDemoIsolationLevelReadResponse> {
  const response = await orderApiClient.get<GetOrdersDemoIsolationLevelReadResponse>(
    "/orders/demo/isolation-level/read",
    mergeQueryConfig(query, config),
  );

  return response.data;
}

/**
 * 【演示】共享锁 FOR SHARE（持锁 2 秒）
 */
export async function getOrdersDemoLockShared(
  query: GetOrdersDemoLockSharedQueryParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersDemoLockSharedResponse> {
  const response = await orderApiClient.get<GetOrdersDemoLockSharedResponse>(
    "/orders/demo/lock/shared",
    mergeQueryConfig(query, config),
  );

  return response.data;
}

/**
 * 【演示】排他锁 FOR UPDATE（持锁 3 秒）
 */
export async function getOrdersDemoLockExclusive(
  query: GetOrdersDemoLockExclusiveQueryParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersDemoLockExclusiveResponse> {
  const response = await orderApiClient.get<GetOrdersDemoLockExclusiveResponse>(
    "/orders/demo/lock/exclusive",
    mergeQueryConfig(query, config),
  );

  return response.data;
}

/**
 * 【演示】死锁
 */
export async function createOrdersDemoLockDeadlock(
  data: CreateOrdersDemoLockDeadlockRequestBody,
  config?: ApiRequestConfig,
): Promise<CreateOrdersDemoLockDeadlockResponse> {
  const response = await orderApiClient.post<CreateOrdersDemoLockDeadlockResponse>(
    "/orders/demo/lock/deadlock",
    data,
    config,
  );

  return response.data;
}

/**
 * 删除订单
 */
export async function deleteOrdersById(
  pathParams: DeleteOrdersByIdPathParams,
  config?: ApiRequestConfig,
): Promise<DeleteOrdersByIdResponse> {
  const response = await orderApiClient.delete<DeleteOrdersByIdResponse>(
    buildPath("/orders/{id}", pathParams),
    config,
  );

  return response.data;
}

/**
 * 根据 ID 获取单个订单
 */
export async function getOrdersById(
  pathParams: GetOrdersByIdPathParams,
  config?: ApiRequestConfig,
): Promise<GetOrdersByIdResponse> {
  const response = await orderApiClient.get<GetOrdersByIdResponse>(
    buildPath("/orders/{id}", pathParams),
    config,
  );

  return response.data;
}

/**
 * 更新订单信息
 */
export async function updateOrdersById(
  pathParams: UpdateOrdersByIdPathParams,
  data: UpdateOrderDto,
  config?: ApiRequestConfig,
): Promise<UpdateOrdersByIdResponse> {
  const response = await orderApiClient.patch<UpdateOrdersByIdResponse>(
    buildPath("/orders/{id}", pathParams),
    data,
    config,
  );

  return response.data;
}

export async function getProducts(
  config?: ApiRequestConfig,
): Promise<GetProductsResponse> {
  const response = await orderApiClient.get<GetProductsResponse>(
    "/products",
    config,
  );

  return response.data;
}

export async function createProducts(
  data: CreateProductDto,
  config?: ApiRequestConfig,
): Promise<CreateProductsResponse> {
  const response = await orderApiClient.post<CreateProductsResponse>(
    "/products",
    data,
    config,
  );

  return response.data;
}

export async function deleteProductsById(
  pathParams: DeleteProductsByIdPathParams,
  config?: ApiRequestConfig,
): Promise<DeleteProductsByIdResponse> {
  const response = await orderApiClient.delete<DeleteProductsByIdResponse>(
    buildPath("/products/{id}", pathParams),
    config,
  );

  return response.data;
}

export async function getProductsById(
  pathParams: GetProductsByIdPathParams,
  config?: ApiRequestConfig,
): Promise<GetProductsByIdResponse> {
  const response = await orderApiClient.get<GetProductsByIdResponse>(
    buildPath("/products/{id}", pathParams),
    config,
  );

  return response.data;
}

export async function updateProductsById(
  pathParams: UpdateProductsByIdPathParams,
  data: UpdateProductDto,
  config?: ApiRequestConfig,
): Promise<UpdateProductsByIdResponse> {
  const response = await orderApiClient.patch<UpdateProductsByIdResponse>(
    buildPath("/products/{id}", pathParams),
    data,
    config,
  );

  return response.data;
}
