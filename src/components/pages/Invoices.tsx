import { useState } from 'react';
import { Search, FileText, Eye, Download, ChevronDown, ChevronUp, Receipt, CreditCard } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';

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
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['completed', 'cancelled']);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['cash', 'transfer', 'momo']);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);

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

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(invoice.status);
    const matchesPayment = selectedPaymentMethods.length === 0 || selectedPaymentMethods.includes(invoice.paymentMethod);
    return matchesSearch && matchesStatus && matchesPayment;
  });

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
          {/* Date Range - Keep as dropdown for now */}
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
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
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã hóa đơn hoặc khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-slate-600 w-12"></th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Mã HĐ</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Ngày giờ</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Khách hàng</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Số mặt hàng</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">PT thanh toán</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => (
                  <>
                    <tr 
                      key={invoice.id} 
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleExpand(invoice.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        {expandedInvoiceId === invoice.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">{invoice.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{invoice.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{invoice.customer}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{invoice.items}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">
                        {invoice.total.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{getPaymentMethodLabel(invoice.paymentMethod)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          invoice.status === 'completed' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {invoice.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-slate-600 hover:text-slate-700 p-1">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Detail Row */}
                    {expandedInvoiceId === invoice.id && (
                      <tr>
                        <td colSpan={9} className="px-4 py-4 bg-slate-50">
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
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
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