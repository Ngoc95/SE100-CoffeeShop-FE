//src\components\reports\EmployeeProfitReport.tsx
import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface EmployeeProfitData {
  employeeName: string;
  totalMerchandise: number;
  invoiceDiscount: number;
  revenue: number;
  returnValue: number;
  netRevenue: number;
  totalCost: number;
  grossProfit: number;
}

interface EmployeeProfitReportProps {
  dateFrom?: Date;
  dateTo?: Date;
  employeeData: EmployeeProfitData[];
}

export function EmployeeProfitReport({
  dateFrom,
  dateTo,
  employeeData
}: EmployeeProfitReportProps) {
  const totalMerchandise = employeeData.reduce((sum, e) => sum + e.totalMerchandise, 0);
  const totalInvoiceDiscount = employeeData.reduce((sum, e) => sum + e.invoiceDiscount, 0);
  const totalRevenue = employeeData.reduce((sum, e) => sum + e.revenue, 0);
  const totalReturnValue = employeeData.reduce((sum, e) => sum + e.returnValue, 0);
  const totalNetRevenue = employeeData.reduce((sum, e) => sum + e.netRevenue, 0);
  const totalCost = employeeData.reduce((sum, e) => sum + e.totalCost, 0);
  const totalGrossProfit = employeeData.reduce((sum, e) => sum + e.grossProfit, 0);

  const getDateRangeDisplay = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`;
    }
    return '';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="text-center py-6 border-b">
            <p className="text-sm text-slate-600 mb-2">
              Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
            <h2 className="text-xl text-slate-900 mb-1">Báo cáo lợi nhuận theo nhân viên</h2>
            <p className="text-sm text-slate-600">
              Từ {getDateRangeDisplay()}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm text-slate-900">Người nhận đơn</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng tiền hàng</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Giảm giá HĐ</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu thuần</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Tổng giá vốn</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Lợi nhuận gộp</th>
                </tr>
              </thead>
              <tbody>
                {/* Total Row - First */}
                <tr className="bg-amber-50 border-b border-slate-200">
                  <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                    Tổng (SL Người nhận đơn: {employeeData.length})
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalMerchandise.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalInvoiceDiscount !== 0 ? `-${totalInvoiceDiscount.toLocaleString()}` : '0'}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalRevenue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalReturnValue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalNetRevenue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalCost.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-blue-600 font-medium">
                    {totalGrossProfit.toLocaleString()}
                  </td>
                </tr>
                {/* Employee Rows */}
                {employeeData.map((employee, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900">{employee.employeeName}</td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {employee.totalMerchandise.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-red-600">
                      {employee.invoiceDiscount !== 0 ? `-${employee.invoiceDiscount.toLocaleString()}` : '0'}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {employee.revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {employee.returnValue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {employee.netRevenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900">
                      {employee.totalCost.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-600 font-medium">
                      {employee.grossProfit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="py-4 text-center border-t">
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
