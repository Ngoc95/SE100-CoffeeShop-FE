import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import {
  getSupplierStatistics,
  SupplierPurchasingResponse,
  SupplierDebtResponse,
  SupplierChartResponse
} from '../../api/statistics/supplierStatistics';
import { convertPresetToDateRange } from '../../utils/timePresets';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

export function SupplierReport() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [viewType, setViewType] = useState<'chart' | 'report'>('chart');
  const [concern, setConcern] = useState<'purchasing' | 'debt'>('purchasing');
  const [supplierSearch, setSupplierSearch] = useState('');

  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-month');
  const thisMonthRange = convertPresetToDateRange('this-month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(thisMonthRange.from);
  const [dateTo, setDateTo] = useState<Date | undefined>(thisMonthRange.to);

  // Data states
  const [loading, setLoading] = useState(false);
  const [purchasingData, setPurchasingData] = useState<SupplierPurchasingResponse | null>(null);
  const [debtData, setDebtData] = useState<SupplierDebtResponse | null>(null);
  const [chartData, setChartData] = useState<SupplierChartResponse | null>(null);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  // Format time
  const formatDateTime = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  // Convert time preset to dates
  useEffect(() => {
    if (dateRangeType === 'preset' && timePreset) {
      const { from, to } = convertPresetToDateRange(timePreset as any);
      setDateFrom(from);
      setDateTo(to);
    }
  }, [dateRangeType, timePreset]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [concern, viewType, dateFrom, dateTo, supplierSearch]);

  const fetchData = async () => {
    if (!dateFrom || !dateTo) return;

    setLoading(true);
    try {
      const params = {
        displayType: viewType,
        concern,
        startDate: format(dateFrom, 'yyyy-MM-dd'),
        endDate: format(dateTo, 'yyyy-MM-dd'),
        search: supplierSearch || undefined
      };

      const response = await getSupplierStatistics(params);

      if (response.metaData) {
        if (viewType === 'report') {
          if (concern === 'purchasing') {
            setPurchasingData(response.metaData);
            setDebtData(null);
          } else {
            setDebtData(response.metaData);
            setPurchasingData(null);
          }
        } else {
          setChartData(response.metaData);
        }
      }
    } catch (error) {
      console.error('Error fetching supplier statistics:', error);
      toast.error('Lỗi khi tải báo cáo nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (supplierSearch) count++;
    return count;
  };

  const clearFilters = () => {
    setSupplierSearch('');
  };

  // Render content area
  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (viewType === 'chart') {
      return (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-md font-medium text-slate-900">
              {concern === 'purchasing'
                ? 'Top 10 nhà cung cấp nhập hàng nhiều nhất'
                : 'Top 10 nhà cung cấp có công nợ cao nhất'}
            </h3>
          </div>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData?.data || []}
                layout="vertical"
                margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value.toString();
                  }}
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis type="category" dataKey="name" width={140} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), concern === 'purchasing' ? 'Giá trị nhập' : 'Công nợ']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar
                  dataKey={concern === 'purchasing' ? 'value' : 'debt'}
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                  label={{
                    position: 'right',
                    fill: '#1e40af',
                    fontWeight: 'bold',
                    fontSize: 12,
                    formatter: (value: number) => value.toLocaleString('vi-VN')
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (concern === 'purchasing') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm text-slate-900">Mã NCC</th>
                <th className="text-left py-3 px-4 text-sm text-slate-900">Nhà cung cấp</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">SL hàng nhập</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị nhập</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">SL hàng trả</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị nhập thuần</th>
              </tr>
            </thead>
            <tbody>
              {purchasingData && purchasingData.suppliers.length > 0 ? (
                <>
                  {/* Summary row */}
                  <tr className="bg-amber-50 font-semibold border-b border-slate-200">
                    <td colSpan={2} className="py-3 px-4 text-sm text-slate-900 font-medium">
                      Tổng cộng
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {purchasingData.totals.totalQuantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {formatCurrency(purchasingData.totals.totalValue)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {purchasingData.totals.totalReturnedQuantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {formatCurrency(purchasingData.totals.totalReturnedValue)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {formatCurrency(purchasingData.totals.totalNetValue)}
                    </td>
                  </tr>
                  {purchasingData.suppliers.map((supplier, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-blue-600">{supplier.code}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{supplier.name}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-700">{supplier.totalQuantity.toLocaleString('vi-VN') ?? 0}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(supplier.totalValue)}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-700">{supplier.returnedQuantity.toLocaleString('vi-VN') ?? 0}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(supplier.returnedValue)}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(supplier.netValue)}</td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-12 italic">
                    Báo cáo không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm text-slate-900">Mã NCC</th>
                <th className="text-left py-3 px-4 text-sm text-slate-900">Nhà cung cấp</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">Nợ đầu kỳ</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">Ghi nợ</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">Ghi có</th>
                <th className="text-right py-3 px-4 text-sm text-slate-900">Nợ cuối kỳ</th>
              </tr>
            </thead>
            <tbody>
              {debtData && debtData.suppliers.length > 0 ? (
                <>
                  {/* Summary row */}
                  <tr className="bg-amber-50 font-semibold border-b border-slate-200">
                    <td colSpan={2} className="py-3 px-4 text-sm text-slate-900 font-medium">
                      Tổng cộng
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {formatCurrency(debtData.totals.totalOpeningDebt)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {formatCurrency(debtData.totals.totalIncurredDebt)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {formatCurrency(debtData.totals.totalPaidAmount)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                      {formatCurrency(debtData.totals.totalClosingDebt)}
                    </td>
                  </tr>
                  {debtData.suppliers.map((supplier, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-blue-600">{supplier.code}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{supplier.name}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(supplier.openingDebt)}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(supplier.incurredDebt)}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(supplier.paidAmount)}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900 font-bold">{formatCurrency(supplier.closingDebt)}</td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-12 italic">
                    Báo cáo không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="w-full p-8 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">{getActiveFilterCount()}</Badge>
            )}
            {isFilterOpen ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
          {getActiveFilterCount() > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {isFilterOpen && (
          <div className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mối quan tâm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3 font-medium">Mối quan tâm</h3>
                <Select value={concern} onValueChange={(value: string) => setConcern(value as any)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchasing">Nhập hàng</SelectItem>
                    <SelectItem value="debt">Công nợ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thời gian */}
              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="text-sm text-slate-900 mb-3 font-medium">Thời gian</h3>
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

              {/* Tìm kiếm nhà cung cấp */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3 font-medium">Tìm nhà cung cấp</h3>
                <Input
                  placeholder="Theo tên, mã NCC..."
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  className="text-sm bg-white border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Type Toggle */}
      <div className="flex justify-start">
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

      {/* Report Sheet */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="text-center py-8 border-b">
          <p className="text-sm text-slate-600 mb-2">
            Ngày lập {formatDateTime(new Date())}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 mb-1">
            Báo cáo {concern === 'purchasing' ? 'nhập hàng' : 'công nợ'} theo nhà cung cấp
          </h2>
          {dateFrom && dateTo && (
            <p className="text-sm text-slate-600">
              Từ ngày {formatDate(dateFrom)} đến ngày {formatDate(dateTo)}
            </p>
          )}
        </div>

        {renderContent()}

        <div className="py-4 text-center border-t bg-slate-50/50">
          <p className="text-xs text-slate-500 italic">Báo cáo được tạo tự động từ hệ thống</p>
        </div>
      </div>
    </div>
  );
}