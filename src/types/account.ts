export type Permission = 
  // Hệ thống
  | 'system_users:view' | 'system_users:create' | 'system_users:update' | 'system_users:delete'
  // Tổng quan
  | 'dashboard:view'
  // Hàng hóa
  | 'goods_inventory:view' | 'goods_inventory:create' | 'goods_inventory:update' | 'goods_inventory:delete'
  | 'goods_pricing:view' | 'goods_pricing:update'
  | 'goods_stock_check:view' | 'goods_stock_check:create'
  | 'goods_new_items:view' | 'goods_new_items:update'
  | 'goods_import_export:view' | 'goods_import_export:create'
  | 'goods_recipe:view' | 'goods_recipe:update'
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
  | 'staff_payroll:view' | 'staff_payroll:create' | 'staff_payroll:update' | 'staff_payroll:delete' | 'staff_payroll:payment'
  | 'staff_settings:view' | 'staff_settings:update'
  // Giao dịch
  | 'invoices:view' | 'invoices:create' | 'invoices:update' | 'invoices:delete'
  | 'returns:view' | 'returns:create'
  | 'purchase_orders:view' | 'purchase_orders:create' | 'purchase_orders:update'
  | 'purchase_returns:view' | 'purchase_returns:create'
  | 'write_offs:view' | 'write_offs:create'
  // Tài chính
  | 'finance:view' | 'finance:create' | 'finance:update' | 'finance:delete'
  // Báo cáo
  | 'reports:view'
  // Đặc biệt
  | 'pos:access' | 'kitchen:access';

export interface Role {
  id: string;
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
  roleId: string;
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
