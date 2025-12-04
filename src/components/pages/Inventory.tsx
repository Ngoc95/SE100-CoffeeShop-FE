import { useState, Fragment } from 'react';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  Package, 
  Calendar,
  TrendingDown,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Layers,
  Box,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { categories } from '../../data/categories';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ImageUploadWithCrop } from '../ImageUploadWithCrop';
import { ImportExcelDialog } from '../ImportExcelDialog';

// Type definitions
type ItemType = 'ready-made' | 'composite' | 'ingredient';
type SortField = 'name' | 'currentStock' | 'totalValue' | 'expiryDate';
type SortOrder = 'asc' | 'desc' | null;

interface BatchInfo {
  batchCode: string;
  quantity: number;
  unitCost: number;
  entryDate: string;
  expiryDate?: string;
  supplier: string;
}

interface CompositeIngredient {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantity: number;
  unitCost: number;
}

interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  status: 'good' | 'low' | 'expiring' | 'critical';
  imageUrl?: string; // Image URL for the item
  
  // For ready-made & ingredients
  batches?: BatchInfo[];
  
  // For composite items
  ingredients?: CompositeIngredient[];
  
  // Calculated fields
  totalValue: number;
  avgUnitCost: number;
}

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>(['ready-made', 'composite', 'ingredient']);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['good', 'low', 'expiring', 'critical']);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<ItemType>('ready-made');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [activeTab, setActiveTab] = useState<ItemType>('ready-made');
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addIngredientDialogOpen, setAddIngredientDialogOpen] = useState(false);
  const [addUnitDialogOpen, setAddUnitDialogOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<CompositeIngredient[]>([]);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [newItemImage, setNewItemImage] = useState<string>('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Mock data
  const inventoryItems: InventoryItem[] = [
    // Ready-made items
    {
      id: 'rm1',
      name: 'Coca Cola',
      type: 'ready-made',
      category: 'bottled-beverages',
      currentStock: 48,
      unit: 'chai',
      minStock: 20,
      maxStock: 100,
      status: 'good',
      imageUrl: 'https://images.unsplash.com/photo-1648569883125-d01072540b4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NhJTIwY29sYSUyMGJvdHRsZXxlbnwxfHx8fDE3NjM5OTI5MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO001',
          quantity: 30,
          unitCost: 12000,
          entryDate: '2025-01-10',
          expiryDate: '2025-06-15',
          supplier: 'Coca Cola Việt Nam'
        },
        {
          batchCode: 'LO002',
          quantity: 18,
          unitCost: 11500,
          entryDate: '2025-01-18',
          expiryDate: '2025-07-20',
          supplier: 'Coca Cola Việt Nam'
        }
      ],
      totalValue: 567000,
      avgUnitCost: 11813
    },
    {
      id: 'rm2',
      name: 'Bánh Croissant',
      type: 'ready-made',
      category: 'packaging',
      currentStock: 8,
      unit: 'cái',
      minStock: 15,
      maxStock: 50,
      status: 'low',
      imageUrl: 'https://images.unsplash.com/photo-1712723246766-3eaea22e52ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzY0MDA2MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO003',
          quantity: 8,
          unitCost: 25000,
          entryDate: '2025-01-22',
          expiryDate: '2025-01-26',
          supplier: 'Tiệm bánh ABC'
        }
      ],
      totalValue: 200000,
      avgUnitCost: 25000
    },
    
    // Composite items
    {
      id: 'cp1',
      name: 'Cà phê Latte',
      type: 'composite',
      category: 'bottled-beverages',
      currentStock: 0,
      unit: 'ly',
      minStock: 0,
      maxStock: 0,
      status: 'good',
      imageUrl: 'https://images.unsplash.com/photo-1585494156145-1c60a4fe952b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBsYXR0ZXxlbnwxfHx8fDE3NjM5MzQ4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      ingredients: [
        { ingredientId: 'ing1', ingredientName: 'Cà phê hạt Arabica', unit: 'g', quantity: 18, unitCost: 350 },
        { ingredientId: 'ing2', ingredientName: 'Sữa tươi', unit: 'ml', quantity: 200, unitCost: 28 },
        { ingredientId: 'ing3', ingredientName: 'Đường trắng', unit: 'g', quantity: 10, unitCost: 22 }
      ],
      totalValue: 0,
      avgUnitCost: 12120
    },
    {
      id: 'cp2',
      name: 'Trà sữa Ô Long',
      type: 'composite',
      category: 'bottled-beverages',
      currentStock: 0,
      unit: 'ly',
      minStock: 0,
      maxStock: 0,
      status: 'good',
      imageUrl: 'https://images.unsplash.com/photo-1597215753169-e717ab0acbe5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxrJTIwdGVhJTIwb29sb25nfGVufDF8fHx8MTc2NDAzNDc5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      ingredients: [
        { ingredientId: 'ing5', ingredientName: 'Trà Ô Long', unit: 'g', quantity: 10, unitCost: 280 },
        { ingredientId: 'ing2', ingredientName: 'Sữa tươi', unit: 'ml', quantity: 150, unitCost: 28 },
        { ingredientId: 'ing3', ingredientName: 'Đường trắng', unit: 'g', quantity: 15, unitCost: 22 },
        { ingredientId: 'ing4', ingredientName: 'Kem tươi', unit: 'ml', quantity: 30, unitCost: 85 }
      ],
      totalValue: 0,
      avgUnitCost: 10280
    },
    
    // Ingredients
    {
      id: 'ing1',
      name: 'Cà phê hạt Arabica',
      type: 'ingredient',
      category: 'coffee',
      currentStock: 15,
      unit: 'kg',
      minStock: 20,
      maxStock: 50,
      status: 'low',
      imageUrl: 'https://images.unsplash.com/photo-1627060063885-e1a30ab40551?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMGFyYWJpY2F8ZW58MXx8fHwxNzY0MDM1MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO101',
          quantity: 10,
          unitCost: 350000,
          entryDate: '2025-01-05',
          supplier: 'Trung Nguyên'
        },
        {
          batchCode: 'LO102',
          quantity: 5,
          unitCost: 360000,
          entryDate: '2025-01-15',
          supplier: 'Trung Nguyên'
        }
      ],
      totalValue: 5300000,
      avgUnitCost: 353333
    },
    {
      id: 'ing2',
      name: 'Sữa tươi',
      type: 'ingredient',
      category: 'dairy',
      currentStock: 12,
      unit: 'L',
      minStock: 10,
      maxStock: 30,
      status: 'expiring',
      imageUrl: 'https://images.unsplash.com/photo-1523473827533-2a64d0d36748?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMG1pbGt8ZW58MXx8fHwxNzYzOTUwMzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO201',
          quantity: 7,
          unitCost: 28000,
          entryDate: '2025-01-20',
          expiryDate: '2025-01-27',
          supplier: 'Vinamilk'
        },
        {
          batchCode: 'LO202',
          quantity: 5,
          unitCost: 27500,
          entryDate: '2025-01-22',
          expiryDate: '2025-01-29',
          supplier: 'Vinamilk'
        }
      ],
      totalValue: 333500,
      avgUnitCost: 27792
    },
    {
      id: 'ing3',
      name: 'Đường trắng',
      type: 'ingredient',
      category: 'syrup',
      currentStock: 3,
      unit: 'kg',
      minStock: 10,
      maxStock: 30,
      status: 'critical',
      imageUrl: 'https://images.unsplash.com/photo-1641679103706-fc8542e2a97a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHN1Z2FyfGVufDF8fHx8MTc2Mzk5NTQ0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO301',
          quantity: 3,
          unitCost: 22000,
          entryDate: '2025-01-10',
          supplier: 'Biên Hòa'
        }
      ],
      totalValue: 66000,
      avgUnitCost: 22000
    },
    {
      id: 'ing4',
      name: 'Kem tươi',
      type: 'ingredient',
      category: 'dairy',
      currentStock: 8,
      unit: 'hộp',
      minStock: 5,
      maxStock: 20,
      status: 'expiring',
      imageUrl: 'https://images.unsplash.com/photo-1622737338437-39a24c37f0de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGlwcGVkJTIwY3JlYW18ZW58MXx8fHwxNzY0MDM1MDMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO401',
          quantity: 8,
          unitCost: 85000,
          entryDate: '2025-01-19',
          expiryDate: '2025-01-29',
          supplier: 'Anchor'
        }
      ],
      totalValue: 680000,
      avgUnitCost: 85000
    },
    {
      id: 'ing5',
      name: 'Trà Ô Long',
      type: 'ingredient',
      category: 'tea',
      currentStock: 25,
      unit: 'kg',
      minStock: 10,
      maxStock: 40,
      status: 'good',
      imageUrl: 'https://images.unsplash.com/photo-1760074057726-e94ee8ff1eb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvb2xvbmclMjB0ZWElMjBsZWF2ZXN8ZW58MXx8fHwxNzYzOTY1ODc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO501',
          quantity: 15,
          unitCost: 280000,
          entryDate: '2025-01-08',
          supplier: 'Phúc Long'
        },
        {
          batchCode: 'LO502',
          quantity: 10,
          unitCost: 275000,
          entryDate: '2025-01-16',
          supplier: 'Phúc Long'
        }
      ],
      totalValue: 6950000,
      avgUnitCost: 278000
    },
    {
      id: 'ing6',
      name: 'Ly nhựa size L',
      type: 'ingredient',
      category: 'packaging',
      currentStock: 150,
      unit: 'cái',
      minStock: 500,
      maxStock: 2000,
      status: 'critical',
      imageUrl: 'https://images.unsplash.com/photo-1561050933-2482aca2dd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwY3VwfGVufDF8fHx8MTc2NDAzNTAzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      batches: [
        {
          batchCode: 'LO601',
          quantity: 150,
          unitCost: 1200,
          entryDate: '2025-01-12',
          supplier: 'Bao bì Minh Anh'
        }
      ],
      totalValue: 180000,
      avgUnitCost: 1200
    },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

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

  const toggleType = (type: ItemType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-emerald-500">Đủ</Badge>;
      case 'low':
        return <Badge className="bg-amber-500">Sắp hết</Badge>;
      case 'expiring':
        return <Badge className="bg-orange-500">Gần hết hạn</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Thiếu</Badge>;
    }
  };

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return days;
  };

  const getEarliestExpiryFromBatches = (batches?: BatchInfo[]) => {
    if (!batches || batches.length === 0) return null;
    const datesWithExpiry = batches.filter(b => b.expiryDate).map(b => b.expiryDate!);
    if (datesWithExpiry.length === 0) return null;
    return datesWithExpiry.sort()[0];
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const getAddDialogTitle = () => {
    switch (activeTab) {
      case 'ready-made':
        return 'Thêm hàng hóa bán sẵn';
      case 'composite':
        return 'Thêm hàng hóa cấu thành';
      case 'ingredient':
        return 'Thêm nguyên liệu';
    }
  };

  let filteredItems = inventoryItems.filter(item => {
    const matchesCategory = selectedCategories.includes('all') || selectedCategories.includes(item.category);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatuses.includes(item.status);
    const matchesType = selectedTypes.includes(item.type);
    return matchesCategory && matchesSearch && matchesStatus && matchesType;
  });

  // Apply sorting
  if (sortField && sortOrder) {
    filteredItems = [...filteredItems].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'expiryDate') {
        const aExpiry = getEarliestExpiryFromBatches(a.batches);
        const bExpiry = getEarliestExpiryFromBatches(b.batches);
        aValue = aExpiry ? new Date(aExpiry).getTime() : Infinity;
        bValue = bExpiry ? new Date(bExpiry).getTime() : Infinity;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = inventoryItems.filter(item => item.status === 'low' || item.status === 'critical').length;
  const expiringCount = inventoryItems.filter(item => item.status === 'expiring').length;

  // Filter by active tab
  const tabFilteredItems = filteredItems.filter(item => item.type === activeTab);

  return (
    <div className="flex h-full">
      {/* Left Filter Panel */}
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
            <h3 className="text-sm text-slate-900 mb-3">Trạng thái</h3>
            <div className="space-y-2">
              {[
                { id: 'good', label: 'Đủ hàng', color: 'bg-emerald-500' },
                { id: 'low', label: 'Sắp hết', color: 'bg-amber-500' },
                { id: 'expiring', label: 'Gần hết hạn', color: 'bg-orange-500' },
                { id: 'critical', label: 'Thiếu hàng', color: 'bg-red-500' },
              ].map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={status.id}
                    checked={selectedStatuses.includes(status.id)}
                    onCheckedChange={() => toggleStatus(status.id)}
                  />
                  <Label htmlFor={status.id} className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
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
                <TrendingDown className="w-3 h-3 mr-2" />
                Tồn kho thấp ({lowStockCount})
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <AlertTriangle className="w-3 h-3 mr-2" />
                Sắp hết hạn ({expiringCount})
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-blue-900">Kho & Nguyên liệu</h1>
            <p className="text-slate-600 mt-1">Quản lý tồn kho và nguyên liệu</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Import Excel
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Thêm mặt hàng mới</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Item Type Selection */}
                <div>
                  <Label>Loại mặt hàng <span className="text-red-500">*</span></Label>
                  <Select value={addItemType} onValueChange={(value) => setAddItemType(value as ItemType)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready-made">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                          Hàng hóa bán sẵn
                        </div>
                      </SelectItem>
                      <SelectItem value="composite">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-600" />
                          Hàng hóa cấu thành
                        </div>
                      </SelectItem>
                      <SelectItem value="ingredient">
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-green-600" />
                          Nguyên liệu
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Dynamic Form Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Mã hàng hóa <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input 
                        placeholder="Tự động tạo"
                        value={`${addItemType === 'ready-made' ? 'RM' : addItemType === 'composite' ? 'CP' : 'IG'}${Math.floor(100 + Math.random() * 900)}`}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>Tên {addItemType === 'composite' ? 'hàng hóa' : addItemType === 'ready-made' ? 'hàng hóa' : 'nguyên liệu'} <span className="text-red-500">*</span></Label>
                    <Input 
                      className="mt-1.5"
                      placeholder={`VD: ${addItemType === 'composite' ? 'Cà phê Latte' : addItemType === 'ready-made' ? 'Coca Cola' : 'Cà phê hạt Arabica'}`} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Danh mục <span className="text-red-500">*</span></Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-blue-600 hover:text-blue-700"
                        onClick={() => setAddCategoryDialogOpen(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm danh mục
                      </Button>
                    </div>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Đơn vị <span className="text-red-500">*</span></Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-blue-600 hover:text-blue-700"
                        onClick={() => setAddUnitDialogOpen(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm đơn vị
                      </Button>
                    </div>
                    <Select>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="g">Gram (g)</SelectItem>
                        <SelectItem value="l">Lít (L)</SelectItem>
                        <SelectItem value="ml">Mililit (ml)</SelectItem>
                        <SelectItem value="box">Hộp</SelectItem>
                        <SelectItem value="bottle">Chai</SelectItem>
                        <SelectItem value="piece">Cái</SelectItem>
                        <SelectItem value="cup">Ly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {addItemType !== 'composite' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tồn kho tối thiểu</Label>
                      <Input type="number" className="mt-1.5" placeholder="0" />
                    </div>
                    <div>
                      <Label>Tồn kho tối đa</Label>
                      <Input type="number" className="mt-1.5" placeholder="0" />
                    </div>
                  </div>
                )}

                {/* Image Upload Section */}
                <div>
                  <ImageUploadWithCrop 
                    value={newItemImage}
                    onChange={setNewItemImage}
                    label="Hình ảnh sản phẩm"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Tải lên hình ảnh cho {addItemType === 'composite' ? 'hàng hóa' : addItemType === 'ready-made' ? 'hàng hóa' : 'nguyên liệu'} (tùy chọn)
                  </p>
                </div>

                {addItemType === 'composite' && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm">Công thức nguyên liệu</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => setAddIngredientDialogOpen(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm nguyên liệu
                      </Button>
                    </div>
                    {selectedIngredients.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Nhấn "Thêm nguyên liệu" để xây dựng công thức cho món này
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-purple-100">
                              <TableHead className="w-12">STT</TableHead>
                              <TableHead>Mã</TableHead>
                              <TableHead>Tên nguyên liệu</TableHead>
                              <TableHead>Đơn vị</TableHead>
                              <TableHead>Số lượng</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedIngredients.map((ing, index) => (
                              <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{ing.ingredientId}</TableCell>
                                <TableCell>{ing.ingredientName}</TableCell>
                                <TableCell>{ing.unit}</TableCell>
                                <TableCell>{ing.quantity}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">
                    <span className="text-red-500">*</span> Trường bắt buộc
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {addItemType === 'composite' ? 'Thêm hàng hóa' : addItemType === 'ready-made' ? 'Thêm hàng hóa' : 'Thêm nguyên liệu'}
                </Button>
              </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Add Category Dialog */}
        <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
            <DialogContent className="max-w-md" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Thêm danh mục mới</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Tên danh mục <span className="text-red-500">*</span></Label>
                  <Input 
                    className="mt-1.5"
                    placeholder="VD: Đồ ăn nhanh" 
                  />
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">
                    <span className="text-red-500">*</span> Trường bắt buộc
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setAddCategoryDialogOpen(false)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm danh mục
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Ingredient Dialog */}
          <Dialog open={addIngredientDialogOpen} onOpenChange={setAddIngredientDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Thêm nguyên liệu vào công thức</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Search Ingredient */}
                <div>
                  <Label>Tìm kiếm nguyên liệu <span className="text-red-500">*</span></Label>
                  <div className="relative mt-1.5">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Nhập tên nguyên liệu..."
                      value={ingredientSearchQuery}
                      onChange={(e) => setIngredientSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                {/* Available Ingredients List */}
                <div>
                  <Label className="mb-2 block">Chọn nguyên liệu</Label>
                  <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                    {inventoryItems
                      .filter(item => 
                        item.type === 'ingredient' && 
                        item.name.toLowerCase().includes(ingredientSearchQuery.toLowerCase())
                      )
                      .map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 border-b last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="text-sm">{ingredient.name}</p>
                            <p className="text-xs text-slate-500">Mã: {ingredient.id} • Đơn vị: {ingredient.unit}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="SL"
                              className="w-20 h-8"
                              id={`qty-${ingredient.id}`}
                            />
                            <Button
                              size="sm"
                              className="h-8 bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                const qtyInput = document.getElementById(`qty-${ingredient.id}`) as HTMLInputElement;
                                const quantity = parseFloat(qtyInput?.value || '0');
                                
                                if (quantity > 0) {
                                  setSelectedIngredients(prev => [
                                    ...prev,
                                    {
                                      ingredientId: ingredient.id,
                                      ingredientName: ingredient.name,
                                      unit: ingredient.unit,
                                      quantity: quantity,
                                      unitCost: ingredient.avgUnitCost
                                    }
                                  ]);
                                  qtyInput.value = '';
                                }
                              }}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">
                    💡 Nhập số lượng và nhấn <Plus className="w-3 h-3 inline mx-1" /> để thêm nguyên liệu vào công thức
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddIngredientDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Unit Dialog */}
          <Dialog open={addUnitDialogOpen} onOpenChange={setAddUnitDialogOpen}>
            <DialogContent className="max-w-md" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Thêm đơn vị mới</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Tên đơn vị <span className="text-red-500">*</span></Label>
                  <Input 
                    className="mt-1.5"
                    placeholder="VD: Kilogram, Lít, Hộp..." 
                  />
                </div>
                
                <div>
                  <Label>Ký hiệu <span className="text-red-500">*</span></Label>
                  <Input 
                    className="mt-1.5"
                    placeholder="VD: kg, L, hộp..." 
                  />
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">
                    <span className="text-red-500">*</span> Trường bắt buộc
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddUnitDialogOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setAddUnitDialogOpen(false)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm đơn vị
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Tổng giá trị kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-blue-900">{(totalValue / 1000000).toFixed(1)}M₫</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Tồn kho thấp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-red-900">{lowStockCount} mặt hàng</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Sắp hết hạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-orange-900">{expiringCount} mặt hàng</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tổng mặt hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-indigo-900">{filteredItems.length} mặt hàng</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ItemType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="ready-made" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Hàng hóa bán sẵn
            </TabsTrigger>
            <TabsTrigger value="composite" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Hàng hóa cấu thành
            </TabsTrigger>
            <TabsTrigger value="ingredient" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Nguyên liệu
            </TabsTrigger>
          </TabsList>

          {/* Ready-made Tab */}
          <TabsContent value="ready-made">
            <Card className="border-blue-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-16">STT</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('name')}
                            className="flex items-center hover:text-blue-600"
                          >
                            Tên hàng hóa
                            {getSortIcon('name')}
                          </button>
                        </TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Lô hàng</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('currentStock')}
                            className="flex items-center hover:text-blue-600"
                          >
                            Tồn kho
                            {getSortIcon('currentStock')}
                          </button>
                        </TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('expiryDate')}
                            className="flex items-center hover:text-blue-600"
                          >
                            HSD gần nhất
                            {getSortIcon('expiryDate')}
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('totalValue')}
                            className="flex items-center hover:text-blue-600"
                          >
                            Giá trị
                            {getSortIcon('totalValue')}
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredItems.map((item, index) => {
                        const earliestExpiry = getEarliestExpiryFromBatches(item.batches);
                        const isExpanded = expandedItemId === item.id;
                        
                        return (
                          <Fragment key={item.id}>
                            {/* Main Row */}
                            <TableRow 
                              className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-500">
                                    Min: {item.minStock} {item.unit} • Max: {item.maxStock} {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {categories.find(c => c.id === item.category)?.name}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {item.batches?.length || 0} lô
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.currentStock} {item.unit}
                                  </p>
                                  <Progress 
                                    value={(item.currentStock / item.maxStock) * 100}
                                    className="h-1 mt-1"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell className="text-sm">
                                {earliestExpiry ? (
                                  <div>
                                    <p className="text-slate-900">
                                      {new Date(earliestExpiry).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p className={`text-xs ${
                                      getDaysUntilExpiry(earliestExpiry)! < 7 
                                        ? 'text-red-600' 
                                        : 'text-slate-500'
                                    }`}>
                                      Còn {getDaysUntilExpiry(earliestExpiry)} ngày
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-blue-900">
                                {item.totalValue.toLocaleString()}₫
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Row */}
                            {isExpanded && (
                              <TableRow className="bg-blue-50/30">
                                <TableCell colSpan={10} className="p-0">
                                  <div className="p-6 animate-in slide-in-from-top-2">
                                    {/* Image and Info Section */}
                                    <div className="flex gap-6 mb-6">
                                      {/* Product Image */}
                                      <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                          <img 
                                            src={item.imageUrl} 
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
                                          />
                                        ) : (
                                          <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                                            <Package className="w-16 h-16 text-slate-400" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Product Info */}
                                      <div className="flex-1">
                                        <h3 className="text-lg text-slate-900 mb-2">{item.name}</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-slate-500">Mã hàng:</span>
                                            <span className="ml-2 text-slate-900">{item.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Danh mục:</span>
                                            <span className="ml-2 text-slate-900">{categories.find(c => c.id === item.category)?.name}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Tồn kho hiện tại:</span>
                                            <span className="ml-2 text-blue-900">{item.currentStock} {item.unit}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Giá trị tồn kho:</span>
                                            <span className="ml-2 text-blue-900">{item.totalValue.toLocaleString()}₫</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator className="mb-4" />
                                    
                                    <h4 className="text-sm text-slate-900 mb-3">Danh sách lô hàng</h4>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-blue-100">
                                            <TableHead>Mã lô</TableHead>
                                            <TableHead>Ngày nhập</TableHead>
                                            <TableHead>Số lượng</TableHead>
                                            <TableHead>Giá vốn</TableHead>
                                            <TableHead>HSD</TableHead>
                                            <TableHead>Nhà cung cấp</TableHead>
                                            <TableHead>Giá trị lô</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.batches?.map((batch) => (
                                            <TableRow key={batch.batchCode}>
                                              <TableCell className="text-sm text-slate-900">{batch.batchCode}</TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {new Date(batch.entryDate).toLocaleDateString('vi-VN')}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-900">
                                                {batch.quantity} {item.unit}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {batch.unitCost.toLocaleString()}₫
                                              </TableCell>
                                              <TableCell className="text-sm">
                                                {batch.expiryDate ? (
                                                  <div>
                                                    <p className="text-slate-900">
                                                      {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}
                                                    </p>
                                                    <p className={`text-xs ${
                                                      getDaysUntilExpiry(batch.expiryDate)! < 7 
                                                        ? 'text-red-600' 
                                                        : 'text-slate-500'
                                                    }`}>
                                                      Còn {getDaysUntilExpiry(batch.expiryDate)} ngày
                                                    </p>
                                                  </div>
                                                ) : (
                                                  <span className="text-slate-400">—</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">{batch.supplier}</TableCell>
                                              <TableCell className="text-sm text-blue-900">
                                                {(batch.quantity * batch.unitCost).toLocaleString()}₫
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Composite Tab */}
          <TabsContent value="composite">
            <Card className="border-purple-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-16">STT</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('name')}
                            className="flex items-center hover:text-purple-600"
                          >
                            Tên hàng hóa
                            {getSortIcon('name')}
                          </button>
                        </TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Số nguyên liệu</TableHead>
                        <TableHead>Giá vốn ước tính</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredItems.map((item, index) => {
                        const isExpanded = expandedItemId === item.id;
                        
                        return (
                          <Fragment key={item.id}>
                            {/* Main Row */}
                            <TableRow 
                              className="cursor-pointer hover:bg-purple-50/50 transition-colors"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-500">
                                    Đơn vị: {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {categories.find(c => c.id === item.category)?.name}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {item.ingredients?.length || 0} nguyên liệu
                              </TableCell>
                              <TableCell className="text-sm text-purple-900">
                                {item.avgUnitCost.toLocaleString()}₫
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Row */}
                            {isExpanded && (
                              <TableRow className="bg-purple-50/30">
                                <TableCell colSpan={7} className="p-0">
                                  <div className="p-6 animate-in slide-in-from-top-2">
                                    {/* Image and Info Section */}
                                    <div className="flex gap-6 mb-6">
                                      {/* Product Image */}
                                      <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                          <img 
                                            src={item.imageUrl} 
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                                          />
                                        ) : (
                                          <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                                            <Layers className="w-16 h-16 text-slate-400" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Product Info */}
                                      <div className="flex-1">
                                        <h3 className="text-lg text-slate-900 mb-2">{item.name}</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-slate-500">Mã hàng:</span>
                                            <span className="ml-2 text-slate-900">{item.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Danh mục:</span>
                                            <span className="ml-2 text-slate-900">{categories.find(c => c.id === item.category)?.name}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Số nguyên liệu:</span>
                                            <span className="ml-2 text-purple-900">{item.ingredients?.length || 0} nguyên liệu</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Giá vốn ước tính:</span>
                                            <span className="ml-2 text-purple-900">{item.avgUnitCost.toLocaleString()}₫</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator className="mb-4" />
                                    
                                    <h4 className="text-sm text-slate-900 mb-3">Danh sách nguyên liệu cấu thành</h4>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-purple-100">
                                            <TableHead>Mã NVL</TableHead>
                                            <TableHead>Tên nguyên liệu</TableHead>
                                            <TableHead>Đơn vị</TableHead>
                                            <TableHead>Số lượng dùng</TableHead>
                                            <TableHead>Giá vốn/đơn vị</TableHead>
                                            <TableHead>Thành tiền</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.ingredients?.map((ing) => (
                                            <TableRow key={ing.ingredientId}>
                                              <TableCell className="text-sm text-slate-600">{ing.ingredientId}</TableCell>
                                              <TableCell className="text-sm text-slate-900">{ing.ingredientName}</TableCell>
                                              <TableCell className="text-sm text-slate-600">{ing.unit}</TableCell>
                                              <TableCell className="text-sm text-slate-900">{ing.quantity}</TableCell>
                                              <TableCell className="text-sm text-slate-600">{ing.unitCost.toLocaleString()}₫</TableCell>
                                              <TableCell className="text-sm text-purple-900">{(ing.quantity * ing.unitCost).toLocaleString()}₫</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredient Tab */}
          <TabsContent value="ingredient">
            <Card className="border-green-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-50">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-16">STT</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('name')}
                            className="flex items-center hover:text-green-600"
                          >
                            Nguyên liệu
                            {getSortIcon('name')}
                          </button>
                        </TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Lô hàng</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('currentStock')}
                            className="flex items-center hover:text-green-600"
                          >
                            Tồn kho
                            {getSortIcon('currentStock')}
                          </button>
                        </TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('expiryDate')}
                            className="flex items-center hover:text-green-600"
                          >
                            HSD gần nhất
                            {getSortIcon('expiryDate')}
                          </button>
                        </TableHead>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('totalValue')}
                            className="flex items-center hover:text-green-600"
                          >
                            Giá trị
                            {getSortIcon('totalValue')}
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredItems.map((item, index) => {
                        const earliestExpiry = getEarliestExpiryFromBatches(item.batches);
                        const primarySupplier = item.batches?.[0]?.supplier || '—';
                        const isExpanded = expandedItemId === item.id;
                        
                        return (
                          <Fragment key={item.id}>
                            {/* Main Row */}
                            <TableRow 
                              className="cursor-pointer hover:bg-green-50/50 transition-colors"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-500">
                                    Min: {item.minStock} {item.unit} • Max: {item.maxStock} {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {categories.find(c => c.id === item.category)?.name}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {item.batches?.length || 0} lô
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.currentStock} {item.unit}
                                  </p>
                                  <Progress 
                                    value={(item.currentStock / item.maxStock) * 100}
                                    className="h-1 mt-1"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell className="text-sm">
                                {earliestExpiry ? (
                                  <div>
                                    <p className="text-slate-900">
                                      {new Date(earliestExpiry).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p className={`text-xs ${
                                      getDaysUntilExpiry(earliestExpiry)! < 7 
                                        ? 'text-red-600' 
                                        : 'text-slate-500'
                                    }`}>
                                      Còn {getDaysUntilExpiry(earliestExpiry)} ngày
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {primarySupplier}
                              </TableCell>
                              <TableCell className="text-sm text-green-900">
                                {item.totalValue.toLocaleString()}₫
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Row */}
                            {isExpanded && (
                              <TableRow className="bg-green-50/30">
                                <TableCell colSpan={11} className="p-0">
                                  <div className="p-6 animate-in slide-in-from-top-2">
                                    {/* Image and Info Section */}
                                    <div className="flex gap-6 mb-6">
                                      {/* Product Image */}
                                      <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                          <img 
                                            src={item.imageUrl} 
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                                          />
                                        ) : (
                                          <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                                            <Box className="w-16 h-16 text-slate-400" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Product Info */}
                                      <div className="flex-1">
                                        <h3 className="text-lg text-slate-900 mb-2">{item.name}</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-slate-500">Mã nguyên liệu:</span>
                                            <span className="ml-2 text-slate-900">{item.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Danh mục:</span>
                                            <span className="ml-2 text-slate-900">{categories.find(c => c.id === item.category)?.name}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Tồn kho hiện tại:</span>
                                            <span className="ml-2 text-green-900">{item.currentStock} {item.unit}</span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">Giá trị tồn kho:</span>
                                            <span className="ml-2 text-green-900">{item.totalValue.toLocaleString()}₫</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator className="mb-4" />
                                    
                                    <h4 className="text-sm text-slate-900 mb-3">Danh sách lô hàng</h4>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-green-100">
                                            <TableHead>Mã lô</TableHead>
                                            <TableHead>Ngày nhập</TableHead>
                                            <TableHead>Số lượng</TableHead>
                                            <TableHead>Giá vốn</TableHead>
                                            <TableHead>HSD</TableHead>
                                            <TableHead>Nhà cung cấp</TableHead>
                                            <TableHead>Giá trị lô</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.batches?.map((batch) => (
                                            <TableRow key={batch.batchCode}>
                                              <TableCell className="text-sm text-slate-900">{batch.batchCode}</TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {new Date(batch.entryDate).toLocaleDateString('vi-VN')}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-900">
                                                {batch.quantity} {item.unit}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {batch.unitCost.toLocaleString()}₫
                                              </TableCell>
                                              <TableCell className="text-sm">
                                                {batch.expiryDate ? (
                                                  <div>
                                                    <p className="text-slate-900">
                                                      {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}
                                                    </p>
                                                    <p className={`text-xs ${
                                                      getDaysUntilExpiry(batch.expiryDate)! < 7 
                                                        ? 'text-red-600' 
                                                        : 'text-slate-500'
                                                    }`}>
                                                      Còn {getDaysUntilExpiry(batch.expiryDate)} ngày
                                                    </p>
                                                  </div>
                                                ) : (
                                                  <span className="text-slate-400">—</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">{batch.supplier}</TableCell>
                                              <TableCell className="text-sm text-green-900">
                                                {(batch.quantity * batch.unitCost).toLocaleString()}₫
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Import Excel Dialog */}
      <ImportExcelDialog 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}