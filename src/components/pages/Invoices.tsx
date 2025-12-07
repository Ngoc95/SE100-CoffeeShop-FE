import { useState } from 'react';
import { Search, FileText, Eye, Download, ChevronDown, ChevronUp, Receipt, CreditCard, Calendar as CalendarIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface InvoiceItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: number;
  code: string;
  date: string;
  customer: string;
  customerId: string;
  staffId: string;
  staffName: string;
  tableId?: string;
  orderCode?: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: 'completed' | 'cancelled';
  promotionCode?: string;
  rewardPoints?: number;
  itemDetails: InvoiceItem[];
}

export function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [presetTimeRange, setPresetTimeRange] = useState('today');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['completed', 'cancelled']);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['cash', 'transfer', 'momo']);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);
  
  // Sort states
  type SortField = "code" | "date" | "customer" | "items" | "total" | "paymentMethod" | "status" | null;
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // Mock data
  const invoices: Invoice[] = [
    { 
      id: 1, 
      code: 'HD001', 
      date: '2024-12-04 10:30', 
      customer: 'Khách lẻ', 
      customerId: 'KL001',
      staffId: 'NV001',
      staffName: 'Nguyễn Văn A',
      tableId: 'B05',
      orderCode: 'DM001',
      items: 3, 
      total: 125000, 
      paymentMethod: 'cash', 
      status: 'completed',
      promotionCode: 'KM001',
      rewardPoints: 12,
      itemDetails: [
        { id: 1, name: 'Cà phê đen đá', unit: 'ly', quantity: 2, price: 25000, total: 50000 },
        { id: 2, name: 'Bạc xỉu', unit: 'ly', quantity: 1, price: 30000, total: 30000 },
        { id: 3, name: 'Bánh croissant', unit: 'cái', quantity: 1, price: 45000, total: 45000 },
      ]
    },
    { 
      id: 2, 
      code: 'HD002', 
      date: '2024-12-04 11:15', 
      customer: 'Nguyễn Văn B', 
      customerId: 'KH002',
      staffId: 'NV002',
      staffName: 'Trần Thị C',
      tableId: 'B03',
      items: 5, 
      total: 250000, 
      paymentMethod: 'transfer', 
      status: 'completed',
      rewardPoints: 25,
      itemDetails: [
        { id: 1, name: 'Trà sữa trân châu', unit: 'ly', quantity: 3, price: 35000, total: 105000 },
        { id: 2, name: 'Cà phê sữa', unit: 'ly', quantity: 2, price: 30000, total: 60000 },
        { id: 3, name: 'Bánh mì', unit: 'cái', quantity: 2, price: 25000, total: 50000 },
        { id: 4, name: 'Nước suối', unit: 'chai', quantity: 2, price: 10000, total: 20000 },
        { id: 5, name: 'Sữa chua', unit: 'hộp', quantity: 1, price: 15000, total: 15000 },
      ]
    },
    { 
      id: 3, 
      code: 'HD003', 
      date: '2024-12-04 12:00', 
      customer: 'Khách lẻ', 
      customerId: 'KL002',
      staffId: 'NV001',
      staffName: 'Nguyễn Văn A',
      items: 2, 
      total: 75000, 
      paymentMethod: 'cash', 
      status: 'completed',
      rewardPoints: 7,
      itemDetails: [
        { id: 1, name: 'Cà phê đen nóng', unit: 'ly', quantity: 1, price: 25000, total: 25000 },
        { id: 2, name: 'Trà đào', unit: 'ly', quantity: 1, price: 50000, total: 50000 },
      ]
    },
    { 
      id: 4, 
      code: 'HD004', 
      date: '2024-12-04 14:45', 
      customer: 'Trần Thị D', 
      customerId: 'KH003',
      staffId: 'NV003',
      staffName: 'Lê Văn E',
      tableId: 'B07',
      orderCode: 'DM002',
      items: 4, 
      total: 180000, 
      paymentMethod: 'momo', 
      status: 'completed',
      promotionCode: 'KM002',
      rewardPoints: 18,
      itemDetails: [
        { id: 1, name: 'Trà sữa ô long', unit: 'ly', quantity: 2, price: 40000, total: 80000 },
        { id: 2, name: 'Bánh flan', unit: 'cái', quantity: 2, price: 25000, total: 50000 },
        { id: 3, name: 'Cà phê latte', unit: 'ly', quantity: 1, price: 50000, total: 50000 },
      ]
    },
  ];

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const togglePaymentMethod = (method: string) => {
    setSelectedPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'transfer':
        return 'Chuyển khoản';
      case 'momo':
        return 'Ví MoMo';
      default:
        return method;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortField(null);
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === "none") {
      return null;
    }
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  let filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(invoice.status);
    const matchesPayment = selectedPaymentMethods.length === 0 || selectedPaymentMethods.includes(invoice.paymentMethod);
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredInvoices = [...filteredInvoices].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "code") {
        aValue = a.code;
        bValue = b.code;
      } else if (sortField === "date") {
        aValue = new Date(a.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')).getTime();
        bValue = new Date(b.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')).getTime();
      } else if (sortField === "customer") {
        aValue = a.customer;
        bValue = b.customer;
      } else if (sortField === "items") {
        aValue = a.items;
        bValue = b.items;
      } else if (sortField === "total") {
        aValue = a.total;
        bValue = b.total;
      } else if (sortField === "paymentMethod") {
        aValue = getPaymentMethodLabel(a.paymentMethod);
        bValue = getPaymentMethodLabel(b.paymentMethod);
      } else if (sortField === "status") {
        aValue = a.status;
        bValue = b.status;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "vi");
        return sortOrder === "asc" ? comparison : -comparison;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const completedCount = invoices.filter(inv => inv.status === 'completed').length;
  const cancelledCount = invoices.filter(inv => inv.status === 'cancelled').length;

  const toggleExpand = (invoiceId: number) => {
    setExpandedInvoiceId(expandedInvoiceId === invoiceId ? null : invoiceId);
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto hidden lg:block">
        <div className="space-y-6">
          {/* Date Range - Similar to Finance.tsx */}
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
            <RadioGroup value={dateRangeType} onValueChange={(value) => setDateRangeType(value as 'preset' | 'custom')}>
              {/* Preset Time Ranges */}
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="preset" id="date-preset" className="border-slate-300" />
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left text-sm bg-white border-slate-300"
                        onClick={() => setDateRangeType('preset')}
                      >
                        <span>
                          {presetTimeRange === 'today' && 'Hôm nay'}
                          {presetTimeRange === 'yesterday' && 'Hôm qua'}
                          {presetTimeRange === 'this-week' && 'Tuần này'}
                          {presetTimeRange === 'last-week' && 'Tuần trước'}
                          {presetTimeRange === 'last-7-days' && '7 ngày qua'}
                          {presetTimeRange === 'this-month' && 'Tháng này'}
                          {presetTimeRange === 'last-month' && 'Tháng trước'}
                          {presetTimeRange === 'this-month-lunar' && 'Tháng này (âm lịch)'}
                          {presetTimeRange === 'last-month-lunar' && 'Tháng trước (âm lịch)'}
                          {presetTimeRange === 'last-30-days' && '30 ngày qua'}
                          {presetTimeRange === 'this-quarter' && 'Quý này'}
                          {presetTimeRange === 'last-quarter' && 'Quý trước'}
                          {presetTimeRange === 'this-year' && 'Năm nay'}
                          {presetTimeRange === 'last-year' && 'Năm trước'}
                          {presetTimeRange === 'this-year-lunar' && 'Năm nay (âm lịch)'}
                          {presetTimeRange === 'last-year-lunar' && 'Năm trước (âm lịch)'}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-4" align="start">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Column 1: Theo ngày và tuần */}
                        <div>
                          <h4 className="text-sm text-slate-700 mb-3">Theo ngày và tuần</h4>
                          <div className="space-y-2">
                            {[
                              { value: 'today', label: 'Hôm nay' },
                              { value: 'yesterday', label: 'Hôm qua' },
                              { value: 'this-week', label: 'Tuần này' },
                              { value: 'last-week', label: 'Tuần trước' },
                              { value: 'last-7-days', label: '7 ngày qua' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setPresetTimeRange(option.value);
                                  setDateRangeType('preset');
                                }}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  presetTimeRange === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Column 2: Theo tháng và quý */}
                        <div>
                          <h4 className="text-sm text-slate-700 mb-3">Theo tháng và quý</h4>
                          <div className="space-y-2">
                            {[
                              { value: 'this-month', label: 'Tháng này' },
                              { value: 'last-month', label: 'Tháng trước' },
                              { value: 'this-month-lunar', label: 'Tháng này (âm lịch)' },
                              { value: 'last-month-lunar', label: 'Tháng trước (âm lịch)' },
                              { value: 'last-30-days', label: '30 ngày qua' },
                              { value: 'this-quarter', label: 'Quý này' },
                              { value: 'last-quarter', label: 'Quý trước' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setPresetTimeRange(option.value);
                                  setDateRangeType('preset');
                                }}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  presetTimeRange === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Column 3: Theo năm */}
                        <div>
                          <h4 className="text-sm text-slate-700 mb-3">Theo năm</h4>
                          <div className="space-y-2">
                            {[
                              { value: 'this-year', label: 'Năm nay' },
                              { value: 'last-year', label: 'Năm trước' },
                              { value: 'this-year-lunar', label: 'Năm nay (âm lịch)' },
                              { value: 'last-year-lunar', label: 'Năm trước (âm lịch)' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setPresetTimeRange(option.value);
                                  setDateRangeType('preset');
                                }}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  presetTimeRange === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="date-custom" className="border-slate-300" />
                <div className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left text-sm bg-white border-slate-300"
                        onClick={() => setDateRangeType('custom')}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom && dateTo
                          ? `${format(dateFrom, 'dd/MM', { locale: vi })} - ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`
                          : 'Lựa chọn khác'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="flex gap-4">
                        <div>
                          <Label className="text-xs text-slate-600 mb-2 block">Từ ngày</Label>
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={(date) => {
                              if (date) {
                                setDateFrom(date);
                                setDateRangeType('custom');
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600 mb-2 block">Đến ngày</Label>
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={(date) => {
                              if (date) {
                                setDateTo(date);
                                setDateRangeType('custom');
                              }
                            }}
                            disabled={(date) => dateFrom ? date < dateFrom : false}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Status Filter with Checkboxes */}
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Trạng thái</h3>
            <div className="space-y-2">
              {[
                { id: 'completed', label: 'Hoàn thành', color: 'bg-green-500' },
                { id: 'cancelled', label: 'Đã hủy', color: 'bg-red-500' },
              ].map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={status.id}
                    checked={selectedStatuses.includes(status.id)}
                    onCheckedChange={() => toggleStatus(status.id)}
                  />
                  <Label htmlFor={status.id} className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Method Filter */}
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Phương thức thanh toán</h3>
            <div className="space-y-2">
              {[
                { id: 'cash', label: 'Tiền mặt' },
                { id: 'transfer', label: 'Chuyển khoản' },
                { id: 'momo', label: 'Ví MoMo' },
              ].map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={method.id}
                    checked={selectedPaymentMethods.includes(method.id)}
                    onCheckedChange={() => togglePaymentMethod(method.id)}
                  />
                  <Label htmlFor={method.id} className="text-sm text-slate-700 cursor-pointer">
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick Filters */}
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Receipt className="w-3 h-3 mr-2" />
                Hoàn thành ({completedCount})
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <CreditCard className="w-3 h-3 mr-2" />
                Tiền mặt
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Hóa đơn</h1>
          <p className="text-sm text-slate-600">Quản lý danh sách hóa đơn bán hàng</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã hóa đơn hoặc khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="w-12 text-sm"></TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã HĐ
                      {getSortIcon("code")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Ngày giờ
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center">
                      Khách hàng
                      {getSortIcon("customer")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("items")}
                  >
                    <div className="flex items-center justify-center">
                      Số mặt hàng
                      {getSortIcon("items")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("total")}
                  >
                    <div className="flex items-center justify-end">
                      Tổng tiền
                      {getSortIcon("total")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("paymentMethod")}
                  >
                    <div className="flex items-center">
                      PT thanh toán
                      {getSortIcon("paymentMethod")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      Trạng thái
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead className="text-sm text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <>
                    <TableRow 
                      key={invoice.id} 
                      className="hover:bg-blue-50/50 cursor-pointer"
                      onClick={() => toggleExpand(invoice.id)}
                    >
                      <TableCell className="text-sm text-center">
                        {expandedInvoiceId === invoice.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-blue-600">{invoice.code}</TableCell>
                      <TableCell className="text-sm text-slate-700">{invoice.date}</TableCell>
                      <TableCell className="text-sm text-slate-900">{invoice.customer}</TableCell>
                      <TableCell className="text-sm text-slate-700 text-center">{invoice.items}</TableCell>
                      <TableCell className="text-sm text-slate-900 text-right">
                        {invoice.total.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">{getPaymentMethodLabel(invoice.paymentMethod)}</TableCell>
                      <TableCell className="text-sm text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          invoice.status === 'completed' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {invoice.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-slate-600 hover:text-slate-700 p-1">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Detail Row */}
                    {expandedInvoiceId === invoice.id && (
                      <TableRow>
                        <TableCell colSpan={9} className="px-4 py-4 bg-slate-50">
                          <div className="bg-white rounded-lg border border-slate-200 p-6">
                            {/* Invoice Info Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Mã hóa đơn:</span>
                                <span className="text-sm text-slate-900 font-medium">{invoice.code}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Mã NV:</span>
                                <span className="text-sm text-slate-900">{invoice.staffId} - {invoice.staffName}</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Mã KH:</span>
                                <span className="text-sm text-slate-900">{invoice.customerId}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Ngày lập:</span>
                                <span className="text-sm text-slate-900">{invoice.date}</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Mã bàn:</span>
                                <span className="text-sm text-slate-900">{invoice.tableId || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Mã phiếu đặt món:</span>
                                <span className="text-sm text-slate-900">{invoice.orderCode || '-'}</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Phương thức thanh toán:</span>
                                <span className="text-sm text-slate-900">{getPaymentMethodLabel(invoice.paymentMethod)}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40"></span>
                                <span className="text-sm text-slate-900"></span>
                              </div>
                              
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Mã khuyến mãi:</span>
                                <span className="text-sm text-slate-900">{invoice.promotionCode || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Điểm thưởng:</span>
                                <span className="text-sm text-green-600 font-medium">{invoice.rewardPoints || 0} điểm</span>
                              </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">STT</th>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Mặt hàng</th>
                                    <th className="px-4 py-2 text-center text-xs text-slate-600">ĐVT</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Số lượng</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Đơn giá</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Thành tiền</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {invoice.itemDetails.map((item, index) => (
                                    <tr key={item.id}>
                                      <td className="px-4 py-2 text-sm text-slate-600">{index + 1}</td>
                                      <td className="px-4 py-2 text-sm text-slate-900">{item.name}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.unit}</td>
                                      <td className="px-4 py-2 text-sm text-slate-900 text-right">{item.quantity}</td>
                                      <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                        {item.price.toLocaleString('vi-VN')}đ
                                      </td>
                                      <td className="px-4 py-2 text-sm text-slate-900 text-right font-medium">
                                        {item.total.toLocaleString('vi-VN')}đ
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-slate-50">
                                    <td colSpan={5} className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                                      Tổng cộng:
                                    </td>
                                    <td className="px-4 py-2 text-sm text-green-600 text-right font-semibold">
                                      {invoice.total.toLocaleString('vi-VN')}đ
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Hiển thị {filteredInvoices.length} hóa đơn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}