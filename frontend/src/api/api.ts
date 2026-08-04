// api.ts

import axios from "axios";
// import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// let accessToken: string | null = null;

// export function setAccessToken(token: string | null) {
//   accessToken = token;
// }

// export function getAccessToken() {
//   return accessToken;
// }

// // Request interceptor
// api.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   async (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
//     if (error.response?.status === 401) {
//       originalRequest._retry = true;
//       try {
//         const res = await api.get("/auth/refresh-token");
//         accessToken = res.data.access_token; // store in memory (see api.js)
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return api.request(originalRequest);
//       } catch (err) {
//         setAccessToken(null) // no valid refresh cookie → truly logged out
//         return Promise.reject(err);
//       }
//     }
//     return Promise.reject(error);
//   }
// );
