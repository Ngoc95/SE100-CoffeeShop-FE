import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ProductsReportTableProps {
  topProductsData: Array<{
    name: string;
    sold: number;
    revenue: number;
    cost: number;
    profit: number;
    trend: string;
  }>;
  slowMovingProducts: Array<{
    name: string;
    sold: number;
    daysNoSale: number;
    status: string;
  }>;
  noSaleProducts: Array<{
    name: string;
    lastSale: string;
    status: string;
  }>;
}

export function ProductsReportTable({
  topProductsData,
  slowMovingProducts,
  noSaleProducts
}: ProductsReportTableProps) {
  const getTrendDisplay = (trend: string) => {
    if (trend === 'up') return '↑ Tăng';
    if (trend === 'down') return '↓ Giảm';
    return '→ Ổn định';
  };

  const totalRevenue = topProductsData.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = topProductsData.reduce((sum, p) => sum + p.cost, 0);
  const totalProfit = topProductsData.reduce((sum, p) => sum + p.profit, 0);
  const totalSold = topProductsData.reduce((sum, p) => sum + p.sold, 0);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="text-center py-6 border-b">
            <p className="text-sm text-slate-600 mb-2">
              Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
            <h2 className="text-xl text-slate-900 mb-1">Báo cáo sản phẩm</h2>
            <p className="text-sm text-slate-600">
              Tuần này (24/11/2025 - 27/11/2025)
            </p>
          </div>

          {/* Top Products */}
          <div className="border-b">
            <div className="bg-blue-50 py-3 px-4 border-b border-blue-200">
              <h3 className="text-sm text-slate-900">Sản phẩm bán chạy nhất</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">STT</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Đã bán</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Giá vốn</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Lợi nhuận</th>
                    <th className="text-center py-3 px-4 text-sm text-slate-900">Xu hướng</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsData.map((product, index) => (
                    <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? '' : 'bg-slate-50'}`}>
                      <td className="py-3 px-4 text-sm text-slate-900">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-slate-900">{product.name}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {product.sold}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {product.revenue.toLocaleString()}₫
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {product.cost.toLocaleString()}₫
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-emerald-600">
                        {product.profit.toLocaleString()}₫
                      </td>
                      <td className="text-center py-3 px-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          product.trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
                          product.trend === 'down' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {getTrendDisplay(product.trend)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-4 text-sm text-blue-900">
                      Tổng cộng
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalSold}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalRevenue.toLocaleString()}₫
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalCost.toLocaleString()}₫
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalProfit.toLocaleString()}₫
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Slow Moving Products */}
          {slowMovingProducts.length > 0 && (
            <div className="border-b">
              <div className="bg-orange-50 py-3 px-4 border-b border-orange-200">
                <h3 className="text-sm text-slate-900">Sản phẩm bán chậm</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm text-slate-900">STT</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
                      <th className="text-right py-3 px-4 text-sm text-slate-900">Đã bán</th>
                      <th className="text-right py-3 px-4 text-sm text-slate-900">Số ngày không bán</th>
                      <th className="text-center py-3 px-4 text-sm text-slate-900">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slowMovingProducts.map((product, index) => (
                      <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? '' : 'bg-slate-50'}`}>
                        <td className="py-3 px-4 text-sm text-slate-900">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{product.name}</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {product.sold}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-orange-600">
                          {product.daysNoSale} ngày
                        </td>
                        <td className="text-center py-3 px-4 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            product.status === 'very-slow' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {product.status === 'very-slow' ? 'Rất chậm' : 'Chậm'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Sale Products */}
          {noSaleProducts.length > 0 && (
            <div>
              <div className="bg-red-50 py-3 px-4 border-b border-red-200">
                <h3 className="text-sm text-slate-900">Sản phẩm không bán được</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm text-slate-900">STT</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-900">Tên sản phẩm</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-900">Lần bán cuối</th>
                      <th className="text-center py-3 px-4 text-sm text-slate-900">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noSaleProducts.map((product, index) => (
                      <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? '' : 'bg-slate-50'}`}>
                        <td className="py-3 px-4 text-sm text-slate-900">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-slate-900">{product.name}</td>
                        <td className="py-3 px-4 text-sm text-red-600">
                          {product.lastSale}
                        </td>
                        <td className="text-center py-3 px-4 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                            Cần xem xét
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="py-4 text-center border-t">
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
