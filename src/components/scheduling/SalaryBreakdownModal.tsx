import React, { useMemo } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StaffMember } from "../../data/staffData";
import type { TimekeepingEntry } from "./TimekeepingBoard";

interface SalaryBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
  timekeepingData: Record<string, Record<string, Record<string, TimekeepingEntry>>> | undefined;
  shifts: { id: string; startTime: string; endTime: string }[];
  periodStart: Date;
  periodEnd: Date;
}

const parseCurrency = (value: string | undefined) => {
  if (!value) return 0;
  const normalized = value.replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return 0;
  return num;
};

const parseCoefficient = (value: string | undefined, defaultValue: number) => {
  if (!value) return defaultValue;
  const normalized = value.replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return defaultValue;
  return num / 100;
};

type DayType = "weekday" | "saturday" | "sunday";

const getDayTypeFromDate = (date: Date): DayType => {
  const day = date.getDay();
  if (day === 0) return "sunday";
  if (day === 6) return "saturday";
  return "weekday";
};

const formatISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function SalaryBreakdownModal({
  open,
  onOpenChange,
  staff,
  timekeepingData,
  shifts,
  periodStart,
  periodEnd,
}: SalaryBreakdownModalProps) {
  const breakdown = useMemo(() => {
    if (!staff || !staff.salarySettings || !timekeepingData) return [];
    if (staff.salarySettings.salaryType === "fixed") return [];

    const fromStr = formatISODate(periodStart);
    const toStr = formatISODate(periodEnd);
    const grouped: Record<string, {
      label: string;
      salaryPerShift: number;
      count: number;
      calculatedCount: number;
      total: number;
    }> = {};

    Object.entries(timekeepingData).forEach(([date, shiftMap]) => {
      const dateStr = date.split("T")[0];
      if (dateStr < fromStr || dateStr > toStr) return;

      Object.entries(shiftMap || {}).forEach(([shiftId, staffMap]) => {
        const entry = (staffMap as any)?.[staff.id];
        if (!entry || typeof entry !== "object") return;
        
        const typedEntry = entry as TimekeepingEntry;
        if (typedEntry.status === "missing" || typedEntry.status === "not-checked") return;

        const dateObj = new Date(date);
        const dayType = getDayTypeFromDate(dateObj);
        
        const shiftSetting = staff.salarySettings?.shifts.find(s => s.id === shiftId);
        if (!shiftSetting) return;

        const basePerShift = parseCurrency(shiftSetting.salaryPerShift);
        if (!basePerShift) return;

        let coeff = 1;
        let label = "Ngày thường";

        if (typedEntry.status === "day-off") {
          if (typedEntry.leaveType === "approved-leave") {
             coeff = parseCoefficient(shiftSetting.dayOffCoeff, 0);
             label = "Ngày nghỉ (có phép)";
          } else {
             coeff = 0;
             label = "Ngày nghỉ (không phép)";
          }
        } else if (dayType === "saturday") {
          coeff = parseCoefficient(shiftSetting.saturdayCoeff, 1);
          label = "Ngày thứ 7";
        } else if (dayType === "sunday") {
           coeff = parseCoefficient(shiftSetting.sundayCoeff, 1);
           label = "Ngày chủ nhật";
        }

        const key = `${label}-${basePerShift}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            label,
            salaryPerShift: basePerShift,
            count: 0,
            calculatedCount: 0,
            total: 0
          };
        }
        
        grouped[key].count += 1;
        grouped[key].calculatedCount += coeff;
        grouped[key].total += basePerShift * coeff;
      });
    });

    return Object.values(grouped);
  }, [staff, timekeepingData, periodStart, periodEnd]);

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center pr-8">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Loại lương | {staff.salarySettings?.salaryType === "fixed" ? "Cố định" : "Theo ca làm việc"}
              </DialogTitle>
              <p className="text-slate-600 mt-1">Nhân viên: {staff.fullName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ca</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Lương mỗi ca</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Số ca chấm công</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Số ca tính lương</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.salarySettings?.salaryType === "fixed" ? (
                   <tr>
                     <td className="px-4 py-3 text-sm font-medium">Lương tháng cố định</td>
                     <td className="px-4 py-3 text-right text-sm text-slate-500">-</td>
                     <td className="px-4 py-3 text-right text-sm text-slate-500">-</td>
                     <td className="px-4 py-3 text-right text-sm text-slate-500">-</td>
                     <td className="px-4 py-3 text-right text-sm font-semibold">
                       {parseCurrency(staff.salarySettings.salaryAmount).toLocaleString()}₫
                     </td>
                   </tr>
                ) : (
                  <>
                  {breakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.label}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">
                        {item.salaryPerShift.toLocaleString()}₫
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-900 font-medium">
                        {item.count}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <Input 
                          readOnly 
                          value={item.calculatedCount} 
                          className="w-20 h-8 text-right bg-slate-50 ml-auto" 
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {item.total.toLocaleString()}₫
                      </td>
                    </tr>
                  ))}
                  {breakdown.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                         Chưa có dữ liệu chấm công trong kỳ này
                       </td>
                     </tr>
                  )}
                  </>
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-slate-900">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right">Tổng cộng</td>
                  <td className="px-4 py-3 text-right">
                    {breakdown.reduce((sum, i) => sum + i.count, 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {breakdown.reduce((sum, i) => sum + i.calculatedCount, 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    {breakdown.reduce((sum, i) => sum + i.total, 0).toLocaleString()}₫
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bỏ qua
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => onOpenChange(false)}>
            Xong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
