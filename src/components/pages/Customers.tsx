import { useState } from "react";
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
import { toast } from "sonner";
import { CustomerFormDialog } from "../CustomerFormDialog";

interface Customer {
  id: string;
  code: string;
  name: string;
  gender: string;
  birthday: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  group: string;
  orders: number;
  totalSpent: number;
  status: "active" | "inactive";
}

interface CustomerGroup {
  id: string;
  name: string;
}

export function Customers() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('customers:create');
  const canUpdate = hasPermission('customers:update');
  const canDelete = hasPermission('customers:delete');

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "orders" | "totalSpent" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      code: "KH001",
      name: "Nguyễn Văn A",
      gender: "Nam",
      birthday: "15/01/1990",
      phone: "0901234567",
      email: "nguyenvana@email.com",
      city: "Hồ Chí Minh",
      address: "123 Đường ABC, Quận 1",
      group: "vip",
      orders: 15,
      totalSpent: 25500000,
      status: "active",
    },
    {
      id: "2",
      code: "KH002",
      name: "Trần Thị B",
      gender: "Nữ",
      birthday: "22/05/1992",
      phone: "0912345678",
      email: "tranthib@email.com",
      city: "Hà Nội",
      address: "456 Đường XYZ, Hoàn Kiếm",
      group: "regular",
      orders: 8,
      totalSpent: 12300000,
      status: "active",
    },
    {
      id: "3",
      code: "KH003",
      name: "Lê Văn C",
      gender: "Nam",
      birthday: "10/03/1988",
      phone: "0923456789",
      email: "levanc@email.com",
      city: "Đà Nẵng",
      address: "789 Đường DEF, Hải Châu",
      group: "vip",
      orders: 22,
      totalSpent: 35800000,
      status: "inactive",
    },
    {
      id: "4",
      code: "KH004",
      name: "Phạm Thị D",
      gender: "Nữ",
      birthday: "18/07/1995",
      phone: "0934567890",
      email: "phamthid@email.com",
      city: "Cần Thơ",
      address: "321 Đường GHI, Ninh Kiều",
      group: "new",
      orders: 5,
      totalSpent: 8500000,
      status: "active",
    },
    {
      id: "5",
      code: "KH005",
      name: "Hoàng Văn E",
      gender: "Nam",
      birthday: "25/11/1985",
      phone: "0945678901",
      email: "hoangvane@email.com",
      city: "Hải Phòng",
      address: "654 Đường JKL, Lê Chân",
      group: "regular",
      orders: 18,
      totalSpent: 28900000,
      status: "active",
    },
    {
      id: "6",
      code: "KH006",
      name: "Vũ Thị F",
      gender: "Nữ",
      birthday: "05/09/1993",
      phone: "0956789012",
      email: "vuthif@email.com",
      city: "Nha Trang",
      address: "987 Đường MNO, Vĩnh Hải",
      group: "regular",
      orders: 12,
      totalSpent: 19200000,
      status: "inactive",
    },
    {
      id: "7",
      code: "KH007",
      name: "Đặng Văn G",
      gender: "Nam",
      birthday: "30/12/1991",
      phone: "0967890123",
      email: "dangvang@email.com",
      city: "Huế",
      address: "147 Đường PQR, Phú Nhuận",
      group: "new",
      orders: 9,
      totalSpent: 14700000,
      status: "active",
    },
    {
      id: "8",
      code: "KH008",
      name: "Bùi Thị H",
      gender: "Nữ",
      birthday: "14/04/1994",
      phone: "0978901234",
      email: "buithih@email.com",
      city: "Vũng Tàu",
      address: "258 Đường STU, Phường 1",
      group: "vip",
      orders: 7,
      totalSpent: 11400000,
      status: "active",
    },
  ]);

  const [customerGroups] = useState<CustomerGroup[]>([
    { id: "vip", name: "VIP" },
    { id: "regular", name: "Thường xuyên" },
    { id: "new", name: "Khách mới" },
  ]);

  // Filtering and sorting
  let filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesGroup =
      selectedGroup === "all" || customer.group === selectedGroup;
    const matchesStatus =
      selectedStatus === "all" || customer.status === selectedStatus;
    const matchesGender =
      selectedGender === "all" || customer.gender === selectedGender;
    const matchesCity =
      selectedCity === "all" || customer.city === selectedCity;
    return (
      matchesSearch &&
      matchesGroup &&
      matchesStatus &&
      matchesGender &&
      matchesCity
    );
  });

  // Apply sorting
  if (sortBy && sortOrder !== "none") {
    filteredCustomers = [...filteredCustomers].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "vi");
      } else if (sortBy === "orders") {
        comparison = a.orders - b.orders;
      } else if (sortBy === "totalSpent") {
        comparison = a.totalSpent - b.totalSpent;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  const handleSort = (field: "name" | "orders" | "totalSpent") => {
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

  const getSortIcon = (field: "name" | "orders" | "totalSpent") => {
    if (sortBy !== field || sortOrder === "none") return null;
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  const handleSubmit = (formData: any) => {
    if (!formData.name || !formData.phone || !formData.group) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (editingCustomer) {
      // Update existing customer
      setCustomers(
        customers.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...customer, ...formData }
            : customer
        )
      );
      toast.success("Cập nhật khách hàng thành công");
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        code: `KH${String(customers.length + 1).padStart(3, "0")}`,
        name: formData.name,
        gender: formData.gender,
        birthday: formData.birthday,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        address: formData.address,
        group: formData.group,
        orders: 0,
        totalSpent: 0,
        status: "active",
      };
      setCustomers([...customers, newCustomer]);
      toast.success("Thêm khách hàng mới thành công");
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      setCustomers(customers.filter((customer) => customer.id !== id));
      toast.success("Xóa khách hàng thành công");
    }
  };

  const handleToggleStatus = (id: string) => {
    setCustomers(
      customers.map((customer) => {
        if (customer.id === id) {
          const newStatus =
            customer.status === "active" ? "inactive" : "active";
          toast.success(
            newStatus === "active"
              ? "Đã kích hoạt khách hàng"
              : "Đã vô hiệu hóa khách hàng"
          );
          return { ...customer, status: newStatus };
        }
        return customer;
      })
    );
  };

  const resetForm = () => {
    setEditingCustomer(null);
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

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const inactiveCustomers = customers.filter(
    (c) => c.status === "inactive"
  ).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Khách hàng</h1>
          <p className="text-slate-600 text-sm">
            Quản lý thông tin khách hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => toast.info("Chức năng import đang phát triển")}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Chức năng export đang phát triển")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast.info("Chức năng in đang phát triển");
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
                setEditingCustomer(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm khách hàng
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
                  placeholder="Tìm kiếm theo tên, mã, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {(selectedGender !== "all" || selectedCity !== "all" || selectedStatus !== "all" || selectedGroup !== "all") && (
                  <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {(selectedGender !== "all" ? 1 : 0) + (selectedCity !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0) + (selectedGroup !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Gender Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Giới tính</Label>
                    <Select
                      value={selectedGender}
                      onValueChange={setSelectedGender}
                    >
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả giới tính</SelectItem>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
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
                        <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                        <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                        <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                        <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                        <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                        <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                        <SelectItem value="Huế">Huế</SelectItem>
                        <SelectItem value="Vũng Tàu">Vũng Tàu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Nhóm khách hàng</Label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả nhóm</SelectItem>
                        {customerGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
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

                  {/* Stats */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Thống kê</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tổng:</span>
                        <span className="font-medium text-slate-900">{totalCustomers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Hoạt động:</span>
                        <span className="font-medium text-emerald-600">{activeCustomers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Doanh thu:</span>
                        <span className="font-medium text-blue-600 text-xs">{formatCurrency(totalRevenue)}</span>
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
                      setSelectedGroup("all");
                      setSelectedGender("all");
                      setSelectedStatus("all");
                      setSelectedCity("all");
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
            Danh sách khách hàng ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-16 text-sm text-center">STT</TableHead>
                  <TableHead className="text-sm">Mã KH</TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Tên khách hàng
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">Giới tính</TableHead>
                  <TableHead className="text-sm">Ngày sinh</TableHead>
                  <TableHead className="text-sm">Liên hệ</TableHead>
                  <TableHead className="text-sm">Địa chỉ</TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("orders")}
                  >
                    <div className="flex items-center">
                      Đơn hàng
                      {getSortIcon("orders")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("totalSpent")}
                  >
                    <div className="flex items-center">
                      Tổng chi tiêu
                      {getSortIcon("totalSpent")}
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">Trạng thái</TableHead>
                  <TableHead className="text-sm text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-slate-500"
                    >
                      Không tìm thấy khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <TableRow key={customer.id}>
                      <TableCell className="text-slate-600 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {customer.code}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {customer.gender}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {customer.birthday}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {customer.phone}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          <span>{customer.city}</span>
                          {customer.address && (
                            <span className="text-xs text-slate-500">
                              {customer.address}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {customer.orders}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(customer)}
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(customer.id)}
                              className={
                                customer.status === "active"
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              }
                              title={
                                customer.status === "active"
                                  ? "Vô hiệu hóa"
                                  : "Kích hoạt"
                              }
                            >
                              {customer.status === "active" ? (
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
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <CustomerFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        editingCustomer={editingCustomer}
      />
    </div>
  );
}
