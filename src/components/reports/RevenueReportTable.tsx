import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RevenueReportTableProps {
  revenueSummary: {
    totalRevenue: number;
    discounts: number;
    canceledOrders: number;
    netRevenue: number;
    totalOrders: number;
    canceledOrdersCount: number;
    itemsSold: number;
    avgOrderValue: number;
  };
  revenueByProductData: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  paymentMethodData: Array<{
    name: string;
    amount: number;
    value: number;
  }>;
}

export function RevenueReportTable({
  revenueSummary,
  revenueByProductData,
  paymentMethodData
}: RevenueReportTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="text-center py-6 border-b">
            <p className="text-sm text-slate-600 mb-2">
              Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
            <h2 className="text-xl text-slate-900 mb-1">Báo cáo doanh thu</h2>
            <p className="text-sm text-slate-600">
              Tuần này (24/11/2025 - 27/11/2025)
            </p>
          </div>

          {/* Summary Section */}
          <div className="border-b">
            <div className="bg-blue-50 py-3 px-4 border-b border-blue-200">
              <h3 className="text-sm text-slate-900">Tổng quan doanh thu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900">Tổng doanh thu</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {revenueSummary.totalRevenue.toLocaleString()}₫
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">Giảm giá</td>
                    <td className="py-3 px-4 text-sm text-red-600 text-right">
                      -{revenueSummary.discounts.toLocaleString()}₫
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900">Đơn hủy</td>
                    <td className="py-3 px-4 text-sm text-red-600 text-right">
                      -{revenueSummary.canceledOrders.toLocaleString()}₫
                    </td>
                  </tr>
                  <tr className="border-b-2 border-slate-300 bg-blue-50">
                    <td className="py-3 px-4 text-sm text-blue-900">Doanh thu thuần</td>
                    <td className="py-3 px-4 text-sm text-blue-900 text-right">
                      {revenueSummary.netRevenue.toLocaleString()}₫
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900">Tổng số đơn</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {revenueSummary.totalOrders} đơn
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">Số đơn hủy</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {revenueSummary.canceledOrdersCount} đơn
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900">Số món bán ra</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {revenueSummary.itemsSold} món
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">Giá trị đơn TB</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {revenueSummary.avgOrderValue.toLocaleString()}₫
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue by Product */}
          <div className="border-b">
            <div className="bg-blue-50 py-3 px-4 border-b border-blue-200">
              <h3 className="text-sm text-slate-900">Doanh thu theo sản phẩm</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">STT</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Số lượng</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByProductData.map((product, index) => (
                    <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? '' : 'bg-slate-50'}`}>
                      <td className="py-3 px-4 text-sm text-slate-900">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-slate-900">{product.name}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {product.orders}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {product.revenue.toLocaleString()}₫
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-4 text-sm text-blue-900">
                      Tổng cộng
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {revenueByProductData.reduce((sum, p) => sum + p.orders, 0)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {revenueByProductData.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}₫
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <div className="bg-blue-50 py-3 px-4 border-b border-blue-200">
              <h3 className="text-sm text-slate-900">Phân bổ theo phương thức thanh toán</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Phương thức</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Tỷ lệ</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethodData.map((method, index) => (
                    <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? '' : 'bg-slate-50'}`}>
                      <td className="py-3 px-4 text-sm text-slate-900">{method.name}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {method.value}%
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {method.amount.toLocaleString()}₫
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 border-t-2 border-slate-300">
                    <td className="py-3 px-4 text-sm text-blue-900">
                      Tổng cộng
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      100%
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {paymentMethodData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}₫
                    </td>
                  </tr>
                </tbody>
              </table>
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
