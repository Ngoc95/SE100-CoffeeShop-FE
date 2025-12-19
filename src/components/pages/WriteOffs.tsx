import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Package,
  Trash2,
  Calendar as CalendarIcon,
  Printer,
  Save,
  Eye,
  Pencil,
  Check,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
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
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ExportExcelDialog } from "../ExportExcelDialog";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { categories } from "../../data/categories";
import { Card, CardContent } from "../ui/card";
import { CustomerTimeFilter } from "../reports/CustomerTimeFilter";

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

interface WriteOffDetail {
  name: string;
  batchCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  reason: string;
}

interface WriteOffItemForm {
  productId: string;
  productName: string;
  batchCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  reason: string;
}

interface WriteOff {
  id: number;
  code: string;
  date: string;
  items: number;
  totalValue: number;
  reason: string;
  status: "completed" | "draft" | "cancelled"; // Hoàn thành, Phiếu tạm, Đã huỷ
  note?: string;
  details?: {
    items: WriteOffDetail[];
  };
}

export function WriteOffs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Date range filter states (similar to Finance.tsx)
  const [dateRangeType, setDateRangeType] = useState<"preset" | "custom">(
    "preset"
  );
  const [presetTimeRange, setPresetTimeRange] = useState<string>("today"); // using presetTimeRange as timePreset
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const handleTimePresetChange = (value: string) => {
    setPresetTimeRange(value);
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined;

    switch (value) {
      case 'today':
        from = now; to = now; break;
      case 'yesterday':
        const y = subDays(now, 1); from = y; to = y; break;
      case 'this-week':
        from = startOfWeek(now, { weekStartsOn: 1 }); to = endOfWeek(now, { weekStartsOn: 1 }); break;
      case 'last-week':
        const lastWeek = subDays(now, 7);
        from = startOfWeek(lastWeek, { weekStartsOn: 1 }); to = endOfWeek(lastWeek, { weekStartsOn: 1 }); break;
      case 'last-7-days':
        from = subDays(now, 7); to = now; break;
      case 'this-month':
        from = startOfMonth(now); to = endOfMonth(now); break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth); to = endOfMonth(lastMonth); break;
      case 'last-30-days':
        from = subDays(now, 30); to = now; break;
      case 'this-quarter':
        from = startOfQuarter(now); to = endOfQuarter(now); break;
      case 'last-quarter':
        const lastQuarter = subQuarters(now, 1);
        from = startOfQuarter(lastQuarter); to = endOfQuarter(lastQuarter); break;
      case 'this-year':
        from = startOfYear(now); to = endOfYear(now); break;
      case 'last-year':
        const lastYear = subYears(now, 1);
        from = startOfYear(lastYear); to = endOfYear(lastYear); break;
    }
    
    if (value !== 'custom') {
        setDateFrom(from);
        setDateTo(to);
    }
  };

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "completed",
    "draft",
    "cancelled",
  ]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingDates, setEditingDates] = useState<Record<number, string>>({});

  // Sort states
  type SortField = "code" | "date" | "items" | "totalValue" | "reason" | "status" | null;
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWriteOffId, setEditingWriteOffId] = useState<number | null>(
    null
  );
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedBatches, setSelectedBatches] = useState<
    Array<{ productId: string; batchCode: string; unitPrice: number }>
  >([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Form state for creating write-off
  const [formData, setFormData] = useState({
    code: "",
    date: "",
    reason: "",
    note: "",
  });

  // State for write-off items
  const [writeOffItems, setWriteOffItems] = useState<WriteOffItemForm[]>([]);

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
        return null;
      default:
        return null;
    }
  };

  // Load inventory items - using mock data (matching Inventory.tsx structure)
  const loadInventoryItems = (): InventoryItem[] => {
    return [
      // Ready-made items
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
      // Ingredients
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

  const [inventoryItems] = useState<InventoryItem[]>(() =>
    loadInventoryItems()
  );

  // Load write-offs - using mock data only
  const loadWriteOffs = (): WriteOff[] => {
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
        code: "XH001",
        date: `${formatDate(day1)} 08:00`,
        items: 3,
        totalValue: 450000,
        reason: "het-han",
        status: "completed",
        details: {
          items: [
            {
              name: "Sữa tươi",
              batchCode: "LO201",
              quantity: 10,
              unit: "L",
              unitPrice: 28000,
              total: 280000,
              reason: "Hết hạn sử dụng",
            },
            {
              name: "Bánh Croissant",
              batchCode: "LO003",
              quantity: 5,
              unit: "cái",
              unitPrice: 30000,
              total: 150000,
              reason: "Hết hạn sử dụng",
            },
            {
              name: "Kem tươi",
              batchCode: "LO401",
              quantity: 1,
              unit: "hộp",
              unitPrice: 85000,
              total: 85000,
              reason: "Hết hạn sử dụng",
            },
          ],
        },
      },
      {
        id: 2,
        code: "XH002",
        date: `${formatDate(day2)} 12:30`,
        items: 2,
        totalValue: 280000,
        reason: "hu-hong",
        status: "completed",
        details: {
          items: [
            {
              name: "Ly nhựa size L",
              batchCode: "LO601",
              quantity: 100,
              unit: "cái",
              unitPrice: 1200,
              total: 120000,
              reason: "Bị nứt",
            },
            {
              name: "Cà phê hạt Arabica",
              batchCode: "LO101",
              quantity: 0.5,
              unit: "kg",
              unitPrice: 350000,
              total: 175000,
              reason: "Bị ẩm mốc",
            },
          ],
        },
      },
      {
        id: 3,
        code: "XH003",
        date: `${formatDate(day3)} 16:00`,
        items: 1,
        totalValue: 108000,
        reason: "mat-mat",
        status: "draft",
        details: {
          items: [
            {
              name: "Cà phê hạt Arabica",
              batchCode: "LO102",
              quantity: 0.3,
              unit: "kg",
              unitPrice: 360000,
              total: 108000,
              reason: "Thất thoát trong quá trình vận chuyển",
            },
          ],
        },
      },
      {
        id: 4,
        code: "XH004",
        date: `${formatDate(day3)} 15:22`,
        items: 2,
        totalValue: 174000,
        reason: "hu-hong",
        status: "completed",
        details: {
          items: [
            {
              name: "Coca Cola",
              batchCode: "LO001",
              quantity: 3,
              unit: "chai",
              unitPrice: 12000,
              total: 36000,
              reason: "Bị sưng bụng",
            },
            {
              name: "Coca Cola",
              batchCode: "LO002",
              quantity: 12,
              unit: "chai",
              unitPrice: 11500,
              total: 138000,
              reason: "Có vị lạ",
            },
          ],
        },
      },
      {
        id: 5,
        code: "XH005",
        date: `${formatDate(day2)} 10:15`,
        items: 1,
        totalValue: 84000,
        reason: "het-han",
        status: "completed",
        details: {
          items: [
            {
              name: "Kem tươi",
              batchCode: "LO401",
              quantity: 1,
              unit: "hộp",
              unitPrice: 85000,
              total: 85000,
              reason: "Hết hạn sử dụng",
            },
          ],
        },
      },
      {
        id: 6,
        code: "XH006",
        date: `${formatDate(day1)} 14:30`,
        items: 2,
        totalValue: 560000,
        reason: "mat-mat",
        status: "draft",
        details: {
          items: [
            {
              name: "Trà Ô Long",
              batchCode: "LO501",
              quantity: 2,
              unit: "kg",
              unitPrice: 280000,
              total: 560000,
              reason: "Thất thoát trong kho",
            },
          ],
        },
      },
    ];
  };

  const [writeOffs, setWriteOffs] = useState<WriteOff[]>(() => loadWriteOffs());
  const [showFilters, setShowFilters] = useState(false);

  // Save to localStorage whenever writeOffs change
  useEffect(() => {
    try {
      localStorage.setItem("writeOffs", JSON.stringify(writeOffs));
    } catch (error) {
      console.error("Error saving write-offs to localStorage:", error);
    }
  }, [writeOffs]);

  // Generate next write-off code
  const generateNextWriteOffCode = (): string => {
    let maxNumber = 0;
    writeOffs.forEach((wo) => {
      const match = wo.code.match(/^XH(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    const nextNumber = maxNumber + 1;
    return `XH${String(nextNumber).padStart(3, "0")}`;
  };

  // Helper function to get reason text from reason code
  const getReasonText = (reasonCode: string): string => {
    const reasonMap: { [key: string]: string } = {
      "het-han": "Hết hạn sử dụng",
      "hu-hong": "Hư hỏng",
      "mat-mat": "Mất mát",
      khac: "Lý do khác",
    };
    return reasonMap[reasonCode] || reasonCode;
  };

  const exportColumns = useMemo(
    () => [
      { header: "Mã phiếu", accessor: (row: WriteOff) => row.code },
      { header: "Ngày xuất", accessor: (row: WriteOff) => row.date },
      { header: "Số mặt hàng", accessor: (row: WriteOff) => row.items },
      { header: "Tổng giá trị", accessor: (row: WriteOff) => row.totalValue },
      {
        header: "Lý do",
        accessor: (row: WriteOff) => getReasonText(row.reason),
      },
      {
        header: "Trạng thái",
        accessor: (row: WriteOff) =>
          row.status === "completed"
            ? "Hoàn thành"
            : row.status === "draft"
              ? "Phiếu tạm"
              : "Đã hủy",
      },
      { header: "Ghi chú", accessor: (row: WriteOff) => row.note || "" },
    ],
    []
  );

  // Get effective date range based on dateRangeType
  const getEffectiveDateRange = (): { from: Date; to: Date } | null => {
    if (dateRangeType === "preset") {
      return getDateRangeFromPreset(presetTimeRange);
    } else {
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

  // Get available items for write-off (ingredients and ready-made only)
  const availableItemsForWriteOff = inventoryItems.filter(
    (item) => item.type === "ingredient" || item.type === "ready-made"
  );

  // Get filtered items based on search and category
  const getFilteredAvailableItems = () => {
    return availableItemsForWriteOff.filter((item) => {
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

  // Batch selection helpers
  const isBatchSelected = (productId: string, batchCode: string): boolean => {
    return selectedBatches.some(
      (b) => b.productId === productId && b.batchCode === batchCode
    );
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

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
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

  let filteredWriteOffs = writeOffs.filter((wo) => {
    try {
      const matchesSearch = wo.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatuses.includes(wo.status);

      // Apply date filter
      const dateRange = getEffectiveDateRange();
      let matchesDate = true;
      if (dateRange) {
        try {
          const dateStr = wo.date ? wo.date.split(" ")[0] : "";
          if (dateStr) {
            const woDate = new Date(dateStr);
            if (!isNaN(woDate.getTime())) {
              woDate.setHours(0, 0, 0, 0);
              matchesDate = woDate >= dateRange.from && woDate <= dateRange.to;
            }
          }
        } catch (dateError) {
          matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    } catch (error) {
      console.error("Error filtering write-off:", error, wo);
      return false;
    }
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredWriteOffs = [...filteredWriteOffs].sort((a, b) => {
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
      } else if (sortField === "items") {
        aValue = a.items;
        bValue = b.items;
      } else if (sortField === "totalValue") {
        aValue = a.totalValue;
        bValue = b.totalValue;
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

  const totalValue = filteredWriteOffs.reduce(
    (sum, wo) => sum + wo.totalValue,
    0
  );
  const draftCount = writeOffs.filter((w) => w.status === "draft").length;
  const completedCount = writeOffs.filter(
    (w) => w.status === "completed"
  ).length;
  const cancelledCount = writeOffs.filter(
    (w) => w.status === "cancelled"
  ).length;

  const handleOpenCreateDialog = () => {
    const nextCode = generateNextWriteOffCode();
    const writeOffDate = formatDateTime(new Date());
    setEditingWriteOffId(null);
    setFormData({
      code: nextCode,
      date: writeOffDate.split(" ")[0],
      reason: "",
      note: "",
    });
    setWriteOffItems([]);
    setShowCreateDialog(true);
  };

  const handleEditWriteOff = (wo: WriteOff) => {
    if (wo.status !== "draft") {
      toast.error("Chỉ có thể chỉnh sửa phiếu tạm");
      return;
    }
    setEditingWriteOffId(wo.id);

    // Load write-off items into form
    const items: WriteOffItemForm[] =
      wo.details?.items.map((item) => ({
        productId: "", // We don't store productId in details, but that's okay
        productName: item.name,
        batchCode: item.batchCode,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        reason: item.reason || "",
      })) || [];

    setWriteOffItems(items);

    // Parse date from "YYYY-MM-DD HH:mm" to "YYYY-MM-DD"
    const datePart = wo.date.split(" ")[0];

    setFormData({
      code: wo.code,
      date: datePart,
      reason: wo.reason,
      note: wo.note || "",
    });
    setShowCreateDialog(true);
  };

  const handleCreateWriteOff = (status: "draft" | "completed") => {
    if (writeOffItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất một hàng hóa");
      return;
    }

    const totalAmount = writeOffItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const writeOffDate = formatDateTime(
      formData.date
        ? new Date(formData.date + " " + new Date().toTimeString().slice(0, 5))
        : new Date()
    );

    if (editingWriteOffId !== null) {
      // Update existing write-off
      setWriteOffs((prev) =>
        prev.map((wo) =>
          wo.id === editingWriteOffId
            ? {
              ...wo,
              code: formData.code,
              date: writeOffDate,
              items: writeOffItems.length,
              totalValue: totalAmount,
              reason: formData.reason,
              status: status,
              note: formData.note,
              details: {
                items: writeOffItems.map((item) => ({
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
            : wo
        )
      );
      toast.success(
        status === "completed"
          ? "Đã cập nhật và hoàn thành phiếu xuất hủy"
          : "Đã cập nhật phiếu xuất hủy"
      );
    } else {
      // Create new write-off
      const newWriteOff: WriteOff = {
        id:
          writeOffs.length > 0
            ? Math.max(...writeOffs.map((w) => w.id)) + 1
            : 1,
        code: formData.code,
        date: writeOffDate,
        items: writeOffItems.length,
        totalValue: totalAmount,
        reason: formData.reason,
        status: status,
        note: formData.note,
        details: {
          items: writeOffItems.map((item) => ({
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

      setWriteOffs([newWriteOff, ...writeOffs]);
      toast.success(
        status === "completed"
          ? "Đã tạo phiếu xuất hủy"
          : "Đã lưu nháp phiếu xuất hủy"
      );
    }

    setShowCreateDialog(false);
    setEditingWriteOffId(null);

    // Reset form
    setFormData({
      code: generateNextWriteOffCode(),
      date: "",
      reason: "",
      note: "",
    });
    setWriteOffItems([]);
  };

  const handleAddSelectedBatches = () => {
    const itemsToAdd: WriteOffItemForm[] = [];

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
            unitPrice: unitPrice,
            total: 0,
            reason: "",
          });
        }
      }
    });

    setWriteOffItems([...writeOffItems, ...itemsToAdd]);
    setShowAddItemDialog(false);
    setSelectedBatches([]);
    setItemSearchQuery("");
    setSelectedCategoryFilter("all");
    setExpandedItems(new Set());
  };

  const handleRemoveWriteOffItem = (index: number) => {
    setWriteOffItems(writeOffItems.filter((_, i) => i !== index));
  };

  const handleUpdateWriteOffItem = (
    index: number,
    field: keyof WriteOffItemForm,
    value: any
  ) => {
    const updatedItems = [...writeOffItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-calculate total
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setWriteOffItems(updatedItems);
  };

  const handleSaveWriteOff = (id: number) => {
    const writeOff = writeOffs.find((w) => w.id === id);
    if (!writeOff) return;

    const editedDate = editingDates[id];
    if (editedDate) {
      const updatedWriteOffs = writeOffs.map((w) =>
        w.id === id
          ? {
            ...w,
            date: editedDate.replace("T", " ").slice(0, 16),
          }
          : w
      );
      setWriteOffs(updatedWriteOffs);
      setEditingDates((prev) => {
        const newDates = { ...prev };
        delete newDates[id];
        return newDates;
      });
      toast.success("Đã lưu thông tin phiếu xuất hủy");
    }
  };

  const handlePrintWriteOff = () => {
    window.print();
  };

  const handleCancelWriteOff = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn huỷ phiếu xuất hủy này không?")) {
      setWriteOffs(writeOffs.filter((w) => w.id !== id));
      toast.success("Đã huỷ phiếu xuất hủy");
      if (expandedRow === id) {
        setExpandedRow(null);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Xuất hủy</h1>
          <p className="text-slate-600 text-sm">
            Quản lý phiếu xuất hủy hàng hóa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="w-4 h-4" />
            Nhập file
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="w-4 h-4" />
            Xuất file
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => handleOpenCreateDialog()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo phiếu xuất hủy
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </Button>
            </div>

            {showFilters && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Time Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Thời gian</Label>
                    <CustomerTimeFilter
                      dateRangeType={dateRangeType}
                      timePreset={presetTimeRange}
                      dateFrom={dateFrom}
                      dateTo={dateTo}
                      onDateRangeTypeChange={setDateRangeType}
                      onTimePresetChange={handleTimePresetChange}
                      onDateFromChange={setDateFrom}
                      onDateToChange={setDateTo}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Trạng thái</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-draft"
                          checked={selectedStatuses.includes('draft')}
                          onCheckedChange={() => toggleStatus('draft')}
                          className="border-slate-300"
                        />
                        <Label htmlFor="status-draft" className="text-sm text-slate-700 cursor-pointer font-normal">
                          Nháp
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-completed"
                          checked={selectedStatuses.includes('completed')}
                          onCheckedChange={() => toggleStatus('completed')}
                          className="border-slate-300"
                        />
                        <Label htmlFor="status-completed" className="text-sm text-slate-700 cursor-pointer font-normal">
                          Hoàn thành
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Quick Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Bộ lọc nhanh</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => setSelectedStatuses(['draft', 'completed'])}
                      >
                        Tất cả
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => setSelectedStatuses(['draft'])}
                      >
                        Nháp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => setSelectedStatuses(['completed'])}
                      >
                        Hoàn thành
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-blue-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-12 text-sm text-center"></TableHead>
                  <TableHead className="w-16 text-sm text-center">STT</TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Mã phiếu
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
                    onClick={() => handleSort("totalValue")}
                  >
                    <div className="flex items-center justify-end">
                      Tổng giá trị
                      {getSortIcon("totalValue")}
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
                {filteredWriteOffs.map((wo, index) => (
                  <>
                    <TableRow
                      key={wo.id}
                      className="hover:bg-blue-100/50 cursor-pointer"
                      onClick={() =>
                        setExpandedRow(expandedRow === wo.id ? null : wo.id)
                      }
                    >
                      <TableCell className="text-sm text-center">
                        {expandedRow === wo.id ? (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="text-blue-600">{wo.code}</span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {wo.date}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 text-center">
                        {wo.items}
                      </TableCell>
                      <TableCell className="text-sm text-red-600 text-right">
                        {wo.totalValue.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {getReasonText(wo.reason)}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${wo.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : wo.status === "draft"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-red-50 text-red-700"
                            }`}
                        >
                          {wo.status === "completed"
                            ? "Hoàn thành"
                            : wo.status === "draft"
                              ? "Phiếu tạm"
                              : "Đã huỷ"}
                        </span>
                      </TableCell>
                    </TableRow>
                    {/* Expanded Row */}
                    {expandedRow === wo.id && wo.details && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-slate-50 px-4 py-4">
                          <Tabs defaultValue="info" className="w-full">
                            <TabsList>
                              <TabsTrigger value="info">Thông tin</TabsTrigger>
                            </TabsList>
                            <TabsContent
                              value="info"
                              className="space-y-4 mt-4"
                            >
                              {/* Thông tin phiếu xuất hủy */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div>
                                      <span className="font-medium text-slate-600">
                                        Mã phiếu:
                                      </span>{" "}
                                      <span className="text-slate-900">
                                        {wo.code}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">
                                        Trạng thái:
                                      </span>{" "}
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${wo.status === "completed"
                                          ? "bg-green-50 text-green-700"
                                          : wo.status === "draft"
                                            ? "bg-orange-50 text-orange-700"
                                            : "bg-red-50 text-red-700"
                                          }`}
                                      >
                                        {wo.status === "completed"
                                          ? "Hoàn thành"
                                          : wo.status === "draft"
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
                                          editingDates[wo.id] ||
                                          wo.date.replace(" ", "T").slice(0, 16)
                                        }
                                        onChange={(e) =>
                                          setEditingDates({
                                            ...editingDates,
                                            [wo.id]: e.target.value,
                                          })
                                        }
                                        className="text-sm bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">
                                        Lý do:
                                      </span>{" "}
                                      <span className="text-slate-900">
                                        {getReasonText(wo.reason)}
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
                                          Lý do
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {wo.details.items.map((item, idx) => (
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
                                            {item.reason}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Summary */}
                                {wo.details && wo.details.items && (
                                  <div className="flex justify-end pt-4">
                                    <div className="space-y-3 text-sm min-w-[400px] bg-slate-50 rounded-lg p-6">
                                      <div className="flex items-center py-1">
                                        <span className="text-slate-600 text-right w-[180px] pr-4">
                                          Tổng số lượng:
                                        </span>
                                        <span className="text-slate-900 font-medium text-right flex-1">
                                          {wo.details.items.reduce(
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
                                          {wo.details.items.length}
                                        </span>
                                      </div>
                                      <div className="flex items-center border-t border-slate-300 pt-3 mt-2">
                                        <span className="text-slate-900 font-semibold text-base text-right w-[180px] pr-4">
                                          Tổng giá trị:
                                        </span>
                                        <span className="text-red-600 font-semibold text-base text-right flex-1">
                                          {wo.totalValue.toLocaleString(
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
                                  {wo.status === "draft" ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        className="gap-2"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditWriteOff(wo);
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
                                            !wo.details?.items ||
                                            wo.details.items.length === 0
                                          ) {
                                            toast.error(
                                              "Phiếu xuất hủy không có hàng hóa"
                                            );
                                            return;
                                          }

                                          // Cập nhật status của write-off thành "completed"
                                          setWriteOffs(
                                            writeOffs.map((w) =>
                                              w.id === wo.id
                                                ? {
                                                  ...w,
                                                  status:
                                                    "completed" as const,
                                                }
                                                : w
                                            )
                                          );

                                          toast.success(
                                            "Đã hoàn thành phiếu xuất hủy"
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
                                          handleSaveWriteOff(wo.id);
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
                                          handlePrintWriteOff();
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
                                          handleCancelWriteOff(wo.id);
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
              Hiển thị {filteredWriteOffs.length} phiếu xuất hủy
            </p>
          </div>
        </div>


      {/* Import Excel Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Import phiếu xuất hủy từ Excel</DialogTitle>
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

      {/* Create Write-Off Dialog - Similar to StockCheck modal */}
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
                {editingWriteOffId !== null
                  ? "Chỉnh sửa phiếu xuất hủy"
                  : "Thêm phiếu xuất hủy"}
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
            {/* Thông tin phiếu xuất hủy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã phiếu xuất hủy *</Label>
                <Input
                  value={formData.code}
                  disabled
                  className="bg-slate-100 border-slate-300 shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày xuất hủy *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
              <div className="space-y-2">
                <Label>Lý do *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, reason: value })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-300 shadow-none">
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="het-han">Hết hạn sử dụng</SelectItem>
                    <SelectItem value="hu-hong">Hư hỏng</SelectItem>
                    <SelectItem value="mat-mat">Mất mát</SelectItem>
                    <SelectItem value="khac">Khác</SelectItem>
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
                        SL hủy
                      </th>
                      <th className="px-4 py-2 text-right text-xs text-slate-600 w-28">
                        Giá nhập
                      </th>
                      <th className="px-4 py-2 text-right text-xs text-slate-600 w-28">
                        Thành tiền
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-slate-600 min-w-[160px]">
                        Lý do hủy
                      </th>
                      <th className="px-4 py-2 text-center text-xs text-slate-600 w-12">
                        Xóa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {writeOffItems.length === 0 ? (
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
                      writeOffItems.map((item, index) => {
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
                                        `Số lượng hủy không được vượt quá ${maxQuantity} ${item.unit}`
                                      );
                                      return;
                                    }
                                    handleUpdateWriteOffItem(
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
                                  handleUpdateWriteOffItem(
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
                                onClick={() => handleRemoveWriteOffItem(index)}
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

            {/* Ghi chú */}
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Nhập ghi chú về phiếu xuất hủy..."
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
                disabled={writeOffItems.length === 0}
                onClick={() => handleCreateWriteOff("draft")}
              >
                Lưu nháp
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={writeOffItems.length === 0}
                onClick={() => handleCreateWriteOff("completed")}
              >
                Hoàn thành
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog - Similar to PurchaseReturns modal but with batches */}
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
              Thêm hàng hóa vào phiếu xuất hủy
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
                    className={`px-3 py-1.5 text-sm border border-slate-200 rounded-lg transition-colors ${isActive
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
                                                  .filter((b: BatchInfo) => b.quantity > 0)
                                                  .every((b) =>
                                                    isBatchSelected(
                                                      item.id,
                                                      b.batchCode
                                                    )
                                                  )
                                              }
                                              onCheckedChange={(checked: boolean) => {
                                                allBatches
                                                  .filter((b: BatchInfo) => b.quantity > 0)
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
                                              className={`${canSelect
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
                Thêm vào phiếu xuất hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Export Dialog */}
      <ExportExcelDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={filteredWriteOffs}
        columns={exportColumns}
        fileName={`Danh_sach_phieu_xuat_huy_${format(new Date(), "dd-MM-yyyy")}`}
        title="Xuất dữ liệu Xuất hủy"
      />
    </div>
  );
}
