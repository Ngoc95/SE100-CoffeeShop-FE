import { useState, Fragment, ChangeEvent, useEffect } from "react";
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  Calendar,
  TrendingDown,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  Layers,
  Box,
  X,
  Upload,
  Download,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { inventoryService } from "../../services/inventoryService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Progress } from "../ui/progress";
import { categories } from "../../data/categories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ImageUploadWithCrop } from "../ImageUploadWithCrop";
import { ImportExcelDialog } from "../ImportExcelDialog";
import { ExportExcelDialog } from "../ExportExcelDialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  InventoryItem,
  ItemType,
  SortField,
  SortOrder,
  BatchInfo,
  CompositeIngredient,
} from "../../types/inventory"

import { useAuth } from "../../contexts/AuthContext";

type AddFailureEntry = {
  id: string;
  name: string;
  reason: string;
  timestamp: string;
  itemType?: ItemType;
};

export function Inventory() {

  const { hasPermission, user } = useAuth();
  const canCreate = hasPermission('goods_inventory:create');
  const canUpdate = hasPermission('goods_inventory:update');
  const canDelete = hasPermission('goods_inventory:delete');

  const [addDialogValues, setAddDialogValues] = useState({
    name: "",
    categoryId: "",
    unitId: "",
    minStock: 0,
    maxStock: 0,
    sellingPrice: 0,
  });

  // State for new Category/Unit creation
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newUnitValues, setNewUnitValues] = useState({ name: "", symbol: "" });

  // Categories/Units from API
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [unitOptions, setUnitOptions] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Load categories from API
  useEffect(() => {
    setLoadingCategories(true);
    inventoryService.getCategories()
      .then((res) => {
        // API có thể trả { metaData: [...] } hoặc { metaData: { items: [...] } } hoặc { items: [...] } hoặc [...]
        let arr: any[] = [];
        if (Array.isArray(res?.metaData)) arr = res.metaData;
        else if (res?.metaData?.items && Array.isArray(res.metaData.items)) arr = res.metaData.items;
        else if (res?.items && Array.isArray(res.items)) arr = res.items;
        else if (Array.isArray(res)) arr = res;
        // Đảm bảo id là string cho Select
        setCategoryOptions(arr.map((c) => ({ ...c, id: String(c.id) })));
      })
      .catch(() => setCategoryOptions([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Load units from API
  useEffect(() => {
    setLoadingUnits(true);
    inventoryService
      .getUnits()
      .then((res) => {
        const units = Array.isArray(res?.metaData)
          ? res.metaData
          : Array.isArray(res)
            ? res
            : [];

        setUnitOptions(units.map((unit: any) => ({
          ...unit,
          id: String(unit.id),
        })));
      })
      .catch(() => setUnitOptions([]))
      .finally(() => setLoadingUnits(false));
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "all",
  ]);
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([
    "ready-made",
    "composite",
    "ingredient",
  ]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>([
    "good",
    "low",
    "expiring",
    "expired",
    "critical",
  ]);
  const [selectedProductStatuses, setSelectedProductStatuses] = useState<string[]>([
    "selling",
    "paused",
    "not_running",
    "hot",
  ]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFailureEntries, setAddFailureEntries] = useState<AddFailureEntry[]>([]);
  const [addItemType, setAddItemType] = useState<ItemType>("ready-made");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [activeTab, setActiveTab] = useState<ItemType>("ready-made");
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addIngredientDialogOpen, setAddIngredientDialogOpen] = useState(false);
  const [addUnitDialogOpen, setAddUnitDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<
    CompositeIngredient[]
  >([]);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
  const [newItemImage, setNewItemImage] = useState<string>("");
  const [ingredientsToAdd, setIngredientsToAdd] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Topping states
  const [isTopping, setIsTopping] = useState(false);
  const [associatedProducts, setAssociatedProducts] = useState<InventoryItem[]>([]);
  const [addAssociatedProductDialogOpen, setAddAssociatedProductDialogOpen] = useState(false);
  const [associatedProductsToAdd, setAssociatedProductsToAdd] = useState<string[]>([]);
  const [associatedProductSearchQuery, setAssociatedProductSearchQuery] = useState("");
  const [associatedProductSelectedCategory, setAssociatedProductSelectedCategory] = useState("all");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editValues, setEditValues] = useState({
    name: "",
    category: "",
    unit: "",
    minStock: 0,
    maxStock: 0,
    sellingPrice: undefined as number | undefined,
    productStatus: undefined as string | undefined,
    ingredients: [] as CompositeIngredient[],
    isTopping: false,
    productIds: [] as number[],
    imageUrl: "",
  });

  // API states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);

  // Fetch inventory items from API
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[Inventory] Fetching items...");

      // Check if user is authenticated
      if (!user) {
        console.warn("[Inventory] User not authenticated, loading mock data...");
        throw new Error("Not authenticated");
      }

      const data = await inventoryService.getItems();
      console.log("[Inventory] API Response:", data);

      // Handle API response structure: { metaData: { items: [...] } }
      let itemsArray: any[] = [];

      if (data?.metaData?.items && Array.isArray(data.metaData.items)) {
        itemsArray = data.metaData.items;
      } else if (data?.items && Array.isArray(data.items)) {
        itemsArray = data.items;
      } else if (Array.isArray(data)) {
        itemsArray = data;
      }


      // Map API response to InventoryItem type, ensuring 'type' and 'status' are set for filtering
      const mappedItems: InventoryItem[] = itemsArray.map((item: any) => {
        // Determine type
        let type: ItemType = "ingredient";
        if (item.itemType?.name) {
          const t = item.itemType.name.toLowerCase();
          if (t === "ready-made" || t === "ready_made") type = "ready-made";
          else if (t === "composite") type = "composite";
          else if (t === "ingredient") type = "ingredient";
        } else if (item.itemTypeId || item.item_type_id) {
          const typeId = Number(item.itemTypeId || item.item_type_id);
          if (typeId === 1) type = "ready-made";
          else if (typeId === 2) type = "composite";
          else if (typeId === 3) type = "ingredient";
        }

        // Calculate status based on stock
        let status: InventoryItem["status"] = "good";
        const stock = Number(item.currentStock) || 0;
        const minStock = item.minStock ? Number(item.minStock) : 0;
        if (stock <= 0) status = "critical";
        else if (stock <= minStock) status = "low";
        // TODO: Add expiring/expired logic if expiry info available

        return {
          id: String(item.id),
          name: item.name || "",
          type,
          category: item.category?.name || (typeof item.category === "string" ? item.category : ""),
          currentStock: stock,
          unit: item.unit?.name || (typeof item.unit === "string" ? item.unit : ""),
          minStock,
          maxStock: item.maxStock ? Number(item.maxStock) : 0,
          status,
          productStatus: item.productStatus || "selling",
          imageUrl: item.imageUrl || undefined,
          batches: item.batches || undefined,
          ingredients: (item.ingredientOf && Array.isArray(item.ingredientOf))
            ? item.ingredientOf.map((io: any) => ({
              ingredientId: String(io.ingredientItemId),
              ingredientName: io.ingredientItem?.name || "",
              unit: io.unit || io.ingredientItem?.unit?.name || "",
              quantity: Number(io.quantity) || 0,
              unitCost: Number(io.ingredientItem?.avgUnitCost) || 0,
            }))
            : (item.ingredients || undefined),
          totalValue: stock * (Number(item.avgUnitCost) || 0),
          avgUnitCost: Number(item.avgUnitCost) || 0,
          sellingPrice: item.sellingPrice ? Number(item.sellingPrice) : undefined,
          isTopping: item.isTopping || false,
          productIds: item.productIds || undefined,
        };
      });

      console.log("[Inventory] Mapped items:", mappedItems);
      setItems(mappedItems);

      if (mappedItems.length === 0) {
        console.warn("[Inventory] No items returned from API");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi tải dữ liệu";
      console.error("Error fetching inventory:", err);

      // Load mock data as fallback
      console.log("[Inventory] Loading fallback mock data...");
      const mockItems: InventoryItem[] = [

      ];
      setItems(mockItems);
      setError(null); // Don't show error if we have mock data
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> none -> asc
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

  const toggleCategory = (categoryId: string) => {
    if (categoryId === "all") {
      setSelectedCategories(["all"]);
    } else {
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter((c) => c !== categoryId)
        : [...selectedCategories.filter((c) => c !== "all"), categoryId];
      setSelectedCategories(
        newCategories.length === 0 ? ["all"] : newCategories
      );
    }
  };

  const toggleType = (type: ItemType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleStockStatus = (status: string) => {
    setSelectedStockStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleProductStatus = (status: string) => {
    setSelectedProductStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const getItemTypeLabel = (type?: ItemType) => {
    switch (type) {
      case "ready-made":
        return "Hàng bán sẵn";
      case "composite":
        return "Hàng cấu thành";
      case "ingredient":
        return "Nguyên liệu";
      default:
        return "Không xác định";
    }
  };

  // Handle Add New Item (API Integration)
  const handleAddNewItem = async () => {
    try {
      // Validate
      if (!addDialogValues.name || !addDialogValues.categoryId || !addDialogValues.unitId) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Danh mục, Đơn vị)");
        return;
      }

      const itemTypeIdMap: Record<string, number> = {
        "ready-made": 1,
        "composite": 2,
        "ingredient": 3
      };

      const payload = {
        name: addDialogValues.name,
        itemTypeId: itemTypeIdMap[addItemType],
        categoryId: Number(addDialogValues.categoryId),
        unitId: Number(addDialogValues.unitId),
        minStock: Number(addDialogValues.minStock),
        maxStock: Number(addDialogValues.maxStock),
        sellingPrice: Number(addDialogValues.sellingPrice),
        productStatus: "selling", // Default as per requirement
        isTopping: addItemType === 'composite' ? isTopping : false,
        // Optional fields
        imageUrl: newItemImage || null,
        ingredients: addItemType === 'composite'
          ? selectedIngredients.map(i => ({
            ingredientItemId: Number(i.ingredientId),
            quantity: i.quantity,
            unit: i.unit
          }))
          : [],
        // For toppings/extra logic if needed
        productIds: (addItemType === 'composite' && isTopping) ? associatedProducts.map(p => Number(p.id)) : [],
      };

      console.log("[Inventory] Creating item with payload:", payload);

      const response = await inventoryService.createItem(payload as any) as any;
      const created = response.metaData || response;

      // Map response to UI model
      const getName = (val: any) => (typeof val === "object" && val && typeof val.name === "string") ? val.name : (typeof val === "string" ? val : "");

      const mapped: InventoryItem = {
        id: String(created.id),
        name: created.name,
        type: addItemType,
        category: getName(created.category) || (categories.find(c => String(c.id) === String(created.categoryId))?.name || ""),
        currentStock: Number(created.currentStock) || 0,
        unit: getName(created.unit) || (unitOptions.find(u => String(u.id) === String(created.unitId))?.name || ""),
        minStock: Number(created.minStock) || 0,
        maxStock: Number(created.maxStock) || 0,
        status: "good",
        productStatus: (created.productStatus as any) || "selling",
        imageUrl: created.imageUrl,
        batches: created.batches || [],
        ingredients: (created.ingredientOf && Array.isArray(created.ingredientOf))
          ? created.ingredientOf.map((io: any) => ({
            ingredientId: String(io.ingredientItemId),
            ingredientName: io.ingredientItem?.name || "",
            unit: io.unit || io.ingredientItem?.unit?.name || "",
            quantity: Number(io.quantity) || 0,
            unitCost: Number(io.ingredientItem?.avgUnitCost) || 0,
          }))
          : (created.ingredients || []),
        totalValue: (Number(created.currentStock) || 0) * (Number(created.avgUnitCost) || 0),
        avgUnitCost: Number(created.avgUnitCost) || 0,
        sellingPrice: created.sellingPrice ? Number(created.sellingPrice) : undefined,
        isTopping: created.isTopping || false,
        productIds: created.productIds,
      };

      setItems((prev) => [mapped, ...prev]);
      setAddDialogOpen(false);

      // Reset form
      setAddDialogValues({
        name: "",
        categoryId: "",
        unitId: "",
        minStock: 0,
        maxStock: 0,
        sellingPrice: 0,
      });
      setNewItemImage("");
      setSelectedIngredients([]);
      setIsTopping(false);
      setAssociatedProducts([]);

      toast.success("Tạo sản phẩm thành công");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi thêm mặt hàng";
      console.error("Error creating item:", err);
      toast.error(errorMsg);

      // Add check for failure entry creation if needed, or keeping simple
    }
  };

  // Handle Update Item
  const handleUpdateItem = async (itemId: string, updatedData: any) => {
    try {
      const response = await inventoryService.updateItem(itemId, updatedData) as any;
      const updatedItemRaw = response.metaData || response;

      // Map the updated item
      const typeMap: Record<number, ItemType> = { 1: "ready-made", 2: "composite", 3: "ingredient" };
      const updatedItem: InventoryItem = {
        id: String(updatedItemRaw.id),
        name: updatedItemRaw.name,
        type: typeMap[Number(updatedItemRaw.itemTypeId)] || "ingredient",
        category: updatedItemRaw.category?.name || String(updatedItemRaw.categoryId || ""),
        currentStock: Number(updatedItemRaw.currentStock) || 0,
        unit: updatedItemRaw.unit?.name || (typeof updatedItemRaw.unit === "string" ? updatedItemRaw.unit : ""),
        minStock: Number(updatedItemRaw.minStock) || 0,
        maxStock: Number(updatedItemRaw.maxStock) || 0,
        status: Number(updatedItemRaw.currentStock) <= 0 ? "critical" : (Number(updatedItemRaw.currentStock) <= (updatedItemRaw.minStock || 0) ? "low" : "good"),
        productStatus: updatedItemRaw.productStatus || "selling",
        imageUrl: updatedItemRaw.imageUrl,
        batches: updatedItemRaw.batches || [],
        ingredients: (updatedItemRaw.ingredientOf && Array.isArray(updatedItemRaw.ingredientOf))
          ? updatedItemRaw.ingredientOf.map((io: any) => ({
            ingredientId: String(io.ingredientItemId),
            ingredientName: io.ingredientItem?.name || "",
            unit: io.unit || io.ingredientItem?.unit?.name || "",
            quantity: Number(io.quantity) || 0,
            unitCost: Number(io.ingredientItem?.avgUnitCost) || 0,
          }))
          : (updatedItemRaw.ingredients || []),
        totalValue: (Number(updatedItemRaw.currentStock) || 0) * (Number(updatedItemRaw.avgUnitCost) || 0),
        avgUnitCost: Number(updatedItemRaw.avgUnitCost) || 0,
        sellingPrice: updatedItemRaw.sellingPrice ? Number(updatedItemRaw.sellingPrice) : undefined,
        isTopping: updatedItemRaw.isTopping || false,
        productIds: updatedItemRaw.productIds || updatedItemRaw.associatedProductIds,
      };

      setItems(items.map(item => item.id === itemId ? updatedItem : item));
      setEditDialogOpen(false);
      setEditingItem(null);
      toast.success("Cập nhật thành công");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật";
      toast.error(errorMsg);
      console.error("Error updating item:", err);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await inventoryService.deleteItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
      toast.success("Xóa thành công");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi xóa";
      toast.error(errorMsg);
      console.error("Error deleting item:", err);
    }
  };

  // Handle Create Category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await inventoryService.createCategory({ name: newCategoryName });
      setCategoryOptions([...categoryOptions, { ...newCat, id: String(newCat.id) }]);
      setAddCategoryDialogOpen(false);
      setNewCategoryName("");
      toast.success("Thêm danh mục thành công");
      // Auto select logic could be added here if this was triggered from a select
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo danh mục");
    }
  };

  // Handle Create Unit
  const handleCreateUnit = async () => {
    if (!newUnitValues.name.trim() || !newUnitValues.symbol.trim()) return;
    try {
      const newUnit = await inventoryService.createUnit(newUnitValues);
      setUnitOptions([...unitOptions, { ...newUnit, id: String(newUnit.id) }]);
      setAddUnitDialogOpen(false);
      setNewUnitValues({ name: "", symbol: "" });
      toast.success("Thêm đơn vị thành công");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo đơn vị");
    }
  };

  const getStatusBadge = (status: InventoryItem["status"]) => {
    switch (status) {
      case "good":
        return <Badge className="bg-emerald-500">Đủ hàng</Badge>;
      case "low":
        return <Badge className="bg-amber-500">Sắp hết hàng</Badge>;
      case "expiring":
        return <Badge className="bg-orange-500">Gần hết hạn</Badge>;
      case "expired":
        return <Badge className="bg-red-700">Hết hạn</Badge>;
      case "critical":
        return <Badge className="bg-red-500">Hết hàng</Badge>;
    }
  };

  const getProductStatusBadge = (status?: InventoryItem["productStatus"]) => {
    const s = status || "selling";
    switch (s) {
      case "selling":
        return <Badge className="bg-blue-600">Đang bán</Badge>;
      case "paused":
        return <Badge className="bg-slate-400">Tạm ngưng</Badge>;
      case "not_running":
        return <Badge className="bg-slate-600">Không chạy</Badge>;
      case "hot":
        return <Badge className="bg-indigo-600">Bán chạy</Badge>;
    }
  };

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const days = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    return days;
  };

  const getSampleExpiryDate = () => {
    const days = 45;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  };

  const getSampleSellingPrice = (item: InventoryItem) => {
    const base = item.batches?.[0]?.unitCost || 10000;
    return Math.round(base * 1.25);
  };

  const getEarliestExpiryFromBatches = (batches?: BatchInfo[]) => {
    if (!batches || batches.length === 0) return null;
    const datesWithExpiry = batches
      .filter((b) => b.expiryDate)
      .map((b) => b.expiryDate!);
    if (datesWithExpiry.length === 0) return null;
    return datesWithExpiry.sort()[0];
  };

  const toggleExpand = async (itemId: string) => {
    const isExpanding = expandedItemId !== itemId;
    setExpandedItemId(isExpanding ? itemId : null);

    if (isExpanding) {
      const item = items.find((i) => i.id === itemId);
      // For composite items, fetch details to get toppings/applicable products
      if (item && item.type === "composite") {
        try {
          const res = await inventoryService.getItemById(itemId) as any;
          const meta = res.metaData || res;

          setItems((prev) =>
            prev.map((i) =>
              i.id === itemId
                ? {
                  ...i,
                  availableToppings: meta.availableToppings || [],
                  applicableProducts: meta.applicableProducts || [],
                  // Also update ingredients just in case
                  ingredients: (meta.ingredientOf && Array.isArray(meta.ingredientOf))
                    ? meta.ingredientOf.map((io: any) => ({
                      ingredientId: String(io.ingredientItemId),
                      ingredientName: io.ingredientItem?.name || "",
                      unit: io.unit || io.ingredientItem?.unit?.name || "",
                      quantity: Number(io.quantity) || 0,
                      unitCost: Number(io.ingredientItem?.avgUnitCost) || 0,
                    }))
                    : (i.ingredients || []),
                }
                : i
            )
          );
        } catch (error) {
          console.error("Error fetching item details on expand:", error);
        }
      }
    }
  };

  const getAddDialogTitle = () => {
    switch (activeTab) {
      case "ready-made":
        return "Thêm hàng hóa bán sẵn";
      case "composite":
        return "Thêm hàng hóa cấu thành";
      case "ingredient":
        return "Thêm nguyên liệu";
    }
  };

  let filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategories.includes("all") ||
      selectedCategories.includes(item.category);
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStockStatus = selectedStockStatuses.includes(item.status);
    const matchesProductStatus = selectedProductStatuses.includes(
      item.productStatus || "selling"
    );
    const matchesType = selectedTypes.includes(item.type);
    return (
      matchesCategory &&
      matchesSearch &&
      matchesStockStatus &&
      matchesProductStatus &&
      matchesType
    );
  });

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredItems = [...filteredItems].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "expiryDate") {
        const aExpiry = getEarliestExpiryFromBatches(a.batches);
        const bExpiry = getEarliestExpiryFromBatches(b.batches);
        aValue = aExpiry ? new Date(aExpiry).getTime() : Infinity;
        bValue = bExpiry ? new Date(bExpiry).getTime() : Infinity;
      } else if (sortField === "category") {
        const aCategory = categories.find((c) => c.id === a.category)?.name || "";
        const bCategory = categories.find((c) => c.id === b.category)?.name || "";
        aValue = aCategory;
        bValue = bCategory;
      } else if (sortField === "batches") {
        aValue = a.batches?.length || 0;
        bValue = b.batches?.length || 0;
      } else if (sortField === "status") {
        const statusOrder: Record<InventoryItem["status"], number> = {
          good: 0,
          low: 1,
          expiring: 2,
          expired: 3,
          critical: 4,
        };
        aValue = statusOrder[a.status] ?? 0;
        bValue = statusOrder[b.status] ?? 0;
      } else if (sortField === "productStatus") {
        const pOrder = { selling: 0, paused: 1, not_running: 2, hot: 3 } as Record<string, number>;
        aValue = pOrder[a.productStatus || "selling"] ?? 0;
        bValue = pOrder[b.productStatus || "selling"] ?? 0;
      } else if (sortField === "ingredients") {
        aValue = a.ingredients?.length || 0;
        bValue = b.ingredients?.length || 0;
      } else if (sortField === "avgUnitCost") {
        aValue = a.avgUnitCost || 0;
        bValue = b.avgUnitCost || 0;
      } else if (sortField === "supplier") {
        const aSupplier = a.batches?.[0]?.supplier || "";
        const bSupplier = b.batches?.[0]?.supplier || "";
        aValue = aSupplier;
        bValue = bSupplier;
      } else if (sortField === "sellingPrice") {
        aValue = a.sellingPrice || 0;
        bValue = b.sellingPrice || 0;
      } else {
        aValue = a[sortField as keyof InventoryItem];
        bValue = b[sortField as keyof InventoryItem];
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

  const totalValue = items.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );
  const lowStockCount = items.filter(
    (item) => item.status === "low" || item.status === "critical"
  ).length;
  const expiringCount = items.filter(
    (item) => item.status === "expiring"
  ).length;

  // Filter by active tab
  const tabFilteredItems = filteredItems.filter(
    (item) => item.type === activeTab
  );

  // Show loading state
  if (loading && items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600">Đang tải dữ liệu kho hàng...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <p className="text-red-700 text-center font-medium">Lỗi khi tải dữ liệu</p>
              <p className="text-red-600 text-sm text-center">{error}</p>
              <Button
                onClick={fetchInventoryItems}
                className="mt-4 w-full bg-red-600 hover:bg-red-700"
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Loading Overlay */}
      {loading && items.length > 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-50">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-blue-900 text-2xl font-semibold">Kho & Nguyên liệu</h1>
            <p className="text-slate-600 mt-1">
              Quản lý tồn kho và nguyên liệu
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Nhập file
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất file
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                {canCreate && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm hàng hóa
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="min-w-[1100px] max-w-[1300px] w-[100vw] max-h-[90vh] flex flex-col" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Thêm mặt hàng mới</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden px-1">
                  {/* Item Type Selection */}
                  <div>
                    <Label>
                      Loại mặt hàng <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={addItemType}
                      onValueChange={(value: string) =>
                        setAddItemType(value as ItemType)
                      }
                    >
                      <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ready-made">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                            Hàng hóa bán sẵn
                          </div>
                        </SelectItem>
                        <SelectItem value="composite">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-purple-600" />
                            Hàng hóa cấu thành
                          </div>
                        </SelectItem>
                        <SelectItem value="ingredient">
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-green-600" />
                            Nguyên liệu
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Dynamic Form Fields */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>
                        Mã hàng hóa <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          placeholder="Tự động tạo"
                          value={`${addItemType === "ready-made"
                            ? "RM"
                            : addItemType === "composite"
                              ? "CP"
                              : "IG"
                            }${Math.floor(100 + Math.random() * 900)}`}
                          disabled
                          className="bg-slate-50 border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label>
                        Tên{" "}
                        {addItemType === "composite"
                          ? "hàng hóa"
                          : addItemType === "ready-made"
                            ? "hàng hóa"
                            : "nguyên liệu"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={addDialogValues.name}
                        onChange={(e) => setAddDialogValues(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        placeholder={`VD: ${addItemType === "composite"
                          ? "Cà phê Latte"
                          : addItemType === "ready-made"
                            ? "Coca Cola"
                            : "Cà phê hạt Arabica"
                          }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          Danh mục <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => setAddCategoryDialogOpen(true)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Thêm danh mục
                        </Button>
                      </div>
                      <Select
                        value={addDialogValues.categoryId}
                        onValueChange={(value: string) => setAddDialogValues((v: any) => ({ ...v, categoryId: value }))}
                        disabled={loadingCategories || categoryOptions.length === 0}
                      >
                        <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                          <SelectValue placeholder={loadingCategories ? "Đang tải..." : "Chọn danh mục"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label>
                          Đơn vị <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => setAddUnitDialogOpen(true)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Thêm đơn vị
                        </Button>
                      </div>
                      <Select
                        value={addDialogValues.unitId}
                        onValueChange={(value: string) => setAddDialogValues((v: any) => ({ ...v, unitId: value }))}
                        disabled={loadingUnits || unitOptions.length === 0}
                      >
                        <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                          <SelectValue placeholder={loadingUnits ? "Đang tải..." : "Chọn đơn vị"} />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((unit: any) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {addItemType !== "composite" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tồn kho tối thiểu</Label>
                        <Input
                          type="number"
                          value={addDialogValues.minStock}
                          onChange={(e) => setAddDialogValues(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                          className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Tồn kho tối đa</Label>
                        <Input
                          type="number"
                          value={addDialogValues.maxStock}
                          onChange={(e) => setAddDialogValues(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
                          className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Upload Section */}
                  <div>
                    <ImageUploadWithCrop
                      value={newItemImage}
                      onChange={setNewItemImage}
                      label="Hình ảnh sản phẩm"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      Tải lên hình ảnh cho{" "}
                      {addItemType === "composite"
                        ? "hàng hóa"
                        : addItemType === "ready-made"
                          ? "hàng hóa"
                          : "nguyên liệu"}{" "}
                      (tùy chọn)
                    </p>
                  </div>

                  {addItemType === "composite" && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is-topping"
                          checked={isTopping}
                          onCheckedChange={(checked: boolean) => setIsTopping(checked as boolean)}
                        />
                        <Label htmlFor="is-topping" className="cursor-pointer font-medium text-slate-900">
                          Là Topping (Sản phẩm bán kèm)
                        </Label>
                      </div>

                      {isTopping && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <Label className="text-sm font-medium text-blue-900">Món chính áp dụng</Label>
                              <p className="text-xs text-blue-700 mt-0.5">Danh sách các món có thể thêm topping này</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                              onClick={() => setAddAssociatedProductDialogOpen(true)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Thêm món
                            </Button>
                          </div>
                          {associatedProducts.length === 0 ? (
                            <div className="text-center py-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                              <p className="text-xs text-blue-600">
                                Chưa có món chính nào được chọn
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                                    <TableHead className="w-12 text-blue-900">STT</TableHead>
                                    <TableHead className="text-blue-900 text-2xl font-semibold">Mã hàng</TableHead>
                                    <TableHead className="text-blue-900 text-2xl font-semibold">Tên hàng hóa</TableHead>
                                    <TableHead className="text-blue-900 text-2xl font-semibold">Đơn vị</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {associatedProducts.map((prod, index) => (
                                    <TableRow key={prod.id} className="bg-white">
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>{prod.id}</TableCell>
                                      <TableCell>{prod.name}</TableCell>
                                      <TableCell>{prod.unit}</TableCell>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:text-red-600"
                                          onClick={() => {
                                            setAssociatedProducts((prev) =>
                                              prev.filter((p) => p.id !== prod.id)
                                            );
                                          }}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm">Công thức nguyên liệu</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setAddIngredientDialogOpen(true)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Thêm nguyên liệu
                          </Button>
                        </div>
                        {selectedIngredients.length === 0 ? (
                          <p className="text-xs text-slate-500">
                            Nhấn "Thêm nguyên liệu" để xây dựng công thức cho món
                            này
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-purple-100">
                                  <TableHead className="w-12">STT</TableHead>
                                  <TableHead>Mã</TableHead>
                                  <TableHead>Tên nguyên liệu</TableHead>
                                  <TableHead>Đơn vị</TableHead>
                                  <TableHead>Số lượng</TableHead>
                                  <TableHead className="w-12"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedIngredients.map((ing: CompositeIngredient, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{ing.ingredientId}</TableCell>
                                    <TableCell>{ing.ingredientName}</TableCell>
                                    <TableCell>{ing.unit}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={ing.quantity}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                          const val = Number(e.target.value);
                                          setSelectedIngredients((prev: CompositeIngredient[]) =>
                                            prev.map((item: CompositeIngredient, idx: number) =>
                                              idx === index
                                                ? { ...item, quantity: val }
                                                : item
                                            )
                                          );
                                        }}
                                        className="h-8 w-24 bg-white border-slate-300"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          setSelectedIngredients((prev: CompositeIngredient[]) =>
                                            prev.filter((_, i) => i !== index)
                                          );
                                        }}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600">
                      <span className="text-red-500">*</span> Trường bắt buộc
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  {canCreate && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleAddNewItem}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {addItemType === "composite"
                        ? "Thêm hàng hóa"
                        : addItemType === "ready-made"
                          ? "Thêm hàng hóa"
                          : "Thêm nguyên liệu"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Add Category Dialog */}
        <Dialog
          open={addCategoryDialogOpen}
          onOpenChange={setAddCategoryDialogOpen}
        >
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>
                  Tên danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  placeholder="VD: Đồ ăn nhanh"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-600">
                  <span className="text-red-500">*</span> Trường bắt buộc
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddCategoryDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Ingredient Dialog */}
        {/* Add Ingredient Dialog */}
        <Dialog
          open={addIngredientDialogOpen}
          onOpenChange={(open: boolean) => {
            setAddIngredientDialogOpen(open);
            if (open) setIngredientsToAdd([]);
          }}
        >
          <DialogContent
            className="min-w-[1100px] max-w-[1400px] w-[100vw] max-h-[90vh] flex flex-col"
            aria-describedby={undefined}
          >
            <DialogHeader>
              <DialogTitle>Thêm nguyên liệu vào công thức</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 flex-1 overflow-y-auto px-1">
              {/* Search Ingredient */}
              <div>
                <Label>
                  Tìm kiếm nguyên liệu
                </Label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Nhập tên nguyên liệu..."
                    value={ingredientSearchQuery}
                    onChange={(e) => setIngredientSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
              </div>

              {/* Available Ingredients List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-12 text-center">
                        <Checkbox
                          checked={
                            ingredientsToAdd.length > 0 &&
                            items
                              .filter(
                                (item: InventoryItem) =>
                                  item.type === "ingredient" &&
                                  item.name
                                    .toLowerCase()
                                    .includes(ingredientSearchQuery.toLowerCase())
                              )
                              .every((item: InventoryItem) => ingredientsToAdd.includes(item.id))
                          }
                          onCheckedChange={(checked: any) => {
                            const filteredItems = items.filter(
                              (item: InventoryItem) =>
                                item.type === "ingredient" &&
                                item.name
                                  .toLowerCase()
                                  .includes(ingredientSearchQuery.toLowerCase())
                            );
                            if (checked) {
                              setIngredientsToAdd((prev: string[]) => [
                                ...new Set([...prev, ...filteredItems.map((i: InventoryItem) => i.id)]),
                              ]);
                            } else {
                              const idsToRemove = filteredItems.map((i: InventoryItem) => i.id);
                              setIngredientsToAdd((prev: string[]) =>
                                prev.filter((id: string) => !idsToRemove.includes(id))
                              );
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Mã nguyên liệu</TableHead>
                      <TableHead>Tên nguyên liệu</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className="text-right">Giá vốn trung bình</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items
                      .filter(
                        (item: InventoryItem) =>
                          item.type === "ingredient" &&
                          item.name
                            .toLowerCase()
                            .includes(ingredientSearchQuery.toLowerCase())
                      )
                      .map((ingredient: InventoryItem) => {
                        const isSelected = ingredientsToAdd.includes(ingredient.id);
                        return (
                          <TableRow
                            key={ingredient.id}
                            className={isSelected ? "bg-blue-100" : ""}
                            onClick={() => {
                              setIngredientsToAdd((prev: string[]) =>
                                prev.includes(ingredient.id)
                                  ? prev.filter((id) => id !== ingredient.id)
                                  : [...prev, ingredient.id]
                              );
                            }}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked: any) => {
                                  // Handled by Row Click, but we need to stop propagation if clicked directly
                                }}
                                onClick={(e: any) => e.stopPropagation()} // Let the row click handle check logic, or just let checkbox change trigger it.
                              />
                            </TableCell>
                            <TableCell className="font-medium">{ingredient.id}</TableCell>
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal">
                                {ingredient.unit}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {ingredient.avgUnitCost.toLocaleString()} đ
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {items.filter(
                      (item: InventoryItem) =>
                        item.type === "ingredient" &&
                        item.name
                          .toLowerCase()
                          .includes(ingredientSearchQuery.toLowerCase())
                    ).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                            Không tìm thấy nguyên liệu nào
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  <span className="font-medium">{ingredientsToAdd.length}</span> nguyên liệu đã chọn
                </p>
                <div className="text-xs text-slate-500">
                  Click vào hàng để chọn
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddIngredientDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={ingredientsToAdd.length === 0}
                onClick={() => {
                  const selectedItems: InventoryItem[] = items.filter((i: InventoryItem) => ingredientsToAdd.includes(i.id));
                  const newIngredients: CompositeIngredient[] = selectedItems.map((item: InventoryItem) => ({
                    ingredientId: item.id,
                    ingredientName: item.name,
                    unit: item.unit,
                    quantity: 0,
                    unitCost: item.avgUnitCost
                  }));

                  if (editDialogOpen) {
                    setEditValues((prev: any) => ({
                      ...prev,
                      ingredients: [
                        ...prev.ingredients,
                        ...newIngredients.filter((newIg: CompositeIngredient) => !prev.ingredients.some((ex: CompositeIngredient) => ex.ingredientId === newIg.ingredientId)) // Avoid duplicates if needed, or just allow them
                      ]
                    }));
                  } else {
                    setSelectedIngredients((prev: CompositeIngredient[]) => [
                      ...prev,
                      ...newIngredients.filter((newIg: CompositeIngredient) => !prev.some((ex: CompositeIngredient) => ex.ingredientId === newIg.ingredientId))
                    ]);
                  }
                  setAddIngredientDialogOpen(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm {ingredientsToAdd.length} nguyên liệu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Unit Dialog */}
        <Dialog open={addUnitDialogOpen} onOpenChange={setAddUnitDialogOpen}>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Thêm đơn vị mới</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>
                  Tên đơn vị <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newUnitValues.name}
                  onChange={(e) => setNewUnitValues(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  placeholder="VD: Kilogram, Lít, Hộp..."
                />
              </div>

              <div>
                <Label>
                  Ký hiệu <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newUnitValues.symbol}
                  onChange={(e) => setNewUnitValues(prev => ({ ...prev, symbol: e.target.value }))}
                  className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  placeholder="VD: kg, L, hộp..."
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-600">
                  <span className="text-red-500">*</span> Trường bắt buộc
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddUnitDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateUnit}
                disabled={!newUnitValues.name.trim() || !newUnitValues.symbol.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm đơn vị
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Associated Product Dialog */}
        <Dialog
          open={addAssociatedProductDialogOpen}
          onOpenChange={(open: boolean) => {
            setAddAssociatedProductDialogOpen(open);
            if (open) setAssociatedProductsToAdd([]);
          }}
        >
          <DialogContent
            className="min-w-[1100px] max-w-[1400px] w-[100vw] max-h-[90vh] flex flex-col"
            aria-describedby={undefined}
          >
            <DialogHeader>
              <DialogTitle>Thêm món chính áp dụng Topping</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 flex-1 overflow-y-auto px-1">
              {/* Search */}
              <div>
                <Label>Tìm kiếm hàng hóa</Label>
                <div className="relative mt-1.5 mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Nhập tên hàng hóa..."
                    value={associatedProductSearchQuery}
                    onChange={(e) =>
                      setAssociatedProductSearchQuery(e.target.value)
                    }
                    className="pl-10 bg-white border-slate-300"
                  />
                </div>
                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-200">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={
                        associatedProductSelectedCategory === cat.id
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setAssociatedProductSelectedCategory(cat.id)
                      }
                      className={
                        associatedProductSelectedCategory === cat.id
                          ? "bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                          : "text-slate-600 border-slate-300 hover:bg-slate-50 whitespace-nowrap"
                      }
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Product List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-12 text-center">
                        <Checkbox
                          checked={
                            associatedProductsToAdd.length > 0 &&
                            items
                              .filter(
                                (item) =>
                                  (item.type === "ready-made" || item.type === "composite") &&
                                  !item.isTopping &&
                                  item.name.toLowerCase().includes(associatedProductSearchQuery.toLowerCase()) && (associatedProductSelectedCategory === "all" || item.category === associatedProductSelectedCategory)
                              )
                              .every((item) => associatedProductsToAdd.includes(item.id))
                          }
                          onCheckedChange={(checked: boolean) => {
                            const filteredItems = items.filter(
                              (item) =>
                                (item.type === "ready-made" || item.type === "composite") &&
                                !item.isTopping &&
                                item.name.toLowerCase().includes(associatedProductSearchQuery.toLowerCase()) && (associatedProductSelectedCategory === "all" || item.category === associatedProductSelectedCategory)
                            );
                            if (checked) {
                              setAssociatedProductsToAdd((prev) => [
                                ...new Set([...prev, ...filteredItems.map((i) => i.id)]),
                              ]);
                            } else {
                              const idsToRemove = filteredItems.map((i) => i.id);
                              setAssociatedProductsToAdd((prev) =>
                                prev.filter((id) => !idsToRemove.includes(id))
                              );
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Mã hàng</TableHead>
                      <TableHead>Tên hàng hóa</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className="text-right">Giá bán</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items
                      .filter(
                        (item) =>
                          (item.type === "ready-made" || item.type === "composite") &&
                          !item.isTopping &&
                          item.name.toLowerCase().includes(associatedProductSearchQuery.toLowerCase()) && (associatedProductSelectedCategory === "all" || item.category === associatedProductSelectedCategory)
                      )
                      .map((item) => {
                        const isSelected = associatedProductsToAdd.includes(item.id);
                        return (
                          <TableRow
                            key={item.id}
                            className={isSelected ? "bg-blue-50" : ""}
                            onClick={() => {
                              setAssociatedProductsToAdd((prev) =>
                                prev.includes(item.id)
                                  ? prev.filter((id) => id !== item.id)
                                  : [...prev, item.id]
                              );
                            }}
                          >
                            <TableCell className="text-center">
                              <Checkbox checked={isSelected} />
                            </TableCell>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {item.type === "ready-made" ? (
                                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                                  Bán sẵn
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">
                                  Pha chế
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right">
                              {item.sellingPrice?.toLocaleString()} đ
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {items.filter(
                      (item) =>
                        (item.type === "ready-made" || item.type === "composite") &&
                        !item.isTopping &&
                        item.name.toLowerCase().includes(associatedProductSearchQuery.toLowerCase()) && (associatedProductSelectedCategory === "all" || item.category === associatedProductSelectedCategory)
                    ).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            Không tìm thấy hàng hóa phù hợp
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  <span className="font-medium">{associatedProductsToAdd.length}</span> món đã chọn
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddAssociatedProductDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                disabled={associatedProductsToAdd.length === 0}
                onClick={() => {
                  const selectedItems = items.filter((i) => associatedProductsToAdd.includes(i.id));
                  setAssociatedProducts((prev) => {
                    const existingIds = prev.map(p => p.id);
                    const newItems = selectedItems.filter(item => !existingIds.includes(item.id));
                    return [...prev, ...newItems];
                  });
                  setAddAssociatedProductDialogOpen(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm {associatedProductsToAdd.length} món
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onOpenChange={(open: boolean) => {
            setEditDialogOpen(open);
            if (!open) setEditingItem(null);
          }}
        >
          <DialogContent className="!max-w-[1200px] w-full max-h-[90vh] flex flex-col" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa mặt hàng</DialogTitle>
            </DialogHeader>

            {/* Ensure category/unit are set to item's current values when opening */}
            {editingItem && editDialogOpen && (
              (() => {
                // Only update if not already set (avoid infinite loop)
                if (editValues.category !== editingItem.category || editValues.unit !== editingItem.unit) {
                  setEditValues((v) => ({
                    ...v,
                    category: editingItem.category,
                    unit: editingItem.unit,
                  }));
                }
                return null;
              })()
            )}

            <div className="space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên mặt hàng</Label>
                  <Input
                    value={editValues.name}
                    onChange={(e) =>
                      setEditValues((v) => ({ ...v, name: e.target.value }))
                    }
                    placeholder="Nhập tên"
                    className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select
                    value={editValues.productStatus || "selling"}
                    onValueChange={(val: string) =>
                      setEditValues((v) => ({ ...v, productStatus: val }))
                    }
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selling">Đang bán</SelectItem>
                      <SelectItem value="paused">Tạm ngưng</SelectItem>
                      <SelectItem value="not_running">Không chạy</SelectItem>
                      <SelectItem value="hot">Bán chạy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Danh mục</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-blue-600 hover:text-blue-700"
                      onClick={() => setAddCategoryDialogOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Thêm
                    </Button>
                  </div>
                  <Select
                    value={editValues.category}
                    onValueChange={(val: string) =>
                      setEditValues((v) => ({ ...v, category: val }))
                    }
                    disabled={loadingCategories || categoryOptions.length === 0}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                      <SelectValue placeholder={loadingCategories ? "Đang tải..." : "Chọn danh mục"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Đơn vị</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-blue-600 hover:text-blue-700"
                      onClick={() => setAddUnitDialogOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Thêm
                    </Button>
                  </div>
                  <Select
                    value={editValues.unit}
                    onValueChange={(val: string) =>
                      setEditValues((v) => ({ ...v, unit: val }))
                    }
                    disabled={loadingUnits || unitOptions.length === 0}
                  >
                    <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                      <SelectValue placeholder={loadingUnits ? "Đang tải..." : "Chọn đơn vị"} />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit: any) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tồn kho tối thiểu</Label>
                  <Input
                    type="number"
                    value={editValues.minStock}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        minStock: Number(e.target.value || 0),
                      }))
                    }
                    placeholder="0"
                    className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
                <div>
                  <Label>Tồn kho tối đa</Label>
                  <Input
                    type="number"
                    value={editValues.maxStock}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        maxStock: Number(e.target.value || 0),
                      }))
                    }
                    placeholder="0"
                    className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
              </div>

              {/* Ingredient Editing for Composite Items */}
              {editingItem?.type === "composite" && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-is-topping"
                      checked={isTopping}
                      onCheckedChange={(checked: boolean) => setIsTopping(checked as boolean)}
                    />
                    <Label htmlFor="edit-is-topping" className="cursor-pointer font-medium text-slate-900">
                      Là Topping (Sản phẩm bán kèm)
                    </Label>
                  </div>

                  {isTopping && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-sm font-medium text-blue-900">Món chính áp dụng</Label>
                          <p className="text-xs text-blue-700 mt-0.5">Danh sách các món có thể thêm topping này</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                          onClick={() => setAddAssociatedProductDialogOpen(true)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Thêm món
                        </Button>
                      </div>
                      {associatedProducts.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
                          <p className="text-xs text-blue-600">
                            Chưa có món chính nào được chọn
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-blue-100 hover:bg-blue-100">
                                <TableHead className="w-12 text-blue-900">STT</TableHead>
                                <TableHead className="text-blue-900 text-2xl font-semibold">Mã hàng</TableHead>
                                <TableHead className="text-blue-900 text-2xl font-semibold">Tên hàng hóa</TableHead>
                                <TableHead className="text-blue-900 text-2xl font-semibold">Đơn vị</TableHead>
                                <TableHead className="w-12"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {associatedProducts.map((prod, index) => (
                                <TableRow key={prod.id} className="bg-white">
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>{prod.id}</TableCell>
                                  <TableCell>{prod.name}</TableCell>
                                  <TableCell>{prod.unit}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:text-red-600"
                                      onClick={() => {
                                        setAssociatedProducts((prev) =>
                                          prev.filter((p) => p.id !== prod.id)
                                        );
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm">Công thức nguyên liệu</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => setAddIngredientDialogOpen(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Thêm nguyên liệu
                      </Button>
                    </div>
                    {editValues.ingredients.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Nhấn "Thêm nguyên liệu" để xây dựng công thức cho món này
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-purple-100">
                              <TableHead className="w-12">STT</TableHead>
                              <TableHead>Mã</TableHead>
                              <TableHead>Tên nguyên liệu</TableHead>
                              <TableHead>Đơn vị</TableHead>
                              <TableHead>Số lượng</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editValues.ingredients.map((ing: CompositeIngredient, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{ing.ingredientId}</TableCell>
                                <TableCell>{ing.ingredientName}</TableCell>
                                <TableCell>{ing.unit}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={ing.quantity}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                      const val = Number(e.target.value);
                                      setEditValues((prev: any) => ({
                                        ...prev,
                                        ingredients: prev.ingredients.map(
                                          (item: CompositeIngredient, idx: number) =>
                                            idx === index
                                              ? { ...item, quantity: val }
                                              : item
                                        ),
                                      }));
                                    }}
                                    className="h-8 w-24 bg-white border-slate-300"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEditValues((prev: any) => ({
                                        ...prev,
                                        ingredients: prev.ingredients.filter(
                                          (_: any, i: number) => i !== index
                                        ),
                                      }));
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-left">
                <ImageUploadWithCrop
                  value={editValues.imageUrl as string}
                  onChange={(url: string) =>
                    setEditValues((prev) => ({ ...prev, imageUrl: url }))
                  }
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-600">
                  <span className="text-red-500">*</span> Trường bắt buộc
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (!editingItem) return;

                  const payload = {
                    name: editValues.name,
                    categoryId: Number(editValues.category),
                    unitId: Number(editValues.unit),
                    minStock: Number(editValues.minStock),
                    maxStock: Number(editValues.maxStock),
                    sellingPrice: Number(editValues.sellingPrice),
                    productStatus: editValues.productStatus,
                    isTopping: isTopping,
                    // Handle special fields based on type
                    ingredients: editingItem.type === 'composite' ? editValues.ingredients.map(i => ({
                      ingredientItemId: Number(i.ingredientId),
                      quantity: i.quantity,
                      unit: i.unit
                    })) : [],
                    productIds: isTopping ? associatedProducts.map(p => Number(p.id)) : [],
                    imageUrl: editValues.imageUrl || null
                  };

                  handleUpdateItem(editingItem.id, payload);
                }}
              >
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Tổng giá trị kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-blue-900">
                {(totalValue / 1000000).toFixed(1)}M₫
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Tồn kho thấp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-red-900">{lowStockCount} mặt hàng</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Sắp hết hạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-orange-900">
                {expiringCount} mặt hàng
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tổng mặt hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl text-indigo-900">
                {filteredItems.length} mặt hàng
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and Filter Toggle */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, mã hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                  {(!selectedCategories.includes('all') || selectedTypes.length < 3 || selectedStockStatuses.length < 5 || selectedProductStatuses.length < 4) && (
                    <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                      {(!selectedCategories.includes('all') ? selectedCategories.length : 0) +
                        (selectedTypes.length < 3 ? (3 - selectedTypes.length) : 0) +
                        (selectedStockStatuses.length < 5 ? (5 - selectedStockStatuses.length) : 0) +
                        (selectedProductStatuses.length < 4 ? (4 - selectedProductStatuses.length) : 0)}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Collapsible Filter Panel */}
              {showFilters && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Filters */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Danh mục</Label>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={cat.id}
                                checked={selectedCategories.includes(cat.id)}
                                onCheckedChange={() => toggleCategory(cat.id)}
                                className="border-slate-300"
                              />
                              <Label htmlFor={cat.id} className="text-sm text-slate-700 cursor-pointer font-normal">
                                {cat.name}
                              </Label>
                            </div>
                            <span className="text-xs text-slate-500">{cat.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Type Filters */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Loại hàng hóa</Label>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                        {[
                          { id: 'ready-made', label: 'Hàng hóa bán sẵn' },
                          { id: 'composite', label: 'Hàng hóa cấu thành' },
                          { id: 'ingredient', label: 'Nguyên liệu' },
                        ].map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={type.id}
                              checked={selectedTypes.includes(type.id as ItemType)}
                              onCheckedChange={() => toggleType(type.id as ItemType)}
                              className="border-slate-300"
                            />
                            <Label htmlFor={type.id} className="text-sm text-slate-700 cursor-pointer font-normal">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stock Status Filters */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Trạng thái kho</Label>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                        {[
                          { id: "good", label: "Đủ hàng" },
                          { id: "low", label: "Sắp hết hàng" },
                          { id: "critical", label: "Hết hàng" },
                          { id: "expiring", label: "Gần hết hạn" },
                          { id: "expired", label: "Hết hạn" },
                        ].map((status) => (
                          <div key={status.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`stock-${status.id}`}
                              checked={selectedStockStatuses.includes(status.id)}
                              onCheckedChange={() => toggleStockStatus(status.id)}
                              className="border-slate-300"
                            />
                            <Label htmlFor={`stock-${status.id}`} className="text-sm text-slate-700 cursor-pointer font-normal">
                              {status.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Status Filters */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">Trạng thái bán</Label>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                        {[
                          { id: "selling", label: "Đang bán" },
                          { id: "hot", label: "Bán chạy" },
                          { id: "not_running", label: "Không chạy" },
                          { id: "paused", label: "Tạm ngưng" },
                        ].map((status) => (
                          <div key={status.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`prod-${status.id}`}
                              checked={selectedProductStatuses.includes(status.id)}
                              onCheckedChange={() => toggleProductStatus(status.id)}
                              className="border-slate-300"
                            />
                            <Label htmlFor={`prod-${status.id}`} className="text-sm text-slate-700 cursor-pointer font-normal">
                              {status.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategories(['all']);
                        setSelectedTypes(['ready-made', 'composite', 'ingredient']);
                        setSelectedStockStatuses(['good', 'low', 'critical', 'expiring', 'expired']);
                        setSelectedProductStatuses(['selling', 'hot', 'not_running', 'paused']);
                        setSearchQuery("");
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

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value: string) => setActiveTab(value as ItemType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="ready-made" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Hàng hóa bán sẵn
            </TabsTrigger>
            <TabsTrigger value="composite" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Hàng hóa cấu thành
            </TabsTrigger>
            <TabsTrigger value="ingredient" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Nguyên liệu
            </TabsTrigger>
          </TabsList>

          {/* Ready-made Tab */}
          <TabsContent value="ready-made">
            <Card className="border-blue-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-xl">
                  <Table>
                    <TableHeader >
                      <TableRow className="bg-blue-100">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-16">STT</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Tên hàng hóa
                            {getSortIcon("name")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Danh mục
                            {getSortIcon("category")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("unit")}
                        >
                          <div className="flex items-center">
                            Đơn vị tính
                            {getSortIcon("unit")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("batches")}
                        >
                          <div className="flex items-center">
                            Lô hàng
                            {getSortIcon("batches")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("currentStock")}
                        >
                          <div className="flex items-center">
                            Tồn kho
                            {getSortIcon("currentStock")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("productStatus")}
                        >
                          <div className="flex items-center">
                            Trạng thái mặt hàng
                            {getSortIcon("productStatus")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center">
                            Trạng thái tồn kho
                            {getSortIcon("status")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("expiryDate")}
                        >
                          <div className="flex items-center">
                            HSD gần nhất
                            {getSortIcon("expiryDate")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("sellingPrice")}
                        >
                          <div className="flex items-center">
                            Giá bán
                            {getSortIcon("sellingPrice")}
                          </div>
                        </TableHead>

                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredItems.map((item, index) => {
                        const earliestExpiry = getEarliestExpiryFromBatches(
                          item.batches
                        );
                        const isExpanded = expandedItemId === item.id;

                        return (
                          <Fragment key={item.id}>
                            {/* Main Row */}
                            <TableRow
                              className="cursor-pointer hover:bg-blue-100/50 transition-colors"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-600" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Min: {item.minStock} {item.unit} • Max:{" "}
                                    {item.maxStock} {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {
                                  categories.find((c) => c.id === item.category)
                                    ?.name
                                }
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">{item.unit}</TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {item.batches?.length || 0} lô
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.currentStock} {item.unit}
                                  </p>
                                  <Progress
                                    value={
                                      (item.currentStock / item.maxStock) * 100
                                    }
                                    className="h-1 mt-1"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {getProductStatusBadge(item.productStatus)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {getStatusBadge(item.status)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {(() => {
                                  const exp = earliestExpiry || getSampleExpiryDate();
                                  const days = getDaysUntilExpiry(exp)!;
                                  return (
                                    <div>
                                      <p className="text-slate-900">
                                        {new Date(exp).toLocaleDateString("vi-VN")}
                                      </p>
                                      <p
                                        className={`text-xs ${days < 7 ? "text-red-600" : "text-slate-500"
                                          }`}
                                      >
                                        Còn {days} ngày
                                      </p>
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {(
                                  item.sellingPrice ?? getSampleSellingPrice(item)
                                ).toLocaleString()}
                                ₫
                              </TableCell>

                              <TableCell
                                className="text-sm text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-end gap-2">
                                  {canUpdate && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingItem(item);
                                        setEditValues({
                                          name: item.name,
                                          category: item.category,
                                          unit: item.unit,
                                          minStock: item.minStock,
                                          maxStock: item.maxStock,
                                          sellingPrice: item.sellingPrice,
                                          productStatus: item.productStatus,
                                          ingredients: item.ingredients || [],
                                          isTopping: item.isTopping || false,
                                          productIds: item.productIds || [],
                                          imageUrl: item.imageUrl || "",
                                        });
                                        setIsTopping(item.isTopping || false);
                                        setAssociatedProducts(
                                          item.productIds
                                            ? items.filter((i) =>
                                              item.productIds?.includes(Number(i.id))
                                            )
                                            : []
                                        );
                                        setEditDialogOpen(true);
                                      }}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc muốn xóa ${item.name}?`)) {
                                          handleDeleteItem(item.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Row */}
                            {isExpanded && (
                              <TableRow className="bg-blue-100/30">
                                <TableCell colSpan={12} className="p-0">
                                  <div className="p-6 animate-in slide-in-from-top-2">
                                    {/* Image and Info Section */}
                                    <div className="flex gap-6 mb-6">
                                      {/* Product Image */}
                                      <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                          <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
                                          />
                                        ) : (
                                          <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                                            <Package className="w-16 h-16 text-slate-400" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Product Info */}
                                      <div className="flex-1">
                                        <h3 className="text-lg text-slate-900 mb-2">
                                          {item.name}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-slate-500">
                                              Mã hàng:
                                            </span>
                                            <span className="ml-2 text-slate-900">
                                              {item.id}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Danh mục:
                                            </span>
                                            <span className="ml-2 text-slate-900">
                                              {
                                                categories.find(
                                                  (c) => c.id === item.category
                                                )?.name
                                              }
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Tồn kho hiện tại:
                                            </span>
                                            <span className="ml-2 text-blue-900">
                                              {item.currentStock} {item.unit}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Giá trị tồn kho:
                                            </span>
                                            <span className="ml-2 text-blue-900">
                                              {item.totalValue.toLocaleString()}
                                              ₫
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator className="mb-4" />

                                    <h4 className="text-sm text-slate-900 mb-3">
                                      Danh sách lô hàng
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-blue-100">
                                            <TableHead>Mã lô</TableHead>
                                            <TableHead>Ngày nhập</TableHead>
                                            <TableHead>Số lượng</TableHead>
                                            <TableHead>Giá vốn</TableHead>
                                            <TableHead>HSD</TableHead>
                                            <TableHead>Nhà cung cấp</TableHead>
                                            <TableHead>Giá trị lô</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.batches?.map((batch) => (
                                            <TableRow key={batch.batchCode}>
                                              <TableCell className="text-sm text-slate-900">
                                                {batch.batchCode}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {new Date(
                                                  batch.entryDate
                                                ).toLocaleDateString("vi-VN")}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-900">
                                                {batch.quantity} {item.unit}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {batch.unitCost.toLocaleString()}
                                                ₫
                                              </TableCell>
                                              <TableCell className="text-sm">
                                                {(() => {
                                                  const exp = batch.expiryDate || getSampleExpiryDate();
                                                  const days = getDaysUntilExpiry(exp)!;
                                                  return (
                                                    <div>
                                                      <p className="text-slate-900">
                                                        {new Date(exp).toLocaleDateString("vi-VN")}
                                                      </p>
                                                      <p
                                                        className={`text-xs ${days < 7 ? "text-red-600" : "text-slate-500"
                                                          }`}
                                                      >
                                                        Còn {days} ngày
                                                      </p>
                                                    </div>
                                                  );
                                                })()}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {batch.supplier}
                                              </TableCell>
                                              <TableCell className="text-sm text-blue-900">
                                                {(
                                                  batch.quantity *
                                                  batch.unitCost
                                                ).toLocaleString()}
                                                ₫
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Composite Tab */}
          <TabsContent value="composite">
            <Card className="border-purple-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-100">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-16">STT</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Tên hàng hóa
                            {getSortIcon("name")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Danh mục
                            {getSortIcon("category")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("unit")}
                        >
                          <div className="flex items-center">
                            Đơn vị tính
                            {getSortIcon("unit")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("ingredients")}
                        >
                          <div className="flex items-center">
                            Số nguyên liệu
                            {getSortIcon("ingredients")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("avgUnitCost")}
                        >
                          <div className="flex items-center">
                            Giá vốn ước tính
                            {getSortIcon("avgUnitCost")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("productStatus")}
                        >
                          <div className="flex items-center">
                            Trạng thái mặt hàng
                            {getSortIcon("productStatus")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center">
                            Trạng thái tồn kho
                            {getSortIcon("status")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("sellingPrice")}
                        >
                          <div className="flex items-center">
                            Giá bán
                            {getSortIcon("sellingPrice")}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredItems.map((item, index) => {
                        const isExpanded = expandedItemId === item.id;

                        return (
                          <Fragment key={item.id}>
                            {/* Main Row */}
                            <TableRow
                              className="cursor-pointer hover:bg-purple-50/50 transition-colors"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-600" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {index + 1}
                              </TableCell>
                              <TableCell className="text-sm">
                                <div>
                                  <p className="text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Đơn vị: {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-700">
                                {
                                  categories.find((c) => c.id === item.category)
                                    ?.name
                                }
                              </TableCell>
                              <TableCell className="text-sm text-slate-700">{item.unit}</TableCell>
                              <TableCell className="text-sm text-slate-700">
                                {item.ingredients?.length || 0} nguyên liệu
                              </TableCell>
                              <TableCell className="text-sm text-purple-900">
                                {item.avgUnitCost.toLocaleString()}₫
                              </TableCell>
                              <TableCell className="text-sm">
                                {getProductStatusBadge(item.productStatus)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {getStatusBadge(item.status)}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {item.sellingPrice ? `${item.sellingPrice.toLocaleString()}₫` : "—"}
                              </TableCell>
                              <TableCell
                                className="text-sm text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingItem(item);
                                      setEditValues({
                                        name: item.name,
                                        category: item.category,
                                        unit: item.unit,
                                        minStock: item.minStock,
                                        maxStock: item.maxStock,
                                        sellingPrice: item.sellingPrice,
                                        productStatus: item.productStatus,
                                        ingredients: item.ingredients || [],
                                        isTopping: item.isTopping || false,
                                        productIds: item.productIds || [],
                                        imageUrl: item.imageUrl || "",
                                      });
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  {canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc muốn xóa ${item.name}?`)) {
                                          handleDeleteItem(item.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Row */}
                            {isExpanded && (
                              <TableRow className="bg-blue-50/30">
                                <TableCell colSpan={11} className="p-0">
                                  <div className="p-6 animate-in slide-in-from-top-2">
                                    {/* Image and Info Section */}
                                    <div className="flex gap-6 mb-6">
                                      {/* Product Image */}
                                      <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                          <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                                          />
                                        ) : (
                                          <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                                            <Layers className="w-16 h-16 text-slate-400" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Product Info */}
                                      <div className="flex-1">
                                        <h3 className="text-lg text-slate-900 mb-2">
                                          {item.name}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-slate-500">
                                              Mã hàng:
                                            </span>
                                            <span className="ml-2 text-slate-900">
                                              {item.id}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Danh mục:
                                            </span>
                                            <span className="ml-2 text-slate-900">
                                              {
                                                categories.find(
                                                  (c) => c.id === item.category
                                                )?.name
                                              }
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Số nguyên liệu:
                                            </span>
                                            <span className="ml-2 text-purple-900">
                                              {item.ingredients?.length || 0}{" "}
                                              nguyên liệu
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Giá vốn ước tính:
                                            </span>
                                            <span className="ml-2 text-purple-900">
                                              {item.avgUnitCost.toLocaleString()}
                                              ₫
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator className="mb-4" />

                                    <h4 className="text-sm text-slate-900 mb-3">
                                      Danh sách nguyên liệu cấu thành
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-blue-100">
                                            <TableHead>Mã NVL</TableHead>
                                            <TableHead>
                                              Tên nguyên liệu
                                            </TableHead>
                                            <TableHead>Đơn vị</TableHead>
                                            <TableHead>Số lượng dùng</TableHead>
                                            <TableHead>
                                              Giá vốn/đơn vị
                                            </TableHead>
                                            <TableHead>Thành tiền</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.ingredients?.map((ing) => (
                                            <TableRow key={ing.ingredientId}>
                                              <TableCell className="text-sm text-slate-600">
                                                {ing.ingredientId}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-900">
                                                {ing.ingredientName}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {ing.unit}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-900">
                                                {ing.quantity}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {ing.unitCost.toLocaleString()}₫
                                              </TableCell>
                                              <TableCell className="text-sm text-purple-900">
                                                {(
                                                  ing.quantity * ing.unitCost
                                                ).toLocaleString()}
                                                ₫
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredient Tab */}
          <TabsContent value="ingredient">
            <Card className="border-green-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-100">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-16">STT</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Nguyên liệu
                            {getSortIcon("name")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Danh mục
                            {getSortIcon("category")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("unit")}
                        >
                          <div className="flex items-center">
                            Đơn vị tính
                            {getSortIcon("unit")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("batches")}
                        >
                          <div className="flex items-center">
                            Lô hàng
                            {getSortIcon("batches")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("currentStock")}
                        >
                          <div className="flex items-center">
                            Tồn kho
                            {getSortIcon("currentStock")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("productStatus")}
                        >
                          <div className="flex items-center">
                            Trạng thái mặt hàng
                            {getSortIcon("productStatus")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center">
                            Trạng thái tồn kho
                            {getSortIcon("status")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("expiryDate")}
                        >
                          <div className="flex items-center">
                            HSD gần nhất
                            {getSortIcon("expiryDate")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("supplier")}
                        >
                          <div className="flex items-center">
                            Nhà cung cấp
                            {getSortIcon("supplier")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleSort("sellingPrice")}
                        >
                          <div className="flex items-center">
                            Giá bán
                            {getSortIcon("sellingPrice")}
                          </div>
                        </TableHead>

                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredItems.map((item, index) => {
                        const earliestExpiry = getEarliestExpiryFromBatches(
                          item.batches
                        );
                        const primarySupplier =
                          item.batches?.[0]?.supplier || "—";
                        const isExpanded = expandedItemId === item.id;

                        return (
                          <Fragment key={item.id}>
                            {/* Main Row */}
                            <TableRow
                              className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-600" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Min: {item.minStock} {item.unit} • Max:{" "}
                                    {item.maxStock} {item.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {
                                  categories.find((c) => c.id === item.category)
                                    ?.name
                                }
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">{item.unit}</TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {item.batches?.length || 0} lô
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">
                                    {item.currentStock} {item.unit}
                                  </p>
                                  <Progress
                                    value={
                                      (item.currentStock / item.maxStock) * 100
                                    }
                                    className="h-1 mt-1"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {getProductStatusBadge(item.productStatus)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {getStatusBadge(item.status)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {earliestExpiry ? (
                                  <div>
                                    <p className="text-slate-900">
                                      {new Date(
                                        earliestExpiry
                                      ).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p
                                      className={`text-xs ${getDaysUntilExpiry(earliestExpiry)! < 7
                                        ? "text-red-600"
                                        : "text-slate-500"
                                        }`}
                                    >
                                      Còn {getDaysUntilExpiry(earliestExpiry)}{" "}
                                      ngày
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-slate-700">
                                {primarySupplier}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {item.sellingPrice ? `${item.sellingPrice.toLocaleString()}₫` : "—"}
                              </TableCell>

                              <TableCell
                                className="text-sm text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingItem(item);
                                      setEditValues({
                                        name: item.name,
                                        category: item.category,
                                        unit: item.unit,
                                        minStock: item.minStock,
                                        maxStock: item.maxStock,
                                        sellingPrice: item.sellingPrice,
                                        productStatus: item.productStatus,
                                        ingredients: item.ingredients || [],
                                        isTopping: item.isTopping || false,
                                        productIds: item.productIds || [],
                                        imageUrl: item.imageUrl || "",
                                      });
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  {canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc muốn xóa ${item.name}?`)) {
                                          handleDeleteItem(item.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Row */}
                            {isExpanded && (
                              <TableRow className="bg-green-50/30">
                                <TableCell colSpan={13} className="p-0">
                                  <div className="p-6 animate-in slide-in-from-top-2">
                                    {/* Image and Info Section */}
                                    <div className="flex gap-6 mb-6">
                                      {/* Product Image */}
                                      <div className="flex-shrink-0">
                                        {item.imageUrl ? (
                                          <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                                          />
                                        ) : (
                                          <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                                            <Box className="w-16 h-16 text-slate-400" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Product Info */}
                                      <div className="flex-1">
                                        <h3 className="text-lg text-slate-900 mb-2">
                                          {item.name}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-slate-500">
                                              Mã nguyên liệu:
                                            </span>
                                            <span className="ml-2 text-slate-900">
                                              {item.id}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Danh mục:
                                            </span>
                                            <span className="ml-2 text-slate-900">
                                              {
                                                categories.find(
                                                  (c) => c.id === item.category
                                                )?.name
                                              }
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Tồn kho hiện tại:
                                            </span>
                                            <span className="ml-2 text-green-900">
                                              {item.currentStock} {item.unit}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">
                                              Giá trị tồn kho:
                                            </span>
                                            <span className="ml-2 text-green-900">
                                              {item.totalValue.toLocaleString()}
                                              ₫
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator className="mb-4" />

                                    <h4 className="text-sm text-slate-900 mb-3">
                                      Danh sách lô hàng
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-blue-100">
                                            <TableHead>Mã lô</TableHead>
                                            <TableHead>Ngày nhập</TableHead>
                                            <TableHead>Số lượng</TableHead>
                                            <TableHead>Giá vốn</TableHead>
                                            <TableHead>HSD</TableHead>
                                            <TableHead>Nhà cung cấp</TableHead>
                                            <TableHead>Giá trị lô</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.batches?.map((batch) => (
                                            <TableRow key={batch.batchCode}>
                                              <TableCell className="text-sm text-slate-900">
                                                {batch.batchCode}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {new Date(
                                                  batch.entryDate
                                                ).toLocaleDateString("vi-VN")}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-900">
                                                {batch.quantity} {item.unit}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {batch.unitCost.toLocaleString()}
                                                ₫
                                              </TableCell>
                                              <TableCell className="text-sm">
                                                {batch.expiryDate ? (
                                                  <div>
                                                    <p className="text-slate-900">
                                                      {new Date(
                                                        batch.expiryDate
                                                      ).toLocaleDateString(
                                                        "vi-VN"
                                                      )}
                                                    </p>
                                                    <p
                                                      className={`text-xs ${getDaysUntilExpiry(
                                                        batch.expiryDate
                                                      )! < 7
                                                        ? "text-red-600"
                                                        : "text-slate-500"
                                                        }`}
                                                    >
                                                      Còn{" "}
                                                      {getDaysUntilExpiry(
                                                        batch.expiryDate
                                                      )}{" "}
                                                      ngày
                                                    </p>
                                                  </div>
                                                ) : (
                                                  <span className="text-slate-400">
                                                    —
                                                  </span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-sm text-slate-600">
                                                {batch.supplier}
                                              </TableCell>
                                              <TableCell className="text-sm text-green-900">
                                                {(
                                                  batch.quantity *
                                                  batch.unitCost
                                                ).toLocaleString()}
                                                ₫
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Import Excel Dialog */}
      <ImportExcelDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      <ExportExcelDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={filteredItems}
        columns={[
          { header: 'Mã hàng', accessor: (row: any) => row.id },
          { header: 'Tên hàng', accessor: (row: any) => row.name },
          { header: 'Loại', accessor: (row: any) => row.type === 'ready-made' ? 'Hàng bán sẵn' : row.type === 'ingredient' ? 'Nguyên liệu' : 'Hàng cấu thành' },
          { header: 'Danh mục', accessor: (row: any) => categories.find(c => c.id === row.category)?.name || row.category },
          { header: 'Đơn vị', accessor: (row: any) => row.unit },
          { header: 'Tồn kho', accessor: (row: any) => row.currentStock },
          { header: 'Tồn tối thiểu', accessor: (row: any) => row.minStock },
          { header: 'Tồn tối đa', accessor: (row: any) => row.maxStock },
          { header: 'Giá trị tồn', accessor: (row: any) => row.totalValue },
          {
            header: 'Trạng thái', accessor: (row: any) => {
              switch (row.status) {
                case 'good': return 'Đủ hàng';
                case 'low': return 'Sắp hết hàng';
                case 'critical': return 'Hết hàng';
                case 'expiring': return 'Gần hết hạn';
                case 'expired': return 'Hết hạn';
                default: return row.status;
              }
            }
          },
        ]}
        fileName="danh-sach-hang-hoa"
        title="Xuất danh sách hàng hóa"
      />
    </div>
  );
}
