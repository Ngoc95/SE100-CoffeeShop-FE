import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ShoppingBag,
  BarChart3 as BarChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList
} from 'recharts';

interface FinanceReportProps {
  viewType: 'chart' | 'report';
  selectedConcerns: string[];
}

export function FinanceReport({ viewType, selectedConcerns }: FinanceReportProps) {
  // Sample data
  const revenueData = [
    { date: '15/01', revenue: 8200000, expenses: 3500000, profit: 4700000, orders: 145 },
    { date: '16/01', revenue: 7800000, expenses: 3200000, profit: 4600000, orders: 138 },
    { date: '17/01', revenue: 9100000, expenses: 3800000, profit: 5300000, orders: 162 },
    { date: '18/01', revenue: 8500000, expenses: 3400000, profit: 5100000, orders: 151 },
    { date: '19/01', revenue: 9500000, expenses: 3900000, profit: 5600000, orders: 169 },
    { date: '20/01', revenue: 10200000, expenses: 4100000, profit: 6100000, orders: 178 },
  ];

  const revenueByHourData = [
    { time: '6h', revenue: 850000 },
    { time: '7h', revenue: 1200000 },
    { time: '8h', revenue: 2100000 },
    { time: '9h', revenue: 2800000 },
    { time: '10h', revenue: 3200000 },
    { time: '11h', revenue: 4100000 },
    { time: '12h', revenue: 5200000 },
    { time: '13h', revenue: 4800000 },
    { time: '14h', revenue: 3900000 },
    { time: '15h', revenue: 4500000 },
    { time: '16h', revenue: 5100000 },
    { time: '17h', revenue: 6200000 },
    { time: '18h', revenue: 7800000 },
    { time: '19h', revenue: 8500000 },
    { time: '20h', revenue: 9200000 },
    { time: '21h', revenue: 7600000 },
  ];

  const paymentMethodData = [
    { name: 'Tiền mặt', value: 45, amount: 28800000, color: '#1e40af' },
    { name: 'Chuyển khoản', value: 35, amount: 22400000, color: '#3b82f6' },
    { name: 'Ví điện tử', value: 15, amount: 9600000, color: '#60a5fa' },
    { name: 'Thẻ tín dụng', value: 5, amount: 3200000, color: '#93c5fd' },
  ];

  const revenueByDayOfWeekData = [
    { day: 'T2', revenue: 8200000 },
    { day: 'T3', revenue: 7800000 },
    { day: 'T4', revenue: 9100000 },
    { day: 'T5', revenue: 8500000 },
    { day: 'T6', revenue: 9500000 },
    { day: 'T7', revenue: 10200000 },
    { day: 'CN', revenue: 11500000 },
  ];

  const revenueReport = [
    { date: '15/01/2025', orders: 145, revenue: 8200000, discounts: 410000, returns: 50000, netRevenue: 7740000 },
    { date: '16/01/2025', orders: 138, revenue: 7800000, discounts: 390000, returns: 30000, netRevenue: 7380000 },
    { date: '17/01/2025', orders: 162, revenue: 9100000, discounts: 455000, returns: 70000, netRevenue: 8575000 },
    { date: '18/01/2025', orders: 151, revenue: 8500000, discounts: 425000, returns: 40000, netRevenue: 8035000 },
    { date: '19/01/2025', orders: 169, revenue: 9500000, discounts: 475000, returns: 60000, netRevenue: 8965000 },
    { date: '20/01/2025', orders: 178, revenue: 10200000, discounts: 510000, returns: 80000, netRevenue: 9610000 },
  ];

  const profitReport = [
    { date: '15/01/2025', revenue: 8200000, expenses: 3500000, grossProfit: 4700000, netProfit: 4700000, margin: 57.3 },
    { date: '16/01/2025', revenue: 7800000, expenses: 3200000, grossProfit: 4600000, netProfit: 4600000, margin: 59.0 },
    { date: '17/01/2025', revenue: 9100000, expenses: 3800000, grossProfit: 5300000, netProfit: 5300000, margin: 58.2 },
    { date: '18/01/2025', revenue: 8500000, expenses: 3400000, grossProfit: 5100000, netProfit: 5100000, margin: 60.0 },
    { date: '19/01/2025', revenue: 9500000, expenses: 3900000, grossProfit: 5600000, netProfit: 5600000, margin: 58.9 },
    { date: '20/01/2025', revenue: 10200000, expenses: 4100000, grossProfit: 6100000, netProfit: 6100000, margin: 59.8 },
  ];

  const revenueSummary = {
    totalRevenue: 64000000,
    discounts: 3200000,
    canceledOrders: 800000,
    netRevenue: 60000000,
    totalOrders: 847,
    canceledOrdersCount: 12,
  };

  return (
    <div className="space-y-6">
      {viewType === 'chart' ? (
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
                  {revenueSummary.totalRevenue.toLocaleString()}₫
                </div>
                <div className="flex items-center gap-1 text-sm text-emerald-600 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5%</span>
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
                  {(revenueSummary.discounts + revenueSummary.canceledOrders).toLocaleString()}₫
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
                  {revenueSummary.netRevenue.toLocaleString()}₫
                </div>
                <div className="text-sm text-emerald-600 mt-2">
                  {((revenueSummary.netRevenue / revenueSummary.totalRevenue) * 100).toFixed(1)}% doanh thu
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Tổng đơn hàng</span>
                  <ShoppingBag className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="text-2xl text-slate-900">
                  {revenueSummary.totalOrders} đơn
                </div>
                <div className="text-sm text-red-600 mt-2">
                  {revenueSummary.canceledOrdersCount} đơn hủy
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue & Profit Combined Chart */}
          {(selectedConcerns.includes('revenue') || selectedConcerns.includes('expenses') || selectedConcerns.includes('profit')) && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <BarChartIcon className="w-5 h-5" />
                  Doanh thu, Chi phí & Lợi nhuận
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value.toLocaleString()}₫`}
                      contentStyle={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    {selectedConcerns.includes('revenue') && (
                      <Bar dataKey="revenue" fill="#059669" name="Doanh thu">
                        <LabelList
                          dataKey="revenue"
                          position="top"
                          formatter={(value: number) => value.toLocaleString('vi-VN')}
                          style={{ fill: '#059669', fontSize: 12, fontWeight: 'bold' }}
                        />
                      </Bar>
                    )}
                    {selectedConcerns.includes('expenses') && (
                      <Bar dataKey="expenses" fill="#dc2626" name="Chi phí">
                        <LabelList
                          dataKey="expenses"
                          position="top"
                          formatter={(value: number) => value.toLocaleString('vi-VN')}
                          style={{ fill: '#dc2626', fontSize: 12, fontWeight: 'bold' }}
                        />
                      </Bar>
                    )}
                    {selectedConcerns.includes('profit') && (
                      <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={3} name="Lợi nhuận">
                        <LabelList
                          dataKey="profit"
                          position="top"
                          formatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                          style={{ fill: '#2563eb', fontSize: 12, fontWeight: 'bold' }}
                        />
                      </Line>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Revenue by Hour */}
          {selectedConcerns.includes('revenue') && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <LineChartIcon className="w-5 h-5" />
                  Doanh thu theo giờ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueByHourData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value.toLocaleString()}₫`}
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
                        formatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                        style={{ fill: '#2563eb', fontSize: 12, fontWeight: 'bold' }}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Revenue by Day of Week */}
          {selectedConcerns.includes('revenue') && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <BarChart3 className="w-5 h-5" />
                  Doanh thu theo ngày trong tuần
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByDayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value.toLocaleString()}₫`}
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
                        formatter={(value: number) => value.toLocaleString('vi-VN')}
                        style={{ fill: '#2563eb', fontSize: 12, fontWeight: 'bold' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}


          {/* Payment Methods */}
          {selectedConcerns.includes('payment') && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <PieChartIcon className="w-5 h-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% (${props.payload.amount.toLocaleString()}₫)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Revenue Report Table */}
          {selectedConcerns.includes('revenue') && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-950">Báo cáo doanh thu chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead>Ngày</TableHead>
                        <TableHead className="text-right">Số đơn</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                        <TableHead className="text-right">Giảm giá</TableHead>
                        <TableHead className="text-right">Hoàn trả</TableHead>
                        <TableHead className="text-right">Doanh thu ròng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueReport.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm text-slate-900">{item.date}</TableCell>
                          <TableCell className="text-sm text-slate-700 text-right">{item.orders}</TableCell>
                          <TableCell className="text-sm text-emerald-700 text-right">
                            {item.revenue.toLocaleString()}₫
                          </TableCell>
                          <TableCell className="text-sm text-orange-700 text-right">
                            -{item.discounts.toLocaleString()}₫
                          </TableCell>
                          <TableCell className="text-sm text-red-700 text-right">
                            -{item.returns.toLocaleString()}₫
                          </TableCell>
                          <TableCell className="text-sm text-emerald-900 text-right">
                            {item.netRevenue.toLocaleString()}₫
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                      <tr>
                        <TableCell className="text-sm text-slate-900">Tổng cộng</TableCell>
                        <TableCell className="text-sm text-slate-900 text-right">
                          {revenueReport.reduce((sum, item) => sum + item.orders, 0)}
                        </TableCell>
                        <TableCell className="text-sm text-emerald-700 text-right">
                          {revenueReport.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}₫
                        </TableCell>
                        <TableCell className="text-sm text-orange-700 text-right">
                          -{revenueReport.reduce((sum, item) => sum + item.discounts, 0).toLocaleString()}₫
                        </TableCell>
                        <TableCell className="text-sm text-red-700 text-right">
                          -{revenueReport.reduce((sum, item) => sum + item.returns, 0).toLocaleString()}₫
                        </TableCell>
                        <TableCell className="text-sm text-emerald-900 text-right">
                          {revenueReport.reduce((sum, item) => sum + item.netRevenue, 0).toLocaleString()}₫
                        </TableCell>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profit Report Table */}
          {selectedConcerns.includes('profit') && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-950">Báo cáo lợi nhuận chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead>Ngày</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                        <TableHead className="text-right">Chi phí</TableHead>
                        <TableHead className="text-right">Lợi nhuận</TableHead>
                        <TableHead className="text-right">Tỷ suất LN (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitReport.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm text-slate-900">{item.date}</TableCell>
                          <TableCell className="text-sm text-emerald-700 text-right">
                            {item.revenue.toLocaleString()}₫
                          </TableCell>
                          <TableCell className="text-sm text-red-700 text-right">
                            {item.expenses.toLocaleString()}₫
                          </TableCell>
                          <TableCell className="text-sm text-blue-700 text-right">
                            {item.grossProfit.toLocaleString()}₫
                          </TableCell>
                          <TableCell className="text-sm text-amber-700 text-right">{item.margin.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                      <tr>
                        <TableCell className="text-sm text-slate-900">Tổng cộng</TableCell>
                        <TableCell className="text-sm text-emerald-700 text-right">
                          {profitReport.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}₫
                        </TableCell>
                        <TableCell className="text-sm text-red-700 text-right">
                          {profitReport.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}₫
                        </TableCell>
                        <TableCell className="text-sm text-blue-700 text-right">
                          {profitReport.reduce((sum, item) => sum + item.grossProfit, 0).toLocaleString()}₫
                        </TableCell>
                        <TableCell className="text-sm text-blue-900 text-right">
                          {profitReport.reduce((sum, item) => sum + item.netProfit, 0).toLocaleString()}₫
                        </TableCell>
                        <TableCell className="text-sm text-amber-700 text-right">
                          {((profitReport.reduce((sum, item) => sum + item.netProfit, 0) / profitReport.reduce((sum, item) => sum + item.revenue, 0)) * 100).toFixed(1)}%
                        </TableCell>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
