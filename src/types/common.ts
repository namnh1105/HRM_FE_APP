// Shared API response wrapper (matching backend ApiResponse<T>)
export interface ApiResponse<T> {
  success: boolean;
  code: string | null;
  message: string | null;
  data: T;
  errors: string[] | null;
  timestamp: string;
}
