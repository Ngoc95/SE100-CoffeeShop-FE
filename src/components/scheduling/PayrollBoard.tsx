import React, { useMemo, useState } from "react";
import { Calculator, ChevronDown, ChevronUp, Plus, X, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { staffMembers, initialSchedule, StaffMember } from "../../data/staffData";
import type { TimekeepingEntry } from "./TimekeepingBoard";

interface PayrollDetail {
  staffId: string;
  staffName: string;
  totalAmount: number;
  paidAmount: number;
}

interface PayrollPayment {
  id: string;
  date: string;
  staffName: string;
  amount: number;
  note?: string;
   method: "cash" | "transfer";
   bankAccount?: string;
   bankName?: string;
}

interface PayrollItem {
  id: string;
  name: string;
  periodType: "monthly" | "custom";
  workRange: string;
  totalAmount: number;
  paidAmount: number;
  status: "draft" | "closed";
  createdAt: string;
  details: PayrollDetail[];
  payments?: PayrollPayment[];
}

interface MonthlyOption {
  value: string;
  label: string;
  range: string;
  startDate: string;
  endDate: string;
}

type TimekeepingData = Record<
  string,
  Record<string, Record<string, TimekeepingEntry>>
>;

const formatDateDMY = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateStringDMY = (value: string) => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const parseDMYToDate = (value: string) => {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
};

const formatISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildMonthlyOptions = (): MonthlyOption[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const options: MonthlyOption[] = [];

  for (let offset = -12; offset <= 2; offset++) {
    const date = new Date(currentYear, currentMonth + offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const range = `${formatDateDMY(start)} - ${formatDateDMY(end)}`;
    options.push({
      value: `${year}-${month + 1}`,
      label: `Tháng ${month + 1}/${year}`,
      range,
      startDate: formatISODate(start),
      endDate: formatISODate(end),
    });
  }

  return options;
};

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

const calculateEntryAmount = (
  entry: TimekeepingEntry,
  staff: StaffMember,
  shifts: { id: string; startTime: string; endTime: string }[]
) => {
  if (entry.status === "missing" || entry.status === "not-checked") {
    return 0;
  }

  const salarySettings = staff.salarySettings;
  const dateObj = new Date(entry.date);
  const dayType = getDayTypeFromDate(dateObj);

  let basePerShift: number;
  let baseFactor = 1;

  if (salarySettings && salarySettings.salaryType === "shift") {
    const shiftSetting =
      salarySettings.shifts.find((sh) => sh.id === entry.shiftId) ||
      salarySettings.shifts[0];

    basePerShift = parseCurrency(shiftSetting?.salaryPerShift);
    if (!basePerShift) return 0;

    if (entry.status === "day-off") {
      if (entry.leaveType === "approved-leave") {
        baseFactor = parseCoefficient(shiftSetting?.dayOffCoeff, 0);
      } else {
        baseFactor = 0;
      }
    } else if (dayType === "saturday") {
      baseFactor = parseCoefficient(shiftSetting?.saturdayCoeff, 1);
    } else if (dayType === "sunday") {
      baseFactor = parseCoefficient(shiftSetting?.sundayCoeff, 1);
    } else {
      baseFactor = 1;
    }
  } else {
    basePerShift = staff.salary ? Math.round(staff.salary / 26) : 200000;
    if (entry.status === "day-off") {
      if (entry.leaveType === "approved-leave") {
        baseFactor = 1;
      } else {
        baseFactor = 0;
      }
    } else {
      baseFactor = 1;
    }
  }

  let amount = basePerShift * baseFactor;

  if (
    salarySettings &&
    salarySettings.overtimeEnabled &&
    (entry.overtimeBefore || entry.overtimeAfter)
  ) {
    const shiftInfo = shifts.find((sh) => sh.id === entry.shiftId);
    if (shiftInfo) {
      const startParts = shiftInfo.startTime.split(":").map(Number);
      const endParts = shiftInfo.endTime.split(":").map(Number);
      const shiftMinutes =
        endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1]);
      if (shiftMinutes > 0) {
        const hourlyBase = basePerShift / (shiftMinutes / 60);
        const overtimeMinutes =
          (entry.overtimeBeforeHours || 0) * 60 +
          (entry.overtimeBeforeMinutes || 0) +
          (entry.overtimeAfterHours || 0) * 60 +
          (entry.overtimeAfterMinutes || 0);
        if (overtimeMinutes > 0) {
          let coeffValue: string | undefined;
          if (entry.status === "day-off") {
            coeffValue = salarySettings.overtimeCoeffs.dayOff;
          } else if (dayType === "saturday") {
            coeffValue = salarySettings.overtimeCoeffs.saturday;
          } else if (dayType === "sunday") {
            coeffValue = salarySettings.overtimeCoeffs.sunday;
          } else {
            coeffValue = salarySettings.overtimeCoeffs.weekday;
          }
          const overtimeFactor = parseCoefficient(coeffValue, 1);
          const overtimeHours = overtimeMinutes / 60;
          amount += hourlyBase * overtimeHours * overtimeFactor;
        }
      }
    }
  }

  return amount;
};

const calculateStaffPayroll = (
  staff: StaffMember,
  timekeepingData: TimekeepingData | undefined,
  shifts: { id: string; startTime: string; endTime: string }[],
  periodStart: Date,
  periodEnd: Date
) => {
  if (!timekeepingData || Object.keys(timekeepingData).length === 0) {
    return 0;
  }

  const staffTimekeeping = timekeepingData[staff.id];
  if (!staffTimekeeping) {
    return 0;
  }

  const fromTime = periodStart.getTime();
  const toTime = periodEnd.getTime();

  let total = 0;

  Object.entries(staffTimekeeping).forEach(([shiftId, dateMap]) => {
    Object.values(dateMap || {}).forEach((rawEntry) => {
      if (!rawEntry || typeof rawEntry !== "object") return;
      const entry = rawEntry as TimekeepingEntry;
      if (!entry.date) return;
      const entryDateStr = entry.date.split("T")[0];
      const fromStr = formatISODate(periodStart);
      const toStr = formatISODate(periodEnd);
      if (entryDateStr < fromStr || entryDateStr > toStr) {
        return;
      }
      const amount = calculateEntryAmount(entry, staff, shifts);
      total += amount;
    });
  });

  return total;
};

interface PayrollBoardProps {
  timekeepingData?: TimekeepingData;
  shifts: { id: string; startTime: string; endTime: string }[];
}

export function PayrollBoard({ timekeepingData, shifts }: PayrollBoardProps) {
  const [payrolls, setPayrolls] = useState<PayrollItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("payrollBoard.payrolls");
      if (!stored) return [];
      const parsed = JSON.parse(stored) as PayrollItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [expandedPayrollId, setExpandedPayrollId] = useState<string | null>(
    null
  );
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentPayrollId, setPaymentPayrollId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash"
  );
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [paymentBankAccount, setPaymentBankAccount] = useState("");
  const [paymentBankName, setPaymentBankName] = useState("");
  const [selectedPaymentStaffIds, setSelectedPaymentStaffIds] = useState<
    string[]
  >([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [periodType, setPeriodType] = useState<"monthly" | "custom">("monthly");
  const monthlyOptions = useMemo(buildMonthlyOptions, []);
  const [selectedMonth, setSelectedMonth] = useState(
    monthlyOptions[Math.max(monthlyOptions.length - 3, 0)]?.value ||
      monthlyOptions[0]?.value
  );
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const persistPayrolls = (items: PayrollItem[]) => {
    setPayrolls(items);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "payrollBoard.payrolls",
          JSON.stringify(items)
        );
      } catch {}
    }
  };

  const getWorkRange = () => {
    if (periodType === "monthly") {
      const found = monthlyOptions.find((m) => m.value === selectedMonth);
      return found?.range || "";
    }
    if (customFrom && customTo) {
      return `${formatDateStringDMY(customFrom)} - ${formatDateStringDMY(
        customTo
      )}`;
    }
    return "";
  };

  const handleCreatePayroll = () => {
    const workRange = getWorkRange();
    if (!workRange) return;

    const now = new Date();

    let periodStart: Date;
    let periodEnd: Date;

    if (periodType === "monthly") {
      const found = monthlyOptions.find((m) => m.value === selectedMonth);
      if (!found) return;
      periodStart = new Date(found.startDate);
      periodEnd = new Date(found.endDate);
    } else {
      if (!customFrom || !customTo) return;
      periodStart = new Date(customFrom);
      periodEnd = new Date(customTo);
    }

    const details: PayrollDetail[] = staffMembers
      .filter((s) => s.position !== "manager")
      .slice(0, 4)
      .map((s) => {
        const totalAmount = Math.round(
          calculateStaffPayroll(
            s,
            timekeepingData,
            shifts,
            periodStart,
            periodEnd
          )
        );
        return {
          staffId: s.id,
          staffName: s.fullName,
          totalAmount,
          paidAmount: 0,
        };
      });

    const totalAmount = details.reduce((sum, d) => sum + d.totalAmount, 0);

    const id = `BL${(payrolls.length + 1).toString().padStart(6, "0")}`;

    const name =
      periodType === "monthly"
        ? (() => {
            const found = monthlyOptions.find((m) => m.value === selectedMonth);
            return found ? `Bảng lương ${found.label.toLowerCase()}` : id;
          })()
        : "Bảng lương tùy chọn";

    const payload: PayrollItem = {
      id,
      name,
      periodType,
      workRange,
      totalAmount,
      paidAmount: 0,
      status: "draft",
      createdAt: now.toLocaleString(),
      details,
    };

    persistPayrolls([...payrolls, payload]);
    setCreateDialogOpen(false);
  };

  const workRangeText = getWorkRange();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Danh sách bảng lương
        </CardTitle>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Bảng tính lương
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-100">
                <TableHead className="w-32 text-sm">Mã</TableHead>
                <TableHead className="text-sm">Tên</TableHead>
                <TableHead className="text-sm">Kỳ hạn trả</TableHead>
                <TableHead className="text-sm">Kỳ làm việc</TableHead>
                <TableHead className="text-sm text-right">Tổng lương</TableHead>
                <TableHead className="text-sm text-right">
                  Đã trả nhân viên
                </TableHead>
                <TableHead className="text-sm text-right">Còn cần trả</TableHead>
                <TableHead className="text-sm text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-slate-500"
                  >
                    Chưa có bảng lương nào. Nhấn "Bảng tính lương" để tạo mới.
                  </TableCell>
                </TableRow>
              )}
              {payrolls.map((p) => {
                const remain = p.totalAmount - p.paidAmount;
                return (
                  <React.Fragment key={p.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-blue-50/60"
                      onClick={() =>
                        setExpandedPayrollId(
                          expandedPayrollId === p.id ? null : p.id
                        )
                      }
                    >
                      <TableCell className="text-sm font-medium text-slate-900">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="mr-1 text-slate-500 hover:text-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPayrollId(
                                expandedPayrollId === p.id ? null : p.id
                              );
                            }}
                          >
                            {expandedPayrollId === p.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {p.id}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {p.periodType === "monthly" ? "Hằng tháng" : "Tùy chọn"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {p.workRange}
                      </TableCell>
                      <TableCell className="text-sm text-right text-slate-900">
                        {p.totalAmount.toLocaleString()}₫
                      </TableCell>
                      <TableCell className="text-sm text-right text-slate-700">
                        {p.paidAmount.toLocaleString()}₫
                      </TableCell>
                      <TableCell className="text-sm text-right text-slate-900">
                        {remain.toLocaleString()}₫
                      </TableCell>
                      <TableCell className="text-sm text-right">
                        {p.status === "draft" ? "Tạm tính" : "Đã chốt"}
                      </TableCell>
                    </TableRow>
                    {expandedPayrollId === p.id && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-slate-50 p-4">
                          <Tabs defaultValue="info" className="w-full">
                            <TabsList className="mb-4">
                              <TabsTrigger value="info">
                                Thông tin
                              </TabsTrigger>
                              <TabsTrigger value="payroll">
                                Phiếu lương
                              </TabsTrigger>
                              <TabsTrigger value="payment-history">
                                Lịch sử thanh toán
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="space-y-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                  <div className="text-slate-500">
                                    Mã bảng lương
                                  </div>
                                  <div className="font-medium text-slate-900">
                                    {p.id}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-slate-500">
                                    Tên bảng lương
                                  </div>
                                  <div className="font-medium text-slate-900">
                                    {p.name}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-slate-500">
                                    Kỳ làm việc
                                  </div>
                                  <div className="font-medium text-slate-900">
                                    {p.workRange}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-slate-500">
                                    Trạng thái
                                  </div>
                                  <div className="font-medium text-slate-900">
                                    {p.status === "draft"
                                      ? "Tạm tính"
                                      : "Đã chốt"}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-slate-500">
                                    Tổng tiền cần trả
                                  </div>
                                  <div className="font-medium text-slate-900">
                                    {p.totalAmount.toLocaleString()}₫
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-slate-500">
                                    Đã thanh toán
                                  </div>
                                  <div className="font-medium text-slate-900">
                                    {p.paidAmount.toLocaleString()}₫
                                  </div>
                                </div>
                              </div>
                              {p.status === "draft" && (
                                <div className="mt-4 flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50 ml-auto"
                                    onClick={() => {
                                      const header = [
                                        "Mã nhân viên",
                                        "Tên nhân viên",
                                        "Tổng lương",
                                        "Đã thanh toán",
                                        "Còn lại",
                                      ];
                                      const rows = p.details.map((d) => {
                                        const remainStaff =
                                          d.totalAmount - d.paidAmount;
                                        return [
                                          d.staffId,
                                          d.staffName,
                                          d.totalAmount,
                                          d.paidAmount,
                                          remainStaff,
                                        ];
                                      });
                                      const csv = [header, ...rows]
                                        .map((row) =>
                                          row
                                            .map((value) =>
                                              `"${String(value).replace(
                                                /"/g,
                                                '""'
                                              )}"`
                                            )
                                            .join(",")
                                        )
                                        .join("\n");
                                      const blob = new Blob([csv], {
                                        type: "text/csv;charset=utf-8;",
                                      });
                                      const url = URL.createObjectURL(blob);
                                      const link =
                                        document.createElement("a");
                                      link.href = url;
                                      link.download = `${p.id}.csv`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                    }}
                                  >
                                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                                    Xuất file
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                    onClick={() => {
                                      let from = new Date();
                                      let to = new Date();
                                      if (p.periodType === "monthly") {
                                        const found = monthlyOptions.find(
                                          (m) => m.range === p.workRange
                                        );
                                        if (found) {
                                          from = new Date(found.startDate);
                                          to = new Date(found.endDate);
                                        }
                                      } else {
                                        const parts = p.workRange.split(" - ");
                                        const fromDate =
                                          parts[0] && parseDMYToDate(parts[0]);
                                        const toDate =
                                          parts[1] && parseDMYToDate(parts[1]);
                                        if (fromDate && toDate) {
                                          from = fromDate;
                                          to = toDate;
                                        }
                                      }
                                      const details: PayrollDetail[] =
                                        staffMembers
                                          .filter(
                                            (s) =>
                                              s.position !== "manager" &&
                                              p.details.some(
                                                (d) => d.staffId === s.id
                                              )
                                          )
                                          .map((s) => {
                                            const totalAmount = Math.round(
                                              calculateStaffPayroll(
                                                s,
                                                timekeepingData,
                                                shifts,
                                                from,
                                                to
                                              )
                                            );
                                            const existing = p.details.find(
                                              (d) => d.staffId === s.id
                                            );
                                            const paidAmount =
                                              existing?.paidAmount || 0;
                                            return {
                                              staffId: s.id,
                                              staffName: s.fullName,
                                              totalAmount,
                                              paidAmount,
                                            };
                                          });
                                      const totalAmount = details.reduce(
                                        (sum, d) => sum + d.totalAmount,
                                        0
                                      );
                                      const updated: PayrollItem = {
                                        ...p,
                                        totalAmount,
                                        paidAmount: p.paidAmount,
                                        details,
                                      };
                                      const next = payrolls.map((item) =>
                                        item.id === p.id ? updated : item
                                      );
                                      persistPayrolls(next);
                                    }}
                                  >
                                    Tải lại dữ liệu
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      const next = payrolls.filter(
                                        (item) => item.id !== p.id
                                      );
                                      persistPayrolls(next);
                                      if (expandedPayrollId === p.id) {
                                        setExpandedPayrollId(null);
                                      }
                                    }}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Huỷ bảng lương
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => {
                                      const next = payrolls.map((item) =>
                                        item.id === p.id
                                          ? { ...item, status: "closed" }
                                          : item
                                      );
                                      persistPayrolls(next);
                                    }}
                                  >
                                    Chốt lương
                                  </Button>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="payroll">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-medium text-slate-900">
                                    Phiếu lương nhân viên
                                  </div>
                                  <div className="flex items-center gap-2 ml-auto">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                      onClick={() => {
                                        const header = [
                                          "Mã nhân viên",
                                          "Tên nhân viên",
                                          "Tổng lương",
                                          "Đã thanh toán",
                                          "Còn lại",
                                        ];
                                        const rows = p.details.map((d) => {
                                          const remainStaff =
                                            d.totalAmount - d.paidAmount;
                                          return [
                                            d.staffId,
                                            d.staffName,
                                            d.totalAmount,
                                            d.paidAmount,
                                            remainStaff,
                                          ];
                                        });
                                        const csv = [header, ...rows]
                                          .map((row) =>
                                            row
                                              .map((value) =>
                                                `"${String(value).replace(
                                                  /"/g,
                                                  '""'
                                                )}"`
                                              )
                                              .join(",")
                                          )
                                          .join("\n");
                                        const blob = new Blob([csv], {
                                          type: "text/csv;charset=utf-8;",
                                        });
                                        const url = URL.createObjectURL(blob);
                                        const link =
                                          document.createElement("a");
                                        link.href = url;
                                        link.download = `${p.id}.csv`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                      }}
                                    >
                                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                                      Xuất file
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700"
                                      onClick={() => {
                                        setPaymentPayrollId(p.id);
                                        setSelectedPaymentStaffIds(
                                          p.details
                                            .filter(
                                              (d) =>
                                                d.totalAmount > d.paidAmount
                                            )
                                            .map((d) => d.staffId)
                                        );
                                        setPaymentDialogOpen(true);
                                      }}
                                    >
                                      Thanh toán
                                    </Button>
                                  </div>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-slate-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Nhân viên
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Tổng lương
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Đã thanh toán
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Còn lại
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {p.details.map((d) => {
                                        const remainStaff =
                                          d.totalAmount - d.paidAmount;
                                        return (
                                          <tr key={d.staffId}>
                                            <td className="px-4 py-2 text-sm text-slate-900">
                                              {d.staffName}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                                              {d.totalAmount.toLocaleString()}₫
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-slate-700">
                                              {d.paidAmount.toLocaleString()}₫
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                                              {remainStaff.toLocaleString()}₫
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="payment-history">
                              {p.payments && p.payments.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-slate-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Mã phiếu
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Thời gian
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Nhân viên
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Tiền chi
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Phương thức
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {p.payments.map((pay) => (
                                        <tr key={pay.id}>
                                          <td className="px-4 py-2 text-sm text-blue-600">
                                            {pay.id}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-600">
                                            {pay.date}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-900">
                                            {pay.staffName}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                            {pay.amount.toLocaleString()}₫
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-600">
                                            {pay.method === "transfer"
                                              ? "Chuyển khoản"
                                              : "Tiền mặt"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-sm text-slate-500">
                                  Chưa có lịch sử thanh toán
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm bảng tính lương</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label>Kỳ hạn trả lương</Label>
              <Select
                value={periodType}
                onValueChange={(value) =>
                  setPeriodType(value as "monthly" | "custom")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỳ hạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Hằng tháng</SelectItem>
                  <SelectItem value="custom">Tùy chọn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodType === "monthly" ? (
              <div className="space-y-2">
                <Label>Kỳ làm việc</Label>
                <Select
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tháng làm việc" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthlyOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Kỳ làm việc</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                  <span className="text-sm text-slate-600">Đến</span>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Phạm vi áp dụng</Label>
              <RadioGroup value="all" className="flex flex-row gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="all"
                    id="scope-all"
                    className="border-slate-300"
                  />
                  <Label
                    htmlFor="scope-all"
                    className="text-sm text-slate-700 cursor-pointer"
                  >
                    Tất cả nhân viên
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreatePayroll}
              disabled={!workRangeText}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          setPaymentDialogOpen(open);
          if (!open) {
            setPaymentPayrollId(null);
            setSelectedPaymentStaffIds([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Thanh toán bảng lương</DialogTitle>
          </DialogHeader>
          {(() => {
            const payroll = payrolls.find((p) => p.id === paymentPayrollId);
            if (!payroll) {
              return (
                <div className="text-sm text-slate-500">
                  Chưa chọn bảng lương để thanh toán
                </div>
              );
            }
            const unpaidDetails = payroll.details.filter(
              (d) => d.totalAmount > d.paidAmount
            );
            const totalRemain = unpaidDetails.reduce(
              (sum, d) => sum + (d.totalAmount - d.paidAmount),
              0
            );
            return (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium text-slate-900">
                        {payroll.name}
                      </span>
                      <span className="text-slate-500">
                        {" "}
                        | Kỳ làm việc: {payroll.workRange} | Trạng thái:{" "}
                        {payroll.status === "draft"
                          ? "Tạm tính"
                          : "Đã chốt"}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Tiền cần trả nhân viên:{" "}
                      <span className="font-semibold text-slate-900">
                        {totalRemain.toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm w-60">
                    <div className="space-y-1">
                      <Label>Thời gian</Label>
                      <Input
                        type="datetime-local"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[2fr,1fr] gap-6">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Phương thức</Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={(v) =>
                            setPaymentMethod(v as "cash" | "transfer")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phương thức" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Tiền mặt</SelectItem>
                            <SelectItem value="transfer">
                              Chuyển khoản
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Ghi chú</Label>
                        <Input
                          value={paymentNote}
                          onChange={(e) =>
                            setPaymentNote(e.target.value)
                          }
                          placeholder="VD: Thanh toán lương tháng"
                        />
                      </div>
                    </div>
                    {paymentMethod === "transfer" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Số tài khoản</Label>
                          <Input
                            value={paymentBankAccount}
                            onChange={(e) =>
                              setPaymentBankAccount(e.target.value)
                            }
                            placeholder="Nhập số tài khoản"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Ngân hàng</Label>
                          <Input
                            value={paymentBankName}
                            onChange={(e) =>
                              setPaymentBankName(e.target.value)
                            }
                            placeholder="Nhập tên ngân hàng"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm border rounded-lg p-3 bg-slate-50">
                    <div className="flex justify-between">
                      <span>Tổng cần trả</span>
                      <span className="font-semibold text-slate-900">
                        {payroll.totalAmount.toLocaleString()}₫
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Đã trả nhân viên</span>
                      <span className="font-semibold text-slate-900">
                        {payroll.paidAmount.toLocaleString()}₫
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-1">
                      <span>Còn cần trả</span>
                      <span className="font-semibold text-blue-700">
                        {totalRemain.toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-center text-xs text-slate-600 w-10">
                          <input
                            type="checkbox"
                            checked={
                              unpaidDetails.length > 0 &&
                              selectedPaymentStaffIds.length ===
                                unpaidDetails.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPaymentStaffIds(
                                  unpaidDetails.map((d) => d.staffId)
                                );
                              } else {
                                setSelectedPaymentStaffIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                          Nhân viên
                        </th>
                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                          Thành tiền
                        </th>
                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                          Đã trả nhân viên
                        </th>
                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                          Còn cần trả
                        </th>
                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                          Tiền trả nhân viên
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unpaidDetails.map((d) => {
                        const remainStaff =
                          d.totalAmount - d.paidAmount;
                        const checked = selectedPaymentStaffIds.includes(
                          d.staffId
                        );
                        return (
                          <tr key={d.staffId}
                           className={!checked ? "opacity-50 " : ""}>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPaymentStaffIds((prev) => [
                                      ...prev,
                                      d.staffId,
                                    ]);
                                  } else {
                                    setSelectedPaymentStaffIds((prev) =>
                                      prev.filter(
                                        (id) => id !== d.staffId
                                      )
                                    );
                                  }
                                }}
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900">
                              {d.staffName}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                              {d.totalAmount.toLocaleString()}₫
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-slate-700">
                              {d.paidAmount.toLocaleString()}₫
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                              {remainStaff.toLocaleString()}₫
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                              {remainStaff.toLocaleString()}₫
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                const payroll = payrolls.find(
                  (p) => p.id === paymentPayrollId
                );
                if (!payroll) return;
                const now = new Date();
                const formattedDate = now.toLocaleString();
                const unpaidDetails = payroll.details.filter(
                  (d) =>
                    d.totalAmount > d.paidAmount &&
                    selectedPaymentStaffIds.includes(d.staffId)
                );
                if (unpaidDetails.length === 0) {
                  setPaymentDialogOpen(false);
                  return;
                }
                const updates = unpaidDetails.map((d) => {
                  const remainStaff =
                    d.totalAmount - d.paidAmount;
                  const payment: PayrollPayment = {
                    id: `PC-${Date.now()}-${d.staffId}`,
                    date: formattedDate,
                    staffName: d.staffName,
                    amount: remainStaff,
                    note:
                      paymentNote ||
                      "Thanh toán bảng lương",
                    method: paymentMethod,
                    bankAccount:
                      paymentMethod === "transfer"
                        ? paymentBankAccount || undefined
                        : undefined,
                    bankName:
                      paymentMethod === "transfer"
                        ? paymentBankName || undefined
                        : undefined,
                  };
                  return { detail: d, remainStaff, payment };
                });
                setPayrolls((prev) =>
                  prev.map((item) => {
                    if (item.id !== payroll.id) return item;
                    let added = 0;
                    const updatedDetails = item.details.map((d) => {
                      const found = updates.find(
                        (u) => u.detail.staffId === d.staffId
                      );
                      if (!found) return d;
                      added += found.remainStaff;
                      return {
                        ...d,
                        paidAmount:
                          d.paidAmount + found.remainStaff,
                      };
                    });
                    const payments = [
                      ...(item.payments || []),
                      ...updates.map((u) => u.payment),
                    ];
                    return {
                      ...item,
                      details: updatedDetails,
                      paidAmount: item.paidAmount + added,
                      payments,
                    };
                  })
                );
                setPaymentDialogOpen(false);
                setSelectedPaymentStaffIds([]);
              }}
            >
              Tạo phiếu chi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
