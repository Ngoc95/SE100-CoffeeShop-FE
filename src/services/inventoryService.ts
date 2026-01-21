import { InventoryItem } from "../types/inventory";

const API_BASE_URL = "http://localhost:4000/api";

/* ======================
   AUTH TOKEN
====================== */
const getAuthToken = (): string | null => {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6ImFjY2Vzc190b2tlbiIsImlhdCI6MTc2ODk2NTU1NywiZXhwIjoxNzY4OTY2NDU3fQ.8zQw6BvZZxDizToxsfdD9jqE1ATASzFez6Pu4CBUPuc";
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
};
