import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Search, Pencil, Trash2, Filter, X, Power, PowerOff, Upload, Download, Printer, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";
import { AddCustomer, CustomerAddFormDialog, CustomerEditFormDialog, EditCustomer } from "../CustomerFormDialog";
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../../api/customer";
import { getCustomerGroups } from "../../api/customerGroup";

interface Customer {
  id: number,
  code: string,
  name: string,
  gender: string,
  birthday: string,
  phone: string,
  address: string,
  city: "TP. Hồ Chí Minh",
  groupName: "Khách thường",
  totalOrders: 5,
  totalSpent: 1500000,
  isActive: true,
  createdAt: "2026-01-17T08:36:16.868Z",
  updatedAt: "2026-01-17T08:36:16.868Z"
}

export const genders = ["male", "female"];
export const cities = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Nha Trang",
  "Huế",
  "Vũng Tàu"
]
export const activeStatus = [
  "Hoạt động",
  "Không hoạt động"
]

interface CustomerGroup {
  id: string;
  name: string;
}

export function Customers() {
  const { hasPermission } = useAuth();
  let fetchCustomersParams: Record<string, any> = { "sort": "+code" }


  const canCreate = hasPermission('customers:create');
  const canUpdate = hasPermission('customers:update');
  const canDelete = hasPermission('customers:delete');

  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  const [sortBy, setSortBy] = useState<string | null>();
  const [sortOrder, setSortOrder] = useState<"+" | "-" | "none">("none");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<EditCustomer>({
    id: 0,
    code: '',
    name: '',
    phone: '',
    city: '',
    gender: '',
    birthday: '',
    address: '',
    isActive: true
  });
  const [showFilters, setShowFilters] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])


  // Functions
  const fetchCustomersData = async () => {
    const res = await getCustomers(fetchCustomersParams)
    if (!res) return;
    let { customers, statistics } = res.data.metaData
    if (customers) {
      customers.map((customer: EditCustomer) => {
        if (customer.birthday) customer.birthday = customer.birthday.split("T")[0]
      })
      setCustomers(customers)
      setTotalRevenue(statistics.totalRevenue)
    }
  }

  const fetchCustomerGroupsData = async () => {
    const res = await getCustomerGroups()
    const { groups } = res.data.metaData
    if (groups) {
      setCustomerGroups(groups)
    }
  }

  useEffect(() => {
    try {
      fetchCustomersData()
    }
    catch (error) {
      console.log("Error when fetching customers: ", error);
    }

    try {
      fetchCustomerGroupsData()
    }
    catch (error) {
      console.log("Error when fetching customer groups: ", error);
    }

  }, []
  )

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
      fetchCustomersParams["sort"] = tempSortOrder + tempSortBy;
    }
    else {
      fetchCustomersParams["sort"] = "+code"
    }

    fetchCustomersData();
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field || sortOrder === "none") return null;
    if (sortOrder === "+") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  const handleApplyFilter = () => {
    if (filterActive != "all") {
      fetchCustomersParams["isActive"] = filterActive === "Hoạt động" ? true : false
    }
    else delete fetchCustomersParams["isActive"]
    if (filterGroup != "all") {
      fetchCustomersParams["groupId"] = filterGroup
    }
    else delete fetchCustomersParams["groupId"]
    if (filterGender != "all") {
      fetchCustomersParams["gender"] = filterGender
    }
    else delete fetchCustomersParams["gender"]
    if (filterCity != "all") {
      fetchCustomersParams["city"] = filterCity
    }
    else delete fetchCustomersParams["city"]
    fetchCustomersData()
  }

  const handleSearch = () => {
    if (!searchQuery) delete fetchCustomersParams["search"]
    else fetchCustomersParams["search"] = searchQuery
    fetchCustomersData()
  }

  const validateSubmitEdit = (formData: EditCustomer) => {
    if (!formData.name || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (!/^\d+$/.test(formData.phone) || formData.phone.length !== 10) {
      toast.error("SĐT phải có 10 ký tự và chỉ có chữ số!");
      return false;
    }

    return true;
  }

  const validateSubmitAdd = (formData: AddCustomer) => {
    if (!formData.name || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (!/^\d+$/.test(formData.phone) || formData.phone.length !== 10) {
      toast.error("SĐT phải có 10 ký tự và chỉ có chữ số!");
      return false;
    }

    return true;
  }

  const handleSubmitEdit = async (formData: EditCustomer) => {
    if (!formData) return;

    if (!validateSubmitEdit(formData)) return;

    try {
      await updateCustomer(
        formData.id,
        formData.name,
        formData.phone,
        formData.city,
        formData.gender,
        formData.birthday,
        formData.address,
        formData.isActive
      )
      toast.success("Cập nhật khách hàng thành công");
      await fetchCustomersData()
    }
    catch (error) {
      toast.error("Cập nhật khách hàng thất bại. Lỗi: " + error.response.data.message);
    }

    setEditDialogOpen(false);
    resetForm();
  };

  const handleSubmitAdd = async (formData: AddCustomer) => {
    if (!formData) return;

    if (!validateSubmitAdd(formData)) return;

    let res;

    try {
      await createCustomer(
        formData.name,
        formData.phone,
        formData.city,
        formData.gender,
        formData.birthday,
        formData.address,
        formData.isActive
      )
      toast.success("Thêm khách hàng thành công");
      await fetchCustomersData()
    }
    catch (error) {
      toast.error("Thêm khách hàng thất bại. Lỗi: " + error.response.data.message);
    }

    setAddDialogOpen(false);
  }

  const handleEdit = (customer: Customer) => {
    const tempEditCustomer: EditCustomer = {
      id: customer.id,
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      gender: customer.gender,
      birthday: customer.birthday,
      address: customer.address,
      isActive: customer.isActive
    }
    setEditingCustomer(tempEditCustomer);
    setEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };


  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      await deleteCustomer(id)
      fetchCustomersData()
    }
  };

  // const handleToggleStatus = (id: string) => {
  //   // setCustomers(
  //   //   customers.map((customer) => {
  //   //     if (customer.id === id) {
  //   //       const newStatus =
  //   //         customer.status === "active" ? "inactive" : "active";
  //   //       toast.success(
  //   //         newStatus === "active"
  //   //           ? "Đã kích hoạt khách hàng"
  //   //           : "Đã vô hiệu hóa khách hàng"
  //   //       );
  //   //       return { ...customer, status: newStatus };
  //   //     }
  //   //     return customer;
  //   //   })
  //   // );
  // };

  const resetForm = () => {
    // setEditingCustomer(null);
  };

  const getStatusBadge = (status: true | false) => {
    if (status === true) {
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
  const activeCustomers = customers.filter((c) => c.isActive === true).length;

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
            Nhập file
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Chức năng export đang phát triển")}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất file
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
                handleAddNew();
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
                  placeholder="Tìm kiếm theo tên, mã và số điện thoại"
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
                {(filterGender !== "all" || filterCity !== "all" || filterActive !== "all" || filterGroup !== "all") && (
                  <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {(filterGender !== "all" ? 1 : 0) + (filterCity !== "all" ? 1 : 0) + (filterActive !== "all" ? 1 : 0) + (filterGroup !== "all" ? 1 : 0)}
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
                      value={filterGender}
                      onValueChange={setFilterGender}
                    >
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả giới tính</SelectItem>
                        {
                          genders.map((gender, index) => (
                            <SelectItem key={index} value={gender}>
                              {gender}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">
                      Tỉnh / Thành phố
                    </Label>
                    <Select value={filterCity} onValueChange={setFilterCity}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả thành phố</SelectItem>
                        {
                          cities.map((city, index) => (
                            <SelectItem key={index} value={city}>
                              {city}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Nhóm khách hàng</Label>
                    <Select value={filterGroup} onValueChange={setFilterGroup}>
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
                    <Select value={filterActive} onValueChange={setFilterActive}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {
                          activeStatus.map((status, index) => (
                            <SelectItem key={index} value={status}>
                              {status}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                    onClick={() => {
                      handleApplyFilter();
                    }}
                  >
                    Áp dụng bộ lọc
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterGroup("all");
                      setFilterGender("all");
                      setFilterActive("all");
                      setFilterCity("all");
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
            Danh sách khách hàng ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-16 text-sm text-center">STT</TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã KH
                      {getSortIcon("code")}
                    </div>
                  </TableHead>
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
                  <TableHead className="text-sm">Nhóm KH</TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("totalOrders")}
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
                  <TableHead className="text-sm text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-slate-500"
                    >
                      Không tìm thấy khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer, index) => (
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
                        {customer.groupName}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {customer.totalOrders}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.isActive)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
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


      {/* Customer Edit Form Dialog */}
      <CustomerEditFormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          resetForm();
        }}
        onSubmit={(customers: EditCustomer) => handleSubmitEdit(customers)}
        editingCustomer={editingCustomer}
      />

      {/* Customer Add Form Dialog */}
      <CustomerAddFormDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          resetForm();
        }}
        onSubmit={(customers: AddCustomer) => handleSubmitAdd(customers)}
      />
    </div >
  );
}
