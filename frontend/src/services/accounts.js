import api from "./api";


// Get all registered bank accounts
export const getAccounts = async () => {
  const response = await api.get("/accounts/");
  return response.data;
};


// Get one bank account
export const getAccount = async (accountId) => {
  const response = await api.get(`/accounts/${accountId}`);
  return response.data;
};


// Add bank account
export const createAccount = async (accountData) => {
  const response = await api.post("/accounts/", accountData);
  return response.data;
};


// Update bank account
export const updateAccount = async (accountId, accountData) => {
  const response = await api.put(
    `/accounts/${accountId}`,
    accountData
  );

  return response.data;
};


// Delete bank account
export const deleteAccount = async (accountId) => {
  const response = await api.delete(`/accounts/${accountId}`);
  return response.data;
};