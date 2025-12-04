import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/pages/Login';
import { TopNavbar } from './components/TopNavbar';
import { Dashboard } from './components/pages/Dashboard';
import { POSOrdering } from './components/pages/POSOrdering';
import { KitchenDisplay } from './components/pages/KitchenDisplay';
import { Inventory } from './components/pages/Inventory';
import { ImportExport } from './components/pages/ImportExport';
import { MenuRecipe } from './components/pages/MenuRecipe';
import { Scheduling } from './components/pages/Scheduling';
import { Staff } from './components/pages/Staff';
import { StaffSettings } from './components/staff/StaffSettings';
import { Customers } from './components/pages/Customers';
import { CustomerGroups } from './components/pages/CustomerGroups';
import { Suppliers } from './components/pages/Suppliers';
import { Promotions } from './components/pages/Promotions';
import { Finance } from './components/pages/Finance';
import { Reports } from './components/pages/Reports';
import { Tables } from './components/pages/Tables';
import { NewItemRequests } from './components/pages/NewItemRequests';
import { POSOrderPanelRestockedDemo } from './components/POSOrderPanelRestockedDemo';
import { Toaster } from './components/ui/sonner';

export type PageType = 
  | 'dashboard' 
  | 'pos' 
  | 'kitchen' 
  | 'inventory' 
  | 'import-export' 
  | 'menu' 
  | 'tables'
  | 'scheduling' 
  | 'staff' 
  | 'staff-settings'
  | 'customers' 
  | 'customer-groups'
  | 'suppliers'
  | 'promotions'
  | 'finance' 
  | 'reports'
  | 'new-item-requests'
  | 'pos-demo-restocked';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  // Redirect based on user role when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'barista':
          setCurrentPage('kitchen');
          break;
        case 'cashier':
        case 'server':
          setCurrentPage('pos');
          break;
        case 'manager':
          // Manager can access everything, default to dashboard
          setCurrentPage('dashboard');
          break;
        default:
          setCurrentPage('dashboard');
      }
    }
  }, [isAuthenticated, user]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Check if user has permission to access current page
  const hasPageAccess = (page: PageType): boolean => {
    if (!user) return false;
    
    // Manager has access to all pages
    if (user.role === 'manager') return true;
    
    // Barista can only access kitchen
    if (user.role === 'barista') {
      return page === 'kitchen';
    }
    
    // Cashier and Server can only access POS
    if (user.role === 'cashier' || user.role === 'server') {
      return page === 'pos';
    }
    
    return false;
  };

  // Handle navigation with permission check
  const handleNavigate = (page: PageType) => {
    if (hasPageAccess(page)) {
      setCurrentPage(page);
    }
  };

  // Pages that use fullscreen mode
  const fullscreenPages: PageType[] = ['pos', 'kitchen'];
  const isFullscreen = fullscreenPages.includes(currentPage);

  const renderPage = () => {
    // Check permission before rendering
    if (!hasPageAccess(currentPage)) {
      // Redirect to appropriate page based on role
      if (user?.role === 'barista') {
        return <KitchenDisplay />;
      } else if (user?.role === 'cashier' || user?.role === 'server') {
        return <POSOrdering />;
      }
      return <Dashboard />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POSOrdering />;
      case 'kitchen':
        return <KitchenDisplay />;
      case 'inventory':
        return <Inventory />;
      case 'import-export':
        return <ImportExport />;
      case 'menu':
        return <MenuRecipe />;
      case 'tables':
        return <Tables />;
      case 'scheduling':
        return <Scheduling />;
      case 'staff':
        return <Staff />;
      case 'staff-settings':
        return <StaffSettings />;
      case 'customers':
        return <Customers />;
      case 'customer-groups':
        return <CustomerGroups />;
      case 'suppliers':
        return <Suppliers />;
      case 'promotions':
        return <Promotions />;
      case 'finance':
        return <Finance />;
      case 'reports':
        return <Reports />;
      case 'new-item-requests':
        return <NewItemRequests />;
      case 'pos-demo-restocked':
        return <POSOrderPanelRestockedDemo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNavbar 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        isFullscreen={isFullscreen}
      />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
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