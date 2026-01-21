export type Permission = 
  // Hệ thống
  | 'system_users:view' | 'system_users:create' | 'system_users:update' | 'system_users:delete'
  // Tổng quan
  | 'dashboard:view'
// Hàng hóa
  | 'goods_inventory:view' | 'goods_inventory:create' | 'goods_inventory:update' | 'goods_inventory:delete'
  | 'goods_stock_check:view' | 'goods_stock_check:create' | 'goods_stock_check:update' | 'goods_stock_check:delete'
  | 'combos:view' | 'combos:create' | 'combos:update' | 'combos:delete'
  // Phòng bàn
  | 'tables:view' | 'tables:create' | 'tables:update' | 'tables:delete'
  // Đối tác
  | 'customers:view' | 'customers:create' | 'customers:update' | 'customers:delete'
  | 'customer_groups:view' | 'customer_groups:create' | 'customer_groups:update' | 'customer_groups:delete'
  | 'suppliers:view' | 'suppliers:create' | 'suppliers:update' | 'suppliers:delete'
  | 'promotions:view' | 'promotions:create' | 'promotions:update' | 'promotions:delete'
  | 'promotions:apply'
  // Nhân viên
  | 'staff:view' | 'staff:create' | 'staff:update' | 'staff:delete'
  | 'staff_scheduling:view' | 'staff_scheduling:update'
  | 'staff_timekeeping:view' | 'staff_timekeeping:update'
  | 'staff_payroll:view' | 'staff_payroll:create' | 'staff_payroll:update' | 'staff_payroll:delete'
  // Giao dịch
  | 'purchase_orders:view' | 'purchase_orders:create' | 'purchase_orders:update'
  | 'write_offs:view' | 'write_offs:create' | 'write_offs:update'
  // Tài chính
  | 'finance:view' | 'finance:create' | 'finance:update' | 'finance:delete'
  // Báo cáo
  | 'reports:view'
  // Đặc biệt
  | 'pos:access' | 'kitchen:access' | 'kitchen:complete' | 'kitchen:deliver';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean; // true for default roles (cannot delete)
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  username: string;
  fullName: string;
  roleId: number;
  status: 'active' | 'inactive';
  customPermissions?: Permission[]; // Override role permissions if set
  createdAt: string;
  updatedAt: string;
}

// Helper type for permission categories in UI
export interface PermissionCategory {
  id: string;
  name: string;
  modules: PermissionModule[];
}

export interface PermissionModule {
  id: string;
  name: string;
  permissions: PermissionItem[];
}

export interface PermissionItem {
  id: Permission;
  name: string;
}
