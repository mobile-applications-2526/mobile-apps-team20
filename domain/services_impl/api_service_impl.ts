import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import qs from "qs";
import { ApiService } from "../services/api_service";
import { StorageType } from "../model/enums/storage_type";
import { useUserAuthStore } from "@/store/auth/use_auth_store";

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "https://api.campusconnect.com") + "/api";

export type AuthedAxiosRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
};

type PendingRequest = {
  resolve: () => void;
  reject: (err: any) => void;
};

export class ApiServiceImpl implements ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private pendingRequests: PendingRequest[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      paramsSerializer: {
        serialize: (params) =>
          qs.stringify(params, { arrayFormat: "repeat", skipNulls: true }),
      },
      timeout: 15000,
    });

    // ... Request interceptor (Kept the same) ...
    this.client.interceptors.request.use(async (config: AuthedAxiosRequestConfig) => {
       if (!config.skipAuth) {
         const token = await AsyncStorage.getItem(StorageType.ACCESS_TOKEN);
         if (token) {
           config.headers = config.headers ?? {};
           (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
         }
       }
       return config;
    });

    // ===== RESPONSE INTERCEPTOR =====
    this.client.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const original = error.config as (AuthedAxiosRequestConfig & { _retry?: boolean }) | undefined;
        const status = error.response?.status;

        // Check if error is 401 and it's not a retry and not public (skipAuth)
        if (status === 401 && original && !original._retry && !original.skipAuth) {
          original._retry = true;

          // --- CASE A: Refresh already in progress (CHECKING) ---
          if (this.isRefreshing) {
            try {
              // Wait for the leader to finish
              await new Promise<void>((resolve, reject) => {
                this.pendingRequests.push({ resolve, reject });
              });
              
              // If resolved, retry with new token
              const newToken = await AsyncStorage.getItem(StorageType.ACCESS_TOKEN);
              if (newToken) {
                original.headers = original.headers ?? {};
                (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
              }
              return this.client.request(original);
            } catch (err) {
              // If the leader failed, we just propagate the error.
              return Promise.reject(err);
            }
          }

          // --- CASE B: We are the Leader (Start Refresh) ---
          this.isRefreshing = true;

          try {
            await this.refreshToken();

            // Success: Notify queue
            this.pendingRequests.forEach(({ resolve }) => resolve());
            this.pendingRequests = [];

            // Retry original request
            const newToken = await AsyncStorage.getItem(StorageType.ACCESS_TOKEN);
            if (newToken) {
              original.headers = original.headers ?? {};
              (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
            }
            return this.client.request(original);

          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);

            // 1. Fail all pending requests
            this.pendingRequests.forEach(({ reject }) => reject(refreshError));
            this.pendingRequests = [];

            // 2. CRITICAL: Update Global State to NOT_AUTHENTICATED
            // This triggers the UI to switch to Login Screen
            useUserAuthStore.getState().clearUser();

            // 3. Return error to the caller
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }
  // ===== Refresh flow =====
  private async refreshToken(): Promise<void> {
    const refreshToken = await AsyncStorage.getItem(StorageType.REFRESH_TOKEN);
    const email = await AsyncStorage.getItem(StorageType.USER_CREDENTIALS);

    // Validate existence before calling API to avoid unnecessary 400/500s
    if (!refreshToken || !email) {
        throw new Error("Missing credentials for refresh");
    }

    const res = await this.client.post<{ accessToken: string; refreshToken?: string }>(
      "/auth/refresh-token",
      { refreshToken, email },
      { headers: { "Content-Type": "application/json" }, skipAuth: true } as AuthedAxiosRequestConfig,
    );

    const data = res.data;
    if (!data?.accessToken) throw new Error("Token refresh failed");

    await AsyncStorage.setItem(StorageType.ACCESS_TOKEN, data.accessToken);
    useUserAuthStore.getInitialState().setAccessToken(data.accessToken)

    if (data.refreshToken) {
      await AsyncStorage.setItem(StorageType.REFRESH_TOKEN, data.refreshToken);
    }
  }
  // ===== Public contract =====
  // _auth = true (default) -> authenticated call (adds token, refresh on 401)
  // _auth = false -> public call (no token, no refresh on 401)
  async get<T>(endpoint: string, params?: Record<string, unknown>, _auth = true): Promise<T> {
    const res = await this.client.get<T>(endpoint, {
      params,
      skipAuth: !_auth,
    } as AuthedAxiosRequestConfig);
    return res.data;
  }

  async post<T>(endpoint: string, body?: Record<string, unknown>, _auth = true): Promise<T> {
    const res = await this.client.post<T>(
      endpoint,
      body,
      { skipAuth: !_auth } as AuthedAxiosRequestConfig
    );
    return res.data;
  }

  async put<T>(endpoint: string, body?: Record<string, unknown>, _auth = true): Promise<T> {
    const res = await this.client.put<T>(
      endpoint,
      body,
      { skipAuth: !_auth } as AuthedAxiosRequestConfig
    );
    return res.data;
  }

  async delete<T>(endpoint: string, _auth = true): Promise<T> {
    const res = await this.client.delete<T>(
      endpoint,
      { skipAuth: !_auth } as AuthedAxiosRequestConfig
    );
    return res.data;
  }
}
