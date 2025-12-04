import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { Separator } from './ui/separator';

export interface ItemCustomization {
  sugarLevel: string;
  iceLevel: string;
  toppings: { name: string; price: number }[];
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
}

export function ItemCustomizationModal({
  open,
  onClose,
  itemName,
  basePrice,
  onUpdate,
  initialCustomization
}: ItemCustomizationModalProps) {
  const [sugarLevel, setSugarLevel] = useState(initialCustomization?.sugarLevel || '100%');
  const [iceLevel, setIceLevel] = useState(initialCustomization?.iceLevel || '100%');
  const [selectedToppings, setSelectedToppings] = useState<{ name: string; price: number }[]>(
    initialCustomization?.toppings || []
  );
  const [note, setNote] = useState(initialCustomization?.note || '');

  const sugarOptions = ['0%', '30%', '50%', '70%', '100%'];
  const iceOptions = ['Không đá', '30%', '50%', '100%'];
  
  const availableToppings: Topping[] = [
    { id: 't1', name: 'Trân châu', price: 5000 },
    { id: 't2', name: 'Thạch đào', price: 5000 },
    { id: 't3', name: 'Thạch phô mai', price: 7000 },
    { id: 't4', name: 'Pudding', price: 6000 },
    { id: 't5', name: 'Sữa tươi', price: 8000 },
    { id: 't6', name: 'Shot thêm', price: 10000 },
  ];

  const handleToppingToggle = (topping: Topping) => {
    const exists = selectedToppings.find(t => t.name === topping.name);
    if (exists) {
      setSelectedToppings(selectedToppings.filter(t => t.name !== topping.name));
    } else {
      setSelectedToppings([...selectedToppings, { name: topping.name, price: topping.price }]);
    }
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
      note
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial values
    setSugarLevel(initialCustomization?.sugarLevel || '100%');
    setIceLevel(initialCustomization?.iceLevel || '100%');
    setSelectedToppings(initialCustomization?.toppings || []);
    setNote(initialCustomization?.note || '');
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
          <p className="text-xs text-slate-500 mt-1">Tùy chỉnh món theo yêu cầu khách</p>
        </div>

        <Separator />

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Sugar Level */}
          <div className="mb-5">
            <label className="text-sm text-slate-700 mb-2 block">Đường</label>
            <div className="flex gap-2 flex-wrap">
              {sugarOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setSugarLevel(option)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border-2 ${
                    sugarLevel === option
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
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
              {iceOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setIceLevel(option)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border-2 ${
                    iceLevel === option
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
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
              {availableToppings.map(topping => {
                const isSelected = selectedToppings.some(t => t.name === topping.name);
                return (
                  <button
                    key={topping.id}
                    onClick={() => handleToppingToggle(topping)}
                    className={`p-3 rounded-lg text-left transition-all border-2 relative ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="text-sm text-slate-900 mb-1">{topping.name}</div>
                    <div className="text-xs text-blue-600">+{topping.price.toLocaleString()}₫</div>
                  </button>
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
                  <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-200">
                    {topping.name} x1
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
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
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
