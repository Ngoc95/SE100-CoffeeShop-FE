import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, CheckCircle, Clock, XCircle, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { getOrders } from '../../api/order';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subQuarters, subYears } from 'date-fns';
import { CustomerTimeFilter } from '../reports/CustomerTimeFilter';

interface ReturnItem {
  id: number;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
  reason?: string;
}

interface ReturnRecord {
  id: number;
  code: string;
  invoiceCode: string;
  date: string;
  customer: string;
  items: number;
  refundAmount: number; // Total value of canceled items
  reason: string;
  status: 'pending' | 'completed' | 'rejected' | 'canceled';
  paymentMethod: string;
  staff: string;
  note: string;
  itemDetails: ReturnItem[];
}

export function Returns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['completed', 'cancelled']);
  const [expandedReturnId, setExpandedReturnId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort states
  type SortField = "code" | "invoiceCode" | "date" | "customer" | "items" | "refundAmount" | "reason" | "status" | null;
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // Data state
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Date states
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('this-month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  // Handle preset change
  const handleTimePresetChange = (preset: string) => {
    setTimePreset(preset);
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    switch (preset) {
      case 'today':
        start = now;
        end = now;
        break;
      case 'yesterday':
        start = subDays(now, 1);
        end = subDays(now, 1);
        break;
      case 'this-week':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        start = new Date(now.setDate(diff));
        end = new Date(now.setDate(diff + 6));
        break;
      case 'last-week':
        const lastWeek = subDays(now, 7);
        const lastDay = lastWeek.getDay();
        const lastDiff = lastWeek.getDate() - lastDay + (lastDay === 0 ? -6 : 1);
        start = new Date(lastWeek.setDate(lastDiff));
        end = new Date(lastWeek.setDate(lastDiff + 6));
        break;
      case 'last-7-days':
        start = subDays(now, 6); // inclusive today
        end = now;
        break;
      case 'this-month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'last-30-days':
        start = subDays(now, 29);
        end = now;
        break;
      case 'this-quarter':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'last-quarter':
        const lastQuarter = subQuarters(now, 1);
        start = startOfQuarter(lastQuarter);
        end = endOfQuarter(lastQuarter);
        break;
      case 'this-year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'last-year':
        const lastYear = subYears(now, 1);
        start = startOfYear(lastYear);
        end = endOfYear(lastYear);
        break;
    }
    setDateFrom(start);
    setDateTo(end);
  };

  // Fetch data
  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const params: any = { itemStatus: 'canceled' };
      
      if (dateFrom) params.fromDate = format(dateFrom, 'yyyy-MM-dd');
      if (dateTo) params.toDate = format(dateTo, 'yyyy-MM-dd');

      const response = await getOrders(params);
      const apiOrders = response.data?.metaData?.orders || [];
      
      const mappedReturns: ReturnRecord[] = apiOrders.map((order: any) => {
        // Find finance transaction code for REFUND/EXPENSE (typeId 2 usually)
        // If not found, fallback to order info or generic code
        const refundTransaction = order.transactions?.find((t: any) => t.category?.typeId === 2); // Expense
        
        // Filter only canceled items for the details view
        const canceledItems = (order.orderItems || []).filter((item: any) => item.status === 'canceled' || item.status === 'cancelled');
        
        const returnTotal = canceledItems.reduce((sum: number, item: any) => sum + Number(item.totalPrice), 0);

        return {
          id: order.id,
          code: refundTransaction ? refundTransaction.code : `YC${order.id}`, // Use transaction code or fallback
          invoiceCode: order.orderCode,
          date: new Date(order.createdAt).toLocaleString('vi-VN'),
          customer: order.customer?.name || 'Khách lẻ',
          items: canceledItems.length,
          refundAmount: refundTransaction ? Number(refundTransaction.amount) : returnTotal, // Prefer actual transaction amount
          reason: 'Khách hủy món',
          status: order.status,
          paymentMethod: order.paymentMethod || '-',
          staff: order.staff?.fullName || `NV${order.staffId}`,
          note: order.notes || '',
          itemDetails: canceledItems.map((item: any) => ({
            id: item.id,
            productCode: `SP${item.item?.id || item.itemId}`,
            productName: item.name,
            unit: item.item?.unit?.name || 'Phần',
            quantity: item.quantity,
            price: Number(item.unitPrice),
            total: Number(item.totalPrice),
            reason: item.note || 'Hủy món'
          }))
        };
      });
      
      setReturns(mappedReturns);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Không thể tải danh sách trả hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [dateFrom, dateTo]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleExpand = (returnId: number) => {
    setExpandedReturnId(expandedReturnId === returnId ? null : returnId);
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

  let filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ret.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(ret.status);
    return matchesSearch && matchesStatus;
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredReturns = [...filteredReturns].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "code") {
        aValue = a.code;
        bValue = b.code;
      } else if (sortField === "invoiceCode") {
        aValue = a.invoiceCode;
        bValue = b.invoiceCode;
      } else if (sortField === "date") {
        aValue = a.date;
        bValue = b.date;
      } else if (sortField === "customer") {
        aValue = a.customer;
        bValue = b.customer;
      } else if (sortField === "items") {
        aValue = a.items;
        bValue = b.items;
      } else if (sortField === "refundAmount") {
        aValue = a.refundAmount;
        bValue = b.refundAmount;
      } else if (sortField === "reason") {
        aValue = a.reason;
        bValue = b.reason;
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

  // Calculate totals
  const totalCanceledAmount = filteredReturns.reduce((sum, ret) => sum + ret.refundAmount, 0);
  const totalCanceledItems = filteredReturns.reduce((sum, ret) => sum + ret.items, 0);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
      case 'canceled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Trả hàng</h1>
          <p className="text-slate-600 text-sm">
            Quản lý đơn trả hàng và các món bị hủy
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, hóa đơn hoặc khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {selectedStatuses.length < 2 && (
                  <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Time Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Thời gian</Label>
                    <CustomerTimeFilter
                      dateRangeType={dateRangeType}
                      timePreset={timePreset}
                      dateFrom={dateFrom}
                      dateTo={dateTo}
                      onDateRangeTypeChange={setDateRangeType}
                      onTimePresetChange={handleTimePresetChange}
                      onDateFromChange={setDateFrom}
                      onDateToChange={setDateTo}
                    />
                  </div>

                  {/* Status Filters */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Trạng thái (Đơn hàng)</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      {[
                        { id: 'completed', label: 'Hoàn thành' },
                        { id: 'cancelled', label: 'Đã hủy' },
                      ].map((status) => (
                        <div key={status.id} className="flex items-center space-x-2">
                          <Checkbox  
                            id={status.id}
                            checked={selectedStatuses.includes(status.id)}
                            onCheckedChange={() => toggleStatus(status.id)}
                            className="border-slate-300"
                          />
                          <Label htmlFor={status.id} className="text-sm text-slate-700 cursor-pointer flex items-center gap-2 font-normal">
                            {status.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Thống kê</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tổng đơn:</span>
                        <span className="font-medium text-slate-900">{filteredReturns.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Sản phẩm hủy:</span>
                        <span className="font-medium text-red-600">{totalCanceledItems}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-slate-600">Tổng tiền hủy:</span>
                        <span className="font-medium text-blue-600 text-xs">{totalCanceledAmount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {selectedStatuses.length < 2 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStatuses(['completed', 'cancelled']);
                        setSearchTerm("");
                        setDateRangeType('preset');
                        handleTimePresetChange('this-month');
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Xóa bộ lọc
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách đơn có món trả/hủy ({filteredReturns.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-12 text-sm"></TableHead>
                  <TableHead className="w-16 text-sm text-center">STT</TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã trả/hủy
                      {getSortIcon("code")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("invoiceCode")}
                  >
                    <div className="flex items-center">
                      Hóa đơn gốc
                      {getSortIcon("invoiceCode")}
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
                      Số món hủy
                      {getSortIcon("items")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("refundAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Giá trị hủy
                      {getSortIcon("refundAmount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      Trạng thái ĐH
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReturns.map((ret, index) => (
                    <>
                      <TableRow 
                        key={ret.id} 
                        className="hover:bg-blue-100/50 cursor-pointer"
                        onClick={() => toggleExpand(ret.id)}
                      >
                        <TableCell className="text-sm text-center">
                          {expandedReturnId === ret.id ? (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700 text-center">{index + 1}</TableCell>
                        <TableCell className="text-sm text-blue-600">{ret.code}</TableCell>
                        <TableCell className="text-sm text-slate-700">{ret.invoiceCode}</TableCell>
                        <TableCell className="text-sm text-slate-700">{ret.date}</TableCell>
                        <TableCell className="text-sm text-slate-900">{ret.customer}</TableCell>
                        <TableCell className="text-sm text-slate-700 text-center">{ret.items}</TableCell>
                        <TableCell className="text-sm text-red-600 text-right font-medium">
                          {ret.refundAmount.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(ret.status)}`}>
                            {getStatusLabel(ret.status)}
                          </span>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Detail Row */}
                      {expandedReturnId === ret.id && (
                        <TableRow>
                          <TableCell colSpan={9} className="px-4 py-4 bg-slate-50">
                            <div className="bg-white rounded-lg border border-slate-200 p-6 w-full">
                              {/* Return Info Grid */}
                              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                                <div className="flex gap-2">
                                  <span className="text-sm text-slate-600 w-40">Mã trả/hủy:</span>
                                  <span className="text-sm text-slate-900 font-medium">{ret.code}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-sm text-slate-600 w-40">Hóa đơn gốc:</span>
                                  <span className="text-sm text-blue-600">{ret.invoiceCode}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <span className="text-sm text-slate-600 w-40">Ngày giờ:</span>
                                  <span className="text-sm text-slate-900">{ret.date}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-sm text-slate-600 w-40">Khách hàng:</span>
                                  <span className="text-sm text-slate-900">{ret.customer}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <span className="text-sm text-slate-600 w-40">Nhân viên:</span>
                                  <span className="text-sm text-slate-900">{ret.staff}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-sm text-slate-600 w-40">Phương thức:</span>
                                  <span className="text-sm text-slate-900">{ret.paymentMethod}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <span className="text-sm text-slate-600 w-40">Trạng thái ĐH:</span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(ret.status)}`}>
                                    {getStatusLabel(ret.status)}
                                  </span>
                                </div>
                                
                                <div className="flex gap-2 col-span-2">
                                  <span className="text-sm text-slate-600 w-40">Ghi chú:</span>
                                  <span className="text-sm text-slate-900">{ret.note || '-'}</span>
                                </div>
                              </div>

                              {/* Items Table */}
                              <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                                  <h4 className="text-sm font-medium text-slate-700">Chi tiết món hủy</h4>
                                </div>
                                <table className="w-full">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs text-slate-600">Mã SP</th>
                                      <th className="px-4 py-2 text-left text-xs text-slate-600">Tên sản phẩm</th>
                                      <th className="px-4 py-2 text-center text-xs text-slate-600">ĐVT</th>
                                      <th className="px-4 py-2 text-center text-xs text-slate-600">Số lượng</th>
                                      <th className="px-4 py-2 text-right text-xs text-slate-600">Đơn giá</th>
                                      <th className="px-4 py-2 text-right text-xs text-slate-600">Thành tiền</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {ret.itemDetails.map((item) => (
                                      <tr key={item.id}>
                                        <td className="px-4 py-2 text-sm text-slate-600">{item.productCode}</td>
                                        <td className="px-4 py-2 text-sm text-slate-900">{item.productName}</td>
                                         <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.unit}</td>
                                        <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.quantity}</td>
                                        <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                          {item.price.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-4 py-2 text-sm text-slate-900 text-right font-medium">
                                          {item.total.toLocaleString('vi-VN')}đ
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="bg-slate-50">
                                      <td colSpan={5} className="px-4 py-2 text-sm text-slate-900 text-right font-medium">
                                        Tổng tiền hủy:
                                      </td>
                                      <td className="px-4 py-2 text-sm text-red-600 text-right font-bold">
                                        {ret.refundAmount.toLocaleString('vi-VN')}đ
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
