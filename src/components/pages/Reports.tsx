//src/components/pages/Reports.tsx
import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Target,
  Building2,
  Moon,
  Search,
  Grid,
  List,
  Eye,
  UserCheck,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  FileText
} from 'lucide-react';
import { EndOfDayReport } from '../reports/EndOfDayReport';
import { CustomerReport } from '../reports/CustomerReport';
import { CustomerTimeFilter } from '../reports/CustomerTimeFilter';
import { SupplierReport } from '../reports/SupplierReport';
import { RevenueReportTable } from '../reports/RevenueReportTable';
import { ProductsReportTable } from '../reports/ProductsReportTable';
import { ProductsReportExcel } from '../reports/ProductsReportExcel';
import { EmployeesReportTable } from '../reports/EmployeesReportTable';
import { EmployeeProfitReport } from '../reports/EmployeeProfitReport';
import { EmployeeSalesReport } from '../reports/EmployeeSalesReport';
import { FinanceReport } from '../reports/FinanceReport';
import { SalesReport } from './SalesReport';
import { InventoryImportExportReport } from '../reports/InventoryImportExportReport';
import { InventoryWriteOffReport } from '../reports/InventoryWriteOffReport';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ComposedChart,
  Area
} from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { EmployeeFilter, Employee } from '../EmployeeFilter';
import { CategoryFilter, Category } from '../CategoryFilter';

type TimeRange = 'today' | 'week' | 'month' | 'custom';
type ViewType = 'grid' | 'list';
type ConcernType = 'sales' | 'cashflow' | 'products' | 'cancellations' | 'summary';
type DateRangeType = 'single' | 'range';

interface SelectableItem {
  id: string;
  name: string;
  code?: string;
}

export function Reports() {
  const [activeTab, setActiveTab] = useState('endofday');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(['sales', 'cashflow']);

  // End of Day specific filters
  const [eodConcern, setEodConcern] = useState<ConcernType>('cashflow');
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [presetTimeRange, setPresetTimeRange] = useState('this-week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 15)); // 15/10/2025
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 9, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 9, 15));
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [selectedReceivers, setSelectedReceivers] = useState<SelectableItem[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedCashflowTypes, setSelectedCashflowTypes] = useState<string[]>([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState<SelectableItem[]>([]);
  const [selectedCancelers, setSelectedCancelers] = useState<SelectableItem[]>([]);

  // Products report filters
  const [productsDateRangeType, setProductsDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [productsPresetTimeRange, setProductsPresetTimeRange] = useState('this-month');
  const [productsDateFrom, setProductsDateFrom] = useState<Date | undefined>(new Date(2025, 9, 28));
  const [productsDateTo, setProductsDateTo] = useState<Date | undefined>(new Date(2025, 10, 27));
  const [productsSearchQuery, setProductsSearchQuery] = useState('');
  const [productsConcern, setProductsConcern] = useState<'sales' | 'profit' | 'import-export' | 'write-off'>('sales');
  const [productsProductTypes, setProductsProductTypes] = useState<string[]>(['finished', 'composite', 'ingredient']);
  const [productsCategory, setProductsCategory] = useState('all');
  const [productCategorySearchOpen, setProductCategorySearchOpen] = useState(false);


  // Customer report filters
  const [customerTimeRange, setCustomerTimeRange] = useState<TimeRange>('week');
  const [customerDateFrom, setCustomerDateFrom] = useState<Date | undefined>(new Date(2025, 10, 24));
  const [customerDateTo, setCustomerDateTo] = useState<Date | undefined>(new Date(2025, 10, 27));
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerViewType, setCustomerViewType] = useState<'chart' | 'report'>('report');
  const [customerConcernType, setCustomerConcernType] = useState<'sales' | 'debt' | 'products'>('sales');
  const [customerTimePreset, setCustomerTimePreset] = useState('this-week');
  const [customerDateRangeType, setCustomerDateRangeType] = useState<'preset' | 'custom'>('preset');


  // Supplier report filters
  const [supplierViewType, setSupplierViewType] = useState<'chart' | 'report'>('report');
  const [supplierConcern, setSupplierConcern] = useState<'sales' | 'debt'>('sales');
  const [supplierTimePreset, setSupplierTimePreset] = useState('this-month');
  const [supplierDateRangeType, setSupplierDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [supplierDateFrom, setSupplierDateFrom] = useState<Date | undefined>(new Date(2025, 10, 1));
  const [supplierDateTo, setSupplierDateTo] = useState<Date | undefined>(new Date(2025, 10, 30));
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');


  // Sales report filters
  const [salesViewType, setSalesViewType] = useState<'chart' | 'report'>('chart');
  const [salesConcern, setSalesConcern] = useState<'time' | 'profit' | 'discount' | 'return' | 'table' | 'category'>('time');
  const [salesTimePreset, setSalesTimePreset] = useState('this-month');
  const [salesDateRangeType, setSalesDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [salesDateFrom, setSalesDateFrom] = useState<Date | undefined>(new Date(2025, 11, 1));
  const [salesDateTo, setSalesDateTo] = useState<Date | undefined>(new Date(2025, 11, 2));
  const [salesSelectedArea, setSalesSelectedArea] = useState('all');
  const [salesSelectedTable, setSalesSelectedTable] = useState('all');
  const [tableSearchOpen, setTableSearchOpen] = useState(false);


  // View types for other tabs
  const [financeViewType, setFinanceViewType] = useState<'chart' | 'report'>('chart');
  const [productsViewType, setProductsViewType] = useState<'chart' | 'report'>('chart');
  const [employeesViewType, setEmployeesViewType] = useState<'chart' | 'report'>('chart');
  const [eodViewType, setEodViewType] = useState<'chart' | 'report'>('chart');

  // Employee report specific filters
  const [employeeConcern, setEmployeeConcern] = useState<'profit' | 'sales-by-employee'>('profit');
  const [employeeDateRangeType, setEmployeeDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [employeePresetTimeRange, setEmployeePresetTimeRange] = useState('this-week');
  const [employeeDateFrom, setEmployeeDateFrom] = useState<Date | undefined>(new Date(2025, 11, 1));
  const [employeeDateTo, setEmployeeDateTo] = useState<Date | undefined>(new Date(2025, 11, 4));
  const [employeeSalesMode, setEmployeeSalesMode] = useState<'invoice' | 'items'>('invoice');


  // Finance tab specific filters
  const [financeDateRangeType, setFinanceDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [financePresetTimeRange, setFinancePresetTimeRange] = useState('this-week');
  const [financeDateFrom, setFinanceDateFrom] = useState<Date | undefined>(new Date(2025, 0, 13));
  const [financeDateTo, setFinanceDateTo] = useState<Date | undefined>(new Date(2025, 0, 19));
  const [selectedFinanceConcerns, setSelectedFinanceConcerns] = useState<string[]>(['revenue', 'expenses', 'profit']);


  const calculateDateRange = (preset: string) => {
    const now = new Date();
    let from = now;
    let to = now;

    switch (preset) {
      case 'today':
        from = now;
        to = now;
        break;
      case 'yesterday':
        from = subDays(now, 1);
        to = subDays(now, 1);
        break;
      case 'this-week':
        from = startOfWeek(now, { weekStartsOn: 1 });
        to = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'this-month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      case 'this-year':
        from = startOfYear(now);
        to = endOfYear(now);
        break;
    }
    return { from, to };
  };

  const handleEodTimePresetChange = (v: string) => {
    setPresetTimeRange(v);
    if (v === 'custom') {
      setDateRangeType('custom');
    } else {
      setDateRangeType('preset');
      const { from, to } = calculateDateRange(v);
      if(v === 'today') {
        setSelectedDate(from);
      }
      setDateFrom(from);
      setDateTo(to);
    }
  };

  const handleFinanceTimePresetChange = (v: string) => {
    setFinancePresetTimeRange(v);
    if (v === 'custom') {
      setFinanceDateRangeType('custom');
    } else {
      setFinanceDateRangeType('preset');
      const { from, to } = calculateDateRange(v);
      setFinanceDateFrom(from);
      setFinanceDateTo(to);
    }
  };

  const handleProductsTimePresetChange = (v: string) => {
    setProductsPresetTimeRange(v);
    if (v === 'custom') {
      setProductsDateRangeType('custom');
    } else {
      setProductsDateRangeType('preset');
      const { from, to } = calculateDateRange(v);
      setProductsDateFrom(from);
      setProductsDateTo(to);
    }
  };

  const handleSalesTimePresetChange = (v: string) => {
    setSalesTimePreset(v);
    if (v === 'custom') {
      setSalesDateRangeType('custom');
    } else {
      setSalesDateRangeType('preset');
      const { from, to } = calculateDateRange(v);
      setSalesDateFrom(from);
      setSalesDateTo(to);
    }
  };

  const handleCustomerTimePresetChange = (v: string) => {
    setCustomerTimePreset(v);
    if (v === 'custom') {
      setCustomerDateRangeType('custom');
    } else {
      setCustomerDateRangeType('preset');
      const { from, to } = calculateDateRange(v);
      setCustomerDateFrom(from);
      setCustomerDateTo(to);
    }
  };

  const handleSupplierTimePresetChange = (v: string) => {
      setSupplierTimePreset(v);
      if (v === 'custom') {
          setSupplierDateRangeType('custom');
      } else {
          setSupplierDateRangeType('preset');
          const { from, to } = calculateDateRange(v);
          setSupplierDateFrom(from);
          setSupplierDateTo(to);
      }
  };

  const handleEmployeeTimePresetChange = (v: string) => {
      setEmployeePresetTimeRange(v);
      if (v === 'custom') {
          setEmployeeDateRangeType('custom');
      } else {
          setEmployeeDateRangeType('preset');
          const { from, to } = calculateDateRange(v);
          setEmployeeDateFrom(from);
          setEmployeeDateTo(to);
      }
  };

  // Sample data
  const employees: Employee[] = [
    { id: 'emp1', code: 'NV001', name: 'Nguyễn Văn A' },
    { id: 'emp2', code: 'NV002', name: 'Trần Thị B' },
    { id: 'emp3', code: 'NV003', name: 'Lê Văn C' },
    { id: 'emp4', code: 'NV004', name: 'Hương' },
    { id: 'emp5', code: 'NV005', name: 'Hoàng' },
  ];

  const paymentMethods: SelectableItem[] = [
    { id: 'cash', name: 'Tiền mặt' },
    { id: 'transfer', name: 'Chuyển khoản' },
    { id: 'ewallet', name: 'Ví điện tử' },
    { id: 'card', name: 'Thẻ tín dụng' },
  ];

  const cashflowTypes: Category[] = [
    { id: 'receive-customer', name: 'Thu tiền khách trả' },
    { id: 'pay-customer', name: 'Chi tiền khách trả' },
    { id: 'receive-supplier', name: 'Thu tiền NCC hoàn trả' },
    { id: 'pay-supplier', name: 'Chi tiền NCC' },
    { id: 'utilities', name: 'Chi phí điện nước' },
    { id: 'labor', name: 'Chi phí nhân công' },
    { id: 'other', name: 'Chi phí khác' },
  ];

  const productCategories: SelectableItem[] = [
    { id: 'cat-coffee', name: 'Cà phê' },
    { id: 'cat-tea', name: 'Trà' },
    { id: 'cat-milk-tea', name: 'Trà sữa' },
    { id: 'cat-smoothie', name: 'Sinh tố' },
    { id: 'cat-food', name: 'Đồ ăn' },
  ];

  const receivers: SelectableItem[] = employees;

  // Multi-select handlers
  const handleMultiSelect = (
    item: SelectableItem,
    currentSelected: SelectableItem[],
    setter: React.Dispatch<React.SetStateAction<SelectableItem[]>>
  ) => {
    const isSelected = currentSelected.some(s => s.id === item.id);
    if (isSelected) {
      setter(currentSelected.filter(s => s.id !== item.id));
    } else {
      setter([...currentSelected, item]);
    }
  };

  const handleRemoveItem = (
    id: string,
    currentSelected: SelectableItem[],
    setter: React.Dispatch<React.SetStateAction<SelectableItem[]>>
  ) => {
    setter(currentSelected.filter(item => item.id !== id));
  };

  // Dynamic concerns based on active tab
  const concernsByTab: Record<string, Array<{ id: string; label: string }>> = {
    endofday: [
      { id: 'sales', label: 'Bán hàng' },
      { id: 'cashflow', label: 'Thu chi' },
      { id: 'products', label: 'Hàng hóa' },
      { id: 'summary', label: 'Tổng hợp' },
    ],
    finance: [
      { id: 'revenue', label: 'Doanh thu' },
      { id: 'expenses', label: 'Chi phí' },
      { id: 'profit', label: 'Lợi nhuận' },
    ],
    products: [
      { id: 'bestseller', label: 'Bán chạy' },
      { id: 'slowmoving', label: 'Bán chậm' },
      { id: 'profitability', label: 'Lợi nhuận' },
      { id: 'trends', label: 'Xu hướng' },
      { id: 'import-export', label: 'Xuất nhập tồn' },
      { id: 'write-off', label: 'Xuất hủy' },
    ],
    employees: [
      { id: 'revenue', label: 'Doanh thu' },
      { id: 'performance', label: 'Hiệu suất' },
      { id: 'attendance', label: 'Chuyên cần' },
      { id: 'orders', label: 'Đơn hàng' },
    ],
    customers: [
      { id: 'new', label: 'Khách mới' },
      { id: 'vip', label: 'Khách VIP' },
      { id: 'returning', label: 'Quay lại' },
      { id: 'value', label: 'Giá trị' },
    ],
    suppliers: [
      { id: 'orders', label: 'Đơn hàng' },
      { id: 'payment', label: 'Thanh toán' },
      { id: 'debt', label: 'Công nợ' },
      { id: 'performance', label: 'Hiệu suất' },
    ],
  };

  const currentConcerns = concernsByTab[activeTab] || [];

  // ============= DATA FOR TAB 1: REVENUE REPORT =============
  const revenueByHourData = [
    { time: '6h', revenue: 850000 },
    { time: '7h', revenue: 1200000 },
    { time: '8h', revenue: 2100000 },
    { time: '9h', revenue: 2800000 },
    { time: '10h', revenue: 3200000 },
    { time: '11h', revenue: 4100000 },
    { time: '12h', revenue: 5200000 },
    { time: '13h', revenue: 4800000 },
    { time: '14h', revenue: 3900000 },
    { time: '15h', revenue: 4500000 },
    { time: '16h', revenue: 5100000 },
    { time: '17h', revenue: 6200000 },
    { time: '18h', revenue: 7800000 },
    { time: '19h', revenue: 8500000 },
    { time: '20h', revenue: 9200000 },
    { time: '21h', revenue: 7600000 },
  ];

  const revenueByProductData = [
    { name: 'Cà phê sữa đá', revenue: 9360000, orders: 156 },
    { name: 'Bạc xỉu', revenue: 6700000, orders: 134 },
    { name: 'Trà sữa trân châu', revenue: 5520000, orders: 92 },
    { name: 'Trà đào cam sả', revenue: 4785000, orders: 87 },
    { name: 'Trà sữa matcha', revenue: 4380000, orders: 73 },
    { name: 'Sinh tố bơ', revenue: 4180000, orders: 76 },
    { name: 'Cà phê đen', revenue: 3920000, orders: 98 },
    { name: 'Cappuccino', revenue: 3685000, orders: 67 },
  ];

  const paymentMethodData = [
    { name: 'Tiền mặt', value: 45, amount: 28800000, color: '#1e40af' },
    { name: 'Chuyển khoản', value: 35, amount: 22400000, color: '#3b82f6' },
    { name: 'Ví điện tử', value: 15, amount: 9600000, color: '#60a5fa' },
    { name: 'Thẻ tín dụng', value: 5, amount: 3200000, color: '#93c5fd' },
  ];

  const revenueSummary = {
    totalRevenue: 64000000,
    discounts: 3200000,
    canceledOrders: 800000,
    netRevenue: 60000000,
    totalOrders: 847,
    canceledOrdersCount: 12,
    itemsSold: 1205,
    avgOrderValue: 75560,
  };

  // ============= DATA FOR TAB 2: PRODUCT REPORT =============
  const topProductsData = [
    { name: 'Cà phê sữa đá', sold: 156, revenue: 9360000, cost: 3120000, profit: 6240000, trend: 'up' },
    { name: 'Bạc xỉu', sold: 134, revenue: 6700000, cost: 2345000, profit: 4355000, trend: 'up' },
    { name: 'Trà sữa trân châu', sold: 92, revenue: 5520000, cost: 2300000, profit: 3220000, trend: 'stable' },
    { name: 'Trà đào cam sả', sold: 87, revenue: 4785000, cost: 1740000, profit: 3045000, trend: 'up' },
    { name: 'Trà sữa matcha', sold: 73, revenue: 4380000, cost: 1825000, profit: 2555000, trend: 'down' },
    { name: 'Sinh tố bơ', sold: 76, revenue: 4180000, cost: 1880000, profit: 2300000, trend: 'stable' },
    { name: 'Cà phê đen', sold: 98, revenue: 3920000, cost: 1176000, profit: 2744000, trend: 'up' },
    { name: 'Cappuccino', sold: 67, revenue: 3685000, cost: 1547000, profit: 2138000, trend: 'stable' },
    { name: 'Trà chanh', sold: 65, revenue: 2925000, cost: 975000, profit: 1950000, trend: 'down' },
    { name: 'Sinh tố dâu', sold: 54, revenue: 2970000, cost: 1336500, profit: 1633500, trend: 'stable' },
  ];

  // Products Excel Report Data
  const productsExcelData = [
    { code: 'SP000009', name: 'Phomai dây Nga', quantitySold: 69, revenue: 8625000, quantityReturned: 0, returnValue: 0, netRevenue: 8625000, costOfGoods: 6934500, profit: 1665000, profitMargin: 19.36 },
    { code: 'SP000006', name: 'CBánh mỳ bơ lỏ đậm bồng & phomai', quantitySold: 39, revenue: 4875000, quantityReturned: 0, returnValue: 0, netRevenue: 4875000, costOfGoods: 3919500, profit: 955500, profitMargin: 19.60 },
    { code: 'SP000012', name: 'Súp kem gà nữ hoàng', quantitySold: 36, revenue: 4500000, quantityReturned: 0, returnValue: 0, netRevenue: 4500000, costOfGoods: 3618000, profit: 881250, profitMargin: 19.59 },
    { code: 'SP000013', name: 'Súp hành tây kiểu Pháp', quantitySold: 34, revenue: 4250000, quantityReturned: 0, returnValue: 0, netRevenue: 4250000, costOfGoods: 3417000, profit: 833000, profitMargin: 19.60 },
    { code: 'SP000014', name: 'Súp kem bí đỏ với sữa dừa', quantitySold: 34, revenue: 4250000, quantityReturned: 0, returnValue: 0, netRevenue: 4250000, costOfGoods: 3417000, profit: 825403, profitMargin: 19.46 },
    { code: 'SP000007', name: 'Thịt người & phomai viên chiên kiểu Tây Ba Nha', quantitySold: 33, revenue: 4125000, quantityReturned: 0, returnValue: 0, netRevenue: 4125000, costOfGoods: 3316500, profit: 804474, profitMargin: 19.52 },
    { code: 'SP000011', name: 'Súp kem rau 4 mùa', quantitySold: 31, revenue: 3875000, quantityReturned: 0, returnValue: 0, netRevenue: 3875000, costOfGoods: 3115500, profit: 758678, profitMargin: 19.58 },
    { code: 'SP000015', name: 'Súp kem kiểu Paris', quantitySold: 27, revenue: 3375000, quantityReturned: 0, returnValue: 0, netRevenue: 3375000, costOfGoods: 2713500, profit: 661500, profitMargin: 19.60 },
    { code: 'SP000023', name: 'Thuốc lá Vinataba', quantitySold: 69, revenue: 2070000, quantityReturned: 0, returnValue: 0, netRevenue: 2070000, costOfGoods: 1414500, profit: 655000, profitMargin: 31.65 },
    { code: 'SP000019', name: 'Lipton with milk', quantitySold: 78, revenue: 1170000, quantityReturned: 0, returnValue: 0, netRevenue: 1170000, costOfGoods: 546000, profit: 622750, profitMargin: 53.28 },
    { code: 'SP000008', name: 'Đĩa thịt người Tây Ba Nha hảo hạng', quantitySold: 22, revenue: 2750000, quantityReturned: 0, returnValue: 0, netRevenue: 2750000, costOfGoods: 2211000, profit: 538957, profitMargin: 19.60 },
    { code: 'SP000024', name: 'Thuốc lá Marlboro', quantitySold: 45, revenue: 1350000, quantityReturned: 0, returnValue: 0, netRevenue: 1350000, costOfGoods: 922500, profit: 422741, profitMargin: 31.42 },
    { code: 'SP000005', name: 'BLOODY MARY', quantitySold: 28, revenue: 840000, quantityReturned: 0, returnValue: 0, netRevenue: 840000, costOfGoods: 420000, profit: 414194, profitMargin: 49.65 },
    { code: 'SP000018', name: 'Mint Tea', quantitySold: 49, revenue: 735000, quantityReturned: 0, returnValue: 0, netRevenue: 735000, costOfGoods: 343000, profit: 391472, profitMargin: 53.30 },
  ];

  const slowMovingProducts = [
    { name: 'Bánh flan', sold: 8, daysNoSale: 3, status: 'slow' },
    { name: 'Nước cam chai', sold: 5, daysNoSale: 5, status: 'slow' },
    { name: 'Yaourt dẻo', sold: 3, daysNoSale: 7, status: 'very-slow' },
  ];

  const noSaleProducts = [
    { name: 'Cookies chocolate', lastSale: '15 ngày trước', status: 'no-sale' },
    { name: 'Trà hoa cúc', lastSale: '22 ngày trước', status: 'no-sale' },
  ];

  const systemSuggestions = [
    { type: 'keep', product: 'Cà phê sữa đá', reason: 'Bán chạy, lợi nhuận cao', icon: CheckCircle2, color: 'emerald' },
    { type: 'keep', product: 'Bạc xỉu', reason: 'Top doanh thu, khách hàng yêu thích', icon: CheckCircle2, color: 'emerald' },
    { type: 'pause', product: 'Cookies chocolate', reason: 'Không bán được 15 ngày', icon: XCircle, color: 'red' },
    { type: 'pause', product: 'Trà hoa cúc', reason: 'Không bán được 22 ngày', icon: XCircle, color: 'red' },
    { type: 'watch', product: 'Trà sữa matcha', reason: 'Xu hướng giảm 12%', icon: AlertTriangle, color: 'orange' },
    { type: 'trending', product: 'Trà đào cam sả', reason: 'Dự báo tăng 18% tuần tới', icon: TrendingUp, color: 'blue' },
  ];

  // ============= DATA FOR TAB 3: EMPLOYEE REPORT =============
  const employeeData = [
    {
      name: 'Nguyễn Văn A',
      role: 'Thu ngân',
      revenue: 18500000,
      discounts: 920000,
      cost: 7400000,
      profit: 10180000,
      shifts: 6,
      ordersServed: 245,
      avgOrderValue: 75510,
      performance: 92
    },
    {
      name: 'Trần Thị B',
      role: 'Thu ngân',
      revenue: 16200000,
      discounts: 810000,
      cost: 6480000,
      profit: 8910000,
      shifts: 6,
      ordersServed: 213,
      avgOrderValue: 76056,
      performance: 88
    },
    {
      name: 'Lê Văn C',
      role: 'Pha chế',
      revenue: 15800000,
      discounts: 790000,
      cost: 6320000,
      profit: 8690000,
      shifts: 5,
      ordersServed: 198,
      avgOrderValue: 79798,
      performance: 85
    },
    {
      name: 'Phạm Thị D',
      role: 'Phục vụ',
      revenue: 13500000,
      discounts: 675000,
      cost: 5400000,
      profit: 7425000,
      shifts: 6,
      ordersServed: 191,
      avgOrderValue: 70681,
      performance: 82
    },
  ];

  const employeePerformanceRadar = [
    { metric: 'Doanh thu', value: 92 },
    { metric: 'Tốc độ', value: 88 },
    { metric: 'Chính xác', value: 95 },
    { metric: 'Thái độ', value: 90 },
    { metric: 'Giờ giấc', value: 96 },
    { metric: 'Teamwork', value: 89 },
  ];

  // Employee Profit Report Data (based on image 1)
  const employeeProfitData = [
    {
      employeeName: 'Hương - Kế Toán',
      totalMerchandise: 3360000,
      invoiceDiscount: 15000,
      revenue: 3345000,
      returnValue: 0,
      netRevenue: 3345000,
      totalCost: 2580000,
      grossProfit: 765000,
    },
    {
      employeeName: 'kaka123',
      totalMerchandise: 2105000,
      invoiceDiscount: 0,
      revenue: 2105000,
      returnValue: 0,
      netRevenue: 2105000,
      totalCost: 1542500,
      grossProfit: 562500,
    },
    {
      employeeName: 'Hoàng - Kinh Doanh',
      totalMerchandise: 970000,
      invoiceDiscount: 3000,
      revenue: 967000,
      returnValue: 0,
      netRevenue: 967000,
      totalCost: 683000,
      grossProfit: 284000,
    },
  ];

  // Employee Sales Report Data (based on image 2)
  const employeeSalesData = [
    {
      employeeName: 'Hương - Kế Toán',
      totalSold: 48,
      revenue: 3360000,
      totalReturned: 0,
      returnValue: 0,
      netRevenue: 3360000,
      items: [
        {
          itemCode: 'SP000012',
          itemName: 'Súp kem gà nữ hoàng',
          quantitySold: 24,
          revenue: 3000000,
          quantityReturned: 0,
          returnValue: 0,
          netRevenue: 3000000,
        },
        {
          itemCode: 'SP000019',
          itemName: 'Lipton with milk',
          quantitySold: 15,
          revenue: 225000,
          quantityReturned: 0,
          returnValue: 0,
          netRevenue: 225000,
        },
        {
          itemCode: 'SP000046',
          itemName: 'Lemon Tea',
          quantitySold: 9,
          revenue: 135000,
          quantityReturned: 0,
          returnValue: 0,
          netRevenue: 135000,
        },
      ],
    },
    {
      employeeName: 'kaka123',
      totalSold: 33,
      revenue: 2105000,
      totalReturned: 0,
      returnValue: 0,
      netRevenue: 2105000,
      items: [],
    },
    {
      employeeName: 'Hoàng - Kinh Doanh',
      totalSold: 25,
      revenue: 970000,
      totalReturned: 0,
      returnValue: 0,
      netRevenue: 970000,
      items: [],
    },
  ];

  // Filter employee data based on date range
  const getFilteredEmployeeProfitData = () => {
    // In a real app, this would filter based on dateFrom and dateTo
    // For now, return the sample data
    return employeeProfitData;
  };

  const getFilteredEmployeeSalesData = () => {
    // In a real app, this would filter based on dateFrom and dateTo
    // For now, return the sample data
    return employeeSalesData;
  };

  // Top 10 employees by profit (for chart)
  const getTop10EmployeesByProfit = () => {
    const sorted = [...employeeProfitData].sort((a, b) => b.grossProfit - a.grossProfit);
    return sorted.slice(0, 10).map(emp => ({
      name: emp.employeeName,
      profit: emp.grossProfit,
    }));
  };

  // Top 10 employees by sales (for chart)
  const getTop10EmployeesBySales = () => {
    if (employeeSalesMode === 'invoice') {
      // Calculate by number of invoices (using totalSold as proxy)
      const sorted = [...employeeSalesData].sort((a, b) => b.totalSold - a.totalSold);
      return sorted.slice(0, 10).map(emp => ({
        name: emp.employeeName,
        value: emp.totalSold,
        label: 'Số hóa đơn',
      }));
    } else {
      // Calculate by number of items
      const sorted = [...employeeSalesData].sort((a, b) => {
        const aItems = a.items.reduce((sum, item) => sum + item.quantitySold, 0);
        const bItems = b.items.reduce((sum, item) => sum + item.quantitySold, 0);
        return bItems - aItems;
      });
      return sorted.slice(0, 10).map(emp => {
        const totalItems = emp.items.reduce((sum, item) => sum + item.quantitySold, 0);
        return {
          name: emp.employeeName,
          value: totalItems,
          label: 'Số mặt hàng',
        };
      });
    }
  };

  // ============= DATA FOR TAB 4: INVENTORY REPORT =============
  const inventoryValueData = [
    { category: 'Cà phê', value: 15600000, color: '#1e40af' },
    { category: 'Trà & nguyên liệu', value: 8900000, color: '#3b82f6' },
    { category: 'Sữa & Kem', value: 6200000, color: '#60a5fa' },
    { category: 'Đường & Syrup', value: 4500000, color: '#93c5fd' },
    { category: 'Trái cây', value: 3200000, color: '#bfdbfe' },
    { category: 'Bao bì', value: 2100000, color: '#dbeafe' },
  ];

  const lowStockItems = [
    { name: 'Cà phê hạt Arabica', current: 2, min: 5, unit: 'kg', value: 1200000 },
    { name: 'Đường', current: 3, min: 10, unit: 'kg', value: 180000 },
    { name: 'Ly nhựa size L', current: 150, min: 500, unit: 'cái', value: 450000 },
    { name: 'Sữa tươi', current: 5, min: 12, unit: 'L', value: 375000 },
  ];

  const expiringItems = [
    { name: 'Sữa tươi', expiry: '3 ngày', quantity: '12 L', value: 900000, batch: 'LOT2024001' },
    { name: 'Kem tươi', expiry: '5 ngày', quantity: '8 hộp', value: 640000, batch: 'LOT2024002' },
    { name: 'Bột cacao', expiry: '15 ngày', quantity: '2 kg', value: 320000, batch: 'LOT2024003' },
  ];

  const expiredItems = [
    { name: 'Syrup caramel', expired: '2 ngày trước', quantity: '1 chai', value: 150000, batch: 'LOT2023089' },
  ];

  const inventoryHistory = [
    { date: '25/11/2024 14:30', order: 'HD-2024-0847', product: 'Cà phê sữa đá', qty: -1, employee: 'Nguyễn Văn A' },
    { date: '25/11/2024 14:28', order: 'HD-2024-0846', product: 'Bạc xỉu', qty: -1, employee: 'Trần Thị B' },
    { date: '25/11/2024 14:25', order: 'HD-2024-0845', product: 'Trà sữa trân châu', qty: -1, employee: 'Nguyễn Văn A' },
    { date: '25/11/2024 14:20', order: 'Nhập kho', product: 'Cà phê hạt Arabica', qty: 5, employee: 'Admin' },
  ];

  // ============= DATA FOR INVENTORY IMPORT/EXPORT REPORT =============
  const inventoryImportExportData = [
    {
      code: 'SP000014',
      name: 'Súp kém bí đỏ với sữa dừa',
      beginningQty: 1091,
      beginningValue: 109645500,
      importQty: 0,
      importValue: 0,
      exportQty: 0,
      exportValue: 0,
      endingQty: 1091,
      endingValue: 109645500,
    },
    {
      code: 'SP000002',
      name: 'APEROL SPRITZ',
      beginningQty: 1051,
      beginningValue: 15765000,
      importQty: 0,
      importValue: 0,
      exportQty: 0,
      exportValue: 0,
      endingQty: 1051,
      endingValue: 15765000,
    },
    {
      code: 'SP000003',
      name: 'CUBA LIBRE',
      beginningQty: 1050,
      beginningValue: 15750000,
      importQty: 0,
      importValue: 0,
      exportQty: 0,
      exportValue: 0,
      endingQty: 1050,
      endingValue: 15750000,
    },
    {
      code: 'SP000022',
      name: 'Bia Hà Nội',
      beginningQty: 1047,
      beginningValue: 21463500,
      importQty: 0,
      importValue: 0,
      exportQty: 0,
      exportValue: 0,
      endingQty: 1047,
      endingValue: 21463500,
    },
    {
      code: 'SP000019',
      name: 'Lipton with milk',
      beginningQty: 1044,
      beginningValue: 7308000,
      importQty: 0,
      importValue: 0,
      exportQty: 0,
      exportValue: 0,
      endingQty: 1044,
      endingValue: 7308000,
    },
  ];

  // ============= DATA FOR INVENTORY WRITE-OFF REPORT =============
  const inventoryWriteOffData = [
    {
      code: 'SP000018',
      name: 'Mint Tea',
      totalQuantity: 101,
      totalValue: 707000,
      details: [
        {
          writeOffCode: 'XH000001',
          dateTime: '04/12/2025 13:10',
          quantity: 101,
          unitPrice: 7000,
          totalValue: 707000,
        },
      ],
    },
  ];

  // ============= DATA FOR TAB 5: PROFIT REPORT =============
  const profitLossData = {
    revenue: {
      sales: 64000000,
      discounts: -3200000,
      returns: -800000,
      netRevenue: 60000000,
    },
    costs: {
      cogs: 24000000,
      grossProfit: 36000000,
    },
    expenses: {
      rent: 8000000,
      utilities: 2500000,
      salaries: 15000000,
      marketing: 1500000,
      maintenance: 800000,
      other: 1200000,
      totalExpenses: 29000000,
    },
    netIncome: 7000000,
    profitBeforeTax: 7000000,
  };

  const profitTrendData = [
    { month: 'T1', revenue: 58000000, expenses: 27000000, profit: 6500000 },
    { month: 'T2', revenue: 61000000, expenses: 28000000, profit: 6800000 },
    { month: 'T3', revenue: 59000000, expenses: 27500000, profit: 6200000 },
    { month: 'T4', revenue: 64000000, expenses: 29000000, profit: 7000000 },
  ];

  const profitMarginData = [
    { name: 'Doanh thu', value: 64000000, color: '#1e40af' },
    { name: 'Giá vốn', value: 24000000, color: '#ef4444' },
    { name: 'Chi phí', value: 29000000, color: '#f97316' },
    { name: 'Lợi nhuận', value: 7000000, color: '#10b981' },
  ];

  // ============= DATA FOR TAB 6: END OF DAY REPORT =============
  const endOfDayData = {
    summary: {
      openingCash: 5000000,
      totalRevenue: 64000000,
      cashRevenue: 28800000,
      cardRevenue: 35200000,
      expenses: 2500000,
      expectedCash: 31300000,
      actualCash: 31250000,
      difference: -50000,
    },
    shifts: [
      { shift: 'Ca sáng (6h-14h)', staff: 'Nguyễn Văn A', orders: 145, revenue: 22500000, cash: 12000000 },
      { shift: 'Ca chiều (14h-22h)', staff: 'Trần Thị B', orders: 178, revenue: 28300000, cash: 16800000 },
      { shift: 'Ca tối (22h-24h)', staff: 'Lê Văn C', orders: 89, revenue: 13200000, cash: 8000000 },
    ],
    paymentBreakdown: [
      { method: 'Tiền mặt', count: 380, amount: 28800000 },
      { method: 'Chuyển khoản', count: 298, amount: 22400000 },
      { method: 'Ví điện tử', count: 128, amount: 9600000 },
      { method: 'Thẻ tín dụng', count: 41, amount: 3200000 },
    ],
    expenses: [
      { category: 'Nhập hàng', amount: 1500000, note: 'Mua cà phê, sữa' },
      { category: 'Tiện ích', amount: 500000, note: 'Điện nước' },
      { category: 'Khác', amount: 500000, note: 'Sửa chữa máy pha' },
    ],
  };

  // ============= DATA FOR TAB 7: CUSTOMER REPORT =============
  const topCustomersData = [
    { name: 'Nguyễn Văn A', phone: '0901234567', orders: 45, revenue: 8500000, avgOrder: 188889, lastVisit: '25/11/2024', loyalty: 'VIP' },
    { name: 'Trần Thị B', phone: '0912345678', orders: 38, revenue: 6800000, avgOrder: 178947, lastVisit: '24/11/2024', loyalty: 'Gold' },
    { name: 'Lê Văn C', phone: '0923456789', orders: 32, revenue: 5200000, avgOrder: 162500, lastVisit: '25/11/2024', loyalty: 'Gold' },
    { name: 'Phạm Thị D', phone: '0934567890', orders: 28, revenue: 4800000, avgOrder: 171429, lastVisit: '23/11/2024', loyalty: 'Silver' },
    { name: 'Hoàng Văn E', phone: '0945678901', orders: 25, revenue: 4200000, avgOrder: 168000, lastVisit: '25/11/2024', loyalty: 'Silver' },
  ];

  const customerSegmentData = [
    { segment: 'VIP (>20 đơn)', count: 45, revenue: 28500000, color: '#1e40af' },
    { segment: 'Gold (10-20 đơn)', count: 89, revenue: 22800000, color: '#3b82f6' },
    { segment: 'Silver (5-10 đơn)', count: 156, revenue: 18200000, color: '#60a5fa' },
    { segment: 'Mới (<5 đơn)', count: 234, revenue: 12500000, color: '#93c5fd' },
  ];

  const customerTrendData = [
    { month: 'T1', new: 45, returning: 178, total: 223 },
    { month: 'T2', new: 52, returning: 198, total: 250 },
    { month: 'T3', new: 48, returning: 210, total: 258 },
    { month: 'T4', new: 58, returning: 225, total: 283 },
  ];

  // ============= DATA FOR TAB 8: SUPPLIER REPORT =============
  const topSuppliersData = [
    { name: 'Công ty Cà phê Trung Nguyên', contact: 'Mr. Nam', products: 'Cà phê hạt', orders: 12, amount: 45000000, debt: 5000000, status: 'active' },
    { name: 'Nhà cung cấp Sữa TH True Milk', contact: 'Ms. Lan', products: 'Sữa tươi, kem', orders: 18, amount: 28000000, debt: 0, status: 'active' },
    { name: 'Cty TNHH Trái cây Đà Lạt', contact: 'Mr. Tuấn', products: 'Trái cây tươi', orders: 24, amount: 18000000, debt: 2000000, status: 'active' },
    { name: 'Kho bao bì Minh Châu', contact: 'Ms. Hoa', products: 'Ly, ống hút, túi', orders: 8, amount: 8500000, debt: 0, status: 'active' },
    { name: 'NCC đường & syrup Sweet', contact: 'Mr. Hùng', products: 'Đường, syrup', orders: 15, amount: 12000000, debt: 1500000, status: 'warning' },
  ];

  const supplierPaymentData = [
    { name: 'Đã thanh toán', value: 103000000, color: '#10b981' },
    { name: 'Còn nợ', value: 8500000, color: '#ef4444' },
  ];

  const supplierOrderTrend = [
    { month: 'T1', orders: 48, amount: 95000000 },
    { month: 'T2', orders: 52, amount: 102000000 },
    { month: 'T3', orders: 55, amount: 108000000 },
    { month: 'T4', orders: 60, amount: 111500000 },
  ];

  const handleConcernToggle = (concern: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concern)
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  // Handle customer time range change
  const handleCustomerTimeRangeChange = (range: TimeRange) => {
    setCustomerTimeRange(range);
    const today = new Date();

    if (range === 'today') {
      setCustomerDateFrom(today);
      setCustomerDateTo(today);
    } else if (range === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      setCustomerDateFrom(weekStart);
      setCustomerDateTo(today);
    } else if (range === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      setCustomerDateFrom(monthStart);
      setCustomerDateTo(today);
    }
    // For 'custom', don't auto-set dates - let user pick
  };



  return (
    <div className="h-full flex bg-slate-50">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-blue-900 text-2xl font-semibold">Báo cáo</h1>
              <p className="text-slate-600 mt-1">
                Phân tích và thống kê toàn diện hoạt động kinh doanh
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-slate-200 px-8 overflow-x-auto">
            <TabsList className="bg-transparent border-0 p-0 h-auto inline-flex w-full min-w-max">
              <TabsTrigger
                value="endofday"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 px-4 py-3"
              >
                <Moon className="w-4 h-4 mr-2" />
                Cuối ngày
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 px-4 py-3"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Bán hàng
              </TabsTrigger>
              <TabsTrigger
                value="finance"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 px-4 py-3"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Tài chính
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 px-4 py-3"
              >
                <Package className="w-4 h-4 mr-2" />
                Hàng hóa
              </TabsTrigger>
              <TabsTrigger
                value="employees"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 px-4 py-3"
              >
                <Users className="w-4 h-4 mr-2" />
                Nhân viên
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 px-4 py-3"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Khách hàng
              </TabsTrigger>
              <TabsTrigger
                value="suppliers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 px-4 py-3"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Nhà cung cấp
              </TabsTrigger>
            </TabsList>
          </div>

          {/* New Horizontal Filter Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex flex-col gap-4">
              
              {/* Row 1: Filters */}
              <div className="flex flex-wrap items-center gap-4">
                 
                 {/* END OF DAY FILTERS */}
                 {activeTab === 'endofday' && (
                    <>
                       <div className="min-w-[200px]">
                          <Select value={eodConcern} onValueChange={(v: string) => setEodConcern(v as any)}>
                             <SelectTrigger><SelectValue placeholder="Mối quan tâm" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="sales">Bán hàng</SelectItem>
                                <SelectItem value="cashflow">Thu chi</SelectItem>
                                <SelectItem value="products">Hàng hóa</SelectItem>
                                <SelectItem value="cancellations">Hủy món</SelectItem>
                                <SelectItem value="summary">Tổng hợp</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       
                       <CustomerTimeFilter
                           dateRangeType={dateRangeType}
                           timePreset={presetTimeRange}
                           dateFrom={dateFrom}
                           dateTo={dateTo}
                           onDateRangeTypeChange={setDateRangeType}
                           onTimePresetChange={handleEodTimePresetChange}
                           onDateFromChange={setDateFrom}
                           onDateToChange={setDateTo}
                       />

                       {(eodConcern === 'products' || eodConcern === 'cancellations') && (
                          <Input 
                             placeholder="Tìm hàng hóa..." 
                             value={productSearch} 
                             onChange={(e) => setProductSearch(e.target.value)}
                             className="w-[200px]" 
                          />
                       )}
                       {(eodConcern === 'cancellations' || eodConcern === 'sales' || eodConcern === 'cashflow') && (
                          <Input 
                             placeholder="Tìm khách hàng..." 
                             value={customerSearch} 
                             onChange={(e) => setCustomerSearch(e.target.value)}
                             className="w-[200px]" 
                          />
                       )}
                    </>
                 )}

                 {/* FINANCE FILTERS */}
                 {activeTab === 'finance' && (
                    <>
                       <div className="flex items-center gap-2 border p-2 rounded-md border-dashed">
                          {concernsByTab['finance']?.map(c => (
                             <div key={c.id} className="flex items-center gap-1">
                                <Checkbox 
                                   id={c.id} 
                                   checked={selectedFinanceConcerns.includes(c.id)}
                                   onCheckedChange={(checked: boolean | 'indeterminate') => {
                                      if (checked === true) setSelectedFinanceConcerns([...selectedFinanceConcerns, c.id]);
                                      else if (checked === false) setSelectedFinanceConcerns(selectedFinanceConcerns.filter(x => x !== c.id));
                                   }}
                                />
                                <Label htmlFor={c.id} className="text-sm">{c.label}</Label>
                             </div>
                          ))}
                       </div>
                       
                       <CustomerTimeFilter
                           dateRangeType={financeDateRangeType}
                           timePreset={financePresetTimeRange}
                           dateFrom={financeDateFrom}
                           dateTo={financeDateTo}
                           onDateRangeTypeChange={setFinanceDateRangeType}
                           onTimePresetChange={handleFinanceTimePresetChange}
                           onDateFromChange={setFinanceDateFrom}
                           onDateToChange={setFinanceDateTo}
                       />

                       <div className="flex bg-slate-100 rounded-lg p-1">
                           <button onClick={() => setFinanceViewType('chart')} className={`px-3 py-1 text-sm rounded ${financeViewType === 'chart' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Biểu đồ</button>
                           <button onClick={() => setFinanceViewType('report')} className={`px-3 py-1 text-sm rounded ${financeViewType === 'report' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Báo cáo</button>
                       </div>
                    </>
                 )}

                 {/* PRODUCTS FILTERS */}
                 {activeTab === 'products' && (
                    <>
                       <Select value={productsConcern} onValueChange={(v: string) => setProductsConcern(v as any)}>
                          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="sales">Bán hàng</SelectItem>
                             <SelectItem value="profit">Lợi nhuận</SelectItem>
                             <SelectItem value="import-export">Xuất nhập tồn</SelectItem>
                             <SelectItem value="write-off">Xuất hủy</SelectItem>
                          </SelectContent>
                       </Select>
                       
                       <CustomerTimeFilter
                           dateRangeType={productsDateRangeType}
                           timePreset={productsPresetTimeRange}
                           dateFrom={productsDateFrom}
                           dateTo={productsDateTo}
                           onDateRangeTypeChange={setProductsDateRangeType}
                           onTimePresetChange={handleProductsTimePresetChange}
                           onDateFromChange={setProductsDateFrom}
                           onDateToChange={setProductsDateTo}
                       />

                       <Input 
                          placeholder="Tìm sản phẩm..." 
                          value={productsSearchQuery} 
                          onChange={(e) => setProductsSearchQuery(e.target.value)}
                          className="w-[200px]" 
                       />

                       {(productsConcern !== 'import-export' && productsConcern !== 'write-off') && (
                          <div className="flex bg-slate-100 rounded-lg p-1">
                              <button onClick={() => setProductsViewType('chart')} className={`px-3 py-1 text-sm rounded ${productsViewType === 'chart' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Biểu đồ</button>
                              <button onClick={() => setProductsViewType('report')} className={`px-3 py-1 text-sm rounded ${productsViewType === 'report' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Báo cáo</button>
                          </div>
                       )}
                    </>
                 )}

                 {/* SALES FILTERS */}
                 {activeTab === 'sales' && (
                    <>
                       <Select value={salesConcern} onValueChange={(v: string) => { setSalesConcern(v as any); if(['discount','return','table','category'].includes(v)) setSalesViewType('report'); }}>
                          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="time">Thời gian</SelectItem>
                             <SelectItem value="profit">Lợi nhuận</SelectItem>
                             <SelectItem value="discount">Giảm giá</SelectItem>
                             <SelectItem value="return">Trả hàng</SelectItem>
                             <SelectItem value="table">Phòng/Bàn</SelectItem>
                             <SelectItem value="category">Danh mục</SelectItem>
                          </SelectContent>
                       </Select>
                       
                       <CustomerTimeFilter
                           dateRangeType={salesDateRangeType}
                           timePreset={salesTimePreset}
                           dateFrom={salesDateFrom}
                           dateTo={salesDateTo}
                           onDateRangeTypeChange={setSalesDateRangeType}
                           onTimePresetChange={handleSalesTimePresetChange}
                           onDateFromChange={setSalesDateFrom}
                           onDateToChange={setSalesDateTo}
                       />


                       {salesConcern === 'table' && (
                          <Select value={salesSelectedArea} onValueChange={setSalesSelectedArea}>
                             <SelectTrigger className="w-[150px]"><SelectValue placeholder="Khu vực" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="floor1">Tầng 1</SelectItem>
                                <SelectItem value="floor2">Tầng 2</SelectItem>
                             </SelectContent>
                          </Select>
                       )}

                       {(salesConcern === 'time' || salesConcern === 'profit') && (
                          <div className="flex bg-slate-100 rounded-lg p-1">
                              <button onClick={() => setSalesViewType('chart')} className={`px-3 py-1 text-sm rounded ${salesViewType === 'chart' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Biểu đồ</button>
                              <button onClick={() => setSalesViewType('report')} className={`px-3 py-1 text-sm rounded ${salesViewType === 'report' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Báo cáo</button>
                          </div>
                       )}
                    </>
                 )}

                 {/* CUSTOMERS & SUPPLIERS FILTERS */}
                 {(activeTab === 'customers' || activeTab === 'suppliers') && (
                     <>
                        <CustomerTimeFilter
                            dateRangeType={activeTab === 'customers' ? customerDateRangeType : supplierDateRangeType}
                            timePreset={activeTab === 'customers' ? customerTimePreset : supplierTimePreset}
                            dateFrom={activeTab === 'customers' ? customerDateFrom : supplierDateFrom}
                            dateTo={activeTab === 'customers' ? customerDateTo : supplierDateTo}
                            onDateRangeTypeChange={activeTab === 'customers' ? setCustomerDateRangeType : setSupplierDateRangeType}
                            onTimePresetChange={activeTab === 'customers' ? handleCustomerTimePresetChange : handleSupplierTimePresetChange}
                            onDateFromChange={activeTab === 'customers' ? setCustomerDateFrom : setSupplierDateFrom}
                            onDateToChange={activeTab === 'customers' ? setCustomerDateTo : setSupplierDateTo}
                        />

                        <Input 
                           placeholder={`Tìm ${activeTab === 'customers' ? 'khách hàng' : 'nhà cung cấp'}...`} 
                           value={activeTab === 'customers' ? customerSearchQuery : supplierSearchQuery} 
                           onChange={(e) => activeTab === 'customers' ? setCustomerSearchQuery(e.target.value) : setSupplierSearchQuery(e.target.value)}
                           className="w-[200px]" 
                        />
                        
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button onClick={() => activeTab === 'customers' ? setCustomerViewType('chart') : setSupplierViewType('chart')} className={`px-3 py-1 text-sm rounded ${(activeTab === 'customers' ? customerViewType : supplierViewType) === 'chart' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Biểu đồ</button>
                            <button onClick={() => activeTab === 'customers' ? setCustomerViewType('report') : setSupplierViewType('report')} className={`px-3 py-1 text-sm rounded ${(activeTab === 'customers' ? customerViewType : supplierViewType) === 'report' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Báo cáo</button>
                        </div>
                     </>
                 )}
                 
                 {/* EMPLOYEES FILTERS */}
                 {activeTab === 'employees' && (
                    <>
                       <Select value={employeeConcern} onValueChange={(v: string) => setEmployeeConcern(v as any)}>
                          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="profit">Lợi nhuận</SelectItem>
                             <SelectItem value="sales-by-employee">Hàng bán</SelectItem>
                          </SelectContent>
                       </Select>

                       <CustomerTimeFilter
                           dateRangeType={employeeDateRangeType}
                           timePreset={employeePresetTimeRange}
                           dateFrom={employeeDateFrom}
                           dateTo={employeeDateTo}
                           onDateRangeTypeChange={setEmployeeDateRangeType}
                           onTimePresetChange={handleEmployeeTimePresetChange}
                           onDateFromChange={setEmployeeDateFrom}
                           onDateToChange={setEmployeeDateTo}
                       />
                       
                       <div className="flex bg-slate-100 rounded-lg p-1">
                           <button onClick={() => setEmployeesViewType('chart')} className={`px-3 py-1 text-sm rounded ${employeesViewType === 'chart' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Biểu đồ</button>
                           <button onClick={() => setEmployeesViewType('report')} className={`px-3 py-1 text-sm rounded ${employeesViewType === 'report' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Báo cáo</button>
                       </div>
                    </>
                 )}

              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* TAB 3: PRODUCTS REPORT */}
            <TabsContent value="products" className="m-0 p-8 space-y-6">
              {productsConcern === 'import-export' ? (
                <InventoryImportExportReport
                  dateFrom={productsDateFrom || new Date(2025, 11, 5)}
                  dateTo={productsDateTo || new Date(2025, 11, 5)}
                  data={inventoryImportExportData}
                />
              ) : productsConcern === 'write-off' ? (
                <InventoryWriteOffReport
                  dateFrom={productsDateFrom || new Date(2025, 11, 1)}
                  dateTo={productsDateTo || new Date(2025, 11, 31)}
                  data={inventoryWriteOffData}
                />
              ) : productsViewType === 'report' ? (
                <ProductsReportExcel
                  concern={productsConcern}
                  dateFrom={productsDateFrom || new Date(2025, 9, 28)}
                  dateTo={productsDateTo || new Date(2025, 10, 27)}
                  productsData={productsExcelData}
                />
              ) : productsConcern === 'sales' ? (
                <>
                  {/* Sales Concern Charts */}

                  {/* TOP 10 - Doanh số cao nhất */}
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Award className="w-5 h-5" />
                        TOP 10 sản phẩm doanh số cao nhất
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const top10 = topProductsData.slice(0, 10);
                              const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.revenue, 0);
                              if (othersValue > 0) {
                                return [...top10, { name: 'Khác', revenue: othersValue }];
                              }
                              return top10;
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={(entry) => {
                              const total = topProductsData.reduce((sum, item) => sum + item.revenue, 0);
                              const percent = ((entry.revenue / total) * 100).toFixed(1);
                              return `${entry.name}: ${percent}%`;
                            }}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="revenue"
                          >
                            {(() => {
                              const COLORS = [
                                '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                                '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7',
                                '#94a3b8'
                              ];
                              const top10 = topProductsData.slice(0, 10);
                              const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.revenue, 0);
                              const data = othersValue > 0 ? [...top10, { name: 'Khác', revenue: othersValue }] : top10;
                              return data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ));
                            })()}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => `${value.toLocaleString()}₫`}
                            contentStyle={{
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ paddingLeft: '20px', fontSize: '14px', fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* TOP 10 bán chạy (theo số lượng) */}
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-900">
                        <TrendingUp className="w-5 h-5" />
                        TOP 10 sản phẩm bán chạy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const top10 = topProductsData.slice(0, 10);
                              const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.sold, 0);
                              if (othersValue > 0) {
                                return [...top10, { name: 'Khác', sold: othersValue }];
                              }
                              return top10;
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={(entry) => {
                              const total = topProductsData.reduce((sum, item) => sum + item.sold, 0);
                              const percent = ((entry.sold / total) * 100).toFixed(1);
                              return `${entry.name}: ${percent}%`;
                            }}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="sold"
                          >
                            {(() => {
                              const COLORS = [
                                '#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0',
                                '#06b6d4', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9',
                                '#94a3b8'
                              ];
                              const top10 = topProductsData.slice(0, 10);
                              const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.sold, 0);
                              const data = othersValue > 0 ? [...top10, { name: 'Khác', sold: othersValue }] : top10;
                              return data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ));
                            })()}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => `${value} sản phẩm`}
                            contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}
                          />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ paddingLeft: '20px', fontSize: '14px', fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Biến động số lượng bán theo thời gian */}
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-900">
                        <LineChartIcon className="w-5 h-5" />
                        Biến động số lượng bán theo thời gian (Top 10)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={(() => {
                            // Generate time-based data for top 10 products
                            // This is sample data - in real app, this would come from API based on date range
                            const timePoints = [
                              '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
                            ];

                            return timePoints.map(time => {
                              const dataPoint: any = { time };
                              topProductsData.slice(0, 10).forEach(product => {
                                // Generate random variation for demo
                                dataPoint[product.name] = Math.floor(Math.random() * 50) + 10;
                              });
                              return dataPoint;
                            });
                          })()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="time"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                            iconType="line"
                          />
                          {(() => {
                            const COLORS = [
                              '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                              '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7'
                            ];
                            return topProductsData.slice(0, 10).map((product, index) => (
                              <Line
                                key={product.name}
                                type="monotone"
                                dataKey={product.name}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                              />
                            ));
                          })()}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                </>
              ) : (
                <>
                  {/* Profit Concern Charts */}

                  {/* TOP 10 lợi nhuận cao nhất */}
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-900">
                        <Award className="w-5 h-5" />
                        TOP 10 sản phẩm lợi nhuận cao nhất
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const top10 = topProductsData.slice(0, 10);
                              const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.profit, 0);
                              if (othersValue > 0) {
                                return [...top10, { name: 'Khác', profit: othersValue }];
                              }
                              return top10;
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={(entry) => {
                              const total = topProductsData.reduce((sum, item) => sum + item.profit, 0);
                              const percent = ((entry.profit / total) * 100).toFixed(1);
                              return `${entry.name}: ${percent}%`;
                            }}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="profit"
                          >
                            {(() => {
                              const COLORS = [
                                '#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0',
                                '#06b6d4', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9',
                                '#94a3b8'
                              ];
                              const top10 = topProductsData.slice(0, 10);
                              const othersValue = topProductsData.slice(10).reduce((sum, item) => sum + item.profit, 0);
                              const data = othersValue > 0 ? [...top10, { name: 'Khác', profit: othersValue }] : top10;
                              return data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ));
                            })()}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => `${value.toLocaleString()}₫`}
                            contentStyle={{
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #86efac',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ paddingLeft: '20px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* TOP 10 theo tỷ suất lợi nhuận */}
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <TrendingUp className="w-5 h-5" />
                        TOP 10 sản phẩm theo tỷ suất lợi nhuận
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={(() => {
                              const sortedData = [...topProductsData].sort((a, b) =>
                                ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100)
                              );
                              const top10 = sortedData.slice(0, 10).map(item => ({
                                ...item,
                                profitMargin: (item.profit / item.revenue) * 100
                              }));
                              const othersData = sortedData.slice(10);
                              if (othersData.length > 0) {
                                const othersAvgMargin = othersData.reduce((sum, item) => sum + (item.profit / item.revenue) * 100, 0) / othersData.length;
                                return [...top10, { name: 'Khác', profitMargin: othersAvgMargin, profit: 0, revenue: 0 }];
                              }
                              return top10;
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={(entry) => {
                              const total = (() => {
                                const sortedData = [...topProductsData].sort((a, b) =>
                                  ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100)
                                );
                                return sortedData.slice(0, 10).reduce((sum, item) => sum + (item.profit / item.revenue) * 100, 0);
                              })();
                              const percent = ((entry.profitMargin / total) * 100).toFixed(1);
                              return `${entry.name}: ${percent}%`;
                            }}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="profitMargin"
                          >
                            {(() => {
                              const COLORS = [
                                '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
                                '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
                                '#94a3b8'
                              ];
                              const sortedData = [...topProductsData].sort((a, b) =>
                                ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100)
                              );
                              const top10 = sortedData.slice(0, 10);
                              const othersData = sortedData.slice(10);
                              const data = othersData.length > 0 ? [...top10, { name: 'Khác' }] : top10;
                              return data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ));
                            })()}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string, props: any) => {
                              return [`${value.toFixed(2)}%`, 'Tỷ suất LN'];
                            }}
                            contentStyle={{
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ paddingLeft: '20px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* TAB 4: EMPLOYEE REPORT */}
            <TabsContent value="employees" className="m-0 p-8 space-y-6">
              {employeesViewType === 'report' ? (
                <>
                  {employeeConcern === 'profit' ? (
                    <EmployeeProfitReport
                      dateFrom={employeeDateFrom}
                      dateTo={employeeDateTo}
                      employeeData={getFilteredEmployeeProfitData()}
                    />
                  ) : (
                    <EmployeeSalesReport
                      dateFrom={employeeDateFrom}
                      dateTo={employeeDateTo}
                      employeeData={getFilteredEmployeeSalesData()}
                    />
                  )}
                </>
              ) : (
                <>
                  {employeeConcern === 'profit' ? (
                    <>
                      {/* Top 10 Employees by Profit Chart */}
                      <Card className="border-emerald-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-emerald-900">
                            <BarChart3 className="w-5 h-5" />
                            Top 10 nhân viên có lợi nhuận cao nhất
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={getTop10EmployeesByProfit()} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis
                                type="number"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                width={200}
                              />
                              <Tooltip
                                formatter={(value: number) => `${value.toLocaleString()}₫`}
                                contentStyle={{
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #86efac',
                                  borderRadius: '8px'
                                }}
                              />
                              <Bar dataKey="profit" fill="#10b981" radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#047857', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <>
                      {/* Top 10 Employees by Sales Chart */}
                      <Card className="border-blue-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                              <BarChart3 className="w-5 h-5" />
                              Top 10 nhân viên bán nhiều nhất
                            </CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant={employeeSalesMode === 'invoice' ? 'default' : 'outline'}
                                size="sm"
                                className={employeeSalesMode === 'invoice' ? 'bg-blue-600' : ''}
                                onClick={() => setEmployeeSalesMode('invoice')}
                              >
                                Tính theo số hóa đơn
                              </Button>
                              <Button
                                variant={employeeSalesMode === 'items' ? 'default' : 'outline'}
                                size="sm"
                                className={employeeSalesMode === 'items' ? 'bg-blue-600' : ''}
                                onClick={() => setEmployeeSalesMode('items')}
                              >
                                Tính theo số mặt hàng
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={getTop10EmployeesBySales()} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis
                                type="number"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                width={200}
                              />
                              <Tooltip
                                formatter={(value: number) => `${value.toLocaleString()} ${employeeSalesMode === 'invoice' ? 'hóa đơn' : 'mặt hàng'}`}
                                contentStyle={{
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '8px'
                                }}
                              />
                              <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#1e40af', fontWeight: 'bold', fontSize: 11, formatter: (value: number) => value.toLocaleString('vi-VN') }} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </>
              )}
            </TabsContent>


            {/* TAB 1: END OF DAY REPORT */}
            <TabsContent value="endofday" className="m-0 p-8">
              <EndOfDayReport
                concern={eodConcern}
                dateRangeType={dateRangeType as any}
                selectedDate={selectedDate}
                dateFrom={dateFrom}
                dateTo={dateTo}
                customerSearch={customerSearch}
                productSearch={productSearch}
                selectedCreators={selectedCreators.map(id => {
                  const creator = employees.find(e => e.id === id);
                  return creator ? { id: creator.id, name: creator.name, code: creator.code } : { id, name: '' };
                })}
                selectedReceivers={selectedReceivers}
                selectedPaymentMethods={selectedPaymentMethods.map(id => {
                  const method = paymentMethods.find(m => m.id === id);
                  return method ? { id: method.id, name: method.name } : { id, name: '' };
                })}
                selectedCashflowTypes={selectedCashflowTypes.map(name => {
                  const type = cashflowTypes.find(t => t.name === name);
                  return type ? { id: type.id, name: type.name } : { id: '', name };
                })}
                selectedProductCategories={selectedProductCategories}
                selectedCancelers={selectedCancelers}
              />
            </TabsContent>

            {/* TAB 2: FINANCE REPORT */}
            <TabsContent value="finance" className="m-0 p-8">
              <FinanceReport
                viewType={financeViewType}
                selectedConcerns={selectedFinanceConcerns}
              />
            </TabsContent>

            {/* TAB 6: CUSTOMER REPORT */}
            <TabsContent value="customers" className="m-0 p-8">
              <CustomerReport
                dateFrom={customerDateFrom}
                dateTo={customerDateTo}
                customerSearch={customerSearchQuery}
                viewType={customerViewType}
                concernType={customerConcernType}
              />
            </TabsContent>

            {/* TAB 7: SUPPLIER REPORT */}
            <TabsContent value="suppliers" className="m-0 p-8">
              <SupplierReport
                viewType={supplierViewType}
                concern={supplierConcern}
                searchQuery={supplierSearchQuery}
                dateFrom={supplierDateFrom}
                dateTo={supplierDateTo}
              />
            </TabsContent>

            {/* TAB 8: SALES REPORT */}
            <TabsContent value="sales" className="m-0 h-full">
              <SalesReport
                viewType={salesViewType}
                concern={salesConcern}
                dateFrom={salesDateFrom}
                dateTo={salesDateTo}
                selectedArea={salesSelectedArea}
                selectedTable={salesSelectedTable}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
