import { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    ShoppingBag,
    BarChart3,
    LineChart as LineChartIcon,
    Filter,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    LabelList,
    Legend,
} from 'recharts';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import { toast } from 'sonner';
import { convertPresetToDateRange, TimePreset } from '../../utils/timePresets';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { createSmartFormatter } from '../../utils/chartFormatters';
import {
    getFinancialReport,
    UnifiedReportResponse,
    ChartResponse,
} from '../../api/statistics/financialStatistics';

export function FinancialStatistics() {
    // Filter panel state
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter states
    const [viewType, setViewType] = useState<'chart' | 'report'>('chart');
    const [selectedConcerns, setSelectedConcerns] = useState<string[]>(['revenue', 'cost', 'profit']);

    // Time filter states
    const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
    const [timePreset, setTimePreset] = useState('this-week');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2026, 0, 1));
    const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2026, 0, 31));

    // Data states
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<UnifiedReportResponse | null>(null);
    const [chartData, setChartData] = useState<ChartResponse | null>(null);

    // Concern options (Only relevant for Chart view)
    const concernOptions = [
        { id: 'revenue', label: 'Doanh thu' },
        { id: 'cost', label: 'Chi phí' },
        { id: 'profit', label: 'Lợi nhuận' },
    ];

    // Convert preset to date range
    useEffect(() => {
        if (dateRangeType === 'preset') {
            const { from, to } = convertPresetToDateRange(timePreset as TimePreset);
            setDateFrom(from);
            setDateTo(to);
        }
    }, [timePreset, dateRangeType]);

    // Fetch data when filters change
    useEffect(() => {
        fetchData();
    }, [viewType, dateFrom, dateTo]);

    const fetchData = async () => {
        if (!dateFrom || !dateTo) return;

        setLoading(true);
        try {
            const startDate = format(dateFrom, 'yyyy-MM-dd');
            const endDate = format(dateTo, 'yyyy-MM-dd');

            if (viewType === 'report') {
                const response = await getFinancialReport({
                    displayType: 'report',
                    startDate,
                    endDate,
                });
                setReportData(response as UnifiedReportResponse);
                setChartData(null);
            } else {
                const response = await getFinancialReport({
                    displayType: 'chart',
                    startDate,
                    endDate,
                });
                setChartData(response as ChartResponse);
                setReportData(null);
            }
        } catch (error: any) {
            console.error('Error fetching financial report:', error);
            toast.error(error.response?.data?.message || 'Không thể tải báo cáo tài chính');
        } finally {
            setLoading(false);
        }
    };

    // Calculate active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        // For Chart view, concern filter counts
        if (viewType === 'chart' && selectedConcerns.length > 0 && selectedConcerns.length < concernOptions.length) {
            count++;
        }
        return count;
    };

    // Toggle concern selection
    const toggleConcern = (concern: string) => {
        setSelectedConcerns(prev =>
            prev.includes(concern)
                ? prev.filter(c => c !== concern)
                : [...prev, concern]
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    // Helper to check if a concern is selected
    const isSelected = (id: string) => selectedConcerns.includes(id);

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
                        {getActiveFilterCount() > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {getActiveFilterCount()}
                            </Badge>
                        )}
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

                            {/* Mối quan tâm - Only show in Chart mode */}
                            {viewType === 'chart' && (
                                <div>
                                    <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm biểu đồ</h3>
                                    <div className="space-y-2">
                                        {concernOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`concern-${option.id}`}
                                                    checked={selectedConcerns.includes(option.id)}
                                                    onCheckedChange={() => toggleConcern(option.id)}
                                                />
                                                <label
                                                    htmlFor={`concern-${option.id}`}
                                                    className="text-sm text-slate-700 cursor-pointer"
                                                >
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Thời gian */}
                            <div className={`md:col-span-2 ${viewType === 'chart' ? '' : 'lg:col-span-3'}`}>
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

                        {/* Clear Filters Button */}
                        {viewType === 'chart' && getActiveFilterCount() > 0 && (
                            <div className="pt-4 border-t border-slate-200 mt-6">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setSelectedConcerns(['revenue', 'cost', 'profit']);
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Loại hiển thị - Outside filter panel */}
            <div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                    <button
                        onClick={() => setViewType('chart')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'chart'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Biểu đồ
                    </button>
                    <button
                        onClick={() => setViewType('report')}
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
            ) : (
                <div className="space-y-6">
                    {viewType === 'chart' && chartData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-600">Tổng doanh thu</span>
                                            <DollarSign className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-2xl text-blue-900">
                                            {formatCurrency(chartData.metrics.totalRevenue)}₫
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm mt-2 ${chartData.metrics.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {chartData.metrics.growthRate >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            <span>{chartData.metrics.growthRate >= 0 ? '+' : ''}{chartData.metrics.growthRate.toFixed(1)}%</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-600">Giảm trừ</span>
                                            <TrendingDown className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="text-2xl text-slate-900">
                                            {formatCurrency(chartData.metrics.deductions)}₫
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2">KM + Hủy đơn</div>
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-600">Doanh thu thuần</span>
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="text-2xl text-emerald-900">
                                            {formatCurrency(chartData.metrics.netRevenue)}₫
                                        </div>
                                        <div className="text-sm text-emerald-600 mt-2">
                                            {chartData.metrics.netRevenuePercentage.toFixed(1)}% doanh thu
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-600">Tổng lợi nhuận</span>
                                            <DollarSign className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-2xl text-blue-900">
                                            {formatCurrency(chartData.metrics.totalProfit)}₫
                                        </div>
                                        <div className="text-sm text-blue-600 mt-2">
                                            Tỷ suất: {(chartData.metrics.netRevenue > 0 ? (chartData.metrics.totalProfit / chartData.metrics.netRevenue * 100) : 0).toFixed(1)}%
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Combined Financial Chart */}
                            <Card className="border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-900">
                                        <LineChartIcon className="w-5 h-5" />
                                        Biểu đồ tài chính (Doanh thu - Chi phí - Lợi nhuận)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const formatter = createSmartFormatter(chartData.data, ['revenue', 'cost', 'profit']);
                                        return (
                                            <ResponsiveContainer width="100%" height={400}>
                                                <LineChart data={chartData.data}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis
                                                        dataKey="label"
                                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                                    />
                                                    <YAxis
                                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                                        tickFormatter={formatter.formatAxis}
                                                    />
                                                    <Tooltip
                                                        formatter={(value: number, name: string) => {
                                                            const labels: Record<string, string> = {
                                                                'revenue': 'Doanh thu',
                                                                'cost': 'Chi phí',
                                                                'profit': 'Lợi nhuận'
                                                            };
                                                            return [formatter.formatTooltip(value), labels[name] || name];
                                                        }}
                                                        labelFormatter={(label) => label}
                                                        contentStyle={{
                                                            backgroundColor: '#eff6ff',
                                                            border: '1px solid #bfdbfe',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                    <Legend
                                                        formatter={(value) => {
                                                            const labels: Record<string, string> = {
                                                                'revenue': 'Doanh thu',
                                                                'cost': 'Chi phí',
                                                                'profit': 'Lợi nhuận'
                                                            };
                                                            return labels[value] || value;
                                                        }}
                                                    />
                                                    {isSelected('revenue') && (
                                                        <Line
                                                            type="monotone"
                                                            dataKey="revenue"
                                                            stroke="#059669"
                                                            strokeWidth={3}
                                                            name="revenue"
                                                            dot={{ fill: '#059669', r: 4 }}
                                                            activeDot={{ r: 6 }}
                                                        >
                                                            <LabelList
                                                                dataKey="revenue"
                                                                position="top"
                                                                formatter={formatter.format}
                                                                style={{ fill: '#059669', fontSize: 11, fontWeight: 'bold' }}
                                                            />
                                                        </Line>
                                                    )}
                                                    {isSelected('cost') && (
                                                        <Line
                                                            type="monotone"
                                                            dataKey="cost"
                                                            stroke="#dc2626"
                                                            strokeWidth={3}
                                                            name="cost"
                                                            dot={{ fill: '#dc2626', r: 4 }}
                                                            activeDot={{ r: 6 }}
                                                        >
                                                            <LabelList
                                                                dataKey="cost"
                                                                position="top"
                                                                formatter={formatter.format}
                                                                style={{ fill: '#dc2626', fontSize: 11, fontWeight: 'bold' }}
                                                            />
                                                        </Line>
                                                    )}
                                                    {isSelected('profit') && (
                                                        <Line
                                                            type="monotone"
                                                            dataKey="profit"
                                                            stroke="#2563eb"
                                                            strokeWidth={3}
                                                            name="profit"
                                                            dot={{ fill: '#2563eb', r: 4 }}
                                                            activeDot={{ r: 6 }}
                                                        >
                                                            <LabelList
                                                                dataKey="profit"
                                                                position="top"
                                                                formatter={formatter.format}
                                                                style={{ fill: '#2563eb', fontSize: 11, fontWeight: 'bold' }}
                                                            />
                                                        </Line>
                                                    )}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        );
                                    })()}
                                </CardContent>
                            </Card>

                            {/* Revenue by Hour */}
                            {isSelected('revenue') && (() => {
                                const formatter = createSmartFormatter(chartData.revenueByHour, ['revenue']);
                                return (
                                    <Card className="border-blue-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                                <LineChartIcon className="w-5 h-5" />
                                                Doanh thu theo giờ
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={chartData.revenueByHour}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(hour) => `${hour}:00`} />
                                                    <YAxis
                                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                                        tickFormatter={formatter.formatAxis}
                                                    />
                                                    <Tooltip
                                                        formatter={(value: number) => [formatter.formatTooltip(value), 'Doanh thu']}
                                                        labelFormatter={(hour) => `${hour}:00`}
                                                        contentStyle={{
                                                            backgroundColor: '#eff6ff',
                                                            border: '1px solid #bfdbfe',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="revenue"
                                                        stroke="#2563eb"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                                                    >
                                                        <LabelList
                                                            dataKey="revenue"
                                                            position="top"
                                                            formatter={formatter.format}
                                                            style={{ fill: '#2563eb', fontSize: 12, fontWeight: 'bold' }}
                                                        />
                                                    </Line>
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                );
                            })()}

                            {/* Revenue by Day of Week */}
                            {isSelected('revenue') && (() => {
                                const formatter = createSmartFormatter(chartData.revenueByDayOfWeek, ['revenue']);
                                return (
                                    <Card className="border-blue-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                                <BarChart3 className="w-5 h-5" />
                                                Doanh thu theo ngày trong tuần
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={chartData.revenueByDayOfWeek}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                                                    <YAxis
                                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                                        tickFormatter={formatter.formatAxis}
                                                    />
                                                    <Tooltip
                                                        formatter={(value: number) => [formatter.formatTooltip(value), 'Doanh thu']}
                                                        contentStyle={{
                                                            backgroundColor: '#eff6ff',
                                                            border: '1px solid #bfdbfe',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                    <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]}>
                                                        <LabelList
                                                            dataKey="revenue"
                                                            position="top"
                                                            formatter={formatter.format}
                                                            style={{ fill: '#2563eb', fontSize: 12, fontWeight: 'bold' }}
                                                        />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                );
                            })()}
                        </>
                    ) : viewType === 'report' && reportData ? (
                        /* Unified Report Table */
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="p-8 bg-white" style={{ minHeight: '800px' }}>
                                <div className="mb-8">
                                    <p className="text-sm text-slate-600 mb-4 text-center">
                                        Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                    <h2 className="text-slate-900 mb-2 text-center">
                                        Báo cáo tài chính chi tiết
                                    </h2>
                                    {dateFrom && dateTo && (
                                        <p className="text-sm text-slate-600 text-center mb-2">
                                            Từ ngày {format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày {format(dateTo, 'dd/MM/yyyy', { locale: vi })}
                                        </p>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-blue-50">
                                                <TableHead>Ngày</TableHead>
                                                <TableHead className="text-right">Số đơn</TableHead>
                                                <TableHead className="text-right">Doanh thu</TableHead>
                                                <TableHead className="text-right">Giảm trừ</TableHead>
                                                <TableHead className="text-right">DT thuần</TableHead>
                                                <TableHead className="text-right">Giá vốn</TableHead>
                                                <TableHead className="text-right">Lợi nhuận</TableHead>
                                                <TableHead className="text-right">Tỷ suất</TableHead>
                                            </TableRow>
                                            {/* Totals Row - Yellow Background */}
                                            <TableRow className="bg-amber-50 border-b border-slate-200">
                                                <TableCell className="text-sm text-slate-900 font-bold">Tổng cộng</TableCell>
                                                <TableCell className="text-sm text-slate-900 text-right font-bold">
                                                    {reportData.totals.totalOrders}
                                                </TableCell>
                                                <TableCell className="text-sm text-emerald-700 text-right font-bold">
                                                    {formatCurrency(reportData.totals.totalRevenue)}
                                                </TableCell>
                                                <TableCell className="text-sm text-orange-700 text-right font-bold">
                                                    -{formatCurrency(reportData.totals.totalDiscount + reportData.totals.totalReturns)}
                                                </TableCell>
                                                <TableCell className="text-sm text-emerald-900 text-right font-bold">
                                                    {formatCurrency(reportData.totals.totalNetRevenue)}
                                                </TableCell>
                                                <TableCell className="text-sm text-red-700 text-right font-bold">
                                                    {formatCurrency(reportData.totals.totalCost)}
                                                </TableCell>
                                                <TableCell className="text-sm text-blue-700 text-right font-bold">
                                                    {formatCurrency(reportData.totals.totalProfit)}
                                                </TableCell>
                                                <TableCell className="text-sm text-amber-700 text-right font-bold">
                                                    {reportData.totals.averageProfitMargin.toFixed(1)}%
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportData.days.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="text-sm text-slate-900">{item.date}</TableCell>
                                                    <TableCell className="text-sm text-slate-700 text-right">{item.orderCount}</TableCell>
                                                    <TableCell className="text-sm text-emerald-700 text-right">
                                                        {formatCurrency(item.revenue)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-orange-700 text-right">
                                                        -{formatCurrency(item.discount + item.returns)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-emerald-900 text-right">
                                                        {formatCurrency(item.netRevenue)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-red-700 text-right">
                                                        {formatCurrency(item.cost)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-blue-700 text-right font-bold">
                                                        {formatCurrency(item.profit)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-amber-700 text-right">{item.profitMargin.toFixed(1)}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
