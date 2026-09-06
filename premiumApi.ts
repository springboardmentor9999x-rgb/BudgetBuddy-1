import { apiClient } from './api';
import {
  PremiumPlan,
  UserSubscriptionState,
  FinancialHealthScoreResponse,
  FinancialInsightItem,
  ForecastsResponse,
  ScheduledReportItem,
} from '../types/premium';

export const premiumApi = {
  // Available Plans
  async getPlans(): Promise<PremiumPlan[]> {
    const res = await apiClient.get('/premium/plans');
    return res.data.data || [];
  },

  // Upgrade / Subscribe
  async subscribe(planCode: string, paymentProvider: string = 'BUDGETBUDDY_GATEWAY') {
    const res = await apiClient.post('/premium/subscribe', { planCode, paymentProvider });
    return res.data;
  },

  // Cancel Subscription
  async cancelSubscription() {
    const res = await apiClient.post('/premium/cancel');
    return res.data;
  },

  // Current Subscription State
  async getSubscriptionStatus(): Promise<UserSubscriptionState> {
    const res = await apiClient.get('/premium/subscription');
    return res.data;
  },

  // Advanced Analytics
  async getAnalytics() {
    const res = await apiClient.get('/premium/analytics');
    return res.data.data;
  },

  // Financial Health Score
  async getHealthScore(): Promise<FinancialHealthScoreResponse> {
    const res = await apiClient.get('/premium/health-score');
    return res.data.data;
  },

  // Smart Financial Insights
  async getInsights(): Promise<FinancialInsightItem[]> {
    const res = await apiClient.get('/premium/insights');
    return res.data.data || [];
  },

  // Forecasts & Projections
  async getForecasts(): Promise<ForecastsResponse> {
    const res = await apiClient.get('/premium/forecasts');
    return res.data.data;
  },

  // Scheduled Reports
  async getScheduledReports(): Promise<ScheduledReportItem[]> {
    const res = await apiClient.get('/premium/reports/scheduled');
    return res.data.data || [];
  },

  async createScheduledReport(data: { reportType: string; frequency: string; format: string }) {
    const res = await apiClient.post('/premium/reports/scheduled', data);
    return res.data;
  },

  async deleteScheduledReport(id: string) {
    const res = await apiClient.delete(`/premium/reports/scheduled/${id}`);
    return res.data;
  },

  // Custom Categories
  async getCustomCategories() {
    const res = await apiClient.get('/premium/categories');
    return res.data.data || [];
  },

  async createCustomCategory(data: { name: string; type: 'income' | 'expense'; icon?: string; color?: string }) {
    const res = await apiClient.post('/premium/categories', data);
    return res.data;
  },
};
