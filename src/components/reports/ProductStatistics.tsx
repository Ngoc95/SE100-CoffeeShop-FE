import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Filter, ChevronDown, ChevronUp, X, CheckCircle2, Award, TrendingUp, LineChart as LineChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { convertPresetToDateRange, TimePreset } from '../../utils/timePresets';
import { getCategories } from '../../api/category';
import {
    getProductStatistics,
    DisplayType,
    ChartConcern,
    ProductReportResponse,
    SalesChartResponse,
    ProfitChartResponse,
} from '../../api/statistics/productStatistics';
import { ProductsReportExcel } from './ProductsReportExcel';
import { MultiSelectFilter } from '../MultiSelectFilter';

interface SelectableItem {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

export function ProductStatistics() {
    // Filter panel state
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter states
    const [viewType, setViewType] = useState<'chart' | 'report'>('chart');
    const [concern, setConcern] = useState<'sales' | 'profit'>('sales');
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<SelectableItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Time filter states
    const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
    const [timePreset, setTimePreset] = useState('this-week');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2026, 0, 1));
    const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2026, 0, 31));

    // Data states
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ProductReportResponse | null>(null);
    const [salesChartData, setSalesChartData] = useState<SalesChartResponse | null>(null);
    const [profitChartData, setProfitChartData] = useState<ProfitChartResponse | null>(null);

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

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
    }, [viewType, concern, dateFrom, dateTo, productSearch, selectedCategories]);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data.metaData.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const fetchData = async () => {
        if (!dateFrom || !dateTo) return;

        setLoading(true);
        try {
            const startDate = format(dateFrom, 'yyyy-MM-dd');
            const endDate = format(dateTo, 'yyyy-MM-dd');

            const response = await getProductStatistics({
                displayType: viewType as DisplayType,
                concern: viewType === 'chart' ? (concern as ChartConcern) : undefined,
                startDate,
                endDate,
                productSearch: productSearch || undefined,
                categoryIds: selectedCategories.length > 0 ? selectedCategories.map(c => c.id) : undefined,
            });

            if (viewType === 'chart') {
                if (concern === 'sales') {
                    setSalesChartData(response as SalesChartResponse);
                    setProfitChartData(null);
                } else {
                    setProfitChartData(response as ProfitChartResponse);
                    setSalesChartData(null);
                }
                setReportData(null);
            } else {
                setReportData(response as ProductReportResponse);
                setSalesChartData(null);
                setProfitChartData(null);
            }
        } catch (error: any) {
            console.error('Error fetching product statistics:', error);
            toast.error(error.response?.data?.message || 'Không thể tải thống kê hàng hóa');
        } finally {
            setLoading(false);
        }
    };

    // Helper functions
    const handleMultiSelect = (item: SelectableItem) => {
        const isSelected = selectedCategories.some(s => s.id === item.id);
        if (isSelected) {
            setSelectedCategories(selectedCategories.filter(s => s.id !== item.id));
        } else {
            setSelectedCategories([...selectedCategories, item]);
        }
    };

    const handleRemoveItem = (id: number) => {
        setSelectedCategories(selectedCategories.filter(item => item.id !== id));
    };

    // Handle category selection change from MultiSelectFilter
    const handleCategorySelectionChange = (selectedIds: (string | number)[]) => {
        const selected = categories
            .filter(cat => selectedIds.includes(cat.id))
            .map(cat => ({ id: cat.id, name: cat.name }));
        setSelectedCategories(selected);
    };

    // Calculate active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (productSearch) count++;
        if (selectedCategories.length > 0) count++;
        return count;
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString();
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7', '#94a3b8'];

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
                            {/* Mối quan tâm */}
                            <div>
                                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                                <Select value={concern} onValueChange={(value: string) => setConcern(value as typeof concern)}>
                                    <SelectTrigger className="w-full bg-white border border-slate-300">
                                        <SelectValue placeholder="Chọn mối quan tâm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sales">Bán hàng</SelectItem>
                                        <SelectItem value="profit">Lợi nhuận</SelectItem>
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

                            {/* Tìm kiếm sản phẩm */}
                            <div>
                                <h3 className="text-sm text-slate-900 mb-3">Hàng hóa</h3>
                                <Input
                                    placeholder="Theo tên, mã hàng"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="text-sm bg-white border border-slate-300"
                                />
                            </div>

                            {/* Danh mục hàng hóa */}
                            <div>
                                <h3 className="text-sm text-slate-900 mb-3">Danh mục hàng hóa</h3>
                                <MultiSelectFilter
                                    items={categories.map(cat => ({ id: cat.id, name: cat.name }))}
                                    selectedIds={selectedCategories.map(c => c.id)}
                                    onSelectionChange={handleCategorySelectionChange}
                                    placeholder="Chọn danh mục"
                                />
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {getActiveFilterCount() > 0 && (
                            <div className="pt-4 border-t border-slate-200 mt-6">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setProductSearch('');
                                        setSelectedCategories([]);
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Loại hiển thị */}
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
            ) : viewType === 'report' ? (
                reportData && (
                    <ProductsReportExcel
                        concern={concern}
                        dateFrom={dateFrom || new Date()}
                        dateTo={dateTo || new Date()}
                        productsData={reportData.products.map(p => ({
                            code: p.code,
                            name: p.name,
                            quantitySold: p.quantitySold,
                            revenue: p.revenue,
                            quantityReturned: p.quantityReturned,
                            returnValue: p.returnValue,
                            netRevenue: p.netRevenue,
                            costOfGoods: p.totalCost,
                            profit: p.profit,
                            profitMargin: p.profitMargin,
                        }))}
                    />
                )
            ) : concern === 'sales' && salesChartData ? (
                <>
                    {/* Sales Concern Charts */}
                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Award className="w-5 h-5" />
                                TOP 10 sản phẩm doanh số cao nhất
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={[...salesChartData.topByRevenue, { name: 'Khác', revenue: salesChartData.othersRevenue.revenue, percentage: salesChartData.othersRevenue.percentage }]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="revenue"
                                    >
                                        {[...salesChartData.topByRevenue, { name: 'Khác' }].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `${formatCurrency(value)}₫`}
                                        contentStyle={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
                                    />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', fontSize: '14px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-900">
                                <TrendingUp className="w-5 h-5" />
                                TOP 10 sản phẩm bán chạy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={[...salesChartData.topByQuantity, { name: 'Khác', quantity: salesChartData.othersQuantity.quantity, percentage: salesChartData.othersQuantity.percentage }]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="quantity"
                                    >
                                        {[...salesChartData.topByQuantity, { name: 'Khác' }].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `${value} sản phẩm`}
                                        contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}
                                    />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', fontSize: '14px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-900">
                                <LineChartIcon className="w-5 h-5" />
                                Biến động số lượng bán theo thời gian (Top 10)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart
                                    data={salesChartData.quantityTrend.data}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Legend wrapperStyle={{ fontSize: '14px' }} iconType="line" />
                                    {Object.keys(salesChartData.quantityTrend.productNames).map((code, index) => (
                                        <Line
                                            key={code}
                                            type="monotone"
                                            dataKey={code}
                                            name={salesChartData.quantityTrend.productNames[code]}
                                            stroke={COLORS[index % COLORS.length]}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            ) : profitChartData ? (
                <>
                    {/* Profit Concern Charts */}
                    <Card className="border-emerald-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-900">
                                <Award className="w-5 h-5" />
                                TOP 10 sản phẩm lợi nhuận cao nhất
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={[...profitChartData.topByProfit, { name: 'Khác', profit: profitChartData.othersProfit.profit, percentage: profitChartData.othersProfit.percentage }]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="profit"
                                    >
                                        {[...profitChartData.topByProfit, { name: 'Khác' }].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `${formatCurrency(value)}₫`}
                                        contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}
                                    />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <TrendingUp className="w-5 h-5" />
                                TOP 10 sản phẩm theo tỷ suất lợi nhuận
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={profitChartData.topByMargin}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={(entry: any) => `${entry.name}: ${entry.profitMargin.toFixed(1)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="profitMargin"
                                    >
                                        {profitChartData.topByMargin.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Tỷ suất LN']}
                                        contentStyle={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
                                    />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            ) : null}
        </div>
    );
}
