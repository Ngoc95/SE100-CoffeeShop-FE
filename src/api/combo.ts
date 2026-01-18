import axios from './axiosClient'

// Public for authenticated staff: get active combos for POS
export const getActiveCombos = (params?: { search?: string }) => {
  return axios.get('/combos/active', { params })
}

// Admin management endpoints (optional usage on FE)
export const getCombos = (params?: Record<string, any>) => {
  return axios.get('/combos', { params })
}

export const getComboById = (id: string | number) => {
  return axios.get(`/combos/${id}`)
}

export const createCombo = (payload: any) => {
  return axios.post('/combos', payload)
}

export const updateCombo = (id: string | number, payload: any) => {
  return axios.patch(`/combos/${id}`, payload)
}

export const toggleComboActive = (id: string | number) => {
  return axios.patch(`/combos/${id}/toggle-active`)
}

export const deleteCombo = (id: string | number) => {
  return axios.delete(`/combos/${id}`)
}
