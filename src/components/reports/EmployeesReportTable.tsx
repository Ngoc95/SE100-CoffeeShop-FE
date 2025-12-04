import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface EmployeesReportTableProps {
  employeeData: Array<{
    name: string;
    role: string;
    revenue: number;
    discounts: number;
    cost: number;
    profit: number;
    shifts: number;
    ordersServed: number;
    avgOrderValue: number;
    performance: number;
  }>;
}

export function EmployeesReportTable({
  employeeData
}: EmployeesReportTableProps) {
  const totalRevenue = employeeData.reduce((sum, e) => sum + e.revenue, 0);
  const totalDiscounts = employeeData.reduce((sum, e) => sum + e.discounts, 0);
  const totalCost = employeeData.reduce((sum, e) => sum + e.cost, 0);
  const totalProfit = employeeData.reduce((sum, e) => sum + e.profit, 0);
  const totalShifts = employeeData.reduce((sum, e) => sum + e.shifts, 0);
  const totalOrders = employeeData.reduce((sum, e) => sum + e.ordersServed, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="text-center py-6 border-b">
            <p className="text-sm text-slate-600 mb-2">
              Ngày lập {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
            <h2 className="text-xl text-slate-900 mb-1">Báo cáo nhân viên</h2>
            <p className="text-sm text-slate-600">
              Tuần này (24/11/2025 - 27/11/2025)
            </p>
          </div>

          {/* Summary Section */}
          <div className="border-b">
            <div className="bg-blue-50 py-3 px-4 border-b border-blue-200">
              <h3 className="text-sm text-slate-900">Tổng quan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900">Số nhân viên</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {employeeData.length} người
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">Tổng ca làm việc</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {totalShifts} ca
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-4 text-sm text-slate-900">Tổng đơn hàng</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right">
                      {totalOrders} đơn
                    </td>
                  </tr>
                  <tr className="border-b-2 border-slate-300 bg-blue-50">
                    <td className="py-3 px-4 text-sm text-blue-900">Tổng doanh thu</td>
                    <td className="py-3 px-4 text-sm text-blue-900 text-right">
                      {totalRevenue.toLocaleString()}₫
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Performance Table */}
          <div>
            <div className="bg-blue-50 py-3 px-4 border-b border-blue-200">
              <h3 className="text-sm text-slate-900">Chi tiết hiệu suất nhân viên</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">STT</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Nhân viên</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-900">Vị trí</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Ca làm</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Đơn hàng</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Giảm giá</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Giá vốn</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">Lợi nhuận</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-900">ĐH TB</th>
                    <th className="text-center py-3 px-4 text-sm text-slate-900">Hiệu suất</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeData.map((employee, index) => (
                    <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? '' : 'bg-slate-50'}`}>
                      <td className="py-3 px-4 text-sm text-slate-900">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-slate-900">{employee.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{employee.role}</td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {employee.shifts}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {employee.ordersServed}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {employee.revenue.toLocaleString()}₫
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-red-600">
                        -{employee.discounts.toLocaleString()}₫
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {employee.cost.toLocaleString()}₫
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-emerald-600">
                        {employee.profit.toLocaleString()}₫
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-slate-900">
                        {employee.avgOrderValue.toLocaleString()}₫
                      </td>
                      <td className="text-center py-3 px-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          employee.performance >= 90 ? 'bg-emerald-100 text-emerald-700' :
                          employee.performance >= 80 ? 'bg-blue-100 text-blue-700' :
                          employee.performance >= 70 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {employee.performance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 border-t-2 border-slate-300">
                    <td colSpan={3} className="py-3 px-4 text-sm text-blue-900">
                      Tổng cộng
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalShifts}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalOrders}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalRevenue.toLocaleString()}₫
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      -{totalDiscounts.toLocaleString()}₫
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalCost.toLocaleString()}₫
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {totalProfit.toLocaleString()}₫
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-blue-900">
                      {avgOrderValue.toLocaleString()}₫
                    </td>
                    <td></td>
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
