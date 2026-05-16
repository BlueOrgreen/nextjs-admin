import { createApiClient, type ApiEnvelope } from "@/lib/api/http";

interface LoginResponse {
  access_token: string;
}

interface LoginDto {
  email: string;
  password: string;
}

const authApiClient = createApiClient(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3010",
);

export async function login(data: LoginDto): Promise<ApiEnvelope<LoginResponse>> {
  const response = await authApiClient.post<ApiEnvelope<LoginResponse>>(
    "/auth/login",
    data,
    {
      withCredentials: true,
    },
  );

  if (response.status !== 200) {
    throw new Error(`Login failed with status: ${response.status}`);
  }

  return response.data;
}