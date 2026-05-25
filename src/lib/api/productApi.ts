import { createApiClient, buildPath, type ApiRequestConfig, ApiEnvelope } from "./http";

export const productServiceApiClient = createApiClient(
  process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:3010",
);

export type ProductStatus = "active" | "inactive" | (string & {});

export type ProductRecord = {
  id: string;
  name: string;
  price: string;
  stock: number;
  status: ProductStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ProductsListMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductsListPayload = {
  data: ProductRecord[];
  meta: ProductsListMeta;
};

export type GetProductsResponse = ApiEnvelope<ProductsListPayload>;

export type GetProductsCountResponse = ApiEnvelope<{
  total: number;
}>;

export type CreateProductDto = {
  name: string;
  price: number;
  stock: number;
  status?: ProductStatus;
  description?: string | null;
};

export type UpdateProductDto = {
  name?: string;
  price?: number;
  stock?: number;
  status?: ProductStatus;
  description?: string | null;
};


export async function getProductsCount(
  config?: ApiRequestConfig,
): Promise<GetProductsCountResponse> {
  const response = await productServiceApiClient.get<GetProductsCountResponse>(
    "/api/products/count",
    config,
  );

  return response.data;
}

export async function getProducts(
  config?: ApiRequestConfig,
): Promise<GetProductsResponse> {
  const response = await productServiceApiClient.get<GetProductsResponse>(
    "/api/products",
    config,
  );

  return response.data;
}

/** Unwraps paginated list envelope for dropdowns and simple consumers. */
export function selectProductRecords(response: GetProductsResponse): ProductRecord[] {
  return response.data?.data ?? [];
}

export type CreateProductsResponse = ApiEnvelope<ProductRecord>;


export type GetProductsByIdResponse = ApiEnvelope<ProductRecord>;

export type UpdateProductsByIdResponse = ApiEnvelope<ProductRecord>;

export interface DeleteProductsByIdPathParams {
  id: string;
}

export interface GetProductsByIdPathParams {
  id: string;
}

export interface UpdateProductsByIdPathParams {
  id: string;
}

export type DeleteProductsByIdResponse = void;

export async function createProducts(
  data: CreateProductDto,
  config?: ApiRequestConfig,
): Promise<CreateProductsResponse> {
  const response = await productServiceApiClient.post<CreateProductsResponse>(
    "/api/products",
    data,
    config,
  );

  return response.data;
}

export async function deleteProductsById(
  pathParams: DeleteProductsByIdPathParams,
  config?: ApiRequestConfig,
): Promise<DeleteProductsByIdResponse> {
  const response = await productServiceApiClient.delete<DeleteProductsByIdResponse>(
    buildPath("/api/products/{id}", pathParams),
    config,
  );

  return response.data;
}

export async function getProductsById(
  pathParams: GetProductsByIdPathParams,
  config?: ApiRequestConfig,
): Promise<GetProductsByIdResponse> {
  const response = await productServiceApiClient.get<GetProductsByIdResponse>(
    buildPath("/api/products/{id}", pathParams),
    config,
  );

  return response.data;
}

export async function updateProductsById(
  pathParams: UpdateProductsByIdPathParams,
  data: UpdateProductDto,
  config?: ApiRequestConfig,
): Promise<UpdateProductsByIdResponse> {
  const response = await productServiceApiClient.patch<UpdateProductsByIdResponse>(
    buildPath("/api/products/{id}", pathParams),
    data,
    config,
  );

  return response.data;
}
