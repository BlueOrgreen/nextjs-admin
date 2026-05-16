import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export type ApiEnvelope<T> = {
  code: number;
  data: T;
  message: string;
};

export type ApiRequestConfig = AxiosRequestConfig;

export function createApiClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });
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
