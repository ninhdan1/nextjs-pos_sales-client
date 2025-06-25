import http, { ApiSuccessResponse } from "@/lib/http";
export const categoryKey = "Category";

export interface CategoryResponse {
  id: string;
  name: string;
}

export const getCategories = async () =>
  http
    .get<ApiSuccessResponse<CategoryResponse[]>>("Category")
    .then((res) => res.data);
