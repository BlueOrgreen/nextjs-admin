import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export type ApiEnvelope<T> = {
  code: number;
  data: T;
  message: string;
};

export type ApiRequestConfig = AxiosRequestConfig;

export function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add Bearer token from cookie to all requests
  client.interceptors.request.use((config) => {
    if (typeof document === "undefined") {
      return config;
    }
    const cookieArr = document.cookie.split("; ");
    for (const cookie of cookieArr) {
      const [name, ...rest] = cookie.split("=");
      if (name.trim() === "access_token") {
        const token = rest.join("=");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        break;
      }
    }
    return config;
  });

  return client;
}

export function buildPath<TParams extends object>(
  template: string,
  params?: TParams,
) {
  if (!params) {
    return template;
  }

  const paramMap = params as Record<string, unknown>;

  return template.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = paramMap[key];

    if (value === undefined || value === null) {
      throw new Error(`Missing path param: ${key}`);
    }

    return encodeURIComponent(String(value));
  });
}

export function mergeQueryConfig<TQuery extends object>(
  query: TQuery,
  config?: ApiRequestConfig,
): ApiRequestConfig {
  const queryMap = query as Record<string, unknown>;
  const currentParams =
    config?.params && typeof config.params === "object"
      ? (config.params as Record<string, unknown>)
      : {};

  return {
    ...config,
    params: {
      ...queryMap,
      ...currentParams,
    },
  };
}
