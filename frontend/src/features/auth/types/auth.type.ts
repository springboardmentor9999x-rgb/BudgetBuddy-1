export type UserRole = 'user' | 'premium' | 'admin';

export type UserProfile = {
  full_name: string;
  monthly_income: number;
  currency: string;
};

export type User = {
  id: string | number;
  email: string;
  role: UserRole;
  is_verified?: boolean;
  is_active?: boolean;
  profile?: UserProfile | null;
};

export type registerUser = {
  email: string;
  password: string;
  full_name: string;
  monthly_income: number;
  currency: string;
};