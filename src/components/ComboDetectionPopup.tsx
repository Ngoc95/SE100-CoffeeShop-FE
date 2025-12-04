import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PackageCheck, Sparkles, Tag, ArrowRight } from 'lucide-react';

interface DetectedCombo {
  id: string;
  name: string;
  description: string;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  matchingItems: {
    id: string;
    name: string;
    quantity: number;
  }[];
  finalPrice: number;
  originalPrice: number;
}

interface ComboDetectionPopupProps {
  open: boolean;
  onClose: () => void;
  detectedCombo: DetectedCombo | null;
  onApplyCombo: () => void;
  onContinueIndividual: () => void;
}

export function ComboDetectionPopup({
  open,
  onClose,
  detectedCombo,
  onApplyCombo,
  onContinueIndividual
}: ComboDetectionPopupProps) {
  if (!detectedCombo) return null;

  const discountAmount = detectedCombo.originalPrice - detectedCombo.finalPrice;
  const discountPercent = Math.round((discountAmount / detectedCombo.originalPrice) * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-slate-900">
                Áp dụng Combo?
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1">
                Tiết kiệm hơn khi gọi combo
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detected Items Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-700 mb-2">
                  Các món{' '}
                  <span className="font-medium text-blue-700">
                    {detectedCombo.matchingItems.map(item => item.name).join(', ')}
                  </span>
                  {' '}đang nằm trong{' '}
                  <span className="font-medium text-green-700">{detectedCombo.name}</span>
                  . Bạn có muốn áp dụng combo này không?
                </p>
              </div>
            </div>
          </div>

          {/* Combo Details Card */}
          <div className="border-2 border-green-300 rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-slate-900 mb-1">{detectedCombo.name}</h3>
                <p className="text-sm text-slate-600">{detectedCombo.description}</p>
              </div>
              <Badge className="bg-green-600 text-white ml-2">
                <Tag className="w-3 h-3 mr-1" />
                Combo
              </Badge>
            </div>

            {/* Items in Combo */}
            <div className="space-y-2 mb-4">
              {detectedCombo.matchingItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  <span className="text-slate-700">
                    {item.quantity}x {item.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Comparison */}
            <div className="border-t border-green-200 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Giá thông thường:</span>
                <span className="text-sm text-slate-500 line-through">
                  {detectedCombo.originalPrice.toLocaleString()}₫
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Giảm giá:</span>
                <span className="text-sm font-medium text-red-600">
                  -{discountAmount.toLocaleString()}₫ (-{discountPercent}%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <span className="font-medium text-slate-900">Giá combo:</span>
                <span className="text-xl font-medium text-green-700">
                  {detectedCombo.finalPrice.toLocaleString()}₫
                </span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              💡 <span className="font-medium">Lưu ý:</span> Bạn vẫn có thể tùy chỉnh từng món trong combo (đường, đá, size, topping). Phụ thu sẽ cộng thêm vào giá combo nếu có.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onContinueIndividual}
            className="flex-1"
          >
            Tiếp tục món lẻ
          </Button>
          <Button
            onClick={onApplyCombo}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <PackageCheck className="w-4 h-4 mr-2" />
            Áp dụng Combo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
