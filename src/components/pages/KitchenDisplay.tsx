import { useState } from "react";
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
}

interface Recipe {
  [key: string]: {
    name: string;
    ingredients: Array<{ name: string; quantity: string }>;
    steps: string[];
  };
}

export function KitchenDisplay() {
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

  const [items, setItems] = useState<KitchenItem[]>([
    {
      id: "1",
      itemName: "Cà phê sữa đá",
      totalQuantity: 3,
      completedQuantity: 0,
      table: "Bàn 3",
      timestamp: new Date(Date.now() - 12 * 60000),
      outOfStock: false,
    },
    {
      id: "2",
      itemName: "Bạc xỉu",
      totalQuantity: 1,
      completedQuantity: 0,
      table: "Bàn 3",
      timestamp: new Date(Date.now() - 12 * 60000),
      notes: "Ít đường",
      outOfStock: false,
    },
    {
      id: "3",
      itemName: "Trà đào cam sả",
      totalQuantity: 2,
      completedQuantity: 1,
      table: "Bàn 7",
      timestamp: new Date(Date.now() - 8 * 60000),
      outOfStock: false,
    },
    {
      id: "4",
      itemName: "Sinh tố bơ",
      totalQuantity: 2,
      completedQuantity: 2,
      table: "Bàn 7",
      timestamp: new Date(Date.now() - 8 * 60000),
      outOfStock: false,
    },
    {
      id: "5",
      itemName: "Trà sữa trân châu",
      totalQuantity: 2,
      completedQuantity: 0,
      table: "Bàn 12",
      timestamp: new Date(Date.now() - 5 * 60000),
      notes: "Extra trân châu",
      outOfStock: true,
      outOfStockReason: "Trân châu",
      outOfStockIngredients: ["Trân châu"],
    },
    {
      id: "6",
      itemName: "Bánh croissant",
      totalQuantity: 2,
      completedQuantity: 0,
      table: "Bàn 12",
      timestamp: new Date(Date.now() - 5 * 60000),
      outOfStock: false,
    },
    {
      id: "7",
      itemName: "Cà phê đen",
      totalQuantity: 3,
      completedQuantity: 2,
      table: "Mang về",
      timestamp: new Date(Date.now() - 6 * 60000),
      outOfStock: false,
    },
    {
      id: "8",
      itemName: "Sinh tố dâu",
      totalQuantity: 1,
      completedQuantity: 0,
      table: "Bàn 5",
      timestamp: new Date(Date.now() - 2 * 60000),
      outOfStock: false,
    },
    {
      id: "9",
      itemName: "Matcha latte",
      totalQuantity: 2,
      completedQuantity: 0,
      table: "Bàn 4",
      timestamp: new Date(Date.now() - 2 * 60000),
      outOfStock: false,
    },
  ]);

  const getElapsedTime = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    return minutes;
  };

  const advanceOneUnit = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.totalQuantity <= 0) return;

    const newTotalQty = item.totalQuantity - 1;

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              totalQuantity: newTotalQty,
              completedQuantity: item.completedQuantity + 1,
            }
          : i
      )
    );

    toast.success(`Hoàn thành 1 ly ${item.itemName} (Còn ${newTotalQty} ly)`);
  };

  const advanceAllUnits = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.totalQuantity <= 0) return;

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              totalQuantity: 0,
              completedQuantity: item.completedQuantity + item.totalQuantity,
            }
          : i
      )
    );

    toast.success(
      `${item.itemName} hoàn thành tất cả ${item.totalQuantity} ly`,
      {
        icon: <Bell className="w-4 h-4" />,
      }
    );
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

    const reasonText =
      selectedIngredients.length > 0
        ? selectedIngredients.join(", ")
        : otherReason;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== selectedItemForStock) return item;
        return {
          ...item,
          outOfStock: true,
          outOfStockReason: reasonText,
          outOfStockIngredients: selectedIngredients,
        };
      })
    );

    toast.error(`Đã báo hết nguyên liệu: ${reasonText}`);
    setOutOfStockModalOpen(false);
    setSelectedItemForStock(null);
  };

  const markIngredientsRestocked = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          outOfStock: false,
          outOfStockReason: undefined,
          outOfStockIngredients: undefined,
        };
      })
    );

    toast.success("Đã bổ sung nguyên liệu, tiếp tục làm món");
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
  const pendingItems = items.filter((item) => item.totalQuantity > 0);
  const inProgressItems = items.filter((item) => item.completedQuantity > 0);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 lg:px-6 py-3">
        <h1 className="text-blue-900 text-2xl font-semibold mb-1">Màn hình pha chế - Theo món</h1>
        <p className="text-sm text-slate-600">
          {pendingItems.length} món chờ • {inProgressItems.length} món đang làm
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Column 1: Chờ chế biến */}
          <div className="flex flex-col h-full border-r border-slate-200 bg-slate-50">
            <div className="px-4 lg:px-6 py-2.5 border-b bg-white flex-shrink-0">
              <h3 className="text-slate-900">
                Chờ chế biến ({pendingItems.length})
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
                            >
                              Đã bổ sung
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="h-9 w-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                                onClick={() => advanceOneUnit(item.id)}
                                title="Hoàn thành 1"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-9 w-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                                onClick={() => advanceAllUnits(item.id)}
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
                            onClick={() => openOutOfStockModal(item.id)}
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
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-9 w-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                            onClick={() => advanceAllUnits(item.id)}
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
