/**
 * Auto-generated from User Service API
 * Source: http://localhost:3001/docs-json
 * Generated at: 2026-04-27T08:59:00.634Z
 */

import { createApiClient, buildPath, mergeQueryConfig, type ApiRequestConfig } from "./http";

export const userApiClient = createApiClient(
  process.env.NEXT_PUBLIC_USER_API_BASE_URL ?? "http://localhost:3010",
);

export type ApiEnvelope<T> = {
  code: number;
  data: T;
  message: string;
};

export type UserRole = "user" | "admin";

export type HealthCheckItem = {
  status: string;
  [key: string]: unknown;
};

export type HealthCheckPayload = {
  status: string;
  info?: Record<string, HealthCheckItem> | null;
  error?: Record<string, HealthCheckItem> | null;
  details?: Record<string, HealthCheckItem>;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type CreateUserDto = {
  name: string;
  email: string;
  role: UserRole;
};

export type UpdateUserDto = {
  name?: string;
  email?: string;
  role?: UserRole;
};

export type GetHealthResponse = ApiEnvelope<HealthCheckPayload>;

export type GetUsersResponse = ApiEnvelope<UserRecord[]>;

export type CreateUsersResponse = ApiEnvelope<UserRecord>;

export interface DeleteUsersByIdPathParams {
  id: string;
}

export type DeleteUsersByIdResponse = void;

export interface GetUsersByIdPathParams {
  id: string;
}

export type GetUsersByIdResponse = ApiEnvelope<UserRecord>;

export interface UpdateUsersByIdPathParams {
  id: string;
}

export type UpdateUsersByIdResponse = ApiEnvelope<UserRecord>;

/**
 * 数据库健康检查
 */
export async function getHealth(
  config?: ApiRequestConfig,
): Promise<GetHealthResponse> {
  const response = await userApiClient.get<GetHealthResponse>(
    "/health/user",
    config,
  );

  return response.data;
}

/**
 * 获取所有用户（按创建时间倒序）
 */
export async function getUsers(
  config?: ApiRequestConfig,
): Promise<GetUsersResponse> {
  const response = await userApiClient.get<GetUsersResponse>(
    "/api/users",
    config,
  );

  return response.data;
}

/**
 * 创建新用户
 */
export async function createUsers(
  data: CreateUserDto,
  config?: ApiRequestConfig,
): Promise<CreateUsersResponse> {
  const response = await userApiClient.post<CreateUsersResponse>(
    "/api/users",
    data,
    config,
  );

  return response.data;
}

/**
 * 删除用户
 */
export async function deleteUsersById(
  pathParams: DeleteUsersByIdPathParams,
  config?: ApiRequestConfig,
): Promise<DeleteUsersByIdResponse> {
  const response = await userApiClient.delete<DeleteUsersByIdResponse>(
    buildPath("/api/users/{id}", pathParams),
    config,
  );

  return response.data;
}

/**
 * 根据 UUID 获取单个用户
 */
export async function getUsersById(
  pathParams: GetUsersByIdPathParams,
  config?: ApiRequestConfig,
): Promise<GetUsersByIdResponse> {
  const response = await userApiClient.get<GetUsersByIdResponse>(
    buildPath("/api/users/{id}", pathParams),
    config,
  );

  return response.data;
}

/**
 * 部分更新用户信息
 */
export async function updateUsersById(
  pathParams: UpdateUsersByIdPathParams,
  data: UpdateUserDto,
  config?: ApiRequestConfig,
): Promise<UpdateUsersByIdResponse> {
  const response = await userApiClient.patch<UpdateUsersByIdResponse>(
    buildPath("/api/users/{id}", pathParams),
    data,
    config,
  );

  return response.data;
}
