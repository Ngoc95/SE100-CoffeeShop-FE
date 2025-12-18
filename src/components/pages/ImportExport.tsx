import { useState } from 'react';
import {
  Plus,
  Download,
  Upload,
  RotateCcw,
  FileText,
  Calendar,
  User,
  Package,
  Trash2,
  Search,
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Filter,
  X as XIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner@2.0.3';
import { ImportExportExcelDialog } from '../ImportExportExcelDialog';

interface ImportItem {
  id: string;
  batchCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  expiryDate: string;
  unitPrice: number;
  discount: number;
  discountType: 'percent' | 'amount';
  totalPrice: number;
}

interface ExportItem {
  id: string;
  itemName: string;
  batchCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ReturnItem {
  id: string;
  batchCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  entryDate: string;
  returnReason: string;
  currentStock: number;
  totalPrice: number;
}

export function ImportExport() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [importExcelDialogOpen, setImportExcelDialogOpen] = useState(false);

  // Filters and expand state
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['import', 'export', 'return']);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['completed', 'pending']);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Import form state
  const [importCode, setImportCode] = useState('');
  const [supplier, setSupplier] = useState('');
  const [employee, setEmployee] = useState('');
  const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);
  const [importItems, setImportItems] = useState<ImportItem[]>([]);
  const [notes, setNotes] = useState('');

  // Export form state
  const [exportCode, setExportCode] = useState('');
  const [exportEmployee, setExportEmployee] = useState('');
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportReason, setExportReason] = useState('');
  const [exportItems, setExportItems] = useState<ExportItem[]>([]);
  const [exportNotes, setExportNotes] = useState('');

  // Return form state
  const [returnCode, setReturnCode] = useState('');
  const [returnSupplier, setReturnSupplier] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnReason, setReturnReason] = useState('');
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnNotes, setReturnNotes] = useState('');

  // Generate import code
  const generateImportCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `IM-${timestamp}`;
  };

  // Generate export code
  const generateExportCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `EX-${timestamp}`;
  };

  // Generate return code
  const generateReturnCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `RT-${timestamp}`;
  };

  // Open import dialog
  const handleOpenImportDialog = () => {
    setImportCode(generateImportCode());
    setSupplier('');
    setEmployee('');
    setImportDate(new Date().toISOString().split('T')[0]);
    setImportItems([]);
    setNotes('');
    setImportDialogOpen(true);
  };

  // Open export dialog
  const handleOpenExportDialog = () => {
    setExportCode(generateExportCode());
    setExportEmployee('');
    setExportDate(new Date().toISOString().split('T')[0]);
    setExportReason('');
    setExportItems([]);
    setExportNotes('');
    setExportDialogOpen(true);
  };

  // Open return dialog
  const handleOpenReturnDialog = () => {
    setReturnCode(generateReturnCode());
    setReturnSupplier('');
    setReturnDate(new Date().toISOString().split('T')[0]);
    setReturnReason('');
    setReturnItems([]);
    setReturnNotes('');
    setReturnDialogOpen(true);
  };

  // Add new item row
  const handleAddItem = () => {
    // Generate batch code based on current items length
    const batchNumber = String(importItems.length + 1).padStart(3, '0');
    const batchCode = `LO${batchNumber}`;

    const newItem: ImportItem = {
      id: Date.now().toString(),
      batchCode: batchCode,
      itemName: '',
      unit: '',
      quantity: 0,
      expiryDate: '',
      unitPrice: 0,
      discount: 0,
      discountType: 'percent',
      totalPrice: 0,
    };
    setImportItems([...importItems, newItem]);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setImportItems(importItems.filter(item => item.id !== id));
  };

  // Update item
  const handleUpdateItem = (id: string, field: keyof ImportItem, value: any) => {
    setImportItems(importItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate total price
        const subtotal = updatedItem.quantity * updatedItem.unitPrice;
        let discountAmount = 0;

        if (updatedItem.discountType === 'percent') {
          discountAmount = subtotal * (updatedItem.discount / 100);
        } else {
          discountAmount = updatedItem.discount;
        }

        updatedItem.totalPrice = subtotal - discountAmount;

        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    return importItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  // Submit import
  const handleSubmitImport = () => {
    if (!supplier || !employee || importItems.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate items
    const invalidItems = importItems.filter(
      item => !item.batchCode || !item.itemName || !item.unit || item.quantity <= 0 || item.unitPrice <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('Vui lòng điền đầy đủ thông tin hàng hóa');
      return;
    }

    toast.success('Tạo phiếu nhập hàng thành công!');
    setImportDialogOpen(false);
  };

  // Add export item
  const handleAddExportItem = () => {
    const newItem: ExportItem = {
      id: Date.now().toString(),
      itemName: '',
      batchCode: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    };
    setExportItems([...exportItems, newItem]);
  };

  // Remove export item
  const handleRemoveExportItem = (id: string) => {
    setExportItems(exportItems.filter(item => item.id !== id));
  };

  // Update export item
  const handleUpdateExportItem = (id: string, field: keyof ExportItem, value: any) => {
    setExportItems(exportItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate total price
        updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;

        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate export grand total
  const calculateExportGrandTotal = () => {
    return exportItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  // Submit export
  const handleSubmitExport = () => {
    if (!exportEmployee || !exportReason || exportItems.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate items
    const invalidItems = exportItems.filter(
      item => !item.itemName || !item.batchCode || !item.unit || item.quantity <= 0 || item.unitPrice <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('Vui lòng điền đầy đủ thông tin hàng hóa');
      return;
    }

    toast.success('Tạo phiếu xuất hàng thành công!');
    setExportDialogOpen(false);
  };

  // Add return item
  const handleAddReturnItem = () => {
    const newItem: ReturnItem = {
      id: Date.now().toString(),
      batchCode: '',
      itemName: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      entryDate: '',
      returnReason: '',
      currentStock: 0,
      totalPrice: 0,
    };
    setReturnItems([...returnItems, newItem]);
  };

  // Remove return item
  const handleRemoveReturnItem = (id: string) => {
    setReturnItems(returnItems.filter(item => item.id !== id));
  };

  // Update return item
  const handleUpdateReturnItem = (id: string, field: keyof ReturnItem, value: any) => {
    setReturnItems(returnItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate total price
        updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;

        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate return grand total
  const calculateReturnGrandTotal = () => {
    return returnItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  // Submit return
  const handleSubmitReturn = () => {
    if (!returnSupplier || !returnReason || returnItems.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate items
    const invalidItems = returnItems.filter(
      item => !item.itemName || !item.batchCode || !item.unit || item.quantity <= 0 || item.unitPrice <= 0 || !item.returnReason
    );

    if (invalidItems.length > 0) {
      toast.error('Vui lòng điền đầy đủ thông tin hàng hóa');
      return;
    }

    // Validate stock levels (QĐ4)
    const stockViolations = returnItems.filter(
      item => item.quantity > item.currentStock
    );

    if (stockViolations.length > 0) {
      toast.error('QĐ4: Số lượng trả vượt quá tồn kho của một số lô hàng!');
      return;
    }

    toast.success('Tạo phiếu trả hàng thành công!');
    setReturnDialogOpen(false);
  };

  const transactions = [
    {
      id: 'IM-001',
      type: 'import',
      date: new Date('2025-01-15'),
      supplier: 'Trung Nguyên',
      items: 5,
      totalValue: 8750000,
      status: 'completed',
      createdBy: 'Nguyễn Văn A',
      details: [
        { name: 'Cà phê Robusta', batchCode: 'LOT-R001', quantity: 50, unit: 'kg', price: 150000 },
        { name: 'Cà phê Arabica', batchCode: 'LOT-A001', quantity: 30, unit: 'kg', price: 200000 },
        { name: 'Sữa tươi', batchCode: 'LOT-M001', quantity: 100, unit: 'lít', price: 25000 },
        { name: 'Đường trắng', batchCode: 'LOT-S001', quantity: 40, unit: 'kg', price: 15000 },
        { name: 'Ly nhựa 500ml', batchCode: 'LOT-C001', quantity: 1000, unit: 'cái', price: 500 },
      ],
      notes: 'Hàng nhập từ nhà cung cấp chính, chất lượng tốt'
    },
    {
      id: 'EX-001',
      type: 'export',
      date: new Date('2025-01-16'),
      supplier: 'Quầy pha chế',
      items: 3,
      totalValue: 450000,
      status: 'completed',
      createdBy: 'Trần Thị B',
      details: [
        { name: 'Cà phê Robusta', batchCode: 'LOT-R001', quantity: 5, unit: 'kg', price: 150000 },
        { name: 'Sữa tươi', batchCode: 'LOT-M001', quantity: 10, unit: 'lít', price: 25000 },
        { name: 'Đường trắng', batchCode: 'LOT-S001', quantity: 5, unit: 'kg', price: 15000 },
      ],
      notes: 'Xuất cho quầy pha chế ca sáng'
    },
    {
      id: 'RT-001',
      type: 'return',
      date: new Date('2025-01-17'),
      supplier: 'Vinamilk',
      items: 2,
      totalValue: 560000,
      status: 'pending',
      createdBy: 'Lê Văn C',
      details: [
        { name: 'Sữa tươi', batchCode: 'LOT-M002', quantity: 20, unit: 'lít', price: 25000 },
        { name: 'Sữa đặc', batchCode: 'LOT-MC001', quantity: 10, unit: 'lon', price: 18000 },
      ],
      notes: 'Hàng bị hư hỏng do vận chuyển'
    },
    {
      id: 'IM-002',
      type: 'import',
      date: new Date('2025-01-20'),
      supplier: 'Nestle',
      items: 4,
      totalValue: 5200000,
      status: 'completed',
      createdBy: 'Nguyễn Văn A',
      details: [
        { name: 'Bột cacao', batchCode: 'LOT-CC001', quantity: 20, unit: 'kg', price: 180000 },
        { name: 'Sữa đặc', batchCode: 'LOT-MC002', quantity: 50, unit: 'lon', price: 18000 },
        { name: 'Kem tươi', batchCode: 'LOT-CR001', quantity: 30, unit: 'hộp', price: 45000 },
        { name: 'Bột matcha', batchCode: 'LOT-MT001', quantity: 10, unit: 'kg', price: 350000 },
      ],
      notes: 'Hàng nhập đặc biệt cho menu mới'
    },
    {
      id: 'EX-002',
      type: 'export',
      date: new Date('2025-01-22'),
      supplier: 'Quầy pha chế',
      items: 2,
      totalValue: 320000,
      status: 'completed',
      createdBy: 'Trần Thị B',
      details: [
        { name: 'Bột cacao', batchCode: 'LOT-CC001', quantity: 2, unit: 'kg', price: 180000 },
        { name: 'Sữa đặc', batchCode: 'LOT-MC002', quantity: 10, unit: 'lon', price: 18000 },
      ],
      notes: 'Xuất cho quầy pha chế ca chiều'
    },
  ];

  // Mock data
  const suppliers = [
    { id: 'sup1', name: 'Trung Nguyên' },
    { id: 'sup2', name: 'Vinamilk' },
    { id: 'sup3', name: 'Phúc Long' },
    { id: 'sup4', name: 'Nestle' },
  ];

  const employees = [
    { id: 'emp1', name: 'Nguyễn Văn A' },
    { id: 'emp2', name: 'Trần Thị B' },
    { id: 'emp3', name: 'Lê Văn C' },
  ];

  const products = [
    { id: 'prod1', name: 'Cà phê Robusta', unit: 'Kg' },
    { id: 'prod2', name: 'Cà phê Arabica', unit: 'Kg' },
    { id: 'prod3', name: 'Sữa tươi', unit: 'Lít' },
    { id: 'prod4', name: 'Đường trắng', unit: 'Kg' },
    { id: 'prod5', name: 'Ly nhựa', unit: 'Cái' },
  ];

  const batches = [
    { id: 'batch1', code: 'LO001', product: 'Cà phê Robusta', unit: 'Kg', unitPrice: 150000, entryDate: '2025-01-10', currentStock: 50 },
    { id: 'batch2', code: 'LO002', product: 'Cà phê Arabica', unit: 'Kg', unitPrice: 200000, entryDate: '2025-01-12', currentStock: 30 },
    { id: 'batch3', code: 'LO003', product: 'Sữa tươi', unit: 'Lít', unitPrice: 25000, entryDate: '2025-01-15', currentStock: 100 },
    { id: 'batch4', code: 'LO004', product: 'Đường trắng', unit: 'Kg', unitPrice: 18000, entryDate: '2025-01-08', currentStock: 75 },
    { id: 'batch5', code: 'LO005', product: 'Ly nhựa', unit: 'Cái', unitPrice: 500, entryDate: '2025-01-14', currentStock: 500 },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'import': return 'Nhập kho';
      case 'export': return 'Xuất kho';
      case 'return': return 'Trả hàng';
      default: return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'import':
        return <Badge className="bg-emerald-500">Nhập</Badge>;
      case 'export':
        return <Badge className="bg-blue-500">Xuất</Badge>;
      case 'return':
        return <Badge className="bg-orange-500">Trả</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Hoàn thành</Badge>;
      case 'pending':
        return <Badge variant="outline">Chờ xử lý</Badge>;
      default:
        return null;
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Toggle type filter
  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Toggle status filter
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(trans => {
    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(trans.type)) return false;

    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(trans.status)) return false;

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesCode = trans.id.toLowerCase().includes(query);
      const matchesSupplier = trans.supplier.toLowerCase().includes(query);
      const matchesCreator = trans.createdBy.toLowerCase().includes(query);

      if (!matchesCode && !matchesSupplier && !matchesCreator) return false;
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const today = new Date();
      const transDate = trans.date;

      if (dateRangeFilter === 'today') {
        if (transDate.toDateString() !== today.toDateString()) return false;
      } else if (dateRangeFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (transDate < weekAgo) return false;
      } else if (dateRangeFilter === 'month') {
        if (transDate.getMonth() !== today.getMonth() || transDate.getFullYear() !== today.getFullYear()) return false;
      }
    }

    return true;
  });

  // Count by type and status
  const importCount = transactions.filter(t => t.type === 'import').length;
  const exportCount = transactions.filter(t => t.type === 'export').length;
  const returnCount = transactions.filter(t => t.type === 'return').length;
  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="flex h-full">
      {/* Left Filter Panel */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto hidden lg:block">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-900 mb-3">Loại giao dịch</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-import"
                    checked={selectedTypes.includes('import')}
                    onCheckedChange={() => toggleType('import')}
                  />
                  <Label htmlFor="type-import" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Nhập kho
                  </Label>
                </div>
                <span className="text-xs text-slate-500">{importCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-export"
                    checked={selectedTypes.includes('export')}
                    onCheckedChange={() => toggleType('export')}
                  />
                  <Label htmlFor="type-export" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Xuất kho
                  </Label>
                </div>
                <span className="text-xs text-slate-500">{exportCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="type-return"
                    checked={selectedTypes.includes('return')}
                    onCheckedChange={() => toggleType('return')}
                  />
                  <Label htmlFor="type-return" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Trả hàng
                  </Label>
                </div>
                <span className="text-xs text-slate-500">{returnCount}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm text-slate-900 mb-3">Trạng thái</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-completed"
                    checked={selectedStatuses.includes('completed')}
                    onCheckedChange={() => toggleStatus('completed')}
                  />
                  <Label htmlFor="status-completed" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Hoàn thành
                  </Label>
                </div>
                <span className="text-xs text-slate-500">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-pending"
                    checked={selectedStatuses.includes('pending')}
                    onCheckedChange={() => toggleStatus('pending')}
                  />
                  <Label htmlFor="status-pending" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Chờ xử lý
                  </Label>
                </div>
                <span className="text-xs text-slate-500">{pendingCount}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
            <div className="space-y-2">
              <Button
                variant={dateRangeFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setDateRangeFilter(dateRangeFilter === 'today' ? 'all' : 'today')}
              >
                <Calendar className="w-3 h-3 mr-2" />
                Hôm nay
              </Button>
              <Button
                variant={dateRangeFilter === 'week' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setDateRangeFilter(dateRangeFilter === 'week' ? 'all' : 'week')}
              >
                <Calendar className="w-3 h-3 mr-2" />
                7 ngày qua
              </Button>
              <Button
                variant={dateRangeFilter === 'month' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setDateRangeFilter(dateRangeFilter === 'month' ? 'all' : 'month')}
              >
                <Calendar className="w-3 h-3 mr-2" />
                Tháng này
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
            <h1 className="text-blue-900 text-2xl font-semibold">Nhập/Xuất/Trả hàng</h1>
            <p className="text-neutral-600 mt-1">Quản lý luồng hàng hóa</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImportExcelDialogOpen(true)}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Nhập file
            </Button>
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800"
                  onClick={handleOpenImportDialog}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Nhập kho
                </Button>
              </DialogTrigger>
              <DialogContent className="min-w-[1100px] max-w-[1400px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Phiếu nhập hàng vào kho</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 overflow-y-auto flex-1 px-1">
                  {/* Basic Information */}
                  <Card className="border-emerald-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">Thông tin phiếu nhập</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Mã nhập hàng *</Label>
                          <Input
                            value={importCode}
                            disabled
                            className="bg-neutral-50"
                          />
                        </div>

                        <div>
                          <Label>Ngày nhập *</Label>
                          <Input
                            type="date"
                            value={importDate}
                            onChange={(e) => setImportDate(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Nhà cung cấp *</Label>
                          <Select value={supplier} onValueChange={setSupplier}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhà cung cấp" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(sup => (
                                <SelectItem key={sup.id} value={sup.id}>
                                  {sup.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Nhân viên nhập *</Label>
                          <Select value={employee} onValueChange={setEmployee}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhân viên" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Items List */}
                  <Card className="border-emerald-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Danh sách hàng hóa</CardTitle>
                        <Button
                          onClick={handleAddItem}
                          size="sm"
                          variant="outline"
                          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm hàng hóa
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {importItems.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          <Package className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                          <p>Chưa có hàng hóa nào</p>
                          <p className="text-sm">Click "Thêm hàng hóa" để bắt đầu</p>
                        </div>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto border rounded-md">
                          <Table>
                            <TableHeader className="sticky top-0 bg-emerald-50 z-10">
                              <TableRow className="bg-emerald-50">
                                <TableHead className="w-[110px]">Mã lô</TableHead>
                                <TableHead className="min-w-[220px]">Hàng hóa</TableHead>
                                <TableHead className="w-[100px]">ĐVT</TableHead>
                                <TableHead className="w-[120px]">SL nhập</TableHead>
                                <TableHead className="w-[160px]">HSD</TableHead>
                                <TableHead className="w-[150px]">Đơn giá</TableHead>
                                <TableHead className="w-[160px]">Giảm giá</TableHead>
                                <TableHead className="w-[150px]">Thành tiền</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {importItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <Input
                                      value={item.batchCode}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={item.itemName}
                                      onValueChange={(value) => {
                                        const product = products.find(p => p.name === value);
                                        handleUpdateItem(item.id, 'itemName', value);
                                        if (product) {
                                          handleUpdateItem(item.id, 'unit', product.unit);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Chọn hàng hóa" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {products.map(prod => (
                                          <SelectItem key={prod.id} value={prod.name}>
                                            {prod.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.unit}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={item.quantity || ''}
                                      onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                                      placeholder="0"
                                      className="h-9"
                                      min="0"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      value={item.expiryDate}
                                      onChange={(e) => handleUpdateItem(item.id, 'expiryDate', e.target.value)}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={item.unitPrice || ''}
                                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                                      placeholder="0"
                                      className="h-9"
                                      min="0"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Input
                                        type="number"
                                        value={item.discount || ''}
                                        onChange={(e) => handleUpdateItem(item.id, 'discount', Number(e.target.value))}
                                        placeholder="0"
                                        className="h-9 w-[70px]"
                                        min="0"
                                      />
                                      <Select
                                        value={item.discountType}
                                        onValueChange={(value: 'percent' | 'amount') =>
                                          handleUpdateItem(item.id, 'discountType', value)
                                        }
                                      >
                                        <SelectTrigger className="h-9 w-[60px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="percent">%</SelectItem>
                                          <SelectItem value="amount">₫</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-emerald-700">
                                      {item.totalPrice.toLocaleString('vi-VN')}₫
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleRemoveItem(item.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Total */}
                      {importItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-end">
                            <div className="w-full md:w-1/3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Tổng số lượng:</span>
                                <span className="text-neutral-900">
                                  {importItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Tổng giá trị:</span>
                                <span className="text-emerald-700">
                                  {calculateGrandTotal().toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <div>
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nhập ghi chú về phiếu nhập..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4 border-t pt-4">
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    className="bg-emerald-700 hover:bg-emerald-800"
                    onClick={handleSubmitImport}
                  >
                    Tạo phiếu nhập
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-700 hover:bg-blue-800"
                  onClick={handleOpenExportDialog}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Xuất kho
                </Button>
              </DialogTrigger>
              <DialogContent className="min-w-[1100px] max-w-[1400px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Phiếu xuất hàng khỏi kho</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 overflow-y-auto flex-1 px-1">
                  {/* Basic Information */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">Thông tin phiếu xuất</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Mã xuất hàng *</Label>
                          <Input
                            value={exportCode}
                            disabled
                            className="bg-neutral-50"
                          />
                        </div>

                        <div>
                          <Label>Ngày xuất *</Label>
                          <Input
                            type="date"
                            value={exportDate}
                            onChange={(e) => setExportDate(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Nhân viên xuất *</Label>
                          <Select value={exportEmployee} onValueChange={setExportEmployee}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhân viên" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Lý do xuất *</Label>
                          <Select value={exportReason} onValueChange={setExportReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn lý do" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="production">Xuất sản xuất</SelectItem>
                              <SelectItem value="sale">Xuất bán hàng</SelectItem>
                              <SelectItem value="transfer">Chuyển kho</SelectItem>
                              <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Items List */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Danh sách hàng hóa</CardTitle>
                        <Button
                          onClick={handleAddExportItem}
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm hàng hóa
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {exportItems.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          <Package className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                          <p>Chưa có hàng hóa nào</p>
                          <p className="text-sm">Click "Thêm hàng hóa" để bắt đầu</p>
                        </div>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto border rounded-md">
                          <Table>
                            <TableHeader className="sticky top-0 bg-blue-50 z-10">
                              <TableRow className="bg-blue-50">
                                <TableHead className="w-[80px]">STT</TableHead>
                                <TableHead className="min-w-[220px]">Hàng hóa</TableHead>
                                <TableHead className="w-[120px]">Lô hàng</TableHead>
                                <TableHead className="w-[100px]">ĐVT</TableHead>
                                <TableHead className="w-[120px]">SL xuất</TableHead>
                                <TableHead className="w-[150px]">Đơn giá</TableHead>
                                <TableHead className="w-[150px]">Thành tiền</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {exportItems.map((item, index) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="text-center text-neutral-600">
                                      {index + 1}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={item.batchCode}
                                      onValueChange={(value) => {
                                        const batch = batches.find(b => b.code === value);
                                        handleUpdateExportItem(item.id, 'batchCode', value);
                                        if (batch) {
                                          handleUpdateExportItem(item.id, 'itemName', batch.product);
                                          handleUpdateExportItem(item.id, 'unit', batch.unit);
                                          handleUpdateExportItem(item.id, 'unitPrice', batch.unitPrice);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Chọn lô hàng" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {batches.map(batch => (
                                          <SelectItem key={batch.id} value={batch.code}>
                                            {batch.product} - {batch.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.batchCode}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.unit}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={item.quantity || ''}
                                      onChange={(e) => handleUpdateExportItem(item.id, 'quantity', Number(e.target.value))}
                                      placeholder="0"
                                      className="h-9"
                                      min="0"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={item.unitPrice || ''}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-blue-700">
                                      {item.totalPrice.toLocaleString('vi-VN')}₫
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleRemoveExportItem(item.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Total */}
                      {exportItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-end">
                            <div className="w-full md:w-1/3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Tổng số lượng:</span>
                                <span className="text-neutral-900">
                                  {exportItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Tổng giá trị:</span>
                                <span className="text-blue-700">
                                  {calculateExportGrandTotal().toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <div>
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={exportNotes}
                      onChange={(e) => setExportNotes(e.target.value)}
                      placeholder="Nhập ghi chú về phiếu xuất..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4 border-t pt-4">
                  <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    className="bg-blue-700 hover:bg-blue-800"
                    onClick={handleSubmitExport}
                  >
                    Tạo phiếu xuất
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-orange-700 hover:bg-orange-800"
                  onClick={handleOpenReturnDialog}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Trả hàng
                </Button>
              </DialogTrigger>
              <DialogContent className="min-w-[1100px] max-w-[1400px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Phiếu trả hàng cho nhà cung cấp</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 overflow-y-auto flex-1 px-1">
                  {/* Basic Information */}
                  <Card className="border-orange-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">Thông tin phiếu trả</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Mã trả hàng *</Label>
                          <Input
                            value={returnCode}
                            disabled
                            className="bg-neutral-50"
                          />
                        </div>

                        <div>
                          <Label>Ngày trả *</Label>
                          <Input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Nhà cung cấp *</Label>
                          <Select value={returnSupplier} onValueChange={setReturnSupplier}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhà cung cấp" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(sup => (
                                <SelectItem key={sup.id} value={sup.id}>
                                  {sup.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Lý do trả *</Label>
                          <Select value={returnReason} onValueChange={setReturnReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn lý do" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quality">Chất lượng không đạt yêu cầu</SelectItem>
                              <SelectItem value="damage">Hỏng hóc</SelectItem>
                              <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Items List */}
                  <Card className="border-orange-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Danh sách hàng hóa</CardTitle>
                        <Button
                          onClick={handleAddReturnItem}
                          size="sm"
                          variant="outline"
                          className="border-orange-600 text-orange-600 hover:bg-orange-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm hàng hóa
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {returnItems.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          <Package className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                          <p>Chưa có hàng hóa nào</p>
                          <p className="text-sm">Click "Thêm hàng hóa" để bắt đầu</p>
                        </div>
                      ) : (
                        <div className="max-h-[300px] overflow-y-auto border rounded-md">
                          <Table>
                            <TableHeader className="sticky top-0 bg-orange-50 z-10">
                              <TableRow className="bg-orange-50">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[50px]">STT</TableHead>
                                <TableHead className="min-w-[180px]">Hàng hóa</TableHead>
                                <TableHead className="w-[100px]">Lô hàng</TableHead>
                                <TableHead className="w-[80px]">ĐVT</TableHead>
                                <TableHead className="w-[100px]">SL trả</TableHead>
                                <TableHead className="w-[120px]">Giá nhập</TableHead>
                                <TableHead className="w-[130px]">Ngày nhập</TableHead>
                                <TableHead className="w-[120px]">Thành tiền</TableHead>
                                <TableHead className="min-w-[180px]">Lý do trả</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {returnItems.map((item, index) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    {item.quantity > item.currentStock && item.currentStock > 0 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center justify-center cursor-help">
                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[250px]">
                                          <p>Chỉ được trả hàng từ các lô hàng còn tồn kho. Số lượng trả phải nhỏ hơn hoặc bằng tồn kho hiện tại của lô đó.</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-center text-neutral-600">
                                      {index + 1}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={item.batchCode}
                                      onValueChange={(value) => {
                                        const batch = batches.find(b => b.code === value);
                                        handleUpdateReturnItem(item.id, 'batchCode', value);
                                        if (batch) {
                                          handleUpdateReturnItem(item.id, 'itemName', batch.product);
                                          handleUpdateReturnItem(item.id, 'unit', batch.unit);
                                          handleUpdateReturnItem(item.id, 'unitPrice', batch.unitPrice);
                                          handleUpdateReturnItem(item.id, 'entryDate', batch.entryDate);
                                          handleUpdateReturnItem(item.id, 'currentStock', batch.currentStock);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Chọn lô hàng" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {batches.map(batch => (
                                          <SelectItem key={batch.id} value={batch.code}>
                                            {batch.product} - {batch.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.batchCode}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.unit}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <Input
                                        type="number"
                                        value={item.quantity || ''}
                                        onChange={(e) => handleUpdateReturnItem(item.id, 'quantity', Number(e.target.value))}
                                        placeholder="0"
                                        className={`h-9 ${item.quantity > item.currentStock && item.currentStock > 0 ? 'border-red-500' : ''}`}
                                        min="0"
                                        max={item.currentStock}
                                      />
                                      {item.currentStock > 0 && (
                                        <p className="text-xs text-neutral-500">Tồn: {item.currentStock}</p>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={item.unitPrice || ''}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      value={item.entryDate}
                                      disabled
                                      className="h-9 bg-neutral-50 text-neutral-600"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-orange-700">
                                      {item.totalPrice.toLocaleString('vi-VN')}₫
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={item.returnReason}
                                      onValueChange={(value) => handleUpdateReturnItem(item.id, 'returnReason', value)}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Chọn lý do" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="quality">Chất lượng kém</SelectItem>
                                        <SelectItem value="damage">Hỏng hóc</SelectItem>
                                        <SelectItem value="expired">Hết hạn</SelectItem>
                                        <SelectItem value="wrong">Giao nhầm</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleRemoveReturnItem(item.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Total */}
                      {returnItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-end">
                            <div className="w-full md:w-1/3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Tổng số lượng:</span>
                                <span className="text-neutral-900">
                                  {returnItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Tổng giá trị:</span>
                                <span className="text-orange-700">
                                  {calculateReturnGrandTotal().toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <div>
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      placeholder="Nhập ghi chú về phiếu trả..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4 border-t pt-4">
                  <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    className="bg-orange-700 hover:bg-orange-800"
                    onClick={handleSubmitReturn}
                  >
                    Tạo phiếu trả
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Nhập kho tháng này
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-emerald-900">45.8M₫</p>
              <p className="text-xs text-neutral-500 mt-1">12 phiếu nhập</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-700 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Xuất kho tháng này
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-blue-900">38.2M₫</p>
              <p className="text-xs text-neutral-500 mt-1">23 phiếu xuất</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-700 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Trả hàng tháng này
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-orange-900">1.2M₫</p>
              <p className="text-xs text-neutral-500 mt-1">3 phiếu trả</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-amber-950">Lịch sử giao dịch</CardTitle>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo mã phiếu, đối tác, người tạo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Đối tác</TableHead>
                    <TableHead>Số mặt hàng</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-neutral-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                        <p>Không tìm thấy giao dịch nào</p>
                        <p className="text-sm">Thử thay đổi bộ lọc</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((trans, index) => {
                      const isExpanded = expandedRows.includes(trans.id);
                      return (
                        <>
                          <TableRow
                            key={trans.id}
                            className="cursor-pointer hover:bg-amber-50/50"
                            onClick={() => toggleExpand(trans.id)}
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(trans.id);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center text-neutral-600">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-sm text-neutral-900 font-mono">
                              {trans.id}
                            </TableCell>
                            <TableCell>{getTypeBadge(trans.type)}</TableCell>
                            <TableCell className="text-sm text-neutral-600">
                              {trans.date.toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell className="text-sm text-neutral-600">
                              {trans.supplier}
                            </TableCell>
                            <TableCell className="text-sm text-neutral-600">
                              {trans.items} mặt hàng
                            </TableCell>
                            <TableCell className="text-sm text-amber-900">
                              {trans.totalValue.toLocaleString('vi-VN')}₫
                            </TableCell>
                            <TableCell className="text-sm text-neutral-600">
                              {trans.createdBy}
                            </TableCell>
                            <TableCell>{getStatusBadge(trans.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow key={`${trans.id}-details`}>
                              <TableCell colSpan={11} className="bg-amber-50/30 p-0">
                                <div className="p-4 space-y-4">
                                  {/* Details Header */}
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm text-slate-900">Chi tiết giao dịch</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {trans.details.length} sản phẩm
                                    </Badge>
                                  </div>

                                  {/* Items Table */}
                                  <div className="border rounded-lg overflow-hidden bg-white">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-slate-50">
                                          <TableHead className="w-12">STT</TableHead>
                                          <TableHead>Tên hàng hóa</TableHead>
                                          <TableHead>Mã lô</TableHead>
                                          <TableHead className="text-right">Số lượng</TableHead>
                                          <TableHead>Đơn vị</TableHead>
                                          <TableHead className="text-right">Đơn giá</TableHead>
                                          <TableHead className="text-right">Thành tiền</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {trans.details.map((item: any, idx: number) => (
                                          <TableRow key={idx}>
                                            <TableCell className="text-center text-xs text-neutral-500">
                                              {idx + 1}
                                            </TableCell>
                                            <TableCell className="text-sm">{item.name}</TableCell>
                                            <TableCell className="text-xs font-mono text-neutral-600">
                                              {item.batchCode}
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                              {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-sm text-neutral-600">
                                              {item.unit}
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                              {item.price.toLocaleString('vi-VN')}₫
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-amber-900">
                                              {(item.quantity * item.price).toLocaleString('vi-VN')}₫
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>

                                  {/* Notes */}
                                  {trans.notes && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <div className="flex gap-2">
                                        <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-xs text-blue-900 mb-1">Ghi chú:</p>
                                          <p className="text-sm text-slate-700">{trans.notes}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Import Excel Dialog */}
        <ImportExportExcelDialog
          open={importExcelDialogOpen}
          onOpenChange={setImportExcelDialogOpen}
        />
      </div>
    </div>
  );
}