import { createApiClient, buildPath, mergeQueryConfig, type ApiRequestConfig } from "@/lib/api/http";

interface LoginResponse {
  access_token: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export const authApiClient = createApiClient(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3010",
);

export type ApiEnvelope<T> = {
  code: number;
  data: T;
  message: string;
};

/**
 * 用户登录
 */
export async function login(
  data: LoginDto,
  config?: ApiRequestConfig,
): Promise<ApiEnvelope<LoginResponse>> {
  const response = await authApiClient.post<ApiEnvelope<LoginResponse>>(
    "/auth/login",
    data,
    config,
  );

  return response.data;
}