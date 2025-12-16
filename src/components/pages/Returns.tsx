import { useState } from 'react';
import { Search, RotateCcw, Eye, ChevronDown, ChevronRight, CheckCircle, Clock, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface ReturnItem {
  id: number;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReturnRecord {
  id: number;
  code: string;
  invoiceCode: string;
  date: string;
  customer: string;
  items: number;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'completed' | 'rejected';
  paymentMethod: string;
  staff: string;
  note: string;
  itemDetails: ReturnItem[];
}

export function Returns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'completed', 'rejected']);
  const [expandedReturnId, setExpandedReturnId] = useState<number | null>(null);
  
  // Sort states
  type SortField = "code" | "invoiceCode" | "date" | "customer" | "items" | "refundAmount" | "reason" | "status" | null;
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // Mock data with detailed items
  const [returns] = useState<ReturnRecord[]>([
    { 
      id: 1, 
      code: 'TH001', 
      invoiceCode: 'HD125', 
      date: '2024-12-04 15:30', 
      customer: 'Nguyễn Văn A', 
      items: 1, 
      refundAmount: 35000, 
      reason: 'Sản phẩm lỗi', 
      status: 'completed',
      paymentMethod: 'Tiền mặt',
      staff: 'NV001 - Trần Văn B',
      note: 'Khách phát hiện có vật lạ trong ly',
      itemDetails: [
        { id: 1, productCode: 'CF001', productName: 'Cà phê sữa đá', quantity: 1, price: 35000, total: 35000 }
      ]
    },
    { 
      id: 2, 
      code: 'TH002', 
      invoiceCode: 'HD142', 
      date: '2024-12-04 16:15', 
      customer: 'Khách lẻ', 
      items: 2, 
      refundAmount: 60000, 
      reason: 'Khách đổi ý', 
      status: 'completed',
      paymentMethod: 'Chuyển khoản',
      staff: 'NV002 - Nguyễn Thị C',
      note: 'Khách đặt nhầm món',
      itemDetails: [
        { id: 1, productCode: 'CF002', productName: 'Trà sữa trân châu', quantity: 1, price: 40000, total: 40000 },
        { id: 2, productCode: 'CF003', productName: 'Sinh tố bơ', quantity: 1, price: 20000, total: 20000 }
      ]
    },
    { 
      id: 3, 
      code: 'TH003', 
      invoiceCode: 'HD158', 
      date: '2024-12-04 17:00', 
      customer: 'Trần Thị B', 
      items: 1, 
      refundAmount: 25000, 
      reason: 'Giao nhầm món', 
      status: 'pending',
      paymentMethod: 'Tiền mặt',
      staff: 'NV003 - Lê Văn D',
      note: 'Đang chờ xác nhận từ quản lý',
      itemDetails: [
        { id: 1, productCode: 'CF004', productName: 'Matcha latte', quantity: 1, price: 25000, total: 25000 }
      ]
    },
  ]);

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
        aValue = new Date(a.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3')).getTime();
        bValue = new Date(b.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3')).getTime();
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

  const totalRefund = filteredReturns.reduce((sum, ret) => sum + ret.refundAmount, 0);
  const pendingCount = returns.filter(r => r.status === 'pending').length;
  const completedCount = returns.filter(r => r.status === 'completed').length;
  const rejectedCount = returns.filter(r => r.status === 'rejected').length;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'completed':
        return 'Đã hoàn tiền';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'pending':
        return 'bg-orange-50 text-orange-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto hidden lg:block">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Trạng thái</h3>
            <div className="space-y-2">
              {[
                { id: 'pending', label: 'Chờ xử lý', color: 'bg-orange-500' },
                { id: 'completed', label: 'Đã hoàn tiền', color: 'bg-green-500' },
                { id: 'rejected', label: 'Từ chối', color: 'bg-red-500' },
              ].map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={status.id}
                    checked={selectedStatuses.includes(status.id)}
                    onCheckedChange={() => toggleStatus(status.id)}
                  />
                  <Label htmlFor={status.id} className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Clock className="w-3 h-3 mr-2" />
                Chờ xử lý ({pendingCount})
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <CheckCircle className="w-3 h-3 mr-2" />
                Đã hoàn tiền ({completedCount})
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <XCircle className="w-3 h-3 mr-2" />
                Từ chối ({rejectedCount})
              </Button>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h4 className="text-sm text-slate-900 mb-3">Tổng quan</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng đơn trả:</span>
                <span className="text-slate-900">{filteredReturns.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng hoàn tiền:</span>
                <span className="text-red-600">{totalRefund.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Trả hàng</h1>
          <p className="text-sm text-slate-600">Quản lý đơn trả hàng và hoàn tiền</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn trả, hóa đơn hoặc khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-blue-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 rounded-xl">
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
                      Mã trả hàng
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
                      Số SP
                      {getSortIcon("items")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("refundAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Hoàn tiền
                      {getSortIcon("refundAmount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("reason")}
                  >
                    <div className="flex items-center">
                      Lý do
                      {getSortIcon("reason")}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((ret, index) => (
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
                      <TableCell className="text-sm text-red-600 text-right">
                        {ret.refundAmount.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">{ret.reason}</TableCell>
                      <TableCell className="text-sm text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(ret.status)}`}>
                          {getStatusLabel(ret.status)}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Detail Row */}
                    {expandedReturnId === ret.id && (
                      <TableRow>
                        <TableCell colSpan={10} className="px-4 py-4 bg-slate-50">
                          <div className="bg-white rounded-lg border border-slate-200 p-6">
                            {/* Return Info Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Mã trả hàng:</span>
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
                                <span className="text-sm text-slate-600 w-40">Nhân viên xử lý:</span>
                                <span className="text-sm text-slate-900">{ret.staff}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Phương thức hoàn:</span>
                                <span className="text-sm text-slate-900">{ret.paymentMethod}</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Lý do trả hàng:</span>
                                <span className="text-sm text-slate-900">{ret.reason}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-sm text-slate-600 w-40">Trạng thái:</span>
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
                              <table className="w-full">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Mã SP</th>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Tên sản phẩm</th>
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
                                      <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.quantity}</td>
                                      <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                        {item.price.toLocaleString('vi-VN')}đ
                                      </td>
                                      <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                        {item.total.toLocaleString('vi-VN')}đ
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-slate-50">
                                    <td colSpan={4} className="px-4 py-2 text-sm text-slate-900 text-right">
                                      Tổng hoàn tiền:
                                    </td>
                                    <td className="px-4 py-2 text-sm text-red-600 text-right">
                                      {ret.refundAmount.toLocaleString('vi-VN')}đ
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Action Buttons */}
                            {ret.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                                  Từ chối
                                </button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                                  Xác nhận hoàn tiền
                                </button>
                              </div>
                            )}

                            {ret.status === 'completed' && (
                              <div className="flex justify-end">
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  Đã hoàn tiền thành công
                                </div>
                              </div>
                            )}

                            {ret.status === 'rejected' && (
                              <div className="flex justify-end">
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                                  <XCircle className="w-4 h-4" />
                                  Đã từ chối trả hàng
                                </div>
                              </div>
                            )}
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
              Hiển thị {filteredReturns.length} đơn trả hàng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
