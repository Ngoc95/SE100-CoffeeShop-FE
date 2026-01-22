import { useState, useEffect } from 'react';
import { Download, Filter, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomerTimeFilter } from '../reports/CustomerTimeFilter';
import { getSalesStatistics } from '../../api/statistics/salesStatistics';
import { toast } from 'sonner';
import { convertPresetToDateRange, TimePreset } from '../../utils/timePresets';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { getAreas, Area } from '../../api/area';
import { getTables, Table } from '../../api/table';

type ViewType = 'chart' | 'report';
type ConcernType = 'time' | 'profit' | 'invoice_discount' | 'returns' | 'tables' | 'categories';

export function SalesStatistics() {
  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('chart');
  const [concern, setConcern] = useState<ConcernType>('time');
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);

  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2026, 0, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2026, 0, 31));

  // Data states
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (date: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedRows(newExpanded);
  };

  // Data for filters
  const [areas, setAreas] = useState<Array<{ id: number; name: string }>>([]);
  const [tables, setTables] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch areas and tables on mount
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [areasResponse, tablesResponse] = await Promise.all([
          getAreas({ limit: 100 }),
          getTables({ limit: 100 })
        ]);

        setAreas(areasResponse.metaData.items.map(area => ({ id: area.id, name: area.name })));
        setTables(tablesResponse.metaData.items.map(table => ({ id: table.id, name: table.tableName })));
      } catch (error) {
        console.error('Error fetching filters data:', error);
        toast.error('Lỗi khi tải dữ liệu bộ lọc');
      }
    };

    fetchFiltersData();
  }, []);

  // Auto-set viewType to 'report' for concerns that don't have charts
  useEffect(() => {
    if (concern === 'invoice_discount' || concern === 'returns' || concern === 'tables' || concern === 'categories') {
      setViewType('report');
    }
  }, [concern]);

  // Convert time preset to actual dates
  useEffect(() => {
    if (dateRangeType === 'preset') {
      const { from, to } = convertPresetToDateRange(timePreset as TimePreset);
      setDateFrom(from);
      setDateTo(to);
    }
  }, [dateRangeType, timePreset]);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [concern, viewType, dateFrom, dateTo, selectedAreas, selectedTables]);

  const fetchData = async () => {
    if (!dateFrom || !dateTo) return;

    setLoading(true);
    try {
      const params: any = {
        concern: concern,
        startDate: format(dateFrom, 'yyyy-MM-dd'),
        endDate: format(dateTo, 'yyyy-MM-dd'),
      };

      // Add displayType for time and profit
      if (concern === 'time' || concern === 'profit') {
        params.displayType = viewType;
      }

      // Add area/table filters
      if (selectedAreas.length > 0) {
        params.areaIds = selectedAreas;
      }
      if (selectedTables.length > 0) {
        params.tableIds = selectedTables;
      }

      const response = await getSalesStatistics(params);
      setData(response.data?.metaData || response.data);
    } catch (error: any) {
      console.error('Error fetching sales statistics:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const getConcernLabel = () => {
    const labels: { [key: string]: string } = {
      'time': 'về Thời gian',
      'profit': 'về Lợi nhuận',
      'invoice_discount': 'về Giảm giá HĐ',
      'returns': 'về Trả hàng',
      'tables': 'về Phòng/Bàn',
      'categories': 'về Danh mục hàng hóa',
    };
    return labels[concern] || '';
  };

  const renderChart = () => {
    if (!data || viewType !== 'chart') return null;

    const chartData = data.data || [];
    const timeUnit = data.timeUnit;

    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-1">
            {concern === 'time' ? 'Doanh thu thuần' : 'Lợi nhuận'} theo {timeUnit === 'hour' ? 'giờ' : timeUnit === 'day' ? 'ngày' : timeUnit === 'week' ? 'tuần' : timeUnit === 'month' ? 'tháng' : 'năm'}
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {concern === 'time' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Doanh thu thuần']} contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
              <Line type="monotone" dataKey="netRevenue" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`} />
              <Tooltip formatter={(value: number, name: string) => {
                const labels: Record<string, string> = { 'revenue': 'Doanh thu', 'profit': 'Lợi nhuận', 'cost': 'Giá vốn' };
                return [formatCurrency(value), labels[name] || name];
              }} contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
              <Bar dataKey="profit" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Legend formatter={(value: string) => ({ 'profit': 'Lợi nhuận', 'revenue': 'Doanh thu', 'cost': 'Giá vốn' }[value] || value)} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTimeReport = () => {
    if (!data || !data.days) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu thuần</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-50 border-b border-slate-200">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatNumber(data.totals.totalRevenue)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatNumber(data.totals.totalReturnValue)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatNumber(data.totals.totalNetRevenue)}</td>
            </tr>
            {data.days.map((item: any, idx: number) => {
              const isExpanded = expandedRows.has(item.date);
              const hasInvoices = item.invoices && item.invoices.length > 0;

              return (
                <>
                  <tr
                    key={idx}
                    className="border-b border-slate-200 cursor-pointer hover:bg-blue-50"
                    onClick={() => hasInvoices && toggleRow(item.date)}
                  >
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        {hasInvoices ? (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          )
                        ) : null}
                        <span className="text-blue-600">{format(new Date(item.date), 'dd/MM/yyyy')}</span>
                      </div>
                    </td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(item.totalRevenue)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(item.returnValue)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(item.netRevenue)}</td>
                  </tr>

                  {/* Invoice Details */}
                  {isExpanded && hasInvoices && (
                    <tr className="bg-slate-50">
                      <td colSpan={4} className="p-0">
                        <div className="px-4 py-2">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="text-left py-2 px-4 text-xs text-slate-600 w-[20%]">Mã giao dịch</th>
                                <th className="text-left py-2 px-4 text-xs text-slate-600 w-[20%]">Thời gian</th>
                                <th className="text-right py-2 px-4 text-xs text-slate-600 w-[20%]">Doanh thu</th>
                                <th className="text-right py-2 px-4 text-xs text-slate-600 w-[20%]">Giá trị trả</th>
                                <th className="text-right py-2 px-4 text-xs text-slate-600 w-[20%]">Doanh thu thuần</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.invoices.map((invoice: any, invIdx: number) => (
                                <tr key={invIdx} className="border-b border-slate-200">
                                  <td className="py-2 px-4 text-xs text-slate-700">{invoice.orderCode}</td>
                                  <td className="py-2 px-4 text-xs text-slate-700">{format(new Date(invoice.completedAt), 'dd/MM/yyyy HH:mm')}</td>
                                  <td className="text-right py-2 px-4 text-xs text-slate-700">{formatNumber(invoice.revenue)}</td>
                                  <td className="text-right py-2 px-4 text-xs text-slate-700">{formatNumber(invoice.returnValue)}</td>
                                  <td className="text-right py-2 px-4 text-xs text-slate-700">{formatNumber(invoice.netRevenue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProfitReport = () => {
    if (!data || !data.days) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-900">Thời gian</th>
              <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">Tổng tiền hàng</th>
              <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">Giảm giá HĐ</th>
              <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">Doanh thu</th>
              <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">Tổng giá vốn</th>
              <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">Lợi nhuận gộp</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-50">
              <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">Tổng</td>
              <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(data.totals.totalSubtotal)}</td>
              <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(data.totals.totalDiscount)}</td>
              <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(data.totals.totalRevenue)}</td>
              <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(data.totals.totalCost)}</td>
              <td className="border border-slate-300 px-4 py-2 text-right text-sm text-blue-600 font-medium">{formatNumber(data.totals.totalGrossProfit)}</td>
            </tr>
            {data.days.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="border border-slate-300 px-4 py-2 text-sm text-blue-600">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.totalSubtotal)}</td>
                <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.totalDiscount)}</td>
                <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.totalRevenue)}</td>
                <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.totalCost)}</td>
                <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.grossProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDiscountReport = () => {
    if (!data || !data.invoices) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã HĐ</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Số tiền gốc</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Giảm giá</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Thành tiền</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">% Giảm</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-50 border-b border-slate-200">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium" colSpan={2}>Tổng</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalSubtotal)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalDiscount)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalAmount)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{data.totals.averageDiscountPercent.toFixed(2)}%</td>
            </tr>
            {data.invoices.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{item.orderCode}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(item.completedAt), 'dd/MM/yyyy HH:mm')}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.subtotal)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.discount)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.total)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{item.discountPercent.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderReturnsReport = () => {
    if (!data || !data.items) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã SP</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã HĐ</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Số lượng</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Lý do</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-50 border-b border-slate-200">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium" colSpan={3}>Tổng</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{data.totals.totalQuantity}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalReturnValue)}</td>
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">-</td>
            </tr>
            {data.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{item.productCode}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.orderCode}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{format(new Date(item.cancelledAt), 'dd/MM/yyyy HH:mm')}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{item.quantity}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.returnValue)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.reason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTablesReport = () => {
    if (!data || !data.tables) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Phòng/Bàn</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Khu vực</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Số lượt sử dụng</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng doanh thu</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">DT trung bình</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Tỷ lệ sử dụng (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-50 border-b border-slate-200">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium" colSpan={2}>Tổng</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{data.totals.totalUsageCount}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalRevenue)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.averageRevenue)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{data.totals.averageUtilizationRate.toFixed(2)}%</td>
            </tr>
            {data.tables.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{item.tableName}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.areaName}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{item.usageCount}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.totalRevenue)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.averageRevenue)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{item.utilizationRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCategoriesReport = () => {
    if (!data || !data.categories) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Danh mục hàng hóa</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">SL bán</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">SL trả</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu thuần</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-50 border-b border-slate-200">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatNumber(data.totals.totalQuantitySold)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalRevenue)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{data.totals.totalQuantityReturned}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalReturnValue)}</td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(data.totals.totalNetRevenue)}</td>
            </tr>
            {data.categories.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{item.categoryName}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatNumber(item.quantitySold)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.revenue)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{item.quantityReturned}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.returnValue)}</td>
                <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.netRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderReport = () => {
    if (loading) {
      return <div className="text-center py-8">Đang tải dữ liệu...</div>;
    }

    if (!data) {
      return <div className="text-center py-8 text-slate-500">Không có dữ liệu</div>;
    }

    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-8 bg-white" style={{ minHeight: '800px' }}>
          <div className="mb-8">
            <p className="text-sm text-slate-600 mb-4 text-center">
              Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
            <h2 className="text-slate-900 mb-2 text-center">
              Báo cáo bán hàng {getConcernLabel()}
            </h2>
            {dateFrom && dateTo && (
              <p className="text-sm text-slate-600 text-center mb-2">
                Từ ngày {format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày {format(dateTo, 'dd/MM/yyyy', { locale: vi })}
              </p>
            )}
          </div>

          {concern === 'time' && renderTimeReport()}
          {concern === 'profit' && renderProfitReport()}
          {concern === 'invoice_discount' && renderDiscountReport()}
          {concern === 'returns' && renderReturnsReport()}
          {concern === 'tables' && renderTablesReport()}
          {concern === 'categories' && renderCategoriesReport()}
        </div>
      </div>
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedAreas.length > 0) count++;
    if (selectedTables.length > 0) count++;
    return count;
  };

  return (
    <div className="w-full p-8 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className="gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
            {getActiveFilterCount() > 0 && <Badge variant="secondary" className="ml-2">{getActiveFilterCount()}</Badge>}
            {isFilterOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          {getActiveFilterCount() > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setSelectedAreas([]); setSelectedTables([]); }}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {isFilterOpen && (
          <div className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <Select value={concern} onValueChange={(value: string) => setConcern(value as ConcernType)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Thời gian</SelectItem>
                    <SelectItem value="profit">Lợi nhuận</SelectItem>
                    <SelectItem value="invoice_discount">Giảm giá HĐ</SelectItem>
                    <SelectItem value="returns">Trả hàng</SelectItem>
                    <SelectItem value="tables">Phòng/Bàn</SelectItem>
                    <SelectItem value="categories">Danh mục hàng hóa</SelectItem>
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

              {/* Phòng bàn - Khu vực */}
              <div>
                <MultiSelectFilter
                  items={areas}
                  selectedIds={selectedAreas}
                  onSelectionChange={(ids) => setSelectedAreas(ids as number[])}
                  label="Khu vực"
                  placeholder="Tìm khu vực..."
                />
              </div>

              {/* Phòng bàn */}
              <div>
                <MultiSelectFilter
                  items={tables}
                  selectedIds={selectedTables}
                  onSelectionChange={(ids) => setSelectedTables(ids as number[])}
                  label="Phòng bàn"
                  placeholder="Tìm bàn..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loại hiển thị - Only show for time and profit concerns */}
      {(concern === 'time' || concern === 'profit') && (
        <div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewType('chart')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'chart' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Biểu đồ
            </button>
            <button
              onClick={() => setViewType('report')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'report' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Báo cáo
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {viewType === 'chart' ? renderChart() : renderReport()}
    </div>
  );
}