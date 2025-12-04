import { useState } from 'react';
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
  Tag
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../ui/sheet';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ItemCustomizationModal, ItemCustomization } from '../ItemCustomizationModal';
import { PromotionPopup } from '../PromotionPopup';
import { ComboSelectionPopup } from '../ComboSelectionPopup';
import { ComboSuggestionBanner } from '../ComboSuggestionBanner';
import { ComboDetectionPopup } from '../ComboDetectionPopup';
import { CartItemDisplay } from '../CartItemDisplay';
import { combos, type Combo } from '../../data/combos';
import { autoComboPromotions } from '../../data/combos';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status?: 'pending' | 'preparing' | 'completed' | 'served' | 'out-of-stock' | 'waiting-ingredient' | 'canceled' | 'replaced';
  toppings?: string[];
  outOfStockReason?: string;
  outOfStockIngredients?: string[];
  replacedBy?: string;
  replacedFrom?: string;
  customization?: ItemCustomization;
  // Combo fields
  isCombo?: boolean;
  comboId?: string;
  comboItems?: CartItem[];
  comboExpanded?: boolean;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied';
  currentOrder?: string;
  area: string;
  startTime?: number; // timestamp when table was occupied
}

interface TableOrders {
  [tableId: string]: CartItem[];
}

interface Area {
  id: string;
  name: string;
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
  unit: string;
  avgUnitCost: number;
}

interface NewItemRequest {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
  isNew?: boolean; // for showing "Mới" badge
  ingredients?: CompositeIngredient[];
}

export function POSOrdering() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedTableStatus, setSelectedTableStatus] = useState('all');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [outOfStockOpen, setOutOfStockOpen] = useState(false);
  const [selectedItemForNote, setSelectedItemForNote] = useState<CartItem | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [moveTableOpen, setMoveTableOpen] = useState(false);
  const [targetTable, setTargetTable] = useState<Table | null>(null);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([
    { time: '12:31', action: 'Tạo đơn ORD-001 tại Bàn 2', staff: 'NV Minh' },
    { time: '12:35', action: 'Cập nhật trạng thái: Đang chế biến', staff: 'NV Lan' },
  ]);
  const [mergeTableOpen, setMergeTableOpen] = useState(false);
  const [mergeTargetTable, setMergeTargetTable] = useState<Table | null>(null);
  const [splitOrderOpen, setSplitOrderOpen] = useState(false);
  const [splitItems, setSplitItems] = useState<{[itemId: string]: number}>({});
  
  // Out of stock states
  const [outOfStockWarningOpen, setOutOfStockWarningOpen] = useState(false);
  const [outOfStockItem, setOutOfStockItem] = useState<CartItem | null>(null);
  const [outOfStockIngredient, setOutOfStockIngredient] = useState<string>('');
  const [replaceItemModalOpen, setReplaceItemModalOpen] = useState(false);
  const [globalOutOfStock, setGlobalOutOfStock] = useState<string[]>(['Sữa tươi', 'Trân châu']); // Mock data // itemId -> quantity to split
  const [splitDestinationTable, setSplitDestinationTable] = useState<Table | null>(null);
  
  // New item request states
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [requestsDrawerOpen, setRequestsDrawerOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [addIngredientDialogOpen, setAddIngredientDialogOpen] = useState(false);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<CompositeIngredient[]>([]);
  
  // Customization states
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<CartItem | null>(null);
  
  // Promotion states
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [usedPoints, setUsedPoints] = useState(0);
  
  // Restock notification states
  const [restockedItems, setRestockedItems] = useState<string[]>([]);
  const [glowingItems, setGlowingItems] = useState<string[]>([]);
  
  // Combo states
  const [comboSelectionOpen, setComboSelectionOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [dismissedComboSuggestions, setDismissedComboSuggestions] = useState<string[]>([]);
  const [comboDetectionOpen, setComboDetectionOpen] = useState(false);
  const [detectedComboData, setDetectedComboData] = useState<any>(null);
  const [pendingItemToAdd, setPendingItemToAdd] = useState<typeof products[0] | null>(null);
  
  // Mock inventory ingredients for adding to formula
  const inventoryIngredients: InventoryIngredient[] = [
    { id: 'ing1', name: 'Cà phê hạt Arabica', unit: 'g', avgUnitCost: 350 },
    { id: 'ing2', name: 'Sữa tươi', unit: 'ml', avgUnitCost: 28 },
    { id: 'ing3', name: 'Đường trắng', unit: 'g', avgUnitCost: 22 },
    { id: 'ing4', name: 'Kem tươi', unit: 'ml', avgUnitCost: 85 },
    { id: 'ing5', name: 'Trà Ô Long', unit: 'g', avgUnitCost: 280 },
    { id: 'ing6', name: 'Đào tươi', unit: 'g', avgUnitCost: 50 },
    { id: 'ing7', name: 'Trân châu đen', unit: 'g', avgUnitCost: 35 },
    { id: 'ing8', name: 'Siro vani', unit: 'ml', avgUnitCost: 45 },
    { id: 'ing9', name: 'Đá viên', unit: 'g', avgUnitCost: 2 },
    { id: 'ing10', name: 'Chocolate bột', unit: 'g', avgUnitCost: 120 },
  ];
  
  const [newItemRequests, setNewItemRequests] = useState<NewItemRequest[]>([
    {
      id: 'req1',
      name: 'Trà đào mix phúc bồn tử',
      category: 'tea',
      description: 'Trà đào kết hợp với phúc bồn tử tươi',
      notes: 'Khách yêu cầu',
      status: 'pending',
      createdAt: '14:15',
    },
    {
      id: 'req2',
      name: 'Cà phê trứng',
      category: 'coffee',
      description: 'Cà phê đen với lớp kem trứng béo ngậy',
      notes: '',
      status: 'approved',
      createdAt: '10:20',
      isNew: true,
    },
    {
      id: 'req3',
      name: 'Sinh tố xoài dừa',
      category: 'smoothie',
      description: 'Sinh tố xoài với nước cốt dừa',
      notes: '',
      status: 'rejected',
      createdAt: '09:50',
      rejectionReason: 'Thiếu thông tin chi tiết',
    },
  ]);
  
  // Lưu đơn hàng cho từng bàn
  const [tableOrders, setTableOrders] = useState<TableOrders>({
    // Mock data cho bàn đang có khách
    't2': [
      { id: '1', name: 'Cà phê sữa đá', price: 35000, quantity: 2, status: 'preparing' },
      { id: '5', name: 'Trà đào cam sả', price: 40000, quantity: 1, status: 'completed', toppings: ['Đá', 'Ít đường'] },
      { id: '8', name: 'Sinh tố dâu', price: 40000, quantity: 1, status: 'pending' },
    ],
    't4': [
      { id: '2', name: 'Bạc xỉu', price: 30000, quantity: 1, status: 'completed' },
      { id: '9', name: 'Bánh tiramisu', price: 50000, quantity: 2, status: 'served' },
    ],
    't7': [
      { id: '4', name: 'Cappuccino', price: 45000, quantity: 1, status: 'preparing', toppings: ['Shot thêm'] },
      { id: '10', name: 'Bánh croissant', price: 35000, quantity: 1, status: 'completed' },
      { id: '7', name: 'Sinh tố bơ', price: 42000, quantity: 2, status: 'pending' },
    ],
  });
  const [takeawayOrders, setTakeawayOrders] = useState<CartItem[]>([]);

  // Convert tables to state so we can update them
  const [tables, setTables] = useState<Table[]>([
    { id: 't1', number: 1, capacity: 2, status: 'available', area: 'tang1' },
    { id: 't2', number: 2, capacity: 2, status: 'occupied', currentOrder: 'ORD-001', area: 'tang1', startTime: Date.now() - 720000 },
    { id: 't3', number: 3, capacity: 4, status: 'available', area: 'tang1' },
    { id: 't4', number: 4, capacity: 4, status: 'occupied', currentOrder: 'ORD-002', area: 'tang1', startTime: Date.now() - 1800000 },
    { id: 't5', number: 5, capacity: 6, status: 'available', area: 'tang2' },
    { id: 't6', number: 6, capacity: 4, status: 'available', area: 'tang2' },
    { id: 't7', number: 7, capacity: 2, status: 'occupied', currentOrder: 'ORD-003', area: 'tang2', startTime: Date.now() - 360000 },
    { id: 't8', number: 8, capacity: 4, status: 'available', area: 'tang2' },
    { id: 't9', number: 9, capacity: 2, status: 'available', area: 'vip' },
    { id: 't10', number: 10, capacity: 4, status: 'available', area: 'vip' },
    { id: 't11', number: 11, capacity: 6, status: 'available', area: 'rooftop' },
    { id: 't12', number: 12, capacity: 4, status: 'available', area: 'rooftop' },
  ]);

  const areas: Area[] = [
    { id: 'tang1', name: 'Tầng 1' },
    { id: 'tang2', name: 'Tầng 2' },
    { id: 'vip', name: 'Phòng VIP' },
    { id: 'rooftop', name: 'Sân thượng' },
  ];

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'combo', name: 'Combo' },
    { id: 'coffee', name: 'Cà phê' },
    { id: 'tea', name: 'Trà' },
    { id: 'smoothie', name: 'Sinh tố' },
    { id: 'pastry', name: 'Bánh ngọt' },
  ];

  const products = [
    { id: '1', name: 'Cà phê sữa đá', category: 'coffee', price: 35000, image: '☕' },
    { id: '2', name: 'Bạc xỉu', category: 'coffee', price: 30000, image: '☕' },
    { id: '3', name: 'Cà phê đen', category: 'coffee', price: 25000, image: '☕' },
    { id: '4', name: 'Cappuccino', category: 'coffee', price: 45000, image: '☕' },
    { id: '5', name: 'Trà đào cam sả', category: 'tea', price: 40000, image: '🍵' },
    { id: '6', name: 'Trà sữa trân châu', category: 'tea', price: 38000, image: '🍵' },
    { id: '7', name: 'Sinh tố bơ', category: 'smoothie', price: 42000, image: '🥤' },
    { id: '8', name: 'Sinh tố dâu', category: 'smoothie', price: 40000, image: '🥤' },
    { id: '9', name: 'Bánh tiramisu', category: 'pastry', price: 50000, image: '🍰' },
    { id: '10', name: 'Bánh croissant', category: 'pastry', price: 35000, image: '🥐' },
    { id: '11', name: 'Cà phê trứng', category: 'coffee', price: 40000, image: '☕', isNew: true },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && selectedCategory !== 'combo';
  });
  
  const filteredCombos = combos.filter(c => {
    const matchesCategory = selectedCategory === 'all' || selectedCategory === 'combo';
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
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
        [selectedTable.id]: newCart
      });
    }
  };

  // Combo helper functions
  const detectComboSuggestions = () => {
    const cart = getCurrentCart();
    const suggestions: any[] = [];
    
    // Get non-combo items for detection
    const nonComboItems = cart.filter(item => !item.isCombo);
    
    autoComboPromotions.forEach(promo => {
      let eligible = true;
      const missingItems: string[] = [];
      let applicableCount = Infinity;
      
      // Check each required item category/id
      promo.requiredItems.forEach(required => {
        let availableCount = 0;
        
        if (required.category) {
          // Count items in this category
          nonComboItems.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (product?.category === required.category) {
              availableCount += cartItem.quantity;
            }
          });
          
          if (availableCount < required.minQuantity) {
            eligible = false;
            missingItems.push(`${required.minQuantity - availableCount} món ${getCategoryName(required.category)}`);
          } else {
            // Calculate how many times this combo can be applied
            applicableCount = Math.min(applicableCount, Math.floor(availableCount / required.minQuantity));
          }
        }
      });
      
      // Don't show if dismissed
      if (!dismissedComboSuggestions.includes(promo.id)) {
        suggestions.push({
          id: promo.id,
          name: promo.name,
          description: promo.description,
          discount: promo.discount.value,
          eligible,
          missingItems,
          applicableCount: eligible ? applicableCount : undefined
        });
      }
    });
    
    return suggestions;
  };
  
  const getCategoryName = (categoryId: string) => {
    const categoryNames: {[key: string]: string} = {
      'coffee': 'Cà phê',
      'tea': 'Trà',
      'smoothie': 'Sinh tố',
      'pastry': 'Bánh ngọt',
    };
    return categoryNames[categoryId] || categoryId;
  };
  
  const handleApplyComboSuggestion = (comboId: string) => {
    const promo = autoComboPromotions.find(p => p.id === comboId);
    if (!promo) return;
    
    toast.success(`Đã áp dụng ${promo.name}`);
    // This would integrate with the promotion system
    // For now, just dismiss the suggestion
    setDismissedComboSuggestions([...dismissedComboSuggestions, comboId]);
  };
  
  const handleDismissComboSuggestion = (comboId: string) => {
    setDismissedComboSuggestions([...dismissedComboSuggestions, comboId]);
  };
  
  const handleComboClick = (combo: Combo) => {
    if (selectedTable && selectedTable.status === 'occupied') {
      toast.error('Bàn này đang có khách, không thể thêm món mới');
      return;
    }
    
    setSelectedCombo(combo);
    setComboSelectionOpen(true);
  };
  
  const handleConfirmCombo = (selectedItems: { [groupId: string]: string[] }, combo: Combo) => {
    const cart = getCurrentCart();
    
    // Create combo cart item with nested items
    const comboCartItem: CartItem = {
      id: `combo-${combo.id}-${Date.now()}`,
      name: combo.name,
      price: combo.price,
      quantity: 1,
      status: 'pending',
      isCombo: true,
      comboId: combo.id,
      comboExpanded: false,
      comboItems: []
    };
    
    // Add selected items as nested items
    combo.groups.forEach(group => {
      const selections = selectedItems[group.id] || [];
      selections.forEach(itemId => {
        const groupItem = group.items.find(i => i.id === itemId);
        if (groupItem) {
          comboCartItem.comboItems!.push({
            id: groupItem.id,
            name: groupItem.name,
            price: groupItem.price,
            quantity: 1,
            status: 'pending'
          });
        }
      });
    });
    
    // Calculate final price (base + extras)
    let finalPrice = combo.price;
    combo.groups.forEach(group => {
      const selections = selectedItems[group.id] || [];
      selections.forEach(itemId => {
        const item = group.items.find(i => i.id === itemId);
        if (item?.extraPrice) {
          finalPrice += item.extraPrice;
        }
      });
    });
    comboCartItem.price = finalPrice;
    
    updateCurrentCart([...cart, comboCartItem]);
    toast.success('Đã thêm combo vào đơn hàng');
  };
  
  const toggleComboExpansion = (comboItemId: string) => {
    const cart = getCurrentCart();
    updateCurrentCart(cart.map(item => 
      item.id === comboItemId 
        ? { ...item, comboExpanded: !item.comboExpanded }
        : item
    ));
  };
  
  const handleApplyDetectedCombo = () => {
    if (!detectedComboData || !pendingItemToAdd) return;
    
    const cart = getCurrentCart();
    
    // Add the pending item first
    const existing = cart.find(item => item.id === pendingItemToAdd.id && !item.isCombo);
    let newCart = [...cart];
    
    if (existing) {
      newCart = cart.map(item => 
        item.id === pendingItemToAdd.id && !item.isCombo
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...pendingItemToAdd, quantity: 1, status: 'pending' }];
    }
    
    // Now convert matching items into a combo
    const comboItems: CartItem[] = [];
    const itemsToRemove: string[] = [];
    
    detectedComboData.matchingItems.forEach((matchItem: any) => {
      const cartItem = newCart.find(item => item.id === matchItem.id && !item.isCombo);
      if (cartItem) {
        // Add to combo items
        for (let i = 0; i < matchItem.quantity; i++) {
          comboItems.push({
            id: cartItem.id,
            name: cartItem.name,
            price: cartItem.price,
            quantity: 1,
            status: 'pending',
            customization: cartItem.customization
          });
        }
        
        // Reduce quantity or mark for removal
        if (cartItem.quantity <= matchItem.quantity) {
          itemsToRemove.push(cartItem.id);
        } else {
          cartItem.quantity -= matchItem.quantity;
        }
      }
    });
    
    // Remove items that were fully consumed by combo
    newCart = newCart.filter(item => !itemsToRemove.includes(item.id) || item.isCombo);
    
    // Create combo cart item
    const comboCartItem: CartItem = {
      id: `combo-auto-${detectedComboData.id}-${Date.now()}`,
      name: detectedComboData.name,
      price: detectedComboData.finalPrice,
      quantity: 1,
      status: 'pending',
      isCombo: true,
      comboId: detectedComboData.id,
      comboExpanded: false,
      comboItems
    };
    
    newCart.push(comboCartItem);
    updateCurrentCart(newCart);
    
    toast.success(`Đã áp dụng ${detectedComboData.name}`);
    setComboDetectionOpen(false);
    setPendingItemToAdd(null);
    setDetectedComboData(null);
  };
  
  const handleContinueIndividual = () => {
    if (!pendingItemToAdd) return;
    
    // Add item normally without combo
    const cart = getCurrentCart();
    const existing = cart.find(item => item.id === pendingItemToAdd.id && !item.isCombo);
    
    if (existing) {
      updateCurrentCart(cart.map(item => 
        item.id === pendingItemToAdd.id && !item.isCombo
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      updateCurrentCart([...cart, { ...pendingItemToAdd, quantity: 1, status: 'pending' }]);
    }
    
    setComboDetectionOpen(false);
    setPendingItemToAdd(null);
    setDetectedComboData(null);
  };
  
  const handleCustomizeComboItem = (comboId: string, itemIndex: number) => {
    const cart = getCurrentCart();
    const combo = cart.find(item => item.id === comboId && item.isCombo);
    
    if (combo && combo.comboItems && combo.comboItems[itemIndex]) {
      const itemToCustomize = combo.comboItems[itemIndex];
      setSelectedItemForCustomization({
        ...itemToCustomize,
        // Store parent combo info for update
        __comboId: comboId,
        __itemIndex: itemIndex
      } as any);
      setCustomizationModalOpen(true);
    }
  };
  
  const handleUpdateComboItemCustomization = (customization: ItemCustomization) => {
    const item = selectedItemForCustomization as any;
    if (!item || !item.__comboId) return;
    
    const cart = getCurrentCart();
    const comboId = item.__comboId;
    const itemIndex = item.__itemIndex;
    
    updateCurrentCart(cart.map(cartItem => {
      if (cartItem.id === comboId && cartItem.isCombo && cartItem.comboItems) {
        const updatedComboItems = [...cartItem.comboItems];
        if (updatedComboItems[itemIndex]) {
          updatedComboItems[itemIndex] = {
            ...updatedComboItems[itemIndex],
            customization
          };
          
          // Calculate extra charge from toppings
          const extraCharge = customization.toppings.reduce((sum, t) => sum + t.price, 0);
          
          // Update combo price
          const baseComboPrice = detectedComboData?.finalPrice || cartItem.price;
          const totalExtra = cartItem.comboItems.reduce((sum, item) => {
            const itemExtra = item.customization?.toppings?.reduce((s, t) => s + t.price, 0) || 0;
            return sum + itemExtra;
          }, extraCharge);
          
          return {
            ...cartItem,
            comboItems: updatedComboItems,
            price: baseComboPrice + totalExtra
          };
        }
      }
      return cartItem;
    }));
  };

  const isProductOutOfStock = (product: typeof products[0]) => {
    // Check if product ingredients are in global out-of-stock list
    const productIngredients: {[key: string]: string[]} = {
      '1': ['Sữa tươi', 'Cà phê'], // Cà phê sữa đá
      '2': ['Sữa đặc', 'Cà phê'], // Bạc xỉu
      '6': ['Trân châu', 'Trà'], // Trà sữa trân châu
    };
    
    const ingredients = productIngredients[product.id] || [];
    return ingredients.some(ing => globalOutOfStock.includes(ing));
  };

  const checkComboDetection = (cart: CartItem[], newProduct: typeof products[0]) => {
    // Create hypothetical cart with the new item
    const hypotheticalCart = [...cart];
    const existing = hypotheticalCart.find(item => item.id === newProduct.id && !item.isCombo);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      hypotheticalCart.push({ ...newProduct, quantity: 1, status: 'pending' });
    }
    
    // Get non-combo items only
    const nonComboItems = hypotheticalCart.filter(item => !item.isCombo);
    
    // Check each auto combo promotion
    for (const promo of autoComboPromotions) {
      const matchingItems: { id: string; name: string; quantity: number }[] = [];
      let allRequirementsMet = true;
      let minApplicableCount = Infinity;
      
      // Check if all required items are in cart
      for (const required of promo.requiredItems) {
        let availableCount = 0;
        
        if (required.category) {
          // Count items in this category
          nonComboItems.forEach(cartItem => {
            const prod = products.find(p => p.id === cartItem.id);
            if (prod?.category === required.category) {
              availableCount += cartItem.quantity;
              matchingItems.push({
                id: cartItem.id,
                name: cartItem.name,
                quantity: Math.min(cartItem.quantity, required.minQuantity)
              });
            }
          });
        } else if (required.itemId) {
          // Specific item
          const cartItem = nonComboItems.find(item => item.id === required.itemId);
          if (cartItem) {
            availableCount = cartItem.quantity;
            matchingItems.push({
              id: cartItem.id,
              name: cartItem.name,
              quantity: Math.min(cartItem.quantity, required.minQuantity)
            });
          }
        }
        
        if (availableCount < required.minQuantity) {
          allRequirementsMet = false;
          break;
        }
        
        minApplicableCount = Math.min(minApplicableCount, Math.floor(availableCount / required.minQuantity));
      }
      
      // If combo requirements met, return detection data
      if (allRequirementsMet && matchingItems.length > 0) {
        // Calculate prices
        const originalPrice = matchingItems.reduce((sum, item) => {
          const prod = products.find(p => p.id === item.id);
          return sum + (prod?.price || 0) * item.quantity;
        }, 0);
        
        let finalPrice = originalPrice;
        if (promo.discount.type === 'percentage') {
          finalPrice = originalPrice * (1 - promo.discount.value / 100);
        } else {
          finalPrice = originalPrice - promo.discount.value;
        }
        
        return {
          id: promo.id,
          name: promo.name,
          description: promo.description,
          discount: promo.discount,
          matchingItems,
          originalPrice,
          finalPrice,
          applicableCount: minApplicableCount
        };
      }
    }
    
    return null;
  };

  const addToCart = (product: typeof products[0]) => {
    // Check if product is out of stock
    if (isProductOutOfStock(product)) {
      toast.error('Món này tạm thời không thể phục vụ do hết nguyên liệu');
      return;
    }

    // Không cho phép thêm món vào bàn đang có khách (occupied)
    if (selectedTable && selectedTable.status === 'occupied') {
      toast.error('Bàn này đang có khách, không thể thêm món mới');
      return;
    }

    const cart = getCurrentCart();
    
    // Check for combo detection
    const detectedCombo = checkComboDetection(cart, product);
    
    if (detectedCombo) {
      // Show combo detection popup
      setPendingItemToAdd(product);
      setDetectedComboData(detectedCombo);
      setComboDetectionOpen(true);
      return;
    }
    
    // No combo detected, add normally
    const existing = cart.find(item => item.id === product.id && !item.isCombo);
    
    if (existing) {
      updateCurrentCart(cart.map(item => 
        item.id === product.id && !item.isCombo
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      updateCurrentCart([...cart, { ...product, quantity: 1, status: 'pending' }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    const cart = getCurrentCart();
    updateCurrentCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    const cart = getCurrentCart();
    updateCurrentCart(cart.filter(item => item.id !== id));
  };

  const handleSelectTable = (table: Table) => {
    // Cho phép xem tất cả các bàn, kể cả bàn có khách
    setSelectedTable(table);
    setIsTakeaway(false);
    
    // Hiển thị thông báo nếu bàn đang có khách
    if (table.status === 'occupied') {
      toast.info('Đang xem đơn hàng của bàn đang có khách', {
        description: 'Bạn có thể xem và thanh toán, nhưng không thể thêm món mới'
      });
    }
  };

  const handleSelectTakeaway = () => {
    setSelectedTable(null);
    setIsTakeaway(true);
    setOrderType('takeaway');
  };

  const handleOrderTypeChange = (type: 'dine-in' | 'takeaway' | 'delivery') => {
    setOrderType(type);
    if (type === 'takeaway') {
      setSelectedTable(null);
      setIsTakeaway(true);
    } else if (type === 'delivery') {
      setSelectedTable(null);
      setIsTakeaway(true);
    } else {
      setIsTakeaway(false);
    }
  };

  const handleOpenNoteDialog = (item: CartItem) => {
    setSelectedItemForNote(item);
    setNoteText(item.notes || '');
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (selectedItemForNote) {
      const cart = getCurrentCart();
      updateCurrentCart(cart.map(item => 
        item.id === selectedItemForNote.id 
          ? { ...item, notes: noteText }
          : item
      ));
    }
    setNoteDialogOpen(false);
    setSelectedItemForNote(null);
    setNoteText('');
  };

  const handleSendToKitchen = () => {
    const cart = getCurrentCart();
    const pendingItems = cart.filter(item => item.status === 'pending');
    
    if (pendingItems.length === 0) {
      toast.error('Không có món nào cần gửi bếp');
      return;
    }
    
    // Update status of pending items to preparing
    updateCurrentCart(cart.map(item => 
      item.status === 'pending' 
        ? { ...item, status: 'preparing' }
        : item
    ));
    
    const orderInfo = isTakeaway 
      ? 'Đơn mang về' 
      : `Bàn ${selectedTable?.number}`;
    
    // Add to order history
    const historyEntry = {
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      action: `Gửi ${pendingItems.length} món đến quầy pha chế - ${orderInfo}`,
      staff: 'Thu ngân Lan'
    };
    setOrderHistory(prev => [historyEntry, ...prev]);
    
    toast.success(`Đã gửi ${pendingItems.length} món đến quầy pha chế`, {
      description: orderInfo
    });
  };

  // Promotion handlers
  const handleApplyPromoCode = (code?: string) => {
    const codeToApply = code || promoCode.toUpperCase().trim();
    
    if (!codeToApply) {
      setPromoError('Vui lòng nhập mã khuyến mãi');
      return;
    }

    // Mock promotion logic
    const promotions: { [key: string]: { discount: number; description: string } } = {
      'KM10': { discount: 0.1, description: 'Giảm 10% hóa đơn' },
      'GIAMCF': { discount: 5000, description: 'Giảm 5.000đ Cà phê' },
      'HAPPYHOUR': { discount: 0.2, description: 'Happy Hour - Giảm 20%' },
    };

    if (promotions[codeToApply]) {
      const promo = promotions[codeToApply];
      const cart = getCurrentCart();
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
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
      setPromoError('');
      setPromoCode('');
      setPromotionModalOpen(false);
      toast.success(`✓ Đã áp dụng ${codeToApply} - ${promo.description}`);
    } else {
      setPromoError('❌ Mã không hợp lệ hoặc không áp dụng.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode('');
    setDiscountAmount(0);
    setPromoCode('');
    setPromoError('');
    setSelectedPromotion(null);
    setUsedPoints(0);
    toast.success('Đã xóa khuyến mãi');
  };

  // New handler for PromotionPopup
  const handleApplyPromotion = (promotion: any, pointsToUse?: number, customer?: any) => {
    setSelectedPromotion(promotion);
    setUsedPoints(pointsToUse || 0);
    
    if (promotion) {
      const cart = getCurrentCart();
      const subtotal = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
      
      let calculatedDiscount = 0;
      
      if (promotion.type === 'percentage') {
        calculatedDiscount = (subtotal * promotion.value) / 100;
      } else if (promotion.type === 'fixed') {
        calculatedDiscount = promotion.value;
      } else if (promotion.type === 'item' && promotion.applicableCategories) {
        cart.forEach(item => {
          const product = products.find(p => p.id === item.id);
          if (product && product.category && promotion.applicableCategories.includes(product.category)) {
            calculatedDiscount += Math.min(promotion.value * item.quantity, getItemPrice(item) * item.quantity);
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
    updateCurrentCart(cart.map(item => 
      item.id === outOfStockItem.id 
        ? { ...item, status: 'canceled' as const, outOfStockReason: outOfStockIngredient }
        : item
    ));
    
    // Add to order history
    const historyEntry = {
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      action: `Hủy món ${outOfStockItem.name} do hết nguyên liệu ${outOfStockIngredient}`,
      staff: 'Thu ngân Lan'
    };
    setOrderHistory(prev => [historyEntry, ...prev]);
    
    toast.error(`Đã hủy món ${outOfStockItem.name}`);
    setOutOfStockWarningOpen(false);
  };

  const handleWaitIngredient = () => {
    if (!outOfStockItem) return;
    
    const cart = getCurrentCart();
    updateCurrentCart(cart.map(item => 
      item.id === outOfStockItem.id 
        ? { ...item, status: 'waiting-ingredient' as const, outOfStockReason: outOfStockIngredient }
        : item
    ));
    
    // Add to order history
    const historyEntry = {
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      action: `Đợi nguyên liệu ${outOfStockIngredient} cho món ${outOfStockItem.name}`,
      staff: 'Thu ngân Lan'
    };
    setOrderHistory(prev => [historyEntry, ...prev]);
    
    toast.info(`Món ${outOfStockItem.name} đang đợi nguyên liệu`);
    setOutOfStockWarningOpen(false);
  };

  const handleNotifyWaiter = () => {
    if (!outOfStockItem) return;
    
    toast.success('Đã thông báo cho nhân viên phục vụ', {
      description: `Món ${outOfStockItem.name} hết nguyên liệu ${outOfStockIngredient}`
    });
    
    // Add to order history
    const historyEntry = {
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      action: `Thông báo phục vụ: món ${outOfStockItem.name} hết nguyên liệu`,
      staff: 'Thu ngân Lan'
    };
    setOrderHistory(prev => [historyEntry, ...prev]);
  };

  const handleOpenReplaceModal = () => {
    setReplaceItemModalOpen(true);
  };

  const handleReplaceItem = (newProduct: typeof products[0]) => {
    if (!outOfStockItem) return;
    
    const cart = getCurrentCart();
    updateCurrentCart(cart.map(item => 
      item.id === outOfStockItem.id 
        ? { 
            ...newProduct, 
            quantity: outOfStockItem.quantity,
            status: 'replaced' as const,
            replacedFrom: outOfStockItem.name,
            notes: outOfStockItem.notes
          }
        : item
    ));
    
    // Add to order history
    const historyEntry = {
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      action: `Thu ngân đổi món ${outOfStockItem.name} → ${newProduct.name}`,
      staff: 'Thu ngân Lan'
    };
    setOrderHistory(prev => [historyEntry, ...prev]);
    
    toast.success(`Đã thay thế món ${outOfStockItem.name} bằng ${newProduct.name}`);
    setReplaceItemModalOpen(false);
    setOutOfStockWarningOpen(false);
  };

  const handleSubmitNewItemRequest = () => {
    if (!newItemName.trim()) {
      toast.error('Vui lòng nhập tên món');
      return;
    }
    
    if (!newItemCategory) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }
    
    // Create new request
    const newRequest: NewItemRequest = {
      id: `req${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      description: newItemDescription,
      notes: newItemNotes,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      ingredients: selectedIngredients.length > 0 ? selectedIngredients : undefined,
    };
    
    setNewItemRequests([newRequest, ...newItemRequests]);
    
    // Reset form
    setNewItemName('');
    setNewItemCategory('');
    setNewItemDescription('');
    setNewItemNotes('');
    setSelectedIngredients([]);
    setNewItemModalOpen(false);
    
    // Show toast
    toast.success('Đã gửi yêu cầu món mới đến Quản lý', {
      description: 'Vui lòng chờ phê duyệt.',
    });
  };

  const handleOpenCustomizationModal = (item: CartItem) => {
    setSelectedItemForCustomization(item);
    setCustomizationModalOpen(true);
  };

  const handleUpdateCustomization = (customization: ItemCustomization) => {
    if (!selectedItemForCustomization) return;
    
    const cart = getCurrentCart();
    
    updateCurrentCart(cart.map(item => 
      item.id === selectedItemForCustomization.id 
        ? { 
            ...item, 
            customization,
            notes: customization.note || item.notes
          }
        : item
    ));
    
    toast.success('Đã cập nhật tùy chỉnh món');
    setCustomizationModalOpen(false);
    setSelectedItemForCustomization(null);
  };

  // Simulate KDS sending out-of-stock notification (Demo only)
  const simulateOutOfStockNotification = () => {
    const cart = getCurrentCart();
    const preparingItems = cart.filter(item => item.status === 'preparing');
    
    if (preparingItems.length > 0) {
      const randomItem = preparingItems[Math.floor(Math.random() * preparingItems.length)];
      const ingredients = ['Sữa tươi', 'Sữa đặc', 'Trân châu', 'Cà phê', 'Trà'];
      const randomIngredient = ingredients[Math.floor(Math.random() * ingredients.length)];
      
      // Update item status to out-of-stock
      updateCurrentCart(cart.map(item => 
        item.id === randomItem.id 
          ? { ...item, status: 'out-of-stock' as const, outOfStockReason: randomIngredient, outOfStockIngredients: [randomIngredient] }
          : item
      ));
      
      // Show warning modal
      setOutOfStockItem(randomItem);
      setOutOfStockIngredient(randomIngredient);
      setOutOfStockWarningOpen(true);
      
      // Add to order history
      const historyEntry = {
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        action: `Bếp báo hết nguyên liệu ${randomIngredient} cho món ${randomItem.name}`,
        staff: 'Bếp - Trần Minh'
      };
      setOrderHistory(prev => [historyEntry, ...prev]);
    }
  };

  // Simulate KDS sending ingredient restocked notification (Demo only)
  const simulateRestockNotification = () => {
    const cart = getCurrentCart();
    const waitingItems = cart.filter(item => item.status === 'waiting-ingredient' || item.status === 'out-of-stock');
    
    if (waitingItems.length > 0) {
      const itemToRestock = waitingItems[0];
      const ingredient = itemToRestock.outOfStockReason || 'Nguyên liệu';
      
      // Show toast notification with green background
      toast.success(
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-900 mb-1">
              ✓ Nguyên liệu đã bổ sung
            </p>
            <p className="text-xs text-slate-600">
              {ingredient} đã có lại trong kho. Món {itemToRestock.name} có thể pha chế.
            </p>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            background: '#E8F8ED',
            border: '1px solid #86EFAC',
          },
        }
      );

      // Update item status back to preparing
      updateCurrentCart(cart.map(item => 
        item.id === itemToRestock.id 
          ? { 
              ...item, 
              status: 'preparing' as const,
              outOfStockReason: undefined,
              outOfStockIngredients: undefined
            }
          : item
      ));

      // Add to restocked and glowing lists for visual effects
      setRestockedItems([itemToRestock.id]);
      setGlowingItems([itemToRestock.id]);

      // Auto-remove from lists after delay
      setTimeout(() => {
        setRestockedItems([]);
      }, 3000);

      setTimeout(() => {
        setGlowingItems([]);
      }, 2000);
      
      // Add to order history
      const historyEntry = {
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        action: `Bếp báo đã bổ sung ${ingredient} cho món ${itemToRestock.name}`,
        staff: 'Bếp - Trần Minh'
      };
      setOrderHistory(prev => [historyEntry, ...prev]);
    }
  };

  // Helper function to calculate item price with customization
  const getItemPrice = (item: CartItem): number => {
    const basePrice = item.price;
    const toppingsPrice = item.customization?.toppings.reduce((sum, t) => sum + t.price, 0) || 0;
    return basePrice + toppingsPrice;
  };

  const cart = getCurrentCart();
  const totalAmount = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'border-emerald-500 hover:shadow-lg hover:border-emerald-600';
      case 'occupied':
        return 'border-red-500 bg-red-50';
    }
  };

  const getTableStatusBadge = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-emerald-500 text-white text-xs">Trống</Badge>;
      case 'occupied':
        return <Badge className="bg-red-500 text-white text-xs">Có khách</Badge>;
    }
  };

  const getElapsedTime = (startTime?: number) => {
    if (!startTime) return '';
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    return `${elapsed} phút`;
  };

  const getItemStatusBadge = (status?: CartItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-slate-400 text-white text-xs">Chưa gửi bếp</Badge>;
      case 'preparing':
        return <Badge className="bg-blue-500 text-white text-xs flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang chế biến
        </Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Đã xong / Chờ phục vụ
        </Badge>;
      case 'served':
        return <Badge className="bg-emerald-700 text-white text-xs">Đã phục vụ</Badge>;
      case 'out-of-stock':
        return <Badge variant="outline" className="bg-red-50 border-red-300 text-red-700 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Hết nguyên liệu – Chờ xử lý
        </Badge>;
      case 'waiting-ingredient':
        return <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Đang đợi nguyên liệu
        </Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-gray-100 border-gray-300 text-gray-700 text-xs flex items-center gap-1">
          <X className="w-3 h-3" />
          Đã hủy (hết nguyên liệu)
        </Badge>;
      case 'replaced':
        return <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700 text-xs flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3" />
          Đã thay thế món
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50">
      {/* Left Panel - Products & Tables */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-4 lg:p-6 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-blue-900">Menu & Bàn</h2>
              <p className="text-xs text-slate-500">Chọn bàn và gọi món</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm món..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="tables" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 lg:mx-6 mt-4 bg-blue-100">
            <TabsTrigger value="tables" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Sơ đồ bàn
            </TabsTrigger>
            <TabsTrigger 
              value="menu" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Thực đơn
            </TabsTrigger>
            <TabsTrigger 
              value="combo" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <PackageCheck className="w-4 h-4 mr-1" />
              Combo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="flex-1 overflow-auto m-0">
            <div className="p-4 lg:p-6">
              {/* Order Type Tabs */}
              <div className="mb-4 flex gap-2 bg-slate-100 p-1 rounded-lg">
                <Button
                  variant={orderType === 'dine-in' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleOrderTypeChange('dine-in')}
                  className={`flex-1 gap-2 ${orderType === 'dine-in' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                >
                  <Home className="w-4 h-4" />
                  Tại bàn
                </Button>
                <Button
                  variant={orderType === 'takeaway' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleOrderTypeChange('takeaway')}
                  className={`flex-1 gap-2 ${orderType === 'takeaway' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                >
                  <Package className="w-4 h-4" />
                  Mang về
                </Button>
                <Button
                  variant={orderType === 'delivery' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleOrderTypeChange('delivery')}
                  className={`flex-1 gap-2 ${orderType === 'delivery' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                >
                  <Truck className="w-4 h-4" />
                  Giao đi
                </Button>
              </div>

              {/* Area Tabs */}
              <Tabs defaultValue="all" className="mb-4" onValueChange={(value) => setSelectedArea(value)}>
                <TabsList className="bg-slate-100 flex-wrap h-auto">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white">
                    Tất cả
                  </TabsTrigger>
                  {areas.map(area => (
                    <TabsTrigger key={area.id} value={area.id} className="data-[state=active]:bg-white">
                      {area.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Status Filter */}
              <div className="mb-4 flex gap-2 items-center">
                <span className="text-sm text-slate-600">Lọc:</span>
                <Button
                  variant={selectedTableStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTableStatus('all')}
                  className={selectedTableStatus === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Tất cả
                </Button>
                <Button
                  variant={selectedTableStatus === 'available' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTableStatus('available')}
                  className={selectedTableStatus === 'available' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Bàn trống
                </Button>
                <Button
                  variant={selectedTableStatus === 'occupied' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTableStatus('occupied')}
                  className={selectedTableStatus === 'occupied' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Có khách
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Mang đi - only show when "Tất cả" area is selected */}
                {selectedArea === 'all' && (
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      isTakeaway 
                        ? 'border-blue-600 bg-blue-50 shadow-lg' 
                        : 'border-blue-400 hover:shadow-lg hover:border-blue-600'
                    }`}
                    onClick={handleSelectTakeaway}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        isTakeaway ? 'bg-blue-600' : 'bg-blue-500'
                      }`}>
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm text-neutral-900">Mang đi</p>
                      <p className="text-xs text-neutral-500">Đóng gói</p>
                    </CardContent>
                  </Card>
                )}

                {/* Tables - filtered by area and status */}
                {tables
                  .filter(table => {
                    const matchesArea = selectedArea === 'all' || table.area === selectedArea;
                    const matchesStatus = selectedTableStatus === 'all' || table.status === selectedTableStatus;
                    return matchesArea && matchesStatus;
                  })
                  .map(table => (
                    <Card
                      key={table.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedTable?.id === table.id && !isTakeaway
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : getTableStatusColor(table.status)
                      }`}
                      onClick={() => handleSelectTable(table)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          selectedTable?.id === table.id && !isTakeaway
                            ? 'bg-blue-600'
                            : table.status === 'available'
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                        }`}>
                          <span className="text-white">{table.number}</span>
                        </div>
                        <p className="text-sm text-neutral-900">Bàn {table.number}</p>
                        <p className="text-xs text-neutral-500 mb-1">{areas.find(a => a.id === table.area)?.name}</p>
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
                        {table.startTime && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {getElapsedTime(table.startTime)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="flex-1 overflow-auto m-0">
            <div className="p-4 lg:p-6 space-y-4">
              {/* Header with Categories and Add New Item button */}
              <div className="flex items-center justify-between gap-3">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap ${
                        selectedCategory === cat.id 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : ''
                      }`}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
                
                {/* Add New Item Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewItemModalOpen(true)}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 whitespace-nowrap flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Thêm món mới
                </Button>
              </div>

              {/* Products Grid */}
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              } gap-4`}>
                {filteredProducts.map(product => {
                  const isOutOfStock = isProductOutOfStock(product);
                  return (
                    <Card 
                      key={product.id} 
                      className={`transition-shadow border-blue-200 relative ${
                        isOutOfStock 
                          ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                          : 'cursor-pointer hover:shadow-lg hover:border-blue-400'
                      }`}
                      onClick={() => !isOutOfStock && addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="text-4xl mb-2 text-center">{product.image}</div>
                        <h3 className="text-sm text-slate-900 mb-1">{product.name}</h3>
                        <p className={`${isOutOfStock ? 'text-gray-500' : 'text-blue-700'}`}>
                          {product.price.toLocaleString()}₫
                        </p>
                        {isOutOfStock && (
                          <Badge 
                            variant="outline" 
                            className="absolute top-2 right-2 bg-red-100 text-red-700 border-red-300 text-xs"
                          >
                            Tạm ngưng
                          </Badge>
                        )}
                        {!isOutOfStock && (product as any).isNew && (
                          <Badge 
                            className="absolute top-2 right-2 bg-green-500 text-white text-xs"
                          >
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

          <TabsContent value="combo" className="flex-1 overflow-auto m-0">
            <div className="p-4 lg:p-6 space-y-4">
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
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              } gap-4`}>
                {filteredCombos.map(combo => {
                  // Calculate total items in combo
                  const totalItems = combo.groups.reduce((sum, group) => sum + group.maxSelect, 0);
                  
                  // Calculate discount percentage if original price exists
                  let discountPercent = 0;
                  if (combo.originalPrice) {
                    discountPercent = Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100);
                  }
                  
                  return (
                    <Card 
                      key={combo.id} 
                      className={`transition-shadow border-blue-200 relative cursor-pointer hover:shadow-lg hover:border-blue-400 ${
                        combo.popular ? 'ring-2 ring-blue-400' : ''
                      }`}
                      onClick={() => handleComboClick(combo)}
                    >
                      <CardContent className="p-4">
                        {/* Popular badge */}
                        {combo.popular && (
                          <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Phổ biến
                          </Badge>
                        )}
                        
                        {/* Combo icon */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 mx-auto">
                          <PackageCheck className="w-6 h-6 text-white" />
                        </div>
                        
                        {/* Combo name */}
                        <h3 className="text-sm text-slate-900 mb-1 text-center">{combo.name}</h3>
                        
                        {/* Combo description */}
                        <p className="text-xs text-slate-500 mb-3 text-center line-clamp-2 min-h-[2rem]">
                          {combo.description}
                        </p>
                        
                        {/* Items count */}
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                            {totalItems} món
                          </Badge>
                        </div>
                        
                        {/* Price and discount */}
                        <div className="text-center">
                          {combo.originalPrice && (
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <span className="text-xs text-slate-400 line-through">
                                {combo.originalPrice.toLocaleString()}₫
                              </span>
                              <Badge className="bg-red-500 text-white text-xs">
                                -{discountPercent}%
                              </Badge>
                            </div>
                          )}
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
                    {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có combo nào'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-[28rem] border-l bg-white flex flex-col max-h-[50vh] lg:max-h-full shadow-lg">
        <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-blue-900 text-base">Đơn hàng</h2>
              {selectedTable?.currentOrder && (
                <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                  {selectedTable.currentOrder}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Request notification icon */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 relative"
                onClick={() => setRequestsDrawerOpen(true)}
                title="Yêu cầu của tôi"
              >
                <Bell className="w-4 h-4 text-blue-600" />
                {newItemRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {newItemRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </Button>
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
                <span>Bàn {selectedTable.number} – {selectedTable.capacity} chỗ</span>
              </div>
              
              {/* Order Actions */}
              {selectedTable.status === 'occupied' && (
                <div className="flex gap-1 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setMoveTableOpen(true)}
                  >
                    <ArrowLeftRight className="w-3 h-3 mr-0.5" />
                    Chuyển bàn
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setMergeTableOpen(true)}
                  >
                    <GitMerge className="w-3 h-3 mr-0.5" />
                    Gộp bàn
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setSplitOrderOpen(true)}
                  >
                    <FileText className="w-3 h-3 mr-0.5" />
                    Tách đơn
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-6 px-2"
                    onClick={() => setOrderHistoryOpen(true)}
                  >
                    <History className="w-3 h-3 mr-0.5" />
                    Lịch sử
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Chưa chọn bàn</p>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Chưa có món nào</p>
              <p className="text-xs text-slate-400 mt-1">
                {!selectedTable && !isTakeaway 
                  ? 'Vui lòng chọn bàn hoặc mang đi'
                  : 'Chọn món từ thực đơn'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Combo Suggestion Banner - will add later */}
              
              {cart.map(item => (
                <CartItemDisplay
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  onCustomize={handleOpenCustomizationModal}
                  onAddNote={handleOpenNoteDialog}
                  onToggleComboExpansion={toggleComboExpansion}
                  onCustomizeComboItem={handleCustomizeComboItem}
                  getItemStatusBadge={getItemStatusBadge}
                  restockedItems={restockedItems}
                  glowingItems={glowingItems}
                  appliedPromoCode={appliedPromoCode}
                />
              ))}
            </div>
          )}
        </div>

        <Separator className="shadow-sm" />
        
        <div className="p-3 space-y-2 bg-gradient-to-r from-blue-50 to-blue-100">
          {/* Inline Promo Code Input */}
          {!appliedPromoCode && cart.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                <Input
                  placeholder="Nhập mã khuyến mãi..."
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyPromoCode();
                    }
                  }}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  onClick={() => handleApplyPromoCode()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-7 px-3 text-xs"
                >
                  Áp dụng
                </Button>
              </div>
              {promoError && (
                <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                  <span>{promoError}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Tạm tính</span>
              <span className="text-slate-900">{totalAmount.toLocaleString()}₫</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs items-center">
                <span className="text-green-700">Giảm giá</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-700">–{discountAmount.toLocaleString()}₫</span>
                  <button
                    onClick={handleRemovePromo}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            <Separator className="bg-blue-300 my-1" />
            <div className="flex justify-between text-sm">
              <span className="text-blue-950">Tổng cộng</span>
              <span className="text-blue-900">{(totalAmount - discountAmount).toLocaleString()}₫</span>
            </div>
          </div>

          {/* Demo: Simulate out-of-stock notification */}
          {cart.some(item => item.status === 'preparing') && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-red-300 text-red-600 hover:bg-red-50 h-7"
              onClick={simulateOutOfStockNotification}
            >
              <PackageX className="w-3 h-3 mr-1" />
              Demo: Nhận cảnh báo hết NL từ bếp
            </Button>
          )}

          {/* Demo: Simulate restock notification */}
          {cart.some(item => item.status === 'waiting-ingredient' || item.status === 'out-of-stock') && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50 h-7"
              onClick={simulateRestockNotification}
            >
              <PackageCheck className="w-3 h-3 mr-1" />
              Demo: Nhận thông báo đã bổ sung NL
            </Button>
          )}

          {/* Send to Kitchen Button - Big Primary */}
          {cart.some(item => item.status === 'pending') && (
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 h-8 shadow-lg text-base"
              onClick={handleSendToKitchen}
            >
              <Bell className="w-5 h-5 mr-2" />
              Gửi pha chế
            </Button>
          )}

          {/* Buttons Row */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-2 border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-800 h-9 shadow-sm text-xs px-3"
              onClick={() => setPromotionModalOpen(true)}
              disabled={cart.length === 0}
            >
              <Percent className="w-3.5 h-3.5 mr-1" />
              Khuyến mãi
            </Button>

            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 shadow-md text-sm"
                  disabled={cart.length === 0}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Thanh toán
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Thanh toán đơn hàng</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-slate-600 mb-1 block">
                      {isTakeaway ? 'Mang đi' : `Bàn ${selectedTable?.number}`}
                    </Label>
                    {!isTakeaway && selectedTable && (
                      <p className="text-xs text-slate-500">{selectedTable.capacity} chỗ ngồi</p>
                    )}
                  </div>

                  <div>
                    <Label>Phương thức thanh toán</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button variant="outline" className="flex flex-col h-auto py-3">
                        <Banknote className="w-5 h-5 mb-1" />
                        <span className="text-xs">Tiền mặt</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-auto py-3">
                        <CreditCard className="w-5 h-5 mb-1" />
                        <span className="text-xs">Thẻ</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col h-auto py-3">
                        <Smartphone className="w-5 h-5 mb-1" />
                        <span className="text-xs">Chuyển khoản</span>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">Tổng cộng</span>
                      <span className="text-blue-900">{totalAmount.toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
                    Hủy
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Xác nhận thanh toán
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Out of Stock Warning Dialog */}
      <Dialog open={outOfStockWarningOpen} onOpenChange={setOutOfStockWarningOpen}>
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
                Món <strong>{outOfStockItem?.name}</strong> không thể pha chế do hết nguyên liệu <strong>{outOfStockIngredient}</strong>.
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

      {/* Replace Item Modal */}
      <Dialog open={replaceItemModalOpen} onOpenChange={setReplaceItemModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto" aria-describedby={undefined}>
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
                .filter(p => !isProductOutOfStock(p) && p.id !== outOfStockItem?.id)
                .filter(p => {
                  // Show similar category items
                  if (outOfStockItem?.name.includes('Cà phê')) return p.category === 'coffee';
                  if (outOfStockItem?.name.includes('Trà')) return p.category === 'tea';
                  if (outOfStockItem?.name.includes('Sinh tố')) return p.category === 'smoothie';
                  return true;
                })
                .map(product => (
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
                <p className="text-sm text-slate-700">{selectedItemForNote.name}</p>
                <p className="text-xs text-slate-500">{selectedItemForNote.price.toLocaleString()}₫</p>
              </div>
            )}
            <div>
              <Label htmlFor="note-input">Ghi chú</Label>
              <Input
                id="note-input"
                placeholder="Ví dụ: Ít đường, nhiều đá..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNoteDialogOpen(false);
                setNoteText('');
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5" />
              Chuyển bàn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Bạn muốn chuyển đơn <span className="text-blue-700">{selectedTable?.currentOrder}</span> từ <span className="text-blue-700">Bàn {selectedTable?.number}</span> sang bàn nào?
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {/* Only show available tables */}
              {tables
                .filter(table => table.status === 'available' && table.id !== selectedTable?.id)
                .map(table => (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all border-2 ${
                      targetTable?.id === table.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-emerald-500 hover:shadow-lg hover:border-emerald-600'
                    }`}
                    onClick={() => setTargetTable(table)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        targetTable?.id === table.id
                          ? 'bg-blue-600'
                          : 'bg-emerald-500'
                      }`}>
                        <span className="text-white text-sm">{table.number}</span>
                      </div>
                      <p className="text-sm text-neutral-900">Bàn {table.number}</p>
                      <p className="text-xs text-neutral-500 mb-1">{areas.find(a => a.id === table.area)?.name}</p>
                      <div className="flex items-center justify-center gap-1 text-xs text-neutral-500">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} chỗ</span>
                      </div>
                      <Badge className="bg-emerald-500 text-white text-xs mt-2">Trống</Badge>
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
              onClick={() => {
                if (selectedTable && targetTable) {
                  const currentOrder = selectedTable.currentOrder;
                  const currentCart = tableOrders[selectedTable.id] || [];
                  
                  // Move orders from old table to new table
                  const newTableOrders = {
                    ...tableOrders,
                    [selectedTable.id]: [],
                    [targetTable.id]: [...currentCart],
                  };
                  setTableOrders(newTableOrders);
                  
                  // Update table statuses
                  const updatedTables = tables.map(table => {
                    if (table.id === selectedTable.id) {
                      // Old table becomes available
                      return {
                        ...table,
                        status: 'available' as const,
                        currentOrder: undefined,
                        startTime: undefined,
                      };
                    } else if (table.id === targetTable.id) {
                      // New table becomes occupied
                      return {
                        ...table,
                        status: 'occupied' as const,
                        currentOrder: currentOrder,
                        startTime: Date.now(),
                      };
                    }
                    return table;
                  });
                  setTables(updatedTables);
                  
                  // Update selected table to the new one
                  const newSelectedTable = updatedTables.find(t => t.id === targetTable.id);
                  setSelectedTable(newSelectedTable || null);
                  
                  // Add to order history
                  const now = new Date();
                  const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  setOrderHistory([
                    ...orderHistory,
                    { 
                      time: timeString, 
                      action: `Chuyển đơn ${currentOrder} từ Bàn ${selectedTable.number} sang Bàn ${targetTable.number}`, 
                      staff: 'NV Minh' 
                    },
                  ]);
                  
                  toast.success(`Đã chuyển đơn ${currentOrder} sang Bàn ${targetTable.number}`, {
                    description: `Bàn ${selectedTable.number} đã trống`
                  });
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5" />
              Gộp bàn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Chọn bàn muốn gộp với <span className="text-blue-700">Bàn {selectedTable?.number}</span>. Đơn của 2 bàn sẽ nhập chung thành một phiếu.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {/* Only show occupied tables (excluding current table) */}
              {tables
                .filter(table => table.status === 'occupied' && table.id !== selectedTable?.id)
                .map(table => {
                  const tableCart = tableOrders[table.id] || [];
                  const tableTotal = tableCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  return (
                    <Card
                      key={table.id}
                      className={`cursor-pointer transition-all border-2 ${
                        mergeTargetTable?.id === table.id
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-red-500 hover:shadow-lg hover:border-red-600 bg-red-50'
                      }`}
                      onClick={() => setMergeTargetTable(table)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          mergeTargetTable?.id === table.id
                            ? 'bg-blue-600'
                            : 'bg-red-500'
                        }`}>
                          <span className="text-white text-sm">{table.number}</span>
                        </div>
                        <p className="text-sm text-neutral-900">Bàn {table.number}</p>
                        <p className="text-xs text-neutral-500 mb-1">{areas.find(a => a.id === table.area)?.name}</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-neutral-500 mb-1">
                          <Users className="w-3 h-3" />
                          <span>{table.capacity} chỗ</span>
                        </div>
                        <Badge className="bg-red-500 text-white text-xs mb-1">Có khách</Badge>
                        {table.currentOrder && (
                          <Badge variant="secondary" className="text-xs mb-1">
                            {table.currentOrder}
                          </Badge>
                        )}
                        {table.startTime && (
                          <Badge variant="outline" className="text-xs">
                            {getElapsedTime(table.startTime)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            
            {tables.filter(table => table.status === 'occupied' && table.id !== selectedTable?.id).length === 0 && (
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
              onClick={() => {
                if (selectedTable && mergeTargetTable) {
                  const sourceOrder = selectedTable.currentOrder;
                  const targetOrder = mergeTargetTable.currentOrder;
                  const sourceCart = tableOrders[selectedTable.id] || [];
                  const targetCart = tableOrders[mergeTargetTable.id] || [];
                  
                  // Merge orders: combine both carts
                  const mergedCart = [...targetCart, ...sourceCart];
                  
                  const newTableOrders = {
                    ...tableOrders,
                    [selectedTable.id]: [], // Clear source table
                    [mergeTargetTable.id]: mergedCart, // Combined orders in target
                  };
                  setTableOrders(newTableOrders);
                  
                  // Update table statuses
                  const updatedTables = tables.map(table => {
                    if (table.id === selectedTable.id) {
                      // Source table becomes available
                      return {
                        ...table,
                        status: 'available' as const,
                        currentOrder: undefined,
                        startTime: undefined,
                      };
                    }
                    return table;
                  });
                  setTables(updatedTables);
                  
                  // Update selected table to the target one
                  const newSelectedTable = updatedTables.find(t => t.id === mergeTargetTable.id);
                  setSelectedTable(newSelectedTable || null);
                  
                  // Add to order history
                  const now = new Date();
                  const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  setOrderHistory([
                    ...orderHistory,
                    { 
                      time: timeString, 
                      action: `Gộp đơn: Bàn ${selectedTable.number} → Bàn ${mergeTargetTable.number} (${sourceOrder} + ${targetOrder})`, 
                      staff: 'NV Minh' 
                    },
                  ]);
                  
                  toast.success(`Đã gộp đơn Bàn ${selectedTable.number} vào Bàn ${mergeTargetTable.number} thành công`, {
                    description: `Bàn ${selectedTable.number} đã trống`
                  });
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

      {/* Order History Dialog */}
      <Dialog open={orderHistoryOpen} onOpenChange={setOrderHistoryOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Lịch sử đơn hàng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between mb-4">
                <span className="text-sm text-slate-600">Bàn {selectedTable?.number}</span>
                <Badge className="bg-blue-600 text-white">{selectedTable?.currentOrder}</Badge>
              </div>
              
              {/* Timeline */}
              <div className="space-y-4 relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                
                {orderHistory.map((entry, index) => (
                  <div key={index} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600">{entry.time}</span>
                        <span className="text-xs text-slate-500">• {entry.staff}</span>
                      </div>
                      <p className="text-sm text-slate-700">{entry.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOrderHistoryOpen(false)}
              className="w-full"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Split Order Dialog */}
      <Dialog open={splitOrderOpen} onOpenChange={(open) => {
        setSplitOrderOpen(open);
        if (!open) {
          setSplitItems({});
          setSplitDestinationTable(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tách đơn
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Destination Selection */}
            <div className="mb-4 p-4 border rounded-lg bg-slate-50">
              <Label className="text-sm text-slate-700 mb-2 block">Chọn đích đến:</Label>
              <Select 
                value={splitDestinationTable?.id || ''} 
                onValueChange={(value) => {
                  const table = tables.find(t => t.id === value);
                  setSplitDestinationTable(table || null);
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Chọn bàn trống..." />
                </SelectTrigger>
                <SelectContent>
                  {tables
                    .filter(table => table.status === 'available')
                    .map(table => (
                      <SelectItem key={table.id} value={table.id}>
                        Bàn {table.number} - {areas.find(a => a.id === table.area)?.name} ({table.capacity} chỗ)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
              {/* Left Column - Current Order */}
              <div className="border rounded-lg p-4 flex flex-col h-full overflow-hidden">
                <div className="mb-3">
                  <h3 className="text-sm text-slate-900 mb-1">Đơn hiện tại</h3>
                  <p className="text-xs text-slate-500">
                    Bàn {selectedTable?.number} - {selectedTable?.currentOrder}
                  </p>
                </div>
                
                <div className="flex-1 overflow-auto space-y-2">
                  {cart.map(item => {
                    const splitQty = splitItems[item.id] || 0;
                    const remainingQty = item.quantity - splitQty;
                    
                    return (
                      <Card key={item.id} className="border-slate-200">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-600">
                                {item.price.toLocaleString()}₫ × {item.quantity}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-slate-500 italic mt-1">"{item.notes}"</p>
                              )}
                              {item.toppings && item.toppings.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {item.toppings.map((t, i) => (
                                    <Badge key={i} variant="outline" className="text-xs px-1 py-0">{t}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Quantity Splitter */}
                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded">
                            <span className="text-xs text-slate-600">Tách:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const newQty = Math.max(0, splitQty - 1);
                                  setSplitItems({ ...splitItems, [item.id]: newQty });
                                }}
                                disabled={splitQty === 0}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm w-8 text-center">{splitQty}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const newQty = Math.min(item.quantity, splitQty + 1);
                                  setSplitItems({ ...splitItems, [item.id]: newQty });
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
                    {Object.keys(splitItems).filter(id => splitItems[id] > 0).length} món được tách
                  </p>
                </div>
                
                <div className="flex-1 overflow-auto space-y-2">
                  {Object.keys(splitItems).filter(id => splitItems[id] > 0).length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Chưa có món nào</p>
                    </div>
                  ) : (
                    cart.filter(item => (splitItems[item.id] || 0) > 0).map(item => {
                      const splitQty = splitItems[item.id];
                      return (
                        <Card key={item.id} className="border-blue-200 bg-white">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm text-slate-900">{item.name}</p>
                                <p className="text-xs text-blue-700">
                                  {item.price.toLocaleString()}₫ × {splitQty}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-slate-500 italic mt-1">"{item.notes}"</p>
                                )}
                                {item.toppings && item.toppings.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {item.toppings.map((t, i) => (
                                      <Badge key={i} variant="outline" className="text-xs px-1 py-0">{t}</Badge>
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
                {Object.keys(splitItems).some(id => splitItems[id] > 0) && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Tổng đơn mới:</span>
                      <span className="text-blue-900">
                        {cart
                          .filter(item => (splitItems[item.id] || 0) > 0)
                          .reduce((sum, item) => sum + (item.price * splitItems[item.id]), 0)
                          .toLocaleString()}₫
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
              disabled={!splitDestinationTable || !Object.keys(splitItems).some(id => splitItems[id] > 0)}
              onClick={() => {
                if (!selectedTable || !splitDestinationTable) return;
                
                // Generate new order code
                const newOrderCode = `ORD-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
                
                // Create split items array
                const splitItemsArray: CartItem[] = cart
                  .filter(item => (splitItems[item.id] || 0) > 0)
                  .map(item => ({
                    ...item,
                    quantity: splitItems[item.id],
                  }));
                
                // Update remaining items in current table
                const remainingItems = cart
                  .map(item => ({
                    ...item,
                    quantity: item.quantity - (splitItems[item.id] || 0),
                  }))
                  .filter(item => item.quantity > 0);
                
                // Update table orders
                const newTableOrders = {
                  ...tableOrders,
                  [selectedTable.id]: remainingItems,
                  [splitDestinationTable.id]: splitItemsArray,
                };
                setTableOrders(newTableOrders);
                
                // Update table statuses
                const updatedTables = tables.map(table => {
                  if (table.id === splitDestinationTable.id) {
                    return {
                      ...table,
                      status: 'occupied' as const,
                      currentOrder: newOrderCode,
                      startTime: Date.now(),
                    };
                  }
                  return table;
                });
                setTables(updatedTables);
                
                // Add to order history
                const now = new Date();
                const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const itemNames = splitItemsArray.map(item => `${item.quantity} ${item.name}`).join(', ');
                setOrderHistory([
                  ...orderHistory,
                  { 
                    time: timeString, 
                    action: `Tách đơn: ${itemNames} sang Bàn ${splitDestinationTable.number} → tạo ${newOrderCode}`, 
                    staff: 'NV Minh' 
                  },
                ]);
                
                // Show toast
                toast.success(`Đã tách đơn thành công: tạo đơn mới ${newOrderCode}`, {
                  description: `Bàn ${splitDestinationTable.number} đã có ${splitItemsArray.length} món`
                });
                
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

      {/* New Item Request Modal */}
      <Dialog open={newItemModalOpen} onOpenChange={setNewItemModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Gửi yêu cầu món mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Lưu ý:</strong> Thu ngân chỉ có thể gửi yêu cầu. Quản lý sẽ xem xét và tạo món chính thức trong hệ thống.
              </p>
            </div>

            <div>
              <Label htmlFor="item-name">Tên món đề xuất <span className="text-red-500">*</span></Label>
              <Input
                id="item-name"
                placeholder="Ví dụ: Trà đào mix phúc bồn tử"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="item-category">Danh mục đề xuất <span className="text-red-500">*</span></Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Chọn danh mục..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee">Cà phê</SelectItem>
                  <SelectItem value="tea">Trà</SelectItem>
                  <SelectItem value="smoothie">Sinh tố</SelectItem>
                  <SelectItem value="pastry">Bánh ngọt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Công thức nguyên liệu */}
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
                      {selectedIngredients.map((ing, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{ing.ingredientId}</TableCell>
                          <TableCell>{ing.ingredientName}</TableCell>
                          <TableCell>{ing.unit}</TableCell>
                          <TableCell>{ing.quantity}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
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

            <div>
              <Label htmlFor="item-image" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Ảnh minh họa (tuỳ chọn)
              </Label>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <Upload className="w-4 h-4 mr-2" />
                Tải ảnh lên
              </Button>
              <p className="text-xs text-slate-500 mt-1">Chưa chọn ảnh</p>
            </div>

            <div>
              <Label htmlFor="item-notes">Ghi chú thêm</Label>
              <Input
                id="item-notes"
                placeholder="Ví dụ: Khách yêu cầu đặc biệt..."
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setNewItemModalOpen(false);
                setNewItemName('');
                setNewItemCategory('');
                setNewItemDescription('');
                setNewItemNotes('');
                setSelectedIngredients([]);
              }}
            >
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmitNewItemRequest}
            >
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Ingredient Dialog */}
      <Dialog open={addIngredientDialogOpen} onOpenChange={setAddIngredientDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm nguyên liệu vào công thức</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Ingredient */}
            <div>
              <Label>Tìm kiếm nguyên liệu</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Nhập tên nguyên liệu..."
                  value={ingredientSearchQuery}
                  onChange={(e) => setIngredientSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Available Ingredients List */}
            <div>
              <Label className="mb-2 block">Chọn nguyên liệu</Label>
              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                {inventoryIngredients
                  .filter(ingredient => 
                    ingredient.name.toLowerCase().includes(ingredientSearchQuery.toLowerCase())
                  )
                  .map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm">{ingredient.name}</p>
                        <p className="text-xs text-slate-500">Mã: {ingredient.id} • Đơn vị: {ingredient.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="SL"
                          className="w-20 h-8"
                          id={`qty-${ingredient.id}`}
                        />
                        <Button
                          size="sm"
                          className="h-8 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            const qtyInput = document.getElementById(`qty-${ingredient.id}`) as HTMLInputElement;
                            const quantity = parseFloat(qtyInput?.value || '0');
                            
                            if (quantity > 0) {
                              setSelectedIngredients(prev => [
                                ...prev,
                                {
                                  ingredientId: ingredient.id,
                                  ingredientName: ingredient.name,
                                  unit: ingredient.unit,
                                  quantity: quantity,
                                  unitCost: ingredient.avgUnitCost
                                }
                              ]);
                              qtyInput.value = '';
                              toast.success(`Đã thêm ${ingredient.name}`);
                            } else {
                              toast.error('Vui lòng nhập số lượng');
                            }
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700">
                💡 Nhập số lượng và nhấn <Plus className="w-3 h-3 inline mx-1" /> để thêm nguyên liệu vào công thức
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddIngredientDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requests Drawer */}
      <Sheet open={requestsDrawerOpen} onOpenChange={setRequestsDrawerOpen}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Yêu cầu của tôi
            </SheetTitle>
            <SheetDescription>
              Quản lý các yêu cầu bổ sung nguyên liệu từ bộ phận pha chế
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {newItemRequests.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Chưa có yêu cầu nào</p>
              </div>
            ) : (
              newItemRequests.map((request) => (
                <Card key={request.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm text-slate-900 mb-1">{request.name}</h4>
                        <p className="text-xs text-slate-500">
                          Danh mục: {categories.find(c => c.id === request.category)?.name || request.category}
                        </p>
                        {request.description && (
                          <p className="text-xs text-slate-600 mt-2">{request.description}</p>
                        )}
                        {request.notes && (
                          <div className="flex items-start gap-1 mt-2">
                            <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-500 italic">{request.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{request.createdAt}</span>
                      </div>
                      
                      {request.status === 'pending' && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          Đang chờ duyệt
                        </Badge>
                      )}
                      {request.status === 'approved' && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Đã duyệt
                        </Badge>
                      )}
                      {request.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          Từ chối
                        </Badge>
                      )}
                    </div>
                    
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700">
                          <strong>Lý do:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'approved' && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-700">
                          ✓ Món đã được thêm vào menu. Bạn có thể bán ngay.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Item Customization Modal */}
      {selectedItemForCustomization && (
        <ItemCustomizationModal
          open={customizationModalOpen}
          onClose={() => {
            setCustomizationModalOpen(false);
            setSelectedItemForCustomization(null);
          }}
          itemName={selectedItemForCustomization.name}
          basePrice={selectedItemForCustomization.price}
          onUpdate={handleUpdateCustomization}
          initialCustomization={selectedItemForCustomization.customization}
        />
      )}

      {/* Promotion Popup - New Component */}
      <PromotionPopup
        open={promotionModalOpen}
        onClose={() => setPromotionModalOpen(false)}
        orderTotal={totalAmount}
        orderItems={cart.map(item => {
          const product = products.find(p => p.id === item.id);
          return {
            id: item.id,
            name: item.name,
            price: getItemPrice(item),
            quantity: item.quantity,
            category: product?.category
          };
        })}
        selectedCustomer={null} // You can integrate customer selection here
        onApply={handleApplyPromotion}
      />

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
    </div>
  );
}