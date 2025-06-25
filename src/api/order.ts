import http, { ApiSuccessResponse } from "@/lib/http";
export const orderKey = "Order";

export interface OrderItemRequest {
  product_id: string;
  quantity: number;
  price: number;
}

export interface OrderCreateRequest {
  items: OrderItemRequest[];
}

export const checkOut = async (data: OrderCreateRequest) =>
  http.post<ApiSuccessResponse<boolean>>("Order", data).then((res) => res.data);
