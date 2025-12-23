import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Filter, ChevronDown, ChevronRight, Calendar as CalendarIcon, CheckCircle2, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { EmployeeFilter } from '../EmployeeFilter';
import { CategoryFilter } from '../CategoryFilter';
import { CustomerTimeFilter } from './CustomerTimeFilter';

type ConcernType = 'sales' | 'cashflow' | 'products' | 'cancellations' | 'summary';

interface SelectableItem {
  id: string;
  name: string;
  code?: string;
}

export function EndOfDayReport() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [concern, setConcern] = useState<ConcernType>('cashflow');
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 15));
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 9, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 9, 15));
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [selectedReceivers, setSelectedReceivers] = useState<SelectableItem[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<SelectableItem[]>([]);
  const [selectedCashflowTypes, setSelectedCashflowTypes] = useState<string[]>([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState<SelectableItem[]>([]);
  const [selectedCancelers, setSelectedCancelers] = useState<SelectableItem[]>([]);
  const [expandedSalesRows, setExpandedSalesRows] = useState<Set<string>>(new Set());

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (customerSearch) count++;
    if (productSearch) count++;
    if (selectedCreators.length > 0) count++;
    if (selectedReceivers.length > 0) count++;
    if (selectedPaymentMethods.length > 0) count++;
    if (selectedCashflowTypes.length > 0) count++;
    if (selectedProductCategories.length > 0) count++;
    if (selectedCancelers.length > 0) count++;
    return count;
  };

  // Additional state for preset time range
  const [presetTimeRange, setPresetTimeRange] = useState('this-week');

  // Mock data arrays
  const employees = [
    { id: 'emp1', name: 'Nguyễn Văn A - Thu ngân', code: 'NV001' },
    { id: 'emp2', name: 'Trần Thị B - Phục vụ', code: 'NV002' },
    { id: 'emp3', name: 'Lê Văn C - Quản lý', code: 'NV003' },
    { id: 'emp4', name: 'Hương - Kế Toán', code: 'NV004' },
    { id: 'emp5', name: 'Hoàng - Kinh Doanh', code: 'NV005' },
  ];

  const receivers = [
    { id: 'r1', name: 'Nguyễn Văn A' },
    { id: 'r2', name: 'Trần Thị B' },
    { id: 'r3', name: 'Công ty Cà phê' },
    { id: 'r4', name: 'Công ty Điện lực' },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt' },
    { id: 'transfer', name: 'Chuyển khoản' },
    { id: 'ewallet', name: 'Ví điện tử' },
    { id: 'credit', name: 'Thẻ tín dụng' },
  ];

  const cashflowTypes = [
    { id: 'receive-customer', name: 'Thu tiền khách trả' },
    { id: 'pay-supplier', name: 'Chi tiền NCC' },
    { id: 'utilities', name: 'Chi phí điện nước' },
  ];

  const productCategories = [
    { id: 'cat1', name: 'Cà phê' },
    { id: 'cat2', name: 'Trà sữa' },
    { id: 'cat3', name: 'Sinh tố' },
    { id: 'cat4', name: 'Đồ ăn nhẹ' },
  ];

  // Helper functions for multi-select
  const handleMultiSelect = (
    item: SelectableItem,
    selectedItems: SelectableItem[],
    setSelectedItems: (items: SelectableItem[]) => void
  ) => {
    const isSelected = selectedItems.some(s => s.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(s => s.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (
    id: string,
    selectedItems: SelectableItem[],
    setSelectedItems: (items: SelectableItem[]) => void
  ) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };


  // Sample data for cashflow report
  const allCashflowData = [
    {
      id: 'CF001',
      type: 'Thu tiền khách trả',
      typeId: 'receive-customer',
      receiver: 'Nguyễn Văn A',
      creator: 'Hương - Kế Toán',
      creatorId: 'emp4',
      amount: 150000,
      paymentMethod: 'Tiền mặt',
      paymentMethodId: 'cash',
      time: '08:30',
      date: new Date(2025, 9, 15),
      customer: 'Nguyễn Văn B - 0901234567',
      note: 'Hóa đơn #HD-001'
    },
    {
      id: 'CF002',
      type: 'Chi tiền NCC',
      typeId: 'pay-supplier',
      receiver: 'Công ty Cà phê',
      creator: 'Hoàng - Kinh Doanh',
      creatorId: 'emp5',
      amount: -2500000,
      paymentMethod: 'Chuyển khoản',
      paymentMethodId: 'transfer',
      time: '10:15',
      date: new Date(2025, 9, 15),
      customer: '',
      note: 'Nhập hàng tháng 11'
    },
    {
      id: 'CF003',
      type: 'Thu tiền khách trả',
      typeId: 'receive-customer',
      receiver: 'Trần Thị B',
      creator: 'Nguyễn Văn A - Thu ngân',
      creatorId: 'emp1',
      amount: 320000,
      paymentMethod: 'Ví điện tử',
      paymentMethodId: 'ewallet',
      time: '11:45',
      date: new Date(2025, 9, 15),
      customer: 'Trần Thị C - 0912345678',
      note: 'Hóa đơn #HD-015'
    },
    {
      id: 'CF004',
      type: 'Chi phí điện nước',
      typeId: 'utilities',
      receiver: 'Công ty Điện lực',
      creator: 'Hương - Kế Toán',
      creatorId: 'emp4',
      amount: -850000,
      paymentMethod: 'Chuyển khoản',
      paymentMethodId: 'transfer',
      time: '14:20',
      date: new Date(2025, 9, 15),
      customer: '',
      note: 'Tiền điện tháng 11'
    },
    {
      id: 'CF005',
      type: 'Thu tiền khách trả',
      typeId: 'receive-customer',
      receiver: 'Lê Văn D',
      creator: 'Trần Thị B - Phục vụ',
      creatorId: 'emp2',
      amount: 180000,
      paymentMethod: 'Tiền mặt',
      paymentMethodId: 'cash',
      time: '16:00',
      date: new Date(2025, 9, 10),
      customer: 'Phạm Văn E - 0923456789',
      note: 'Hóa đơn #HD-020'
    },
  ];

  // Sample data for products report
  const allProductsData = [
    {
      id: 'SP001',
      code: 'CF-001',
      name: 'Cà phê sữa đá',
      category: 'Cà phê',
      categoryId: 'cat-coffee',
      date: new Date(2025, 9, 15),
      soldQuantity: 45,
      soldAmount: 2700000,
      returnQuantity: 2,
      returnAmount: 120000,
      netRevenue: 2580000,
    },
    {
      id: 'SP002',
      code: 'CF-002',
      name: 'Bạc xỉu',
      category: 'Cà phê',
      categoryId: 'cat-coffee',
      date: new Date(2025, 9, 15),
      soldQuantity: 38,
      soldAmount: 1900000,
      returnQuantity: 0,
      returnAmount: 0,
      netRevenue: 1900000,
    },
    {
      id: 'SP003',
      code: 'TR-001',
      name: 'Trà sữa trân châu',
      category: 'Trà sữa',
      categoryId: 'cat-tea',
      date: new Date(2025, 9, 15),
      soldQuantity: 32,
      soldAmount: 1920000,
      returnQuantity: 1,
      returnAmount: 60000,
      netRevenue: 1860000,
    },
    {
      id: 'SP004',
      code: 'TR-002',
      name: 'Trà đào cam sả',
      category: 'Trà',
      categoryId: 'cat-tea',
      date: new Date(2025, 9, 10),
      soldQuantity: 28,
      soldAmount: 1540000,
      returnQuantity: 0,
      returnAmount: 0,
      netRevenue: 1540000,
    },
  ];

  // Sample data for cancellations report
  const allCancellationsData = [
    {
      id: 'HUY001',
      code: 'HM-001',
      productCode: 'CF-001',
      productName: 'Cà phê sữa đá',
      date: new Date(2025, 9, 15),
      time: '09:15',
      customer: 'Nguyễn Văn A - 0901234567',
      quantity: 2,
      unitPrice: 60000,
      totalValue: 120000,
      canceler: 'Trần Thị B - Phục vụ',
      cancelerId: 'emp2',
      reason: 'Khách đổi ý',
    },
    {
      id: 'HUY002',
      code: 'HM-002',
      productCode: 'TR-001',
      productName: 'Trà sữa trân châu',
      date: new Date(2025, 9, 15),
      time: '14:30',
      customer: 'Trần Thị C - 0912345678',
      quantity: 1,
      unitPrice: 60000,
      totalValue: 60000,
      canceler: 'Nguyễn Văn A - Thu ngân',
      cancelerId: 'emp1',
      reason: 'Pha chế sai',
    },
    {
      id: 'HUY003',
      code: 'HM-003',
      productCode: 'CF-002',
      productName: 'Bạc xỉu',
      date: new Date(2025, 9, 10),
      time: '16:45',
      customer: 'Khách lẻ',
      quantity: 1,
      unitPrice: 50000,
      totalValue: 50000,
      canceler: 'Lê Văn C - Quản lý',
      cancelerId: 'emp3',
      reason: 'Khách không nhận',
    },
  ];

  // Sample data for summary report (based on cashflow data with additional receiver info)
  const allSummaryData = allCashflowData.map(item => ({
    ...item,
    receiverId: item.receiver === 'Nguyễn Văn A' ? 'emp1' : 
                item.receiver === 'Trần Thị B' ? 'emp2' :
                item.receiver === 'Lê Văn D' ? 'emp3' : 'other',
  }));

  // Sample data for sales report with product details
  const allSalesData = [
    {
      id: 'HD-001',
      date: new Date(2025, 9, 15),
      time: '08:30',
      customer: 'Nguyễn Văn A - 0901234567',
      items: 'Cà phê sữa đá x2, Bánh mì',
      total: 150000,
      payment: 'Tiền mặt',
      paymentId: 'cash',
      staff: 'Nguyễn Văn A - Thu ngân',
      staffId: 'emp1',
      orderDetails: [
        { productCode: 'CF-001', productName: 'Cà phê sữa đá', quantity: 2, unitPrice: 60000, amount: 120000 },
        { productCode: 'BM-001', productName: 'Bánh mì', quantity: 1, unitPrice: 30000, amount: 30000 },
      ],
    },
    {
      id: 'HD-002',
      date: new Date(2025, 9, 15),
      time: '10:15',
      customer: 'Trần Thị B - 0912345678',
      items: 'Trà sữa x1, Bánh flan',
      total: 85000,
      payment: 'Chuyển khoản',
      paymentId: 'transfer',
      staff: 'Trần Thị B - Phục vụ',
      staffId: 'emp2',
      orderDetails: [
        { productCode: 'TR-001', productName: 'Trà sữa trân châu', quantity: 1, unitPrice: 60000, amount: 60000 },
        { productCode: 'BF-001', productName: 'Bánh flan', quantity: 1, unitPrice: 25000, amount: 25000 },
      ],
    },
    {
      id: 'HD-003',
      date: new Date(2025, 9, 15),
      time: '11:45',
      customer: 'Lê Văn C - 0923456789',
      items: 'Bạc xỉu x2, Cà phê đen',
      total: 170000,
      payment: 'Ví điện tử',
      paymentId: 'ewallet',
      staff: 'Nguyễn Văn A - Thu ngân',
      staffId: 'emp1',
      orderDetails: [
        { productCode: 'CF-002', productName: 'Bạc xỉu', quantity: 2, unitPrice: 50000, amount: 100000 },
        { productCode: 'CF-003', productName: 'Cà phê đen', quantity: 1, unitPrice: 45000, amount: 45000 },
        { productCode: 'BF-001', productName: 'Bánh flan', quantity: 1, unitPrice: 25000, amount: 25000 },
      ],
    },
    {
      id: 'HD-004',
      date: new Date(2025, 9, 10),
      time: '14:20',
      customer: 'Phạm Thị D - 0934567890',
      items: 'Trà đào cam sả x2',
      total: 110000,
      payment: 'Tiền mặt',
      paymentId: 'cash',
      staff: 'Trần Thị B - Phục vụ',
      staffId: 'emp2',
      orderDetails: [
        { productCode: 'TR-002', productName: 'Trà đào cam sả', quantity: 2, unitPrice: 55000, amount: 110000 },
      ],
    },
  ];

  // Toggle expand/collapse sales row
  const toggleSalesRow = (id: string) => {
    setExpandedSalesRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter cashflow data
  const filteredCashflowData = allCashflowData.filter(item => {
    // Date filter
    if (dateRangeType === 'single') {
      if (item.date.getTime() !== selectedDate.getTime()) return false;
    } else if (dateRangeType === 'range' && dateFrom && dateTo) {
      if (item.date < dateFrom || item.date > dateTo) return false;
    }

    // Customer search filter
    if (customerSearch && !item.customer.toLowerCase().includes(customerSearch.toLowerCase())) {
      return false;
    }

    // Creator filter
    if (selectedCreators.length > 0 && !selectedCreators.some(c => c.id === item.creatorId)) {
      return false;
    }

    // Payment method filter
    if (selectedPaymentMethods.length > 0 && !selectedPaymentMethods.some(p => p.id === item.paymentMethodId)) {
      return false;
    }

    // Cashflow type filter
    if (selectedCashflowTypes.length > 0 && !selectedCashflowTypes.some(t => t.id === item.typeId)) {
      return false;
    }

    return true;
  });

  // Filter sales data
  const filteredSalesData = allSalesData.filter(item => {
    // Date filter
    if (dateRangeType === 'single') {
      if (item.date.getTime() !== selectedDate.getTime()) return false;
    } else if (dateRangeType === 'range' && dateFrom && dateTo) {
      if (item.date < dateFrom || item.date > dateTo) return false;
    }

    // Customer search filter
    if (customerSearch && !item.customer.toLowerCase().includes(customerSearch.toLowerCase())) {
      return false;
    }

    // Creator filter (staff in this case)
    if (selectedCreators.length > 0 && !selectedCreators.some(c => c.id === item.staffId)) {
      return false;
    }

    // Payment method filter
    if (selectedPaymentMethods.length > 0 && !selectedPaymentMethods.some(p => p.id === item.paymentId)) {
      return false;
    }

    return true;
  });

  // Filter products data
  const filteredProductsData = allProductsData.filter(item => {
    // Date filter
    if (dateRangeType === 'single') {
      if (item.date.getTime() !== selectedDate.getTime()) return false;
    } else if (dateRangeType === 'range' && dateFrom && dateTo) {
      if (item.date < dateFrom || item.date > dateTo) return false;
    }

    // Product search filter
    if (productSearch && !item.name.toLowerCase().includes(productSearch.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedProductCategories.length > 0 && !selectedProductCategories.some(c => c.id === item.categoryId)) {
      return false;
    }

    return true;
  });

  // Filter cancellations data
  const filteredCancellationsData = allCancellationsData.filter(item => {
    // Date filter
    if (dateRangeType === 'single') {
      if (item.date.getTime() !== selectedDate.getTime()) return false;
    } else if (dateRangeType === 'range' && dateFrom && dateTo) {
      if (item.date < dateFrom || item.date > dateTo) return false;
    }

    // Customer search filter
    if (customerSearch && !item.customer.toLowerCase().includes(customerSearch.toLowerCase())) {
      return false;
    }

    // Product search filter
    if (productSearch && !item.productName.toLowerCase().includes(productSearch.toLowerCase())) {
      return false;
    }

    // Canceler filter
    if (selectedCancelers.length > 0 && !selectedCancelers.some(c => c.id === item.cancelerId)) {
      return false;
    }

    return true;
  });

  // Filter summary data
  const filteredSummaryData = allSummaryData.filter(item => {
    // Date filter
    if (dateRangeType === 'single') {
      if (item.date.getTime() !== selectedDate.getTime()) return false;
    } else if (dateRangeType === 'range' && dateFrom && dateTo) {
      if (item.date < dateFrom || item.date > dateTo) return false;
    }

    // Receiver filter
    if (selectedReceivers.length > 0 && !selectedReceivers.some(r => r.id === item.receiverId)) {
      return false;
    }

    // Creator filter
    if (selectedCreators.length > 0 && !selectedCreators.some(c => c.id === item.creatorId)) {
      return false;
    }

    return true;
  });

  const getDateRangeDisplay = () => {
    if (dateRangeType === 'single') {
      return format(selectedDate, 'dd/MM/yyyy', { locale: vi });
    } else if (dateFrom && dateTo) {
      return `${format(dateFrom, 'dd/MM/yyyy', { locale: vi })} - ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`;
    }
    return '';
  };

  const renderFilterSummary = () => {
    const filterLines: JSX.Element[] = [];
    
    if (selectedReceivers.length > 0) {
      filterLines.push(
        <p key="receivers" className="text-sm text-slate-600">
          Người nhận đơn: {selectedReceivers.map(r => r.name).join(', ')}
        </p>
      );
    }
    
    if (selectedCreators.length > 0) {
      filterLines.push(
        <p key="creators" className="text-sm text-slate-600">
          Người tạo: {selectedCreators.map(c => c.code ? `${c.code} - ${c.name}` : c.name).join(', ')}
        </p>
      );
    }
    
    if (selectedPaymentMethods.length > 0) {
      filterLines.push(
        <p key="payment" className="text-sm text-slate-600">
          Phương thức thanh toán: {selectedPaymentMethods.map(p => p.name).join(', ')}
        </p>
      );
    }
    
    if (selectedCashflowTypes.length > 0) {
      filterLines.push(
        <p key="cashflow" className="text-sm text-slate-600">
          Loại thu chi: {selectedCashflowTypes.map(t => t.name).join(', ')}
        </p>
      );
    }
    
    if (selectedProductCategories.length > 0) {
      filterLines.push(
        <p key="categories" className="text-sm text-slate-600">
          Danh mục: {selectedProductCategories.map(c => c.name).join(', ')}
        </p>
      );
    }
    
    if (selectedCancelers.length > 0) {
      filterLines.push(
        <p key="cancelers" className="text-sm text-slate-600">
          Người hủy: {selectedCancelers.map(c => c.name).join(', ')}
        </p>
      );
    }
    
    if (customerSearch) {
      filterLines.push(
        <p key="customer" className="text-sm text-slate-600">
          Khách hàng: {customerSearch}
        </p>
      );
    }
    
    if (productSearch) {
      filterLines.push(
        <p key="product" className="text-sm text-slate-600">
          Sản phẩm: {productSearch}
        </p>
      );
    }
    
    if (filterLines.length === 0) return null;
    
    return <>{filterLines}</>;
  };

  const renderContent = () => {
    if (concern === 'cashflow') {
      return (
        <Card>
          <CardContent className="p-0">
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="text-center py-6 border-b">
                <p className="text-sm text-slate-600 mb-2">
                  Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
                <h2 className="text-xl text-slate-900 mb-1">Báo cáo cuối ngày về thu chi</h2>
                <p className="text-sm text-slate-600">
                  {dateRangeType === 'single' ? 'Ngày bán' : 'Khoảng thời gian'}: {getDateRangeDisplay()}
                </p>
                {renderFilterSummary()}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {filteredCashflowData.length === 0 ? (
                  <div className="bg-yellow-50 py-12 text-center">
                    <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Mã phiếu thu / chi</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Loại thu chi</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Người nhận đơn</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Người tạo</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Thu/Chi</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">T.Toán</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Mã chứng từ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-amber-50 border-b border-slate-200">
                        <td colSpan={4} className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng cộng</td>
                        <td className="py-3 px-4 text-sm font-medium">
                          <span className={filteredCashflowData.reduce((sum, item) => sum + item.amount, 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {filteredCashflowData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}₫
                          </span>
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                      {filteredCashflowData.map((item) => (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900">{item.id}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.type}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.receiver}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.creator}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={item.amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}₫
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.time}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.paymentMethod}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="py-4 text-center border-t">
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (concern === 'sales') {
      return (
        <Card>
          <CardContent className="p-0">
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="text-center py-6 border-b">
                <p className="text-sm text-slate-600 mb-2">
                  Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
                <h2 className="text-xl text-slate-900 mb-1">Báo cáo cuối ngày về bán hàng</h2>
                <p className="text-sm text-slate-600">
                  {dateRangeType === 'single' ? 'Ngày bán' : 'Khoảng thời gian'}: {getDateRangeDisplay()}
                </p>
                {renderFilterSummary()}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {filteredSalesData.length === 0 ? (
                  <div className="bg-yellow-50 py-12 text-center">
                    <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="w-10 py-3 px-2"></th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Mã hóa đơn</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Khách hàng</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Sản phẩm</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng tiền</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Thanh toán</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Nhân viên</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-amber-50 border-b border-slate-200">
                        <td></td>
                        <td colSpan={4} className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng cộng ({filteredSalesData.length} hóa đơn)</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredSalesData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}₫
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                      {filteredSalesData.map((item) => (
                        <React.Fragment key={item.id}>
                          <tr 
                            className={`border-b border-slate-200 hover:bg-slate-50 cursor-pointer ${expandedSalesRows.has(item.id) ? 'bg-blue-50' : ''}`}
                            onClick={() => toggleSalesRow(item.id)}
                          >
                            <td className="py-3 px-2 text-center">
                              {expandedSalesRows.has(item.id) ? (
                                <ChevronDown className="w-4 h-4 text-slate-500 inline" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500 inline" />
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-900">{item.id}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{item.time}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{item.customer}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{item.items}</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900">{item.total.toLocaleString()}₫</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{item.payment}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{item.staff}</td>
                          </tr>
                          {expandedSalesRows.has(item.id) && (
                            <tr key={`${item.id}-details`} className="bg-slate-50">
                              <td colSpan={8} className="p-0">
                                <div className="px-8 py-4 border-l-4 border-blue-400 ml-4">
                                  <h4 className="text-sm font-medium text-slate-900 mb-3">Chi tiết hóa đơn</h4>
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-slate-200">
                                        <th className="text-left py-2 px-3 text-xs text-slate-700">Mã SP</th>
                                        <th className="text-left py-2 px-3 text-xs text-slate-700">Tên sản phẩm</th>
                                        <th className="text-right py-2 px-3 text-xs text-slate-700">SL</th>
                                        <th className="text-right py-2 px-3 text-xs text-slate-700">Đơn giá</th>
                                        <th className="text-right py-2 px-3 text-xs text-slate-700">Thành tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.orderDetails.map((detail, idx) => (
                                        <tr key={idx} className="border-b border-slate-200">
                                          <td className="py-2 px-3 text-xs text-slate-600">{detail.productCode}</td>
                                          <td className="py-2 px-3 text-xs text-slate-700">{detail.productName}</td>
                                          <td className="text-right py-2 px-3 text-xs text-slate-700">{detail.quantity}</td>
                                          <td className="text-right py-2 px-3 text-xs text-slate-700">{detail.unitPrice.toLocaleString()}₫</td>
                                          <td className="text-right py-2 px-3 text-xs text-slate-900 font-medium">{detail.amount.toLocaleString()}₫</td>
                                        </tr>
                                      ))}
                                      <tr className="bg-slate-100">
                                        <td colSpan={4} className="py-2 px-3 text-xs text-slate-900 font-medium text-right">Tổng cộng:</td>
                                        <td className="text-right py-2 px-3 text-xs text-slate-900 font-bold">{item.total.toLocaleString()}₫</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="py-4 text-center border-t">
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (concern === 'products') {
      return (
        <Card>
          <CardContent className="p-0">
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="text-center py-6 border-b">
                <p className="text-sm text-slate-600 mb-2">
                  Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
                <h2 className="text-xl text-slate-900 mb-1">Báo cáo cuối ngày về hàng hóa</h2>
                <p className="text-sm text-slate-600">
                  {dateRangeType === 'single' ? 'Ngày bán' : 'Khoảng thời gian'}: {getDateRangeDisplay()}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {filteredProductsData.length === 0 ? (
                  <div className="bg-yellow-50 py-12 text-center">
                    <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Mã sản phẩm</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Danh mục</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Ngày bán</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Số lượng bán</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Số lượng trả lại</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Tiền trả lại</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu ròng</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-amber-50 border-b border-slate-200">
                        <td colSpan={4} className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng cộng ({filteredProductsData.length} sản phẩm)</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredProductsData.reduce((sum, item) => sum + item.soldQuantity, 0).toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredProductsData.reduce((sum, item) => sum + item.soldAmount, 0).toLocaleString()}₫
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredProductsData.reduce((sum, item) => sum + item.returnQuantity, 0).toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredProductsData.reduce((sum, item) => sum + item.returnAmount, 0).toLocaleString()}₫
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredProductsData.reduce((sum, item) => sum + item.netRevenue, 0).toLocaleString()}₫
                        </td>
                      </tr>
                      {filteredProductsData.map((item) => (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900">{item.code}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.name}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.category}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{format(item.date, 'dd/MM/yyyy', { locale: vi })}</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.soldQuantity.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.soldAmount.toLocaleString()}₫</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.returnQuantity.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.returnAmount.toLocaleString()}₫</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.netRevenue.toLocaleString()}₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="py-4 text-center border-t">
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (concern === 'cancellations') {
      return (
        <Card>
          <CardContent className="p-0">
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="text-center py-6 border-b">
                <p className="text-sm text-slate-600 mb-2">
                  Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
                <h2 className="text-xl text-slate-900 mb-1">Báo cáo cuối ngày về hủy món</h2>
                <p className="text-sm text-slate-600">
                  {dateRangeType === 'single' ? 'Ngày bán' : 'Khoảng thời gian'}: {getDateRangeDisplay()}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {filteredCancellationsData.length === 0 ? (
                  <div className="bg-yellow-50 py-12 text-center">
                    <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Mã hủy</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Mã sản phẩm</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Ngày hủy</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Khách hàng</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Số lượng</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Đơn giá</th>
                        <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng tiền</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Người hủy</th>
                        <th className="text-left py-3 px-4 text-sm text-slate-900">Lý do</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-amber-50 border-b border-slate-200">
                        <td colSpan={6} className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng cộng ({filteredCancellationsData.length} đơn hủy)</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredCancellationsData.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredCancellationsData.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}₫
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                      {filteredCancellationsData.map((item) => (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900">{item.code}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.productCode}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.productName}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{format(item.date, 'dd/MM/yyyy', { locale: vi })}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.time}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.customer}</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.quantity.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.unitPrice.toLocaleString()}₫</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.totalValue.toLocaleString()}₫</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.canceler}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="py-4 text-center border-t">
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (concern === 'summary') {
      // Calculate summary data
      const cashflowByCashMethod = filteredSummaryData.reduce((acc, item) => {
        const method = item.paymentMethodId;
        if (!acc[method]) acc[method] = 0;
        acc[method] += item.amount;
        return acc;
      }, {} as Record<string, number>);

      const salesByCashMethod = filteredSalesData.reduce((acc, item) => {
        const method = item.paymentId;
        if (!acc[method]) acc[method] = { count: 0, total: 0 };
        acc[method].count += 1;
        acc[method].total += item.total;
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

      const totalSalesValue = filteredSalesData.reduce((sum, item) => sum + item.total, 0);
      const totalSalesCount = filteredSalesData.length;
      const totalProductItems = filteredProductsData.reduce((sum, item) => sum + item.soldQuantity, 0);
      const totalProductTypes = filteredProductsData.length;

      return (
        <Card>
          <CardContent className="p-0">
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="text-center py-6 border-b">
                <p className="text-sm text-slate-600 mb-2">
                  Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
                <h2 className="text-xl text-slate-900 mb-1">Báo cáo tổng hợp</h2>
                <p className="text-sm text-slate-600">
                  {dateRangeType === 'single' ? 'Ngày bán' : 'Khoảng thời gian'}: {getDateRangeDisplay()}
                </p>
              </div>

              <div className="p-6 space-y-8">
                {/* Tổng kết thu chi */}
                <div>
                  <h3 className="text-slate-900 mb-3">Tổng kết thu chi</h3>
                  <div className="overflow-x-auto">
                    {filteredSummaryData.length === 0 ? (
                      <div className="bg-yellow-50 py-8 text-center rounded">
                        <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                      </div>
                    ) : (
                      <table className="w-full border border-slate-200">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Thu / Chi</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Tiền mặt</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">CK</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Thẻ</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Ví điện tử</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Điểm</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng thực thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-amber-50 border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">Tổng</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(cashflowByCashMethod['cash'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(cashflowByCashMethod['transfer'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(cashflowByCashMethod['card'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(cashflowByCashMethod['ewallet'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(cashflowByCashMethod['points'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                              {filteredSummaryData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}₫
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Tổng thu chi</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(cashflowByCashMethod['cash'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(cashflowByCashMethod['transfer'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(cashflowByCashMethod['card'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(cashflowByCashMethod['ewallet'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(cashflowByCashMethod['points'] || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-emerald-600">
                              {filteredSummaryData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}₫
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Tổng kết bán hàng */}
                <div>
                  <h3 className="text-slate-900 mb-3">Tổng kết bán hàng</h3>
                  <div className="overflow-x-auto">
                    {filteredSalesData.length === 0 ? (
                      <div className="bg-yellow-50 py-8 text-center rounded">
                        <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                      </div>
                    ) : (
                      <table className="w-full border border-slate-200">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Giao dịch</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Giá trị</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Tiền mặt</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">CK</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Thẻ</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Điểm</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Ví điện tử</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng thực thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-amber-50 border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">Tổng</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {totalSalesValue.toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['cash']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['transfer']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['card']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['points']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['ewallet']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                              {totalSalesValue.toLocaleString()}₫
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Bán hàng</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {totalSalesValue.toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['cash']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['transfer']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['card']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['points']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['ewallet']?.total || 0).toLocaleString()}₫
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-emerald-600">
                              {totalSalesValue.toLocaleString()}₫
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Số giao dịch */}
                <div>
                  <h3 className="text-slate-900 mb-3">Số giao dịch</h3>
                  <div className="overflow-x-auto">
                    {filteredSalesData.length === 0 ? (
                      <div className="bg-yellow-50 py-8 text-center rounded">
                        <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                      </div>
                    ) : (
                      <table className="w-full border border-slate-200">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Giao dịch</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Số giao dịch</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Tiền mặt</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">CK</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Thẻ</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Điểm</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900">Ví điện tử</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-amber-50 border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">Tổng</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {totalSalesCount.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['cash']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['transfer']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['card']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {(salesByCashMethod['points']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                              {(salesByCashMethod['ewallet']?.count || 0).toLocaleString()}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Bán hàng</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {totalSalesCount.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['cash']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['transfer']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['card']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {(salesByCashMethod['points']?.count || 0).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900">
                              {(salesByCashMethod['ewallet']?.count || 0).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Hàng hóa */}
                <div>
                  <h3 className="text-slate-900 mb-3">Hàng hóa</h3>
                  <div className="overflow-x-auto">
                    {filteredProductsData.length === 0 ? (
                      <div className="bg-yellow-50 py-8 text-center rounded">
                        <p className="text-slate-600 italic">Báo cáo không có dữ liệu</p>
                      </div>
                    ) : (
                      <table className="w-full border border-slate-200">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Giao dịch</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Số mặt hàng</th>
                            <th className="text-right py-3 px-4 text-sm text-slate-900">SL Sản phẩm</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-amber-50 border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">Tổng</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium border-r border-slate-200">
                              {totalProductTypes.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                              {totalProductItems.toLocaleString()}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-3 px-4 text-sm text-slate-900 border-r border-slate-200">Bán hàng</td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900 border-r border-slate-200">
                              {totalProductTypes.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-900">
                              {totalProductItems.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="py-4 text-center border-t">
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="w-full p-8 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
            {isFilterOpen ? (
              <ChevronRight className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>

        {isFilterOpen && (
          <div className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mối quan tâm */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <Select value={concern} onValueChange={(value) => setConcern(value as ConcernType)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Bán hàng</SelectItem>
                    <SelectItem value="cashflow">Thu chi</SelectItem>
                    <SelectItem value="products">Hàng hóa</SelectItem>
                    <SelectItem value="cancellations">Hủy món</SelectItem>
                    <SelectItem value="summary">Tổng hợp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thời gian - This will span full width when shown */}
              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
                <CustomerTimeFilter
                  dateRangeType={dateRangeType}
                  timePreset={presetTimeRange}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateRangeTypeChange={setDateRangeType}
                  onTimePresetChange={setPresetTimeRange}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                />
              </div>

              {/* Conditional Filters based on Concern */}
              {concern === 'products' && (
                <>
                  {/* Tìm kiếm hàng hóa */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm hàng hóa</h3>
                    <Input
                      placeholder="Theo tên, mã hàng"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="text-sm bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>

                  {/* Chọn loại hàng */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Chọn loại hàng</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
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

              {concern === 'cancellations' && (
                <>
                  {/* Tìm kiếm khách hàng */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm khách hàng</h3>
                    <Input
                      placeholder="Theo mã, tên, điện thoại"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="text-sm bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>

                  {/* Tìm kiếm hàng hóa */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Tìm kiếm hàng hóa</h3>
                    <Input
                      placeholder="Theo tên, mã hàng"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="text-sm bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>

                  {/* Nhân viên hủy */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Nhân viên hủy</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
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
                              <span className="text-sm text-slate-900">{emp.code ? `${emp.code} - ${emp.name}` : emp.name}</span>
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

              {concern === 'summary' && (
                <>
                  {/* Người nhận đơn */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Người nhận đơn</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
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

                  {/* Người tạo */}
                  <div>
                    <EmployeeFilter
                      employees={employees}
                      selectedEmployeeIds={selectedCreators}
                      onSelectionChange={setSelectedCreators}
                      label="Người tạo"
                      placeholder="Tìm người tạo..."
                    />
                  </div>
                </>
              )}

              {(concern === 'sales' || concern === 'cashflow') && (
                <>
                  {/* Khách hàng */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Khách hàng</h3>
                    <Input
                      placeholder="Theo mã, tên, điện thoại"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="text-sm bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>

                  {/* Người tạo */}
                  <div>
                    <EmployeeFilter
                      employees={employees}
                      selectedEmployeeIds={selectedCreators}
                      onSelectionChange={setSelectedCreators}
                      label="Người tạo"
                      placeholder="Tìm người tạo..."
                    />
                  </div>

                  {/* Phương thức thanh toán */}
                  <div>
                    <h3 className="text-sm text-slate-900 mb-3">Phương thức thanh toán</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left border border-slate-300 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-auto min-h-[40px]">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {selectedPaymentMethods.length > 0 ? (
                              selectedPaymentMethods.map((item) => {
                                const method = paymentMethods.find(m => m.id === item.id);
                                return (
                                  <Badge
                                    key={item.id}
                                    variant="secondary"
                                    className="bg-slate-200 text-slate-900 pr-1 text-xs"
                                  >
                                    {method?.name || item.name}
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
                                );
                              })
                            ) : (
                              <span className="text-slate-500 text-sm">Chọn phương thức thanh toán</span>
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

                  {concern === 'cashflow' && (
                    <>
                      {/* Loại thu chi */}
                      <div>
                        <CategoryFilter
                          categories={cashflowTypes}
                          selectedCategoryNames={selectedCashflowTypes}
                          onSelectionChange={setSelectedCashflowTypes}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Clear Filters Button */}
            {getActiveFilterCount() > 0 && (
              <div className="pt-4 border-t border-slate-200 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCustomerSearch('');
                    setProductSearch('');
                    setSelectedCreators([]);
                    setSelectedReceivers([]);
                    setSelectedPaymentMethods([]);
                    setSelectedCashflowTypes([]);
                    setSelectedProductCategories([]);
                    setSelectedCancelers([]);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Content */}
      {renderContent()}
    </div>
  );
}