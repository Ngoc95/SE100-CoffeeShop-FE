import axiosClient from "./axiosClient";

/**
 * Get recipe for an item
 */
export const getItemRecipe = async (itemId: number | string) => {
  return axiosClient.get(`/orders/kitchen/items/${itemId}/recipe`);
};

/**
 * Report item out of stock
 */
export const reportOutOfStock = async (itemId: number | string, payload: { ingredients?: string[], reason?: string }) => {
  return axiosClient.post(`/orders/kitchen/items/${itemId}/out-of-stock`, payload);
};
