import { useState } from "react";
import { X, Check, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent } from "./ui/dialog";
import { Separator } from "./ui/separator";

export interface ItemCustomization {
  sugarLevel: string;
  iceLevel: string;
  toppings: { name: string; price: number; quantity: number }[];
  note: string;
}

interface Topping {
  id: string;
  name: string;
  price: number;
}

interface ItemCustomizationModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  basePrice: number;
  onUpdate: (customization: ItemCustomization) => void;
  initialCustomization?: ItemCustomization;
  availableToppings?: Topping[];
}

export function ItemCustomizationModal({
  open,
  onClose,
  itemName,
  basePrice,
  onUpdate,
  initialCustomization,
  availableToppings: propToppings,
}: ItemCustomizationModalProps) {
  const [sugarLevel, setSugarLevel] = useState(
    initialCustomization?.sugarLevel || "100%"
  );
  const [iceLevel, setIceLevel] = useState(
    initialCustomization?.iceLevel || "100%"
  );
  const [selectedToppings, setSelectedToppings] = useState<
    { name: string; price: number; quantity: number }[]
  >(initialCustomization?.toppings || []);
  const [note, setNote] = useState(initialCustomization?.note || "");

  const sugarOptions = ["0%", "30%", "50%", "70%", "100%"];
  const iceOptions = ["Không đá", "30%", "50%", "100%"];

  // Use provided toppings or fallback to empty array
  const availableToppings: Topping[] = propToppings || [];

  const handleToppingToggle = (topping: Topping) => {
    const exists = selectedToppings.find((t) => t.name === topping.name);
    if (exists) {
      setSelectedToppings(
        selectedToppings.filter((t) => t.name !== topping.name)
      );
    } else {
      setSelectedToppings([
        ...selectedToppings,
        { name: topping.name, price: topping.price, quantity: 1 },
      ]);
    }
  };

  const handleToppingQuantityChange = (toppingName: string, change: number) => {
    setSelectedToppings(
      selectedToppings.map((t) => {
        if (t.name === toppingName) {
          const newQuantity = Math.max(1, t.quantity + change);
          return { ...t, quantity: newQuantity };
        }
        return t;
      })
    );
  };

  const removeToppingByName = (toppingName: string) => {
    setSelectedToppings(selectedToppings.filter((t) => t.name !== toppingName));
  };

  const calculateTotalPrice = () => {
    const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return basePrice + toppingsTotal;
  };

  const handleUpdate = () => {
    onUpdate({
      sugarLevel,
      iceLevel,
      toppings: selectedToppings,
      note,
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial values
    setSugarLevel(initialCustomization?.sugarLevel || "100%");
    setIceLevel(initialCustomization?.iceLevel || "100%");
    setSelectedToppings(initialCustomization?.toppings || []);
    setNote(initialCustomization?.note || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden rounded-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-blue-900 text-lg">{itemName}</h2>
              <p className="text-blue-700 mt-1">
                {calculateTotalPrice().toLocaleString()}₫
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tùy chỉnh món theo yêu cầu khách
          </p>
        </div>

        <Separator />

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Sugar Level */}
          <div className="mb-5">
            <label className="text-sm text-slate-700 mb-2 block">Đường</label>
            <div className="flex gap-2 flex-wrap">
              {sugarOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSugarLevel(option)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border-2 ${
                    sugarLevel === option
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Ice Level */}
          <div className="mb-5">
            <label className="text-sm text-slate-700 mb-2 block">Đá</label>
            <div className="flex gap-2 flex-wrap">
              {iceOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setIceLevel(option)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border-2 ${
                    iceLevel === option
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          <div className="mb-5">
            <label className="text-sm text-slate-700 mb-2 block">Topping</label>
            <div className="grid grid-cols-2 gap-2">
              {availableToppings.map((topping) => {
                const selected = selectedToppings.find(
                  (t) => t.name === topping.name
                );
                return (
                  <div
                    key={topping.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selected
                        ? "bg-blue-50 border-blue-500 shadow-sm"
                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-sm text-slate-900 mb-1">
                      {topping.name}
                    </div>
                    <div className="text-xs text-blue-600 mb-2">
                      +{topping.price.toLocaleString()}₫
                    </div>

                    {selected ? (
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              handleToppingQuantityChange(topping.name, -1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-semibold text-sm">
                            {selected.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              handleToppingQuantityChange(topping.name, 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeToppingByName(topping.name)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
                        onClick={() => handleToppingToggle(topping)}
                      >
                        Thêm
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Summary */}
          {selectedToppings.length > 0 && (
            <div className="mb-5 bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-2">Đã chọn:</p>
              <div className="flex gap-1 flex-wrap">
                {selectedToppings.map((topping, idx) => (
                  <Badge
                    key={idx}
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {topping.name} x{topping.quantity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-sm text-slate-700 mb-2 block">Ghi chú</label>
            <Input
              placeholder="Ghi chú thêm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Hủy
          </Button>
          <Button
            onClick={handleUpdate}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Cập nhật món
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
