import { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
  LabelList
} from 'recharts';

type TimeRange = 'today' | 'yesterday' | '7days' | 'thisMonth' | 'lastMonth';
type SalesChartView = 'byHour' | 'byDay' | 'byWeekday';
type TopProductsFilter = 'revenue' | 'quantity';

export function Dashboard() {
  const [salesTimeRange, setSalesTimeRange] = useState<TimeRange>('7days');
  const [salesChartView, setSalesChartView] = useState<SalesChartView>('byHour');
  const [customersTimeRange, setCustomersTimeRange] = useState<TimeRange>('7days');
  const [topProductsTimeRange, setTopProductsTimeRange] = useState<TimeRange>('7days');
  const [topProductsFilter, setTopProductsFilter] = useState<TopProductsFilter>('revenue');

  // Mock data for today's results
  const todayStats = {
    revenue: { today: 15850000, yesterday: 12450000 },
    orders: { today: 47, yesterday: 38 },
    customers: { today: 42, yesterday: 35 },
    avgOrderValue: { today: 337234, yesterday: 327631 }
  };

  // Sales chart data
  const getSalesChartData = () => {
    if (salesChartView === 'byHour') {
      return [
        { name: '08:00', value: 1200000 },
        { name: '09:00', value: 2150000 },
        { name: '10:00', value: 950000 },
        { name: '20:00', value: 800000 },
        { name: '21:00', value: 4200000 },
        { name: '22:00', value: 6300000 },
        { name: '23:00', value: 1650000 }
      ];
    } else if (salesChartView === 'byDay') {
      return [
        { name: '21/11', value: 3200000 },
        { name: '22/11', value: 4100000 },
        { name: '23/11', value: 2800000 },
        { name: '24/11', value: 5200000 },
        { name: '25/11', value: 3900000 },
        { name: '26/11', value: 4700000 },
        { name: '27/11', value: 6100000 }
      ];
    } else {
      return [
        { name: 'T2', value: 3200000 },
        { name: 'T3', value: 4100000 },
        { name: 'T4', value: 2800000 },
        { name: 'T5', value: 5200000 },
        { name: 'T6', value: 3900000 },
        { name: 'T7', value: 4700000 },
        { name: 'CN', value: 6100000 }
      ];
    }
  };

  // Customer count data
  const customersChartData = [
    { name: '08:00', value: 8 },
    { name: '10:00', value: 8 },
    { name: '12:00', value: 0 },
    { name: '13:00', value: 0 },
    { name: '14:00', value: 0 },
    { name: '15:00', value: 0 },
    { name: '16:00', value: 0 },
    { name: '18:00', value: 0 },
    { name: '19:00', value: 0 },
    { name: '20:00', value: 11 },
    { name: '22:00', value: 6 }
  ];

  // Top 10 products data by revenue
  const topProductsByRevenue = [
    { name: 'Phomac dây Nga', value: 3310000 },
    { name: 'Cà phê sữa đá', value: 3000000 },
    { name: 'Sữa hạnh tây sữu Phạm', value: 2400000 },
    { name: 'Sữa kem giá rỗ huống', value: 2100000 },
    { name: 'Thít nghệ & phomac viên chiên', value: 1800000 },
    { name: 'Cbiami my sứt sỉ dàm bống cỉ phạm', value: 1500000 },
    { name: 'Sữa kem viỉu Parm', value: 1200000 },
    { name: 'Thuốc lá Marlboro', value: 900000 },
    { name: 'Thuốc lá Vinataba', value: 600000 },
    { name: 'Ghi FIZZ', value: 200000 },
    // Items beyond top 10 (will be grouped as "Khác")
    { name: 'Trà sữa trân châu', value: 150000 },
    { name: 'Sinh tố bơ', value: 120000 },
    { name: 'Nước ép cam', value: 100000 },
    { name: 'Bánh mì thịt', value: 80000 },
    { name: 'Cơm gà xối mỡ', value: 50000 }
  ];

  // Top 10 products data by quantity
  const topProductsByQuantity = [
    { name: 'Cà phê sữa đá', value: 450 },
    { name: 'Phomac dây Nga', value: 380 },
    { name: 'Sữa kem giá rỗ huống', value: 320 },
    { name: 'Sữa hạnh tây sữu Phạm', value: 280 },
    { name: 'Ghi FIZZ', value: 250 },
    { name: 'Sữa kem viỉu Parm', value: 210 },
    { name: 'Thít nghệ & phomac viên chiên', value: 180 },
    { name: 'Cbiami my sứt sỉ dàm bống cỉ phạm', value: 150 },
    { name: 'Thuốc lá Marlboro', value: 120 },
    { name: 'Thuốc lá Vinataba', value: 90 },
    // Items beyond top 10 (will be grouped as "Khác")
    { name: 'Trà sữa trân châu', value: 75 },
    { name: 'Sinh tố bơ', value: 60 },
    { name: 'Nước ép cam', value: 45 },
    { name: 'Bánh mì thịt', value: 30 },
    { name: 'Cơm gà xối mỡ', value: 20 }
  ];

  // Get current top products data based on filter
  const topProductsData = topProductsFilter === 'revenue' ? topProductsByRevenue : topProductsByQuantity;

  const totalSales = getSalesChartData().reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div>
        <h1 className="text-blue-900 text-2xl font-semibold mb-1">Tổng quan</h1>
        <p className="text-sm text-slate-600">
          Chào buổi sáng! Đây là tổng quan hoạt động của bạn hôm nay.
        </p>
      </div>

      {/* Today's Results Section */}
      <div>
        <h2 className="text-base text-slate-900 mb-4">KẾT QUẢ BÁN HÀNG HÔM NAY</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card */}
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 mb-1">Doanh thu</p>
                  <p className="text-xl text-slate-900 mb-1">
                    {todayStats.revenue.today.toLocaleString()}₫
                  </p>
                  <p className="text-xs text-slate-400">
                    Hôm qua {todayStats.revenue.yesterday.toLocaleString()}₫
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 mb-1">Đơn đã hoàn thành</p>
                  <p className="text-xl text-slate-900 mb-1">
                    {todayStats.orders.today}
                  </p>
                  <p className="text-xs text-slate-400">
                    Hôm qua {todayStats.orders.yesterday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers Card */}
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 mb-1">Khách hàng</p>
                  <p className="text-xl text-slate-900 mb-1">
                    {todayStats.customers.today}
                  </p>
                  <p className="text-xs text-slate-400">
                    Hôm qua {todayStats.customers.yesterday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Order Value Card */}
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 mb-1">Giá trị TB/đơn</p>
                  <p className="text-xl text-slate-900 mb-1">
                    {todayStats.avgOrderValue.today.toLocaleString()}₫
                  </p>
                  <p className="text-xs text-slate-400">
                    Hôm qua {todayStats.avgOrderValue.yesterday.toLocaleString()}₫
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-900">
                DOANH SỐ 7 NGÀY QUA
                <span className="ml-2 text-blue-600">
                  ○ {totalSales.toLocaleString()}
                </span>
              </CardTitle>
            </div>
            <Select value={salesTimeRange} onValueChange={(value) => setSalesTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-32 h-8 text-xs bg-white border border-slate-300 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="yesterday">Hôm qua</SelectItem>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="thisMonth">Tháng này</SelectItem>
                <SelectItem value="lastMonth">Tháng trước</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chart View Tabs */}
          <div className="flex gap-4 mt-4 border-b border-slate-200">
            <button
              onClick={() => setSalesChartView('byHour')}
              className={`pb-2 px-1 text-sm transition-colors relative ${salesChartView === 'byHour'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Theo giờ
              {salesChartView === 'byHour' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setSalesChartView('byDay')}
              className={`pb-2 px-1 text-sm transition-colors relative ${salesChartView === 'byDay'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Theo ngày
              {salesChartView === 'byDay' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setSalesChartView('byWeekday')}
              className={`pb-2 px-1 text-sm transition-colors relative ${salesChartView === 'byWeekday'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Theo thứ
              {salesChartView === 'byWeekday' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getSalesChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)} tr`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()}₫`, 'Doanh số']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value: number) => `${(value / 1000000).toFixed(1)}tr`}
                  style={{ fill: '#64748b', fontSize: 10 }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Count Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-900">
              SỐ LƯỢNG KHÁCH 7 NGÀY QUA
              <span className="ml-2 text-blue-600">○ 33</span>
            </CardTitle>
            <Select value={customersTimeRange} onValueChange={(value) => setCustomersTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-32 h-8 text-xs bg-white border border-slate-300 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="yesterday">Hôm qua</SelectItem>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="thisMonth">Tháng này</SelectItem>
                <SelectItem value="lastMonth">Tháng trước</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customersChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value}`, 'Số khách']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fill: '#64748b', fontSize: 10 }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 Products Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-900">
              TOP 10 HÀNG HÓA BÁN CHẠY 7 NGÀY QUA
            </CardTitle>
            <div className="flex gap-2">
              <Select value={topProductsFilter} onValueChange={(value) => setTopProductsFilter(value as TopProductsFilter)}>
                <SelectTrigger className="w-40 h-8 text-xs bg-white border border-slate-300 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Theo doanh thu</SelectItem>
                  <SelectItem value="quantity">Theo số lượng</SelectItem>
                </SelectContent>
              </Select>
              <Select value={topProductsTimeRange} onValueChange={(value) => setTopProductsTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-32 h-8 text-xs bg-white border border-slate-300 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="yesterday">Hôm qua</SelectItem>
                  <SelectItem value="7days">7 ngày qua</SelectItem>
                  <SelectItem value="thisMonth">Tháng này</SelectItem>
                  <SelectItem value="lastMonth">Tháng trước</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={(() => {
                  // Get top 10 items
                  const top10 = topProductsData.slice(0, 10);
                  // Calculate "Khác" (Others) - sum of items beyond top 10
                  const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.value, 0);

                  // If there are items beyond top 10, add "Khác"
                  if (othersValue > 0) {
                    return [...top10, { name: 'Khác', value: othersValue }];
                  }
                  return top10;
                })()}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry) => {
                  const percent = ((entry.value / topProductsData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                  return `${entry.name}: ${percent}%`;
                }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {(() => {
                  const COLORS = [
                    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                    '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7',
                    '#94a3b8' // Gray color for "Khác"
                  ];
                  const top10 = topProductsData.slice(0, 10);
                  const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.value, 0);
                  const dataLength = othersValue > 0 ? top10.length + 1 : top10.length;

                  return Array.from({ length: dataLength }, (_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ));
                })()}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  topProductsFilter === 'revenue'
                    ? `${value.toLocaleString()}₫`
                    : `${value} sản phẩm`,
                  topProductsFilter === 'revenue' ? 'Doanh thu' : 'Số lượng'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  fontSize: '12px',
                  paddingRight: '150px'
                }}
                formatter={(value) => {
                  const item = topProductsData.find(p => p.name === value) ||
                    (value === 'Khác' ? { value: topProductsData.slice(10).reduce((sum, item) => sum + item.value, 0) } : null);
                  if (item) {
                    if (topProductsFilter === 'revenue') {
                      return `${value} (${(item.value / 1000000).toFixed(1)}tr)`;
                    } else {
                      return `${value} (${item.value})`;
                    }
                  }
                  return value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
