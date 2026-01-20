import axiosClient from './axiosClient';

// Utility to standardize response extraction
const unwrap = (res: any) => res?.data?.metaData ?? res?.data ?? res;

// Transactions
export const getFinanceTransactions = (params?: Record<string, any>) => {
  return axiosClient.get('/finance/transactions', { params });
};

export const getFinanceTransactionById = (id: string | number) => {
  return axiosClient.get(`/finance/transactions/${id}`);
};

export const createFinanceTransaction = (data: any) => {
  return axiosClient.post('/finance/transactions', data);
};

export const updateFinanceTransaction = (id: string | number, data: any) => {
  return axiosClient.patch(`/finance/transactions/${id}`, data);
};

export const deleteFinanceTransaction = (id: string | number) => {
  return axiosClient.delete(`/finance/transactions/${id}`);
};

export const exportFinanceTransactions = (params?: Record<string, any>) => {
  return axiosClient.get('/finance/export', { params, responseType: 'blob' });
};

// Categories
export const getFinanceCategories = () => {
  return axiosClient.get('/finance/categories');
};

export const createFinanceCategory = (data: any) => {
  return axiosClient.post('/finance/categories', data);
};

export const updateFinanceCategory = (id: string | number, data: any) => {
  return axiosClient.patch(`/finance/categories/${id}`, data);
};

export const deleteFinanceCategory = (id: string | number) => {
  return axiosClient.delete(`/finance/categories/${id}`);
};

// Bank Accounts
export const getBankAccounts = () => {
  return axiosClient.get('/finance/bank-accounts');
};

export const createBankAccount = (data: any) => {
  return axiosClient.post('/finance/bank-accounts', data);
};

export const updateBankAccount = (id: string | number, data: any) => {
  return axiosClient.patch(`/finance/bank-accounts/${id}`, data);
};

export const deleteBankAccount = (id: string | number) => {
  return axiosClient.delete(`/finance/bank-accounts/${id}`);
};

// Finance Persons
export const getFinancePersons = () => {
  return axiosClient.get('/finance/persons');
};

export const createFinancePerson = (data: any) => {
  return axiosClient.post('/finance/persons', data);
};

export const updateFinancePerson = (id: string | number, data: any) => {
  return axiosClient.patch(`/finance/persons/${id}`, data);
};

export const deleteFinancePerson = (id: string | number) => {
  return axiosClient.delete(`/finance/persons/${id}`);
};
