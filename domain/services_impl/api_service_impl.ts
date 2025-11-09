// src/domain/services/api_service_impl.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";
import qs from "qs";
import { ApiService } from "../services/api_service";

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "https://api.campusconnect.com") + "/api";

// simple refresh lock so we don't refresh multiple times in parallel
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

export class ApiServiceImpl implements ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      // repeat array keys: ?tags=A&tags=B
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat", skipNulls: true }),
        timeout: 15000,
    });

    // Request interceptor: attach access token if present
    this.client.interceptors.request.use(async (config) => {
     const token = await AsyncStorage.getItem("access_token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: handle 401 and try refresh once
    this.client.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const original = error.config as any;
        const status = error.response?.status;

        // If 401 and we haven't retried yet
        if (status === 401 && !original?._retry) {
          original._retry = true;

          if (isRefreshing) {
            // wait until the ongoing refresh finishes
            await new Promise<void>((resolve) => pendingRequests.push(resolve));
          } else {
            try {
              isRefreshing = true;
              await this.refreshToken();
            } finally {
              isRefreshing = false;
              // let all queued requests continue
              pendingRequests.forEach((resolve) => resolve());
              pendingRequests = [];
            }
          }

          // After refresh, retry the original request with new token
          const newToken = await AsyncStorage.getItem("access_token");
          original.headers = original.headers ?? {};
          if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
          return this.client.request(original);
        }

        // Re-throw other errors
        return Promise.reject(error);
      }
    );
  }

  //  Refresh flow
  private async refreshToken(): Promise<void> {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("Missing refresh token");

    const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken }, {
      headers: { "Content-Type": "application/json" },
    });

    const data = res.data as { accessToken: string; refreshToken: string };
    if (!data?.accessToken) throw new Error("Token refresh failed");

    await AsyncStorage.setItem("access_token", data.accessToken);
    if (data.refreshToken) {
      await AsyncStorage.setItem("refresh_token", data.refreshToken);
    }
  }

  //  Public contract
  async get<T>(endpoint: string, params?: Record<string, any>, _auth = false): Promise<T> {
    const res = await this.client.get<T>(endpoint, { params });
    return res.data;
  }

  async post<T>(endpoint: string, body?: Record<string, any>, _auth = false): Promise<T> {
    const res = await this.client.post<T>(endpoint, body);
    return res.data;
  }

  async put<T>(endpoint: string, body?: Record<string, any>, _auth = false): Promise<T> {
    const res = await this.client.put<T>(endpoint, body);
    return res.data;
  }

  async delete<T>(endpoint: string, _auth = false): Promise<T> {
    const res = await this.client.delete<T>(endpoint);
    return res.data;
  }
}
