import axiosClient from './axiosClient'

export const getCustomers = () => {
  return axiosClient.get('/customers')
}
