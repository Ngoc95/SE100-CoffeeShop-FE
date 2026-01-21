import axiosClient from './axiosClient'

export const getCustomerGroups = (params?: Record<string, any>) => {
    return axiosClient.get('/customer-groups', { params })
}