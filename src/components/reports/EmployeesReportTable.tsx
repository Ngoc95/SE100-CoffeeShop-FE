import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EmployeeProfitReport } from './EmployeeProfitReport';
import { EmployeeSalesReport } from './EmployeeSalesReport';


export function EmployeesReportTable() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [viewType, setViewType] = useState<'chart' | 'report'>('chart');
  const [concern, setConcern] = useState<'profit' | 'sales'>('profit');
  const [salesMode, setSalesMode] = useState<'invoice' | 'items'>('invoice');
  
  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-week');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 10, 24));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 10, 27));
  
  // Mock employee data for charts
  const employeeData = [
    { name: 'Nguyễn Văn A', role: 'Quản lý', revenue: 15000000, discounts: 500000, cost: 8000000, profit: 6500000, shifts: 12, ordersServed: 45, avgOrderValue: 333333, performance: 95 },
    { name: 'Trần Thị B', role: 'Thu ngân', revenue: 12000000, discounts: 300000, cost: 6500000, profit: 5200000, shifts: 10, ordersServed: 38, avgOrderValue: 315789, performance: 88 },
    { name: 'Lê Văn C', role: 'Pha chế', revenue: 10000000, discounts: 200000, cost: 5500000, profit: 4300000, shifts: 11, ordersServed: 32, avgOrderValue: 312500, performance: 82 },
    { name: 'Phạm Thị D', role: 'Phục vụ', revenue: 8500000, discounts: 150000, cost: 4800000, profit: 3550000, shifts: 9, ordersServed: 28, avgOrderValue: 303571, performance: 78 },
    { name: 'Hoàng Văn E', role: 'Phục vụ', revenue: 7200000, discounts: 100000, cost: 4000000, profit: 3100000, shifts: 8, ordersServed: 24, avgOrderValue: 300000, performance: 75 },
  ];

  // Employee Profit Report Data
  const employeeProfitData = [
    { employeeName: 'Hương - Kế Toán', totalMerchandise: 3360000, invoiceDiscount: 15000, revenue: 3345000, returnValue: 0, netRevenue: 3345000, totalCost: 2580000, grossProfit: 765000 },
    { employeeName: 'kaka123', totalMerchandise: 2105000, invoiceDiscount: 0, revenue: 2105000, returnValue: 0, netRevenue: 2105000, totalCost: 1542500, grossProfit: 562500 },
    { employeeName: 'Hoàng - Kinh Doanh', totalMerchandise: 970000, invoiceDiscount: 3000, revenue: 967000, returnValue: 0, netRevenue: 967000, totalCost: 683000, grossProfit: 284000 },
  ];

  // Employee Sales Report Data
  const employeeSalesData = [
    {
      employeeName: 'Hương - Kế Toán',
      totalSold: 48,
      revenue: 3360000,
      totalReturned: 0,
      returnValue: 0,
      netRevenue: 3360000,
      items: [
        { itemCode: 'SP000012', itemName: 'Súp kem gà nữ hoàng', quantitySold: 24, revenue: 3000000, quantityReturned: 0, returnValue: 0, netRevenue: 3000000 },
        { itemCode: 'SP000019', itemName: 'Lipton with milk', quantitySold: 15, revenue: 225000, quantityReturned: 0, returnValue: 0, netRevenue: 225000 },
        { itemCode: 'SP000046', itemName: 'Lemon Tea', quantitySold: 9, revenue: 135000, quantityReturned: 0, returnValue: 0, netRevenue: 135000 },
      ],
    },
    { employeeName: 'kaka123', totalSold: 33, revenue: 2105000, totalReturned: 0, returnValue: 0, netRevenue: 2105000, items: [] },
    { employeeName: 'Hoàng - Kinh Doanh', totalSold: 25, revenue: 970000, totalReturned: 0, returnValue: 0, netRevenue: 970000, items: [] },
  ];

  // Prepare chart data
  const chartData = employeeData.map(e => ({
    name: e.name,
    value: concern === 'profit' ? e.profit : (salesMode === 'invoice' ? e.ordersServed : e.shifts)
  })).sort((a, b) => b.value - a.value).slice(0, 10);

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
                <Select value={concern} onValueChange={(value) => setConcern(value as typeof concern)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit">Lợi nhuận</SelectItem>
                    <SelectItem value="sales">Hàng bán theo nhân viên</SelectItem>
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
            </div>
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
      {viewType === 'report' ? (
        concern === 'profit' ? (
          <EmployeeProfitReport
            dateFrom={dateFrom || new Date(2025, 10, 24)}
            dateTo={dateTo || new Date(2025, 10, 27)}
            employeeData={employeeProfitData}
          />
        ) : (
          <EmployeeSalesReport
            dateFrom={dateFrom || new Date(2025, 10, 24)}
            dateTo={dateTo || new Date(2025, 10, 27)}
            employeeData={employeeSalesData}
          />
        )
      ) : (
        <Card className={concern === 'profit' ? 'border-emerald-200' : 'border-blue-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${concern === 'profit' ? 'text-emerald-900' : 'text-blue-900'}`}>
              {concern === 'profit' ? 'Top 10 nhân viên có lợi nhuận cao nhất' : `Top 10 nhân viên bán ${salesMode === 'invoice' ? 'nhiều' : 'nhiều mặt hàng'} nhất`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} width={200} />
                <Tooltip
                  formatter={(value: number) => concern === 'profit' ? `${value.toLocaleString()}₫` : `${value.toLocaleString()} ${salesMode === 'invoice' ? 'hóa đơn' : 'mặt hàng'}`}
                  contentStyle={{ backgroundColor: concern === 'profit' ? '#f0fdf4' : '#eff6ff', border: `1px solid ${concern === 'profit' ? '#86efac' : '#bfdbfe'}`, borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill={concern === 'profit' ? '#10b981' : '#2563eb'} radius={[0, 8, 8, 0]} label={{ position: 'right', fill: concern === 'profit' ? '#047857' : '#1e40af', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
