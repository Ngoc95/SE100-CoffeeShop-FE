import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { cn } from "./ui/utils";

interface ComboItem {
  id: string;
  name: string;
  price: number;
  extraPrice?: number; // For premium items
  category?: string;
  stock: number;
}

interface ComboGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  items: ComboItem[];
}

interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  groups: ComboGroup[];
  image?: string;
}

interface ComboSelectionPopupProps {
  open: boolean;
  onClose: () => void;
  combo: Combo | null;
  onConfirm: (
    selectedItems: { [groupId: string]: string[] },
    combo: Combo
  ) => void;
}

export function ComboSelectionPopup({
  open,
  onClose,
  combo,
  onConfirm,
}: ComboSelectionPopupProps) {
  const [selectedItems, setSelectedItems] = useState<{
    [groupId: string]: string[];
  }>({});

  useEffect(() => {
    // Reset selections when combo changes
    if (combo) {
      const initialSelections: { [groupId: string]: string[] } = {};
      combo.groups.forEach((group) => {
        initialSelections[group.id] = [];
      });
      setSelectedItems(initialSelections);
    }
  }, [combo?.id]);

  if (!combo) return null;

  const handleItemSelect = (
    groupId: string,
    itemId: string,
    group: ComboGroup
  ) => {
    setSelectedItems((prev) => {
      const currentSelections = prev[groupId] || [];
      const isSelected = currentSelections.includes(itemId);

      // Allow toggling (unselect) if clicked on already selected item
      if (isSelected) {
        // If it's a required group and unselecting would drop below minSelect,
        // we might typically prevent it, BUT the user explicitly asked to "unselect lun dc ko"
        // even for single select. So let's allow unselect. 
        // Validation steps will block confirming anyway if requirements aren't met.
        return {
          ...prev,
          [groupId]: currentSelections.filter((id) => id !== itemId),
        };
      }

      // For single selection (max = 1)
      if (group.maxSelect === 1) {
        return {
          ...prev,
          [groupId]: [itemId],
        };
      }

      // For multiple selection check max limit
      if (currentSelections.length >= group.maxSelect) {
        toast.error(`Chỉ được chọn tối đa ${group.maxSelect} món`);
        return prev;
      }
      
      return {
        ...prev,
        [groupId]: [...currentSelections, itemId],
      };
    });
  };



  const validateSelections = (): {
    valid: boolean;
    missingGroups: string[];
  } => {
    const missingGroups: string[] = [];

    combo.groups.forEach((group) => {
      if (group.required) {
        const selections = selectedItems[group.id] || [];
        if (selections.length < group.minSelect) {
          missingGroups.push(group.name);
        }
      }
    });

    return {
      valid: missingGroups.length === 0,
      missingGroups,
    };
  };

  const calculateTotalPrice = (): number => {
    let total = combo.price;

    combo.groups.forEach((group) => {
      const selections = selectedItems[group.id] || [];
      selections.forEach((itemId) => {
        const item = group.items.find((i) => i.id === itemId);
        if (item?.extraPrice) {
          total += item.extraPrice;
        }
      });
    });

    return total;
  };

  const handleConfirm = () => {
    const validation = validateSelections();

    if (!validation.valid) {
      toast.error(`Vui lòng chọn: ${validation.missingGroups.join(", ")}`);
      return;
    }

    onConfirm(selectedItems, combo);
    onClose();
    toast.success("Đã thêm combo vào đơn hàng");
  };

  const totalPrice = calculateTotalPrice();
  const validation = validateSelections();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{combo.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {combo.description}
              </p>
              <Badge variant="secondary" className="mt-2">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Combo
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-6 pb-4">
            {combo.groups.map((group, groupIndex) => (
              <div key={group.id}>
                {groupIndex > 0 && <Separator className="my-4" />}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{group.name}</h3>
                      {group.required && (
                        <Badge variant="destructive" className="text-xs">
                          Bắt buộc
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {group.maxSelect === 1
                        ? "Chọn 1 món"
                        : `Chọn ${group.minSelect}-${group.maxSelect} món`}
                    </span>
                  </div>

                  {/* Single Select */}
                  {group.maxSelect === 1 ? (
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const isSelected = selectedItems[group.id]?.includes(
                          item.id
                        );
                        return (
                          <div
                            key={item.id}
                            onClick={() =>
                              item.stock > 0 &&
                              handleItemSelect(group.id, item.id, group)
                            }
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                : "border-gray-200 hover:border-gray-300"
                            } ${
                              item.stock === 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-blue-600 bg-white"
                                    : "border-gray-400"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                )}
                              </div>
                              <Label
                                className={`flex-1 cursor-pointer ${
                                  isSelected ? "text-blue-900 font-medium" : "text-slate-700"
                                }`}
                              >
                                {item.name}
                              </Label>
                            </div>
                            
                            <div className="text-right flex items-center gap-2">
                                {item.extraPrice && item.extraPrice > 0 && (
                                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                                    +{item.extraPrice.toLocaleString()}đ
                                  </Badge>
                                )}
                                {item.stock === 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    Hết hàng
                                  </Badge>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Multi Select */
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const isSelected = selectedItems[group.id]?.includes(
                          item.id
                        );
                        return (
                          <div
                            key={item.id}
                            onClick={() =>
                              item.stock > 0 &&
                              handleItemSelect(group.id, item.id, group)
                            }
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                : "border-gray-200 hover:border-gray-300"
                            } ${
                              item.stock === 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleItemSelect(group.id, item.id, group)
                                }
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <Label
                                className={`flex-1 cursor-pointer ${
                                  isSelected ? "text-blue-900 font-medium" : "text-slate-700"
                                }`}
                              >
                                {item.name}
                              </Label>
                            </div>
                            
                            <div className="text-right flex items-center gap-2">
                                {item.extraPrice && item.extraPrice > 0 && (
                                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                                    +{item.extraPrice.toLocaleString()}đ
                                  </Badge>
                                )}
                                {item.stock === 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    Hết hàng
                                  </Badge>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t bg-gray-50 px-6 py-4 space-y-4">
          {!validation.valid && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium">Thiếu lựa chọn bắt buộc</div>
                <div className="text-xs mt-1">
                  Vui lòng chọn: {validation.missingGroups.join(", ")}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Tổng tiền</div>
              <div className="text-2xl font-semibold text-blue-600">
                {totalPrice.toLocaleString()}đ
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!validation.valid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Xác nhận combo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
