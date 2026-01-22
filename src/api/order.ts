import axiosClient from './axiosClient';

// Generic helper to safely extract arrays or objects from varied API shapes
const extract = (res: any) => res?.data?.metaData ?? res?.data ?? res;

// POS: Orders listing with optional filters (status, tableId, date range, sort)
export const getOrders = (params?: Record<string, any>) => {
  return axiosClient.get('/orders', { params });
};

// POS: Get current order by table
export const getOrderByTable = (tableId: number) => {
  return axiosClient.get(`/orders/table/${tableId}`);
};

// POS: Create new order
export const createOrder = (payload: { tableId: number; items: any[] }) => {
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

// Kitchen: Get items for kitchen display (requires kitchen:access)
export const getKitchenItems = (params?: any) => {
  return axiosClient.get('/orders/kitchen/items', { params });
};

// POS: Get the most recent incomplete, unpaid takeaway order
export const getTakeawayOrder = () => {
  return axiosClient.get('/orders/takeaway');
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
  
  // Build comboSummary for instance tracking
  // Each combo instance in comboSummary has a unique set of orderItemIds
  const comboSummaryList = order?.comboSummary ?? [];
  
  // Build lookup: orderItemId -> comboInstanceId
  const orderItemToComboInstance = new Map<number, string>();
  // Build lookup: comboInstanceId -> {comboName, comboPrice, comboId}
  const comboInstanceInfo = new Map<string, { comboName: string; comboPrice: number; comboId: number; itemIds: number[] }>();
  
  comboSummaryList.forEach((cs: any, idx: number) => {
    if (cs?.comboId && cs?.items?.length > 0) {
      // Generate unique instance ID from first item's orderItemId
      const firstItemId = cs.items[0]?.id;
      const instanceId = `combo-${cs.comboId}-${firstItemId ?? idx}`;
      
      comboInstanceInfo.set(instanceId, {
        comboName: cs.comboName ?? `Combo #${cs.comboId}`,
        comboPrice: Number(cs.comboPrice ?? 0),
        comboId: cs.comboId,
        itemIds: cs.items.map((i: any) => i.id)
      });
      
      // Map each item in this combo instance
      cs.items.forEach((item: any) => {
        if (item.id) {
          orderItemToComboInstance.set(item.id, instanceId);
        }
      });
    }
  });
  
  // Helper to find combo instance for an orderItem
  const findComboInstance = (orderItemId: number): string | undefined => {
    return orderItemToComboInstance.get(orderItemId);
  };

  // Step 1: Map all items with basic info (don't group yet)
  const allMappedItems: any[] = [];
  
  items.forEach((oi: any) => {
    const orderItemId = oi?.id;
    const comboInstanceId = orderItemId ? findComboInstance(orderItemId) : undefined;
    const instanceInfo = comboInstanceId ? comboInstanceInfo.get(comboInstanceId) : undefined;
    
    const mappedItem: any = {
      id: String(oi?.id ?? oi?.itemId ?? Date.now() + Math.random()),
      orderItemId: oi?.id || undefined,
      name: oi?.item?.name ?? oi?.inventoryItem?.name ?? oi?.itemName ?? oi?.name ?? 'Món',
      price: Number(oi?.price ?? oi?.unitPrice ?? oi?.sellingPrice ?? 0),
      quantity: Number(oi?.quantity ?? 1),
      status: (String(oi?.status ?? '').toLowerCase() || 'pending') as any,
      notes: oi?.notes ?? undefined,
      isTopping: oi?.isTopping ?? oi?.is_topping ?? false,
      toppings: Array.isArray(oi?.toppings) 
          ? oi.toppings.map((t: any) => t.name || t) 
          : (Array.isArray(oi?.orderItemToppings) ? oi.orderItemToppings.map((t: any) => t.topping?.name || t.name || t) : undefined),
      attachedToppings: [] as any[],
      customization: oi?.customization ? (typeof oi.customization === 'string' ? JSON.parse(oi.customization) : oi.customization) : undefined,
      inventoryItemId: oi?.itemId ?? oi?.inventoryItemId ?? oi?.inventoryItem?.id ?? oi?.item?.id,
      comboId: oi?.comboId ?? undefined,
      comboInstanceId: comboInstanceId,
      parentItemId: oi?.parentItemId ?? undefined,
      comboName: instanceInfo?.comboName,
      comboPrice: instanceInfo?.comboPrice,
      // Extra price for combo items (from backend)
      extraPrice: Number(oi?.extraPrice ?? 0),
      // Status breakdown for this single item
      statusBreakdown: {
        pending: 0,
        preparing: 0,
        completed: 0,
        served: 0,
      } as any,
      orderItemIdsByStatus: {
        pending: [] as number[],
        preparing: [] as number[],
        completed: [] as number[],
        served: [] as number[],
      } as any,
    };
    
    // Set status breakdown for this item
    const itemStatus = mappedItem.status || 'pending';
    mappedItem.statusBreakdown[itemStatus] = mappedItem.quantity;
    if (mappedItem.orderItemId) {
      mappedItem.orderItemIdsByStatus[itemStatus].push(mappedItem.orderItemId);
    }
    
    allMappedItems.push(mappedItem);
  });
  
  // Step 2: Separate items by type
  const mainItems: any[] = [];
  const toppingItems: any[] = [];
  const comboItemsByInstance = new Map<string, any[]>();
  
  allMappedItems.forEach(item => {
    if (item.isTopping && item.parentItemId) {
      toppingItems.push(item);
    } else if (item.comboInstanceId) {
      // Group by combo instance
      if (!comboItemsByInstance.has(item.comboInstanceId)) {
        comboItemsByInstance.set(item.comboInstanceId, []);
      }
      comboItemsByInstance.get(item.comboInstanceId)!.push(item);
    } else {
      mainItems.push(item);
    }
  });
  
  // Step 3: Attach toppings to parent items
  // Build map of parent items by orderItemId for quick lookup
  const parentItemsMap = new Map<number, any>();
  mainItems.forEach(item => {
    if (item.orderItemId) {
      parentItemsMap.set(item.orderItemId, item);
    }
  });
  
  // Also check combo items for parents
  comboItemsByInstance.forEach((comboItems) => {
    comboItems.forEach(item => {
      if (item.orderItemId) {
        parentItemsMap.set(item.orderItemId, item);
      }
    });
  });
  
  toppingItems.forEach(topping => {
    const parent = parentItemsMap.get(topping.parentItemId);
    if (parent) {
      if (!parent.attachedToppings) parent.attachedToppings = [];
      parent.attachedToppings.push(topping);
    }
  });
  
  // Step 4: Group non-combo main items by customization key (for quantity merging)
  const groupedMainItems = new Map<string, any>();
  
  const getCustomizationKey = (oi: any) => {
    const productId = String(oi?.inventoryItemId ?? '');
    const notes = (oi?.notes ?? '').trim();
    const customizationStr = oi?.customization ? JSON.stringify(oi.customization) : '';
    // Include attached toppings in key
    const toppingsKey = (oi?.attachedToppings ?? [])
      .map((t: any) => `${t.inventoryItemId}-${t.quantity}`)
      .sort()
      .join(',');
    return `${productId}|${notes}|${customizationStr}|${toppingsKey}`;
  };
  
  mainItems.forEach(item => {
    const key = getCustomizationKey(item);
    
    if (groupedMainItems.has(key)) {
      const existing = groupedMainItems.get(key);
      existing.quantity += item.quantity;
      
      // Merge status breakdown
      const itemStatus = item.status || 'pending';
      existing.statusBreakdown[itemStatus] = (existing.statusBreakdown[itemStatus] || 0) + item.quantity;
      if (item.orderItemId) {
        if (!existing.orderItemIdsByStatus[itemStatus]) {
          existing.orderItemIdsByStatus[itemStatus] = [];
        }
        existing.orderItemIdsByStatus[itemStatus].push(item.orderItemId);
      }
      
      // Merge attached toppings quantities
      if (item.attachedToppings?.length > 0) {
        item.attachedToppings.forEach((topping: any) => {
          const existingTopping = existing.attachedToppings?.find(
            (t: any) => t.inventoryItemId === topping.inventoryItemId
          );
          if (existingTopping) {
            existingTopping.quantity += topping.quantity;
          } else {
            if (!existing.attachedToppings) existing.attachedToppings = [];
            existing.attachedToppings.push({ ...topping });
          }
        });
      }
      
      // Update overall status
      if (existing.statusBreakdown.pending > 0) existing.status = 'pending';
      else if (existing.statusBreakdown.preparing > 0) existing.status = 'preparing';
      else if (existing.statusBreakdown.completed > 0) existing.status = 'completed';
      else existing.status = 'served';
    } else {
      groupedMainItems.set(key, item);
    }
  });
  
  // Step 5: Build final result - main items + combo items (not grouped, each instance separate)
  const result: any[] = Array.from(groupedMainItems.values());
  
  // Add combo items (each combo instance item is separate, not grouped)
  comboItemsByInstance.forEach((comboItems) => {
    comboItems.forEach(item => {
      result.push(item);
    });
  });
  
  return result;
};

// Kitchen/POS: General update order item (qty, notes, status, customization)
export const updateOrderItem = (orderId: number | string, itemId: number | string, payload: any) => {
  return axiosClient.patch(`/orders/${orderId}/items/${itemId}`, payload);
};

// POS: Update overall order (customer, notes, etc.)
export const updateOrder = (orderId: number | string, payload: any) => {
  return axiosClient.patch(`/orders/${orderId}`, payload);
};

// POS: Delete/Reduce order item (mark as canceled - for sent items)
export const deleteOrderItem = (orderId: number | string, itemId: number | string, payload?: { quantity?: number; reason: string }) => {
  return axiosClient.delete(`/orders/${orderId}/items/${itemId}`, { data: payload });
};

// POS: Remove item permanently from database (for pending items only)
export const removeOrderItem = (orderId: number | string, itemId: number | string) => {
  return axiosClient.delete(`/orders/${orderId}/items/${itemId}/remove`);
};

export const mapOrdersToReadyItems = (orders: any[]) => {
// ...
  const ready: Array<{ id: string; itemName: string; totalQuantity: number; completedQuantity: number; servedQuantity: number; table: string; timestamp: Date; notes?: string; }> = [];
  orders.forEach((ord: any) => {
    const tableName = ord?.table?.tableName ?? ord?.tableName ?? ord?.table ?? 'Bàn';
    const items = (ord?.items ?? ord?.orderItems ?? []) as any[];
    items.forEach((it: any) => {
      const status = String(it?.status ?? '').toLowerCase();
      if (status === 'completed') {
        const qty = Number(it?.quantity ?? 1);
        ready.push({
          id: String(it?.id ?? `${tableName}-${it?.itemId ?? Date.now()}`),
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
