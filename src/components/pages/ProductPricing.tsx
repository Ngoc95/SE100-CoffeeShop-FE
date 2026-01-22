import { useState, useEffect } from 'react';
import { Search, Pencil, Filter, Plus, Minus, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { inventoryService } from '../../services/inventoryService';
import { ProductPricingItem } from '../../types/inventory';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Input } from '../ui/input';

interface PriceEditDialogProps {
  open: boolean;
  onClose: () => void;
  product: any;
  onSave: (data: {
    productId: number;
    priceType: string;
    adjustmentValue: number;
    adjustmentType: 'amount' | 'percent';
    applyToAll: boolean;
  }) => void;
}

function PriceEditDialog({ open, onClose, product, onSave }: PriceEditDialogProps) {
  const [priceType, setPriceType] = useState('current'); // current, cost, selling
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'amount' | 'percent'>('amount');
  const [applyToAll, setApplyToAll] = useState(false);

  const categoryLabel = product?.category?.name || "";
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
    onSave({
      productId: product.id,
      priceType,
      adjustmentValue,
      adjustmentType,
      applyToAll
    });
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
      <DialogContent className="max-w-none w-[98vw] max-h-[98vh] overflow-y-auto" style={{ maxWidth: '1600px' }} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giá bán - {product?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-4">
          {/* Price Adjustment Row */}
          <div className="flex items-center gap-3 justify-start flex-wrap">
            <span className="text-sm text-slate-700 whitespace-nowrap shrink-0">
              Giá mới <span className="text-blue-600">[{currentPrice.toLocaleString('vi-VN')}]</span> =
            </span>

            {/* Base Price Selector */}
            <Select value={priceType} onValueChange={setPriceType}>
              <SelectTrigger className="w-[180px] shrink-0 bg-white border-slate-300 shadow-none">
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
                className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
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
              className="w-28 shrink-0 px-3 py-2.5 bg-white border border-slate-300 rounded text-sm text-center shadow-none focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />

            {/* Unit Toggle Buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setAdjustmentType('amount')}
                className={`px-4 py-2.5 text-sm font-medium rounded transition-colors ${adjustmentType === 'amount'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
              >
                VNĐ
              </button>
              <button
                onClick={() => setAdjustmentType('percent')}
                className={`px-4 py-2.5 text-sm font-medium rounded transition-colors ${adjustmentType === 'percent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
              >
                %
              </button>
            </div>
          </div>

          {/* New Price Display */}
          <div className="p-5 bg-white border border-slate-300 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-base text-slate-700">Giá bán mới:</span>
              <span className="text-2xl font-semibold text-blue-600">
                {newPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="text-slate-600">Lợi nhuận:</span>
              <span className="text-blue-600 font-medium">
                {product?.costPrice ? ((newPrice - product.costPrice) / newPrice * 100).toFixed(1) : 0}%
                <span className="ml-2 text-slate-600">
                  ({product?.costPrice ? (newPrice - product.costPrice).toLocaleString('vi-VN') : 0}đ)
                </span>
              </span>
            </div>
          </div>

          {/* Apply to All Checkbox */}
          <div className="flex items-start space-x-3 p-4 border border-slate-300 rounded-lg bg-white">
            <Checkbox
              id="applyToAll"
              checked={applyToAll}
              onCheckedChange={(checked: boolean) => setApplyToAll(checked)}
              className="mt-0.5 border-slate-300"
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
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 min-w-24">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type SortField = "code" | "name" | "category" | "type" | "unit" | "costPrice" | "lastPurchasePrice" | "sellingPrice" | "margin";
type SortOrder = "asc" | "desc" | "none";

export function ProductPricing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['ready-made', 'composite', 'ingredient']);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductPricingItem | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<ProductPricingItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          inventoryService.getPricing(1, 1000),
          inventoryService.getCategories()
        ]);

        // Handle items response
        let items: ProductPricingItem[] = [];
        const rawItems = itemsRes?.metaData?.items;

        if (Array.isArray(rawItems)) {
          items = rawItems.map((i): ProductPricingItem => ({
            id: i.id,
            name: i.name,
            category: i.category,
            itemType: i.itemType,
            unit: i.unit,
            costPrice: Number(i.costPrice),
            lastPurchasePrice: Number(i.lastPurchasePrice),
            sellingPrice: Number(i.sellingPrice),
            margin: Number(i.margin),
            lastPurchaseDate: i.lastPurchaseDate
          }));
        }

        console.log('[ProductPricing] Mapped items:', items);
        setProducts(items);

        // Handle categories
        setCategoriesList(categoriesRes?.metaData || categoriesRes?.items || categoriesRes || []);

      } catch (error) {
        console.error("Error fetching pricing data:", error);
        toast.error("Không thể tải dữ liệu giá");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleSavePrice = async (data: {
    productId: number;
    priceType: string;
    adjustmentValue: number;
    adjustmentType: 'amount' | 'percent';
    applyToAll: boolean;
  }) => {
    if (!selectedProduct) return;

    try {
      // Map UI priceType to API baseType
      const baseTypeMap: Record<string, "cost" | "current" | "lastPurchase"> = {
        current: "current",
        cost: "cost",
        lastPurchase: "lastPurchase"
      };

      if (data.applyToAll) {
        // Apply to all products in the same category
        await inventoryService.updateCategoryPrice({
          categoryId: selectedProduct.category.id,
          baseType: baseTypeMap[data.priceType] || "current",
          adjustmentValue: data.adjustmentValue,
          adjustmentType: data.adjustmentType
        });

        toast.success(`Đã cập nhật giá cho danh mục ${selectedProduct.category.name}`);
      } else {
        // Apply to single product
        await inventoryService.updateSinglePrice({
          itemId: data.productId,
          baseType: baseTypeMap[data.priceType] || "current",
          adjustmentValue: data.adjustmentValue,
          adjustmentType: data.adjustmentType
        });

        toast.success("Cập nhật giá thành công");
      }

      // Refresh data
      setEditDialogOpen(false);
      const itemsRes = await inventoryService.getPricing(1, 1000);
      const rawItems = itemsRes?.metaData?.items;
      if (Array.isArray(rawItems)) {
        const items = rawItems.map((i): ProductPricingItem => ({
          id: i.id,
          name: i.name,
          category: i.category,
          itemType: i.itemType,
          unit: i.unit,
          costPrice: Number(i.costPrice),
          lastPurchasePrice: Number(i.lastPurchasePrice),
          sellingPrice: Number(i.sellingPrice),
          margin: Number(i.margin),
          lastPurchaseDate: i.lastPurchaseDate
        }));
        setProducts(items);
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Lỗi khi cập nhật giá");
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> none -> asc
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortField(null);
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };



  const getSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === "none") {
      return null;
    }
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.id).includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.includes('all') || selectedCategories.includes(String(product.category.id));
    const matchesType = selectedTypes.includes(product.itemType?.name.toLowerCase() === "ready_made" ? "ready-made" : product.itemType?.name.toLowerCase() || "");
    return matchesSearch && matchesCategory && matchesType;
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "code") {
        aValue = a.id;
        bValue = b.id;
      } else if (sortField === "name") {
        aValue = a.name;
        bValue = b.name;
      } else if (sortField === "category") {
        aValue = a.category.name;
        bValue = b.category.name;
      } else if (sortField === "type") {
        aValue = getTypeLabel(a.itemType.name);
        bValue = getTypeLabel(b.itemType.name);
      } else if (sortField === "unit") {
        aValue = a.unit || "";
        bValue = b.unit || "";
      } else if (sortField === "costPrice") {
        aValue = a.costPrice;
        bValue = b.costPrice;
      } else if (sortField === "lastPurchasePrice") {
        aValue = a.lastPurchasePrice;
        bValue = b.lastPurchasePrice;
      } else if (sortField === "sellingPrice") {
        aValue = a.sellingPrice;
        bValue = b.sellingPrice;
      } else if (sortField === "margin") {
        const aMargin = ((a.sellingPrice - a.costPrice) / a.sellingPrice * 100);
        const bMargin = ((b.sellingPrice - b.costPrice) / b.sellingPrice * 100);
        aValue = aMargin;
        bValue = bMargin;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "vi");
        return sortOrder === "asc" ? comparison : -comparison;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Thiết lập giá</h1>
          <p className="text-slate-600 text-sm">
            Quản lý giá vốn và giá bán sản phẩm
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo tên hoặc mã hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {(!selectedCategories.includes('all') || selectedTypes.length < 3) && (
                  <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {(!selectedCategories.includes('all') ? selectedCategories.length : 0) + (selectedTypes.length < 3 ? (3 - selectedTypes.length) : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filters */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Danh mục</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                      {categoriesList.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={String(cat.id)}
                              checked={selectedCategories.includes(String(cat.id))}
                              onCheckedChange={() => toggleCategory(String(cat.id))}
                              className="border-slate-300"
                            />
                            <Label htmlFor={String(cat.id)} className="text-sm text-slate-700 cursor-pointer font-normal">
                              {cat.name}
                            </Label>
                          </div>
                          {/* <span className="text-xs text-slate-500">{cat.count}</span> */}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Type Filters */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Loại hàng hóa</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
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
                            className="border-slate-300"
                          />
                          <Label htmlFor={type.id} className="text-sm text-slate-700 cursor-pointer font-normal">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategories(['all']);
                      setSelectedTypes(['ready-made', 'composite', 'ingredient']);
                      setSearchTerm("");
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách sản phẩm ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-16 text-sm text-center">STT</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã hàng
                      {getSortIcon("code")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Tên hàng hóa
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center">
                      Danh mục
                      {getSortIcon("category")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center">
                      Loại hàng hóa
                      {getSortIcon("type")}
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">Đơn vị</TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("costPrice")}
                  >
                    <div className="flex items-center justify-end">
                      Giá vốn
                      {getSortIcon("costPrice")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("lastPurchasePrice")}
                  >
                    <div className="flex items-center justify-end">
                      Giá nhập cuối
                      {getSortIcon("lastPurchasePrice")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("sellingPrice")}
                  >
                    <div className="flex items-center justify-end">
                      Giá bán
                      {getSortIcon("sellingPrice")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("margin")}
                  >
                    <div className="flex items-center justify-end">
                      Lợi nhuận (%)
                      {getSortIcon("margin")}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => {
                  const categoryLabel = product.category.name;
                  const isComposite = product.itemType.name === "composite";

                  // Use API provided fields directly
                  const costPrice = product.costPrice || 0;
                  const lastPurchasePrice = product.lastPurchasePrice || 0;
                  const margin = product.margin || 0;

                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm text-slate-600 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">{product.id}</TableCell>
                      <TableCell className="text-sm text-slate-900">{product.name}</TableCell>
                      <TableCell className="text-sm text-slate-700">{categoryLabel}</TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {getTypeLabel(product.itemType.name === "ready_made" ? "ready-made" : product.itemType.name)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {product.unit.symbol || product.unit.name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900 text-right">
                        {Math.round(costPrice).toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell className="text-sm text-blue-600 text-right">
                        {isComposite ? "-" : `${Math.round(lastPurchasePrice).toLocaleString('vi-VN')}đ`}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900 text-right">
                        {product.sellingPrice.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell className={`text-sm text-right ${margin < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {margin.toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Price Edit Dialog */}
      <PriceEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        product={selectedProduct}
        onSave={handleSavePrice}
      />
    </div >
  );
}
