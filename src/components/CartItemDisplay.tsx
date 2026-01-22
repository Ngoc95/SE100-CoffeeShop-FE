import {
  Plus,
  Minus,
  Trash2,
  Settings,
  MessageSquare,
  PackageCheck,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Tag,
  Edit2,
  AlertCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { ItemCustomization } from "./ItemCustomizationModal";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status?:
    | "pending"
    | "preparing"
    | "completed"
    | "served"
    | "out-of-stock"
    | "waiting-ingredient"
    | "canceled"
    | "replaced";
  toppings?: string[];
  outOfStockReason?: string;
  customization?: ItemCustomization;
  isCombo?: boolean;
  comboId?: string | number;
  comboName?: string;
  comboPrice?: number;
  comboItems?: CartItem[];
  comboExpanded?: boolean;
  isTopping?: boolean;
  // Status breakdown for grouped items
  statusBreakdown?: {
    pending: number;
    preparing: number;
    completed: number;
    served: number;
  };
}

interface CartItemDisplayProps {
  item: CartItem;
  onUpdateQuantity: (id: string, change: number, reason?: string) => void;
  onRemove: (id: string, reason?: string) => void;
  onCustomize: (item: CartItem) => void;
  onAddNote: (item: CartItem) => void;
  onToggleComboExpansion?: (comboId: string) => void;
  onCustomizeComboItem?: (comboId: string, itemIndex: number) => void;
  getItemStatusBadge: (status: string) => React.ReactNode;
  restockedItems?: string[];
  glowingItems?: string[];
  appliedPromoCode?: string;
  // Payment status to control confirmation behavior
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
}

export function CartItemDisplay({
  item,
  onUpdateQuantity,
  onRemove,
  onCustomize,
  onAddNote,
  onToggleComboExpansion,
  onCustomizeComboItem,
  getItemStatusBadge,
  restockedItems = [],
  glowingItems = [],
  appliedPromoCode = "",
  paymentStatus = 'unpaid',
}: CartItemDisplayProps) {
  const isRestocked = restockedItems.includes(item.id);
  const isGlowing = glowingItems.includes(item.id);

  // Confirmation dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [decreaseConfirmOpen, setDecreaseConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [cancelQuantity, setCancelQuantity] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const cancelReasons = [
    "Khác",
    "Khách đợi lâu",
    "Khách không hài lòng",
    "Khách đổi món",
    "Khách hủy món",
    "Nhân viên ghi sai đơn",
  ];

  const handleDeleteClick = () => {
    // If pending, direct delete
    if (!item.status || item.status === 'pending') {
         onRemove(item.id);
         return;
    }

    setItemToDelete(item.id);
    setCancelReason("");
    setOtherReason("");
    setCancelQuantity(item.quantity); // Default: delete all
    setDeleteConfirmOpen(true);
  };

  const handleDecreaseClick = () => {
    // If pending, direct decrease (which might trigger remove if qty=0 handled by parent, 
    // but here we just call updateQty)
    if (!item.status || item.status === 'pending') {
        onUpdateQuantity(item.id, -1);
        return;
    }

    setItemToDelete(item.id);
    setCancelReason("");
    setOtherReason("");
    setCancelQuantity(1); // Default: decrease by 1
    setDecreaseConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cancelReason && (cancelReason !== "Khác" || otherReason.trim())) {
      setCancelQuantity(1);
      
       // Construct final reason
       const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;
       onRemove(item.id, finalReason);
       
       // Reset
       setDeleteConfirmOpen(false);
       setCancelReason("");
       setOtherReason("");
    }
  };

  const handleConfirmDecrease = () => {
    if (cancelReason && (cancelReason !== "Khác" || otherReason.trim())) {
      setCancelQuantity(1);
      
       // Construct final reason
       const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;
       onUpdateQuantity(item.id, -cancelQuantity, finalReason);

      setDecreaseConfirmOpen(false);
      setCancelReason("");
      setOtherReason("");
      setCancelQuantity(1);
    }
  };

  const handleIncreaseCancelQty = () => {
    if (cancelQuantity < item.quantity) {
      setCancelQuantity(cancelQuantity + 1);
    }
  };

  const handleDecreaseCancelQty = () => {
    if (cancelQuantity > 1) {
      setCancelQuantity(cancelQuantity - 1);
    }
  };

  // Calculate topping extras
  const getToppingExtras = (customization?: ItemCustomization) => {
    const topps = customization?.toppings ?? [];
    if (!Array.isArray(topps) || topps.length === 0) return 0;
    return topps.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  };

  // Get text color based on status
  const getStatusTextColor = (status?: CartItem["status"]) => {
    switch (status) {
      case "pending":
      case "preparing":
        return "text-slate-900"; // Màu đen khi pending hoặc preparing
      case "completed":
        return "text-red-600"; // Màu đỏ khi completed
      case "served":
        return "text-green-600"; // Màu xanh khi served
    }
  };

  // Get count of completed items
  const getCompletedCount = () => {
    if (item.status === "completed" || item.status === "served") {
      return item.quantity;
    }
    return 0;
  };

  // Combo Item Rendering
  if (item.isCombo && item.comboItems) {
    const totalExtras = item.comboItems.reduce((sum, subItem) => {
      return sum + getToppingExtras(subItem.customization);
    }, 0);

    return (
      <Card
        className={`border-green-300 shadow-sm transition-all bg-gradient-to-br from-green-50/30 to-emerald-50/30`}
      >
        <CardContent className="p-3">
          {/* Combo Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleComboExpansion?.(item.id)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  {item.comboExpanded ? (
                    <ChevronDown className="w-4 h-4 text-green-700" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-green-700" />
                  )}
                </Button>
                <PackageCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p
                  className={`text-sm font-medium break-words ${getStatusTextColor(
                    item.status
                  )}`}
                >
                  {item.name}
                </p>
                {getCompletedCount() > 0 && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 rounded-md px-1.5 py-0.5 text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {getCompletedCount()}
                  </div>
                )}
              </div>

              <Badge className="bg-green-600 text-white text-xs mb-2 ml-8">
                <Tag className="w-3 h-3 mr-1" />
                Combo - {item.comboItems.length} món
              </Badge>

              {/* Price */}
              <div className="ml-8">
                <p className="text-sm text-green-700 font-medium">
                  {item.price.toLocaleString()}₫
                  {totalExtras > 0 && (
                    <span className="text-xs text-slate-600 ml-1">
                      (+{totalExtras.toLocaleString()}₫ phụ thu)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-7 w-7 p-0 flex-shrink-0 ml-2"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>

          {/* Expanded Combo Items */}
          {item.comboExpanded && item.comboItems && (
            <div className="ml-8 space-y-2 mb-3 pb-3 border-t border-green-200 pt-3">
              {item.comboItems.map((subItem, idx) => {
                const toppingExtra = getToppingExtras(subItem.customization);

                return (
                  <div
                    key={idx}
                    className="bg-white/80 rounded-lg p-2.5 border border-green-200"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 mb-1">
                          {subItem.quantity}x {subItem.name}
                        </p>

                        {/* Customization Details */}
                        {subItem.customization && (
                          <div className="bg-slate-50 rounded-md p-1.5 mb-1.5 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <span>
                                Đường:{" "}
                                <span className="text-slate-800">
                                  {subItem.customization.sugarLevel}
                                </span>
                              </span>
                              <span className="text-slate-300">•</span>
                              <span>
                                Đá:{" "}
                                <span className="text-slate-800">
                                  {subItem.customization.iceLevel}
                                </span>
                              </span>
                            </div>

                            {(subItem.customization?.toppings ?? []).length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {(subItem.customization?.toppings ?? []).map(
                                  (topping, tIdx) => (
                                    <Badge
                                      key={tIdx}
                                      variant="outline"
                                      className="text-xs px-1.5 py-0.5 bg-white border-blue-200 text-blue-700"
                                    >
                                      {topping.name} (+
                                      {topping.price.toLocaleString()}₫)
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}

                            {subItem.customization.note && (
                              <p className="text-xs text-slate-500 italic">
                                "{subItem.customization.note}"
                              </p>
                            )}
                          </div>
                        )}

                        {toppingExtra > 0 && (
                          <p className="text-xs text-blue-600">
                            +{toppingExtra.toLocaleString()}₫ phụ thu
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCustomizeComboItem?.(item.id, idx)}
                        className="h-6 px-2 flex-shrink-0 ml-2"
                        title="Tùy chỉnh món"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Info note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Phụ thu sẽ cộng thêm vào giá combo nếu có
                </p>
              </div>
            </div>
          )}

          {/* Combo Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecreaseClick}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <span className="text-sm text-green-900 font-medium">
              {((item.price + totalExtras) * item.quantity).toLocaleString()}₫
            </span>

            {item.notes && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddNote(item)}
                className="h-7 px-2 flex-shrink-0"
                title="Ghi chú"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                <span className="text-xs">Ghi chú</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regular Item Rendering
  return (
    <>
      <Card
        className={`border-blue-200 shadow-sm transition-all ${
          isGlowing ? "restock-glow" : ""
        } ${isRestocked ? "green-ripple" : ""}`}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              {/* Item name with status badge */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p
                  className={`text-sm font-medium break-words ${getStatusTextColor(
                    item.status
                  )}`}
                >
                  {item.name}
                </p>
                {/* Status Badge(s) - show breakdown if available */}
                {(() => {
                  const sb = item.statusBreakdown;
                  if (sb && (sb.pending + sb.preparing + sb.completed + sb.served > 0)) {
                    // Show breakdown: x(chờ) + y(làm) + z(xong) + w(phục vụ)
                    const parts: React.ReactNode[] = [];
                    if (sb.pending > 0) parts.push(
                      <span key="pending" className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {sb.pending} chờ báo
                      </span>
                    );
                    if (sb.preparing > 0) parts.push(
                      <span key="preparing" className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                        {sb.preparing} đang làm
                      </span>
                    );
                    if (sb.completed > 0) parts.push(
                      <span key="completed" className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        {sb.completed} xong
                      </span>
                    );
                    if (sb.served > 0) parts.push(
                      <span key="served" className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                        {sb.served} đã phục vụ
                      </span>
                    );
                    return <div className="flex flex-wrap gap-1">{parts}</div>;
                  }
                  // Fallback to single status
                  const statusColor = item.status === 'completed' ? 'bg-green-100 text-green-700' 
                    : item.status === 'preparing' ? 'bg-yellow-100 text-yellow-700'
                    : item.status === 'served' ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600';
                  const statusLabel = item.status === 'completed' ? 'Xong' 
                    : item.status === 'preparing' ? 'Đang làm'
                    : item.status === 'served' ? 'Đã phục vụ'
                    : 'Chờ báo';
                  return (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor}`}>
                      {statusLabel}
                    </span>
                  );
                })()}
              </div>

              {isRestocked && (
                <div className="mb-2 restock-badge-fade">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 border-emerald-500 text-emerald-700 text-xs flex items-center gap-1 w-fit"
                  >
                    <PackageCheck className="w-3 h-3" />
                    Đã bổ sung NL
                  </Badge>
                </div>
              )}

              {item.customization && (
                <div className="mb-2 bg-slate-50 rounded-md p-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>
                      Đường:{" "}
                      <span className="text-slate-800">
                        {item.customization.sugarLevel}
                      </span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      Đá:{" "}
                      <span className="text-slate-800">
                        {item.customization.iceLevel}
                      </span>
                    </span>
                  </div>

                  {(item.customization?.toppings ?? []).length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {(item.customization?.toppings ?? []).map((topping, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs px-1.5 py-0.5 bg-white border-blue-200 text-blue-700"
                        >
                          {topping.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!item.customization &&
                item.toppings &&
                item.toppings.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-slate-500 block mb-1">
                      Topping:
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {item.toppings.map((topping, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs px-1 py-0"
                        >
                          {topping}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {item.notes && (
                <div className="flex items-start gap-1 mb-2">
                  <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-slate-500 italic break-words">
                    "{item.notes}"
                  </span>
                </div>
              )}

              {isRestocked && (
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded mb-2">
                  <p className="text-xs text-emerald-700 break-words flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Nguyên liệu đã sẵn sàng. Có thể pha chế.
                  </p>
                </div>
              )}

              {appliedPromoCode === "GIAMCF" &&
                item.name.toLowerCase().includes("cà phê") && (
                  <div className="flex items-center gap-1 mb-1">
                    <Tag className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700">
                      –5.000đ Khuyến mãi Cà phê
                    </span>
                  </div>
                )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-7 w-7 p-0 flex-shrink-0 ml-2"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecreaseClick}
                className="h-7 w-7 p-0 flex-shrink-0"
                disabled={item.quantity <= 1 && (!item.status || item.status === 'pending')}
                title={item.quantity <= 1 && (!item.status || item.status === 'pending') ? "Dùng thùng rác để xóa" : "Giảm số lượng"}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <span className="text-sm text-blue-700">
              {item.price.toLocaleString()}₫
            </span>
            <span className="text-sm text-blue-900 font-medium">
              = {(item.price * item.quantity).toLocaleString()}₫
            </span>
            {!item.isTopping && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCustomize(item)}
                className="h-7 px-2 flex-shrink-0"
                title="Tùy chỉnh món"
                disabled={
                  item.status === "preparing" ||
                  item.status === "completed" ||
                  item.status === "served"
                }
              >
                <Settings className="w-3 h-3 mr-1" />
                <span className="text-xs">Tùy chỉnh</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddNote(item)}
              className="h-7 w-7 p-0 flex-shrink-0 ml-auto"
              title="Thêm ghi chú"
            >
              <MessageSquare className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Xác nhận giảm / Hủy món
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                Bạn có chắc chắn muốn xóa{" "}
                <span className="font-semibold text-slate-900">
                  {item.name}
                </span>{" "}
                khỏi đơn hàng không?
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-slate-600">Số lượng hủy:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecreaseCancelQty}
                    disabled={cancelQuantity <= 1}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">
                    {cancelQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleIncreaseCancelQty}
                    disabled={cancelQuantity >= item.quantity}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-slate-600 ml-1">
                    / {item.quantity}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="delete-reason"
                className="text-sm font-medium mb-2 block"
              >
                Lý do hủy <span className="text-red-500">*</span>
              </Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger id="delete-reason">
                  <SelectValue placeholder="Chọn lý do hủy..." />
                </SelectTrigger>
                <SelectContent>
                  {cancelReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cancelReason === "Khác" && (
              <div>
                <Label
                  htmlFor="other-delete-reason"
                  className="text-sm font-medium mb-2 block"
                >
                  Ghi chú lý do khác
                </Label>
                <Input
                  id="other-delete-reason"
                  placeholder="Nhập lý do hủy..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={
                !cancelReason ||
                (cancelReason === "Khác" && !otherReason.trim())
              }
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Chắc chắn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decrease Confirmation Dialog */}
      <Dialog open={decreaseConfirmOpen} onOpenChange={setDecreaseConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Xác nhận giảm / Hủy món
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                Bạn có chắc chắn muốn giảm số lượng{" "}
                <span className="font-semibold text-slate-900">
                  {item.name}
                </span>{" "}
                không?
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-slate-600">Số lượng hủy:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecreaseCancelQty}
                    disabled={cancelQuantity <= 1}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">
                    {cancelQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleIncreaseCancelQty}
                    disabled={cancelQuantity >= item.quantity}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-slate-600 ml-1">
                    / {item.quantity}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="decrease-reason"
                className="text-sm font-medium mb-2 block"
              >
                Lý do hủy <span className="text-red-500">*</span>
              </Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger id="decrease-reason">
                  <SelectValue placeholder="Chọn lý do hủy..." />
                </SelectTrigger>
                <SelectContent>
                  {cancelReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cancelReason === "Khác" && (
              <div>
                <Label
                  htmlFor="other-decrease-reason"
                  className="text-sm font-medium mb-2 block"
                >
                  Ghi chú lý do khác
                </Label>
                <Input
                  id="other-decrease-reason"
                  placeholder="Nhập lý do hủy..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDecreaseConfirmOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleConfirmDecrease}
              disabled={
                !cancelReason ||
                (cancelReason === "Khác" && !otherReason.trim())
              }
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Chắc chắn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
