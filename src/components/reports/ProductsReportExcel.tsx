import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ProductData {
  code: string;
  name: string;
  quantitySold: number;
  revenue: number;
  quantityReturned: number;
  returnValue: number;
  netRevenue: number;
  costOfGoods?: number;
  profit?: number;
  profitMargin?: number;
}

interface ProductsReportExcelProps {
  concern: 'sales' | 'profit';
  dateFrom: Date;
  dateTo: Date;
  productsData: ProductData[];
}

export function ProductsReportExcel({
  concern,
  dateFrom,
  dateTo,
  productsData
}: ProductsReportExcelProps) {
  const totalQuantitySold = productsData.reduce((sum, p) => sum + p.quantitySold, 0);
  const totalRevenue = productsData.reduce((sum, p) => sum + p.revenue, 0);
  const totalQuantityReturned = productsData.reduce((sum, p) => sum + p.quantityReturned, 0);
  const totalReturnValue = productsData.reduce((sum, p) => sum + p.returnValue, 0);
  const totalNetRevenue = productsData.reduce((sum, p) => sum + p.netRevenue, 0);
  const totalCostOfGoods = concern === 'profit' ? productsData.reduce((sum, p) => sum + (p.costOfGoods || 0), 0) : 0;
  const totalProfit = concern === 'profit' ? productsData.reduce((sum, p) => sum + (p.profit || 0), 0) : 0;
  const avgProfitMargin = concern === 'profit' ? (totalNetRevenue > 0 ? (totalProfit / totalNetRevenue) * 100 : 0) : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="text-center py-6 border-b">
        <p className="text-sm text-slate-600 mb-2">
          Ngày lập: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </p>
        <h2 className="text-xl text-slate-900 mb-1">
          {concern === 'sales' ? 'Báo cáo bán hàng theo hàng hóa' : 'Báo cáo lợi nhuận theo hàng hóa'}
        </h2>
        <p className="text-sm text-slate-600">
          Từ ngày {format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày {format(dateTo, 'dd/MM/yyyy', { locale: vi })}
        </p>
        <p className="text-xs text-slate-400 mt-2 italic">
          (Đã phân bổ giảm giá hóa đơn, giảm giá phiếu trả)
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-white">
                Mã hàng
              </th>
              <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-white">
                Tên hàng
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                SL bán
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Doanh thu
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                SL trả
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Giá trị trả
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Doanh thu thuần
              </th>
              {concern === 'profit' && (
                <>
                  <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                    Tổng giá vốn
                  </th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                    Lợi nhuận
                  </th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">
                    Tỷ suất
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Summary Row */}
            <tr className="bg-amber-50 border-b border-slate-200">
              <td colSpan={2} className="py-3 px-4 text-sm text-slate-900">
                SL mặt hàng: {productsData.length}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totalQuantitySold}
              </td>
              <td className="text-right py-3 px-4 text-sm text-blue-600 border-l border-white">
                {totalRevenue.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totalQuantityReturned}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totalReturnValue.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-blue-600 border-l border-white">
                {totalNetRevenue.toLocaleString()}
              </td>
              {concern === 'profit' && (
                <>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                    {totalCostOfGoods.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-emerald-600 border-l border-white">
                    {totalProfit.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                    {avgProfitMargin.toFixed(2)}%
                  </td>
                </>
              )}
            </tr>

            {/* Product Rows */}
            {productsData.map((product, index) => (
              <tr
                key={product.code}
                className="border-b border-slate-200 hover:bg-slate-50"
              >
                <td className="py-2.5 px-4 text-sm text-blue-600">
                  {product.code}
                </td>
                <td className="py-2.5 px-4 text-sm text-slate-900">
                  {product.name}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {product.quantitySold}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {product.revenue.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {product.quantityReturned}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {product.returnValue.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {product.netRevenue.toLocaleString()}
                </td>
                {concern === 'profit' && (
                  <>
                    <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                      {(product.costOfGoods || 0).toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                      {(product.profit || 0).toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                      {(product.profitMargin || 0).toFixed(2)}%
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
