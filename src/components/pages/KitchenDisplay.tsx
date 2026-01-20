import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock,
  ChevronRight,
  ChevronsRight,
  AlertCircle,
  Bell,
  BookOpen,
} from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { getKitchenItems, updateItemStatus, reportOutOfStock } from "../../api/order";
import { useAuth } from "../../contexts/AuthContext";

interface KitchenItem {
  id: string;
  itemName: string;
  totalQuantity: number; //sl còn chờ bếp làm ch xong
  completedQuantity: number; //sl đã làm xong
  table: string;
  timestamp: Date;
  notes?: string;
  outOfStock: boolean;
  outOfStockReason?: string;
  outOfStockIngredients?: string[];
  orderItemId?: string | number; // BE order item id for /orders/items/:id/status
  kitchenItemId?: string | number; // BE kitchen ticket id for /orders/kitchen/items/:id/status
}

interface Recipe {
  [key: string]: {
    name: string;
    ingredients: Array<{ name: string; quantity: string }>;
    steps: string[];
  };
}

export function KitchenDisplay() {
  const { hasPermission } = useAuth();
  // Out of stock modal states
  const [outOfStockModalOpen, setOutOfStockModalOpen] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState<
    string | null
  >(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");

  // Recipe modal states
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipeItemId, setSelectedRecipeItemId] = useState<
    string | null
  >(null);

  const recipes: Recipe = {
    "1": {
      name: "Cà phê sữa đá",
      ingredients: [
        { name: "Cà phê đen", quantity: "1-2 thìa" },
        { name: "Sữa đặc", quantity: "2 thìa" },
        { name: "Đá", quantity: "1 cốc" },
        { name: "Nước nóng", quantity: "150ml" },
      ],
      steps: [
        "Pha 1-2 thìa cà phê đen với nước nóng",
        "Thêm 2 thìa sữa đặc vào cốc",
        "Đổ cà phê đã pha vào cốc với sữa đặc",
        "Khuấy đều cho cà phê và sữa hòa lẫn",
        "Thêm đá vào cho đầy cốc",
        "Rót thêm sữa tươi lạnh nếu thích (tùy chọn)",
      ],
    },
    "2": {
      name: "Bạc xỉu",
      ingredients: [
        { name: "Cà phê đen", quantity: "1-2 thìa" },
        { name: "Sữa tươi lạnh", quantity: "100ml" },
        { name: "Đá", quantity: "1 cốc" },
      ],
      steps: [
        "Pha 1-2 thìa cà phê đen với nước nóng",
        "Để cà phê nguội một chút",
        "Thêm đá vào cốc",
        "Đổ cà phê vào",
        "Rót sữa tươi lạnh vào cốc (khoảng 1/3 cốc)",
        "Khuấy nhẹ nhàng trước khi uống",
      ],
    },
    "3": {
      name: "Trà đào cam sả",
      ingredients: [
        { name: "Trà đen", quantity: "1-2 túi" },
        { name: "Đào", quantity: "1/2 quả" },
        { name: "Cam", quantity: "1/4 quả" },
        { name: "Sả", quantity: "1 cây" },
        { name: "Đường", quantity: "2-3 thìa" },
        { name: "Đá", quantity: "1 cốc" },
        { name: "Nước nóng", quantity: "150ml" },
      ],
      steps: [
        "Pha trà đen với nước nóng, để 5 phút",
        "Lọc trà, để nguội",
        "Cắt đào, cam thành lát mỏng",
        "Cắt sả thành các đoạn nhỏ",
        "Thêm đá vào cốc",
        "Đổ trà vào, thêm đường theo khẩu vị",
        "Thêm lát đào, cam và sả vào cốc",
        "Khuấy đều và thưởng thức",
      ],
    },
    "4": {
      name: "Sinh tố bơ",
      ingredients: [
        { name: "Bơ", quantity: "1 quả" },
        { name: "Sữa tươi lạnh", quantity: "200ml" },
        { name: "Đường", quantity: "1-2 thìa" },
        { name: "Đá", quantity: "1/2 cốc" },
        { name: "Mật ong", quantity: "1 thìa (tùy chọn)" },
      ],
      steps: [
        "Cắt bơ thành từng miếng nhỏ, loại bỏ hạt",
        "Thêm bơ vào máy xay sinh tố",
        "Thêm 200ml sữa tươi lạnh",
        "Thêm 1-2 thìa đường hoặc mật ong",
        "Thêm một nắm đá",
        "Xay cho đến khi mịn và mượt",
        "Rót vào cốc và phục vụ ngay",
      ],
    },
    "5": {
      name: "Trà sữa trân châu",
      ingredients: [
        { name: "Trà đen", quantity: "1-2 túi" },
        { name: "Sữa tươi lạnh", quantity: "100ml" },
        { name: "Trân châu", quantity: "3-4 thìa" },
        { name: "Đường", quantity: "2-3 thìa" },
        { name: "Đá", quantity: "1 cốc" },
        { name: "Nước nóng", quantity: "150ml" },
      ],
      steps: [
        "Nấu trân châu đến khi trong và chín, khoảng 20-30 phút",
        "Pha trà đen với nước nóng, để 5 phút",
        "Lọc trà, thêm đường hòa tan",
        "Để trà nguội hoặc dùng trà lạnh",
        "Thêm trân châu vào cốc",
        "Đổ trà vào",
        "Thêm đá",
        "Rót sữa tươi lạnh vào",
        "Khuấy đều và phục vụ",
      ],
    },
    "6": {
      name: "Bánh croissant",
      ingredients: [
        { name: "Bột mì", quantity: "200g (chuẩn bị sẵn)" },
        { name: "Bơ", quantity: "100g (chuẩn bị sẵn)" },
        { name: "Muối", quantity: "1 thìa (chuẩn bị sẵn)" },
        { name: "Đường", quantity: "50g (chuẩn bị sẵn)" },
        { name: "Nước", quantity: "100ml (chuẩn bị sẵn)" },
      ],
      steps: [
        "Lấy bánh croissant từ lò nướng",
        "Để bánh nguội một chút trước khi phục vụ",
        "Có thể ấm lại bánh ở lò 180°C trong 5 phút nếu cần",
        "Phục vụ nóng hoặc ở nhiệt độ phòng",
        "Có thể dùng kèm với jam hoặc chocolate",
      ],
    },
    "7": {
      name: "Cà phê đen",
      ingredients: [
        { name: "Cà phê đen", quantity: "1.5-2 thìa" },
        { name: "Nước nóng", quantity: "180-200ml" },
      ],
      steps: [
        "Pha 1.5-2 thìa cà phê đen với nước nóng (180-200ml)",
        "Để cà phê 2-3 phút để hương vị thể hiện đầy đủ",
        "Khuấy nhẹ nhàng",
        "Rót vào cốc sạch",
        "Phục vụ ngay nóng",
      ],
    },
    "8": {
      name: "Sinh tố dâu",
      ingredients: [
        { name: "Dâu tây", quantity: "150g" },
        { name: "Sữa tươi lạnh", quantity: "200ml" },
        { name: "Đường", quantity: "1-2 thìa" },
        { name: "Đá", quantity: "1/2 cốc" },
        { name: "Yogurt", quantity: "2-3 thìa (tùy chọn)" },
      ],
      steps: [
        "Rửa sạch dâu tây",
        "Cắt dâu thành từng nửa hoặc cắt nhỏ",
        "Thêm dâu vào máy xay sinh tố",
        "Thêm 200ml sữa tươi lạnh",
        "Thêm 1-2 thìa đường hoặc mật ong",
        "Thêm một nắm đá",
        "Xay cho đến khi mịn và có màu hồng đều",
        "Rót vào cốc, trang trí với dâu nếu có",
        "Phục vụ ngay",
      ],
    },
    "9": {
      name: "Matcha latte",
      ingredients: [
        { name: "Bột matcha", quantity: "1.5 thìa" },
        { name: "Nước nóng", quantity: "50-70ml" },
        { name: "Sữa tươi lạnh", quantity: "150ml" },
        { name: "Đường", quantity: "1-2 thìa" },
        { name: "Đá", quantity: "1/2 cốc" },
      ],
      steps: [
        "Rây bột matcha mịn vào cốc",
        "Thêm 1-2 thìa đường vào",
        "Đổ 50-70ml nước nóng (không quá nóng để matcha không cát)",
        "Khuấy bằng cây đánh trà hoặc thìa cho đến mịn",
        "Thêm đá vào cốc to hơn",
        "Rót 150ml sữa tươi lạnh vào",
        "Khuấy đều hoặc để sữa nổi trên matcha (tùy thích)",
        "Phục vụ ngay",
      ],
    },
  };

  const availableIngredients = [
    "Sữa tươi",
    "Sữa đặc",
    "Trân châu",
    "Đá",
    "Cà phê",
    "Trà",
    "Đường",
    "Siro",
    "Kem tươi",
    "Đào",
  ];
  const [items, setItems] = useState<KitchenItem[]>([]);
  // Local cache to keep OOS tickets visible even if backend hides them temporarily
  const oosCacheRef = useRef<Record<string, KitchenItem>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Persist OOS cache across navigation using localStorage
  const OOS_CACHE_STORAGE_KEY = "kds_oos_cache";
  const loadOOSCache = (): Record<string, KitchenItem> => {
    try {
      const raw = localStorage.getItem(OOS_CACHE_STORAGE_KEY);
      if (!raw) return {};
      const parsed: Record<string, any> = JSON.parse(raw);
      const repaired: Record<string, KitchenItem> = {};
      Object.keys(parsed || {}).forEach((k) => {
        const v = parsed[k];
        repaired[k] = {
          ...v,
          timestamp: v?.timestamp ? new Date(v.timestamp) : new Date(),
          outOfStock: Boolean(v?.outOfStock),
        } as KitchenItem;
      });
      return repaired;
    } catch {
      return {};
    }
  };
  const saveOOSCache = (cache: Record<string, KitchenItem>) => {
    try {
      localStorage.setItem(OOS_CACHE_STORAGE_KEY, JSON.stringify(cache));
    } catch {}
  };

  const extractItems = (res: any): any[] => {
    const data = res?.data ?? res;

    // Common direct arrays
    let items = data?.metaData?.items ?? data?.items ?? data?.data;
    if (Array.isArray(items)) return items;
    if (Array.isArray(data?.metaData)) return data.metaData;
    if (Array.isArray(data)) return data;

    // Named collections frequently used by backends
    const md = data?.metaData ?? {};
    if (Array.isArray(md.kitchenItems)) return md.kitchenItems;
    if (Array.isArray(md.tickets)) return md.tickets;

    // Orders shape: metaData.orders[] with nested items
    const orders = md.orders ?? data?.orders;
    if (Array.isArray(orders)) {
      const flat: any[] = [];
      orders.forEach((ord: any) => {
        const tableName = ord?.table?.tableName ?? ord?.tableName ?? ord?.table ?? ord?.orderCode ?? "Bàn";
        const orderItems: any[] = ord?.items ?? ord?.orderItems ?? [];
        orderItems.forEach((it: any) => {
          flat.push({
            ...it,
            table: tableName,
            orderId: ord?.id ?? ord?.orderId,
          });
        });
      });
      return flat;
    }

    return [];
  };

  const mapKitchenItem = (it: any): KitchenItem => {
    const tableName = it?.table?.tableName ?? it?.tableName ?? it?.table ?? it?.orderCode ?? "Bàn";

    // Try multiple field names for quantities
    const rawQty = Number(
      it?.pendingQuantity ??
      it?.waitingQuantity ??
      it?.quantity ??
      it?.totalQuantity ??
      0
    );

    const rawCompleted = Number(
      it?.completedQuantity ??
      it?.doneQuantity ??
      it?.readyQuantity ??
      0
    );

    // Some APIs only give orderedQuantity + completed → infer pending
    const ordered = Number(it?.orderedQuantity ?? 0);
    const inferredPending = ordered > 0 ? Math.max(ordered - rawCompleted, 0) : undefined;

    const pendingQty = inferredPending ?? rawQty;
    const doneQty = rawCompleted;

    const ts = it?.updatedAt ?? it?.createdAt ?? Date.now();

    // Detect ids used by different endpoints
    const orderItemId = (
      it?.orderItemId ??
      it?.order_item_id ??
      it?.orderItem?.id ??
      it?.orderItemID ??
      it?.order_itemID ??
      it?.order_itemId
    );
    const kitchenItemId = it?.id ?? it?.ticketId ?? it?.kitchenItemId;

    return {
      // Prefer orderItemId so generic /orders/items/:id/status works
      id: String(orderItemId ?? kitchenItemId ?? `${tableName}-${it?.inventoryItemId ?? Date.now()}`),
      itemName: it?.itemName ?? it?.name ?? it?.inventoryItem?.name ?? "Món",
      totalQuantity: isNaN(pendingQty) ? 0 : pendingQty,
      completedQuantity: isNaN(doneQty) ? 0 : doneQty,
      table: String(tableName),
      timestamp: new Date(ts),
      notes: it?.notes ?? undefined,
      outOfStock: Boolean(it?.outOfStock ?? false),
      outOfStockReason: it?.outOfStockReason ?? undefined,
      outOfStockIngredients: Array.isArray(it?.outOfStockIngredients) ? it.outOfStockIngredients : undefined,
      orderItemId: orderItemId ? String(orderItemId) : undefined,
      kitchenItemId: kitchenItemId ? String(kitchenItemId) : undefined,
    };
  };

  const refreshKitchenItems = async () => {
    if (!hasPermission("kitchen:access" as any)) return;
    setIsLoading(true);
    try {
      const res = await getKitchenItems();
      const arr = extractItems(res);
      const fetched = arr.map(mapKitchenItem);

      // Merge with local OOS cache to preserve OOS flags (do NOT resurrect missing items)
      const mapByKey: Record<string, KitchenItem> = {};
      const getKey = (i: KitchenItem) => String(i.kitchenItemId ?? i.orderItemId ?? i.id);

      fetched.forEach((i) => {
        mapByKey[getKey(i)] = i;
      });

      // Only overlay OOS flags onto items that exist in the latest feed
      const cache = oosCacheRef.current;
      Object.keys(cache).forEach((key) => {
        if (mapByKey[key] && cache[key].outOfStock) {
          mapByKey[key] = {
            ...mapByKey[key],
            outOfStock: true,
            outOfStockReason: cache[key].outOfStockReason,
            outOfStockIngredients: cache[key].outOfStockIngredients,
          };
        }
      });

      setItems(Object.values(mapByKey));
    } catch (err: any) {
      toast.error("Không tải được danh sách món bếp", {
        description: err?.message || "Lỗi kết nối API",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load + visibility-aware polling (no WebSocket yet)
  useEffect(() => {
    if (!hasPermission("kitchen:access" as any)) return;

    let intervalId: any;
    const ACTIVE_MS = 5000; // poll every 5s when tab is visible

    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(() => refreshKitchenItems(), ACTIVE_MS);
    };
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Load persisted OOS cache so items remain visible across navigation
    oosCacheRef.current = loadOOSCache();
    // Always fetch once on mount
    refreshKitchenItems();

    // Start polling only when the document is visible
    if (!document.hidden) startPolling();

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
        // quick refresh upon returning to tab
        refreshKitchenItems();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  const getElapsedTime = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    return minutes;
  };

  const advanceOneUnit = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.totalQuantity <= 0) return;
    if (!item.orderItemId) {
      toast.error("Thiếu orderItemId từ API, không thể cập nhật trạng thái");
      return;
    }
    const payload = { action: "complete", quantity: 1 };
    updateItemStatus(item.orderItemId as any, payload)
      .then(() => {
        toast.success(`Hoàn thành 1 ly ${item.itemName}`);
        refreshKitchenItems();
      })
      .catch((err: any) => {
        toast.error("Cập nhật trạng thái thất bại", { description: err?.message || "API lỗi" });
      });
  };

  const advanceAllUnits = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.totalQuantity <= 0) return;
    if (!item.orderItemId) {
      toast.error("Thiếu orderItemId từ API, không thể cập nhật trạng thái");
      return;
    }
    const payload = { action: "complete", quantity: item.totalQuantity };
    updateItemStatus(item.orderItemId as any, payload)
      .then(() => {
        toast.success(`${item.itemName} hoàn thành tất cả`, { icon: <Bell className="w-4 h-4" /> });
        refreshKitchenItems();
      })
      .catch((err: any) => {
        toast.error("Cập nhật trạng thái thất bại", { description: err?.message || "API lỗi" });
      });
  };

  const openOutOfStockModal = (itemId: string) => {
    setSelectedItemForStock(itemId);
    setOutOfStockModalOpen(true);
    setSelectedIngredients([]);
    setOtherReason("");
  };

  const handleOutOfStockSubmit = () => {
    if (selectedIngredients.length === 0 && !otherReason.trim()) {
      toast.error("Vui lòng chọn nguyên liệu hoặc ghi chú lý do");
      return;
    }

    if (!selectedItemForStock) return;
    const reasonText = selectedIngredients.length > 0 ? selectedIngredients.join(", ") : otherReason;
    reportOutOfStock(selectedItemForStock, {
      ingredients: selectedIngredients,
      reason: otherReason.trim() || reasonText,
    })
      .then(() => {
        toast.error(`Đã báo hết nguyên liệu: ${reasonText}`);
        // Optimistically mark and cache the item as out-of-stock so it stays visible
        setItems((prev) => {
          const updated = prev.map((i) => {
            const key = String(i.kitchenItemId ?? i.orderItemId ?? i.id);
            if (key === String(selectedItemForStock)) {
              const oosItem = {
                ...i,
                outOfStock: true,
                outOfStockReason: reasonText,
                outOfStockIngredients: selectedIngredients,
                // When OOS, keep at least one unit visible even if backend sets pending to 0
                totalQuantity: Math.max(i.totalQuantity, 0),
              };
              oosCacheRef.current[key] = oosItem;
              saveOOSCache(oosCacheRef.current);
              return oosItem;
            }
            return i;
          });
          return updated;
        });
        setOutOfStockModalOpen(false);
        setSelectedItemForStock(null);
        refreshKitchenItems();
      })
      .catch((err: any) => {
        toast.error("Báo hết nguyên liệu thất bại", { description: err?.message || "API lỗi" });
      });
  };

  const markIngredientsRestocked = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (!item.orderItemId) {
      toast.error("Thiếu orderItemId từ API, không thể cập nhật trạng thái");
      return;
    }

    // Prefer explicit status transition understood by most backends
    try {
      await updateItemStatus(item.orderItemId as any, { status: "preparing" });
      toast.success("Đã bổ sung nguyên liệu, tiếp tục làm món");
      // Remove from local OOS cache and clear flags locally
      const key = String(item.kitchenItemId ?? item.orderItemId ?? item.id);
      delete oosCacheRef.current[key];
      saveOOSCache(oosCacheRef.current);
      setItems((prev) => prev.map((i) => {
        const k = String(i.kitchenItemId ?? i.orderItemId ?? i.id);
        return k === key ? { ...i, outOfStock: false, outOfStockReason: undefined, outOfStockIngredients: undefined } : i;
      }));
      await refreshKitchenItems();
      return;
    } catch (e1: any) {
      // Fallback to action-based API if backend expects it
      try {
        await updateItemStatus(item.orderItemId as any, { action: "ingredients-restocked" });
        toast.success("Đã bổ sung nguyên liệu, tiếp tục làm món");
        const key = String(item.kitchenItemId ?? item.orderItemId ?? item.id);
        delete oosCacheRef.current[key];
        saveOOSCache(oosCacheRef.current);
        setItems((prev) => prev.map((i) => {
          const k = String(i.kitchenItemId ?? i.orderItemId ?? i.id);
          return k === key ? { ...i, outOfStock: false, outOfStockReason: undefined, outOfStockIngredients: undefined } : i;
        }));
        await refreshKitchenItems();
        return;
      } catch (e2: any) {
        toast.error("Cập nhật nguyên liệu thất bại", { description: e2?.message || e1?.message || "API lỗi" });
      }
    }
  };

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const openRecipeModal = (itemId: string) => {
    setSelectedRecipeItemId(itemId);
    setRecipeModalOpen(true);
  };

  // Separate items into two columns
  // Keep out-of-stock items visible even if backend sets quantity to 0
  const pendingItems = items.filter((item) => item.totalQuantity > 0 || item.outOfStock);
  const inProgressItems = items.filter((item) => item.completedQuantity > 0);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-blue-900 text-2xl font-semibold mb-1">Màn hình pha chế - Theo món</h1>
            <p className="text-sm text-slate-600">
              {pendingItems.length} món chờ • {inProgressItems.length} món đang làm
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={refreshKitchenItems}
            title="Làm mới"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Column 1: Chờ chế biến */}
          <div className="flex flex-col h-full border-r border-slate-200 bg-slate-50">
            <div className="px-4 lg:px-6 py-2.5 border-b bg-white flex-shrink-0">
              <h3 className="text-slate-900">
                {isLoading ? "Đang tải..." : `Chờ chế biến (${pendingItems.length})`}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 min-h-0 max-h-[calc(100vh-150px)]">
              {pendingItems.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có món chờ</p>
                </div>
              ) : (
                pendingItems.map((item) => {
                  const elapsedMinutes = getElapsedTime(item.timestamp);

                  return (
                    <Card
                      key={item.id}
                      className="shadow-sm border border-slate-200"
                    >
                      <div className="p-3 flex items-center gap-3">
                        {/* Left: Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="font-semibold text-slate-900">
                              {item.totalQuantity}x {item.itemName}
                            </h2>
                            {item.outOfStock && (
                              <Badge className="bg-yellow-500 text-white text-xs h-5">
                                Hết nguyên liệu
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                            <span>{item.table}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {elapsedMinutes} phút
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-500 mt-1">
                              Ghi chú: {item.notes}
                            </p>
                          )}
                          {item.outOfStock && item.outOfStockReason && (
                            <p className="text-xs text-yellow-700 mt-1">
                              Thiếu: {item.outOfStockReason}
                            </p>
                          )}
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {item.outOfStock ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                              onClick={() => markIngredientsRestocked(item.id)}
                              disabled={!item.orderItemId}
                              title={!item.orderItemId ? "Thiếu orderItemId từ API" : undefined}
                            >
                              Đã bổ sung
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="h-9 w-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                                onClick={() => advanceOneUnit(item.id)}
                                disabled={!item.orderItemId}
                                title={!item.orderItemId ? "Thiếu orderItemId từ API" : "Hoàn thành 1"}
                                title="Hoàn thành 1"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-9 w-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                                onClick={() => advanceAllUnits(item.id)}
                                disabled={!item.orderItemId}
                                title={!item.orderItemId ? "Thiếu orderItemId từ API" : "Hoàn thành tất cả"}
                                title="Hoàn thành tất cả"
                              >
                                <ChevronsRight className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-yellow-600"
                            onClick={() => openRecipeModal(item.id)}
                            title="Xem công thức"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                            onClick={() => openOutOfStockModal(String((item as any).kitchenItemId ?? item.id))}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Đã xong / Chờ cung ứng */}
          <div className="flex flex-col h-full bg-slate-50">
            <div className="px-4 lg:px-6 py-2.5 border-b bg-white flex-shrink-0">
              <h3 className="text-slate-900">
                Đã xong / Chờ cung ứng ({inProgressItems.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2 min-h-0 max-h-[calc(100vh-150px)]">
              {inProgressItems.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có món đang làm</p>
                </div>
              ) : (
                inProgressItems.map((item) => {
                  const elapsedMinutes = getElapsedTime(item.timestamp);
                  const totalItems =
                    item.completedQuantity + item.totalQuantity;

                  return (
                    <Card
                      key={item.id}
                      className="shadow-sm border border-slate-200 bg-green-50"
                    >
                      <div className="p-3 flex items-center gap-3">
                        {/* Left: Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-slate-900 font-semibold">
                              {item.completedQuantity}x {item.itemName}
                            </h2>
                            <Badge className="bg-green-600 text-white text-xs h-5">
                              Đã làm {item.completedQuantity}/{totalItems}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                            <span>{item.table}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {elapsedMinutes} phút
                            </span>
                          </div>
                          {item.totalQuantity > 0 && (
                            <p className="text-xs text-amber-700 mt-1">
                              Chờ làm thêm {item.totalQuantity}/{totalItems}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-slate-500 mt-1">
                              Ghi chú: {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            className="h-9 w-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                            onClick={() => advanceOneUnit(item.id)}
                            disabled={!item.orderItemId}
                            title={!item.orderItemId ? "Thiếu orderItemId từ API" : undefined}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-9 w-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                            onClick={() => advanceAllUnits(item.id)}
                            disabled={!item.orderItemId}
                            title={!item.orderItemId ? "Thiếu orderItemId từ API" : undefined}
                          >
                            <ChevronsRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-yellow-600"
                            onClick={() => openRecipeModal(item.id)}
                            title="Xem công thức"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Out of Stock Modal */}
      <Dialog open={outOfStockModalOpen} onOpenChange={setOutOfStockModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Báo hết nguyên liệu</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-3 block">Chọn nguyên liệu hết hàng:</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableIngredients.map((ingredient) => (
                  <div key={ingredient} className="flex items-center space-x-2">
                    <Checkbox
                      id={ingredient}
                      checked={selectedIngredients.includes(ingredient)}
                      onCheckedChange={() => toggleIngredient(ingredient)}
                    />
                    <label
                      htmlFor={ingredient}
                      className="text-sm cursor-pointer"
                    >
                      {ingredient}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="other-reason" className="mb-2 block">
                Hoặc ghi chú lý do khác:
              </Label>
              <Textarea
                id="other-reason"
                placeholder="Nhập lý do..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOutOfStockModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleOutOfStockSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận hết hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Modal */}
      <Dialog open={recipeModalOpen} onOpenChange={setRecipeModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Công thức pha chế
            </DialogTitle>
          </DialogHeader>

          {selectedRecipeItemId && recipes[selectedRecipeItemId] ? (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {recipes[selectedRecipeItemId].name}
                </h3>
              </div>

              <div>
                <Label className="font-semibold text-slate-700 mb-2 block">
                  Nguyên liệu:
                </Label>
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-3 py-2 text-left text-sm font-semibold text-slate-700">
                        Tên nguyên liệu
                      </th>
                      <th className="border border-slate-300 px-3 py-2 text-left text-sm font-semibold text-slate-700">
                        Định lượng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes[selectedRecipeItemId].ingredients.map(
                      (ingredient, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                          <td className="border border-slate-300 px-3 py-2 text-sm text-slate-600">
                            {ingredient.name}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                            {ingredient.quantity}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <Label className="font-semibold text-slate-700 mb-2 block">
                  Các bước thực hiện:
                </Label>
                <ol className="space-y-2">
                  {recipes[selectedRecipeItemId].steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">
                        {idx + 1}.
                      </span>{" "}
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">Chưa có công thức cho món này</p>
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setRecipeModalOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
