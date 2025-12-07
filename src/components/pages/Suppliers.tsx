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
  ArrowUpDown,
  Upload,
  Download,
  Printer,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { toast } from "sonner@2.0.3";
import { SupplierFormDialog } from "../SupplierFormDialog";

interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  debt: number;
  status: "active" | "inactive";
}

export function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "debt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Mock data
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      code: "NCC001",
      name: "Trung Nguyên",
      category: "Cà phê",
      contact: "Nguyễn Văn A",
      phone: "0281234567",
      email: "contact@trungnguyen.com",
      address: "Đường Hoàng Văn Thụ, Phường 15",
      city: "Hồ Chí Minh",
      debt: 15000000,
      status: "active",
    },
    {
      id: "2",
      code: "NCC002",
      name: "Vinamilk",
      category: "Sữa & Kem",
      contact: "Trần Thị B",
      phone: "0282345678",
      email: "sales@vinamilk.com",
      address: "Quận 1, Đường Nguyễn Huệ",
      city: "Hồ Chí Minh",
      debt: 8500000,
      status: "active",
    },
    {
      id: "3",
      code: "NCC003",
      name: "Phúc Long",
      category: "Trà",
      contact: "Lê Văn C",
      phone: "0283456789",
      email: "info@phuclong.com",
      address: "Quận 3, Đường Lý Chính Thắng",
      city: "Hồ Chí Minh",
      debt: 5200000,
      status: "active",
    },
    {
      id: "4",
      code: "NCC004",
      name: "Bao bì Minh Anh",
      category: "Bao bì",
      contact: "Phạm Thị D",
      phone: "0284567890",
      email: "sales@minhanh.com",
      address: "Quận Bình Thạnh, Đường Xô Viết Nghệ Tĩnh",
      city: "Hồ Chí Minh",
      debt: 0,
      status: "inactive",
    },
    {
      id: "5",
      code: "NCC005",
      name: "Highlands Coffee",
      category: "Cà phê",
      contact: "Hoàng Văn E",
      phone: "0285678901",
      email: "supplier@highlands.com.vn",
      address: "Quận Hoàn Kiếm, Đường Tràng Tiền",
      city: "Hà Nội",
      debt: 12000000,
      status: "active",
    },
  ]);

  const categories = Array.from(new Set(suppliers.map((s) => s.category)));
  const cities = Array.from(new Set(suppliers.map((s) => s.city)));

  let filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery) ||
      supplier.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || supplier.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || supplier.status === selectedStatus;
    const matchesCity =
      selectedCity === "all" || supplier.city === selectedCity;
    return matchesSearch && matchesCategory && matchesStatus && matchesCity;
  });

  // Apply sorting
  if (sortBy && sortOrder !== "none") {
    filteredSuppliers = [...filteredSuppliers].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      if (sortBy === "name") {
        aValue = a.name;
        bValue = b.name;
      } else if (sortBy === "debt") {
        aValue = a.debt;
        bValue = b.debt;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue, "vi")
          : bValue.localeCompare(aValue, "vi");
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }

  const handleSort = (column: "name" | "debt") => {
    if (sortBy === column) {
      // Cycle through: asc -> desc -> none -> asc
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortBy(null);
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: "name" | "debt") => {
    if (sortBy !== column || sortOrder === "none") return null;
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  const handleAddSupplier = (formData: Omit<Supplier, "id" | "code">) => {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      code: `NCC${String(suppliers.length + 1).padStart(3, "0")}`,
      ...formData,
    };
    setSuppliers([...suppliers, newSupplier]);
    setDialogOpen(false);
    toast.success("Đã thêm nhà cung cấp mới");
  };

  const handleEditSupplier = (formData: Omit<Supplier, "id" | "code">) => {
    if (!editingSupplier) return;
    setSuppliers(
      suppliers.map((s) =>
        s.id === editingSupplier.id ? { ...s, ...formData } : s
      )
    );
    setEditingSupplier(null);
    setDialogOpen(false);
    toast.success("Đã cập nhật nhà cung cấp");
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      toast.success("Đã xóa nhà cung cấp");
    }
  };

  const handleToggleStatus = (id: string) => {
    setSuppliers(
      suppliers.map((supplier) => {
        if (supplier.id === id) {
          const newStatus =
            supplier.status === "active" ? "inactive" : "active";
          toast.success(
            newStatus === "active"
              ? "Đã kích hoạt nhà cung cấp"
              : "Đã vô hiệu hóa nhà cung cấp"
          );
          return { ...supplier, status: newStatus };
        }
        return supplier;
      })
    );
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const inactiveSuppliers = suppliers.filter(
    (s) => s.status === "inactive"
  ).length;
  const totalDebt = suppliers.reduce((sum, s) => sum + s.debt, 0);

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <div className="w-64 bg-white border-r p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-600">Danh mục</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="mt-1 bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600">
                  Tỉnh / Thành phố
                </Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thành phố</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600">Trạng thái</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="mt-1 bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm text-slate-700 mb-3">Thống kê</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng nhà cung cấp</span>
                <span className="text-slate-900">{totalSuppliers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Đang hoạt động</span>
                <span className="text-emerald-600">{activeSuppliers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Không hoạt động</span>
                <span className="text-gray-600">{inactiveSuppliers}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-slate-600">Tổng công nợ</span>
                <span className="text-red-600">
                  {formatCurrency(totalDebt)}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedCity("all");
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-slate-900 mb-2">Nhà cung cấp</h1>
              <p className="text-slate-600 text-sm">
                Quản lý thông tin nhà cung cấp
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  toast.success("Chức năng import đang phát triển")
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.success("Chức năng export đang phát triển")
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Chức năng in đang phát triển");
                  window.print();
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                In danh sách
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setEditingSupplier(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm nhà cung cấp
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mã, số điện thoại..."
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
                Danh sách nhà cung cấp ({filteredSuppliers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-sm">Mã NCC</TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Tên NCC
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead className="text-sm">Danh mục</TableHead>
                      <TableHead className="text-sm">Địa chỉ</TableHead>
                      <TableHead className="text-sm">Liên hệ</TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("debt")}
                      >
                        <div className="flex items-center">
                          Công nợ
                          {getSortIcon("debt")}
                        </div>
                      </TableHead>
                      <TableHead className="text-sm">Trạng thái</TableHead>
                      <TableHead className="text-sm text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-slate-500"
                      >
                        Không tìm thấy nhà cung cấp nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="text-sm text-slate-900">
                          {supplier.code}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {supplier.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          <Badge variant="outline" className="bg-slate-50">
                            {supplier.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          <div className="flex flex-col gap-0.5">
                            <span>{supplier.city}</span>
                            <span className="text-xs text-slate-500">
                              {supplier.address}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          <div className="flex flex-col gap-0.5">
                            <span>{supplier.contact}</span>
                            <span className="text-xs text-slate-500">
                              {supplier.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          <span
                            className={
                              supplier.debt > 0
                                ? "text-red-600"
                                : "text-slate-600"
                            }
                          >
                            {formatCurrency(supplier.debt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge
                            variant={
                              supplier.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              supplier.status === "active"
                                ? "bg-emerald-500"
                                : "bg-red-500 text-white hover:bg-red-500"
                            }
                          >
                            {supplier.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(supplier)}
                              className="hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(supplier.id)}
                              className={
                                supplier.status === "active"
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              }
                              title={
                                supplier.status === "active"
                                  ? "Vô hiệu hóa"
                                  : "Kích hoạt"
                              }
                            >
                              {supplier.status === "active" ? (
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

      {/* Form Dialog */}
      <SupplierFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSupplier(null);
        }}
        onSubmit={editingSupplier ? handleEditSupplier : handleAddSupplier}
        editingSupplier={editingSupplier}
      />
    </div>
  );
}
