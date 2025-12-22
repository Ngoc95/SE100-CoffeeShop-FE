import { useState, useEffect } from 'react';
import { Download, Filter, ChevronDown, ChevronUp, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomerTimeFilter } from '../reports/CustomerTimeFilter';

type ViewType = 'chart' | 'report';
type ConcernType = 'time' | 'profit' | 'discount' | 'return' | 'table' | 'category';

export function SalesReport() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [viewType, setViewType] = useState<ViewType>('report');
  const [concern, setConcern] = useState<ConcernType>('time');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  
  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 11, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 11, 2));

  // Expandable rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (time: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(time)) {
      newExpanded.delete(time);
    } else {
      newExpanded.add(time);
    }
    setExpandedRows(newExpanded);
  };

  // Auto-set viewType to 'report' for concerns that don't have charts
  useEffect(() => {
    if (concern === 'discount' || concern === 'return' || concern === 'table' || concern === 'category') {
      setViewType('report');
    }
  }, [concern]);

  // Chart data for time concern - by day (net revenue)
  const timeChartDataByDay = [
    { day: '01', netRevenue: 4063000 },
    { day: '02', netRevenue: 2344000 },
  ];

  // Chart data for time concern - by month (net revenue)
  const timeChartDataByMonth = [
    { month: '10-2025', netRevenue: 19984000 },
    { month: '11-2025', netRevenue: 24867000 },
    { month: '12-2025', netRevenue: 6417000 },
  ];

  // Chart data for profit concern - by day
  const profitChartDataByDay = [
    { day: '01', revenue: 4000000, profit: 1000000, cost: 3000000 },
    { day: '02', revenue: 2400000, profit: 600000, cost: 1800000 },
  ];

  // Chart data for profit concern - by month
  const profitChartDataByMonth = [
    { month: '10-2025', revenue: 20000000, profit: 5000000, cost: 15000000 },
    { month: '11-2025', revenue: 25000000, profit: 7000000, cost: 18000000 },
    { month: '12-2025', revenue: 6000000, profit: 2000000, cost: 4000000 },
  ];

  // Chart data for discount concern
  const discountChartData = [
    { day: '01', revenue: 2800000, discount: 280000 },
    { day: '02', revenue: 3200000, discount: 320000 },
    { day: '03', revenue: 2900000, discount: 290000 },
    { day: '04', revenue: 3400000, discount: 340000 },
    { day: '05', revenue: 3100000, discount: 310000 },
    { day: '06', revenue: 3800000, discount: 380000 },
    { day: '07', revenue: 3600000, discount: 360000 },
    { day: '08', revenue: 2700000, discount: 270000 },
    { day: '09', revenue: 3000000, discount: 300000 },
    { day: '10', revenue: 3500000, discount: 350000 },
  ];

  // Chart data for return concern
  const returnChartData = [
    { day: '01', revenue: 2800000, returnValue: 150000 },
    { day: '02', revenue: 3200000, returnValue: 80000 },
    { day: '03', revenue: 2900000, returnValue: 220000 },
    { day: '04', revenue: 3400000, returnValue: 160000 },
    { day: '05', revenue: 3100000, returnValue: 0 },
    { day: '06', revenue: 3800000, returnValue: 190000 },
    { day: '07', revenue: 3600000, returnValue: 120000 },
    { day: '08', revenue: 2700000, returnValue: 95000 },
    { day: '09', revenue: 3000000, returnValue: 0 },
    { day: '10', revenue: 3500000, returnValue: 210000 },
  ];

  // Chart data for table/room concern
  const tableChartData = [
    { name: 'Bàn 01', revenue: 5600000 },
    { name: 'Bàn 02', revenue: 4800000 },
    { name: 'Bàn 03', revenue: 6300000 },
    { name: 'Bàn VIP 1', revenue: 8400000 },
    { name: 'Bàn VIP 2', revenue: 7200000 },
    { name: 'Bàn 05', revenue: 5900000 },
    { name: 'Bàn 06', revenue: 4500000 },
  ];

  // Chart data for category concern
  const categoryChartData = [
    { name: 'Cà phê', revenue: 27000000 },
    { name: 'Trà sữa', revenue: 19200000 },
    { name: 'Đồ ăn nhẹ', revenue: 5400000 },
    { name: 'Nước ép', revenue: 6875000 },
    { name: 'Sinh tố', revenue: 5225000 },
  ];

  // Time report data by day
  const timeReportDataByDay = [
    {
      time: '01/12/2025',
      revenue: 4073000,
      returnValue: 0,
      netRevenue: 4073000,
      invoices: [
        { code: 'HD000047', time: '01/12/2025 10:00', customer: 'Nguyễn Văn Hải', netRevenue: 2060000 },
        { code: 'HD000046', time: '01/12/2025 09:00', customer: 'Anh Giang - Kim Mã', netRevenue: 1968000 },
        { code: 'HD000045', time: '01/12/2025 08:00', customer: 'Phạm Thu Hương', netRevenue: 45000 },
      ],
    },
    {
      time: '02/12/2025',
      revenue: 2344000,
      returnValue: 0,
      netRevenue: 2344000,
      invoices: [
        { code: 'HD000050', time: '02/12/2025 16:00', customer: 'Anh Giang - Kim Mã', netRevenue: 1377000 },
        { code: 'HD000049', time: '02/12/2025 15:00', customer: 'Nguyễn Văn Hải', netRevenue: 685000 },
        { code: 'HD000048', time: '02/12/2025 14:00', customer: 'Anh Giang - Kim Mã', netRevenue: 282000 },
      ],
    },
  ];

  // Time report data by month
  const timeReportDataByMonth = [
    {
      time: '12-2025',
      revenue: 6417000,
      returnValue: 0,
      netRevenue: 6417000,
      invoices: [
        { code: 'HD000050', time: '02/12/2025 16:00', customer: 'Anh Giang - Kim Mã', netRevenue: 1377000 },
        { code: 'HD000049', time: '02/12/2025 15:00', customer: 'Nguyễn Văn Hải', netRevenue: 685000 },
        { code: 'HD000048', time: '02/12/2025 14:00', customer: 'Anh Giang - Kim Mã', netRevenue: 282000 },
        { code: 'HD000047', time: '01/12/2025 10:00', customer: 'Nguyễn Văn Hải', netRevenue: 2060000 },
        { code: 'HD000046', time: '01/12/2025 09:00', customer: 'Anh Giang - Kim Mã', netRevenue: 1968000 },
        { code: 'HD000045', time: '01/12/2025 08:00', customer: 'Phạm Thu Hương', netRevenue: 45000 },
      ],
    },
    {
      time: '11-2025',
      revenue: 24867000,
      returnValue: 0,
      netRevenue: 24867000,
      invoices: [
        { code: 'HD000040', time: '30/11/2025 20:00', customer: 'Trần Văn Nam', netRevenue: 1500000 },
        { code: 'HD000039', time: '30/11/2025 19:00', customer: 'Lê Thị Mai', netRevenue: 850000 },
      ],
    },
    {
      time: '10-2025',
      revenue: 19984000,
      returnValue: 0,
      netRevenue: 19984000,
      invoices: [
        { code: 'HD000030', time: '31/10/2025 18:00', customer: 'Phạm Văn Đức', netRevenue: 1200000 },
        { code: 'HD000029', time: '31/10/2025 17:00', customer: 'Nguyễn Thị Lan', netRevenue: 950000 },
      ],
    },
  ];

  // Profit report data by day
  const profitReportDataByDay = [
    { time: '01/12/2025', totalMerchandise: 4080000, invoiceDiscount: -7000, revenue: 4073000, totalCost: 3054500, grossProfit: 1018500 },
    { time: '02/12/2025', totalMerchandise: 2355000, invoiceDiscount: -11000, revenue: 2344000, totalCost: 1751000, grossProfit: 593000 },
  ];

  // Profit report data by month
  const profitReportDataByMonth = [
    { time: '12-2025', totalMerchandise: 6435000, invoiceDiscount: -18000, revenue: 6417000, totalCost: 4805500, grossProfit: 1611500 },
    { time: '11-2025', totalMerchandise: 24925000, invoiceDiscount: -58000, revenue: 24867000, totalCost: 18042500, grossProfit: 6824500 },
    { time: '10-2025', totalMerchandise: 20020000, invoiceDiscount: -36000, revenue: 19984000, totalCost: 14696000, grossProfit: 5288000 },
  ];

  const discountData = [
    { invoiceCode: 'HD-001', date: '01/12/2025', originalAmount: 500000, discountAmount: 50000, finalAmount: 450000, discountPercent: 10 },
    { invoiceCode: 'HD-003', date: '01/12/2025', originalAmount: 650000, discountAmount: 70000, finalAmount: 580000, discountPercent: 10.8 },
    { invoiceCode: 'HD-008', date: '02/12/2025', originalAmount: 800000, discountAmount: 120000, finalAmount: 680000, discountPercent: 15 },
    { invoiceCode: 'HD-012', date: '03/12/2025', originalAmount: 550000, discountAmount: 55000, finalAmount: 495000, discountPercent: 10 },
  ];

  const returnData = [
    { invoiceCode: 'HD-002', date: '01/12/2025', productName: 'Cà phê sữa đá', quantity: 2, returnValue: 120000, reason: 'Khách không hài lòng' },
    { invoiceCode: 'HD-007', date: '02/12/2025', productName: 'Trà chanh', quantity: 1, returnValue: 35000, reason: 'Pha chế sai' },
    { invoiceCode: 'HD-015', date: '03/12/2025', productName: 'Bánh mì', quantity: 3, returnValue: 90000, reason: 'Hết hạn' },
  ];

  const tableData = [
    { tableName: 'Bàn 01', area: 'Tầng 1', usageCount: 12, totalRevenue: 5600000, avgRevenue: 466667, occupancyRate: 75 },
    { tableName: 'Bàn 02', area: 'Tầng 1', usageCount: 10, totalRevenue: 4800000, avgRevenue: 480000, occupancyRate: 62 },
    { tableName: 'Bàn VIP 1', area: 'Tầng 2', usageCount: 8, totalRevenue: 8400000, avgRevenue: 1050000, occupancyRate: 88 },
    { tableName: 'Bàn 05', area: 'Tầng 1', usageCount: 15, totalRevenue: 6300000, avgRevenue: 420000, occupancyRate: 83 },
  ];

  const categoryData = [
    { category: 'Cà phê', soldQty: 450, revenue: 27000000, returnQty: 8, returnValue: 480000, netRevenue: 26520000 },
    { category: 'Trà sữa', soldQty: 320, revenue: 19200000, returnQty: 5, returnValue: 300000, netRevenue: 18900000 },
    { category: 'Đồ ăn nhẹ', soldQty: 180, revenue: 5400000, returnQty: 12, returnValue: 360000, netRevenue: 5040000 },
    { category: 'Nước ép', soldQty: 125, revenue: 6875000, returnQty: 2, returnValue: 110000, netRevenue: 6765000 },
    { category: 'Sinh tố', soldQty: 95, revenue: 5225000, returnQty: 1, returnValue: 55000, netRevenue: 5170000 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const getTimeRangeLabel = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, 'dd/MM/yyyy', { locale: vi })} - ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`;
    }
    return '';
  };

  const getConcernLabel = () => {
    const labels: { [key: string]: string } = {
      'time': 'về Thời gian',
      'profit': 'về Lợi nhuận',
      'discount': 'về Giảm giá HĐ',
      'return': 'về Trả hàng',
      'table': 'về Phòng/Bàn',
      'category': 'về Danh mục hàng hóa',
    };
    return labels[concern] || '';
  };

  // Calculate days between dates
  const getDaysBetween = (from?: Date, to?: Date): number => {
    if (!from || !to) return 0;
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getChartData = () => {
    switch (concern) {
      case 'time':
        // If time range <= 1 month (30 days), show by day, otherwise by month
        const daysDiff = getDaysBetween(dateFrom, dateTo);
        return daysDiff <= 30 ? timeChartDataByDay : timeChartDataByMonth;
      case 'profit':
        // If time range <= 1 month (30 days), show by day, otherwise by month
        const profitDaysDiff = getDaysBetween(dateFrom, dateTo);
        return profitDaysDiff <= 30 ? profitChartDataByDay : profitChartDataByMonth;
      case 'discount':
        return discountChartData;
      case 'return':
        return returnChartData;
      case 'table':
        return tableChartData;
      case 'category':
        return categoryChartData;
      default:
        const defaultDaysDiff = getDaysBetween(dateFrom, dateTo);
        return defaultDaysDiff <= 30 ? timeChartDataByDay : timeChartDataByMonth;
    }
  };

  const renderChart = () => {
    const chartData = getChartData();
    let dataKey = concern === 'table' || concern === 'category' ? 'name' : 'day';
    let valueKey = 'revenue';

    // For time and profit concerns, determine data key based on time range
    if (concern === 'time' || concern === 'profit') {
      const daysDiff = getDaysBetween(dateFrom, dateTo);
      dataKey = daysDiff <= 30 ? 'day' : 'month';
      if (concern === 'time') {
        valueKey = 'netRevenue';
      }
    }

    // Determine chart title based on concern
    const getChartTitle = () => {
      if (concern === 'profit') {
        const daysDiff = getDaysBetween(dateFrom, dateTo);
        return daysDiff <= 30 ? 'Lợi nhuận Tháng này' : 'Lợi nhuận Năm nay';
      }
      if (concern === 'time') {
        const daysDiff = getDaysBetween(dateFrom, dateTo);
        return daysDiff <= 30 ? 'Doanh thu thuần Tháng này' : 'Doanh thu thuần Năm nay';
      }
      return `Doanh thu thuần ${getConcernLabel()} ${getTimeRangeLabel()}`;
    };

    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-1">{getChartTitle()}</h2>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {concern === 'time' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey={dataKey}
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: { [key: string]: string } = {
                    'revenue': 'Doanh thu',
                    'netRevenue': 'Doanh thu thuần',
                    'profit': 'Lợi nhuận',
                    'cost': 'Giá vốn',
                  };
                  return [formatCurrency(value), labels[name] || name];
                }}
                labelFormatter={(label) => {
                  if (concern === 'table' || concern === 'category') return label;
                  if ((concern === 'time' || concern === 'profit') && dataKey === 'month') return label;
                  return `Ngày ${label}`;
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <Line
                type="monotone"
                dataKey={valueKey}
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 6 }}
                label={{ position: 'top', fill: '#1e40af', fontWeight: 'bold', fontSize: 12, formatter: (value: number) => value.toLocaleString('vi-VN') }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey={dataKey}
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: { [key: string]: string } = {
                    'revenue': 'Doanh thu',
                    'netRevenue': 'Doanh thu thuần',
                    'profit': 'Lợi nhuận',
                    'cost': 'Giá vốn',
                  };
                  return [formatCurrency(value), labels[name] || name];
                }}
                labelFormatter={(label) => {
                  if (concern === 'table' || concern === 'category') return label;
                  if ((concern === 'time' || concern === 'profit') && dataKey === 'month') return label;
                  return `Ngày ${label}`;
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {concern === 'profit' ? (
                <>
                  <Bar dataKey="profit" fill="#2563eb" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e40af', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#047857', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
                  <Bar dataKey="cost" fill="#fbbf24" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#b45309', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
                  <Legend
                    formatter={(value) => {
                      const labels: { [key: string]: string } = {
                        'profit': 'Lợi nhuận',
                        'revenue': 'Doanh thu',
                        'cost': 'Giá vốn',
                      };
                      return labels[value] || value;
                    }}
                  />
                </>
              ) : (
                <Bar dataKey={valueKey} fill="#2563eb" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e40af', fontWeight: 'bold', fontSize: 12, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const renderReport = () => {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Report Content */}
        <div className="p-8 bg-white" style={{ minHeight: '800px' }}>
          {/* Report Header */}
          <div className="mb-8">
            <p className="text-sm text-slate-600 mb-4 text-center">
              Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
            <h2 className="text-slate-900 mb-2 text-center">
              {concern === 'profit' ? 'Báo cáo lợi nhuận theo hóa đơn' : concern === 'time' ? 'Báo cáo bán hàng theo thời gian' : `Báo cáo bán hàng ${getConcernLabel()}`}
            </h2>
            {(concern === 'profit' || concern === 'time') && dateFrom && dateTo && (
              <p className="text-sm text-slate-600 text-center mb-2">
                Từ ngày {format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày {format(dateTo, 'dd/MM/yyyy', { locale: vi })}
              </p>
            )}
            {concern !== 'profit' && concern !== 'time' && (
              <p className="text-sm text-slate-600 text-center">
                Khoảng thời gian: {getTimeRangeLabel()}
              </p>
            )}
          </div>

          {/* Report Tables based on concern */}
          {concern === 'time' && (() => {
            const daysDiff = getDaysBetween(dateFrom, dateTo);
            const isByDay = daysDiff <= 30;
            const timeData = isByDay ? timeReportDataByDay : timeReportDataByMonth;

            // Calculate totals
            const totals = timeData.reduce(
              (acc, item) => ({
                revenue: acc.revenue + item.revenue,
                returnValue: acc.returnValue + item.returnValue,
                netRevenue: acc.netRevenue + item.netRevenue,
              }),
              {
                revenue: 0,
                returnValue: 0,
                netRevenue: 0,
              }
            );

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
                      <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatNumber(totals.revenue)}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatNumber(totals.returnValue)}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatNumber(totals.netRevenue)}</td>
                    </tr>
                    {timeData.map((item) => {
                      const isExpanded = expandedRows.has(item.time);
                      const hasInvoices = item.invoices && item.invoices.length > 0;

                      return (
                        <>
                          <tr
                            key={item.time}
                            className="border-b border-slate-200 cursor-pointer hover:bg-blue-50"
                            onClick={() => hasInvoices && toggleRow(item.time)}
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
                                <span className="text-blue-600">{item.time}</span>
                              </div>
                            </td>

                            <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(item.revenue)}</td>
                            <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(item.returnValue)}</td>
                            <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(item.netRevenue)}</td>
                          </tr>

                          {/* Invoice Details */}
                          {isExpanded && hasInvoices && (
                            <tr className="bg-slate-50">
                              <td colSpan={5} className="py-2 px-4">
                                <table className="w-full">
                                  <thead>
                                    <tr>
                                      <th className="text-left py-2 px-4 text-xs text-slate-600">Mã giao dịch</th>
                                      <th className="text-left py-2 px-4 text-xs text-slate-600">Thời gian</th>
                                      <th className="text-left py-2 px-4 text-xs text-slate-600">Khách hàng</th>
                                      <th className="text-right py-2 px-4 text-xs text-slate-600">Doanh thu thuần</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.invoices!.map((invoice, idx) => (
                                      <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-2 px-4 text-xs text-slate-700">{invoice.code}</td>
                                        <td className="py-2 px-4 text-xs text-slate-700">{invoice.time}</td>
                                        <td className="py-2 px-4 text-xs text-slate-700">{invoice.customer}</td>
                                        <td className="text-right py-2 px-4 text-xs text-slate-700">{formatNumber(invoice.netRevenue)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
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
          })()}

          {concern === 'profit' && (() => {
            const daysDiff = getDaysBetween(dateFrom, dateTo);
            const isByDay = daysDiff <= 30;
            const profitData = isByDay ? profitReportDataByDay : profitReportDataByMonth;

            // Calculate totals
            const totals = profitData.reduce(
              (acc, item) => ({
                totalMerchandise: acc.totalMerchandise + item.totalMerchandise,
                invoiceDiscount: acc.invoiceDiscount + item.invoiceDiscount,
                revenue: acc.revenue + item.revenue,
                totalCost: acc.totalCost + item.totalCost,
                grossProfit: acc.grossProfit + item.grossProfit,
              }),
              {
                totalMerchandise: 0,
                invoiceDiscount: 0,
                revenue: 0,
                totalCost: 0,
                grossProfit: 0,
              }
            );

            return (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
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
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(totals.totalMerchandise)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(totals.invoiceDiscount)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(totals.revenue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatNumber(totals.totalCost)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-blue-600 font-medium">{formatNumber(totals.grossProfit)}</td>
                    </tr>
                    {profitData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-4 py-2 text-sm text-blue-600">{item.time}</td>
                        <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.totalMerchandise)}</td>
                        <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.invoiceDiscount)}</td>
                        <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.revenue)}</td>
                        <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.totalCost)}</td>
                        <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.grossProfit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {concern === 'discount' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Mã HĐ</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Ngày</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Số tiền gốc</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Giảm giá</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Thành tiền</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">% Giảm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-amber-50 border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium" colSpan={2}>Tổng</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(2500000)}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(295000)}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(2205000)}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">11.8%</td>
                  </tr>
                  {discountData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{item.invoiceCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.date}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.originalAmount)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.discountAmount)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.finalAmount)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{item.discountPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'return' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Mã HĐ</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Ngày</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Sản phẩm</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Số lượng</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-amber-50 border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium" colSpan={3}>Tổng</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">6</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(245000)}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium">-</td>
                  </tr>
                  {returnData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{item.invoiceCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.productName}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{item.quantity}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.returnValue)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'table' && (
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
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">45</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(25100000)}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(557778)}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">77%</td>
                  </tr>
                  {tableData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{item.tableName}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.area}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{item.usageCount}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.totalRevenue)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.avgRevenue)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{item.occupancyRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'category' && (
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
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">1,170</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(63700000)}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">28</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(1305000)}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(62395000)}</td>
                  </tr>
                  {categoryData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{item.category}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatNumber(item.soldQty)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.revenue)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{item.returnQty}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.returnValue)}</td>
                      <td className="text-right px-4 py-3 text-sm text-slate-700">{formatCurrency(item.netRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedArea !== 'all') count++;
    if (selectedTable !== 'all') count++;
    return count;
  };

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
                <Select value={concern} onValueChange={(value) => setConcern(value as ConcernType)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Thời gian</SelectItem>
                    <SelectItem value="profit">Lợi nhuận</SelectItem>
                    <SelectItem value="discount">Giảm giá HĐ</SelectItem>
                    <SelectItem value="return">Trả hàng</SelectItem>
                    <SelectItem value="table">Phòng/Bàn</SelectItem>
                    <SelectItem value="category">Danh mục hàng hóa</SelectItem>
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
                <h3 className="text-sm text-slate-900 mb-3">Khu vực</h3>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="floor1">Tầng 1</SelectItem>
                    <SelectItem value="floor2">Tầng 2</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phòng bàn */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Phòng bàn</h3>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn phòng bàn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="table01">Bàn 01</SelectItem>
                    <SelectItem value="table02">Bàn 02</SelectItem>
                    <SelectItem value="table03">Bàn 03</SelectItem>
                    <SelectItem value="vip1">Bàn VIP 1</SelectItem>
                    <SelectItem value="vip2">Bàn VIP 2</SelectItem>
                    <SelectItem value="table05">Bàn 05</SelectItem>
                    <SelectItem value="table06">Bàn 06</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {getActiveFilterCount() > 0 && (
              <div className="pt-4 border-t border-slate-200 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedArea('all');
                    setSelectedTable('all');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loại hiển thị - Only show for time and profit concerns */}
      {(concern === 'time' || concern === 'profit') && (
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
      )}

      {/* Report Content */}
      <div className="p-8">
      {viewType === 'chart' ? renderChart() : renderReport()}\n      </div>
    </div>
  );
}