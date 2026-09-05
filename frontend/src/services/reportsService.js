import api from "./api";

// ==========================================
// GET FINANCIAL REPORT
// ==========================================

export const getReport = async ({
  period = "month",
  startDate = null,
  endDate = null,
} = {}) => {
  const params = {
    period,
  };

  if (period === "custom") {
    params.start_date = startDate;
    params.end_date = endDate;
  }

  const response = await api.get(
    "/reports/",
    {
      params,
    }
  );

  return response.data;
};


// ==========================================
// DOWNLOAD FINANCIAL REPORT PDF
// ==========================================

export const downloadReportPdf = async ({
  period = "month",
  startDate = null,
  endDate = null,
} = {}) => {
  const params = {
    period,
  };

  if (period === "custom") {
    params.start_date = startDate;
    params.end_date = endDate;
  }

  const response = await api.get(
    "/reports/pdf",
    {
      params,
      responseType: "blob",
    }
  );

  return response;
};

// ==========================================
// DOWNLOAD FINANCIAL REPORT EXCEL
// ==========================================

export const downloadReportExcel = async ({
  period = "month",
  startDate = null,
  endDate = null,
} = {}) => {
  const params = {
    period,
  };

  if (period === "custom") {
    params.start_date = startDate;
    params.end_date = endDate;
  }

  const response = await api.get(
    "/reports/excel",
    {
      params,
      responseType: "blob",
    }
  );

  return response;
};
