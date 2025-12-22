import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CustomerTimeFilter } from './CustomerTimeFilter';

interface Supplier {
  id: string;
  code: string;
  name: string;
  importQuantity: number;
  importValue: number;
  returnQuantity: number;
  returnValue: number;
  netImportValue: number;
  openingDebt: number;
  debitPayment: number;
  creditPayment: number;
  closingDebt: number;
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    code: 'NCC001',
    name: 'Công ty TNHH Cẩm',
    importQuantity: 727,
    importValue: 39864000,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 39864000,
    openingDebt: 2500000,
    debitPayment: 39864000, // Giá trị nhập trong kỳ
    creditPayment: 30000000, // Đã thanh toán một phần
    closingDebt: 12364000, // = 2,500,000 + 39,864,000 - 30,000,000
  },
  {
    id: '2',
    code: 'NCC003',
    name: 'Công ty Pharmedic',
    importQuantity: 158,
    importValue: 9318000,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 9318000,
    openingDebt: 1200000,
    debitPayment: 9318000,
    creditPayment: 10518000, // Thanh toán hết
    closingDebt: 0, // = 1,200,000 + 9,318,000 - 10,518,000
  },
  {
    id: '3',
    code: 'NCC005',
    name: 'Cửa hàng Đại Việt',
    importQuantity: 137,
    importValue: 8330000,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 8330000,
    openingDebt: 0,
    debitPayment: 8330000,
    creditPayment: 5000000, // Thanh toán một phần
    closingDebt: 3330000, // = 0 + 8,330,000 - 5,000,000
  },
  {
    id: '4',
    code: 'NCC002',
    name: 'Công ty Hoàng Gia',
    importQuantity: 121,
    importValue: 8328500,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 8328500,
    openingDebt: 500000,
    debitPayment: 8328500,
    creditPayment: 0, // Chưa thanh toán
    closingDebt: 8828500, // = 500,000 + 8,328,500 - 0
  },
  {
    id: '5',
    code: 'NCC004',
    name: 'Đại lý Hồng Phúc',
    importQuantity: 103,
    importValue: 4055500,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 4055500,
    openingDebt: 1500000,
    debitPayment: 4055500,
    creditPayment: 2000000, // Thanh toán một phần
    closingDebt: 3555500, // = 1,500,000 + 4,055,500 - 2,000,000
  },
  {
    id: '6',
    code: 'SPN00006',
    name: 'Cẩm my tổ lê đẹm bông x phonnal',
    importQuantity: 26,
    importValue: 2813000,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 2813000,
    openingDebt: 800000,
    debitPayment: 2813000,
    creditPayment: 3613000, // Thanh toán hết
    closingDebt: 0, // = 800,000 + 2,813,000 - 3,613,000
  },
  {
    id: '7',
    code: 'SPN00023',
    name: 'Thuốc lá Vinadata',
    importQuantity: 36,
    importValue: 738000,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 738000,
    openingDebt: 0,
    debitPayment: 738000,
    creditPayment: 0, // Chưa thanh toán
    closingDebt: 738000, // = 0 + 738,000 - 0
  },
  {
    id: '8',
    code: 'SPN00024',
    name: 'Thuốc lá Marlboro',
    importQuantity: 17,
    importValue: 348500,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 348500,
    openingDebt: 0,
    debitPayment: 348500,
    creditPayment: 348500, // Thanh toán hết
    closingDebt: 0, // = 0 + 348,500 - 348,500
  },
  {
    id: '9',
    code: 'SPN00025',
    name: 'Thuốc lá Kent HD',
    importQuantity: 14,
    importValue: 287000,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 287000,
    openingDebt: 200000,
    debitPayment: 287000,
    creditPayment: 100000, // Thanh toán một phần
    closingDebt: 387000, // = 200,000 + 287,000 - 100,000
  },
  {
    id: '10',
    code: 'SPN00019',
    name: 'Lotion with milk',
    importQuantity: 10,
    importValue: 70000,
    returnQuantity: 0,
    returnValue: 0,
    netImportValue: 70000,
    openingDebt: 0,
    debitPayment: 70000,
    creditPayment: 70000, // Thanh toán hết
    closingDebt: 0, // = 0 + 70,000 - 70,000
  },
];


export function SupplierReport() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [viewType, setViewType] = useState<'chart' | 'report'>('report');
  const [concern, setConcern] = useState<'sales' | 'debt'>('sales');
  const [supplierSearch, setSupplierSearch] = useState('');
  
  // Time filter states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 10, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 10, 30));
  // Filter suppliers based on search query
  const filteredSuppliers = mockSuppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      supplier.code.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format time
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Prepare chart data based on concern
  const chartData = filteredSuppliers
    .slice(0, 10)
    .sort((a, b) => {
      if (concern === 'sales') {
        return b.netImportValue - a.netImportValue;
      } else {
        return b.closingDebt - a.closingDebt;
      }
    })
    .map((supplier) => ({
      name: supplier.name,
      value: concern === 'sales' ? supplier.netImportValue : supplier.closingDebt,
    }));


  // Render with filter panel
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
            {supplierSearch && (
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
              {/* Mối quan tâm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <Select value={concern} onValueChange={(value) => setConcern(value as typeof concern)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Nhập hàng</SelectItem>
                    <SelectItem value="debt">Công nợ</SelectItem>
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

              {/* Tìm kiếm nhà cung cấp */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm nhà cung cấp</h3>
                <Input
                  placeholder="Theo tên, mã NCC"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  className="text-sm bg-white border border-slate-300"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {supplierSearch && (
              <div className="pt-4 border-t border-slate-200 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSupplierSearch('')}
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
    <div className="h-full flex flex-col bg-white">
        <div className="flex-1 p-6">
          <div className="mb-4">
            <h3 className="text-md text-slate-900">
              {concern === 'sales'
                ? 'Top 10 nhà cung cấp nhập hàng nhiều nhất'
                : 'Top 10 nhà cung cấp có công nợ cao nhất'}
            </h3>
          </div>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => value.toLocaleString('vi-VN')} fontSize={12} />
                <YAxis type="category" dataKey="name" width={140} fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#2563eb" name={concern === 'sales' ? 'Giá trị nhập' : 'Công nợ'} label={{ position: 'right', fill: '#1e40af', fontWeight: 'bold', fontSize: 12, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  ) : concern === 'sales' ? (
      <div className="h-full flex flex-col bg-white">
        {/* Report Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-slate-600">
              Ngày lập {formatDateTime(new Date())}
            </div>
            <h2 className="text-xl text-slate-900">
              Báo cáo nhập hàng theo nhà cung cấp
            </h2>
            <div className="text-sm text-slate-600">
              Từ ngày {dateFrom ? formatDate(dateFrom) : '...'} đến ngày {dateTo ? formatDate(dateTo) : '...'}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-blue-100 text-slate-900 sticky top-0 z-10">Mã nhà cung cấp</TableHead>
                <TableHead className="bg-blue-100 text-slate-900 sticky top-0 z-10">Tên nhà cung cấp</TableHead>
                <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">SL hàng nhập</TableHead>
                <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">Giá trị nhập</TableHead>
                <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">SL hàng trả</TableHead>
                <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">Giá trị trả</TableHead>
                <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">Giá trị nhập thuần</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length > 0 ? (
                <>
                  {/* Summary row */}
                  <TableRow className="bg-amber-50">
                    <TableCell colSpan={2} className="text-slate-900 font-medium">
                      Tổng
                    </TableCell>
                    <TableCell className="text-right text-slate-900 font-medium">
                      {filteredSuppliers.reduce((sum, s) => sum + s.importQuantity, 0)}
                    </TableCell>
                    <TableCell className="text-right text-slate-900 font-medium">
                      {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.importValue, 0))}
                    </TableCell>
                    <TableCell className="text-right text-slate-900 font-medium">
                      {filteredSuppliers.reduce((sum, s) => sum + s.returnQuantity, 0)}
                    </TableCell>
                    <TableCell className="text-right text-slate-900 font-medium">
                      {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.returnValue, 0))}
                    </TableCell>
                    <TableCell className="text-right text-slate-900 font-medium">
                      {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.netImportValue, 0))}
                    </TableCell>
                  </TableRow>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-slate-50">
                      <TableCell className="text-blue-600">{supplier.code}</TableCell>
                      <TableCell className="text-slate-700">{supplier.name}</TableCell>
                      <TableCell className="text-right text-slate-700">{supplier.importQuantity}</TableCell>
                      <TableCell className="text-right text-slate-700">{formatCurrency(supplier.importValue)}</TableCell>
                      <TableCell className="text-right text-slate-700">{supplier.returnQuantity}</TableCell>
                      <TableCell className="text-right text-slate-700">{formatCurrency(supplier.returnValue)}</TableCell>
                      <TableCell className="text-right text-slate-700">{formatCurrency(supplier.netImportValue)}</TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
  ) : (
    <div className="h-full flex flex-col bg-white">
      {/* Report Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="text-center space-y-2">
          <div className="text-sm text-slate-600">
            Ngày lập {formatDateTime(new Date())}
          </div>
          <h2 className="text-xl text-slate-900">
            Báo cáo công nợ theo nhà cung cấp
          </h2>
          <div className="text-sm text-slate-600">
            Từ ngày {dateFrom ? formatDate(dateFrom) : '...'} đến ngày {dateTo ? formatDate(dateTo) : '...'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-blue-100 text-slate-900 sticky top-0 z-10">Mã nhà cung cấp</TableHead>
              <TableHead className="bg-blue-100 text-slate-900 sticky top-0 z-10">Tên nhà cung cấp</TableHead>
              <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">Nợ đầu kỳ</TableHead>
              <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">Ghi nợ</TableHead>
              <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">Ghi có</TableHead>
              <TableHead className="bg-blue-100 text-slate-900 text-right sticky top-0 z-10">Nợ cuối kỳ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              <>
                {/* Summary row */}
                <TableRow className="bg-amber-50">
                  <TableCell colSpan={2} className="text-slate-900 font-medium">
                    Tổng
                  </TableCell>
                  <TableCell className="text-right text-slate-900 font-medium">
                    {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.openingDebt, 0))}
                  </TableCell>
                  <TableCell className="text-right text-slate-900 font-medium">
                    {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.debitPayment, 0))}
                  </TableCell>
                  <TableCell className="text-right text-slate-900 font-medium">
                    {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.creditPayment, 0))}
                  </TableCell>
                  <TableCell className="text-right text-slate-900 font-medium">
                    {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + s.closingDebt, 0))}
                  </TableCell>
                </TableRow>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-slate-50">
                    <TableCell className="text-blue-600">{supplier.code}</TableCell>
                    <TableCell className="text-slate-700">{supplier.name}</TableCell>
                    <TableCell className="text-right text-slate-700">{formatCurrency(supplier.openingDebt)}</TableCell>
                    <TableCell className="text-right text-slate-700">{formatCurrency(supplier.debitPayment)}</TableCell>
                    <TableCell className="text-right text-slate-700">{formatCurrency(supplier.creditPayment)}</TableCell>
                    <TableCell className="text-right text-slate-700">{formatCurrency(supplier.closingDebt)}</TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  Báo cáo không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )}
    </div>
  );
}