import axiosClient from "../axiosClient";

export type EndOfDayConcern = 'sales' | 'revenue_expenses' | 'inventory' | 'cancelled_items';

export interface EndOfDayReportParams {
    concern: EndOfDayConcern;
    startDate: string; // ISO date string
    endDate: string;   // ISO date string

    // Sales & Cancelled Items filters
    customerSearch?: string;
    staffIds?: number[];
    paymentMethods?: string[];

    // Inventory & Revenue/Expenses filters
    productSearch?: string;
    categoryIds?: number[];
}

export interface SalesInvoice {
    orderCode: string;
    completedAt: string;
    customer: {
        id: number;
        code: string;
        name: string;
        phone: string;
    } | null;
    items: {
        productCode: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    totalAmount: number;
    paymentMethod: string | null;
    staff: {
        id: number;
        code: string;
        name: string;
        role: string;
    } | null;
}

export interface RevenueExpenseTransaction {
    code: string;
    category: {
        id: number;
        name: string;
        type: string; // 'Thu' or 'Chi'
    };
    personReceiving: string | null;
    creator: {
        id: number;
        code: string;
        name: string;
    } | null;
    amount: number;
    transactionDate: string;
    paymentMethod: string | null;
}

export interface InventoryProduct {
    productCode: string;
    productName: string;
    categoryName: string | null;
    saleDate: string | null;
    quantitySold: number;
    revenue: number;
    quantityReturned: number;
    returnAmount: number;
    netRevenue: number;
}

export interface CancelledItem {
    orderCode: string;
    productCode: string;
    productName: string;
    cancelledAt: string;
    customer: {
        name: string;
        phone: string;
    } | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    staff: {
        code: string;
        name: string;
    } | null;
    reason: string | null;
}

export interface EndOfDayReportResponse {
    // Sales concern
    invoices?: SalesInvoice[];

    // Revenue/Expenses concern
    transactions?: RevenueExpenseTransaction[];

    // Inventory concern
    products?: InventoryProduct[];
    totals?: {
        totalProducts: number;
        totalQuantitySold: number;
        totalRevenue: number;
        totalQuantityReturned: number;
        totalReturnAmount: number;
        totalNetRevenue: number;
    };

    // Cancelled items concern
    cancelledItems?: CancelledItem[];
}

export const getEndOfDayReport = async (params: EndOfDayReportParams) => {
    const response = await axiosClient.post<{
        message: string;
        statusCode: number;
        metaData: EndOfDayReportResponse;
    }>('/reports/end-of-day', params);

    return response.data;
};

export const exportEndOfDayReport = async (params: EndOfDayReportParams) => {
    const response = await axiosClient.post('/reports/export/end-of-day', params, {
        responseType: 'blob'
    });
    return response.data;
};
