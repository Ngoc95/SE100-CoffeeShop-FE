import { useState } from "react";
import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Power,
  PowerOff,
  Filter,
  X,
  Upload,
  Download,
  Printer,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner@2.0.3";
import { PromotionFormDialog } from "../PromotionFormDialog";

export type PromotionType =
  | "percentage"
  | "amount"
  | "fixed-price"
  | "free-item";

interface MenuItem {
  id: string;
  code: string;
  name: string;
  quantity?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Combo {
  id: string;
  name: string;
}

interface CustomerGroup {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  code: string;
  name: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  type: PromotionType;
  minOrderValue: number;
  maxDiscountValue?: number;
  promotionValue?: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  freeItems?: MenuItem[];
  applicableItems?: MenuItem[];
  applicableCategories?: Category[];
  applicableCombos?: Combo[];
  applicableCustomerGroups?: CustomerGroup[];
  applicableCustomers?: Customer[];
  status: "active" | "inactive";
}

export function Promotions() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('promotions:create');
  const canUpdate = hasPermission('promotions:update');
  const canDelete = hasPermission('promotions:delete');

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  
  // Sort state
  type SortField = "code" | "name" | "type" | "minOrderValue" | "promotionValue" | "maxDiscountValue" | "startDate" | "endDate" | "status";
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: "1",
      code: "KM001",
      name: "Giảm 20% cho hóa đơn trên 200k",
      type: "percentage",
      minOrderValue: 200000,
      maxDiscountValue: 50000,
      promotionValue: 20,
      startDate: "01/12/2024",
      startTime: "00:00",
      endDate: "31/12/2024",
      endTime: "23:59",
      applicableItems: [],
      applicableCategories: [],
      applicableCombos: [],
      applicableCustomerGroups: [],
      applicableCustomers: [],
      status: "active",
    },
    {
      id: "2",
      code: "KM002",
      name: "Giảm 50k cho đơn từ 300k",
      type: "amount",
      minOrderValue: 300000,
      promotionValue: 50000,
      startDate: "15/11/2024",
      startTime: "08:00",
      endDate: "15/12/2024",
      endTime: "22:00",
      applicableItems: [],
      applicableCategories: [],
      applicableCombos: [],
      applicableCustomerGroups: [],
      applicableCustomers: [],
      status: "active",
    },
    {
      id: "3",
      code: "KM003",
      name: "Tặng cà phê sữa cho HĐ trên 150k",
      type: "free-item",
      minOrderValue: 150000,
      startDate: "01/11/2024",
      startTime: "00:00",
      endDate: "30/11/2024",
      endTime: "23:59",
      freeItems: [{ id: "1", code: "CF001", name: "Cà phê sữa", quantity: 1 }],
      applicableItems: [],
      applicableCategories: [],
      applicableCombos: [],
      applicableCustomerGroups: [],
      applicableCustomers: [],
      status: "inactive",
    },
  ]);

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

  let filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || promo.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || promo.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredPromotions = [...filteredPromotions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "code") {
        aValue = a.code;
        bValue = b.code;
      } else if (sortField === "name") {
        aValue = a.name;
        bValue = b.name;
      } else if (sortField === "type") {
        // Sort by type enum value directly for consistency
        const typeOrder = { "percentage": 0, "amount": 1, "fixed-price": 2, "free-item": 3 };
        aValue = typeOrder[a.type] ?? 999;
        bValue = typeOrder[b.type] ?? 999;
      } else if (sortField === "minOrderValue") {
        aValue = a.minOrderValue;
        bValue = b.minOrderValue;
      } else if (sortField === "promotionValue") {
        aValue = a.promotionValue || 0;
        bValue = b.promotionValue || 0;
      } else if (sortField === "maxDiscountValue") {
        aValue = a.maxDiscountValue || 0;
        bValue = b.maxDiscountValue || 0;
      } else if (sortField === "startDate") {
        // Parse date string DD/MM/YYYY
        const aParts = a.startDate.split("/");
        const bParts = b.startDate.split("/");
        aValue = new Date(parseInt(aParts[2]), parseInt(aParts[1]) - 1, parseInt(aParts[0])).getTime();
        bValue = new Date(parseInt(bParts[2]), parseInt(bParts[1]) - 1, parseInt(bParts[0])).getTime();
      } else if (sortField === "endDate") {
        const aParts = a.endDate.split("/");
        const bParts = b.endDate.split("/");
        aValue = new Date(parseInt(aParts[2]), parseInt(aParts[1]) - 1, parseInt(aParts[0])).getTime();
        bValue = new Date(parseInt(bParts[2]), parseInt(bParts[1]) - 1, parseInt(bParts[0])).getTime();
      } else if (sortField === "status") {
        const statusOrder = { active: 0, inactive: 1 };
        aValue = statusOrder[a.status] ?? 0;
        bValue = statusOrder[b.status] ?? 0;
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

  const handleAddPromotion = (formData: Omit<Promotion, "id" | "code">) => {
    const newPromotion: Promotion = {
      id: Date.now().toString(),
      code: `KM${String(promotions.length + 1).padStart(3, "0")}`,
      ...formData,
    };
    setPromotions([...promotions, newPromotion]);
    setDialogOpen(false);
    toast.success("Đã thêm khuyến mại mới");
  };

  const handleEditPromotion = (formData: Omit<Promotion, "id" | "code">) => {
    if (!editingPromotion) return;
    setPromotions(
      promotions.map((p) =>
        p.id === editingPromotion.id ? { ...p, ...formData } : p
      )
    );
    setEditingPromotion(null);
    setDialogOpen(false);
    toast.success("Đã cập nhật khuyến mại");
  };

  const handleDeletePromotion = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khuyến mại này?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
      toast.success("Đã xóa khuyến mại");
    }
  };

  const handleToggleStatus = (id: string) => {
    setPromotions(
      promotions.map((promo) => {
        if (promo.id === id) {
          const newStatus = promo.status === "active" ? "inactive" : "active";
          toast.success(
            newStatus === "active"
              ? "Đã kích hoạt khuyến mại"
              : "Đã vô hiệu hóa khuyến mại"
          );
          return { ...promo, status: newStatus };
        }
        return promo;
      })
    );
  };

  const openEditDialog = (promo: Promotion) => {
    setEditingPromotion(promo);
    setDialogOpen(true);
  };

  const getPromotionTypeLabel = (type: PromotionType) => {
    switch (type) {
      case "percentage":
        return "Theo phần trăm";
      case "amount":
        return "Theo số tiền";
      case "fixed-price":
        return "Đồng giá";
      case "free-item":
        return "Tặng món";
      default:
        return "";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatPromotionValue = (promo: Promotion) => {
    if (promo.type === "free-item") {
      return (
        promo.freeItems
          ?.map(
            (item) =>
              `${item.name}${item.quantity ? ` (x${item.quantity})` : ""}`
          )
          .join(", ") || "-"
      );
    }
    if (promo.type === "percentage") {
      return `${promo.promotionValue}%`;
    }
    if (promo.type === "amount" || promo.type === "fixed-price") {
      return formatCurrency(promo.promotionValue || 0);
    }
    return "-";
  };

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(
    (p) => p.status === "active"
  ).length;
  const inactivePromotions = promotions.filter(
    (p) => p.status === "inactive"
  ).length;

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters & Stats */}
      <div className="w-64 bg-white border-r p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-600">
                  Loại khuyến mại
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="percentage">Theo phần trăm</SelectItem>
                    <SelectItem value="amount">Theo số tiền</SelectItem>
                    <SelectItem value="fixed-price">Đồng giá</SelectItem>
                    <SelectItem value="free-item">Tặng món</SelectItem>
                  </SelectContent>
                </Select>
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
                      id="promotion-status-all"
                      className="border-slate-300"
                    />
                    <Label
                      htmlFor="promotion-status-all"
                      className="text-l text-slate-700 cursor-pointer font-normal"
                    >
                      Tất cả trạng thái
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="active"
                      id="promotion-status-active"
                      className="border-slate-300"
                    />
                    <Label
                      htmlFor="promotion-status-active"
                      className="text-l text-slate-700 cursor-pointer font-normal"
                    >
                      Hoạt động
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="inactive"
                      id="promotion-status-inactive"
                      className="border-slate-300"
                    />
                    <Label
                      htmlFor="promotion-status-inactive"
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
                <span className="text-slate-600">Tổng khuyến mại</span>
                <span className="text-slate-900">{totalPromotions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Đang hoạt động</span>
                <span className="text-emerald-600">{activePromotions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Không hoạt động</span>
                <span className="text-gray-600">{inactivePromotions}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSelectedType("all");
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
              <h1 className="text-blue-900 text-2xl font-semibold mb-2">Khuyến mại</h1>
              <p className="text-slate-600 text-sm">
                Quản lý chương trình khuyến mại
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
                    setEditingPromotion(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khuyến mại
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo mã, tên khuyến mại..."
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
                Danh sách khuyến mại ({filteredPromotions.length})
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
                          Mã KM
                          {getSortIcon("code")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Tên KM
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Loại KM
                          {getSortIcon("type")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("minOrderValue")}
                      >
                        <div className="flex items-center">
                          Giá trị HĐ tối thiểu
                          {getSortIcon("minOrderValue")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("promotionValue")}
                      >
                        <div className="flex items-center">
                          Giá trị KM
                          {getSortIcon("promotionValue")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("maxDiscountValue")}
                      >
                        <div className="flex items-center">
                          Giá trị giảm tối đa
                          {getSortIcon("maxDiscountValue")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("startDate")}
                      >
                        <div className="flex items-center">
                          Ngày bắt đầu
                          {getSortIcon("startDate")}
                        </div>
                      </TableHead>
                      <TableHead className="text-sm">Giờ bắt đầu</TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("endDate")}
                      >
                        <div className="flex items-center">
                          Ngày kết thúc
                          {getSortIcon("endDate")}
                        </div>
                      </TableHead>
                      <TableHead className="text-sm">Giờ kết thúc</TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Trạng thái
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="text-sm text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredPromotions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-8 text-slate-500"
                      >
                        Không tìm thấy khuyến mại nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromotions.map((promo, index) => (
                      <TableRow key={promo.id}>
                        <TableCell className="text-sm text-slate-600 text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {promo.code}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {promo.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {getPromotionTypeLabel(promo.type)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {formatCurrency(promo.minOrderValue)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {formatPromotionValue(promo)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {promo.maxDiscountValue
                            ? formatCurrency(promo.maxDiscountValue)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {promo.startDate}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {promo.startTime}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {promo.endDate}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {promo.endTime}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge
                            variant={
                              promo.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              promo.status === "active"
                                ? "bg-emerald-500"
                                : "bg-red-500 text-white hover:bg-red-500"
                            }
                          >
                            {promo.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(promo)}
                                className="hover:bg-blue-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePromotion(promo.id)}
                                className="hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                            {canUpdate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(promo.id)}
                                className={
                                  promo.status === "active"
                                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                }
                                title={
                                  promo.status === "active"
                                    ? "Vô hiệu hóa"
                                    : "Kích hoạt"
                                }
                              >
                                {promo.status === "active" ? (
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
        </div>
      </div>

      {/* Form Dialog */}
      <PromotionFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingPromotion(null);
        }}
        onSubmit={editingPromotion ? handleEditPromotion : handleAddPromotion}
        editingPromotion={editingPromotion}
      />
    </div>
  );
}
