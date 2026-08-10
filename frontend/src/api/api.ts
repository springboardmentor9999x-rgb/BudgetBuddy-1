// api.ts
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../features/auth/store/useAuthStore.ts";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

// refresh interceptor
const refreshClient = axios.create({ baseURL: api.defaults.baseURL, withCredentials: true });
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthRoute = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh-token");
    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      // either not a 401, or  tried refreshing once or the request was to login/refresh, so just reject
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshClient.get("/auth/refresh-token");
      return api.request(originalRequest);
    } catch (err) {
      useAuthStore.getState().logout();
      return Promise.reject(err);
    }
  }
);
