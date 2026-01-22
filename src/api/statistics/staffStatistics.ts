import axiosClient from '../axiosClient'

// Types
export type DisplayType = 'report' | 'chart'
export type StaffConcern = 'profit' | 'sales'

export interface StaffStatisticsRequest {
    displayType: DisplayType
    concern: StaffConcern
    startDate: string  // YYYY-MM-DD
    endDate: string    // YYYY-MM-DD
}

// Profit Report Types
export interface StaffProfitData {
    staffId: number
    staffCode: string
    staffName: string
    totalRevenue: number
    discount: number
    netRevenue: number
    returns: number
    cost: number
    profit: number
}

export interface ProfitReportResponse {
    concern: 'profit'
    displayType: 'report'
    totals: {
        totalStaff: number
        totalRevenue: number
        totalDiscount: number
        totalNetRevenue: number
        totalReturns: number
        totalCost: number
        totalProfit: number
    }
    staff: StaffProfitData[]
}

// Profit Chart Types
export interface ProfitChartData {
    staffId: number
    staffCode: string
    staffName: string
    profit: number
}

export interface ProfitChartResponse {
    concern: 'profit'
    displayType: 'chart'
    data: ProfitChartData[]
}

// Sales Report Types
export interface ProductSalesData {
    productCode: string
    productName: string
    quantitySold: number
    revenue: number
    quantityReturned: number
    returnValue: number
    netRevenue: number
}

export interface StaffSalesData {
    staffId: number
    staffCode: string
    staffName: string
    quantitySold: number
    revenue: number
    quantityReturned: number
    returnValue: number
    netRevenue: number
    products: ProductSalesData[]
}

export interface SalesReportResponse {
    concern: 'sales'
    displayType: 'report'
    totals: {
        totalStaff: number
        totalQuantitySold: number
        totalRevenue: number
        totalQuantityReturned: number
        totalReturnValue: number
        totalNetRevenue: number
    }
    staff: StaffSalesData[]
}

// Sales Chart Types
export interface SalesChartData {
    staffId: number
    staffCode: string
    staffName: string
    orderCount: number
}

export interface SalesChartResponse {
    concern: 'sales'
    displayType: 'chart'
    data: SalesChartData[]
}

// Union type for all responses
export type StaffStatisticsResponse =
    | ProfitReportResponse
    | ProfitChartResponse
    | SalesReportResponse
    | SalesChartResponse

// API Function
export const getStaffStatistics = async (
    params: StaffStatisticsRequest
): Promise<StaffStatisticsResponse> => {
    const response = await axiosClient.get('/reports/staff', { params })
    return response.data.metaData
}
