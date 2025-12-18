import { Permission, PermissionCategory } from '../types/account';

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'system',
    name: 'Hệ thống',
    modules: [
      {
        id: 'system_users',
        name: 'Người dùng',
        permissions: [
          { id: 'system_users:view', name: 'Xem danh sách' },
          { id: 'system_users:create', name: 'Thêm mới' },
          { id: 'system_users:update', name: 'Cập nhật' },
          { id: 'system_users:delete', name: 'Xóa' },
        ],
      },
    ],
  },
  {
    id: 'dashboard',
    name: 'Tổng quan',
    modules: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        permissions: [
          { id: 'dashboard:view', name: 'Xem' },
        ],
      },
    ],
  },
  {
    id: 'goods',
    name: 'Hàng hóa',
    modules: [
      {
        id: 'goods_inventory',
        name: 'Danh mục',
        permissions: [
          { id: 'goods_inventory:view', name: 'Xem danh sách' },
          { id: 'goods_inventory:create', name: 'Thêm mới' },
          { id: 'goods_inventory:update', name: 'Cập nhật' },
          { id: 'goods_inventory:delete', name: 'Xóa' },
        ],
      },
      {
        id: 'goods_pricing',
        name: 'Thiết lập giá',
        permissions: [
          { id: 'goods_pricing:view', name: 'Xem' },
          { id: 'goods_pricing:update', name: 'Cập nhật' },
        ],
      },
      {
        id: 'goods_stock_check',
        name: 'Kiểm kho',
        permissions: [
          { id: 'goods_stock_check:view', name: 'Xem' },
          { id: 'goods_stock_check:create', name: 'Tạo phiếu' },
        ],
      },
      {
        id: 'goods_new_items',
        name: 'Yêu cầu món mới',
        permissions: [
          { id: 'goods_new_items:view', name: 'Xem' },
          { id: 'goods_new_items:update', name: 'Duyệt' },
        ],
      },
      {
        id: 'goods_import_export',
        name: 'Nhập/Xuất',
        permissions: [
          { id: 'goods_import_export:view', name: 'Xem' },
          { id: 'goods_import_export:create', name: 'Tạo phiếu' },
        ],
      },
      {
        id: 'goods_recipe',
        name: 'Công thức',
        permissions: [
          { id: 'goods_recipe:view', name: 'Xem' },
          { id: 'goods_recipe:update', name: 'Cập nhật' },
        ],
      },
    ],
  },
  {
    id: 'tables',
    name: 'Phòng bàn',
    modules: [
      {
        id: 'tables',
        name: 'Phòng/Bàn',
        permissions: [
          { id: 'tables:view', name: 'Xem' },
          { id: 'tables:create', name: 'Thêm mới' },
          { id: 'tables:update', name: 'Cập nhật' },
          { id: 'tables:delete', name: 'Xóa' },
        ],
      },
    ],
  },
  {
    id: 'partners',
    name: 'Đối tác',
    modules: [
      {
        id: 'customers',
        name: 'Khách hàng',
        permissions: [
          { id: 'customers:view', name: 'Xem danh sách' },
          { id: 'customers:create', name: 'Thêm mới' },
          { id: 'customers:update', name: 'Cập nhật' },
          { id: 'customers:delete', name: 'Xóa' },
        ],
      },
      {
        id: 'customer_groups',
        name: 'Nhóm khách hàng',
        permissions: [
          { id: 'customer_groups:view', name: 'Xem danh sách' },
          { id: 'customer_groups:create', name: 'Thêm mới' },
          { id: 'customer_groups:update', name: 'Cập nhật' },
          { id: 'customer_groups:delete', name: 'Xóa' },
        ],
      },
      {
        id: 'suppliers',
        name: 'Nhà cung cấp',
        permissions: [
          { id: 'suppliers:view', name: 'Xem danh sách' },
          { id: 'suppliers:create', name: 'Thêm mới' },
          { id: 'suppliers:update', name: 'Cập nhật' },
          { id: 'suppliers:delete', name: 'Xóa' },
        ],
      },
      {
        id: 'promotions',
        name: 'Khuyến mại',
        permissions: [
          { id: 'promotions:view', name: 'Xem danh sách' },
          { id: 'promotions:create', name: 'Thêm mới' },
          { id: 'promotions:update', name: 'Cập nhật' },
          { id: 'promotions:delete', name: 'Xóa' },
        ],
      },
    ],
  },
  {
    id: 'staff',
    name: 'Nhân viên',
    modules: [
      {
        id: 'staff',
        name: 'Danh sách nhân viên',
        permissions: [
          { id: 'staff:view', name: 'Xem danh sách' },
          { id: 'staff:create', name: 'Thêm mới' },
          { id: 'staff:update', name: 'Cập nhật' },
          { id: 'staff:delete', name: 'Xóa' },
        ],
      },
      {
        id: 'staff_scheduling',
        name: 'Lịch làm việc',
        permissions: [
          { id: 'staff_scheduling:view', name: 'Xem' },
          { id: 'staff_scheduling:update', name: 'Cập nhật' },
        ],
      },
      {
        id: 'staff_timekeeping',
        name: 'Chấm công',
        permissions: [
          { id: 'staff_timekeeping:view', name: 'Xem' },
          { id: 'staff_timekeeping:update', name: 'Chấm công' },
        ],
      },
      {
        id: 'staff_payroll',
        name: 'Bảng lương',
        permissions: [
          { id: 'staff_payroll:view', name: 'Xem' },
          { id: 'staff_payroll:create', name: 'Tạo bảng lương' },
          { id: 'staff_payroll:update', name: 'Cập nhật' },
          { id: 'staff_payroll:delete', name: 'Xóa' },
          { id: 'staff_payroll:payment', name: 'Thanh toán' },
        ],
      },
      {
        id: 'staff_settings',
        name: 'Thiết lập',
        permissions: [
          { id: 'staff_settings:view', name: 'Xem' },
          { id: 'staff_settings:update', name: 'Cập nhật' },
        ],
      },
    ],
  },
  {
    id: 'transactions',
    name: 'Giao dịch',
    modules: [
      {
        id: 'invoices',
        name: 'Hóa đơn',
        permissions: [
          { id: 'invoices:view', name: 'Xem' },
          { id: 'invoices:create', name: 'Tạo' },
          { id: 'invoices:update', name: 'Cập nhật' },
          { id: 'invoices:delete', name: 'Xóa' },
        ],
      },
      {
        id: 'returns',
        name: 'Trả hàng',
        permissions: [
          { id: 'returns:view', name: 'Xem' },
          { id: 'returns:create', name: 'Tạo' },
        ],
      },
      {
        id: 'purchase_orders',
        name: 'Nhập hàng',
        permissions: [
          { id: 'purchase_orders:view', name: 'Xem' },
          { id: 'purchase_orders:create', name: 'Tạo' },
          { id: 'purchase_orders:update', name: 'Cập nhật' },
        ],
      },
      {
        id: 'purchase_returns',
        name: 'Trả hàng nhập',
        permissions: [
          { id: 'purchase_returns:view', name: 'Xem' },
          { id: 'purchase_returns:create', name: 'Tạo' },
        ],
      },
      {
        id: 'write_offs',
        name: 'Xuất hủy',
        permissions: [
          { id: 'write_offs:view', name: 'Xem' },
          { id: 'write_offs:create', name: 'Tạo' },
        ],
      },
    ],
  },
  {
    id: 'finance',
    name: 'Tài chính',
    modules: [
      {
        id: 'finance',
        name: 'Sổ quỹ',
        permissions: [
          { id: 'finance:view', name: 'Xem' },
          { id: 'finance:create', name: 'Thêm phiếu' },
          { id: 'finance:update', name: 'Cập nhật' },
          { id: 'finance:delete', name: 'Xóa' },
        ],
      },
    ],
  },
  {
    id: 'reports',
    name: 'Báo cáo',
    modules: [
      {
        id: 'reports',
        name: 'Báo cáo',
        permissions: [
          { id: 'reports:view', name: 'Xem' },
        ],
      },
    ],
  },
  {
    id: 'special',
    name: 'Đặc biệt',
    modules: [
      {
        id: 'pos',
        name: 'Bán hàng (POS)',
        permissions: [
          { id: 'pos:access', name: 'Truy cập' },
        ],
      },
      {
        id: 'kitchen',
        name: 'Pha chế',
        permissions: [
          { id: 'kitchen:access', name: 'Truy cập' },
        ],
      },
    ],
  },
];

// Helper to get all permissions as a flat array
export const ALL_PERMISSIONS: Permission[] = PERMISSION_CATEGORIES.flatMap(
  category => category.modules.flatMap(
    module => module.permissions.map(p => p.id)
  )
);
