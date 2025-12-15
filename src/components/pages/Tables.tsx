import { useState } from "react";
import * as React from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { toast } from "sonner";

interface TableItem {
  id: string;
  name: string;
  area: string;
  seats: number;
  status: "active" | "inactive";
}

interface Area {
  id: string;
  name: string;
}

export function Tables() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "area" | "seats" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickAreaDialogOpen, setQuickAreaDialogOpen] = useState(false);
  const [editAreaDialogOpen, setEditAreaDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [editAreaName, setEditAreaName] = useState("");

  // Mock data
  const [tables, setTables] = useState<TableItem[]>([
    { id: "1", name: "Bàn 1", area: "tang1", seats: 2, status: "active" },
    { id: "2", name: "Bàn 2", area: "tang1", seats: 2, status: "active" },
    { id: "3", name: "Bàn 3", area: "tang1", seats: 4, status: "active" },
    { id: "4", name: "Bàn 4", area: "tang1", seats: 4, status: "inactive" },
    { id: "5", name: "Bàn 5", area: "tang2", seats: 6, status: "active" },
    { id: "6", name: "Bàn 6", area: "tang2", seats: 4, status: "active" },
    { id: "7", name: "Bàn 7", area: "tang2", seats: 2, status: "active" },
    { id: "8", name: "Bàn VIP 1", area: "vip", seats: 8, status: "active" },
    { id: "9", name: "Bàn VIP 2", area: "vip", seats: 10, status: "active" },
    {
      id: "10",
      name: "Bàn sân thượng 1",
      area: "rooftop",
      seats: 4,
      status: "active",
    },
  ]);

  const [areas, setAreas] = useState<Area[]>([
    { id: "tang1", name: "Tầng 1" },
    { id: "tang2", name: "Tầng 2" },
    { id: "vip", name: "Phòng VIP" },
    { id: "rooftop", name: "Sân thượng" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    seats: "",
  });

  const [newAreaName, setNewAreaName] = useState("");

  // Filtering and sorting
  const filteredTables = tables
    .filter((table) => {
      const matchesSearch = table.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesArea = selectedArea === "all" || table.area === selectedArea;
      const matchesStatus =
        selectedStatus === "all" || table.status === selectedStatus;
      return matchesSearch && matchesArea && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === null || sortOrder === "none") return 0;
      
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "vi");
      } else if (sortBy === "area") {
        const areaA = areas.find((area) => area.id === a.area)?.name || "";
        const areaB = areas.find((area) => area.id === b.area)?.name || "";
        comparison = areaA.localeCompare(areaB, "vi");
      } else if (sortBy === "seats") {
        comparison = a.seats - b.seats;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (field: "name" | "area" | "seats") => {
    if (sortBy === field) {
      // Cycle through: asc -> desc -> none -> asc
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortBy(null);
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: "name" | "area" | "seats") => {
    if (sortBy !== field) return null;
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 inline-block ml-1" />;
    } else if (sortOrder === "desc") {
      return <ArrowDown className="w-4 h-4 inline-block ml-1" />;
    }
    return null;
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.area || !formData.seats) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (editingTable) {
      // Update existing table
      setTables(
        tables.map((table) =>
          table.id === editingTable.id
            ? { ...table, ...formData, seats: parseInt(formData.seats) }
            : table
        )
      );
      toast.success("Cập nhật bàn thành công");
    } else {
      // Add new table
      const newTable: TableItem = {
        id: Date.now().toString(),
        name: formData.name,
        area: formData.area,
        seats: parseInt(formData.seats),
        status: "active",
      };
      setTables([...tables, newTable]);
      toast.success("Thêm bàn mới thành công");
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (table: TableItem) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      area: table.area,
      seats: table.seats.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bàn này?")) {
      setTables(tables.filter((table) => table.id !== id));
      toast.success("Xóa bàn thành công");
    }
  };

  const handleToggleStatus = (id: string) => {
    setTables(
      tables.map((table) => {
        if (table.id === id) {
          const newStatus = table.status === "active" ? "inactive" : "active";
          toast.success(
            newStatus === "active"
              ? "Đã kích hoạt bàn"
              : "Đã ngừng hoạt động bàn"
          );
          return { ...table, status: newStatus };
        }
        return table;
      })
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      area: "",
      seats: "",
    });
    setEditingTable(null);
  };

  const handleAddArea = () => {
    if (!newAreaName.trim()) {
      toast.error("Vui lòng nhập tên khu vực");
      return;
    }

    const newArea: Area = {
      id: Date.now().toString(),
      name: newAreaName,
    };
    setAreas([...areas, newArea]);
    toast.success("Thêm khu vực mới thành công");
    setNewAreaName("");
    setQuickAreaDialogOpen(false);
  };

  const getStatusBadge = (status: "active" | "inactive") => {
    if (status === "active") {
      return <Badge className="bg-emerald-500">Hoạt động</Badge>;
    }
    return <Badge className="bg-red-500">Không hoạt động</Badge>;
  };

  const totalTables = tables.length;
  const activeTables = tables.filter((t) => t.status === "active").length;
  const inactiveTables = tables.filter((t) => t.status === "inactive").length;

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <div className="w-64 bg-white border-r p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả khu vực</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
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
                        const area = areas.find((a) => a.id === selectedArea);
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

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">
                  Trạng thái
                </Label>
                <RadioGroup
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="all"
                      id="status-all"
                      className="border-slate-300"
                    />
                    <Label
                      htmlFor="status-all"
                      className="text-l text-slate-700 cursor-pointer font-normal"
                    >
                      Tất cả trạng thái
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="active"
                      id="status-active"
                      className="border-slate-300"
                    />
                    <Label
                      htmlFor="status-active"
                      className="text-l text-slate-700 cursor-pointer font-normal"
                    >
                      Hoạt động
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="inactive"
                      id="status-inactive"
                      className="border-slate-300"
                    />
                    <Label
                      htmlFor="status-inactive"
                      className="text-l text-slate-700 cursor-pointer font-normal"
                    >
                      Không hoạt động
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm text-slate-700 mb-3">Thống kê</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng số bàn</span>
                <span className="text-slate-900">{totalTables}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Bàn hoạt động</span>
                <span className="text-emerald-600">{activeTables}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Không hoạt động</span>
                <span className="text-red-600">{inactiveTables}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-blue-900 mb-1">Quản lý phòng bàn</h1>
              <p className="text-sm text-slate-600">
                Quản lý bàn và khu vực trong quán
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm bàn mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTable ? "Chỉnh sửa bàn" : "Thêm bàn mới"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-1 block">Tên bàn</Label>
                      <Input
                        placeholder="VD: Bàn 1, Bàn VIP A..."
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                      />
                    </div>

                    <div>
                      <Label className="mb-1 block">Khu vực</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.area}
                          onValueChange={(value) =>
                            setFormData({ ...formData, area: value })
                          }
                        >
                          <SelectTrigger className="bg-white border-slate-300 shadow-none">
                            <SelectValue placeholder="Chọn khu vực" />
                          </SelectTrigger>
                          <SelectContent>
                            {areas.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Dialog>
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
                                <Label className="mb-1 block">
                                  Tên khu vực
                                </Label>
                                <Input
                                  placeholder="VD: Tầng 3, Sân vườn..."
                                  value={newAreaName}
                                  onChange={(e) =>
                                    setNewAreaName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddArea();
                                    }
                                  }}
                                  className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
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
                      <Label className="mb-1 block">Số ghế</Label>
                      <Input
                        type="number"
                        placeholder="VD: 4"
                        value={formData.seats}
                        onChange={(e) =>
                          setFormData({ ...formData, seats: e.target.value })
                        }
                        min="1"
                        className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Danh sách bàn ({filteredTables.length})
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
                    {filteredTables.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-slate-500"
                        >
                          Không tìm thấy bàn nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTables.map((table, index) => (
                        <TableRow key={table.id}>
                          <TableCell className="text-sm text-slate-600 text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-sm text-slate-900">
                            {table.name}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {areas.find((a) => a.id === table.area)?.name ||
                              table.area}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {table.seats} chỗ
                          </TableCell>
                          <TableCell className="text-sm">{getStatusBadge(table.status)}</TableCell>
                          <TableCell className="text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(table)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(table.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(table.id)}
                                className={
                                  table.status === "active"
                                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                }
                              >
                                {table.status === "active" ? (
                                  <PowerOff className="w-4 h-4" />
                                ) : (
                                  <Power className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Area Dialog */}
      <Dialog
        open={editAreaDialogOpen}
        onOpenChange={(open) => {
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
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  editingArea &&
                  confirm("Bạn có chắc chắn muốn xóa khu vực này?")
                ) {
                  // Check if any tables are using this area
                  const tablesUsingArea = tables.filter(
                    (t) => t.area === editingArea.id
                  );
                  if (tablesUsingArea.length > 0) {
                    toast.error(
                      `Không thể xóa khu vực này vì có ${tablesUsingArea.length} bàn đang sử dụng`
                    );
                    return;
                  }
                  setAreas(areas.filter((a) => a.id !== editingArea.id));
                  if (selectedArea === editingArea.id) {
                    setSelectedArea("all");
                  }
                  toast.success("Đã xóa khu vực");
                  setEditAreaDialogOpen(false);
                  setEditingArea(null);
                  setEditAreaName("");
                }
              }}
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
              onClick={() => {
                if (!editAreaName.trim()) {
                  toast.error("Vui lòng nhập tên khu vực");
                  return;
                }
                setAreas(
                  areas.map((a) =>
                    a.id === editingArea?.id ? { ...a, name: editAreaName } : a
                  )
                );
                toast.success("Đã cập nhật khu vực");
                setEditAreaDialogOpen(false);
                setEditingArea(null);
                setEditAreaName("");
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Area Dialog */}
      <Dialog
        open={quickAreaDialogOpen}
        onOpenChange={(open) => {
          setQuickAreaDialogOpen(open);
          if (!open) {
            setNewAreaName("");
          }
        }}
      >
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
                  if (e.key === "Enter") {
                    handleAddArea();
                  }
                }}
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuickAreaDialogOpen(false)}
            >
              Hủy
            </Button>
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
  );
}
