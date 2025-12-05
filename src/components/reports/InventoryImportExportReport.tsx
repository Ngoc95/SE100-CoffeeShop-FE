import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface InventoryItem {
  code: string;
  name: string;
  beginningQty: number;
  beginningValue: number;
  importQty: number;
  importValue: number;
  exportQty: number;
  exportValue: number;
  endingQty: number;
  endingValue: number;
}

interface InventoryImportExportReportProps {
  dateFrom: Date;
  dateTo: Date;
  data: InventoryItem[];
}

export function InventoryImportExportReport({
  dateFrom,
  dateTo,
  data
}: InventoryImportExportReportProps) {

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      itemCount: acc.itemCount + 1,
      beginningQty: acc.beginningQty + item.beginningQty,
      beginningValue: acc.beginningValue + item.beginningValue,
      importQty: acc.importQty + item.importQty,
      importValue: acc.importValue + item.importValue,
      exportQty: acc.exportQty + item.exportQty,
      exportValue: acc.exportValue + item.exportValue,
      endingQty: acc.endingQty + item.endingQty,
      endingValue: acc.endingValue + item.endingValue,
    }),
    {
      itemCount: 0,
      beginningQty: 0,
      beginningValue: 0,
      importQty: 0,
      importValue: 0,
      exportQty: 0,
      exportValue: 0,
      endingQty: 0,
      endingValue: 0,
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
          Báo cáo xuất nhập tồn
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
              <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-white">
                Mã hàng
              </th>
              <th className="text-left py-3 px-4 text-sm text-slate-900 border-r border-white">
                Tên hàng
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Tồn đầu kỳ
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Giá trị đầu kỳ
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                SL Nhập
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Giá trị nhập
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                SL Xuất
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Giá trị xuất
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900 border-r border-white">
                Tồn cuối kỳ
              </th>
              <th className="text-right py-3 px-4 text-sm text-slate-900">
                Giá trị cuối kỳ
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Summary Row */}
            <tr className="bg-amber-50 border-b border-slate-200">
              <td colSpan={2} className="py-3 px-4 text-sm text-slate-900">
                SL mặt hàng: {totals.itemCount}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.beginningQty.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.beginningValue.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.importQty.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.importValue.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.exportQty.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.exportValue.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.endingQty.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-sm text-slate-900 border-l border-white">
                {totals.endingValue.toLocaleString()}
              </td>
            </tr>

            {/* Item Rows */}
            {data.map((item) => (
              <tr
                key={item.code}
                className="border-b border-slate-200 hover:bg-slate-50"
              >
                <td className="py-2.5 px-4 text-sm text-blue-600">
                  {item.code}
                </td>
                <td className="py-2.5 px-4 text-sm text-slate-900">
                  {item.name}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.beginningQty.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.beginningValue.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.importQty.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.importValue.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.exportQty.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.exportValue.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.endingQty.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-4 text-sm text-slate-900">
                  {item.endingValue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

