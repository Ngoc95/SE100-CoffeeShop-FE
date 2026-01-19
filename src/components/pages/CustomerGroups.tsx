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
import { CustomerGroupFormDialog } from "../CustomerGroupFormDialog";
import { getCustomerGroups } from "../../api/customerGroup";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
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
    console.log("Use effect group data")
    try {
      fetchCustomerGroupsData()
    }
    catch (error) {
      console.log("Error when fetching customer groups: ", error);
    }
  }, [])

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

  // Apply sorting
  // if (sortField && sortOrder !== "none") {
  //   filteredGroups = [...filteredGroups].sort((a, b) => {
  //     let aValue: any;
  //     let bValue: any;

  //     if (sortField === "code") {
  //       aValue = a.code;
  //       bValue = b.code;
  //     } else if (sortField === "name") {
  //       aValue = a.name;
  //       bValue = b.name;
  //     } else if (sortField === "customers") {
  //       aValue = a.customers.length;
  //       bValue = b.customers.length;
  //     } else if (sortField === "status") {
  //       const statusOrder = { active: 0, inactive: 1 };
  //       aValue = statusOrder[a.status] ?? 0;
  //       bValue = statusOrder[b.status] ?? 0;
  //     }

  //     if (typeof aValue === "string" && typeof bValue === "string") {
  //       const comparison = aValue.localeCompare(bValue, "vi");
  //       return sortOrder === "asc" ? comparison : -comparison;
  //     }

  //     if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
  //     if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
  //     return 0;
  //   });
  // }

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

  const handleSubmit = (formData: any /*{
    name: string;
    status: "active" | "inactive";
    customers: Customer[];}*/
  ) => {
    // const newGroup: CustomerGroup = {
    //   id: Date.now().toString(),
    //   code: `NKH${String(groups.length + 1).padStart(3, "0")}`,
    //   name: formData.name,
    //   status: formData.status,
    //   customers: formData.customers,
    // };
    // setGroups([...groups, newGroup]);
    // setDialogOpen(false);
    // toast.success("Đã thêm nhóm khách hàng mới");
  };

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

  const handleDeleteGroup = (id: string) => {
    // if (confirm("Bạn có chắc chắn muốn xóa nhóm này?")) {
    //   setGroups(groups.filter((g) => g.id !== id));
    //   toast.success("Đã xóa nhóm khách hàng");
    // }
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
    setEditingGroup(group);
    setDialogOpen(true);
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
              setEditingGroup(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhóm
          </Button>
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
                  placeholder="Tìm kiếm theo mã nhóm, tên nhóm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
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
                        {group.customerCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-right">
                        <div className="flex justify-center gap-2">
                          {
                            canUpdate && (
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
                            canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                // onClick={() => handleDeleteGroup(group.id)}
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
      {/* Stats */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-600">Thống kê</Label>
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tổng:</span>
            <span className="font-medium text-slate-900">{totalGroups}</span>
          </div>
        </div>
      </div>
      {/* Form Dialog */}
      {/* <CustomerGroupFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={editingGroup ? handleEditGroup : handleAddGroup}
        editingGroup={editingGroup}
        availableCustomers={availableCustomers}
      /> */}
    </div>
  );
}
