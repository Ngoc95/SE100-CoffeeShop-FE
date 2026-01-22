import axiosClient from './axiosClient'

export const getCategories = () => {
  return axiosClient.get('/categories')
}
