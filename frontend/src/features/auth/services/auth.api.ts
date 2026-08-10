import { api } from "../../../api/api";
import type { registerUser } from "../types/auth.type";

async function loginApi(email: string, password: string) {
  const response = await api.post("/auth/login", { username: email, password });
  return response.data;
}

async function registerApi({ email, password, full_name, monthly_income, currency }: registerUser) {
  const response = await api.post("/auth/signup", { email, password, full_name, monthly_income, currency });
  return response.data;
}

async function verifyOtpApi(email: string, otp: string) {
  const response = await api.post("/auth/verify-otp", { email, otp });
  return response.data;
}

async function refreshTokenApi() {
  const response = await api.get("/auth/refresh-token");
  return response.data;
}

async function logoutApi() {
  const response = await api.get("/auth/logout");
  return response.data;
}

async function getUserProfileApi() {
  const response = await api.get("/auth/me");
  return response.data;
}

export {
  loginApi,
  registerApi,
  verifyOtpApi,
  refreshTokenApi,
  logoutApi,
  getUserProfileApi
};