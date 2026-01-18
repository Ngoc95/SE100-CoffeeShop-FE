import axios from './axiosClient'

export const getInventoryItems = (params?: {
  search?: string
  categoryId?: string
}) => {
  return axios.get('/inventory-items', {
    params: {
      itemTypeId: 'PRODUCT',
      saleStatus: 'ACTIVE',
      ...params
    }
  })
}

// Fetch topping items (itemTypeId = 'TOPPING')
export const getToppingItems = (params?: { search?: string }) => {
  return axios.get('/inventory-items', {
    params: {
      itemTypeId: 'TOPPING',
      saleStatus: 'ACTIVE',
      ...params
    }
  })
}
