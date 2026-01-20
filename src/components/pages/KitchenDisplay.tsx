import { useState, useEffect } from "react";
import {
  Clock,
  ChevronRight,
  ChevronsRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  RefreshCw,
  LayoutList,
  LayoutGrid,
  PackageCheck,
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
import { getKitchenItems, updateItemStatus, updateOrderItem } from "../../api/order";
import { getItemRecipe, reportOutOfStock } from "../../api/kitchen";
import { useAuth } from "../../contexts/AuthContext";

interface KitchenItem {
  id: string;
  orderItemId?: number;
  itemName: string;
  totalQuantity: number;
  completedQuantity: number;
  table: string;
  tableName?: string;
  orderId?: number;
  orderCode?: string;
  timestamp: Date;
  notes?: string;
  outOfStock: boolean;
  outOfStockReason?: string;
  outOfStockIngredients?: string[];
  customization?: any;
  status?: string;
}

interface RecipeData {
  itemName: string;
  ingredients: Array<{ name: string; quantity: string; unit?: string }>;
}

export function KitchenDisplay() {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // OOS Modal
  const [outOfStockModalOpen, setOutOfStockModalOpen] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");

  // Recipe Modal
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeData | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const [viewMode, setViewMode] = useState<'item' | 'table'>('item');
  const [items, setItems] = useState<KitchenItem[]>([]);

  const fetchKitchenItems = async () => {
    setLoading(true);
    try {
      const res = await getKitchenItems({ status: 'all' }); // Fetch ALL relevant statuses
      const data = res?.data?.metaData ?? res?.data ?? res;
      const apiItems = Array.isArray(data) ? data : (data?.items ?? []);
      
      if (Array.isArray(apiItems)) {
        const mapped: KitchenItem[] = apiItems.map((item: any) => ({
          id: String(item.id ?? item.orderItemId ?? Date.now()),
          orderItemId: item.orderItemId ?? item.id,
          itemName: item.itemName ?? item.name ?? item.inventoryItem?.name ?? 'Món',
          totalQuantity: Number(item.quantity ?? 1),
          status: String(item.status ?? '').toLowerCase(),
          completedQuantity: item.status === 'completed' ? Number(item.quantity ?? 1) : 0,
          table: item.tableName ?? item.table ?? item.order?.table?.tableName ?? 'Mang về',
          orderId: item.orderId ?? item.order?.id,
          orderCode: item.orderCode ?? item.order?.orderCode,
          timestamp: new Date(item.createdAt ?? item.updatedAt ?? Date.now()),
          notes: item.notes,
          outOfStock: item.status === 'waiting-ingredient' || item.status === 'out-of-stock', // Check status directly
          outOfStockReason: item.notes, // Notes often contain the OOS reason
          outOfStockIngredients: [], 
          customization: item.customization,
        }));
        setItems(mapped);
      }
    } catch (err: any) {
      console.error('Failed to fetch kitchen items:', err);
      toast.error("Không tải được danh sách món");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenItems();
    const interval = setInterval(fetchKitchenItems, 10000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = (timestamp: Date) => {
    return Math.floor((Date.now() - timestamp.getTime()) / 60000);
  };

  const handleCompleteItem = async (itemId: string, all: boolean = true) => {
    if (!hasPermission('kitchen:complete' as any)) return toast.error("Không có quyền");
    try {
      await updateItemStatus(itemId, { status: 'completed', all });
      toast.success("Đã hoàn thành");
      fetchKitchenItems();
    } catch (err) { toast.error("Lỗi cập nhật"); }
  };

  const handleServeItem = async (itemId: string, all: boolean = true) => {
    if (!hasPermission('kitchen:deliver' as any)) return toast.error("Không có quyền");
    try {
      await updateItemStatus(itemId, { status: 'served', all });
      toast.success("Đã cung ứng");
      fetchKitchenItems();
    } catch (err) { toast.error("Lỗi cập nhật"); }
  };

  // Restore status from Waiting Ingredient -> Preparing
  const handleRestockItem = async (itemId: string) => {
     try {
        const item = items.find(i => i.id === itemId);
        if (!item?.orderId) {
            toast.error("Không tìm thấy thông tin đơn hàng");
            return;
        }

        // Use generic update to reset status AND clear notes (OOS reason)
        await updateOrderItem(item.orderId, itemId, { 
            status: 'preparing', 
            notes: '' // Clear OOS notes
        }); 
        
        toast.success("Đã cập nhật: Có nguyên liệu");
        fetchKitchenItems();
     } catch(err) { 
         console.error(err);
         toast.error("Lỗi cập nhật"); 
     }
  }

  // Fetch Recipe for Viewing
  const handleViewRecipe = async (itemId: string) => {
      setLoadingRecipe(true);
      setRecipeModalOpen(true);
      setCurrentRecipe(null);
      try {
          const res = await getItemRecipe(itemId);
          console.log(res.data);
          setCurrentRecipe(res.data.metaData);
      } catch (err) {
          toast.error("Không tải được công thức");
          setRecipeModalOpen(false);
      } finally {
          setLoadingRecipe(false);
      }
  }

  // Open OOS Modal - Fetch recipe first to show ingredients
  const openOutOfStockModal = async (itemId: string) => {
    setSelectedItemForStock(itemId);
    setOutOfStockModalOpen(true);
    setSelectedIngredients([]);
    setOtherReason("");
    setRecipeIngredients([]); // Clear previous
    
    // Fetch ingredients for selection
    try {
        const res = await getItemRecipe(itemId);
        if (res.data?.metaData.ingredients) {
            setRecipeIngredients(res.data.metaData.ingredients.map((i: any) => i.name));
        }
    } catch (err) {
        // Fail silently or show empty list
    }
  };

  const handleOutOfStockSubmit = async () => {
    if (!selectedItemForStock) return;
    try {
        await reportOutOfStock(selectedItemForStock, {
            ingredients: selectedIngredients,
            reason: otherReason
        });
        toast.success("Đã báo hết nguyên liệu");
        setOutOfStockModalOpen(false);
        fetchKitchenItems();
    } catch (err) {
        toast.error("Lỗi báo hết hàng");
    }
  };

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient) ? prev.filter((i) => i !== ingredient) : [...prev, ingredient]
    );
  };

  // Filter Items
  // Pending = 'preparing' OR 'waiting-ingredient' OR 'pending' (just in case)
  // Completed = 'completed'
  const pendingItems = items.filter((item) => ['preparing', 'pending', 'waiting-ingredient', 'out-of-stock'].includes(item.status || ''));
  const completedItems = items.filter((item) => item.status === 'completed');

  // Grouping for Table View
  const groupedPendingTasks = pendingItems.reduce((acc, item) => {
    const key = item.table || 'Khác';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, KitchenItem[]>);

  const pendingTableGroups = Object.entries(groupedPendingTasks).map(([tableName, groupItems]) => {
     const startTime = new Date(Math.min(...groupItems.map(i => i.timestamp.getTime())));
     return { tableName, items: groupItems, startTime };
  }).sort((a,b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-1">Màn hình pha chế</h1>
          <p className="text-sm text-slate-600">{pendingItems.length} món đang làm • {completedItems.length} món chờ cung ứng</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchKitchenItems}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <Button variant={viewMode === 'item' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('item')}><LayoutList className="w-4 h-4 mr-2" />Theo món</Button>
                <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')}><LayoutGrid className="w-4 h-4 mr-2" />Theo bàn</Button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* LEFT: PENDING */}
          <div className="flex flex-col h-full border-r border-slate-200 bg-slate-50 overflow-y-auto">
             <div className="px-4 py-2.5 border-b bg-white"><h3 className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Đang chế biến ({pendingItems.length})</h3></div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {/* Item View */}
                 {viewMode === 'item' && pendingItems.length === 0 && (
                     <div className="text-center py-12 text-slate-400">
                         <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                             <CheckCircle2 className="w-8 h-8 text-green-500" />
                         </div>
                         <p className="font-medium text-slate-600">Không có món đang chờ</p>
                         <p className="text-sm">Hiện tại không có món nào cần chế biến</p>
                     </div>
                 )}
                 {viewMode === 'item' && pendingItems.map(item => (
                    <Card key={item.id} className={`shadow-sm border p-3 ${item.status === 'waiting-ingredient' || item.status === 'out-of-stock' ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg text-slate-900">{item.totalQuantity}x {item.itemName}</span>
                                    <Badge variant="outline" className="bg-white">{item.table}</Badge>
                                    {(item.status === 'waiting-ingredient' || item.status === 'out-of-stock') && (
                                        <Badge variant="destructive" className="animate-pulse">Chờ nguyên liệu</Badge>
                                    )}
                                </div>
                                <div className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Clock className="w-3 h-3" />{getElapsedTime(item.timestamp)} phút trước</div>
                                {item.notes && <div className="mt-2 text-amber-700 bg-amber-50 p-2 rounded text-sm border border-amber-100">Note: {item.notes}</div>}
                                {(item.customization as any) && (
                                   <div className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                      <div className="flex flex-wrap gap-2 mb-1">
                                         {(item.customization as any).sugarLevel && <span className="bg-white px-1.5 py-0.5 rounded border text-xs">Đường: {(item.customization as any).sugarLevel}</span>}
                                         {(item.customization as any).iceLevel && <span className="bg-white px-1.5 py-0.5 rounded border text-xs">Đá: {(item.customization as any).iceLevel}</span>}
                                      </div>
                                      {(item.customization as any).toppings?.length > 0 && (
                                         <div className="text-xs text-slate-500">Topping: {(item.customization as any).toppings.map((t: any) => t.name).join(', ')}</div>
                                      )}
                                   </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                {item.status !== 'waiting-ingredient' && item.status !== 'out-of-stock' ? (
                                    <>
                                        {hasPermission('kitchen:complete' as any) && (
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" className="text-blue-600 px-2 h-8" onClick={() => handleCompleteItem(item.id, false)}><ChevronRight className="w-5 h-5" /></Button>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 px-2 h-8" onClick={() => handleCompleteItem(item.id, true)}><ChevronsRight className="w-5 h-5" /></Button>
                                            </div>
                                        )}
                                        <div className="flex gap-1 justify-end">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => handleViewRecipe(item.orderItemId ? String(item.orderItemId) : item.id)}><BookOpen className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => openOutOfStockModal(item.orderItemId ? String(item.orderItemId) : item.id)}><AlertCircle className="w-4 h-4" /></Button>
                                        </div>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 h-8" onClick={() => handleRestockItem(item.orderItemId ? String(item.orderItemId) : item.id)}>
                                        <PackageCheck className="w-4 h-4 mr-1" />
                                        Đã có NL
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                 ))}
                 
                 {/* Table View loop (Simplified for brevity, similar logic) */}
                 {viewMode === 'table' &&  pendingTableGroups.length === 0 && (
                     <div className="text-center py-12 text-slate-400">
                         <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                             <CheckCircle2 className="w-8 h-8 text-green-500" />
                         </div>
                         <p className="font-medium text-slate-600">Trống bàn</p>
                         <p className="text-sm">Hiện không có bàn nào đang chờ chế biến</p>
                     </div>
                 )}
                 {viewMode === 'table' && pendingTableGroups.map(group => (
                    <Card key={group.tableName} className="shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
                            <span className="font-semibold text-blue-900">{group.tableName}</span>
                            <span className="text-xs text-blue-700">{getElapsedTime(group.startTime)} phút</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {group.items.map(item => (
                                <div key={item.id} className={`p-3 flex justify-between items-center ${item.status === 'waiting-ingredient' ? 'bg-red-50' : 'bg-white'}`}>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900">{item.totalQuantity}x {item.itemName}</div>
                                        {item.status === 'waiting-ingredient' && <span className="text-xs text-red-600 font-medium block">Đang chờ nguyên liệu...</span>}
                                    </div>
                                    <div className="flex gap-1">
                                       {item.status !== 'waiting-ingredient' ? (
                                            <>
                                                <Button size="sm" variant="ghost" className="text-blue-600 w-8 h-8 p-0" onClick={() => handleCompleteItem(item.id, false)}><ChevronRight className="w-4 h-4" /></Button>
                                                <Button size="sm" variant="ghost" className="text-blue-600 w-8 h-8 p-0" onClick={() => handleCompleteItem(item.id, true)}><ChevronsRight className="w-4 h-4" /></Button>
                                            </>
                                       ) : (
                                            <Button size="sm" variant="ghost" className="text-green-600 h-8 px-2" onClick={() => handleRestockItem(item.id)}><PackageCheck className="w-4 h-4" /></Button>
                                       )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                 ))}
             </div>
          </div>

          {/* RIGHT: COMPLETED */}
          <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
             <div className="px-4 py-2.5 border-b bg-white"><h3 className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>Đã xong/chờ cung ứng ({completedItems.length})</h3></div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {completedItems.length === 0 && (
                     <div className="text-center py-12 text-slate-400">
                         <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                             <CheckCircle2 className="w-8 h-8 text-slate-300" />
                         </div>
                         <p className="font-medium text-slate-600">Không có món nào chờ cung ứng</p>
                         <p className="text-sm">Các món đã xong sẽ hiển thị ở đây</p>
                     </div>
                 )}
                 {completedItems.map(item => (
                    <Card key={item.id} className="shadow-sm border border-green-200 bg-green-50 p-3 opacity-90 hover:opacity-100">
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-800">{item.totalQuantity}x {item.itemName}</span>
                                    <Badge variant="outline" className="text-green-700 bg-white">Xong</Badge>
                                </div>
                                <div className="text-sm text-slate-500 mt-1">{item.table} • {getElapsedTime(item.timestamp)} phút trước</div>
                            </div>
                            {hasPermission('kitchen:deliver' as any) && (
                                <div className="flex gap-1">
                                    <Button className="bg-white text-green-700 border border-green-200" size="sm" onClick={() => handleServeItem(item.id, false)}><ChevronRight className="w-4 h-4" /></Button>
                                    <Button className="bg-green-600 text-white" size="sm" onClick={() => handleServeItem(item.id, true)}><ChevronsRight className="w-4 h-4" /></Button>
                                </div>
                            )}
                        </div>
                    </Card>
                 ))}
             </div>
          </div>
      </div>

      {/* OOS Modal */}
      <Dialog open={outOfStockModalOpen} onOpenChange={setOutOfStockModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Báo hết nguyên liệu</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-3 block">Chọn nguyên liệu hết hàng:</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {recipeIngredients.length > 0 ? recipeIngredients.map((ingredient) => (
                  <div key={ingredient} className="flex items-center space-x-2">
                    <Checkbox id={ingredient} checked={selectedIngredients.includes(ingredient)} onCheckedChange={() => toggleIngredient(ingredient)} />
                    <label htmlFor={ingredient} className="text-sm cursor-pointer">{ingredient}</label>
                  </div>
                )) : <p className="text-sm text-slate-500 col-span-2">Không tìm thấy thông tin nguyên liệu cho món này.</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="other-reason" className="mb-2 block">Ghi chú thêm:</Label>
              <Textarea id="other-reason" placeholder="Nhập lý do..." value={otherReason} onChange={(e) => setOtherReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOutOfStockModalOpen(false)}>Hủy</Button><Button onClick={handleOutOfStockSubmit} className="bg-red-600 hover:bg-red-700">Xác nhận hết hàng</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recipe Modal */}
       <Dialog open={recipeModalOpen} onOpenChange={setRecipeModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Công thức pha chế</DialogTitle></DialogHeader>
           {loadingRecipe ? (
               <div className="py-8 text-center text-slate-500"><RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />Đang tải...</div>
           ) : currentRecipe ? (
               <div className="flex-1 overflow-y-auto pr-2">
                   <h3 className="font-bold text-lg text-slate-900 mb-4">{currentRecipe.itemName}</h3>
                   <div className="space-y-1">
                       {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 ? (
                           currentRecipe.ingredients.map((ing, idx) => (
                               <div key={idx} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                                   <span className="text-slate-700">{ing.name}</span>
                                   <span className="font-medium text-slate-900">{ing.quantity} {ing.unit}</span>
                               </div>
                           ))
                       ) : (
                           <div className="text-center text-slate-500 py-4">Chưa có thông tin nguyên liệu</div>
                       )}
                   </div>
               </div>
           ) : (
                <div className="py-8 text-center text-slate-500">Không tìm thấy công thức</div>
           )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
