import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  ArrowLeftRight,
  DollarSign,
  FileText,
  Menu,
  X,
  Settings,
  User,
  Users,
  ChevronDown,
  Home,
  LogOut
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

interface TopNavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isFullscreen?: boolean;
}

export function TopNavbar({ currentPage, onNavigate, isFullscreen }: TopNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Allow all logged in users to access the menu, but filter items by permission
  const canAccessFullMenu = true;

  // Check permission for a specific page
  const hasAccess = (page: PageType) => {
    if (!user) return false;
    
    // Admin/Manager bypass (optional, but good for safety if permissions strictly defined)
    // if (user.role === 'manager') return true; 

    // Permission mapping - should match App.tsx
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
      'reports': 'reports:view',
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
    if (!requiredPermission) return true; // No restriction defined

    if (Array.isArray(requiredPermission)) {
      return requiredPermission.some(p => hasPermission(p as any));
    }
    return hasPermission(requiredPermission as any);
  };


  const mainMenuItems = [
    { id: 'dashboard' as PageType, label: 'Tổng quan' },
  ];

  const goodsMenuItems = [
    { id: 'inventory' as PageType, label: 'Danh mục' },
    { id: 'product-pricing' as PageType, label: 'Thiết lập giá' },
    { id: 'stock-check' as PageType, label: 'Kiểm kho' },
    { id: 'new-item-requests' as PageType, label: 'Yêu cầu món mới' },
  ];

  const tableMenuItems = [
    { id: 'tables' as PageType, label: 'Phòng bàn' },
  ];

  const partnerMenuItems = [
    { id: 'customers' as PageType, label: 'Khách hàng' },
    { id: 'customer-groups' as PageType, label: 'Nhóm khách hàng' },
    { id: 'suppliers' as PageType, label: 'Nhà cung cấp' },
    { id: 'promotions' as PageType, label: 'Khuyến mại' },
  ];

  const staffMenuItems = [
    { id: 'staff' as PageType, label: 'Nhân viên' },
    { id: 'scheduling' as PageType, label: 'Lịch làm việc' },
    { id: 'staff-settings' as PageType, label: 'Thiết lập' },
  ];

  const transactionMenuItems = [
    { id: 'invoices' as PageType, label: 'Hóa đơn' },
    { id: 'returns' as PageType, label: 'Trả hàng' },
    { id: 'purchase-orders' as PageType, label: 'Nhập hàng' },
    { id: 'write-offs' as PageType, label: 'Xuất hủy' },
  ];

  const financeMenuItems = [
    { id: 'finance' as PageType, label: 'Sổ quỹ' },
  ];

  const reportMenuItems = [
    { id: 'reports' as PageType, label: 'Báo cáo' },
  ];

  const fullscreenMenuItems = [
    { id: 'pos' as PageType, label: 'Bán hàng' },
    { id: 'kitchen' as PageType, label: 'Pha chế' },
  ];

  const isStaffActive = staffMenuItems.some(item => item.id === currentPage);
  const isGoodsActive = goodsMenuItems.some(item => item.id === currentPage);
  const isPartnerActive = partnerMenuItems.some(item => item.id === currentPage);
  const isTransactionActive = transactionMenuItems.some(item => item.id === currentPage);

  if (isFullscreen) {
    return (
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {canAccessFullMenu && hasAccess('dashboard') ? (
                <Button
                  variant="outline"
                  onClick={() => onNavigate('dashboard')}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Về trang chủ
                </Button>
              ) : (
                <div className="px-3 py-2">
                  <p className="text-sm text-slate-600">{user?.roleLabel}</p>
                </div>
              )}
              <div className="h-6 w-px bg-slate-200" />
              <h1 className="text-blue-900">
                {currentPage === 'pos' ? 'Bán hàng' : 'Pha chế'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {hasAccess('accounts') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50" sideOffset={5}>
                  <DropdownMenuItem onClick={() => onNavigate('accounts')}>
                    <Users className="w-4 h-4 mr-2" />
                    Quản lý người dùng
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    <User className="w-5 h-5" />
                    {user && <span className="hidden md:inline text-sm">{user.fullName}</span>}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50" sideOffset={5}>
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
        </div>

        <AccountProfileModal
          open={accountModalOpen}
          onOpenChange={setAccountModalOpen}
        />
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <h1 className="text-blue-900">Coffee Shop POS</h1>
              <p className="text-xs text-slate-500">Hệ thống quản lý</p>
            </div>
            <div className="md:hidden">
              <h1 className="text-blue-900">Coffee POS</h1>
            </div>
          </div>

          {/* Desktop Menu - Only show for manager */}
          {canAccessFullMenu && (
            <div className="hidden lg:flex items-center gap-1">
              {/* Tổng quan */}
              {mainMenuItems
                .filter(item => hasAccess(item.id))
                .map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Hàng hóa Dropdown */}
              {goodsMenuItems.some(item => hasAccess(item.id)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all text-sm ${isGoodsActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    Hàng hóa
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {goodsMenuItems
                    .filter(item => hasAccess(item.id))
                    .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={currentPage === item.id ? 'bg-blue-50' : ''}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              )}

              {/* Phòng bàn */}
              {tableMenuItems
                .filter(item => hasAccess(item.id))
                .map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Đối tác Dropdown */}
              {partnerMenuItems.some(item => hasAccess(item.id)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all text-sm ${isPartnerActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    Đối tác
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {partnerMenuItems
                    .filter(item => hasAccess(item.id))
                    .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={currentPage === item.id ? 'bg-blue-50' : ''}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              )}

              {/* Nhân viên Dropdown */}
              {staffMenuItems.some(item => hasAccess(item.id)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all text-sm ${isStaffActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    Nhân viên
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {staffMenuItems
                    .filter(item => hasAccess(item.id))
                    .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={currentPage === item.id ? 'bg-blue-50' : ''}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              )}

              {/* Giao dịch Dropdown */}
              {transactionMenuItems.some(item => hasAccess(item.id)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all text-sm ${isTransactionActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    Giao dịch
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {transactionMenuItems
                    .filter(item => hasAccess(item.id))
                    .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={currentPage === item.id ? 'bg-blue-50' : ''}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              )}

              {/* Tài chính */}
              {financeMenuItems
                .filter(item => hasAccess(item.id))
                .map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Báo cáo */}
              {reportMenuItems
                .filter(item => hasAccess(item.id))
                .map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Separator */}
              <div className="h-6 w-px bg-slate-200 mx-2" />

              {/* Fullscreen items */}
              {fullscreenMenuItems
                .filter(item => hasAccess(item.id))
                .map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`px-4 py-2 rounded-lg transition-all text-sm ${isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {hasAccess('accounts') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50" sideOffset={5}>
                <DropdownMenuItem onClick={() => onNavigate('accounts')}>
                  <Users className="w-4 h-4 mr-2" />
                  Quản lý người dùng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                  <User className="w-5 h-5" />
                  {user && <span className="hidden md:inline text-sm">{user.fullName}</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50" sideOffset={5}>
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

            {/* Mobile menu button */}
            {canAccessFullMenu && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu - Only show for manager */}
        {mobileMenuOpen && canAccessFullMenu && (
          <div className="lg:hidden py-4 border-t">
            <div className="space-y-1">
              {/* Tổng quan */}
              {mainMenuItems
                .filter(item => hasAccess(item.id))
                .map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Hàng hóa section */}
              {goodsMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-2">
                <p className="px-3 py-1 text-xs text-slate-500">Hàng hóa</p>
                {goodsMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Phòng bàn */}
              {tableMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-2">
                {tableMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Đối tác section */}
              {partnerMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-2">
                <p className="px-3 py-1 text-xs text-slate-500">Đối tác</p>
                {partnerMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Nhân viên section */}
              {staffMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-2">
                <p className="px-3 py-1 text-xs text-slate-500">Nhân viên</p>
                {staffMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Giao dịch section */}
              {transactionMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-2">
                <p className="px-3 py-1 text-xs text-slate-500">Giao dịch</p>
                {transactionMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Tài chính */}
              {financeMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-2">
                {financeMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Báo cáo */}
              {reportMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-2">
                {reportMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Fullscreen items */}
              {fullscreenMenuItems.some(item => hasAccess(item.id)) && (
              <div className="pt-4 border-t mt-2">
                {fullscreenMenuItems
                  .filter(item => hasAccess(item.id))
                  .map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AccountProfileModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />
    </nav>
  );
}
