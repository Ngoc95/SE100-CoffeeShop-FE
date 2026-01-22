import { useState, useEffect } from "react";
import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Pencil, Trash2, Search, Power, PowerOff, Filter, X, Upload, Download, Printer, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";
import { AddPromotion, EditPromotion, PromotionAddFormDialog, PromotionEditFormDialog } from "../PromotionFormDialog";
import { createPromotion, updatePromotion, deletePromotion, getPromotions, PromotionsQuery, getPromotionById, updatePercentagePromotion, updateAmountPromotion, updateSamePricePromotion, updateGiftPromotion, createPercentagePromotion, createAmountPromotion, createSamePricePromotion, createGiftPromotion } from "../../api/promotions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useDebounce } from "../../hooks/useDebounce";

export const PromotionTypes: Record<number, string> = {
  1: "Theo phần trăm",
  2: "Theo số tiền",
  3: "Đồng giá",
  4: "Tặng món"
}

interface Item {
  id: number;
  code: string;
  name: string;
}

interface Category {
  id: string;
  code: string;
  name: string;
}

interface Combo {
  id: number;
  code: string;
  name: string;
}

interface CustomerGroup {
  id: number;
  code: string;
  name: string;
}

interface Customer {
  id: string;
  code: string;
  name: string;
}

interface ApplicableDetail {
  applicableItems: Item[],
  applicableCategories: Category[],
  applicableCombos: Combo[],
  applicableCustomers: Customer[],
  applicableCustomerGroups: CustomerGroup[],
  giftItems: Item[]
}

export interface Promotion {
  id: number,
  code: string
  name: string,
  description: string,
  discountValue: number,
  minOrderValue: number,
  maxDiscount: number,
  buyQuantity: number,
  getQuantity: number,
  requireSameItem: boolean,
  startDateTime: string,
  endDateTime: string,
  maxTotalUsage: number,
  maxUsagePerCustomer: number,
  currentTotalUsage: number,
  isActive: boolean,
  applyToAllItems: boolean,
  applyToAllCategories: boolean,
  applyToAllCombos: boolean,
  applyToAllCustomers: boolean,
  applyToAllCustomerGroups: boolean,
  applyToWalkIn: boolean,
  createdAt: string,
  updatedAt: string,
  deletedAt: string | null,
  typeId: number,
  typeName: string
}

const formatCurrency = (value: number) => {
  if (typeof value !== "number") return value;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// const PromotionDetails = ({ promotion }: { promotion: Promotion }) => {
//   const DetailItem = ({
//     label,
//     value,
//     className = "",
//   }: {
//     label: string;
//     value: React.ReactNode;
//     className?: string;
//   }) => (
//     <div className={className}>
//       <p className="text-sm text-slate-500">{label}</p>
//       <p className="text-base font-semibold text-slate-800">{value || "-"}</p>
//     </div>
//   );

//   const renderList = (title: string, items: any[] | undefined) => {
//     if (!items || items.length === 0) return null;
//     return (
//       <div>
//         <h4 className="text-base font-semibold text-slate-700 mb-2">{title}</h4>
//         <ul className="list-disc pl-5 space-y-1 text-slate-600">
//           {items.map((item, index) => (
//             <li key={index}>
//               {item.code && (
//                 <span className="font-mono bg-slate-200 text-slate-700 text-xs rounded px-1.5 py-0.5 mr-2">
//                   {item.code}
//                 </span>
//               )}
//               {item.name}
//               {item.quantity && (
//                 <span className="text-slate-500">
//                   {" "}
//                   (Số lượng: {item.quantity})
//                 </span>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   };

//   const formatPromotionValue = (promo: Promotion) => {
//     if (promo.type === "free-item") {
//       return (
//         promo.freeItems
//           ?.map(
//             (item) =>
//               `${item.name}${item.quantity ? ` (x${item.quantity})` : ""}`
//           )
//           .join(", ") || "-"
//       );
//     }
//     if (promo.type === "percentage") {
//       return `${promo.promotionValue}%`;
//     }
//     if (promo.type === "amount" || promo.type === "fixed-price") {
//       return formatCurrency(promo.promotionValue || 0);
//     }
//     return "-";
//   };

//   const hasApplicableItems =
//     (promotion.applicableItems && promotion.applicableItems.length > 0) ||
//     (promotion.applicableCategories &&
//       promotion.applicableCategories.length > 0) ||
//     (promotion.applicableCombos && promotion.applicableCombos.length > 0);

//   const hasCustomerConditions =
//     (promotion.applicableCustomerGroups &&
//       promotion.applicableCustomerGroups.length > 0) ||
//     (promotion.applicableCustomers && promotion.applicableCustomers.length > 0);

//   const hasFreebies = promotion.freeItems && promotion.freeItems.length > 0;

//   return (
//     <div className="bg-slate-50 p-6 border-t border-slate-200">
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-6">
//         <DetailItem label="Mã khuyến mại" value={promotion.code} />
//         <DetailItem
//           label="Tên khuyến mại"
//           value={promotion.name}
//           className="col-span-2"
//         />
//         <DetailItem
//           label="Loại khuyến mại"
//           value={getPromotionTypeLabel(promotion.type)}
//         />
//         <DetailItem
//           label="Giá trị"
//           value={formatPromotionValue(promotion)}
//           className="col-span-2"
//         />
//         <DetailItem
//           label="Giá trị hóa đơn tối thiểu"
//           value={formatCurrency(promotion.minOrderValue)}
//         />
//         {promotion.maxDiscountValue && promotion.maxDiscountValue > 0 ? (
//           <DetailItem
//             label="Giảm giá tối đa"
//             value={formatCurrency(promotion.maxDiscountValue)}
//           />
//         ) : <div />}

//         <div className="col-span-1">
//           <p className="text-sm text-slate-500">Bắt đầu</p>
//           <p className="text-base font-semibold text-slate-800">
//             {promotion.startDate} {promotion.startTime}
//           </p>
//         </div>
//         <div className="col-span-1">
//           <p className="text-sm text-slate-500">Kết thúc</p>
//           <p className="text-base font-semibold text-slate-800">
//             {promotion.endDate} {promotion.endTime}
//           </p>
//         </div>
//         <div className="col-span-full">
//           <p className="text-sm text-slate-500">Trạng thái</p>
//           <Badge
//             variant={promotion.status === "active" ? "default" : "secondary"}
//             className={
//               promotion.status === "active"
//                 ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
//                 : "bg-red-100 text-red-800 border border-red-300"
//             }
//           >
//             {promotion.status === "active"
//               ? "Đang hoạt động"
//               : "Không hoạt động"}
//           </Badge>
//         </div>
//       </div>

//       {(hasFreebies || hasApplicableItems || hasCustomerConditions) && (
//         <div className="mt-6 pt-6 border-t border-slate-200">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {renderList("Món tặng", promotion.freeItems)}
//             {renderList("Sản phẩm áp dụng", promotion.applicableItems)}
//             {renderList("Danh mục áp dụng", promotion.applicableCategories)}
//             {renderList("Combo áp dụng", promotion.applicableCombos)}
//             {renderList(
//               "Nhóm khách hàng áp dụng",
//               promotion.applicableCustomerGroups
//             )}
//             {renderList("Khách hàng áp dụng", promotion.applicableCustomers)}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

export function Promotions() {


  const { hasPermission } = useAuth();
  const canCreate = hasPermission('promotions:create');
  const canUpdate = hasPermission('promotions:update');
  const canDelete = hasPermission('promotions:delete');

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [ediDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<EditPromotion>({
    id: 0,
    code: "",
    name: "",
    description: "",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    buyQuantity: 0,
    getQuantity: 0,
    requireSameItem: false,
    startDateTime: "2026-01-01T00:00:00Z",
    endDateTime: "2026-01-01T00:00:00Z",
    maxTotalUsage: 0,
    maxUsagePerCustomer: 0,
    currentTotalUsage: 0,
    isActive: true,

    applyToAllItems: false,
    applyToAllCategories: false,
    applyToAllCombos: false,
    applyToAllCustomers: false,
    applyToAllCustomerGroups: false,
    applyToWalkIn: false,

    applicableItemIds: [],
    applicableCategoryIds: [],
    applicableComboIds: [],
    applicableCustomerIds: [],
    applicableCustomerGroupIds: [],
    giftItemIds: [],

    typeId: 1

  });
  const [expandedRows, setExpandedRows] = useState<string>();
  const [currentApplicableDetail, setCurrentApplicableDetail] = useState<ApplicableDetail>()

  // Sort state
  // type SortField =
  //   | "code"
  //   | "name"
  //   | "type"
  //   | "minOrderValue"
  //   | "promotionValue"
  //   | "maxDiscountValue"
  //   | "startDate"
  //   | "endDate"
  //   | "status";
  // type SortOrder = "asc" | "desc" | "none";
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("none");

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Map backend promotion to UI shape
  // const mapBEToUI = (p: any): Promotion => {
  //   const typeMap: Record<string, PromotionType> = {
  //     percentage: "percentage",
  //     fixed: "amount",
  //     amount: "amount",
  //     item: "free-item",
  //     "fixed-price": "fixed-price",
  //     "free-item": "free-item",
  //   };
  //   const start = p.startDate || p.startTime || p.startAt;
  //   const end = p.endDate || p.endTime || p.endAt;
  //   const parseDate = (dt: any) => {
  //     if (!dt) return { d: "", t: "" };
  //     const dateObj = typeof dt === "string" ? new Date(dt) : dt;
  //     const d = dateObj.toLocaleDateString("vi-VN");
  //     const t = dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  //     return { d, t };
  //   };
  //   const sd = parseDate(start);
  //   const ed = parseDate(end);
  //   return {
  //     id: String(p.id ?? p.code ?? Math.random()),
  //     code: String(p.code ?? p.promotionCode ?? p.id ?? ""),
  //     name: String(p.name ?? p.title ?? "Khuyến mãi"),
  //     type: typeMap[String(p.type ?? p.typeId ?? "percentage").toLowerCase()] ?? "percentage",
  //     minOrderValue: Number(p.minOrderValue ?? 0),
  //     maxDiscountValue: p.maxDiscountValue != null ? Number(p.maxDiscountValue) : undefined,
  //     promotionValue: p.value != null ? Number(p.value) : (p.promotionValue != null ? Number(p.promotionValue) : undefined),
  //     startDate: sd.d,
  //     startTime: sd.t,
  //     endDate: ed.d,
  //     endTime: ed.t,
  //     freeItems: Array.isArray(p.freeItems) ? p.freeItems : [],
  //     applicableItems: Array.isArray(p.applicableItems) ? p.applicableItems : [],
  //     applicableCategories: Array.isArray(p.applicableCategories) ? p.applicableCategories : [],
  //     applicableCombos: Array.isArray(p.applicableCombos) ? p.applicableCombos : [],
  //     applicableCustomerGroups: Array.isArray(p.applicableCustomerGroups) ? p.applicableCustomerGroups : [],
  //     applicableCustomers: Array.isArray(p.applicableCustomers) ? p.applicableCustomers : [],
  //     status: Boolean(p.isActive ?? p.status === "active") ? "active" : "inactive",
  //   };
  // };

  // const loadPromotions = async () => {
  //   setIsLoading(true);
  //   try {
  //     const res = await fetchPromotions();
  //     const data = (res as any)?.data ?? res;
  //     const items =
  //       data?.metaData?.items ??
  //       data?.metaData?.data?.items ??
  //       data?.data?.items ??
  //       data?.items ??
  //       data?.metaData ??
  //       (Array.isArray(data) ? data : []);
  //     const list: any[] = Array.isArray(items) ? items : [];
  //     setPromotions(list.map(mapBEToUI));
  //   } catch (err: any) {
  //     toast.error("Không tải được danh sách khuyến mãi", { description: err?.message || "Lỗi kết nối API" });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchPromotionData = async () => {
    const params: PromotionsQuery = {
      sort: sortOrder !== "none" && sortBy ? sortOrder + sortBy : "+code"
    };

    if (debouncedSearchQuery) {
      params.search = debouncedSearchQuery;
    }

    if (selectedType !== "all") {
      switch (selectedType) {
        case "percentage": params.typeId = 1; break;
        case "amount": params.typeId = 2; break;
        case "fixed-price": params.typeId = 3; break;
        case "fixed": params.typeId = 3; break; // Handle potential mismatch
        case "free-item": params.typeId = 4; break;
        case "item": params.typeId = 4; break;
      }
    }

    if (selectedStatus !== "all") {
      params.isActive = selectedStatus === "active";
    }

    try {
      setIsLoading(true);
      const res = await getPromotions(params);
      if (res && res.data && res.data.metaData) {
        const { promotions } = res.data.metaData;
        if (promotions) {
          setPromotions(promotions);
        }
      }
    } catch (error) {
      console.log("Error when fetching promotions: ", error);
      toast.error("Không thể tải danh sách khuyến mại");
    } finally {
      setIsLoading(false);
    }
  }

  const getCurrentApplicableDetail = async (id: number) => {
    const res = await getPromotionById(id);
    if (!res) return;
    const { applicableItems, applicableCategories, applicableCombos, applicableCustomers, applicableCustomerGroups, giftItems } = res.data.metaData.promotion
    let applicableDetail: ApplicableDetail = {
      applicableItems: applicableItems,
      applicableCategories: applicableCategories,
      applicableCombos: applicableCombos,
      applicableCustomers: applicableCustomers,
      applicableCustomerGroups: applicableCustomerGroups,
      giftItems: giftItems
    }
    setCurrentApplicableDetail(applicableDetail)
  }

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchPromotionData();
  }, [debouncedSearchQuery, selectedType, selectedStatus, sortBy, sortOrder]);

  // Initial fetch is covered by the above useEffect because dependencies are initialized


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

    // Sorting is handled by useEffect dependency on sortBy/sortOrder
    // setSortOrder/setSortBy updates state -> trigger useEffect -> fetchPromotionData

  };

  // Removed manual handleApplyFilter as it's now automatic


  const getSortIcon = (field: string) => {
    if (sortBy !== field || sortOrder === "none") {
      return null;
    }
    if (sortOrder === "+") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  const getStatusBadge = (status: true | false) => {
    if (status === true) {
      return <Badge className="bg-emerald-500">Hoạt động</Badge>;
    }
    return <Badge className="bg-red-500">Không hoạt động</Badge>;
  };

  const toggleExpand = (id: string) => {
    // setExpandedRows((prev) =>
    //   prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    // );
    if (id === expandedRows) {
      setExpandedRows("")
    }
    else
      setExpandedRows(id)
  };

  // let filteredPromotions = promotions.filter((promo) => {
  //   const matchesSearch =
  //     promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     promo.name.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesType = selectedType === "all" || promo.type === selectedType;
  //   const matchesStatus =
  //     selectedStatus === "all" || promo.status === selectedStatus;
  //   return matchesSearch && matchesType && matchesStatus;
  // });

  // Apply sorting
  // if (sortField && sortOrder !== "none") {
  //   filteredPromotions = [...filteredPromotions].sort((a, b) => {
  //     let aValue: any;
  //     let bValue: any;

  //     if (sortField === "code") {
  //       aValue = a.code;
  //       bValue = b.code;
  //     } else if (sortField === "name") {
  //       aValue = a.name;
  //       bValue = b.name;
  //     } else if (sortField === "type") {
  //       // Sort by type enum value directly for consistency
  //       const typeOrder = {
  //         percentage: 0,
  //         amount: 1,
  //         "fixed-price": 2,
  //         "free-item": 3,
  //       };
  //       aValue = typeOrder[a.type] ?? 999;
  //       bValue = typeOrder[b.type] ?? 999;
  //     } else if (sortField === "minOrderValue") {
  //       aValue = a.minOrderValue;
  //       bValue = b.minOrderValue;
  //     } else if (sortField === "promotionValue") {
  //       aValue = a.promotionValue || 0;
  //       bValue = b.promotionValue || 0;
  //     } else if (sortField === "maxDiscountValue") {
  //       aValue = a.maxDiscountValue || 0;
  //       bValue = b.maxDiscountValue || 0;
  //     } else if (sortField === "startDate") {
  //       // Parse date string DD/MM/YYYY
  //       const aParts = a.startDate.split("/");
  //       const bParts = b.startDate.split("/");
  //       aValue = new Date(
  //         parseInt(aParts[2]),
  //         parseInt(aParts[1]) - 1,
  //         parseInt(aParts[0])
  //       ).getTime();
  //       bValue = new Date(
  //         parseInt(bParts[2]),
  //         parseInt(bParts[1]) - 1,
  //         parseInt(bParts[0])
  //       ).getTime();
  //     } else if (sortField === "endDate") {
  //       const aParts = a.endDate.split("/");
  //       const bParts = b.endDate.split("/");
  //       aValue = new Date(
  //         parseInt(aParts[2]),
  //         parseInt(aParts[1]) - 1,
  //         parseInt(aParts[0])
  //       ).getTime();
  //       bValue = new Date(
  //         parseInt(bParts[2]),
  //         parseInt(bParts[1]) - 1,
  //         parseInt(bParts[0])
  //       ).getTime();
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

  // Removed manual handleSearch as it's now automatic via debounce


  const handleAddPromotion = async (formData: Omit<Promotion, "id" | "code">) => {
    // try {
    //   const payload = {
    //     code: `KM${String(promotions.length + 1).padStart(3, "0")}`,
    //     name: formData.name,
    //     description: "",
    //     type: formData.type === "percentage" ? "percentage" : formData.type === "amount" ? "fixed" : formData.type === "free-item" ? "item" : "fixed",
    //     value: Number(formData.promotionValue || 0),
    //     minOrderValue: Number(formData.minOrderValue || 0),
    //     isActive: formData.status === "active",
    //   };
    //   await createPromotion(payload as any);
    //   toast.success("Đã thêm khuyến mại mới");
    //   setDialogOpen(false);
    //   loadPromotions();
    // } catch (err: any) {
    //   toast.error("Thêm khuyến mãi thất bại", { description: err?.message || "API lỗi" });
    // }
  };

  const validateSubmitEdit = (formData: EditPromotion) => {
    return true;
  }

  const validateSubmitAdd = (formData: AddPromotion) => {
    return true;
  }

  const handleSubmitEdit = async (formData: EditPromotion) => {
    if (!formData) return;

    if (!validateSubmitEdit(formData)) return;

    console.log("Edit form: ", formData)

    try {
      switch (formData.typeId) {
        case 1:
          await updatePercentagePromotion(formData.id, {
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            discountValue: formData.discountValue,
            minOrderValue: formData.minOrderValue,
            maxDiscount: formData.maxDiscount,
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          })
          break;
        case 2:
          await updateAmountPromotion(formData.id, {
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            discountValue: formData.discountValue,
            minOrderValue: formData.minOrderValue,
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          })
          break;
        case 3:
          await updateSamePricePromotion(formData.id, {
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            discountValue: formData.discountValue,
            minOrderValue: formData.minOrderValue,
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          }
          )
          break;
        case 4:
          await updateGiftPromotion(formData.id, {
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            buyQuantity: formData.buyQuantity,
            getQuantity: formData.getQuantity,
            requireSameItem: formData.requireSameItem, //nếu true thì phải là 2 ly phải là cùng 1 item trong danh sách sản phẩm áp dụng
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          })
          break;
      }

      toast.success("Cập nhật khuyến mại thành công");
      await fetchPromotionData()
      setEditDialogOpen(false);
    }
    catch (error: any) {
      toast.error("Cập nhật khuyến mại thất bại. Lỗi: " + error.response?.data?.message);
    }
  };

  const handleSubmitAdd = async (formData: AddPromotion) => {
    if (!formData) return;

    if (!validateSubmitAdd(formData)) return;

    console.log("Add form: ", formData)

    try {
      switch (formData.typeId) {
        case 1:
          await createPercentagePromotion({
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            discountValue: formData.discountValue,
            minOrderValue: formData.minOrderValue,
            maxDiscount: formData.maxDiscount,
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          })
          break;
        case 2:
          await createAmountPromotion({
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            discountValue: formData.discountValue,
            minOrderValue: formData.minOrderValue,
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          })
          break;
        case 3:
          await createSamePricePromotion({
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            discountValue: formData.discountValue,
            minOrderValue: formData.minOrderValue,
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          }
          )
          break;
        case 4:
          await createGiftPromotion({
            name: formData.name,
            description: formData.description,
            typeId: formData.typeId,
            buyQuantity: formData.buyQuantity,
            getQuantity: formData.getQuantity,
            requireSameItem: formData.requireSameItem, //nếu true thì phải là 2 ly phải là cùng 1 item trong danh sách sản phẩm áp dụng
            startDateTime: formData.startDateTime,
            endDateTime: formData.endDateTime,
            maxTotalUsage: formData.maxTotalUsage ?? 0,
            maxUsagePerCustomer: formData.maxUsagePerCustomer ?? 0,
            isActive: formData.isActive,
            applyToAllItems: formData.applyToAllItems,
            applyToAllCategories: formData.applyToAllCategories,
            applyToAllCombos: formData.applyToAllCombos,
            applyToAllCustomers: formData.applyToAllCustomers,
            applyToAllCustomerGroups: formData.applyToAllCustomerGroups,
            applyToWalkIn: formData.applyToWalkIn,
            applicableItemIds: formData.applicableItemIds,
            applicableCategoryIds: formData.applicableCategoryIds,
            applicableComboIds: formData.applicableComboIds,
            applicableCustomerIds: formData.applicableCustomerIds,
            applicableCustomerGroupIds: formData.applicableCustomerGroupIds,
            giftItemIds: formData.giftItemIds
          })
          break;
      }

      toast.success("Thêm khuyến mại thành công");
      await fetchPromotionData()
      setAddDialogOpen(false);
    }
    catch (error: any) {
      toast.error("Thêm khuyến mại thất bại. Lỗi: " + error.response?.data?.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa khuyến mại này?")) {
      await deletePromotion(id)
      fetchPromotionData()
    }
  };

  // const handleToggleStatus = async (id: string) => {
  //   const promo = promotions.find(p => p.id === id);
  //   if (!promo) return;
  //   const newStatus = promo.status === "active" ? "inactive" : "active";
  //   try {
  //     await updatePromotion(id, { isActive: newStatus === "active" } as any);
  //     toast.success(newStatus === "active" ? "Đã kích hoạt khuyến mại" : "Đã vô hiệu hóa khuyến mại");
  //     loadPromotions();
  //   } catch (err: any) {
  //     toast.error("Cập nhật trạng thái thất bại", { description: err?.message || "API lỗi" });
  //   }
  // };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion({
      id: promo.id,
      code: promo.code,
      name: promo.name,
      description: promo.description,
      discountValue: promo.discountValue,
      minOrderValue: promo.minOrderValue,
      maxDiscount: promo.maxDiscount,
      buyQuantity: promo.buyQuantity,
      getQuantity: promo.getQuantity,
      requireSameItem: promo.requireSameItem,
      startDateTime: promo.startDateTime,
      endDateTime: promo.endDateTime,
      maxTotalUsage: promo.maxTotalUsage,
      maxUsagePerCustomer: promo.maxUsagePerCustomer,
      currentTotalUsage: promo.currentTotalUsage,
      isActive: promo.isActive,
      applyToAllItems: promo.applyToAllItems,
      applyToAllCategories: promo.applyToAllCategories,
      applyToAllCombos: promo.applyToAllCombos,
      applyToAllCustomers: promo.applyToAllCustomers,
      applyToAllCustomerGroups: promo.applyToAllCustomerGroups,
      applyToWalkIn: promo.applyToWalkIn,
      applicableItemIds: [],
      applicableCategoryIds: [],
      applicableComboIds: [],
      applicableCustomerIds: [],
      applicableCustomerGroupIds: [],
      giftItemIds: [],
      typeId: promo.typeId
    });
    setEditDialogOpen(true);
  };

  // const getPromotionTypeLabel = (type: PromotionType) => {
  //   switch (type) {
  //     case "percentage":
  //       return "Theo phần trăm";
  //     case "amount":
  //       return "Theo số tiền";
  //     case "fixed-price":
  //       return "Đồng giá";
  //     case "free-item":
  //       return "Tặng món";
  //     default:
  //       return "";
  //   }
  // };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // const formatPromotionValue = (promo: Promotion) => {
  //   if (promo.type === "free-item") {
  //     return (
  //       promo.freeItems
  //         ?.map(
  //           (item) =>
  //             `${item.name}${item.quantity ? ` (x${item.quantity})` : ""}`
  //         )
  //         .join(", ") || "-"
  //     );
  //   }
  //   if (promo.type === "percentage") {
  //     return `${promo.promotionValue}%`;
  //   }
  //   if (promo.type === "amount" || promo.type === "fixed-price") {
  //     return formatCurrency(promo.promotionValue || 0);
  //   }
  //   return "-";
  // };



  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(p => p.isActive).length;

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Khuyến mại</h1>
          <p className="text-slate-600 text-sm">
            Quản lý chương trình khuyến mại
          </p>
        </div>
        <div className="flex items-center gap-3">

          {canCreate && (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // setEditingPromotion(null);
                setAddDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo khuyến mại
            </Button>
          )}
        </div>
      </div>

      {/* Stats - Moved to top */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-600">Thống kê</Label>
        <div className="bg-white border border-slate-200 rounded-lg p-3 flex gap-8 w-fit items-center shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Tổng số khuyến mại:</span>
            <span className="font-medium text-slate-900">{totalPromotions}</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Đang hoạt động:</span>
            <span className="font-medium text-emerald-600">{activePromotions}</span>
          </div>
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
                  className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
              {/* Removed manual search button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {(selectedType !== "all" || selectedStatus !== "all") && (
                  <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {(selectedType !== "all" ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">
                      Loại khuyến mại
                    </Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
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
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedType("all");
                      setSelectedStatus("all");
                      setSearchQuery("");
                      // filter reset will trigger useEffect
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
            Danh sách khuyến mại ({promotions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16 text-sm text-center">
                    STT
                  </TableHead>
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
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("endDate")}
                  >
                    <div className="flex items-center">
                      Ngày kết thúc
                      {getSortIcon("endDate")}
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">Trạng thái</TableHead>
                  <TableHead className="text-sm text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      className="text-center py-8 text-slate-500"
                    >
                      Không tìm thấy khuyến mại nào
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((promo, index) => {
                    const isExpanded = expandedRows === promo.code;
                    return (
                      <React.Fragment key={promo.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => toggleExpand(promo.code)}
                        >
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event: React.MouseEvent) => {
                                event.stopPropagation();
                                toggleExpand(promo.code);
                              }}
                              className="hover:bg-slate-200"
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
                            {promo.code}
                          </TableCell>
                          <TableCell className="text-sm text-slate-900">
                            {promo.name}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {PromotionTypes[promo.typeId]}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {formatCurrency(promo.minOrderValue)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {(promo.discountValue)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {promo.maxDiscount
                              ? formatCurrency(promo.maxDiscount)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {formatDate(promo.startDateTime)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {formatDate(promo.endDateTime)}
                          </TableCell>
                          <TableCell className="text-sm">{getStatusBadge(promo.isActive)}</TableCell>
                          <TableCell className="text-sm text-right">
                            <div className="flex items-center justify-center gap-2">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleEdit(promo); }}
                                  className="hover:bg-blue-100"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(promo.id); }}
                                  className="hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                              {/* {canUpdate && (
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
                              )} */}
                            </div>
                          </TableCell>
                        </TableRow>
                        {
                          isExpanded && (
                            <TableRow className="bg-white">
                              <TableCell colSpan={14} className="p-4 bg-slate-50">
                                <Tabs defaultValue="info">
                                  <TabsList>
                                    <TabsTrigger value="info">Thông tin</TabsTrigger>
                                    <TabsTrigger value="apply-range" onClick={() => getCurrentApplicableDetail(promo.id)}>Phạm vi áp dụng</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="info">
                                    <div className="grid grid-cols-2 gap-4 py-4">
                                      <div className="text-sm">
                                        <span className="font-semibold">Mã KM:</span> {promo.code}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Tên KM:</span> {promo.name}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Loại KM:</span> {promo.typeName}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Mô tả:</span> {promo.description}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Giá trị KM:</span> {promo.discountValue != null ? promo.discountValue.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Giá trị hóa đơn tối thiểu:</span> {promo.minOrderValue != null ? promo.minOrderValue.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Giá trị giảm tối đa:</span> {promo.maxDiscount != null ? promo.maxDiscount.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Số lượng mua:</span> {promo.buyQuantity != null ? promo.buyQuantity.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Số lượng nhận:</span> {promo.getQuantity != null ? promo.getQuantity.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Yêu cầu cùng mặc hàng:</span> {promo.requireSameItem != null ? (promo.requireSameItem ? "Có" : "Không") : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Ngày bắt đầu:</span> {formatDate(promo.startDateTime)}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Ngày kết thúc:</span> {formatDate(promo.endDateTime)}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Tổng số lượng tối đa:</span> {promo.maxTotalUsage != null ? promo.maxTotalUsage.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Số lượng tối đa mỗi khách:</span> {promo.maxUsagePerCustomer != null ? promo.maxUsagePerCustomer.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Đã dùng:</span> {promo.currentTotalUsage != null ? promo.currentTotalUsage.toLocaleString() : "-"}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-semibold">Trạng thái:</span>{" "}
                                        <Badge
                                          variant={promo.isActive === true ? "default" : "secondary"}
                                          className={
                                            promo.isActive === true
                                              ? "bg-green-500 text-white"
                                              : "bg-red-500 text-white"
                                          }
                                        >
                                          {promo.isActive === true ? "Hoạt động" : "Không hoạt động"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="apply-range">
                                    <div className="py-4 gap-4 grid grid-cols-2">
                                      <div className="border rounded-md bg-white">
                                        <div className="p-3 font-medium">Mặt hàng áp dụng</div>
                                        {
                                          promo.applyToAllItems ? (
                                            <div className="px-6 py-3">Toàn bộ mặt hàng</div>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
                                                <div>Mã mặt hàng</div>
                                                <div>Tên mặt hàng</div>
                                              </div>

                                              {currentApplicableDetail?.applicableItems.map((item) => (
                                                <div key={item.id} className="grid grid-cols-3 p-2 border-t">
                                                  <div>{item.code}</div>
                                                  <div>{item.name}</div>
                                                </div>
                                              ))}
                                            </>
                                          )
                                        }

                                      </div>
                                      <div className="border rounded-md bg-white">
                                        <div className="p-3 font-medium">Danh mục áp dụng</div>
                                        {
                                          promo.applyToAllItems ? (
                                            <div className="px-6 py-3">Toàn bộ danh mục</div>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
                                                <div>Tên danh mục</div>
                                              </div>

                                              {currentApplicableDetail?.applicableCategories.map((item, index) => (
                                                <div key={index} className="grid grid-cols-3 p-2 border-t">
                                                  <div>{item.name}</div>
                                                </div>
                                              ))}
                                            </>
                                          )
                                        }
                                      </div>
                                      <div className="border rounded-md bg-white">
                                        <div className="p-3 font-medium">Combo áp dụng</div>
                                        {
                                          promo.applyToAllItems ? (
                                            <div className="px-6 py-3">Toàn bộ combo</div>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
                                                <div>Mã combo</div>
                                                <div>Tên combo</div>
                                              </div>

                                              {currentApplicableDetail?.applicableCombos.map((item) => (
                                                <div key={item.id} className="grid grid-cols-3 p-2 border-t">
                                                  <div>{item.code}</div>
                                                  <div>{item.name}</div>
                                                </div>
                                              ))}
                                            </>
                                          )
                                        }
                                      </div>
                                      <div className="border rounded-md bg-white">
                                        <div className="p-3 font-medium">Khách hàng áp dụng</div>
                                        {
                                          promo.applyToAllItems ? (
                                            <div className="px-6 py-3">Toàn bộ khách hàng</div>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
                                                <div>Mã khách hàng</div>
                                                <div>Tên khách hàng</div>
                                              </div>

                                              {currentApplicableDetail?.applicableCustomers.map((item) => (
                                                <div key={item.id} className="grid grid-cols-3 p-2 border-t">
                                                  <div>{item.code}</div>
                                                  <div>{item.name}</div>
                                                </div>
                                              ))}
                                            </>
                                          )
                                        }
                                      </div>
                                      <div className="border rounded-md bg-white">
                                        <div className="p-3 font-medium">Nhóm khách hàng áp dụng</div>
                                        {
                                          promo.applyToAllItems ? (
                                            <div className="px-6 py-3">Toàn bộ nhóm khách hàng</div>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
                                                <div>Mã nhóm khách hàng</div>
                                                <div>Tên nhóm khách hàng</div>
                                              </div>

                                              {currentApplicableDetail?.applicableCustomerGroups.map((item) => (
                                                <div key={item.id} className="grid grid-cols-3 p-2 border-t">
                                                  <div>{item.code}</div>
                                                  <div>{item.name}</div>
                                                </div>
                                              ))}
                                            </>
                                          )
                                        }
                                      </div>
                                      <div className="border rounded-md bg-white">
                                        <div className="p-3 font-medium">Mặt hàng tặng</div>
                                        {
                                          promo.applyToAllItems ? (
                                            <div className="px-6 py-3">Không có mặt hàng tặng</div>
                                          ) : (
                                            <>
                                              <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
                                                <div>Mã mặt hàng</div>
                                                <div>Tên mặt hàng</div>
                                              </div>

                                              {currentApplicableDetail?.giftItems.map((item) => (
                                                <div key={item.id} className="grid grid-cols-3 p-2 border-t">
                                                  <div>{item.code}</div>
                                                  <div>{item.name}</div>
                                                </div>
                                              ))}
                                            </>
                                          )
                                        }

                                      </div>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </TableCell>
                            </TableRow>
                          )
                        }
                      </React.Fragment>
                    )
                  }
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>



      {/* Form Dialog */}

      <PromotionEditFormDialog
        open={ediDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          // setEditingPromotion(editingPromotion);
        }}
        onSubmit={(editingPromotion) => { handleSubmitEdit(editingPromotion) }}
        // onSubmit={editingPromotion ? handleEditPromotion : handleAddPromotion}
        editingPromotion={editingPromotion}
      />


      <PromotionAddFormDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          // setEditingPromotion(editingPromotion);
        }}
        onSubmit={(addPromotion) => { handleSubmitAdd(addPromotion) }}
      // onSubmit={editingPromotion ? handleEditPromotion : handleAddPromotion}
      />
    </div >
  );
}
