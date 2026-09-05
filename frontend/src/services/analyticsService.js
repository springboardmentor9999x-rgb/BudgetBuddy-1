import api from "./api";

// ==========================================
// GET ANALYTICS SUMMARY
// ==========================================

export const getAnalyticsSummary = async () => {
  const response = await api.get("/analytics/summary");
  return response.data;
};


// ==========================================
// GET MONTHLY ANALYTICS
// ==========================================

export const getMonthlyAnalytics = async () => {
  const response = await api.get("/analytics/monthly");
  return response.data;
};


// ==========================================
// GET CATEGORY ANALYTICS
// ==========================================

export const getCategoryAnalytics = async () => {
  const response = await api.get("/analytics/categories");
  return response.data;
};


// ==========================================
// GET COMPLETE ANALYTICS
// ==========================================

export const getCompleteAnalytics = async () => {
  const response = await api.get("/analytics/overview");
  return response.data;
};
