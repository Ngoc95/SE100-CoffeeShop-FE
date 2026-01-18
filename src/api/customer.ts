import axiosClient from './axiosClient'

export const getCustomers = (params?: Record<string, any>) => {
  return axiosClient.get('/customers', { params })
}
