import axiosClient from './axiosClient';

export interface Supplier {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
}

export const supplierApi = {
  getAll: (params: any) => {
    return axiosClient.get('/suppliers', { params });
  },
  getById: (id: number) => {
    return axiosClient.get(`/suppliers/${id}`);
  },
  getCategories: () => {
    return axiosClient.get('/suppliers/categories');
  }
};

export default supplierApi;
