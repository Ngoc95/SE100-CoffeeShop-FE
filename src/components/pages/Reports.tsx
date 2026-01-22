//src/components/pages/Reports.tsx
import { EndOfDayStatistics } from '../reports/EndOfDayStatistics';
import { CustomerReport } from '../reports/CustomerReport';
import { SupplierReport } from '../reports/SupplierReport';
import { EmployeesReportTable } from '../reports/EmployeesReportTable';
import { FinanceReport } from '../reports/FinanceReport';
import { SalesStatistics } from '../reports/SalesStatistics';
import { ProductsReportTable } from '../reports/ProductsReportTable';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface ReportsProps {
  initialTab?: 'endofday' | 'sales' | 'finance' | 'products' | 'employees' | 'customers' | 'suppliers';
}

export function Reports({ initialTab = 'endofday' }: ReportsProps = {}) {
  // Render the appropriate report component (each manages its own state and filters)
  const renderReportContent = () => {
    switch (initialTab) {
      case 'endofday':
        return <EndOfDayStatistics />;
      case 'finance':
        return <FinanceReport />;
      case 'products':
        return <ProductsReportTable />;
      case 'sales':
        return <SalesStatistics />;
      case 'customers':
        return <CustomerReport />;
      case 'suppliers':
        return <SupplierReport />;
      case 'employees':
        return <EmployeesReportTable />;
      default:
        return <EndOfDayStatistics />;
    }
  };

  // Get report title
  const getReportTitle = () => {
    const titles = {
      'endofday': 'Báo cáo cuối ngày',
      'finance': 'Báo cáo tài chính',
      'products': 'Báo cáo hàng hóa',
      'sales': 'Báo cáo bán hàng',
      'customers': 'Báo cáo khách hàng',
      'suppliers': 'Báo cáo nhà cung cấp',
      'employees': 'Báo cáo nhân viên',
    };
    return titles[initialTab] || 'Báo cáo';
  };

  const getReportDescription = () => {
    const descriptions = {
      'endofday': 'Tổng hợp hoạt động kinh doanh cuối ngày',
      'finance': 'Phân tích tài chính và dòng tiền',
      'products': 'Thống kê hàng hóa và tồn kho',
      'sales': 'Phân tích doanh thu và bán hàng',
      'customers': 'Thống kê và phân tích khách hàng',
      'suppliers': 'Quản lý và đánh giá nhà cung cấp',
      'employees': 'Hiệu suất và đánh giá nhân viên',
    };
    return descriptions[initialTab] || 'Phân tích và thống kê toàn diện hoạt động kinh doanh';
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-blue-900 text-2xl font-semibold">{getReportTitle()}</h1>
            <p className="text-slate-600 mt-1">{getReportDescription()}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content - Each component manages its own state and filters */}
      <div className="flex-1 overflow-auto">
        {renderReportContent()}
      </div>
    </div>
  );
}
