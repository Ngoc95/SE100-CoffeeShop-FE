import { useState } from 'react';
import { Search, Plus, Eye, ChevronDown, ChevronUp, Upload, RotateCcw, X, Package, Trash2 } from 'lucide-react';
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

interface PurchaseReturnItem {
  name: string;
  batchCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  reason: string;
}

interface ReturnItemForm {
  product: string;
  batch: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  importDate: string;
  total: number;
  reason: string;
}

interface PurchaseReturn {
  id: number;
  code: string;
  purchaseCode: string;
  date: string;
  supplier: string;
  items: number;
  returnAmount: number;
  reason: string;
  status: 'completed' | 'pending' | 'rejected';
  details?: {
    items: PurchaseReturnItem[];
  };
}

export function PurchaseReturns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['completed', 'pending', 'rejected']);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state for creating return
  const [formData, setFormData] = useState({
    code: 'RT-260753',
    date: '',
    supplier: '',
    reason: '',
    note: '',
  });

  // State for return items
  const [returnItems, setReturnItems] = useState<ReturnItemForm[]>([]);

  // Mock data
  const returns: PurchaseReturn[] = [
    { 
      id: 1, 
      code: 'THN001', 
      purchaseCode: 'PN025', 
      date: '2024-12-04 11:00', 
      supplier: 'Trung Nguyên', 
      items: 2, 
      returnAmount: 1200000, 
      reason: 'Hàng lỗi', 
      status: 'completed',
      details: {
        items: [
          { name: 'Cà phê hạt Arabica', batchCode: 'LO-2024-001', quantity: 5, unit: 'kg', unitPrice: 250000, total: 1250000, reason: 'Hạt bị mốc' },
          { name: 'Cà phê hạt Robusta', batchCode: 'LO-2024-002', quantity: 2, unit: 'kg', unitPrice: 125000, total: 250000, reason: 'Chất lượng không đạt' },
        ]
      }
    },
    { 
      id: 2, 
      code: 'THN002', 
      purchaseCode: 'PN028', 
      date: '2024-12-04 15:30', 
      supplier: 'Vinamilk', 
      items: 1, 
      returnAmount: 850000, 
      reason: 'Giao nhầm sản phẩm', 
      status: 'pending',
      details: {
        items: [
          { name: 'Sữa đặc có đường (sai loại)', batchCode: 'LO-2024-004', quantity: 10, unit: 'hộp', unitPrice: 85000, total: 850000, reason: 'Đặt sữa không đường nhưng giao có đường' },
        ]
      }
    },
    { 
      id: 3, 
      code: 'THN003', 
      purchaseCode: 'PN030', 
      date: '2024-12-03 14:00', 
      supplier: 'Thai Milk', 
      items: 2, 
      returnAmount: 620000, 
      reason: 'Hết hạn sử dụng', 
      status: 'rejected',
      details: {
        items: [
          { name: 'Trà xanh matcha', batchCode: 'LO-2024-008', quantity: 1, unit: 'kg', unitPrice: 420000, total: 420000, reason: 'HSD còn 2 ngày' },
          { name: 'Trà ô long', batchCode: 'LO-2024-009', quantity: 1, unit: 'kg', unitPrice: 200000, total: 200000, reason: 'Bao bì bị rách' },
        ]
      }
    },
  ];

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ret.purchaseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.includes(ret.status);
    return matchesSearch && matchesStatus;
  });

  const totalReturn = filteredReturns.reduce((sum, ret) => sum + ret.returnAmount, 0);
  const pendingCount = returns.filter(r => r.status === 'pending').length;
  const completedCount = returns.filter(r => r.status === 'completed').length;

  const handleCreateReturn = () => {
    console.log('Creating return:', formData);
    setShowCreateDialog(false);
    // Reset form
    setFormData({
      code: 'RT-260753',
      date: '',
      supplier: '',
      reason: '',
      note: '',
    });
    setReturnItems([]);
  };

  const handleAddReturnItem = () => {
    const newItem: ReturnItemForm = {
      product: '',
      batch: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      importDate: '',
      total: 0,
      reason: '',
    };
    setReturnItems([...returnItems, newItem]);
  };

  const handleRemoveReturnItem = (index: number) => {
    setReturnItems(returnItems.filter((_, i) => i !== index));
  };

  const handleUpdateReturnItem = (index: number, field: keyof ReturnItemForm, value: any) => {
    const updatedItems = [...returnItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setReturnItems(updatedItems);
  };

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
            <label className="block mb-2 text-slate-700 text-xs">Trạng thái</label>
            <div className="space-y-2">
              {[
                { id: 'completed', label: 'Đã trả hàng', color: 'bg-green-500' },
                { id: 'pending', label: 'Chờ xử lý', color: 'bg-orange-500' },
                { id: 'rejected', label: 'Từ chối', color: 'bg-red-500' },
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
        </div>

        <Separator />

        {/* Quick Filters */}
        <div>
          <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <RotateCcw className="w-3 h-3 mr-2" />
              Chờ xử lý ({pendingCount})
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <RotateCcw className="w-3 h-3 mr-2" />
              Đã trả hàng ({completedCount})
            </Button>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div>
          <h4 className="text-sm text-slate-700 mb-3">Tổng quan</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng phiếu trả:</span>
              <span className="text-slate-900">{filteredReturns.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng giá trị:</span>
              <span className="text-red-600">{totalReturn.toLocaleString('vi-VN')}đ</span>
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
              <h1 className="text-slate-900 mb-2">Trả hàng nhập</h1>
              <p className="text-sm text-slate-600">Quản lý phiếu trả hàng cho nhà cung cấp</p>
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
                Tạo phiếu trả
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
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Mã phiếu trả</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Phiếu nhập gốc</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Ngày giờ</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Số mặt hàng</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Giá trị trả</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Lý do</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.map((ret, index) => (
                  <>
                    <tr 
                      key={ret.id} 
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === ret.id ? null : ret.id)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <button className="text-slate-400 hover:text-slate-600">
                          {expandedRow === ret.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">{ret.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{ret.purchaseCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{ret.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{ret.supplier}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{ret.items}</td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">
                        {ret.returnAmount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{ret.reason}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          ret.status === 'completed' 
                            ? 'bg-green-50 text-green-700' 
                            : ret.status === 'pending'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-red-50 text-red-700'
                        }`}>
                          {ret.status === 'completed' ? 'Đã trả hàng' : ret.status === 'pending' ? 'Chờ xử lý' : 'Từ chối'}
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
                    {expandedRow === ret.id && ret.details && (
                      <tr>
                        <td colSpan={10} className="bg-slate-50 px-4 py-4">
                          <div className="ml-8">
                            <h4 className="text-sm text-slate-700 mb-3">Chi tiết phiếu trả hàng</h4>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">STT</th>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Mã lô</th>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Tên hàng hóa</th>
                                    <th className="px-4 py-2 text-center text-xs text-slate-600">Số lượng</th>
                                    <th className="px-4 py-2 text-center text-xs text-slate-600">Đơn vị</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Đơn giá</th>
                                    <th className="px-4 py-2 text-right text-xs text-slate-600">Thành tiền</th>
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Lý do trả</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {ret.details.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="px-4 py-2 text-sm text-slate-600">{idx + 1}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600">{item.batchCode}</td>
                                      <td className="px-4 py-2 text-sm text-slate-900">{item.name}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.quantity}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-center">{item.unit}</td>
                                      <td className="px-4 py-2 text-sm text-slate-600 text-right">{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                                      <td className="px-4 py-2 text-sm text-red-600 text-right">{item.total.toLocaleString('vi-VN')}đ</td>
                                      <td className="px-4 py-2 text-sm text-slate-600">{item.reason}</td>
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
              Hiển thị {filteredReturns.length} phiếu trả hàng
            </p>
          </div>
        </div>
      </div>

      {/* Import Excel Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md [&>button]:!hidden">
          <style dangerouslySetInnerHTML={{__html: `
            [data-slot="dialog-content"] button.absolute.top-4.right-4:not([data-custom-close]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          `}} />
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Import phiếu trả từ Excel</DialogTitle>
              <button 
                data-custom-close="true"
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

      {/* Create Return Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto [&>button]:!hidden">
          <style dangerouslySetInnerHTML={{__html: `
            [data-slot="dialog-content"] button.absolute.top-4.right-4:not([data-custom-close]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          `}} />
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Phiếu trả hàng nhập</DialogTitle>
              <button 
                data-custom-close="true"
                onClick={() => setShowCreateDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Thông tin phiếu trả */}
            <div>
              <h3 className="text-sm text-slate-700 mb-4">Thông tin phiếu trả</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Mã trả hàng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="RT-260753"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Ngày trả <span className="text-red-500">*</span>
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
                    Lý do trả <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lý do" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hang-loi">Hàng lỗi</SelectItem>
                      <SelectItem value="giao-nham">Giao nhầm sản phẩm</SelectItem>
                      <SelectItem value="het-han">Hết hạn sử dụng</SelectItem>
                      <SelectItem value="chat-luong">Chất lượng không đạt</SelectItem>
                      <SelectItem value="khac">Lý do khác</SelectItem>
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
                  onClick={handleAddReturnItem}
                >
                  <Plus className="w-4 h-4" />
                  Thêm hàng hóa
                </Button>
              </div>
              
              {returnItems.length === 0 ? (
                /* Empty State */
                <div className="border border-slate-200 rounded-lg p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Package className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm mb-1">Chưa có hàng hóa nào</p>
                  <p className="text-slate-400 text-xs">Nhấn "Thêm hàng hóa" để chọn sản phẩm cần trả</p>
                </div>
              ) : (
                /* Table with items */
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs text-slate-600 w-12">STT</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-600 min-w-[150px]">Hàng hóa</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-600 min-w-[100px]">Lô hàng</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-600 w-20">ĐVT</th>
                          <th className="px-3 py-2 text-center text-xs text-slate-600 w-20">SL trả</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-600 min-w-[100px]">Giá nhập</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-600 min-w-[110px]">Ngày nhập</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-600 min-w-[100px]">Thành tiền</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-600 min-w-[120px]">Lý do trả</th>
                          <th className="px-3 py-2 text-center text-xs text-slate-600 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {returnItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-slate-600">{index + 1}</td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="Nhập tên hàng hóa"
                                value={item.product}
                                onChange={(e) => handleUpdateReturnItem(index, 'product', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="Mã lô"
                                value={item.batch}
                                onChange={(e) => handleUpdateReturnItem(index, 'batch', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="ĐVT"
                                value={item.unit}
                                onChange={(e) => handleUpdateReturnItem(index, 'unit', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.quantity || ''}
                                onChange={(e) => handleUpdateReturnItem(index, 'quantity', Number(e.target.value))}
                                className="text-sm text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.unitPrice || ''}
                                onChange={(e) => handleUpdateReturnItem(index, 'unitPrice', Number(e.target.value))}
                                className="text-sm text-right"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="date"
                                value={item.importDate}
                                onChange={(e) => handleUpdateReturnItem(index, 'importDate', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2 text-sm text-slate-900 text-right">
                              {item.total.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="Lý do"
                                value={item.reason}
                                onChange={(e) => handleUpdateReturnItem(index, 'reason', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => handleRemoveReturnItem(index)}
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
                </div>
              )}
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs text-slate-700 mb-2">Ghi chú</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Nhập ghi chú về phiếu trả hàng..."
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
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreateReturn}
            >
              Tạo phiếu trả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}