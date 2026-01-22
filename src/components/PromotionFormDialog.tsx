import { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { PromotionTypes } from './pages/Promotions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Calendar } from './ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getInventoryItemCategories, getInventoryItems } from '../api/inventoryItem';
import { getActiveCombos } from '../api/combo';
import { getCustomers } from '../api/customer';
import { getCustomerGroups } from '../api/customerGroup';
import { getPromotionById } from '../api/promotions';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const formatDateTimeLocal = (date: Date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};

const getNextMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
};

interface Item {
  id: number;
  code: string;
  name: string;
  quantity?: number;
}

interface Category {
  id: number;
  name: string;
}

interface Combo {
  id: number;
  name: string;
}

interface CustomerGroup {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  code: string;
  name: string;
}

interface PromotionEditFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: EditPromotion) => void;
  editingPromotion: EditPromotion;
}
interface PromotionAddFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: AddPromotion) => void;
}

export interface EditPromotion {
  id: number,
  code: string
  name: string,
  description: string,
  discountValue: number,
  minOrderValue: number,
  maxDiscount: number,
  buyQuantity: number,
  getQuantity: number,
  requireSameItem: boolean,
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage?: number,
  maxUsagePerCustomer?: number,
  currentTotalUsage: number,
  isActive: boolean,

  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,

  applicableItemIds: number[],
  applicableCategoryIds: number[],
  applicableComboIds: number[],
  applicableCustomerIds: number[],
  applicableCustomerGroupIds: number[],
  giftItemIds: number[],

  typeId: number
}

export interface AddPromotion {
  name: string,
  description: string,
  discountValue: number,
  minOrderValue: number,
  maxDiscount: number,
  buyQuantity: number,
  getQuantity: number,
  requireSameItem: boolean,
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage?: number,
  maxUsagePerCustomer?: number,
  currentTotalUsage: number,
  isActive: boolean,

  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,

  applicableItemIds: number[],
  applicableCategoryIds: number[],
  applicableComboIds: number[],
  applicableCustomerIds: number[],
  applicableCustomerGroupIds: number[],
  giftItemIds: number[],

  typeId: number
}

export function PromotionEditFormDialog({
  open,
  onClose,
  onSubmit,
  editingPromotion
}: PromotionEditFormDialogProps) {
  const [formData, setFormData] = useState<EditPromotion>({
    id: 0,
    code: "",
    name: "",
    description: "",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    buyQuantity: 0,
    getQuantity: 0,
    requireSameItem: false,
    startDateTime: formatDateTimeLocal(new Date()),
    endDateTime: formatDateTimeLocal(getNextMonth()),
    maxTotalUsage: undefined,
    maxUsagePerCustomer: undefined,
    currentTotalUsage: 0,
    isActive: true,

    applyToAllItems: false,
    applyToAllCategories: false,
    applyToAllCombos: false,
    applyToAllCustomers: false,
    applyToAllCustomerGroups: false,
    applyToWalkIn: true,

    applicableItemIds: [],
    applicableCategoryIds: [],
    applicableComboIds: [],
    applicableCustomerIds: [],
    applicableCustomerGroupIds: [],
    giftItemIds: [],

    typeId: 1
  });
  const [applicableItemSearch, setApplicableItemSearch] = useState('');
  const [giftItemSearch, setGiftItemSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [comboSearch, setComboSearch] = useState('');
  const [customerGroupSearch, setCustomerGroupSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const [applicableItemSelections, setApplicableItemSelections] = useState<Item[]>([]);
  const [giftItemSelections, setGiftItemSelections] = useState<Item[]>([]);
  const [applicableCategorySelections, setApplicableCategorySelections] = useState<Category[]>([]);
  const [applicableComboSelections, setApplicableComboSelections] = useState<Combo[]>([]);
  const [applicableCustomerGroupSelections, setApplicableCustomerGroupSelections] = useState<CustomerGroup[]>([]);
  const [applicableCustomerSelections, setApplicableCustomerSelections] = useState<Customer[]>([]);
  const [productScope, setProductScope] = useState<'individual' | 'combo'>('individual');

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allCombos, setAllCombos] = useState<Combo[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allCustomerGroups, setAllCustomerGroups] = useState<CustomerGroup[]>([]);

  const fetchAllData = async () => {
    // Fetch items
    const itemRes = await getInventoryItems();
    if (itemRes) {
      const { items } = itemRes.data.metaData;
      if (items) {
        setAllItems(items);
      }
    }

    // Fetch categories
    const categoryRes = await getInventoryItemCategories();
    if (categoryRes) {
      const { metaData } = categoryRes.data;
      if (metaData) {
        setAllCategories(metaData);
      }
    }

    //Fetch combos
    const comboRes = await getActiveCombos();
    if (comboRes) {
      const { metaData } = comboRes.data;
      if (metaData) {
        setAllCombos(metaData);
      }
    }

    //Fetch customer
    const customerRes = await getCustomers();
    if (customerRes) {
      const { customers } = customerRes.data.metaData;
      if (customers) {
        setAllCustomers(customers);
      }
    }

    //Fetch customer groups
    const customerGroupRes = await getCustomerGroups();
    if (customerGroupRes) {
      const { groups } = customerGroupRes.data.metaData;
      if (groups) {
        setAllCustomerGroups(groups);
      }
    }

    //Fetch applicables
    const promotionRes = await getPromotionById(editingPromotion.id);
    if (promotionRes) {
      const { promotion } = promotionRes.data.metaData;
      if (promotion) {
        const { applicableItems, applicableCategories, applicableCombos, applicableCustomers, applicableCustomerGroups, giftItems } = promotion;
        let tempApplicableItemIds: number[] = [];
        let tempApplicableCategoryIds: number[] = [];
        let tempApplicableComboIds: number[] = [];
        let tempApplicableCustomerIds: number[] = [];
        let tempApplicableCustomerGroupIds: number[] = [];
        let tempGiftItemIds: number[] = [];

        if (applicableItems) {
          applicableItems.forEach((item: Item) => {
            tempApplicableItemIds.push(item.id)
          })
        }
        if (applicableCategories) {
          applicableCategories.forEach((cat: Category) => {
            tempApplicableCategoryIds.push(cat.id)
          })
        }
        if (applicableCombos) {
          applicableCombos.forEach((combo: Combo) => {
            tempApplicableComboIds.push(combo.id)
          })
        }
        if (applicableCustomers) {
          applicableCustomers.forEach((customer: Customer) => {
            tempApplicableCustomerIds.push(customer.id)
          })
        }
        if (applicableCustomerGroups) {
          applicableCustomerGroups.forEach((customerGroup: CustomerGroup) => {
            tempApplicableCustomerGroupIds.push(customerGroup.id)
          })
        }
        if (giftItems) {
          giftItems.forEach((item: Item) => {
            tempGiftItemIds.push(item.id)
          })
        }
        let tempFormData: EditPromotion = {
          id: editingPromotion.id,
          code: editingPromotion.code,
          name: editingPromotion.name,
          description: editingPromotion.description,
          discountValue: editingPromotion.discountValue,
          minOrderValue: editingPromotion.minOrderValue,
          maxDiscount: editingPromotion.maxDiscount,
          buyQuantity: editingPromotion.buyQuantity,
          getQuantity: editingPromotion.getQuantity,
          requireSameItem: editingPromotion.requireSameItem,
          startDateTime: editingPromotion.startDateTime ? formatDateTimeLocal(new Date(editingPromotion.startDateTime)) : formatDateTimeLocal(new Date()),
          endDateTime: editingPromotion.endDateTime ? formatDateTimeLocal(new Date(editingPromotion.endDateTime)) : formatDateTimeLocal(getNextMonth()),
          maxTotalUsage: editingPromotion.maxTotalUsage,
          maxUsagePerCustomer: editingPromotion.maxUsagePerCustomer,
          currentTotalUsage: editingPromotion.currentTotalUsage,
          isActive: editingPromotion.isActive,

          applyToAllItems: editingPromotion.applyToAllItems,
          applyToAllCategories: editingPromotion.applyToAllCategories,
          applyToAllCombos: editingPromotion.applyToAllCombos,
          applyToAllCustomers: editingPromotion.applyToAllCustomers,
          applyToAllCustomerGroups: editingPromotion.applyToAllCustomerGroups,
          applyToWalkIn: editingPromotion.applyToWalkIn,

          applicableItemIds: tempApplicableItemIds,
          applicableCategoryIds: tempApplicableCategoryIds,
          applicableComboIds: tempApplicableComboIds,
          applicableCustomerIds: tempApplicableCustomerIds,
          applicableCustomerGroupIds: tempApplicableCustomerGroupIds,
          giftItemIds: tempGiftItemIds,

          typeId: editingPromotion.typeId
        }
        // console.log("Temp form data: ", tempFormData);
        setFormData(tempFormData);

        // console.log("items: ", tempApplicableItemIds);
        // console.log("categories: ", tempApplicableCategoryIds);
        // console.log("combos: ", tempApplicableComboIds);
        // console.log("customers: ", tempApplicableCustomerIds);
        // console.log("customer groups: ", tempApplicableCustomerGroupIds);
        // console.log("gift items: ", tempGiftItemIds);
      }
    }
  }

  const getItemName = (id: number) => {
    return allItems.find(i => i.id === id)?.name || "";
  }

  const getCategoryName = (id: number) => {
    return allCategories.find(c => c.id === id)?.name || "";
  }

  const getComboName = (id: number) => {
    return allCombos.find(c => c.id === id)?.name || "";
  }

  const getCustomerName = (id: number) => {
    return allCustomers.find(c => c.id === id)?.name || "";
  }

  const getCustomerGroupName = (id: number) => {
    return allCustomerGroups.find(g => g.id === id)?.name || "";
  }



  useEffect(() => {
    // setFormData({
    //   id: editingPromotion.id,
    //   code: editingPromotion.code,
    //   name: editingPromotion.name,
    //   description: editingPromotion.description,
    //   discountValue: editingPromotion.discountValue,
    //   minOrderValue: editingPromotion.minOrderValue,
    //   maxDiscount: editingPromotion.maxDiscount,
    //   buyQuantity: editingPromotion.buyQuantity,
    //   getQuantity: editingPromotion.getQuantity,
    //   requireSameItem: editingPromotion.requireSameItem,
    //   startDateTime: editingPromotion.startDateTime,
    //   endDateTime: editingPromotion.endDateTime,
    //   maxTotalUsage: editingPromotion.maxTotalUsage,
    //   maxUsagePerCustomer: editingPromotion.maxUsagePerCustomer,
    //   currentTotalUsage: editingPromotion.currentTotalUsage,
    //   isActive: editingPromotion.isActive,

    //   applyToAllItems: editingPromotion.applyToAllItems,
    //   applyToAllCategories: editingPromotion.applyToAllCategories,
    //   applyToAllCombos: editingPromotion.applyToAllCombos,
    //   applyToAllCustomers: editingPromotion.applyToAllCustomers,
    //   applyToAllCustomerGroups: editingPromotion.applyToAllCustomerGroups,
    //   applyToWalkIn: editingPromotion.applyToWalkIn,

    //   applicableItemIds: editingPromotion.applicableItemIds,
    //   applicableCategoryIds: editingPromotion.applicableCategoryIds,
    //   applicableComboIds: editingPromotion.applicableComboIds,
    //   applicableCustomerIds: editingPromotion.applicableCustomerIds,
    //   applicableCustomerGroupIds: editingPromotion.applicableCustomerGroupIds,
    //   giftItemIds: editingPromotion.giftItemIds,

    //   typeId: editingPromotion.typeId
    // });

    if (open && editingPromotion.id > 0) {
      fetchAllData();
    }
  }, [editingPromotion, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.maxTotalUsage === undefined || submitData.maxTotalUsage === null || isNaN(submitData.maxTotalUsage)) {
      delete submitData.maxTotalUsage;
    }
    if (submitData.maxUsagePerCustomer === undefined || submitData.maxUsagePerCustomer === null || isNaN(submitData.maxUsagePerCustomer)) {
      delete submitData.maxUsagePerCustomer;
    }
    onSubmit(submitData);
  };

  const showMaxDiscountValue = formData.typeId === 1;
  const showPromotionValue = formData.typeId === 1 || formData.typeId === 2 || formData.typeId === 3;
  const showFreeItems = formData.typeId === 4;

  const checkType = (value: number) => {
    switch (value) {
      case 1:
        return formData.typeId === 4;
      case 10:
        return formData.typeId === 3;
      case 11:
        return formData.typeId === 4 || formData.typeId === 3;
      case 100:
        return formData.typeId === 2;
      case 101:
        return formData.typeId === 2 || formData.typeId === 4;
      case 110:
        return formData.typeId === 2 || formData.typeId === 3;
      case 111:
        return formData.typeId === 2 || formData.typeId === 3 || formData.typeId === 4;
      case 1000:
        return formData.typeId === 1;
      case 1001:
        return formData.typeId === 1 || formData.typeId === 4;
      case 1010:
        return formData.typeId === 1 || formData.typeId === 3;
      case 1011:
        return formData.typeId === 1 || formData.typeId === 3 || formData.typeId === 4;
      case 1100:
        return formData.typeId === 1 || formData.typeId === 2;
      case 1101:
        return formData.typeId === 1 || formData.typeId === 2 || formData.typeId === 4;
      case 1110:
        return formData.typeId === 1 || formData.typeId === 2 || formData.typeId === 3;
      case 1111: return true;
    }
  }

  const addSelectedApplicableItems = () => {
    if (!applicableItemSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableItemIds: [...(prev.applicableItemIds || []), ...applicableItemSelections.map(i => i.id)]
    }));
    setApplicableItemSelections([]);
  };

  const addSelectedGiftItems = () => {
    if (!giftItemSelections.length) return;
    setFormData(prev => ({
      ...prev,
      giftItemIds: [...(prev.giftItemIds || []), ...giftItemSelections.map(i => i.id)]
    }));
    setGiftItemSelections([]);
  };

  const addSelectedCategories = () => {
    if (!applicableCategorySelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableCategoryIds: [...(prev.applicableCategoryIds || []), ...applicableCategorySelections.map(c => c.id)]
    }));
    setApplicableCategorySelections([]);
  };

  const addSelectedCombos = () => {
    if (!applicableComboSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableComboIds: [...(prev.applicableComboIds || []), ...applicableComboSelections.map(c => c.id)]
    }));
    setApplicableComboSelections([]);
  };

  const addSelectedCustomerGroups = () => {
    if (!applicableCustomerGroupSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableCustomerGroupIds: [...(prev.applicableCustomerGroupIds || []), ...applicableCustomerGroupSelections.map(g => g.id)]
    }));
    setApplicableCustomerGroupSelections([]);
  };

  const addSelectedCustomers = () => {
    if (!applicableCustomerSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableCustomerIds: [...(prev.applicableCustomerIds || []), ...applicableCustomerSelections.map(c => c.id)]
    }));
    setApplicableCustomerSelections([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[1100px] max-w-[1300px] w-[100vw] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Chỉnh sửa khuyến mại
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ma KM */}
            <div className="col-span-2">
              <Label>
                Mã khuyến mại <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.code}
                disabled={true}
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                required
              />
            </div>
            {/* Ten KM */}
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
            {/* Mo ta */}
            <div className="col-span-2">
              <Label>
                Mô tả
              </Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                required
              />
            </div>
            {/* Loai KM */}
            <div>
              <Label>
                Loại khuyến mại <span className="text-red-500">*</span>
              </Label>
              <Select
                disabled={true}
                value={PromotionTypes[formData.typeId]}
                onValueChange={(value: string) => {
                  let type = 1;
                  Object.entries(PromotionTypes).forEach(([key, val]) => {
                    if (val === value) type = Number(key);
                  })
                  setFormData({ ...formData, typeId: type })
                }}
              >
                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Theo phần trăm">Theo phần trăm</SelectItem>
                  <SelectItem value="Theo số tiền">Theo số tiền</SelectItem>
                  <SelectItem value="Đồng giá">Đồng giá</SelectItem>
                  <SelectItem value="Tặng món">Tặng món</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Hoa don toi thieu */}
            {checkType(1110) && (
              <div>
                <Label>
                  Giá trị hóa đơn tối thiểu
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
            {/* Gia tri KM */}
            {checkType(1110) && (
              <div>
                <Label>
                  Giá trị khuyến mại
                </Label>
                <Input
                  type="number"
                  value={formData.discountValue || ''}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  required
                  min="0"
                  placeholder={formData.typeId === 1 ? 'Phần trăm (%)' : 'Số tiền (VNĐ)'}
                />
              </div>
            )}
            {/* Giam toi da */}
            {checkType(1100) && (
              <div>
                <Label>Giá trị giảm giá tối đa</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: !Number.isNaN(Number(e.target.value)) ? Number(e.target.value) : formData.maxDiscount })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  min="0"
                  placeholder="Số tiền (VNĐ)"
                />
              </div>
            )}
            {/* So luong mua */}
            {checkType(1) && (
              <div>
                <Label>Số lượng mua</Label>
                <Input
                  type="number"
                  value={formData.buyQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, buyQuantity: !Number.isNaN(Number(e.target.value)) ? Number(e.target.value) : formData.buyQuantity })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  min="0"
                  placeholder="Số lượng mua"
                />
              </div>
            )}
            {/* So luong nhan */}
            {checkType(1) && (
              <div>
                <Label>Số lượng nhận</Label>
                <Input
                  type="number"
                  value={formData.getQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, getQuantity: !Number.isNaN(Number(e.target.value)) ? Number(e.target.value) : formData.getQuantity })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  min="0"
                  placeholder="Số lượng nhận"
                />
              </div>
            )
            }
            {/* Thoi gian bat dau */}
            <div>
              <Label>
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5 bg-white border-2 border-slate-300 h-10",
                      !formData.startDateTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDateTime ? (
                      format(new Date(formData.startDateTime), 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDateTime ? new Date(formData.startDateTime) : undefined}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        setFormData({ ...formData, startDateTime: format(date, 'yyyy-MM-dd') });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Thoi gian ket thuc */}
            <div>
              <Label>
                Thời gian kết thúc <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5 bg-white border-2 border-slate-300 h-10",
                      !formData.endDateTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDateTime ? (
                      format(new Date(formData.endDateTime), 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDateTime ? new Date(formData.endDateTime) : undefined}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        setFormData({ ...formData, endDateTime: format(date, 'yyyy-MM-dd') });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* So luot su dung toi da */}
            <div>
              <Label>
                Số lượt sử dụng tối đa
              </Label>
              <Input
                type="number"
                value={formData.maxTotalUsage ?? ''}
                onChange={(e) => setFormData({ ...formData, maxTotalUsage: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                min="0"
                placeholder='Số lượt sử dụng tối đa'
              />
            </div>
            {/* So luot su dung toi da moi khach */}
            <div>
              <Label>
                Số lượt sử dụng tối đa mỗi khách
              </Label>
              <Input
                type="number"
                value={formData.maxUsagePerCustomer ?? ''}
                onChange={(e) => setFormData({ ...formData, maxUsagePerCustomer: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-2"
                min="0"
                placeholder='Số lượt sử dụng tối đa mỗi khách'
              />
            </div>
            {/* Trang thai */}
            <div>
              <Label>
                Trạng thái <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                onValueChange={(value: string) => setFormData({ ...formData, isActive: (value === 'Hoạt động' ? true : false) })}
              >
                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                  <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phai cung mon - Only for certain types */}
          {checkType(1) && (
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                id="requireSameItem"
                checked={formData.requireSameItem}
                onCheckedChange={(value: boolean) => setFormData({ ...formData, requireSameItem: value })}
              />
              <Label htmlFor="requireSameItem">Phải cùng món</Label>
            </div>
          )}

          {/* Product Scope */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-base font-semibold text-slate-900">Phạm vi đối với sản phẩm</h3>
            <RadioGroup
              value={productScope}
              onValueChange={(value: 'individual' | 'combo') => setProductScope(value)}
              className="flex gap-6 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="p1" />
                <Label htmlFor="p1" className="cursor-pointer">Riêng lẻ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="combo" id="p2" />
                <Label htmlFor="p2" className="cursor-pointer">Combo</Label>
              </div>
            </RadioGroup>

            {productScope === 'individual' ? (
              <div className="space-y-4">
                <div className="flex gap-8">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-items"
                      checked={formData.applyToAllItems}
                      onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllItems: value })}
                    />
                    <Label htmlFor="all-items" className="cursor-pointer">Áp dụng tất cả mặt hàng</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-categories"
                      checked={formData.applyToAllCategories}
                      onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllCategories: value })}
                    />
                    <Label htmlFor="all-categories" className="cursor-pointer">Áp dụng tất cả danh mục</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Items Dropdown */}
                  {!formData.applyToAllItems && (
                    <div className="space-y-2">
                      <Label className="block">Danh sách mặt hàng được áp dụng</Label>
                      <div className="space-y-2">
                        {formData.applicableItemIds && formData.applicableItemIds.length > 0 && (
                          <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                            {formData.applicableItemIds.map((item) => (
                              <div key={item} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-1.5 rounded text-sm">
                                <span className="flex-1">{getItemName(item)}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    applicableItemIds: formData.applicableItemIds?.filter(i => i !== item)
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
                            <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                              <Plus className="w-4 h-4 mr-2 text-blue-600" />
                              Thêm mặt hàng
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-2" align="start">
                            <div className="space-y-2">
                              <Input
                                value={applicableItemSearch}
                                onChange={(e) => setApplicableItemSearch(e.target.value)}
                                placeholder="Tìm theo mã hoặc tên"
                                className="bg-white border-slate-300"
                              />
                              <div className="max-h-48 overflow-y-auto space-y-1">
                                {allItems
                                  .filter(item =>
                                    item.name.toLowerCase().includes(applicableItemSearch.toLowerCase()) ||
                                    item.code.toLowerCase().includes(applicableItemSearch.toLowerCase())
                                  )
                                  .map((item) => {
                                    const isChecked = applicableItemSelections.includes(item);
                                    return (
                                      <label
                                        key={item.id}
                                        className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked: boolean) => {
                                            setApplicableItemSelections((prev) => {
                                              if (checked === true) {
                                                if (prev.includes(item)) return prev;
                                                return [...prev, item];
                                              }
                                              return prev.filter((selected) => selected !== item);
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
                              </div>
                              <div className="flex justify-end pt-2 border-t">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={addSelectedApplicableItems}
                                  disabled={!applicableItemSelections.length}
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Thêm {applicableItemSelections.length > 0 ? `(${applicableItemSelections.length})` : ''}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  {/* Categories Dropdown */}
                  {!formData.applyToAllCategories && (
                    <div className="space-y-2">
                      <Label className="block">Danh sách danh mục được áp dụng</Label>
                      <div className="space-y-2">
                        {formData.applicableCategoryIds && formData.applicableCategoryIds.length > 0 && (
                          <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                            {formData.applicableCategoryIds.map((cat) => (
                              <div key={cat} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded text-sm">
                                <span>{getCategoryName(cat)}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    applicableCategoryIds: formData.applicableCategoryIds?.filter(c => c !== cat)
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
                            <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                              <Plus className="w-4 h-4 mr-2 text-blue-600" />
                              Thêm danh mục
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-2" align="start">
                            <div className="space-y-2">
                              <Input
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="Tìm theo tên danh mục"
                                className="bg-white border-slate-300"
                              />
                              <div className="max-h-48 overflow-y-auto space-y-1">
                                {allCategories
                                  .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                  .map((cat) => {
                                    const isChecked = applicableCategorySelections.includes(cat);
                                    return (
                                      <label
                                        key={cat.id}
                                        className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked: boolean) => {
                                            setApplicableCategorySelections((prev) => {
                                              if (checked === true) {
                                                if (prev.includes(cat)) return prev;
                                                return [...prev, cat];
                                              }
                                              return prev.filter((selected) => selected !== cat);
                                            });
                                          }}
                                        />
                                        <span className="flex-1">{cat.name}</span>
                                      </label>
                                    );
                                  })}
                              </div>
                              <div className="flex justify-end pt-2 border-t">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={addSelectedCategories}
                                  disabled={!applicableCategorySelections.length}
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Thêm {applicableCategorySelections.length > 0 ? `(${applicableCategorySelections.length})` : ''}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-combos"
                    checked={formData.applyToAllCombos}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, applyToAllCombos: checked })}
                  />
                  <Label htmlFor="all-combos" className="cursor-pointer">Áp dụng tất cả combo</Label>
                </div>
                {!formData.applyToAllCombos && (
                  <div className="space-y-2 max-w-md">
                    <Label className="block">Danh sách combo được áp dụng</Label>
                    <div className="space-y-2">
                      {formData.applicableComboIds && formData.applicableComboIds.length > 0 && (
                        <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                          {formData.applicableComboIds.map((combo) => (
                            <div key={combo} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded text-sm">
                              <span>{getComboName(combo)}</span>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  applicableComboIds: formData.applicableComboIds?.filter(c => c !== combo)
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
                          <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                            <Plus className="w-4 h-4 mr-2 text-blue-600" />
                            Thêm combo
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2" align="start">
                          <div className="space-y-2">
                            <Input
                              value={comboSearch}
                              onChange={(e) => setComboSearch(e.target.value)}
                              placeholder="Tìm theo tên combo"
                              className="bg-white border-slate-300"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {allCombos
                                .filter(combo => combo.name.toLowerCase().includes(comboSearch.toLowerCase()))
                                .map((combo) => {
                                  const isChecked = applicableComboSelections.includes(combo);
                                  return (
                                    <label
                                      key={combo.id}
                                      className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked: boolean) => {
                                          setApplicableComboSelections((prev) => {
                                            if (checked === true) {
                                              if (prev.includes(combo)) return prev;
                                              return [...prev, combo];
                                            }
                                            return prev.filter((selected) => selected !== combo);
                                          });
                                        }}
                                      />
                                      <span className="flex-1">{combo.name}</span>
                                    </label>
                                  );
                                })}
                            </div>
                            <div className="flex justify-end pt-2 border-t">
                              <Button
                                type="button"
                                size="sm"
                                onClick={addSelectedCombos}
                                disabled={!applicableComboSelections.length}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Thêm {applicableComboSelections.length > 0 ? `(${applicableComboSelections.length})` : ''}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Scope */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-base font-semibold text-slate-900">Phạm vi đối với khách hàng</h3>
            <div className="flex gap-8 flex-wrap">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="walk-in"
                  checked={formData.applyToWalkIn}
                  onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToWalkIn: value })}
                />
                <Label htmlFor="walk-in" className="cursor-pointer">Áp dụng cho khách tự do</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-customers"
                  checked={formData.applyToAllCustomers}
                  onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllCustomers: value })}
                />
                <Label htmlFor="all-customers" className="cursor-pointer">Áp dụng tất cả KH</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-groups"
                  checked={formData.applyToAllCustomerGroups}
                  onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllCustomerGroups: value })}
                />
                <Label htmlFor="all-groups" className="cursor-pointer">Áp dụng tất cả nhóm KH</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Customers Dropdown */}
              {!formData.applyToAllCustomers && (
                <div className="space-y-2">
                  <Label className="block">Danh sách khách hàng được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCustomerIds && formData.applicableCustomerIds.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                        {formData.applicableCustomerIds.map((customer) => (
                          <div key={customer} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-1.5 rounded text-sm">
                            <span className="flex-1">{getCustomerName(customer)}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCustomerIds: formData.applicableCustomerIds?.filter(c => c !== customer)
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
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                          <Plus className="w-4 h-4 mr-2 text-blue-600" />
                          Thêm khách hàng
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-2" align="start">
                        <div className="space-y-2">
                          <Input
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Tìm theo mã hoặc tên"
                            className="bg-white border-slate-300"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {allCustomers
                              .filter(c =>
                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                c.code.toLowerCase().includes(customerSearch.toLowerCase())
                              )
                              .map((customer) => {
                                const isChecked = applicableCustomerSelections.includes(customer);
                                return (
                                  <label
                                    key={customer.id}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked: boolean) => {
                                        setApplicableCustomerSelections((prev) => {
                                          if (checked === true) {
                                            if (prev.includes(customer)) return prev;
                                            return [...prev, customer];
                                          }
                                          return prev.filter((selected) => selected !== customer);
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
                          </div>
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              type="button"
                              size="sm"
                              onClick={addSelectedCustomers}
                              disabled={!applicableCustomerSelections.length}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Thêm {applicableCustomerSelections.length > 0 ? `(${applicableCustomerSelections.length})` : ''}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Customer Groups Dropdown */}
              {!formData.applyToAllCustomerGroups && (
                <div className="space-y-2">
                  <Label className="block">Danh sách nhóm khách hàng được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCustomerGroupIds && formData.applicableCustomerGroupIds.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                        {formData.applicableCustomerGroupIds.map((group) => (
                          <div key={group} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded text-sm">
                            <span>{getCustomerGroupName(group)}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCustomerGroupIds: formData.applicableCustomerGroupIds?.filter(g => g !== group)
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
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                          <Plus className="w-4 h-4 mr-2 text-blue-600" />
                          Thêm nhóm khách hàng
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-2" align="start">
                        <div className="space-y-2">
                          <Input
                            value={customerGroupSearch}
                            onChange={(e) => setCustomerGroupSearch(e.target.value)}
                            placeholder="Tìm theo tên nhóm"
                            className="bg-white border-slate-300"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {allCustomerGroups
                              .filter(g => g.name.toLowerCase().includes(customerGroupSearch.toLowerCase()))
                              .map((group) => {
                                const isChecked = applicableCustomerGroupSelections.includes(group);
                                return (
                                  <label
                                    key={group.id}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked: boolean) => {
                                        setApplicableCustomerGroupSelections((prev) => {
                                          if (checked === true) {
                                            if (prev.includes(group)) return prev;
                                            return [...prev, group];
                                          }
                                          return prev.filter((selected) => selected !== group);
                                        });
                                      }}
                                    />
                                    <span className="flex-1">{group.name}</span>
                                  </label>
                                );
                              })}
                          </div>
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              type="button"
                              size="sm"
                              onClick={addSelectedCustomerGroups}
                              disabled={!applicableCustomerGroupSelections.length}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Thêm {applicableCustomerGroupSelections.length > 0 ? `(${applicableCustomerGroupSelections.length})` : ''}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gift Items - Only for certain types */}
          {showFreeItems && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-base font-semibold text-slate-900">Danh sách mặt hàng được tặng</h3>
              <div className="space-y-2 max-w-md">
                {formData.giftItemIds && formData.giftItemIds.length > 0 && (
                  <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                    {formData.giftItemIds.map((item) => (
                      <div key={item} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-1.5 rounded text-sm">
                        <span className="flex-1">{getItemName(item)}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            giftItemIds: formData.giftItemIds?.filter(i => i !== item)
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
                    <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                      <Plus className="w-4 h-4 mr-2 text-blue-600" />
                      Thêm mặt hàng tặng
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-2" align="start">
                    <div className="space-y-2">
                      <Input
                        value={giftItemSearch}
                        onChange={(e) => setGiftItemSearch(e.target.value)}
                        placeholder="Tìm theo mã hoặc tên"
                        className="bg-white border-slate-300"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {allItems
                          .filter(item =>
                            item.name.toLowerCase().includes(giftItemSearch.toLowerCase()) ||
                            item.code.toLowerCase().includes(giftItemSearch.toLowerCase())
                          )
                          .map((item) => {
                            const isChecked = giftItemSelections.includes(item);
                            return (
                              <label
                                key={item.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked: boolean) => {
                                    setGiftItemSelections((prev) => {
                                      if (checked === true) {
                                        if (prev.includes(item)) return prev;
                                        return [...prev, item];
                                      }
                                      return prev.filter((selected) => selected !== item);
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
                      </div>
                      <div className="flex justify-end pt-2 border-t">
                        <Button
                          type="button"
                          size="sm"
                          onClick={addSelectedGiftItems}
                          disabled={!giftItemSelections.length}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Thêm {giftItemSelections.length > 0 ? `(${giftItemSelections.length})` : ''}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

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
    </Dialog >

  );
}

export function PromotionAddFormDialog({
  open,
  onClose,
  onSubmit
}: PromotionAddFormDialogProps) {
  const [formData, setFormData] = useState<AddPromotion>({
    name: "",
    description: "",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    buyQuantity: 0,
    getQuantity: 0,
    requireSameItem: false,
    startDateTime: formatDateTimeLocal(new Date()),
    endDateTime: formatDateTimeLocal(getNextMonth()),
    maxTotalUsage: undefined,
    maxUsagePerCustomer: undefined,
    currentTotalUsage: 0,
    isActive: true,

    applyToAllItems: false,
    applyToAllCategories: false,
    applyToAllCombos: false,
    applyToAllCustomers: false,
    applyToAllCustomerGroups: false,
    applyToWalkIn: false,

    applicableItemIds: [],
    applicableCategoryIds: [],
    applicableComboIds: [],
    applicableCustomerIds: [],
    applicableCustomerGroupIds: [],
    giftItemIds: [],

    typeId: 1
  });
  const [applicableItemSearch, setApplicableItemSearch] = useState('');
  const [giftItemSearch, setGiftItemSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [comboSearch, setComboSearch] = useState('');
  const [customerGroupSearch, setCustomerGroupSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const [applicableItemSelections, setApplicableItemSelections] = useState<Item[]>([]);
  const [giftItemSelections, setGiftItemSelections] = useState<Item[]>([]);
  const [applicableCategorySelections, setApplicableCategorySelections] = useState<Category[]>([]);
  const [applicableComboSelections, setApplicableComboSelections] = useState<Combo[]>([]);
  const [applicableCustomerGroupSelections, setApplicableCustomerGroupSelections] = useState<CustomerGroup[]>([]);
  const [applicableCustomerSelections, setApplicableCustomerSelections] = useState<Customer[]>([]);
  const [productScope, setProductScope] = useState<'individual' | 'combo'>('individual');

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allCombos, setAllCombos] = useState<Combo[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allCustomerGroups, setAllCustomerGroups] = useState<CustomerGroup[]>([]);

  const fetchAllData = async () => {
    // Fetch items
    const itemRes = await getInventoryItems();
    if (itemRes) {
      const { items } = itemRes.data.metaData;
      if (items) {
        setAllItems(items);
      }
    }

    // Fetch categories
    const categoryRes = await getInventoryItemCategories();
    if (categoryRes) {
      const { metaData } = categoryRes.data;
      if (metaData) {
        setAllCategories(metaData);
      }
    }

    //Fetch combos
    const comboRes = await getActiveCombos();
    if (comboRes) {
      const { metaData } = comboRes.data;
      if (metaData) {
        setAllCombos(metaData);
      }
    }

    //Fetch customer
    const customerRes = await getCustomers();
    if (customerRes) {
      const { customers } = customerRes.data.metaData;
      if (customers) {
        setAllCustomers(customers);
      }
    }

    //Fetch customer groups
    const customerGroupRes = await getCustomerGroups();
    if (customerGroupRes) {
      const { groups } = customerGroupRes.data.metaData;
      if (groups) {
        setAllCustomerGroups(groups);
      }
    }

    //Fetch applicables
    // const promotionRes = await getPromotionById(editingPromotion.id);
    // if (promotionRes) {
    //   const { promotion } = promotionRes.data.metaData;
    //   if (promotion) {
    //     const { applicableItems, applicableCategories, applicableCombos, applicableCustomers, applicableCustomerGroups, giftItems } = promotion;
    //     let tempApplicableItemIds: number[] = [];
    //     let tempApplicableCategoryIds: number[] = [];
    //     let tempApplicableComboIds: number[] = [];
    //     let tempApplicableCustomerIds: number[] = [];
    //     let tempApplicableCustomerGroupIds: number[] = [];
    //     let tempGiftItemIds: number[] = [];

    //     if (applicableItems) {
    //       applicableItems.map((item) => {
    //         tempApplicableItemIds.push(item.id)
    //       })
    //     }
    //     if (applicableCategories) {

    //       applicableCategories.map((cat) => {
    //         tempApplicableCategoryIds.push(cat.id)
    //       })
    //     }
    //     if (applicableCombos) {

    //       applicableCombos.map((combo) => {
    //         tempApplicableComboIds.push(combo.id)
    //       })
    //     }
    //     if (applicableCustomers) {

    //       applicableCustomers.map((customer) => {
    //         tempApplicableCustomerIds.push(customer.id)
    //       })
    //     }
    //     if (applicableCustomerGroups) {

    //       applicableCustomerGroups.map((customerGroup) => {
    //         tempApplicableCustomerGroupIds.push(customerGroup.id)
    //       })
    //     }
    //     if (giftItems) {

    //       giftItems.map((item) => {
    //         tempGiftItemIds.push(item.id)
    //       })
    //     }
    //     let tempFormData: EditPromotion = {
    //       id: editingPromotion.id,
    //       code: editingPromotion.code,
    //       name: editingPromotion.name,
    //       description: editingPromotion.description,
    //       discountValue: editingPromotion.discountValue,
    //       minOrderValue: editingPromotion.minOrderValue,
    //       maxDiscount: editingPromotion.maxDiscount,
    //       buyQuantity: editingPromotion.buyQuantity,
    //       getQuantity: editingPromotion.getQuantity,
    //       requireSameItem: editingPromotion.requireSameItem,
    //       startDateTime: editingPromotion.startDateTime,
    //       endDateTime: editingPromotion.endDateTime,
    //       maxTotalUsage: editingPromotion.maxTotalUsage,
    //       maxUsagePerCustomer: editingPromotion.maxUsagePerCustomer,
    //       currentTotalUsage: editingPromotion.currentTotalUsage,
    //       isActive: editingPromotion.isActive,

    //       applyToAllItems: editingPromotion.applyToAllItems,
    //       applyToAllCategories: editingPromotion.applyToAllCategories,
    //       applyToAllCombos: editingPromotion.applyToAllCombos,
    //       applyToAllCustomers: editingPromotion.applyToAllCustomers,
    //       applyToAllCustomerGroups: editingPromotion.applyToAllCustomerGroups,
    //       applyToWalkIn: editingPromotion.applyToWalkIn,

    //       applicableItemIds: tempApplicableItemIds,
    //       applicableCategoryIds: tempApplicableCategoryIds,
    //       applicableComboIds: tempApplicableComboIds,
    //       applicableCustomerIds: tempApplicableCustomerIds,
    //       applicableCustomerGroupIds: tempApplicableCustomerGroupIds,
    //       giftItemIds: tempGiftItemIds,

    //       typeId: editingPromotion.typeId
    //     }
    //     // console.log("Temp form data: ", tempFormData);
    //     setFormData(tempFormData);

    //     // console.log("items: ", tempApplicableItemIds);
    //     // console.log("categories: ", tempApplicableCategoryIds);
    //     // console.log("combos: ", tempApplicableComboIds);
    //     // console.log("customers: ", tempApplicableCustomerIds);
    //     // console.log("customer groups: ", tempApplicableCustomerGroupIds);
    //     // console.log("gift items: ", tempGiftItemIds);
    //   }
    // }
  }

  const getItemName = (id: number) => {
    return allItems.find(i => i.id === id)?.name || "";
  }

  const getCategoryName = (id: number) => {
    return allCategories.find(c => c.id === id)?.name || "";
  }

  const getComboName = (id: number) => {
    return allCombos.find(c => c.id === id)?.name || "";
  }

  const getCustomerName = (id: number) => {
    return allCustomers.find(c => c.id === id)?.name || "";
  }

  const getCustomerGroupName = (id: number) => {
    return allCustomerGroups.find(g => g.id === id)?.name || "";
  }



  useEffect(() => {
    fetchAllData();

  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.maxTotalUsage === undefined || submitData.maxTotalUsage === null || isNaN(submitData.maxTotalUsage)) {
      delete submitData.maxTotalUsage;
    }
    if (submitData.maxUsagePerCustomer === undefined || submitData.maxUsagePerCustomer === null || isNaN(submitData.maxUsagePerCustomer)) {
      delete submitData.maxUsagePerCustomer;
    }
    onSubmit(submitData);
  };

  const showMaxDiscountValue = formData.typeId === 1;
  const showPromotionValue = formData.typeId === 1 || formData.typeId === 2 || formData.typeId === 3;
  const showFreeItems = formData.typeId === 4;

  const checkType = (value: number) => {
    switch (value) {
      case 1:
        return formData.typeId === 4;
      case 10:
        return formData.typeId === 3;
      case 11:
        return formData.typeId === 4 || formData.typeId === 3;
      case 100:
        return formData.typeId === 2;
      case 101:
        return formData.typeId === 2 || formData.typeId === 4;
      case 110:
        return formData.typeId === 2 || formData.typeId === 3;
      case 111:
        return formData.typeId === 2 || formData.typeId === 3 || formData.typeId === 4;
      case 1000:
        return formData.typeId === 1;
      case 1001:
        return formData.typeId === 1 || formData.typeId === 4;
      case 1010:
        return formData.typeId === 1 || formData.typeId === 3;
      case 1011:
        return formData.typeId === 1 || formData.typeId === 3 || formData.typeId === 4;
      case 1100:
        return formData.typeId === 1 || formData.typeId === 2;
      case 1101:
        return formData.typeId === 1 || formData.typeId === 2 || formData.typeId === 4;
      case 1110:
        return formData.typeId === 1 || formData.typeId === 2 || formData.typeId === 3;
      case 1111: return true;
    }
  }

  const addSelectedApplicableItems = () => {
    if (!applicableItemSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableItemIds: [...(prev.applicableItemIds || []), ...applicableItemSelections.map(i => i.id)]
    }));
    setApplicableItemSelections([]);
  };

  const addSelectedGiftItems = () => {
    if (!giftItemSelections.length) return;
    setFormData(prev => ({
      ...prev,
      giftItemIds: [...(prev.giftItemIds || []), ...giftItemSelections.map(i => i.id)]
    }));
    setGiftItemSelections([]);
  };

  const addSelectedCategories = () => {
    if (!applicableCategorySelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableCategoryIds: [...(prev.applicableCategoryIds || []), ...applicableCategorySelections.map(c => c.id)]
    }));
    setApplicableCategorySelections([]);
  };

  const addSelectedCombos = () => {
    if (!applicableComboSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableComboIds: [...(prev.applicableComboIds || []), ...applicableComboSelections.map(c => c.id)]
    }));
    setApplicableComboSelections([]);
  };

  const addSelectedCustomerGroups = () => {
    if (!applicableCustomerGroupSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableCustomerGroupIds: [...(prev.applicableCustomerGroupIds || []), ...applicableCustomerGroupSelections.map(g => g.id)]
    }));
    setApplicableCustomerGroupSelections([]);
  };

  const addSelectedCustomers = () => {
    if (!applicableCustomerSelections.length) return;
    setFormData(prev => ({
      ...prev,
      applicableCustomerIds: [...(prev.applicableCustomerIds || []), ...applicableCustomerSelections.map(c => c.id)]
    }));
    setApplicableCustomerSelections([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[1100px] max-w-[1300px] w-[100vw] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Thêm khuyến mại mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ten KM */}
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
            {/* Mo ta */}
            <div className="col-span-2">
              <Label>
                Mô tả
              </Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                required
              />
            </div>
            {/* Loai KM */}
            <div>
              <Label>
                Loại khuyến mại <span className="text-red-500">*</span>
              </Label>
              <Select
                value={PromotionTypes[formData.typeId]}
                onValueChange={(value: string) => {
                  let type = 1;
                  Object.entries(PromotionTypes).forEach(([key, val]) => {
                    if (val === value) type = Number(key);
                  })
                  setFormData({ ...formData, typeId: type })
                }}
              >
                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Theo phần trăm">Theo phần trăm</SelectItem>
                  <SelectItem value="Theo số tiền">Theo số tiền</SelectItem>
                  <SelectItem value="Đồng giá">Đồng giá</SelectItem>
                  <SelectItem value="Tặng món">Tặng món</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Hoa don toi thieu */}
            {checkType(1110) && (
              <div>
                <Label>
                  Giá trị hóa đơn tối thiểu
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
            {/* Gia tri KM */}
            {checkType(1110) && (
              <div>
                <Label>
                  Giá trị khuyến mại
                </Label>
                <Input
                  type="number"
                  value={formData.discountValue || ''}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  required
                  min="0"
                  placeholder={formData.typeId === 1 ? 'Phần trăm (%)' : 'Số tiền (VNĐ)'}
                />
              </div>
            )}
            {/* Giam toi da */}
            {checkType(1100) && (
              <div>
                <Label>Giá trị giảm giá tối đa</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: !Number.isNaN(Number(e.target.value)) ? Number(e.target.value) : formData.maxDiscount })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  min="0"
                  placeholder="Số tiền (VNĐ)"
                />
              </div>
            )}
            {/* So luong mua */}
            {checkType(1) && (
              <div>
                <Label>Số lượng mua</Label>
                <Input
                  type="number"
                  value={formData.buyQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, buyQuantity: !Number.isNaN(Number(e.target.value)) ? Number(e.target.value) : formData.buyQuantity })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  min="0"
                  placeholder="Số lượng mua"
                />
              </div>
            )}
            {/* So luong nhan */}
            {checkType(1) && (
              <div>
                <Label>Số lượng nhận</Label>
                <Input
                  type="number"
                  value={formData.getQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, getQuantity: !Number.isNaN(Number(e.target.value)) ? Number(e.target.value) : formData.getQuantity })}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  min="0"
                  placeholder="Số lượng nhận"
                />
              </div>
            )
            }
            {/* Thoi gian bat dau */}
            <div>
              <Label>
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5 bg-white border-2 border-slate-300 h-10",
                      !formData.startDateTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDateTime ? (
                      format(new Date(formData.startDateTime), 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDateTime ? new Date(formData.startDateTime) : undefined}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        // Keep as date string for simplicity
                        setFormData({ ...formData, startDateTime: format(date, 'yyyy-MM-dd') });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Thoi gian ket thuc */}
            <div>
              <Label>
                Thời gian kết thúc <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5 bg-white border-2 border-slate-300 h-10",
                      !formData.endDateTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDateTime ? (
                      format(new Date(formData.endDateTime), 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDateTime ? new Date(formData.endDateTime) : undefined}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        setFormData({ ...formData, endDateTime: format(date, 'yyyy-MM-dd') });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* So luot su dung toi da */}
            <div>
              <Label>
                Số lượt sử dụng tối đa
              </Label>
              <Input
                type="number"
                value={formData.maxTotalUsage ?? ''}
                onChange={(e) => setFormData({ ...formData, maxTotalUsage: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                min="0"
                placeholder='Số lượt sử dụng tối đa'
              />
            </div>
            {/* So luot su dung toi da moi khach */}
            <div>
              <Label>
                Số lượt sử dụng tối đa mỗi khách
              </Label>
              <Input
                type="number"
                value={formData.maxUsagePerCustomer ?? ''}
                onChange={(e) => setFormData({ ...formData, maxUsagePerCustomer: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-2"
                min="0"
                placeholder='Số lượt sử dụng tối đa mỗi khách'
              />
            </div>
            {/* Trang thai */}
            <div>
              <Label>
                Trạng thái <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                onValueChange={(value: string) => setFormData({ ...formData, isActive: (value === 'Hoạt động' ? true : false) })}
              >
                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                  <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phai cung mon - Only for certain types */}
          {checkType(1) && (
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                id="requireSameItem-add"
                checked={formData.requireSameItem}
                onCheckedChange={(value: boolean) => setFormData({ ...formData, requireSameItem: value })}
              />
              <Label htmlFor="requireSameItem-add">Phải cùng món</Label>
            </div>
          )}

          {/* Product Scope */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-base font-semibold text-slate-900">Phạm vi đối với sản phẩm</h3>
            <RadioGroup
              value={productScope}
              onValueChange={(value: 'individual' | 'combo') => setProductScope(value)}
              className="flex gap-6 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="add-p1" />
                <Label htmlFor="add-p1" className="cursor-pointer">Riêng lẻ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="combo" id="add-p2" />
                <Label htmlFor="add-p2" className="cursor-pointer">Combo</Label>
              </div>
            </RadioGroup>

            {productScope === 'individual' ? (
              <div className="space-y-4">
                <div className="flex gap-8">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="add-all-items"
                      checked={formData.applyToAllItems}
                      onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllItems: value })}
                    />
                    <Label htmlFor="add-all-items" className="cursor-pointer">Áp dụng tất cả mặt hàng</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="add-all-categories"
                      checked={formData.applyToAllCategories}
                      onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllCategories: value })}
                    />
                    <Label htmlFor="add-all-categories" className="cursor-pointer">Áp dụng tất cả danh mục</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Items Dropdown */}
                  {!formData.applyToAllItems && (
                    <div className="space-y-2">
                      <Label className="block">Danh sách mặt hàng được áp dụng</Label>
                      <div className="space-y-2">
                        {formData.applicableItemIds && formData.applicableItemIds.length > 0 && (
                          <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                            {formData.applicableItemIds.map((item) => (
                              <div key={item} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-1.5 rounded text-sm">
                                <span className="flex-1">{getItemName(item)}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    applicableItemIds: formData.applicableItemIds?.filter(i => i !== item)
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
                            <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                              <Plus className="w-4 h-4 mr-2 text-blue-600" />
                              Thêm mặt hàng
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-2" align="start">
                            <div className="space-y-2">
                              <Input
                                value={applicableItemSearch}
                                onChange={(e) => setApplicableItemSearch(e.target.value)}
                                placeholder="Tìm theo mã hoặc tên"
                                className="bg-white border-slate-300"
                              />
                              <div className="max-h-48 overflow-y-auto space-y-1">
                                {allItems
                                  .filter(item =>
                                    item.name.toLowerCase().includes(applicableItemSearch.toLowerCase()) ||
                                    item.code.toLowerCase().includes(applicableItemSearch.toLowerCase())
                                  )
                                  .map((item) => {
                                    const isChecked = applicableItemSelections.includes(item);
                                    return (
                                      <label
                                        key={item.id}
                                        className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked: boolean) => {
                                            setApplicableItemSelections((prev) => {
                                              if (checked === true) {
                                                if (prev.includes(item)) return prev;
                                                return [...prev, item];
                                              }
                                              return prev.filter((selected) => selected !== item);
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
                              </div>
                              <div className="flex justify-end pt-2 border-t">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={addSelectedApplicableItems}
                                  disabled={!applicableItemSelections.length}
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Thêm {applicableItemSelections.length > 0 ? `(${applicableItemSelections.length})` : ''}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  {/* Categories Dropdown */}
                  {!formData.applyToAllCategories && (
                    <div className="space-y-2">
                      <Label className="block">Danh sách danh mục được áp dụng</Label>
                      <div className="space-y-2">
                        {formData.applicableCategoryIds && formData.applicableCategoryIds.length > 0 && (
                          <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                            {formData.applicableCategoryIds.map((cat) => (
                              <div key={cat} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded text-sm">
                                <span>{getCategoryName(cat)}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    applicableCategoryIds: formData.applicableCategoryIds?.filter(c => c !== cat)
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
                            <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                              <Plus className="w-4 h-4 mr-2 text-blue-600" />
                              Thêm danh mục
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-2" align="start">
                            <div className="space-y-2">
                              <Input
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="Tìm theo tên danh mục"
                                className="bg-white border-slate-300"
                              />
                              <div className="max-h-48 overflow-y-auto space-y-1">
                                {allCategories
                                  .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                  .map((cat) => {
                                    const isChecked = applicableCategorySelections.includes(cat);
                                    return (
                                      <label
                                        key={cat.id}
                                        className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked: boolean) => {
                                            setApplicableCategorySelections((prev) => {
                                              if (checked === true) {
                                                if (prev.includes(cat)) return prev;
                                                return [...prev, cat];
                                              }
                                              return prev.filter((selected) => selected !== cat);
                                            });
                                          }}
                                        />
                                        <span className="flex-1">{cat.name}</span>
                                      </label>
                                    );
                                  })}
                              </div>
                              <div className="flex justify-end pt-2 border-t">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={addSelectedCategories}
                                  disabled={!applicableCategorySelections.length}
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Thêm {applicableCategorySelections.length > 0 ? `(${applicableCategorySelections.length})` : ''}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-all-combos"
                    checked={formData.applyToAllCombos}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, applyToAllCombos: checked })}
                  />
                  <Label htmlFor="add-all-combos" className="cursor-pointer">Áp dụng tất cả combo</Label>
                </div>
                {!formData.applyToAllCombos && (
                  <div className="space-y-2 max-w-md">
                    <Label className="block">Danh sách combo được áp dụng</Label>
                    <div className="space-y-2">
                      {formData.applicableComboIds && formData.applicableComboIds.length > 0 && (
                        <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                          {formData.applicableComboIds.map((combo) => (
                            <div key={combo} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded text-sm">
                              <span>{getComboName(combo)}</span>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  applicableComboIds: formData.applicableComboIds?.filter(c => c !== combo)
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
                          <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                            <Plus className="w-4 h-4 mr-2 text-blue-600" />
                            Thêm combo
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2" align="start">
                          <div className="space-y-2">
                            <Input
                              value={comboSearch}
                              onChange={(e) => setComboSearch(e.target.value)}
                              placeholder="Tìm theo tên combo"
                              className="bg-white border-slate-300"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {allCombos
                                .filter(combo => combo.name.toLowerCase().includes(comboSearch.toLowerCase()))
                                .map((combo) => {
                                  const isChecked = applicableComboSelections.includes(combo);
                                  return (
                                    <label
                                      key={combo.id}
                                      className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked: boolean) => {
                                          setApplicableComboSelections((prev) => {
                                            if (checked === true) {
                                              if (prev.includes(combo)) return prev;
                                              return [...prev, combo];
                                            }
                                            return prev.filter((selected) => selected !== combo);
                                          });
                                        }}
                                      />
                                      <span className="flex-1">{combo.name}</span>
                                    </label>
                                  );
                                })}
                            </div>
                            <div className="flex justify-end pt-2 border-t">
                              <Button
                                type="button"
                                size="sm"
                                onClick={addSelectedCombos}
                                disabled={!applicableComboSelections.length}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Thêm {applicableComboSelections.length > 0 ? `(${applicableComboSelections.length})` : ''}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Scope */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-base font-semibold text-slate-900">Phạm vi đối với khách hàng</h3>
            <div className="flex gap-8 flex-wrap">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add-walk-in"
                  checked={formData.applyToWalkIn}
                  onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToWalkIn: value })}
                />
                <Label htmlFor="add-walk-in" className="cursor-pointer">Áp dụng cho khách tự do</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add-all-customers"
                  checked={formData.applyToAllCustomers}
                  onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllCustomers: value })}
                />
                <Label htmlFor="add-all-customers" className="cursor-pointer">Áp dụng tất cả KH</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add-all-groups"
                  checked={formData.applyToAllCustomerGroups}
                  onCheckedChange={(value: boolean) => setFormData({ ...formData, applyToAllCustomerGroups: value })}
                />
                <Label htmlFor="add-all-groups" className="cursor-pointer">Áp dụng tất cả nhóm KH</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Customers Dropdown */}
              {!formData.applyToAllCustomers && (
                <div className="space-y-2">
                  <Label className="block">Danh sách khách hàng được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCustomerIds && formData.applicableCustomerIds.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                        {formData.applicableCustomerIds.map((customer) => (
                          <div key={customer} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-1.5 rounded text-sm">
                            <span className="flex-1">{getCustomerName(customer)}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCustomerIds: formData.applicableCustomerIds?.filter(c => c !== customer)
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
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                          <Plus className="w-4 h-4 mr-2 text-blue-600" />
                          Thêm khách hàng
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-2" align="start">
                        <div className="space-y-2">
                          <Input
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Tìm theo mã hoặc tên"
                            className="bg-white border-slate-300"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {allCustomers
                              .filter(c =>
                                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                c.code.toLowerCase().includes(customerSearch.toLowerCase())
                              )
                              .map((customer) => {
                                const isChecked = applicableCustomerSelections.includes(customer);
                                return (
                                  <label
                                    key={customer.id}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked: boolean) => {
                                        setApplicableCustomerSelections((prev) => {
                                          if (checked === true) {
                                            if (prev.includes(customer)) return prev;
                                            return [...prev, customer];
                                          }
                                          return prev.filter((selected) => selected !== customer);
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
                          </div>
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              type="button"
                              size="sm"
                              onClick={addSelectedCustomers}
                              disabled={!applicableCustomerSelections.length}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Thêm {applicableCustomerSelections.length > 0 ? `(${applicableCustomerSelections.length})` : ''}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Customer Groups Dropdown */}
              {!formData.applyToAllCustomerGroups && (
                <div className="space-y-2">
                  <Label className="block">Danh sách nhóm khách hàng được áp dụng</Label>
                  <div className="space-y-2">
                    {formData.applicableCustomerGroupIds && formData.applicableCustomerGroupIds.length > 0 && (
                      <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                        {formData.applicableCustomerGroupIds.map((group) => (
                          <div key={group} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-1.5 rounded text-sm">
                            <span>{getCustomerGroupName(group)}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                applicableCustomerGroupIds: formData.applicableCustomerGroupIds?.filter(g => g !== group)
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
                        <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                          <Plus className="w-4 h-4 mr-2 text-blue-600" />
                          Thêm nhóm khách hàng
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-2" align="start">
                        <div className="space-y-2">
                          <Input
                            value={customerGroupSearch}
                            onChange={(e) => setCustomerGroupSearch(e.target.value)}
                            placeholder="Tìm theo tên nhóm"
                            className="bg-white border-slate-300"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {allCustomerGroups
                              .filter(g => g.name.toLowerCase().includes(customerGroupSearch.toLowerCase()))
                              .map((group) => {
                                const isChecked = applicableCustomerGroupSelections.includes(group);
                                return (
                                  <label
                                    key={group.id}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked: boolean) => {
                                        setApplicableCustomerGroupSelections((prev) => {
                                          if (checked === true) {
                                            if (prev.includes(group)) return prev;
                                            return [...prev, group];
                                          }
                                          return prev.filter((selected) => selected !== group);
                                        });
                                      }}
                                    />
                                    <span className="flex-1">{group.name}</span>
                                  </label>
                                );
                              })}
                          </div>
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              type="button"
                              size="sm"
                              onClick={addSelectedCustomerGroups}
                              disabled={!applicableCustomerGroupSelections.length}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Thêm {applicableCustomerGroupSelections.length > 0 ? `(${applicableCustomerGroupSelections.length})` : ''}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gift Items - Only for certain types */}
          {showFreeItems && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-base font-semibold text-slate-900">Danh sách mặt hàng được tặng</h3>
              <div className="space-y-2 max-w-md">
                {formData.giftItemIds && formData.giftItemIds.length > 0 && (
                  <div className="border border-slate-300 rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-white">
                    {formData.giftItemIds.map((item) => (
                      <div key={item} className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-1.5 rounded text-sm">
                        <span className="flex-1">{getItemName(item)}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            giftItemIds: formData.giftItemIds?.filter(i => i !== item)
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
                    <Button type="button" variant="outline" className="w-full justify-start bg-white border-slate-300 shadow-sm">
                      <Plus className="w-4 h-4 mr-2 text-blue-600" />
                      Thêm mặt hàng tặng
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-2" align="start">
                    <div className="space-y-2">
                      <Input
                        value={giftItemSearch}
                        onChange={(e) => setGiftItemSearch(e.target.value)}
                        placeholder="Tìm theo mã hoặc tên"
                        className="bg-white border-slate-300"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {allItems
                          .filter(item =>
                            item.name.toLowerCase().includes(giftItemSearch.toLowerCase()) ||
                            item.code.toLowerCase().includes(giftItemSearch.toLowerCase())
                          )
                          .map((item) => {
                            const isChecked = giftItemSelections.includes(item);
                            return (
                              <label
                                key={item.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked: boolean) => {
                                    setGiftItemSelections((prev) => {
                                      if (checked === true) {
                                        if (prev.includes(item)) return prev;
                                        return [...prev, item];
                                      }
                                      return prev.filter((selected) => selected !== item);
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
                      </div>
                      <div className="flex justify-end pt-2 border-t">
                        <Button
                          type="button"
                          size="sm"
                          onClick={addSelectedGiftItems}
                          disabled={!giftItemSelections.length}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Thêm {giftItemSelections.length > 0 ? `(${giftItemSelections.length})` : ''}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

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
            Thêm khuyến mại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >

  );
}