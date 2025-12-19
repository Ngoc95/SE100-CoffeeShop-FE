import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  Package,
  DollarSign,
  FileText,
  Users,
  UserCircle,
  Handshake,
  Tag,
  Wallet,
  BarChart3,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Trash2,
  FileQuestion,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  Utensils,
  Moon,
} from 'lucide-react';
import { PageType } from '../App';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { AccountProfileModal } from './AccountProfileModal';
import { cn } from './ui/utils';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isFullscreen?: boolean;
}

interface MenuItem {
  id: PageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export function Sidebar({ currentPage, onNavigate, isFullscreen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Hàng hóa', 'Đối tác', 'Nhân viên', 'Giao dịch', 'Báo cáo']);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Check permission for a specific page
  const hasAccess = (page: PageType) => {
    if (!user) return false;

    const pagePermissions: Record<PageType, string | string[]> = {
      'dashboard': 'dashboard:view',
      'pos': 'pos:access',
      'kitchen': 'kitchen:access',
      'inventory': 'goods_inventory:view',
      'product-pricing': 'goods_pricing:view',
      'stock-check': 'goods_stock_check:view',
      'import-export': 'goods_import_export:view',
      'menu': 'goods_recipe:view',
      'tables': 'tables:view',
      'scheduling': ['staff_scheduling:view', 'staff_timekeeping:view', 'staff_payroll:view'],
      'staff': 'staff:view',
      'staff-settings': 'staff_settings:view',
      'customers': 'customers:view',
      'customer-groups': 'customer_groups:view',
      'suppliers': 'suppliers:view',
      'promotions': 'promotions:view',
      'finance': 'finance:view',
      'reports-endofday': 'reports:view',
      'reports-finance': 'reports:view',
      'reports-products': 'reports:view',
      'reports-sales': 'reports:view',
      'reports-customers': 'reports:view',
      'reports-suppliers': 'reports:view',
      'reports-employees': 'reports:view',
      'invoices': 'invoices:view',
      'returns': 'returns:view',
      'purchase-orders': 'purchase_orders:view',
      'purchase-returns': 'purchase_returns:view',
      'write-offs': 'write_offs:view',
      'new-item-requests': 'goods_new_items:view',
      'accounts': 'system_users:view',
      'pos-demo-restocked': 'pos:access',
    };

    const requiredPermission = pagePermissions[page];
    if (!requiredPermission) return true;

    if (Array.isArray(requiredPermission)) {
      return requiredPermission.some(p => hasPermission(p as any));
    }
    return hasPermission(requiredPermission as any);
  };

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupLabel)
        ? prev.filter(g => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

  // Menu structure
  const mainItems: MenuItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  ];

  const menuGroups: MenuGroup[] = [
    {
      label: 'Hàng hóa',
      items: [
        { id: 'inventory', label: 'Danh mục', icon: Package },
        { id: 'product-pricing', label: 'Thiết lập giá', icon: DollarSign },
        { id: 'stock-check', label: 'Kiểm kho', icon: FileText },
        { id: 'new-item-requests', label: 'Yêu cầu món mới', icon: FileQuestion },
      ],
    },
    {
      label: 'Phòng bàn',
      items: [
        { id: 'tables', label: 'Phòng bàn', icon: Utensils },
      ],
    },
    {
      label: 'Đối tác',
      items: [
        { id: 'customers', label: 'Khách hàng', icon: UserCircle },
        { id: 'customer-groups', label: 'Nhóm khách hàng', icon: Users },
        { id: 'suppliers', label: 'Nhà cung cấp', icon: Handshake },
        { id: 'promotions', label: 'Khuyến mại', icon: Tag },
      ],
    },
    {
      label: 'Nhân viên',
      items: [
        { id: 'accounts', label: 'Tài khoản', icon: Settings },
        { id: 'staff', label: 'Nhân viên', icon: Users },
        { id: 'scheduling', label: 'Lịch làm việc', icon: FileText },
        { id: 'staff-settings', label: 'Thiết lập', icon: Settings },
      ],
    },
    {
      label: 'Giao dịch',
      items: [
        { id: 'invoices', label: 'Hóa đơn', icon: Receipt },
        { id: 'returns', label: 'Trả hàng', icon: RotateCcw },
        { id: 'purchase-orders', label: 'Nhập hàng', icon: ShoppingBag },
        { id: 'write-offs', label: 'Xuất hủy', icon: Trash2 },
      ],
    },
  ];

  const financeItems: MenuItem[] = [
    { id: 'finance', label: 'Sổ quỹ', icon: Wallet },
  ];

  const reportMenuGroup: MenuGroup = {
    label: 'Báo cáo',
    items: [
      { id: 'reports-endofday', label: 'Cuối ngày', icon: Moon },
      { id: 'reports-sales', label: 'Bán hàng', icon: ShoppingCart },
      { id: 'reports-finance', label: 'Tài chính', icon: DollarSign },
      { id: 'reports-products', label: 'Hàng hóa', icon: Package },
      { id: 'reports-employees', label: 'Nhân viên', icon: Users },
      { id: 'reports-customers', label: 'Khách hàng', icon: UserCircle },
      { id: 'reports-suppliers', label: 'Nhà cung cấp', icon: Handshake },
    ]
  };

  const fullscreenItems: MenuItem[] = [
    { id: 'pos', label: 'Bán hàng', icon: ShoppingCart },
    { id: 'kitchen', label: 'Pha chế', icon: ChefHat },
  ];

  // Render menu item
  const renderMenuItem = (item: MenuItem, isNested: boolean = false) => {
    if (!hasAccess(item.id)) return null;

    const isActive = currentPage === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
          isNested && 'pl-10',
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-700 hover:bg-slate-100',
          collapsed && !isNested && 'justify-center px-2'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-white')} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  // Render menu group
  const renderMenuGroup = (group: MenuGroup) => {
    const accessibleItems = group.items.filter(item => hasAccess(item.id));
    if (accessibleItems.length === 0) return null;

    const isExpanded = expandedGroups.includes(group.label);
    const hasActiveItem = group.items.some(item => item.id === currentPage);

    if (collapsed) {
      // In collapsed mode, show items directly without grouping
      return (
        <div key={group.label} className="space-y-1">
          {accessibleItems.map(item => renderMenuItem(item))}
        </div>
      );
    }

    return (
      <div key={group.label} className="space-y-1">
        <button
          onClick={() => toggleGroup(group.label)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm font-medium',
            hasActiveItem ? 'text-blue-600' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <span>{group.label}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'transform rotate-180'
            )}
          />
        </button>
        {isExpanded && (
          <div className="space-y-1">
            {accessibleItems.map(item => renderMenuItem(item, true))}
          </div>
        )}
      </div>
    );
  };

  // If fullscreen mode (POS/Kitchen), show minimal sidebar
  if (isFullscreen) {
    return (
      <div className="w-16 bg-white border-r border-slate-200 flex flex-col h-full">
        {/* Only show POS & Kitchen tab buttons at the very top */}
        <div className="flex flex-col gap-2 p-2 pt-4">
          {fullscreenItems.filter(item => hasAccess(item.id)).map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full p-2.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
                title={item.label}
              >
                <Icon className="w-6 h-6 mx-auto" />
              </button>
            );
          })}
        </div>
        {/* Admin button at the bottom */}
        <div className="mt-auto p-2 pb-4">
          {hasAccess('dashboard') && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
              title="Về trang admin"
            >
              <LayoutDashboard className="w-6 h-6 mx-auto" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'bg-white border-r border-slate-200 flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-blue-900 font-semibold">Coffee Shop</h1>
              <p className="text-xs text-slate-500">Hệ thống quản lý</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn('p-2', collapsed && 'mx-auto')}
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* POS & Kitchen on Top */}
          <div className="space-y-1">
            {fullscreenItems.filter(item => hasAccess(item.id)).map(item => renderMenuItem(item))}
          </div>

          {/* Main Items */}
          <div className="space-y-1">
            {mainItems.map(item => renderMenuItem(item))}
          </div>

          {/* Menu Groups */}
          {menuGroups.map(group => renderMenuGroup(group))}

          {/* Finance */}
          {financeItems.some(item => hasAccess(item.id)) && (
            <div className="space-y-1">
              {financeItems.map(item => renderMenuItem(item))}
            </div>
          )}

          {/* Reports Menu Group */}
          {reportMenuGroup.items.some(item => hasAccess(item.id)) && renderMenuGroup(reportMenuGroup)}

          {/* Fullscreen Items */}
          {fullscreenItems.some(item => hasAccess(item.id)) && !collapsed && (
            <div className="pt-3 border-t border-slate-200">
              <p className="px-3 py-1 text-xs text-slate-500 font-medium">Bán hàng</p>
              <div className="space-y-1">
                {fullscreenItems.map(item => renderMenuItem(item))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - User Profile */}
        <div className="p-3 border-t border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-all',
                  collapsed && 'justify-center px-2'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.roleLabel}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" sideOffset={5}>
              <DropdownMenuLabel>
                <div>
                  <p>{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAccountModalOpen(true)}>
                <User className="w-4 h-4 mr-2" />
                Tài khoản
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AccountProfileModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />
    </>
  );
}
