import axiosClient from './axiosClient'

export const getTables = (params?: any) => {
  return axiosClient.get('/tables', { params })
}

