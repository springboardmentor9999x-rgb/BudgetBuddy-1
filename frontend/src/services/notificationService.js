import api from "./api";

// ==========================================
// GET ALL NOTIFICATIONS
// ==========================================

export const getNotifications = async () => {
  const response = await api.get("/notifications/");
  return response.data;
};

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (
  notificationId
) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

// ==========================================
// GENERATE MONTHLY REPORT NOTIFICATION
// ==========================================

export const generateMonthlyReportNotification = async (
  year,
  month
) => {
  const response = await api.post(
    "/notifications/generate-monthly-report",
    null,
    {
      params: {
        year,
        month,
      },
    }
  );

  return response.data;
};