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

interface WriteOffDetail {
  name: string;
  batchCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  reason: string;
}

interface WriteOff {
  id: number;
  code: string;
  date: string;
  items: number;
  totalValue: number;
  reason: string;
  approvedBy: string | null;
  status: 'approved' | 'pending' | 'rejected';
  details?: {
    items: WriteOffDetail[];
  };
}

interface WriteOffItemForm {
  product: string;
  batch: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  reason: string;
}

export function WriteOffs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['approved', 'pending', 'rejected']);
  const [selectedReasons, setSelectedReasons] = useState<string[]>(['het-han', 'hu-hong', 'mat-mat', 'khac']);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state for creating write-off
  const [formData, setFormData] = useState({
    code: 'XH-260753',
    date: '',
    reason: '',
    note: '',
  });

  // State for write-off items
  const [writeOffItems, setWriteOffItems] = useState<WriteOffItemForm[]>([]);

  // Mock data
  const writeOffs: WriteOff[] = [
    { 
      id: 1, 
      code: 'XH001', 
      date: '2024-12-04 08:00', 
      items: 3, 
      totalValue: 450000, 
      reason: 'Hết hạn sử dụng', 
      approvedBy: 'Nguyễn Văn A', 
      status: 'approved',
      details: {
        items: [
          { name: 'Sữa tươi Vinamilk', batchCode: 'LO-2024-010', quantity: 10, unit: 'hộp', unitPrice: 25000, total: 250000, reason: 'Hết hạn sử dụng' },
          { name: 'Bánh mì sandwich', batchCode: 'LO-2024-011', quantity: 5, unit: 'cái', unitPrice: 30000, total: 150000, reason: 'Hết hạn sử dụng' },
          { name: 'Yaourt', batchCode: 'LO-2024-012', quantity: 10, unit: 'hộp', unitPrice: 5000, total: 50000, reason: 'Hết hạn sử dụng' },
        ]
      }
    },
    { 
      id: 2, 
      code: 'XH002', 
      date: '2024-12-04 12:30', 
      items: 2, 
      totalValue: 280000, 
      reason: 'Hư hỏng', 
      approvedBy: 'Trần Thị B', 
      status: 'approved',
      details: {
        items: [
          { name: 'Ly nhựa', batchCode: 'LO-2024-015', quantity: 100, unit: 'cái', unitPrice: 2000, total: 200000, reason: 'Bị nứt' },
          { name: 'Ống hút giấy', batchCode: 'LO-2024-016', quantity: 200, unit: 'cái', unitPrice: 400, total: 80000, reason: 'Bị ẩm mốc' },
        ]
      }
    },
    { 
      id: 3, 
      code: 'XH003', 
      date: '2024-12-04 16:00', 
      items: 1, 
      totalValue: 120000, 
      reason: 'Mất mát', 
      approvedBy: null, 
      status: 'pending',
      details: {
        items: [
          { name: 'Cà phê hạt Arabica', batchCode: 'LO-2024-018', quantity: 0.5, unit: 'kg', unitPrice: 240000, total: 120000, reason: 'Thất thoát trong quá trình vận chuyển' },
        ]
      }
    },
  ];

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const filteredWriteOffs = writeOffs.filter(wo => {
    const matchesSearch = wo.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.includes(wo.status);
    
    // Map reason text to reason IDs
    const reasonMap: { [key: string]: string } = {
      'Hết hạn sử dụng': 'het-han',
      'Hư hỏng': 'hu-hong',
      'Mất mát': 'mat-mat',
    };
    const reasonId = reasonMap[wo.reason] || 'khac';
    const matchesReason = selectedReasons.includes(reasonId);
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  const totalValue = filteredWriteOffs.reduce((sum, wo) => sum + wo.totalValue, 0);
  const pendingCount = writeOffs.filter(w => w.status === 'pending').length;
  const approvedCount = writeOffs.filter(w => w.status === 'approved').length;

  const handleCreateWriteOff = () => {
    console.log('Creating write-off:', formData, writeOffItems);
    setShowCreateDialog(false);
    // Reset form
    setFormData({
      code: 'XH-260753',
      date: '',
      reason: '',
      note: '',
    });
    setWriteOffItems([]);
  };

  const handleAddWriteOffItem = () => {
    const newItem: WriteOffItemForm = {
      product: '',
      batch: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      total: 0,
      reason: '',
    };
    setWriteOffItems([...writeOffItems, newItem]);
  };

  const handleRemoveWriteOffItem = (index: number) => {
    setWriteOffItems(writeOffItems.filter((_, i) => i !== index));
  };

  const handleUpdateWriteOffItem = (index: number, field: keyof WriteOffItemForm, value: any) => {
    const updatedItems = [...writeOffItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setWriteOffItems(updatedItems);
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
                { id: 'approved', label: 'Đã duyệt', color: 'bg-green-500' },
                { id: 'pending', label: 'Chờ duyệt', color: 'bg-orange-500' },
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

          {/* Reason Filter with Checkboxes */}
          <div className="mb-4">
            <label className="block mb-2 text-slate-700 text-xs">Lý do</label>
            <div className="space-y-2">
              {[
                { id: 'het-han', label: 'Hết hạn sử dụng' },
                { id: 'hu-hong', label: 'Hư hỏng' },
                { id: 'mat-mat', label: 'Mất mát' },
                { id: 'khac', label: 'Khác' },
              ].map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`reason-${reason.id}`}
                    checked={selectedReasons.includes(reason.id)}
                    onCheckedChange={() => toggleReason(reason.id)}
                  />
                  <Label htmlFor={`reason-${reason.id}`} className="text-sm text-slate-700 cursor-pointer">
                    {reason.label}
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
              Chờ duyệt ({pendingCount})
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
              <Package className="w-3 h-3 mr-2" />
              Đã duyệt ({approvedCount})
            </Button>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div>
          <h4 className="text-sm text-slate-700 mb-3">Tổng quan</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng phiếu xuất:</span>
              <span className="text-slate-900">{filteredWriteOffs.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng giá trị:</span>
              <span className="text-red-600">{totalValue.toLocaleString('vi-VN')}đ</span>
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
              <h1 className="text-slate-900 mb-2">Xuất hủy</h1>
              <p className="text-sm text-slate-600">Quản lý phiếu xuất hủy hàng hóa</p>
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
                Tạo phiếu xuất hủy
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
              placeholder="Tìm theo mã phiếu..."
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
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Số mặt hàng</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Tổng giá trị</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Lý do</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Người duyệt</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWriteOffs.map((wo, index) => (
                  <>
                    <tr 
                      key={wo.id} 
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === wo.id ? null : wo.id)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <button className="text-slate-400 hover:text-slate-600">
                          {expandedRow === wo.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">{wo.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{wo.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{wo.items}</td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">
                        {wo.totalValue.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{wo.reason}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{wo.approvedBy || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          wo.status === 'approved' 
                            ? 'bg-green-50 text-green-700' 
                            : wo.status === 'pending'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-red-50 text-red-700'
                        }`}>
                          {wo.status === 'approved' ? 'Đã duyệt' : wo.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
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
                    {expandedRow === wo.id && wo.details && (
                      <tr>
                        <td colSpan={9} className="bg-slate-50 px-4 py-4">
                          <div className="ml-8">
                            <h4 className="text-sm text-slate-700 mb-3">Chi tiết phiếu xuất hủy</h4>
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
                                    <th className="px-4 py-2 text-left text-xs text-slate-600">Lý do</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {wo.details.items.map((item, idx) => (
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
              Hiển thị {filteredWriteOffs.length} phiếu xuất hủy
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
              <DialogTitle>Import phiếu xuất hủy từ Excel</DialogTitle>
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

      {/* Create Write-Off Dialog */}
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
              <DialogTitle>Phiếu xuất hủy</DialogTitle>
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
            {/* Thông tin phiếu xuất hủy */}
            <div>
              <h3 className="text-sm text-slate-700 mb-4">Thông tin phiếu xuất hủy</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Mã phiếu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="XH-260753"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Ngày xuất hủy <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">
                    Lý do <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lý do" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="het-han">Hết hạn sử dụng</SelectItem>
                      <SelectItem value="hu-hong">Hư hỏng</SelectItem>
                      <SelectItem value="mat-mat">Mất mát</SelectItem>
                      <SelectItem value="khac">Khác</SelectItem>
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
                  onClick={handleAddWriteOffItem}
                >
                  <Plus className="w-4 h-4" />
                  Thêm hàng hóa
                </Button>
              </div>
              
              {writeOffItems.length === 0 ? (
                /* Empty State */
                <div className="border border-slate-200 rounded-lg p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Package className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm mb-1">Chưa có hàng hóa nào</p>
                  <p className="text-slate-400 text-xs">Nhấn "Thêm hàng hóa" để chọn sản phẩm cần xuất hủy</p>
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
                          <th className="px-3 py-2 text-center text-xs text-slate-600 w-24">Số lượng</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-600 min-w-[100px]">Đơn giá</th>
                          <th className="px-3 py-2 text-right text-xs text-slate-600 min-w-[100px]">Thành tiền</th>
                          <th className="px-3 py-2 text-left text-xs text-slate-600 min-w-[120px]">Lý do</th>
                          <th className="px-3 py-2 text-center text-xs text-slate-600 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {writeOffItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-slate-600">{index + 1}</td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="Nhập tên hàng hóa"
                                value={item.product}
                                onChange={(e) => handleUpdateWriteOffItem(index, 'product', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="Mã lô"
                                value={item.batch}
                                onChange={(e) => handleUpdateWriteOffItem(index, 'batch', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="ĐVT"
                                value={item.unit}
                                onChange={(e) => handleUpdateWriteOffItem(index, 'unit', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.quantity || ''}
                                onChange={(e) => handleUpdateWriteOffItem(index, 'quantity', Number(e.target.value))}
                                className="text-sm text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.unitPrice || ''}
                                onChange={(e) => handleUpdateWriteOffItem(index, 'unitPrice', Number(e.target.value))}
                                className="text-sm text-right"
                              />
                            </td>
                            <td className="px-3 py-2 text-sm text-slate-900 text-right">
                              {item.total.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                placeholder="Lý do"
                                value={item.reason}
                                onChange={(e) => handleUpdateWriteOffItem(index, 'reason', e.target.value)}
                                className="text-sm"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => handleRemoveWriteOffItem(index)}
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
                placeholder="Nhập ghi chú về phiếu xuất hủy..."
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
              onClick={handleCreateWriteOff}
            >
              Tạo phiếu xuất hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
