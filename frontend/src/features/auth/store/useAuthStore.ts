import { create } from "zustand";

import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  registerApi,
  verifyOtpApi,
  getUserProfileApi,
  upgradeTierApi,
} from "../services/auth.api.ts";

import type { registerUser, User, UserRole } from "../types/auth.type.ts";

type AuthStore = {
  user: User | null;
  email: string;

  loading: boolean;
  authInitialized: boolean;

  initializeAuth: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  register: (userData: registerUser) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<void>;
  upgradeTier: (tier: UserRole) => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  email: "",

  loading: false,
  authInitialized: false,

  initializeAuth: async () => {
    try {
      await refreshTokenApi();
      const user = await getUserProfileApi();
      set({
        user,
      });
    } catch {
      set({
        user: null,
      });
    } finally {
      set({
        authInitialized: true,
      });
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const data = await loginApi(email, password);

      set({
        user: data.user,
      });
    } finally {
      set({ loading: false });
    }
  },

  register: async (userData) => {
    set({ loading: true });

    try {
      await registerApi(userData);

      set({
        email: userData.email,
      });
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true });

    try {
      await verifyOtpApi(email, otp);

      set({
        email: "",
      });
    } finally {
      set({ loading: false });
    }
  },

  refreshToken: async () => {
    try {
      await refreshTokenApi();
    } catch (error) {
      set({
        user: null,
      });

      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });

    try {
      await logoutApi();

      set({
        user: null,
        email: "",
      });
    } finally {
      set({ loading: false });
    }
  },

  getUserProfile: async () => {
    try {
      const user = await getUserProfileApi();

      set({
        user,
      });
    } catch (error) {
      set({
        user: null,
      });

      throw error;
    }
  },

  upgradeTier: async (tier: UserRole) => {
    set({ loading: true });
    try {
      const updatedUser = await upgradeTierApi(tier);
      set({ user: updatedUser });
    } finally {
      set({ loading: false });
    }
  },
}));