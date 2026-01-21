import axiosClient from './axiosClient'

export const getSuppliers = (params?: Record<string, any>) => {
    return axiosClient.get('/suppliers', { params })
}