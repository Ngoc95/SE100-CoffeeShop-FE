import axiosClient from './axiosClient'

export const getAreas = () => {
  return axiosClient.get('/areas')
}
