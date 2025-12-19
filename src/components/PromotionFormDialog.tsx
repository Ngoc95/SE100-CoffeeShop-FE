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
  const [applicableItemSearch, setApplicableItemSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [comboSearch, setComboSearch] = useState('');
  const [customerGroupSearch, setCustomerGroupSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [applicableItemSelections, setApplicableItemSelections] = useState<string[]>([]);
  const [categorySelections, setCategorySelections] = useState<string[]>([]);
  const [comboSelections, setComboSelections] = useState<string[]>([]);
  const [customerGroupSelections, setCustomerGroupSelections] = useState<string[]>([]);
  const [customerSelections, setCustomerSelections] = useState<string[]>([]);

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
        freeItems: editingPromotion.freeItems?.map(item => ({ ...item, quantity: item.quantity || 1 })) || [],
        applicableItems: editingPromotion.applicableItems?.map(item => ({ ...item, quantity: item.quantity || 1 })) || [],
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

  const showMaxDiscountValue = formData.type === 'percentage';
  const showPromotionValue = formData.type === 'percentage' || formData.type === 'amount' || formData.type === 'fixed-price';
  const showFreeItems = formData.type === 'free-item';
  const remainingApplicableItems = availableMenuItems.filter(
    (item) => !formData.applicableItems?.some((ai) => ai.id === item.id)
  );
  const filteredApplicableItems = remainingApplicableItems.filter((item) => {
    const keyword = applicableItemSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword)
    );
  });
  const remainingCategories = availableCategories.filter(
    (cat) => !formData.applicableCategories?.some((ac) => ac.id === cat.id)
  );
  const filteredCategories = remainingCategories.filter((cat) => {
    const keyword = categorySearch.trim().toLowerCase();
    if (!keyword) return true;
    return cat.name.toLowerCase().includes(keyword);
  });
  const remainingCombos = availableCombos.filter(
    (combo) => !formData.applicableCombos?.some((ac) => ac.id === combo.id)
  );
  const filteredCombos = remainingCombos.filter((combo) => {
    const keyword = comboSearch.trim().toLowerCase();
    if (!keyword) return true;
    return combo.name.toLowerCase().includes(keyword);
  });
  const remainingCustomerGroups = availableCustomerGroups.filter(
    (group) => !formData.applicableCustomerGroups?.some((acg) => acg.id === group.id)
  );
  const filteredCustomerGroups = remainingCustomerGroups.filter((group) => {
    const keyword = customerGroupSearch.trim().toLowerCase();
    if (!keyword) return true;
    return group.name.toLowerCase().includes(keyword);
  });
  const remainingCustomers = availableCustomers.filter(
    (customer) => !formData.applicableCustomers?.some((ac) => ac.id === customer.id)
  );
  const filteredCustomers = remainingCustomers.filter((customer) => {
    const keyword = customerSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      customer.name.toLowerCase().includes(keyword) ||
      customer.code.toLowerCase().includes(keyword)
    );
  });

  const addSelectedApplicableItems = () => {
    if (!applicableItemSelections.length) return;
    const selectedItems = remainingApplicableItems.filter((item) =>
      applicableItemSelections.includes(item.id)
    );
    if (selectedItems.length) {
      setFormData((prev) => ({
        ...prev,
        applicableItems: [...(prev.applicableItems || []), ...selectedItems],
      }));
    }
    setApplicableItemSelections([]);
  };

  const addSelectedCategories = () => {
    if (!categorySelections.length) return;
    const selectedCategories = remainingCategories.filter((cat) =>
      categorySelections.includes(cat.id)
    );
    if (selectedCategories.length) {
      setFormData((prev) => ({
        ...prev,
        applicableCategories: [...(prev.applicableCategories || []), ...selectedCategories],
      }));
    }
    setCategorySelections([]);
  };

  const addSelectedCombos = () => {
    if (!comboSelections.length) return;
    const selectedCombos = remainingCombos.filter((combo) =>
      comboSelections.includes(combo.id)
    );
    if (selectedCombos.length) {
      setFormData((prev) => ({
        ...prev,
        applicableCombos: [...(prev.applicableCombos || []), ...selectedCombos],
      }));
    }
    setComboSelections([]);
  };

  const addSelectedCustomerGroups = () => {
    if (!customerGroupSelections.length) return;
    const selectedGroups = remainingCustomerGroups.filter((group) =>
      customerGroupSelections.includes(group.id)
    );
    if (selectedGroups.length) {
      setFormData((prev) => ({
        ...prev,
        applicableCustomerGroups: [
          ...(prev.applicableCustomerGroups || []),
          ...selectedGroups,
        ],
      }));
    }
    setCustomerGroupSelections([]);
  };

  const addSelectedCustomers = () => {
    if (!customerSelections.length) return;
    const selectedCustomers = remainingCustomers.filter((customer) =>
      customerSelections.includes(customer.id)
    );
    if (selectedCustomers.length) {
      setFormData((prev) => ({
        ...prev,
        applicableCustomers: [...(prev.applicableCustomers || []), ...selectedCustomers],
      }));
    }
    setCustomerSelections([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[1100px] max-w-[1300px] w-[100vw] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
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

            {formData.type !== 'free-item' && (
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
            )}

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
                      <div key={item.id} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 rounded text-sm">
                        <span className="flex-1">{item.name}</span>
                        {formData.type === 'free-item' && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-600">Số lượng:</label>
                            <Input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                setFormData({
                                  ...formData,
                                  applicableItems: formData.applicableItems?.map(ai =>
                                    ai.id === item.id ? { ...ai, quantity: newQuantity } : ai
                                  )
                                });
                              }}
                              className="w-16 h-8 px-2 py-1 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              min="1"
                            />
                          </div>
                        )}
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
                      <div className="space-y-2">
                        <Input
                          value={applicableItemSearch}
                          onChange={(e) => setApplicableItemSearch(e.target.value)}
                          placeholder="Tìm theo mã hoặc tên"
                          className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredApplicableItems.map((item) => {
                            const isChecked = applicableItemSelections.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    setApplicableItemSelections((prev) => {
                                      if (checked === true) {
                                        if (prev.includes(item.id)) return prev;
                                        return [...prev, item.id];
                                      }
                                      return prev.filter((selectedId) => selectedId !== item.id);
                                    });
                                  }}
                                />
                                <span className="flex-1">
                                  {item.name}
                                  <span className="ml-2 text-xs text-slate-500">{item.code}</span>
                                </span>
                              </label>
                            );
                          })}
                          {filteredApplicableItems.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              {remainingApplicableItems.length === 0
                                ? 'Không còn mặt hàng nào'
                                : 'Không tìm thấy kết quả'}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={addSelectedApplicableItems}
                            disabled={!applicableItemSelections.length}
                            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            Thêm đã chọn
                          </Button>
                        </div>
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
                      <div className="space-y-2">
                        <Input
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Tìm theo tên danh mục"
                          className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredCategories.map((cat) => {
                            const isChecked = categorySelections.includes(cat.id);
                            return (
                              <label
                                key={cat.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    setCategorySelections((prev) => {
                                      if (checked === true) {
                                        if (prev.includes(cat.id)) return prev;
                                        return [...prev, cat.id];
                                      }
                                      return prev.filter((selectedId) => selectedId !== cat.id);
                                    });
                                  }}
                                />
                                <span className="flex-1">{cat.name}</span>
                              </label>
                            );
                          })}
                          {filteredCategories.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              {remainingCategories.length === 0
                                ? 'Không còn danh mục nào'
                                : 'Không tìm thấy kết quả'}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={addSelectedCategories}
                            disabled={!categorySelections.length}
                            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            Thêm đã chọn
                          </Button>
                        </div>
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
                      <div className="space-y-2">
                        <Input
                          value={comboSearch}
                          onChange={(e) => setComboSearch(e.target.value)}
                          placeholder="Tìm theo tên combo"
                          className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredCombos.map((combo) => {
                            const isChecked = comboSelections.includes(combo.id);
                            return (
                              <label
                                key={combo.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    setComboSelections((prev) => {
                                      if (checked === true) {
                                        if (prev.includes(combo.id)) return prev;
                                        return [...prev, combo.id];
                                      }
                                      return prev.filter((selectedId) => selectedId !== combo.id);
                                    });
                                  }}
                                />
                                <span className="flex-1">{combo.name}</span>
                              </label>
                            );
                          })}
                          {filteredCombos.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              {remainingCombos.length === 0
                                ? 'Không còn combo nào'
                                : 'Không tìm thấy kết quả'}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={addSelectedCombos}
                            disabled={!comboSelections.length}
                            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            Thêm đã chọn
                          </Button>
                        </div>
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
                      <div className="space-y-2">
                        <Input
                          value={customerGroupSearch}
                          onChange={(e) => setCustomerGroupSearch(e.target.value)}
                          placeholder="Tìm theo tên nhóm"
                          className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredCustomerGroups.map((group) => {
                            const isChecked = customerGroupSelections.includes(group.id);
                            return (
                              <label
                                key={group.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    setCustomerGroupSelections((prev) => {
                                      if (checked === true) {
                                        if (prev.includes(group.id)) return prev;
                                        return [...prev, group.id];
                                      }
                                      return prev.filter((selectedId) => selectedId !== group.id);
                                    });
                                  }}
                                />
                                <span className="flex-1">{group.name}</span>
                              </label>
                            );
                          })}
                          {filteredCustomerGroups.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              {remainingCustomerGroups.length === 0
                                ? 'Không còn nhóm nào'
                                : 'Không tìm thấy kết quả'}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={addSelectedCustomerGroups}
                            disabled={!customerGroupSelections.length}
                            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            Thêm đã chọn
                          </Button>
                        </div>
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
                      <div className="space-y-2">
                        <Input
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Tìm theo mã hoặc tên"
                          className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredCustomers.map((customer) => {
                            const isChecked = customerSelections.includes(customer.id);
                            return (
                              <label
                                key={customer.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    setCustomerSelections((prev) => {
                                      if (checked === true) {
                                        if (prev.includes(customer.id)) return prev;
                                        return [...prev, customer.id];
                                      }
                                      return prev.filter((selectedId) => selectedId !== customer.id);
                                    });
                                  }}
                                />
                                <span className="flex-1">
                                  {customer.name}
                                  <span className="ml-2 text-xs text-slate-500">{customer.code}</span>
                                </span>
                              </label>
                            );
                          })}
                          {filteredCustomers.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                              {remainingCustomers.length === 0
                                ? 'Không còn khách hàng nào'
                                : 'Không tìm thấy kết quả'}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={addSelectedCustomers}
                            disabled={!customerSelections.length}
                            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            Thêm đã chọn
                          </Button>
                        </div>
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