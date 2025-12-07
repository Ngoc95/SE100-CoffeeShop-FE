import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Upload,
  RotateCcw,
  X,
  Package,
  Trash2,
  Calendar as CalendarIcon,
  Printer,
  Pencil,
  Save,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Calendar } from "../ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../../contexts/AuthContext";
import { categories } from "../../data/categories";

interface BatchInfo {
  batchCode: string;
  quantity: number;
  unitCost: number;
  entryDate: string;
  expiryDate?: string;
  supplier: string;
}

interface InventoryItem {
  id: string;
  name: string;
  type: "ingredient" | "ready-made" | "composite";
  category: string;
  currentStock: number;
  unit: string;
  batches?: BatchInfo[];
}

interface PurchaseReturnItem {
  name: string;
  batchCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  reason: string;
}

interface ReturnItemForm {
  productId: string;
  productName: string;
  batchCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  reason: string;
}

interface PurchaseReturn {
  id: number;
  code: string;
  purchaseCode: string;
  date: string;
  supplier: string;
  supplierId?: string;
  items: number;
  returnAmount: number; // Tổng giá trị trả
  paidAmount: number; // Số tiền NCC đã trả
  debtAmount: number; // Số tiền còn nợ NCC (âm)
  reason: string;
  status: "completed" | "draft" | "cancelled"; // Đã trả hàng, Phiếu tạm, Đã huỷ
  paymentMethod?: "cash" | "transfer";
  bankAccount?: string;
  bankId?: string;
  bankName?: string;
  note?: string;
  details?: {
    items: PurchaseReturnItem[];
  };
}

export function PurchaseReturns() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Date range filter states (similar to Finance.tsx)
  const [dateRangeType, setDateRangeType] = useState<"preset" | "custom">(
    "preset"
  );
  const [presetTimeRange, setPresetTimeRange] = useState<string>("today");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "completed",
    "draft",
    "cancelled",
  ]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingDates, setEditingDates] = useState<Record<number, string>>({});
  
  // Sort states
  type SortField = "code" | "date" | "supplier" | "items" | "returnAmount" | "paidAmount" | "reason" | "status" | null;
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReturnId, setEditingReturnId] = useState<number | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedBatches, setSelectedBatches] = useState<
    Array<{ productId: string; batchCode: string; unitPrice: number }>
  >([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [bankSearchOpen, setBankSearchOpen] = useState(false);

  // Danh sách ngân hàng Việt Nam
  const vietnameseBanks = [
    { id: "VCB", name: "VCB - Ngân hàng TMCP Ngoại thương Việt Nam" },
    { id: "TCB", name: "TCB - Ngân hàng TMCP Kỹ Thương Việt Nam" },
    { id: "BIDV", name: "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
    { id: "VTB", name: "VTB - Ngân hàng TMCP Vietinbank" },
    { id: "ACB", name: "ACB - Ngân hàng TMCP Á Châu" },
    { id: "MB", name: "MB - Ngân hàng TMCP Quân đội" },
    { id: "SHB", name: "SHB - Ngân hàng TMCP Sài Gòn - Hà Nội" },
    { id: "VPB", name: "VPB - Ngân hàng TMCP Việt Nam Thịnh Vượng" },
    { id: "TPB", name: "TPB - Ngân hàng TMCP Tiên Phong" },
    { id: "MSB", name: "MSB - Ngân hàng TMCP Hàng Hải" },
    { id: "OCB", name: "OCB - Ngân hàng TMCP Phương Đông" },
    { id: "SCB", name: "SCB - Ngân hàng TMCP Sài Gòn" },
    { id: "HDBank", name: "HDBank - Ngân hàng TMCP Phát triển TP.HCM" },
    { id: "VIB", name: "VIB - Ngân hàng TMCP Quốc tế" },
    { id: "SGB", name: "SGB - Ngân hàng TMCP Sài Gòn Công Thương" },
    { id: "ABBank", name: "ABBank - Ngân hàng TMCP An Bình" },
    { id: "ICB", name: "ICB - Ngân hàng TMCP Công Thương Việt Nam" },
  ];

  // Form state for creating return
  const [formData, setFormData] = useState({
    code: "",
    date: "",
    supplier: "",
    supplierId: "",
    reason: "",
    note: "",
    paidAmount: "", // Số tiền NCC phải trả
    paymentMethod: "cash" as "cash" | "transfer",
    bankAccount: "",
    bankId: "",
    bankName: "",
  });

  // State for return items
  const [returnItems, setReturnItems] = useState<ReturnItemForm[]>([]);

  // Helper functions for number formatting with commas
  const formatNumberWithCommas = (value: number | string): string => {
    if (value === "" || value === null || value === undefined) return "";
    const numValue =
      typeof value === "string"
        ? parseFloat(value.replace(/,/g, "").replace(/đ/g, "").trim())
        : value;
    if (isNaN(numValue)) return "";
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (value: string): number => {
    if (!value || value.trim() === "") return 0;
    const cleaned = value
      .replace(/,/g, "")
      .replace(/đ/g, "")
      .replace(/\s/g, "")
      .replace(/[^\d.]/g, "")
      .trim();
    if (cleaned === "") return 0;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  // Helper function to format date to "YYYY-MM-DD HH:mm"
  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Helper function to get date range from preset
  const getDateRangeFromPreset = (
    preset: string
  ): { from: Date; to: Date } | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    switch (preset) {
      case "today": {
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        return { from: today, to };
      }
      case "yesterday": {
        const from = new Date(yesterday);
        const to = new Date(yesterday);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "this-week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        return { from: weekStart, to };
      }
      case "last-week": {
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        lastWeekStart.setHours(0, 0, 0, 0);
        return { from: lastWeekStart, to: lastWeekEnd };
      }
      case "last-7-days": {
        const from = new Date(today);
        from.setDate(today.getDate() - 7);
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "this-month": {
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "last-month": {
        const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const to = new Date(today.getFullYear(), today.getMonth(), 0);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "last-30-days": {
        const from = new Date(today);
        from.setDate(today.getDate() - 30);
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "this-quarter": {
        const quarter = Math.floor(today.getMonth() / 3);
        const from = new Date(today.getFullYear(), quarter * 3, 1);
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "last-quarter": {
        const quarter = Math.floor(today.getMonth() / 3);
        const lastQuarter = quarter === 0 ? 3 : quarter - 1;
        const lastQuarterYear =
          quarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
        const from = new Date(lastQuarterYear, lastQuarter * 3, 1);
        const to = new Date(lastQuarterYear, (lastQuarter + 1) * 3, 0);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "this-year": {
        const from = new Date(today.getFullYear(), 0, 1);
        const to = new Date(today);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "last-year": {
        const from = new Date(today.getFullYear() - 1, 0, 1);
        const to = new Date(today.getFullYear() - 1, 11, 31);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
      case "this-month-lunar":
      case "last-month-lunar":
      case "this-year-lunar":
      case "last-year-lunar":
        // Lunar calendar presets - return null for now (can be implemented later)
        return null;
      default:
        return null;
    }
  };

  // Load inventory items - using mock data (matching Inventory.tsx structure)
  const loadInventoryItems = (): InventoryItem[] => {
    // Return mock data (same structure as Inventory.tsx)
    return [
      // Ready-made items (matching Inventory.tsx order)
      {
        id: "rm1",
        name: "Coca Cola",
        type: "ready-made",
        category: "bottled-beverages",
        currentStock: 48,
        unit: "chai",
        batches: [
          {
            batchCode: "LO001",
            quantity: 30,
            unitCost: 12000,
            entryDate: "2025-01-10",
            expiryDate: "2025-06-15",
            supplier: "Coca Cola Việt Nam",
          },
          {
            batchCode: "LO002",
            quantity: 18,
            unitCost: 11500,
            entryDate: "2025-01-18",
            expiryDate: "2025-07-20",
            supplier: "Coca Cola Việt Nam",
          },
        ],
      },
      {
        id: "rm2",
        name: "Bánh Croissant",
        type: "ready-made",
        category: "packaging",
        currentStock: 8,
        unit: "cái",
        batches: [
          {
            batchCode: "LO003",
            quantity: 8,
            unitCost: 25000,
            entryDate: "2025-01-22",
            expiryDate: "2025-01-26",
            supplier: "Tiệm bánh ABC",
          },
        ],
      },
      // Ingredients (matching Inventory.tsx order)
      {
        id: "ing1",
        name: "Cà phê hạt Arabica",
        type: "ingredient",
        category: "coffee",
        currentStock: 15,
        unit: "kg",
        batches: [
          {
            batchCode: "LO101",
            quantity: 10,
            unitCost: 350000,
            entryDate: "2025-01-05",
            supplier: "Trung Nguyên",
          },
          {
            batchCode: "LO102",
            quantity: 5,
            unitCost: 360000,
            entryDate: "2025-01-15",
            supplier: "Trung Nguyên",
          },
        ],
      },
      {
        id: "ing2",
        name: "Sữa tươi",
        type: "ingredient",
        category: "dairy",
        currentStock: 12,
        unit: "L",
        batches: [
          {
            batchCode: "LO201",
            quantity: 7,
            unitCost: 28000,
            entryDate: "2025-01-20",
            expiryDate: "2025-01-27",
            supplier: "Vinamilk",
          },
          {
            batchCode: "LO202",
            quantity: 5,
            unitCost: 27500,
            entryDate: "2025-01-22",
            expiryDate: "2025-01-29",
            supplier: "Vinamilk",
          },
        ],
      },
      {
        id: "ing3",
        name: "Đường trắng",
        type: "ingredient",
        category: "syrup",
        currentStock: 3,
        unit: "kg",
        batches: [
          {
            batchCode: "LO301",
            quantity: 3,
            unitCost: 22000,
            entryDate: "2025-01-10",
            supplier: "Biên Hòa",
          },
        ],
      },
      {
        id: "ing4",
        name: "Kem tươi",
        type: "ingredient",
        category: "dairy",
        currentStock: 8,
        unit: "hộp",
        batches: [
          {
            batchCode: "LO401",
            quantity: 8,
            unitCost: 85000,
            entryDate: "2025-01-19",
            expiryDate: "2025-01-29",
            supplier: "Anchor",
          },
        ],
      },
      {
        id: "ing5",
        name: "Trà Ô Long",
        type: "ingredient",
        category: "tea",
        currentStock: 25,
        unit: "kg",
        batches: [
          {
            batchCode: "LO501",
            quantity: 15,
            unitCost: 280000,
            entryDate: "2025-01-08",
            supplier: "Phúc Long",
          },
          {
            batchCode: "LO502",
            quantity: 10,
            unitCost: 275000,
            entryDate: "2025-01-16",
            supplier: "Phúc Long",
          },
        ],
      },
      {
        id: "ing6",
        name: "Ly nhựa size L",
        type: "ingredient",
        category: "packaging",
        currentStock: 150,
        unit: "cái",
        batches: [
          {
            batchCode: "LO601",
            quantity: 150,
            unitCost: 1200,
            entryDate: "2025-01-12",
            supplier: "Bao bì Minh Anh",
          },
        ],
      },
    ];
  };

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() =>
    loadInventoryItems()
  );

  // Load purchase returns from localStorage
  const loadPurchaseReturns = (): PurchaseReturn[] => {
    try {
      const stored = localStorage.getItem("purchaseReturns");
      if (stored) {
        const parsed = JSON.parse(stored);
        const sampleOrderCodes = ["THN001", "THN002", "THN003"];
        const hasOldSampleData = parsed.some(
          (ret: PurchaseReturn) =>
            sampleOrderCodes.includes(ret.code) &&
            ret.date &&
            ret.date.startsWith("2024-")
        );
        if (hasOldSampleData) {
          localStorage.removeItem("purchaseReturns");
        } else {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error loading purchase returns from localStorage:", error);
    }
    // Default mock data - tháng này
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const day1 = Math.max(1, Math.min(currentDay - 2, 28));
    const day2 = Math.max(1, Math.min(currentDay - 1, 28));
    const day3 = currentDay;
    const formatDate = (day: number) => {
      return `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    };
    return [
      {
        id: 1,
        code: "THN001",
        purchaseCode: "PN001",
        date: `${formatDate(day1)} 11:00`,
        supplier: "Trung Nguyên",
        supplierId: "trung-nguyen",
        items: 2,
        returnAmount: 3500000,
        paidAmount: 3500000,
        debtAmount: 0,
        reason: "Hàng lỗi",
        status: "completed",
        paymentMethod: "cash",
        details: {
          items: [
            {
              name: "Cà phê hạt Arabica",
              batchCode: "LO101",
              quantity: 5,
              unit: "kg",
              unitPrice: 350000,
              total: 1750000,
              reason: "Hạt bị mốc",
            },
            {
              name: "Cà phê hạt Arabica",
              batchCode: "LO102",
              quantity: 5,
              unit: "kg",
              unitPrice: 360000,
              total: 1800000,
              reason: "Chất lượng không đạt",
            },
          ],
        },
      },
      {
        id: 2,
        code: "THN002",
        purchaseCode: "PN002",
        date: `${formatDate(day2)} 15:30`,
        supplier: "Vinamilk",
        supplierId: "vinamilk",
        items: 1,
        returnAmount: 196000,
        paidAmount: 100000,
        debtAmount: -96000,
        reason: "Giao nhầm sản phẩm",
        status: "draft",
        paymentMethod: "transfer",
        bankId: "VCB",
        bankName: "VCB - Ngân hàng TMCP Ngoại thương Việt Nam",
        bankAccount: "1234567890",
        details: {
          items: [
            {
              name: "Sữa tươi",
              batchCode: "LO201",
              quantity: 7,
              unit: "L",
              unitPrice: 28000,
              total: 196000,
              reason: "Đặt sữa không đường nhưng giao có đường",
            },
          ],
        },
      },
      {
        id: 3,
        code: "THN003",
        purchaseCode: "PN003",
        date: `${formatDate(day3)} 14:00`,
        supplier: "Phúc Long",
        supplierId: "phuc-long",
        items: 1,
        returnAmount: 2800000,
        paidAmount: 2800000,
        debtAmount: 0,
        reason: "Hết hạn sử dụng",
        status: "completed",
        paymentMethod: "cash",
        details: {
          items: [
            {
              name: "Trà Ô Long",
              batchCode: "LO501",
              quantity: 10,
              unit: "kg",
              unitPrice: 280000,
              total: 2800000,
              reason: "HSD còn 2 ngày",
            },
          ],
        },
      },
    ];
  };

  const [returns, setReturns] = useState<PurchaseReturn[]>(() =>
    loadPurchaseReturns()
  );

  // Save to localStorage whenever returns change
  useEffect(() => {
    try {
      localStorage.setItem("purchaseReturns", JSON.stringify(returns));
    } catch (error) {
      console.error("Error saving purchase returns to localStorage:", error);
    }
  }, [returns]);

  // Generate next return code
  const generateNextReturnCode = (): string => {
    let maxNumber = 0;
    returns.forEach((ret) => {
      const match = ret.code.match(/^THN(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    const nextNumber = maxNumber + 1;
    return `THN${String(nextNumber).padStart(3, "0")}`;
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Get effective date range based on dateRangeType
  const getEffectiveDateRange = (): { from: Date; to: Date } | null => {
    if (dateRangeType === "preset") {
      return getDateRangeFromPreset(presetTimeRange);
    } else {
      // Custom date range
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        return { from, to };
      }
    }
    return null;
  };

  // Helper function to get reason text from reason code
  const getReasonText = (reasonCode: string): string => {
    const reasonMap: { [key: string]: string } = {
      "hang-loi": "Hàng lỗi",
      "giao-nham": "Giao nhầm sản phẩm",
      "het-han": "Hết hạn sử dụng",
      "chat-luong": "Chất lượng không đạt",
      khac: "Lý do khác",
    };
    return reasonMap[reasonCode] || reasonCode;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
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

  let filteredReturns = returns.filter((ret) => {
    try {
      const matchesSearch =
        ret.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ret.purchaseCode &&
          ret.purchaseCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ret.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatuses.includes(ret.status);

      // Apply date filter
      const dateRange = getEffectiveDateRange();
      let matchesDate = true;
      if (dateRange) {
        try {
          // Parse date from format "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"
          const dateStr = ret.date ? ret.date.split(" ")[0] : "";
          if (dateStr) {
            const retDate = new Date(dateStr);
            if (!isNaN(retDate.getTime())) {
              retDate.setHours(0, 0, 0, 0);
              matchesDate =
                retDate >= dateRange.from && retDate <= dateRange.to;
            }
          }
        } catch (dateError) {
          // If date parsing fails, don't filter it out
          matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    } catch (error) {
      console.error("Error filtering return:", error, ret);
      return false;
    }
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredReturns = [...filteredReturns].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "code") {
        aValue = a.code;
        bValue = b.code;
      } else if (sortField === "date") {
        const aDateStr = a.date ? a.date.split(" ")[0] : "";
        const bDateStr = b.date ? b.date.split(" ")[0] : "";
        aValue = aDateStr ? new Date(aDateStr).getTime() : 0;
        bValue = bDateStr ? new Date(bDateStr).getTime() : 0;
      } else if (sortField === "supplier") {
        aValue = a.supplier;
        bValue = b.supplier;
      } else if (sortField === "items") {
        aValue = a.items;
        bValue = b.items;
      } else if (sortField === "returnAmount") {
        aValue = a.returnAmount;
        bValue = b.returnAmount;
      } else if (sortField === "paidAmount") {
        aValue = a.paidAmount || 0;
        bValue = b.paidAmount || 0;
      } else if (sortField === "reason") {
        aValue = getReasonText(a.reason);
        bValue = getReasonText(b.reason);
      } else if (sortField === "status") {
        aValue = a.status;
        bValue = b.status;
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

  const totalReturn = filteredReturns.reduce(
    (sum, ret) => sum + ret.returnAmount,
    0
  );
  const draftCount = returns.filter((r) => r.status === "draft").length;
  const completedCount = returns.filter((r) => r.status === "completed").length;
  const cancelledCount = returns.filter((r) => r.status === "cancelled").length;

  // Get available items for purchase (ingredients and ready-made only)
  const availableItemsForReturn = inventoryItems.filter(
    (item) => item.type === "ingredient" || item.type === "ready-made"
  );

  // Get filtered items based on search and category
  const getFilteredAvailableItems = () => {
    return availableItemsForReturn.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === "all" ||
        selectedCategoryFilter === item.category;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredAvailableItems = getFilteredAvailableItems();

  const handleOpenCreateDialog = () => {
    const nextCode = generateNextReturnCode();
    const returnDate = formatDateTime(new Date());
    setEditingReturnId(null);
    setFormData({
      code: nextCode,
      date: returnDate.split(" ")[0],
      supplier: "",
      supplierId: "",
      reason: "",
      note: "",
      paidAmount: "",
      paymentMethod: "cash",
      bankAccount: "",
      bankId: "",
      bankName: "",
    });
    setReturnItems([]);
    setShowCreateDialog(true);
  };

  const handleEditReturn = (ret: PurchaseReturn) => {
    if (ret.status !== "draft") {
      toast.error("Chỉ có thể chỉnh sửa phiếu tạm");
      return;
    }
    setEditingReturnId(ret.id);

    // Load return items into form
    const items: ReturnItemForm[] =
      ret.details?.items.map((item) => ({
        productId: "", // We don't store productId in details, but that's okay
        productName: item.name,
        batchCode: item.batchCode,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        reason: item.reason || "",
      })) || [];

    setReturnItems(items);

    // Parse date from "YYYY-MM-DD HH:mm" to "YYYY-MM-DD"
    const datePart = ret.date.split(" ")[0];

    setFormData({
      code: ret.code,
      date: datePart,
      supplier: ret.supplierId || ret.supplier,
      supplierId: ret.supplierId || ret.supplier,
      reason: ret.reason,
      note: ret.note || "",
      paidAmount: (ret.paidAmount || 0).toString(),
      paymentMethod: ret.paymentMethod || "cash",
      bankAccount: ret.bankAccount || "",
      bankId: ret.bankId || "",
      bankName: ret.bankName || "",
    });
    setBankSearchOpen(false);
    setShowCreateDialog(true);
  };

  const handleCreateReturn = (status: "draft" | "completed") => {
    if (returnItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất một hàng hóa");
      return;
    }
    if (!formData.supplier || !formData.reason) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const totalAmount = returnItems.reduce((sum, item) => sum + item.total, 0);
    const paidAmount = parseFormattedNumber(formData.paidAmount);
    const debtAmount = totalAmount - paidAmount; // Số tiền còn nợ (âm nếu chưa trả đủ)

    const returnDate = formData.date
      ? `${formData.date} ${new Date().toTimeString().slice(0, 5)}`
      : formatDateTime(new Date());

    if (editingReturnId !== null) {
      // Update existing return
      setReturns((prev) =>
        prev.map((ret) =>
          ret.id === editingReturnId
            ? {
                ...ret,
                code: formData.code,
                date: returnDate,
                supplier: formData.supplier,
                supplierId: formData.supplierId,
                items: returnItems.length,
                returnAmount: totalAmount,
                paidAmount: paidAmount,
                debtAmount: -debtAmount,
                reason: formData.reason,
                status: status,
                paymentMethod: formData.paymentMethod,
                bankAccount:
                  formData.paymentMethod === "transfer"
                    ? formData.bankAccount
                    : undefined,
                bankId:
                  formData.paymentMethod === "transfer"
                    ? formData.bankId
                    : undefined,
                bankName:
                  formData.paymentMethod === "transfer"
                    ? formData.bankName
                    : undefined,
                note: formData.note,
                details: {
                  items: returnItems.map((item) => ({
                    name: item.productName,
                    batchCode: item.batchCode,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                    total: item.total,
                    reason: item.reason,
                  })),
                },
              }
            : ret
        )
      );
      toast.success(
        status === "completed"
          ? "Đã cập nhật và hoàn thành phiếu trả hàng"
          : "Đã cập nhật phiếu trả hàng"
      );
    } else {
      // Create new return
      const newReturn: PurchaseReturn = {
        id: Date.now(),
        code: formData.code || generateNextReturnCode(),
        purchaseCode: "", // TODO: Link to purchase order
        date: returnDate,
        supplier: formData.supplier,
        supplierId: formData.supplierId,
        items: returnItems.length,
        returnAmount: totalAmount,
        paidAmount: paidAmount,
        debtAmount: -debtAmount, // Âm vì đây là số tiền còn nợ NCC
        reason: formData.reason,
        status: status,
        paymentMethod: formData.paymentMethod,
        bankAccount:
          formData.paymentMethod === "transfer"
            ? formData.bankAccount
            : undefined,
        bankId:
          formData.paymentMethod === "transfer" ? formData.bankId : undefined,
        bankName:
          formData.paymentMethod === "transfer" ? formData.bankName : undefined,
        note: formData.note,
        details: {
          items: returnItems.map((item) => ({
            name: item.productName,
            batchCode: item.batchCode,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
            reason: item.reason,
          })),
        },
      };

      setReturns([newReturn, ...returns]);
      toast.success(
        status === "completed"
          ? "Đã tạo phiếu trả hàng"
          : "Đã lưu nháp phiếu trả hàng"
      );
    }

    setShowCreateDialog(false);
    setEditingReturnId(null);

    // Reset form
    setFormData({
      code: generateNextReturnCode(),
      date: "",
      supplier: "",
      supplierId: "",
      reason: "",
      note: "",
      paidAmount: "",
      paymentMethod: "cash",
      bankAccount: "",
      bankId: "",
      bankName: "",
    });
    setReturnItems([]);
  };

  const handleAddSelectedBatches = () => {
    const itemsToAdd: ReturnItemForm[] = [];

    selectedBatches.forEach(({ productId, batchCode, unitPrice }) => {
      const item = inventoryItems.find((i) => i.id === productId);
      if (item) {
        const batch = item.batches?.find((b) => b.batchCode === batchCode);
        if (batch && batch.quantity > 0) {
          itemsToAdd.push({
            productId: item.id,
            productName: item.name,
            batchCode: batch.batchCode,
            unit: item.unit,
            quantity: 0, // User will input
            unitPrice: unitPrice, // Use the unitPrice from selected batch
            total: 0,
            reason: "",
          });
        }
      }
    });

    setReturnItems([...returnItems, ...itemsToAdd]);
    setShowAddItemDialog(false);
    setSelectedBatches([]);
    setItemSearchQuery("");
    setSelectedCategoryFilter("all");
    setExpandedItems(new Set());
  };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRemoveReturnItem = (index: number) => {
    setReturnItems(returnItems.filter((_, i) => i !== index));
  };

  const handleUpdateReturnItem = (
    index: number,
    field: keyof ReturnItemForm,
    value: any
  ) => {
    const updatedItems = [...returnItems];
    const currentItem = updatedItems[index];

    // Validate quantity
    if (field === "quantity") {
      const numValue = Number(value) || 0;
      if (!validateReturnQuantity(index, numValue)) {
        toast.error(
          `Số lượng trả không được vượt quá số lượng tồn của lô hàng`
        );
        return;
      }
      updatedItems[index] = { ...currentItem, [field]: numValue };
    } else {
      updatedItems[index] = { ...currentItem, [field]: value };
    }

    // Auto-calculate total
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setReturnItems(updatedItems);
  };

  // Calculate total amount
  const totalAmount = returnItems.reduce((sum, item) => sum + item.total, 0);

  // Update paidAmount when totalAmount changes
  useEffect(() => {
    if (totalAmount > 0 && !formData.paidAmount) {
      setFormData((prev) => ({
        ...prev,
        paidAmount: formatNumberWithCommas(totalAmount),
      }));
    }
  }, [totalAmount]);

  const handleSaveReturn = (id: number) => {
    const returnToUpdate = returns.find((r) => r.id === id);
    if (!returnToUpdate) return;

    const editedDate = editingDates[id];
    if (editedDate) {
      setReturns((prev) =>
        prev.map((r) => (r.id === id ? { ...r, date: editedDate } : r))
      );
      setEditingDates((prev) => {
        const newDates = { ...prev };
        delete newDates[id];
        return newDates;
      });
      toast.success("Đã lưu thời gian");
    }
  };

  const handleCancelReturn = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy phiếu trả hàng này?")) {
      setReturns((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
      );
      toast.success("Đã hủy phiếu trả hàng");
    }
  };

  const handlePrintReturn = () => {
    window.print();
  };

  const toggleBatchSelection = (
    productId: string,
    batchCode: string,
    unitPrice: number
  ) => {
    setSelectedBatches((prev) => {
      const exists = prev.some(
        (b) => b.productId === productId && b.batchCode === batchCode
      );
      if (exists) {
        return prev.filter(
          (b) => !(b.productId === productId && b.batchCode === batchCode)
        );
      } else {
        return [...prev, { productId, batchCode, unitPrice }];
      }
    });
  };

  const isBatchSelected = (productId: string, batchCode: string): boolean => {
    return selectedBatches.some(
      (b) => b.productId === productId && b.batchCode === batchCode
    );
  };

  // Validate return quantity against batch quantity
  const validateReturnQuantity = (
    itemIndex: number,
    quantity: number
  ): boolean => {
    const returnItem = returnItems[itemIndex];
    if (!returnItem) return false;

    const inventoryItem = inventoryItems.find(
      (i) => i.id === returnItem.productId
    );
    if (!inventoryItem) return false;

    const batch = inventoryItem.batches?.find(
      (b) => b.batchCode === returnItem.batchCode
    );
    if (!batch) return false;

    return quantity <= batch.quantity && quantity > 0;
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto space-y-4">
        <div>
          <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
          <RadioGroup
            value={dateRangeType}
            onValueChange={(value) =>
              setDateRangeType(value as "preset" | "custom")
            }
          >
            {/* Preset Time Ranges */}
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem
                value="preset"
                id="date-preset"
                className="border-slate-300"
              />
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left text-sm bg-white border-slate-300"
                      onClick={() => setDateRangeType("preset")}
                    >
                      <span>
                        {presetTimeRange === "today" && "Hôm nay"}
                        {presetTimeRange === "yesterday" && "Hôm qua"}
                        {presetTimeRange === "this-week" && "Tuần này"}
                        {presetTimeRange === "last-week" && "Tuần trước"}
                        {presetTimeRange === "last-7-days" && "7 ngày qua"}
                        {presetTimeRange === "this-month" && "Tháng này"}
                        {presetTimeRange === "last-month" && "Tháng trước"}
                        {presetTimeRange === "this-month-lunar" &&
                          "Tháng này (âm lịch)"}
                        {presetTimeRange === "last-month-lunar" &&
                          "Tháng trước (âm lịch)"}
                        {presetTimeRange === "last-30-days" && "30 ngày qua"}
                        {presetTimeRange === "this-quarter" && "Quý này"}
                        {presetTimeRange === "last-quarter" && "Quý trước"}
                        {presetTimeRange === "this-year" && "Năm nay"}
                        {presetTimeRange === "last-year" && "Năm trước"}
                        {presetTimeRange === "this-year-lunar" &&
                          "Năm nay (âm lịch)"}
                        {presetTimeRange === "last-year-lunar" &&
                          "Năm trước (âm lịch)"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-4" align="start">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Column 1: Theo ngày và tuần */}
                      <div>
                        <h4 className="text-sm text-slate-700 mb-3">
                          Theo ngày và tuần
                        </h4>
                        <div className="space-y-2">
                          {[
                            { value: "today", label: "Hôm nay" },
                            { value: "yesterday", label: "Hôm qua" },
                            { value: "this-week", label: "Tuần này" },
                            { value: "last-week", label: "Tuần trước" },
                            { value: "last-7-days", label: "7 ngày qua" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setPresetTimeRange(option.value);
                                setDateRangeType("preset");
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                presetTimeRange === option.value
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: Theo tháng và quý */}
                      <div>
                        <h4 className="text-sm text-slate-700 mb-3">
                          Theo tháng và quý
                        </h4>
                        <div className="space-y-2">
                          {[
                            { value: "this-month", label: "Tháng này" },
                            { value: "last-month", label: "Tháng trước" },
                            {
                              value: "this-month-lunar",
                              label: "Tháng này (âm lịch)",
                            },
                            {
                              value: "last-month-lunar",
                              label: "Tháng trước (âm lịch)",
                            },
                            { value: "last-30-days", label: "30 ngày qua" },
                            { value: "this-quarter", label: "Quý này" },
                            { value: "last-quarter", label: "Quý trước" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setPresetTimeRange(option.value);
                                setDateRangeType("preset");
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                presetTimeRange === option.value
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Column 3: Theo năm */}
                      <div>
                        <h4 className="text-sm text-slate-700 mb-3">
                          Theo năm
                        </h4>
                        <div className="space-y-2">
                          {[
                            { value: "this-year", label: "Năm nay" },
                            { value: "last-year", label: "Năm trước" },
                            {
                              value: "this-year-lunar",
                              label: "Năm nay (âm lịch)",
                            },
                            {
                              value: "last-year-lunar",
                              label: "Năm trước (âm lịch)",
                            },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setPresetTimeRange(option.value);
                                setDateRangeType("preset");
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                presetTimeRange === option.value
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="custom"
                id="date-custom"
                className="border-slate-300"
              />
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left text-sm bg-white border-slate-300"
                      onClick={() => setDateRangeType("custom")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom && dateTo
                        ? `${format(dateFrom, "dd/MM", {
                            locale: vi,
                          })} - ${format(dateTo, "dd/MM/yyyy", { locale: vi })}`
                        : "Lựa chọn khác"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex gap-4">
                      <div>
                        <Label className="text-xs text-slate-600 mb-2 block">
                          Từ ngày
                        </Label>
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={(date) => {
                            if (date) {
                              setDateFrom(date);
                              setDateRangeType("custom");
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-2 block">
                          Đến ngày
                        </Label>
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={(date) => {
                            if (date) {
                              setDateTo(date);
                              setDateRangeType("custom");
                            }
                          }}
                          disabled={(date) =>
                            dateFrom ? date < dateFrom : false
                          }
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Status Filter with Checkboxes */}
        <div>
          <h3 className="text-sm text-slate-900 mb-3">Trạng thái</h3>
          <div className="space-y-2">
            {[
              {
                id: "completed",
                label: "Đã trả hàng",
              },
              { id: "draft", label: "Phiếu tạm" },
              { id: "cancelled", label: "Đã huỷ" },
            ].map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.id}`}
                  checked={selectedStatuses.includes(status.id)}
                  onCheckedChange={() => toggleStatus(status.id)}
                />
                <Label
                  htmlFor={`status-${status.id}`}
                  className="text-sm text-slate-700 cursor-pointer flex items-center gap-2"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div>
          <h3 className="text-sm text-slate-900 mb-3">Bộ lọc nhanh</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedStatuses(["draft"])}
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              Phiếu tạm ({draftCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedStatuses(["completed"])}
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              Đã trả hàng ({completedCount})
            </Button>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div>
          <h4 className="text-sm text-slate-700 mb-3">Tổng quan</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng phiếu trả:</span>
              <span className="text-slate-900">{filteredReturns.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng giá trị:</span>
              <span className="text-red-600">
                {totalReturn.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 mb-2">Trả hàng nhập</h1>
              <p className="text-sm text-slate-600">
                Quản lý phiếu trả hàng cho nhà cung cấp
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={handleOpenCreateDialog}
              >
                <Plus className="w-4 h-4" />
                Tạo phiếu trả
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu hoặc nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-none focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã phiếu trả
                      {getSortIcon("code")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Ngày giờ
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("supplier")}
                  >
                    <div className="flex items-center">
                      Nhà cung cấp
                      {getSortIcon("supplier")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("items")}
                  >
                    <div className="flex items-center justify-center">
                      Số mặt hàng
                      {getSortIcon("items")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("returnAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Giá trị trả
                      {getSortIcon("returnAmount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("returnAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Tiền NCC cần trả
                      {getSortIcon("returnAmount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("paidAmount")}
                  >
                    <div className="flex items-center justify-end">
                      NCC đã trả
                      {getSortIcon("paidAmount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("reason")}
                  >
                    <div className="flex items-center">
                      Lý do
                      {getSortIcon("reason")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center">
                      Trạng thái
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((ret, index) => (
                  <>
                    <TableRow
                      key={ret.id}
                      className="hover:bg-blue-50/50 cursor-pointer"
                      onClick={() =>
                        setExpandedRow(expandedRow === ret.id ? null : ret.id)
                      }
                    >
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          {expandedRow === ret.id ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-blue-600">{ret.code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {ret.date}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {ret.supplier}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 text-center">
                        {ret.items}
                      </TableCell>
                      <TableCell className="text-sm text-red-600 text-right">
                        {ret.returnAmount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-sm text-slate-900 text-right">
                        {ret.returnAmount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-sm text-green-600 text-right">
                        {(ret.paidAmount || 0).toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {getReasonText(ret.reason)}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            ret.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : ret.status === "draft"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {ret.status === "completed"
                            ? "Đã trả hàng"
                            : ret.status === "draft"
                            ? "Phiếu tạm"
                            : "Đã huỷ"}
                        </span>
                      </TableCell>
                    </TableRow>
                    {/* Expanded Row */}
                    {expandedRow === ret.id && ret.details && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-slate-50 px-4 py-4">
                          <Tabs defaultValue="info" className="w-full">
                            <TabsList>
                              <TabsTrigger value="info">Thông tin</TabsTrigger>
                            </TabsList>
                            <TabsContent
                              value="info"
                              className="space-y-4 mt-4"
                            >
                              {/* Thông tin phiếu trả */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div>
                                      <span className="font-medium text-slate-600">
                                        Mã phiếu trả:
                                      </span>{" "}
                                      <span className="text-slate-900">
                                        {ret.code}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">
                                        Trạng thái:
                                      </span>{" "}
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          ret.status === "completed"
                                            ? "bg-green-50 text-green-700"
                                            : ret.status === "draft"
                                            ? "bg-orange-50 text-orange-700"
                                            : "bg-red-50 text-red-700"
                                        }`}
                                      >
                                        {ret.status === "completed"
                                          ? "Đã trả hàng"
                                          : ret.status === "draft"
                                          ? "Phiếu tạm"
                                          : "Đã huỷ"}
                                      </span>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-slate-600 mb-1 block">
                                        Thời gian
                                      </Label>
                                      <Input
                                        type="datetime-local"
                                        value={
                                          editingDates[ret.id] ||
                                          ret.date
                                            .replace(" ", "T")
                                            .slice(0, 16)
                                        }
                                        onChange={(e) =>
                                          setEditingDates({
                                            ...editingDates,
                                            [ret.id]: e.target.value,
                                          })
                                        }
                                        className="text-sm bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">
                                        Nhà cung cấp:
                                      </span>{" "}
                                      <span className="text-blue-600 hover:underline cursor-pointer">
                                        {ret.supplier}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2"></div>
                                </div>

                                {/* Chi tiết hàng hóa */}
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-slate-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          STT
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Mã lô
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Tên hàng hóa
                                        </th>
                                        <th className="px-4 py-2 text-center text-xs text-slate-600">
                                          Số lượng
                                        </th>
                                        <th className="px-4 py-2 text-center text-xs text-slate-600">
                                          Đơn vị
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Đơn giá
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Thành tiền
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Lý do trả
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {ret.details.items.map((item, idx) => (
                                        <tr key={idx}>
                                          <td className="px-4 py-2 text-sm text-slate-600">
                                            {idx + 1}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-600">
                                            {item.batchCode}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-900">
                                            {item.name}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                            {item.quantity}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                            {item.unit}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-600 text-right">
                                            {item.unitPrice.toLocaleString(
                                              "vi-VN"
                                            )}
                                            đ
                                          </td>
                                          <td className="px-4 py-2 text-sm text-red-600 text-right">
                                            {item.total.toLocaleString("vi-VN")}
                                            đ
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-600">
                                            {getReasonText(item.reason)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Summary */}
                                {ret.details && ret.details.items && (
                                  <div className="flex justify-end pt-4">
                                    <div className="space-y-3 text-sm min-w-[400px] bg-slate-50 rounded-lg p-6">
                                      <div className="flex items-center py-1">
                                        <span className="text-slate-600 text-right w-[180px] pr-4">
                                          Tổng số lượng:
                                        </span>
                                        <span className="text-slate-900 font-medium text-right flex-1">
                                          {ret.details.items.reduce(
                                            (sum, item) => sum + item.quantity,
                                            0
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center py-1">
                                        <span className="text-slate-600 text-right w-[180px] pr-4">
                                          Tổng số mặt hàng:
                                        </span>
                                        <span className="text-slate-900 font-medium text-right flex-1">
                                          {ret.details.items.length}
                                        </span>
                                      </div>
                                      <div className="flex items-center py-1">
                                        <span className="text-slate-600 text-right w-[180px] pr-4">
                                          Tổng tiền hàng trả:
                                        </span>
                                        <span className="text-slate-900 font-medium text-right flex-1">
                                          {ret.details.items
                                            .reduce(
                                              (sum, item) => sum + item.total,
                                              0
                                            )
                                            .toLocaleString("vi-VN")}
                                          đ
                                        </span>
                                      </div>
                                      <div className="flex items-center py-1">
                                        <span className="text-slate-600 text-right w-[180px] pr-4">
                                          Giảm giá phiếu trả:
                                        </span>
                                        <span className="text-slate-900 font-medium text-right flex-1">
                                          0đ
                                        </span>
                                      </div>
                                      <div className="flex items-center border-t border-slate-300 pt-3 mt-2">
                                        <span className="text-slate-900 font-semibold text-base text-right w-[180px] pr-4">
                                          NCC cần trả:
                                        </span>
                                        <span className="text-blue-600 font-semibold text-base text-right flex-1">
                                          {ret.returnAmount.toLocaleString(
                                            "vi-VN"
                                          )}
                                          đ
                                        </span>
                                      </div>
                                      <div className="flex items-center py-1">
                                        <span className="text-slate-600 text-right w-[180px] pr-4">
                                          NCC đã trả:
                                        </span>
                                        <span className="text-slate-900 font-medium text-right flex-1">
                                          {(ret.paidAmount || 0).toLocaleString(
                                            "vi-VN"
                                          )}
                                          đ
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 mt-4">
                                  {ret.status === "draft" ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        className="gap-2"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditReturn(ret);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4" />
                                        Chỉnh sửa
                                      </Button>
                                      <Button
                                        className="bg-green-600 hover:bg-green-700 gap-2"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Hoàn thành phiếu tạm
                                          if (
                                            !ret.details?.items ||
                                            ret.details.items.length === 0
                                          ) {
                                            toast.error(
                                              "Phiếu trả hàng không có hàng hóa"
                                            );
                                            return;
                                          }

                                          // Cập nhật status của return thành "completed"
                                          setReturns(
                                            returns.map((r) =>
                                              r.id === ret.id
                                                ? {
                                                    ...r,
                                                    status:
                                                      "completed" as const,
                                                  }
                                                : r
                                            )
                                          );

                                          toast.success(
                                            "Đã hoàn thành phiếu trả hàng"
                                          );
                                        }}
                                      >
                                        <Check className="w-4 h-4" />
                                        Hoàn thành
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveReturn(ret.id);
                                        }}
                                      >
                                        <Save className="w-4 h-4" />
                                        Lưu
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePrintReturn();
                                        }}
                                      >
                                        <Printer className="w-4 h-4 mr-2" />
                                        In
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancelReturn(ret.id);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Huỷ bỏ
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Hiển thị {filteredReturns.length} phiếu trả hàng
            </p>
          </div>
        </div>
      </div>

      {/* Import Excel Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Import phiếu trả từ Excel</DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-1">
                Kéo thả file Excel vào đây
              </p>
              <p className="text-xs text-slate-400 mb-4">hoặc</p>
              <Button variant="outline" size="sm">
                Chọn file từ máy tính
              </Button>
              <p className="text-xs text-slate-400 mt-4">
                Hỗ trợ: .xlsx, .xls (tối đa 10MB)
              </p>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  // TODO: Tải file mẫu
                  toast.info("Tính năng tải file mẫu đang được phát triển");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Tải file mẫu...
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
            >
              Hủy
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Return Dialog - Similar to StockCheck modal */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent
          className="min-w-[1100px] max-w-[1400px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
          aria-describedby={undefined}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            [data-slot="dialog-content"] button.absolute.top-4.right-4:not([data-custom-close]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              width: 0 !important;
              height: 0 !important;
            }
          `,
            }}
          />
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                {editingReturnId !== null
                  ? "Chỉnh sửa phiếu trả hàng nhập"
                  : "Thêm phiếu trả hàng nhập"}
              </DialogTitle>
              <button
                data-custom-close="true"
                onClick={() => setShowCreateDialog(false)}
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 px-1">
            {/* Thông tin chung */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã phiếu trả *</Label>
                <Input
                  value={formData.code}
                  disabled
                  className="bg-slate-100 border-slate-300 shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày trả *</Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={
                      formData.date
                        ? `${formData.date}T${new Date()
                            .toTimeString()
                            .slice(0, 5)}`
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value.split("T")[0],
                      })
                    }
                    className="bg-white border-slate-300 shadow-none pr-10 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nhà cung cấp *</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => {
                    const supplierMap: { [key: string]: string } = {
                      "trung-nguyen": "Trung Nguyên",
                      vinamilk: "Vinamilk",
                      "thai-milk": "Thai Milk",
                    };
                    setFormData({
                      ...formData,
                      supplierId: value,
                      supplier: supplierMap[value] || value,
                    });
                  }}
                >
                  <SelectTrigger className="bg-white border-slate-300 shadow-none">
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trung-nguyen">Trung Nguyên</SelectItem>
                    <SelectItem value="vinamilk">Vinamilk</SelectItem>
                    <SelectItem value="thai-milk">Thai Milk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lý do trả *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reason: value })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-300 shadow-none">
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hang-loi">Hàng lỗi</SelectItem>
                    <SelectItem value="giao-nham">
                      Giao nhầm sản phẩm
                    </SelectItem>
                    <SelectItem value="het-han">Hết hạn sử dụng</SelectItem>
                    <SelectItem value="chat-luong">
                      Chất lượng không đạt
                    </SelectItem>
                    <SelectItem value="khac">Lý do khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Danh sách hàng hóa */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Danh sách hàng hóa</Label>
                <Button
                  type="button"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 gap-1"
                  onClick={() => setShowAddItemDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                  Thêm hàng hóa
                </Button>
              </div>

              <div className="border rounded-lg overflow-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs text-slate-600 w-24">
                        STT
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-slate-600 min-w-[180px]">
                        Tên hàng hóa
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-slate-600 w-28">
                        Lô hàng
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-slate-600 w-20">
                        ĐVT
                      </th>
                      <th className="px-4 py-2 text-right text-xs text-slate-600 w-28">
                        SL trả
                      </th>
                      <th className="px-4 py-2 text-right text-xs text-slate-600 w-28">
                        Giá nhập
                      </th>
                      <th className="px-4 py-2 text-right text-xs text-slate-600 w-28">
                        Thành tiền
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-slate-600 min-w-[160px]">
                        Lý do trả
                      </th>
                      <th className="px-4 py-2 text-center text-xs text-slate-600 w-12">
                        Xóa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          Chưa có hàng hóa nào. Nhấn &quot;Thêm hàng hóa&quot;
                          để bắt đầu.
                        </td>
                      </tr>
                    ) : (
                      returnItems.map((item, index) => {
                        const inventoryItem = inventoryItems.find(
                          (i) => i.id === item.productId
                        );
                        const batch = inventoryItem?.batches?.find(
                          (b) => b.batchCode === item.batchCode
                        );
                        const maxQuantity = batch?.quantity || 0;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900">
                              {item.productName}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {item.batchCode}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {item.unit}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-1">
                                <Input
                                  type="number"
                                  value={item.quantity || ""}
                                  onChange={(e) => {
                                    const numValue =
                                      Number(e.target.value) || 0;
                                    if (numValue > maxQuantity) {
                                      toast.error(
                                        `Số lượng trả không được vượt quá ${maxQuantity} ${item.unit}`
                                      );
                                      return;
                                    }
                                    handleUpdateReturnItem(
                                      index,
                                      "quantity",
                                      numValue
                                    );
                                  }}
                                  className="h-8 text-right bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                  onClick={(e) => e.stopPropagation()}
                                  min={0}
                                  max={maxQuantity}
                                />
                                <span className="text-xs text-slate-500 text-right">
                                  Tối đa: {maxQuantity} {item.unit}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900 text-right">
                              {item.unitPrice.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="px-4 py-2 text-sm text-red-600 text-right">
                              {item.total.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                placeholder="Lý do"
                                value={item.reason}
                                onChange={(e) =>
                                  handleUpdateReturnItem(
                                    index,
                                    "reason",
                                    e.target.value
                                  )
                                }
                                className="h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveReturnItem(index)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-50"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tổng giá trị trả</Label>
                  <Input
                    value={formatNumberWithCommas(totalAmount)}
                    disabled
                    className="bg-slate-100 border-slate-300 shadow-none text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số tiền NCC trả *</Label>
                  <Input
                    value={formData.paidAmount}
                    onChange={(e) => {
                      const numValue = parseFormattedNumber(e.target.value);
                      const maxAmount = totalAmount;
                      const finalValue = Math.min(numValue, maxAmount);
                      setFormData({
                        ...formData,
                        paidAmount: formatNumberWithCommas(finalValue),
                      });
                    }}
                    className="text-right bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    placeholder="0"
                    max={totalAmount}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phương thức thanh toán</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      paymentMethod: value as "cash" | "transfer",
                      bankAccount: "",
                      bankId: "",
                      bankName: "",
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="cash"
                      id="payment-cash"
                      className="border-slate-300"
                    />
                    <Label htmlFor="payment-cash" className="cursor-pointer">
                      Tiền mặt
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="transfer"
                      id="payment-transfer"
                      className="border-slate-300"
                    />
                    <Label
                      htmlFor="payment-transfer"
                      className="cursor-pointer"
                    >
                      Chuyển khoản
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.paymentMethod === "transfer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngân hàng *</Label>
                    <Popover
                      open={bankSearchOpen}
                      onOpenChange={setBankSearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-white border-slate-300"
                        >
                          {formData.bankName || "Chọn ngân hàng"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Tìm ngân hàng..." />
                          <CommandList
                            style={{ height: "300px", overflowY: "scroll" }}
                          >
                            <CommandEmpty>
                              Không tìm thấy ngân hàng
                            </CommandEmpty>
                            <CommandGroup>
                              {vietnameseBanks.map((bank) => (
                                <CommandItem
                                  key={bank.id}
                                  value={bank.name}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      bankId: bank.id,
                                      bankName: bank.name,
                                    });
                                    setBankSearchOpen(false);
                                  }}
                                >
                                  {bank.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Số tài khoản *</Label>
                    <Input
                      value={formData.bankAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAccount: e.target.value,
                        })
                      }
                      placeholder="Nhập số tài khoản"
                      disabled={!formData.bankId}
                      className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>
                </div>
              )}
              {totalAmount > 0 &&
                parseFormattedNumber(formData.paidAmount) < totalAmount && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-700">
                      Số tiền còn nợ NCC:{" "}
                      <span className="font-semibold">
                        {formatNumberWithCommas(
                          totalAmount -
                            parseFormattedNumber(formData.paidAmount)
                        )}
                        đ
                      </span>
                    </p>
                  </div>
                )}
            </div>

            {/* Ghi chú */}
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Nhập ghi chú về phiếu trả hàng..."
                className="w-full px-3 py-2 bg-white border-slate-300 rounded-lg text-sm shadow-none focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 border-t pt-4 justify-between">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Hủy
            </Button>
            <div className="flex gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={returnItems.length === 0}
                onClick={() => handleCreateReturn("draft")}
              >
                Lưu nháp
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={returnItems.length === 0}
                onClick={() => handleCreateReturn("completed")}
              >
                Hoàn thành
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog - Similar to StockCheck modal but with batches */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent
          className="!min-w-[1100px] !max-w-[1400px] !w-[95vw] !h-[90vh] overflow-hidden flex flex-col p-0 sm:!max-w-[1400px] [&>button]:!hidden"
          style={{
            minWidth: "1100px",
            maxWidth: "1400px",
            width: "95vw",
            height: "90vh",
          }}
          aria-describedby={undefined}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            [data-slot="dialog-content"] button.absolute.top-4.right-4:not([data-custom-close]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              width: 0 !important;
              height: 0 !important;
            }
          `,
            }}
          />
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-medium text-slate-700">
              Thêm hàng hóa vào phiếu trả hàng
            </h2>
            <button
              type="button"
              data-custom-close="true"
              className="text-slate-600 hover:text-slate-800 transition-colors"
              onClick={() => setShowAddItemDialog(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Search Bar */}
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm hàng hóa..."
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-none focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const isActive = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 text-sm border border-slate-200 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Products Table with Expandable Batches */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="w-12 px-4 py-3 text-left text-xs font-medium text-slate-900 border-r border-white"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        Mã hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        Tên hàng hóa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        Danh mục
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-900 whitespace-nowrap border-r border-white">
                        ĐVT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-900 whitespace-nowrap">
                        Tồn kho
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAvailableItems.length > 0 ? (
                      filteredAvailableItems.map((item) => {
                        const isExpanded = expandedItems.has(item.id);
                        // Show all batches, not just those with quantity > 0
                        // But only allow selection of batches with quantity > 0
                        const allBatches = item.batches || [];
                        const availableBatches = allBatches.filter(
                          (b) => b.quantity > 0
                        );
                        const hasBatches = allBatches.length > 0;

                        return (
                          <React.Fragment key={item.id}>
                            {/* Main Row - Item */}
                            <tr
                              className="hover:bg-slate-50 cursor-pointer"
                              onClick={() =>
                                hasBatches && toggleItemExpand(item.id)
                              }
                            >
                              <td className="px-4 py-3 border-r border-slate-100">
                                {hasBatches ? (
                                  isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-slate-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )
                                ) : null}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap border-r border-slate-100">
                                {item.id}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap border-r border-slate-100">
                                {item.name}
                              </td>
                              <td
                                className="px-4 py-3 text-sm text-blue-600 cursor-pointer hover:text-blue-700 hover:underline whitespace-nowrap border-r border-slate-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCategoryFilter(item.category);
                                }}
                              >
                                {categories.find((c) => c.id === item.category)
                                  ?.name ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 text-center whitespace-nowrap border-r border-slate-100">
                                {item.unit}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                                {item.currentStock.toLocaleString()}
                              </td>
                            </tr>

                            {/* Expanded Row - Batches Table */}
                            {isExpanded && hasBatches && (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-4 bg-slate-50"
                                >
                                  <div className="ml-8">
                                    <table className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
                                      <thead className="bg-slate-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 w-12">
                                            <Checkbox
                                              checked={
                                                allBatches.length > 0 &&
                                                allBatches
                                                  .filter((b) => b.quantity > 0)
                                                  .every((b) =>
                                                    isBatchSelected(
                                                      item.id,
                                                      b.batchCode
                                                    )
                                                  )
                                              }
                                              onCheckedChange={(checked) => {
                                                allBatches
                                                  .filter((b) => b.quantity > 0)
                                                  .forEach((b) => {
                                                    const isSelected =
                                                      isBatchSelected(
                                                        item.id,
                                                        b.batchCode
                                                      );
                                                    if (
                                                      checked &&
                                                      !isSelected
                                                    ) {
                                                      toggleBatchSelection(
                                                        item.id,
                                                        b.batchCode,
                                                        b.unitCost
                                                      );
                                                    } else if (
                                                      !checked &&
                                                      isSelected
                                                    ) {
                                                      toggleBatchSelection(
                                                        item.id,
                                                        b.batchCode,
                                                        b.unitCost
                                                      );
                                                    }
                                                  });
                                              }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                              }}
                                            />
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">
                                            Mã lô
                                          </th>
                                          <th className="px-4 py-2 text-center text-xs font-medium text-slate-600">
                                            SL
                                          </th>
                                          <th className="px-4 py-2 text-center text-xs font-medium text-slate-600">
                                            ĐVT
                                          </th>
                                          <th className="px-4 py-2 text-center text-xs font-medium text-slate-600">
                                            HSD
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">
                                            Giá nhập
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {allBatches.map((batch) => {
                                          const canSelect = batch.quantity > 0;
                                          const isSelected = isBatchSelected(
                                            item.id,
                                            batch.batchCode
                                          );

                                          return (
                                            <tr
                                              key={batch.batchCode}
                                              className={`${
                                                canSelect
                                                  ? "hover:bg-slate-50 cursor-pointer"
                                                  : "opacity-50"
                                              }`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (canSelect) {
                                                  toggleBatchSelection(
                                                    item.id,
                                                    batch.batchCode,
                                                    batch.unitCost
                                                  );
                                                }
                                              }}
                                            >
                                              <td className="px-4 py-2">
                                                <div
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                >
                                                  <Checkbox
                                                    checked={isSelected}
                                                    disabled={!canSelect}
                                                    onCheckedChange={(
                                                      checked
                                                    ) => {
                                                      if (canSelect) {
                                                        toggleBatchSelection(
                                                          item.id,
                                                          batch.batchCode,
                                                          batch.unitCost
                                                        );
                                                      }
                                                    }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                    }}
                                                  />
                                                </div>
                                              </td>
                                              <td className="px-4 py-2 text-sm font-medium text-slate-900">
                                                {batch.batchCode}
                                              </td>
                                              <td className="px-4 py-2 text-sm text-center">
                                                <span
                                                  className={
                                                    canSelect
                                                      ? "text-slate-900"
                                                      : "text-red-500"
                                                  }
                                                >
                                                  {batch.quantity}
                                                </span>
                                              </td>
                                              <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                                {item.unit}
                                              </td>
                                              <td className="px-4 py-2 text-sm text-slate-600 text-center">
                                                {batch.expiryDate
                                                  ? format(
                                                      new Date(
                                                        batch.expiryDate
                                                      ),
                                                      "dd/MM/yyyy",
                                                      { locale: vi }
                                                    )
                                                  : "—"}
                                              </td>
                                              <td className="px-4 py-2 text-sm font-medium text-slate-900 text-right">
                                                {batch.unitCost.toLocaleString(
                                                  "vi-VN"
                                                )}
                                                đ
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}

                            {/* No batches available */}
                            {!hasBatches && (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-3 text-sm text-slate-500 text-center"
                                >
                                  Không có lô hàng
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          Không tìm thấy hàng hóa nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-600">
              Đã chọn:{" "}
              <span className="font-semibold">{selectedBatches.length}</span> lô
              hàng
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => {
                  setShowAddItemDialog(false);
                  setSelectedBatches([]);
                  setItemSearchQuery("");
                  setSelectedCategoryFilter("all");
                }}
              >
                Hủy
              </Button>
              <Button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddSelectedBatches}
                disabled={selectedBatches.length === 0}
              >
                Thêm vào phiếu trả
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
