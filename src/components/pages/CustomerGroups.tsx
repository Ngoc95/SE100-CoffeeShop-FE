import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Pencil, Trash2, Search, Power, PowerOff, X, Filter, ChevronDown, Upload, Download, Printer, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";
import { AddCustomerGroup, CustomerGroupAddFormDialog, CustomerGroupEditFormDialog, EditCustomerGroup } from "../CustomerGroupFormDialog";
import { createCustomerGroup, deleteCustomerGroup, getCustomerGroups, updateCustomerGroup } from "../../api/customerGroup";
import { useDebounce } from "../../hooks/useDebounce";

interface CustomerGroup {
  id: number,
  code: "NKH001",
  name: "Khách thường",
  description: "Nhóm khách hàng mặc định",
  priority: 0,
  minSpend: 0,
  minOrders: 0,
  windowMonths: 12,
  createdAt: "2026-01-17T08:36:16.847Z",
  updatedAt: "2026-01-17T08:36:16.847Z",
  deletedAt: string,
  customerCount: 2
}

export function CustomerGroups() {
  const { hasPermission } = useAuth();
  let fetchCustomerGroupsParams: Record<string, any> = { "sort": "+code" }

  const canCreate = hasPermission('customer_groups:create');
  const canUpdate = hasPermission('customer_groups:update');
  const canDelete = hasPermission('customer_groups:delete');

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EditCustomerGroup>({
    id: 0,
    code: '',
    name: '',
    description: '',
    priority: 0,
    minSpend: 0,
    minOrders: 0,
    windowMonths: 12
  }
  );
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerFilterOpen, setCustomerFilterOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("none");

  const [groups, setGroups] = useState<CustomerGroup[]>([]);

  // functions
  const fetchCustomerGroupsData = async () => {
    const res = await getCustomerGroups(fetchCustomerGroupsParams);
    if (!res) return;
    const { groups } = res.data.metaData
    if (groups) {
      setGroups(groups)
    }
  }

  useEffect(() => {
    if (debouncedSearchQuery) {
        fetchCustomerGroupsParams["search"] = debouncedSearchQuery
    } else {
        delete fetchCustomerGroupsParams["search"]
    }
    try {
      fetchCustomerGroupsData()
    }
    catch (error) {
      console.log("Error when fetching customer groups: ", error);
    }
  }, [debouncedSearchQuery])

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
      fetchCustomerGroupsParams["sort"] = tempSortOrder + tempSortBy;
    }
    else {
      fetchCustomerGroupsParams["sort"] = "+code"
    }

    fetchCustomerGroupsData();
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field || sortOrder === "none") {
      return null;
    }
    if (sortOrder === "+") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  // const toggleCustomerFilter = (customerId: string) => {
  //   setSelectedCustomers((prev) =>
  //     prev.includes(customerId)
  //       ? prev.filter((id) => id !== customerId)
  //       : [...prev, customerId]
  //   );
  // };

  // const removeCustomerFilter = (customerId: string) => {
  //   setSelectedCustomers((prev) => prev.filter((id) => id !== customerId));
  // };

  // const clearAllFilters = () => {
  //   setSelectedCustomers([]);
  //   setSearchQuery("");
  // };

  // const getSelectedCustomerNames = () => {
  //   if (selectedCustomers.length === 0) return "Tất cả khách hàng";
  //   if (selectedCustomers.length === 1) {
  //     const customer = availableCustomers.find(
  //       (c) => c.id === selectedCustomers[0]
  //     );
  //     return customer?.name || "";
  //   }
  //   return `${selectedCustomers.length} khách hàng`;
  // };

  const handleSearch = () => {
    if (!searchQuery) delete fetchCustomerGroupsParams["search"]
    else fetchCustomerGroupsParams["search"] = searchQuery
    fetchCustomerGroupsData()
  }

  const validateSubmitEdit = (formData: EditCustomerGroup) => {
    if (!formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (formData.priority === 0) {
      toast.error("Độ ưu tiên phải khác 0");
      return false;
    }

    if (!formData.windowMonths || formData.windowMonths < 1 || formData.windowMonths > 60) {
      toast.error("Số tháng xét hạng phải từ 1 đến 60");
      return false;
    }

    return true;
  }

  const validateSubmitAdd = (formData: AddCustomerGroup) => {
    if (!formData.name) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (formData.priority === 0) {
        toast.error("Độ ưu tiên phải khác 0");
        return false;
      }

    if (!formData.windowMonths || formData.windowMonths < 1 || formData.windowMonths > 60) {
      toast.error("Số tháng xét hạng phải từ 1 đến 60");
      return false;
    }

    return true;
  }

  const handleSubmitEdit = async (formData: EditCustomerGroup) => {
    if (!formData) return;

    if (!validateSubmitEdit(formData)) return;

    try {
      await updateCustomerGroup(
        formData.id,
        formData.name,
        formData.description,
        formData.priority,
        formData.minSpend,
        formData.minOrders,
        formData.windowMonths
      )
      toast.success("Cập nhật nhóm khách hàng thành công");
      await fetchCustomerGroupsData()
    }
    catch (error) {
      toast.error("Cập nhật nhóm khách hàng thất bại. Lỗi: " + error.response.data.message);
    }

    setEditDialogOpen(false);
  };

  const handleSubmitAdd = async (formData: AddCustomerGroup) => {
    if (!formData) return;

    if (!validateSubmitAdd(formData)) return;

    try {
      await createCustomerGroup(
        formData.name,
        formData.description,
        formData.priority,
        formData.minSpend,
        formData.minOrders,
        formData.windowMonths
      )
      toast.success("Thêm nhóm khách hàng thành công");
      await fetchCustomerGroupsData()
    }
    catch (error) {
      toast.error("Thêm nhóm khách hàng thất bại. Lỗi: " + error.response.data.message);
    }

    setAddDialogOpen(false);
  }

  const handleEdit = (formData: any/*{
    name: string;
    status: "active" | "inactive";
    customers: Customer[];
  }*/) => {
    // if (!editingGroup) return;
    // setGroups(
    //   groups.map((g) =>
    //     g.id === editingGroup.id
    //       ? {
    //         ...g,
    //         name: formData.name,
    //         status: formData.status,
    //         customers: formData.customers,
    //       }
    //       : g
    //   )
    // );
    // setEditingGroup(null);
    // setDialogOpen(false);
    // toast.success("Đã cập nhật nhóm khách hàng");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhóm khách hàng này?")) {
      await deleteCustomerGroup(id)
      fetchCustomerGroupsData()
    }
  };

  // const handleToggleStatus = (id: string) => {
  //   setGroups(
  //     groups.map((group) => {
  //       if (group.id === id) {
  //         const newStatus = group.status === "active" ? "inactive" : "active";
  //         toast.success(
  //           newStatus === "active"
  //             ? "Đã kích hoạt nhóm khách hàng"
  //             : "Đã vô hiệu hóa nhóm khách hàng"
  //         );
  //         return { ...group, status: newStatus };
  //       }
  //       return group;
  //     })
  //   );
  // };

  const openEditDialog = (group: CustomerGroup) => {
    const tempEditCustomerGroup: EditCustomerGroup = {
      id: group.id,
      code: group.code,
      name: group.name,
      description: group.description,
      priority: group.priority,
      minSpend: group.minSpend,
      minOrders: group.minOrders,
      windowMonths: group.windowMonths
    }

    setEditingGroup(tempEditCustomerGroup);
    setEditDialogOpen(true);
  };

  const totalGroups = groups.length;
  // const activeGroups = groups.filter((g) => g.status === "active").length;
  // const inactiveGroups = groups.filter((g) => g.status === "inactive").length;
  // const totalCustomers = groups.reduce((sum, g) => sum + g.customers.length, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Nhóm khách hàng</h1>
          <p className="text-slate-600 text-sm">
            Quản lý nhóm khách hàng và phân loại
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
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setAddDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhóm
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-600">Thống kê</Label>
        <div className="bg-white border border-slate-200 rounded-lg p-3 flex gap-8 w-fit items-center shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Tổng số nhóm khách hàng:</span>
            <span className="font-medium text-slate-900">{totalGroups}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">

            {/* Search and Filter Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên nhóm và mô tả nhóm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
                {searchQuery && (
                   <X
                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 w-5 h-5 cursor-pointer"
                   onClick={() => setSearchQuery("")}
                 /> 
                )}
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách nhóm khách hàng ({groups.length})
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
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã nhóm KH
                      {getSortIcon("code")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Tên nhóm KH
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead className="w-16 text-sm text-center">Mô tả</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center">
                      Độ ưu tiên
                      {getSortIcon("priority")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("minOrders")}
                  >
                    <div className="flex items-center">
                      Số đơn tối thiểu
                      {getSortIcon("minOrders")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("minSpend")}
                  >
                    <div className="flex items-center">
                      Chi tiêu tối thiểu
                      {getSortIcon("minSpend")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("windowMonths")}
                  >
                    <div className="flex items-center">
                      Số tháng xét hạng
                      {getSortIcon("windowMonths")}
                    </div>
                  </TableHead>
                  <TableHead className="w-16 text-sm text-center">Số khách hàng</TableHead>
                  <TableHead className="text-sm text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      Không tìm thấy nhóm khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group, index) => (
                    <TableRow key={group.id}>
                      <TableCell className="text-sm text-slate-600 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {group.code}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {group.name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {group.description}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {group.priority}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {group.minOrders.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {group.minSpend.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {group.windowMonths}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {group.customerCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-right">
                        <div className="flex justify-center gap-2">
                          {
                            canUpdate && group.id != 1 && group.priority != 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(group)}
                                className="hover:bg-blue-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )
                          }
                          {
                            canDelete && group.id != 1 && group.priority != 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(group.id)}
                                className="hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )
                          }
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


      {/*Edit Form Dialog */}
      <CustomerGroupEditFormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
        }}
        onSubmit={(formData) => handleSubmitEdit(formData)}
        editingGroup={editingGroup}
      />

      {/*Add Form Dialog */}
      <CustomerGroupAddFormDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
        }}
        onSubmit={(formData) => handleSubmitAdd(formData)}
      />
    </div>
  );
}
