// Mock Combo Data for POS System

export interface ComboItem {
  id: string;
  name: string;
  price: number;
  extraPrice?: number; // For premium items
  category?: string;
  stock: number;
}

export interface ComboGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  items: ComboItem[];
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  groups: ComboGroup[];
  image: string;
  category: string;
  discount?: number; // How much saving compared to buying separately
}

export const combos: Combo[] = [
  {
    id: 'combo1',
    name: 'Combo Sáng',
    description: '1 Cà phê + 1 Bánh ngọt - Tiết kiệm 15.000đ',
    price: 60000,
    image: '☕',
    category: 'combo',
    discount: 15000,
    groups: [
      {
        id: 'group1',
        name: 'Chọn 1 ly cà phê',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        items: [
          { id: '1', name: 'Cà phê sữa đá', price: 35000, category: 'coffee', stock: 10 },
          { id: '2', name: 'Bạc xỉu', price: 30000, category: 'coffee', stock: 10 },
          { id: '3', name: 'Cà phê đen', price: 25000, category: 'coffee', stock: 10 },
          { id: '4', name: 'Cappuccino', price: 45000, extraPrice: 5000, category: 'coffee', stock: 10 },
        ]
      },
      {
        id: 'group2',
        name: 'Chọn 1 món bánh',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        items: [
          { id: '9', name: 'Bánh tiramisu', price: 50000, category: 'pastry', stock: 8 },
          { id: '10', name: 'Bánh croissant', price: 35000, category: 'pastry', stock: 12 },
        ]
      },
      {
        id: 'group3',
        name: 'Topping (tùy chọn)',
        required: false,
        minSelect: 0,
        maxSelect: 2,
        items: [
          { id: 'topping1', name: 'Shot espresso thêm', price: 0, extraPrice: 10000, stock: 20 },
          { id: 'topping2', name: 'Trân châu', price: 0, extraPrice: 5000, stock: 15 },
          { id: 'topping3', name: 'Thạch dừa', price: 0, extraPrice: 5000, stock: 15 },
        ]
      }
    ]
  },
  {
    id: 'combo2',
    name: 'Combo Trà + Bánh',
    description: '1 Trà + 1 Bánh - Tiết kiệm 10.000đ',
    price: 65000,
    image: '🍵',
    category: 'combo',
    discount: 10000,
    groups: [
      {
        id: 'group1',
        name: 'Chọn 1 ly trá',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        items: [
          { id: '5', name: 'Trà đào cam sả', price: 40000, category: 'tea', stock: 10 },
          { id: '6', name: 'Trà sữa trân châu', price: 38000, category: 'tea', stock: 8 },
        ]
      },
      {
        id: 'group2',
        name: 'Chọn 1 món bánh',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        items: [
          { id: '9', name: 'Bánh tiramisu', price: 50000, category: 'pastry', stock: 8 },
          { id: '10', name: 'Bánh croissant', price: 35000, category: 'pastry', stock: 12 },
        ]
      }
    ]
  },
  {
    id: 'combo3',
    name: 'Combo Sinh Tố Đôi',
    description: '2 Sinh tố bất kỳ - Tiết kiệm 15.000đ',
    price: 70000,
    image: '🥤',
    category: 'combo',
    discount: 15000,
    groups: [
      {
        id: 'group1',
        name: 'Chọn 2 ly sinh tố',
        required: true,
        minSelect: 2,
        maxSelect: 2,
        items: [
          { id: '7', name: 'Sinh tố bơ', price: 42000, category: 'smoothie', stock: 10 },
          { id: '8', name: 'Sinh tố dâu', price: 40000, category: 'smoothie', stock: 12 },
        ]
      },
      {
        id: 'group2',
        name: 'Topping (tùy chọn)',
        required: false,
        minSelect: 0,
        maxSelect: 3,
        items: [
          { id: 'topping1', name: 'Trân châu', price: 0, extraPrice: 5000, stock: 15 },
          { id: 'topping2', name: 'Thạch dừa', price: 0, extraPrice: 5000, stock: 15 },
          { id: 'topping3', name: 'Hạt chia', price: 0, extraPrice: 8000, stock: 10 },
        ]
      }
    ]
  },
  {
    id: 'combo4',
    name: 'Combo Nhóm 4',
    description: '4 ly cà phê hoặc trà - Tiết kiệm 30.000đ',
    price: 120000,
    image: '☕',
    category: 'combo',
    discount: 30000,
    groups: [
      {
        id: 'group1',
        name: 'Chọn 4 ly (cà phê hoặc trà)',
        required: true,
        minSelect: 4,
        maxSelect: 4,
        items: [
          { id: '1', name: 'Cà phê sữa đá', price: 35000, category: 'coffee', stock: 10 },
          { id: '2', name: 'Bạc xỉu', price: 30000, category: 'coffee', stock: 10 },
          { id: '3', name: 'Cà phê đen', price: 25000, category: 'coffee', stock: 10 },
          { id: '5', name: 'Trà đào cam sả', price: 40000, category: 'tea', stock: 10 },
          { id: '6', name: 'Trà sữa trân châu', price: 38000, category: 'tea', stock: 8 },
        ]
      }
    ]
  }
];

// Auto-detect combo promotions based on cart items
export interface AutoComboPromotion {
  id: string;
  name: string;
  description: string;
  requiredItems: { category?: string; itemId?: string; minQuantity: number }[];
  discount: { type: 'percentage' | 'fixed'; value: number };
  customerRestriction?: string[]; // membership tiers
}

export const autoComboPromotions: AutoComboPromotion[] = [
  {
    id: 'auto-combo-1',
    name: 'Khuyến mãi: Cà phê + Bánh',
    description: 'Mua 1 cà phê + 1 bánh ngọt → Giảm 15.000đ',
    requiredItems: [
      { category: 'coffee', minQuantity: 1 },
      { category: 'pastry', minQuantity: 1 },
    ],
    discount: { type: 'fixed', value: 15000 }
  },
  {
    id: 'auto-combo-2',
    name: 'Khuyến mãi: Trà + Bánh',
    description: 'Mua 1 trà + 1 bánh ngọt → Giảm 10.000đ',
    requiredItems: [
      { category: 'tea', minQuantity: 1 },
      { category: 'pastry', minQuantity: 1 },
    ],
    discount: { type: 'fixed', value: 10000 }
  },
  {
    id: 'auto-combo-3',
    name: 'Khuyến mãi: 2 Sinh Tố',
    description: 'Mua 2 sinh tố bất kỳ → Giảm 15.000đ',
    requiredItems: [
      { category: 'smoothie', minQuantity: 2 },
    ],
    discount: { type: 'fixed', value: 15000 }
  }
];
