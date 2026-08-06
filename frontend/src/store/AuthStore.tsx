// store/authStore.js
import { create } from 'zustand';

type profile = {
  full_name: string;
  monthly_income: string;
  currency: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  profile: profile;
};

type AuthStore = {
  user: User | null;
  accessToken: string | null;
  email: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setEmail: (email: string | null) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  email: null,

  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setEmail: (email) => set({ email }),
  login: (user, accessToken) => set({ user, accessToken }),
  logout: () => set({ user: null, accessToken: null }),
}));