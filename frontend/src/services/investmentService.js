import api from "./api";


// ==========================================
// GET ALL INVESTMENTS
// ==========================================

export const getInvestments = async () => {
  const response = await api.get("/investments/");
  return response.data;
};


// ==========================================
// GET INVESTMENT SUMMARY
// ==========================================

export const getInvestmentSummary = async () => {
  const response = await api.get("/investments/summary");
  return response.data;
};


// ==========================================
// CREATE INVESTMENT
// ==========================================

export const createInvestment = async (investmentData) => {
  const response = await api.post(
    "/investments/",
    investmentData
  );

  return response.data;
};


// ==========================================
// UPDATE INVESTMENT
// ==========================================

export const updateInvestment = async (
  investmentId,
  investmentData
) => {
  const response = await api.put(
    `/investments/${investmentId}`,
    investmentData
  );

  return response.data;
};


// ==========================================
// DELETE INVESTMENT
// ==========================================

export const deleteInvestment = async (investmentId) => {
  const response = await api.delete(
    `/investments/${investmentId}`
  );

  return response.data;
};