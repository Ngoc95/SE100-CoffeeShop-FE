import axiosClient from '../axiosClient';

export interface SupplierPurchasingResponse {
    suppliers: Array<{
        code: string;
        name: string;
        purchaseCount: number;
        totalQuantity: number;
        totalValue: number;
        returnedQuantity: number;
        returnedValue: number;
        netValue: number;
    }>;
    totals: {
        totalSuppliers: number;
        totalQuantity: number;
        totalValue: number;
        totalReturnedQuantity: number;
        totalReturnedValue: number;
        totalNetValue: number;
    };
}

export interface SupplierDebtResponse {
    suppliers: Array<{
        code: string;
        name: string;
        openingDebt: number;
        incurredDebt: number;
        paidAmount: number;
        closingDebt: number;
    }>;
    totals: {
        totalOpeningDebt: number;
        totalIncurredDebt: number;
        totalPaidAmount: number;
        totalClosingDebt: number;
    };
}

export interface SupplierChartResponse {
    data: Array<{
        name: string;
        value?: number; // For purchasing
        debt?: number;  // For debt
    }>;
}

export const getSupplierStatistics = async (params: {
    displayType: 'report' | 'chart';
    concern: 'purchasing' | 'debt';
    startDate: string;
    endDate: string;
    search?: string;
}) => {
    const url = '/reports/suppliers';
    const response = await axiosClient.get(url, { params });
    return response.data;
};
