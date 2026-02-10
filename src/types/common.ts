// Shared API response wrapper (matching backend ApiResponse<T>)
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  error: string | null;
  data: T;
  errors: string[] | null;
}
