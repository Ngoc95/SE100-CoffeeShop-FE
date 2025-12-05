import { useState } from 'react';
import { Search, Edit, Package, TrendingDown, DollarSign, Plus, Minus } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { categories } from '../../data/categories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface PriceEditDialogProps {
  open: boolean;
  onClose: () => void;
  product: any;
  onSave: (productId: number, newPrice: number, applyToAll: boolean) => void;
}

function PriceEditDialog({ open, onClose, product, onSave }: PriceEditDialogProps) {
  const [priceType, setPriceType] = useState('current'); // current, cost, selling
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'amount' | 'percent'>('amount');
  const [applyToAll, setApplyToAll] = useState(false);

  const categoryLabel = categories.find(c => c.id === product?.category)?.name || product?.category;
  const currentPrice = product?.sellingPrice || 0;
  
  // Calculate new price based on selection and adjustment
  const getBasePrice = () => {
    switch (priceType) {
      case 'current':
        return product?.sellingPrice || 0;
      case 'cost':
        return product?.costPrice || 0;
      case 'lastPurchase':
        return product?.lastPurchasePrice || 0;
      default:
        return product?.sellingPrice || 0;
    }
  };

  const calculateNewPrice = () => {
    const basePrice = getBasePrice();
    if (adjustmentType === 'amount') {
      return basePrice + adjustmentValue;
    } else {
      return basePrice + (basePrice * adjustmentValue / 100);
    }
  };

  const newPrice = calculateNewPrice();

  const handleSave = () => {
    onSave(product.id, newPrice, applyToAll);
    onClose();
  };

  const increment = () => {
    setAdjustmentValue(prev => prev + (adjustmentType === 'percent' ? 1 : 1000));
  };

  const decrement = () => {
    setAdjustmentValue(prev => prev - (adjustmentType === 'percent' ? 1 : 1000));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giá bán - {product?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-2">
          {/* Price Adjustment Row */}
          <div className="flex items-center gap-3 justify-start">
            <span className="text-sm text-slate-700 whitespace-nowrap shrink-0">
              Giá mới <span className="text-green-600">[{currentPrice.toLocaleString('vi-VN')}]</span> =
            </span>
            
            {/* Base Price Selector */}
            <Select value={priceType} onValueChange={setPriceType}>
              <SelectTrigger className="w-[180px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Giá hiện tại</SelectItem>
                <SelectItem value="cost">Giá vốn</SelectItem>
                <SelectItem value="lastPurchase">Giá nhập cuối</SelectItem>
              </SelectContent>
            </Select>

            {/* Increment/Decrement Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={increment}
                className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={decrement}
                className="w-10 h-10 flex items-center justify-center bg-slate-400 hover:bg-slate-500 text-white rounded transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* Adjustment Value Input */}
            <input
              type="number"
              value={adjustmentValue}
              onChange={(e) => setAdjustmentValue(Number(e.target.value))}
              className="w-28 shrink-0 px-3 py-2.5 border border-slate-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Unit Toggle Buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setAdjustmentType('amount')}
                className={`px-4 py-2.5 text-sm font-medium rounded transition-colors ${
                  adjustmentType === 'amount'
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                VNĐ
              </button>
              <button
                onClick={() => setAdjustmentType('percent')}
                className={`px-4 py-2.5 text-sm font-medium rounded transition-colors ${
                  adjustmentType === 'percent'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                %
              </button>
            </div>
          </div>

          {/* New Price Display */}
          <div className="p-5 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-base text-slate-700">Giá bán mới:</span>
              <span className="text-2xl font-semibold text-green-600">
                {newPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="text-slate-600">Lợi nhuận:</span>
              <span className="text-green-600 font-medium">
                {product?.costPrice ? ((newPrice - product.costPrice) / newPrice * 100).toFixed(1) : 0}%
                <span className="ml-2 text-slate-600">
                  ({product?.costPrice ? (newPrice - product.costPrice).toLocaleString('vi-VN') : 0}đ)
                </span>
              </span>
            </div>
          </div>

          {/* Apply to All Checkbox */}
          <div className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <Checkbox 
              id="applyToAll"
              checked={applyToAll}
              onCheckedChange={(checked) => setApplyToAll(checked as boolean)}
              className="mt-0.5"
            />
            <Label htmlFor="applyToAll" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
              Áp dụng công thức cho tất cả sản phẩm trong danh mục <strong>{categoryLabel}</strong>
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="min-w-24">
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 min-w-24">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProductPricing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['ready-made', 'composite', 'ingredient']);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Mock data
  const [products, setProducts] = useState([
    { id: 1, code: 'CF001', name: 'Cà phê đen đá', category: 'bottled-beverages', type: 'composite', costPrice: 8000, lastPurchasePrice: 7500, sellingPrice: 25000 },
    { id: 2, code: 'CF002', name: 'Bạc xỉu', category: 'bottled-beverages', type: 'composite', costPrice: 10000, lastPurchasePrice: 9800, sellingPrice: 30000 },
    { id: 3, code: 'TR001', name: 'Trà sữa trân châu', category: 'tea-coffee', type: 'composite', costPrice: 12000, lastPurchasePrice: 11500, sellingPrice: 35000 },
    { id: 4, code: 'BK001', name: 'Bánh croissant', category: 'packaging', type: 'ready-made', costPrice: 7000, lastPurchasePrice: 6800, sellingPrice: 20000 },
    { id: 5, code: 'NL001', name: 'Cà phê hạt Arabica', category: 'tea-coffee', type: 'ingredient', costPrice: 350000, lastPurchasePrice: 340000, sellingPrice: 380000 },
  ]);

  const toggleCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(c => c !== categoryId)
        : [...selectedCategories.filter(c => c !== 'all'), categoryId];
      setSelectedCategories(newCategories.length === 0 ? ['all'] : newCategories);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleSavePrice = (productId: number, newPrice: number, applyToAll: boolean) => {
    if (applyToAll && selectedProduct) {
      // Apply to all products in the same category
      setProducts(products.map(p => 
        p.category === selectedProduct.category 
          ? { ...p, sellingPrice: newPrice }
          : p
      ));
    } else {
      // Apply to single product
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, sellingPrice: newPrice }
          : p
      ));
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ready-made':
        return 'Hàng hóa bán sẵn';
      case 'composite':
        return 'Hàng hóa cấu thành';
      case 'ingredient':
        return 'Nguyên liệu';
      default:
        return type;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.includes('all') || selectedCategories.includes(product.category);
    const matchesType = selectedTypes.includes(product.type);
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto hidden lg:block">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Danh mục</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={cat.id} 
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <Label htmlFor={cat.id} className="text-sm text-slate-700 cursor-pointer">
                      {cat.name}
                    </Label>
                  </div>
                  <span className="text-xs text-slate-500">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm text-slate-900 mb-3">Loại hàng hóa</h3>
            <div className="space-y-2">
              {[
                { id: 'ready-made', label: 'Hàng hóa bán sẵn' },
                { id: 'composite', label: 'Hàng hóa cấu thành' },
                { id: 'ingredient', label: 'Nguyên liệu' },
              ].map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                  />
                  <Label htmlFor={type.id} className="text-sm text-slate-700 cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <DollarSign className="w-3 h-3 mr-2" />
                Lợi nhuận thấp
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <TrendingDown className="w-3 h-3 mr-2" />
                Giá cao nhất
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">Thiết lập giá</h1>
          <p className="text-sm text-slate-600">Quản lý giá vốn và giá bán sản phẩm</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Mã hàng</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Tên hàng hóa</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Danh mục</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-600">Loại hàng hóa</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Giá vốn</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Giá nhập cuối</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Giá bán</th>
                  <th className="px-4 py-3 text-right text-xs text-slate-600">Lợi nhuận (%)</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const margin = ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(0);
                  const categoryLabel = categories.find(c => c.id === product.category)?.name || product.category;
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">{product.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{categoryLabel}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {getTypeLabel(product.type)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">
                        {product.costPrice.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 text-right">
                        {product.lastPurchasePrice.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">
                        {product.sellingPrice.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right">
                        {margin}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Hiển thị {filteredProducts.length} sản phẩm
            </p>
          </div>
        </div>
      </div>

      {/* Price Edit Dialog */}
      <PriceEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        product={selectedProduct}
        onSave={handleSavePrice}
      />
    </div>
  );
}