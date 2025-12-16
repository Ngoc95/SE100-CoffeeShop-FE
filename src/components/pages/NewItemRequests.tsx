import { useState, Fragment } from 'react';
import { Plus, Search, Filter, X, ChevronRight, Clock, User, CheckCircle, XCircle, AlertCircle, X as XIcon, ChevronDown, ChevronUp, Upload, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface SuggestedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface NewItemRequest {
  id: string;
  suggestedName: string;
  staffName: string;
  staffId: string;
  timestamp: Date;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  suggestedCategory?: string;
  description?: string;
  suggestedRecipe?: SuggestedIngredient[];
  suggestedPrice?: number;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
}

export function NewItemRequests() {
  const [selectedView, setSelectedView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedRequest, setSelectedRequest] = useState<NewItemRequest | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>(['pending', 'approved', 'rejected']);
  const [categoryFilter, setCategoryFilter] = useState<string[]>(['all']);
  const [staffFilter, setStaffFilter] = useState<string[]>(['all']);
  const [searchTerm, setSearchTerm] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdItemName, setCreatedItemName] = useState('');

  // Sort state
  type SortField = "name" | "staff" | "timestamp" | "note" | "status";
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // Mock data
  const [requests, setRequests] = useState<NewItemRequest[]>([
    {
      id: '1',
      suggestedName: 'Trà đào mix phúc bồn tử',
      staffName: 'NV Minh',
      staffId: 'NV001',
      timestamp: new Date('2025-11-23T14:15:00'),
      note: 'Khách hỏi nhiều, đề nghị thêm vào menu',
      status: 'pending',
      suggestedCategory: 'Trà',
      description: 'Trà đào kết hợp với phúc bồn tử tươi, vị chua ngọt đặc trưng',
      suggestedRecipe: [
        { name: 'Trà', quantity: 20, unit: 'g' },
        { name: 'Đào', quantity: 50, unit: 'g' },
        { name: 'Phúc bồn tử', quantity: 30, unit: 'g' },
        { name: 'Đường', quantity: 25, unit: 'g' },
        { name: 'Đá', quantity: 100, unit: 'g' },
      ],
      suggestedPrice: 45000,
    },
    {
      id: '2',
      suggestedName: 'Cà phê trứng',
      staffName: 'NV Lan',
      staffId: 'NV002',
      timestamp: new Date('2025-11-23T10:20:00'),
      note: 'Extra milk, khách yêu cầu',
      status: 'approved',
      suggestedCategory: 'Cà phê',
      description: 'Cà phê đen đậm đà với lớp kem trứng béo ngậy',
      suggestedRecipe: [
        { name: 'Cà phê', quantity: 25, unit: 'g' },
        { name: 'Trứng gà', quantity: 2, unit: 'quả' },
        { name: 'Sữa đặc', quantity: 30, unit: 'ml' },
      ],
      suggestedPrice: 38000,
    },
    {
      id: '3',
      suggestedName: 'Sinh tố bơ sầu riêng',
      staffName: 'NV Hương',
      staffId: 'NV003',
      timestamp: new Date('2025-11-22T16:45:00'),
      note: 'Combo độc đáo, nhiều khách yêu cầu',
      status: 'pending',
      suggestedCategory: 'Sinh tố',
      description: 'Sinh tố bơ kết hợp sầu riêng, đặc biệt và hấp dẫn',
      suggestedRecipe: [
        { name: 'Bơ', quantity: 100, unit: 'g' },
        { name: 'Sầu riêng', quantity: 50, unit: 'g' },
        { name: 'Sữa tươi', quantity: 200, unit: 'ml' },
        { name: 'Đường', quantity: 20, unit: 'g' },
      ],
      suggestedPrice: 55000,
    },
    {
      id: '4',
      suggestedName: 'Trà sữa matcha',
      staffName: 'NV Minh',
      staffId: 'NV001',
      timestamp: new Date('2025-11-21T11:30:00'),
      note: 'Trend hiện nay',
      status: 'rejected',
      suggestedCategory: 'Trà',
      description: 'Trà xanh matcha cao cấp kết hợp với sữa tươi',
      suggestedRecipe: [
        { name: 'Bột matcha', quantity: 15, unit: 'g' },
        { name: 'Sữa tươi', quantity: 250, unit: 'ml' },
        { name: 'Đường', quantity: 20, unit: 'g' },
      ],
      suggestedPrice: 42000,
    },
  ]);

  // BM1 Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'product',
    category: '',
    unit: 'ly',
    price: 0,
    description: '',
    status: 'active',
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: '', unit: 'g', quantity: 0, cost: 0 },
  ]);

  const toggleStatus = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleCategory = (category: string) => {
    if (category === 'all') {
      setCategoryFilter(['all']);
    } else {
      setCategoryFilter(prev => {
        const filtered = prev.filter(c => c !== 'all');
        if (filtered.includes(category)) {
          const result = filtered.filter(c => c !== category);
          return result.length === 0 ? ['all'] : result;
        } else {
          return [...filtered, category];
        }
      });
    }
  };

  const toggleStaff = (staff: string) => {
    if (staff === 'all') {
      setStaffFilter(['all']);
    } else {
      setStaffFilter(prev => {
        const filtered = prev.filter(s => s !== 'all');
        if (filtered.includes(staff)) {
          const result = filtered.filter(s => s !== staff);
          return result.length === 0 ? ['all'] : result;
        } else {
          return [...filtered, staff];
        }
      });
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

  let filteredRequests = requests.filter((req) => {
    if (statusFilter.length > 0 && !statusFilter.includes(req.status)) return false;
    if (!categoryFilter.includes('all') && req.suggestedCategory && !categoryFilter.includes(req.suggestedCategory)) return false;
    if (!staffFilter.includes('all') && !staffFilter.includes(req.staffId)) return false;
    if (searchTerm && !req.suggestedName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredRequests = [...filteredRequests].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "name") {
        aValue = a.suggestedName;
        bValue = b.suggestedName;
      } else if (sortField === "staff") {
        aValue = a.staffName;
        bValue = b.staffName;
      } else if (sortField === "timestamp") {
        aValue = a.timestamp.getTime();
        bValue = b.timestamp.getTime();
      } else if (sortField === "note") {
        aValue = a.note;
        bValue = b.note;
      } else if (sortField === "status") {
        const statusOrder = { pending: 0, approved: 1, rejected: 2 };
        aValue = statusOrder[a.status] ?? 0;
        bValue = statusOrder[b.status] ?? 0;
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

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const handleViewDetail = (request: NewItemRequest) => {
    setSelectedRequest(request);
    setSelectedView('detail');
  };

  const handleCreateNewItem = () => {
    if (selectedRequest) {
      // Pre-fill form with request data
      setFormData({
        name: selectedRequest.suggestedName,
        code: 'AUTO',
        category: selectedRequest.suggestedCategory || '',
        unit: 'ly',
        price: selectedRequest.suggestedPrice || 0,
        description: selectedRequest.description || '',
        status: 'active',
      });

      // Populate ingredients from suggested recipe
      if (selectedRequest.suggestedRecipe) {
        setIngredients(
          selectedRequest.suggestedRecipe.map((ing, index) => ({
            id: `auto-${Date.now()}-${index}`,
            name: ing.name,
            unit: ing.unit,
            quantity: ing.quantity,
            cost: 0 // Default cost
          }))
        );
      } else {
        setIngredients([]);
      }
    }
    setSelectedView('create');
  };

  const handleRejectRequest = () => {
    if (selectedRequest) {
      setRequests(requests.map(req =>
        req.id === selectedRequest.id ? { ...req, status: 'rejected' as const } : req
      ));
      setSelectedView('list');
      setSelectedRequest(null);
    }
  };

  const handleApproveAndCreate = () => {
    if (selectedRequest) {
      // Update request status
      setRequests(requests.map(req =>
        req.id === selectedRequest.id ? { ...req, status: 'approved' as const } : req
      ));

      // Set created item name for success modal
      setCreatedItemName(formData.name);

      // Show success modal
      setSuccessModalOpen(true);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: '', unit: 'g', quantity: 0, cost: 0 },
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(ingredients.map(ing =>
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300"><AlertCircle className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300"><CheckCircle className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      default:
        return null;
    }
  };

  const totalCost = ingredients.reduce((sum, ing) => sum + ing.cost * ing.quantity, 0);

  // LISTING SCREEN
  if (selectedView === 'list') {
    return (
      <div className="flex h-full">
        {/* Left Filter Panel */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto hidden lg:block">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-slate-900 mb-3">Trạng thái</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-pending"
                      checked={statusFilter.includes('pending')}
                      onCheckedChange={() => toggleStatus('pending')}
                    />
                    <Label htmlFor="status-pending" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Chờ duyệt
                    </Label>
                  </div>
                  <span className="text-xs text-slate-500">{pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-approved"
                      checked={statusFilter.includes('approved')}
                      onCheckedChange={() => toggleStatus('approved')}
                    />
                    <Label htmlFor="status-approved" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Đã duyệt
                    </Label>
                  </div>
                  <span className="text-xs text-slate-500">{approvedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-rejected"
                      checked={statusFilter.includes('rejected')}
                      onCheckedChange={() => toggleStatus('rejected')}
                    />
                    <Label htmlFor="status-rejected" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Từ chối
                    </Label>
                  </div>
                  <span className="text-xs text-slate-500">{rejectedCount}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm text-slate-900 mb-3">Danh mục gợi ý</h3>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'Tất cả', count: requests.length },
                  { id: 'Cà phê', label: 'Cà phê', count: requests.filter(r => r.suggestedCategory === 'Cà phê').length },
                  { id: 'Trà', label: 'Trà', count: requests.filter(r => r.suggestedCategory === 'Trà').length },
                  { id: 'Sinh tố', label: 'Sinh tố', count: requests.filter(r => r.suggestedCategory === 'Sinh tố').length },
                ].map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={cat.id}
                        checked={categoryFilter.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <Label htmlFor={cat.id} className="text-sm text-slate-700 cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                    <span className="text-xs text-slate-500">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm text-slate-900 mb-3">Nhân viên gửi</h3>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'Tất cả', count: requests.length },
                  { id: 'NV001', label: 'NV Minh', count: requests.filter(r => r.staffId === 'NV001').length },
                  { id: 'NV002', label: 'NV Lan', count: requests.filter(r => r.staffId === 'NV002').length },
                  { id: 'NV003', label: 'NV Hương', count: requests.filter(r => r.staffId === 'NV003').length },
                ].map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={staff.id}
                        checked={staffFilter.includes(staff.id)}
                        onCheckedChange={() => toggleStaff(staff.id)}
                      />
                      <Label htmlFor={staff.id} className="text-sm text-slate-700 cursor-pointer">
                        {staff.label}
                      </Label>
                    </div>
                    <span className="text-xs text-slate-500">{staff.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setStatusFilter(['pending']);
                    setCategoryFilter(['all']);
                    setStaffFilter(['all']);
                  }}
                >
                  <AlertCircle className="w-3 h-3 mr-2" />
                  Chờ xử lý ({pendingCount})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setStatusFilter(['pending', 'approved', 'rejected']);
                    setCategoryFilter(['all']);
                    setStaffFilter(['all']);
                    setSearchTerm('');
                  }}
                >
                  <X className="w-3 h-3 mr-2" />
                  Xóa bộ lọc
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
              <h1 className="text-blue-900">Yêu cầu món mới</h1>
              <p className="text-neutral-600 mt-1">Duyệt các món mới được đề xuất từ nhân viên bán hàng</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-neutral-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Chờ duyệt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-amber-900">{pendingCount}</p>
                <p className="text-xs text-neutral-500 mt-1">yêu cầu</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-neutral-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Đã duyệt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-emerald-900">{approvedCount}</p>
                <p className="text-xs text-neutral-500 mt-1">yêu cầu</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-neutral-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-red-900">{rejectedCount}</p>
                <p className="text-xs text-neutral-500 mt-1">yêu cầu</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-amber-950">Danh sách yêu cầu</CardTitle>
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Tìm theo tên món..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-white border-slate-300 shadow-none rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-16 text-center">STT</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Tên món đề xuất
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => handleSort("staff")}
                      >
                        <div className="flex items-center">
                          Nhân viên gửi
                          {getSortIcon("staff")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => handleSort("timestamp")}
                      >
                        <div className="flex items-center">
                          Thời gian
                          {getSortIcon("timestamp")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => handleSort("note")}
                      >
                        <div className="flex items-center">
                          Ghi chú
                          {getSortIcon("note")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Trạng thái
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          Không có yêu cầu nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request, index) => {
                        const isExpanded = expandedRequestId === request.id;

                        return (
                          <Fragment key={request.id}>
                            {/* Main Row */}
                            <TableRow
                              className="hover:bg-blue-100/50 cursor-pointer transition-colors"
                              onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-600" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600 text-center">{index + 1}</TableCell>
                              <TableCell className="text-sm">
                                <div>
                                  <p className="text-slate-900">{request.suggestedName}</p>
                                  {request.suggestedCategory && (
                                    <p className="text-xs text-slate-500">{request.suggestedCategory}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <span>{request.staffName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span>
                                    {request.timestamp.toLocaleDateString('vi-VN')} {request.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm max-w-xs">
                                <p className="truncate text-slate-700">{request.note}</p>
                              </TableCell>
                              <TableCell className="text-sm">{getStatusBadge(request.status)}</TableCell>
                            </TableRow>

                            {/* Expanded Detail Row */}
                            {isExpanded && (
                              <TableRow className="bg-blue-100/30">
                                <TableCell colSpan={7} className="p-0">
                                  <div className="p-6 space-y-6">
                                    {/* Detail Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <Label className="text-slate-500 text-xs">Nhân viên gửi</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                          </div>
                                          <div>
                                            <p className="text-sm">{request.staffName}</p>
                                            <p className="text-xs text-slate-500">{request.staffId}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-slate-500 text-xs">Thời gian gửi</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Clock className="w-5 h-5 text-slate-400" />
                                          <p className="text-sm">
                                            {request.timestamp.toLocaleDateString('vi-VN', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}, {request.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-slate-500 text-xs">Danh mục đề xuất</Label>
                                        <p className="mt-2 text-sm">{request.suggestedCategory || 'Chưa xác định'}</p>
                                      </div>

                                      <div>
                                        <Label className="text-slate-500 text-xs">Giá đề xuất</Label>
                                        <p className="mt-2 text-sm">{request.suggestedPrice?.toLocaleString('vi-VN')}đ</p>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-slate-500 text-xs">Mô tả chi tiết</Label>
                                      <p className="mt-2 p-3 bg-white rounded-lg text-sm">{request.description || 'Không có mô tả'}</p>
                                    </div>

                                    <div>
                                      <Label className="text-slate-500 text-xs">Công thức tạm thời</Label>
                                      {request.suggestedRecipe ? (
                                        <div className="mt-2 text-sm bg-white rounded-lg border border-slate-200 overflow-hidden">
                                          <table className="w-full text-left">
                                            <thead className="bg-blue-100 text-xs font-medium">
                                              <tr>
                                                <th className="px-3 py-2">Nguyên liệu</th>
                                                <th className="px-3 py-2">Số lượng</th>
                                                <th className="px-3 py-2">Đơn vị</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {request.suggestedRecipe.map((ing, idx) => (
                                                <tr key={idx}>
                                                  <td className="px-3 py-2">{ing.name}</td>
                                                  <td className="px-3 py-2">{ing.quantity}</td>
                                                  <td className="px-3 py-2">{ing.unit}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      ) : (
                                        <p className="mt-2 p-3 bg-white rounded-lg text-sm italic text-slate-400">Chưa có công thức</p>
                                      )}
                                    </div>

                                    <div>
                                      <Label className="text-slate-500 text-xs">Ghi chú từ nhân viên</Label>
                                      <p className="mt-2 p-3 bg-blue-100 rounded-lg border border-blue-200 text-sm">{request.note}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    {request.status === 'pending' && (
                                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-200">
                                        <Button
                                          variant="outline"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setRequests(requests.map(req =>
                                              req.id === request.id ? { ...req, status: 'rejected' as const } : req
                                            ));
                                            setExpandedRequestId(null);
                                          }}
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Từ chối yêu cầu
                                        </Button>
                                        <Button
                                          className="bg-blue-600 hover:bg-blue-700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRequest(request);
                                            setFormData({
                                              name: request.suggestedName,
                                              code: 'AUTO',
                                              category: request.suggestedCategory || '',
                                              unit: 'ly',
                                              price: request.suggestedPrice || 0,
                                              description: request.description || '',
                                              status: 'active',
                                            });
                                            setCreateItemDialogOpen(true);
                                          }}
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Tạo món mới
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Item Dialog */}
        <Dialog open={createItemDialogOpen} onOpenChange={setCreateItemDialogOpen}>
          <DialogContent className="min-w-[1100px] max-w-[1300px] w-[100vw] max-h-[90vh] flex flex-col" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Thêm mặt hàng mới</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden px-1">
              {/* Loại mặt hàng */}
              <div>
                <Label>Loại mặt hàng <span className="text-red-500">*</span></Label>
                <Select value={formData.type || 'composite'} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="composite">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        Hàng hóa cấu thành
                      </div>
                    </SelectItem>
                    <SelectItem value="ready-made">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        Hàng hóa bán sẵn
                      </div>
                    </SelectItem>
                    {/* Add more types if needed to match Inventory exactly, but keeping relevant ones */}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Mã & Tên hàng hóa */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Mã hàng hóa <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Tự động tạo"
                      disabled
                      className="bg-slate-50 border-slate-300"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label>Tên hàng hóa <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Cà phê Latte"
                    className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
              </div>

              {/* Danh mục & Đơn vị */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Danh mục <span className="text-red-500">*</span></Label>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 hover:text-blue-700">
                      <Plus className="w-3 h-3 mr-1" />
                      Thêm danh mục
                    </Button>
                  </div>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cà phê">Cà phê</SelectItem>
                      <SelectItem value="Trà">Trà</SelectItem>
                      <SelectItem value="Sinh tố">Sinh tố</SelectItem>
                      <SelectItem value="Bánh ngọt">Bánh ngọt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Đơn vị <span className="text-red-500">*</span></Label>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 hover:text-blue-700">
                      <Plus className="w-3 h-3 mr-1" />
                      Thêm đơn vị
                    </Button>
                  </div>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ly">Ly</SelectItem>
                      <SelectItem value="cái">Cái</SelectItem>
                      <SelectItem value="phần">Phần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hình ảnh */}
              <div>
                <Label>Hình ảnh sản phẩm</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Kéo thả hoặc chọn ảnh</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG (tối đa 2MB)</p>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Tải lên hình ảnh cho hàng hóa (tùy chọn)</p>
              </div>

              {/* Công thức nguyên liệu */}
              {formData.type === 'composite' && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm">Công thức nguyên liệu</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={handleAddIngredient}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Thêm nguyên liệu
                    </Button>
                  </div>

                  {ingredients.length === 0 ? (
                    <p className="text-xs text-slate-500">Chưa có nguyên liệu nào.</p>
                  ) : (
                    <div className="space-y-2">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-purple-100">
                            <TableHead className="w-12">STT</TableHead>
                            <TableHead>Tên nguyên liệu</TableHead>
                            <TableHead className="w-32">Số lượng</TableHead>
                            <TableHead className="w-32">Đơn vị</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ingredients.map((ingredient, index) => (
                            <TableRow key={ingredient.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Tên nguyên liệu"
                                  value={ingredient.name}
                                  onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                                  className="h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-2"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={ingredient.quantity}
                                  onChange={(e) => handleIngredientChange(ingredient.id, 'quantity', Number(e.target.value))}
                                  className="h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-2"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={ingredient.unit}
                                  onValueChange={(value) => handleIngredientChange(ingredient.id, 'unit', value)}
                                >
                                  <SelectTrigger className="h-8 bg-white border-slate-300 shadow-none">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="g">g</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="quả">quả</SelectItem>
                                    <SelectItem value="hộp">hộp</SelectItem>
                                    <SelectItem value="lon">lon</SelectItem>
                                    <SelectItem value="bịch">bịch</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleRemoveIngredient(ingredient.id)}
                                >
                                  <X className="w-4 h-4 text-slate-500 hover:text-red-500" />
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

              {/* Giá bán */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giá bán <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
                <div>
                  <Label>Giá vốn</Label>
                  <Input
                    type="number"
                    value={totalCost}
                    disabled
                    className="mt-1.5 bg-slate-100 border-slate-300"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-600">
                  <span className="text-red-500">*</span> Trường bắt buộc
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateItemDialogOpen(false);
                  setExpandedRequestId(null);
                }}
              >
                Hủy
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  if (selectedRequest) {
                    setRequests(requests.map(req =>
                      req.id === selectedRequest.id ? { ...req, status: 'approved' as const } : req
                    ));
                    setCreatedItemName(formData.name);
                    setCreateItemDialogOpen(false);
                    setExpandedRequestId(null);
                    setSuccessModalOpen(true);
                  }
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Phê duyệt & thêm vào menu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <DialogTitle className="text-xl">Thành công!</DialogTitle>
              </div>
            </DialogHeader>
            <div className="text-center py-4">
              <p className="text-slate-700">
                Món <strong>{createdItemName}</strong> đã được thêm vào thực đơn và đồng bộ xuống POS & Bếp.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccessModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="flex-1"
              >
                Về danh sách yêu cầu
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setSuccessModalOpen(false);
                }}
              >
                Xem món vừa tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // DETAIL SCREEN
  if (selectedView === 'detail' && selectedRequest) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer hover:text-blue-600">Hàng hóa</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => setSelectedView('list')}
                >
                  Yêu cầu món mới
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chi tiết yêu cầu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-amber-950">Chi tiết yêu cầu món mới</h1>
              <p className="text-neutral-600 mt-1">Xem xét và phê duyệt yêu cầu từ nhân viên</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedView('list')}>
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </div>
        </div>

        {/* Information Card */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>{selectedRequest.suggestedName}</CardTitle>
              {getStatusBadge(selectedRequest.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-500">Nhân viên gửi</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p>{selectedRequest.staffName}</p>
                    <p className="text-sm text-slate-500">{selectedRequest.staffId}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-slate-500">Thời gian gửi</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <p>
                    {selectedRequest.timestamp.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}, {selectedRequest.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-slate-500">Danh mục đề xuất</Label>
                <p className="mt-1">{selectedRequest.suggestedCategory || 'Chưa xác định'}</p>
              </div>

              <div>
                <Label className="text-slate-500">Giá đề xuất</Label>
                <p className="mt-1">{selectedRequest.suggestedPrice?.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            <div>
              <Label className="text-slate-500">Mô tả chi tiết</Label>
              <p className="mt-1 p-3 bg-slate-50 rounded-lg">{selectedRequest.description || 'Không có mô tả'}</p>
            </div>

            <div>
              <Label className="text-slate-500">Công thức tạm thời</Label>
              <p className="mt-1 p-3 bg-slate-50 rounded-lg whitespace-pre-wrap">{selectedRequest.suggestedRecipe || 'Chưa có công thức'}</p>
            </div>

            <div>
              <Label className="text-slate-500">Ghi chú từ nhân viên</Label>
              <p className="mt-1 p-3 bg-blue-100 rounded-lg border border-amber-200">{selectedRequest.note}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {selectedRequest.status === 'pending' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-slate-700">Phê duyệt yêu cầu này và tạo món mới trong thực đơn?</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleRejectRequest}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối yêu cầu
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleCreateNewItem}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo món mới (BM1)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // CREATE SCREEN (BM1 Form)
  if (selectedView === 'create' && selectedRequest) {
    return (
      <>
        <div className="p-4 lg:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink className="cursor-pointer hover:text-blue-600">Hàng hóa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedView('list')}
                  >
                    Yêu cầu món mới
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tạo món mới</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div>
              <h1 className="text-amber-950">Tạo món mới (BM1)</h1>
              <p className="text-neutral-600 mt-1">Hoàn tất thông tin để thêm món vào thực đơn</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* A. Thông tin mặt hàng */}
            <Card>
              <CardHeader>
                <CardTitle>A. Thông tin mặt hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Ảnh món</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Plus className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Nhấn để tải ảnh lên</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG (tối đa 2MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tên món *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập tên món"
                      className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>

                  <div>
                    <Label>Mã món</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Tự động tạo"
                      disabled
                      className="bg-slate-100 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label>Danh mục *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cà phê">Cà phê</SelectItem>
                        <SelectItem value="Trà">Trà</SelectItem>
                        <SelectItem value="Sinh tố">Sinh tố</SelectItem>
                        <SelectItem value="Bánh ngọt">Bánh ngọt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Đơn vị tính</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ly">Ly</SelectItem>
                        <SelectItem value="cái">Cái</SelectItem>
                        <SelectItem value="phần">Phần</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* B. Giá bán & tồn kho */}
            <Card>
              <CardHeader>
                <CardTitle>B. Giá bán & tồn kho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Giá bán *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0"
                      className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>

                  <div>
                    <Label>Giá vốn (tự động)</Label>
                    <Input
                      type="number"
                      value={totalCost}
                      disabled
                      className="bg-slate-100 border-slate-300"
                    />
                  </div>

                  <div>
                    <Label>Trạng thái mặt hàng</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Đang kinh doanh</SelectItem>
                        <SelectItem value="inactive">Ngừng kinh doanh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Mô tả món</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả chi tiết về món..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* C. Công thức chuẩn (BM1) */}
            <Card>
              <CardHeader>
                <CardTitle>C. Công thức chuẩn (BM1)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nguyên liệu</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Định lượng</TableHead>
                      <TableHead>Giá vốn/đơn vị</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>
                          <Select
                            value={ingredient.name}
                            onValueChange={(value) => handleIngredientChange(ingredient.id, 'name', value)}
                          >
                            <SelectTrigger className="bg-white border-slate-300 shadow-none">
                              <SelectValue placeholder="Chọn nguyên liệu" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cà phê phin">Cà phê phin</SelectItem>
                              <SelectItem value="Trà">Trà</SelectItem>
                              <SelectItem value="Sữa đặc">Sữa đặc</SelectItem>
                              <SelectItem value="Đường">Đường</SelectItem>
                              <SelectItem value="Đá viên">Đá viên</SelectItem>
                              <SelectItem value="Đào">Đào</SelectItem>
                              <SelectItem value="Phúc bồn tử">Phúc bồn tử</SelectItem>
                              <SelectItem value="Cam">Cam</SelectItem>
                              <SelectItem value="Sả">Sả</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ingredient.unit}
                            onValueChange={(value) => handleIngredientChange(ingredient.id, 'unit', value)}
                          >
                            <SelectTrigger className="w-24 bg-white border-slate-300 shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lít">lít</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(ingredient.id, 'quantity', Number(e.target.value))}
                            className="w-28 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={ingredient.cost}
                            onChange={(e) => handleIngredientChange(ingredient.id, 'cost', Number(e.target.value))}
                            className="w-32 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveIngredient(ingredient.id)}
                            disabled={ingredients.length === 1}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button variant="outline" onClick={handleAddIngredient} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm nguyên liệu
                </Button>

                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <span>Tổng giá vốn:</span>
                  <span className="text-lg">{totalCost.toLocaleString('vi-VN')}đ</span>
                </div>
              </CardContent>
            </Card>

            {/* Footer Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedView('detail')}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleApproveAndCreate}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Phê duyệt & thêm vào menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <DialogTitle className="text-xl">Thành công!</DialogTitle>
              </div>
            </DialogHeader>
            <div className="text-center py-4">
              <p className="text-slate-700">
                Món <strong>{createdItemName}</strong> đã được thêm vào thực đơn và đồng bộ xuống POS & Bếp.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccessModalOpen(false);
                  setSelectedView('list');
                  setSelectedRequest(null);
                }}
                className="flex-1"
              >
                Về danh sách yêu cầu
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setSuccessModalOpen(false);
                  setSelectedView('list');
                }}
              >
                Xem món vừa tạo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}