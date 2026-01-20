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
export const createOrder = (payload: any) => {
  return axiosClient.post('/orders', payload);
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
export const transferTable = (orderId: number, payload: { toTableId: number }) => {
  return axiosClient.post(`/orders/${orderId}/transfer`, payload);
};

// POS: Merge another order into this one
export const mergeOrders = (orderId: number, payload: { fromOrderId: number }) => {
  return axiosClient.post(`/orders/${orderId}/merge`, payload);
};

// POS: Split order to new table
export const splitOrder = (orderId: number, payload: { toTableId: number; items: Array<{ itemId: string; quantity: number }> }) => {
  return axiosClient.post(`/orders/${orderId}/split`, payload);
};

// Kitchen: Get items for kitchen display (requires kitchen:access)
export const getKitchenItems = (params?: Record<string, any>) => {
  return axiosClient.get('/orders/kitchen/items', { params });
};

// POS: Add item to order
export const addOrderItem = (orderId: number, payload: any) => {
  return axiosClient.post(`/orders/${orderId}/items`, payload);
};

// POS: Update a single order item by row id
export const updateOrderItem = (orderId: number, orderItemId: string | number, payload: { quantity: number }) => {
  return axiosClient.patch(`/orders/${orderId}/items/${orderItemId}`, payload);
};

// POS: Remove a single order item by row id
export const removeOrderItem = (
  orderId: number,
  orderItemId: string | number,
  payload?: { quantity?: number; reason?: string }
) => {
  // axios.delete supports sending a body via the `data` field on config
  return axiosClient.delete(`/orders/${orderId}/items/${orderItemId}`, {
    data: payload,
  });
};

// POS: Update order items (quantity changes or removals)
// Supports both inventoryItemId (when client only knows SKU) and orderItemId (when referring to a specific row)
// Payload shape: { items: [{ inventoryItemId?: string|number, orderItemId?: string|number, quantity?, changeType: 'update'|'remove' }] }
export const updateOrderItems = (
  orderId: number,
  items: Array<{
    inventoryItemId?: string | number;
    orderItemId?: string | number;
    quantity?: number;
    changeType: 'update' | 'remove';
  }>
) => {
  return axiosClient.patch(`/orders/${orderId}/items`, { items });
};

// Kitchen: Report out-of-stock for an item
export const reportOutOfStock = (itemId: string | number, payload: any) => {
  return axiosClient.post(`/orders/kitchen/items/${itemId}/out-of-stock`, payload);
};

// Kitchen/Serve: Update item status (batch via payload)
export const updateItemStatus = (itemId: string | number, payload: any) => {
  return axiosClient.patch(`/orders/items/${itemId}/status`, payload);
};

// Kitchen: Update kitchen item (ticket) status directly
export const updateKitchenItemStatus = (kitchenItemId: string | number, payload: any) => {
  return axiosClient.patch(`/orders/kitchen/items/${kitchenItemId}/status`, payload);
};

// Dev: Delete order (if backend supports it)
export const deleteOrder = (orderId: number) => {
  return axiosClient.delete(`/orders/${orderId}`);
};

// Map a backend order payload to POS cart items
export const mapOrderToCartItems = (order: any): Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
  status?: string;
  notes?: string;
  isCombo?: boolean;
  comboId?: string;
  comboItems?: any[];
  customization?: {
    sugarLevel?: string;
    iceLevel?: string;
    toppings?: Array<{ id?: string; name: string; quantity?: number; price?: number }>;
  };
  attachedToppings?: any[];
  // Hidden identifiers used for persistence
  __orderItemId?: string;
  __inventoryItemId?: string;
}> => {
  const items: any[] = (order?.items ?? order?.orderItems ?? order?.order?.items ?? []);

  return items.map((it: any) => {
    const orderItemId = it?.id ?? it?.orderItemId;
    const inventoryItemId = it?.itemId ?? it?.inventoryItemId ?? it?.inventoryItem?.id;
    const baseId = String(orderItemId ?? inventoryItemId ?? Date.now());
    const name = it?.itemName ?? it?.name ?? it?.inventoryItem?.name ?? 'Món';
    const price = Number(
      it?.price ?? it?.sellingPrice ?? it?.unitPrice ?? it?.inventoryItem?.sellingPrice ?? 0
    );
    const quantity = Number(it?.quantity ?? 1);

    const rawStatus = String(it?.status ?? it?.state ?? '').toLowerCase();
    let status: string | undefined = 'pending';
    if (rawStatus.includes('completed') || rawStatus.includes('done')) status = 'completed';
    else if (rawStatus.includes('prepar') || rawStatus.includes('in_progress')) status = 'preparing';
    else if (rawStatus.includes('served')) status = 'served';
    else if (rawStatus.includes('cancel')) status = 'canceled';
    else if (rawStatus.includes('out') && rawStatus.includes('stock')) status = 'out-of-stock';

    const customization = it?.customization ?? {
      sugarLevel: it?.sugarLevel,
      iceLevel: it?.iceLevel,
      toppings: Array.isArray(it?.toppings)
        ? it.toppings.map((t: any) => ({
            id: String(t?.id ?? t?.toppingId ?? ''),
            name: t?.name ?? t?.toppingName ?? 'Topping',
            quantity: Number(t?.quantity ?? 1),
            price: Number(t?.price ?? t?.sellingPrice ?? 0),
          }))
        : [],
    };

    const comboItems = Array.isArray(it?.comboItems)
      ? it.comboItems.map((ci: any) => ({
          id: String(ci?.id ?? ci?.orderItemId ?? ci?.itemId ?? `${baseId}-ci`),
          name: ci?.name ?? ci?.itemName ?? 'Món',
          price: Number(ci?.price ?? ci?.sellingPrice ?? 0),
          quantity: Number(ci?.quantity ?? 1),
          status,
          customization: ci?.customization,
        }))
      : undefined;

    return {
      id: baseId,
      name,
      price,
      quantity,
      status,
      notes: it?.notes ?? undefined,
      isCombo: Boolean(it?.isCombo ?? (Array.isArray(it?.comboItems) && it.comboItems.length > 0)),
      comboId: it?.comboId != null ? String(it.comboId) : undefined,
      comboItems,
      customization,
      attachedToppings: Array.isArray(it?.attachedToppings) ? it.attachedToppings : undefined,
      __orderItemId: orderItemId != null ? String(orderItemId) : undefined,
      __inventoryItemId: inventoryItemId != null ? String(inventoryItemId) : undefined,
    };
  });
};

// Map orders list to waiter-ready items (completed items awaiting service)
export const mapOrdersToReadyItems = (orders: any[]): Array<{
  id: string;
  itemName: string;
  totalQuantity: number;
  completedQuantity: number;
  servedQuantity: number;
  table: string;
  timestamp: Date;
  notes?: string;
}> => {
  const ready: any[] = [];
  const list: any[] = Array.isArray(orders) ? orders : [];

  list.forEach((ord: any) => {
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
