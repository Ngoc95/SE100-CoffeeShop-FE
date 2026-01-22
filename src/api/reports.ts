import axiosClient from './axiosClient';

export interface DashboardSummary {
  revenue: { today: number; yesterday: number };
  orders: { today: number; yesterday: number };
  customers: { today: number; yesterday: number };
  avgOrderValue: { today: number; yesterday: number };
}

export interface ReportPayload {
    concern: 'time' | 'profit' | 'invoice_discount' | 'returns' | 'tables' | 'categories' | 'products' | 'customers';
    startDate: string;
    endDate: string;
    displayType?: 'report' | 'chart';
    [key: string]: any;
}

export const reportApi = {
  getDashboardSummary: () => {
    return axiosClient.get<{ metaData: DashboardSummary }>('/reports/dashboard-summary');
  },
  getSalesStatistics: (payload: ReportPayload) => {
    return axiosClient.post<{ metaData: any }>('/reports/sales', payload);
  }
};
