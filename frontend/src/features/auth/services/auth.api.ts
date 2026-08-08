import { api } from "../../../api/api";

import type { registerUser } from "../types/auth.type";

async function loginApi(email: string, password: string) {
  try {
    const response = await api.post("/auth/login", { username: email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function registerApi({ email, password, full_name, monthly_income, currency }: registerUser) {
  try {
    const response = await api.post("/auth/signup", { email, password, full_name, monthly_income, currency });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function verifyOtpApi(email: string, otp: string) {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function refreshTokenApi() {
  try {
    const response = await api.get("/auth/refresh-token");
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function logoutApi() {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getUserProfileApi() {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export {
  loginApi,
  registerApi,
  verifyOtpApi,
  refreshTokenApi,
  logoutApi,
  getUserProfileApi
};