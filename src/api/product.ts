import http, { ApiSuccessResponse } from "@/lib/http";
import { CategoryResponse } from "./category";
export const productKey = "Product";

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category: CategoryResponse;
  image_url: string;
}

export interface ProductFilterParams {
  categoryId?: string | null;
  search?: string | null;
}

export const getFilteredProducts = async (filter: ProductFilterParams) => {
  return http
    .get<ApiSuccessResponse<ProductResponse[]>>("Product", {
      params: filter,
    })
    .then((res) => res.data);
};

export const createProduct = async (data: FormData) =>
  http
    .post<ApiSuccessResponse<ProductResponse>>("Product", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
