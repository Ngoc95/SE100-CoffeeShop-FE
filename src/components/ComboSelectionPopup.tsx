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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";

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

      // For single selection (max = 1)
      if (group.maxSelect === 1) {
        return {
          ...prev,
          [groupId]: [itemId],
        };
      }

      // For multiple selection
      const isSelected = currentSelections.includes(itemId);
      let newSelections: string[];

      if (isSelected) {
        newSelections = currentSelections.filter((id) => id !== itemId);
      } else {
        if (currentSelections.length >= group.maxSelect) {
          toast.error(`Chỉ được chọn tối đa ${group.maxSelect} món`);
          return prev;
        }
        newSelections = [...currentSelections, itemId];
      }

      return {
        ...prev,
        [groupId]: newSelections,
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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
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

        <ScrollArea
          className="flex-1 px-6"
          style={{ maxHeight: "calc(90vh - 220px)" }}
        >
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

                  {group.maxSelect === 1 ? (
                    <RadioGroup
                      value={selectedItems[group.id]?.[0] || ""}
                      onValueChange={(value) =>
                        handleItemSelect(group.id, value, group)
                      }
                    >
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            selectedItems[group.id]?.includes(item.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          } ${item.stock === 0 ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <RadioGroupItem
                              value={item.id}
                              id={`${group.id}-${item.id}`}
                              disabled={item.stock === 0}
                            />
                            <Label
                              htmlFor={`${group.id}-${item.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <span>{item.name}</span>
                                <div className="flex items-center gap-2">
                                  {item.extraPrice && item.extraPrice > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{item.extraPrice.toLocaleString()}đ
                                    </Badge>
                                  )}
                                  {item.stock === 0 && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Hết hàng
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
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
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            } ${
                              item.stock === 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span>{item.name}</span>
                                  <div className="flex items-center gap-2">
                                    {item.extraPrice && item.extraPrice > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        +{item.extraPrice.toLocaleString()}đ
                                      </Badge>
                                    )}
                                    {item.stock === 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        Hết hàng
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
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

        <div className="border-t bg-gray-50 px-6 py-4 space-y-4">
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
