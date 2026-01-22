import axiosClient from '../axiosClient';

export interface CustomerReportResponse {
    displayType: 'report';
    totals: {
        totalCustomers: number;
        totalOrders: number;
        totalQuantity: number;
        totalRevenue: number;
    };
    customers: Array<{
        customerId: number;
        customerCode: string;
        customerName: string;
        phone: string;
        groupName: string;
        totalOrders: number;
        totalQuantity: number;
        totalRevenue: number;
    }>;
}

export interface CustomerChartResponse {
    displayType: 'chart';
    data: Array<{
        customerId: number;
        customerCode: string;
        customerName: string;
        revenue: number;
    }>;
}

export const getCustomerStatistics = async (params: {
    displayType: 'report' | 'chart';
    startDate: string;
    endDate: string;
    customerGroupIds?: number[];
    search?: string;
}) => {
    // Convert array to comma-separated string if needed, or axios handles array params correctly usually with bracket notation
    // But our backend handles split(',') if string.
    // Let's rely on axios default or manual formatting if axios default uses [] syntax which express middleware might handle or not.
    // Our controller code:
    // ... groupIds = customerGroupIds.map(id => Number(id)); ... if array
    // ... groupIds = customerGroupIds.split(',')... if string
    // Axios usually sends `ids[]=1&ids[]=2`.
    // Let's manual join to be safe with our controller string split logic if it receives a single string.
    // Actually controller logic handles both array and string.

    const url = '/reports/customer';
    // We need to pass params.
    // Note: customerGroupIds might need special handling if we want comma separated string.
    const queryParams: any = {
        displayType: params.displayType,
        startDate: params.startDate,
        endDate: params.endDate
    };

    if (params.search) {
        queryParams.search = params.search;
    }

    if (params.customerGroupIds && params.customerGroupIds.length > 0) {
        queryParams.customerGroupIds = params.customerGroupIds.join(',');
    }

    const response = await axiosClient.get(url, { params: queryParams });
    return response.data;
};
