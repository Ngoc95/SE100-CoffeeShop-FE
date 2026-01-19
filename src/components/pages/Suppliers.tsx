import { useState, useEffect } from "react";
import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Search, Pencil, Trash2, Filter, X, Power, PowerOff, ArrowUpDown, Upload, Download, Printer, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { SupplierFormDialog } from "../SupplierFormDialog";
import { cities } from "./Customers";
import { getSuppliers } from "../../api/supplier";

interface Supplier {
  id: 1,
  code: "NCC001",
  name: "Trung Nguyên",
  contactPerson: "Nguyễn Văn A",
  phone: "0281234567",
  email: "contact@trungnguyen.com",
  address: "123 Nguyễn Huệ",
  city: "Hồ Chí Minh",
  category: "Cà phê",
  status: "active" | "inactive",
  totalDebt: 0,
  totalPurchaseAmount: 0,
  purchaseOrderCount: 0,
  createdAt: "2026-01-19T05:46:56.829Z",
  recentOrders: []
}

export function Suppliers() {
  const { hasPermission } = useAuth();
  let fetchSuppliersParams: Record<string, any> = { "sort": "+code" }

  const canCreate = hasPermission('suppliers:create');
  const canUpdate = hasPermission('suppliers:update');
  const canDelete = hasPermission('suppliers:delete');

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"+" | "-" | "none">("none");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  //functions
  const fetchSuppliersData = async () => {
    const res = await getSuppliers(fetchSuppliersParams);
    if (!res) return;
    const { suppliers } = res.data.metaData
    if (suppliers) {
      setSuppliers(suppliers)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    try {
      fetchSuppliersData()
    }
    catch (error) {
      console.log("Error when fetching supplier: ", error);
    }
  }, [])

  const handleSearch = () => {
    if (!searchQuery) delete fetchSuppliersParams["search"]
    else fetchSuppliersParams["search"] = searchQuery
    fetchSuppliersData()
  }

  const handleSort = (field: string) => {
    let tempSortBy = sortBy;
    let tempSortOrder = sortOrder;
    if (sortBy === field) {
      // Cycle through: asc -> desc -> none -> asc
      if (sortOrder === "+") {
        setSortOrder("-");

        tempSortOrder = "-"
      }
      else if (sortOrder === "-") {
        setSortOrder("none");
        setSortBy(null);

        tempSortBy = null;
      } else {
        setSortOrder("+");

        tempSortOrder = "+"
      }
    } else {
      setSortBy(field);
      setSortOrder("+");

      tempSortBy = field;
      tempSortOrder = "+"
    }

    if (tempSortBy && tempSortOrder) {
      fetchSuppliersParams["sort"] = tempSortOrder + tempSortBy;
    }
    else {
      fetchSuppliersParams["sort"] = "+code"
    }

    fetchSuppliersData();
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field || sortOrder === "none") return null;
    if (sortOrder === "+") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  const handleAddSupplier = (formData: Omit<Supplier, "id" | "code">) => {
    // const newSupplier: Supplier = {
    //   id: Date.now().toString(),
    //   code: `NCC${String(suppliers.length + 1).padStart(3, "0")}`,
    //   ...formData,
    // };
    // setSuppliers([...suppliers, newSupplier]);
    // setDialogOpen(false);
    // toast.success("Đã thêm nhà cung cấp mới");
  };

  const handleEditSupplier = (formData: Omit<Supplier, "id" | "code">) => {
    // if (!editingSupplier) return;
    // setSuppliers(
    //   suppliers.map((s) =>
    //     s.id === editingSupplier.id ? { ...s, ...formData } : s
    //   )
    // );
    // setEditingSupplier(null);
    // setDialogOpen(false);
    // toast.success("Đã cập nhật nhà cung cấp");
  };

  const handleDeleteSupplier = (id: string) => {
    // if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
    //   setSuppliers(suppliers.filter((s) => s.id !== id));
    //   toast.success("Đã xóa nhà cung cấp");
    // }
  };

  // const handleToggleStatus = (id: string) => {
  //   setSuppliers(
  //     suppliers.map((supplier) => {
  //       if (supplier.id === id) {
  //         const newStatus =
  //           supplier.status === "active" ? "inactive" : "active";
  //         toast.success(
  //           newStatus === "active"
  //             ? "Đã kích hoạt nhà cung cấp"
  //             : "Đã vô hiệu hóa nhà cung cấp"
  //         );
  //         return { ...supplier, status: newStatus };
  //       }
  //       return supplier;
  //     })
  //   );
  // };

  const openEditDialog = (e: React.MouseEvent, supplier: Supplier) => {
    e.stopPropagation();
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: "active" | "inactive") => {
    if (status === "active") {
      return <Badge className="bg-emerald-500">Hoạt động</Badge>;
    }
    return <Badge className="bg-red-500">Không hoạt động</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalSuppliers = suppliers.length;
  // const activeSuppliers = suppliers.filter((s) => s.isA === "active").length;

  // const transactions = [
  //   { id: "PN001", date: "2023-10-26", amount: 5000000 },
  //   { id: "PN002", date: "2023-11-12", amount: 7500000 },
  //   { id: "PN003", date: "2023-12-05", amount: 3200000 },
  // ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Nhà cung cấp</h1>
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
            Nhập file
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Chức năng export đang phát triển")
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất file
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
          {canCreate && (
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
          )}
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
                  placeholder="Tìm kiếm theo tên, mã, tên liên hệ, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 w-5 h-5"
                  onClick={() => setSearchQuery("")}
                />
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  handleSearch();
                }}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {(selectedCategory !== "all" || selectedStatus !== "all" || selectedCity !== "all") && (
                  <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {(selectedCategory !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0) + (selectedCity !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Danh mục</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
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

                  {/* City Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">
                      Tỉnh / Thành phố
                    </Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
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
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách nhà cung cấp ({suppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16 text-sm text-center">STT</TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã NCC
                      {getSortIcon("code")}
                    </div>
                  </TableHead>
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
                    onClick={() => handleSort("totalDebt")}
                  >
                    <div className="flex items-center">
                      Công nợ
                      {getSortIcon("totalDebt")}
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">Trạng thái</TableHead>
                  <TableHead className="text-sm text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-slate-500"
                    >
                      Không tìm thấy nhà cung cấp nào
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier, index) => {
                    const isExpanded = expandedRows.includes(supplier.code);
                    return (
                      <React.Fragment key={supplier.code}>
                        <TableRow
                          onClick={() => toggleExpand(supplier.code)}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event: React.MouseEvent) => {
                                event.stopPropagation();
                                toggleExpand(supplier.code);
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
                          <TableCell className="text-sm text-slate-600 text-center">
                            {index + 1}
                          </TableCell>
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
                              <span>{supplier.contactPerson}</span>
                              <span className="text-xs text-slate-500">
                                {supplier.phone}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-900">
                            <span
                              className={
                                supplier.totalDebt > 0
                                  ? "text-red-600"
                                  : "text-slate-600"
                              }
                            >
                              {formatCurrency(supplier.totalDebt)}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                          <TableCell className="text-sm text-right">
                            <div className="flex items-center justify-center gap-2">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(event: React.MouseEvent) => openEditDialog(event, supplier)}
                                  className="hover:bg-blue-100"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(event: React.MouseEvent) => {
                                    event.stopPropagation();
                                    handleDeleteSupplier(supplier.code);
                                  }}
                                  className="hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                              {/* {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStatus(supplier.code);
                                  }}
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
                              )} */}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={10} className="p-4 bg-slate-50">
                              <Tabs defaultValue="info">
                                <TabsList>
                                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                                  <TabsTrigger value="history">Lịch sử nhập hàng</TabsTrigger>
                                </TabsList>
                                <TabsContent value="info">
                                  <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="text-sm">
                                      <span className="font-semibold">Mã NCC:</span> {supplier.code}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Tên:</span> {supplier.name}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Danh mục:</span> {supplier.category}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Người liên hệ:</span> {supplier.contactPerson}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Điện thoại:</span> {supplier.phone}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Email:</span> {supplier.email}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Địa chỉ:</span> {supplier.address}, {supplier.city}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Công nợ:</span>{" "}
                                      <span className={supplier.totalDebt > 0
                                        ? "text-red-600"
                                        : "text-slate-600"}>{formatCurrency(supplier.totalDebt)}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Tổng thanh toán:</span>{" "}
                                      <span>{formatCurrency(supplier.totalPurchaseAmount)}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-semibold">Trạng thái:</span>{" "}
                                      <Badge
                                        variant={supplier.status === "active" ? "default" : "secondary"}
                                        className={
                                          supplier.status === "active"
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                        }
                                      >
                                        {supplier.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                      </Badge>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="history">
                                  {/* <div className="py-4">
                                    <div className="border rounded-md">
                                      <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
                                        <div>Mã nhập</div>
                                        <div>Ngày</div>
                                        <div className="text-right">Số tiền</div>
                                      </div>
                                      {transactions.map((imp) => (
                                        <div key={imp.id} className="grid grid-cols-3 p-2 border-t">
                                          <div>{imp.id}</div>
                                          <div>{imp.date}</div>
                                          <div className="text-right">{formatCurrency(imp.amount)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div> */}
                                </TabsContent>
                              </Tabs>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Stats */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-600">Thống kê</Label>
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tổng:</span>
            <span className="font-medium text-slate-900">{totalSuppliers}</span>
          </div>
          {/* <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Hoạt động:</span>
                        <span className="font-medium text-emerald-600">{activeSuppliers}</span>
                      </div> */}
          {/* <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Công nợ:</span>
                        <span className="font-medium text-red-600">{formatCurrency(totalDebt)}</span>
                      </div> */}
        </div>
      </div>
      {/* Form Dialog */}
      {/* <SupplierFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSupplier(null);
        }}
        onSubmit={editingSupplier ? handleEditSupplier : handleAddSupplier}
        editingSupplier={editingSupplier}
      /> */}
    </div>
  );
}
