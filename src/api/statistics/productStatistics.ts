import axiosClient from '../axiosClient'

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type DisplayType = 'report' | 'chart'
export type ChartConcern = 'sales' | 'profit'

export interface ProductStatisticsRequest {
    displayType: DisplayType
    concern?: ChartConcern
    startDate: string
    endDate: string
    productSearch?: string
    categoryIds?: number[]
}

// Report Response
export interface ProductData {
    code: string
    name: string
    quantitySold: number
    revenue: number
    quantityReturned: number
    returnValue: number
    netRevenue: number
    totalCost: number
    profit: number
    profitMargin: number
}

export interface ProductReportResponse {
    products: ProductData[]
    totals: {
        totalProducts: number
        totalQuantitySold: number
        totalRevenue: number
        totalQuantityReturned: number
        totalReturnValue: number
        totalNetRevenue: number
        totalCost: number
        totalProfit: number
        averageProfitMargin: number
    }
}

// Chart - Sales Concern
export interface TopProduct {
    code: string
    name: string
    revenue?: number
    quantity?: number
    percentage: number
}

export interface OthersData {
    revenue?: number
    quantity?: number
    percentage: number
}

export interface QuantityTrendData {
    label: string
    [productCode: string]: number | string // dynamic keys for products
}

export interface SalesChartResponse {
    topByRevenue: TopProduct[]
    othersRevenue: OthersData
    topByQuantity: TopProduct[]
    othersQuantity: OthersData
    quantityTrend: {
        timeUnit: 'hour' | 'day' | 'week' | 'month' | 'year'
        data: QuantityTrendData[]
        productNames: Record<string, string>
    }
}

// Chart - Profit Concern
export interface ProfitProduct {
    code: string
    name: string
    profit?: number
    profitMargin?: number
    revenue?: number
    percentage?: number
}

export interface ProfitChartResponse {
    topByProfit: ProfitProduct[]
    othersProfit: OthersData & { profit?: number }
    topByMargin: ProfitProduct[]
}

export type ProductStatisticsResponse = ProductReportResponse | SalesChartResponse | ProfitChartResponse

// ==========================================
// API FUNCTIONS
// ==========================================

export const getProductStatistics = async (
    request: ProductStatisticsRequest
): Promise<ProductStatisticsResponse> => {
    const response = await axiosClient.post('/reports/products', request)
    return response.data.metaData
}
