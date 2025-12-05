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
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
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
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type TimeRange = 'today' | 'week' | 'month' | 'custom';
type ViewType = 'grid' | 'list';
type ConcernType = 'sales' | 'cashflow' | 'products' | 'cancellations' | 'summary';
type DateRangeType = 'single' | 'range';

interface SelectableItem {
  id: string;
  name: string;
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
  const [selectedCreators, setSelectedCreators] = useState<SelectableItem[]>([]);
  const [selectedReceivers, setSelectedReceivers] = useState<SelectableItem[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<SelectableItem[]>([]);
  const [selectedCashflowTypes, setSelectedCashflowTypes] = useState<SelectableItem[]>([]);
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
  const [selectedFinanceConcerns, setSelectedFinanceConcerns] = useState<string[]>(['revenue', 'profit']);

  // Sample data
  const employees: SelectableItem[] = [
    { id: 'emp1', name: 'Nguyễn Văn A - Thu ngân' },
    { id: 'emp2', name: 'Trần Thị B - Phục vụ' },
    { id: 'emp3', name: 'Lê Văn C - Quản lý' },
    { id: 'emp4', name: 'Hương - Kế Toán' },
    { id: 'emp5', name: 'Hoàng - Kinh Doanh' },
  ];

  const paymentMethods: SelectableItem[] = [
    { id: 'cash', name: 'Tiền mặt' },
    { id: 'transfer', name: 'Chuyển khoản' },
    { id: 'ewallet', name: 'Ví điện tử' },
    { id: 'card', name: 'Thẻ tín dụng' },
  ];

  const cashflowTypes: SelectableItem[] = [
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

  // Handle customer time preset change
  const handleCustomerTimePresetChange = (preset: string) => {
    setCustomerTimePreset(preset);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    switch (preset) {
      case 'today':
        setCustomerDateFrom(today);
        setCustomerDateTo(today);
        break;
      case 'yesterday':
        setCustomerDateFrom(yesterday);
        setCustomerDateTo(yesterday);
        break;
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        setCustomerDateFrom(weekStart);
        setCustomerDateTo(today);
        break;
      case 'last-week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        setCustomerDateFrom(lastWeekStart);
        setCustomerDateTo(lastWeekEnd);
        break;
      case 'last-7-days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        setCustomerDateFrom(sevenDaysAgo);
        setCustomerDateTo(today);
        break;
      case 'this-month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setCustomerDateFrom(monthStart);
        setCustomerDateTo(today);
        break;
      case 'last-month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setCustomerDateFrom(lastMonthStart);
        setCustomerDateTo(lastMonthEnd);
        break;
      case 'last-30-days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setCustomerDateFrom(thirtyDaysAgo);
        setCustomerDateTo(today);
        break;
      case 'this-year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        setCustomerDateFrom(yearStart);
        setCustomerDateTo(today);
        break;
      case 'last-year':
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        setCustomerDateFrom(lastYearStart);
        setCustomerDateTo(lastYearEnd);
        break;
      case 'this-quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
        setCustomerDateFrom(quarterStart);
        setCustomerDateTo(today);
        break;
      case 'last-quarter':
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        const lastQuarterStart = new Date(lastQuarterYear, adjustedQuarter * 3, 1);
        const lastQuarterEnd = new Date(lastQuarterYear, adjustedQuarter * 3 + 3, 0);
        setCustomerDateFrom(lastQuarterStart);
        setCustomerDateTo(lastQuarterEnd);
        break;
    }
  };

  // Handle supplier time preset change
  const handleSupplierTimePresetChange = (preset: string) => {
    setSupplierTimePreset(preset);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    switch (preset) {
      case 'today':
        setSupplierDateFrom(today);
        setSupplierDateTo(today);
        break;
      case 'yesterday':
        setSupplierDateFrom(yesterday);
        setSupplierDateTo(yesterday);
        break;
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        setSupplierDateFrom(weekStart);
        setSupplierDateTo(today);
        break;
      case 'last-week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        setSupplierDateFrom(lastWeekStart);
        setSupplierDateTo(lastWeekEnd);
        break;
      case 'last-7-days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        setSupplierDateFrom(sevenDaysAgo);
        setSupplierDateTo(today);
        break;
      case 'this-month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setSupplierDateFrom(monthStart);
        setSupplierDateTo(today);
        break;
      case 'last-month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setSupplierDateFrom(lastMonthStart);
        setSupplierDateTo(lastMonthEnd);
        break;
      case 'last-30-days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setSupplierDateFrom(thirtyDaysAgo);
        setSupplierDateTo(today);
        break;
      case 'this-year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        setSupplierDateFrom(yearStart);
        setSupplierDateTo(today);
        break;
      case 'last-year':
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        setSupplierDateFrom(lastYearStart);
        setSupplierDateTo(lastYearEnd);
        break;
      case 'this-quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
        setSupplierDateFrom(quarterStart);
        setSupplierDateTo(today);
        break;
      case 'last-quarter':
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        const lastQuarterStart = new Date(lastQuarterYear, adjustedQuarter * 3, 1);
        const lastQuarterEnd = new Date(lastQuarterYear, adjustedQuarter * 3 + 3, 0);
        setSupplierDateFrom(lastQuarterStart);
        setSupplierDateTo(lastQuarterEnd);
        break;
    }
  };

  // Handle sales time preset change
  const handleSalesTimePresetChange = (preset: string) => {
    setSalesTimePreset(preset);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    switch (preset) {
      case 'today':
        setSalesDateFrom(today);
        setSalesDateTo(today);
        break;
      case 'yesterday':
        setSalesDateFrom(yesterday);
        setSalesDateTo(yesterday);
        break;
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        setSalesDateFrom(weekStart);
        setSalesDateTo(today);
        break;
      case 'last-week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        setSalesDateFrom(lastWeekStart);
        setSalesDateTo(lastWeekEnd);
        break;
      case 'last-7-days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        setSalesDateFrom(sevenDaysAgo);
        setSalesDateTo(today);
        break;
      case 'this-month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setSalesDateFrom(monthStart);
        setSalesDateTo(today);
        break;
      case 'last-month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setSalesDateFrom(lastMonthStart);
        setSalesDateTo(lastMonthEnd);
        break;
      case 'last-30-days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setSalesDateFrom(thirtyDaysAgo);
        setSalesDateTo(today);
        break;
      case 'this-year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        setSalesDateFrom(yearStart);
        setSalesDateTo(today);
        break;
      case 'last-year':
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        setSalesDateFrom(lastYearStart);
        setSalesDateTo(lastYearEnd);
        break;
      case 'this-quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
        setSalesDateFrom(quarterStart);
        setSalesDateTo(today);
        break;
      case 'last-quarter':
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        const lastQuarterStart = new Date(lastQuarterYear, adjustedQuarter * 3, 1);
        const lastQuarterEnd = new Date(lastQuarterYear, adjustedQuarter * 3 + 3, 0);
        setSalesDateFrom(lastQuarterStart);
        setSalesDateTo(lastQuarterEnd);
        break;
    }
  };

  return (
    <div className="h-full flex bg-slate-50">
      {/* Left Sidebar - Filters */}
      <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto hidden lg:block">
        <div className="p-6 space-y-6">
          {activeTab === 'endofday' ? (
            // END OF DAY SPECIFIC FILTERS
            <>

              {/* Mối quan tâm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <RadioGroup value={eodConcern} onValueChange={(value) => setEodConcern(value as ConcernType)}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="sales" id="concern-sales" />
                    <Label htmlFor="concern-sales" className="text-sm text-slate-700 cursor-pointer">
                      Bán hàng
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="cashflow" id="concern-cashflow" />
                    <Label htmlFor="concern-cashflow" className="text-sm text-slate-700 cursor-pointer">
                      Thu chi
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="products" id="concern-products" />
                    <Label htmlFor="concern-products" className="text-sm text-slate-700 cursor-pointer">
                      Hàng hóa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="cancellations" id="concern-cancellations" />
                    <Label htmlFor="concern-cancellations" className="text-sm text-slate-700 cursor-pointer">
                      Hủy món
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="summary" id="concern-summary" />
                    <Label htmlFor="concern-summary" className="text-sm text-slate-700 cursor-pointer">
                      Tổng hợp
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Thời gian */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
                <RadioGroup value={dateRangeType} onValueChange={(value) => setDateRangeType(value as 'preset' | 'custom')}>
                  {/* Preset Time Ranges */}
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="preset" id="date-preset" />
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left text-sm"
                            onClick={() => setDateRangeType('preset')}
                          >
                            <span>
                              {presetTimeRange === 'today' && 'Hôm nay'}
                              {presetTimeRange === 'yesterday' && 'Hôm qua'}
                              {presetTimeRange === 'this-week' && 'Tuần này'}
                              {presetTimeRange === 'last-week' && 'Tuần trước'}
                              {presetTimeRange === 'last-7-days' && '7 ngày qua'}
                              {presetTimeRange === 'this-month' && 'Tháng này'}
                              {presetTimeRange === 'last-month' && 'Tháng trước'}
                              {presetTimeRange === 'this-month-lunar' && 'Tháng này (âm lịch)'}
                              {presetTimeRange === 'last-month-lunar' && 'Tháng trước (âm lịch)'}
                              {presetTimeRange === 'last-30-days' && '30 ngày qua'}
                              {presetTimeRange === 'this-quarter' && 'Quý này'}
                              {presetTimeRange === 'last-quarter' && 'Quý trước'}
                              {presetTimeRange === 'this-year' && 'Năm nay'}
                              {presetTimeRange === 'last-year' && 'Năm trước'}
                              {presetTimeRange === 'this-year-lunar' && 'Năm nay (âm lịch)'}
                              {presetTimeRange === 'last-year-lunar' && 'Năm trước (âm lịch)'}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[600px] p-4" align="start">
                          <div className="grid grid-cols-3 gap-6">
                            {/* Column 1: Theo ngày và tuần */}
                            <div>
                              <h4 className="text-sm text-slate-700 mb-3">Theo ngày và tuần</h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'today', label: 'Hôm nay' },
                                  { value: 'yesterday', label: 'Hôm qua' },
                                  { value: 'this-week', label: 'Tuần này' },
                                  { value: 'last-week', label: 'Tuần trước' },
                                  { value: 'last-7-days', label: '7 ngày qua' },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setPresetTimeRange(option.value);
                                      setDateRangeType('preset');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      presetTimeRange === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Column 2: Theo tháng và quý */}
                            <div>
                              <h4 className="text-sm text-slate-700 mb-3">Theo tháng và quý</h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'this-month', label: 'Tháng này' },
                                  { value: 'last-month', label: 'Tháng trước' },
                                  { value: 'this-month-lunar', label: 'Tháng này (âm lịch)' },
                                  { value: 'last-month-lunar', label: 'Tháng trước (âm lịch)' },
                                  { value: 'last-30-days', label: '30 ngày qua' },
                                  { value: 'this-quarter', label: 'Quý này' },
                                  { value: 'last-quarter', label: 'Quý trước' },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setPresetTimeRange(option.value);
                                      setDateRangeType('preset');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      presetTimeRange === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Column 3: Theo năm */}
                            <div>
                              <h4 className="text-sm text-slate-700 mb-3">Theo năm</h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'this-year', label: 'Năm nay' },
                                  { value: 'last-year', label: 'Năm trước' },
                                  { value: 'this-year-lunar', label: 'Năm nay (âm lịch)' },
                                  { value: 'last-year-lunar', label: 'Năm trước (âm lịch)' },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setPresetTimeRange(option.value);
                                      setDateRangeType('preset');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      presetTimeRange === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="date-custom" />
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left text-sm"
                            onClick={() => setDateRangeType('custom')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom && dateTo
                              ? `${format(dateFrom, 'dd/MM', { locale: vi })} - ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`
                              : 'Lựa chọn khác'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="start">
                          <div className="flex gap-4">
                            <div>
                              <Label className="text-xs text-slate-600 mb-2 block">Từ ngày</Label>
                              <CalendarComponent
                                mode="single"
                                selected={dateFrom}
                                onSelect={(date) => {
                                  if (date) {
                                    setDateFrom(date);
                                    setDateRangeType('custom');
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-600 mb-2 block">Đến ngày</Label>
                              <CalendarComponent
                                mode="single"
                                selected={dateTo}
                                onSelect={(date) => {
                                  if (date) {
                                    setDateTo(date);
                                    setDateRangeType('custom');
                                  }
                                }}
                                disabled={(date) => dateFrom ? date < dateFrom : false}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Conditional Filters based on Concern */}
              {eodConcern === 'products' && (
                <>
                  {/* Tìm kiếm hàng hóa */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm hàng hóa</h3>
                    <Input
                      placeholder="Theo tên, mã hàng"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Chọn loại hàng */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Chọn loại hàng</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {selectedProductCategories.length > 0 ? (
                              selectedProductCategories.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="secondary"
                                  className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                >
                                  {item.name}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItem(item.id, selectedProductCategories, setSelectedProductCategories);
                                    }}
                                    className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">Chọn loại hàng</span>
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                          {productCategories.map((cat) => (
                            <div
                              key={cat.id}
                              className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                              onClick={() => handleMultiSelect(cat, selectedProductCategories, setSelectedProductCategories)}
                            >
                              <span className="text-sm text-slate-900">{cat.name}</span>
                              {selectedProductCategories.some(s => s.id === cat.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              {eodConcern === 'cancellations' && (
                <>
                  {/* Tìm kiếm khách hàng */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm khách hàng</h3>
                    <Input
                      placeholder="Theo mã, tên, điện thoại"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Tìm kiếm hàng hóa */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm hàng hóa</h3>
                    <Input
                      placeholder="Theo tên, mã hàng"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Nhân viên hủy */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Nhân viên hủy</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {selectedCancelers.length > 0 ? (
                              selectedCancelers.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="secondary"
                                  className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                >
                                  {item.name}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItem(item.id, selectedCancelers, setSelectedCancelers);
                                    }}
                                    className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">Chọn nhân viên</span>
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                          {employees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                              onClick={() => handleMultiSelect(emp, selectedCancelers, setSelectedCancelers)}
                            >
                              <span className="text-sm text-slate-900">{emp.name}</span>
                              {selectedCancelers.some(s => s.id === emp.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              {eodConcern === 'summary' && (
                <>
                  {/* Người nhận đơn */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Người nhận đơn</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {selectedReceivers.length > 0 ? (
                              selectedReceivers.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="secondary"
                                  className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                >
                                  {item.name}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItem(item.id, selectedReceivers, setSelectedReceivers);
                                    }}
                                    className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">Chọn người nhận</span>
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                          {receivers.map((receiver) => (
                            <div
                              key={receiver.id}
                              className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                              onClick={() => handleMultiSelect(receiver, selectedReceivers, setSelectedReceivers)}
                            >
                              <span className="text-sm text-slate-900">{receiver.name}</span>
                              {selectedReceivers.some(s => s.id === receiver.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Separator />

                  {/* Người tạo */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Người tạo</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {selectedCreators.length > 0 ? (
                              selectedCreators.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="secondary"
                                  className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                >
                                  {item.name}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItem(item.id, selectedCreators, setSelectedCreators);
                                    }}
                                    className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">Chọn người tạo</span>
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                          {employees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                              onClick={() => handleMultiSelect(emp, selectedCreators, setSelectedCreators)}
                            >
                              <span className="text-sm text-slate-900">{emp.name}</span>
                              {selectedCreators.some(s => s.id === emp.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              {(eodConcern === 'sales' || eodConcern === 'cashflow') && (
                <>
                  {/* Khách hàng */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Khách hàng</h3>
                    <Input
                      placeholder="Theo mã, tên, điện thoại"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Separator />

                  {/* Người tạo */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Người tạo</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {selectedCreators.length > 0 ? (
                              selectedCreators.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="secondary"
                                  className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                >
                                  {item.name}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItem(item.id, selectedCreators, setSelectedCreators);
                                    }}
                                    className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">Chọn người tạo</span>
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                          {employees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                              onClick={() => handleMultiSelect(emp, selectedCreators, setSelectedCreators)}
                            >
                              <span className="text-sm text-slate-900">{emp.name}</span>
                              {selectedCreators.some(s => s.id === emp.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Separator />

                  {/* Phương thức thanh toán */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Phương thức thanh toán</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {selectedPaymentMethods.length > 0 ? (
                              selectedPaymentMethods.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="secondary"
                                  className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                >
                                  {item.name}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItem(item.id, selectedPaymentMethods, setSelectedPaymentMethods);
                                    }}
                                    className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">Chọn phương thức</span>
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-2">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                              onClick={() => handleMultiSelect(method, selectedPaymentMethods, setSelectedPaymentMethods)}
                            >
                              <span className="text-sm text-slate-900">{method.name}</span>
                              {selectedPaymentMethods.some(s => s.id === method.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {eodConcern === 'cashflow' && (
                    <>
                      <Separator />

                      {/* Loại thu chi */}
                      <div>
                        <h3 className="text-sm text-slate-900 mb-3">Loại thu chi</h3>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {selectedCashflowTypes.length > 0 ? (
                                  selectedCashflowTypes.map((item) => (
                                    <Badge
                                      key={item.id}
                                      variant="secondary"
                                      className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                    >
                                      {item.name}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveItem(item.id, selectedCashflowTypes, setSelectedCashflowTypes);
                                        }}
                                        className="ml-1 hover:bg-slate-300 rounded-sm p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-slate-500 text-sm">Loại thu chi</span>
                                )}
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-3" align="start">
                            <div className="space-y-2">
                              {cashflowTypes.map((type) => (
                                <div
                                  key={type.id}
                                  className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer"
                                  onClick={() => handleMultiSelect(type, selectedCashflowTypes, setSelectedCashflowTypes)}
                                >
                                  <span className="text-sm text-slate-900">{type.name}</span>
                                  {selectedCashflowTypes.some(s => s.id === type.id) && (
                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          ) : activeTab === 'customers' ? (
            // CUSTOMER REPORT FILTERS
            <>
              {/* Kiểu hiển thị */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Kiểu hiển thị</h3>
                <div className="flex gap-2">
                  <Button
                    variant={customerViewType === 'chart' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${customerViewType === 'chart' ? 'bg-blue-600' : ''}`}
                    onClick={() => setCustomerViewType('chart')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Biểu đồ
                  </Button>
                  <Button
                    variant={customerViewType === 'report' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${customerViewType === 'report' ? 'bg-blue-600' : ''}`}
                    onClick={() => setCustomerViewType('report')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Báo cáo
                  </Button>
                </div>
              </div>

              <Separator />

              <CustomerTimeFilter
                dateRangeType={customerDateRangeType}
                timePreset={customerTimePreset}
                dateFrom={customerDateFrom}
                dateTo={customerDateTo}
                onDateRangeTypeChange={setCustomerDateRangeType}
                onTimePresetChange={handleCustomerTimePresetChange}
                onDateFromChange={setCustomerDateFrom}
                onDateToChange={setCustomerDateTo}
              />

              <Separator />

              {/* Tìm kiếm khách hàng */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm khách hàng</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm theo tên, mã, SĐT..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </>
          ) : activeTab === 'suppliers' ? (
            // SUPPLIER REPORT FILTERS
            <>
              {/* Kiểu hiển thị */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Kiểu hiển thị</h3>
                <div className="flex gap-2">
                  <Button
                    variant={supplierViewType === 'chart' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${supplierViewType === 'chart' ? 'bg-blue-600' : ''}`}
                    onClick={() => setSupplierViewType('chart')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Biểu đồ
                  </Button>
                  <Button
                    variant={supplierViewType === 'report' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${supplierViewType === 'report' ? 'bg-blue-600' : ''}`}
                    onClick={() => setSupplierViewType('report')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Báo cáo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Mối quan tâm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <RadioGroup value={supplierConcern} onValueChange={(value) => setSupplierConcern(value as 'sales' | 'debt')}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="sales" id="supplier-concern-sales" />
                    <Label htmlFor="supplier-concern-sales" className="text-sm text-slate-700 cursor-pointer">
                      Nhập hàng
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debt" id="supplier-concern-debt" />
                    <Label htmlFor="supplier-concern-debt" className="text-sm text-slate-700 cursor-pointer">
                      Công nợ
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <CustomerTimeFilter
                dateRangeType={supplierDateRangeType}
                timePreset={supplierTimePreset}
                dateFrom={supplierDateFrom}
                dateTo={supplierDateTo}
                onDateRangeTypeChange={setSupplierDateRangeType}
                onTimePresetChange={handleSupplierTimePresetChange}
                onDateFromChange={setSupplierDateFrom}
                onDateToChange={setSupplierDateTo}
              />

              <Separator />

              {/* Tìm kiếm nhà cung cấp */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm nhà cung cấp</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Theo mã, tên, điện thoại"
                    value={supplierSearchQuery}
                    onChange={(e) => setSupplierSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </>
          ) : activeTab === 'sales' ? (
            // SALES REPORT FILTERS
            <>
              {/* Kiểu hiển thị - only show for time and profit concerns */}
              {(salesConcern === 'time' || salesConcern === 'profit') && (
                <>
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Kiểu hiển thị</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={salesViewType === 'chart' ? 'default' : 'outline'}
                        size="sm"
                        className={`flex-1 ${salesViewType === 'chart' ? 'bg-blue-600' : ''}`}
                        onClick={() => setSalesViewType('chart')}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Biểu đồ
                      </Button>
                      <Button
                        variant={salesViewType === 'report' ? 'default' : 'outline'}
                        size="sm"
                        className={`flex-1 ${salesViewType === 'report' ? 'bg-blue-600' : ''}`}
                        onClick={() => setSalesViewType('report')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Báo cáo
                      </Button>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Mối quan tâm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <RadioGroup value={salesConcern} onValueChange={(value) => {
                  const newConcern = value as 'time' | 'profit' | 'discount' | 'return' | 'table' | 'category';
                  setSalesConcern(newConcern);
                  // Auto-set to 'report' view for concerns without chart
                  if (newConcern === 'discount' || newConcern === 'return' || newConcern === 'table' || newConcern === 'category') {
                    setSalesViewType('report');
                  }
                }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="time" id="sales-concern-time" />
                    <Label htmlFor="sales-concern-time" className="text-sm text-slate-700 cursor-pointer">
                      Thời gian
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="profit" id="sales-concern-profit" />
                    <Label htmlFor="sales-concern-profit" className="text-sm text-slate-700 cursor-pointer">
                      Lợi nhuận
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="discount" id="sales-concern-discount" />
                    <Label htmlFor="sales-concern-discount" className="text-sm text-slate-700 cursor-pointer">
                      Giảm giá HĐ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="return" id="sales-concern-return" />
                    <Label htmlFor="sales-concern-return" className="text-sm text-slate-700 cursor-pointer">
                      Trả hàng
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="table" id="sales-concern-table" />
                    <Label htmlFor="sales-concern-table" className="text-sm text-slate-700 cursor-pointer">
                      Phòng/Bàn
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="category" id="sales-concern-category" />
                    <Label htmlFor="sales-concern-category" className="text-sm text-slate-700 cursor-pointer">
                      Danh mục hàng hóa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

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

              <Separator />

              {/* Phòng / Bàn */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Phòng / Bàn</h3>
                <div className="space-y-3">
                  <Select value={salesSelectedArea} onValueChange={setSalesSelectedArea}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả khu vực</SelectItem>
                      <SelectItem value="floor1">Tầng 1</SelectItem>
                      <SelectItem value="floor2">Tầng 2</SelectItem>
                      <SelectItem value="outdoor">Khu ngoài trời</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={salesSelectedTable} onValueChange={setSalesSelectedTable}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn phòng/bàn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phòng/bàn</SelectItem>
                      <SelectItem value="table1">Bàn 01</SelectItem>
                      <SelectItem value="table2">Bàn 02</SelectItem>
                      <SelectItem value="table3">Bàn 03</SelectItem>
                      <SelectItem value="vip1">Bàn VIP 1</SelectItem>
                      <SelectItem value="vip2">Bàn VIP 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : activeTab === 'products' ? (
            // PRODUCTS SPECIFIC FILTERS
            <>
              {/* Kiểu hiển thị - chỉ hiển thị khi không phải import-export hoặc write-off */}
              {(productsConcern !== 'import-export' && productsConcern !== 'write-off') && (
                <>
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Kiểu hiển thị</h3>
                <div className="flex gap-2">
                  <Button
                    variant={productsViewType === 'chart' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${productsViewType === 'chart' ? 'bg-blue-600' : ''}`}
                    onClick={() => setProductsViewType('chart')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Biểu đồ
                  </Button>
                  <Button
                    variant={productsViewType === 'report' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${productsViewType === 'report' ? 'bg-blue-600' : ''}`}
                    onClick={() => setProductsViewType('report')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Báo cáo
                  </Button>
                </div>
              </div>

              <Separator />
                </>
              )}

              {/* Mối quan tâm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <RadioGroup value={productsConcern} onValueChange={(value) => setProductsConcern(value as typeof productsConcern)}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="sales" id="products-concern-sales" />
                    <Label htmlFor="products-concern-sales" className="text-sm text-slate-700 cursor-pointer">
                      Bán hàng
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="profit" id="products-concern-profit" />
                    <Label htmlFor="products-concern-profit" className="text-sm text-slate-700 cursor-pointer">
                      Lợi nhuận
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="import-export" id="products-concern-import-export" />
                    <Label htmlFor="products-concern-import-export" className="text-sm text-slate-700 cursor-pointer">
                      Xuất nhập tồn
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="write-off" id="products-concern-write-off" />
                    <Label htmlFor="products-concern-write-off" className="text-sm text-slate-700 cursor-pointer">
                      Xuất hủy
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Thời gian */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
                <RadioGroup value={productsDateRangeType} onValueChange={(value) => setProductsDateRangeType(value as 'preset' | 'custom')}>
                  {/* Preset Time Ranges */}
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="preset" id="products-date-preset" />
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left text-sm"
                            onClick={() => setProductsDateRangeType('preset')}
                          >
                            <span>
                              {productsPresetTimeRange === 'today' && 'Hôm nay'}
                              {productsPresetTimeRange === 'yesterday' && 'Hôm qua'}
                              {productsPresetTimeRange === 'this-week' && 'Tuần này'}
                              {productsPresetTimeRange === 'last-week' && 'Tuần trước'}
                              {productsPresetTimeRange === 'last-7-days' && '7 ngày qua'}
                              {productsPresetTimeRange === 'this-month' && 'Tháng này'}
                              {productsPresetTimeRange === 'last-month' && 'Tháng trước'}
                              {productsPresetTimeRange === 'this-month-lunar' && 'Tháng này (âm lịch)'}
                              {productsPresetTimeRange === 'last-month-lunar' && 'Tháng trước (âm lịch)'}
                              {productsPresetTimeRange === 'last-30-days' && '30 ngày qua'}
                              {productsPresetTimeRange === 'this-quarter' && 'Quý này'}
                              {productsPresetTimeRange === 'last-quarter' && 'Quý trước'}
                              {productsPresetTimeRange === 'this-year' && 'Năm nay'}
                              {productsPresetTimeRange === 'last-year' && 'Năm trước'}
                              {productsPresetTimeRange === 'this-year-lunar' && 'Năm nay (âm lịch)'}
                              {productsPresetTimeRange === 'last-year-lunar' && 'Năm trước (âm lịch)'}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[600px] p-4" align="start">
                          <div className="grid grid-cols-3 gap-6">
                            {/* Column 1: Theo ngày và tuần */}
                            <div>
                              <h4 className="text-sm text-slate-700 mb-3">Theo ngày và tuần</h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'today', label: 'Hôm nay' },
                                  { value: 'yesterday', label: 'Hôm qua' },
                                  { value: 'this-week', label: 'Tuần này' },
                                  { value: 'last-week', label: 'Tuần trước' },
                                  { value: 'last-7-days', label: '7 ngày qua' },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setProductsPresetTimeRange(option.value);
                                      setProductsDateRangeType('preset');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      productsPresetTimeRange === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Column 2: Theo tháng và quý */}
                            <div>
                              <h4 className="text-sm text-slate-700 mb-3">Theo tháng và quý</h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'this-month', label: 'Tháng này' },
                                  { value: 'last-month', label: 'Tháng trước' },
                                  { value: 'this-month-lunar', label: 'Tháng này (âm lịch)' },
                                  { value: 'last-month-lunar', label: 'Tháng trước (âm lịch)' },
                                  { value: 'last-30-days', label: '30 ngày qua' },
                                  { value: 'this-quarter', label: 'Quý này' },
                                  { value: 'last-quarter', label: 'Quý trước' },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setProductsPresetTimeRange(option.value);
                                      setProductsDateRangeType('preset');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      productsPresetTimeRange === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Column 3: Theo năm */}
                            <div>
                              <h4 className="text-sm text-slate-700 mb-3">Theo năm</h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'this-year', label: 'Năm nay' },
                                  { value: 'last-year', label: 'Năm trước' },
                                  { value: 'this-year-lunar', label: 'Năm nay (âm lịch)' },
                                  { value: 'last-year-lunar', label: 'Năm trước (âm lịch)' },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                      setProductsPresetTimeRange(option.value);
                                      setProductsDateRangeType('preset');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      productsPresetTimeRange === option.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="products-date-custom" />
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left text-sm"
                            onClick={() => setProductsDateRangeType('custom')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {productsDateFrom && productsDateTo
                              ? `${format(productsDateFrom, 'dd/MM', { locale: vi })} - ${format(productsDateTo, 'dd/MM/yyyy', { locale: vi })}`
                              : 'Lựa chọn khác'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="start">
                          <div className="flex gap-4">
                            <div>
                              <Label className="text-xs text-slate-600 mb-2 block">Từ ngày</Label>
                              <CalendarComponent
                                mode="single"
                                selected={productsDateFrom}
                                onSelect={(date) => {
                                  if (date) {
                                    setProductsDateFrom(date);
                                    setProductsDateRangeType('custom');
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-600 mb-2 block">Đến ngày</Label>
                              <CalendarComponent
                                mode="single"
                                selected={productsDateTo}
                                onSelect={(date) => {
                                  if (date) {
                                    setProductsDateTo(date);
                                    setProductsDateRangeType('custom');
                                  }
                                }}
                                disabled={(date) => productsDateFrom ? date < productsDateFrom : false}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Tìm kiếm hàng hóa */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Hàng hóa</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Theo tên, mã hàng"
                    value={productsSearchQuery}
                    onChange={(e) => setProductsSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Separator />

              {/* Loại mặt hàng */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Loại mặt hàng</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="product-type-finished"
                      checked={productsProductTypes.includes('finished')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProductsProductTypes([...productsProductTypes, 'finished']);
                        } else {
                          setProductsProductTypes(productsProductTypes.filter(t => t !== 'finished'));
                        }
                      }}
                    />
                    <Label htmlFor="product-type-finished" className="text-sm text-slate-700 cursor-pointer">
                      Hàng hóa bán sẵn
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="product-type-composite"
                      checked={productsProductTypes.includes('composite')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProductsProductTypes([...productsProductTypes, 'composite']);
                        } else {
                          setProductsProductTypes(productsProductTypes.filter(t => t !== 'composite'));
                        }
                      }}
                    />
                    <Label htmlFor="product-type-composite" className="text-sm text-slate-700 cursor-pointer">
                      Hàng hóa cấu thành
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="product-type-ingredient"
                      checked={productsProductTypes.includes('ingredient')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProductsProductTypes([...productsProductTypes, 'ingredient']);
                        } else {
                          setProductsProductTypes(productsProductTypes.filter(t => t !== 'ingredient'));
                        }
                      }}
                    />
                    <Label htmlFor="product-type-ingredient" className="text-sm text-slate-700 cursor-pointer">
                      Nguyên liệu
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danh mục hàng hóa */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Danh mục hàng hóa</h3>
                <RadioGroup value={productsCategory} onValueChange={setProductsCategory}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="all" id="category-all" />
                    <Label htmlFor="category-all" className="text-sm text-slate-700 cursor-pointer">
                      Tất cả
                    </Label>
                  </div>
                  {productCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={cat.id} id={`category-${cat.id}`} />
                      <Label htmlFor={`category-${cat.id}`} className="text-sm text-slate-700 cursor-pointer">
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          ) : (
            // DEFAULT FILTERS FOR OTHER TABS (Finance, Employees, etc.)
            <>
              {/* View Type */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Kiểu hiển thị</h3>
                <div className="flex gap-2">
                  <Button
                    variant={
                      (activeTab === 'finance' && financeViewType === 'chart') ||
                      (activeTab === 'employees' && employeesViewType === 'chart')
                      ? 'default' : 'outline'
                    }
                    size="sm"
                    className={`flex-1 ${
                      (activeTab === 'finance' && financeViewType === 'chart') ||
                      (activeTab === 'employees' && employeesViewType === 'chart')
                      ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => {
                      if (activeTab === 'finance') setFinanceViewType('chart');
                      else if (activeTab === 'employees') setEmployeesViewType('chart');
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Biểu đồ
                  </Button>
                  <Button
                    variant={
                      (activeTab === 'finance' && financeViewType === 'report') ||
                      (activeTab === 'employees' && employeesViewType === 'report')
                      ? 'default' : 'outline'
                    }
                    size="sm"
                    className={`flex-1 ${
                      (activeTab === 'finance' && financeViewType === 'report') ||
                      (activeTab === 'employees' && employeesViewType === 'report')
                      ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => {
                      if (activeTab === 'finance') setFinanceViewType('report');
                      else if (activeTab === 'employees') setEmployeesViewType('report');
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Báo cáo
                  </Button>
                </div>
              </div>

              {activeTab === 'finance' ? (
                <>
                  <Separator />

                  {/* Finance Concerns */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                    <div className="space-y-2">
                      {concernsByTab['finance']?.map((concern) => (
                        <label key={concern.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={selectedFinanceConcerns.includes(concern.id)}
                            onChange={() => {
                              setSelectedFinanceConcerns(prev =>
                                prev.includes(concern.id)
                                  ? prev.filter(c => c !== concern.id)
                                  : [...prev, concern.id]
                              );
                            }}
                          />
                          <span className="text-sm text-slate-700">{concern.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Finance Time Range */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
                    <RadioGroup value={financeDateRangeType} onValueChange={(value) => setFinanceDateRangeType(value as 'preset' | 'custom')}>
                      {/* Preset Time Ranges */}
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="preset" id="finance-date-preset" />
                        <div className="flex-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between text-left text-sm"
                                onClick={() => setFinanceDateRangeType('preset')}
                              >
                                <span>
                                  {financePresetTimeRange === 'today' && 'Hôm nay'}
                                  {financePresetTimeRange === 'yesterday' && 'Hôm qua'}
                                  {financePresetTimeRange === 'this-week' && 'Tuần này'}
                                  {financePresetTimeRange === 'last-week' && 'Tuần trước'}
                                  {financePresetTimeRange === 'this-month' && 'Tháng này'}
                                  {financePresetTimeRange === 'last-month' && 'Tháng trước'}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-4" align="start">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm text-slate-700 mb-3">Theo ngày và tuần</h4>
                                  <div className="space-y-2">
                                    {[
                                      { value: 'today', label: 'Hôm nay' },
                                      { value: 'yesterday', label: 'Hôm qua' },
                                      { value: 'this-week', label: 'Tuần này' },
                                      { value: 'last-week', label: 'Tuần trước' },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          setFinancePresetTimeRange(option.value);
                                          setFinanceDateRangeType('preset');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                          financePresetTimeRange === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm text-slate-700 mb-3">Theo tháng</h4>
                                  <div className="space-y-2">
                                    {[
                                      { value: 'this-month', label: 'Tháng này' },
                                      { value: 'last-month', label: 'Tháng trước' },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          setFinancePresetTimeRange(option.value);
                                          setFinanceDateRangeType('preset');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                          financePresetTimeRange === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="finance-date-custom" />
                        <div className="flex-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left text-sm"
                                onClick={() => setFinanceDateRangeType('custom')}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {financeDateFrom && financeDateTo
                                  ? `${format(financeDateFrom, 'dd/MM', { locale: vi })} - ${format(financeDateTo, 'dd/MM/yyyy', { locale: vi })}`
                                  : 'Lựa chọn khác'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4" align="start">
                              <div className="flex gap-4">
                                <div>
                                  <Label className="text-xs text-slate-600 mb-2 block">Từ ngày</Label>
                                  <CalendarComponent
                                    mode="single"
                                    selected={financeDateFrom}
                                    onSelect={(date) => {
                                      if (date) {
                                        setFinanceDateFrom(date);
                                        setFinanceDateRangeType('custom');
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-600 mb-2 block">Đến ngày</Label>
                                  <CalendarComponent
                                    mode="single"
                                    selected={financeDateTo}
                                    onSelect={(date) => {
                                      if (date) {
                                        setFinanceDateTo(date);
                                        setFinanceDateRangeType('custom');
                                      }
                                    }}
                                    disabled={(date) => financeDateFrom ? date < financeDateFrom : false}
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              ) : activeTab === 'employees' ? (
                <>
                  <Separator />

                  {/* Employee Concerns */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                    <RadioGroup value={employeeConcern} onValueChange={(value) => setEmployeeConcern(value as 'profit' | 'sales-by-employee')}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="profit" id="employee-concern-profit" />
                        <Label htmlFor="employee-concern-profit" className="text-sm text-slate-700 cursor-pointer">
                          Lợi nhuận
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sales-by-employee" id="employee-concern-sales" />
                        <Label htmlFor="employee-concern-sales" className="text-sm text-slate-700 cursor-pointer">
                          Hàng bán theo nhân viên
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Employee Time Range */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
                    <RadioGroup value={employeeDateRangeType} onValueChange={(value) => setEmployeeDateRangeType(value as 'preset' | 'custom')}>
                      {/* Preset Time Ranges */}
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="preset" id="employee-date-preset" />
                        <div className="flex-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between text-left text-sm"
                                onClick={() => setEmployeeDateRangeType('preset')}
                              >
                                <span>
                                  {employeePresetTimeRange === 'today' && 'Hôm nay'}
                                  {employeePresetTimeRange === 'yesterday' && 'Hôm qua'}
                                  {employeePresetTimeRange === 'this-week' && 'Tuần này'}
                                  {employeePresetTimeRange === 'last-week' && 'Tuần trước'}
                                  {employeePresetTimeRange === 'last-7-days' && '7 ngày qua'}
                                  {employeePresetTimeRange === 'this-month' && 'Tháng này'}
                                  {employeePresetTimeRange === 'last-month' && 'Tháng trước'}
                                  {employeePresetTimeRange === 'this-month-lunar' && 'Tháng này (âm lịch)'}
                                  {employeePresetTimeRange === 'last-month-lunar' && 'Tháng trước (âm lịch)'}
                                  {employeePresetTimeRange === 'last-30-days' && '30 ngày qua'}
                                  {employeePresetTimeRange === 'this-quarter' && 'Quý này'}
                                  {employeePresetTimeRange === 'last-quarter' && 'Quý trước'}
                                  {employeePresetTimeRange === 'this-year' && 'Năm nay'}
                                  {employeePresetTimeRange === 'last-year' && 'Năm trước'}
                                  {employeePresetTimeRange === 'this-year-lunar' && 'Năm nay (âm lịch)'}
                                  {employeePresetTimeRange === 'last-year-lunar' && 'Năm trước (âm lịch)'}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[600px] p-4" align="start">
                              <div className="grid grid-cols-3 gap-6">
                                {/* Column 1: Theo ngày và tuần */}
                                <div>
                                  <h4 className="text-sm text-slate-700 mb-3">Theo ngày và tuần</h4>
                                  <div className="space-y-2">
                                    {[
                                      { value: 'today', label: 'Hôm nay' },
                                      { value: 'yesterday', label: 'Hôm qua' },
                                      { value: 'this-week', label: 'Tuần này' },
                                      { value: 'last-week', label: 'Tuần trước' },
                                      { value: 'last-7-days', label: '7 ngày qua' },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          setEmployeePresetTimeRange(option.value);
                                          setEmployeeDateRangeType('preset');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                          employeePresetTimeRange === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Column 2: Theo tháng và quý */}
                                <div>
                                  <h4 className="text-sm text-slate-700 mb-3">Theo tháng và quý</h4>
                                  <div className="space-y-2">
                                    {[
                                      { value: 'this-month', label: 'Tháng này' },
                                      { value: 'last-month', label: 'Tháng trước' },
                                      { value: 'this-month-lunar', label: 'Tháng này (âm lịch)' },
                                      { value: 'last-month-lunar', label: 'Tháng trước (âm lịch)' },
                                      { value: 'last-30-days', label: '30 ngày qua' },
                                      { value: 'this-quarter', label: 'Quý này' },
                                      { value: 'last-quarter', label: 'Quý trước' },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          setEmployeePresetTimeRange(option.value);
                                          setEmployeeDateRangeType('preset');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                          employeePresetTimeRange === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Column 3: Theo năm */}
                                <div>
                                  <h4 className="text-sm text-slate-700 mb-3">Theo năm</h4>
                                  <div className="space-y-2">
                                    {[
                                      { value: 'this-year', label: 'Năm nay' },
                                      { value: 'last-year', label: 'Năm trước' },
                                      { value: 'this-year-lunar', label: 'Năm nay (âm lịch)' },
                                      { value: 'last-year-lunar', label: 'Năm trước (âm lịch)' },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          setEmployeePresetTimeRange(option.value);
                                          setEmployeeDateRangeType('preset');
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                          employeePresetTimeRange === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'text-blue-600 hover:bg-blue-50'
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Custom Date Range */}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="employee-date-custom" />
                        <div className="flex-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left text-sm"
                                onClick={() => setEmployeeDateRangeType('custom')}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {employeeDateFrom && employeeDateTo
                                  ? `${format(employeeDateFrom, 'dd/MM', { locale: vi })} - ${format(employeeDateTo, 'dd/MM/yyyy', { locale: vi })}`
                                  : 'Lựa chọn khác'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4" align="start">
                              <div className="flex gap-4">
                                <div>
                                  <Label className="text-xs text-slate-600 mb-2 block">Từ ngày</Label>
                                  <CalendarComponent
                                    mode="single"
                                    selected={employeeDateFrom}
                                    onSelect={(date) => {
                                      if (date) {
                                        setEmployeeDateFrom(date);
                                        setEmployeeDateRangeType('custom');
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-600 mb-2 block">Đến ngày</Label>
                                  <CalendarComponent
                                    mode="single"
                                    selected={employeeDateTo}
                                    onSelect={(date) => {
                                      if (date) {
                                        setEmployeeDateTo(date);
                                        setEmployeeDateRangeType('custom');
                                      }
                                    }}
                                    disabled={(date) => employeeDateFrom ? date < employeeDateFrom : false}
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                </>
              ) : (
                <>
                  <Separator />

                  {/* Concerns/Interests */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                    <div className="space-y-2">
                      {currentConcerns.map((concern) => (
                        <div key={concern.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`concern-${concern.id}`}
                            checked={selectedConcerns.includes(concern.id)}
                            onCheckedChange={() => handleConcernToggle(concern.id)}
                          />
                          <Label htmlFor={`concern-${concern.id}`} className="text-sm text-slate-700 cursor-pointer">
                            {concern.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Time Range */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Khoảng thời gian</h3>
                    <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`w-full justify-start ${timeRange === 'today' ? 'bg-blue-50 border-blue-200 text-blue-900' : ''}`}
                    onClick={() => setTimeRange('today')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Hôm nay
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`w-full justify-start ${timeRange === 'week' ? 'bg-blue-50 border-blue-200 text-blue-900' : ''}`}
                    onClick={() => setTimeRange('week')}
                  >
                    Tuần này
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`w-full justify-start ${timeRange === 'month' ? 'bg-blue-50 border-blue-200 text-blue-900' : ''}`}
                    onClick={() => setTimeRange('month')}
                  >
                    Tháng này
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Tùy chỉnh
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Quick Search */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm nhanh</h3>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Tìm khách hàng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả nhân viên</SelectItem>
                      <SelectItem value="emp1">Nguyễn Văn A</SelectItem>
                      <SelectItem value="emp2">Trần Thị B</SelectItem>
                      <SelectItem value="emp3">Lê Văn C</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Phương thức TT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                      <SelectItem value="transfer">Chuyển khoản</SelectItem>
                      <SelectItem value="ewallet">Ví điện tử</SelectItem>
                      <SelectItem value="card">Thẻ tín dụng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                </>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-blue-900">Báo cáo</h1>
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
                    <BarChart data={topProductsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        type="number"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        width={150}
                      />
                      <Tooltip 
                        formatter={(value: number) => `${value.toLocaleString()}₫`}
                        contentStyle={{ 
                          backgroundColor: '#eff6ff', 
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[0, 8, 8, 0]} />
                    </BarChart>
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
                    <BarChart data={topProductsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        width={150}
                      />
                      <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }} />
                      <Bar dataKey="sold" fill="#10b981" name="Số lượng bán" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bán chậm */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <AlertTriangle className="w-5 h-5" />
                    Sản phẩm bán chậm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm text-slate-600">Sản phẩm</th>
                          <th className="text-right py-3 px-4 text-sm text-slate-600">Đã bán</th>
                          <th className="text-right py-3 px-4 text-sm text-slate-600">Số ngày không bán</th>
                          <th className="text-center py-3 px-4 text-sm text-slate-600">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slowMovingProducts.map((product, index) => (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="py-3 px-4 text-sm text-slate-900">{product.name}</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900">{product.sold}</td>
                            <td className="text-right py-3 px-4 text-sm text-orange-600">{product.daysNoSale} ngày</td>
                            <td className="text-center py-3 px-4">
                              <Badge className={product.status === 'very-slow' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}>
                                {product.status === 'very-slow' ? 'Rất chậm' : 'Chậm'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Không bán được */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <XCircle className="w-5 h-5" />
                    Sản phẩm không bán được
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm text-slate-600">Sản phẩm</th>
                          <th className="text-left py-3 px-4 text-sm text-slate-600">Lần bán cuối</th>
                          <th className="text-center py-3 px-4 text-sm text-slate-600">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {noSaleProducts.map((product, index) => (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="py-3 px-4 text-sm text-slate-900">{product.name}</td>
                            <td className="py-3 px-4 text-sm text-red-600">{product.lastSale}</td>
                            <td className="text-center py-3 px-4">
                              <Badge className="bg-red-100 text-red-700">Cần xem xét</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* System Suggestions */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Target className="w-5 h-5" />
                    Gợi ý từ hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemSuggestions.map((suggestion, index) => {
                      const Icon = suggestion.icon;
                      const colorClasses = {
                        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                        red: 'bg-red-50 border-red-200 text-red-900',
                        orange: 'bg-orange-50 border-orange-200 text-orange-900',
                        blue: 'bg-blue-50 border-blue-300 text-blue-900',
                      };
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border ${colorClasses[suggestion.color as keyof typeof colorClasses]}`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{suggestion.product}</p>
                              <p className="text-xs mt-1 opacity-80">{suggestion.reason}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                    <BarChart data={topProductsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        type="number"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        width={150}
                      />
                      <Tooltip 
                        formatter={(value: number) => `${value.toLocaleString()}₫`}
                        contentStyle={{ 
                          backgroundColor: '#f0fdf4', 
                          border: '1px solid #86efac',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="profit" fill="#10b981" radius={[0, 8, 8, 0]} />
                    </BarChart>
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
                    <BarChart 
                      data={[...topProductsData].sort((a, b) => 
                        ((b.profit / b.revenue) * 100) - ((a.profit / a.revenue) * 100)
                      )} 
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        width={150}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => {
                          const profitMargin = (props.payload.profit / props.payload.revenue) * 100;
                          return [`${profitMargin.toFixed(2)}%`, 'Tỷ suất LN'];
                        }}
                        contentStyle={{ 
                          backgroundColor: '#eff6ff', 
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey={(item: any) => (item.profit / item.revenue) * 100} 
                        fill="#3b82f6" 
                        radius={[0, 8, 8, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* System Suggestions for Profit */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Target className="w-5 h-5" />
                    Gợi ý từ hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-900">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Cà phê sữa đá</p>
                          <p className="text-xs mt-1 opacity-80">Tỷ suất lợi nhuận cao (66.7%), nên duy trì</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-900">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Trà đào cam sả</p>
                          <p className="text-xs mt-1 opacity-80">Tỷ suất lợi nhuận 63.6%, cân nhắc tăng khuyến mãi</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-50 border-orange-200 text-orange-900">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Sinh tố dâu</p>
                          <p className="text-xs mt-1 opacity-80">Tỷ suất lợi nhuận thấp (55%), cân nhắc tối ưu chi phí</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-300 text-blue-900">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Cà phê đen</p>
                          <p className="text-xs mt-1 opacity-80">Lợi nhuận tốt (70%), dự báo tăng trưởng</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                              <Bar dataKey="profit" fill="#10b981" radius={[0, 8, 8, 0]} />
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
                              <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} />
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
                dateRangeType={dateRangeType}
                selectedDate={selectedDate}
                dateFrom={dateFrom}
                dateTo={dateTo}
                customerSearch={customerSearch}
                productSearch={productSearch}
                selectedCreators={selectedCreators}
                selectedReceivers={selectedReceivers}
                selectedPaymentMethods={selectedPaymentMethods}
                selectedCashflowTypes={selectedCashflowTypes}
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
