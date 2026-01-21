import { useState, useEffect } from "react";
import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Filter,
  X,
  Power,
  PowerOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  Table,
} from "../../api/table";
import {
  getAreas,
  createArea,
  updateArea,
  deleteArea,
  Area,
} from "../../api/area";
import { useDebounce } from "../../hooks/use-debounce";

export function Tables() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("tables:create");
  const canUpdate = hasPermission("tables:update");
  const canDelete = hasPermission("tables:delete");

  // State
  const [tables, setTables] = useState<Table[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Sorting
  const [sortBy, setSortBy] = useState<"name" | "area" | "seats" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickAreaDialogOpen, setQuickAreaDialogOpen] = useState(false);
  const [editAreaDialogOpen, setEditAreaDialogOpen] = useState(false);
  
  // Form Data
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    seats: "",
  });

  // Area Form Data
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [editAreaName, setEditAreaName] = useState("");
  const [newAreaName, setNewAreaName] = useState("");

  // Statistics
  const totalTables = tables.length;
  const activeTables = tables.filter((t) => t.isActive).length;
  const inactiveTables = tables.filter((t) => !t.isActive).length;

  // Fetch Data
  const fetchAreas = async () => {
    try {
      // Fetch all areas (limit 100 for now, simpler than pagination for dropdown)
      const res = await getAreas({ limit: 100 });
      setAreas(res?.metaData.items || []);
    } catch (error) {
      console.error("Failed to fetch areas", error);
      setAreas([]);
    }
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await getTables({
        limit: 100, // Fetch all for now to handle client-side sorting/filtering if needed, or implement server-side
        q: debouncedSearch || undefined,
        areaId: selectedArea !== "all" ? Number(selectedArea) : undefined,
        isActive: selectedStatus !== "all" ? selectedStatus === "active" : undefined,
      });
      setTables(res?.metaData.items || []);
    } catch (error) {
      console.error("Failed to fetch tables", error);
      toast.error("Không thể tải danh sách bàn");
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    fetchTables();
  }, [debouncedSearch, selectedArea, selectedStatus]);

  // Client-side sorting (since API might not support all custom sorts or for current simplified view)
  // Note: If dataset grows, move specific sorts to API
  const sortedTables = [...tables].sort((a, b) => {
    if (sortBy === null || sortOrder === "none") return 0;

    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.tableName.localeCompare(b.tableName, "vi");
    } else if (sortBy === "area") {
      const areaA = a.areaName || "";
      const areaB = b.areaName || "";
      comparison = areaA.localeCompare(areaB, "vi");
    } else if (sortBy === "seats") {
      comparison = a.capacity - b.capacity;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: "name" | "area" | "seats") => {
    if (sortBy === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortBy(null);
      } else setSortOrder("asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: "name" | "area" | "seats") => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // Table Handlers
  const handleSubmit = async () => {
    if (!formData.name || !formData.area || !formData.seats) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const payload = {
        tableName: formData.name,
        areaId: Number(formData.area),
        capacity: Number(formData.seats),
      };

      if (editingTable) {
        await updateTable(editingTable.id, payload);
        toast.success("Cập nhật bàn thành công");
      } else {
        await createTable(payload);
        toast.success("Thêm bàn mới thành công");
      }

      setDialogOpen(false);
      resetForm();
      fetchTables();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bàn này?")) {
      try {
        await deleteTable(id);
        toast.success("Xóa bàn thành công");
        fetchTables();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Không thể xóa bàn");
      }
    }
  };

  const handleToggleStatus = async (table: Table) => {
    try {
      const newStatus = !table.isActive;
      await updateTable(table.id, { isActive: newStatus });
      toast.success(
        newStatus ? "Đã kích hoạt bàn" : "Đã ngừng hoạt động bàn"
      );
      fetchTables(); // Refresh to ensure sync
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      area: "",
      seats: "",
    });
    setEditingTable(null);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      name: table.tableName,
      area: table.areaId.toString(),
      seats: table.capacity.toString(),
    });
    setDialogOpen(true);
  };

  // Area Handlers
  const handleAddArea = async () => {
    if (!newAreaName.trim()) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }

    try {
      await createArea({ name: newAreaName });
      toast.success("Thêm khu vực mới thành công");
      setNewAreaName("");
      setQuickAreaDialogOpen(false);
      fetchAreas();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể thêm khu vực");
    }
  };

  const handleUpdateArea = async () => {
    if (!editingArea || !editAreaName.trim()) return;
    try {
      await updateArea(editingArea.id, { name: editAreaName });
      toast.success("Đã cập nhật khu vực");
      setEditAreaDialogOpen(false);
      setEditingArea(null);
      setEditAreaName("");
      fetchAreas();
      fetchTables(); // Names might have changed
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật khu vực");
    }
  };

  const handleDeleteArea = async () => {
    if (!editingArea) return;
    if (!confirm("Bạn có chắc chắn muốn xóa khu vực này?")) return;
    
    try {
      await deleteArea(editingArea.id);
      toast.success("Đã xóa khu vực");
      setEditAreaDialogOpen(false);
      setEditingArea(null);
      if (selectedArea === editingArea.id.toString()) {
        setSelectedArea("all");
      }
      fetchAreas();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xóa khu vực này (có thể đang có bàn)");
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-emerald-500">Hoạt động</Badge>;
    }
    return <Badge className="bg-red-500">Không hoạt động</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Quản lý phòng bàn</h1>
          <p className="text-slate-600 text-sm">
            Quản lý bàn và khu vực trong quán
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={dialogOpen}
            onOpenChange={(open: boolean) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              {canCreate && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bàn mới
                </Button>
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTable ? "Chỉnh sửa bàn" : "Thêm bàn mới"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="mb-1.5">Tên bàn <Label className="text-red-600">*</Label></Label>
                  <Input
                    placeholder="VD: Bàn 1, Bàn VIP A..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white border-slate-300 shadow-none"
                  />
                </div>

                <div>
                  <Label className="mb-1.5">Khu vực <Label className="text-red-600">*</Label></Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.area}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, area: value })
                      }
                    >
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue placeholder="Chọn khu vực" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(areas) && areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={quickAreaDialogOpen} onOpenChange={setQuickAreaDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Thêm khu vực mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="mb-1 block">Tên khu vực</Label>
                            <Input
                              placeholder="VD: Tầng 3, Sân vườn..."
                              value={newAreaName}
                              onChange={(e) => setNewAreaName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddArea();
                              }}
                              className="bg-white border-slate-300 shadow-none"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleAddArea}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Thêm khu vực
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5">Số ghế <Label className="text-red-600">*</Label></Label>
                  <Input
                    type="number"
                    placeholder="VD: 4"
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: e.target.value })
                    }
                    min="1"
                    className="bg-white border-slate-300 shadow-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingTable ? "Cập nhật" : "Thêm bàn"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  placeholder="Tìm kiếm bàn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 shadow-none"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {(selectedArea !== "all" || selectedStatus !== "all") && (
                  <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {(selectedArea !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Area Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-600">Khu vực</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          setNewAreaName("");
                          setQuickAreaDialogOpen(true);
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger className="flex-1 bg-white border-slate-300 shadow-none">
                          <SelectValue placeholder="Tất cả khu vực" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả khu vực</SelectItem>
                          {Array.isArray(areas) && areas.map((area) => (
                            <SelectItem key={area.id} value={area.id.toString()}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedArea !== "all" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => {
                            const area = areas.find((a) => a.id.toString() === selectedArea);
                            if (area) {
                              setEditingArea(area);
                              setEditAreaName(area.name);
                              setEditAreaDialogOpen(true);
                            }
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Trạng thái</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Không hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Thống kê</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tổng số bàn:</span>
                        <span className="font-medium text-slate-900">{totalTables}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Hoạt động:</span>
                        <span className="font-medium text-emerald-600">{activeTables}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Không HĐ:</span>
                        <span className="font-medium text-red-600">{inactiveTables}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedArea("all");
                      setSelectedStatus("all");
                      setSearchQuery("");
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
            Danh sách bàn ({sortedTables.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <UITable>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-16 text-sm text-center">STT</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Tên bàn
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("area")}
                  >
                    <div className="flex items-center">
                      Khu vực
                      {getSortIcon("area")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("seats")}
                  >
                    <div className="flex items-center">
                      Số ghế
                      {getSortIcon("seats")}
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">Trạng thái</TableHead>
                  <TableHead className="text-sm text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                   <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                     Đang tải dữ liệu...
                   </TableCell>
                 </TableRow>
                ) : sortedTables.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      Không tìm thấy bàn nào
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTables.map((table, index) => (
                    <TableRow key={table.id}>
                      <TableCell className="text-sm text-slate-600 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {table.tableName}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {table.areaName || "---"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {table.capacity} chỗ
                      </TableCell>
                      <TableCell className="text-sm">{getStatusBadge(table.isActive)}</TableCell>
                      <TableCell className="text-sm text-right">
                        <div className="flex justify-end gap-2">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(table)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(table.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(table)}
                              className={
                                table.isActive
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              }
                            >
                              {table.isActive ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </UITable>
          </div>
        </CardContent>
      </Card>

      {/* Edit Area Dialog */}
      <Dialog
        open={editAreaDialogOpen}
        onOpenChange={(open: boolean) => {
          setEditAreaDialogOpen(open);
          if (!open) {
            setEditingArea(null);
            setEditAreaName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khu vực</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1 block">Tên khu vực</Label>
              <Input
                placeholder="VD: Tầng 3, Sân vườn..."
                value={editAreaName}
                onChange={(e) => setEditAreaName(e.target.value)}
                className="bg-white border-slate-300 shadow-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteArea}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditAreaDialogOpen(false);
                setEditingArea(null);
                setEditAreaName("");
              }}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleUpdateArea}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

