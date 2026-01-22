
// Type definitions
export type ItemType = "ready-made" | "composite" | "ingredient";
export type SortField = "name" | "currentStock" | "totalValue" | "expiryDate" | "category" | "unit" | "batches" | "status" | "productStatus" | "ingredients" | "avgUnitCost" | "supplier" | "sellingPrice";
export type SortOrder = "asc" | "desc" | "none";

export interface BatchInfo {
  id?: number;
  batchCode: string;
  quantity: number;
  unitCost: number;
  entryDate: string;
  expiryDate?: string;
  supplier: string;
}

export interface CompositeIngredient {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantity: number;
  unitCost: number;
}

export interface ToppingRelation {
  productId: number;
  toppingId: number;
  topping?: {
    id: number;
    name: string;
    sellingPrice: string | null;
  };
  product?: {
    id: number;
    name: string;
    sellingPrice: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  category: string;
  categoryId?: number;
  currentStock: number;
  unit: string;
  unitId?: number;
  minStock: number;
  maxStock: number;
  status: "good" | "low" | "expiring" | "expired" | "critical";
  productStatus?: "selling" | "paused" | "not_running" | "hot";
  imageUrl?: string; // Image URL for the item

  // For ready-made & ingredients
  batches?: BatchInfo[];

  // For composite items
  ingredients?: CompositeIngredient[];

  // Calculated fields
  totalValue: number;
  avgUnitCost: number;
  sellingPrice?: number;
  isTopping?: boolean;
  productIds?: number[];
  availableToppings?: ToppingRelation[];
  applicableProducts?: ToppingRelation[];
}