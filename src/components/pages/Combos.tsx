import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { PackageCheck, Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Download, Upload, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { getCombos, createCombo, updateCombo, deleteCombo, toggleComboActive } from "../../api/combo";
import { ExportExcelDialog } from "../ExportExcelDialog";
import { Checkbox } from "@radix-ui/react-checkbox";

interface Combos{
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    originalPrice?: number;
    comboPrice: number;
    savings?: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
}
type ComboRow = {
    id: number | string;
    name: string;
    description?: string;
    price: number;
    discount?: number;
    isActive?: boolean;
    groupsCount?: number;
    updatedAt?: string;
    originalPrice?: number;
    comboPrice?: number;
    savings?: number;

};

const extractItems = (res: any): any[] => {
  const data = res?.data ?? res;
  let items = data?.metaData?.items ?? data?.items ?? data?.data;
  if (Array.isArray(items)) return items;
  if (Array.isArray(data?.metaData)) return data.metaData;
  if (Array.isArray(data)) return data;
  return [];
};

export function Combos() {
  const { canCreate, canUpdate, canDelete } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ComboRow[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ComboRow | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; price: number; discount: number; isActive: boolean }>({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    isActive: true,
  });

  // StockCheck-like UI states
  type SortField = 'code' | 'name' | 'originalPrice' | 'status' | 'updated' | 'comboPrice' |'savings';
  type SortOrder = 'asc' | 'desc' | 'none';
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Array<'active' | 'inactive'>>(['active', 'inactive']);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toggleStatus = (status: "active" | "inactive") => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };
  const handleQuickFilterStatus = (status: "active" | "inactive") => {
    setSelectedStatuses([status]);
  };
  const initialStockSessions: Combos[] = [
  {
    id: 1,
    name: "Combo Cà Phê Sữa Đá",
    description: "Thưởng thức hương vị cà phê sữa đá truyền thống",
    imageUrl: "",
    originalPrice: 150000,
    comboPrice: 120000,
    savings: 30000,
    isActive: true,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    createdAt: "2024-11-25",
    updatedAt: "2024-11-26",
    deletedAt: undefined,   
  },
];
  const [sessions, setSessions] =
      useState<Combos[]>(initialStockSessions);
  const completedCount = sessions.filter(
    (s) => s.isActive === true
  ).length;
    const draftCount = sessions.filter((s) => s.isActive === false).length;
    
  // Permission gating aligned to combos:* permissions
  const canCreateCombo = canCreate("combos");
  const canUpdateCombo = canUpdate("combos");
  const canDeleteCombo = canDelete("combos");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCombos(search ? { search } : undefined);
      const items = extractItems(res);
      const mapped: ComboRow[] = (items as any[]).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? "",
        price: Number(c.comboPrice ?? c.price ?? 0),
        discount: c.discount != null ? Number(c.discount) : undefined,
        isActive: Boolean(c.isActive ?? c.active ?? true),
        groupsCount: Array.isArray(c.comboGroups ?? c.groups) ? (c.comboGroups ?? c.groups).length : undefined,
        updatedAt: c.updatedAt ?? c.updated_at,
      }));
      setRows(mapped);
    } catch (err: any) {
      toast.error("Không tải được Combo", { description: err?.message || "Lỗi kết nối API" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q));
    }
    // Filter by status
    list = list.filter((r) => {
      const status: 'active' | 'inactive' = r.isActive ? 'active' : 'inactive';
      return selectedStatuses.includes(status);
    });
    // Apply sorting
    if (sortField && sortOrder !== 'none') {
      const sorted = [...list].sort((a, b) => {
        let aVal: any;
        let bVal: any;
        switch (sortField) {
          case 'name':
            aVal = a.name || '';
            bVal = b.name || '';
            break;
          case 'originalPrice':
            aVal = Number(a.originalPrice) || 0;
            bVal = Number(b.originalPrice) || 0;
            break;
          case 'comboPrice':
            aVal = Number(a.comboPrice ?? 0);
            bVal = Number(b.comboPrice ?? 0);
            break;
          case 'status':
            aVal = a.isActive ? 1 : 0;
            bVal = b.isActive ? 1 : 0;
            break;
          case 'savings':
            aVal = Number(a.savings ?? 0);
            bVal = Number(b.savings ?? 0);
            break;
            case 'updated':
            aVal = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            bVal = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            break;

          default:
            aVal = 0; bVal = 0;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.localeCompare(bVal, 'vi');
          return sortOrder === 'asc' ? cmp : -cmp;
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    }
    return list;
  }, [rows, search, selectedStatuses, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else if (sortOrder === 'desc') { setSortOrder('none'); setSortField(null); }
      else { setSortOrder('asc'); }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === 'none') return null;
    if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: 0, discount: 0, isActive: true });
    setOpenForm(true);
  };

  const openEdit = (row: ComboRow) => {
    setEditing(row);
    setForm({ name: row.name, description: row.description ?? "", price: row.price, discount: row.discount ?? 0, isActive: Boolean(row.isActive) });
    setOpenForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên combo");
      return;
    }
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        comboPrice: Number(form.price) || 0,
        discount: form.discount || 0,
        isActive: form.isActive,
      };
      if (editing) {
        await updateCombo(editing.id, payload);
        toast.success("Đã cập nhật combo");
      } else {
        await createCombo(payload);
        toast.success("Đã tạo combo mới");
      }
      setOpenForm(false);
      setEditing(null);
      loadData();
    } catch (err: any) {
      toast.error("Lưu combo thất bại", { description: err?.message || "API lỗi" });
    }
  };

  const handleDelete = async (row: ComboRow) => {
    if (!canDeleteCombo) return;
    if (!confirm(`Xóa combo "${row.name}"?`)) return;
    try {
      await deleteCombo(row.id);
      toast.success("Đã xóa combo");
      loadData();
    } catch (err: any) {
      toast.error("Xóa combo thất bại", { description: err?.message || "API lỗi" });
    }
  };

  const handleToggleActive = async (row: ComboRow) => {
    if (!canUpdateCombo) return;
    try {
      await toggleComboActive(row.id);
      toast.success(row.isActive ? "Đã tạm ngưng combo" : "Đã kích hoạt combo");
      loadData();
    } catch (err: any) {
      toast.error("Cập nhật trạng thái thất bại", { description: err?.message || "API lỗi" });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-blue-900 text-2xl font-semibold">Quản lý Combo</h2>
            <p className="text-sm text-slate-500">Danh sách combo và trạng thái áp dụng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm combo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
            Bộ lọc
          </Button> */}
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Nhập file
          </Button>
          <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Xuất file
          </Button>
          <Button
            onClick={openCreate}
            disabled={!canCreateCombo}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm combo
          </Button>
        </div>
      </div>
    {/* Search and Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm theo mã phiếu hoặc ghi chú..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-slate-300"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Bộ lọc
                  </Button>
                </div>
    
                {showFilters && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Trạng thái</Label>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="status-draft"
                              checked={selectedStatuses.includes("active")}
                              onCheckedChange={() => toggleStatus("active")}
                              className="border-slate-300"
                            />
                            <Label
                              htmlFor="status-draft"
                              className="text-sm text-slate-700 cursor-pointer font-normal"
                            >
                              Nháp
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="status-completed"
                              checked={selectedStatuses.includes("inactive")}
                              onCheckedChange={() => toggleStatus("inactive")}
                              className="border-slate-300"
                            />
                            <Label
                              htmlFor="status-completed"
                              className="text-sm text-slate-700 cursor-pointer font-normal"
                            >
                              Hoàn thành
                            </Label>
                          </div>
                        </div>
                      </div>
    
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Thống kê</Label>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-xs"
                            onClick={() => setSelectedStatuses(["active", "inactive"])}
                          >
                            <span>Tất cả</span>
                            <span className="text-slate-500">({sessions.length})</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-xs"
                            onClick={() => handleQuickFilterStatus("inactive")}
                          >
                            <span>Hoàn thành</span>
                            <span className="text-slate-500">({completedCount})</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-xs"
                            onClick={() => handleQuickFilterStatus("active")}
                          >
                            <span>Nháp</span>
                            <span className="text-slate-500">({draftCount})</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

      {/* Filters panel like StockCheck */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-2">Trạng thái</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes('active')}
                      onChange={(e) => {
                        setSelectedStatuses((prev) => e.target.checked ? Array.from(new Set([...prev, 'active'])) : prev.filter(s => s !== 'active'));
                      }}
                    />
                    Đang áp dụng
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes('inactive')}
                      onChange={(e) => {
                        setSelectedStatuses((prev) => e.target.checked ? Array.from(new Set([...prev, 'inactive'])) : prev.filter(s => s !== 'inactive'));
                      }}
                    />
                    Tạm ngưng
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock check sessions table */}
        <Card className="border-blue-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="w-16 text-sm text-center">STT</TableHead>
                    <TableHead
                      className="w-20 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center">
                        Mã phiếu
                        {getSortIcon("code")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Tên Combo
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSort("originalPrice")}
                    >
                      <div className="flex items-center">
                        Giá gốc
                        {getSortIcon("originalPrice")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-28 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSort("comboPrice")}
                    >
                      <div className="flex items-center justify-center">
                        Giá combo
                        {getSortIcon("comboPrice")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-20 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSort("savings")}
                    >
                      <div className="flex items-center justify-center">
                        Chênh lệch
                        {getSortIcon("savings")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-24 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center justify-center">
                        Trạng thái
                        {getSortIcon("status")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-32 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSort("updated")}
                    >
                      <div className="flex items-center">
                        Cập nhật
                        {getSortIcon("updated")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* {filteredSessions.map((session, index) => {
                    const items = sessionItems[session.id] || [];
                    const totalItems = items.length;
                    const matched = items.filter(
                      (it) => it.realQty === it.systemQty
                    ).length;
                    const diffItems = totalItems - matched;
                    const isExpanded = expandedSessionId === session.id;

                    const statusLabel =
                      session.status === "draft" ? "Nháp" : "Hoàn thành";
                    const statusClass =
                      session.status === "draft"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-blue-50 text-blue-700";

                    return (
                      <>
                        <TableRow
                          key={session.id}
                          className="cursor-pointer hover:bg-blue-50/60 transition-colors"
                          onClick={() =>
                            setExpandedSessionId((prev) =>
                              prev === session.id ? null : session.id
                            )
                          }
                        >
                          <TableCell className="text-sm">
                            <span className="inline-flex h-4 w-4 items-center justify-center">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-sm text-blue-700 font-medium">
                            {session.id}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {session.date}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {session.staff}
                          </TableCell>
                          <TableCell className="text-sm text-center text-slate-900">
                            {totalItems}
                          </TableCell>
                          <TableCell className="text-sm text-center text-emerald-600">
                            {matched}
                          </TableCell>
                          <TableCell className="text-sm text-center text-amber-600">
                            {diffItems}
                          </TableCell>
                          <TableCell className="text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
                            >
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {session.note}
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-blue-50/30">
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-6 space-y-4">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <p>
                                      <span className="font-medium text-slate-600">
                                        Mã phiếu kiểm:
                                      </span>{" "}
                                      <span className="text-slate-900">
                                        {session.id}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="font-medium text-slate-600">
                                        Người kiểm:
                                      </span>{" "}
                                      <span className="text-slate-900">
                                        {session.staff}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="font-medium text-slate-600">
                                        Ghi chú:
                                      </span>{" "}
                                      <span className="text-slate-900">
                                        {session.note}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p>
                                      <span className="font-medium text-slate-600">
                                        Ngày kiểm:
                                      </span>{" "}
                                      <span className="text-slate-900">
                                        {session.date}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="font-medium text-slate-600">
                                        Trạng thái:
                                      </span>{" "}
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${statusClass}`}
                                      >
                                        {statusLabel}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                
                                <div className="border rounded-xl overflow-hidden bg-white">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-blue-50">
                                        <TableHead className="w-20 text-sm">
                                          Mã hàng
                                        </TableHead>
                                        <TableHead className="text-sm">Tên hàng hóa</TableHead>
                                        <TableHead className="text-sm">Danh mục</TableHead>
                                        <TableHead className="w-20 text-sm">
                                          ĐVT
                                        </TableHead>
                                        <TableHead className="w-32 text-right text-sm">
                                          Tồn hệ thống
                                        </TableHead>
                                        <TableHead className="w-32 text-right text-sm">
                                          Tồn thực tế
                                        </TableHead>
                                        <TableHead className="w-24 text-center text-sm">
                                          Chênh lệch
                                        </TableHead>
                                        <TableHead className="text-sm">Ghi chú</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {items.map((item) => {
                                        const diff =
                                          item.realQty - item.systemQty;
                                        const diffColor =
                                          diff === 0
                                            ? "text-slate-500"
                                            : diff > 0
                                              ? "text-emerald-600"
                                              : "text-red-600";
                                        return (
                                          <TableRow key={item.code}>
                                            <TableCell className="text-sm text-slate-600">
                                              {item.code}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-900">
                                              {item.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                              {
                                                categories.find(
                                                  (c) => c.id === item.category
                                                )?.name
                                              }
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                              {item.unit}
                                            </TableCell>
                                            <TableCell className="text-sm text-right text-slate-900">
                                              {item.systemQty.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-sm text-right text-slate-900">
                                              {item.realQty.toLocaleString()}
                                            </TableCell>
                                            <TableCell
                                              className={`text-sm text-center font-medium ${diffColor}`}
                                            >
                                              {diff > 0 ? `+${diff}` : diff}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                              {item.note || "-"}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>

                                <div className="flex items-center justify-end mt-2 gap-2">
                                  {session.status === "draft" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        className="bg-slate-700 text-black px-4"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenCreateDialog();
                                        }}
                                      >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Chỉnh sửa
                                      </Button>
                                      <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCompleteSession(session.id);
                                        }}
                                      >
                                        Hoàn thành phiếu kiểm
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })} */}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa combo" : "Thêm combo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tên combo</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Combo Sáng"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn về combo"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Giá combo</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Giảm giá (đ)</Label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="active-checkbox"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <Label htmlFor="active-checkbox">Đang áp dụng</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenForm(false)}>Hủy</Button>
            <Button
              onClick={handleSave}
              disabled={editing ? !canUpdateCombo : !canCreateCombo}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportExcelDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={rows.map(r => ({
          name: r.name,
          price: r.price,
          description: r.description ?? '',
          groups: r.groupsCount ?? 0,
          status: r.isActive ? 'Đang áp dụng' : 'Tạm ngưng',
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString('vi-VN') : ''
        }))}
        columns={[
          { header: 'Tên combo', accessor: (row: any) => row.name },
          { header: 'Giá', accessor: (row: any) => row.price },
          { header: 'Mô tả', accessor: (row: any) => row.description },
          { header: 'Nhóm', accessor: (row: any) => row.groups },
          { header: 'Trạng thái', accessor: (row: any) => row.status },
          { header: 'Cập nhật', accessor: (row: any) => row.updatedAt },
        ]}
        fileName="combos.csv"
        title="Xuất danh sách combo"
      />
    </div>
  );
}
