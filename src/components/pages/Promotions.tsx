import { useState } from "react";
import * as React from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );

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

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || promo.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || promo.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
                  <SelectTrigger className="mt-1">
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
                <Label className="text-xs text-slate-600">Trạng thái</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="mt-1">
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
              <h1 className="text-slate-900 mb-2">Khuyến mại</h1>
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
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo mã, tên khuyến mại..."
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
                Danh sách khuyến mại ({filteredPromotions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã KM</TableHead>
                    <TableHead>Tên KM</TableHead>
                    <TableHead>Loại KM</TableHead>
                    <TableHead>Giá trị HĐ tối thiểu</TableHead>
                    <TableHead>Giá trị KM</TableHead>
                    <TableHead>Giá trị giảm tối đa</TableHead>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Giờ bắt đầu</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead>Giờ kết thúc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="text-center py-8 text-slate-500"
                      >
                        Không tìm thấy khuyến mại nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="text-slate-900">
                          {promo.code}
                        </TableCell>
                        <TableCell className="text-slate-900">
                          {promo.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {getPromotionTypeLabel(promo.type)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatCurrency(promo.minOrderValue)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatPromotionValue(promo)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {promo.maxDiscountValue
                            ? formatCurrency(promo.maxDiscountValue)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {promo.startDate}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {promo.startTime}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {promo.endDate}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {promo.endTime}
                        </TableCell>
                        <TableCell>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(promo)}
                              className="hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePromotion(promo.id)}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
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
