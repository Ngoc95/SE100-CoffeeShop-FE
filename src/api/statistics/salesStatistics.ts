import axiosClient from '../axiosClient';

export interface SalesStatisticsParams {
    concern: 'time' | 'profit' | 'invoice_discount' | 'returns' | 'tables' | 'categories';
    startDate: string; // ISO 8601 format
    endDate: string;
    displayType?: 'report' | 'chart';
    areaIds?: number[];
    tableIds?: number[];
}

export const getSalesStatistics = (params: SalesStatisticsParams) => {
    return axiosClient.post('/reports/sales', params);
};
