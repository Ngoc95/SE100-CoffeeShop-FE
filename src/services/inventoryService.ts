import axiosClient from "../api/axiosClient";
import { InventoryItem } from "../types/inventory";

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
    const params: any = {
        page,
        limit,
        ...filters
    };

    const response = await axiosClient.get('/inventory-items', { params });
    return response.data;
  },

  async getItemById(id: number | string): Promise<InventoryItem> {
    const response = await axiosClient.get(`/inventory-items/${id}`);
    return response.data;
  },

  async createItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await axiosClient.post('/inventory-items', item);
    return response.data;
  },

  async updateItem(
    id: number | string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const response = await axiosClient.patch(`/inventory-items/${id}`, updates);
    return response.data;
  },

  async deleteItem(id: number | string): Promise<void> {
    await axiosClient.delete(`/inventory-items/${id}`);
  },

  /* ---------- Categories ---------- */

  async getCategories() {
    const response = await axiosClient.get('/categories');
    return response.data;
  },

  async getCategoryById(id: number | string) {
    const response = await axiosClient.get(`/categories/${id}`);
    return response.data;
  },

  async createCategory(data: { name: string }) {
    const response = await axiosClient.post('/categories', data);
    return response.data;
  },

  /* ---------- Units ---------- */

  async getUnits() {
    const response = await axiosClient.get('/units');
    return response.data;
  },

  async getUnitById(id: number | string) {
    const response = await axiosClient.get(`/units/${id}`);
    return response.data;
  },

  async createUnit(data: { name: string; symbol: string }) {
    const response = await axiosClient.post('/units', data);
    return response.data;
  },

  /* ---------- Stock Checks ---------- */

  async getStockChecks() {
    const response = await axiosClient.get('/stock-checks');
    return response.data;
  },

  async getStockCheckById(id: number | string) {
    const response = await axiosClient.get(`/stock-checks/${id}`);
    return response.data;
  },

  async createStockCheck(data: any) {
    const response = await axiosClient.post('/stock-checks', data);
    return response.data;
  },

  async updateStockCheck(id: number | string, data: any) {
    const response = await axiosClient.patch(`/stock-checks/${id}`, data);
    return response.data;
  },

  async completeStockCheck(id: number | string) {
    const response = await axiosClient.patch(`/stock-checks/${id}/complete`);
    return response.data;
  },

  async cancelStockCheck(id: number | string) {
    const response = await axiosClient.patch(`/stock-checks/${id}/cancel`);
    return response.data;
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
    const params: any = {
        page,
        limit,
        ...filters
    };
    const response = await axiosClient.get('/purchase-orders', { params });
    return response.data;
  },

  async getPurchaseOrderById(id: number | string) {
    const response = await axiosClient.get(`/purchase-orders/${id}`);
    return response.data;
  },

  async createPurchaseOrder(data: any) {
    const response = await axiosClient.post('/purchase-orders', data);
    return response.data;
  },

  async updatePurchaseOrder(id: number | string, data: any) {
    const response = await axiosClient.patch(`/purchase-orders/${id}`, data);
    return response.data;
  },

  async completePurchaseOrder(id: number | string) {
    const response = await axiosClient.patch(`/purchase-orders/${id}/complete`);
    return response.data;
  },

  async cancelPurchaseOrder(id: number | string) {
    const response = await axiosClient.patch(`/purchase-orders/${id}/cancel`);
    return response.data;
  },

  async addPurchaseOrderPayment(id: number | string, data: { amount: number; paymentMethod: string; bankAccountId?: number }) {
    const response = await axiosClient.post(`/purchase-orders/${id}/payment`, data);
    return response.data;
  },

  async deletePurchaseOrder(id: number | string) {
    const response = await axiosClient.delete(`/purchase-orders/${id}`);
    return response.data;
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
    const params: any = {
        page,
        limit,
        ...filters
    };

    const response = await axiosClient.get('/write-offs', { params });
    return response.data;
  },

  async getWriteOffById(id: number | string) {
    const response = await axiosClient.get(`/write-offs/${id}`);
    return response.data;
  },

  async createWriteOff(data: any) {
    const response = await axiosClient.post('/write-offs', data);
    return response.data;
  },

  async updateWriteOff(id: number | string, data: any) {
    const response = await axiosClient.patch(`/write-offs/${id}`, data);
    return response.data;
  },

  async completeWriteOff(id: number | string) {
    const response = await axiosClient.patch(`/write-offs/${id}/complete`);
    return response.data;
  },

  async cancelWriteOff(id: number | string) {
    const response = await axiosClient.patch(`/write-offs/${id}/cancel`);
    return response.data;
  },

  /* ---------- Suppliers ---------- */

  async getSuppliers() {
    const response = await axiosClient.get('/suppliers');
    return response.data;
  },

  /* ---------- Bank Accounts ---------- */

  async getBankAccounts() {
    const response = await axiosClient.get('/finance/bank-accounts');
    return response.data;
  },

  async createBankAccount(data: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ownerName: string;
    notes?: string;
  }) {
    const response = await axiosClient.post('/finance/bank-accounts', data);
    return response.data;
  },

  /* ---------- Pricing ---------- */

  async getPricing(
    page = 1,
    limit = 100,
    filters?: {
      search?: string;
      categoryId?: string;
      itemTypeId?: string;
      sort?: string;
    }
  ) {
    const params: any = {
      page,
      limit,
      ...filters
    };

    const response = await axiosClient.get('/pricing', { params });
    return response.data;
  },

  async updateSinglePrice(data: {
    itemId: number;
    baseType: "cost" | "current" | "lastPurchase";
    adjustmentValue: number;
    adjustmentType: "percent" | "amount";
  }) {
    const response = await axiosClient.patch('/pricing/single', data);
    return response.data;
  },

  async updateCategoryPrice(data: {
    categoryId: number;
    baseType: "cost" | "current" | "lastPurchase";
    adjustmentValue: number;
    adjustmentType: "percent" | "amount";
  }) {
    const response = await axiosClient.patch('/pricing/category', data);
    return response.data;
  },

  async updateBatchPrice(data: {
    items: { id: number; sellingPrice: number }[];
  }) {
    const response = await axiosClient.patch('/pricing/batch', data);
    return response.data;
  },
};
