import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type ConcernType = 'sales' | 'cashflow' | 'products' | 'cancellations' | 'summary';
type DateRangeType = 'single' | 'range';

interface SelectableItem {
  id: string;
  name: string;
}

interface EndOfDayReportProps {
  concern: ConcernType;
  dateRangeType: DateRangeType;
  selectedDate: Date;
  dateFrom?: Date;
  dateTo?: Date;
  customerSearch: string;
  productSearch: string;
  selectedCreators: SelectableItem[];
  selectedReceivers: SelectableItem[];
  selectedPaymentMethods: SelectableItem[];
  selectedCashflowTypes: SelectableItem[];
  selectedProductCategories: SelectableItem[];
  selectedCancelers: SelectableItem[];
}

export function EndOfDayReport({ 
  concern,
  dateRangeType,
  selectedDate,
  dateFrom,
  dateTo,
  customerSearch,
  productSearch,
  selectedCreators,
  selectedReceivers,
  selectedPaymentMethods,
  selectedCashflowTypes,
  selectedProductCategories,
  selectedCancelers
}: EndOfDayReportProps) {
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

  // Sample data for sales report
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
    },
  ];

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
          Người tạo: {selectedCreators.map(c => c.name).join(', ')}
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
                        <td colSpan={4} className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng cộng ({filteredSalesData.length} hóa đơn)</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredSalesData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}₫
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                      {filteredSalesData.map((item) => (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900">{item.id}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.time}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.customer}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.items}</td>
                          <td className="text-right py-3 px-4 text-sm text-slate-900">{item.total.toLocaleString()}₫</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.payment}</td>
                          <td className="py-3 px-4 text-sm text-slate-700">{item.staff}</td>
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
                        <td colSpan={5} className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng cộng ({filteredProductsData.length} sản phẩm)</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                          {filteredProductsData.reduce((sum, item) => sum + item.soldAmount, 0).toLocaleString()}₫
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
    <div className="w-full">
      {renderContent()}
    </div>
  );
}