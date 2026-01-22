import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Upload,
  X,
  Edit2,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Filter,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ExportExcelDialog } from "../ExportExcelDialog";
import { Download } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { StockCheckImportDialog } from "../StockCheckImportDialog";
import { useAuth } from "../../contexts/AuthContext";
import { inventoryService } from "../../services/inventoryService";
import { toast } from "sonner";
import { StockItem, StockSession, NewCheckRow, SortField, SortOrder } from "../../types/stockCheck";

// Mock categories will be replaced by API data
const initialCategories = [
  { id: "all", name: "Tất cả", count: 0 },
];

// Mock sessions removed, replaced with API data

// Available items will be fetched from API

export function StockCheck() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<StockSession[]>([]);
  const [sessionItems, setSessionItems] = useState<Record<string, StockItem[]>>({});
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>(initialCategories);
  const [availableItems, setAvailableItems] = useState<Array<{
    id: string | number;
    code: string;
    name: string;
    category: string;
    unit: string;
    stock: number;
  }>>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "all",
  ]);
  const [onlyDifference, setOnlyDifference] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );
  const [selectedStatuses, setSelectedStatuses] = useState<
    Array<"draft" | "completed">
  >(["draft", "completed"]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newEmployee, setNewEmployee] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCheckRows, setNewCheckRows] = useState<NewCheckRow[]>([]);
  const [selectItemsDialogOpen, setSelectItemsDialogOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedItemCodes, setSelectedItemCodes] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch data in parallel
      const [sessionsData, categoriesData, itemsData] = await Promise.all([
        inventoryService.getStockChecks(),
        inventoryService.getCategories(),
        inventoryService.getItems(1, 1000)
      ]);

      const stockChecks = (sessionsData.metaData?.stockChecks || []).filter(
        (s: any) => s.status !== "cancelled"
      );
      const categoriesList = categoriesData.metaData?.categories || categoriesData.metaData || [];
      const itemsList = itemsData.metaData?.items || itemsData.items || itemsData || [];

      // Format sessions and sessions items
      const formattedSessions: StockSession[] = stockChecks.map((s: any) => ({
        id: s.id.toString(),
        code: s.code || `KK${s.id.toString().padStart(3, '0')}`,
        date: new Date(s.checkDate || s.createdAt || s.date).toLocaleString('vi-VN'),
        staff: s.staff?.fullName || s.staffName || `NV${s.staffId?.toString().padStart(3, '0')}`,
        status: s.status === 'in_progress' || s.status === 'draft' ? 'draft' : 'completed',
        note: s.notes || s.note || '',
      }));

      const sessionItemsMap: Record<string, StockItem[]> = {};
      stockChecks.forEach((s: any) => {
        const items = s.items || s.details || [];
        sessionItemsMap[s.id.toString()] = items.map((d: any) => ({
          code: d.itemCode || d.itemId?.toString() || d.item?.id?.toString() || '',
          name: d.itemName || d.item?.name || '',
          category: d.categoryName || d.item?.category?.name || '',
          unit: d.unitName || d.unit || d.item?.unit?.name || '',
          systemQty: d.systemQuantity || d.systemQty || 0,
          realQty: d.actualQuantity || d.realQty || 0,
          note: d.notes || d.note || '',
        }));
      });

      // Format categories
      const formattedCategories = [
        { id: "all", name: "Tất cả", count: itemsData.metaData?.total || itemsData.totalCount || itemsList.length || 0 },
        ...categoriesList.map((cat: any) => ({
          id: cat.id.toString(),
          name: cat.name,
          count: cat.itemCount || 0
        }))
      ];

      // Format available items
      const formattedItems = itemsList.map((item: any) => ({
        id: item.id || item._id,
        code: item.code || item.id?.toString() || '',
        name: item.name,
        category: item.category?.id?.toString() || item.categoryId?.toString() || '',
        unit: item.unit?.name || item.unit || '',
        stock: item.currentStock || 0
      }));

      setSessions(formattedSessions);
      setSessionItems(sessionItemsMap);
      setCategories(formattedCategories);
      setAvailableItems(formattedItems);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu kiểm kho");
    } finally {
      setLoading(false);
    }
  };

  // Ẩn nút X mặc định của DialogContent
  useEffect(() => {
    if (selectItemsDialogOpen) {
      // Tìm nút X mặc định sau khi dialog render
      const timer = setTimeout(() => {
        // Tìm tất cả dialog content đang mở
        const dialogContents = document.querySelectorAll(
          '[data-slot="dialog-content"]'
        );
        dialogContents.forEach((dialogContent) => {
          // Tìm button có class absolute và top-4 right-4 (nút X mặc định)
          const buttons = dialogContent.querySelectorAll("button");
          buttons.forEach((btn) => {
            const classes = btn.className;
            if (
              classes.includes("absolute") &&
              classes.includes("top-4") &&
              classes.includes("right-4")
            ) {
              (btn as HTMLElement).style.display = "none";
              (btn as HTMLElement).style.visibility = "hidden";
              (btn as HTMLElement).style.opacity = "0";
              (btn as HTMLElement).style.pointerEvents = "none";
            }
          });
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectItemsDialogOpen]);

  // Auto-select all items when dialog opens
  useEffect(() => {
    if (selectItemsDialogOpen) {
      const allCodes = availableItems.map((item) => item.code);
      setSelectedItemCodes((prev) => [...new Set([...prev, ...allCodes])]);
    }
  }, [selectItemsDialogOpen]);

  const toggleStatus = (status: "draft" | "completed") => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleCategory = (id: string) => {
    if (id === "all") {
      setSelectedCategories(["all"]);
      return;
    }
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((x) => x !== id)
      : [...selectedCategories.filter((x) => x !== "all"), id];
    setSelectedCategories(next.length === 0 ? ["all"] : next);
  };

  // Dùng toàn bộ danh sách item của tất cả phiếu để tính thống kê
  const allItems: StockItem[] = Object.values(sessionItems).flat();

  let filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.includes("all") ||
      selectedCategories.includes(item.category);
    const diff = item.realQty - item.systemQty;
    const matchesDiff = !onlyDifference || diff !== 0;
    return matchesSearch && matchesCategory && matchesDiff;
  });

  const diffCount = filteredItems.filter(
    (x) => x.realQty !== x.systemQty
  ).length;

  const completedCount = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const draftCount = sessions.filter((s) => s.status === "draft").length;

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

  let filteredSessions = sessions.filter((session) => {
    const matchesStatus = selectedStatuses.includes(session.status);
    const matchesSearch =
      session.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredSessions = [...filteredSessions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "code") {
        aValue = a.code;
        bValue = b.code;
      } else if (sortField === "date") {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortField === "staff") {
        aValue = a.staff;
        bValue = b.staff;
      } else if (sortField === "status") {
        const statusOrder = { draft: 0, completed: 1 };
        aValue = statusOrder[a.status] ?? 0;
        bValue = statusOrder[b.status] ?? 0;
      } else if (sortField === "note") {
        aValue = a.note;
        bValue = b.note;
      } else {
        // For totalItems, matched, diffItems - need to calculate from sessionItems
        const aItems = sessionItems[a.id] || [];
        const bItems = sessionItems[b.id] || [];
        const aTotal = aItems.length;
        const bTotal = bItems.length;
        const aMatched = aItems.filter((it) => it.realQty === it.systemQty).length;
        const bMatched = bItems.filter((it) => it.realQty === it.systemQty).length;
        const aDiff = aTotal - aMatched;
        const bDiff = bTotal - bMatched;

        if (sortField === "totalItems") {
          aValue = aTotal;
          bValue = bTotal;
        } else if (sortField === "matched") {
          aValue = aMatched;
          bValue = bMatched;
        } else if (sortField === "diffItems") {
          aValue = aDiff;
          bValue = bDiff;
        }
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

  const handleQuickFilterStatus = (status: "completed" | "draft") => {
    setSelectedStatuses([status]);
  };

  const handleChangeRow = (
    index: number,
    field: keyof NewCheckRow,
    value: string
  ) => {
    setNewCheckRows((rows) =>
      rows.map((row, i) =>
        i === index
          ? {
            ...row,
            [field]:
              field === "systemQty" || field === "realQty"
                ? Number(value) || 0
                : value,
          }
          : row
      )
    );
  };

  const handleAddRow = () => {
    setNewCheckRows((rows) => [
      ...rows,
      {
        id: Date.now(), // Fallback ID for manually added rows
        code: "NL" + String(rows.length + 1).padStart(3, "0"),
        name: "",
        lot: "LOT" + String(rows.length + 1).padStart(3, "0"),
        unit: "kg",
        systemQty: 0,
        realQty: 0,
        note: "",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setNewCheckRows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleOpenCreateDialog = () => {
    const nextIndex = sessions.length + 1;
    const code = `PKK${String(nextIndex).padStart(3, "0")}`;
    const employeeLabel = user
      ? `NV${user.id.padStart(3, "0")} - ${user.fullName}`
      : "";

    setNewCode(code);
    setNewEmployee(employeeLabel);
    setNewDate("");
    setNewNote("");
    setNewCheckRows([]);
    setCreateDialogOpen(true);
  };

  const handleCompleteSession = async (id: string) => {
    try {
      await inventoryService.completeStockCheck(id);
      toast.success("Đã hoàn thành phiếu kiểm kho");
      fetchData();
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Không thể hoàn thành phiếu kiểm kho");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu kiểm kho này không?")) return;
    try {
      await inventoryService.cancelStockCheck(id);
      toast.success("Đã xóa phiếu kiểm kho");
      fetchData();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Không thể xóa phiếu kiểm kho");
    }
  };

  const toggleAvailableItem = (code: string) => {
    setSelectedItemCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Get filtered available items for the select dialog
  const getFilteredAvailableItems = () => {
    return availableItems.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.name.toLowerCase().includes(itemSearch.toLowerCase());
      const matchesCat =
        selectedCategoryFilter === "all" ||
        selectedCategoryFilter === item.category;
      return matchesSearch && matchesCat;
    });
  };

  const filteredAvailableItems = getFilteredAvailableItems();
  const allAvailableItemsSelected =
    filteredAvailableItems.length > 0 &&
    filteredAvailableItems.every((item) =>
      selectedItemCodes.includes(item.code)
    );

  const handleSelectAllAvailableItems = (checked: boolean) => {
    if (checked) {
      const allCodes = filteredAvailableItems.map((item) => item.code);
      setSelectedItemCodes((prev) => [...new Set([...prev, ...allCodes])]);
    } else {
      const allCodes = filteredAvailableItems.map((item) => item.code);
      setSelectedItemCodes((prev) =>
        prev.filter((code) => !allCodes.includes(code))
      );
    }
  };

  const handleAddSelectedItems = () => {
    const itemsToAdd = availableItems.filter((item) =>
      selectedItemCodes.includes(item.code)
    );
    setNewCheckRows((rows) => {
      // Avoid duplicates
      const existingCodes = rows.map(r => r.code);
      const uniqueItemsToAdd = itemsToAdd.filter(item => !existingCodes.includes(item.code));

      return [
        ...rows,
        ...uniqueItemsToAdd.map((item) => ({
          id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
          code: item.code,
          name: item.name,
          lot: "LOT001",
          unit: item.unit,
          systemQty: item.stock,
          realQty: item.stock,
          note: "",
        })),
      ];
    });
    setSelectItemsDialogOpen(false);
    setSelectedItemCodes([]);
    setItemSearch("");
    setSelectedCategoryFilter("all");
  };

  const handleSaveStockCheck = async (status: 'draft' | 'completed') => {
    if (newCheckRows.length === 0) {
      toast.error("Vui lòng thêm ít nhất một hàng hóa để kiểm kê");
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        checkDate: newDate ? newDate.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: newNote || "",
        items: newCheckRows.map(row => ({
          itemId: Number(row.id),
          actualQuantity: parseFloat(row.realQty.toString()) || 0,
          unit: row.unit || "-",
          notes: row.note || ""
        }))
      };

      console.log(data);
      const result = await inventoryService.createStockCheck(data);
      console.log("Create result:", result);

      if (status === 'completed') {
        const id = result.metaData?.stockCheck?.id || result.metaData?.id || result.id;
        if (id) {
          console.log("Completing session for ID:", id);
          await inventoryService.completeStockCheck(id);
        } else {
          console.warn("Could not find ID in create response to perform complete action");
        }
      }

      toast.success(status === 'completed' ? "Hoàn thành phiếu kiểm kho thành công" : "Lưu nháp phiếu kiểm kho thành công");
      setCreateDialogOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error saving stock check:", error);
      toast.error("Không thể lưu phiếu kiểm kho");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectCategoryItems = (categoryId: string) => {
    // Get items based on current filter (search + category filter)
    const itemsToSelect = getFilteredAvailableItems().filter((item) => {
      if (categoryId === "all") {
        return true;
      }
      return item.category === categoryId;
    });

    const codesToSelect = itemsToSelect.map((item) => item.code);

    // Check if all items in this category are already selected
    const allSelected = codesToSelect.every((code) =>
      selectedItemCodes.includes(code)
    );

    if (allSelected) {
      // Deselect all items in this category
      setSelectedItemCodes((prev) =>
        prev.filter((code) => !codesToSelect.includes(code))
      );
    } else {
      // Select all items in this category
      setSelectedItemCodes((prev) => [...new Set([...prev, ...codesToSelect])]);
    }
  };

  // Cấu hình cột và dữ liệu xuất file
  const exportColumns = [
    { header: 'Mã hàng', accessor: (row: any) => row.code },
    { header: 'Tên hàng', accessor: (row: any) => row.name },
    { header: 'Đơn vị', accessor: (row: any) => row.unit },
    { header: 'Tồn hệ thống', accessor: (row: any) => row.systemQty },
    { header: 'Tồn thực tế', accessor: (row: any) => row.realQty },
    { header: 'Ghi chú', accessor: (row: any) => row.note },
  ];
  // Dùng dữ liệu của phiếu đầu tiên hoặc lọc theo session hiện tại để xuất
  const exportData = expandedSessionId ? (sessionItems[expandedSessionId] || []) : [];


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Kiểm kho</h1>
          <p className="text-slate-600 text-sm">
            Quản lý phiếu kiểm kho và đối chiếu tồn kho thực tế
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Nhập file
          </Button>
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất file
          </Button>
          <ExportExcelDialog
            open={exportDialogOpen}
            onOpenChange={setExportDialogOpen}
            data={exportData}
            columns={exportColumns}
            fileName="kiemkho.csv"
            title="Xuất danh sách kiểm kho"
          />
          <StockCheckImportDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
          />
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleOpenCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo phiếu kiểm kho
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
                          checked={selectedStatuses.includes("draft")}
                          onCheckedChange={() => toggleStatus("draft")}
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
                          checked={selectedStatuses.includes("completed")}
                          onCheckedChange={() => toggleStatus("completed")}
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
                        onClick={() => setSelectedStatuses(["draft", "completed"])}
                      >
                        <span>Tất cả</span>
                        <span className="text-slate-500">({sessions.length})</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs"
                        onClick={() => handleQuickFilterStatus("completed")}
                      >
                        <span>Hoàn thành</span>
                        <span className="text-slate-500">({completedCount})</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs"
                        onClick={() => handleQuickFilterStatus("draft")}
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

      {/* Stock check sessions table */}
      <Card className="border-blue-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="w-12 text-sm text-center"></TableHead>
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
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Ngày kiểm
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("staff")}
                  >
                    <div className="flex items-center">
                      Người kiểm
                      {getSortIcon("staff")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-28 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("totalItems")}
                  >
                    <div className="flex items-center justify-center">
                      Tổng mặt hàng
                      {getSortIcon("totalItems")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-20 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("matched")}
                  >
                    <div className="flex items-center justify-center">
                      Khớp
                      {getSortIcon("matched")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-24 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("diffItems")}
                  >
                    <div className="flex items-center justify-center">
                      Chênh lệch
                      {getSortIcon("diffItems")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-32 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Trạng thái
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("note")}
                  >
                    <div className="flex items-center">
                      Ghi chú
                      {getSortIcon("note")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session, index) => {
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

                  if (loading) return null; // Showing nothing while loading is not ideal, but we have the loading check below
                  return (
                    <React.Fragment key={session.id}>
                      <TableRow
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
                          {session.code}
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
                          <TableCell colSpan={10} className="p-0">
                            <div className="p-6 space-y-4">
                              {/* Header info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                  <p>
                                    <span className="font-medium text-slate-600">
                                      Mã phiếu kiểm:
                                    </span>{" "}
                                    <span className="text-slate-900">
                                      {session.code}
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

                              {/* Items table */}
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
                                            {item.category}
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
                                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 px-4"
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Xóa
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="bg-slate-700 text-black px-4"
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        // TODO: mở popup chỉnh sửa phiếu với dữ liệu hiện tại
                                        // handleOpenCreateDialog();
                                      }}
                                    >
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Chỉnh sửa
                                    </Button>
                                    <Button
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                                      onClick={(e: React.MouseEvent) => {
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
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog tạo phiếu kiểm kho mới */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent
          className="min-w-[1100px] max-w-[1400px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
          aria-describedby={undefined}
          onInteractOutside={(e: any) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e: any) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Tạo phiếu kiểm kho mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 px-1">
            {/* Thông tin chung */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã phiếu kiểm *</Label>
                <Input
                  value={newCode}
                  disabled
                  className="bg-slate-100 border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Mã NV *</Label>
                <Input
                  value={newEmployee}
                  disabled
                  className="bg-slate-100 border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kiểm kho *</Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDate(e.target.value)}
                    className="bg-white border-slate-300 shadow-none pr-10 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                      input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                        position: absolute;
                        right: 8px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                      }
                      input[type="datetime-local"]::-webkit-inner-spin-button {
                        position: absolute;
                        right: 8px;
                      }
                    `,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Input
                  placeholder="Nhập ghi chú"
                  value={newNote}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
                  className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
            </div>

            {/* Danh sách kiểm kê */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Danh sách kiểm kê</Label>
                <Button
                  type="button"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 gap-1"
                  onClick={() => setSelectItemsDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Thêm hàng hóa
                </Button>
              </div>

              <div className="border rounded-xl overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="w-24 text-sm">Mã hàng</TableHead>
                      <TableHead className="min-w-[180px] text-sm">
                        Tên hàng hóa
                      </TableHead>
                      <TableHead className="w-28 text-sm">Lô hàng</TableHead>
                      <TableHead className="w-20 text-sm">ĐVT</TableHead>
                      <TableHead className="w-28 text-right text-sm">
                        SL hệ thống
                      </TableHead>
                      <TableHead className="w-28 text-right text-sm">
                        SL thực tế
                      </TableHead>
                      <TableHead className="w-24 text-center text-sm">
                        Chênh lệch
                      </TableHead>
                      <TableHead className="min-w-[160px] text-sm">Ghi chú</TableHead>
                      <TableHead className="w-12 text-center text-sm">Xóa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newCheckRows.map((row, index) => {
                      const diff = row.realQty - row.systemQty;
                      const diffColor =
                        diff === 0
                          ? "text-slate-500"
                          : diff > 0
                            ? "text-emerald-600"
                            : "text-red-600";
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-sm">
                            <Input
                              value={row.code}
                              readOnly
                              className="h-8 border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                          </TableCell>
                          <TableCell className="text-sm">
                            <Input
                              placeholder="Tên hàng hóa"
                              value={row.name}
                              readOnly
                              className="h-8 border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                          </TableCell>
                          <TableCell className="text-sm">
                            <Input
                              value={row.lot}
                              readOnly
                              className="h-8 border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                          </TableCell>
                          <TableCell className="text-sm">
                            <Input
                              value={row.unit}
                              readOnly
                              className="h-8 border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            <Input
                              type="number"
                              value={row.systemQty}
                              readOnly
                              className="h-8 text-right border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            <Input
                              type="number"
                              value={row.realQty}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleChangeRow(
                                  index,
                                  "realQty",
                                  e.target.value
                                )
                              }
                              className="h-8 text-right bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                          </TableCell>
                          <TableCell
                            className={`text-sm text-center font-medium ${diffColor}`}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </TableCell>
                          <TableCell className="text-sm">
                            <Input
                              placeholder="Ghi chú"
                              value={row.note}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleChangeRow(index, "note", e.target.value)
                              }
                              className="h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-50"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {newCheckRows.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Chưa có hàng hóa nào. Nhấn &quot;Thêm hàng hóa&quot; để
                    bắt đầu.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 border-t pt-4 justify-between">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={newCheckRows.length === 0 || isSaving}
                onClick={() => handleSaveStockCheck('draft')}
              >
                {isSaving ? "Đang xử lý..." : "Lưu nháp"}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={newCheckRows.length === 0 || isSaving}
                onClick={() => handleSaveStockCheck('completed')}
              >
                {isSaving ? "Đang xử lý..." : "Hoàn thành"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chọn hàng hóa thêm vào danh sách kiểm kê */}
      <Dialog
        open={selectItemsDialogOpen}
        onOpenChange={setSelectItemsDialogOpen}
      >
        <DialogContent
          className="!min-w-[1100px] !max-w-[1400px] !w-[95vw] !h-[90vh] overflow-hidden flex flex-col p-0 sm:!max-w-[1400px] [&>button]:!hidden"
          style={{
            minWidth: "1100px",
            maxWidth: "1400px",
            width: "95vw",
            height: "90vh",
          }}
          aria-describedby={undefined}
          onInteractOutside={(e: any) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e: any) => {
            e.preventDefault();
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
              [data-slot="dialog-content"] button.absolute.top-4.right-4:not([data-custom-close]) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
              }
            `,
            }}
          />
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-medium text-slate-700">
              Thêm hàng hóa vào danh sách kiểm kê
            </h2>
            <button
              type="button"
              data-custom-close="true"
              className="text-slate-600 hover:text-slate-800 transition-colors"
              onClick={() => setSelectItemsDialogOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm hàng hóa..."
                  value={itemSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border-slate-300 rounded-lg text-sm shadow-none focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const isActive = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 text-sm border border-slate-200 rounded-lg transition-colors ${isActive
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Products Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="w-12 px-4 py-3 text-left text-xs font-medium text-slate-900 border-r border-white">
                        <Checkbox
                          checked={allAvailableItemsSelected}
                          onCheckedChange={(checked: any) =>
                            handleSelectAllAvailableItems(checked === true)
                          }
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        Mã hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        Tên hàng hóa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        Danh mục
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        ĐVT
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-900 whitespace-nowrap">
                        Tồn kho
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAvailableItems.length > 0 ? (
                      filteredAvailableItems.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="px-4 py-3 border-r border-slate-100">
                            <Checkbox
                              checked={selectedItemCodes.includes(item.code)}
                              onCheckedChange={() =>
                                toggleAvailableItem(item.code)
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap border-r border-slate-100">
                            {item.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap border-r border-slate-100">
                            {item.name}
                          </td>
                          <td
                            className="px-4 py-3 text-sm text-blue-600 cursor-pointer hover:text-blue-700 hover:underline whitespace-nowrap border-r border-slate-100"
                            onClick={() =>
                              handleSelectCategoryItems(item.category)
                            }
                          >
                            {categories.find((c) => c.id === item.category)
                              ?.name ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-center whitespace-nowrap border-r border-slate-100">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right whitespace-nowrap">
                            {item.stock.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          Không tìm thấy hàng hóa nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Hướng dẫn:</strong> Chọn checkbox của từng hàng hóa
                  hoặc click vào tên danh mục để chọn toàn bộ danh mục đó.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-600">
              Đã chọn:{" "}
              <span className="font-semibold">
                {selectedItemCodes.length}
              </span>{" "}
              hàng hóa
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => setSelectItemsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddSelectedItems}
                disabled={selectedItemCodes.length === 0}
              >
                Thêm vào danh sách
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <StockCheckImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}
