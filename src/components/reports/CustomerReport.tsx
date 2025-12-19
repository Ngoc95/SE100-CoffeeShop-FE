import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Download, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
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
  ResponsiveContainer,
  Legend
} from 'recharts';


export function CustomerReport() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [viewType, setViewType] = useState<'chart' | 'report'>('chart');
  const [concernType, setConcernType] = useState<'sales' | 'debt' | 'products'>('sales');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 10, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 10, 30));
  // Sample customer data
  const allCustomerData = [
    {
      id: 'KH000005',
      code: 'KH000005',
      name: 'Anh Giang - Kim Mã',
      phone: '0901234567',
      totalRevenue: 14320000,
      returns: 0,
      netRevenue: 14320000,
      transactionCount: 232,
      quantitySold: 232,
      lastPurchase: new Date(2025, 10, 26),
    },
    {
      id: 'KH000002',
      code: 'KH000002',
      name: 'Phạm Thu Hương',
      phone: '0912345678',
      totalRevenue: 11720000,
      returns: 0,
      netRevenue: 11720000,
      transactionCount: 133,
      quantitySold: 133,
      lastPurchase: new Date(2025, 10, 25),
    },
    {
      id: 'KH000001',
      code: 'KH000001',
      name: 'Nguyễn Văn Hải',
      phone: '0923456789',
      totalRevenue: 10015000,
      returns: 0,
      netRevenue: 10015000,
      transactionCount: 135,
      quantitySold: 135,
      lastPurchase: new Date(2025, 10, 24),
    },
    {
      id: 'KH000004',
      code: 'KH000004',
      name: 'Anh Hoàng - Sài Gòn',
      phone: '0934567890',
      totalRevenue: 4815000,
      returns: 0,
      netRevenue: 4815000,
      transactionCount: 95,
      quantitySold: 95,
      lastPurchase: new Date(2025, 10, 20),
    },
    {
      id: 'KH000003',
      code: 'KH000003',
      name: 'Tuấn - Hà Nội',
      phone: '0945678901',
      totalRevenue: 3500000,
      returns: 0,
      netRevenue: 3500000,
      transactionCount: 28,
      quantitySold: 28,
      lastPurchase: new Date(2025, 10, 15),
    },
    {
      id: 'GUEST',
      code: 'Khách lẻ',
      name: 'Khách lẻ',
      phone: '-',
      totalRevenue: 30000,
      returns: 0,
      netRevenue: 30000,
      transactionCount: 1,
      quantitySold: 1,
      lastPurchase: new Date(2025, 10, 10),
    },
  ];

  // Filter customer data
  const filteredCustomerData = allCustomerData.filter(item => {
    // Date filter - check if last purchase is within range
    if (dateFrom && dateTo) {
      if (item.lastPurchase < dateFrom || item.lastPurchase > dateTo) return false;
    }

    // Customer search filter
    if (customerSearch) {
      const searchLower = customerSearch.toLowerCase();
      if (
        !item.name.toLowerCase().includes(searchLower) &&
        !item.code.toLowerCase().includes(searchLower) &&
        !item.phone.includes(customerSearch)
      ) {
        return false;
      }
    }

    return true;
  });

  const getDateRangeDisplay = () => {
    if (dateFrom && dateTo) {
      return `Từ ngày ${format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`;
    }
    return '';
  };

  const renderFilterSummary = () => {
    const filterLines: JSX.Element[] = [];

    if (customerSearch) {
      filterLines.push(
        <p key="customer" className="text-sm text-slate-600">
          Tìm kiếm: {customerSearch}
        </p>
      );
    }

    // Add concern type
    const concernTypeLabels = {
      sales: 'Bán hàng',
      debt: 'Công nợ',
      products: 'Hàng bán theo khách'
    };


    if (filterLines.length === 0) return null;

    return <>{filterLines}</>;
  };

  const totalRevenue = filteredCustomerData.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalReturns = filteredCustomerData.reduce((sum, item) => sum + item.returns, 0);
  const totalNetRevenue = filteredCustomerData.reduce((sum, item) => sum + item.netRevenue, 0);
  const totalQuantitySold = filteredCustomerData.reduce((sum, item) => sum + item.quantitySold, 0);

  // Prepare chart data for horizontal bar chart
  const topCustomers = filteredCustomerData.slice(0, 10);
  const chartData = topCustomers.map(item => ({
    name: item.name,
    revenue: item.netRevenue,
  })).reverse(); // Reverse to show highest at top

  // Get title based on concern type
  const getChartTitle = () => {
    if (concernType === 'sales') {
      return 'Top 10 khách hàng mua nhiều nhất';
    }
    return 'Top 10 khách hàng mua nhiều nhất';
  };

  // Prepare chart content
  const chartContent = filteredCustomerData.length === 0 ? (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-900">{getChartTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(0)} tr`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)} k`;
                return value;
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()}₫`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Doanh thu" label={{ position: 'right', fill: '#1e40af', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Handle export functionality
  const handleExportAll = () => {
    console.log('Exporting all data...');
    // TODO: Implement export functionality
  };

  // Render report view (table)
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
            {customerSearch && (
              <Badge variant="secondary" className="ml-2">1</Badge>
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
              {/* Thời gian */}
              <div className="md:col-span-2 lg:col-span-3">
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
            </div>

            {/* Clear Filters Button */}
            {customerSearch && (
              <div className="pt-4 border-t border-slate-200 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCustomerSearch('')}
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
            onClick={() => setViewType('report')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewType === 'report'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Báo cáo
          </button>
          <button
            onClick={() => setViewType('chart')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewType === 'chart'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Biểu đồ
          </button>
        </div>
      </div>

      {/* Report Content */}
      {viewType === 'chart' ? (
        chartContent
      ) : (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="text-center py-6 border-b">
              <p className="text-sm text-slate-600 mb-2">
                Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
              <h2 className="text-xl text-slate-900 mb-1">Báo cáo hàng bán theo khách</h2>
              {dateFrom && dateTo && (
                <p className="text-sm text-slate-600">
                  {getDateRangeDisplay()}
                </p>
              )}
              {renderFilterSummary()}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredCustomerData.length === 0 ? (
                <div className="bg-yellow-50 py-12 text-center">
                  <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm text-slate-900">Mã KH</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-900">Khách hàng</th>
                      <th className="text-right py-3 px-4 text-sm text-slate-900">SL Mua</th>
                      <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Summary row */}
                    <tr className="bg-amber-50 border-b border-slate-200">
                      <td colSpan={2} className="py-3 px-4 text-sm text-slate-900 font-medium">
                        SL Khách hàng: {filteredCustomerData.length}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                        {totalQuantitySold}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                        {totalRevenue.toLocaleString()}
                      </td>
                    </tr>

                    {/* Customer rows */}
                    {filteredCustomerData.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-blue-600">{item.code}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{item.name}</td>
                        <td className="text-right px-4 py-3 text-sm text-slate-700">
                          {item.quantitySold}
                        </td>
                        <td className="text-right px-4 py-3 text-sm text-slate-700">
                          {item.totalRevenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="py-4 text-center border-t">
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
      )}
    </div>
  );
}