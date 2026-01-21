import axiosClient from "./axiosClient";

// Query params for listing promotions
export interface PromotionsQuery {
  search?: string;
  typeId?: string | number;
  isActive?: boolean;
  limit?: number;
  page?: number;
  sort?: string; // e.g., "createdAt:desc"
}

export interface AvailablePromotionsPayload {
  orderId: number | string;
  customerId?: number | string;
}

export interface ApplyPromotionPayload {
  orderId: number | string;
  promotionId?: number | string;
  promotionCode?: string;
  customerId?: number | string;
  pointsToUse?: number;
}

export function getPromotions(params?: PromotionsQuery) {
  const cacheBuster = Date.now();
  return axiosClient.get("/promotions", {
    params: { ...(params || {}), _: cacheBuster },
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "If-Modified-Since": "0",
    },
  });
}

export function getPromotionById(id: string | number) {
  return axiosClient.get(`/promotions/${id}`);
}

export function checkPromotionEligibility(id: string | number, customerId?: string | number) {
  const params = customerId ? { customerId } : undefined;
  return axiosClient.get(`/promotions/${id}/check-eligibility`, { params });
}

export function getAvailablePromotions(payload: AvailablePromotionsPayload) {
  return axiosClient.post("/promotions/available", payload);
}

export function applyPromotion(payload: ApplyPromotionPayload) {
  return axiosClient.post("/promotions/apply", payload);
}

export function unapplyPromotion(orderId: number | string, promotionId: number | string) {
  return axiosClient.post("/promotions/unapply", { orderId, promotionId });
}

export interface PromotionCreatePayload {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'item' | 'combo';
  value: number;
  minOrderValue?: number;
  applicableCategories?: string[];
  isActive?: boolean;
}

export interface PromotionCreatePercentagePayload {
  name: string,
  description: string,
  typeId: number,
  discountValue: number,
  minOrderValue: number,
  maxDiscount: number,
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage: number, // nếu mã KM ko giới hạn lượt dùng => ko truyền
  maxUsagePerCustomer: number, // nếu mã KM ko giới hạn lượt dùng từng người => ko truyền
  isActive: boolean,
  // 5 fields này nếu ko truyền thì be mặc định là false
  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,
  applicableItemIds: number[],
  applicableCategoryIds: number[],
  applicableComboIds: number[],
  applicableCustomerIds: number[],
  applicableCustomerGroupIds: number[],
  giftItemIds: number[]
}

export interface PromotionCreateAmountPayload {
  name: string,
  description: string,
  typeId: number,
  discountValue: number,
  minOrderValue: number,
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage: number,
  maxUsagePerCustomer: number,
  isActive: boolean,
  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,
  applicableItemIds: number[],
  applicableCategoryIds: number[],
  applicableComboIds: number[],
  applicableCustomerIds: number[],
  applicableCustomerGroupIds: number[],
  giftItemIds: number[]
}

export interface PromotionCreateSamePricePayload {
  name: string,
  description: string,
  typeId: number,
  discountValue: number,
  minOrderValue: number,
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage: number,
  maxUsagePerCustomer: number,
  isActive: boolean,
  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,
  applicableItemIds: number[],
  applicableCategoryIds: number[],
  applicableComboIds: number[],
  applicableCustomerIds: number[],
  applicableCustomerGroupIds: number[],
  giftItemIds: number[]
}

export interface PromotionCreateGiftPayload {
  name: string,
  description: string,
  typeId: number,
  buyQuantity: number,
  getQuantity: number,
  requireSameItem: boolean, //nếu true thì phải là 2 ly phải là cùng 1 item trong danh sách sản phẩm áp dụng
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage: number,
  maxUsagePerCustomer: number,
  isActive: boolean,
  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,
  applicableItemIds: number[],
  applicableCategoryIds: number[],
  applicableComboIds: number[],
  applicableCustomerIds: number[],
  applicableCustomerGroupIds: number[],
  giftItemIds: number[]
}

export interface PromotionUpdatePayload {
  name: string,
  description: string,
  discountValue: number,
  minOrderValue: number,
  maxDiscount: number,
  buyQuantity: number,
  getQuantity: number,
  requireSameItem: boolean,
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage: number,
  maxUsagePerCustomer: number,
  isActive: boolean,
  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,
  applicableItemsId: number[],
  applicableCategoryIds: number[],
  applicableComboIds: number[],
  applicableCustomerIds: number[],
  applicableCustomerGroupIds: number[],
  giftItemIds: number[],
}

export const createPromotion = (payload: PromotionCreatePayload) => {
  return axiosClient.post('/promotions', payload);
};

export const createPercentagePromotion = (payload: PromotionCreatePercentagePayload) => {
  return axiosClient.post('/promotions', payload);
}

export const createAmountPromotion = (payload: PromotionCreateAmountPayload) => {
  return axiosClient.post('/promotions', payload);
}

export const createSamePricePromotion = (payload: PromotionCreateSamePricePayload) => {
  return axiosClient.post('/promotions', payload);
}

export const createGiftPromotion = (payload: PromotionCreateGiftPayload) => {
  return axiosClient.post('/promotions', payload);
}

export const updatePromotion = (id: string | number, payload: PromotionUpdatePayload) => {
  return axiosClient.patch(`/promotions/${id}`, payload);
};

export const updatePercentagePromotion = (id: string | number, payload: PromotionCreatePercentagePayload) => {
  return axiosClient.patch(`/promotions/${id}`, payload);
};

export const updateAmountPromotion = (id: string | number, payload: PromotionCreateAmountPayload) => {
  return axiosClient.patch(`/promotions/${id}`, payload);
};

export const updateSamePricePromotion = (id: string | number, payload: PromotionCreateSamePricePayload) => {
  return axiosClient.patch(`/promotions/${id}`, payload);
};

export const updateGiftPromotion = (id: string | number, payload: PromotionCreateGiftPayload) => {
  return axiosClient.patch(`/promotions/${id}`, payload);
};

export const deletePromotion = (id: string | number) => {
  return axiosClient.delete(`/promotions/${id}`);
};

// Deprecated duplicates removed
