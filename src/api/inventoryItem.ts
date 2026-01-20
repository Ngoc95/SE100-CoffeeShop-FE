import axios from './axiosClient'

export interface InventoryItemQuery {
  search?: string
  categoryId?: number | string
  itemTypeId?: number // 1=ready_made, 2=composite, 3=ingredient
  isTopping?: boolean
  excludeIngredients?: boolean
  productStatus?: string | string[] // 'normal', 'hot', 'slow', 'paused'
  limit?: number
  page?: number
}

export interface InventoryItemResponse {
  items: InventoryItem[]
  total: number
  currentPage: number
  totalPages: number
}

export interface InventoryItem {
  id: number
  code: string
  name: string
  sellingPrice?: number
  imageUrl?: string | null
  currentStock?: number
  category?: { id: number; name: string }
  unit?: { id: number; name: string; symbol?: string }
  itemType?: { id: number; name: string }
  isTopping?: boolean
  productStatus?: string
  availableToppings?: Array<{
    topping: { id: number; name: string; sellingPrice?: number }
  }>
}

// Fetch sellable items (NOT ingredients, NOT toppings)
// For POS menu display
export const getInventoryItems = (params?: InventoryItemQuery) => {
  return axios.get('/inventory-items', {
    params: {
      excludeIngredients: true,
      isTopping: false,
      limit: params?.limit ?? 50,
      page: params?.page ?? 1,
      ...params,
    }
  })
}

// Fetch topping items - items that have isTopping = true
export const getToppingItems = (params?: { search?: string; limit?: number; page?: number }) => {
  return axios.get('/inventory-items', {
    params: {
      isTopping: true,
      limit: params?.limit ?? 50,
      page: params?.page ?? 1,
      ...params
    }
  })
}

// Get single item with details (including available toppings)
export const getItemById = (id: number | string) => {
  return axios.get(`/inventory-items/${id}`)
}

// Helper to extract items from API response
export const extractInventoryItems = (res: any): { items: InventoryItem[]; pagination?: any } => {
  const data = res?.data?.metaData ?? res?.data ?? res
  
  // If response has items array
  if (data?.items) {
    return {
      items: data.items,
      pagination: {
        total: data.total,
        currentPage: data.currentPage,
        totalPages: data.totalPages
      }
    }
  }
  
  // If response is array directly
  if (Array.isArray(data)) {
    return { items: data }
  }
  
  return { items: [] }
}
