import { useState, useEffect } from "react";
import * as React from "react";
import {
  Search,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Upload,
  X,
  Package,
  Trash2,
  Calendar as CalendarIcon,
  Printer,
  RotateCcw,
  Pencil,
  Check,
  Copy,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner@2.0.3";
import { ExportExcelDialog } from "../ExportExcelDialog";
import { useAuth } from "../../contexts/AuthContext";
import { categories } from "../../data/categories";

interface PurchaseOrderItem {
  name: string;
  batchCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
  expiryDate?: string;
}

interface PurchaseOrder {
  id: number;
  code: string;
  date: string;
  supplier: string;
  supplierId?: string;
  items: number;
  totalAmount: number;
  paidAmount: number; // Số tiền đã trả NCC
  debtAmount: number; // Số tiền còn nợ
  status: "completed" | "draft" | "cancelled"; // Đã nhập hàng, Phiếu tạm, Đã huỷ
  staff: string;
  note?: string;
  details?: {
    items: PurchaseOrderItem[];
  };
  paymentHistory?: Array<{
    id: string;
    date: string;
    amount: number;
    note?: string;
  }>;
}

interface NewItem {
  batchCode: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: string;
  expiryDate: string;
  unitPrice: string;
  discount: string;
  discountType: "percent" | "amount"; // % hoặc VND
}

export function PurchaseOrders() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  // Date range filter states (similar to Finance.tsx)
  const [dateRangeType, setDateRangeType] = useState<"preset" | "custom">(
    "preset"
  );

  // Helper functions for number formatting with commas
  const formatNumberWithCommas = (value: number | string): string => {
    if (value === "" || value === null || value === undefined) return "";
    const numValue =
      typeof value === "string"
        ? parseFloat(value.replace(/,/g, "").replace(/đ/g, "").trim())
        : value;
    if (isNaN(numValue)) return "";
    // Use commas for thousands separator (custom format instead of vi-VN which uses dots)
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (value: string): number => {
    if (!value || value.trim() === "") return 0;
    // Remove all formatting characters (commas, spaces, currency symbols)
    const cleaned = value
      .replace(/,/g, "")
      .replace(/đ/g, "")
      .replace(/\s/g, "")
      .replace(/[^\d]/g, "")
      .trim();
    if (cleaned === "") return 0;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, parsed); // Ensure non-negative
  };
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
  const [sortColumn, setSortColumn] = useState<keyof PurchaseOrder | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | "none">("none");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [addedItems, setAddedItems] = useState<PurchaseOrderItem[]>([]);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
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

  // Form state for creating purchase order
  const [formData, setFormData] = useState({
    code: "",
    date: "",
    supplier: "",
    staff: "",
    note: "",
    paidAmount: "", // Số tiền phải trả cho NCC
    paymentMethod: "cash" as "cash" | "transfer", // Phương thức thanh toán
    bankAccount: "", // Số tài khoản (nếu chuyển khoản)
    bankId: "", // ID ngân hàng (nếu chuyển khoản)
    bankName: "", // Tên ngân hàng (nếu chuyển khoản)
  });

  // Form state for adding new item
  const [newItem, setNewItem] = useState<NewItem>({
    batchCode: "",
    productId: "",
    productName: "",
    unit: "",
    quantity: "",
    expiryDate: "",
    unitPrice: "",
    discount: "0",
    discountType: "percent",
  });

  // Mock data - chuyển thành state để có thể thêm/sửa/xóa
  // Load purchase orders from localStorage on mount
  const loadPurchaseOrders = (): PurchaseOrder[] => {
    // Default mock data - tháng này
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();

    // Tính toán các ngày trong tháng này
    const day1 = Math.max(1, Math.min(currentDay - 2, 28)); // 2 ngày trước, tối thiểu là 1
    const day2 = Math.max(1, Math.min(currentDay - 1, 28)); // 1 ngày trước, tối thiểu là 1
    const day3 = currentDay; // Hôm nay

    const formatDate = (day: number) => {
      return `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    };

    return [
      {
        id: 1,
        code: "PN001",
        date: `${formatDate(day1)} 09:00`,
        supplier: "Trung Nguyên",
        supplierId: "trung-nguyen",
        items: 5,
        totalAmount: 15000000,
        paidAmount: 15000000,
        debtAmount: 0,
        status: "completed",
        staff: "Nguyễn Văn A",
        details: {
          items: [
            {
              name: "Cà phê hạt Arabica",
              batchCode: `LO-${currentYear}-001`,
              quantity: 50,
              unit: "kg",
              unitPrice: 250000,
              discount: 0,
              total: 12500000,
            },
            {
              name: "Cà phê hạt Robusta",
              batchCode: `LO-${currentYear}-002`,
              quantity: 20,
              unit: "kg",
              unitPrice: 125000,
              discount: 0,
              total: 2500000,
            },
          ],
        },
        paymentHistory: [
          {
            id: "1",
            date: `${formatDate(day1)} 09:30`,
            amount: 15000000,
            note: "Thanh toán đầy đủ",
          },
        ],
      },
      {
        id: 2,
        code: "PN002",
        date: `${formatDate(day2)} 10:30`,
        supplier: "Vinamilk",
        supplierId: "vinamilk",
        items: 3,
        totalAmount: 8500000,
        paidAmount: 5000000,
        debtAmount: 3500000,
        status: "completed",
        staff: "Trần Thị B",
        details: {
          items: [
            {
              name: "Sữa tươi nguyên chất",
              batchCode: `LO-${currentYear}-003`,
              quantity: 100,
              unit: "L",
              unitPrice: 35000,
              discount: 0,
              total: 3500000,
              expiryDate: `${currentYear + 1}-01-15`,
            },
            {
              name: "Sữa đặc có đường",
              batchCode: `LO-${currentYear}-004`,
              quantity: 50,
              unit: "hộp",
              unitPrice: 80000,
              discount: 0,
              total: 4000000,
              expiryDate: `${currentYear + 1}-06-30`,
            },
            {
              name: "Kem tươi",
              batchCode: `LO-${currentYear}-005`,
              quantity: 20,
              unit: "hộp",
              unitPrice: 50000,
              discount: 0,
              total: 1000000,
              expiryDate: `${currentYear + 1}-02-01`,
            },
          ],
        },
        paymentHistory: [
          {
            id: "1",
            date: `${formatDate(day2)} 10:45`,
            amount: 5000000,
            note: "Thanh toán một phần",
          },
        ],
      },
      {
        id: 3,
        code: "PN003",
        date: `${formatDate(day3)} 14:00`,
        supplier: "Thai Milk",
        supplierId: "thai-milk",
        items: 4,
        totalAmount: 6200000,
        paidAmount: 0,
        debtAmount: 6200000,
        status: "draft",
        staff: "Lê Văn C",
        details: {
          items: [
            {
              name: "Trà xanh matcha",
              batchCode: `LO-${currentYear}-006`,
              quantity: 10,
              unit: "kg",
              unitPrice: 420000,
              discount: 0,
              total: 4200000,
            },
            {
              name: "Trà ô long",
              batchCode: `LO-${currentYear}-007`,
              quantity: 10,
              unit: "kg",
              unitPrice: 200000,
              discount: 0,
              total: 2000000,
            },
          ],
        },
        paymentHistory: [],
      },
    ];
  };

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    loadPurchaseOrders()
  );

  // Save purchase orders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("purchaseOrders", JSON.stringify(purchaseOrders));
    } catch (error) {
      console.error("Error saving purchase orders to localStorage:", error);
    }
  }, [purchaseOrders]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
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
      default:
        return null;
    }
  };

  // Sort handler
  const handleSort = (column: keyof PurchaseOrder) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> none -> asc
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection("none");
        setSortColumn(null);
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    } else {
      // New column: start with asc
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get sort icon for column header
  const getSortIcon = (column: keyof PurchaseOrder) => {
    if (sortColumn !== column || sortDirection === "none") {
      return null;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
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

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.includes(order.status);

    // Apply date filter
    const dateRange = getEffectiveDateRange();
    let matchesDate = true;
    if (dateRange) {
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);
      matchesDate = orderDate >= dateRange.from && orderDate <= dateRange.to;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Apply sorting
  const sortedOrders = [...filteredOrders];
  if (sortColumn && sortDirection !== "none") {
    sortedOrders.sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Handle date sorting
      if (sortColumn === "date") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      // Handle number fields (items, totalAmount, paidAmount)
      else if (
        sortColumn === "items" ||
        sortColumn === "totalAmount" ||
        sortColumn === "paidAmount"
      ) {
        aValue = typeof aValue === "number" ? aValue : 0;
        bValue = typeof bValue === "number" ? bValue : 0;
      }
      // Handle string comparison (code, supplier, staff, status)
      else if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Compare values
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalAmount = sortedOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const draftCount = purchaseOrders.filter((o) => o.status === "draft").length;
  const completedCount = purchaseOrders.filter(
    (o) => o.status === "completed"
  ).length;
  const cancelledCount = purchaseOrders.filter(
    (o) => o.status === "cancelled"
  ).length;

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) {
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const unitPrice = parseFloat(newItem.unitPrice);
    const discountValue = parseFloat(newItem.discount);

    // Calculate discount based on type
    let discountAmount = 0;
    if (newItem.discountType === "percent") {
      discountAmount = (quantity * unitPrice * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    const total = quantity * unitPrice - discountAmount;

    const item: PurchaseOrderItem = {
      name: newItem.productName,
      batchCode: newItem.batchCode,
      quantity,
      unit: newItem.unit,
      unitPrice,
      discount: discountAmount,
      total,
      expiryDate: newItem.expiryDate || undefined,
    };

    setAddedItems([...addedItems, item]);

    // Reset form
    setNewItem({
      batchCode: "",
      productId: "",
      productName: "",
      unit: "",
      quantity: "",
      expiryDate: "",
      unitPrice: "",
      discount: "0",
      discountType: "percent",
    });
  };

  const handleRemoveItem = (index: number) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  // Helper function to generate next purchase order code (PN001, PN002, ...)
  const generateNextPurchaseOrderCode = (): string => {
    // Find the highest number from existing purchase orders
    let maxNumber = 0;
    purchaseOrders.forEach((order) => {
      const match = order.code.match(/^PN(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    // Generate next code
    const nextNumber = maxNumber + 1;
    return `PN${String(nextNumber).padStart(3, "0")}`;
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

  const handleOpenCreateDialog = () => {
    // Set default staff to current user
    const defaultStaff = user
      ? `NV${user.id.padStart(3, "0")} - ${user.fullName}`
      : "";
    setEditingOrderId(null);
    setAddedItems([]);
    // Calculate initial totalValue (will be 0 since addedItems is empty)
    const initialTotalValue = 0;
    const now = new Date();
    setFormData({
      code: generateNextPurchaseOrderCode(),
      date: formatDateTime(now),
      supplier: "",
      staff: defaultStaff,
      note: "",
      paidAmount: initialTotalValue.toString(),
      paymentMethod: "cash",
      bankAccount: "",
      bankId: "",
      bankName: "",
    });
    setBankSearchOpen(false);
    setShowCreateDialog(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    if (order.status !== "draft") {
      toast.error("Chỉ có thể chỉnh sửa phiếu tạm");
      return;
    }
    setEditingOrderId(order.id);
    setAddedItems(order.details?.items || []);
    // Parse payment method from payment history or default to cash
    let paymentMethod: "cash" | "transfer" = "cash";
    let bankAccount = "";
    let bankId = "";
    let bankName = "";

    if (order.paymentHistory && order.paymentHistory.length > 0) {
      const lastPayment = order.paymentHistory[order.paymentHistory.length - 1];
      // Try to infer payment method from payment history
      // This is a simplified approach - you may need to store this in the order object
    }

    setFormData({
      code: order.code,
      date: order.date,
      supplier: order.supplierId || order.supplier,
      staff: order.staff,
      note: order.note || "",
      paidAmount: (order.paidAmount || 0).toString(),
      paymentMethod: paymentMethod,
      bankAccount: bankAccount,
      bankId: bankId,
      bankName: bankName,
    });
    setBankSearchOpen(false);
    setShowCreateDialog(true);
  };

  const handleCreateOrder = () => {
    console.log("Creating order:", formData, "Items:", addedItems);
    setShowCreateDialog(false);
    setEditingOrderId(null);
    // Reset form
    const defaultStaff = user
      ? `NV${user.id.padStart(3, "0")} - ${user.fullName}`
      : "";
    setFormData({
      code: generateNextPurchaseOrderCode(),
      date: "",
      supplier: "",
      staff: defaultStaff,
      note: "",
      paidAmount: "",
      paymentMethod: "cash",
      bankAccount: "",
      bankName: "",
    });
    setAddedItems([]);
  };

  const totalQuantity = addedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = addedItems.reduce((sum, item) => sum + item.total, 0);

  // Auto-update paidAmount when totalValue changes (only when modal is open)
  useEffect(() => {
    if (showCreateDialog && totalValue > 0) {
      setFormData((prev) => ({
        ...prev,
        paidAmount: totalValue.toString(),
      }));
    }
  }, [totalValue, showCreateDialog]);

  // Helper function to update inventory items when completing purchase order
  const updateInventoryItems = (items: PurchaseOrderItem[]) => {
    try {
      // Load current inventory items from localStorage
      const stored = localStorage.getItem("inventoryItems");
      let inventoryItems: any[] = stored ? JSON.parse(stored) : [];

      // If no items in localStorage, use the mock data
      if (inventoryItems.length === 0) {
        inventoryItems = [
          {
            id: "ing1",
            name: "Cà phê hạt Arabica",
            type: "ingredient",
            category: "coffee",
            unit: "kg",
            currentStock: 15,
          },
          {
            id: "ing2",
            name: "Sữa tươi",
            type: "ingredient",
            category: "dairy",
            unit: "L",
            currentStock: 12,
          },
          {
            id: "ing3",
            name: "Đường trắng",
            type: "ingredient",
            category: "syrup",
            unit: "kg",
            currentStock: 3,
          },
          {
            id: "ing4",
            name: "Kem tươi",
            type: "ingredient",
            category: "dairy",
            unit: "hộp",
            currentStock: 8,
          },
          {
            id: "ing5",
            name: "Trà Ô Long",
            type: "ingredient",
            category: "tea",
            unit: "kg",
            currentStock: 25,
          },
          {
            id: "ing6",
            name: "Ly nhựa size L",
            type: "ingredient",
            category: "packaging",
            unit: "cái",
            currentStock: 150,
          },
          {
            id: "rm1",
            name: "Coca Cola",
            type: "ready-made",
            category: "bottled-beverages",
            unit: "chai",
            currentStock: 48,
          },
          {
            id: "rm2",
            name: "Bánh Croissant",
            type: "ready-made",
            category: "pastries",
            unit: "cái",
            currentStock: 8,
          },
        ];
      }

      // Update inventory for each item in the purchase order
      items.forEach((orderItem) => {
        // Find matching inventory item by name
        const inventoryItem = inventoryItems.find(
          (item) => item.name === orderItem.name
        );

        if (inventoryItem) {
          // Update current stock
          inventoryItem.currentStock =
            (inventoryItem.currentStock || 0) + orderItem.quantity;

          // If item has batches array, add new batch
          if (!inventoryItem.batches) {
            inventoryItem.batches = [];
          }

          // Add batch info
          const batchInfo = {
            batchCode: orderItem.batchCode,
            quantity: orderItem.quantity,
            unitCost: orderItem.unitPrice,
            entryDate: new Date().toISOString().split("T")[0],
            expiryDate: orderItem.expiryDate || undefined,
            supplier: "", // Will be set from purchase order
          };

          inventoryItem.batches.push(batchInfo);
        } else {
          // If item doesn't exist, create new one
          const newItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: orderItem.name,
            type: "ingredient", // Default to ingredient
            category: "other",
            unit: orderItem.unit,
            currentStock: orderItem.quantity,
            minStock: 0,
            maxStock: 1000,
            status: "good",
            batches: [
              {
                batchCode: orderItem.batchCode,
                quantity: orderItem.quantity,
                unitCost: orderItem.unitPrice,
                entryDate: new Date().toISOString().split("T")[0],
                expiryDate: orderItem.expiryDate || undefined,
                supplier: "",
              },
            ],
            totalValue: orderItem.total,
            avgUnitCost: orderItem.unitPrice,
          };
          inventoryItems.push(newItem);
        }
      });

      // Save updated inventory items to localStorage
      localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
    } catch (error) {
      console.error("Error updating inventory items:", error);
    }
  };

  // Helper function to save cashflow entry to localStorage
  const saveCashflowEntry = (entry: any) => {
    try {
      const stored = localStorage.getItem("cashflowEntries");
      const cashflowEntries = stored ? JSON.parse(stored) : [];
      cashflowEntries.push(entry);
      localStorage.setItem("cashflowEntries", JSON.stringify(cashflowEntries));
    } catch (error) {
      console.error("Error saving cashflow entry:", error);
    }
  };

  // Mock inventory items (ingredients and ready-made only, no composite)
  const inventoryItems = [
    // Ingredients
    {
      id: "ing1",
      name: "Cà phê hạt Arabica",
      type: "ingredient",
      category: "coffee",
      unit: "kg",
      currentStock: 15,
    },
    {
      id: "ing2",
      name: "Sữa tươi",
      type: "ingredient",
      category: "dairy",
      unit: "L",
      currentStock: 12,
    },
    {
      id: "ing3",
      name: "Đường trắng",
      type: "ingredient",
      category: "syrup",
      unit: "kg",
      currentStock: 3,
    },
    {
      id: "ing4",
      name: "Kem tươi",
      type: "ingredient",
      category: "dairy",
      unit: "hộp",
      currentStock: 8,
    },
    {
      id: "ing5",
      name: "Trà Ô Long",
      type: "ingredient",
      category: "tea",
      unit: "kg",
      currentStock: 25,
    },
    {
      id: "ing6",
      name: "Ly nhựa size L",
      type: "ingredient",
      category: "packaging",
      unit: "cái",
      currentStock: 150,
    },
    // Ready-made items
    {
      id: "rm1",
      name: "Coca Cola",
      type: "ready-made",
      category: "bottled-beverages",
      unit: "chai",
      currentStock: 48,
    },
    {
      id: "rm2",
      name: "Bánh Croissant",
      type: "ready-made",
      category: "pastries",
      unit: "cái",
      currentStock: 8,
    },
  ];

  // Filter items for add item dialog (only ingredients and ready-made)
  const availableItemsForPurchase = inventoryItems.filter(
    (item) => item.type === "ingredient" || item.type === "ready-made"
  );

  // Get filtered items based on search and category
  const getFilteredAvailableItems = () => {
    return availableItemsForPurchase.filter((item) => {
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
  const allAvailableItemsSelected =
    filteredAvailableItems.length > 0 &&
    filteredAvailableItems.every((item) => selectedItemIds.includes(item.id));

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAllAvailableItems = (checked: boolean) => {
    if (checked) {
      const allIds = filteredAvailableItems.map((item) => item.id);
      setSelectedItemIds((prev) => [...new Set([...prev, ...allIds])]);
    } else {
      const allIds = filteredAvailableItems.map((item) => item.id);
      setSelectedItemIds((prev) => prev.filter((id) => !allIds.includes(id)));
    }
  };

  const handleSelectCategoryItems = (categoryId: string) => {
    const itemsToSelect = getFilteredAvailableItems().filter((item) => {
      if (categoryId === "all") {
        return true;
      }
      return item.category === categoryId;
    });

    const idsToSelect = itemsToSelect.map((item) => item.id);

    // Check if all items in this category are already selected
    const allSelected = idsToSelect.every((id) => selectedItemIds.includes(id));

    if (allSelected) {
      // Deselect all items in this category
      setSelectedItemIds((prev) =>
        prev.filter((id) => !idsToSelect.includes(id))
      );
    } else {
      // Select all items in this category
      setSelectedItemIds((prev) => [...new Set([...prev, ...idsToSelect])]);
    }
  };

  const handleAddSelectedItems = () => {
    const itemsToAdd = availableItemsForPurchase.filter((item) =>
      selectedItemIds.includes(item.id)
    );

    // Generate batch code for each item (each item gets its own batch)
    const newItems: PurchaseOrderItem[] = itemsToAdd.map((item, index) => {
      const batchNumber = String(addedItems.length + index + 1).padStart(
        3,
        "0"
      );
      const batchCode = `LO-${new Date().getFullYear()}-${batchNumber}`;

      return {
        name: item.name,
        batchCode: batchCode,
        quantity: 0, // Will be filled by user
        unit: item.unit,
        unitPrice: 0, // Will be filled by user
        discount: 0,
        total: 0,
      };
    });

    setAddedItems((prev) => [...prev, ...newItems]);
    setShowAddItemDialog(false);
    setSelectedItemIds([]);
    setItemSearchQuery("");
    setSelectedCategoryFilter("all");
    toast.success(`Đã thêm ${newItems.length} hàng hóa vào phiếu nhập`);
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto space-y-4">
        <div>
          <h3 className="text-sm text-slate-900 mb-3">Bộ lọc</h3>

          {/* Date Range Filter - Similar to Finance.tsx */}
          <div className="mb-4">
            <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
            <RadioGroup
              value={dateRangeType}
              onValueChange={(value) =>
                setDateRangeType(value as "preset" | "custom")
              }
            >
              {/* Preset Time Ranges */}
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="preset" id="date-preset" className="border-slate-300" />
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
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${presetTimeRange === option.value
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-600 hover:bg-blue-100"
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
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${presetTimeRange === option.value
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-600 hover:bg-blue-100"
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
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${presetTimeRange === option.value
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-600 hover:bg-blue-100"
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
                          })} - ${format(dateTo, "dd/MM/yyyy", {
                            locale: vi,
                          })}`
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

          {/* Status Filter with Checkboxes */}
          <div className="mb-4">
            <label className="block mb-2 text-slate-700 text-xs">
              Trạng thái
            </label>
            <div className="space-y-2">
              {[
                {
                  id: "completed",
                  label: "Đã nhập hàng",
                },
                { id: "draft", label: "Phiếu tạm" },
                { id: "cancelled", label: "Đã hủy" },
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
              <Package className="w-3 h-3 mr-2" />
              Phiếu tạm ({draftCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedStatuses(["completed"])}
            >
              <Package className="w-3 h-3 mr-2" />
              Đã nhập hàng ({completedCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedStatuses(["cancelled"])}
            >
              <Package className="w-3 h-3 mr-2" />
              Đã hủy ({cancelledCount})
            </Button>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div>
          <h4 className="text-sm text-slate-700 mb-3">Tổng quan</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng phiếu nhập:</span>
              <span className="text-slate-900">{sortedOrders.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng giá trị:</span>
              <span className="text-blue-600">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 mb-2">Nhập hàng</h1>
              <p className="text-sm text-slate-600">
                Quản lý phiếu nhập hàng từ nhà cung cấp
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
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={handleOpenCreateDialog}
              >
                <Plus className="w-4 h-4" />
                Tạo phiếu nhập
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
        <div className="bg-white rounded-xl border border-blue-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto rounded-xl">
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
                    onClick={() => handleSort("totalAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Tổng giá trị
                      {getSortIcon("totalAmount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("staff")}
                  >
                    <div className="flex items-center">
                      Nhân viên
                      {getSortIcon("staff")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleSort("paidAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Đã trả NCC
                      {getSortIcon("paidAmount")}
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
                {sortedOrders.map((order, index) => (
                  <>
                    <TableRow
                      key={order.id}
                      className="hover:bg-blue-100/50 cursor-pointer"
                      onClick={() =>
                        setExpandedRow(
                          expandedRow === order.id ? null : order.id
                        )
                      }
                    >
                      <TableCell className="text-sm text-center">
                        {expandedRow === order.id ? (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="text-blue-600">{order.code}</span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {order.date}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {order.supplier}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 text-center">
                        {order.items}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900 text-right">
                        {order.totalAmount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {order.staff}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900 text-right">
                        {order.paidAmount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${order.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : order.status === "draft"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {order.status === "completed"
                            ? "Đã nhập hàng"
                            : order.status === "draft"
                              ? "Phiếu tạm"
                              : "Đã hủy"}
                        </span>
                      </TableCell>
                    </TableRow>
                    {/* Expanded Row */}
                    {expandedRow === order.id && order.details && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-slate-50 px-4 py-4">
                          <Tabs defaultValue="info" className="w-full">
                            <TabsList>
                              <TabsTrigger value="info">Thông tin</TabsTrigger>
                              <TabsTrigger value="payment-history">
                                Lịch sử thanh toán
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent
                              value="info"
                              className="space-y-4 mt-4"
                            >
                              {/* Order Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium text-slate-600">
                                      Mã phiếu nhập:
                                    </span>{" "}
                                    <span className="text-slate-900">
                                      {order.code}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-slate-600">
                                      Trạng thái:
                                    </span>{" "}
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${order.status === "completed"
                                        ? "bg-green-50 text-green-700"
                                        : order.status === "draft"
                                          ? "bg-orange-50 text-orange-700"
                                          : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                      {order.status === "completed"
                                        ? "Đã nhập hàng"
                                        : order.status === "draft"
                                          ? "Phiếu tạm"
                                          : "Đã hủy"}
                                    </span>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-slate-600 mb-1 block">
                                      Thời gian
                                    </Label>
                                    <Input
                                      type="datetime-local"
                                      value={
                                        editingDates[order.id] !== undefined
                                          ? editingDates[order.id]
                                          : order.date.includes("T")
                                            ? order.date
                                            : order.date.replace(" ", "T")
                                      }
                                      onChange={(e) => {
                                        setEditingDates({
                                          ...editingDates,
                                          [order.id]: e.target.value,
                                        });
                                      }}
                                      className="text-sm bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                    />
                                  </div>
                                  <div>
                                    <span className="font-medium text-slate-600">
                                      Nhà cung cấp:
                                    </span>{" "}
                                    <span className="text-blue-600 hover:underline cursor-pointer">
                                      {order.supplier}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium text-slate-600">
                                      Nhân viên:
                                    </span>{" "}
                                    <span className="text-slate-900">
                                      {order.staff}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Items Table */}
                              <div className="border rounded-lg overflow-hidden">
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
                                        Giảm giá
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs text-slate-600">
                                        Thành tiền
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {order.details.items.map((item, idx) => (
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
                                        <td className="px-4 py-2 text-sm text-slate-600 text-right">
                                          {item.discount.toLocaleString(
                                            "vi-VN"
                                          )}
                                          đ
                                        </td>
                                        <td className="px-4 py-2 text-sm text-slate-900 text-right font-medium">
                                          {item.total.toLocaleString("vi-VN")}đ
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Summary */}
                              <div className="flex justify-end pt-4">
                                <div className="space-y-3 text-sm min-w-[400px] bg-slate-50 rounded-lg p-6">
                                  <div className="flex items-center py-1">
                                    <span className="text-slate-600 text-right w-[180px] pr-4">
                                      Tổng số lượng:
                                    </span>
                                    <span className="text-slate-900 font-medium text-right flex-1">
                                      {order.details.items.reduce(
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
                                      {order.details.items.length}
                                    </span>
                                  </div>
                                  <div className="flex items-center py-1">
                                    <span className="text-slate-600 text-right w-[180px] pr-4">
                                      Tổng tiền hàng:
                                    </span>
                                    <span className="text-slate-900 font-medium text-right flex-1">
                                      {order.details.items
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
                                      Giảm giá phiếu nhập:
                                    </span>
                                    <span className="text-slate-900 font-medium text-right flex-1">
                                      0đ
                                    </span>
                                  </div>
                                  <div className="flex items-center border-t border-slate-300 pt-3 mt-2">
                                    <span className="text-slate-900 font-semibold text-base text-right w-[180px] pr-4">
                                      Tổng cộng:
                                    </span>
                                    <span className="text-blue-600 font-semibold text-base text-right flex-1">
                                      {order.totalAmount.toLocaleString(
                                        "vi-VN"
                                      )}
                                      đ
                                    </span>
                                  </div>
                                  <div className="flex items-center py-1">
                                    <span className="text-slate-600 text-right w-[180px] pr-4">
                                      Tiền đã trả NCC:
                                    </span>
                                    <span className="text-slate-900 font-medium text-right flex-1">
                                      {order.paidAmount.toLocaleString("vi-VN")}
                                      đ
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                {order.status === "draft" ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      className="gap-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditOrder(order);
                                      }}
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Chỉnh sửa
                                    </Button>
                                    <Button
                                      className="bg-green-600 hover:bg-green-700 gap-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Hoàn thành phiếu tạm
                                        if (
                                          !order.details?.items ||
                                          order.details.items.length === 0
                                        ) {
                                          toast.error(
                                            "Phiếu nhập không có hàng hóa"
                                          );
                                          return;
                                        }

                                        // 1. Cập nhật số lượng hàng hóa trong inventory
                                        updateInventoryItems(
                                          order.details.items
                                        );

                                        // 2. Thêm vào sổ quỹ nếu có số tiền phải trả
                                        let paymentHistoryEntry = null;
                                        if (order.paidAmount > 0) {
                                          // Tạo phiếu chi "Chi tiền trả NCC"
                                          const cashflowCode = `PCPN${order.code.replace(
                                            "PN",
                                            ""
                                          )}`;
                                          const cashflowEntry = {
                                            id: `CF-${Date.now()}`,
                                            code: cashflowCode,
                                            date: order.date,
                                            type: "expense",
                                            category: "pay-supplier", // Chi tiền NCC
                                            amount: order.paidAmount,
                                            paymentMethod: "cash", // Default, có thể lưu trong order sau
                                            description: `Chi tiền trả NCC - Phiếu nhập ${order.code}`,
                                            staff: order.staff,
                                            supplier: order.supplier,
                                            status: "completed",
                                          };

                                          // Lưu vào localStorage để Finance có thể đọc
                                          saveCashflowEntry(cashflowEntry);

                                          // Create payment history entry
                                          paymentHistoryEntry = {
                                            id: cashflowCode,
                                            date: order.date,
                                            amount: order.paidAmount,
                                            note: `Thanh toán tiền mặt`,
                                          } as any;

                                          toast.success(
                                            `Đã thêm phiếu chi ${order.paidAmount.toLocaleString(
                                              "vi-VN"
                                            )}đ vào sổ quỹ`
                                          );
                                        }

                                        // 3. Cập nhật status của order thành "completed"
                                        setPurchaseOrders(
                                          purchaseOrders.map((o) =>
                                            o.id === order.id
                                              ? {
                                                ...o,
                                                status: "completed" as const,
                                                paymentHistory:
                                                  paymentHistoryEntry
                                                    ? [
                                                      ...(o.paymentHistory ||
                                                        []),
                                                      paymentHistoryEntry,
                                                    ]
                                                    : o.paymentHistory || [],
                                              }
                                              : o
                                          )
                                        );

                                        toast.success(
                                          "Đã hoàn thành phiếu nhập hàng"
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Lưu thông tin
                                        if (editingDates[order.id]) {
                                          const newDate = editingDates[
                                            order.id
                                          ].replace("T", " ");
                                          setPurchaseOrders(
                                            purchaseOrders.map((o) =>
                                              o.id === order.id
                                                ? { ...o, date: newDate }
                                                : o
                                            )
                                          );
                                          // Xóa khỏi editingDates
                                          const newEditingDates = {
                                            ...editingDates,
                                          };
                                          delete newEditingDates[order.id];
                                          setEditingDates(newEditingDates);
                                        }
                                        toast.success(
                                          "Đã lưu thông tin phiếu nhập"
                                        );
                                      }}
                                    >
                                      <Save className="w-4 h-4" />
                                      Lưu
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="gap-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Trả hàng
                                        toast.info(
                                          "Tính năng trả hàng đang được phát triển"
                                        );
                                      }}
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                      Trả hàng
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="gap-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // In phiếu nhập
                                        window.print();
                                      }}
                                    >
                                      <Printer className="w-4 h-4" />
                                      In
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 gap-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Huỷ phiếu nhập
                                        if (
                                          confirm(
                                            "Bạn có chắc chắn muốn huỷ phiếu nhập này?"
                                          )
                                        ) {
                                          setPurchaseOrders(
                                            purchaseOrders.filter(
                                              (o) => o.id !== order.id
                                            )
                                          );
                                          if (expandedRow === order.id) {
                                            setExpandedRow(null);
                                          }
                                          // Xóa khỏi editingDates nếu có
                                          const newEditingDates = {
                                            ...editingDates,
                                          };
                                          delete newEditingDates[order.id];
                                          setEditingDates(newEditingDates);
                                          toast.success("Đã huỷ phiếu nhập");
                                        }
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                      Huỷ bỏ
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent
                              value="payment-history"
                              className="space-y-4 mt-4"
                            >
                              {/* Payment History Table */}
                              {(() => {
                                // Load cashflow entries from localStorage
                                let paymentHistory: any[] = [];
                                try {
                                  const stored =
                                    localStorage.getItem("cashflowEntries");
                                  if (stored) {
                                    const cashflowEntries = JSON.parse(stored);
                                    // Filter entries related to this purchase order
                                    paymentHistory = cashflowEntries.filter(
                                      (entry: any) =>
                                        entry.category === "pay-supplier" &&
                                        (entry.description?.includes(
                                          order.code
                                        ) ||
                                          entry.supplier === order.supplier)
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error loading payment history:",
                                    error
                                  );
                                }

                                // Also include paymentHistory from order if exists
                                if (order.paymentHistory) {
                                  paymentHistory = [
                                    ...order.paymentHistory.map((ph) => ({
                                      id: ph.id,
                                      code: ph.id,
                                      date: ph.date,
                                      amount: ph.amount,
                                      note: ph.note,
                                      paymentMethod: "cash",
                                    })),
                                    ...paymentHistory,
                                  ];
                                }

                                return paymentHistory.length > 0 ? (
                                  <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-slate-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs text-slate-600">
                                            Mã phiếu
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs text-slate-600">
                                            Thời gian
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs text-slate-600">
                                            Người tạo
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs text-slate-600">
                                            Phương thức
                                          </th>
                                          <th className="px-4 py-2 text-center text-xs text-slate-600">
                                            Trạng thái
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs text-slate-600">
                                            Tiền chi
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {paymentHistory.map((payment, idx) => (
                                          <tr key={payment.id || idx}>
                                            <td className="px-4 py-2 text-sm text-blue-600">
                                              {payment.code || payment.id}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-slate-600">
                                              {payment.date}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-slate-900">
                                              {payment.staff || order.staff}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-slate-600">
                                              {payment.paymentMethod ===
                                                "transfer"
                                                ? "Chuyển khoản"
                                                : "Tiền mặt"}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                                                Đã thanh toán
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                              {payment.amount.toLocaleString(
                                                "vi-VN"
                                              )}
                                              đ
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-sm text-slate-500">
                                    Chưa có lịch sử thanh toán
                                  </div>
                                );
                              })()}
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
              Hiển thị {sortedOrders.length} phiếu nhập
            </p>
          </div>
        </div>
      </div>

      {/* Create Purchase Order Dialog */}
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
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingOrderId !== null
                ? "Chỉnh sửa phiếu nhập hàng"
                : "Thêm phiếu nhập hàng vào kho"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 px-1">
            {/* Thông tin phiếu nhập */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã phiếu nhập *</Label>
                <Input
                  value={formData.code}
                  disabled
                  className="bg-slate-100 border-slate-300 shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Nhà cung cấp *</Label>
                <Select
                  value={formData.supplier}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplier: value })
                  }
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
                <Label>Ngày nhập *</Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="bg-white border-slate-300 shadow-none pr-10 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nhân viên nhập *</Label>
                <Input
                  value={formData.staff}
                  disabled
                  className="bg-slate-100 border-slate-300 shadow-none"
                  placeholder="Nhân viên nhập"
                />
              </div>
            </div>

            {/* Danh sách hàng hóa */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-slate-700">Danh sách hàng hóa</h3>
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

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <colgroup>
                    <col style={{ width: "12%", minWidth: "120px" }} />
                    <col style={{ width: "22%", minWidth: "200px" }} />
                    <col style={{ width: "8%", minWidth: "70px" }} />
                    <col style={{ width: "10%", minWidth: "90px" }} />
                    <col style={{ width: "12%", minWidth: "120px" }} />
                    <col style={{ width: "13%", minWidth: "130px" }} />
                    <col style={{ width: "13%", minWidth: "130px" }} />
                    <col style={{ width: "10%", minWidth: "120px" }} />
                    <col style={{ width: "0%", minWidth: "50px" }} />
                  </colgroup>
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs text-slate-600">
                        Mã lô
                      </th>
                      <th className="px-2 py-2 text-left text-xs text-slate-600">
                        Hàng hóa
                      </th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600">
                        ĐVT
                      </th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600">
                        SL nhập
                      </th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600">
                        HSD
                      </th>
                      <th className="px-2 py-2 text-right text-xs text-slate-600">
                        Đơn giá
                      </th>
                      <th className="px-2 py-2 text-right text-xs text-slate-600">
                        Giảm giá
                      </th>
                      <th className="px-2 py-2 text-right text-xs text-slate-600">
                        Thành tiền
                      </th>
                      <th className="px-2 py-2 text-center text-xs text-slate-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {addedItems.length === 0 ? (
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
                      <>
                        {/* Added Items */}
                        {addedItems.map((item, idx) => {
                          const handleChangeItem = (
                            field: keyof PurchaseOrderItem,
                            value: any
                          ) => {
                            const updatedItems = [...addedItems];
                            const updatedItem = { ...updatedItems[idx] };

                            if (
                              field === "quantity" ||
                              field === "unitPrice" ||
                              field === "discount"
                            ) {
                              updatedItem[field] =
                                typeof value === "string"
                                  ? parseFloat(value) || 0
                                  : value;
                            } else {
                              (updatedItem as any)[field] = value;
                            }

                            // Recalculate total
                            const quantity = updatedItem.quantity;
                            const unitPrice = updatedItem.unitPrice;
                            const discount = updatedItem.discount;
                            updatedItem.total = quantity * unitPrice - discount;

                            updatedItems[idx] = updatedItem;
                            setAddedItems(updatedItems);
                          };

                          return (
                            <tr key={idx}>
                              <td className="px-2 py-2">
                                <Input
                                  value={item.batchCode}
                                  onChange={(e) =>
                                    handleChangeItem(
                                      "batchCode",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm h-8 w-full bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                />
                              </td>
                              <td
                                className="px-2 py-2 text-sm text-slate-900 truncate"
                                title={item.name}
                              >
                                {item.name}
                              </td>
                              <td className="px-2 py-2 text-sm text-slate-600 text-center">
                                {item.unit}
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  value={
                                    item.quantity === 0 ? "" : item.quantity
                                  }
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : parseFloat(e.target.value) || 0;
                                    handleChangeItem("quantity", value);
                                  }}
                                  onFocus={(e) => {
                                    if (parseFloat(e.target.value) === 0) {
                                      e.target.select();
                                    }
                                  }}
                                  className="text-sm h-8 text-center w-full bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  min="0"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="date"
                                  value={item.expiryDate || ""}
                                  onChange={(e) =>
                                    handleChangeItem(
                                      "expiryDate",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm h-8 w-full bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="text"
                                  value={
                                    item.unitPrice === 0
                                      ? ""
                                      : formatNumberWithCommas(item.unitPrice)
                                  }
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    // Allow empty input
                                    if (
                                      inputValue === "" ||
                                      inputValue.trim() === ""
                                    ) {
                                      handleChangeItem("unitPrice", 0);
                                      return;
                                    }
                                    const parsed =
                                      parseFormattedNumber(inputValue);
                                    handleChangeItem("unitPrice", parsed);
                                  }}
                                  className="text-sm h-8 text-right w-full bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 [appearance:textfield]"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="text"
                                  value={
                                    item.discount === 0
                                      ? ""
                                      : formatNumberWithCommas(item.discount)
                                  }
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    // Allow empty input
                                    if (
                                      inputValue === "" ||
                                      inputValue.trim() === ""
                                    ) {
                                      handleChangeItem("discount", 0);
                                      return;
                                    }
                                    const parsed =
                                      parseFormattedNumber(inputValue);
                                    handleChangeItem("discount", parsed);
                                  }}
                                  className="text-sm h-8 text-right w-full bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 [appearance:textfield]"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-2 py-2 text-sm text-slate-900 text-right">
                                {item.total.toLocaleString("vi-VN")}đ
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-3 flex justify-end gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Tổng số lượng:</span>
                  <span className="text-slate-900">
                    {totalQuantity} sản phẩm
                  </span>
                </div>
              </div>
            </div>

            {/* Số tiền phải trả NCC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tổng giá trị</Label>
                <Input
                  value={totalValue.toLocaleString("vi-VN") + "đ"}
                  disabled
                  className="bg-slate-100 border-slate-300 shadow-none text-right font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label>Số tiền trả cho NCC *</Label>
                <Input
                  type="text"
                  value={
                    parseFloat(formData.paidAmount || "0") === 0
                      ? ""
                      : formatNumberWithCommas(formData.paidAmount || "0")
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow empty input
                    if (inputValue === "" || inputValue.trim() === "") {
                      setFormData({
                        ...formData,
                        paidAmount: "0",
                      });
                      return;
                    }
                    const parsed = parseFormattedNumber(inputValue);
                    const maxValue = totalValue;
                    const finalValue = parsed > maxValue ? maxValue : parsed;
                    setFormData({
                      ...formData,
                      paidAmount: finalValue.toString(),
                    });
                  }}
                  placeholder="0"
                  className="text-right bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 [appearance:textfield]"
                />
                <p className="text-xs text-slate-500">
                  Tối đa: {totalValue.toLocaleString("vi-VN")}đ
                  {parseFloat(formData.paidAmount || "0") < totalValue && (
                    <span className="text-orange-600 ml-2">
                      (Còn nợ:{" "}
                      {(
                        totalValue - parseFloat(formData.paidAmount || "0")
                      ).toLocaleString("vi-VN")}
                      đ)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="space-y-4">
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
            </div>

            {/* Ghi chú */}
            <div className="space-y-2 py-1">
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Nhập ghi chú về phiếu nhập..."
                className="min-h-[80px] bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
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
                disabled={addedItems.length === 0}
                onClick={() => {
                  // Lưu nháp
                  if (addedItems.length === 0) {
                    toast.error("Vui lòng thêm ít nhất một hàng hóa");
                    return;
                  }

                  const paidAmount = parseFloat(formData.paidAmount || "0");
                  const debtAmount = totalValue - paidAmount;

                  const draftDate = formData.date || formatDateTime(new Date());

                  if (editingOrderId !== null) {
                    // Update existing draft order
                    setPurchaseOrders((prev) =>
                      prev.map((order) =>
                        order.id === editingOrderId
                          ? {
                            ...order,
                            code: formData.code,
                            date: draftDate,
                            supplier: formData.supplier,
                            supplierId: formData.supplier,
                            items: addedItems.length,
                            totalAmount: totalValue,
                            paidAmount: paidAmount,
                            debtAmount: debtAmount,
                            staff: formData.staff,
                            note: formData.note,
                            details: {
                              items: addedItems,
                            },
                          }
                          : order
                      )
                    );
                    toast.success("Đã cập nhật phiếu nhập hàng");
                  } else {
                    // Create new draft order
                    const draftOrder: PurchaseOrder = {
                      id: Date.now(),
                      code: formData.code,
                      date: draftDate,
                      supplier: formData.supplier,
                      supplierId: formData.supplier,
                      items: addedItems.length,
                      totalAmount: totalValue,
                      paidAmount: paidAmount,
                      debtAmount: debtAmount,
                      status: "draft",
                      staff: formData.staff,
                      note: formData.note,
                      details: {
                        items: addedItems,
                      },
                      paymentHistory: [],
                    };

                    setPurchaseOrders([draftOrder, ...purchaseOrders]);

                    if (debtAmount > 0 && formData.supplier) {
                      toast.success(
                        `Đã lưu nháp. Công nợ NCC: ${debtAmount.toLocaleString(
                          "vi-VN"
                        )}đ`
                      );
                    } else {
                      toast.success("Đã lưu nháp phiếu nhập hàng");
                    }
                  }

                  handleCreateOrder();
                }}
              >
                Lưu nháp
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={addedItems.length === 0}
                onClick={() => {
                  // Validate payment method if transfer
                  if (
                    formData.paymentMethod === "transfer" &&
                    (!formData.bankAccount || !formData.bankId)
                  ) {
                    toast.error("Vui lòng chọn ngân hàng và nhập số tài khoản");
                    return;
                  }

                  // Hoàn thành
                  const paidAmount = parseFloat(formData.paidAmount || "0");
                  const debtAmount = totalValue - paidAmount;

                  // 1. Cập nhật số lượng hàng hóa trong inventory
                  updateInventoryItems(addedItems);

                  // 2. Thêm vào sổ quỹ nếu có số tiền phải trả
                  let paymentHistoryEntry: any = null;
                  if (paidAmount > 0) {
                    // Tạo phiếu chi "Chi tiền trả NCC"
                    const orderDate =
                      formData.date || formatDateTime(new Date());
                    const cashflowCode = `PCPN${formData.code.replace(
                      "PN",
                      ""
                    )}`;
                    const cashflowEntry = {
                      id: `CF-${Date.now()}`,
                      code: cashflowCode,
                      date: orderDate,
                      type: "expense",
                      category: "pay-supplier", // Chi tiền NCC
                      amount: paidAmount,
                      paymentMethod: formData.paymentMethod,
                      description: `Chi tiền trả NCC - Phiếu nhập ${formData.code}`,
                      staff: formData.staff,
                      supplier: formData.supplier,
                      bankAccount:
                        formData.paymentMethod === "transfer"
                          ? formData.bankAccount
                          : undefined,
                      bankName:
                        formData.paymentMethod === "transfer"
                          ? formData.bankName
                          : undefined,
                      status: "completed",
                    };

                    // Lưu vào localStorage để Finance có thể đọc
                    saveCashflowEntry(cashflowEntry);

                    // Create payment history entry
                    paymentHistoryEntry = {
                      id: cashflowCode,
                      date: orderDate,
                      amount: paidAmount,
                      note: `Thanh toán ${formData.paymentMethod === "cash"
                        ? "tiền mặt"
                        : "chuyển khoản"
                        }`,
                    };

                    toast.success(
                      `Đã hoàn thành phiếu nhập và thêm phiếu chi ${paidAmount.toLocaleString(
                        "vi-VN"
                      )}đ vào sổ quỹ`
                    );
                  }

                  if (debtAmount > 0 && formData.supplier) {
                    // Cập nhật công nợ NCC
                    toast.success(
                      `Công nợ NCC: ${debtAmount.toLocaleString("vi-VN")}đ`
                    );
                  }

                  // 3. Tạo hoặc cập nhật phiếu nhập
                  const orderDate = formData.date || formatDateTime(new Date());

                  if (editingOrderId !== null) {
                    // Update existing draft order to completed
                    setPurchaseOrders((prev) =>
                      prev.map((order) =>
                        order.id === editingOrderId
                          ? {
                            ...order,
                            code: formData.code,
                            date: orderDate,
                            supplier: formData.supplier,
                            supplierId: formData.supplier,
                            items: addedItems.length,
                            totalAmount: totalValue,
                            paidAmount: paidAmount,
                            debtAmount: debtAmount,
                            status: "completed",
                            staff: formData.staff,
                            note: formData.note,
                            details: {
                              items: addedItems,
                            },
                            paymentHistory: paymentHistoryEntry
                              ? [paymentHistoryEntry]
                              : [],
                          }
                          : order
                      )
                    );
                    toast.success("Đã hoàn thành phiếu nhập hàng");
                  } else {
                    // Create new completed order
                    const newOrder: PurchaseOrder = {
                      id: Date.now(),
                      code: formData.code,
                      date: orderDate,
                      supplier: formData.supplier,
                      supplierId: formData.supplier,
                      items: addedItems.length,
                      totalAmount: totalValue,
                      paidAmount: paidAmount,
                      debtAmount: debtAmount,
                      status: "completed",
                      staff: formData.staff,
                      note: formData.note,
                      details: {
                        items: addedItems,
                      },
                      paymentHistory: paymentHistoryEntry
                        ? [paymentHistoryEntry]
                        : [],
                    };

                    setPurchaseOrders([newOrder, ...purchaseOrders]);
                    toast.success("Đã hoàn thành phiếu nhập hàng");
                  }

                  handleCreateOrder();
                }}
              >
                Hoàn thành
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Excel Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Import phiếu nhập từ Excel</DialogTitle>
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

      {/* Add Item Dialog - Similar to StockCheck modal */}
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
              Thêm hàng hóa vào phiếu nhập
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
            {/* Search Bar with Add New Item Button */}
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
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  toast.info("Chức năng thêm mới mặt hàng đang phát triển");
                }}
              >
                <Plus className="w-4 h-4" />
                Thêm mới mặt hàng
              </Button>
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

            {/* Products Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="w-12 px-4 py-3 text-left text-xs font-medium text-slate-900 border-r border-white">
                        <Checkbox
                          checked={allAvailableItemsSelected}
                          onCheckedChange={(checked) =>
                            handleSelectAllAvailableItems(checked === true)
                          }
                        />
                      </th>
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
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-900 whitespace-nowrap">
                        Tồn kho
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAvailableItems.length > 0 ? (
                      filteredAvailableItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 border-r border-slate-100">
                            <Checkbox
                              checked={selectedItemIds.includes(item.id)}
                              onCheckedChange={() =>
                                toggleItemSelection(item.id)
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap border-r border-slate-100">
                            {item.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap border-r border-slate-100">
                            {item.name}
                          </td>
                          <td
                            className="px-4 py-3 text-sm text-blue-600 cursor-pointer hover:text-blue-700 hover:underline whitespace-nowrap border-r border-slate-100"
                            onClick={() =>
                              handleSelectCategoryItems(item.category)
                            }
                          >
                            {categories.find((c) => c.id === item.category)
                              ?.name ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-center whitespace-nowrap border-r border-slate-100">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right whitespace-nowrap">
                            {item.currentStock.toLocaleString()}
                          </td>
                        </tr>
                      ))
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
              <span className="font-semibold">{selectedItemIds.length}</span>{" "}
              hàng hóa
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => {
                  setShowAddItemDialog(false);
                  setSelectedItemIds([]);
                  setItemSearchQuery("");
                  setSelectedCategoryFilter("all");
                }}
              >
                Hủy
              </Button>
              <Button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddSelectedItems}
                disabled={selectedItemIds.length === 0}
              >
                Thêm vào phiếu nhập
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExportExcelDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={filteredOrders}
        columns={[
          { header: 'Mã phiếu', accessor: (row) => row.code },
          { header: 'Ngày giờ', accessor: (row) => row.date },
          { header: 'Nhà cung cấp', accessor: (row) => row.supplier },
          { header: 'Số mặt hàng', accessor: (row) => row.items },
          { header: 'Tổng giá trị', accessor: (row) => row.totalAmount },
          { header: 'Đã trả', accessor: (row) => row.paidAmount },
          { header: 'Còn nợ', accessor: (row) => row.debtAmount },
          { header: 'Nhân viên', accessor: (row) => row.staff },
          {
            header: 'Trạng thái', accessor: (row) => {
              switch (row.status) {
                case 'completed': return 'Đã nhập hàng';
                case 'draft': return 'Phiếu tạm';
                case 'cancelled': return 'Đã hủy';
                default: return row.status;
              }
            }
          },
          { header: 'Ghi chú', accessor: (row) => row.note || '' },
        ]}
        fileName="danh-sach-phieu-nhap"
        title="Xuất danh sách phiếu nhập hàng"
      />
    </div>
  );
}
