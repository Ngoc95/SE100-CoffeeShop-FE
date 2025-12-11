import { useState, useEffect } from "react";
import {
  Percent,
  X,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Gift,
  Info,
  User,
  Phone,
  Star,
  Search,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  code?: string;
  membershipTier?: "Đồng" | "Bạc" | "Vàng" | "Kim cương";
  points: number;
}

interface ComboItem {
  category?: string;
  itemName?: string;
  minQuantity: number;
}

interface ComboCondition {
  requiredItems: ComboItem[];
  discount: {
    type: "percentage" | "fixed";
    value: number;
  };
}

interface Promotion {
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "item" | "combo";
  value: number;
  minOrderValue?: number;
  applicableCategories?: string[];
  maxUsage?: number;
  currentUsage?: number;
  expiryDate?: Date;
  isActive: boolean;
  conflictsWith?: string[];
  // NEW: Customer-specific fields
  customerSpecific?: boolean;
  applicableCustomerIds?: string[];
  applicableMembershipTiers?: string[];
  requiresCustomer?: boolean;
  // NEW: Combo-specific fields
  isCombo?: boolean;
  comboCondition?: ComboCondition;
}

interface PromotionPopupProps {
  open: boolean;
  onClose: () => void;
  orderTotal: number;
  orderItems: OrderItem[];
  selectedCustomer?: Customer | null;
  onApply: (
    promotion: Promotion | null,
    pointsToUse?: number,
    customer?: Customer | null
  ) => void;
}

export function PromotionPopup({
  open,
  onClose,
  orderTotal,
  orderItems,
  selectedCustomer: initialCustomer,
  onApply,
}: PromotionPopupProps) {
  const [promoCode, setPromoCode] = useState("");
  const [validationState, setValidationState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // NEW: Customer selection state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialCustomer || null
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // NEW: Combo expansion state
  const [expandedCombos, setExpandedCombos] = useState<Set<string>>(new Set());

  // Mock customer database
  const mockCustomers: Customer[] = [
    {
      id: "KH001",
      name: "Nguyễn Văn An",
      phone: "0901234567",
      code: "KH001",
      membershipTier: "Vàng",
      points: 250,
    },
    {
      id: "KH002",
      name: "Trần Thị Bình",
      phone: "0907654321",
      code: "KH002",
      membershipTier: "Bạc",
      points: 120,
    },
    {
      id: "KH003",
      name: "Lê Hoàng Cường",
      phone: "0912345678",
      code: "KH003",
      membershipTier: "Kim cương",
      points: 500,
    },
    {
      id: "KH004",
      name: "Phạm Minh Đức",
      phone: "0923456789",
      code: "KH004",
      membershipTier: "Đồng",
      points: 50,
    },
  ];

  // Mock promotions data with customer-specific fields
  const availablePromotions: Promotion[] = [
    {
      code: "KM10",
      name: "Giảm 10% hóa đơn",
      description: "Giảm 10% tổng giá trị hóa đơn",
      type: "percentage",
      value: 10,
      minOrderValue: 100000,
      isActive: true,
      maxUsage: 100,
      currentUsage: 45,
      applicableMembershipTiers: ["Bạc", "Vàng", "Kim cương"],
    },
    {
      code: "VIPGOLD",
      name: "Ưu đãi VIP Vàng",
      description: "Giảm 15% dành riêng cho hạng Vàng",
      type: "percentage",
      value: 15,
      minOrderValue: 50000,
      isActive: true,
      customerSpecific: true,
      applicableMembershipTiers: ["Vàng"],
      requiresCustomer: true,
    },
    {
      code: "GIAMCF",
      name: "Giảm 5.000đ Cà phê",
      description: "Giảm 5.000đ cho món Cà phê",
      type: "item",
      value: 5000,
      applicableCategories: ["coffee"],
      isActive: true,
      maxUsage: 50,
      currentUsage: 30,
    },
    {
      code: "DIAMOND20",
      name: "Kim cương giảm 20%",
      description: "Giảm 20% cho khách hàng Kim cương",
      type: "percentage",
      value: 20,
      minOrderValue: 200000,
      isActive: true,
      customerSpecific: true,
      applicableMembershipTiers: ["Kim cương"],
      requiresCustomer: true,
    },
    {
      code: "GIAM20K",
      name: "Giảm 20.000đ hóa đơn",
      description: "Giảm 20.000đ cho đơn hàng",
      type: "fixed",
      value: 20000,
      minOrderValue: 150000,
      isActive: true,
      conflictsWith: ["KM10"],
    },
    {
      code: "KHCU001",
      name: "Ưu đãi khách hàng Nguyễn Văn An",
      description: "Giảm 30.000đ dành riêng",
      type: "fixed",
      value: 30000,
      isActive: true,
      customerSpecific: true,
      applicableCustomerIds: ["KH001"],
      requiresCustomer: true,
    },
    {
      code: "TRATHANH",
      name: "Giảm 10.000đ Trà",
      description: "Giảm 10.000đ cho món Trà",
      type: "item",
      value: 10000,
      applicableCategories: ["tea"],
      isActive: true,
    },
    // NEW: Combo Promotions
    {
      code: "COMBO1CF",
      name: "Combo 1 Cà phê + 1 Bánh",
      description: "Mua 1 Cà phê + 1 Bánh giảm 20.000đ",
      type: "combo",
      value: 20000,
      isActive: true,
      isCombo: true,
      comboCondition: {
        requiredItems: [
          { category: "coffee", minQuantity: 1 },
          { category: "pastry", minQuantity: 1 },
        ],
        discount: { type: "fixed", value: 20000 },
      },
    },
    {
      code: "COMBO2TRA",
      name: "Combo 2 Trà + 1 Sinh tố",
      description: "Mua 2 Trà + 1 Sinh tố giảm 15%",
      type: "combo",
      value: 15,
      isActive: true,
      isCombo: true,
      comboCondition: {
        requiredItems: [
          { category: "tea", minQuantity: 2 },
          { category: "smoothie", minQuantity: 1 },
        ],
        discount: { type: "percentage", value: 15 },
      },
      applicableMembershipTiers: ["Vàng", "Kim cương"],
    },
    {
      code: "COMBOVIP",
      name: "Combo VIP 3 Cà phê",
      description: "Mua 3 Cà phê giảm 30.000đ",
      type: "combo",
      value: 30000,
      minOrderValue: 100000,
      isActive: true,
      isCombo: true,
      comboCondition: {
        requiredItems: [{ category: "coffee", minQuantity: 3 }],
        discount: { type: "fixed", value: 30000 },
      },
      customerSpecific: true,
      applicableMembershipTiers: ["Vàng", "Kim cương"],
      requiresCustomer: true,
    },
  ];

  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomer(initialCustomer);
    }
  }, [initialCustomer]);

  const validatePromoCode = (
    code: string,
    customer: Customer | null = selectedCustomer
  ) => {
    setValidationState("loading");

    // Simulate API call
    setTimeout(() => {
      const promo = availablePromotions.find(
        (p) => p.code.toLowerCase() === code.toLowerCase()
      );

      if (!promo) {
        setValidationState("error");
        setValidationMessage("Mã không hợp lệ");
        return;
      }

      if (!promo.isActive) {
        setValidationState("error");
        setValidationMessage("Mã khuyến mãi đã hết hạn");
        return;
      }

      // Check customer requirement
      if (promo.requiresCustomer && !customer) {
        setValidationState("error");
        setValidationMessage("Mã này yêu cầu chọn khách hàng");
        return;
      }

      // Check customer-specific eligibility
      if (customer && promo.customerSpecific) {
        if (
          promo.applicableCustomerIds &&
          !promo.applicableCustomerIds.includes(customer.id)
        ) {
          setValidationState("error");
          setValidationMessage("Mã này không áp dụng cho khách hàng này");
          return;
        }

        if (
          promo.applicableMembershipTiers &&
          customer.membershipTier &&
          !promo.applicableMembershipTiers.includes(customer.membershipTier)
        ) {
          setValidationState("error");
          setValidationMessage(
            `Mã này chỉ áp dụng cho hạng: ${promo.applicableMembershipTiers.join(
              ", "
            )}`
          );
          return;
        }
      }

      if (promo.minOrderValue && orderTotal < promo.minOrderValue) {
        setValidationState("error");
        setValidationMessage(
          `Đơn hàng phải từ ${promo.minOrderValue.toLocaleString("vi-VN")}đ`
        );
        return;
      }

      if (
        promo.maxUsage &&
        promo.currentUsage &&
        promo.currentUsage >= promo.maxUsage
      ) {
        setValidationState("error");
        setValidationMessage("Mã khuyến mãi đã hết lượt sử dụng");
        return;
      }

      setValidationState("success");
      setValidationMessage("Mã hợp lệ");
      setSelectedPromo(promo);
    }, 500);
  };

  const handleApplyCode = () => {
    if (!promoCode.trim()) return;
    validatePromoCode(promoCode);
  };

  const calculateDiscount = (promo: Promotion | null) => {
    if (!promo) return { orderDiscount: 0, itemDiscounts: [], total: 0 };

    let orderDiscount = 0;
    const itemDiscounts: { itemName: string; discount: number }[] = [];

    if (promo.type === "percentage") {
      orderDiscount = (orderTotal * promo.value) / 100;
    } else if (promo.type === "fixed") {
      orderDiscount = promo.value;
    } else if (promo.type === "item" && promo.applicableCategories) {
      orderItems.forEach((item) => {
        if (
          item.category &&
          promo.applicableCategories?.includes(item.category)
        ) {
          const discount = Math.min(
            promo.value * item.quantity,
            item.price * item.quantity
          );
          itemDiscounts.push({ itemName: item.name, discount });
        }
      });
    } else if (promo.type === "combo" && promo.isCombo) {
      // Calculate combo discount
      const comboStatus = checkComboEligibility(promo);
      if (comboStatus.eligible) {
        orderDiscount = comboStatus.totalDiscount;
      }
    }

    const totalItemDiscount = itemDiscounts.reduce(
      (sum, item) => sum + item.discount,
      0
    );
    const totalDiscount = orderDiscount + totalItemDiscount;

    return { orderDiscount, itemDiscounts, total: totalDiscount };
  };

  const getPromoTypeLabel = (type: Promotion["type"]) => {
    switch (type) {
      case "percentage":
        return "% Hóa đơn";
      case "fixed":
        return "Giảm tiền";
      case "item":
        return "Theo món";
      case "combo":
        return "Combo";
    }
  };

  const getPromoTypeBadgeColor = (type: Promotion["type"]) => {
    switch (type) {
      case "percentage":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "fixed":
        return "bg-green-100 text-green-700 border-green-300";
      case "item":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "combo":
        return "bg-orange-100 text-orange-700 border-orange-300";
    }
  };

  const getMembershipTierColor = (tier?: string) => {
    switch (tier) {
      case "Kim cương":
        return "bg-cyan-100 text-cyan-700 border-cyan-300";
      case "Vàng":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Bạc":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "Đồng":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const isPromoApplicable = (promo: Promotion) => {
    if (!promo.isActive) return { applicable: false, reason: "Mã đã hết hạn" };

    // Check customer requirement
    if (promo.requiresCustomer && !selectedCustomer) {
      return { applicable: false, reason: "Yêu cầu chọn khách hàng" };
    }

    // Check customer-specific eligibility
    if (selectedCustomer && promo.customerSpecific) {
      if (
        promo.applicableCustomerIds &&
        !promo.applicableCustomerIds.includes(selectedCustomer.id)
      ) {
        return {
          applicable: false,
          reason: "Mã này chỉ áp dụng cho khách hàng khác",
        };
      }

      if (
        promo.applicableMembershipTiers &&
        selectedCustomer.membershipTier &&
        !promo.applicableMembershipTiers.includes(
          selectedCustomer.membershipTier
        )
      ) {
        return {
          applicable: false,
          reason: `Yêu cầu hạng: ${promo.applicableMembershipTiers.join(", ")}`,
        };
      }
    }

    // If promo has membership requirement but no customer selected
    if (
      !selectedCustomer &&
      promo.applicableMembershipTiers &&
      promo.applicableMembershipTiers.length > 0
    ) {
      return {
        applicable: false,
        reason: `Yêu cầu hạng: ${promo.applicableMembershipTiers.join(", ")}`,
      };
    }

    if (promo.minOrderValue && orderTotal < promo.minOrderValue) {
      return {
        applicable: false,
        reason: `Đơn hàng phải từ ${promo.minOrderValue.toLocaleString(
          "vi-VN"
        )}đ`,
      };
    }

    if (
      promo.maxUsage &&
      promo.currentUsage &&
      promo.currentUsage >= promo.maxUsage
    ) {
      return { applicable: false, reason: "Đã hết lượt sử dụng" };
    }

    if (selectedPromo && promo.conflictsWith?.includes(selectedPromo.code)) {
      return {
        applicable: false,
        reason: `Xung đột với mã ${selectedPromo.code}`,
      };
    }

    return { applicable: true, reason: "" };
  };

  const isCustomerEligible = (promo: Promotion) => {
    if (!selectedCustomer) return false;
    if (!promo.customerSpecific) return true;

    if (
      promo.applicableCustomerIds &&
      !promo.applicableCustomerIds.includes(selectedCustomer.id)
    ) {
      return false;
    }

    if (
      promo.applicableMembershipTiers &&
      selectedCustomer.membershipTier &&
      !promo.applicableMembershipTiers.includes(selectedCustomer.membershipTier)
    ) {
      return false;
    }

    return true;
  };

  // NEW: Check combo eligibility
  const checkComboEligibility = (promo: Promotion) => {
    if (!promo.isCombo || !promo.comboCondition) {
      return {
        eligible: false,
        timesApplicable: 0,
        matchedItems: [],
        missingItems: [],
        totalDiscount: 0,
      };
    }

    const requiredItems = promo.comboCondition.requiredItems;
    const matchedItems: OrderItem[] = [];
    const missingItems: ComboItem[] = [];

    // Count available items by category
    const categoryCount: {
      [key: string]: { total: number; items: OrderItem[] };
    } = {};
    orderItems.forEach((item) => {
      if (item.category) {
        if (!categoryCount[item.category]) {
          categoryCount[item.category] = { total: 0, items: [] };
        }
        categoryCount[item.category].total += item.quantity;
        categoryCount[item.category].items.push(item);
      }
    });

    // Check if all required items are available
    let minTimesApplicable = Infinity;
    let allRequirementsMet = true;

    requiredItems.forEach((required) => {
      if (required.category) {
        const available = categoryCount[required.category]?.total || 0;
        const times = Math.floor(available / required.minQuantity);

        if (times === 0) {
          allRequirementsMet = false;
          missingItems.push(required);
        } else {
          minTimesApplicable = Math.min(minTimesApplicable, times);
          // Add matched items
          categoryCount[required.category]?.items.forEach((item) => {
            if (!matchedItems.find((m) => m.id === item.id)) {
              matchedItems.push(item);
            }
          });
        }
      }
    });

    const timesApplicable = allRequirementsMet ? minTimesApplicable : 0;

    // Calculate total discount
    let totalDiscount = 0;
    if (timesApplicable > 0) {
      if (promo.comboCondition.discount.type === "fixed") {
        totalDiscount = promo.comboCondition.discount.value * timesApplicable;
      } else if (promo.comboCondition.discount.type === "percentage") {
        // Calculate based on matched items total
        const matchedTotal = matchedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        totalDiscount =
          ((matchedTotal * promo.comboCondition.discount.value) / 100) *
          timesApplicable;
      }
    }

    return {
      eligible: allRequirementsMet,
      timesApplicable,
      matchedItems,
      missingItems,
      totalDiscount,
    };
  };

  const discount = calculateDiscount(selectedPromo);
  const customerPoints = selectedCustomer?.points || 0;
  const pointsValue = pointsToUse * 10; // 1 điểm = 10đ
  const totalSavings = discount.total + pointsValue;
  const finalTotal = Math.max(0, orderTotal - totalSavings);

  const autocompleteMatches = availablePromotions.filter(
    (p) =>
      p.code.toLowerCase().includes(promoCode.toLowerCase()) &&
      p.isActive &&
      promoCode.length > 0
  );

  const customerMatches = mockCustomers.filter(
    (c) =>
      (c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch) ||
        c.code?.toLowerCase().includes(customerSearch.toLowerCase())) &&
      customerSearch.length > 0
  );

  const handleApply = () => {
    if (!selectedPromo && pointsToUse === 0) {
      toast.error("Vui lòng chọn khuyến mãi hoặc nhập điểm");
      return;
    }

    if (selectedPromo?.requiresCustomer && !selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng");
      return;
    }

    onApply(selectedPromo, pointsToUse, selectedCustomer);
    toast.success(
      `Đã áp dụng! Tiết kiệm ${totalSavings.toLocaleString("vi-VN")}đ`
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-blue-600" />
              Khuyến mãi
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* NEW Section: Customer Selector */}
          <div className="space-y-2 pb-4 border-b border-slate-200">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Áp dụng cho khách hàng
            </Label>

            {!selectedCustomer ? (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Nhập tên / SĐT / mã khách hàng..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerSearch(true);
                    }}
                    onFocus={() => setShowCustomerSearch(true)}
                    className="pl-10 bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>

                {/* Customer search results */}
                {showCustomerSearch && customerMatches.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {customerMatches.map((customer) => (
                      <button
                        key={customer.id}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch("");
                          setShowCustomerSearch(false);
                          setPointsToUse(0);
                          // Re-validate selected promo with new customer
                          if (selectedPromo) {
                            validatePromoCode(selectedPromo.code, customer);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm text-slate-900">
                              {customer.name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </span>
                              {customer.code && <span>• {customer.code}</span>}
                            </div>
                          </div>
                          {customer.membershipTier && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${getMembershipTierColor(
                                customer.membershipTier
                              )}`}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {customer.membershipTier}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-3 bg-slate-50 border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-slate-600" />
                      <h4 className="text-sm text-slate-900">
                        {selectedCustomer.name}
                      </h4>
                      {selectedCustomer.membershipTier && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getMembershipTierColor(
                            selectedCustomer.membershipTier
                          )}`}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {selectedCustomer.membershipTier}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedCustomer.phone}
                      </p>
                      {selectedCustomer.code && (
                        <p>Mã KH: {selectedCustomer.code}</p>
                      )}
                      <p className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {selectedCustomer.points} điểm
                      </p>
                    </div>

                    {/* Customer eligibility badge for selected promo */}
                    {selectedPromo && (
                      <div className="mt-2 pt-2 border-t border-slate-300">
                        {isCustomerEligible(selectedPromo) ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Khách hàng phù hợp
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Mã này chỉ áp dụng cho khách hàng khác
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setPointsToUse(0);
                      // Re-validate selected promo without customer
                      if (selectedPromo) {
                        validatePromoCode(selectedPromo.code, null);
                      }
                    }}
                    className="h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Section: Enter Promo Code */}
          <div className="space-y-2">
            <Label>Nhập mã khuyến mãi</Label>
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <Input
                  placeholder="Nhập mã khuyến mãi..."
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setShowAutocomplete(true);
                    setValidationState("idle");
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />

                {/* Autocomplete suggestions */}
                {showAutocomplete && autocompleteMatches.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {autocompleteMatches.map((promo) => (
                      <button
                        key={promo.code}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                        onClick={() => {
                          setPromoCode(promo.code);
                          setShowAutocomplete(false);
                          validatePromoCode(promo.code);
                        }}
                      >
                        <div className="font-medium text-slate-900">
                          {promo.code}
                        </div>
                        <div className="text-xs text-slate-500">
                          {promo.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Validation indicator */}
                {validationState !== "idle" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validationState === "loading" && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    )}
                    {validationState === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    {validationState === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleApplyCode}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!promoCode.trim() || validationState === "loading"}
              >
                Áp dụng
              </Button>
            </div>

            {/* Validation message */}
            {validationMessage && (
              <p
                className={`text-xs flex items-center gap-1 ${
                  validationState === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {validationState === "success" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {validationMessage}
              </p>
            )}
          </div>

          {/* Section: Suggested Promotions */}
          <div className="space-y-3">
            <Label>Mã khuyến mãi gợi ý</Label>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {availablePromotions
                .filter((p) => p.isActive && !p.isCombo)
                .map((promo) => {
                  const { applicable, reason } = isPromoApplicable(promo);
                  const isSelected = selectedPromo?.code === promo.code;
                  const isEligible = selectedCustomer
                    ? isCustomerEligible(promo)
                    : !promo.customerSpecific;

                  return (
                    <Card
                      key={promo.code}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-2 border-blue-500 bg-blue-50"
                          : applicable
                          ? "border border-slate-200 hover:border-blue-300 hover:shadow-sm"
                          : "border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (applicable) {
                          setSelectedPromo(isSelected ? null : promo);
                          setPromoCode(isSelected ? "" : promo.code);
                          setValidationState("idle");
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Tag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <h4 className="text-sm text-slate-900">
                              {promo.code}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPromoTypeBadgeColor(
                                promo.type
                              )}`}
                            >
                              {getPromoTypeLabel(promo.type)}
                            </Badge>
                            {promo.customerSpecific && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-pink-100 text-pink-700 border-pink-300"
                              >
                                <User className="w-3 h-3 mr-1" />
                                Khách hàng
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 mb-2">
                            {promo.description}
                          </p>

                          {/* Conditions */}
                          <div className="space-y-0.5">
                            {promo.minOrderValue && (
                              <p className="text-xs text-slate-500">
                                • Áp dụng cho đơn từ{" "}
                                {promo.minOrderValue.toLocaleString("vi-VN")}đ
                              </p>
                            )}
                            {promo.applicableCategories && (
                              <p className="text-xs text-slate-500">
                                • Áp dụng cho món:{" "}
                                {promo.applicableCategories.join(", ")}
                              </p>
                            )}
                            {promo.applicableMembershipTiers && (
                              <p className="text-xs text-slate-500">
                                • Áp dụng cho hạng:{" "}
                                {promo.applicableMembershipTiers.join(", ")}
                              </p>
                            )}
                            {promo.applicableCustomerIds && (
                              <p className="text-xs text-slate-500">
                                • Dành riêng cho khách hàng cụ thể
                              </p>
                            )}
                            {promo.maxUsage && (
                              <p className="text-xs text-slate-500">
                                • Còn{" "}
                                {promo.maxUsage - (promo.currentUsage || 0)}{" "}
                                lượt sử dụng
                              </p>
                            )}
                          </div>

                          {/* Customer eligibility indicator */}
                          {selectedCustomer &&
                            promo.customerSpecific &&
                            applicable && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                {isEligible ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Khách hàng phù hợp
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Mã này chỉ áp dụng cho khách hàng khác
                                  </Badge>
                                )}
                              </div>
                            )}
                        </div>

                        {/* Status indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Not applicable warning */}
                      {!applicable && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs text-orange-600 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {reason}
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* NEW Section: Combo Promotions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              Khuyến mãi Combo khả dụng
            </Label>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {availablePromotions
                .filter((p) => p.isActive && p.isCombo)
                .map((promo) => {
                  const { applicable, reason } = isPromoApplicable(promo);
                  const isSelected = selectedPromo?.code === promo.code;
                  const isEligible = selectedCustomer
                    ? isCustomerEligible(promo)
                    : !promo.customerSpecific;
                  const comboStatus = checkComboEligibility(promo);
                  const isExpanded = expandedCombos.has(promo.code);

                  return (
                    <Card
                      key={promo.code}
                      className={`p-3 transition-all ${
                        isSelected
                          ? "border-2 border-blue-500 bg-blue-50"
                          : applicable && comboStatus.eligible
                          ? "border border-slate-200 hover:border-blue-300 hover:shadow-sm"
                          : "border border-slate-200 bg-slate-50 opacity-60"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Package className="w-4 h-4 text-orange-600 flex-shrink-0" />
                              <h4 className="text-sm text-slate-900">
                                {promo.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPromoTypeBadgeColor(
                                  promo.type
                                )}`}
                              >
                                Combo
                              </Badge>
                              {promo.customerSpecific && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-pink-100 text-pink-700 border-pink-300"
                                >
                                  <User className="w-3 h-3 mr-1" />
                                  Khách hàng
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 mb-2">
                              {promo.description}
                            </p>
                          </div>

                          {/* Status indicator */}
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                        </div>

                        {/* Combo Condition Block */}
                        {promo.comboCondition && (
                          <div className="bg-slate-100 rounded p-2.5 space-y-1.5">
                            <div className="text-xs text-slate-600 mb-1.5">
                              Điều kiện combo:
                            </div>
                            {promo.comboCondition.requiredItems.map(
                              (item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                  <span className="text-slate-700">
                                    {item.minQuantity} {item.category}
                                  </span>
                                </div>
                              )
                            )}
                            <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-300 mt-1.5">
                              <span className="text-green-700">
                                → Giảm{" "}
                                {promo.comboCondition.discount.type ===
                                "percentage"
                                  ? `${promo.comboCondition.discount.value}%`
                                  : `${promo.comboCondition.discount.value.toLocaleString(
                                      "vi-VN"
                                    )}đ`}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Eligibility Status */}
                        {comboStatus.eligible ? (
                          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Đủ điều kiện combo{" "}
                              {comboStatus.timesApplicable > 1
                                ? `(${comboStatus.timesApplicable} lần)`
                                : "(1 lần)"}
                            </Badge>
                            {comboStatus.timesApplicable > 0 && (
                              <span className="text-xs text-green-700">
                                Combo áp dụng được {comboStatus.timesApplicable}{" "}
                                lần — Giảm{" "}
                                {comboStatus.totalDiscount.toLocaleString(
                                  "vi-VN"
                                )}
                                đ
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2">
                            <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Thiếu món để hoàn thành combo
                            </Badge>
                          </div>
                        )}

                        {/* Additional Conditions */}
                        <div className="space-y-0.5">
                          {promo.minOrderValue && (
                            <p className="text-xs text-slate-500">
                              • Áp dụng cho đơn từ{" "}
                              {promo.minOrderValue.toLocaleString("vi-VN")}đ
                            </p>
                          )}
                          {promo.applicableMembershipTiers && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              • Chỉ áp dụng cho hạng:{" "}
                              {promo.applicableMembershipTiers.map(
                                (tier, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className={`text-xs ${getMembershipTierColor(
                                      tier
                                    )}`}
                                  >
                                    {tier}
                                  </Badge>
                                )
                              )}
                            </p>
                          )}
                          {promo.maxUsage && (
                            <p className="text-xs text-slate-500">
                              • Còn {promo.maxUsage - (promo.currentUsage || 0)}{" "}
                              lượt sử dụng
                            </p>
                          )}
                        </div>

                        {/* Customer eligibility indicator */}
                        {selectedCustomer &&
                          promo.customerSpecific &&
                          applicable &&
                          comboStatus.eligible && (
                            <div className="pt-2 border-t border-slate-200">
                              {isEligible ? (
                                <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Khách hàng phù hợp
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Mã này chỉ áp dụng cho hạng{" "}
                                  {promo.applicableMembershipTiers?.join(", ")}
                                </Badge>
                              )}
                            </div>
                          )}

                        {/* Expandable: Items Breakdown */}
                        {comboStatus.matchedItems.length > 0 && (
                          <div>
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedCombos);
                                if (isExpanded) {
                                  newExpanded.delete(promo.code);
                                } else {
                                  newExpanded.add(promo.code);
                                }
                                setExpandedCombos(newExpanded);
                              }}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  Thu gọn chi tiết
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  Xem chi tiết món trong giỏ
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-2 pl-3 border-l-2 border-blue-200">
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">
                                    Món khớp với combo:
                                  </p>
                                  {comboStatus.matchedItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between text-xs py-1"
                                    >
                                      <span className="text-slate-700">
                                        <CheckCircle2 className="w-3 h-3 inline mr-1 text-green-600" />
                                        {item.name} ({item.category})
                                      </span>
                                      <span className="text-slate-500">
                                        x{item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {orderItems.filter(
                                  (item) =>
                                    !comboStatus.matchedItems.find(
                                      (m) => m.id === item.id
                                    )
                                ).length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-600 mb-1">
                                      Món không áp dụng:
                                    </p>
                                    {orderItems
                                      .filter(
                                        (item) =>
                                          !comboStatus.matchedItems.find(
                                            (m) => m.id === item.id
                                          )
                                      )
                                      .map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between text-xs py-1"
                                        >
                                          <span className="text-slate-500">
                                            <X className="w-3 h-3 inline mr-1 text-slate-400" />
                                            {item.name} (
                                            {item.category || "Khác"})
                                          </span>
                                          <span className="text-slate-400">
                                            x{item.quantity}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Apply Button or Not Applicable Warning */}
                        {comboStatus.eligible && applicable ? (
                          <Button
                            variant={isSelected ? "outline" : "default"}
                            size="sm"
                            className={`w-full ${
                              isSelected
                                ? "border-blue-500 text-blue-600"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            onClick={() => {
                              if (promo.requiresCustomer && !selectedCustomer) {
                                toast.error("Vui lòng chọn khách hàng");
                                return;
                              }
                              setSelectedPromo(isSelected ? null : promo);
                              setPromoCode(isSelected ? "" : promo.code);
                              setValidationState("idle");
                            }}
                          >
                            {isSelected ? "Đã chọn combo này" : "Áp dụng combo"}
                          </Button>
                        ) : (
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-xs text-orange-600 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              {!comboStatus.eligible
                                ? "Thiếu món trong giỏ hàng"
                                : reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Section: Discount Preview */}
          {(selectedPromo || pointsToUse > 0) && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
              <h4 className="text-sm text-slate-700 mb-3">
                Tính toán giảm giá
              </h4>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Giá trị hóa đơn ban đầu</span>
                <span className="text-slate-900">
                  {orderTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {discount.orderDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-1">
                    {selectedPromo?.isCombo && (
                      <Package className="w-3.5 h-3.5 text-orange-600" />
                    )}
                    Giảm từ {selectedPromo?.isCombo ? "combo" : "khuyến mãi"}
                    {selectedPromo?.isCombo &&
                      checkComboEligibility(selectedPromo).timesApplicable >
                        1 && (
                        <span className="text-xs text-orange-600">
                          (x
                          {checkComboEligibility(selectedPromo).timesApplicable}
                          )
                        </span>
                      )}
                  </span>
                  <span className="text-green-600">
                    -{discount.orderDiscount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              {discount.itemDiscounts.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Giảm theo món:</p>
                  {discount.itemDiscounts.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm pl-4"
                    >
                      <span className="text-slate-500">{item.itemName}</span>
                      <span className="text-green-600">
                        -{item.discount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {pointsToUse > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Giảm từ điểm thưởng ({pointsToUse} điểm)
                  </span>
                  <span className="text-green-600">
                    -{pointsValue.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              <div className="border-t border-slate-300 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Tổng giảm</span>
                  <span className="text-green-600">
                    {totalSavings.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-900">
                    Số tiền phải thanh toán
                  </span>
                  <span className="text-blue-700">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Reward Points */}
          {selectedCustomer && customerPoints > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  Điểm thưởng
                </Label>
                <span className="text-sm text-slate-600">
                  Bạn có {customerPoints} điểm
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Nhập số điểm muốn đổi"
                  value={pointsToUse || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setPointsToUse(Math.min(value, customerPoints));
                  }}
                  max={customerPoints}
                  min={0}
                />
                <span className="text-sm text-slate-600 whitespace-nowrap">
                  = {pointsValue.toLocaleString("vi-VN")}đ
                </span>
              </div>
              {pointsToUse > customerPoints && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Số điểm không đủ
                </p>
              )}
            </div>
          )}

          {/* Conflict Warning */}
          {selectedPromo &&
            selectedPromo.conflictsWith &&
            selectedPromo.conflictsWith.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Mã này không thể kết hợp với:{" "}
                  {selectedPromo.conflictsWith.join(", ")}
                </p>
              </div>
            )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleApply}
            disabled={!selectedPromo && pointsToUse === 0}
          >
            {totalSavings > 0
              ? `Áp dụng khuyến mãi – Tiết kiệm ${totalSavings.toLocaleString(
                  "vi-VN"
                )}đ`
              : "Áp dụng khuyến mãi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
