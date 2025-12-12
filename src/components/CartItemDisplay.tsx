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
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
  comboId?: string;
  comboItems?: CartItem[];
  comboExpanded?: boolean;
}

interface CartItemDisplayProps {
  item: CartItem;
  onUpdateQuantity: (id: string, change: number) => void;
  onRemove: (id: string) => void;
  onCustomize: (item: CartItem) => void;
  onAddNote: (item: CartItem) => void;
  onToggleComboExpansion?: (comboId: string) => void;
  onCustomizeComboItem?: (comboId: string, itemIndex: number) => void;
  getItemStatusBadge: (status: string) => React.ReactNode;
  restockedItems?: string[];
  glowingItems?: string[];
  appliedPromoCode?: string;
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
}: CartItemDisplayProps) {
  const isRestocked = restockedItems.includes(item.id);
  const isGlowing = glowingItems.includes(item.id);

  // Calculate topping extras
  const getToppingExtras = (customization?: ItemCustomization) => {
    if (!customization || !customization.toppings.length) return 0;
    return customization.toppings.reduce((sum, t) => sum + t.price, 0);
  };

  // Get text color based on status
  const getStatusTextColor = (status?: CartItem["status"]) => {
    switch (status) {
      case "pending":
        return "text-slate-900";
      case "preparing":
        return "text-red-600"; // Đang đợi bếp chế biến - Đỏ
      case "completed":
      case "served":
        return "text-green-600"; // Hoàn thành - Xanh
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
              onClick={() => onRemove(item.id)}
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

                            {subItem.customization.toppings.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {subItem.customization.toppings.map(
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
                onClick={() => onUpdateQuantity(item.id, -1)}
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
    <Card
      className={`border-blue-200 shadow-sm transition-all ${
        isGlowing ? "restock-glow" : ""
      } ${isRestocked ? "green-ripple" : ""}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            {/* Item name with status color, icon, and completed count */}
            <div className="flex items-center gap-2 mb-2">
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

                {item.customization.toppings.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {item.customization.toppings.map((topping, idx) => (
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

            <p className="text-sm text-blue-700">
              {item.price.toLocaleString()}₫
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-7 w-7 p-0 flex-shrink-0 ml-2"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, -1)}
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
          <span className="text-sm text-blue-900 font-medium">
            {(item.price * item.quantity).toLocaleString()}₫
          </span>
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
  );
}
