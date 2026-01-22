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
  DollarSign,
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
import { ExportExcelDialog } from "../ExportExcelDialog";
import { useAuth } from "../../contexts/AuthContext";
import { categories } from "../../data/categories";
import { Card, CardContent } from "../ui/card";
import { CustomerTimeFilter } from "../reports/CustomerTimeFilter";
import { inventoryService } from "../../services/inventoryService";
import { cn } from "../ui/utils";

interface PurchaseOrderItem {
  itemId?: number;
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
    paymentMethod?: string;
    staff?: string;
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
  const [timePreset, setTimePreset] = useState("this-month");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfMonth(new Date()));

  const handleTimePresetChange = (value: string) => {
    setTimePreset(value);
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


  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "completed",
    "draft",
    "cancelled",
  ]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>(['paid', 'partial', 'unpaid']);

  const togglePaymentStatus = (status: string) => {
    setSelectedPaymentStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };
  const [editingDates, setEditingDates] = useState<Record<number, string>>({});
  const [sortColumn, setSortColumn] = useState<keyof PurchaseOrder | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | "none">("none");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrderToPay, setSelectedOrderToPay] = useState<PurchaseOrder | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [selectedPaymentBankId, setSelectedPaymentBankId] = useState("");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [addedItems, setAddedItems] = useState<PurchaseOrderItem[]>([]);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bankSearchOpen, setBankSearchOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

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

  // Tài khoản ngân hàng của quán (bank_accounts trong database)
  const [allBankAccounts, setAllBankAccounts] = useState<any[]>([]);

  // Add bank account dialog states
  const [addBankAccountDialogOpen, setAddBankAccountDialogOpen] = useState(false);
  const [newBankAccountName, setNewBankAccountName] = useState("");
  const [newBankAccountNumber, setNewBankAccountNumber] = useState("");
  const [newBankAccountBank, setNewBankAccountBank] = useState("");
  const [newBankAccountOwner, setNewBankAccountOwner] = useState("");
  const [bankAccountSearchOpen, setBankAccountSearchOpen] = useState(false);

  const handleOpenAddBankAccount = () => {
    setNewBankAccountName("");
    setNewBankAccountNumber("");
    setNewBankAccountBank("");
    setNewBankAccountOwner("");
    setAddBankAccountDialogOpen(true);
  };

  const handleSaveBankAccount = async () => {
    if (!newBankAccountName || !newBankAccountNumber || !newBankAccountBank) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const payload = {
        accountName: newBankAccountName,
        accountNumber: newBankAccountNumber,
        bankName: newBankAccountBank,
        ownerName: newBankAccountOwner || "",
        notes: ""
      };

      const result = await inventoryService.createBankAccount(payload);
      const newAccountId = result.metaData?.id || result.id;

      // Refresh bank accounts list
      const bankAccountsRes = await inventoryService.getBankAccounts();
      const bankAccountsList = bankAccountsRes.metaData || [];
      const formattedBankAccounts = bankAccountsList
        .filter((acc: any) => acc.isActive)
        .map((acc: any) => ({
          id: acc.id?.toString() || '',
          name: acc.accountName || '',
          accountNumber: acc.accountNumber || '',
          bank: acc.bankName || '',
          owner: acc.ownerName || ''
        }));

      setAllBankAccounts(formattedBankAccounts);

      // Auto-select the newly created account
      if (newAccountId) {
        setFormData({
          ...formData,
          bankId: newAccountId.toString(),
          bankName: newBankAccountBank,
          bankAccount: newBankAccountNumber,
        });
      }

      setAddBankAccountDialogOpen(false);
      toast.success("Đã thêm tài khoản ngân hàng mới");
    } catch (error) {
      console.error("Error creating bank account:", error);
      toast.error("Không thể thêm tài khoản ngân hàng");
    }
  };

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

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const orderFilters = {
        dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
        dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
      };
      const response = await inventoryService.getPurchaseOrders(1, 100, orderFilters);
      const ordersData = response.metaData?.orders || [];

      const formattedOrders: PurchaseOrder[] = ordersData.map((order: any) => ({
        id: order.id,
        code: order.code,
        date: format(new Date(order.orderDate || order.createdAt), "yyyy-MM-dd HH:mm"),
        supplier: order.supplier?.name || "N/A",
        supplierId: order.supplier?.id?.toString(),
        items: order.itemCount || order.items?.length || 0,
        totalAmount: order.totalAmount || 0,
        paidAmount: order.paidAmount || 0,
        debtAmount: order.debtAmount || 0,
        status: order.status === "in_progress" ? "draft" : (order.status || "draft"),
        staff: order.staff?.fullName || "N/A",
        note: order.notes || "",
        details: {
          items: (order.items || []).map((it: any) => ({
            name: it.itemName || "N/A",
            batchCode: it.batchCode || "",
            quantity: it.quantity || 0,
            unit: it.unit || "",
            unitPrice: it.unitPrice || 0,
            discount: 0,
            total: it.totalPrice || 0,
            expiryDate: it.expiryDate || undefined
          }))
        },
        paymentHistory: (order.paymentHistory || []).map((ph: any) => ({
          id: ph.id, // Code
          date: ph.date ? format(new Date(ph.date), "yyyy-MM-dd HH:mm") : "",
          amount: ph.amount || 0,
          note: ph.note || "",
          paymentMethod: ph.paymentMethod,
          staff: ph.staff
        }))
      }));

      setPurchaseOrders(formattedOrders);

      // Fetch suppliers
      const suppliersRes = await inventoryService.getSuppliers();
      const suppliersData = suppliersRes.metaData?.suppliers || suppliersRes.metaData || [];
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);

      // Fetch items for selection
      const itemsRes = await inventoryService.getItems(1, 1000);
      const itemsList = itemsRes.metaData?.items || itemsRes.items || itemsRes || [];

      // Format items to match expected structure
      const formattedItems = itemsList.map((item: any) => {
        let derivedType = item.type || '';
        if (!derivedType && item.itemTypeId) {
          const tid = String(item.itemTypeId).toUpperCase();
          if (tid === '1' || tid === 'PRODUCT' || tid === 'READY_MADE') derivedType = 'ready-made';
          else if (tid === '3' || tid === 'INGREDIENT') derivedType = 'ingredient';
          else if (tid === '2' || tid === 'COMPOSITE') derivedType = 'composite';
        }

        return {
          id: (item.id || item._id)?.toString() || '',
          code: item.code || item.id?.toString() || '',
          name: item.name || '',
          category: item.category?.id?.toString() || item.categoryId?.toString() || '',
          unit: item.unit?.name || item.unit || '',
          type: derivedType,
          currentStock: item.currentStock || item.stock || 0
        };
      });

      setAvailableItems(formattedItems);

      // Fetch categories
      const categoriesRes = await inventoryService.getCategories();
      const categoriesList = categoriesRes.metaData?.categories || categoriesRes.metaData || [];

      // Format categories with 'all' option
      const formattedCategories = [
        { id: "all", name: "Tất cả" },
        ...categoriesList.map((cat: any) => ({
          id: cat.id?.toString() || '',
          name: cat.name || ''
        }))
      ];

      setCategoriesList(formattedCategories);

      // Fetch bank accounts
      const bankAccountsRes = await inventoryService.getBankAccounts();
      const bankAccountsList = bankAccountsRes.metaData || [];

      // Format bank accounts
      const formattedBankAccounts = bankAccountsList
        .filter((acc: any) => acc.isActive) // Only show active accounts
        .map((acc: any) => ({
          id: acc.id?.toString() || '',
          name: acc.accountName || '',
          accountNumber: acc.accountNumber || '',
          bank: acc.bankName || '',
          owner: acc.ownerName || ''
        }));

      setAllBankAccounts(formattedBankAccounts);

    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      return getDateRangeFromPreset(timePreset);
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
      itemId: parseInt(newItem.productId),
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

      paidAmount: "0",
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
      bankId: "",
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



  const handleOpenPaymentDialog = (order: PurchaseOrder) => {
    setSelectedOrderToPay(order);
    const remaining = order.totalAmount - order.paidAmount;
    setPaymentAmount(formatNumberWithCommas(remaining));
    setPaymentNote(`Thanh toán nợ - Phiếu nhập ${order.code}`);
    setPaymentMethod("cash");
    setSelectedPaymentBankId("");
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedOrderToPay) return;

    const amount = parseFormattedNumber(paymentAmount);
    if (amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!selectedOrderToPay) return;
    try {
      await inventoryService.addPurchaseOrderPayment(selectedOrderToPay.id, {
        amount,
        paymentMethod: paymentMethod === "transfer" ? "bank" : "cash",
        bankAccountId: paymentMethod === 'transfer' ? parseInt(selectedPaymentBankId) : undefined
      });
      toast.success("Đã lưu thông tin thanh toán");
      setPaymentDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Không thể lưu thông tin thanh toán");
    }
  };




  // Filter items for add item dialog (only allow ready-made and ingredients)
  const availableItemsForPurchase = availableItems.filter(
    (item) => item.type === "ready-made" || item.type === "ingredient"
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
    // 1. Remove items that were unchecked
    // Convert all to string for comparison to match selectedItemIds
    const currentAddedIds = addedItems.map(item => String(item.itemId));

    // Items to keep: existed in addedItems AND still currently selected
    const keptItems = addedItems.filter(item =>
      selectedItemIds.includes(String(item.itemId))
    );

    // 2. Find new items to add
    // Items selected but not present in the current added list
    const newItemIds = selectedItemIds.filter(id =>
      !currentAddedIds.includes(id)
    );

    const itemsToAdd = availableItemsForPurchase.filter((item) =>
      newItemIds.includes(item.id)
    );

    // Generate batch code for each item (each item gets its own batch)
    const newItems: PurchaseOrderItem[] = itemsToAdd.map((item, index) => {
      // Calculate batch logic based on existing count
      const batchNumber = String(keptItems.length + index + 1).padStart(
        3,
        "0"
      );
      const batchCode = `LO-${new Date().getFullYear()}-${batchNumber}`;

      return {
        // Use the ID as is from the item (string or number), do not force parseInt causing NaN
        itemId: item.id as any,
        name: item.name,
        batchCode: batchCode,
        quantity: 1, // Default to 1
        unit: item.unit,
        unitPrice: 0,
        discount: 0,
        total: 0,
      };
    });

    setAddedItems((prev) => [...keptItems, ...newItems]);
    setShowAddItemDialog(false);
    setSelectedItemIds([]);
    setItemSearchQuery("");
    setSelectedCategoryFilter("all");
  };

  const [showFilters, setShowFilters] = useState(false);
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">Nhập hàng</h1>
          <p className="text-slate-600 text-sm">
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
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleOpenCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo phiếu nhập
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
                  placeholder="Tìm theo mã phiếu, nhà cung cấp..."
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
                      timePreset={timePreset}
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
                          Phiếu tạm
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
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-cancelled"
                          checked={selectedStatuses.includes('cancelled')}
                          onCheckedChange={() => toggleStatus('cancelled')}
                          className="border-slate-300"
                        />
                        <Label htmlFor="status-cancelled" className="text-sm text-slate-700 cursor-pointer font-normal">
                          Đã hủy
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Thanh toán</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="payment-paid"
                          checked={selectedPaymentStatuses.includes('paid')}
                          onCheckedChange={() => togglePaymentStatus('paid')}
                          className="border-slate-300"
                        />
                        <Label htmlFor="payment-paid" className="text-sm text-slate-700 cursor-pointer font-normal">
                          Đã thanh toán
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="payment-partial"
                          checked={selectedPaymentStatuses.includes('partial')}
                          onCheckedChange={() => togglePaymentStatus('partial')}
                          className="border-slate-300"
                        />
                        <Label htmlFor="payment-partial" className="text-sm text-slate-700 cursor-pointer font-normal">
                          Thanh toán một phần
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="payment-unpaid"
                          checked={selectedPaymentStatuses.includes('unpaid')}
                          onCheckedChange={() => togglePaymentStatus('unpaid')}
                          className="border-slate-300"
                        />
                        <Label htmlFor="payment-unpaid" className="text-sm text-slate-700 cursor-pointer font-normal">
                          Chưa thanh toán
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
                      <TableCell colSpan={10} className="bg-slate-50 px-4 py-4">
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
                                  <span className="font-medium text-slate-600">
                                    Thời gian:
                                  </span>{" "}
                                  <span className="text-slate-900">
                                    {order.date}
                                  </span>
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
                                      Hạn sử dụng
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
                                        {item.expiryDate ? item.expiryDate : "-"}
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
                              {order.totalAmount > order.paidAmount && (
                                <Button
                                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleOpenPaymentDialog(order);
                                  }}
                                >
                                  <DollarSign className="w-4 h-4" />
                                  Thanh toán
                                </Button>
                              )}

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
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (
                                        !order.details?.items ||
                                        order.details.items.length === 0
                                      ) {
                                        toast.error(
                                          "Phiếu nhập không có hàng hóa"
                                        );
                                        return;
                                      }

                                      try {
                                        await inventoryService.completePurchaseOrder(order.id);
                                        toast.success("Đã hoàn thành phiếu nhập hàng");
                                        fetchData();
                                      } catch (error) {
                                        console.error("Error completing order:", error);
                                        toast.error("Không thể hoàn thành phiếu nhập hàng");
                                      }
                                    }}
                                  >
                                    <Check className="w-4 h-4" />
                                    Hoàn thành
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 gap-2"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (
                                        confirm(
                                          "Bạn có chắc chắn muốn huỷ phiếu nhập này?"
                                        )
                                      ) {
                                        try {
                                          await inventoryService.cancelPurchaseOrder(order.id);
                                          toast.success("Đã huỷ phiếu nhập");
                                          fetchData();
                                        } catch (error) {
                                          console.error("Error cancelling order:", error);
                                          toast.error("Không thể huỷ phiếu nhập");
                                        }
                                      }
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                    Huỷ bỏ
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.print();
                                    }}
                                  >
                                    <Printer className="w-4 h-4" />
                                    In
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

                              // Only look for external payment history if the order has been paid partially or fully
                              if (order.paidAmount > 0) {
                                try {
                                  const stored =
                                    localStorage.getItem("cashflowEntries");
                                  if (stored) {
                                    const cashflowEntries = JSON.parse(stored);
                                    // Filter entries related to this purchase order
                                    paymentHistory = cashflowEntries.filter(
                                      (entry: any) =>
                                        entry.category === "pay-supplier" &&
                                        (
                                          // Match by specific description pattern
                                          entry.description?.includes(`Phiếu nhập ${order.code}`) ||
                                          // Or match by direct payment history ID if present
                                          (order.paymentHistory?.some(ph => ph.id === entry.code))
                                        )
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error loading payment history:",
                                    error
                                  );
                                }
                              }

                              // Also include paymentHistory from order if exists
                              if (order.paymentHistory) {
                                const orderHistory = order.paymentHistory.map((ph) => ({
                                  id: ph.id, // Usually matches code
                                  code: ph.id,
                                  date: ph.date,
                                  amount: ph.amount,
                                  note: ph.note,
                                  paymentMethod: "cash",
                                  type: "order-history"
                                }));

                                // Merge and deduplicate
                                // Priority: Cashflow entries (more detailed) > Order history
                                const combined = [...paymentHistory, ...orderHistory];
                                const uniqueMap = new Map();

                                combined.forEach(item => {
                                  // If we haven't seen this code yet, add it.
                                  // If we HAVE seen it, we generally prefer the one from cashflow (already in paymentHistory array) 
                                  // unless the new one provides something missing? 
                                  // Actually, since we put paymentHistory (cashflow) FIRST in the spread above? No, we put `...paymentHistory` first.
                                  // Wait: The code snippet I'm replacing ends with `...paymentHistory` being appended to `order.paymentHistory`.
                                  // In my replacement: `[...paymentHistory, ...orderHistory]`.
                                  // Iterating: 
                                  // 1. cashflow item (Code A) -> added directly.
                                  // 2. order item (Code A) -> ignored (duplicate).
                                  if (!uniqueMap.has(item.code)) {
                                    uniqueMap.set(item.code, item);
                                  }
                                });

                                paymentHistory = Array.from(uniqueMap.values());
                              }

                              // Sort by date descending
                              paymentHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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


      {/* Create Purchase Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent
          className="min-w-[1100px] max-w-[1400px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
          aria-describedby={undefined}
          onInteractOutside={(e: any) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e: any) => {
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
                    {Array.isArray(suppliers) && suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label>Ngày nhập *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white border border-slate-300 shadow-none focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(new Date(formData.date), "dd/MM/yyyy")
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setFormData({
                            ...formData,
                            date: format(date, "yyyy-MM-dd"),
                          });
                        }
                      }}
                      initialFocus
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
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
                  onClick={() => {
                    // Pre-select items that are already added
                    const currentIds = addedItems.map(item => String(item.itemId));
                    setSelectedItemIds(currentIds);
                    setShowAddItemDialog(true);
                  }}
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
                    <col style={{ width: '12%', minWidth: '110px' }} />
                    <col style={{ width: '18%', minWidth: '150px' }} />
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
                              <td
                                className="px-2 py-2 text-sm text-slate-900 truncate"
                                title={item.batchCode}
                              >
                                {item.batchCode}
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
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal bg-white border border-slate-300 shadow-none h-8 px-2 text-xs",
                                        !item.expiryDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-3 w-3" />
                                      {item.expiryDate ? (
                                        format(new Date(item.expiryDate), "dd/MM/yyyy")
                                      ) : (
                                        <span>HSD</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={item.expiryDate ? new Date(item.expiryDate) : undefined}
                                      onSelect={(date: Date | undefined) => {
                                        if (date) {
                                          handleChangeItem("expiryDate", format(date, "yyyy-MM-dd"));
                                        }
                                      }}
                                      initialFocus
                                      locale={vi}
                                    />
                                  </PopoverContent>
                                </Popover>
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
                <div className="space-y-2">
                  <Label>Tài khoản ngân hàng *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.bankId}
                      onValueChange={(value) => {
                        const account = allBankAccounts.find((acc) => acc.id === value);
                        if (account) {
                          setFormData({
                            ...formData,
                            bankId: account.id,
                            bankName: account.bank,
                            bankAccount: account.accountNumber,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1 bg-white border-slate-300">
                        <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {allBankAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name} - {acc.bank} - {acc.accountNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenAddBankAccount}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm TK
                    </Button>
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
                disabled={addedItems.length === 0 || isSaving}
                onClick={async () => {
                  if (addedItems.length === 0) {
                    toast.error("Vui lòng thêm ít nhất một hàng hóa");
                    return;
                  }

                  const paidAmount = parseFloat(formData.paidAmount || "0");
                  if (paidAmount > 0 && formData.paymentMethod === "transfer" && !formData.bankId) {
                    toast.error("Vui lòng chọn tài khoản ngân hàng");
                    return;
                  }

                  setIsSaving(true);
                  try {
                    // Build payload according to API spec
                    const payload: any = {
                      supplierId: parseInt(formData.supplier),
                      status: "draft",
                      items: addedItems.map(item => {
                        const itemPayload: any = {
                          itemId: typeof item.itemId === 'string' ? parseInt(item.itemId) : item.itemId,
                          quantity: item.quantity,
                          unitPrice: item.unitPrice,
                          unit: item.unit,
                        };
                        // Only add batchCode if it exists
                        if (item.batchCode) {
                          itemPayload.batchCode = item.batchCode;
                        }
                        // Only add expiryDate if it exists
                        if (item.expiryDate) {
                          itemPayload.expiryDate = item.expiryDate;
                        }
                        return itemPayload;
                      })
                    };

                    // Only add payment fields if there's a payment
                    if (paidAmount > 0) {
                      payload.paidAmount = paidAmount;
                      payload.paymentMethod = formData.paymentMethod === "transfer" ? "bank" : "cash";
                      if (formData.paymentMethod === "transfer") {
                        payload.bankAccountId = parseInt(formData.bankId);
                      }
                    }

                    // Only add notes if exists
                    if (formData.note) {
                      payload.notes = formData.note;
                    }

                    console.log("Saving draft with payload:", payload);

                    if (editingOrderId) {
                      await inventoryService.updatePurchaseOrder(editingOrderId, payload);
                      toast.success("Đã cập nhật phiếu tạm");
                    } else {
                      await inventoryService.createPurchaseOrder(payload);
                      toast.success("Đã lưu nháp phiếu nhập hàng");
                    }
                    setShowCreateDialog(false);
                    fetchData();
                  } catch (error) {
                    console.error("Error saving draft:", error);
                    toast.error("Không thể lưu phiếu tạm");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                Lưu nháp
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={addedItems.length === 0 || isSaving}
                onClick={async () => {
                  if (addedItems.length === 0) {
                    toast.error("Vui lòng thêm ít nhất một hàng hóa");
                    return;
                  }

                  const paidAmount = parseFloat(formData.paidAmount || "0");
                  if (paidAmount > 0 && formData.paymentMethod === "transfer" && !formData.bankId) {
                    toast.error("Vui lòng chọn tài khoản ngân hàng");
                    return;
                  }

                  setIsSaving(true);
                  try {
                    // Build payload according to API spec
                    const payload: any = {
                      supplierId: parseInt(formData.supplier),
                      status: "completed",
                      items: addedItems.map(item => {
                        const itemPayload: any = {
                          itemId: typeof item.itemId === 'string' ? parseInt(item.itemId) : item.itemId,
                          quantity: item.quantity,
                          unitPrice: item.unitPrice,
                          unit: item.unit,
                        };
                        // Only add batchCode if it exists
                        if (item.batchCode) {
                          itemPayload.batchCode = item.batchCode;
                        }
                        // Only add expiryDate if it exists
                        if (item.expiryDate) {
                          itemPayload.expiryDate = item.expiryDate;
                        }
                        return itemPayload;
                      })
                    };

                    // Only add payment fields if there's a payment
                    if (paidAmount > 0) {
                      payload.paidAmount = paidAmount;
                      payload.paymentMethod = formData.paymentMethod === "transfer" ? "bank" : "cash";
                      if (formData.paymentMethod === "transfer") {
                        payload.bankAccountId = parseInt(formData.bankId);
                      }
                    }

                    // Only add notes if exists
                    if (formData.note) {
                      payload.notes = formData.note;
                    }

                    if (editingOrderId) {
                      await inventoryService.updatePurchaseOrder(editingOrderId, payload);
                    } else {
                      await inventoryService.createPurchaseOrder(payload);
                    }
                    toast.success("Đã hoàn thành phiếu nhập hàng");
                    setShowCreateDialog(false);
                    fetchData();
                  } catch (error) {
                    console.error("Error completing order:", error);
                    toast.error("Không thể hoàn thành phiếu nhập hàng");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                Hoàn thành
              </Button>
            </div>


          </DialogFooter>
        </DialogContent>
      </Dialog >

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
      </Dialog >

      {/* Add Item Dialog - Similar to StockCheck modal */}
      < Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog} >
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
              {categoriesList.map((cat) => {
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
                            {categoriesList.find((c) => c.id === item.category)
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
      </Dialog >

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
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Lập phiếu chi - Thanh toán nhà cung cấp</DialogTitle>
          </DialogHeader>
          {selectedOrderToPay && (
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Left Column - Purchase Order Info */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3">Thông tin phiếu nhập</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mã phiếu:</span>
                      <span className="font-medium text-blue-700">{selectedOrderToPay.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ngày nhập:</span>
                      <span className="font-medium">{selectedOrderToPay.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nhà cung cấp:</span>
                      <span className="font-medium text-blue-600">{selectedOrderToPay.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tổng giá trị:</span>
                      <span className="font-medium">{formatNumberWithCommas(selectedOrderToPay.totalAmount)}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Đã thanh toán:</span>
                      <span className="font-medium text-green-600">{formatNumberWithCommas(selectedOrderToPay.paidAmount)}đ</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200 mt-2">
                      <span className="text-slate-600 font-medium">Còn nợ:</span>
                      <span className="font-bold text-red-600 text-lg">
                        {formatNumberWithCommas(selectedOrderToPay.totalAmount - selectedOrderToPay.paidAmount)}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                {selectedOrderToPay.paymentHistory && selectedOrderToPay.paymentHistory.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-medium text-slate-700 mb-3">Lịch sử thanh toán</h4>
                    <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                      {selectedOrderToPay.paymentHistory.map((payment, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                          <div>
                            <span className="text-slate-600">{payment.date}</span>
                            {payment.note && <span className="text-slate-400 text-xs ml-2">({payment.note})</span>}
                          </div>
                          <span className="font-medium text-green-600">+{formatNumberWithCommas(payment.amount)}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Payment Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Phương thức thanh toán</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: string) => setPaymentMethod(value as "cash" | "transfer")}
                  >
                    <SelectTrigger className="bg-white border-slate-300">
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Tiền mặt</SelectItem>
                      <SelectItem value="transfer">🏦 Chuyển khoản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "transfer" && (
                  <div className="space-y-2">
                    <Label>Tài khoản ngân hàng</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedPaymentBankId}
                        onValueChange={setSelectedPaymentBankId}
                      >
                        <SelectTrigger className="flex-1 bg-white border-slate-300">
                          <SelectValue placeholder="Chọn tài khoản" />
                        </SelectTrigger>
                        <SelectContent>
                          {allBankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex w-full flex-col items-start text-left">
                                <span>{account.name}</span>
                                <span className="text-xs text-slate-500">{account.accountNumber} - {account.bankFull}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleOpenAddBankAccount}
                        title="Thêm tài khoản mới"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Số tiền thanh toán</Label>
                  <div className="relative">
                    <Input
                      id="payment-amount"
                      value={paymentAmount}
                      onChange={(e) => {
                        const rawVal = e.target.value.replace(/,/g, "");
                        if (!isNaN(Number(rawVal)) || rawVal === "") {
                          setPaymentAmount(formatNumberWithCommas(rawVal));
                        }
                      }}
                      placeholder="Nhập số tiền..."
                      className="pr-10 font-medium text-lg bg-white border-slate-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">đ</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Số nợ còn lại: <span className="font-medium text-red-600">{formatNumberWithCommas(selectedOrderToPay.totalAmount - selectedOrderToPay.paidAmount)}đ</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-note">Ghi chú</Label>
                  <Textarea
                    id="payment-note"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Ghi chú cho phiếu chi..."
                    className="bg-white border-slate-300 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handlePaymentSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Check className="w-4 h-4 mr-2" />
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog open={addBankAccountDialogOpen} onOpenChange={setAddBankAccountDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Thêm tài khoản ngân hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Tên tài khoản <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newBankAccountName}
                onChange={(e) => setNewBankAccountName(e.target.value)}
                placeholder="VD: TK Vietcombank công ty"
                className="bg-white border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Số tài khoản <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newBankAccountNumber}
                onChange={(e) => setNewBankAccountNumber(e.target.value)}
                placeholder="VD: 1234567890"
                className="bg-white border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Ngân hàng <span className="text-red-500">*</span>
              </Label>
              <Select value={newBankAccountBank} onValueChange={setNewBankAccountBank}>
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue placeholder="Chọn ngân hàng" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {vietnameseBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chủ tài khoản</Label>
              <Input
                value={newBankAccountOwner}
                onChange={(e) => setNewBankAccountOwner(e.target.value)}
                placeholder="VD: Công ty ABC"
                className="bg-white border-slate-300"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddBankAccountDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveBankAccount} className="bg-blue-600 hover:bg-blue-700 text-white">
              Lưu tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
