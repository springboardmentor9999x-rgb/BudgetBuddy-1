import { api } from "../../../api/api.ts";

export interface AdminUserListItem {
  id: number;
  email: string;
  role: 'user' | 'premium' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  full_name?: string | null;
  monthly_income?: number;
  currency?: string;
  account_count: number;
  budget_count: number;
  goal_count: number;
  transaction_count: number;
}

export interface AdminUserListResponse {
  total: number;
  page: number;
  page_size: number;
  users: AdminUserListItem[];
}

export interface CrossUserDataResponse {
  user_id: number;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  full_name?: string | null;
  monthly_income: number;
  currency: string;
  created_at: string;
  accounts: Array<{
    id: number;
    bank_name: string;
    account_number: string;
    balance: number;
  }>;
  budgets: Array<{
    id: number;
    category: string;
    monthly_limit: number;
    created_at?: string;
  }>;
  saving_goals: Array<{
    id: number;
    goal_name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
  }>;
  recent_expenses: Array<{
    id: number;
    category: string;
    amount: number;
    description: string;
    date: string;
    account?: string;
  }>;
  recent_incomes: Array<{
    id: number;
    source: string;
    amount: number;
    date: string;
    account?: string;
  }>;
  total_balance: number;
  total_income_logged: number;
  total_expense_logged: number;
}

export interface SystemAnalyticsResponse {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  users_by_role: {
    user: number;
    premium: number;
    admin: number;
  };
  total_platform_income: number;
  total_platform_expenses: number;
  total_platform_liquidity: number;
  total_budgets_created: number;
  total_goals_created: number;
  total_transactions_count: number;
  monthly_signups: Array<{ month: string; signups: number }>;
}

export interface AuditLogItem {
  id: number;
  user_id?: number | null;
  user_email?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  details?: string | null;
  ip_address?: string | null;
  status: string;
  created_at: string;
}

export interface AuditLogListResponse {
  total: number;
  logs: AuditLogItem[];
}

export async function fetchAdminUsersApi(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}): Promise<AdminUserListResponse> {
  const response = await api.get('/admin/users', { params });
  return response.data;
}

export async function fetchCrossUserDataApi(userId: number): Promise<CrossUserDataResponse> {
  const response = await api.get(`/admin/users/${userId}/data`);
  return response.data;
}

export async function updateUserRoleApi(userId: number, role: string): Promise<AdminUserListItem> {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function updateUserStatusApi(userId: number, is_active: boolean): Promise<AdminUserListItem> {
  const response = await api.put(`/admin/users/${userId}/status`, { is_active });
  return response.data;
}

export async function deleteUserApi(userId: number): Promise<{ message: string }> {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
}

export async function fetchSystemAnalyticsApi(): Promise<SystemAnalyticsResponse> {
  const response = await api.get('/admin/system/analytics');
  return response.data;
}

export async function fetchSystemLogsApi(params?: {
  page?: number;
  page_size?: number;
  action?: string;
  user_email?: string;
  status_filter?: string;
}): Promise<AuditLogListResponse> {
  const response = await api.get('/admin/system/logs', { params });
  return response.data;
}
