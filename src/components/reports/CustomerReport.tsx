import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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

interface CustomerReportProps {
  dateFrom?: Date;
  dateTo?: Date;
  customerSearch: string;
  viewType: 'chart' | 'report';
  concernType: 'sales' | 'debt' | 'products';
}

export function CustomerReport({
  dateFrom,
  dateTo,
  customerSearch,
  viewType,
  concernType
}: CustomerReportProps) {
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

  // Render chart view
  if (viewType === 'chart') {
    return (
      <div className="space-y-6">
        {filteredCustomerData.length === 0 ? (
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
        )}
      </div>
    );
  }

  // Handle export functionality
  const handleExportAll = () => {
    console.log('Exporting all data...');
    // TODO: Implement export functionality
  };

  // Render report view (table)
  return (
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
  );
}