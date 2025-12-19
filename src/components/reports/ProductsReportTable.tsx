import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Filter, ChevronDown, ChevronUp, X, CheckCircle2, Award, TrendingUp, LineChart as LineChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryImportExportReport } from './InventoryImportExportReport';
import { InventoryWriteOffReport } from './InventoryWriteOffReport';
import { ProductsReportExcel } from './ProductsReportExcel';

interface SelectableItem {
  id: string;
  name: string;
}

export function ProductsReportTable() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [viewType, setViewType] = useState<'chart' | 'report'>('report');
  const [concern, setConcern] = useState<'sales' | 'profit' | 'import-export' | 'write-off'>('sales');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SelectableItem[]>([]);
  
  // Auto-set viewType to 'report' for concerns that don't have charts
  useEffect(() => {
    if (concern === 'import-export' || concern === 'write-off') {
      setViewType('report');
    }
  }, [concern]);
  
  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-week');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 10, 24));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 10, 27));

  // Product categories
  const productCategories: SelectableItem[] = [
    { id: 'cat1', name: 'Cà phê' },
    { id: 'cat2', name: 'Trà sữa' },
    { id: 'cat3', name: 'Sinh tố' },
    { id: 'cat4', name: 'Đồ ăn nhẹ' },
  ];

  // Helper functions
  const handleMultiSelect = (item: SelectableItem) => {
    const isSelected = selectedCategories.some(s => s.id === item.id);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(s => s.id !== item.id));
    } else {
      setSelectedCategories([...selectedCategories, item]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setSelectedCategories(selectedCategories.filter(item => item.id !== id));
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (productSearch) count++;
    if (selectedCategories.length > 0) count++;
    return count;
  };

  // Mock data
  const topProductsData = [
    { name: 'Cà phê sữa đá', sold: 156, revenue: 9360000, cost: 3120000, profit: 6240000, trend: 'up' },
    { name: 'Bạc xỉu', sold: 134, revenue: 6700000, cost: 2345000, profit: 4355000, trend: 'up' },
    { name: 'Trà sữa trân châu', sold: 92, revenue: 5520000, cost: 2300000, profit: 3220000, trend: 'stable' },
    { name: 'Trà đào cam sả', sold: 87, revenue: 4785000, cost: 1740000, profit: 3045000, trend: 'up' },
    { name: 'Trà sữa matcha', sold: 73, revenue: 4380000, cost: 1825000, profit: 2555000, trend: 'down' },
    { name: 'Sinh tố bơ', sold: 76, revenue: 4180000, cost: 1880000, profit: 2300000, trend: 'stable' },
    { name: 'Cà phê đen', sold: 98, revenue: 3920000, cost: 1176000, profit: 2744000, trend: 'up' },
    { name: 'Cappuccino', sold: 67, revenue: 3685000, cost: 1547000, profit: 2138000, trend: 'stable' },
    { name: 'Trà chanh', sold: 65, revenue: 2925000, cost: 975000, profit: 1950000, trend: 'down' },
    { name: 'Sinh tố dâu', sold: 54, revenue: 2970000, cost: 1336500, profit: 1633500, trend: 'stable' },
  ];

  const slowMovingProducts = [
    { name: 'Bánh flan', sold: 8, daysNoSale: 3, status: 'slow' },
    { name: 'Nước cam chai', sold: 5, daysNoSale: 5, status: 'slow' },
    { name: 'Yaourt dẻo', sold: 3, daysNoSale: 7, status: 'very-slow' },
  ];


  const noSaleProducts = [
    { name: 'Cookies chocolate', lastSale: '15 ngày trước', status: 'no-sale' },
    { name: 'Trà hoa cúc', lastSale: '22 ngày trước', status: 'no-sale' },
  ];

  const getTrendDisplay = (trend: string) => {
    if (trend === 'up') return '↑ Tăng';
    if (trend === 'down') return '↓ Giảm';
    return '→ Ổn định';
  };

  const totalRevenue = topProductsData.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = topProductsData.reduce((sum, p) => sum + p.cost, 0);
  const totalProfit = topProductsData.reduce((sum, p) => sum + p.profit, 0);

  // Mock data for inventory reports
  const inventoryImportExportData = [
    { code: 'SP000014', name: 'Súp kem bí đỏ với sữa dừa', beginningQty: 1091, beginningValue: 109645500, importQty: 0, importValue: 0, exportQty: 0, exportValue: 0, endingQty: 1091, endingValue: 109645500 },
    { code: 'SP000002', name: 'APEROL SPRITZ', beginningQty: 1051, beginningValue: 15765000, importQty: 0, importValue: 0, exportQty: 0, exportValue: 0, endingQty: 1051, endingValue: 15765000 },
    { code: 'SP000003', name: 'CUBA LIBRE', beginningQty: 1050, beginningValue: 15750000, importQty: 0, importValue: 0, exportQty: 0, exportValue: 0, endingQty: 1050, endingValue: 15750000 },
  ];

  const inventoryWriteOffData = [
    { code: 'SP000018', name: 'Mint Tea', totalQuantity: 101, totalValue: 707000, details: [{ writeOffCode: 'XH000001', dateTime: '04/12/2025 13:10', quantity: 101, unitPrice: 7000, totalValue: 707000 }] },
  ];

  // Products Excel Report Data
  const productsExcelData = [
    { code: 'SP000009', name: 'Phomai dây Nga', quantitySold: 69, revenue: 8625000, quantityReturned: 0, returnValue: 0, netRevenue: 8625000, costOfGoods: 6934500, profit: 1665000, profitMargin: 19.36 },
    { code: 'SP000006', name: 'CBánh mỳ bơ lỏ đậm bồng & phomai', quantitySold: 39, revenue: 4875000, quantityReturned: 0, returnValue: 0, netRevenue: 4875000, costOfGoods: 3919500, profit: 955500, profitMargin: 19.60 },
    { code: 'SP000012', name: 'Súp kem gà nữ hoàng', quantitySold: 36, revenue: 4500000, quantityReturned: 0, returnValue: 0, netRevenue: 4500000, costOfGoods: 3618000, profit: 881250, profitMargin: 19.59 },
    { code: 'SP000013', name: 'Súp hành tây kiểu Pháp', quantitySold: 34, revenue: 4250000, quantityReturned: 0, returnValue: 0, netRevenue: 4250000, costOfGoods: 3417000, profit: 833000, profitMargin: 19.60 },
    { code: 'SP000014', name: 'Súp kem bí đỏ với sữa dừa', quantitySold: 34, revenue: 4250000, quantityReturned: 0, returnValue: 0, netRevenue: 4250000, costOfGoods: 3417000, profit: 825403, profitMargin: 19.46 },
    { code: 'SP000007', name: 'Thịt người & phomai viên chiên kiểu Tây Ba Nha', quantitySold: 33, revenue: 4125000, quantityReturned: 0, returnValue: 0, netRevenue: 4125000, costOfGoods: 3316500, profit: 804474, profitMargin: 19.52 },
    { code: 'SP000011', name: 'Súp kem rau 4 mùa', quantitySold: 31, revenue: 3875000, quantityReturned: 0, returnValue: 0, netRevenue: 3875000, costOfGoods: 3115500, profit: 758678, profitMargin: 19.58 },
    { code: 'SP000015', name: 'Súp kem kiểu Paris', quantitySold: 27, revenue: 3375000, quantityReturned: 0, returnValue: 0, netRevenue: 3375000, costOfGoods: 2713500, profit: 661500, profitMargin: 19.60 },
    { code: 'SP000023', name: 'Thuốc lá Vinataba', quantitySold: 69, revenue: 2070000, quantityReturned: 0, returnValue: 0, netRevenue: 2070000, costOfGoods: 1414500, profit: 655000, profitMargin: 31.65 },
    { code: 'SP000019', name: 'Lipton with milk', quantitySold: 78, revenue: 1170000, quantityReturned: 0, returnValue: 0, netRevenue: 1170000, costOfGoods: 546000, profit: 622750, profitMargin: 53.28 },
    { code: 'SP000008', name: 'Đĩa thịt người Tây Ba Nha hảo hạng', quantitySold: 22, revenue: 2750000, quantityReturned: 0, returnValue: 0, netRevenue: 2750000, costOfGoods: 2211000, profit: 538957, profitMargin: 19.60 },
    { code: 'SP000024', name: 'Thuốc lá Marlboro', quantitySold: 45, revenue: 1350000, quantityReturned: 0, returnValue: 0, netRevenue: 1350000, costOfGoods: 922500, profit: 422741, profitMargin: 31.42 },
    { code: 'SP000005', name: 'BLOODY MARY', quantitySold: 28, revenue: 840000, quantityReturned: 0, returnValue: 0, netRevenue: 840000, costOfGoods: 420000, profit: 414194, profitMargin: 49.65 },
    { code: 'SP000018', name: 'Mint Tea', quantitySold: 49, revenue: 735000, quantityReturned: 0, returnValue: 0, netRevenue: 735000, costOfGoods: 343000, profit: 391472, profitMargin: 53.30 },
  ];
  const totalSold = topProductsData.reduce((sum, p) => sum + p.sold, 0);

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
                <Select value={concern} onValueChange={(value) => setConcern(value as typeof concern)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Bán hàng</SelectItem>
                    <SelectItem value="profit">Lợi nhuận</SelectItem>
                    <SelectItem value="import-export">Xuất nhập tồn</SelectItem>
                    <SelectItem value="write-off">Xuất hủy</SelectItem>
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

              {/* Tìm kiếm sản phẩm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Hàng hóa</h3>
                <Input
                  placeholder="Theo tên, mã hàng"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="text-sm bg-white border border-slate-300"
                />
              </div>

              {/* Danh mục hàng hóa */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Danh mục hàng hóa</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-auto min-h-[40px]">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {selectedCategories.length > 0 ? (
                          selectedCategories.map((item) => (
                            <Badge
                              key={item.id}
                              variant="secondary"
                              className="bg-slate-200 text-slate-900 pr-1 text-xs"
                            >
                              {item.name}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveItem(item.id);
                                }}
                                className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">Chọn danh mục</span>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                    <div className="space-y-2">
                      {productCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                          onClick={() => handleMultiSelect(cat)}
                        >
                          <span className="text-sm text-slate-900">{cat.name}</span>
                          {selectedCategories.some(s => s.id === cat.id) && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear Filters Button */}
            {getActiveFilterCount() > 0 && (
              <div className="pt-4 border-t border-slate-200 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setProductSearch('');
                    setSelectedCategories([]);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loại hiển thị - Only show for sales and profit concerns */}
      {(concern === 'sales' || concern === 'profit') && (
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
      {concern === 'import-export' ? (
        <InventoryImportExportReport
          dateFrom={dateFrom || new Date(2025, 11, 5)}
          dateTo={dateTo || new Date(2025, 11, 5)}
          data={inventoryImportExportData}
        />
      ) : concern === 'write-off' ? (
        <InventoryWriteOffReport
          dateFrom={dateFrom || new Date(2025, 11, 1)}
          dateTo={dateTo || new Date(2025, 11, 31)}
          data={inventoryWriteOffData}
        />
      ) : viewType === 'report' ? (
        <ProductsReportExcel
          concern={concern}
          dateFrom={dateFrom || new Date(2025, 9, 28)}
          dateTo={dateTo || new Date(2025, 10, 27)}
          productsData={productsExcelData}
        />
      ) : concern === 'sales' ? (
        <>
          {/* Sales Concern Charts */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Award className="w-5 h-5" />
                TOP 10 sản phẩm doanh số cao nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const top10 = topProductsData.slice(0, 10);
                      const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.revenue, 0);
                      if (othersValue > 0) {
                        return [...top10, { name: 'Khác', revenue: othersValue }];
                      }
                      return top10;
                    })()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) => {
                      const total = topProductsData.reduce((sum, item) => sum + item.revenue, 0);
                      const percent = ((entry.revenue / total) * 100).toFixed(1);
                      return `${entry.name}: ${percent}%`;
                    }}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {(() => {
                      const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7', '#94a3b8'];
                      const top10 = topProductsData.slice(0, 10);
                      const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.revenue, 0);
                      const data = othersValue > 0 ? [...top10, { name: 'Khác', revenue: othersValue }] : top10;
                      return data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ));
                    })()}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}₫`}
                    contentStyle={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', fontSize: '14px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <TrendingUp className="w-5 h-5" />
                TOP 10 sản phẩm bán chạy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const top10 = topProductsData.slice(0, 10);
                      const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.sold, 0);
                      if (othersValue > 0) {
                        return [...top10, { name: 'Khác', sold: othersValue }];
                      }
                      return top10;
                    })()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) => {
                      const total = topProductsData.reduce((sum, item) => sum + item.sold, 0);
                      const percent = ((entry.sold / total) * 100).toFixed(1);
                      return `${entry.name}: ${percent}%`;
                    }}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="sold"
                  >
                    {(() => {
                      const COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#06b6d4', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#94a3b8'];
                      const top10 = topProductsData.slice(0, 10);
                      const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.sold, 0);
                      const data = othersValue > 0 ? [...top10, { name: 'Khác', sold: othersValue }] : top10;
                      return data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ));
                    })()}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value} sản phẩm`}
                    contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', fontSize: '14px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <LineChartIcon className="w-5 h-5" />
                Biến động số lượng bán theo thời gian (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={(() => {
                    const timePoints = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
                    return timePoints.map(time => {
                      const dataPoint: any = { time };
                      topProductsData.slice(0, 10).forEach(product => {
                        dataPoint[product.name] = Math.floor(Math.random() * 50) + 10;
                      });
                      return dataPoint;
                    });
                  })()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }} />
                  <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }} iconType="line" />
                  {(() => {
                    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7'];
                    return topProductsData.slice(0, 10).map((product, index) => (
                      <Line key={product.name} type="monotone" dataKey={product.name} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    ));
                  })()}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Profit Concern Charts */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Award className="w-5 h-5" />
                TOP 10 sản phẩm lợi nhuận cao nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const top10 = topProductsData.slice(0, 10);
                      const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.profit, 0);
                      if (othersValue > 0) {
                        return [...top10, { name: 'Khác', profit: othersValue }];
                      }
                      return top10;
                    })()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) => {
                      const total = topProductsData.reduce((sum, item) => sum + item.profit, 0);
                      const percent = ((entry.profit / total) * 100).toFixed(1);
                      return `${entry.name}: ${percent}%`;
                    }}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="profit"
                  >
                    {(() => {
                      const COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#06b6d4', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#94a3b8'];
                      const top10 = topProductsData.slice(0, 10);
                      const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.profit, 0);
                      const data = othersValue > 0 ? [...top10, { name: 'Khác', profit: othersValue }] : top10;
                      return data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ));
                    })()}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}₫`}
                    contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <TrendingUp className="w-5 h-5" />
                TOP 10 sản phẩm theo tỷ suất lợi nhuận
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const sortedData = [...topProductsData].sort((a, b) => ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100));
                      const top10 = sortedData.slice(0, 10).map(item => ({ ...item, profitMargin: (item.profit / item.revenue) * 100 }));
                      const othersData = sortedData.slice(10);
                      if (othersData.length > 0) {
                        const othersAvgMargin = othersData.reduce((sum, item) => sum + (item.profit / item.revenue) * 100, 0) / othersData.length;
                        return [...top10, { name: 'Khác', profitMargin: othersAvgMargin, profit: 0, revenue: 0 }];
                      }
                      return top10;
                    })()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) => {
                      const total = (() => {
                        const sortedData = [...topProductsData].sort((a, b) => ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100));
                        return sortedData.slice(0, 10).reduce((sum, item) => sum + (item.profit / item.revenue) * 100, 0);
                      })();
                      const percent = ((entry.profitMargin / total) * 100).toFixed(1);
                      return `${entry.name}: ${percent}%`;
                    }}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="profitMargin"
                  >
                    {(() => {
                      const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#94a3b8'];
                      const sortedData = [...topProductsData].sort((a, b) => ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100));
                      const top10 = sortedData.slice(0, 10);
                      const othersData = sortedData.slice(10);
                      const data = othersData.length > 0 ? [...top10, { name: 'Khác' }] : top10;
                      return data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ));
                    })()}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Tỷ suất LN']}
                    contentStyle={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


