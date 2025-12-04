import { Download } from 'lucide-react';
import { Button } from '../ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type ViewType = 'chart' | 'report';
type ConcernType = 'time' | 'profit' | 'discount' | 'return' | 'table' | 'category';

interface SalesReportProps {
  viewType: ViewType;
  concern: ConcernType;
  dateFrom?: Date;
  dateTo?: Date;
  selectedArea: string;
  selectedTable: string;
}

export function SalesReport({ 
  viewType, 
  concern, 
  dateFrom, 
  dateTo,
  selectedArea,
  selectedTable 
}: SalesReportProps) {
  
  // Sample chart data for revenue by day
  const revenueByDayData = [
    { day: '01', revenue: 2800000 },
    { day: '02', revenue: 3200000 },
    { day: '03', revenue: 2900000 },
    { day: '04', revenue: 3400000 },
    { day: '05', revenue: 3100000 },
    { day: '06', revenue: 3800000 },
    { day: '07', revenue: 3600000 },
    { day: '08', revenue: 2700000 },
    { day: '09', revenue: 3000000 },
    { day: '10', revenue: 3500000 },
    { day: '11', revenue: 3300000 },
    { day: '12', revenue: 3700000 },
    { day: '13', revenue: 3900000 },
    { day: '14', revenue: 4000000 },
    { day: '15', revenue: 3400000 },
    { day: '16', revenue: 3200000 },
    { day: '17', revenue: 3600000 },
    { day: '18', revenue: 3800000 },
    { day: '19', revenue: 3500000 },
    { day: '20', revenue: 3900000 },
    { day: '21', revenue: 4200000 },
    { day: '22', revenue: 3700000 },
    { day: '23', revenue: 3300000 },
    { day: '24', revenue: 3500000 },
    { day: '25', revenue: 3800000 },
    { day: '26', revenue: 4100000 },
    { day: '27', revenue: 3900000 },
    { day: '28', revenue: 3600000 },
    { day: '29', revenue: 3400000 },
    { day: '30', revenue: 3800000 },
  ];

  // Chart data for profit concern
  const profitChartData = [
    { day: '01', revenue: 2800000, profit: 1050000 },
    { day: '02', revenue: 3200000, profit: 1200000 },
    { day: '03', revenue: 2900000, profit: 1085000 },
    { day: '04', revenue: 3400000, profit: 1275000 },
    { day: '05', revenue: 3100000, profit: 1160000 },
    { day: '06', revenue: 3800000, profit: 1425000 },
    { day: '07', revenue: 3600000, profit: 1350000 },
    { day: '08', revenue: 2700000, profit: 1012500 },
    { day: '09', revenue: 3000000, profit: 1125000 },
    { day: '10', revenue: 3500000, profit: 1312500 },
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

  // Sample data for tables
  const salesByTimeData = [
    { date: '01/12/2025', invoiceCount: 45, revenue: 12500000, returnCount: 2, returnValue: 150000, netRevenue: 12350000 },
    { date: '02/12/2025', invoiceCount: 52, revenue: 14800000, returnCount: 1, returnValue: 80000, netRevenue: 14720000 },
    { date: '03/12/2025', invoiceCount: 48, revenue: 13200000, returnCount: 3, returnValue: 220000, netRevenue: 12980000 },
    { date: '04/12/2025', invoiceCount: 61, revenue: 16500000, returnCount: 2, returnValue: 160000, netRevenue: 16340000 },
    { date: '05/12/2025', invoiceCount: 55, revenue: 15100000, returnCount: 0, returnValue: 0, netRevenue: 15100000 },
  ];

  const profitData = [
    { invoiceCode: 'HD-001', date: '01/12/2025', revenue: 450000, cost: 280000, profit: 170000, margin: 37.8 },
    { invoiceCode: 'HD-002', date: '01/12/2025', revenue: 320000, cost: 195000, profit: 125000, margin: 39.1 },
    { invoiceCode: 'HD-003', date: '01/12/2025', revenue: 580000, cost: 350000, profit: 230000, margin: 39.7 },
    { invoiceCode: 'HD-004', date: '02/12/2025', revenue: 410000, cost: 260000, profit: 150000, margin: 36.6 },
    { invoiceCode: 'HD-005', date: '02/12/2025', revenue: 690000, cost: 420000, profit: 270000, margin: 39.1 },
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

  const getChartData = () => {
    switch (concern) {
      case 'time':
        return revenueByDayData;
      case 'profit':
        return profitChartData;
      case 'discount':
        return discountChartData;
      case 'return':
        return returnChartData;
      case 'table':
        return tableChartData;
      case 'category':
        return categoryChartData;
      default:
        return revenueByDayData;
    }
  };

  const renderChart = () => {
    const chartData = getChartData();
    const dataKey = concern === 'table' || concern === 'category' ? 'name' : 'day';
    
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-slate-900 mb-1">Doanh thu thuần {getConcernLabel()} {getTimeRangeLabel()}</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>Chi nhánh trung tâm</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
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
              formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
              labelFormatter={(label) => concern === 'table' || concern === 'category' ? label : `Ngày ${label}`}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
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
              Báo cáo bán hàng {getConcernLabel()}
            </h2>
            <p className="text-sm text-slate-600 text-center">
              Khoảng thời gian: {getTimeRangeLabel()}
            </p>
          </div>

          {/* Report Tables based on concern */}
          {concern === 'time' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Ngày</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Số HĐ</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Doanh thu</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">SL trả</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Giá trị trả</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Doanh thu thuần</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">Tổng</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">261</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(72100000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">8</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(610000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(71490000)}</td>
                  </tr>
                  {salesByTimeData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.date}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.invoiceCount}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.revenue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.returnCount}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.returnValue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.netRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'profit' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Mã HĐ</th>
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Ngày</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Doanh thu</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Giá vốn</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Lợi nhuận</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Tỷ suất LN (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900" colSpan={2}>Tổng</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(2450000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(1505000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(945000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">38.6%</td>
                  </tr>
                  {profitData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.invoiceCode}</td>
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.date}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.revenue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.cost)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.profit)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.margin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'discount' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Mã HĐ</th>
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Ngày</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Số tiền gốc</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Giảm giá</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Thành tiền</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">% Giảm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900" colSpan={2}>Tổng</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(2500000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(295000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(2205000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">11.8%</td>
                  </tr>
                  {discountData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.invoiceCode}</td>
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.date}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.originalAmount)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.discountAmount)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.finalAmount)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.discountPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'return' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Mã HĐ</th>
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Ngày</th>
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Sản phẩm</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Số lượng</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Giá trị trả</th>
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900" colSpan={3}>Tổng</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">6</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(245000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">-</td>
                  </tr>
                  {returnData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.invoiceCode}</td>
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.date}</td>
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.productName}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.quantity}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.returnValue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Phòng/Bàn</th>
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Khu vực</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Số lượt sử dụng</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Tổng doanh thu</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">DT trung bình</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Tỷ lệ sử dụng (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900" colSpan={2}>Tổng</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">45</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(25100000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(557778)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">77%</td>
                  </tr>
                  {tableData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.tableName}</td>
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.area}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.usageCount}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.totalRevenue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.avgRevenue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.occupancyRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {concern === 'category' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-4 py-2 text-left text-sm text-slate-700">Danh mục hàng hóa</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">SL bán</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Doanh thu</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">SL trả</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Giá trị trả</th>
                    <th className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">Doanh thu thuần</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">Tổng</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">1,170</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(63700000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">28</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(1305000)}</td>
                    <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-900">{formatCurrency(62395000)}</td>
                  </tr>
                  {categoryData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-4 py-2 text-sm text-slate-700">{item.category}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatNumber(item.soldQty)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.revenue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{item.returnQty}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.returnValue)}</td>
                      <td className="border border-slate-300 px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(item.netRevenue)}</td>
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

  return (
    <div className="p-8">
      {viewType === 'chart' ? renderChart() : renderReport()}
    </div>
  );
}