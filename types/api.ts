export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  error: null;
  success: true;
}

export interface ApiErrorResponse {
  data: null;
  error: ApiError;
  success: false;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
