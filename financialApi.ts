import { apiClient } from './api';

export const financialApi = {
  // Income
  async getIncomes(month?: string) {
    const res = await apiClient.get('/income', { params: { month } });
    return res.data.data || res.data.incomes || [];
  },

  async createIncome(data: any) {
    const res = await apiClient.post('/income', data);
    return res.data.data || res.data.income;
  },

  async updateIncome(id: string, data: any) {
    const res = await apiClient.put(`/income/${id}`, data);
    return res.data.data || res.data.income;
  },

  async deleteIncome(id: string) {
    const res = await apiClient.delete(`/income/${id}`);
    return res.data;
  },

  // Expenses
  async getExpenses(month?: string) {
    const res = await apiClient.get('/expenses', { params: { month } });
    return res.data.data || res.data.expenses || [];
  },

  async createExpense(data: any) {
    const res = await apiClient.post('/expenses', data);
    return res.data.data || res.data.expense;
  },

  async updateExpense(id: string, data: any) {
    const res = await apiClient.put(`/expenses/${id}`, data);
    return res.data.data || res.data.expense;
  },

  async deleteExpense(id: string) {
    const res = await apiClient.delete(`/expenses/${id}`);
    return res.data;
  },

  // Budgets
  async getBudgets(monthYear?: string) {
    const res = await apiClient.get('/budgets', { params: { monthYear } });
    return res.data.data || res.data.budgets || [];
  },

  async saveBudget(data: any) {
    const res = await apiClient.post('/budgets', data);
    return res.data.data || res.data.budget;
  },

  async deleteBudget(id: string) {
    const res = await apiClient.delete(`/budgets/${id}`);
    return res.data;
  },

  // Savings Goals
  async getGoals() {
    const res = await apiClient.get('/goals');
    return res.data.data || res.data.goals || [];
  },

  async createGoal(data: any) {
    const res = await apiClient.post('/goals', data);
    return res.data.data || res.data.goal;
  },

  async updateGoal(id: string, data: any) {
    const res = await apiClient.put(`/goals/${id}`, data);
    return res.data.data || res.data.goal;
  },

  async depositToGoal(id: string, amount: number) {
    const res = await apiClient.post(`/goals/${id}/deposit`, { amount });
    return res.data.data || res.data.goal;
  },

  async deleteGoal(id: string) {
    const res = await apiClient.delete(`/goals/${id}`);
    return res.data;
  },

  // Bills
  async getBills() {
    const res = await apiClient.get('/bills');
    return res.data.data || res.data.bills || [];
  },

  async createBill(data: any) {
    const res = await apiClient.post('/bills', data);
    return res.data.data || res.data.bill;
  },

  async payBill(id: string) {
    const res = await apiClient.post(`/bills/${id}/pay`);
    return res.data.data || res.data.bill;
  },

  async deleteBill(id: string) {
    const res = await apiClient.delete(`/bills/${id}`);
    return res.data;
  },

  // Auth
  async login(credentials: { email?: string; password?: string; personaId?: string; loginMode?: 'admin' | 'user' }) {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  async register(data: { fullName: string; email: string; password?: string; role?: string; currency?: string; monthlyIncomeGoal?: number }) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async verifyCode(email: string, code: string) {
    const res = await apiClient.post('/auth/verify-code', { email, code });
    if (res.data.token) {
      localStorage.setItem('budgetbuddy_jwt_token_v1', res.data.token);
      if (res.data.user?.id) {
        localStorage.setItem('budgetbuddy_user_id_v1', res.data.user.id);
      }
    }
    return res.data;
  },

  async sendVerification(email: string) {
    const res = await apiClient.post('/auth/send-verification', { email });
    return res.data;
  },

  async getCurrentUser() {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },
};
