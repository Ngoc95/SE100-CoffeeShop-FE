import axiosClient from './axiosClient'

export const getCustomers = (params?: Record<string, any>) => {
  return axiosClient.get('/customers', { params })
}

export const deleteCustomer = (id: number) => {
  return axiosClient.delete(`/customers/${id}`)
}

export const updateCustomer = (
  id: number,
  name?: string,
  phone?: string,
  city?: string,
  gender?: string,
  birthday?: string,
  address?: string,
  isActive?: boolean
) => {
  let params: Record<string, any> = {
    "name": name,
    "phone": phone,
    "city": city,
    "gender": gender,
    "birthday": birthday,
    "address": address,
    "isActive": isActive
  }
  if (params["birthday"] === null) params["birthday"] = "2026-01-16"
  return axiosClient.patch(`/customers/${id}`, params)
}
