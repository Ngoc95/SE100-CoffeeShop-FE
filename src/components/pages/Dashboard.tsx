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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
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
    revenue: { today: 0, yesterday: 0 },
    orders: { today: 0, yesterday: 0 },
    customers: { today: 0, yesterday: 0 },
    avgOrderValue: { today: 0, yesterday: 0 }
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

  // Top 10 products data
  const topProductsData = [
    { name: 'Phomac dây Nga', value: 3310000 },
    { name: 'Cà phê sữa đá', value: 3000000 },
    { name: 'Sữa hạnh tây sữu Phạm', value: 2400000 },
    { name: 'Sữa kem giá rỗ huống', value: 2100000 },
    { name: 'Thít nghệ & phomac viên chiên', value: 1800000 },
    { name: 'Cbiami my sứt sỉ dàm bống cỉ phạm', value: 1500000 },
    { name: 'Sữa kem viỉu Parm', value: 1200000 },
    { name: 'Thuốc lá Marlboro', value: 900000 },
    { name: 'Thuốc lá Vinataba', value: 600000 },
    { name: 'Ghi FIZZ', value: 200000 }
  ];

  const totalSales = getSalesChartData().reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-blue-900 mb-1">Tổng quan</h1>
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
                  <p className="text-xs text-slate-600 mb-1">Đơn đã hoàn phục vụ</p>
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
              <SelectTrigger className="w-32 h-8 text-xs">
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
              className={`pb-2 px-1 text-sm transition-colors relative ${
                salesChartView === 'byHour'
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
              className={`pb-2 px-1 text-sm transition-colors relative ${
                salesChartView === 'byDay'
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
              className={`pb-2 px-1 text-sm transition-colors relative ${
                salesChartView === 'byWeekday'
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
            <BarChart data={getSalesChartData()}>
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
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
                formatter={() => 'Chi nhánh trung tâm'}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Chi nhánh trung tâm"
              />
            </BarChart>
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
              <SelectTrigger className="w-32 h-8 text-xs">
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
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
                formatter={() => 'Chi nhánh trung tâm'}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Chi nhánh trung tâm"
              />
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
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Theo doanh thu</SelectItem>
                  <SelectItem value="quantity">Theo số lượng</SelectItem>
                </SelectContent>
              </Select>
              <Select value={topProductsTimeRange} onValueChange={(value) => setTopProductsTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-32 h-8 text-xs">
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
            <BarChart 
              data={topProductsData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)} tr`}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 11 }}
                width={140}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()}₫`, 'Doanh thu']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
