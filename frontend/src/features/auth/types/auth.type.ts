/**
 * Type for registering a new user
 * Fields:
 * - email: string
 * - password: string
 * - full_name: string
 * - monthly_income: number
 * - currency: string
 */
type registerUser = {
  email: string;
  password: string;
  full_name: string;
  monthly_income: number;
  currency: string;
};

export type { registerUser };