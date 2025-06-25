import axios, { AxiosError } from "axios";

export interface ApiSuccessResponse<T = null | []> {
  code: number;
  message: string;
  data: T;
}

interface ErrorResponse {
  code: number;
  message: string;
  data: null;
}

const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_HOST}/api/`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiErrorResponse = AxiosError<ErrorResponse>;

export default http;
