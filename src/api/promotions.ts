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

export interface PromotionUpdatePayload extends Partial<PromotionCreatePayload> {}

export const createPromotion = (payload: PromotionCreatePayload) => {
  return axiosClient.post('/promotions', payload);
};

export const updatePromotion = (id: string | number, payload: PromotionUpdatePayload) => {
  return axiosClient.patch(`/promotions/${id}`, payload);
};

export const deletePromotion = (id: string | number) => {
  return axiosClient.delete(`/promotions/${id}`);
};

// Deprecated duplicates removed
