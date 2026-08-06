// api.ts
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/AuthStore";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    // accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  async (error: AxiosError) => {
    return Promise.reject(error);
  }
);

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
      const res = await refreshClient.get("/auth/refresh-token");
      const newAccessToken = res.data.access_token;

      useAuthStore.getState().setAccessToken(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api.request(originalRequest);
    } catch (err) {
      useAuthStore.getState().logout();
      return Promise.reject(err);
    }
  }
);
