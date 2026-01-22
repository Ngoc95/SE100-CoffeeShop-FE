import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    getStaffStatistics,
    StaffStatisticsResponse,
    ProfitReportResponse,
    ProfitChartResponse,
    SalesReportResponse,
    SalesChartResponse,
    StaffConcern,
    DisplayType
} from '../../api/statistics/staffStatistics';
import { convertPresetToDateRange } from '../../utils/timePresets';

export function StaffStatistics() {
    // Filter panel state
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter states
    const [viewType, setViewType] = useState<DisplayType>('chart');
    const [concern, setConcern] = useState<StaffConcern>('profit');

    // Time filter states
    const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
    const [timePreset, setTimePreset] = useState('this-week');
    const thisWeekRange = convertPresetToDateRange('this-week');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(thisWeekRange.from);
    const [dateTo, setDateTo] = useState<Date | undefined>(thisWeekRange.to);

    // Data states
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<StaffStatisticsResponse | null>(null);

    // Expanded rows for sales report
    const [expandedStaff, setExpandedStaff] = useState<Set<number>>(new Set());

    const toggleStaff = (staffId: number) => {
        const newExpanded = new Set(expandedStaff);
        if (newExpanded.has(staffId)) {
            newExpanded.delete(staffId);
        } else {
            newExpanded.add(staffId);
        }
        setExpandedStaff(newExpanded);
    };

    // Convert time preset to dates when preset changes
    useEffect(() => {
        if (dateRangeType === 'preset' && timePreset) {
            const { from, to } = convertPresetToDateRange(timePreset as any);
            setDateFrom(from);
            setDateTo(to);
        }
    }, [dateRangeType, timePreset]);

    // Fetch data when filters change
    useEffect(() => {
        fetchData();
    }, [viewType, concern, dateFrom, dateTo]);

    const fetchData = async () => {
        if (!dateFrom || !dateTo) return;

        setLoading(true);
        try {
            const startDate = format(dateFrom, 'yyyy-MM-dd');
            const endDate = format(dateTo, 'yyyy-MM-dd');

            const response = await getStaffStatistics({
                displayType: viewType,
                concern,
                startDate,
                endDate
            });

            setData(response);
        } catch (error: any) {
            console.error('Error fetching staff statistics:', error);
            toast.error(error.response?.data?.message || 'Không thể tải báo cáo nhân viên');
        } finally {
            setLoading(false);
        }
    };



    const getDateRangeDisplay = () => {
        if (dateFrom && dateTo) {
            return `${format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`;
        }
        return '';
    };

    return (
        <div className="w-full p-8 space-y-6">
            {/* Filter Panel */}
            <div className="bg-white rounded-lg border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Bộ lọc
                        {isFilterOpen ? (
                            <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                            <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                    </Button>
                </div>

                {isFilterOpen && (
                    <div className="p-6 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Mối quan tâm */}
                            <div>
                                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                                <Select value={concern} onValueChange={(value: string) => setConcern(value as StaffConcern)}>
                                    <SelectTrigger className="w-full bg-white border border-slate-300">
                                        <SelectValue placeholder="Chọn mối quan tâm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="profit">Lợi nhuận</SelectItem>
                                        <SelectItem value="sales">Hàng bán theo nhân viên</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Thời gian */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
                                <CustomerTimeFilter
                                    dateRangeType={dateRangeType}
                                    timePreset={timePreset}
                                    dateFrom={dateFrom}
                                    dateTo={dateTo}
                                    onDateRangeTypeChange={setDateRangeType}
                                    onTimePresetChange={setTimePreset}
                                    onDateFromChange={setDateFrom}
                                    onDateToChange={setDateTo}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loại hiển thị - Outside filter panel */}
            <div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setViewType('chart'); }}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'chart'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Biểu đồ
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setViewType('report'); }}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'report'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Báo cáo
                    </button>
                </div>
            </div>

            {/* Report Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-600">Đang tải dữ liệu...</div>
                </div>
            ) : !data ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-600">Chọn bộ lọc để xem báo cáo</div>
                </div>
            ) : viewType === 'report' && data.displayType === 'report' ? (
                concern === 'profit' && 'staff' in data && 'totals' in data && 'totalProfit' in data.totals ? (
                    <Card>
                        <CardContent className="p-0">
                            <div className="bg-white rounded-lg overflow-hidden">
                                {/* Header */}
                                <div className="text-center py-6 border-b">
                                    <p className="text-sm text-slate-600 mb-2">
                                        Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                    <h2 className="text-xl text-slate-900 mb-1">Báo cáo lợi nhuận theo nhân viên</h2>
                                    <p className="text-sm text-slate-600">
                                        Từ {getDateRangeDisplay()}
                                    </p>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-blue-100">
                                            <tr>
                                                <th className="text-left py-3 px-4 text-sm text-slate-900">Người nhận đơn</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng tiền hàng</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Giảm giá HĐ</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu thuần</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng giá vốn</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Lợi nhuận gộp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Total Row - First */}
                                            <tr className="bg-amber-50 border-b border-slate-200">
                                                <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                                                    Tổng (SL Người nhận đơn: {(data as ProfitReportResponse).totals.totalStaff})
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as ProfitReportResponse).totals.totalRevenue.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as ProfitReportResponse).totals.totalDiscount !== 0 ? `-${(data as ProfitReportResponse).totals.totalDiscount.toLocaleString()}` : '0'}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as ProfitReportResponse).totals.totalRevenue.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as ProfitReportResponse).totals.totalReturns.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as ProfitReportResponse).totals.totalNetRevenue.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as ProfitReportResponse).totals.totalCost.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-blue-600 font-medium">
                                                    {(data as ProfitReportResponse).totals.totalProfit.toLocaleString()}
                                                </td>
                                            </tr>
                                            {/* Employee Rows */}
                                            {(data as ProfitReportResponse).staff.map((staff) => (
                                                <tr key={staff.staffId} className="border-b border-slate-200">
                                                    <td className="py-3 px-4 text-sm text-slate-900">{staff.staffName}</td>
                                                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                        {staff.totalRevenue.toLocaleString()}
                                                    </td>
                                                    <td className="text-right py-3 px-4 text-sm text-red-600">
                                                        {staff.discount !== 0 ? `-${staff.discount.toLocaleString()}` : '0'}
                                                    </td>
                                                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                        {staff.totalRevenue.toLocaleString()}
                                                    </td>
                                                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                        {staff.returns.toLocaleString()}
                                                    </td>
                                                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                        {staff.netRevenue.toLocaleString()}
                                                    </td>
                                                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                        {staff.cost.toLocaleString()}
                                                    </td>
                                                    <td className="text-right py-3 px-4 text-sm text-blue-600 font-medium">
                                                        {staff.profit.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="py-4 text-center border-t">
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : concern === 'sales' && 'staff' in data && 'totals' in data && 'totalQuantitySold' in data.totals ? (
                    <Card>
                        <CardContent className="p-0">
                            <div className="bg-white rounded-lg overflow-hidden">
                                {/* Header */}
                                <div className="text-center py-6 border-b">
                                    <p className="text-sm text-slate-600 mb-2">
                                        Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                    <h2 className="text-xl text-slate-900 mb-1">Báo cáo bán hàng theo nhân viên</h2>
                                    <p className="text-sm text-slate-600">
                                        Từ {getDateRangeDisplay()}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 italic">
                                        (Đã phân bố giảm giá hóa đơn, giảm giá phiếu trả)
                                    </p>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-blue-100">
                                            <tr>
                                                <th className="text-left py-3 px-4 text-sm text-slate-900">Người nhận đơn</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">SL Bán</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">SL Trả</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
                                                <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu thuần</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Total Row - First */}
                                            <tr className="bg-amber-50 border-b border-slate-200">
                                                <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                                                    Tổng (SL Người nhận đơn: {(data as SalesReportResponse).totals.totalStaff})
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as SalesReportResponse).totals.totalQuantitySold.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as SalesReportResponse).totals.totalRevenue.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as SalesReportResponse).totals.totalQuantityReturned.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as SalesReportResponse).totals.totalReturnValue.toLocaleString()}
                                                </td>
                                                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                                                    {(data as SalesReportResponse).totals.totalNetRevenue.toLocaleString()}
                                                </td>
                                            </tr>
                                            {/* Employee Rows */}
                                            {(data as SalesReportResponse).staff.map((staff) => {
                                                const isExpanded = expandedStaff.has(staff.staffId);
                                                return (
                                                    <React.Fragment key={staff.staffId}>
                                                        <tr className="border-b border-slate-200 cursor-pointer hover:bg-blue-50" onClick={() => toggleStaff(staff.staffId)}>
                                                            <td className="py-3 px-4 text-sm text-slate-900">
                                                                <div className="flex items-center gap-2">
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="w-4 h-4 text-slate-600" />
                                                                    ) : (
                                                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                                                    )}
                                                                    {staff.staffName}
                                                                </div>
                                                            </td>
                                                            <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                                {staff.quantitySold.toLocaleString()}
                                                            </td>
                                                            <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                                {staff.revenue.toLocaleString()}
                                                            </td>
                                                            <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                                {staff.quantityReturned.toLocaleString()}
                                                            </td>
                                                            <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                                {staff.returnValue.toLocaleString()}
                                                            </td>
                                                            <td className="text-right py-3 px-4 text-sm text-slate-900">
                                                                {staff.netRevenue.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        {isExpanded && staff.products.length > 0 && (
                                                            <>
                                                                <tr className="bg-slate-50">
                                                                    <td colSpan={6} className="py-2 px-4">
                                                                        <table className="w-full">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th className="text-left py-2 px-4 text-xs text-slate-600">Mã hàng</th>
                                                                                    <th className="text-left py-2 px-4 text-xs text-slate-600">Tên hàng</th>
                                                                                    <th className="text-right py-2 px-4 text-xs text-slate-600">SL mặt hàng</th>
                                                                                    <th className="text-right py-2 px-4 text-xs text-slate-600">Doanh thu</th>
                                                                                    <th className="text-right py-2 px-4 text-xs text-slate-600">SL Trả</th>
                                                                                    <th className="text-right py-2 px-4 text-xs text-slate-600">Giá trị trả</th>
                                                                                    <th className="text-right py-2 px-4 text-xs text-slate-600">Doanh thu thuần</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {staff.products.map((product, index) => (
                                                                                    <tr key={index} className="border-b border-slate-100">
                                                                                        <td className="py-2 px-4 text-xs text-slate-700">{product.productCode}</td>
                                                                                        <td className="py-2 px-4 text-xs text-slate-700">{product.productName}</td>
                                                                                        <td className="text-right py-2 px-4 text-xs text-slate-700">
                                                                                            {product.quantitySold.toLocaleString()}
                                                                                        </td>
                                                                                        <td className="text-right py-2 px-4 text-xs text-slate-700">
                                                                                            {product.revenue.toLocaleString()}
                                                                                        </td>
                                                                                        <td className="text-right py-2 px-4 text-xs text-slate-700">
                                                                                            {product.quantityReturned.toLocaleString()}
                                                                                        </td>
                                                                                        <td className="text-right py-2 px-4 text-xs text-slate-700">
                                                                                            {product.returnValue.toLocaleString()}
                                                                                        </td>
                                                                                        <td className="text-right py-2 px-4 text-xs text-slate-700">
                                                                                            {product.netRevenue.toLocaleString()}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="py-4 text-center border-t">
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null
            ) : viewType === 'chart' && data.displayType === 'chart' ? (
                concern === 'profit' && 'data' in data && Array.isArray(data.data) && data.data.length > 0 && 'profit' in data.data[0] ? (
                    <Card className="border-emerald-200">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-emerald-900">
                                Top 10 nhân viên có lợi nhuận cao nhất
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={(data as ProfitChartResponse).data}
                                    layout="vertical"
                                    margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => value.toLocaleString('vi-VN')}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="staffName"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        width={200}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toLocaleString()}₫`, 'Lợi nhuận']}
                                        contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}
                                    />
                                    <Bar
                                        name="Lợi nhuận"
                                        dataKey="profit"
                                        fill="#10b981"
                                        radius={[0, 8, 8, 0]}
                                        label={{ position: 'right', fill: '#047857', fontWeight: 'bold', fontSize: 12, formatter: (value: number) => value.toLocaleString('vi-VN') }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ) : concern === 'sales' && 'data' in data && Array.isArray(data.data) && data.data.length > 0 && 'orderCount' in data.data[0] ? (
                    <Card className="border-blue-200">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-900">
                                Top 10 nhân viên bán nhiều nhất
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={(data as SalesChartResponse).data}
                                    layout="vertical"
                                    margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => value.toLocaleString('vi-VN')}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="staffName"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        width={200}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [value.toLocaleString(), 'Hóa đơn']}
                                        contentStyle={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
                                    />
                                    <Bar
                                        name="Hóa đơn"
                                        dataKey="orderCount"
                                        fill="#2563eb"
                                        radius={[0, 8, 8, 0]}
                                        label={{ position: 'right', fill: '#1e40af', fontWeight: 'bold', fontSize: 12, formatter: (value: number) => value.toLocaleString('vi-VN') }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ) : null
            ) : null}
        </div>
    );
}
