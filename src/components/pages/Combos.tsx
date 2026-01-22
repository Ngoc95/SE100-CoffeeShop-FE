import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { PackageCheck, Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Download, Upload, Filter, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { getCombos, createCombo, updateCombo, deleteCombo, toggleComboActive, getActiveCombos, getComboById } from "../../api/combo";
import { ExportExcelDialog } from "../ExportExcelDialog";
import { ComboImportDialog } from "../ComboImportDialog";
import { Checkbox } from "@radix-ui/react-checkbox";
import { getInventoryItems } from "../../api/inventoryItem";

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
  // Try common list locations
  let items =
    data?.metaData?.items ??
    data?.metaData?.combos ??
    data?.metaData?.content ??
    data?.items ??
    data?.content ??
    data?.data ??
    data?.list ??
    data?.records;
  if (Array.isArray(items)) return items;
  if (Array.isArray(data?.metaData)) return data.metaData;
  if (Array.isArray(data)) return data;
  return [];
};

export function Combos() {
  const { canCreate, canUpdate, canDelete } = useAuth();
  const [loading, setLoading] = useState(true);
  // Unify search to use `searchQuery` (server + client filtering)
  const [rows, setRows] = useState<ComboRow[]>([]);
  // Pagination (BE supports page, limit)
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ComboRow | null>(null);
  const [form, setForm] = useState<{ 
    name: string; 
    description: string; 
    price: number; 
    originalPrice?: number; 
    imageUrl?: string; 
    startDate?: string; 
    endDate?: string; 
  }>({
    name: "",
    description: "",
    price: 0,
    originalPrice: undefined,
    imageUrl: "",
    startDate: "",
    endDate: "",
  });
  // Groups editor state for create (and future edit)
  type GroupItem = { id: string; itemId: number; name: string; extraPrice: number };
  type GroupForm = { id: string; name: string; isRequired: boolean; minChoices: number; maxChoices: number; items: GroupItem[] };
  const [groups, setGroups] = useState<GroupForm[]>([]);
  const [inventoryOptions, setInventoryOptions] = useState<Array<{ id: number; name: string; price: number; categoryId?: string | number; categoryName?: string }>>([]);
  const [groupSearch, setGroupSearch] = useState<Record<string, string>>({});
  // Per-group category filter for create form
  const [groupCategoryFilterCreate, setGroupCategoryFilterCreate] = useState<Record<string, string>>({});

  // StockCheck-like UI states
  type SortField = 'id' | 'name' | 'originalPrice' | 'status' | 'updated' | 'comboPrice' | 'savings';
  type SortOrder = 'asc' | 'desc' | 'none';
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Array<'active' | 'inactive'>>(['active', 'inactive']);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  // Per-group category filter in detail view: groupId/index -> selected category label ('all' for all)
  const [groupCategoryFilter, setGroupCategoryFilter] = useState<Record<string, string>>({});
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
  // Derived counts from loaded rows
  const activeCount = useMemo(() => rows.filter(r => r.isActive).length, [rows]);
  const inactiveCount = useMemo(() => rows.filter(r => !r.isActive).length, [rows]);
    
  // Permission gating aligned to combos:* permissions
  const canCreateCombo = canCreate("combos");
  const canUpdateCombo = canUpdate("combos");
  const canDeleteCombo = canDelete("combos");

  // Map FE sort to BE sort (only supported: name, comboPrice, createdAt)
  const getServerSort = (): string | undefined => {
    if (!sortField || sortOrder === 'none') return undefined;
    const dir = sortOrder === 'desc' ? '-' : '+';
    if (sortField === 'name') return `${dir}name`;
    if (sortField === 'comboPrice') return `${dir}comboPrice`;
    if (sortField === 'updated') return `${dir}createdAt`;
    return undefined;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const q = searchQuery.trim();
      // Server-side filters where possible
      const onlyOneStatus = selectedStatuses.length === 1 ? selectedStatuses[0] : undefined;
      const isActiveParam = onlyOneStatus ? (onlyOneStatus === 'active' ? 'true' : 'false') : undefined;
      const serverSort = getServerSort();
      const params: Record<string, any> = {
        page,
        limit,
        ...(q ? { search: q } : {}),
        ...(isActiveParam ? { isActive: isActiveParam } : {}),
        ...(serverSort ? { sort: serverSort } : {}),
      };
      const res = await getCombos(params);
      const items = extractItems(res);
      // Debug: log raw response shape to help diagnose empty UI
      // eslint-disable-next-line no-console
      console.debug('[Combos] /combos response', res?.data ?? res);
      // Update pagination from metaData if present
      try {
        const meta = (res as any)?.data?.metaData ?? (res as any)?.metaData;
        if (meta) {
          if (typeof meta.currentPage === 'number') setPage(meta.currentPage);
          if (typeof meta.totalPages === 'number') setTotalPages(meta.totalPages);
          if (typeof meta.total === 'number') setTotal(meta.total);
        }
      } catch {}
      const mapped: ComboRow[] = (items as any[]).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? "",
        price: Number(c.comboPrice ?? c.price ?? 0),
        discount: c.discount != null ? Number(c.discount) : undefined,
        isActive: Boolean(c.isActive ?? c.active ?? true),
        groupsCount: Array.isArray(c.comboGroups ?? c.groups) ? (c.comboGroups ?? c.groups).length : undefined,
        updatedAt: c.updatedAt ?? c.updated_at,
        originalPrice: c.originalPrice != null ? Number(c.originalPrice) : undefined,
        comboPrice: c.comboPrice != null ? Number(c.comboPrice) : undefined,
        savings: c.savings != null ? Number(c.savings) : undefined,
      }));
      // Fallback: if management endpoint returns empty, try active combos endpoint
      if (mapped.length === 0) {
        try {
          const resActive = await getActiveCombos(q ? { search: q } : undefined);
          const activeItems = extractItems(resActive);
          // eslint-disable-next-line no-console
          console.debug('[Combos] /combos/active response', resActive?.data ?? resActive);
          const activeMapped: ComboRow[] = (activeItems as any[]).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description ?? "",
            price: Number(c.comboPrice ?? c.price ?? 0),
            discount: c.discount != null ? Number(c.discount) : undefined,
            isActive: Boolean(c.isActive ?? c.active ?? true),
            groupsCount: Array.isArray(c.comboGroups ?? c.groups) ? (c.comboGroups ?? c.groups).length : undefined,
            updatedAt: c.updatedAt ?? c.updated_at,
            originalPrice: c.originalPrice != null ? Number(c.originalPrice) : undefined,
            comboPrice: c.comboPrice != null ? Number(c.comboPrice) : undefined,
            savings: c.savings != null ? Number(c.savings) : undefined,
          }));
          setRows(activeMapped);
        } catch (_) {
          setRows([]);
        }
      } else {
        setRows(mapped);
      }
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

  // Refetch when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to first page when search changes to avoid empty pages
      setPage(1);
      loadData();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Refetch on page/limit or server-sortable fields / status filter change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    // If status filter changes, reset to page 1 and refetch
    setPage(1);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatuses]);

  useEffect(() => {
    // If sort changes to a server supported field, refetch; client sort still applies after
    if (getServerSort()) {
      setPage(1);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortOrder]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
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
          case 'id':
            // Sort by numeric ID when possible, fallback to string compare
            const aNum = Number(a.id);
            const bNum = Number(b.id);
            if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
              aVal = aNum; bVal = bNum;
            } else {
              aVal = String(a.id);
              bVal = String(b.id);
            }
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
  }, [rows, searchQuery, selectedStatuses, sortField, sortOrder]);

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
    setForm({ name: "", description: "", price: 0, originalPrice: undefined, imageUrl: "", startDate: "", endDate: "" });
    setGroups([]);
    setOpenForm(true);
  };

  const openEdit = (row: ComboRow) => {
    setEditing(row);
    setForm({ 
      name: row.name, 
      description: row.description ?? "", 
      price: row.price, 
      originalPrice: (row as any)?.originalPrice ?? undefined,
      imageUrl: (row as any)?.imageUrl ?? "",
      startDate: (row as any)?.startDate ? String((row as any).startDate).slice(0,10) : "",
      endDate: (row as any)?.endDate ? String((row as any).endDate).slice(0,10) : "",
    });
    // Open form first for responsiveness
    setGroups([]);
    setOpenForm(true);
    // Prefill groups by fetching combo detail
    (async () => {
      try {
        const res = await getComboById(row.id);
        const data = (res as any)?.data?.metaData ?? (res as any)?.data ?? res;
        const rawGroups: any[] = Array.isArray(data?.comboGroups) ? data.comboGroups : (Array.isArray(data?.groups) ? data.groups : []);
        if (rawGroups.length > 0) {
          const mappedGroups: GroupForm[] = rawGroups.map((g: any, idx: number) => {
            const rawItems: any[] = Array.isArray(g?.comboItems) ? g.comboItems : (Array.isArray(g?.items) ? g.items : []);
            const items: GroupItem[] = rawItems.map((gi: any, i: number) => {
              const itemData = gi?.item ?? gi?.inventoryItem ?? gi;
              const itemId = Number(itemData?.id ?? gi?.itemId ?? gi?.inventoryItemId ?? i + 1);
              const name = String(itemData?.name ?? gi?.itemName ?? `Món #${itemId}`);
              const extraPrice = Number(gi?.extraPrice ?? itemData?.extraPrice ?? 0) || 0;
              return {
                id: `${g?.id ?? idx}-${itemId}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
                itemId,
                name,
                extraPrice,
              };
            });
            const isReq = Boolean(g?.isRequired ?? g?.required ?? ((Number(g?.minChoices ?? 0)) > 0));
            const minChoices = Number(g?.minChoices ?? (isReq ? 1 : 0));
            const maxChoices = Number(g?.maxChoices ?? (items.length || 1));
            return {
              id: String(g?.id ?? `g-${idx}-${Date.now()}`),
              name: String(g?.name ?? g?.groupName ?? `Nhóm ${idx + 1}`),
              isRequired: isReq,
              minChoices,
              maxChoices,
              items,
            } as GroupForm;
          });
          setGroups(mappedGroups);
        }
        // Also hydrate more accurate fields from detail if present
        setForm((prev) => ({
          ...prev,
          price: Number(data?.comboPrice ?? data?.price ?? prev.price ?? 0),
          originalPrice: data?.originalPrice != null ? Number(data.originalPrice) : prev.originalPrice,
          imageUrl: data?.imageUrl ?? prev.imageUrl,
          startDate: data?.startDate ? String(data.startDate).slice(0,10) : prev.startDate,
          endDate: data?.endDate ? String(data.endDate).slice(0,10) : prev.endDate,
        }));
      } catch (err: any) {
        // Silent failure; keep basic edit form
        console.warn('[Combos] Failed to load combo detail for edit', err?.message || err);
      }
    })();
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên combo");
      return;
    }
    // Validate groups for both create and edit
    if (groups.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 nhóm cho combo");
      return;
    }
    for (const g of groups) {
      if (!g.name.trim()) {
        toast.error("Tên nhóm không được để trống");
        return;
      }
      if (!g.items || g.items.length === 0) {
        toast.error(`Nhóm "${g.name}" cần có ít nhất 1 món`);
        return;
      }
      const minC = Number.isFinite(g.minChoices) ? g.minChoices : 0;
      const maxC = Number.isFinite(g.maxChoices) ? g.maxChoices : g.items.length;
      if (minC < 0 || maxC < 1 || minC > maxC) {
        toast.error(`Thiết lập chọn của nhóm "${g.name}" không hợp lệ`);
        return;
      }
    }
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        comboPrice: Number(form.price) || 0,
        imageUrl: form.imageUrl?.trim() || undefined,
        originalPrice: form.originalPrice != null && form.originalPrice > 0 ? Number(form.originalPrice) : undefined,
        startDate: form.startDate ? form.startDate : undefined,
        endDate: form.endDate ? form.endDate : undefined,
      };
      if (editing) {
        // Include groups in PATCH payload
        payload.groups = groups.map((g) => ({
          name: g.name.trim(),
          isRequired: g.isRequired,
          minChoices: Number.isFinite(g.minChoices) ? g.minChoices : (g.isRequired ? 1 : 0),
          maxChoices: Number.isFinite(g.maxChoices) && g.maxChoices > 0 ? g.maxChoices : g.items.length,
          items: g.items.map((it) => ({ itemId: Number(it.itemId), extraPrice: Number(it.extraPrice) || 0 }))
        }));
        await updateCombo(editing.id, payload);
        toast.success("Đã cập nhật combo");
      } else {
        // Map groups to BE schema
        payload.groups = groups.map((g) => ({
          name: g.name.trim(),
          isRequired: g.isRequired,
          minChoices: Number.isFinite(g.minChoices) ? g.minChoices : (g.isRequired ? 1 : 0),
          maxChoices: Number.isFinite(g.maxChoices) && g.maxChoices > 0 ? g.maxChoices : g.items.length,
          items: g.items.map((it) => ({ itemId: Number(it.itemId), extraPrice: Number(it.extraPrice) || 0 }))
        }));
        await createCombo(payload);
        toast.success("Đã tạo combo thành công");
      }
      setOpenForm(false);
      setEditing(null);
      loadData();
    } catch (err: any) {
      toast.error("Lưu combo thất bại", { description: err?.message || "API lỗi" });
    }
  };

  // Load inventory items when opening the form
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const res = await (getInventoryItems as any)({ excludeIngredients: true, isTopping: false, limit: 200, page: 1 });
        const data = (res as any)?.data?.metaData ?? (res as any)?.data ?? res;
        const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        const opts = (items as any[]).map((it: any) => ({
          id: Number(it.id),
          name: String(it.name),
          price: Number(it.sellingPrice ?? 0),
          categoryId: it?.categoryId ?? it?.categoryID ?? it?.category?.id,
          categoryName: it?.categoryName ?? it?.categoryLabel ?? it?.category?.name,
        }));
        setInventoryOptions(opts);
      } catch (_) {
        setInventoryOptions([]);
      }
    };
    if (openForm) loadInventory();
  }, [openForm]);

  // Group editor helpers
  const addGroup = () => {
    const id = `g-${Date.now()}`;
    setGroups((prev) => [...prev, { id, name: "Nhóm mới", isRequired: true, minChoices: 1, maxChoices: 1, items: [] }]);
  };
  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setGroupSearch((prev) => {
      const n = { ...prev }; delete n[id]; return n;
    });
  };
  const updateGroupField = (id: string, field: keyof GroupForm, value: any) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };
  const addItemToGroup = (gid: string, item: { id: number; name: string }) => {
    setGroups((prev) => prev.map((g) => {
      if (g.id !== gid) return g;
      if (g.items.some((it) => it.itemId === item.id)) return g; // avoid duplicates
      const newItem: GroupItem = { id: `${gid}-${item.id}-${Date.now()}`, itemId: item.id, name: item.name, extraPrice: 0 };
      const maxChoices = Math.max(g.maxChoices || 1, g.items.length + 1);
      return { ...g, items: [...g.items, newItem], maxChoices };
    }));
  };
  const removeItemFromGroup = (gid: string, itemId: string) => {
    setGroups((prev) => prev.map((g) => {
      if (g.id !== gid) return g;
      const items = g.items.filter((it) => it.id !== itemId);
      const maxChoices = Math.min(g.maxChoices || items.length, items.length || 1);
      const minChoices = Math.min(g.minChoices || 0, maxChoices);
      return { ...g, items, maxChoices, minChoices };
    }));
  };
  const updateItemExtraPrice = (gid: string, itemId: string, extraPrice: number) => {
    setGroups((prev) => prev.map((g) => {
      if (g.id !== gid) return g;
      return { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, extraPrice } : it)) };
    }));
  };

  // Helper to safely extract a displayable category label from inventory item data
  const getCategoryLabel = (itemData: any): string | null => {
    // Prefer explicit name/label if available
    const nameCandidates = [
      itemData?.categoryName,
      itemData?.categoryLabel,
      itemData?.category?.name,
      itemData?.category?.label,
    ].filter((v) => typeof v === 'string' && v.length > 0) as string[];
    if (nameCandidates.length > 0) return nameCandidates[0];

    // Fall back to ID-based fields commonly used by inventory items
    const idCandidates = [
      itemData?.categoryId,
      itemData?.categoryID,
      itemData?.category_id,
      itemData?.category?.id,
    ].filter((v) => v !== undefined && v !== null);
    if (idCandidates.length > 0) return String(idCandidates[0]);

    // As a last resort, accept raw category value if primitive
    const cat = itemData?.category;
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'number') return String(cat);
    return null;
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

  const openDetail = async (id: number | string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await getComboById(id);
      const data = (res as any)?.data?.metaData ?? (res as any)?.data ?? res;
      setDetail(data);
    } catch (err: any) {
      toast.error("Không tải được chi tiết combo", { description: err?.message || "API lỗi" });
    } finally {
      setDetailLoading(false);
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
                      placeholder="Tìm combo theo tên hoặc mô tả..."
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
                              Đang áp dụng
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
                              Tạm ngưng
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
                            <span className="text-slate-500">({rows.length})</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-xs"
                            onClick={() => handleQuickFilterStatus("active")}
                          >
                            <span>Đang áp dụng</span>
                            <span className="text-slate-500">({activeCount})</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-xs"
                            onClick={() => handleQuickFilterStatus("inactive")}
                          >
                            <span>Tạm ngưng</span>
                            <span className="text-slate-500">({inactiveCount})</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-slate-600">Tổng: {total.toLocaleString('vi-VN')} combo</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Trang trước
              </Button>
              <span className="text-sm text-slate-700">
                {page}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Trang sau
              </Button>
            </div>
          </div>

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
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center">
                        Mã combo
                        {getSortIcon("id")}
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
                    <TableHead className="text-sm">Trạng thái</TableHead>
                    <TableHead className="text-sm text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-slate-500 py-6">
                        Không có combo nào phù hợp
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row, index) => {
                      const originalPrice = row.originalPrice ?? ((row.price || 0) + (row.discount || 0));
                      const comboPrice = row.comboPrice ?? row.price ?? 0;
                      const savings = row.savings ?? Math.max(0, originalPrice - comboPrice);
                      return (
                        <TableRow
                          key={String(row.id)}
                          className="hover:bg-blue-50/60 cursor-pointer"
                          onClick={() => openDetail(row.id)}
                        >
                          <TableCell className="text-center text-sm text-slate-600">{index + 1}</TableCell>
                          <TableCell className="text-sm text-blue-700 font-medium">{row.id}</TableCell>
                          <TableCell className="text-sm text-slate-900">{row.name}</TableCell>
                          <TableCell className="text-sm text-slate-700">{originalPrice.toLocaleString("vi-VN")}₫</TableCell>
                          <TableCell className="text-sm text-center text-slate-900">{comboPrice.toLocaleString("vi-VN")}₫</TableCell>
                          <TableCell className="text-sm text-center text-emerald-700">{savings.toLocaleString("vi-VN")}₫</TableCell>
                          <TableCell className="text-sm">
                            {row.isActive ? (
                              <Badge className="bg-emerald-500 text-white text-xs">Hoạt động</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-slate-100 border-slate-300 text-slate-700">Tạm ngưng</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="Chỉnh sửa"
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); openEdit(row); }}
                                disabled={!canUpdateCombo}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                title="Xóa"
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(row); }}
                                disabled={!canDeleteCombo}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 ${row.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                                title={row.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggleActive(row); }}
                                disabled={!canUpdateCombo}
                              >
                                {row.isActive ? (
                                  <ToggleLeft className="w-4 h-4" />
                                ) : (
                                  <ToggleRight className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      {/* Combo Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        {/* Cap modal height and enable internal scrolling */}
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết combo</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="p-6 text-sm text-slate-600">Đang tải...</div>
          ) : !detail ? (
            <div className="p-6 text-sm text-slate-600">Không có dữ liệu</div>
          ) : (
            // Use a 2-section layout: header (fixed) + groups (scrollable)
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header with image and basic info */}
              <div className="flex gap-4 pb-2 border-b border-slate-200">
                <div className="w-28 h-28 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                  {detail.imageUrl ? (
                    <img src={detail.imageUrl} alt={detail.name} className="w-full h-full object-cover" />
                  ) : (
                    <PackageCheck className="w-10 h-10 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{detail.name}</h3>
                    {detail.isActive ? (
                      <Badge className="bg-emerald-500 text-white text-xs">Hoạt động</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-slate-100 border-slate-300 text-slate-700">Tạm ngưng</Badge>
                    )}
                  </div>
                  {detail.description && (
                    <p className="text-sm text-slate-700 mt-1">{detail.description}</p>
                  )}
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">Giá gốc</div>
                      <div className="font-medium">{Number(detail.originalPrice ?? 0).toLocaleString('vi-VN')}₫</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Giá combo</div>
                      <div className="font-medium">{Number(detail.comboPrice ?? detail.price ?? 0).toLocaleString('vi-VN')}₫</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Chênh lệch</div>
                      <div className="font-medium">{Number(detail.savings ?? Math.max(0, (Number(detail.originalPrice ?? 0) - Number(detail.comboPrice ?? 0)))).toLocaleString('vi-VN')}₫</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Cập nhật</div>
                      <div className="font-medium">{detail.updatedAt ? new Date(detail.updatedAt).toLocaleString('vi-VN') : '-'}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500">Bắt đầu</div>
                      <div>{detail.startDate ? new Date(detail.startDate).toLocaleDateString('vi-VN') : '-'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Kết thúc</div>
                      <div>{detail.endDate ? new Date(detail.endDate).toLocaleDateString('vi-VN') : '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Groups */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 pt-3" style={{maxHeight: '60vh'}}>
                <h4 className="text-sm font-semibold text-slate-900">Nhóm & Món trong combo</h4>
                {Array.isArray(detail.comboGroups ?? detail.groups) && (detail.comboGroups ?? detail.groups).length > 0 ? (
                  <div className="space-y-3">
                    {(detail.comboGroups ?? detail.groups).map((g: any, idx: number) => {
                      const items: any[] = Array.isArray(g.comboItems ?? g.items) ? (g.comboItems ?? g.items) : [];
                      return (
                        <div key={g.id ?? idx} className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{g.name ?? `Nhóm ${idx + 1}`}</span>
                              {Boolean(g.isRequired ?? g.required ?? (g.minChoices ?? 0) > 0) ? (
                                <Badge className="bg-amber-500 text-white text-xs">Bắt buộc</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Tùy chọn</Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-600">Chọn: {g.minChoices ?? 0} - {(g.maxChoices ?? items.length)}</div>
                          </div>
                          {items.length > 0 ? (
                            <>
                              {/* Category chips */}
                              {(() => {
                                const categorySet = new Set<string>();
                                items.forEach((gi: any) => {
                                  const label = getCategoryLabel(gi.item ?? gi);
                                  if (label) categorySet.add(label);
                                });
                                const categories = Array.from(categorySet);
                                const groupKey = String(g.id ?? idx);
                                const selectedCat = groupCategoryFilter[groupKey] ?? 'all';
                                const isSelected = (cat: string) => selectedCat === cat;
                                return categories.length > 0 ? (
                                  <div className="mt-2 mb-2 flex flex-wrap gap-2">
                                    <Button
                                      variant={selectedCat === 'all' ? 'default' : 'outline'}
                                      size="sm"
                                      className={selectedCat === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                                      onClick={() => setGroupCategoryFilter((prev) => ({ ...prev, [groupKey]: 'all' }))}
                                    >
                                      Tất cả
                                    </Button>
                                    {categories.map((cat) => (
                                      <Button
                                        key={cat}
                                        variant={isSelected(cat) ? 'default' : 'outline'}
                                        size="sm"
                                        className={isSelected(cat) ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                                        onClick={() => setGroupCategoryFilter((prev) => ({ ...prev, [groupKey]: cat }))}
                                      >
                                        {cat}
                                      </Button>
                                    ))}
                                  </div>
                                ) : null;
                              })()}

                              {/* Items grid with category filter applied */}
                              {(() => {
                                const groupKey = String(g.id ?? idx);
                                const selectedCat = groupCategoryFilter[groupKey] ?? 'all';
                                const filteredItems = selectedCat === 'all'
                                  ? items
                                  : items.filter((gi: any) => getCategoryLabel(gi.item ?? gi) === selectedCat);
                                return (
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {filteredItems.map((gi: any, i: number) => {
                                      const itemData = gi.item ?? gi;
                                      const name = itemData?.name ?? gi.itemName ?? `Món #${i + 1}`;
                                      const basePrice = Number(itemData?.sellingPrice ?? itemData?.price ?? 0);
                                      const extraPrice = Number(gi.extraPrice ?? 0);
                                      return (
                                        <div key={gi.id ?? i} className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm text-slate-900 truncate">{name}</div>
                                            <div className="text-xs text-slate-600">Giá gốc: {basePrice.toLocaleString('vi-VN')}₫</div>
                                          </div>
                                          {extraPrice > 0 && (
                                            <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">+{extraPrice.toLocaleString('vi-VN')}₫</Badge>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </>
                          ) : (
                            <div className="text-xs text-slate-500 mt-1">Không có món trong nhóm</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">Combo chưa có nhóm/món.</div>
                )}
              </div>
            </div>
          )}
          {/* <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        {/* Widen modal, cap height, and enable internal vertical scrolling */}
        <DialogContent className="sm:max-w-6xl w-[95vw] max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa combo" : "Thêm combo"}</DialogTitle>
          </DialogHeader>
          {/* Two-column layout: left = thông tin cơ bản, right = cấu hình nhóm & món (scrollable) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1 min-h-0">
            {/* Left column: basic info */}
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
                <Label>Giá gốc (tùy chọn)</Label>
                <Input
                  type="number"
                  value={form.originalPrice ?? 0}
                  onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) || undefined })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Ảnh (URL)</Label>
              <Input
                value={form.imageUrl || ""}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ngày bắt đầu (tùy chọn)</Label>
                <Input
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Ngày kết thúc (tùy chọn)</Label>
                <Input
                  type="date"
                  value={form.endDate || ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            </div>

            {/* Right column: groups editor (create & edit modes) */}
            <div className="mt-0 lg:mt-0 lg:border-l lg:pl-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Cấu hình nhóm & món</Label>
                  <Button variant="outline" size="sm" onClick={addGroup}>
                    <Plus className="w-3 h-3 mr-1" /> Thêm nhóm
                  </Button>
                </div>
                {groups.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có nhóm. Nhấn "Thêm nhóm" để bắt đầu.</p>
                ) : (
                  <div className="space-y-3 max-h-[65vh] overflow-auto pr-1">
                    {groups.map((g) => {
                      const searchText = groupSearch[g.id] ?? "";
                      const alreadyIds = new Set(g.items.map((it) => it.itemId));
                      const availableInv = inventoryOptions.filter((it) => !alreadyIds.has(it.id));
                      // Build category list for chips (label prefers name else id)
                      const categorySet = new Set<string>();
                      availableInv.forEach((it) => {
                        const label = it.categoryName ?? (it.categoryId != null ? String(it.categoryId) : null);
                        if (label) categorySet.add(label);
                      });
                      const categories = Array.from(categorySet);
                      const groupKey = String(g.id);
                      const selectedCat = groupCategoryFilterCreate[groupKey] ?? 'all';
                      const filteredInv = availableInv
                        .filter((it) => selectedCat === 'all' ? true : ((it.categoryName ?? (it.categoryId != null ? String(it.categoryId) : '')) === selectedCat))
                        .filter((it) => it.name.toLowerCase().includes(searchText.toLowerCase()))
                        .slice(0, 8);
                      return (
                        <div key={g.id} className="border rounded-lg p-3 bg-white border-slate-200">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Tên nhóm</Label>
                                <Input value={g.name} onChange={(e) => updateGroupField(g.id, 'name', e.target.value)} className="mt-1" />
                              </div>
                              <div className="flex items-center gap-3 mt-5 md:mt-0">
                                <label className="flex items-center gap-2 text-xs">
                                  <input type="checkbox" checked={g.isRequired} onChange={(e) => updateGroupField(g.id, 'isRequired', e.target.checked)} /> Bắt buộc
                                </label>
                                <div className="flex items-center gap-1 text-xs">
                                  <span>Chọn</span>
                                  <Input type="number" value={g.minChoices} onChange={(e) => updateGroupField(g.id, 'minChoices', Math.max(0, Number(e.target.value)||0))} className="w-14 h-8" />
                                  <span>-</span>
                                  <Input type="number" value={g.maxChoices} onChange={(e) => updateGroupField(g.id, 'maxChoices', Math.max(1, Number(e.target.value)||1))} className="w-14 h-8" />
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" onClick={() => removeGroup(g.id)} title="Xóa nhóm">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Items list */}
                          <div className="mt-3 space-y-2">
                            {g.items.length === 0 ? (
                              <div className="text-xs text-slate-500">Chưa có món trong nhóm.</div>
                            ) : (
                              g.items.map((it) => (
                                <div key={it.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-2">
                                  <div className="text-sm text-slate-900">{it.name}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600">Phụ thu</span>
                                    <Input type="number" value={it.extraPrice} onChange={(e) => updateItemExtraPrice(g.id, it.id, Number(e.target.value)||0)} className="w-24 h-8" />
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" onClick={() => removeItemFromGroup(g.id, it.id)} title="Xóa">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Category chips, search and add items */}
                          <div className="mt-3">
                            <Label className="text-xs">Thêm món</Label>
                            {/* Category chips */}
                            {categories.length > 0 && (
                              <div className="mt-2 mb-2 flex flex-wrap gap-2">
                                <Button
                                  variant={selectedCat === 'all' ? 'default' : 'outline'}
                                  size="sm"
                                  className={selectedCat === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                                  onClick={() => setGroupCategoryFilterCreate((prev) => ({ ...prev, [groupKey]: 'all' }))}
                                >
                                  Tất cả
                                </Button>
                                {categories.map((cat) => (
                                  <Button
                                    key={cat}
                                    variant={selectedCat === cat ? 'default' : 'outline'}
                                    size="sm"
                                    className={selectedCat === cat ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                                    onClick={() => setGroupCategoryFilterCreate((prev) => ({ ...prev, [groupKey]: cat }))}
                                  >
                                    {cat}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Input placeholder="Tìm theo tên món..." value={searchText} onChange={(e) => setGroupSearch((prev) => ({ ...prev, [g.id]: e.target.value }))} className="flex-1" />
                              <span className="text-xs text-slate-500">{filteredInv.length} / {Math.max(1, inventoryOptions.length - g.items.length)}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-auto pr-1">
                              {filteredInv.map((op) => (
                                <Button key={op.id} type="button" variant="outline" className="justify-between h-8" onClick={() => addItemToGroup(g.id, op)}>
                                  <span className="truncate">{op.name}</span>
                                  <span className="text-xs text-slate-500">{op.price.toLocaleString('vi-VN')}₫</span>
                                </Button>
                              ))}
                              {filteredInv.length === 0 && (
                                <div className="text-xs text-slate-400 col-span-2">Không có kết quả phù hợp</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

      {/* Import Dialog */}
      <ComboImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onCompleted={() => {
          // Refresh list after successful import and close dialog
          setImportDialogOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
