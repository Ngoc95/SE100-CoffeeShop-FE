import { InventoryItem } from "../types/inventory";

const API_BASE_URL = "http://localhost:4000/api";

/* ======================
   AUTH TOKEN
====================== */
const getAuthToken = (): string | null => {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6ImFjY2Vzc190b2tlbiIsImlhdCI6MTc2OTAwNzA3NywiZXhwIjoxNzY5MDA3OTc3fQ.pSbaogXGbnYo6YjN_mHlnYwWkpMQdXlaeSH_X6J4O70";
};

const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ======================
   INVENTORY SERVICE
====================== */
export const inventoryService = {
  /* ---------- Items ---------- */

  async getItems(
    page = 1,
    limit = 100,
    filters?: {
      search?: string;
      categoryId?: string;
      itemTypeId?: string;
      stockStatus?: string;
      productStatus?: string;
      sort?: string;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) params.append("search", filters.search);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.itemTypeId) params.append("itemTypeId", filters.itemTypeId);
    if (filters?.stockStatus) params.append("stockStatus", filters.stockStatus);
    if (filters?.productStatus) params.append("productStatus", filters.productStatus);
    if (filters?.sort) params.append("sort", filters.sort);

    const response = await fetch(
      `${API_BASE_URL}/inventory-items?${params.toString()}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET inventory-items failed: ${response.status}`);
    }

    return response.json();
  },

  async getItemById(id: number | string): Promise<InventoryItem> {
    const response = await fetch(
      `${API_BASE_URL}/inventory-items/${id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET inventory-item ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async createItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await fetch(
      `${API_BASE_URL}/inventory-items`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(item),
      }
    );

    if (!response.ok) {
      throw new Error(`CREATE inventory-item failed: ${response.status}`);
    }

    return response.json();
  },

  async updateItem(
    id: number | string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const response = await fetch(
      `${API_BASE_URL}/inventory-items/${id}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`UPDATE inventory-item ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async deleteItem(id: number | string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/inventory-items/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`DELETE inventory-item ${id} failed: ${response.status}`);
    }

    // API thường trả 204 No Content
    return;
  },

  /* ---------- Categories ---------- */

  async getCategories() {
    const response = await fetch(
      `${API_BASE_URL}/categories`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET categories failed: ${response.status}`);
    }

    return response.json();
  },

  async getCategoryById(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/categories/${id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET category ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async createCategory(data: { name: string }) {
    const response = await fetch(
      `${API_BASE_URL}/categories`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`CREATE category failed: ${response.status}`);
    }

    return response.json();
  },

  /* ---------- Units ---------- */

  async getUnits() {
    const response = await fetch(
      `${API_BASE_URL}/units`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET units failed: ${response.status}`);
    }

    return response.json();
  },

  async getUnitById(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/units/${id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET unit ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async createUnit(data: { name: string; symbol: string }) {
    const response = await fetch(
      `${API_BASE_URL}/units`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`CREATE unit failed: ${response.status}`);
    }

    return response.json();
  },

  /* ---------- Stock Checks ---------- */

  async getStockChecks() {
    const response = await fetch(
      `${API_BASE_URL}/stock-checks`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET stock-checks failed: ${response.status}`);
    }

    return response.json();
  },

  async getStockCheckById(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/stock-checks/${id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET stock-check ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async createStockCheck(data: any) {
    const response = await fetch(
      `${API_BASE_URL}/stock-checks`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`CREATE stock-check failed: ${response.status}`);
    }

    return response.json();
  },

  async updateStockCheck(id: number | string, data: any) {
    const response = await fetch(
      `${API_BASE_URL}/stock-checks/${id}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`UPDATE stock-check ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async completeStockCheck(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/stock-checks/${id}/complete`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`COMPLETE stock-check ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async cancelStockCheck(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/stock-checks/${id}/cancel`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`CANCEL stock-check ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  /* ---------- Purchase Orders ---------- */

  async getPurchaseOrders(
    page = 1,
    limit = 20,
    filters?: {
      status?: string;
      supplierId?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) params.append("status", filters.status);
    if (filters?.supplierId) params.append("supplierId", filters.supplierId);
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.append("dateTo", filters.dateTo);

    const response = await fetch(
      `${API_BASE_URL}/purchase-orders?${params.toString()}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET purchase-orders failed: ${response.status}`);
    }

    return response.json();
  },

  async getPurchaseOrderById(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders/${id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET purchase-order ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async createPurchaseOrder(data: any) {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`CREATE purchase-order failed: ${response.status}`);
    }

    return response.json();
  },

  async updatePurchaseOrder(id: number | string, data: any) {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders/${id}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`UPDATE purchase-order ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async completePurchaseOrder(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders/${id}/complete`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`COMPLETE purchase-order ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async cancelPurchaseOrder(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders/${id}/cancel`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`CANCEL purchase-order ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async addPurchaseOrderPayment(id: number | string, data: { amount: number; paymentMethod: string; bankAccountId?: number }) {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders/${id}/payment`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`ADD payment to purchase-order ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async deletePurchaseOrder(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/purchase-orders/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`DELETE purchase-order ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  /* ---------- Write-offs ---------- */

  async getWriteOffs(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      sort?: string;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) params.append("status", filters.status);
    if (filters?.sort) params.append("sort", filters.sort);

    const response = await fetch(
      `${API_BASE_URL}/write-offs?${params.toString()}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET write-offs failed: ${response.status}`);
    }

    return response.json();
  },

  async getWriteOffById(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/write-offs/${id}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET write-off ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async createWriteOff(data: any) {
    const response = await fetch(
      `${API_BASE_URL}/write-offs`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`CREATE write-off failed: ${response.status}`);
    }

    return response.json();
  },

  async updateWriteOff(id: number | string, data: any) {
    const response = await fetch(
      `${API_BASE_URL}/write-offs/${id}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`UPDATE write-off ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async completeWriteOff(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/write-offs/${id}/complete`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`COMPLETE write-off ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  async cancelWriteOff(id: number | string) {
    const response = await fetch(
      `${API_BASE_URL}/write-offs/${id}/cancel`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`CANCEL write-off ${id} failed: ${response.status}`);
    }

    return response.json();
  },

  /* ---------- Suppliers ---------- */

  async getSuppliers() {
    const response = await fetch(
      `${API_BASE_URL}/suppliers`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET suppliers failed: ${response.status}`);
    }

    return response.json();
  },

  /* ---------- Bank Accounts ---------- */

  async getBankAccounts() {
    const response = await fetch(
      `${API_BASE_URL}/finance/bank-accounts`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GET bank-accounts failed: ${response.status}`);
    }

    return response.json();
  },

  async createBankAccount(data: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ownerName: string;
    notes?: string;
  }) {
    const response = await fetch(
      `${API_BASE_URL}/finance/bank-accounts`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`CREATE bank-account failed: ${response.status}`);
    }

    return response.json();
  },
};
