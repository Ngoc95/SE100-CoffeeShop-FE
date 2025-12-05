//src\components\reports\EmployeeSalesReport.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface EmployeeSalesItem {
  itemCode: string;
  itemName: string;
  quantitySold: number;
  revenue: number;
  quantityReturned: number;
  returnValue: number;
  netRevenue: number;
}

interface EmployeeSalesData {
  employeeName: string;
  totalSold: number;
  revenue: number;
  totalReturned: number;
  returnValue: number;
  netRevenue: number;
  items: EmployeeSalesItem[];
}

interface EmployeeSalesReportProps {
  dateFrom?: Date;
  dateTo?: Date;
  employeeData: EmployeeSalesData[];
}

export function EmployeeSalesReport({
  dateFrom,
  dateTo,
  employeeData
}: EmployeeSalesReportProps) {
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  const toggleEmployee = (employeeName: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeName)) {
      newExpanded.delete(employeeName);
    } else {
      newExpanded.add(employeeName);
    }
    setExpandedEmployees(newExpanded);
  };

  const totalSold = employeeData.reduce((sum, e) => sum + e.totalSold, 0);
  const totalRevenue = employeeData.reduce((sum, e) => sum + e.revenue, 0);
  const totalReturned = employeeData.reduce((sum, e) => sum + e.totalReturned, 0);
  const totalReturnValue = employeeData.reduce((sum, e) => sum + e.returnValue, 0);
  const totalNetRevenue = employeeData.reduce((sum, e) => sum + e.netRevenue, 0);

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
            <h2 className="text-xl text-slate-900 mb-1">Báo cáo bán hàng theo nhân viên</h2>
            <p className="text-sm text-slate-600">
              Từ {getDateRangeDisplay()}
            </p>
            <p className="text-xs text-slate-500 mt-1 italic">
              (Đã phân bố giảm giá hóa đơn, giảm giá phiếu trả)
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm text-slate-900">Người nhận đơn</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">SL Bán</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">SL Trả</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Giá trị trả</th>
                  <th className="text-right py-3 px-4 text-sm text-slate-900">Doanh thu thuần</th>
                </tr>
              </thead>
              <tbody>
                {/* Total Row - First */}
                <tr className="bg-amber-50 border-b border-slate-200">
                  <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                    Tổng (SL Người nhận đơn: {employeeData.length})
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalSold.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalRevenue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalReturned.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalReturnValue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-900 font-medium">
                    {totalNetRevenue.toLocaleString()}
                  </td>
                </tr>
                {/* Employee Rows */}
                {employeeData.map((employee, index) => {
                  const isExpanded = expandedEmployees.has(employee.employeeName);
                  return (
                    <React.Fragment key={index}>
                      <tr className="border-b border-slate-200 cursor-pointer hover:bg-blue-50" onClick={() => toggleEmployee(employee.employeeName)}>
                        <td className="py-3 px-4 text-sm text-slate-900">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            )}
                            {employee.employeeName}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {employee.totalSold.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {employee.revenue.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {employee.totalReturned.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {employee.returnValue.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-900">
                          {employee.netRevenue.toLocaleString()}
                        </td>
                      </tr>
                      {isExpanded && employee.items.length > 0 && (
                        <>
                          <tr className="bg-slate-50">
                            <td colSpan={6} className="py-2 px-4">
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    <th className="text-left py-2 px-4 text-xs text-slate-600">Mã hàng</th>
                                    <th className="text-left py-2 px-4 text-xs text-slate-600">Tên hàng</th>
                                    <th className="text-right py-2 px-4 text-xs text-slate-600">SL mặt hàng</th>
                                    <th className="text-right py-2 px-4 text-xs text-slate-600">Doanh thu</th>
                                    <th className="text-right py-2 px-4 text-xs text-slate-600">SL Trả</th>
                                    <th className="text-right py-2 px-4 text-xs text-slate-600">Giá trị trả</th>
                                    <th className="text-right py-2 px-4 text-xs text-slate-600">Doanh thu thuần</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {employee.items.map((item, itemIndex) => (
                                    <tr key={itemIndex} className="border-b border-slate-100">
                                      <td className="py-2 px-4 text-xs text-slate-700">{item.itemCode}</td>
                                      <td className="py-2 px-4 text-xs text-slate-700">{item.itemName}</td>
                                      <td className="text-right py-2 px-4 text-xs text-slate-700">
                                        {item.quantitySold.toLocaleString()}
                                      </td>
                                      <td className="text-right py-2 px-4 text-xs text-slate-700">
                                        {item.revenue.toLocaleString()}
                                      </td>
                                      <td className="text-right py-2 px-4 text-xs text-slate-700">
                                        {item.quantityReturned.toLocaleString()}
                                      </td>
                                      <td className="text-right py-2 px-4 text-xs text-slate-700">
                                        {item.returnValue.toLocaleString()}
                                      </td>
                                      <td className="text-right py-2 px-4 text-xs text-slate-700">
                                        {item.netRevenue.toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
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
