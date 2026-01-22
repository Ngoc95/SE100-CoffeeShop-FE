import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { EmployeeFilter } from '../EmployeeFilter';
import { CustomerTimeFilter } from './CustomerTimeFilter';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { getEndOfDayReport, EndOfDayConcern } from '../../api/statistics/endOfDayStatistics';
import { toast } from 'sonner';
import staffApi from '../../api/staffApi';
import { convertPresetToDateRange } from '../../utils/timePresets';

type ConcernType = 'sales' | 'cashflow' | 'products' | 'cancellations';

export function EndOfDayStatistics() {
  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [concern, setConcern] = useState<ConcernType>('sales');
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [timePreset, setTimePreset] = useState('today');
  const today = new Date();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(today);
  const [dateTo, setDateTo] = useState<Date | undefined>(today);

  // Common filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // UI states
  const [expandedSalesRows, setExpandedSalesRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; code?: string }>>([]);

  // Payment methods from backend enum
  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt' },
    { id: 'bank_transfer', name: 'Chuyển khoản' },
    { id: 'e_wallet', name: 'Ví điện tử' },
    { id: 'card', name: 'Thẻ' },
  ];

  // Convert time preset to dates when preset changes
  useEffect(() => {
    if (dateRangeType === 'preset' && timePreset) {
      const { from, to } = convertPresetToDateRange(timePreset as any);
      setDateFrom(from);
      setDateTo(to);
    }
  }, [dateRangeType, timePreset]);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await staffApi.getAll({ limit: 100 });
        const data = response.data as any;
        console.log('Staff API response:', data);
        if (data?.metaData?.staffs) {
          const sortedStaffs = data.metaData.staffs.map((staff: any) => ({
            id: staff.id.toString(),
            name: staff.fullName,
            code: staff.code
          })).sort((a: any, b: any) => {
            const codeA = a.code || '';
            const codeB = b.code || '';
            return codeA.localeCompare(codeB, 'vi', { numeric: true });
          });
          setEmployees(sortedStaffs);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Lỗi khi tải danh sách nhân viên');
      }
    };

    fetchEmployees();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchReport();
    }
  }, [concern, dateFrom, dateTo, customerSearch, productSearch, selectedStaffIds, selectedPaymentMethods, selectedCategoryIds]);

  const fetchReport = async () => {
    if (!dateFrom || !dateTo) return;

    setLoading(true);
    try {
      const concernMap: Record<ConcernType, EndOfDayConcern> = {
        sales: 'sales',
        cashflow: 'revenue_expenses',
        products: 'inventory',
        cancellations: 'cancelled_items'
      };

      const params: any = {
        concern: concernMap[concern],
        startDate: format(dateFrom, 'yyyy-MM-dd'),
        endDate: format(dateTo, 'yyyy-MM-dd'),
      };

      // Add concern-specific filters
      if (concern === 'sales' || concern === 'cancellations') {
        if (customerSearch) params.customerSearch = customerSearch;
        if (selectedStaffIds.length > 0) params.staffIds = selectedStaffIds.map(Number);
        if (selectedPaymentMethods.length > 0 && concern === 'sales') {
          params.paymentMethods = selectedPaymentMethods;
        }
        if (productSearch && concern === 'cancellations') {
          params.productSearch = productSearch;
        }
      }

      if (concern === 'cashflow') {
        if (customerSearch) params.customerSearch = customerSearch;
        if (selectedStaffIds.length > 0) params.staffIds = selectedStaffIds.map(Number);
        if (selectedPaymentMethods.length > 0) params.paymentMethods = selectedPaymentMethods;
        if (selectedCategoryIds.length > 0) params.categoryIds = selectedCategoryIds.map(Number);
      }

      if (concern === 'products') {
        if (productSearch) params.productSearch = productSearch;
        if (selectedCategoryIds.length > 0) params.categoryIds = selectedCategoryIds.map(Number);
      }

      const response = await getEndOfDayReport(params);
      setReportData(response.metaData);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

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

  const getActiveFilterCount = () => {
    let count = 0;
    if (customerSearch) count++;
    if (productSearch) count++;
    if (selectedStaffIds.length > 0) count++;
    if (selectedPaymentMethods.length > 0) count++;
    if (selectedCategoryIds.length > 0) count++;
    return count;
  };

  const clearFilters = () => {
    setCustomerSearch('');
    setProductSearch('');
    setSelectedStaffIds([]);
    setSelectedPaymentMethods([]);
    setSelectedCategoryIds([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const getConcernLabel = () => {
    switch (concern) {
      case 'sales': return 'bán hàng';
      case 'cashflow': return 'thu chi';
      case 'products': return 'hàng hóa';
      case 'cancellations': return 'hủy món';
      default: return '';
    }
  };

  const getPaymentMethodName = (method: string | null | undefined) => {
    if (!method) return 'N/A';
    const normalizedMethod = method.toUpperCase();
    switch (normalizedMethod) {
      case 'CASH': return 'Tiền mặt';
      case 'TRANSFER':
      case 'BANK_TRANSFER':
      case 'BANK': return 'Chuyển khoản';
      case 'CARD': return 'Thẻ';
      case 'E_WALLET': return 'Ví điện tử';
      default: return method;
    }
  };

  // Render functions for each concern will be added here
  const renderSalesReport = () => {
    if (!reportData?.invoices) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="w-10 py-3 px-2"></th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã hóa đơn</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Khách hàng</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng tiền</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thanh toán</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Nhân viên</th>
            </tr>
          </thead>
          <tbody>
            {reportData.invoices.map((invoice: any) => {
              const isExpanded = expandedSalesRows.has(invoice.orderCode);
              return (
                <>
                  <tr
                    key={invoice.orderCode}
                    className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleSalesRow(invoice.orderCode)}
                  >
                    <td className="py-3 px-2 text-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 inline" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 inline" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{invoice.orderCode}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {format(new Date(invoice.completedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {invoice.customer ? `${invoice.customer.name} - ${invoice.customer.phone}` : 'Khách lẻ'}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{getPaymentMethodName(invoice.paymentMethod)}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {invoice.staff ? `${invoice.staff.name} - ${invoice.staff.code}` : 'N/A'}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="p-0">
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
                              {invoice.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-slate-200">
                                  <td className="py-2 px-3 text-xs text-slate-600">{item.productCode}</td>
                                  <td className="py-2 px-3 text-xs text-slate-700">{item.productName}</td>
                                  <td className="text-right py-2 px-3 text-xs text-slate-700">{item.quantity}</td>
                                  <td className="text-right py-2 px-3 text-xs text-slate-700">{formatCurrency(item.unitPrice)}</td>
                                  <td className="text-right py-2 px-3 text-xs text-slate-900 font-medium">{formatCurrency(item.totalPrice)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCashflowReport = () => {
    if (!reportData?.transactions) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã phiếu</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Loại thu chi</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Người nhận</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Người tạo</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Số tiền</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {reportData.transactions.map((tx: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-900">{tx.code}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{tx.category.name}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{tx.personReceiving || 'N/A'}</td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {tx.creator ? `${tx.creator.name} - ${tx.creator.code}` : 'N/A'}
                </td>
                <td className="text-right py-3 px-4 text-sm">
                  <span className={tx.category.type === 'Thu' ? 'text-emerald-600' : 'text-red-600'}>
                    {tx.category.type === 'Thu' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {format(new Date(tx.transactionDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">{getPaymentMethodName(tx.paymentMethod)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProductsReport = () => {
    if (!reportData?.products) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã SP</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Danh mục</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">SL bán</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">SL trả</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu thuần</th>
            </tr>
          </thead>
          <tbody>
            {reportData.totals && (
              <tr className="bg-amber-50 border-b border-slate-200">
                <td colSpan={3} className="py-3 px-4 text-sm text-slate-900 font-medium">Tổng cộng</td>
                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{reportData.totals.totalQuantitySold}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(reportData.totals.totalRevenue)}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{reportData.totals.totalQuantityReturned}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(reportData.totals.totalReturnAmount)}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">{formatCurrency(reportData.totals.totalNetRevenue)}</td>
              </tr>
            )}
            {reportData.products.map((product: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-900">{product.productCode}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{product.productName}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{product.categoryName || 'N/A'}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-700">{product.quantitySold}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(product.revenue)}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-700">{product.quantityReturned}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(product.returnAmount)}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-900">{formatCurrency(product.netRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCancellationsReport = () => {
    if (!reportData?.items) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã hóa đơn</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Mã SP</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Thời gian</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Khách hàng</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">SL</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Đơn giá</th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">Thành tiền</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Người hủy</th>
              <th className="text-left py-3 px-4 text-sm text-slate-900">Lý do</th>
            </tr>
          </thead>
          <tbody>
            {reportData.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-900">{item.orderCode}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{item.productCode}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{item.productName}</td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {format(new Date(item.cancelledAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {item.customer ? `${item.customer.name} - ${item.customer.phone}` : 'Khách lẻ'}
                </td>
                <td className="text-right py-3 px-4 text-sm text-slate-700">{item.quantity}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-700">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right py-3 px-4 text-sm text-slate-900">{formatCurrency(item.totalPrice)}</td>
                <td className="py-3 px-4 text-sm text-slate-700">
                  {item.staff ? `${item.staff.name} - ${item.staff.code}` : 'N/A'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">{item.reason || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full p-8 space-y-6">
      {/* Filter Panel */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className="gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
            {getActiveFilterCount() > 0 && <Badge variant="secondary" className="ml-2">{getActiveFilterCount()}</Badge>}
            {isFilterOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          {getActiveFilterCount() > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {isFilterOpen && (
          <div className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Concern Selector */}
              <div>
                <h3 className="text-sm text-slate-900 mb-3">Mối quan tâm</h3>
                <Select value={concern} onValueChange={(value: string) => setConcern(value as ConcernType)}>
                  <SelectTrigger className="w-full bg-white border border-slate-300">
                    <SelectValue placeholder="Chọn mối quan tâm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Bán hàng</SelectItem>
                    <SelectItem value="cashflow">Thu chi</SelectItem>
                    <SelectItem value="products">Hàng hóa</SelectItem>
                    <SelectItem value="cancellations">Hủy món</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Filter */}
              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
                <CustomerTimeFilter
                  dateRangeType={dateRangeType}
                  timePreset={timePreset}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateRangeTypeChange={setDateRangeType}
                  onTimePresetChange={setTimePreset}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                />
              </div>

              {/* Customer Search - for sales, cashflow, cancellations */}
              {(concern === 'sales' || concern === 'cashflow' || concern === 'cancellations') && (
                <div>
                  <h3 className="text-sm text-slate-900 mb-3">Tìm khách hàng</h3>
                  <Input
                    placeholder="Tìm theo tên, SĐT..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="bg-white border-slate-300"
                  />
                </div>
              )}

              {/* Product Search - for products, cancellations */}
              {(concern === 'products' || concern === 'cancellations') && (
                <div>
                  <h3 className="text-sm text-slate-900 mb-3">Tìm sản phẩm</h3>
                  <Input
                    placeholder="Tìm theo mã, tên..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-white border-slate-300"
                  />
                </div>
              )}

              {/* Staff Filter - for sales, cashflow, cancellations */}
              {(concern === 'sales' || concern === 'cashflow' || concern === 'cancellations') && (
                <div>
                  <EmployeeFilter
                    employees={employees}
                    selectedEmployeeIds={selectedStaffIds}
                    onSelectionChange={setSelectedStaffIds}
                    label="Nhân viên"
                    placeholder="Tìm nhân viên..."
                  />
                </div>
              )}

              {/* Payment Method - for sales, cashflow */}
              {(concern === 'sales' || concern === 'cashflow') && (
                <div>
                  <MultiSelectFilter
                    items={paymentMethods}
                    selectedIds={selectedPaymentMethods}
                    onSelectionChange={(ids) => setSelectedPaymentMethods(ids as string[])}
                    label="Phương thức thanh toán"
                    placeholder="Chọn phương thức..."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="text-center py-6 border-b">
          <p className="text-sm text-slate-600 mb-2">
            Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </p>
          <h2 className="text-xl text-slate-900 mb-1">
            Báo cáo cuối ngày về {getConcernLabel()}
          </h2>
          {dateFrom && dateTo && (
            <p className="text-sm text-slate-600">
              Từ ngày {format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày {format(dateTo, 'dd/MM/yyyy', { locale: vi })}
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-slate-600">Đang tải dữ liệu...</p>
          </div>
        ) : !reportData ? (
          <div className="py-12 text-center">
            <p className="text-slate-600 italic">Chưa có dữ liệu</p>
          </div>
        ) : (
          <>
            {concern === 'sales' && renderSalesReport()}
            {concern === 'cashflow' && renderCashflowReport()}
            {concern === 'products' && renderProductsReport()}
            {concern === 'cancellations' && renderCancellationsReport()}
          </>
        )}
      </div>
    </div>
  );
}