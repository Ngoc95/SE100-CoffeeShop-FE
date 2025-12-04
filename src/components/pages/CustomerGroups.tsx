import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Power,
  PowerOff,
  X,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner@2.0.3";
import { CustomerGroupFormDialog } from "../CustomerGroupFormDialog";

interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
}

interface CustomerGroup {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive";
  customers: Customer[];
}

export function CustomerGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerFilterOpen, setCustomerFilterOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Mock available customers
  const availableCustomers: Customer[] = [
    {
      id: "1",
      code: "KH001",
      name: "Nguyễn Văn An",
      phone: "0901234567",
      email: "an.nguyen@email.com",
    },
    {
      id: "2",
      code: "KH002",
      name: "Trần Thị Bình",
      phone: "0912345678",
      email: "binh.tran@email.com",
    },
    {
      id: "3",
      code: "KH003",
      name: "Lê Văn Cường",
      phone: "0923456789",
      email: "cuong.le@email.com",
    },
    {
      id: "4",
      code: "KH004",
      name: "Phạm Thị Dung",
      phone: "0934567890",
      email: "dung.pham@email.com",
    },
    {
      id: "5",
      code: "KH005",
      name: "Hoàng Văn Em",
      phone: "0945678901",
      email: "em.hoang@email.com",
    },
  ];

  const [groups, setGroups] = useState<CustomerGroup[]>([
    {
      id: "1",
      code: "NKH001",
      name: "Khách hàng VIP",
      status: "active",
      customers: [
        {
          id: "1",
          code: "KH001",
          name: "Nguyễn Văn An",
          phone: "0901234567",
          email: "an.nguyen@email.com",
        },
        {
          id: "2",
          code: "KH002",
          name: "Trần Thị Bình",
          phone: "0912345678",
          email: "binh.tran@email.com",
        },
      ],
    },
    {
      id: "2",
      code: "NKH002",
      name: "Khách hàng thân thiết",
      status: "active",
      customers: [
        {
          id: "3",
          code: "KH003",
          name: "Lê Văn Cường",
          phone: "0923456789",
          email: "cuong.le@email.com",
        },
      ],
    },
    {
      id: "3",
      code: "NKH003",
      name: "Khách hàng mới",
      status: "inactive",
      customers: [],
    },
  ]);

  // Filter customers for the customer filter dropdown
  const filteredCustomersForFilter = availableCustomers.filter((customer) => {
    const searchLower = customerSearchQuery.toLowerCase();
    return (
      customer.code.toLowerCase().includes(searchLower) ||
      customer.name.toLowerCase().includes(searchLower)
    );
  });

  const filteredGroups = groups.filter((group) => {
    // Search filter
    const matchesSearch =
      group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Customer filter - check if group contains any of the selected customers
    const matchesCustomerFilter =
      selectedCustomers.length === 0 ||
      group.customers.some((customer) =>
        selectedCustomers.includes(customer.id)
      );

    return matchesSearch && matchesCustomerFilter;
  });

  const toggleCustomerFilter = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const removeCustomerFilter = (customerId: string) => {
    setSelectedCustomers((prev) => prev.filter((id) => id !== customerId));
  };

  const clearAllFilters = () => {
    setSelectedCustomers([]);
    setSearchQuery("");
  };

  const getSelectedCustomerNames = () => {
    if (selectedCustomers.length === 0) return "Tất cả khách hàng";
    if (selectedCustomers.length === 1) {
      const customer = availableCustomers.find(
        (c) => c.id === selectedCustomers[0]
      );
      return customer?.name || "";
    }
    return `${selectedCustomers.length} khách hàng`;
  };

  const handleAddGroup = (formData: {
    name: string;
    status: "active" | "inactive";
    customers: Customer[];
  }) => {
    const newGroup: CustomerGroup = {
      id: Date.now().toString(),
      code: `NKH${String(groups.length + 1).padStart(3, "0")}`,
      name: formData.name,
      status: formData.status,
      customers: formData.customers,
    };
    setGroups([...groups, newGroup]);
    setDialogOpen(false);
    toast.success("Đã thêm nhóm khách hàng mới");
  };

  const handleEditGroup = (formData: {
    name: string;
    status: "active" | "inactive";
    customers: Customer[];
  }) => {
    if (!editingGroup) return;
    setGroups(
      groups.map((g) =>
        g.id === editingGroup.id
          ? {
              ...g,
              name: formData.name,
              status: formData.status,
              customers: formData.customers,
            }
          : g
      )
    );
    setEditingGroup(null);
    setDialogOpen(false);
    toast.success("Đã cập nhật nhóm khách hàng");
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhóm này?")) {
      setGroups(groups.filter((g) => g.id !== id));
      toast.success("Đã xóa nhóm khách hàng");
    }
  };

  const handleToggleStatus = (id: string) => {
    setGroups(
      groups.map((group) => {
        if (group.id === id) {
          const newStatus = group.status === "active" ? "inactive" : "active";
          toast.success(
            newStatus === "active"
              ? "Đã kích hoạt nhóm khách hàng"
              : "Đã vô hiệu hóa nhóm khách hàng"
          );
          return { ...group, status: newStatus };
        }
        return group;
      })
    );
  };

  const openEditDialog = (group: CustomerGroup) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.status === "active").length;
  const inactiveGroups = groups.filter((g) => g.status === "inactive").length;
  const totalCustomers = groups.reduce((sum, g) => sum + g.customers.length, 0);

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Stats */}
      <div className="w-64 bg-white border-r p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </h3>
            <div className="space-y-4">
              {/* Customer Filter */}
              <div>
                <Label className="text-xs text-slate-600">Khách hàng</Label>
                <Popover
                  open={customerFilterOpen}
                  onOpenChange={setCustomerFilterOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between mt-1 h-10"
                    >
                      <span className="truncate">
                        {getSelectedCustomerNames()}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <Input
                          placeholder="Tìm mã, tên khách hàng..."
                          value={customerSearchQuery}
                          onChange={(e) =>
                            setCustomerSearchQuery(e.target.value)
                          }
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {filteredCustomersForFilter.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-slate-500 text-center">
                          Không tìm thấy khách hàng
                        </div>
                      ) : (
                        filteredCustomersForFilter.map((customer) => (
                          <div
                            key={customer.id}
                            className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                            onClick={() => toggleCustomerFilter(customer.id)}
                          >
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() =>
                                toggleCustomerFilter(customer.id)
                              }
                            />
                            <label className="text-sm flex-1 cursor-pointer font-normal">
                              <div className="flex flex-col">
                                <span className="text-slate-900">
                                  {customer.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {customer.code}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Selected Customer Badges */}
                {selectedCustomers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCustomers.map((customerId) => {
                      const customer = availableCustomers.find(
                        (c) => c.id === customerId
                      );
                      if (!customer) return null;
                      return (
                        <Badge
                          key={customerId}
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal"
                        >
                          {customer.name}
                          <button
                            type="button"
                            className="ml-1 inline-flex items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeCustomerFilter(customerId);
                            }}
                          >
                            <X className="h-3 w-3 cursor-pointer hover:text-blue-900" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm text-slate-700 mb-3">Thống kê</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng nhóm</span>
                <span className="text-slate-900">{totalGroups}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Đang hoạt động</span>
                <span className="text-emerald-600">{activeGroups}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Không hoạt động</span>
                <span className="text-gray-600">{inactiveGroups}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-slate-600">Tổng khách hàng</span>
                <span className="text-blue-600">{totalCustomers}</span>
              </div>
            </div>
          </div>

          {selectedCustomers.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={clearAllFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-blue-900 mb-1">Nhóm khách hàng</h1>
              <p className="text-sm text-slate-600">
                Quản lý phân loại khách hàng
              </p>
            </div>
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo mã nhm, tên nhóm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Danh sách nhóm khách hàng ({filteredGroups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã nhóm KH</TableHead>
                    <TableHead>Tên nhóm KH</TableHead>
                    <TableHead>Số khách hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        Không tìm thấy nhóm khách hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="text-slate-900">
                          {group.code}
                        </TableCell>
                        <TableCell className="text-slate-900">
                          {group.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {group.customers.length}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              group.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              group.status === "active"
                                ? "bg-emerald-500"
                                : "bg-red-500 text-white hover:bg-red-500"
                            }
                          >
                            {group.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(group)}
                              className="hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(group.id)}
                              className={
                                group.status === "active"
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              }
                              title={
                                group.status === "active"
                                  ? "Vô hiệu hóa"
                                  : "Kích hoạt"
                              }
                            >
                              {group.status === "active" ? (
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Dialog */}
      <CustomerGroupFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={editingGroup ? handleEditGroup : handleAddGroup}
        editingGroup={editingGroup}
        availableCustomers={availableCustomers}
      />
    </div>
  );
}
