import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Promotion, PromotionType } from './pages/Promotions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Checkbox } from './ui/checkbox';

interface MenuItem {
  id: string;
  code: string;
  name: string;
  quantity?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Combo {
  id: string;
  name: string;
}

interface CustomerGroup {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  code: string;
  name: string;
}

interface PromotionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<Promotion, 'id' | 'code'>) => void;
  editingPromotion: Promotion | null;
}

export function PromotionFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  editingPromotion 
}: PromotionFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Promotion, 'id' | 'code'>>({
    name: '',
    type: 'percentage' as PromotionType,
    minOrderValue: 0,
    maxDiscountValue: undefined,
    promotionValue: undefined,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    freeItems: [],
    applicableItems: [],
    applicableCategories: [],
    applicableCombos: [],
    applicableCustomerGroups: [],
    applicableCustomers: [],
    status: 'active',
  });

  // Mock data
  const availableMenuItems: MenuItem[] = [
    { id: '1', code: 'CF001', name: 'Cà phê sữa' },
    { id: '2', code: 'CF002', name: 'Cà phê đen' },
    { id: '3', code: 'CF003', name: 'Bạc xỉu' },
  ];

  const availableCategories: Category[] = [
    { id: '1', name: 'Cà phê' },
    { id: '2', name: 'Trà sữa' },
    { id: '3', name: 'Sinh tố' },
  ];

  const availableCombos: Combo[] = [
    { id: '1', name: 'Combo 2 người' },
    { id: '2', name: 'Combo gia đình' },
  ];

  const availableCustomerGroups: CustomerGroup[] = [
    { id: '1', name: 'Khách hàng VIP' },
    { id: '2', name: 'Khách hàng thân thiết' },
  ];

  const availableCustomers: Customer[] = [
    { id: '1', code: 'KH001', name: 'Nguyễn Văn A' },
    { id: '2', code: 'KH002', name: 'Trần Thị B' },
  ];

  useEffect(() => {
    if (editingPromotion) {
      setFormData({
        name: editingPromotion.name,
        type: editingPromotion.type,
        minOrderValue: editingPromotion.minOrderValue,
        maxDiscountValue: editingPromotion.maxDiscountValue,
        promotionValue: editingPromotion.promotionValue,
        startDate: editingPromotion.startDate,
        startTime: editingPromotion.startTime,
        endDate: editingPromotion.endDate,
        endTime: editingPromotion.endTime,
        freeItems: editingPromotion.freeItems || [],
        applicableItems: editingPromotion.applicableItems || [],
        applicableCategories: editingPromotion.applicableCategories || [],
        applicableCombos: editingPromotion.applicableCombos || [],
        applicableCustomerGroups: editingPromotion.applicableCustomerGroups || [],
        applicableCustomers: editingPromotion.applicableCustomers || [],
        status: editingPromotion.status,
      });
    } else {
      setFormData({
        name: '',
        type: 'percentage',
        minOrderValue: 0,
        maxDiscountValue: undefined,
        promotionValue: undefined,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        freeItems: [],
        applicableItems: [],
        applicableCategories: [],
        applicableCombos: [],
        applicableCustomerGroups: [],
        applicableCustomers: [],
        status: 'active',
      });
    }
  }, [editingPromotion, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showMaxDiscountValue = formData.type === 'percentage' || formData.type === 'amount';
  const showPromotionValue = formData.type === 'percentage' || formData.type === 'amount' || formData.type === 'fixed-price';
  const showFreeItems = formData.type === 'free-item';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingPromotion ? 'Chỉnh sửa khuyến mại' : 'Thêm khuyến mại mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>
                  Tên khuyến mại <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  required
                />
              </div>

              <div>
                <Label>
                  Loại khuyến mại <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as PromotionType })}
                >
                  <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Theo phần trăm</SelectItem>
                    <SelectItem value="amount">Theo số tiền</SelectItem>
                    <SelectItem value="fixed-price">Đồng giá</SelectItem>
                    <SelectItem value="free-item">Tặng món</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Giá trị hóa đơn tối thiểu <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  required
                  min="0"
                />
              </div>

              {showPromotionValue && (
                <div>
                  <Label>
                    Giá trị khuyến mại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.promotionValue || ''}
                    onChange={(e) => setFormData({ ...formData, promotionValue: Number(e.target.value) })}
                    className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    required
                    min="0"
                    placeholder={formData.type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền (VNĐ)'}
                  />
                </div>
              )}

              {showMaxDiscountValue && (
                <div>
                  <Label>Giá trị giảm giá tối đa</Label>
                  <Input
                    type="number"
                    value={formData.maxDiscountValue || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscountValue: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    min="0"
                    placeholder="Số tiền (VNĐ)"
                  />
                </div>
              )}

              <div>
                <Label>
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  placeholder="DD/MM/YYYY"
                  required
                />
              </div>

              <div>
                <Label>
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  placeholder="HH:MM"
                  required
                />
              </div>

              <div>
                <Label>
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  placeholder="DD/MM/YYYY"
                  required
                />
              </div>

              <div>
                <Label>
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  placeholder="HH:MM"
                  required
                />
              </div>

              <div>
                <Label>
                  Trạng thái <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Free Items - Only for free-item type */}
            {showFreeItems && (
              <div>
                <Label className="mb-2 block">Danh sách mặt hàng được tặng</Label>
                <div className="space-y-2">
                  {/* Selected Free Items List */}
                  {formData.freeItems && formData.freeItems.length > 0 && (
                    <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-48 overflow-y-auto">
                      {formData.freeItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 rounded text-sm">
                          <span className="flex-1">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-600">Số lượng:</label>
                            <Input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                setFormData({
                                  ...formData,
                                  freeItems: formData.freeItems?.map(fi => 
                                    fi.id === item.id ? { ...fi, quantity: newQuantity } : fi
                                  )
                                });
                              }}
                              className="w-16 h-8 px-2 py-1 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              min="1"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              freeItems: formData.freeItems?.filter(fi => fi.id !== item.id)
                            })}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Free Item Dropdown */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm mặt hàng tặng
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2" align="start">
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {availableMenuItems
                          .filter(item => !formData.freeItems?.some(fi => fi.id === item.id))
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  freeItems: [...(formData.freeItems || []), { ...item, quantity: 1 }]
                                });
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm"
                            >
                              {item.name}
                            </button>
                          ))}
                        {availableMenuItems.filter(item => !formData.freeItems?.some(fi => fi.id === item.id)).length === 0 && (
                          <div className="px-3 py-2 text-sm text-slate-500 text-center">
                            Không còn mặt hàng nào
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Applicable Scope */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-900">Phạm vi áp dụng</h3>
              
              {/* Applicable Items */}
              <div>
                <Label className="mb-2 block">Danh sách mặt hàng được áp dụng</Label>
                <div className="space-y-2">
                  {/* Selected Items List */}
                  {formData.applicableItems && formData.applicableItems.length > 0 && (
                    <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                      {formData.applicableItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded text-sm">
                          <span>{item.name}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              applicableItems: formData.applicableItems?.filter(i => i.id !== item.id)
                            })}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Item Dropdown */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm mặt hàng
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2" align="start">
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {availableMenuItems
                          .filter(item => !formData.applicableItems?.some(ai => ai.id === item.id))
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  applicableItems: [...(formData.applicableItems || []), item]
                                });
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm"
                            >
                              {item.name}
                            </button>
                          ))}
                        {availableMenuItems.filter(item => !formData.applicableItems?.some(ai => ai.id === item.id)).length === 0 && (
                          <div className="px-3 py-2 text-sm text-slate-500 text-center">
                            Không còn mặt hàng nào
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Applicable Categories */}
                <div>
                  <Label className="mb-2 block">Danh sách danh mục được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCategories && formData.applicableCategories.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                        {formData.applicableCategories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded text-sm">
                            <span>{cat.name}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCategories: formData.applicableCategories?.filter(c => c.id !== cat.id)
                              })}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm danh mục
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-2" align="start">
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {availableCategories
                            .filter(cat => !formData.applicableCategories?.some(ac => ac.id === cat.id))
                            .map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    applicableCategories: [...(formData.applicableCategories || []), cat]
                                  });
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm"
                              >
                                {cat.name}
                              </button>
                            ))}
                          {availableCategories.filter(cat => !formData.applicableCategories?.some(ac => ac.id === cat.id)).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              Không còn danh mục nào
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Applicable Combos */}
                <div>
                  <Label className="mb-2 block">Danh sách combo được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCombos && formData.applicableCombos.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                        {formData.applicableCombos.map((combo) => (
                          <div key={combo.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded text-sm">
                            <span>{combo.name}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCombos: formData.applicableCombos?.filter(c => c.id !== combo.id)
                              })}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm combo
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-2" align="start">
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {availableCombos
                            .filter(combo => !formData.applicableCombos?.some(ac => ac.id === combo.id))
                            .map((combo) => (
                              <button
                                key={combo.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    applicableCombos: [...(formData.applicableCombos || []), combo]
                                  });
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm"
                              >
                                {combo.name}
                              </button>
                            ))}
                          {availableCombos.filter(combo => !formData.applicableCombos?.some(ac => ac.id === combo.id)).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              Không còn combo nào
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Applicable Customer Groups */}
                <div>
                  <Label className="mb-2 block">Danh sách nhóm khách hàng được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCustomerGroups && formData.applicableCustomerGroups.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                        {formData.applicableCustomerGroups.map((group) => (
                          <div key={group.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded text-sm">
                            <span>{group.name}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCustomerGroups: formData.applicableCustomerGroups?.filter(g => g.id !== group.id)
                              })}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm nhóm khách hàng
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-2" align="start">
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {availableCustomerGroups
                            .filter(group => !formData.applicableCustomerGroups?.some(acg => acg.id === group.id))
                            .map((group) => (
                              <button
                                key={group.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    applicableCustomerGroups: [...(formData.applicableCustomerGroups || []), group]
                                  });
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm"
                              >
                                {group.name}
                              </button>
                            ))}
                          {availableCustomerGroups.filter(group => !formData.applicableCustomerGroups?.some(acg => acg.id === group.id)).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              Không còn nhóm nào
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Applicable Customers */}
                <div>
                  <Label className="mb-2 block">Danh sách khách hàng được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCustomers && formData.applicableCustomers.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                        {formData.applicableCustomers.map((customer) => (
                          <div key={customer.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded text-sm">
                            <span>{customer.name}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCustomers: formData.applicableCustomers?.filter(c => c.id !== customer.id)
                              })}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm khách hàng
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-2" align="start">
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {availableCustomers
                            .filter(customer => !formData.applicableCustomers?.some(ac => ac.id === customer.id))
                            .map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    applicableCustomers: [...(formData.applicableCustomers || []), customer]
                                  });
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm"
                              >
                                {customer.name}
                              </button>
                            ))}
                          {availableCustomers.filter(customer => !formData.applicableCustomers?.some(ac => ac.id === customer.id)).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              Không còn khách hàng nào
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingPromotion ? 'Cập nhật' : 'Thêm khuyến mại'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}