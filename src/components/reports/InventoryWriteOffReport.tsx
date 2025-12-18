import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface WriteOffDetail {
  writeOffCode: string;
  dateTime: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

interface WriteOffItem {
  code: string;
  name: string;
  totalQuantity: number;
  totalValue: number;
  details?: WriteOffDetail[];
}

interface InventoryWriteOffReportProps {
  dateFrom: Date;
  dateTo: Date;
  data: WriteOffItem[];
}

export function InventoryWriteOffReport({
  dateFrom,
  dateTo,
  data
}: InventoryWriteOffReportProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (code: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedRows(newExpanded);
  };

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      itemCount: acc.itemCount + 1,
      totalQuantity: acc.totalQuantity + item.totalQuantity,
      totalValue: acc.totalValue + item.totalValue,
    }),
    {
      itemCount: 0,
      totalQuantity: 0,
      totalValue: 0,
    }
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="text-center py-6 border-b">
        <p className="text-sm text-slate-600 mb-2">
          Ngày lập: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </p>
        <h2 className="text-xl text-slate-900 mb-1">
          Báo cáo hàng hóa xuất hủy
        </h2>
        <p className="text-sm text-slate-600">
          Từ ngày {format(dateFrom, 'dd/MM/yyyy', { locale: vi })} đến ngày {format(dateTo, 'dd/MM/yyyy', { locale: vi })}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-100">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-white w-12"></th>
              <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-white">
                Mã hàng
              </th>
              <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-white">
                Tên hàng
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Tổng SL hủy
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">
                Tổng giá trị
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Summary Row */}
            <tr className="bg-amber-50 border-b border-slate-200">
              <td colSpan={3} className="py-3 px-4 text-sm text-slate-900">
                SL mặt hàng: {totals.itemCount}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.totalQuantity.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.totalValue.toLocaleString()}
              </td>
            </tr>

            {/* Item Rows */}
            {data.map((item) => {
              const isExpanded = expandedRows.has(item.code);
              const hasDetails = item.details && item.details.length > 0;

              return (
                <>
                  <tr
                    key={item.code}
                    className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                    onClick={() => hasDetails && toggleRow(item.code)}
                  >
                    <td className="py-2.5 px-4 text-sm text-slate-600">
                      {hasDetails ? (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      ) : null}
                    </td>
                    <td className="py-2.5 px-4 text-sm text-blue-600">
                      {item.code}
                    </td>
                    <td className="py-2.5 px-4 text-sm text-slate-900">
                      {item.name}
                    </td>
                    <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                      {item.totalQuantity.toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                      {item.totalValue.toLocaleString()}
                    </td>
                  </tr>

                  {/* Write-off Detail Rows */}
                  {isExpanded && hasDetails && (
                    <>
                      {item.details!.map((detail, idx) => (
                        <tr
                          key={`${item.code}-detail-${idx}`}
                          className="bg-slate-50 border-b border-slate-200"
                        >
                          <td></td>
                          <td className="py-2 px-4 text-xs text-slate-600">
                            {detail.writeOffCode}
                          </td>
                          <td className="py-2 px-4 text-xs text-slate-900">
                            {detail.dateTime}
                          </td>
                          <td className="text-right py-2 px-4 text-xs text-slate-900">
                            {detail.quantity.toLocaleString()}
                          </td>
                          <td className="text-right py-2 px-4 text-xs text-slate-900">
                            {detail.totalValue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


