import axiosClient from './axiosClient';

// Generic helper to safely extract arrays or objects from varied API shapes
const extract = (res: any) => res?.data?.metaData ?? res?.data ?? res;

// POS: Orders listing with optional filters (status, tableId, date range, sort)
export const getOrders = (params?: Record<string, any>) => {
  return axiosClient.get('/orders', { params });
};

// POS: Get current order by table
export const getOrderByTable = (tableId: number) => {
  // Add cache-busting param to avoid 304 returning empty body to axios
  return axiosClient.get(`/orders/table/${tableId}` , {
    params: { _t: Date.now() },
    headers: { 'Cache-Control': 'no-cache' }
  });
};

// POS: Create new order
// export const createOrder = (payload: any) => {
//   return axiosClient.post('/orders', payload);
// };

// POS: Create new order
export const createOrder = (payload: { tableId: number | null; items?: any[] }) => {
  return axiosClient.post('/orders', payload);
};

// POS: Add item to existing order
export const addOrderItem = (orderId: number, payload: any) => {
  return axiosClient.post(`/orders/${orderId}/items`, payload);
};

// POS: Send order to kitchen
export const sendOrderToKitchen = (orderId: number) => {
  return axiosClient.post(`/orders/${orderId}/send-to-kitchen`);
};

// Typed payload for sending detailed items to kitchen
export interface KitchenCustomizationTopping {
  id?: string;
  name: string;
  quantity?: number;
  price?: number;
}

export interface KitchenItemPayload {
  inventoryItemId?: string | number;
  name?: string;
  quantity: number;
  categoryId?: string | number;
  notes?: string;
  customization?: {
    sugarLevel?: string;
    iceLevel?: string;
    toppings?: KitchenCustomizationTopping[];
  };
  // structure flags
  isCombo?: boolean;
  comboId?: string | number;
  parentItemId?: string | number; // for toppings attached to a drink
  comboItems?: Array<{
    inventoryItemId?: string | number;
    name?: string;
    quantity: number;
    customization?: KitchenItemPayload['customization'];
  }>;
  stationHint?: string;
  priority?: 'normal' | 'rush';
  changeType?: 'add' | 'update' | 'remove';
}

export interface SendToKitchenPayload {
  order: {
    orderId: number;
    orderCode?: string;
    orderType?: 'dine-in' | 'takeaway' | 'delivery';
    table?: { id?: number; name?: string; areaId?: number; areaName?: string };
    createdBy?: { id?: string | number; name?: string; role?: string };
  };
  items: KitchenItemPayload[];
}

// New client that posts item payload (keeps old route for compatibility)
export const sendOrderToKitchenWithItems = (orderId: number, payload: SendToKitchenPayload) => {
  return axiosClient.post(`/orders/${orderId}/send-to-kitchen`, payload);
};

// POS: Checkout order
export const checkoutOrder = (orderId: number, payload: any) => {
  return axiosClient.post(`/orders/${orderId}/checkout`, payload);
};

// POS: Transfer order to another table
export const transferTable = (orderId: number, payload: { newTableId: number }) => {
  return axiosClient.post(`/orders/${orderId}/transfer`, payload);
};

// POS: Merge another order into this one
export const mergeOrders = (orderId: number, payload: { fromOrderId: number }) => {
  return axiosClient.post(`/orders/${orderId}/merge`, payload);
};

// POS: Split order to new table
export const splitOrder = (orderId: number, payload: { newTableId: number; items: Array<{ itemId: number; quantity: number }> }) => {
  return axiosClient.post(`/orders/${orderId}/split`, payload);
};

// Kitchen: Get items for kitchen display (supports optional query params)
export const getKitchenItems = (params?: Record<string, any>) => {
  return axiosClient.get('/orders/kitchen/items', { params });
};

// POS: Fetch current takeaway order (server decides current active takeaway)
export const getTakeawayOrder = () => {
  return axiosClient.get('/orders/takeaway');
};

// POS: Update whole order (e.g., attach customer)
export const updateOrder = (orderId: number, payload: any) => {
  return axiosClient.patch(`/orders/${orderId}`, payload);
};

// POS: Update a single order item row
export const updateOrderItem = (orderId: number, orderItemId: number, payload: any) => {
  return axiosClient.patch(`/orders/${orderId}/items/${orderItemId}`, payload);
};

// POS: Permanently remove a pending order item (no quantity payload)
export const removeOrderItem = (orderId: number, orderItemId: number) => {
  return axiosClient.delete(`/orders/${orderId}/items/${orderItemId}`);
};

// POS: Reduce quantity or cancel an already-sent item, with reason
// Payload conforms to ReduceItemDto: { quantity?: number; reason?: string }
export const deleteOrderItem = (
  orderId: number,
  orderItemId: number | string,
  payload?: { quantity?: number; reason?: string }
) => {
  return axiosClient.delete(`/orders/${orderId}/items/${orderItemId}` as string, {
    data: payload ?? {},
  });
};

// Kitchen: Report out-of-stock for an item
export const reportOutOfStock = (itemId: string | number, payload: any) => {
  return axiosClient.post(`/orders/kitchen/items/${itemId}/out-of-stock`, payload);
};

// Kitchen/Serve: Update item status (batch via payload)
export const updateItemStatus = (itemId: string | number, payload: any) => {
  return axiosClient.patch(`/orders/items/${itemId}/status`, payload);
};

// Helpers for mapping responses to frontend shapes
export const mapOrderToCartItems = (order: any) => {
  const items = (order?.items ?? order?.orderItems ?? order?.OrderItems ?? []) as any[];
  return items.map((oi: any) => ({
    id: String(oi?.inventoryItemId ?? oi?.itemId ?? oi?.id ?? oi?.inventoryItem?.id ?? Date.now()),
    name: oi?.itemName ?? oi?.name ?? oi?.inventoryItem?.name ?? 'Món',
    price: Number(oi?.price ?? oi?.unitPrice ?? oi?.sellingPrice ?? 0),
    quantity: Number(oi?.quantity ?? 1),
    status: (String(oi?.status ?? '').toLowerCase() || undefined) as any,
    notes: oi?.notes ?? undefined,
  }));
};

export const mapOrdersToReadyItems = (orders: any[]) => {
  const ready: Array<{ id: string; itemName: string; totalQuantity: number; completedQuantity: number; servedQuantity: number; table: string; timestamp: Date; notes?: string; }> = [];
  orders.forEach((ord: any) => {
    const tableName = ord?.table?.tableName ?? ord?.tableName ?? ord?.table ?? 'Bàn';
    const items: any[] = (ord?.items ?? ord?.orderItems ?? []);
    items.forEach((it: any) => {
      const status = String(it?.status ?? it?.state ?? '').toLowerCase();
      if (status.includes('completed') || status.includes('done')) {
        const qty = Number(it?.quantity ?? 1);
        ready.push({
          id: String(it?.id ?? it?.orderItemId ?? `${tableName}-${it?.itemId ?? Date.now()}`),
          itemName: it?.itemName ?? it?.name ?? it?.inventoryItem?.name ?? 'Món',
          totalQuantity: 0,
          completedQuantity: qty,
          servedQuantity: qty,
          table: String(tableName),
          timestamp: new Date(ord?.updatedAt ?? ord?.createdAt ?? Date.now()),
          notes: it?.notes ?? undefined,
        });
      }
    });
  });

  return ready;
};
