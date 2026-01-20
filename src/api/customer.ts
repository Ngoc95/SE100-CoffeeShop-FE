import axiosClient from './axiosClient'

export const getCustomers = (params?: { search?: string }) => {
  return axiosClient.get('/customers', { params })
}

export const createCustomer = (payload: { name: string; phone: string; gender?: string }) => {
  return axiosClient.post('/customers', payload)
}
