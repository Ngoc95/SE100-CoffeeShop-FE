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
  
  // Build comboSummary lookup map
  const comboSummaryList = order?.comboSummary ?? [];
  const comboLookup = new Map<number, { comboName: string; comboPrice: number }>();
  comboSummaryList.forEach((cs: any) => {
    if (cs?.comboId) {
      comboLookup.set(cs.comboId, {
        comboName: cs.comboName ?? `Combo #${cs.comboId}`,
        comboPrice: Number(cs.comboPrice ?? 0)
      });
    }
  });
  
  const groupedItems = new Map<string, any>();

  // Helper to standardise options/toppings for comparison
  const getCustomizationKey = (oi: any) => {
      // Create a unique key based on ProductID + Notes + Toppings + Options
      // We assume topping/options list order might vary, so sort if necessary
      const productId = String(oi?.inventoryItemId ?? oi?.itemId ?? oi?.inventoryItem?.id ?? '');
      const notes = (oi?.notes ?? '').trim();
      const toppings = JSON.stringify((oi?.toppings ?? []).sort());
      // Add other distinct attributes here
      return `${productId}|${notes}|${toppings}`;
  };

  items.forEach((oi: any) => {
      const key = getCustomizationKey(oi);
      
      // Lookup combo info if item has comboId
      const itemComboId = oi?.comboId;
      const comboInfo = itemComboId ? comboLookup.get(itemComboId) : undefined;
      
      const mappedItem: any = {
        id: String(oi?.id ?? oi?.itemId ?? Date.now() + Math.random()), // Prefer specific OrderItemID
        orderItemId: oi?.id || undefined, // Store real BE ID
        // Tên món: ưu tiên từ relation InventoryItem (item.name), sau đó itemName, name
        name: oi?.item?.name ?? oi?.inventoryItem?.name ?? oi?.itemName ?? oi?.name ?? 'Món',
        price: Number(oi?.price ?? oi?.unitPrice ?? oi?.sellingPrice ?? 0),
        quantity: Number(oi?.quantity ?? 1),
        status: (String(oi?.status ?? '').toLowerCase() || undefined) as any,
        notes: oi?.notes ?? undefined,
        // Is this item a topping?
        isTopping: oi?.isTopping ?? oi?.is_topping ?? false,
        // Map toppings if they exist in the response
        toppings: Array.isArray(oi?.toppings) 
            ? oi.toppings.map((t: any) => t.name || t) 
            : (Array.isArray(oi?.orderItemToppings) ? oi.orderItemToppings.map((t: any) => t.topping?.name || t.name || t) : undefined),
        // Attached toppings (child items with isTopping=true and parentItemId matching this item)
        attachedToppings: undefined as any, // Will be populated in post-processing if needed
        // Create customization object if exists
        customization: oi?.customization ? (typeof oi.customization === 'string' ? JSON.parse(oi.customization) : oi.customization) : undefined,
        // Preserve other potentially useful fields
        inventoryItemId: oi?.itemId ?? oi?.inventoryItemId ?? oi?.inventoryItem?.id ?? oi?.item?.id,
        comboId: oi?.comboId ?? undefined,
        parentItemId: oi?.parentItemId ?? undefined,
        // Add combo name and price from lookup
        comboName: comboInfo?.comboName,
        comboPrice: comboInfo?.comboPrice,
        // Status breakdown for grouped items (will be populated during grouping)
        statusBreakdown: undefined as any,
        orderItemIdsByStatus: undefined as any,
      };

      if (groupedItems.has(key)) {
          const existing = groupedItems.get(key);
          // Always merge same product - track quantity by status in statusBreakdown
          existing.quantity += mappedItem.quantity;
          
          // Initialize statusBreakdown if not exists
          if (!existing.statusBreakdown) {
              existing.statusBreakdown = {
                  pending: existing.status === 'pending' ? existing.quantity - mappedItem.quantity : 0,
                  preparing: existing.status === 'preparing' ? existing.quantity - mappedItem.quantity : 0,
                  completed: existing.status === 'completed' ? existing.quantity - mappedItem.quantity : 0,
                  served: existing.status === 'served' ? existing.quantity - mappedItem.quantity : 0,
              };
              // Store orderItemIds for each status
              existing.orderItemIdsByStatus = {
                  pending: existing.status === 'pending' ? [existing.orderItemId] : [],
                  preparing: existing.status === 'preparing' ? [existing.orderItemId] : [],
                  completed: existing.status === 'completed' ? [existing.orderItemId] : [],
                  served: existing.status === 'served' ? [existing.orderItemId] : [],
              };
          }
          
          // Add current item's quantity to its status
          const itemStatus = mappedItem.status || 'pending';
          existing.statusBreakdown[itemStatus] = (existing.statusBreakdown[itemStatus] || 0) + mappedItem.quantity;
          if (mappedItem.orderItemId) {
              if (!existing.orderItemIdsByStatus[itemStatus]) {
                  existing.orderItemIdsByStatus[itemStatus] = [];
              }
              existing.orderItemIdsByStatus[itemStatus].push(mappedItem.orderItemId);
          }
          
          // Set overall status to the "most urgent" one (pending > preparing > completed > served)
          if (existing.statusBreakdown.pending > 0) existing.status = 'pending';
          else if (existing.statusBreakdown.preparing > 0) existing.status = 'preparing';
          else if (existing.statusBreakdown.completed > 0) existing.status = 'completed';
          else existing.status = 'served';
      } else {
          // First item with this key - initialize statusBreakdown
          const itemStatus = mappedItem.status || 'pending';
          mappedItem.statusBreakdown = {
              pending: itemStatus === 'pending' ? mappedItem.quantity : 0,
              preparing: itemStatus === 'preparing' ? mappedItem.quantity : 0,
              completed: itemStatus === 'completed' ? mappedItem.quantity : 0,
              served: itemStatus === 'served' ? mappedItem.quantity : 0,
          };
          mappedItem.orderItemIdsByStatus = {
              pending: itemStatus === 'pending' && mappedItem.orderItemId ? [mappedItem.orderItemId] : [],
              preparing: itemStatus === 'preparing' && mappedItem.orderItemId ? [mappedItem.orderItemId] : [],
              completed: itemStatus === 'completed' && mappedItem.orderItemId ? [mappedItem.orderItemId] : [],
              served: itemStatus === 'served' && mappedItem.orderItemId ? [mappedItem.orderItemId] : [],
          };
          groupedItems.set(key, mappedItem);
      }
  });

  const allItems = Array.from(groupedItems.values());
  
  // Post-process: attach toppings to their parent items and filter them from main list
  const parentItemsMap = new Map<string, any>();
  const toppingItems: any[] = [];
  
  allItems.forEach(item => {
    if (item.isTopping && item.parentItemId) {
      toppingItems.push(item);
    } else {
      parentItemsMap.set(String(item.orderItemId ?? item.id), item);
    }
  });
  
  // Attach toppings to parents
  toppingItems.forEach(topping => {
    const parent = parentItemsMap.get(String(topping.parentItemId));
    if (parent) {
      if (!parent.attachedToppings) parent.attachedToppings = [];
      parent.attachedToppings.push(topping);
    }
  });
  
  // Return only non-topping items (with attachedToppings populated)
  return Array.from(parentItemsMap.values());
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
