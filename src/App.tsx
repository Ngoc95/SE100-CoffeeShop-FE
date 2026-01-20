import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/pages/Login";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/pages/Dashboard";
import { POSOrdering } from "./components/pages/POSOrdering";
import { KitchenDisplay } from "./components/pages/KitchenDisplay";
import { Inventory } from "./components/pages/Inventory";
import { ProductPricing } from "./components/pages/ProductPricing";
import { StockCheck } from "./components/pages/StockCheck";
import { ImportExport } from "./components/pages/ImportExport";
import { MenuRecipe } from "./components/pages/MenuRecipe";
import { Scheduling } from "./components/pages/Scheduling";
import { Staff } from "./components/pages/Staff";
import { StaffSettings } from "./components/staff/StaffSettings";
import { Customers } from "./components/pages/Customers";
import { CustomerGroups } from "./components/pages/CustomerGroups";
import { Suppliers } from "./components/pages/Suppliers";
import { Promotions } from "./components/pages/Promotions";
import { Finance } from "./components/pages/Finance";
import { Reports } from "./components/pages/Reports";
import { Tables } from "./components/pages/Tables";
import { NewItemRequests } from "./components/pages/NewItemRequests";
import { Invoices } from "./components/pages/Invoices";
import { Returns } from "./components/pages/Returns";
import { PurchaseOrders } from "./components/pages/PurchaseOrders";
import { PurchaseReturns } from "./components/pages/PurchaseReturns";
import { WriteOffs } from "./components/pages/WriteOffs";
import { Accounts } from "./components/pages/Accounts";
import { POSOrderPanelRestockedDemo } from "./components/POSOrderPanelRestockedDemo";
import { Toaster } from "./components/ui/sonner";

export type PageType =
  | "dashboard"
  | "pos"
  | "kitchen"
  | "inventory"
  | "product-pricing"
  | "stock-check"
  | "import-export"
  | "menu"
  | "tables"
  | "scheduling"
  | "staff"
  | "staff-settings"
  | "customers"
  | "customer-groups"
  | "suppliers"
  | "promotions"
  | "finance"
  | "reports-endofday"
  | "reports-finance"
  | "reports-products"
  | "reports-sales"
  | "reports-customers"
  | "reports-suppliers"
  | "reports-employees"
  | "invoices"
  | "returns"
  | "purchase-orders"
  | "purchase-returns"
  | "write-offs"
  | "new-item-requests"
  | "accounts"
  | "pos-demo-restocked";

function AppContent() {
  const { user, isAuthenticated, hasPermission } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");

  // Redirect based on user role when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Managers land on Dashboard
      if (user.role === "manager") {
        setCurrentPage("dashboard");
        return;
      }

      // Prefer POS if the user has POS access (cashier/server)
      if (hasPermission("pos:access" as any)) {
        setCurrentPage("pos");
        return;
      }

      // Otherwise, route barista (or any role with kitchen access) to Kitchen
      if (hasPermission("kitchen:access" as any)) {
        setCurrentPage("kitchen");
        return;
      }

      // Fallback to dashboard
      setCurrentPage("dashboard");
    }
  }, [isAuthenticated, user, hasPermission]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Check if user has permission to access current page
  const hasPageAccess = (page: PageType): boolean => {
    if (!user) return false;

    // Map pages to required permissions (string or array of strings for OR logic)
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
    if (!requiredPermission) return true; // Allow access if no permission defined
    
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.some(permission => hasPermission(permission as any));
    }

    return hasPermission(requiredPermission as any);
  };

  // Handle navigation with permission check
  const handleNavigate = (page: PageType) => {
    if (hasPageAccess(page)) {
      setCurrentPage(page);
    }
  };

  // Pages that use fullscreen mode
  const fullscreenPages: PageType[] = ["pos", "kitchen"];
  const isFullscreen = fullscreenPages.includes(currentPage);

  const renderPage = () => {
    // Check permission before rendering
    if (!hasPageAccess(currentPage)) {
      // Redirect to appropriate page based on role
      if (user?.role === "barista") {
        return <KitchenDisplay />;
      } else if (user?.role === "cashier" || user?.role === "server") {
        const posUserRole =
          user?.role === "cashier" ||
          (user?.roleLabel?.toLowerCase().includes("thu ngân") ?? false)
            ? "cashier"
            : "waiter";
        return <POSOrdering userRole={posUserRole} />;
      }
      return <Dashboard />;
    }

    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "pos":
        {
          const posUserRole =
            user?.role === "cashier" ||
            (user?.roleLabel?.toLowerCase().includes("thu ngân") ?? false)
              ? "cashier"
              : "waiter";
          return <POSOrdering userRole={posUserRole} />;
        }
      case "kitchen":
        return <KitchenDisplay />;
      case "inventory":
        return <Inventory />;
      case "product-pricing":
        return <ProductPricing />;
      case "stock-check":
        return <StockCheck />;
      case "import-export":
        return <ImportExport />;
      case "menu":
        return <MenuRecipe />;
      case "tables":
        return <Tables />;
      case "scheduling":
        return <Scheduling />;
      case "staff":
        return <Staff />;
      case "staff-settings":
        return <StaffSettings />;
      case "customers":
        return <Customers />;
      case "customer-groups":
        return <CustomerGroups />;
      case "suppliers":
        return <Suppliers />;
      case "promotions":
        return <Promotions />;
      case "finance":
        return <Finance />;
      case "reports-endofday":
        return <Reports initialTab="endofday" />;
      case "reports-finance":
        return <Reports initialTab="finance" />;
      case "reports-products":
        return <Reports initialTab="products" />;
      case "reports-sales":
        return <Reports initialTab="sales" />;
      case "reports-customers":
        return <Reports initialTab="customers" />;
      case "reports-suppliers":
        return <Reports initialTab="suppliers" />;
      case "reports-employees":
        return <Reports initialTab="employees" />;
      case "invoices":
        return <Invoices />;
      case "returns":
        return <Returns />;
      case "purchase-orders":
        return <PurchaseOrders />;
      case "purchase-returns":
        return <PurchaseReturns />;
      case "write-offs":
        return <WriteOffs />;
      case "new-item-requests":
        return <NewItemRequests />;
      case "accounts":
        return <Accounts />;
      case "pos-demo-restocked":
        return <POSOrderPanelRestockedDemo />;
      default:
        return <Dashboard />;
    }
  };

  // Hide sidebar on mobile for waiter/cashier/barista roles
  const shouldHideSidebarOnMobile = 
    user?.role === "server" || 
    user?.role === "barista" || 
    user?.role === "cashier";

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - hidden on mobile for waiter/cashier/barista roles */}
      <div className={shouldHideSidebarOnMobile ? "hidden lg:block" : ""}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isFullscreen={isFullscreen}
        />
      </div>
      <main className="flex-1 overflow-auto">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" closeButton richColors />
    </AuthProvider>
  );
}
