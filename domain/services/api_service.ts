export interface ApiService {
  get: <T>(endpoint: string, params?: Record<string, any>, auth?: boolean) => Promise<T>;
  post: <T>(endpoint: string, body?: unknown, auth?: boolean) => Promise<T>;
  put: <T>(endpoint: string, body?: unknown, auth?: boolean) => Promise<T>;
  delete: <T>(endpoint: string, auth?: boolean) => Promise<T>;
}