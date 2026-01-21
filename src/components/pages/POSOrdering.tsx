import React, { SetStateAction, useEffect, useState } from "react";
import { getInventoryItems, getToppingItems, getItemById } from "../../api/inventoryItem";
import { getTables } from "../../api/table";
import axiosClient from "../../api/axiosClient";

import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Grid3x3,
  List,
  ShoppingCart,
  Package,
  PackageCheck,
  Bell,
  Users,
  ArrowRight,
  Clock,
  FileText,
  GitMerge,
  ArrowLeftRight,
  History,
  MessageSquare,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Truck,
  Home,
  PackageX,
  X,
  Sparkles,
  Upload,
  Settings,
  Percent,
  Tag,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { CheckoutModal } from "../CheckoutModal";
// Removed requests drawer (Sheet) related imports
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ItemCustomizationModal,
  ItemCustomization,
} from "../ItemCustomizationModal";
import { PromotionPopup } from "../PromotionPopup";
import { ComboSelectionPopup } from "../ComboSelectionPopup";
import { ComboSuggestionBanner } from "../ComboSuggestionBanner";
import { ComboDetectionPopup } from "../ComboDetectionPopup";
import { CartItemDisplay } from "../CartItemDisplay";
import { CustomerAutocomplete } from "../CustomerAutocomplete";
import { PrintReceiptModal } from "../PrintReceiptModal";
import { autoComboPromotions } from "../../data/combos";
import { getActiveCombos } from "../../api/combo";
// Removed IngredientSelectionDialog (no longer used)
import { AccountProfileModal } from "../AccountProfileModal";
import { useAuth } from "../../contexts/AuthContext";
import { getCategories } from "../../api/category";
import { getOrderByTable, getOrders, getKitchenItems, getTakeawayOrder, sendOrderToKitchen, checkoutOrder, mapOrderToCartItems, mapOrdersToReadyItems, createOrder, addOrderItem, updateOrderItem, deleteOrderItem, removeOrderItem, transferTable, mergeOrders, splitOrder, updateOrder, updateItemStatus } from "../../api/order";
import { getAreas } from "../../api/area";
import { getBankAccounts as fetchBankAccounts, createBankAccount as createBankAccountApi } from "../../api/finance";
import { getCustomers } from "../../api/customer";
// Helper to safely extract array items from various API response shapes
const extractItems = (res: any): any[] => {
  const data = res?.data ?? res;
  // Common shapes: { metaData: { items: [] } } | { items: [] } | { data: [] } | []
  let items = data?.metaData?.items ?? data?.items ?? data?.data;
  if (Array.isArray(items)) return items;
  // Some APIs may return array directly under metaData
  if (Array.isArray(data?.metaData)) return data.metaData;
  // Or the body itself might be an array
  if (Array.isArray(data)) return data;
  return [];
};

interface Customer {
  id: number
  code: string      
  name: string
  phone?: string
  gender?: string
  city?: string
  groupName?: string
  totalOrders?: number
  totalSpent?: number
  isActive?: boolean
}


interface CartItem {
  id: string;
  orderItemId?: number; // ID from backend OrderItem (for items already in order)
  inventoryItemId?: number | string;
  name: string;
  price: number;
  quantity: number;
  sentQty?: number; // Quantity already sent to kitchen (default 0)
  localQty?: number; // Quantity in local cart - if not set, equals quantity
  notes?: string;
  status?:
    | "pending"
    | "preparing"
    | "completed"
    | "served"
    | "out-of-stock"
    | "waiting-ingredient"
    | "canceled"
    | "replaced";
  toppings?: string[];
  outOfStockReason?: string;
  outOfStockIngredients?: string[];
  replacedBy?: string;
  replacedFrom?: string;
  customization?: ItemCustomization;
  // Combo fields
  isCombo?: boolean;
  comboId?: string | number;
  comboInstanceId?: string; // Unique instance ID for distinguishing multiple identical combos
  comboName?: string;
  comboPrice?: number;
  comboItems?: CartItem[];
  comboExpanded?: boolean;
  extraPrice?: number; // Extra price for combo items (upgrade fee)
  // Topping fields
  isTopping?: boolean;
  parentItemId?: string; // If this is an attached topping, store parent item ID
  attachedToppings?: CartItem[]; // If this is a main item, store its attached toppings
  basePrice?: number; // Original price before customization
  // Gift field
  isGift?: boolean;
  // Status breakdown for grouped items
  statusBreakdown?: {
    pending: number;
    preparing: number;
    completed: number;
    served: number;
  };
  orderItemIdsByStatus?: {
    pending: number[];
    preparing: number[];
    completed: number[];
    served: number[];
  };
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: "available" | "occupied";
  currentOrder?: string;
  area: number;
  createdAt?: number; // timestamp when table was occupied
  updatedAt?: number; // timestamp of last update
  deletedAt?: number; // timestamp when table was freed
  isActive: boolean;
  order_id?: number;
}

interface TableOrders {
  [tableId: string]: CartItem[];
}

interface Category {
  id: string
  name: string
}

interface Area {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

interface OrderHistoryEntry {
  time: string;
  action: string;
  staff: string;
}

interface CompositeIngredient {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantity: number;
  unitCost: number;
}

interface InventoryIngredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  avgUnitCost: number;
}

// Topping item shape fetched from backend
interface Topping {
  id: string;
  name: string;
  price: number;
  category?: string;
  isTopping: boolean;
}

// Combo types for POS (mapped from backend)
interface PosComboItem {
  id: string;
  name: string;
  price: number;
  extraPrice?: number;
  category?: string;
  stock: number;
}

interface PosComboGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  items: PosComboItem[];
}

interface PosCombo {
  id: string;
  name: string;
  description: string;
  price: number; // comboPrice from backend
  groups: PosComboGroup[];
  image?: string;
  discount?: number;
}

interface NewItemRequest {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
  isNew?: boolean; // for showing "Mới" badge
  ingredients?: CompositeIngredient[];
}

interface ReadyItem {
  id: string;
  itemName: string;
  totalQuantity: number;
  completedQuantity: number;
  servedQuantity: number; // Track how many already served to customers
  table: string;
  timestamp: Date;
  notes?: string;
}

interface POSOrderingProps {
  userRole?: "waiter" | "cashier";
}

export function POSOrdering({ userRole = "waiter" }: POSOrderingProps) {
  const { user, logout, hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<number | 'all'>('all')
  const [selectedTableStatus, setSelectedTableStatus] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Helper to map table from BE format
  const mapTableFromBE = (t: {
  id: number
  tableName: string
  capacity: number
  currentStatus: string
  area?: { id: number }
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  isActive: boolean
  order_id?: number
}) => ({
  id: t.id,
  // Normalize to remove leading "Bàn" to avoid duplicate label "Bàn Bàn 01"
  name: (t.tableName ?? String(t.id)).replace(/^Bàn\s*/i, ''),
  // Guard: some BE rows may not have tableName → avoid calling replace on undefined
  number: Number(String(t.tableName ?? t.id).replace(/\D/g, '')),
  capacity: t.capacity,
  status: (t.currentStatus === 'occupied' ? 'occupied' : 'available') as Table['status'],
  area: (t.area?.id ?? (t as any).areaId) as number,
  createdAt: t.createdAt ? new Date(t.createdAt).getTime() : undefined,
  updatedAt: t.updatedAt ? new Date(t.updatedAt).getTime() : undefined,
  deletedAt: t.deletedAt ? new Date(t.deletedAt).getTime() : undefined,
  isActive: t.isActive,
  order_id: t.order_id
})

  // Customer data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(extractItems(res));
    } catch (err: any) {
      toast.error("Không tải được danh sách khách hàng", {
        description: err?.message || "Lỗi kết nối API",
      });
    }
  };

  fetchCustomers();
}, [])

  const [customerSearchCode, setCustomerSearchCode] = useState("");

  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState<
    Array<{ bank: string; owner: string; account: string }>
  >([
    // Will load from backend
  ]);
  // Load bank accounts from backend
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        const res = await fetchBankAccounts();
        const items = extractItems(res);
        const mapped = (items as any[]).map((ba: any) => ({
          id: ba.id,
          bank: ba.bankFullName ?? ba.bankName ?? ba.bank ?? "Ngân hàng",
          owner: ba.owner ?? ba.ownerName ?? ba.accountOwner ?? "",
          account: ba.accountNumber ?? ba.number ?? ba.account ?? "",
        }));
        setBankAccounts(mapped);
      } catch (err: any) {
        toast.error("Không tải được tài khoản ngân hàng", {
          description: err?.message || "Lỗi kết nối API",
        });
      }
    };
    loadBankAccounts();
  }, []);
  const [orderType, setOrderType] = useState<
    "dine-in" | "takeaway" | "delivery"
  >("dine-in");
  const [outOfStockOpen, setOutOfStockOpen] = useState(false);
  const [selectedItemForNote, setSelectedItemForNote] =
    useState<CartItem | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [moveTableOpen, setMoveTableOpen] = useState(false);
  const [targetTable, setTargetTable] = useState<Table | null>(null);
  // Cancel/Reduce Item states
  const [cancelItemModalOpen, setCancelItemModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<CartItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [cancelQuantity, setCancelQuantity] = useState(1);
  
  // Cancel Topping states
  const [cancelToppingModalOpen, setCancelToppingModalOpen] = useState(false);
  const [toppingToCancel, setToppingToCancel] = useState<{parentItemId: string, topping: CartItem} | null>(null);
  const [cancelToppingReason, setCancelToppingReason] = useState("");
  const [otherToppingReason, setOtherToppingReason] = useState("");
  const [cancelToppingQuantity, setCancelToppingQuantity] = useState(1);
  
  const cancelReasons = [
    "Khác",
    "Khách đợi lâu",
    "Khách không hài lòng",
    "Khách đổi món",
    "Khách hủy món",
    "Nhân viên ghi sai đơn",
  ];
  // Topping copy dialog states (for adding quantity to sent items with toppings)
  const [toppingCopyDialogOpen, setToppingCopyDialogOpen] = useState(false);
  const [pendingQuantityChange, setPendingQuantityChange] = useState<{item: CartItem, quantityToAdd: number} | null>(null);
  const [mergeTableOpen, setMergeTableOpen] = useState(false);
  const [mergeTargetTable, setMergeTargetTable] = useState<Table | null>(null);
  const [splitOrderOpen, setSplitOrderOpen] = useState(false);
  const [splitItems, setSplitItems] = useState<{ [itemId: string]: number }>(
    {}
  );

  // Out of stock states
  const [outOfStockWarningOpen, setOutOfStockWarningOpen] = useState(false);
  const [outOfStockItem, setOutOfStockItem] = useState<CartItem | null>(null);
  const [outOfStockIngredient, setOutOfStockIngredient] = useState<string>("");
  const [replaceItemModalOpen, setReplaceItemModalOpen] = useState(false);
  // IMPORTANT: inventoryOutageIngredients represents store-level outages coming from inventory,
  // not kitchen per-order incidents. Keep kitchen outages scoped to the affected order item only.
  const [inventoryOutageIngredients, setInventoryOutageIngredients] = useState<string[]>([]);
  // UI-only kitchen outage flags (per item). These gray out product cards and ask for confirmation.
  const [kitchenOutageItemIds, setKitchenOutageItemIds] = useState<string[]>([]);
  const [outageConfirmOpen, setOutageConfirmOpen] = useState(false);
  const [pendingOutageProduct, setPendingOutageProduct] = useState<(typeof products)[0] | null>(null);
  const [splitDestinationTable, setSplitDestinationTable] =
    useState<Table | null>(null);

  // Removed: New item request states

  // Customization states
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] =
    useState<CartItem | null>(null);

  // Promotion states
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [usedPoints, setUsedPoints] = useState(0);

// Backend totals (subtotal and totalAmount)
const [orderSubtotal, setOrderSubtotal] = useState<number>(0);
const [orderTotalAmount, setOrderTotalAmount] = useState<number>(0);

  // Kitchen update needed state - track when to enable send to kitchen button
  const [isKitchenUpdateNeeded, setIsKitchenUpdateNeeded] = useState(false);

  // Print receipt modal state
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);
  // Checkout modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    items: any[];
    totalAmount: number;
    orderNumber: string;
    customerName: string;
    tableNumber?: string;
  } | null>(null);
  // Track last payment method for receipt
  const [lastPaymentMethod, setLastPaymentMethod] = useState<string>("Tiền mặt");
  // Track current order payment status to control cart adjustment behavior
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<'unpaid' | 'partial' | 'paid'>('unpaid');

  // Restock notification states
  const [restockedItems, setRestockedItems] = useState<string[]>([]);
  const [glowingItems, setGlowingItems] = useState<string[]>([]);

  // Combo states
  const [comboSelectionOpen, setComboSelectionOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<PosCombo | null>(null);
  const [dismissedComboSuggestions, setDismissedComboSuggestions] = useState<
    string[]
  >([]);
  const [comboDetectionOpen, setComboDetectionOpen] = useState(false);
  const [detectedComboData, setDetectedComboData] = useState<any>(null);
  const [pendingItemToAdd, setPendingItemToAdd] = useState<
    (typeof products)[0] | null
  >(null);
  const [posCombos, setPosCombos] = useState<PosCombo[]>([]);

  // Topping states
  const [selectedTopping, setSelectedTopping] = useState<Topping | null>(null);
  const [toppingActionModalOpen, setToppingActionModalOpen] = useState(false); // "Attach or standalone" modal
  const [toppingQuantity, setToppingQuantity] = useState(1);
  const [selectItemToAttachOpen, setSelectItemToAttachOpen] = useState(false); // Modal to select which item to attach to
  const [selectedItemToAttachTopping, setSelectedItemToAttachTopping] =
    useState<CartItem | null>(null);

  // Ready items from backend (completed items across orders)
  const [readyItems, setReadyItems] = useState<ReadyItem[]>([]);
  
  // Combo summary map: comboId => { comboName, comboPrice }
  const [comboSummaryMap, setComboSummaryMap] = useState<Map<number, { comboName: string; comboPrice: number }>>(new Map());
  
  const fetchReadyItems = async () => {
    try {
      // Call kitchen items API with status=completed to get items waiting to be served
      const res = await getKitchenItems({ status: 'completed' });
      const data = res?.data?.metaData ?? res?.data ?? [];
      const kitchenItems: any[] = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      
      // Map kitchen items to ReadyItem format
      const ready: ReadyItem[] = kitchenItems.map((item: any) => ({
        id: String(item?.id ?? Date.now()),
        itemName: item?.itemName ?? item?.item?.name ?? item?.name ?? 'Món',
        totalQuantity: Number(item?.quantity ?? 1),
        completedQuantity: Number(item?.quantity ?? 1),
        servedQuantity: 0,
        table: item?.table?.tableName ?? item?.tableName ?? 'Mang đi',
        timestamp: new Date(item?.updatedAt ?? item?.createdAt ?? Date.now()),
        notes: item?.notes ?? undefined,
      }));
      
      setReadyItems(ready);
    } catch (err: any) {
      // Silently ignore if endpoint/shape not available, but surface toast for visibility
      toast.error("Không tải được danh sách món chờ cung ứng", {
        description: err?.message || "Lỗi kết nối API",
      });
    }
  };

  const advanceReadyItemOneUnit = async (itemId: string) => {
    try {
       await updateItemStatus(itemId, { status: 'served', all: false });
       toast.success("Đã phục vụ 1 món");
       fetchReadyItems();
    } catch (err: any) {
      toast.error("Lỗi cập nhật trạng thái", {
        description: err?.message || ""
      });
    }
  };

  const advanceReadyItemAllUnits = async (itemId: string) => {
    try {
       await updateItemStatus(itemId, { status: 'served', all: true });
       toast.success("Đã phục vụ tất cả");
       fetchReadyItems();
    } catch (err: any) {
      toast.error("Lỗi cập nhật trạng thái", {
        description: err?.message || ""
      });
    }
  };

  useEffect(() => {
    fetchReadyItems();
  }, []);

  // Lưu đơn hàng cho từng bàn
  const [tableOrders, setTableOrders] = useState<TableOrders>({});
  const [takeawayOrders, setTakeawayOrders] = useState<CartItem[]>([]);
  const [takeawayOrderId, setTakeawayOrderId] = useState<number | null>(null);
  const [takeawayOrderCode, setTakeawayOrderCode] = useState<string | null>(null);


  // Restore takeaway order from local storage
  useEffect(() => {
    const savedId = localStorage.getItem("pos_takeaway_order_id");
    if (savedId) {
      setTakeawayOrderId(Number(savedId));
      // Fetch order details
      const fetchTakeawayOrder = async () => {
        try {
          const res = await axiosClient.get(`/orders/${savedId}`);
          const orderData = res?.data?.metaData ?? res?.data;
          
          if (orderData && orderData.status !== 'completed' && orderData.status !== 'canceled') {
             const newItems = mapOrderToCartItems(orderData);
             setTakeawayOrders(newItems);
             setTakeawayOrderCode(orderData.orderCode); // Set code from backend
             // Restore customer if needed
             if (orderData.customer) {
                // Only if looking at takeaway tab? Or globally?
                // Maybe don't auto-set global customer to avoid confusion if user is on table tab
             }
          } else {
             // Order invalid or completed, clear local
             localStorage.removeItem("pos_takeaway_order_id");
             setTakeawayOrderId(null);
             setTakeawayOrderCode(null);
          }
        } catch (e) {
          console.error("Failed to restore takeaway order", e);
          // If 404, clear it
          localStorage.removeItem("pos_takeaway_order_id");
          setTakeawayOrderId(null);
          setTakeawayOrderCode(null);
        }
      };
      fetchTakeawayOrder();
    }
  }, []);

  // Persist takeaway order ID
  useEffect(() => {
    if (takeawayOrderId) {
      localStorage.setItem("pos_takeaway_order_id", String(takeawayOrderId));
    } else {
      // If explicit null set (e.g. cleared), remove it. 
      // But be careful not to remove on initial null before restore?
      // actually initial is null. 
      // We should only remove if we explicitly want to clear, which usually happens in handlers.
      // But sync is good. Let's rely on handlers removing it for 'clear' events.
      // Actually, if we set it to null, we expect it to be gone.
      // But initial render is null. We don't want to wipe existing storage on first render.
      // So checking inside the 'Restore' effect is key.
    }
  }, [takeawayOrderId]);

  const [tables, setTables] = useState<Table[]>([])
  
  // Reusable function to refresh tables list
  const refreshTables = async () => {
    // Gate by permission to avoid 403 for roles without table access
    if (!hasPermission("tables:view" as any)) return;
    try {
      const res = await getTables({ isActive: true });
      const items = res?.metaData?.items || extractItems(res); // Prioritize metaData.items
      setTables((items || []).map(mapTableFromBE));
    } catch (err: any) {
      console.error("Failed to refresh tables:", err);
    }
  };
  
  useEffect(() => {
    refreshTables();
  }, [])


  const [areas, setAreas] = useState<Area[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)

  useEffect(() => {
    const fetchAreas = async () => {
      // Gate by permission to avoid 403 for roles without table access
      if (!hasPermission("tables:view" as any)) return;
      try {
        const res = await getAreas();
        setAreas(extractItems(res));
      } catch (err: any) {
        toast.error("Không tải được khu vực", {
          description: err?.message || "Lỗi kết nối API",
        });
      }
    };

    fetchAreas();
  }, [])


  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const items = extractItems(res);
        const desiredNames = [
          'Bánh ngọt',
          'Cà phê',
          'Trà',
          'Nước ngọt',
          'Đồ uống đóng chai',
        ];
        const mapped = (items as any[]).map((c: any) => ({
          id: String(c.id),
          name: String(c.name),
        }));
        const filtered = mapped.filter((c) =>
          desiredNames.some((n) => n.toLowerCase() === c.name.toLowerCase())
        );
        const sorted = filtered.sort(
          (a, b) =>
            desiredNames.findIndex((n) => n.toLowerCase() === a.name.toLowerCase()) -
            desiredNames.findIndex((n) => n.toLowerCase() === b.name.toLowerCase())
        );
        // Prepend a synthetic "Tất cả" category for convenience
        setCategories([{ id: 'all', name: 'Tất cả' }, ...sorted]);
      } catch (err: any) {
        toast.error("Không tải được danh mục", {
          description: err?.message || "Lỗi kết nối API",
        });
      }
    };

    fetchCategories();
  }, [])

  const [products, setProducts] = useState<any[]>([])
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getInventoryItems();
        const items = extractItems(res);
        setProducts(
          items.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: String(item?.category?.id ?? item.category),
            // Ensure sellingPrice is numeric to avoid string concatenation issues
            price: Number(item.sellingPrice),
            image: item.imageUrl ?? '☕'
          }))
        );
      } catch (err: any) {
        toast.error("Không tải được sản phẩm/menu", {
          description: err?.message || "Lỗi kết nối API",
        });
      }
    };

    fetchProducts();
  }, [])



  // Fetch active combos for POS and map to UI shape
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await getActiveCombos();
        const items = extractItems(res);
        const mapped: PosCombo[] = (items as any[]).map((c: any) => {
          // BE returns comboGroups (not groups)
          const groups: PosComboGroup[] = (c.comboGroups || c.groups || []).map((g: any, idx: number) => {
            // BE returns comboItems (not items)
            const groupItems: PosComboItem[] = (g.comboItems || g.items || []).map((gi: any) => {
              // BE returns gi.item with the actual item details
              const itemData = gi.item ?? gi;
              const itemId = String(itemData.id ?? gi.itemId ?? gi.inventoryItemId);
              const product = products.find(p => String(p.id) === itemId);
              return {
                id: itemId,
                name: itemData.name ?? gi.itemName ?? product?.name ?? 'Món',
                price: Number(itemData.sellingPrice ?? product?.price ?? gi.price ?? 0),
                extraPrice: gi.extraPrice != null ? Number(gi.extraPrice) : undefined,
                category: product?.category,
                stock: Number(gi.stock ?? 999),
              };
            });
            return {
              id: String(g.id ?? g.groupId ?? `${c.id}-g${idx}`),
              name: g.name ?? g.groupName ?? `Nhóm ${idx + 1}`,
              // BE uses isRequired (not required)
              required: Boolean(g.isRequired ?? g.required ?? (g.minChoices ?? 0) > 0),
              minSelect: Number(g.minChoices ?? g.minSelect ?? (g.isRequired ? 1 : 0)),
              maxSelect: Number(g.maxChoices ?? g.maxSelect ?? (groupItems.length || 1)),
              items: groupItems,
            };
          });
          return {
            id: String(c.id),
            name: c.name,
            description: c.description ?? '',
            price: Number(c.comboPrice ?? c.price ?? 0),
            groups,
            image: c.imageUrl ?? c.image ?? undefined,
            discount: typeof c.discount === 'number' ? c.discount : undefined,
          };
        });
        setPosCombos(mapped);
      } catch (err: any) {
        toast.error('Không tải được combo', { description: err?.message || 'Lỗi kết nối API' });
      }
    };

    // Fetch combos regardless of product load; product enrichment happens when available
    fetchCombos();
  }, [products]);

  // Topping SKUs (independent products)
  // Toppings fetched from backend
  const [toppings, setToppings] = useState<Topping[]>([]);
  useEffect(() => {
    const fetchToppings = async () => {
      try {
        const res = await getToppingItems();
        const items = extractItems(res);
        // Prefer backend's isTopping flag; fallback to itemTypeId === 'TOPPING'
        const mapped = (items as any[])
          .filter((item: any) => item?.isTopping === true || item?.itemTypeId === 'TOPPING')
          .map((item: any) => ({
            id: String(item.id),
            name: item.name,
            price: Number(item.sellingPrice),
            category: String(item?.category?.id ?? item.category ?? 'topping'),
            isTopping: Boolean(item?.isTopping ?? (item?.itemTypeId === 'TOPPING')),
          }));
        setToppings(mapped);
      } catch (err: any) {
        toast.error("Không tải được topping", {
          description: err?.message || "Lỗi kết nối API",
        });
      }
    };
    fetchToppings();
  }, []);

  // Backend-linked: keep kitchen outage flags in sync with items marked OUT_OF_STOCK
  useEffect(() => {
    let timer: any;
    let active = true;
    const refreshKitchenOutages = async () => {
      try {
        const res = await getKitchenItems({ status: 'all' } as any);
        const items = extractItems(res);
        // Prefer inventoryItemId (or equivalent id fields) when backend provides it; fallback to name matching
        const flaggedIds = (items as any[])
          .filter((it: any) => {
            const s = String(it.status || '').toUpperCase();
            return s === 'OUT_OF_STOCK' || s === 'OUT-OF-STOCK';
          })
          .map((it: any) => {
            const idCandidates = [
              it.inventoryItemId,
              it.inventoryItemID,
              it.inventory_item_id,
              it.itemId,
              it.itemID,
              it.item_id,
              it?.item?.id,
              it?.inventoryItem?.id,
              it?.inventoryItem?.inventoryItemId,
            ].filter((v: any) => v !== undefined && v !== null && String(v).length > 0);

            if (idCandidates.length > 0) {
              return String(idCandidates[0]);
            }

            // Fallback to name-based matching if no id available
            const name = String(it.itemName || it.name || '');
            if (!name) return null;
            const p = products.find(
              (x) => String(x.name).toLowerCase() === name.toLowerCase()
            );
            return p ? String(p.id) : null;
          })
          .filter((id: any): id is string => Boolean(id));

        // Stable, deduped list for consistent equality checks
        const unique = Array.from(new Set(flaggedIds)).sort();
        // Deduplicate state updates to avoid render loops
        if (active) {
          setKitchenOutageItemIds((prev) => {
            if (prev.length === unique.length && prev.every((v, i) => v === unique[i])) {
              return prev;
            }
            return unique;
          });
        }
      } catch (_) {
        // Silent; POS can operate without kitchen feed
      }
    };
    const start = () => {
      refreshKitchenOutages();
      timer = setInterval(refreshKitchenOutages, 10000);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };
    // Start only when visible
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      active = false;
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [products]);

  // Fallback: if cannot fetch global kitchen items (e.g., lack permission),
  // still grey items that are OUT_OF_STOCK in the currently selected table's cart.
  useEffect(() => {
    const cart = getCurrentCart();
    const localOutageIds = cart
      .filter((it) => (it.status || '').toLowerCase() === 'out-of-stock')
      .map((it) => String(it.id).split('-')[0]);
    if (localOutageIds.length > 0) {
      setKitchenOutageItemIds((prev) => {
        const set = new Set([...prev, ...localOutageIds]);
        return Array.from(set);
      });
    }
  }, [selectedTable, tableOrders]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && selectedCategory !== "combo";
  });

  const filteredCombos = posCombos.filter((c) => {
    const matchesCategory =
      selectedCategory === "all" || selectedCategory === "combo";
    const matchesSearch = c.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Lấy cart hiện tại (theo bàn hoặc mang đi)
  const getCurrentCart = (): CartItem[] => {
    if (isTakeaway) {
      return takeawayOrders;
    }
    if (selectedTable) {
      return tableOrders[selectedTable.id] || [];
    }
    return [];
  };

  const updateCurrentCart = (newCart: CartItem[]) => {
    if (isTakeaway) {
      setTakeawayOrders(newCart);
    } else if (selectedTable) {
      setTableOrders({
        ...tableOrders,
        [selectedTable.id]: newCart,
      });
    }
  };


  // Refresh order helper
  // Refresh order helper
  const fetchTableOrder = async (table: Table) => {
    try {
      // Reset totals before fetching
      setOrderSubtotal(0);
      setOrderTotalAmount(0);

      const res = await getOrderByTable(table.id);
      const orderData = res?.data?.metaData ?? res?.data;
      
      if (orderData && orderData.status !== 'cancelled') {
         // Update state with fetched order ID
         setSelectedTable(prev => prev?.id === table.id ? ({ ...prev, order_id: orderData.id, currentOrder: orderData.orderCode }) : prev);
        // Set backend totals
        setOrderSubtotal(Number(orderData.subtotal ?? 0));
        setOrderTotalAmount(Number(orderData.totalAmount ?? 0));

        const newItems = mapOrderToCartItems(orderData);
        setTableOrders(prev => ({ ...prev, [table.id]: newItems }));

        // Restore customer if exists
        if (orderData.customer) {
            setSelectedCustomer(orderData.customer);
            setCustomerSearchCode(orderData.customer.name);
        } else {
            setSelectedCustomer(null);
            setCustomerSearchCode("");
        }

      } else {
         // If no order found or CANCELLED, clear local
         if (selectedTable?.id === table.id) {
             setSelectedTable(prev => prev ? ({ ...prev, order_id: undefined as any, currentOrder: undefined }) : null);
         }
         
         setTableOrders(prev => ({ ...prev, [table.id]: [] }));
         // Clear customer as well since no order
         setSelectedCustomer(null);
         setCustomerSearchCode("");
      }
    } catch (e) {
       console.error("Failed to fetch order", e);
    }
  };

  // Combo helper functions
  const detectComboSuggestions = () => {
    return [];
  };

  const getCategoryName = (categoryId: string) => {
    const categoryNames: { [key: string]: string } = {
      coffee: "Cà phê",
      tea: "Trà",
      smoothie: "Sinh tố",
      pastry: "Bánh ngọt",
    };
    return categoryNames[categoryId] || categoryId;
  };

  const handleApplyComboSuggestion = (comboId: string) => {
    const promo = autoComboPromotions.find((p) => p.id === comboId);
    if (!promo) return;

    toast.success(`Đã áp dụng ${promo.name}`);
    // This would integrate with the promotion system
    // For now, just dismiss the suggestion
    setDismissedComboSuggestions([...dismissedComboSuggestions, comboId]);
  };

  const handleDismissComboSuggestion = (comboId: string) => {
    setDismissedComboSuggestions([...dismissedComboSuggestions, comboId]);
  };

  const handleComboClick = (combo: PosCombo) => {
    // Modified: Allow adding items/combos even if table is occupied (to add to existing order)
    
    setSelectedCombo(combo);
    setComboSelectionOpen(true);
  };

  const handleConfirmCombo = async (
    selectedItems: { [groupId: string]: string[] },
    combo: PosCombo
  ) => {
    // 1. Construct the combo payload
    const comboInstanceId = `${combo.id}-${Date.now()}`;
    const comboSubItems: CartItem[] = [];
    
    let isFirstItem = true;

    combo.groups.forEach(group => {
        const selectedIds = selectedItems[group.id] || [];
        selectedIds.forEach(itemId => {
             const groupItem = group.items.find(i => i.id === itemId);
             if (groupItem) {
                 // Calculate local price: Base combo price (for 1st item) + Extra Price
                 let itemPrice = Number(groupItem.extraPrice || 0);
                 if (isFirstItem) {
                     itemPrice += Number(combo.price);
                     isFirstItem = false;
                 }

                 comboSubItems.push({
                     id: `${combo.id}-${group.id}-${itemId}-${Date.now()}`,
                     name: groupItem.name,
                     price: itemPrice, 
                     quantity: 1,
                     status: 'pending',
                     inventoryItemId: groupItem.id, 
                     extraPrice: Number(groupItem.extraPrice || 0),
                     // Combo Linking
                     comboId: combo.id,
                     comboName: combo.name,
                     comboPrice: combo.price,
                     comboInstanceId: comboInstanceId
                 });
             }
        });
    });

    // 2. Add to Cart (Local or API)
    let currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    
    // Nếu có bàn nhưng chưa có order → tạo order mới trước
    if (!isTakeaway && selectedTable && !selectedTable.order_id) {
        try {
            const newOrderRes = await createOrder({ tableId: selectedTable.id, items: [] });
            const newOrderData = newOrderRes?.data?.metaData ?? newOrderRes?.data;
            const newOrderId = newOrderData?.id;
            
            if (newOrderId) {
                currentOrderId = newOrderId;
                // Cập nhật selectedTable với order_id mới
                setSelectedTable({
                    ...selectedTable,
                    order_id: newOrderId as any,
                    status: 'occupied'
                });
                // Refresh tables to show occupied status
                await refreshTables();
                toast.success(`Đã tạo đơn hàng mới cho ${selectedTable.name}`);
            } else {
                toast.error("Không thể tạo đơn hàng mới");
                return;
            }
        } catch (e: any) {
            toast.error(`Lỗi tạo đơn hàng: ${e?.message}`);
            return;
        }
    }
    
    // Nếu là takeaway mà chưa có order → tạo takeaway order
    if (isTakeaway && !takeawayOrderId) {
        try {
            const newOrderRes = await createOrder({ tableId: null as any, items: [] } as any);
            const newOrderData = newOrderRes?.data?.metaData ?? newOrderRes?.data;
            const newOrderId = newOrderData?.id;
            const newOrderCode = newOrderData?.orderCode || String(newOrderId);
            
            if (newOrderId) {
                currentOrderId = newOrderId;
                setTakeawayOrderId(newOrderId);
                setTakeawayOrderCode(newOrderCode);
                localStorage.setItem("pos_takeaway_order_id", String(newOrderId));
                toast.success(`Đã tạo đơn mang đi: ${newOrderCode}`);
            } else {
                toast.error("Không thể tạo đơn mang đi");
                return;
            }
        } catch (e: any) {
            toast.error(`Lỗi tạo đơn mang đi: ${e?.message}`);
            return;
        }
    }
    
    if (currentOrderId) {
        try {
             // Loop through sub-items and add them to the order via API
             // We need to match the backend 'addItem' expectation for Combos.
             // Backend 'addItem' expects standard item addition but with `comboId` set.
             // So we iterate over the selected items and add them one by one.
             
             // Send combo items SEQUENTIALLY to avoid race condition in pro-rate calculation
             // Each request needs to see previous items to calculate correct pro-rate
             for (const subItem of comboSubItems) {
                 if (!subItem.inventoryItemId) continue;

                 await addOrderItem(currentOrderId, {
                     itemId: Number(subItem.inventoryItemId),
                     quantity: 1, // Combo items usually qty 1
                     comboId: Number(combo.id),
                     notes: subItem.notes,
                     // If we had customization (ice, sugar) we would pass it here
                     // For now passing basic info
                 });
             }
             
             toast.success("Đã thêm combo vào đơn");

             // Refresh
             if (isTakeaway) {
                const res = await axiosClient.get(`/orders/${currentOrderId}`);
                const orderData = res?.data?.metaData ?? res?.data;
                if (orderData) {
                    setTakeawayOrders(mapOrderToCartItems(orderData));
                }
             } else if (selectedTable) {
                fetchTableOrder(selectedTable);
             }

        } catch (e: any) {
             console.error(e);
             toast.error(`Lỗi thêm combo: ${e?.message || 'Không rõ'}`);
        }
    } else {
        // Fallback: Local Only - Flatten items for rendering consistency
        const cart = getCurrentCart();
        updateCurrentCart([...cart, ...comboSubItems]);
        setComboSelectionOpen(false);
        toast.success("Đã thêm combo (Local)");
    }
  };

  // Combo item addition with API sync completed above

  const toggleComboExpansion = (comboItemId: string) => {
    const cart = getCurrentCart();
    updateCurrentCart(
      cart.map((item) =>
        item.id === comboItemId
          ? { ...item, comboExpanded: !item.comboExpanded }
          : item
      )
    );
  };

  const handleApplyDetectedCombo = () => {
      // Empty
  };

  const handleContinueIndividual = () => {
    if (!pendingItemToAdd) return;

    // Add item normally without combo
    const cart = getCurrentCart();
    const existing = cart.find(
      (item) => item.id === pendingItemToAdd.id && !item.isCombo
    );

    if (existing) {
      updateCurrentCart(
        cart.map((item) =>
          item.id === pendingItemToAdd.id && !item.isCombo
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      updateCurrentCart([
        ...cart,
        { ...pendingItemToAdd, quantity: 1, status: "pending" },
      ]);
    }

    setComboDetectionOpen(false);
    setPendingItemToAdd(null);
    setDetectedComboData(null);
  };

  const handleCustomizeComboItem = (comboId: string, itemIndex: number) => {
    const cart = getCurrentCart();
    const combo = cart.find((item) => item.id === comboId && item.isCombo);

    if (combo && combo.comboItems && combo.comboItems[itemIndex]) {
      const itemToCustomize = combo.comboItems[itemIndex];
      setSelectedItemForCustomization({
        ...itemToCustomize,
        // Store parent combo info for update
        __comboId: comboId,
        __itemIndex: itemIndex,
      } as any);
      setCustomizationModalOpen(true);
    }
  };

  const handleUpdateComboItemCustomization = (
    customization: ItemCustomization
  ) => {
      // Empty
  };

  const isProductOutOfStock = (product: (typeof products)[0]) => {
    // Check if product ingredients are in global out-of-stock list
    const productIngredients: { [key: string]: string[] } = {
      "1": ["Sữa tươi", "Cà phê"], // Cà phê sữa đá
      "2": ["Sữa đặc", "Cà phê"], // Bạc xỉu
      "6": ["Trân châu", "Trà"], // Trà sữa trân châu
    };

    const ingredients = productIngredients[product.id] || [];
    // Gate menu items only by inventory-level outages, not by kitchen per-order events
    return ingredients.some((ing) => inventoryOutageIngredients.includes(ing));
  };

  const checkComboDetection = (
    cart: CartItem[],
    newProduct: (typeof products)[0]
  ) => {
    return null;
  };





  const updateQuantity = async (id: string, newQty: number, reason?: string) => {
    const cart = getCurrentCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    // Check if newQty is valid relative to item
    const delta = newQty - item.quantity;
    if (delta === 0) return;

    // Case 1: Item is Pending (not sent to kitchen)
    if (!item.orderItemId) {
         if (newQty <= 0) {
             // Remove local item
             updateCurrentCart(cart.filter(i => i.id !== id));
         } else {
             // Update local quantity
             updateCurrentCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
         }
         return;
    }

    // Case 2: Item is Sent (Has orderItemId)
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;

    if (currentOrderId && item.orderItemId) {
        try {
            if (newQty > item.quantity) {
                 const quantityToAdd = newQty - item.quantity;
                 const isPending = !item.status || item.status === 'pending';
                 
                 if (isPending && item.orderItemId) {
                     // Item is PENDING: Update the existing orderItem quantity
                     await updateOrderItem(currentOrderId, item.orderItemId, {
                         quantity: newQty
                     });
                     
                     // Also update attached toppings quantities proportionally
                     if (item.attachedToppings && item.attachedToppings.length > 0) {
                       for (const topping of item.attachedToppings) {
                         if (topping.orderItemId) {
                           const newToppingQty = Math.round((topping.quantity / item.quantity) * newQty);
                           await updateOrderItem(currentOrderId, topping.orderItemId, {
                             quantity: newToppingQty
                           });
                         }
                       }
                     }
                     
                     toast.success(`Đã cập nhật số lượng ${item.name} thành ${newQty}`);
                 } else {
                     // Item is already sent to kitchen: ADD NEW ITEM
                     if (!item.inventoryItemId) {
                         toast.error("Không tìm thấy ID sản phẩm gốc để thêm mới");
                         return;
                     }
                     
                     // Check if item has attached toppings - show dialog to ask if user wants to copy them
                     if (item.attachedToppings && item.attachedToppings.length > 0) {
                       setPendingQuantityChange({ item, quantityToAdd });
                       setToppingCopyDialogOpen(true);
                       return; // Wait for user choice in dialog
                     }
                     
                     // No toppings - add directly
                     await addOrderItem(currentOrderId, {
                         itemId: Number(item.inventoryItemId),
                         quantity: quantityToAdd,
                         notes: item.notes,
                         // Copy customization if available
                        customization: stripToppingsFromCustomization(item.customization),
                     });
                     toast.success(`Đã gọi thêm ${quantityToAdd} ${item.name}`);
                 }

            } else {
                 // DECREASE QUANTITY (Must keep this logic as it removes from the EXISTING item)
                 if (newQty <= 0) {
                     // Full cancel
                     await deleteOrderItem(currentOrderId, item.orderItemId, { 
                         reason: reason || 'Khách yêu cầu hủy' 
                     });
                     toast.success(`Đã hủy món: ${item.name}`);
                 } else {
                     // Partial decrease
                     const quantityToRemove = item.quantity - newQty;
                     await deleteOrderItem(currentOrderId, item.orderItemId, { 
                         quantity: quantityToRemove,
                         reason: reason || 'Giảm số lượng'
                     });
                     toast.success(`Đã giảm số lượng ${item.name}`);
                 }
            }
            // Always refresh from server
            if (isTakeaway) {
                 // Refresh takeaway logic
                const res = await axiosClient.get(`/orders/${currentOrderId}`);
                const orderData = res?.data?.metaData ?? res?.data;
                if (orderData) {
                    if (orderData.status === 'cancelled') {
                        // Clear takeaway state if cancelled
                        setTakeawayOrders([]);
                        setTakeawayOrderId(null);
                        setTakeawayOrderCode(null);
                        localStorage.removeItem("pos_takeaway_order_id");
                        toast.info("Đơn hàng đã bị hủy do hết món");
                    } else {
                        setTakeawayOrders(mapOrderToCartItems(orderData));
                    }
                }
            } else {
                if (selectedTable) {
                    fetchTableOrder(selectedTable);
                }
            }
        } catch (err: any) {
            toast.error(`Cập nhật số lượng thất bại: ${err?.message}`);
        }
    }
  };

  const handleRemoveCombo = async (comboInstanceId: string, comboItems?: CartItem[]) => {
     const cart = getCurrentCart();
     // Use provided comboItems if available (from rendering), otherwise find by comboInstanceId or comboId
     let items = comboItems;
     if (!items || items.length === 0) {
       // Fallback: find items by comboInstanceId
       items = cart.filter(i => i.comboInstanceId === comboInstanceId || String(i.comboId) === comboInstanceId);
     }
     console.log(`Deleting combo instance ${comboInstanceId}, found ${items.length} items`, items);
     
     if (items.length === 0) return;

     const isAnySent = items.some(i => i.status && i.status !== 'pending');
     const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
     
     // Get orderItemIds for this specific combo instance
     const orderItemIds = items.map(i => i.orderItemId).filter(Boolean);
     
     if (isAnySent) {
         // Open Cancel Modal for the entire combo
         // We pass a "virtual" item representing the combo
         const comboName = items[0].comboName || "Combo";
         setItemToCancel({ 
             id: comboInstanceId, 
             name: comboName, 
             quantity: 1, 
             price: 0, 
             status: 'served', // Treat as served so logic knows it's sent
             comboInstanceId: comboInstanceId,
             // Custom properties
             ...({ isCombo: true, items: items } as any)
         } as CartItem);
         setCancelQuantity(1);
         setCancelReason("");
         setCancelItemModalOpen(true);
     } else {
         // All pending -> Delete all immediately
         if (!currentOrderId) {
             // Local cart removal - filter by orderItemIds for specific instance
             const idsToRemove = new Set(orderItemIds);
             updateCurrentCart(cart.filter(i => !idsToRemove.has(i.orderItemId)));
             toast.success("Đã xóa combo");
         } else {
             // API removal - only remove items from this specific instance
             try {
                 await Promise.all(items.map(item => {
                     if (item.orderItemId) {
                        return removeOrderItem(currentOrderId, item.orderItemId);
                     }
                     return Promise.resolve();
                 }));
                 toast.success("Đã xóa combo khỏi đơn");
                 
                 // Refresh data
                 if (isTakeaway && takeawayOrderId) {
                    const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
                    const orderData = res?.data?.metaData ?? res?.data;
                    if (orderData) setTakeawayOrders(mapOrderToCartItems(orderData));
                } else if (selectedTable) {
                    fetchTableOrder(selectedTable);
                }

                // Check for allItemsCanceled flag
                // Note: removeOrderItem might not return it, but deleteOrderItem (below) does.
                // If removing pending items leads to empty order, we might need to check manually?
                // But typically pending items removal is fine.
                // The user specifically asked for "huỷ hết orderitem trong order... bên BE có flag allItemsCanceled".
                // This flag comes from deleteOrderItem/updateItemStatus logic in backend.
             } catch (err: any) {
                 toast.error(`Xóa combo thất bại: ${err?.message}`);
             }
         }
     }
  };

  // Handle removal of individual combo items (same logic as regular items)
  const handleRemoveComboItem = async (item: CartItem) => {
    // If no orderItemId (local only), remove from cart
    if (!item.orderItemId) {
      const cart = getCurrentCart();
      updateCurrentCart(cart.filter(i => i.id !== item.id));
      toast.success("Đã xóa món khỏi giỏ hàng");
      return;
    }
    
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    if (!currentOrderId) return;
    
    const isPending = !item.status || item.status === 'pending';
    
    if (isPending) {
      // Pending: remove directly
      try {
        await removeOrderItem(currentOrderId, item.orderItemId);
        toast.success("Đã xóa món khỏi đơn hàng");
        
        // Refresh data
        if (isTakeaway && takeawayOrderId) {
          const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
          const orderData = res?.data?.metaData ?? res?.data;
          if (orderData) {
            setTakeawayOrders(mapOrderToCartItems(orderData));
          }
        } else if (selectedTable) {
          fetchTableOrder(selectedTable);
        }
      } catch (err: any) {
        toast.error(`Xóa món thất bại: ${err?.message}`);
      }
    } else {
      // Sent to kitchen: show cancel modal
      setItemToCancel(item);
      setCancelQuantity(item.quantity);
      setCancelReason("");
      setOtherReason("");
      setCancelItemModalOpen(true);
    }
  };

  const removeFromCart = async (id: string, reason?: string) => {
    // Determine item
    const cart = getCurrentCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    // Nếu chưa có orderItemId (chưa lưu vào CSDL) → xóa local
    if (!item.orderItemId) {
        updateCurrentCart(cart.filter(i => i.id !== id));
        toast.success("Đã xóa món khỏi giỏ hàng");
        return;
    }
    
    // Xác định orderId
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    if (!currentOrderId) return;
    
    // Kiểm tra status:
    // - pending = chưa báo bếp → xóa vĩnh viễn khỏi CSDL
    // - khác pending = đã báo bếp → mark canceled để track lỗ
    const isPending = !item.status || item.status === 'pending';
    
    if (isPending) {
        // CHƯA BÁO BẾP → Xóa vĩnh viễn khỏi CSDL
        try {
            await removeOrderItem(currentOrderId, item.orderItemId);
            toast.success("Đã xóa món khỏi đơn hàng");
            
            // Refresh data
            if (isTakeaway && takeawayOrderId) {
                const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
                const orderData = res?.data?.metaData ?? res?.data;
                if (orderData) {
                    setTakeawayOrders(mapOrderToCartItems(orderData));
                }
            } else if (selectedTable) {
                fetchTableOrder(selectedTable);
            }
        } catch (err: any) {
            toast.error(`Xóa món thất bại: ${err?.message}`);
        }
    } else {
        // ĐÃ BÁO BẾP → Mark canceled (cần reason)
        if (reason) {
            // Có reason từ dialog CartItemDisplay
            try {
                await deleteOrderItem(currentOrderId, item.orderItemId, {
                    quantity: item.quantity,
                    reason: reason
                });
                toast.success("Đã hủy món (lưu vào thống kê)");
                
                if (isTakeaway && takeawayOrderId) {
                    const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
                    const orderData = res?.data?.metaData ?? res?.data;
                    if (orderData) {
                        setTakeawayOrders(mapOrderToCartItems(orderData));
                    }
                } else if (selectedTable) {
                    fetchTableOrder(selectedTable);
                }
            } catch (err: any) {
                toast.error(`Hủy món thất bại: ${err?.message}`);
            }
        } else {
            // Chưa có reason → mở modal để nhập reason
            setItemToCancel(item);
            setCancelQuantity(item.quantity); 
            setCancelReason("");
            setOtherReason("");
            setCancelItemModalOpen(true);
        }
    }
  };
  
  const handleConfirmCancel = async () => {
    if (!cancelReason || (cancelReason === "Khác" && !otherReason.trim())) {
      return;
    }
    
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    if (!itemToCancel || !currentOrderId) return;
    
    const finalReason = cancelReason === "Khác" ? otherReason : cancelReason;
      
    try {
        // Check if it's a combo cancellation
        if ((itemToCancel as any).isCombo && (itemToCancel as any).items) {
            const comboItems = (itemToCancel as any).items as CartItem[];
            const responses = await Promise.all(comboItems.map(item => 
                 deleteOrderItem(currentOrderId, item.orderItemId || item.id, {
                    quantity: item.quantity,
                    reason: finalReason || "Hủy combo"
                 })
            ));
            toast.success("Đã hủy combo thành công");
            
            // Check if any response indicates all items canceled
            const anyCanceled = responses.some(res => {
                const meta = res.data?.metaData ?? res.data;
                return meta?.allItemsCanceled;
            });

            if (anyCanceled) {
                 alert("Bạn đã hủy hết món trong đơn hàng. Đơn hàng sẽ chuyển sang trạng thái Đã Hủy.");
                 // Refresh tables to update status
                 await refreshTables();
                 if (selectedTable) {
                    fetchTableOrder(selectedTable);
                    // Clear selected table since order is canceled
                    setSelectedTable(null);
                 } else if (isTakeaway) {
                    setTakeawayOrders([]);
                    setTakeawayOrderId(null);
                    setTakeawayOrderCode(null);
                    localStorage.removeItem("pos_takeaway_order_id");
                 }
                 setCancelItemModalOpen(false);
                 setItemToCancel(null);
                 return;
            }

        } else {
            // Single item cancellation
            const res = await deleteOrderItem(currentOrderId, itemToCancel.orderItemId || itemToCancel.id, {
                   quantity: cancelQuantity,
                   reason: finalReason || "Khách hủy"
            });
            toast.success("Đã hủy món thành công");
            
            const metaData = res.data?.metaData ?? res.data; // Check response structure
            if (metaData?.allItemsCanceled) {
                 alert("Bạn đã hủy hết món trong đơn hàng. Đơn hàng sẽ chuyển sang trạng thái Đã Hủy.");
                 // Refresh tables to update status
                 await refreshTables();
                 // Refresh entirely to clear state
                 if (selectedTable) {
                    // Clear selected table since order is canceled
                    setSelectedTable(null);
                 } else if (isTakeaway) {
                    setTakeawayOrders([]);
                    setTakeawayOrderId(null);
                    setTakeawayOrderCode(null);
                    localStorage.removeItem("pos_takeaway_order_id");
                 }
                 setCancelItemModalOpen(false);
                 setItemToCancel(null);
                 return;
            }
        }

        // Refresh data
        if (isTakeaway && takeawayOrderId) {
            const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
            const orderData = res?.data?.metaData ?? res?.data;
            if (orderData) setTakeawayOrders(mapOrderToCartItems(orderData));
        } else if (selectedTable) {
            fetchTableOrder(selectedTable);
        }

    } catch (err: any) {
        toast.error(`Hủy món thất bại: ${err?.message}`);
    } finally {
        setCancelItemModalOpen(false);
        setItemToCancel(null);
    }
  };

  // Handle topping copy dialog - add item with toppings
  const handleAddItemWithToppings = async () => {
    if (!pendingQuantityChange) return;
    
    const { item, quantityToAdd } = pendingQuantityChange;
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    
    if (!currentOrderId || !item.inventoryItemId) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      setToppingCopyDialogOpen(false);
      setPendingQuantityChange(null);
      return;
    }
    
    try {
      // Build attachedToppings payload from existing toppings
      const attachedToppings = item.attachedToppings?.map(t => ({
        itemId: Number(t.inventoryItemId),
        quantity: t.quantity
      })) || [];
      
      await addOrderItem(currentOrderId, {
        itemId: Number(item.inventoryItemId),
        quantity: quantityToAdd,
        notes: item.notes,
        customization: stripToppingsFromCustomization(item.customization),
        attachedToppings: attachedToppings
      });
      
      toast.success(`Đã gọi thêm ${quantityToAdd} ${item.name} (kèm topping)`);
      
      // Refresh data
      if (isTakeaway && takeawayOrderId) {
        const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
        const orderData = res?.data?.metaData ?? res?.data;
        if (orderData) setTakeawayOrders(mapOrderToCartItems(orderData));
      } else if (selectedTable) {
        fetchTableOrder(selectedTable);
      }
    } catch (err: any) {
      toast.error(`Thêm món thất bại: ${err?.message}`);
    } finally {
      setToppingCopyDialogOpen(false);
      setPendingQuantityChange(null);
    }
  };
  
  // Handle topping copy dialog - add item without toppings
  const handleAddItemWithoutToppings = async () => {
    if (!pendingQuantityChange) return;
    
    const { item, quantityToAdd } = pendingQuantityChange;
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    
    if (!currentOrderId || !item.inventoryItemId) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      setToppingCopyDialogOpen(false);
      setPendingQuantityChange(null);
      return;
    }
    
    try {
      await addOrderItem(currentOrderId, {
        itemId: Number(item.inventoryItemId),
        quantity: quantityToAdd,
        notes: item.notes,
        customization: stripToppingsFromCustomization(item.customization),
        // No toppings
      });
      
      toast.success(`Đã gọi thêm ${quantityToAdd} ${item.name} (không có topping)`);
      
      // Refresh data
      if (isTakeaway && takeawayOrderId) {
        const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
        const orderData = res?.data?.metaData ?? res?.data;
        if (orderData) setTakeawayOrders(mapOrderToCartItems(orderData));
      } else if (selectedTable) {
        fetchTableOrder(selectedTable);
      }
    } catch (err: any) {
      toast.error(`Thêm món thất bại: ${err?.message}`);
    } finally {
      setToppingCopyDialogOpen(false);
      setPendingQuantityChange(null);
    }
  };
  
  // Handle topping copy dialog - cancel
  const handleCancelToppingCopy = () => {
    setToppingCopyDialogOpen(false);
    setPendingQuantityChange(null);
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setIsTakeaway(false);
    setOrderType("dine-in");
    
    // Reset customer state when switching tables
    setSelectedCustomer(null);
    setCustomerSearchCode("");

    // Fetch order if occupied
    if (table.status === 'occupied') {
       fetchTableOrder(table);
    }
  };

  const handleSelectTakeaway = async () => {
    setSelectedTable(null);
    setIsTakeaway(true);
    setOrderType("takeaway");
    setSelectedCustomer(null);
    setCustomerSearchCode("");
    
    // Try to find existing takeaway order
    try {
      const res = await getTakeawayOrder();
      const order = res?.data?.metaData ?? res?.data;
      if (order && order.id) {
        // Restore existing takeaway order
        setTakeawayOrderId(order.id);
        setTakeawayOrderCode(order.orderCode);
        const cartItems = mapOrderToCartItems(order);
        setTakeawayOrders(cartItems);
        console.log("Existing takeaway order found:", order);
        // Set customer if exists
        if (order.customer) {
          setSelectedCustomer(order.customer);
          setCustomerSearchCode(order.customer.name);
        }
      }
    } catch (err: any) {
      // No existing takeaway order found or API error - that's fine
      console.log("No existing takeaway order found");
    }
  };

  const handleOrderTypeChange = (type: "dine-in" | "takeaway" | "delivery") => {
    setOrderType(type);

    if (type === "takeaway") {
      setSelectedTable(null);
      setIsTakeaway(true);
      // Reset customer
      setSelectedCustomer(null);
      setCustomerSearchCode("");
      setTakeawayOrderId(null); // Reset takeaway order ID for new session if needed (customer clears? no, maybe we keep it until pay?)
      // Actually, if we switch mode, we might want to keep it? 
      // User flow: "Mang về" -> Create Order -> Pay -> Done.
      // If user switches away and back, we might lose it if we reset here blindly?
      // Better to reset only if explicitly starting NEW. For now, let's keep it safe. 
      // But typically switching tabs implies new context or viewing.
      // Let's assume switching to Takeaway is just viewing the takeaway tab.
    } else if (type === "delivery") {
      setSelectedTable(null);
      setIsTakeaway(true);
    } else {
      setIsTakeaway(false);
    }
  };

  const handleOpenNoteDialog = (item: CartItem) => {
    setSelectedItemForNote(item);
    setNoteText(item.notes || "");
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (selectedItemForNote) {
      // 1. Update local state
      const cart = getCurrentCart();
      updateCurrentCart(
        cart.map((item) =>
          item.id === selectedItemForNote.id
            ? { ...item, notes: noteText }
            : item
        )
      );

      // 2. If item is already sent (has orderItemId), call API immediately
      if (selectedItemForNote.orderItemId && selectedTable?.order_id) {
          try {
              await updateOrderItem(selectedTable.order_id, selectedItemForNote.orderItemId, { notes: noteText });
              toast.success("Đã lưu ghi chú");
              // Refresh order to ensure sync
              fetchTableOrder(selectedTable);
          } catch (err: any) {
              toast.error(`Lưu ghi chú thất bại: ${err?.message}`);
          }
      }
    }
    setNoteDialogOpen(false);
    setSelectedItemForNote(null);
    setNoteText("");
  };
  
  // Refactored: Open Customization Modal FIRST, do NOT add to cart/API yet
  const addToCart = (product: (typeof products)[0]) => {
    if (isProductOutOfStock(product)) {
        // Find the out of stock ingredient (simplistic logic)
        const ingredients: Record<string, string> = {
          "1": "Cà phê", 
          "2": "Sữa đặc", 
          "6": "Trân châu"
        };
        const ingredient = ingredients[String(product.id)] || "Nguyên liệu";
        
        setOutOfStockItem(product);
        setOutOfStockIngredient(ingredient); 
        setOutOfStockWarningOpen(true);
        return;
    }

    // Check for combo detection
    const suggestion = checkComboDetection(getCurrentCart(), product);
    if (suggestion) {
        setPendingItemToAdd(product);
        setDetectedComboData(suggestion);
        setComboDetectionOpen(true);
        return;
    }

    // Prepare draft item and open customization
    const newItem: CartItem & { isComposite?: boolean } = {
        id: `${product.id}-${Date.now()}`,
        name: product.name,
        price: product.price,
        quantity: 1,
        status: 'pending',
        customization: { sugarLevel: '100%', iceLevel: '100%', toppings: [], note: '' },
        isComposite: product.itemType?.id === 2 || product.itemTypeId === 2 // Check provided type ID
    };
    
    handleOpenCustomizationModal(newItem);
  };

  const handleSendToKitchen = async () => {
    // Determine items to send (pending status)
    const cart = getCurrentCart();
    const itemsToSend = cart.filter(i => !i.status || i.status === 'pending');
    
    // UI feedback context
    const orderInfo = selectedTable ? `Bàn ${selectedTable.name}` : 'Mang về';

    const orderId = isTakeaway ? (takeawayOrderId || undefined) : selectedTable?.order_id;
    if (orderId) {
       toast.promise(
           sendOrderToKitchen(Number(orderId)).then(async () => {
              // Update status of items to preparing locally or just rely on refresh
              updateCurrentCart(
                cart.map((item) =>
                  item.status !== "served" && item.status !== "canceled"
                    ? { ...item, status: "preparing" }
                    : item
                )
              );
               // Refresh from BE to ensure sync
              if (!isTakeaway && selectedTable) {
                 await fetchTableOrder(selectedTable);
              } else if (isTakeaway && takeawayOrderId) {
                 // Refresh takeaway order
                 try {
                     const resOrder = await axiosClient.get(`/orders/${takeawayOrderId}`);
                     const orderData = resOrder?.data?.metaData ?? resOrder?.data;
                     if (orderData) {
                         const newItems = mapOrderToCartItems(orderData);
                         setTakeawayOrders(newItems);
                     }
                 } catch (e) {
                     console.error("Failed to refresh takeaway order", e);
                 }
              }
           }),
           {
               loading: 'Đang gửi bếp...',
               success: `Đã gửi ${itemsToSend.length} món đến quầy pha chế`,
               error: (err) => `Gửi bếp thất bại: ${err?.message || 'Lỗi hệ thống'}`
           }
       );
       // Removed Order History Log
    } else {
        toast.error("Chưa có đơn hàng để gửi bếp (Lỗi: Missing Order ID)");
    }
  };

  // Promotion handlers
  const handleApplyPromoCode = (code?: string) => {
    const codeToApply = code || promoCode.toUpperCase().trim();

    if (!codeToApply) {
      setPromoError("Vui lòng nhập mã khuyến mãi");
      return;
    }

    // Mock promotion logic
    const promotions: {
      [key: string]: { discount: number; description: string };
    } = {
      KM10: { discount: 0.1, description: "Giảm 10% hóa đơn" },
      GIAMCF: { discount: 5000, description: "Giảm 5.000đ Cà phê" },
      HAPPYHOUR: { discount: 0.2, description: "Happy Hour - Giảm 20%" },
    };

    if (promotions[codeToApply]) {
      const promo = promotions[codeToApply];
      const cart = getCurrentCart();
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      let calculatedDiscount = 0;
      if (promo.discount < 1) {
        // Percentage discount
        calculatedDiscount = subtotal * promo.discount;
      } else {
        // Fixed amount discount
        calculatedDiscount = promo.discount;
      }

      setAppliedPromoCode(codeToApply);
      setDiscountAmount(calculatedDiscount);
      setPromoError("");
      setPromoCode("");
      setPromotionModalOpen(false);
      toast.success(`✓ Đã áp dụng ${codeToApply} - ${promo.description}`);
    } else {
      setPromoError("❌ Mã không hợp lệ hoặc không áp dụng.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode("");
    setDiscountAmount(0);
    setPromoCode("");
    setPromoError("");
    setSelectedPromotion(null);
    setUsedPoints(0);
    toast.success("Đã xóa khuyến mãi");
  };

  // New handler for PromotionPopup
  const handleApplyPromotion = (
    promotion: any,
    pointsToUse?: number,
    customer?: any
  ) => {
    setSelectedPromotion(promotion);
    setUsedPoints(pointsToUse || 0);

    if (promotion) {
      const cart = getCurrentCart();
      const orderTotal = cart.reduce(
        (sum, item) => sum + getItemPrice(item) * item.quantity,
        0
      );

      // Helper: determine if a cart item is applicable under promotion scopes
      const isItemApplicable = (item: CartItem) => {
        const product = products.find((p) => String(p.id) === String(item.id));
        const categoryId = product?.category;

        const applyToAllItems = Boolean(promotion.applyToAllItems);
        const applyToAllCategories = Boolean(promotion.applyToAllCategories);
        const applyToAllCombos = Boolean(promotion.applyToAllCombos);
        const applicableItemIds: string[] = (promotion.applicableItemIds || []).map((x: any) => String(x));
        const applicableCategoryIds: string[] = (promotion.applicableCategoryIds || []).map((x: any) => String(x));
        const applicableComboIds: string[] = (promotion.applicableComboIds || []).map((x: any) => String(x));

        // Combos are separate entity: only include when explicitly allowed
        if (item.isCombo) {
          if (applyToAllCombos) return true;
          if (applicableComboIds.length > 0 && item.comboId) {
            return applicableComboIds.includes(String(item.comboId));
          }
          // If neither flag nor ids provided, combos are not applicable
          return false;
        }

        // Items scope
        if (applyToAllItems || applyToAllCategories) return true;
        if (applicableItemIds.length === 0 && applicableCategoryIds.length === 0) {
          // No explicit scope provided → treat as not applicable (backend should enforce at least one)
          return false;
        }
        if (applicableItemIds.includes(String(item.id))) return true;
        if (categoryId && applicableCategoryIds.includes(String(categoryId))) return true;
        return false;
      };

      // Build applicable items list (exclude attached toppings which already merge into parent price)
      const applicableItems = cart.filter((i) => !i.parentItemId && isItemApplicable(i));
      const applicableSubtotal = applicableItems.reduce(
        (sum, i) => sum + getItemPrice(i) * i.quantity,
        0
      );
      const totalApplicableQty = applicableItems.reduce((sum, i) => sum + i.quantity, 0);

      // Respect minOrderValue on total order
      if (promotion.minOrderValue && orderTotal < Number(promotion.minOrderValue)) {
        setAppliedPromoCode(promotion.code);
        setDiscountAmount((pointsToUse || 0) * 10);
        return;
      }

      let calculatedDiscount = 0;

      // Percentage (typeId=1)
      if (promotion.type === "percentage") {
        calculatedDiscount = (applicableSubtotal * Number(promotion.value)) / 100;
        if (promotion.maxDiscount != null) {
          calculatedDiscount = Math.min(calculatedDiscount, Number(promotion.maxDiscount));
        }
        calculatedDiscount = Math.min(calculatedDiscount, applicableSubtotal);
      }
      // Fixed amount (typeId=2)
      else if (promotion.type === "fixed") {
        calculatedDiscount = Math.min(Number(promotion.value), applicableSubtotal);
      }
      // Fixed price (typeId=3)
      else if (promotion.type === "fixed_price") {
        const finalPrice = Number(promotion.value) * totalApplicableQty;
        calculatedDiscount = Math.max(0, applicableSubtotal - finalPrice);
      }
      // Gift (typeId=4)
      else if (promotion.type === "gift") {
        const buyQ = Number(promotion.buyQuantity) || 0;
        const getQ = Number(promotion.getQuantity) || 0;
        const requireSame = Boolean(promotion.requireSameItem);

        let giftCount = 0;

        if (buyQ > 0 && getQ > 0) {
          if (requireSame) {
            // Sum gifts per item
            giftCount = applicableItems.reduce((sum, i) => sum + Math.floor(i.quantity / buyQ) * getQ, 0);
          } else {
            const totalQty = totalApplicableQty;
            giftCount = Math.floor(totalQty / buyQ) * getQ;
          }
        } else if (getQ > 0) {
          // Mode A: only minOrderValue + getQuantity
          giftCount = getQ;
        }

        if (giftCount > 0) {
          // Build unit price list of applicable items (repeat by quantity), sort ascending
          const unitPrices: number[] = [];
          applicableItems.forEach((i) => {
            const unitPrice = getItemPrice(i); // price per unit includes customization
            for (let q = 0; q < i.quantity; q++) unitPrices.push(unitPrice);
          });
          unitPrices.sort((a, b) => a - b);
          const take = Math.min(giftCount, unitPrices.length);
          calculatedDiscount = unitPrices.slice(0, take).reduce((s, p) => s + p, 0);
        }
        calculatedDiscount = Math.min(calculatedDiscount, applicableSubtotal);
      }
      // Backward compatibility: category-based item discount
      else if (promotion.type === "item" && Array.isArray(promotion.applicableCategories)) {
        applicableItems.forEach((item) => {
          const product = products.find((p) => String(p.id) === String(item.id));
          const categoryId = product?.category;
          if (categoryId && promotion.applicableCategories.includes(categoryId)) {
            calculatedDiscount += Math.min(
              Number(promotion.value) * item.quantity,
              getItemPrice(item) * item.quantity
            );
          }
        });
      }

      // Add points discount
      const pointsDiscount = (pointsToUse || 0) * 10; // 1 point = 10đ
      const totalDiscount = calculatedDiscount + pointsDiscount;

      setAppliedPromoCode(promotion.code);
      setDiscountAmount(totalDiscount);
    }
  };

  // Out of stock handlers
  const handleCancelItem = () => {
    if (!outOfStockItem) return;

    const cart = getCurrentCart();
    updateCurrentCart(
      cart.map((item) =>
        item.id === outOfStockItem.id
          ? {
              ...item,
              status: "canceled" as const,
              outOfStockReason: outOfStockIngredient,
            }
          : item
      )
    );

    // Add to order history


    toast.error(`Đã hủy món ${outOfStockItem.name}`);
    setOutOfStockWarningOpen(false);
  };

  const handleWaitIngredient = () => {
    if (!outOfStockItem) return;

    const cart = getCurrentCart();
    updateCurrentCart(
      cart.map((item) =>
        item.id === outOfStockItem.id
          ? {
              ...item,
              status: "waiting-ingredient" as const,
              outOfStockReason: outOfStockIngredient,
            }
          : item
      )
    );



    toast.info(`Món ${outOfStockItem.name} đang đợi nguyên liệu`);
    setOutOfStockWarningOpen(false);
  };

  const handleNotifyWaiter = () => {
    if (!outOfStockItem) return;

    toast.success("Đã thông báo cho nhân viên phục vụ", {
      description: `Món ${outOfStockItem.name} hết nguyên liệu ${outOfStockIngredient}`,
    });


  };

  const handleOpenReplaceModal = () => {
    setReplaceItemModalOpen(true);
  };

  const handleReplaceItem = (newProduct: (typeof products)[0]) => {
    if (!outOfStockItem) return;

    const cart = getCurrentCart();
    updateCurrentCart(
      cart.map((item) =>
        item.id === outOfStockItem.id
          ? {
              ...newProduct,
              quantity: outOfStockItem.quantity,
              status: "replaced" as const,
              replacedFrom: outOfStockItem.name,
              notes: outOfStockItem.notes,
            }
          : item
      )
    );



    toast.success(
      `Đã thay thế món ${outOfStockItem.name} bằng ${newProduct.name}`
    );
    setReplaceItemModalOpen(false);
    setOutOfStockWarningOpen(false);
  };

  // Removed: handler for submitting new item requests

  // State for available toppings for the selected item
  const [currentAvailableToppings, setCurrentAvailableToppings] = useState<any[]>(toppings);

  const handleOpenCustomizationModal = async (item: CartItem) => {
    // Determine if we should fetch specific toppings
    // itemId might be "productID-timestamp"
    const productId = item.id.split('-')[0];
    
    // Try to fetch item details for toppings
    try {
        const res = await getItemById(productId);
        const itemData = res?.data?.metaData ?? res?.data;
        if (itemData?.availableToppings && itemData.availableToppings.length > 0) {
            // Map to Topping interface
            const specificToppings = itemData.availableToppings.map((t: any) => ({
                id: String(t.topping.id),
                name: t.topping.name,
                price: Number(t.topping.sellingPrice || 0)
            }));
            setCurrentAvailableToppings(specificToppings);
        } else {
            // Fallback to global toppings if none specific (or maybe empty?)
            // User requested: "response nó có availableToppings á, thì dùng các toppings đó thôi"
            // So default to empty if specific provided but empty? Or fallback to all?
            // Let's fallback to global if fetching failed or empty, OR just empty?
            // Based on user request "thì dùng các toppings đó thôi", implies STRICT subset.
            // If itemData exists but no toppings, then NO toppings.
            if (itemData) {
                 setCurrentAvailableToppings([]);
            } else {
                 setCurrentAvailableToppings(toppings);
            }
        }
        
        // Determine isComposite from itemData
        // itemTypeId: 1=ready_made, 2=composite, 3=ingredient
        const isComposite = itemData?.itemTypeId === 2 || itemData?.itemType?.id === 2;
        
        // Update item with isComposite flag before setting state
        // We need to cast or ensure CartItem has this prop. 
        // We will extend the object locally.
        const itemWithFlag = { ...item, isComposite };
        setSelectedItemForCustomization(itemWithFlag);

    } catch (err) {
        console.error("Failed to fetch item details", err);
        setCurrentAvailableToppings(toppings); // Fallback on error
        setSelectedItemForCustomization(item);
    }

    setCustomizationModalOpen(true);
  };

  const handleUpdateCustomization = async (customization: ItemCustomization) => {
    if (!selectedItemForCustomization) return;

    const cart = getCurrentCart();

    // Helper function to check if two customizations are equal
    const isCustomizationEqual = (
      c1?: ItemCustomization,
      c2?: ItemCustomization
    ) => {
      if (!c1 && !c2) return true;
      if (!c1 || !c2) return false;

      const toppingsEqual =
        c1.toppings.length === c2.toppings.length &&
        c1.toppings.every((t1) =>
          c2.toppings.some((t2) => t2.name === t1.name && t2.price === t1.price)
        );

      return (
        c1.sugarLevel === c2.sugarLevel &&
        c1.iceLevel === c2.iceLevel &&
        toppingsEqual &&
        c1.note === c2.note
      );
    };

    // Calculate if changed
    const hasCustomizationChanged = !isCustomizationEqual(
      selectedItemForCustomization.customization,
      customization
    );

    // Prepare the final item
    const finalItem: CartItem = {
      ...selectedItemForCustomization,
      customization,
      notes: customization.note || selectedItemForCustomization.notes,
    };

    // --- API INTEGRATION ---
    // --- API INTEGRATION ---
    // Handle Dine-in (Table)
    if (!isTakeaway && selectedTable) {
         let currentOrderId = selectedTable.order_id;

         try {
             // If no existing order, create one first
             if (!currentOrderId) {
                 const res = await createOrder({ tableId: selectedTable.id, items: [] });
                 const newOrder = res?.data?.metaData ?? res?.data;
                 currentOrderId = newOrder.id;
                 
                 // Ideally update selectedTable state immediately so next item knows
                 setSelectedTable(prev => prev ? { ...prev, order_id: currentOrderId, currentOrder: newOrder.orderCode, status: 'occupied' } : null);
                 // Refresh tables to show occupied status
                 await refreshTables();
             }

             if (currentOrderId) {
                 const notes = finalItem.notes || '';
                 const attachedToppings = finalItem.customization?.toppings?.map((t) => ({
                     itemId: Number(t.id),
                     quantity: t.quantity
                 })) || [];
                 
                 if (finalItem.orderItemId) {
                     // CASE 1: EDITING EXISTING SENT ITEM -> UPDATE
                     await updateOrderItem(currentOrderId, finalItem.orderItemId, {
                         notes: notes,
                        customization: stripToppingsFromCustomization(finalItem.customization),
                         attachedToppings: attachedToppings
                     });
                     toast.success("Đã cập nhật món");
                 } else {
                     // CASE 2: ADDING NEW ITEM -> ADD
                     await addOrderItem(currentOrderId, {
                        itemId: Number(finalItem.id.split('-')[0]),
                        quantity: finalItem.quantity,
                        notes: notes,
                        customization: stripToppingsFromCustomization(finalItem.customization),
                        attachedToppings: attachedToppings
                     });
                     toast.success("Đã thêm món vào đơn");
                 }
                 // Refresh Order
                 await fetchTableOrder({ ...selectedTable, id: selectedTable.id }); // Pass ID to ensure sync
             }
         } catch (err: any) {
             toast.error(`Lỗi tạo/cập nhật đơn: ${err?.message}`);
         }
         
         // Close modal
         setCustomizationModalOpen(false);
         setSelectedItemForCustomization(null);
         return; 
    }


    // --- LOCAL FALLBACK (Takeaway or No Order ID) ---
    // User Requirement: "rồi nếu chọn mang về, lúc thêm món lần đầu thì cũng gọi api create order để cho nó có order"
    
    // Check if Takeaway and NO OrderID yet -> Create Order First
    if (isTakeaway) {
        let currentOrderId = takeawayOrderId;

        try {
            if (!currentOrderId) {
                // Must create order first
                // Use a default tableId=null or similar for takeaway (backend expects tableId? DTO says tableId number...)
                // If backend requires tableId, we might need a dummy "Takeaway Table" or null if allowed.
                // Re-reading user request: "tableId là null thôi" -> OK.
                const res = await createOrder({ tableId: null as any, items: [] });
                const newOrder = res?.data?.metaData ?? res?.data;
                currentOrderId = newOrder.id;
                setTakeawayOrderId(currentOrderId);
                setTakeawayOrderCode(newOrder.orderCode);
            }

            if (currentOrderId) {
                 // Now we have an ID, call addOrderItem/updateOrderItem like Dine-in
                 // Logic here is identical to Dine-In block above.
                 const notes = finalItem.notes || '';
                 const attachedToppings = finalItem.customization?.toppings?.map((t) => ({
                     itemId: Number(t.id),
                     quantity: t.quantity
                 })) || [];

                 if (finalItem.orderItemId) {
                     // UPDATE
                     await updateOrderItem(currentOrderId, finalItem.orderItemId, {
                         notes: notes,
                        customization: stripToppingsFromCustomization(finalItem.customization),
                         attachedToppings: attachedToppings
                     });
                     toast.success("Đã cập nhật món (Mang về)");
                 } else {
                     // ADD
                     await addOrderItem(currentOrderId, {
                        itemId: Number(finalItem.id.split('-')[0]),
                        quantity: finalItem.quantity,
                        notes: notes,
                        customization: stripToppingsFromCustomization(finalItem.customization),
                        attachedToppings: attachedToppings
                     });
                     toast.success("Đã thêm món (Mang về)");
                 }
                 
                 // Fetch updated order from backend to sync
                 const resOrder = await axiosClient.get(`/orders/${currentOrderId}`); // Manual fetch helper since fetchTableOrder uses table
                 const orderData = resOrder?.data?.metaData ?? resOrder?.data;
                 if (orderData) {
                     const newItems = mapOrderToCartItems(orderData);
                     setTakeawayOrders(newItems);
                     // Also update generic order info if needed (code)
                 }

                 setCustomizationModalOpen(false);
                 setSelectedItemForCustomization(null);
                 return;
            }

        } catch (err: any) {
            console.error(err);
             toast.error(`Lỗi tạo đơn mang về: ${err?.message}`);
             // If failed, maybe fall through to local? Or stop? 
             // Stop to avoid inconsistency.
             return;
        }
    }

    // Legacy Local Only (Should not be reached for Takeaway anymore if API succeeds) or other undefined states
    // ... (Keep existing local logic for fallback or Delivery) but only if NOT Takeaway
    
    // Check if we can merge with an existing PENDING item
    let updatedCart = [...cart];
    // We only merge with 'pending' (local) items. Sent items cannot be merged into locally.
    const existingItemIndex = cart.findIndex(item => 
        item.status === 'pending' &&
        item.id !== finalItem.id && // Don't match self
        item.id.split('-')[0] === finalItem.id.split('-')[0] && // Same product (base ID)
        isCustomizationEqual(item.customization, customization) // Same customization
    );

    if (existingItemIndex !== -1) {
         // MERGE
         updatedCart[existingItemIndex] = {
             ...updatedCart[existingItemIndex],
             quantity: updatedCart[existingItemIndex].quantity + finalItem.quantity
         };
         if (cart.some(i => i.id === finalItem.id)) {
             updatedCart = updatedCart.filter(i => i.id !== finalItem.id);
         }
         toast.success("Đã gộp vào món đang chờ (x" + finalItem.quantity + ")");
    } else {
         // NO MERGE
         if (cart.some(i => i.id === finalItem.id)) {
             updatedCart = updatedCart.map(item => item.id === finalItem.id ? finalItem : item);
         } else {
             updatedCart.push(finalItem);
         }
    }

    updateCurrentCart(updatedCart);
    setCustomizationModalOpen(false);
    setSelectedItemForCustomization(null);
  };





  // Helper function to get compatible items from cart for topping attachment
  const getCompatibleItemsForTopping = (
    topping: Topping
  ): CartItem[] => {
    const cart = getCurrentCart();
    return cart.filter((item) => {
      // Only show main items (not toppings, not combos)
      if (item.isTopping || item.isCombo || item.parentItemId) return false;
      // If needed, restrict by category; by default allow attaching to all main items
      return true;
    });
  };

  // Helper function to attach topping to item
  const attachToppingToItem = (
    parentItemId: string,
    topping: Topping,
    quantity: number
  ) => {
    const cart = getCurrentCart();

    // Create topping item
    const toppingItem: CartItem = {
      id: `${topping.id}-attached-${Date.now()}`,
      name: topping.name,
      price: topping.price,
      quantity,
      status: "pending",
      isTopping: true,
      parentItemId,
      basePrice: topping.price,
    };

    // Update cart to add topping as attached to parent
    const updatedCart = cart.map((item) => {
      if (item.id === parentItemId) {
        return {
          ...item,
          attachedToppings: [...(item.attachedToppings || []), toppingItem],
        };
      }
      return item;
    });

    updateCurrentCart(updatedCart);
    setIsKitchenUpdateNeeded(true); // Enable send to kitchen button
    toast.success(
      `Đã thêm ${quantity} x ${topping.name} vào ${
        cart.find((i) => i.id === parentItemId)?.name
      }`
    );
  };

  // Helper function to remove attached topping
  const removeAttachedTopping = (parentItemId: string, toppingId: string) => {
    const cart = getCurrentCart();
    const parentItem = cart.find(i => i.id === parentItemId);
    const topping = parentItem?.attachedToppings?.find(t => t.id === toppingId);
    
    if (!parentItem || !topping) {
      toast.error("Không tìm thấy topping");
      return;
    }
    
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    
    // If topping has orderItemId (saved to DB), need to call API
    if (topping.orderItemId && currentOrderId) {
      const isPending = !topping.status || topping.status === 'pending';
      
      if (isPending) {
        // Pending: remove permanently
        (async () => {
          try {
            if (!topping.orderItemId) return;
            await removeOrderItem(currentOrderId, topping.orderItemId as number);
            toast.success("Đã xóa topping");
            
            // Refresh order data
            if (isTakeaway && takeawayOrderId) {
              const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
              const orderData = res?.data?.metaData ?? res?.data;
              if (orderData) {
                setTakeawayOrders(mapOrderToCartItems(orderData));
              }
            } else if (selectedTable) {
              fetchTableOrder(selectedTable);
            }
          } catch (err: any) {
            toast.error(`Xóa topping thất bại: ${err?.message}`);
          }
        })();
      } else {
        // Sent: show cancel modal
        setToppingToCancel({ parentItemId, topping });
        setCancelToppingQuantity(topping.quantity);
        setCancelToppingReason("");
        setOtherToppingReason("");
        setCancelToppingModalOpen(true);
      }
    } else {
      // Local only: just update cart
      const updatedCart = cart.map((item) => {
        if (item.id === parentItemId && item.attachedToppings) {
          return {
            ...item,
            attachedToppings: item.attachedToppings.filter(
              (t) => t.id !== toppingId
            ),
          };
        }
        return item;
      });
      updateCurrentCart(updatedCart);
      toast.success("Đã xóa topping");
    }
  };
  
  // Handle confirm cancel topping
  const handleConfirmCancelTopping = async () => {
    if (!toppingToCancel || !cancelToppingReason || (cancelToppingReason === "Khác" && !otherToppingReason.trim())) {
      return;
    }
    
    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
    if (!currentOrderId || !toppingToCancel.topping.orderItemId) return;
    
    try {
      const finalReason = cancelToppingReason === "Khác" ? otherToppingReason : cancelToppingReason;
      
      await deleteOrderItem(currentOrderId, toppingToCancel.topping.orderItemId, {
        quantity: cancelToppingQuantity,
        reason: finalReason
      });
      
      toast.success("Đã hủy topping");
      
      // Refresh order data
      if (isTakeaway && takeawayOrderId) {
        const res = await axiosClient.get(`/orders/${takeawayOrderId}`);
        const orderData = res?.data?.metaData ?? res?.data;
        if (orderData) {
          setTakeawayOrders(mapOrderToCartItems(orderData));
        }
      } else if (selectedTable) {
        fetchTableOrder(selectedTable);
      }
      
      // Reset modal
      setCancelToppingModalOpen(false);
      setToppingToCancel(null);
      setCancelToppingQuantity(1);
      setCancelToppingReason("");
      setOtherToppingReason("");
    } catch (err: any) {
      toast.error(`Hủy topping thất bại: ${err?.message}`);
    }
  };

  // Helper to strip toppings from customization (toppings are sent via attachedToppings)
  const stripToppingsFromCustomization = (customization: any) => {
    if (!customization) return undefined;
    const { toppings, ...rest } = customization;
    return Object.keys(rest).length > 0 ? rest : undefined;
  };

  // Helper function to calculate item price with customization and attached toppings
  const getItemPrice = (item: CartItem): number => {
    // Coerce base price to number to prevent string concatenation (e.g., "42000" + 8000)
    const basePrice = Number(item.price) || 0;
    // Extra price for combo items (upgrade fee) - already included in backend unitPrice but adding for safety
    const extraPrice = Number(item.extraPrice) || 0;
    const customizationToppingsPrice =
      item.customization?.toppings?.reduce(
        (sum, t) => sum + (Number(t.price) || 0) * (t.quantity ?? 1),
        0
      ) || 0;
    const attachedToppingsPrice =
      item.attachedToppings?.reduce(
        (sum, t) => sum + (Number(t.price) || 0) * t.quantity,
        0
      ) || 0;
    return basePrice + extraPrice + customizationToppingsPrice + attachedToppingsPrice;
  };

  const cart = getCurrentCart();
  const localTotalAmount = cart.reduce((sum, item) => {
    // Skip attached toppings - they're included in parent price
    if (item.parentItemId) return sum;
    return sum + getItemPrice(item) * item.quantity;
  }, 0);
  const totalItems = cart.reduce((sum, item) => {
    // Skip attached toppings - they don't count as separate items
    if (item.parentItemId) return sum;
    return sum + item.quantity;
  }, 0);

  // Decide display totals: prefer backend values when available
  const displaySubtotal = orderSubtotal > 0 ? orderSubtotal : localTotalAmount;
  const displayTotalAmount = orderTotalAmount > 0 ? orderTotalAmount : localTotalAmount;

  const getTableStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "border-emerald-500 hover:shadow-lg hover:border-emerald-600";
      case "occupied":
        return "border-red-500 bg-red-50";
    }
  };

  const getTableStatusBadge = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-emerald-500 text-white text-xs">Trống</Badge>
        );
      case "occupied":
        return (
          <Badge className="bg-red-500 text-white text-xs">Có khách</Badge>
        );
    }
  };

  const getElapsedTime = (startTime?: number) => {
    if (!startTime) return "";
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    return `${elapsed} phút`;
  };

  const getItemStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-slate-400 text-white text-xs">
            Chưa gửi bếp
          </Badge>
        );
      case "preparing":
        return (
          <Badge className="bg-blue-500 text-white text-xs flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Đang chế biến
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Đã xong / Chờ phục vụ
          </Badge>
        );
      case "served":
        return (
          <Badge className="bg-emerald-700 text-white text-xs">
            Đã phục vụ
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 border-red-300 text-red-700 text-xs flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            Hết nguyên liệu – Chờ xử lý
          </Badge>
        );
      case "waiting-ingredient":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 border-amber-300 text-amber-700 text-xs flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            Đang đợi nguyên liệu
          </Badge>
        );
      case "canceled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 border-gray-300 text-gray-700 text-xs flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Đã hủy (hết nguyên liệu)
          </Badge>
        );
      case "replaced":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 border-blue-300 text-blue-700 text-xs flex items-center gap-1"
          >
            <ArrowLeftRight className="w-3 h-3" />
            Đã thay thế món
          </Badge>
        );
      default:
        return null;
    }
  };

  // Ready items advance functions (for waiter tab)
  // servedQuantity decreases when serving (completedQuantity stays fixed for display)


  // Refactored Cart Panel Content
  const renderCartPanel = (isMobile = false) => {
    if (isMobile && !isCartOpen) {
      // Don't render mobile cart when closed to avoid any display issues
      return null;
    }
    
    return (
      <div
        className={
          isMobile
            ? "bg-white border-l shadow-lg flex flex-col h-full fixed inset-0 z-50 transition-transform duration-300 lg:hidden translate-y-0"
            : "bg-white border-l shadow-lg flex flex-col h-full hidden lg:flex lg:flex-none lg:w-[500px] xl:w-[600px]"
        }
      >
      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100 ">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-8 w-8 -ml-1 mr-1 text-slate-500"
                onClick={() => setIsCartOpen(false)}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
            )}
            <h2 className="text-blue-900 text-base">Đơn hàng</h2>
            {(selectedTable?.currentOrder || (isTakeaway && takeawayOrderCode)) && (
              <Badge
                variant="secondary"
                className="bg-blue-600 text-white text-xs"
              >
                {selectedTable?.currentOrder || takeawayOrderCode}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Removed: request notification icon for new item requests */}
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">
              <ShoppingCart className="w-3 h-3 mr-1" />
              {totalItems}
            </Badge>
          </div>
        </div>

        {isTakeaway ? (
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
            <Package className="w-3 h-3" />
            <span>Mang đi</span>
          </div>
        ) : selectedTable ? (
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
              <span>
                Bàn {selectedTable.name} – {selectedTable.capacity} chỗ
              </span>
            </div>
          </div>
        ) : (
             !isTakeaway && <p className="text-xs text-slate-500">Chưa chọn bàn</p>
        )}

        {(selectedTable || isTakeaway) && (
            /* Order Actions & Customer Autocomplete - Same Row */
            <div className="flex gap-2 items-end mt-1">
              {/* Order Actions - Only for Tables usually, but maybe for Takeaway too? 
                  Move/Merge/Split unlikely for Takeaway. So keep conditional if needed.
              */}
              {selectedTable && (
                  <div className="flex gap-1 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-1.5 p-0"
                      title="Chuyển bàn"
                      onClick={() => setMoveTableOpen(true)}
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-1.5 p-0"
                      title="Gộp bàn"
                      onClick={() => setMergeTableOpen(true)}
                    >
                      <GitMerge className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-1.5 p-0"
                      title="Tách đơn"
                      onClick={() => setSplitOrderOpen(true)}
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                  </div>
              )}

              {/* Customer Autocomplete */}
              <div className="flex-1">
                <CustomerAutocomplete
                  customers={customers}
                  value={customerSearchCode}
                  onChange={(code, customer) => {
                    // If customer is selected, show Name. Else show Code (typing)
                    if (customer) {
                        setCustomerSearchCode(customer.name);
                    } else {
                        setCustomerSearchCode(code);
                    }
                    
                    if (customer) {
                      setSelectedCustomer(customer);
                      
                      const orderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
                      if (orderId) {
                         // Attach customer to order in backend
                         updateOrder(orderId, { customerId: customer.id })
                           .then(() => toast.success(`Đã gắn khách: ${customer.name}`))
                           .catch((err: any) => toast.error("Lỗi gắn khách hàng", { description: err.message }));
                      }
                    } else if (code === "" && selectedTable?.order_id) {
                         // Handle clear customer?
                    }
                  }}
                  onAddNew={(newCustomer) => {
                    setSelectedCustomer(newCustomer);
                    setCustomerSearchCode(newCustomer.code);
                    
                    const orderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;
                    if (orderId) {
                       updateOrder(orderId, { customerId: newCustomer.id })
                           .then(() => toast.success(`Đã gắn khách mới: ${newCustomer.name}`))
                           .catch((err: any) => toast.error("Lỗi gắn khách hàng", { description: err.message }));
                    }
                  }}
                />
              </div>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Chưa có món nào</p>
            <p className="text-xs text-slate-400 mt-1">
              {!selectedTable && !isTakeaway
                ? "Vui lòng chọn bàn hoặc mang đi"
                : "Chọn món từ thực đơn"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Combo Suggestion Banner - will add later */}

            {(() => {
              // Group items: combo items grouped by comboInstanceId (or comboId fallback), non-combo items separate
              const comboGroups = new Map<string, typeof cart>();
              const nonComboItems: typeof cart = [];
              
              cart.forEach(item => {
                if (item.parentItemId) return; // Skip toppings
                
                if (item.comboId || item.comboInstanceId) {
                  // Use comboInstanceId if available, otherwise fallback to comboId
                  const key = item.comboInstanceId || `combo-${item.comboId}-fallback`;
                  const existing = comboGroups.get(key) || [];
                  existing.push(item);
                  comboGroups.set(key, existing);
                } else {
                  nonComboItems.push(item);
                }
              });

              // Count combo types for displaying "2x Combo..." 
              // Group instances by comboId to count identical combos
              const comboIdToInstances = new Map<string | number, string[]>();
              comboGroups.forEach((items, instanceId) => {
                const comboId = items[0]?.comboId;
                if (comboId) {
                  const existing = comboIdToInstances.get(comboId) || [];
                  existing.push(instanceId);
                  comboIdToInstances.set(comboId, existing);
                }
              });

              return (
                <>
                  {/* Render Combo Groups - Aggregate identical combos */}
                  {Array.from(comboIdToInstances.entries()).map(([comboId, instanceIds]) => {
                    // Get all items from all instances of this comboId
                    const allComboItems: typeof cart = [];
                    instanceIds.forEach(instanceId => {
                      const items = comboGroups.get(instanceId) || [];
                      allComboItems.push(...items);
                    });
                    
                    if (allComboItems.length === 0) return null;
                    
                    // Get combo info from first item
                    const firstItem = allComboItems[0];
                    const baseComboName = firstItem?.comboName || `Combo #${comboId}`;
                    // Count instances of this combo type
                    const instanceCount = instanceIds.length;
                    // Display with count prefix if multiple instances
                    const comboName = instanceCount > 1 ? `${instanceCount}x ${baseComboName}` : baseComboName;
                    
                    // Calculate combo price: base price per instance + total extra prices from all items
                    const baseComboPrice = firstItem?.comboPrice ?? 0;
                    const totalExtraPrice = allComboItems.reduce((sum, i) => sum + (Number(i.extraPrice) || 0), 0);
                    // Total price = (base price * instance count) + total extra prices
                    const comboPrice = (baseComboPrice * instanceCount) + totalExtraPrice;
                    
                    // Group items by instance for rendering (to allow individual instance deletion)
                    const itemsByInstance = new Map<string, typeof cart>();
                    instanceIds.forEach(instanceId => {
                      const items = comboGroups.get(instanceId) || [];
                      itemsByInstance.set(instanceId, items);
                    });
                    
                    return (
                      <Card key={`combo-aggregated-${comboId}`} className="border-green-300 bg-green-50/50">
                        <CardContent className="p-3">
                          {/* Combo Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-800">
                                {comboName}
                              </span>
                              <Badge className="bg-green-500 text-xs">
                                {allComboItems.length} món
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-green-700">
                                {comboPrice.toLocaleString()}đ
                              </span>
                              {/* Show delete button for entire combo if single instance, or if user wants to delete all */}
                              {instanceCount === 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 ml-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleRemoveCombo(instanceIds[0], itemsByInstance.get(instanceIds[0]))}
                                  title="Xóa combo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Render each instance's items */}
                          {Array.from(itemsByInstance.entries()).map(([comboInstanceId, comboItems]) => {
                            // Calculate price for this specific instance
                            const instanceBasePrice = comboItems[0]?.comboPrice ?? 0;
                            const instanceExtraPrice = comboItems.reduce((sum, i) => sum + (Number(i.extraPrice) || 0), 0);
                            const instancePrice = instanceBasePrice + instanceExtraPrice;
                            
                            return (
                              <div key={`combo-instance-${comboInstanceId}`} className="mb-3 last:mb-0">
                                {/* Instance header with delete button (only show if multiple instances) */}
                                {instanceCount > 1 && (
                                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-green-200">
                                    <span className="text-xs text-green-600 font-medium">
                                      Combo #{instanceIds.indexOf(comboInstanceId) + 1}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => handleRemoveCombo(comboInstanceId, comboItems)}
                                      title="Xóa combo này"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Combo Items for this instance */}
                                <div className="space-y-2 ml-4 border-l-2 border-green-300 pl-3">
                            {comboItems.map(item => {
                              // Determine status display
                              const isPending = !item.status || item.status === 'pending';
                              const statusColor = item.status === 'completed' ? 'bg-green-100 text-green-700' 
                                : item.status === 'preparing' ? 'bg-yellow-100 text-yellow-700'
                                : item.status === 'served' ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600';
                              const statusLabel = item.status === 'completed' ? 'Xong' 
                                : item.status === 'preparing' ? 'Đang làm'
                                : item.status === 'served' ? 'Đã phục vụ'
                                : 'Chờ báo';
                              
                              return (
                                <div key={item.id} className="py-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                                      <span className="text-sm text-slate-700">
                                        {item.quantity}x {item.name}
                                      </span>
                                      {/* Extra Price Badge for combo items */}
                                      {(item.extraPrice ?? 0) > 0 && (
                                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                                          +{item.extraPrice?.toLocaleString()}đ
                                        </Badge>
                                      )}
                                      {/* Status Badge */}
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor}`}>
                                        {statusLabel}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {/* Settings button - disabled if not pending or is topping */}
                                      {!item.isTopping && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => handleOpenCustomizationModal(item)}
                                          title={isPending ? "Tùy chỉnh" : "Không thể chỉnh sửa sau khi báo bếp"}
                                          disabled={!isPending}
                                        >
                                          <Settings className={`w-3 h-3 ${!isPending ? 'text-slate-300' : ''}`} />
                                        </Button>
                                      )}
                                      {/* Trash button for individual combo items */}
                                      {!item.isTopping && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                          onClick={() => handleRemoveComboItem(item)}
                                          title={isPending ? "Xóa món" : "Hủy món"}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  {/* Customization info */}
                                  {item.customization && (
                                    <div className="text-xs text-slate-500 ml-4">
                                      Đường: {item.customization.sugarLevel}, Đá: {item.customization.iceLevel}
                                    </div>
                                  )}
                                  {/* Attached Toppings */}
                                  {item.attachedToppings && item.attachedToppings.length > 0 && (
                                    <div className="text-xs text-slate-500 ml-4 mt-0.5">
                                      Topping: {item.attachedToppings.map(t => `${t.name} x${t.quantity || 1}`).join(', ')}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Render Non-Combo Items */}
                  {nonComboItems.map((item) => (
                    <div key={item.id}>
                      {/* Main Item */}
                      <CartItemDisplay
                        item={item}
                        onUpdateQuantity={(id, change, reason) => {
                             const targetItem = cart.find(i => i.id === id);
                             if (targetItem) {
                                 updateQuantity(id, targetItem.quantity + change, reason);
                             }
                        }}
                        onRemove={(id, reason) => removeFromCart(id, reason)}
                        onCustomize={handleOpenCustomizationModal}
                        onAddNote={handleOpenNoteDialog}
                        onToggleComboExpansion={toggleComboExpansion}
                        onCustomizeComboItem={handleCustomizeComboItem}
                        getItemStatusBadge={getItemStatusBadge}
                        restockedItems={restockedItems}
                        glowingItems={glowingItems}
                        appliedPromoCode={appliedPromoCode}
                      />

                      {/* Attached Toppings - Indented */}
                      {item.attachedToppings &&
                        item.attachedToppings.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-amber-200 pl-3">
                            {item.attachedToppings.map((topping) => (
                              <div
                                key={topping.id}
                                className="bg-amber-50 rounded border border-amber-200 p-2 flex items-center justify-between gap-2"
                              >
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-slate-900">
                                    + {topping.name}
                                  </p>
                                  <p className="text-xs text-amber-700">
                                    {topping.quantity} x{" "}
                                    {topping.price.toLocaleString("vi-VN")}đ ={" "}
                                    {(
                                      topping.quantity * topping.price
                                    ).toLocaleString("vi-VN")}
                                    đ
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                                    onClick={() =>
                                      removeAttachedTopping(item.id, topping.id)
                                    }
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>

      <Separator className="shadow-sm" />

      <div className="p-3 space-y-2 bg-gradient-to-r from-blue-50 to-blue-100">
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
          </div>
          <Separator className="bg-blue-300 my-1" />
          <div className="flex justify-between text-sm">
            <span className="text-blue-950">Tổng cộng ước tính</span>
            <span className="text-blue-900 text-2xl font-semibold">
              {displaySubtotal.toLocaleString()}₫
            </span>
          </div>
        </div>



        {/* Send to Kitchen Button - Big Primary */}
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 h-8 shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendToKitchen}
          disabled={cart.length === 0 || !cart.some(i => i.status === 'pending')}
        >
          <Bell className="w-5 h-5 mr-2" />
          Gửi pha chế
        </Button>

        {/* Buttons Row */}
        <div className="flex gap-2">
          {/* Removed Promotion Button as requested */}

          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 shadow-md text-sm"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            <CreditCard className="w-4 h-4 mr-1" />
            Thanh toán
          </Button>

        </div>
      </div>
    </div>
  );
  };

  // Persist Takeaway Order ID
  useEffect(() => {
    const savedId = localStorage.getItem("pos_takeaway_order_id");
    if (savedId) {
       const id = parseInt(savedId);
       setTakeawayOrderId(id);
       // Fetch the order to restore cart UI
       axiosClient.get(`/orders/${id}`)
        .then(res => {
            const orderData = res?.data?.metaData ?? res?.data;
            if (orderData && (orderData.status === 'pending' || orderData.status === 'in_progress')) {
                 const newItems = mapOrderToCartItems(orderData);
                 setTakeawayOrders(newItems);
            } else {
                // If order is completed or invalid, clear logic
                setTakeawayOrderId(null);
                localStorage.removeItem("pos_takeaway_order_id");
            }
        })
        .catch(() => {
            setTakeawayOrderId(null);
            localStorage.removeItem("pos_takeaway_order_id");
        });
    }
  }, []);

  useEffect(() => {
     if (takeawayOrderId) {
         localStorage.setItem("pos_takeaway_order_id", takeawayOrderId.toString());
     } else {
         // Do not remove immediately if null to avoid race conditions during init, 
         // but here we only set null on explicit clear.
         // Actually we should remove if it becomes null explicitly (like cancel/pay).
         // However, initial state is null. We should check if we have transitioned?
         // Simpler: Only setItem if truthy. RemoveItem is handled in specific actions (pay).
     }
  }, [takeawayOrderId]);

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50">
      {/* Left Panel - Products & Tables */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-4 lg:p-2 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-blue-900 text-2xl font-semibold">Menu & Bàn</h2>
              <p className="text-sm text-slate-500">Chọn bàn và gọi món</p>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""
                }
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : ""
                }
              >
                <List className="w-4 h-4" />
              </Button>
              {/* Profile button for mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden ml-2 p-2 hover:bg-blue-50"
                    title="Tài khoản"
                  >
                    <User className="w-5 h-5 text-blue-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" sideOffset={5}>
                  <DropdownMenuLabel>
                    <div>
                      <p>{user?.fullName}</p>
                      <p className="text-xs text-slate-500">{user?.roleLabel}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAccountModalOpen(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => {
                    logout();
                  }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm món..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Tabs
          defaultValue="tables"
          className="flex-1 flex flex-col overflow-hidden"
          onValueChange={(value: string) => {
            // Ensure combos are not hidden by a lingering category filter
            if (value === 'combo') {
              setSelectedCategory('combo');
            } else if (value !== 'menu') {
              // Reset to all when leaving menu/combo tabs
              setSelectedCategory('all');
            }
            
            if (value === 'ready') {
                fetchReadyItems();
            }
          }}
        >
          <div className="mx-4 lg:mx-6 mt-2 overflow-x-auto lg:overflow-visible no-scrollbar">
            <TabsList className="bg-blue-100 inline-flex w-max lg:w-auto whitespace-nowrap lg:flex-wrap">
            <TabsTrigger
              value="tables"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shrink-0"
            >
              Sơ đồ bàn
            </TabsTrigger>
            <TabsTrigger
              value="menu"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shrink-0"
            >
              Thực đơn
            </TabsTrigger>
            <TabsTrigger
              value="topping"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shrink-0"
            >
              <Package className="w-4 h-4 mr-1" />
              Topping
            </TabsTrigger>
            <TabsTrigger
              value="combo"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shrink-0"
            >
              <PackageCheck className="w-4 h-4 mr-1" />
              Combo
            </TabsTrigger>
            {userRole === "waiter" && (
              <TabsTrigger
                value="ready"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white shrink-0"
              >
                <Bell className="w-4 h-4 mr-1" />
                Chờ cung ứng ({readyItems.length})
              </TabsTrigger>
            )}
            </TabsList>
          </div>

          <TabsContent value="tables" className="flex-1 overflow-auto m-0 !pb-40">
            <div className="p-4 lg:p-6 pb-64 lg:pb-6">
              {/* Order Type Tabs */}
              <div className="mb-4 flex gap-2 bg-slate-100 p-1 rounded-lg">
                <Button
                  variant={orderType === "dine-in" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleOrderTypeChange("dine-in")}
                  className={`flex-1 gap-2 ${
                    orderType === "dine-in"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Tại bàn
                </Button>
                <Button
                  variant={orderType === "takeaway" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleOrderTypeChange("takeaway")}
                  className={`flex-1 gap-2 ${
                    orderType === "takeaway"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Mang về
                </Button>
              </div>

              {/* Area Tabs */}
              <Tabs
                defaultValue="all"
                className="mb-4"
                onValueChange={(value: string) => setSelectedArea(value === 'all' ? 'all' : Number(value))}
              >
                <TabsList className="bg-slate-100 flex-wrap h-auto">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white"
                  >
                    Tất cả
                  </TabsTrigger>
                  {areas.map((area) => (
                    <TabsTrigger
                      key={area.id}
                      value={String(area.id)}
                      className="data-[state=active]:bg-white"
                    >
                      {area.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Status Filter */}
              <div className="mb-4 flex gap-2 items-center">
                <span className="text-sm text-slate-600">Lọc:</span>
                <Button
                  variant={
                    selectedTableStatus === "all" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedTableStatus("all")}
                  className={
                    selectedTableStatus === "all"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  Tất cả
                </Button>
                <Button
                  variant={
                    selectedTableStatus === "available" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedTableStatus("available")}
                  className={
                    selectedTableStatus === "available"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : ""
                  }
                >
                  Bàn trống
                </Button>
                <Button
                  variant={
                    selectedTableStatus === "occupied" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedTableStatus("occupied")}
                  className={
                    selectedTableStatus === "occupied"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  Có khách
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Mang đi - only show when "Tất cả" area is selected */}
                {selectedArea === "all" && (
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      isTakeaway
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-blue-400 hover:shadow-lg hover:border-blue-600"
                    }`}
                    onClick={handleSelectTakeaway}
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          isTakeaway ? "bg-blue-600" : "bg-blue-500"
                        }`}
                      >
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm text-neutral-900">Mang đi</p>
                      <p className="text-xs text-neutral-500">Đóng gói</p>
                    </CardContent>
                  </Card>
                )}

                {/* Tables - filtered by area and status */}
                {tables
                  .filter((table) => {
                    const matchesArea =
                      selectedArea === "all" || table.area === selectedArea;
                    const matchesStatus =
                      selectedTableStatus === "all" ||
                      table.status === selectedTableStatus;
                    return matchesArea && matchesStatus;
                  })
                  .map((table) => (
                    <Card
                      key={table.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedTable?.id === table.id && !isTakeaway
                          ? "border-blue-600 bg-blue-50 shadow-lg"
                          : getTableStatusColor(table.status)
                      }`}
                      onClick={() => handleSelectTable(table)}
                    >
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            selectedTable?.id === table.id && !isTakeaway
                              ? "bg-blue-600"
                              : table.status === "available"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        >
                          <span className="text-white">{table.name.replace(/\D/g, '')}</span>
                        </div>
                        <p className="text-sm text-neutral-900">
                          Bàn {(table.name || "").replace(/^Bàn\s*/i, "")}
                        </p>
                        <p className="text-xs text-neutral-500 mb-1">
                          {areas.find((a) => a.id === table.area)?.name}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-xs text-neutral-500 mb-2">
                          <Users className="w-3 h-3" />
                          <span>{table.capacity} chỗ</span>
                        </div>
                        {getTableStatusBadge(table.status)}
                        {table.currentOrder && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {table.currentOrder}
                          </Badge>
                        )}
                        {table.status === "occupied" && table.createdAt && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {getElapsedTime(table.createdAt)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="flex-1 overflow-auto m-0 !pb-40">
            <div className="p-4 lg:p-6 space-y-4 pb-64 lg:pb-6">
              {/* Header with Categories and Add New Item button */}
              <div className="flex items-center justify-between gap-3">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={
                        selectedCategory === cat.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }`}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>

                {/* Removed: Add New Item Button */}
              </div>

              {/* Products Grid */}
              <div
                    className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1"
                } gap-2`}
              >
                    {filteredProducts.map((product) => {
                      const isOutOfStock = isProductOutOfStock(product);
                      const isKitchenOutage = kitchenOutageItemIds.includes(String(product.id));
                  return (
                    <Card
                      key={product.id}
                          className={`transition-shadow border-blue-200 relative ${
                            isOutOfStock
                              ? "opacity-50 cursor-not-allowed bg-gray-50"
                              : isKitchenOutage
                              ? "opacity-60 bg-slate-50 cursor-pointer hover:shadow-md hover:border-blue-300"
                              : "cursor-pointer hover:shadow-lg hover:border-blue-400"
                          }`}
                          onClick={() => {
                            if (isOutOfStock) return;
                            addToCart(product);
                          }}
                    >
                      <CardContent className="p-2">
                        <div className="text-3xl mb-1 text-center">
                          {product.image}
                        </div>
                        <h3 className="text-xs text-slate-900 mb-0.5 line-clamp-2">
                          {product.name}
                        </h3>
                        <p
                          className={`text-xs font-semibold ${
                            isOutOfStock ? "text-gray-500" : "text-blue-700"
                          }`}
                        >
                          {product.price.toLocaleString()}₫
                        </p>
                        {isOutOfStock && (
                          <Badge
                            variant="outline"
                            className="absolute top-1 right-1 bg-red-100 text-red-700 border-red-300 text-[10px]"
                          >
                            Tạm ngưng
                          </Badge>
                        )}
                            {!isOutOfStock && isKitchenOutage && (
                              <Badge
                                variant="outline"
                                className="absolute top-1 right-1 bg-amber-50 text-amber-700 border-amber-300 text-[10px] flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" /> Thiếu NL
                              </Badge>
                            )}
                        {!isOutOfStock && (product as any).isNew && (
                          <Badge className="absolute top-1 right-1 bg-green-500 text-white text-[10px]">
                            Mới
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Topping Tab */}
          <TabsContent value="topping" className="flex-1 overflow-auto m-0 !pb-40">
            <div className="p-4 lg:p-6 pb-64 lg:pb-6">
              <div className="mb-4">
                <h3 className="text-slate-900 font-semibold mb-4">
                  Topping & Phụ gia
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {toppings.map((topping) => (
                  <Card
                    key={topping.id}
                    className="cursor-pointer hover:shadow-md transition-all border border-slate-200 hover:border-amber-400"
                    onClick={() => {
                      setSelectedTopping(topping);
                      setToppingQuantity(1);
                      setToppingActionModalOpen(true);
                    }}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm text-slate-900 text-center mb-1">
                        {topping.name}
                      </h4>
                      <p className="text-amber-600 font-bold text-center">
                        {topping.price.toLocaleString("vi-VN")}đ
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="combo" className="flex-1 overflow-auto m-0 !pb-40">
            <div className="p-4 lg:p-6 pb-64 lg:pb-6 space-y-4">
              {/* Combo Info Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <PackageCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">Combo tiết kiệm</h3>
                    <p className="text-sm text-slate-600">
                      Chọn combo để được giảm giá và phục vụ nhanh hơn
                    </p>
                  </div>
                </div>
              </div>

              {/* Combos Grid */}
              <div
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1"
                } gap-4`}
              >
                {filteredCombos.map((combo) => {
                  // Calculate total items in combo
                  const totalItems = combo.groups.reduce(
                    (sum, group) => sum + group.maxSelect,
                    0
                  );

                  // Show discount badge if provided in data
                  const hasDiscount = typeof combo.discount === 'number' && combo.discount > 0;

                  return (
                    <Card
                      key={combo.id}
                      className={`transition-shadow border-blue-200 relative cursor-pointer hover:shadow-lg hover:border-blue-400`}
                      onClick={() => handleComboClick(combo)}
                    >
                      <CardContent className="p-4">
                        {/* Discount badge */}
                        {hasDiscount && (
                          <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Giảm {combo.discount?.toLocaleString()}₫
                          </Badge>
                        )}

                        {/* Combo icon */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 mx-auto">
                          <PackageCheck className="w-6 h-6 text-white" />
                        </div>

                        {/* Combo name */}
                        <h3 className="text-sm text-slate-900 mb-1 text-center">
                          {combo.name}
                        </h3>

                        {/* Combo description */}
                        <p className="text-xs text-slate-500 mb-3 text-center line-clamp-2 min-h-[2rem]">
                          {combo.description}
                        </p>

                        {/* Items count */}
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Badge
                            variant="outline"
                            className="text-xs border-blue-300 text-blue-700"
                          >
                            {totalItems} món
                          </Badge>
                        </div>

                        {/* Price */}
                        <div className="text-center">
                          <p className="text-blue-700">
                            {combo.price.toLocaleString()}₫
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Empty state */}
              {filteredCombos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PackageX className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-slate-900 mb-2">Không tìm thấy combo</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Chưa có combo nào"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {userRole === "waiter" && (
            <TabsContent value="ready" className="flex-1 overflow-auto m-0 !pb-40">
              <div className="p-4 lg:p-6 pb-64 lg:pb-6">
                <div className="space-y-3">
                  {readyItems.filter(
                    (item) => item.completedQuantity > item.servedQuantity
                  ).length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                      <p className="text-slate-500">
                        Không có món nào chờ cung ứng
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Tất cả đơn hàng đã được cung ứng
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {readyItems
                        .filter(
                          (item) => item.completedQuantity > item.servedQuantity
                        )
                        .map((item) => {
                          // itemsToServe = số món đã hoàn thành nhưng chưa phục vụ
                          const itemsToServe = item.completedQuantity - item.servedQuantity;
                          const elapsedMinutes = Math.floor(
                            (Date.now() - item.timestamp.getTime()) / 60000
                          );
                          return (
                            <Card
                              key={item.id}
                              className="shadow-sm border-green-200 bg-green-50"
                            >
                              <div className="pt-2 p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h2 className="text-slate-900 font-semibold">
                                    {itemsToServe}x {item.itemName}
                                  </h2>
                                  <div className="flex gap-1 flex-shrink-0">
                                    {hasPermission('kitchen:deliver' as any) && itemsToServe > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-14 p-0 rounded-full border-2 border-emerald-500 hover:border-emerald-700 hover:bg-emerald-50 "
                                        onClick={() =>
                                          advanceReadyItemOneUnit(item.id)
                                        }
                                        title="Phục vụ 1"
                                      >
                                        <ChevronRight className="w-8 h-8 " />
                                      </Button>
                                    )}
                                    {hasPermission('kitchen:deliver' as any) && itemsToServe > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-14 p-0 rounded-full border-2 border-emerald-500 bg-emerald-500 hover:border-emerald-700 hover:bg-emerald-700"
                                        onClick={() =>
                                          advanceReadyItemAllUnits(item.id)
                                        }
                                        title="Phục vụ tất cả"
                                      >
                                        <ChevronsRight className="w-8 h-8" />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-slate-700">
                                    {item.table}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-700">
                                    <Clock className="w-3 h-3" />
                                    {elapsedMinutes} phút
                                  </span>
                                </div>
                                <Badge className="bg-green-600 text-white text-xs h-5 w-fit">
                                  Chờ phục vụ {itemsToServe}
                                </Badge>

                                {item.notes && (
                                  <p className="text-xs text-slate-600 mt-2">
                                    Ghi chú: {item.notes}
                                  </p>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Right Panel - Cart */}
      {renderCartPanel(false)}
      {renderCartPanel(true)}

      <PrintReceiptModal
        open={printReceiptOpen}
        onClose={() => setPrintReceiptOpen(false)}
        items={receiptData?.items || []}
        totalAmount={receiptData?.totalAmount || 0}
        orderNumber={receiptData?.orderNumber || "ORD-000"}
        customerName={receiptData?.customerName || "Khách hàng"}
        paymentMethod={lastPaymentMethod}
        tableNumber={receiptData?.tableNumber}
        waiterName={user?.fullName}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={(() => {
          // Group items for checkout display
          const checkoutItems: any[] = [];
          const processedComboInstances = new Set<string>();
          
          // First, group combo items by instance
          const comboGroups = new Map<string, CartItem[]>();
          const nonComboItems: CartItem[] = [];
          
          cart.forEach(item => {
            if (item.parentItemId) return; // Skip toppings here, they'll be added to parents
            
            if (item.comboInstanceId || item.comboId) {
              const key = item.comboInstanceId || `combo-${item.comboId}-fallback`;
              if (!comboGroups.has(key)) {
                comboGroups.set(key, []);
              }
              comboGroups.get(key)!.push(item);
            } else {
              nonComboItems.push(item);
            }
          });
          
          // Add combo groups as combo headers
          comboGroups.forEach((comboItems, instanceId) => {
            if (processedComboInstances.has(instanceId)) return;
            processedComboInstances.add(instanceId);
            
            const firstItem = comboItems[0];
            const comboName = firstItem?.comboName || `Combo`;
            const baseComboPrice = firstItem?.comboPrice ?? 0;
            const totalExtraPrice = comboItems.reduce((sum, i) => sum + (Number(i.extraPrice) || 0), 0);
            const comboPrice = baseComboPrice + totalExtraPrice;
            
            checkoutItems.push({
              id: `checkout-combo-${instanceId}`,
              name: comboName,
              quantity: 1,
              price: comboPrice,
              basePrice: baseComboPrice,
              isComboHeader: true,
              comboInstanceId: instanceId,
              comboItems: comboItems.map(ci => ({
                id: ci.id,
                name: ci.name,
                quantity: ci.quantity,
                price: ci.price,
                basePrice: ci.price,
                extraPrice: ci.extraPrice,
              })),
            });
          });
          
          // Add non-combo items with their toppings
          nonComboItems.forEach(item => {
            checkoutItems.push({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: getItemPrice(item),
              basePrice: item.basePrice ?? item.price,
              notes: item.notes,
            });
            
            // Add attached toppings
            if (item.attachedToppings && item.attachedToppings.length > 0) {
              item.attachedToppings.forEach(topping => {
                checkoutItems.push({
                  id: topping.id,
                  name: topping.name,
                  quantity: topping.quantity,
                  price: topping.price * topping.quantity,
                  basePrice: topping.price,
                  isTopping: true,
                  parentName: item.name,
                });
              });
            }
          });
          
          return checkoutItems;
        })()}
        totalAmount={displayTotalAmount}
        discountAmount={discountAmount}
        tableNumber={selectedTable?.id}
        tableArea={selectedTable ? areas.find((a) => a.id === selectedTable.area)?.name : undefined}
        isTakeaway={isTakeaway}
        orderCode={selectedTable?.currentOrder || "TAKEAWAY"}
        orderId={isTakeaway ? (takeawayOrderId || undefined) : selectedTable?.order_id}
        customerId={selectedCustomer?.id}
        bankAccounts={bankAccounts}
        onAddBankAccount={(bank, owner, account) => {
          // Optimistically update, then sync to backend
          setBankAccounts((prev) => [...prev, { bank, owner, account }]);
          const payload = {
            bankName: bank,
            ownerName: owner,
            accountNumber: account,
          };
          createBankAccountApi(payload).catch((err: any) => {
            toast.error("Thêm tài khoản ngân hàng thất bại", {
              description: err?.message || "API lỗi",
            });
          });
        }}
        onConfirmPayment={async (paymentMethod, _paymentDetails, promotionId, selectedGifts) => {
          const methodLabelMap: Record<string, string> = {
            cash: "Tiền mặt",
            transfer: "Chuyển khoản",
            combined: "Kết hợp",
          };
          setLastPaymentMethod(methodLabelMap[paymentMethod] || "Tiền mặt");
          
          const orderId = isTakeaway ? (takeawayOrderId || undefined) : selectedTable?.order_id;
          if (orderId) {
            try {
              // Call checkout API
              const res = await checkoutOrder(Number(orderId), {
                paymentMethod,
                paidAmount: _paymentDetails.customerPaid || displayTotalAmount,
                bankAccountId: _paymentDetails.bankAccountId,
                promotionId,
                selectedGifts,
              });

              // Map response items (including gifts) for receipt
              const data = res.data || res; // Handle axios response
              // Backend returns metaData as { order: {...}, totalAmount: ... }
              const orderData = data.metaData ?? data.order ?? data;
              // Access order items nested in the 'order' property
              const itemsList = orderData.order?.orderItems || orderData.orderitems || [];
              const comboSummary = orderData.order?.comboSummary ?? orderData.comboSummary ?? [];
              
              // Group items for receipt with combo and topping support
              const receiptItems: any[] = [];
              const processedComboItems = new Set<number>();
              
              // Process combo summary to create combo headers
              comboSummary.forEach((cs: any) => {
                if (!cs?.comboId) return;
                
                const comboItems = cs.items || [];
                const comboItemIds = comboItems.map((i: any) => i.id);
                
                // Find actual items for this combo
                const actualComboItems = itemsList.filter((item: any) => 
                  comboItemIds.includes(item.id) && item.status !== 'canceled'
                );
                
                if (actualComboItems.length > 0) {
                  const totalPrice = actualComboItems.reduce((sum: number, i: any) => 
                    sum + Number(i.totalPrice || 0), 0
                  );
                  
                  receiptItems.push({
                    id: `combo-${cs.comboId}-${cs.items[0]?.id}`,
                    name: cs.comboName || `Combo #${cs.comboId}`,
                    quantity: 1,
                    price: totalPrice,
                    isComboHeader: true,
                    comboItems: actualComboItems.map((item: any) => ({
                      id: item.id.toString(),
                      name: item.name,
                      quantity: item.quantity,
                      price: Number(item.totalPrice) / Number(item.quantity || 1),
                      extraPrice: item.extraPrice || 0,
                    })),
                  });
                  
                  // Mark these items as processed
                  actualComboItems.forEach((item: any) => processedComboItems.add(item.id));
                }
              });
              
              // Process remaining items (non-combo)
              itemsList.forEach((item: any) => {
                if (processedComboItems.has(item.id)) return; // Skip already processed combo items
                if (item.status === 'canceled') return; // Skip canceled items
                
                // Check if this is a topping
                if (item.isTopping) {
                  receiptItems.push({
                    id: item.id.toString(),
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.totalPrice) / Number(item.quantity || 1),
                    notes: item.notes,
                    isTopping: true,
                  });
                } else {
                  receiptItems.push({
                    id: item.id.toString(),
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.totalPrice) / Number(item.quantity || 1),
                    notes: item.notes,
                  });
                }
              });
              
              // Filter out any items with cancel notes
              const activeReceiptItems = receiptItems.filter((i: any) => !i.notes?.includes('Đã hủy'));
              
              // Store receipt data BEFORE clearing state
              setReceiptData({
                items: activeReceiptItems,
                totalAmount: Number(orderData.totalAmount ?? displayTotalAmount),
                orderNumber: orderData.order?.orderCode ?? (isTakeaway ? String(takeawayOrderId) : selectedTable?.currentOrder),
                customerName: selectedCustomer?.name || orderData.order?.customer?.name || "Khách hàng",
                tableNumber: isTakeaway ? undefined : (selectedTable ? String(selectedTable.id) : undefined)
              });
            
              // If Takeaway, clear local state
              if (isTakeaway) {
                  setTakeawayOrderId(null);
                  setTakeawayOrders([]);
                  setTakeawayOrderCode(null);
                  localStorage.removeItem("pos_takeaway_order_id");
                  setOrderSubtotal(0);
                  setOrderTotalAmount(0);
              } else {
                  // If Dine-in, refresh tables and clear selection
                  // Refresh tables
                  await getTables().then((res: any) => {
                    const items = extractItems(res);
                    const mapFn = (t: any) => ({
                      id: t.id,
                      name: (t.tableName ?? String(t.id)).replace(/^Bàn\s*/i, ''),
                      number: Number(t.tableName.replace(/\D/g, '')),
                      capacity: t.capacity,
                      status: (t.currentStatus === 'occupied' ? 'occupied' : 'available') as any,
                      area: (t.area?.id ?? (t as any).areaId) as number,
                      createdAt: t.createdAt ? new Date(t.createdAt).getTime() : undefined,
                      updatedAt: t.updatedAt ? new Date(t.updatedAt).getTime() : undefined,
                      deletedAt: t.deletedAt ? new Date(t.deletedAt).getTime() : undefined,
                      isActive: t.isActive,
                      order_id: t.order_id,
                      currentOrder: t.currentOrder
                     } as Table);
                    setTables(items.map(mapFn));
                  });
                  
                  // Clear selection
                  updateCurrentCart([]);
                  setSelectedTable(null);
                  setSelectedCustomer(null);
                  setOrderSubtotal(0);
                  setOrderTotalAmount(0);
              }

              // Open Print Modal
              setPrintReceiptOpen(true);
              
            } catch (err: any) {
              toast.error("Thanh toán thất bại", { description: err?.message || "API lỗi" });
            }
          }
        }}
      />

      {/* Out of Stock Warning Dialog */}
      <Dialog
        open={outOfStockWarningOpen}
        onOpenChange={setOutOfStockWarningOpen}
      >
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Món không thể pha chế
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-800">
                Món <strong>{outOfStockItem?.name}</strong> không thể pha chế do
                hết nguyên liệu <strong>{outOfStockIngredient}</strong>.
              </p>
            </div>
            <p className="text-sm text-slate-600">
              Vui lòng chọn hành động phù hợp để xử lý tình huống này:
            </p>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleOpenReplaceModal}
              className="w-full"
            >
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              Chọn món thay thế
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelItem}
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Hủy món
            </Button>
            <Button
              variant="outline"
              onClick={handleWaitIngredient}
              className="w-full"
            >
              <Clock className="w-4 h-4 mr-1" />
              Đợi nguyên liệu
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 w-full"
              onClick={handleNotifyWaiter}
            >
              <Bell className="w-4 h-4 mr-1" />
              Báo khách
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kitchen Outage Confirm Dialog */}
      <Dialog open={outageConfirmOpen} onOpenChange={setOutageConfirmOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              Cảnh báo thiếu nguyên liệu
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Món này hiện đang thiếu nguyên liệu. Bạn có muốn tiếp tục bán?
              </p>
              {pendingOutageProduct && (
                <p className="text-xs text-amber-700 mt-1">
                  {pendingOutageProduct.name} • {pendingOutageProduct.price.toLocaleString("vi-VN")}đ
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setOutageConfirmOpen(false);
                setPendingOutageProduct(null);
              }}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 w-full"
              onClick={() => {
                if (pendingOutageProduct) {
                  addToCart(pendingOutageProduct);
                }
                setOutageConfirmOpen(false);
                setPendingOutageProduct(null);
              }}
            >
              Vẫn bán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Item Modal */}
      <Dialog
        open={replaceItemModalOpen}
        onOpenChange={setReplaceItemModalOpen}
      >
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5" />
              Chọn món thay thế
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {outOfStockItem && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-sm text-amber-800">
                  Thay thế cho: <strong>{outOfStockItem.name}</strong>
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Số lượng: {outOfStockItem.quantity}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {products
                .filter(
                  (p) => !isProductOutOfStock(p) && p.id !== outOfStockItem?.id
                )
                .filter((p) => {
                  // Show similar category items
                  if (outOfStockItem?.name.includes("Cà phê"))
                    return p.category === "coffee";
                  if (outOfStockItem?.name.includes("Trà"))
                    return p.category === "tea";
                  if (outOfStockItem?.name.includes("Sinh tố"))
                    return p.category === "smoothie";
                  return true;
                })
                .map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200"
                    onClick={() => handleReplaceItem(product)}
                  >
                    <CardContent className="p-3">
                      <div className="text-center mb-2">
                        <div className="text-3xl mb-1">{product.image}</div>
                        <p className="text-sm text-slate-900">{product.name}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {product.price.toLocaleString()}₫
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Chọn món này
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplaceItemModalOpen(false)}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Ghi chú cho món
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItemForNote && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-slate-700">
                  {selectedItemForNote.name}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedItemForNote.price.toLocaleString()}₫
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="note-input">Ghi chú</Label>
              <Input
                id="note-input"
                placeholder="Ví dụ: Ít đường, nhiều đá..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="mt-2 bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNoteDialogOpen(false);
                setNoteText("");
                setSelectedItemForNote(null);
              }}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveNote}
            >
              Lưu ghi chú
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Table Dialog */}
      <Dialog open={moveTableOpen} onOpenChange={setMoveTableOpen}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5" />
              Chuyển bàn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Bạn muốn chuyển đơn{" "}
              <span className="text-blue-700">
                {selectedTable?.currentOrder}
              </span>{" "}
              từ{" "}
              <span className="text-blue-700">Bàn {selectedTable?.name}</span>{" "}
              sang bàn nào?
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {/* Only show available tables */}
              {tables
                .filter(
                  (table) =>
                    table.status === "available" &&
                    table.id !== selectedTable?.id
                )
                .map((table) => (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all border-2 ${
                      targetTable?.id === table.id
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-emerald-500 hover:shadow-lg hover:border-emerald-600"
                    }`}
                    onClick={() => setTargetTable(table)}
                  >
                    <CardContent className="p-3 text-center">
                      <div
                        className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          targetTable?.id === table.id
                            ? "bg-blue-600"
                            : "bg-emerald-500"
                        }`}
                      >
                        <span className="text-white text-sm">
                          {table.name}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-900">
                        Bàn {table.name}
                      </p>
                      <p className="text-xs text-neutral-500 mb-1">
                        {areas.find((a) => a.id === table.area)?.name}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs text-neutral-500">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} chỗ</span>
                      </div>
                      <Badge className="bg-emerald-500 text-white text-xs mt-2">
                        Trống
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMoveTableOpen(false);
                setTargetTable(null);
              }}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={async () => {
                if (selectedTable?.order_id && targetTable) {
                  try {
                    await transferTable(selectedTable.order_id, { newTableId: Number(targetTable.id) });
                    
                    toast.success(
                      `Đã chuyển đơn sang Bàn ${targetTable.name}`,
                      {
                        description: `Bàn ${selectedTable.name} đã trống`,
                      }
                    );
                    
                    // Refresh tables data
                    const res = await getTables();
                    const items = extractItems(res);
                    setTables(items.map(mapTableFromBE));
                    setSelectedTable(null);
                  } catch (err: any) {
                    toast.error("Chuyển bàn thất bại", {
                      description: err?.response?.data?.message || err?.message,
                    });
                  }
                }
                setMoveTableOpen(false);
                setTargetTable(null);
              }}
              disabled={!targetTable}
            >
              Chuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Table Dialog */}
      <Dialog open={mergeTableOpen} onOpenChange={setMergeTableOpen}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5" />
              Gộp bàn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Chọn bàn muốn gộp với{" "}
              <span className="text-blue-700">Bàn {selectedTable?.name}</span>
              . Đơn của 2 bàn sẽ nhập chung thành một phiếu.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {/* Only show occupied tables (excluding current table) */}
              {tables
                .filter(
                  (table) =>
                    table.status === "occupied" &&
                    table.id !== selectedTable?.id
                )
                .map((table) => {
                  const tableCart = tableOrders[table.id] || [];
                  const tableTotal = tableCart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  return (
                    <Card
                      key={table.id}
                      className={`cursor-pointer transition-all border-2 ${
                        mergeTargetTable?.id === table.id
                          ? "border-blue-600 bg-blue-50 shadow-lg"
                          : "border-red-500 hover:shadow-lg hover:border-red-600 bg-red-50"
                      }`}
                      onClick={() => setMergeTargetTable(table)}
                    >
                      <CardContent className="p-3 text-center">
                        <div
                          className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            mergeTargetTable?.id === table.id
                              ? "bg-blue-600"
                              : "bg-red-500"
                          }`}
                        >
                          <span className="text-white text-sm">
                            {table.name}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-900">
                          Bàn {table.name}
                        </p>
                        <p className="text-xs text-neutral-500 mb-1">
                          {areas.find((a) => a.id === table.area)?.name}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-xs text-neutral-500 mb-1">
                          <Users className="w-3 h-3" />
                          <span>{table.capacity} chỗ</span>
                        </div>
                        <Badge className="bg-red-500 text-white text-xs mb-1">
                          Có khách
                        </Badge>
                        {table.currentOrder && (
                          <Badge variant="secondary" className="text-xs mb-1">
                            {table.currentOrder}
                          </Badge>
                        )}
                        {table.createdAt && (
                          <Badge variant="outline" className="text-xs">
                            {getElapsedTime(table.createdAt)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {tables.filter(
              (table) =>
                table.status === "occupied" && table.id !== selectedTable?.id
            ).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Không có bàn nào khác đang có khách</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMergeTableOpen(false);
                setMergeTargetTable(null);
              }}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={async () => {
                // Merge: source (mergeTargetTable) into target (selectedTable)
                // Backend: POST /orders/:id/merge { fromOrderId } - merges 'fromOrderId' INTO ':id'
                if (selectedTable?.order_id && mergeTargetTable?.order_id) {
                  try {
                    await mergeOrders(selectedTable.order_id, { fromOrderId: mergeTargetTable.order_id });
                    
                    toast.success(
                      `Đã gộp đơn Bàn ${mergeTargetTable.name} vào Bàn ${selectedTable?.name} thành công`,
                      {
                        description: `Bàn ${mergeTargetTable?.name} đã trống`,
                      }
                    );
                    
                    // Refresh tables data
                    const res = await getTables();
                    const items = extractItems(res);
                    setTables(items.map(mapTableFromBE));
                    
                    // Refresh current order
                    fetchTableOrder(selectedTable);
                  } catch (err: any) {
                    toast.error("Gộp bàn thất bại", {
                      description: err?.response?.data?.message || err?.message,
                    });
                  }
                }
                setMergeTableOpen(false);
                setMergeTargetTable(null);
              }}
              disabled={!mergeTargetTable}
            >
              Gộp đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order History Dialog Removed */}

      {/* Split Order Dialog */}
      <Dialog
        open={splitOrderOpen}
        onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
          setSplitOrderOpen(open);
          if (!open) {
            setSplitItems({});
            setSplitDestinationTable(null);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-hidden flex flex-col"
          style={{ width: "95vw", maxWidth: "1000px" }}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tách đơn
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Destination Selection */}
            <div className="mb-4 p-2 border rounded-lg bg-slate-50">
              <Label className="text-sm text-slate-700 mb-2 block">
                Chọn đích đến:
              </Label>
              <Select
                value={splitDestinationTable?.id || ""}
                onValueChange={(value: number) => {
                  const table = tables.find((t) => t.id === value);
                  setSplitDestinationTable(table || null);
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Chọn bàn trống..." />
                </SelectTrigger>
                <SelectContent>
                  {tables
                    .filter((table) => table.status === "available")
                    .map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Bàn {table.name} -{" "}
                        {areas.find((a) => a.id === table.area)?.name} (
                        {table.capacity} chỗ)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0">
              {/* Left Column - Current Order */}
              <div className="col-span-2 border rounded-lg p-4 flex flex-col h-full overflow-hidden">
                <div className="mb-3">
                  <h3 className="text-sm text-slate-900 mb-1">Đơn hiện tại</h3>
                  <p className="text-xs text-slate-500">
                    Bàn {selectedTable?.name} - {selectedTable?.currentOrder}
                  </p>
                </div>

                <div className="flex-1 overflow-auto space-y-2">
                  {cart.map((item) => {
                    const splitQty = splitItems[item.id] || 0;
                    const remainingQty = item.quantity - splitQty;

                    return (
                      <Card key={item.id} className="border-slate-200">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-600">
                                {item.price.toLocaleString()}₫ × {item.quantity}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-slate-500 italic mt-1">
                                  "{item.notes}"
                                </p>
                              )}
                              {item.toppings && item.toppings.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {item.toppings.map((t, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-xs px-1 py-0"
                                    >
                                      {t}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quantity Splitter */}
                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded">
                            <span className="text-xs text-slate-600">
                              Tách:
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const newQty = Math.max(0, splitQty - 1);
                                  setSplitItems({
                                    ...splitItems,
                                    [item.id]: newQty,
                                  });
                                }}
                                disabled={splitQty === 0}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm w-8 text-center">
                                {splitQty}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const newQty = Math.min(
                                    item.quantity,
                                    splitQty + 1
                                  );
                                  setSplitItems({
                                    ...splitItems,
                                    [item.id]: newQty,
                                  });
                                }}
                                disabled={splitQty >= item.quantity}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-slate-500">
                            Còn lại: {remainingQty} món
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Right Column - New Order Preview */}
              <div className="border rounded-lg p-4 flex flex-col bg-blue-50 h-full overflow-hidden">
                <div className="mb-3">
                  <h3 className="text-sm text-slate-900 mb-1">Đơn mới</h3>
                  <p className="text-xs text-slate-500">
                    {
                      Object.keys(splitItems).filter((id) => splitItems[id] > 0)
                        .length
                    }{" "}
                    món được tách
                  </p>
                </div>

                <div className="flex-1 overflow-auto space-y-2">
                  {Object.keys(splitItems).filter((id) => splitItems[id] > 0)
                    .length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Chưa có món nào</p>
                    </div>
                  ) : (
                    cart
                      .filter((item) => (splitItems[item.id] || 0) > 0)
                      .map((item) => {
                        const splitQty = splitItems[item.id];
                        return (
                          <Card
                            key={item.id}
                            className="border-blue-200 bg-white"
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    {item.price.toLocaleString()}₫ × {splitQty}
                                  </p>
                                  {item.notes && (
                                    <p className="text-xs text-slate-500 italic mt-1">
                                      "{item.notes}"
                                    </p>
                                  )}
                                  {item.toppings &&
                                    item.toppings.length > 0 && (
                                      <div className="flex gap-1 mt-1">
                                        {item.toppings.map((t, i) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="text-xs px-1 py-0"
                                          >
                                            {t}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                </div>
                                <span className="text-sm text-blue-900">
                                  {(item.price * splitQty).toLocaleString()}₫
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                  )}
                </div>

                {/* New Order Total */}
                {Object.keys(splitItems).some((id) => splitItems[id] > 0) && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">
                        Tổng đơn mới:
                      </span>
                      <span className="text-blue-900 text-2xl font-semibold">
                        {cart
                          .filter((item) => (splitItems[item.id] || 0) > 0)
                          .reduce(
                            (sum, item) =>
                              sum + item.price * splitItems[item.id],
                            0
                          )
                          .toLocaleString()}
                        ₫
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSplitOrderOpen(false);
                setSplitItems({});
                setSplitDestinationTable(null);
              }}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !splitDestinationTable ||
                !Object.keys(splitItems).some((id) => splitItems[id] > 0)
              }
              onClick={async () => {
                if (!selectedTable?.order_id || !splitDestinationTable) return;

                // Create split items array for API
                const itemsToSplit = cart
                  .filter((item) => (splitItems[item.id] || 0) > 0)
                  .map((item) => ({
                    itemId: Number(item.orderItemId || item.id.split('-')[0]),
                    quantity: splitItems[item.id],
                  }));

                if (itemsToSplit.length === 0) {
                  toast.error("Vui lòng chọn món để tách");
                  return;
                }

                try {
                  await splitOrder(selectedTable.order_id, {
                    newTableId: Number(splitDestinationTable.id),
                    items: itemsToSplit,
                  });

                  toast.success(
                    `Đã tách đơn thành công sang Bàn ${splitDestinationTable?.name}`,
                    {
                      description: `${itemsToSplit.length} món đã được tách`,
                    }
                  );

                  // Refresh tables and current order
                  const res = await getTables();
                  const items = extractItems(res);
                  setTables(items.map(mapTableFromBE));
                  fetchTableOrder(selectedTable);
                } catch (err: any) {
                  toast.error("Tách đơn thất bại", {
                    description: err?.response?.data?.message || err?.message,
                  });
                }

                // Clean up and close
                setSplitOrderOpen(false);
                setSplitItems({});
                setSplitDestinationTable(null);
              }}
            >
              Tạo đơn mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removed: New Item Request Modal */}

      {/* Removed: IngredientSelectionDialog */}

      {/* Removed: Requests Drawer */}

      {/* Item Customization Modal */}
      {selectedItemForCustomization && (
        <ItemCustomizationModal
          open={customizationModalOpen}
          onClose={() => {
            setCustomizationModalOpen(false);
            setSelectedItemForCustomization(null);
            setCurrentAvailableToppings([]); // clear temp toppings
          }}
          itemName={selectedItemForCustomization.name}
          basePrice={selectedItemForCustomization.price}
          onUpdate={handleUpdateCustomization}
          initialCustomization={selectedItemForCustomization.customization}
          availableToppings={currentAvailableToppings.length > 0 ? currentAvailableToppings : toppings.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
          }))}
          isComposite={(selectedItemForCustomization as any).isComposite} // Pass the flag
        />
      )}

      {/* Promotion Popup - New Component */}
      <PromotionPopup
        open={promotionModalOpen}
        onClose={() => setPromotionModalOpen(false)}
        orderTotal={displayTotalAmount}
        orderItems={cart.map((item) => {
          const product = products.find((p) => p.id === item.id);
          return {
            id: item.id,
            name: item.name,
            price: getItemPrice(item),
            quantity: item.quantity,
            category: product?.category,
          };
        })}
        orderId={selectedTable?.order_id}
        selectedCustomer={selectedCustomer ? {
          id: String(selectedCustomer.id),
          name: selectedCustomer.name,
          phone: selectedCustomer.phone ?? "",
          code: selectedCustomer.code,
          points: 0,
        } : null}
        onApply={handleApplyPromotion}
      />

      {/* Select Item to Attach Topping Modal */}
      <Dialog
        open={selectItemToAttachOpen}
        onOpenChange={setSelectItemToAttachOpen}
      >
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Chọn đồ uống để thêm {selectedTopping?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedTopping && (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="space-y-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <Label className="text-sm font-semibold text-slate-900">
                  Số lượng {selectedTopping.name}
                </Label>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() =>
                      setToppingQuantity(Math.max(1, toppingQuantity - 1))
                    }
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg text-amber-600">
                    {toppingQuantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => setToppingQuantity(toppingQuantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getCompatibleItemsForTopping(selectedTopping).map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 hover:bg-blue-50 border-blue-200"
                    onClick={() => {
                      attachToppingToItem(
                        item.id,
                        selectedTopping,
                        toppingQuantity
                      );
                      setSelectItemToAttachOpen(false);
                      setToppingActionModalOpen(false);
                      setSelectedTopping(null);
                      setToppingQuantity(1);
                    }}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-900">
                        {item.name} x{item.quantity}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.price.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Button>
                ))}

                {getCompatibleItemsForTopping(selectedTopping).length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">Không có đồ uống nào tương thích</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectItemToAttachOpen(false);
              }}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topping Action Modal - Attach or Standalone */}
      <Dialog
        open={toppingActionModalOpen}
        onOpenChange={setToppingActionModalOpen}
      >
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {selectedTopping?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedTopping && (
            <div className="space-y-4">
              <div className="text-center py-4 bg-slate-50 rounded-lg">
                <p className="text-lg text-slate-700">Giá topping</p>
                <p className="text-2xl font-bold text-amber-600">
                  {selectedTopping.price.toLocaleString("vi-VN")}đ
                </p>
              </div>

              {/* Quantity Selector - Always Visible */}
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label className="text-sm font-semibold text-slate-900">
                  Số lượng
                </Label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-10 w-10 p-0 border-2"
                    onClick={() =>
                      setToppingQuantity(Math.max(1, toppingQuantity - 1))
                    }
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <span className="w-16 text-center font-bold text-2xl text-blue-600">
                    {toppingQuantity}
                  </span>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-10 w-10 p-0 border-2"
                    onClick={() => setToppingQuantity(toppingQuantity + 1)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={async () => {
                    // Check if there is an active order (Dine-in or Takeaway)
                    const currentOrderId = isTakeaway ? takeawayOrderId : selectedTable?.order_id;

                    if (currentOrderId) {
                        // Call API to add topping as a standalone item
                        try {
                             await addOrderItem(currentOrderId, {
                                 itemId: Number(selectedTopping.id),
                                 quantity: toppingQuantity,
                                 note: "Topping riêng lẻ",
                                 // We don't need to specify isTopping here usually, the Item definition dictates it,
                                 // but if needed we can pass custom fields or just rely on BE.
                             });
                             toast.success(`Đã thêm ${toppingQuantity} x ${selectedTopping.name}`);
                             
                             // Refresh Order
                             if (isTakeaway) {
                                const res = await axiosClient.get(`/orders/${currentOrderId}`);
                                const orderData = res?.data?.metaData ?? res?.data;
                                if (orderData) {
                                    setTakeawayOrders(mapOrderToCartItems(orderData));
                                }
                             } else if (selectedTable) {
                                fetchTableOrder(selectedTable);
                             }

                        } catch (err: any) {
                             console.error(err);
                             toast.error("Lỗi thêm topping: " + (err?.message || "Lỗi kết nối"));
                        }
                    } else {
                        // Local Cart Only
                        const cart = getCurrentCart();
                        const newItem: CartItem = {
                          id: `${selectedTopping.id}-${Date.now()}`,
                          name: selectedTopping.name,
                          price: selectedTopping.price,
                          quantity: toppingQuantity,
                          status: "pending",
                          isTopping: true, // Mark as topping for UI distinction
                          basePrice: selectedTopping.price,
                          // Important: persist the real ID so we can sync later if order created
                          inventoryItemId: Number(selectedTopping.id)
                        };
                        updateCurrentCart([...cart, newItem]);
                        toast.success(
                          `Đã thêm ${toppingQuantity} x ${selectedTopping.name}`
                        );
                    }

                    setToppingActionModalOpen(false);
                    setSelectedTopping(null);
                    setToppingQuantity(1);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Bán riêng lẻ
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setToppingActionModalOpen(false);
                setSelectedTopping(null);
                setToppingQuantity(1);
              }}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Combo Selection Popup */}
      <ComboSelectionPopup
        open={comboSelectionOpen}
        onClose={() => {
          setComboSelectionOpen(false);
          setSelectedCombo(null);
        }}
        combo={selectedCombo}
        onConfirm={handleConfirmCombo}
      />

      {/* Combo Detection Popup - Auto-detected Combo Prompt */}
      <ComboDetectionPopup
        open={comboDetectionOpen}
        onClose={() => {
          setComboDetectionOpen(false);
          setPendingItemToAdd(null);
          setDetectedComboData(null);
        }}
        detectedCombo={detectedComboData}
        onApplyCombo={handleApplyDetectedCombo}
        onContinueIndividual={handleContinueIndividual}
      />

      <AccountProfileModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />

      {/* Cancel Item Modal */}
      <Dialog open={cancelItemModalOpen} onOpenChange={setCancelItemModalOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Xác nhận giảm / Hủy món
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                Bạn có chắc chắn muốn xóa{" "}
                <span className="font-semibold text-slate-900">
                  {itemToCancel?.name}
                </span>{" "}
                khỏi đơn hàng không?
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-slate-600">Số lượng hủy:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelQuantity(Math.max(1, cancelQuantity - 1))}
                    disabled={cancelQuantity <= 1}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">
                    {cancelQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelQuantity(Math.min(itemToCancel?.quantity || 1, cancelQuantity + 1))}
                    disabled={cancelQuantity >= (itemToCancel?.quantity || 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-slate-600 ml-1">
                    / {itemToCancel?.quantity || 1}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="cancel-reason"
                className="text-sm font-medium mb-2 block"
              >
                Lý do hủy <span className="text-red-500">*</span>
              </Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger id="cancel-reason">
                  <SelectValue placeholder="Chọn lý do hủy..." />
                </SelectTrigger>
                <SelectContent>
                  {cancelReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cancelReason === "Khác" && (
              <div>
                <Label
                  htmlFor="other-cancel-reason"
                  className="text-sm font-medium mb-2 block"
                >
                  Ghi chú lý do khác
                </Label>
                <Input
                  id="other-cancel-reason"
                  placeholder="Nhập lý do hủy..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelItemModalOpen(false);
                setCancelReason("");
                setOtherReason("");
              }}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={
                !cancelReason ||
                (cancelReason === "Khác" && !otherReason.trim())
              }
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Chắc chắn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Topping Modal */}
      <Dialog open={cancelToppingModalOpen} onOpenChange={setCancelToppingModalOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Xác nhận hủy topping
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                Bạn có chắc chắn muốn hủy topping{" "}
                <span className="font-semibold text-slate-900">
                  {toppingToCancel?.topping.name}
                </span>{" "}
                khỏi món{" "}
                <span className="font-semibold text-slate-900">
                  {cart.find(i => i.id === toppingToCancel?.parentItemId)?.name}
                </span>{" "}
                không?
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-slate-600">Số lượng hủy:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelToppingQuantity(Math.max(1, cancelToppingQuantity - 1))}
                    disabled={cancelToppingQuantity <= 1}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">
                    {cancelToppingQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelToppingQuantity(Math.min(toppingToCancel?.topping.quantity || 1, cancelToppingQuantity + 1))}
                    disabled={cancelToppingQuantity >= (toppingToCancel?.topping.quantity || 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-slate-600 ml-1">
                    / {toppingToCancel?.topping.quantity || 1}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="cancel-topping-reason"
                className="text-sm font-medium mb-2 block"
              >
                Lý do hủy <span className="text-red-500">*</span>
              </Label>
              <Select value={cancelToppingReason} onValueChange={setCancelToppingReason}>
                <SelectTrigger id="cancel-topping-reason">
                  <SelectValue placeholder="Chọn lý do hủy..." />
                </SelectTrigger>
                <SelectContent>
                  {cancelReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cancelToppingReason === "Khác" && (
              <div>
                <Label
                  htmlFor="other-cancel-topping-reason"
                  className="text-sm font-medium mb-2 block"
                >
                  Ghi chú lý do khác
                </Label>
                <Input
                  id="other-cancel-topping-reason"
                  placeholder="Nhập lý do hủy..."
                  value={otherToppingReason}
                  onChange={(e) => setOtherToppingReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelToppingModalOpen(false);
                setCancelToppingReason("");
                setOtherToppingReason("");
                setToppingToCancel(null);
              }}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleConfirmCancelTopping}
              disabled={
                !cancelToppingReason ||
                (cancelToppingReason === "Khác" && !otherToppingReason.trim())
              }
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Chắc chắn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topping Copy Dialog - shown when adding quantity to sent items with toppings */}
      <Dialog open={toppingCopyDialogOpen} onOpenChange={setToppingCopyDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
           <DialogHeader>
             <DialogTitle>Thêm món có topping</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
              <p>Bạn đang thêm <b>{pendingQuantityChange?.quantityToAdd || 1}</b> món <b>{pendingQuantityChange?.item?.name}</b></p>
              <p className="text-sm text-slate-600">Món này có các topping đi kèm:</p>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                {pendingQuantityChange?.item?.attachedToppings?.map((topping, idx) => (
                  <div key={idx} className="text-sm text-amber-800">
                    • {topping.name} x{topping.quantity}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600">Bạn có muốn thêm topping giống món cũ không?</p>
           </div>
           <DialogFooter className="flex flex-col sm:flex-row gap-2">
             <Button variant="outline" onClick={handleCancelToppingCopy} className="sm:order-1">
               Hủy
             </Button>
             <Button variant="secondary" onClick={handleAddItemWithoutToppings} className="sm:order-2">
               Không có topping
             </Button>
             <Button onClick={handleAddItemWithToppings} className="bg-blue-600 hover:bg-blue-700 sm:order-3">
               Có, thêm topping
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Animation Styles for Restock Notification */}
      <style>{`
        @keyframes green-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
            border-color: rgb(34, 197, 94);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
            border-color: rgb(34, 197, 94);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
            border-color: rgb(209, 213, 219);
          }
        }
        
        .restock-glow {
          animation: green-glow 2s ease-out;
          border: 2px solid rgb(34, 197, 94) !important;
        }
        
        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            display: none;
          }
        }
        
        .restock-badge-fade {
          animation: fade-out 3s ease-out forwards;
        }
        
        @keyframes green-ripple {
          0% {
            transform: scale(0.95);
            background-color: rgba(34, 197, 94, 0.1);
          }
          50% {
            transform: scale(1);
            background-color: rgba(34, 197, 94, 0.05);
          }
          100% {
            transform: scale(0.95);
            background-color: rgba(34, 197, 94, 0);
          }
        }
        
        .green-ripple {
          animation: green-ripple 0.4s ease-out;
        }
      `}</style>
      
      {/* Mobile Cart Toggle Bar */}
      <div className="bottom-0 left-0 right-0 bg-white border-t p-4 z-40 lg:hidden flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div>
          <p className="font-semibold text-slate-900 text-sm">
            {totalItems} món đang chọn
          </p>
          <p className="text-blue-600 font-bold text-lg">
            {displayTotalAmount.toLocaleString()}đ
          </p>
        </div>
        <Button
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Xem đơn hàng
        </Button>
      </div>
    </div>
  );
}
