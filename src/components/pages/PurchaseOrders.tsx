import { useState } from 'react';
import { Search, Plus, Eye, ChevronDown, ChevronUp, Upload, X, Package, Trash2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PurchaseOrderItem {
  name: string;
  batchCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
  expiryDate?: string;
}

interface PurchaseOrder {
  id: number;
  code: string;
  date: string;
  supplier: string;
  items: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  status: 'received' | 'pending' | 'cancelled';
  staff: string;
  details?: {
    items: PurchaseOrderItem[];
  };
}

interface NewItem {
  batchCode: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: string;
  expiryDate: string;
  unitPrice: string;
  discount: string;
  discountType: 'percent' | 'amount'; // % hoặc VND
}

export function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['received', 'pending', 'cancelled']);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>(['paid', 'partial', 'unpaid']);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [addedItems, setAddedItems] = useState<PurchaseOrderItem[]>([]);

  // Form state for creating purchase order
  const [formData, setFormData] = useState({
    code: 'IM-260753',
    date: '',
    supplier: '',
    staff: '',
    note: '',
  });

  // Form state for adding new item
  const [newItem, setNewItem] = useState<NewItem>({
    batchCode: '',
    productId: '',
    productName: '',
    unit: '',
    quantity: '',
    expiryDate: '',
    unitPrice: '',
    discount: '0',
    discountType: 'percent',
  });

  // Mock data
  const purchaseOrders: PurchaseOrder[] = [
    { 
      id: 1, 
      code: 'PN001', 
      date: '2024-12-04 09:00', 
      supplier: 'Trung Nguyên', 
      items: 5, 
      totalAmount: 15000000, 
      paymentStatus: 'paid', 
      status: 'received',
      staff: 'Nguyễn Văn A',
      details: {
        items: [
          { name: 'Cà phê hạt Arabica', batchCode: 'LO-2024-001', quantity: 50, unit: 'kg', unitPrice: 250000, discount: 0, total: 12500000 },
          { name: 'Cà phê hạt Robusta', batchCode: 'LO-2024-002', quantity: 20, unit: 'kg', unitPrice: 125000, discount: 0, total: 2500000 },
        ]
      }
    },
    { 
      id: 2, 
      code: 'PN002', 
      date: '2024-12-04 10:30', 
      supplier: 'Vinamilk', 
      items: 3, 
      totalAmount: 8500000, 
      paymentStatus: 'partial', 
      status: 'received',
      staff: 'Trần Thị B',
      details: {
        items: [
          { name: 'Sữa tươi nguyên chất', batchCode: 'LO-2024-003', quantity: 100, unit: 'L', unitPrice: 35000, discount: 0, total: 3500000, expiryDate: '2025-01-15' },
          { name: 'Sữa đặc có đường', batchCode: 'LO-2024-004', quantity: 50, unit: 'hộp', unitPrice: 80000, discount: 0, total: 4000000, expiryDate: '2025-06-30' },
          { name: 'Kem tươi', batchCode: 'LO-2024-005', quantity: 20, unit: 'hộp', unitPrice: 50000, discount: 0, total: 1000000, expiryDate: '2025-02-01' },
        ]
      }
    },
    { 
      id: 3, 
      code: 'PN003', 
      date: '2024-12-04 14:00', 
      supplier: 'Thai Milk', 
      items: 4, 
      totalAmount: 6200000, 
      paymentStatus: 'unpaid', 
      status: 'pending',
      staff: 'Lê Văn C',
      details: {
        items: [
          { name: 'Trà xanh matcha', batchCode: 'LO-2024-006', quantity: 10, unit: 'kg', unitPrice: 420000, discount: 0, total: 4200000 },
          { name: 'Trà ô long', batchCode: 'LO-2024-007', quantity: 10, unit: 'kg', unitPrice: 200000, discount: 0, total: 2000000 },
        ]
      }
    },
  ];

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePaymentStatus = (status: string) => {
    setSelectedPaymentStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.includes(order.status);
    const matchesPayment = selectedPaymentStatuses.includes(order.paymentStatus);
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingCount = purchaseOrders.filter(o => o.status === 'pending').length;
  const unpaidCount = purchaseOrders.filter(o => o.paymentStatus === 'unpaid').length;

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) {
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const unitPrice = parseFloat(newItem.unitPrice);
    const discountValue = parseFloat(newItem.discount);
    
    // Calculate discount based on type
    let discountAmount = 0;
    if (newItem.discountType === 'percent') {
      discountAmount = (quantity * unitPrice * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
    
    const total = quantity * unitPrice - discountAmount;

    const item: PurchaseOrderItem = {
      name: newItem.productName,
      batchCode: newItem.batchCode,
      quantity,
      unit: newItem.unit,
      unitPrice,
      discount: discountAmount,
      total,
      expiryDate: newItem.expiryDate || undefined,
    };

    setAddedItems([...addedItems, item]);

    // Reset form
    setNewItem({
      batchCode: '',
      productId: '',
      productName: '',
      unit: '',
      quantity: '',
      expiryDate: '',
      unitPrice: '',
      discount: '0',
      discountType: 'percent',
    });
  };

  const handleRemoveItem = (index: number) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  const handleCreateOrder = () => {
    console.log('Creating order:', formData, 'Items:', addedItems);
    setShowCreateDialog(false);
    // Reset form
    setFormData({
      code: 'IM-260753',
      date: '',
      supplier: '',
      staff: '',
      note: '',
    });
    setAddedItems([]);
  };

  const totalQuantity = addedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = addedItems.reduce((sum, item) => sum + item.total, 0);

  // Mock products for dropdown
  const products = [
    { id: 'cf-arabica', name: 'Cà phê hạt Arabica', unit: 'kg' },
    { id: 'cf-robusta', name: 'Cà phê hạt Robusta', unit: 'kg' },
    { id: 'sua-tuoi', name: 'Sữa tươi nguyên chất', unit: 'L' },
    { id: 'sua-dac', name: 'Sữa đặc có đường', unit: 'hộp' },
    { id: 'kem-tuoi', name: 'Kem tươi', unit: 'hộp' },
    { id: 'tra-matcha', name: 'Trà xanh matcha', unit: 'kg' },
    { id: 'tra-olong', name: 'Trà ô long', unit: 'kg' },
  ];

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto space-y-4">
        <div>
          <h3 className="text-sm text-slate-900 mb-3">Bộ lọc</h3>
          
          {/* Date Range Filter */}
          <div className="mb-4">
            <label className="block mb-2 text-slate-700 text-xs">Thời gian</label>
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

          {/* Status Filter with Checkboxes */}
          <div className="mb-4">
            <label className="block mb-2 text-slate-700 text-xs">Trạng thái nhập hàng</label>
            <div className="space-y-2">
              {[
                { id: 'received', label: 'Đã nhận hàng', color: 'bg-green-500' },
                { id: 'pending', label: 'Chờ nhận hàng', color: 'bg-orange-500' },
                { id: 'cancelled', label: 'Đã hủy', color: 'bg-slate-500' },
              ].map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status.id}`}
                    checked={selectedStatuses.includes(status.id)}
                    onCheckedChange={() => toggleStatus(status.id)}
                  />
                  <Label htmlFor={`status-${status.id}`} className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Filter with Checkboxes */}
          <div className="mb-4">
            <label className="block mb-2 text-slate-700 text-xs">Trạng thái thanh toán</label>
            <div className="space-y-2">
              {[
                { id: 'paid', label: 'Đã thanh toán', color: 'bg-green-500' },
                { id: 'partial', label: 'Thanh toán 1 phần', color: 'bg-orange-500' },
                { id: 'unpaid', label: 'Chưa thanh toán', color: 'bg-red-500' },
              ].map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`payment-${status.id}`}
                    checked={selectedPaymentStatuses.includes(status.id)}
                    onCheckedChange={() => togglePaymentStatus(status.id)}
                  />
                  <Label htmlFor={`payment-${status.id}`} className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div>
          <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <Package className="w-3 h-3 mr-2" />
              Chờ nhận hàng ({pendingCount})
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <Search className="w-3 h-3 mr-2" />
              Chưa thanh toán ({unpaidCount})
            </Button>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div>
          <h4 className="text-sm text-slate-700 mb-3">Tổng quan</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng phiếu nhập:</span>
              <span className="text-slate-900">{filteredOrders.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng giá trị:</span>
              <span className="text-blue-600">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 mb-2">Nhập hàng</h1>
              <p className="text-sm text-slate-600">Quản lý phiếu nhập hàng từ nhà cung cấp</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4" />
                Tạo phiếu nhập
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu hoặc nhà cung cấp..."
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
                  <th className="px-4 py-3 text-left text-xs text-slate-600 w-12">STT</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Mã phiếu</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Ngày giờ</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Số mặt hàng</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Tổng giá trị</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Nhân viên</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">TT thanh toán</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order, index) => (
                  <>
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <button className="text-slate-400 hover:text-slate-600">
                          {expandedRow === order.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">{order.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{order.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{order.supplier}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{order.items}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{order.staff}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-50 text-green-700' 
                            : order.paymentStatus === 'partial'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-red-50 text-red-700'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Đã thanh toán' : order.paymentStatus === 'partial' ? 'Thanh toán 1 phần' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          order.status === 'received' 
                            ? 'bg-green-50 text-green-700' 
                            : order.status === 'pending'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {order.status === 'received' ? 'Đã nhận hàng' : order.status === 'pending' ? 'Chờ nhận hàng' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          className="text-blue-600 hover:text-blue-700 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Row */}
                    {expandedRow === order.id && order.details && (
                      <tr>
                        <td colSpan={10} className="bg-slate-50 px-4 py-4">
                          <div className="ml-8">
                            <h4 className="text-sm text-slate-700 mb-3">Chi tiết phiếu nhập</h4>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">STT</th>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Mã lô</th>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Tên hàng hóa</th>
                                    <th className="px-4 py-2 text-center text-xs text-slate-600">Số lượng</th>
                                    <th className="px-4 py-2 text-center text-xs text-slate-600">Đơn vị</th>
                                    <th className="px-4 py-2 text-center text-xs text-slate-600">HSD</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Đơn giá</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Giảm giá</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Thành tiền</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {order.details.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="px-4 py-2 text-sm text-slate-600">{idx + 1}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600">{item.batchCode}</td>
                                      <td className="px-4 py-2 text-sm text-slate-900">{item.name}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.quantity}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.unit}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.expiryDate || '-'}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-right">{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-right">{item.discount.toLocaleString('vi-VN')}đ</td>
                                      <td className="px-4 py-2 text-sm text-slate-900 text-right">{item.total.toLocaleString('vi-VN')}đ</td>
                                    </tr>
                                  ))}
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
              Hiển thị {filteredOrders.length} phiếu nhập
            </p>
          </div>
        </div>
      </div>

      {/* Create Purchase Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-6">
            <div className="flex items-center justify-between">
              <DialogTitle>Phiếu nhập hàng vào kho</DialogTitle>
              <button 
                onClick={() => setShowCreateDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4 px-6">
            {/* Thông tin phiếu nhập */}
            <div>
              <h3 className="text-sm text-slate-700 mb-4">Thông tin phiếu nhập</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Mã nhập hàng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="IM-260753"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Ngày nhập <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trung-nguyen">Trung Nguyên</SelectItem>
                      <SelectItem value="vinamilk">Vinamilk</SelectItem>
                      <SelectItem value="thai-milk">Thai Milk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Nhân viên nhập <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.staff}
                    onValueChange={(value) => setFormData({ ...formData, staff: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nguyen-van-a">Nguyễn Văn A</SelectItem>
                      <SelectItem value="tran-thi-b">Trần Thị B</SelectItem>
                      <SelectItem value="le-van-c">Lê Văn C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Danh sách hàng hóa */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-slate-700">Danh sách hàng hóa</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 text-teal-600 border-teal-600 hover:bg-teal-50"
                  onClick={handleAddItem}
                >
                  <Plus className="w-4 h-4" />
                  Thêm hàng hóa
                </Button>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '200px' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '50px' }} />
                  </colgroup>
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs text-slate-600">Mã lô</th>
                      <th className="px-2 py-2 text-left text-xs text-slate-600">Hàng hóa</th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600">ĐVT</th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600">SL nhập</th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600">HSD</th>
                      <th className="px-2 py-2 text-right text-xs text-slate-600">Đơn giá</th>
                      <th className="px-2 py-2 text-right text-xs text-slate-600">Giảm giá</th>
                      <th className="px-2 py-2 text-right text-xs text-slate-600">Thành tiền</th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Input Row */}
                    <tr className="bg-white">
                      <td className="px-2 py-2">
                        <Input
                          value={newItem.batchCode}
                          onChange={(e) => setNewItem({ ...newItem, batchCode: e.target.value })}
                          placeholder="LO001"
                          className="text-sm h-8 w-full"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Select
                          value={newItem.productId}
                          onValueChange={(value) => {
                            const product = products.find(p => p.id === value);
                            setNewItem({ 
                              ...newItem, 
                              productId: value,
                              productName: product?.name || '',
                              unit: product?.unit || '',
                            });
                          }}
                        >
                          <SelectTrigger className="text-sm h-8 w-full">
                            <SelectValue placeholder="Chọn hàng hóa" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={newItem.unit}
                          readOnly
                          className="text-sm h-8 bg-slate-50 text-center w-full"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                          placeholder="0"
                          className="text-sm h-8 text-center w-full"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="date"
                          value={newItem.expiryDate}
                          onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                          className="text-sm h-8 w-full"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={newItem.unitPrice}
                          onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                          placeholder="0"
                          className="text-sm h-8 text-right w-full"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={newItem.discount}
                            onChange={(e) => setNewItem({ ...newItem, discount: e.target.value })}
                            placeholder="0"
                            className="text-sm h-8 text-right flex-1"
                          />
                          <Select
                            value={newItem.discountType}
                            onValueChange={(value: 'percent' | 'amount') => setNewItem({ ...newItem, discountType: value })}
                          >
                            <SelectTrigger className="text-sm h-8 w-14">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percent">%</SelectItem>
                              <SelectItem value="amount">đ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="text-sm text-slate-600 text-right w-full">
                          {(() => {
                            const qty = parseFloat(newItem.quantity) || 0;
                            const price = parseFloat(newItem.unitPrice) || 0;
                            const disc = parseFloat(newItem.discount) || 0;
                            const discAmount = newItem.discountType === 'percent' 
                              ? (qty * price * disc) / 100 
                              : disc;
                            const total = qty * price - discAmount;
                            return total > 0 ? `${total.toLocaleString('vi-VN')}đ` : '0đ';
                          })()}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button className="text-slate-300 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Added Items */}
                    {addedItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-sm text-slate-600">{item.batchCode}</td>
                        <td className="px-2 py-2 text-sm text-slate-900 truncate" title={item.name}>{item.name}</td>
                        <td className="px-2 py-2 text-sm text-slate-600 text-center">{item.unit}</td>
                        <td className="px-2 py-2 text-sm text-slate-600 text-center">{item.quantity}</td>
                        <td className="px-2 py-2 text-sm text-slate-600 text-center">{item.expiryDate || '-'}</td>
                        <td className="px-2 py-2 text-sm text-slate-600 text-right">{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                        <td className="px-2 py-2 text-sm text-slate-600 text-right">{item.discount.toLocaleString('vi-VN')}đ</td>
                        <td className="px-2 py-2 text-sm text-slate-900 text-right">{item.total.toLocaleString('vi-VN')}đ</td>
                        <td className="px-2 py-2 text-center">
                          <button 
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Summary */}
              <div className="mt-3 flex justify-end gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Tổng số lượng:</span>
                  <span className="text-slate-900">{totalQuantity} sản phẩm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Tổng giá trị:</span>
                  <span className="text-blue-600">{totalValue.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs text-slate-700 mb-2">Ghi chú</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Nhập ghi chú về phiếu nhập..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
            >
              Hủy
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleCreateOrder}
            >
              Tạo phiếu nhập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Excel Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Import phiếu nhập từ Excel</DialogTitle>
              <button 
                onClick={() => setShowImportDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="py-6">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-1">Kéo thả file Excel vào đây</p>
              <p className="text-xs text-slate-400 mb-4">hoặc</p>
              <Button variant="outline" size="sm">
                Chọn file từ máy tính
              </Button>
              <p className="text-xs text-slate-400 mt-4">Hỗ trợ: .xlsx, .xls (tối đa 10MB)</p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(false)}
            >
              Hủy
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}