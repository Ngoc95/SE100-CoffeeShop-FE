import axiosClient from '../axiosClient'

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type DisplayType = 'report' | 'chart'
export type ChartConcern = 'revenue' | 'cost' | 'profit'

export interface FinancialReportRequest {
    displayType: DisplayType
    concern?: ChartConcern | string[] // Optional now for report, used for chart filtering logically on FE or BE check passing
    startDate: string // yyyy-MM-dd
    endDate: string
}

// Unified Report Response Types
export interface UnifiedDayData {
    date: string
    orderCount: number
    revenue: number
    discount: number
    returns: number
    netRevenue: number
    cost: number
    profit: number
    profitMargin: number
}

export interface UnifiedReportResponse {
    days: UnifiedDayData[]
    totals: {
        totalOrders: number
        totalRevenue: number
        totalDiscount: number
        totalReturns: number
        totalNetRevenue: number
        totalCost: number
        totalProfit: number
        averageProfitMargin: number
    }
}

// Unified Chart Response Types
export interface ChartDataPoint {
    label: string
    revenue: number
    cost: number
    profit: number
}

export interface RevenueByHour {
    hour: number
    revenue: number
}

export interface RevenueByDayOfWeek {
    day: string
    revenue: number
}

export interface ChartMetrics {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    growthRate: number
    deductions: number
    netRevenue: number
    netRevenuePercentage: number
    totalOrders: number
    cancelledItemsCount: number
}

export interface ChartResponse {
    timeUnit: 'hour' | 'day' | 'week' | 'month' | 'year'
    data: ChartDataPoint[]
    revenueByHour: RevenueByHour[]
    revenueByDayOfWeek: RevenueByDayOfWeek[]
    metrics: ChartMetrics
}

export type FinancialReportResponse = UnifiedReportResponse | ChartResponse

// ==========================================
// API FUNCTIONS
// ==========================================

export const getFinancialReport = async (
    request: FinancialReportRequest
): Promise<FinancialReportResponse> => {
    const response = await axiosClient.post('/reports/financial', request)
    return response.data.metaData
}
