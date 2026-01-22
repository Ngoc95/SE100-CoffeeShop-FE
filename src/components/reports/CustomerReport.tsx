import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getCustomerStatistics, CustomerReportResponse, CustomerChartResponse } from '../../api/statistics/customerStatistics';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { getCustomerGroups } from '../../api/customerGroup';
import { convertPresetToDateRange } from '../../utils/timePresets';
import { toast } from 'sonner';

export function CustomerReport() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [viewType, setViewType] = useState<'chart' | 'report'>('chart');
  const [customerSearch, setCustomerSearch] = useState('');

  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-week');
  const thisWeekRange = convertPresetToDateRange('this-week');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(thisWeekRange.from);
  const [dateTo, setDateTo] = useState<Date | undefined>(thisWeekRange.to);

  // Customer Group Filter
  const [customerGroups, setCustomerGroups] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  // Data states
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<CustomerReportResponse | null>(null);
  const [chartData, setChartData] = useState<CustomerChartResponse | null>(null);

  // Fetch customer groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getCustomerGroups({ limit: 100 });
        if (response.data?.metaData?.groups) {
          setCustomerGroups(response.data.metaData.groups.map((g: any) => ({ id: g.id, name: g.name })));
        }
      } catch (error) {
        console.error('Error fetching customer groups:', error);
      }
    };
    fetchGroups();
  }, []);

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
  }, [viewType, dateFrom, dateTo, selectedGroupIds, customerSearch]);
  // debouncing search might be good but let's stick to simple effect for now or add debounce if needed. 
  // Ideally search should be debounced or triggered by enter/button. 
  // But user request didn't specify. I'll use it directly but maybe with a small delay or just direct. 
  // Given standard current impl in other files, direct is common but might spam. 
  // I'll keep it direct for consistency with other reports if they function that way.

  const fetchData = async () => {
    if (!dateFrom || !dateTo) return;

    setLoading(true);
    try {
      const params = {
        displayType: viewType,
        startDate: format(dateFrom, 'yyyy-MM-dd'),
        endDate: format(dateTo, 'yyyy-MM-dd'),
        customerGroupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
        search: customerSearch || undefined
      };

      const response = await getCustomerStatistics(params);

      if (response.metaData) {
        if (viewType === 'report') {
          setReportData(response.metaData as CustomerReportResponse);
        } else {
          setChartData(response.metaData as CustomerChartResponse);
        }
      }
    } catch (error) {
      console.error('Error fetching customer statistics:', error);
      toast.error('Lỗi khi tải báo cáo khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeDisplay = () => {
    if (dateFrom && dateTo) {
      return `Từ ngày ${format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`;
    }
    return '';
  };

  const renderFilterSummary = () => {
    return null; // Suppress summary line to match original mock simplicity
  };

  // Chart Content
  const renderChart = () => {
    if (!chartData || !chartData.data || chartData.data.length === 0) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-blue-200">
        <CardHeader className="pb-3 border-b border-blue-100 bg-blue-50/50">
          <CardTitle className="text-blue-900">Top 10 khách hàng mua nhiều nhất (theo doanh thu)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData.data} layout="vertical" margin={{ top: 0, right: 80, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value;
                }}
              />
              <YAxis
                type="category"
                dataKey="customerName"
                width={150}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString('vi-VN')}₫`, 'Doanh thu']}
                contentStyle={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px'
                }}
              />
              <Bar
                name="Doanh thu"
                dataKey="revenue"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                barSize={32}
                label={{
                  position: 'right',
                  fill: '#1e40af',
                  fontWeight: 'bold',
                  fontSize: 12,
                  formatter: (value: number) => value ? value.toLocaleString('vi-VN') : '0'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Report Content
  const renderReport = () => {
    if (!reportData || reportData.customers.length === 0) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const { totals, customers } = reportData;

    return (
      <Card>
        <CardContent className="p-0">
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="text-center py-6 border-b">
              <p className="text-sm text-slate-600 mb-2">
                Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
              <h2 className="text-xl text-slate-900 mb-1">Báo cáo khách hàng</h2>
              {dateFrom && dateTo && (
                <p className="text-sm text-slate-600">
                  {getDateRangeDisplay()}
                </p>
              )}
              {renderFilterSummary()}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Mã KH</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Khách hàng</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">SĐT</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Nhóm khách hàng</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng hóa đơn</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">SL Mua</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Summary row */}
                  <tr className="bg-amber-50 border-b border-amber-100 font-semibold">
                    <td colSpan={4} className="py-3 px-4 text-sm text-slate-900">
                      Tổng cộng ({totals.totalCustomers} khách hàng)
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {totals.totalOrders.toLocaleString('vi-VN')}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {totals.totalQuantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {totals.totalRevenue.toLocaleString('vi-VN')}
                    </td>
                  </tr>

                  {/* Customer rows */}
                  {customers.map((item) => (
                    <tr key={item.customerId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-blue-600">{item.customerCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.phone}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <Badge variant="outline" className="font-normal bg-slate-50">
                          {item.groupName}
                        </Badge>
                      </td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">
                        {item.totalOrders.toLocaleString('vi-VN')}
                      </td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">
                        {item.totalQuantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">
                        {item.totalRevenue.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full p-6 space-y-6">
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
            {(customerSearch || selectedGroupIds.length > 0) && (
              <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-5">
                {(customerSearch ? 1 : 0) + (selectedGroupIds.length > 0 ? 1 : 0)}
              </Badge>
            )}
            {isFilterOpen ? (
              <ChevronUp className="w-4 h-4 ml-2 opacity-50" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            )}
          </Button>
          {(customerSearch || selectedGroupIds.length > 0) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCustomerSearch('');
                setSelectedGroupIds([]);
              }}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {isFilterOpen && (
          <div className="p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Thời gian */}
              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Thời gian</h3>
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

              {/* Tìm kiếm khách hàng */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm khách hàng</h3>
                <Input
                  placeholder="Theo tên, SĐT"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="text-sm bg-white border border-slate-300"
                />
              </div>

              {/* Nhóm khách hàng */}
              <div>
                <MultiSelectFilter
                  label="Nhóm khách hàng"
                  placeholder="Chọn nhóm khách..."
                  items={customerGroups}
                  selectedIds={selectedGroupIds}
                  onSelectionChange={(ids) => setSelectedGroupIds(ids as number[])}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Type Toggle - Below filter panel */}
      <div className="flex justify-start">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setViewType('chart')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'chart'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Biểu đồ
          </button>
          <button
            onClick={() => setViewType('report')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'report'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Báo cáo
          </button>
        </div>
      </div>

      {/* Content Area */}
      {
        loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          viewType === 'chart' ? renderChart() : renderReport()
        )
      }
    </div >
  );
}