/**
 * Auto-generated from User Service API
 * Source: http://localhost:3001/docs-json
 * Generated at: 2026-04-27T08:59:00.634Z
 */

import { createApiClient, buildPath, mergeQueryConfig, type ApiRequestConfig } from "./http";

export const userApiClient = createApiClient(
  process.env.NEXT_PUBLIC_USER_API_BASE_URL ?? "http://localhost:3001",
);

export type CreateUserDto = {
  name: string;
  email: string;
  role: "user" | "admin";
};

export type UpdateUserDto = {
  name?: string;
  email?: string;
  role?: "user" | "admin";
};

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

export type GetUsersResponse = unknown;

export type CreateUsersResponse = unknown;

export interface DeleteUsersByIdPathParams {
  id: string;
}

export type DeleteUsersByIdResponse = void;

export interface GetUsersByIdPathParams {
  id: string;
}

export type GetUsersByIdResponse = unknown;

export interface UpdateUsersByIdPathParams {
  id: string;
}

export type UpdateUsersByIdResponse = unknown;

/**
 * 数据库健康检查
 */
export async function getHealth(
  config?: ApiRequestConfig,
): Promise<GetHealthResponse> {
  const response = await userApiClient.get<GetHealthResponse>(
    "/health",
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
    "/users",
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
    "/users",
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
    buildPath("/users/{id}", pathParams),
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
    buildPath("/users/{id}", pathParams),
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
    buildPath("/users/{id}", pathParams),
    data,
    config,
  );

  return response.data;
}
