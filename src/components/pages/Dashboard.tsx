import { useState, useEffect } from 'react';
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
import { reportApi, DashboardSummary } from '../../api/reports';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

type TimeRange = 'today' | 'yesterday' | '7days' | 'thisMonth' | 'lastMonth';
type SalesChartView = 'byHour' | 'byDay' | 'byWeekday'; // Note: Backend currently only supports auto-grouping based on range. "byWeekday" might need custom handling or just map "day" to weekday names.
type TopProductsFilter = 'revenue' | 'quantity';

export function Dashboard() {
  const [salesTimeRange, setSalesTimeRange] = useState<TimeRange>('7days');
  const [salesChartView, setSalesChartView] = useState<SalesChartView>('byHour'); // This might be redundant if backend decides grouping
  const [customersTimeRange, setCustomersTimeRange] = useState<TimeRange>('7days');
  const [topProductsTimeRange, setTopProductsTimeRange] = useState<TimeRange>('7days');
  const [topProductsFilter, setTopProductsFilter] = useState<TopProductsFilter>('revenue');

  // Dashboard Summary State
  const [todayStats, setTodayStats] = useState<DashboardSummary>({
    revenue: { today: 0, yesterday: 0 },
    orders: { today: 0, yesterday: 0 },
    customers: { today: 0, yesterday: 0 },
    avgOrderValue: { today: 0, yesterday: 0 }
  });

  // Chart States
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [customersChartData, setCustomersChartData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);

  // Helper to get dates from range
  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    let start = new Date();
    let end = new Date(); // default now

    switch (range) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case '7days':
        start = startOfDay(subDays(now, 6)); // 7 days inclusive today
        end = endOfDay(now);
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        end = endOfDay(now);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
    }
    return { 
        startDate: start.toISOString(), 
        endDate: end.toISOString() 
    };
  };

  // Fetch Dashboard Summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await reportApi.getDashboardSummary();
        if (response && response.data && response.data.metaData) {
            setTodayStats(response.data.metaData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      }
    };
    fetchSummary();
  }, []);

  // Fetch Sales Chart
  useEffect(() => {
    const fetchSalesChart = async () => {
      try {
        const { startDate, endDate } = getDateRange(salesTimeRange);
        // Map salesChartView to backend "grouping" implicitly handled by date range in backend?
        // Actually backend SalesStatisticsServive.determineTimeGrouping manages it.
        // We can't force 'byWeekday' easily unless we send specific flag if backend supported it.
        // For now, let's just send the date range.
        const response = await reportApi.getSalesStatistics({
            concern: 'time',
            startDate,
            endDate,
            displayType: 'chart'
        });
        
        if (response.data?.metaData?.data) {
            setSalesChartData(response.data.metaData.data.map((item: any) => ({
                name: item.label,
                value: item.netRevenue
            })));
        }
      } catch (error) {
        console.error("Failed to fetch sales chart", error);
      }
    };
    fetchSalesChart();
  }, [salesTimeRange]); // Removed salesChartView from dependency as backend decides grouping

  // Fetch Customers Chart
  useEffect(() => {
    const fetchCustomersChart = async () => {
        try {
            const { startDate, endDate } = getDateRange(customersTimeRange);
            // Re-use 'time' concern but extract 'customers' from result
            // I updated backend to return 'customers' count in time statistics
            const response = await reportApi.getSalesStatistics({
                concern: 'time',
                startDate,
                endDate,
                displayType: 'chart'
            });

            if (response.data?.metaData?.data) {
                setCustomersChartData(response.data.metaData.data.map((item: any) => ({
                    name: item.label,
                    value: item.customers 
                })));
            }
        } catch (error) {
            console.error("Failed to fetch customers chart", error);
        }
    };
    fetchCustomersChart();
  }, [customersTimeRange]);

  // Fetch Top Products
  useEffect(() => {
    const fetchTopProducts = async () => {
        try {
            const { startDate, endDate } = getDateRange(topProductsTimeRange);
            const response = await reportApi.getSalesStatistics({
                concern: 'products',
                startDate,
                endDate
            });

            if (response.data?.metaData?.products) {
                // Backend returns all products sorted by revenue
                const products = response.data.metaData.products;
                // Client side sort/limit depending on filter
                let sorted = [...products];
                if (topProductsFilter === 'quantity') {
                    sorted.sort((a: any, b: any) => b.quantity - a.quantity);
                } else {
                    sorted.sort((a: any, b: any) => b.revenue - a.revenue);
                }

                // Take top 10 (+ others?)
                // Dashboard logic handled grouping "Others" in render, so just set full data or sliced?
                // The mock data logic sliced top 10 and grouped others. 
                // Let's pass the raw sorted data to state, let render handle slicing.
                
                setTopProductsData(sorted.map((p: any) => ({
                    name: p.name,
                    value: topProductsFilter === 'revenue' ? p.revenue : p.quantity
                })));
            }
        } catch (error) {
            console.error("Failed to fetch top products", error);
        }
    };
    fetchTopProducts();
  }, [topProductsTimeRange, topProductsFilter]);


  const totalSales = salesChartData.reduce((sum, item) => sum + item.value, 0);

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
                DOANH SỐ
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

          <div className="flex gap-4 mt-4 border-b border-slate-200">
            <button
              onClick={() => {}} // Disabled for now as backend handles grouping automatically
              className={`pb-2 px-1 text-sm transition-colors relative text-blue-600`}
            >
              Doanh thu
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)} tr`}
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
                  formatter={(value: number) => value > 0 ? `${(value / 1000000).toFixed(1)}tr` : ''}
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
              SỐ LƯỢNG KHÁCH
              <span className="ml-2 text-blue-600">○ {customersChartData.reduce((acc, curr) => acc + (curr.value||0), 0)}</span>
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
              TOP 10 HÀNG HÓA 
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
            {topProductsData.length > 0 ? (
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
                    const total = topProductsData.reduce((sum, item) => sum + item.value, 0);
                    const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
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
                    paddingRight: '0px'
                  }}
                  formatter={(value) => {
                    // Try to find in top 10 first
                    const item = topProductsData.slice(0, 10).find(p => p.name === value) ||
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
            ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                    Chưa có dữ liệu
                </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
