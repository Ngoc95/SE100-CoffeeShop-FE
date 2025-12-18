import React, { useMemo, useState } from "react";
import { Calculator, ChevronDown, ChevronUp, Plus, X, FileSpreadsheet, RefreshCw } from "lucide-react";
import { PayrollDetailModal } from "./PayrollDetailModal";
import { SalaryBreakdownModal } from "./SalaryBreakdownModal";
import { calculateStaffOvertime } from "./payrollHelpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
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
import { useAuth } from "../../contexts/AuthContext";
import type { TimekeepingEntry } from "./TimekeepingBoard";

interface PayrollDetail {
  staffId: string;
  staffName: string;
  totalAmount: number; // Lương cơ bản (theo ca hoặc cố định)
  overtimeAmount: number; // Tiền làm thêm
  bonus: number; // Thưởng
  penalty: number; // Phạt
  finalAmount: number; // Tổng lương = totalAmount + overtimeAmount + bonus - penalty
  paidAmount: number; // Đã trả
  remainingAmount: number; // Còn lại = finalAmount - paidAmount
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
  if (!salarySettings) return 0;

  const dateObj = new Date(entry.date);
  const dayType = getDayTypeFromDate(dateObj);

  // Lương theo ca (shift-based)
  if (salarySettings.salaryType === "shift") {
    const shiftSetting =
      salarySettings.shifts.find((sh) => sh.id === entry.shiftId) ||
      salarySettings.shifts[0];

    const basePerShift = parseCurrency(shiftSetting?.salaryPerShift);
    if (!basePerShift) return 0;

    let baseFactor = 1;

    // Nghỉ phép
    if (entry.status === "day-off") {
      if (entry.leaveType === "approved-leave") {
        baseFactor = parseCoefficient(shiftSetting?.dayOffCoeff, 0);
      } else {
        baseFactor = 0; // Nghỉ không phép = 0
      }
    } 
    // Hệ số theo ngày
    else if (dayType === "saturday") {
      baseFactor = parseCoefficient(shiftSetting?.saturdayCoeff, 1);
    } else if (dayType === "sunday") {
      baseFactor = parseCoefficient(shiftSetting?.sundayCoeff, 1);
    }

    let amount = basePerShift * baseFactor;

    // Tính overtime (chỉ cho lương theo ca) - Đã tách thành function riêng, nhưng vẫn giữ ở đây để tính tổng từng entry nếu cần
    // Tuy nhiên, logic mới là overtime tính riêng.
    // Nếu giữ logic cũ ở đây thì calculateStaffPayroll sẽ bao gồm cả overtime.
    // Để tránh double counting, ta sẽ loại bỏ overtime ở đây.
    
    // UPDATE: calculateEntryAmount chỉ nên trả về lương cơ bản của ca đó.
    // Overtime được tính riêng bằng calculateStaffOvertime.
    
    return amount;
  }
  
  // Lương cố định (fixed) - không tính theo ca
  return 0;
};

const calculateStaffPayroll = (
  staff: StaffMember,
  timekeepingData: TimekeepingData | undefined,
  shifts: { id: string; startTime: string; endTime: string }[],
  periodStart: Date,
  periodEnd: Date
) => {
  const salarySettings = staff.salarySettings;
  
  // Lương cố định - trả lương tháng cố định
  if (salarySettings?.salaryType === "fixed") {
    const monthlySalary = parseCurrency(salarySettings.salaryAmount);
    return monthlySalary;
  }

  // Lương theo ca - tính theo chấm công
  if (!timekeepingData || Object.keys(timekeepingData).length === 0) {
    return 0;
  }

  let total = 0;
  const fromStr = formatISODate(periodStart);
  const toStr = formatISODate(periodEnd);

  // Duyệt qua cấu trúc: timekeepingData[date][shiftId][staffId]
  Object.entries(timekeepingData).forEach(([date, shiftMap]) => {
    // Check if date in range
    const dateStr = date.split("T")[0];
    if (dateStr < fromStr || dateStr > toStr) {
      return;
    }

    Object.entries(shiftMap || {}).forEach(([shiftId, staffMap]) => {
      const entry = (staffMap as any)?.[staff.id];
      if (!entry || typeof entry !== "object") return;
      
      const amount = calculateEntryAmount(entry as TimekeepingEntry, staff, shifts);
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

  const { hasPermission } = useAuth();
  const canView = hasPermission('staff_payroll:view');
  const canCreate = hasPermission('staff_payroll:create');
  const canUpdate = hasPermission('staff_payroll:update');
  const canDelete = hasPermission('staff_payroll:delete');
  const canPayment = hasPermission('staff_payroll:payment');

  if (!canView) return null; // Or render "Access Denied"

  // Use string to support formatted input (comma separated)
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [periodType, setPeriodType] = useState<"monthly" | "custom">("monthly");
  const monthlyOptions = useMemo(buildMonthlyOptions, []);
  const [selectedMonth, setSelectedMonth] = useState(
    monthlyOptions[Math.max(monthlyOptions.length - 3, 0)]?.value ||
      monthlyOptions[0]?.value
  );
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  
  // New states for detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: string } | null>(null);

  // New states for salary breakdown modal
  const [breakdownStaffId, setBreakdownStaffId] = useState<string | null>(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);

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
        
        const overtimeAmount = Math.round(
          calculateStaffOvertime(s, timekeepingData, shifts, periodStart, periodEnd)
        );

        const bonus = 0;
        const penalty = 0;
        const finalAmount = totalAmount + overtimeAmount + bonus - penalty;
        const paidAmount = 0;
        const remainingAmount = finalAmount - paidAmount;
        
        return {
          staffId: s.id,
          staffName: s.fullName,
          totalAmount,
          overtimeAmount,
          bonus,
          penalty,
          finalAmount,
          paidAmount,
          remainingAmount,
        };
      });

    const totalAmount = details.reduce((sum, d) => sum + d.finalAmount, 0);

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

  const handleReloadPayroll = (payrollId: string) => {
    const payroll = payrolls.find((p) => p.id === payrollId);
    if (!payroll) return;

    const parts = payroll.workRange.split(" - ");
    if (parts.length !== 2) return;

    const start = parseDMYToDate(parts[0]);
    const end = parseDMYToDate(parts[1]);

    if (!start || !end) return;

    const existingDetailsMap = new Map(payroll.details.map((d) => [d.staffId, d]));

    const newDetails: PayrollDetail[] = staffMembers
      .filter((s) => s.position !== "manager")
      .slice(0, 4)
      .map((s) => {
        const totalAmount = Math.round(
          calculateStaffPayroll(s, timekeepingData, shifts, start, end)
        );
        const overtimeAmount = Math.round(
          calculateStaffOvertime(s, timekeepingData, shifts, start, end)
        );

        const existing = existingDetailsMap.get(s.id);
        const bonus = existing ? existing.bonus : 0;
        const penalty = existing ? existing.penalty : 0;
        const paidAmount = existing ? existing.paidAmount : 0;

        const finalAmount = totalAmount + overtimeAmount + bonus - penalty;
        const remainingAmount = finalAmount - paidAmount;

        return {
          staffId: s.id,
          staffName: s.fullName,
          totalAmount,
          overtimeAmount,
          bonus,
          penalty,
          finalAmount,
          paidAmount,
          remainingAmount,
        };
      });

    const newTotalAmount = newDetails.reduce((sum, d) => sum + d.finalAmount, 0);

    const updatedPayrolls = payrolls.map((p) => {
      if (p.id === payrollId) {
        return { ...p, details: newDetails, totalAmount: newTotalAmount };
      }
      return p;
    });

    persistPayrolls(updatedPayrolls);
  };

  const handleUpdateDetails = (payrollId: string, updatedDetails: PayrollDetail[]) => {
    const newTotalAmount = updatedDetails.reduce((sum, d) => sum + d.finalAmount, 0);
    
    const updatedPayrolls = payrolls.map(p => {
      if (p.id === payrollId) {
        return {
          ...p,
          details: updatedDetails,
          totalAmount: newTotalAmount
        };
      }
      return p;
    });
    
    persistPayrolls(updatedPayrolls);
  };

  const handleFinalizePayroll = (payrollId: string) => {
     const updatedPayrolls = payrolls.map(p => {
      if (p.id === payrollId) {
        return {
          ...p,
          status: "closed" as const
        };
      }
      return p;
    });
    persistPayrolls(updatedPayrolls);
  };

  const handleDeletePayroll = () => {
    if (!deleteData) return;
    const next = payrolls.filter((item) => item.id !== deleteData.id);
    persistPayrolls(next);
    if (expandedPayrollId === deleteData.id) {
      setExpandedPayrollId(null);
    }
    setDeleteData(null);
  };

  const selectedPayroll = payrolls.find(p => p.id === selectedPayrollId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Danh sách bảng lương
        </CardTitle>
        {canCreate && (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Bảng tính lương
          </Button>
        )}
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
                                      const remaining = (d.finalAmount || d.totalAmount || 0) - (d.paidAmount || 0);
                                      return [
                                        d.staffId,
                                        d.staffName,
                                        d.finalAmount || d.totalAmount || 0,
                                        d.paidAmount || 0,
                                        remaining,
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
                                {canDelete && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => setDeleteData({ id: p.id })}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Huỷ bảng lương
                                  </Button>
                                )}
                                {p.status === "draft" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                    onClick={() => handleReloadPayroll(p.id)}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Tải lại
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => {
                                    setSelectedPayrollId(p.id);
                                    setDetailModalOpen(true);
                                  }}
                                >
                                  Xem bảng lương
                                </Button>
                              </div>
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
                                      className="bg-blue-600 hover:bg-blue-700"
                                      disabled={!canPayment}
                                      onClick={() => {
                                        setPaymentPayrollId(p.id);
                                        setSelectedPaymentStaffIds(
                                          p.details
                                            .filter(
                                              (d) =>
                                                (d.finalAmount || d.totalAmount || 0) > (d.paidAmount || 0)
                                            )
                                            .map((d) => d.staffId)
                                        );
                                        setPaymentDialogOpen(true);
                                        const initialAmounts: Record<string, string> = {};
                                        p.details.forEach(d => {
                                           const final = d.finalAmount || d.totalAmount || 0;
                                           const paid = d.paidAmount || 0;
                                           const remaining = Math.max(0, final - paid);
                                           if (remaining > 0) {
                                               initialAmounts[d.staffId] = remaining.toLocaleString("en-US");
                                           }
                                        });
                                        setPaymentAmounts(initialAmounts);
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
                                          Mã phiếu
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Nhân viên
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Tổng lương
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Đã trả
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Còn lại
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {p.details.map((d) => {
                                        const final = d.finalAmount || d.totalAmount || 0;
                                        const paid = d.paidAmount || 0;
                                        const remaining = final - paid;
                                        return (
                                          <tr key={d.staffId}>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                              {p.id}-{d.staffId}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900">
                                              <div className="font-medium">{d.staffName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">
                                              {final.toLocaleString()}₫
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-slate-700">
                                              {paid.toLocaleString()}₫
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                                              {remaining.toLocaleString()}₫
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
                                          Ngày
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Nhân viên
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600">
                                          Hình thức
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs text-slate-600">
                                          Số tiền
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs text-slate-600 pl-4">
                                          Ghi chú
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {p.payments.map((pm) => (
                                        <tr key={pm.id}>
                                          <td className="px-4 py-2 text-sm text-slate-900">
                                            {formatDateStringDMY(
                                              pm.date.split("T")[0]
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-900">
                                            {pm.staffName}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-700">
                                            {pm.method === "cash"
                                              ? "Tiền mặt"
                                              : "Chuyển khoản"}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-right text-slate-900 font-medium">
                                            {pm.amount.toLocaleString()}₫
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-500 pl-4">
                                            {pm.note || "-"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
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
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo bảng tính lương</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Loại kỳ lương</Label>
              <RadioGroup
                value={periodType}
                onValueChange={(v: string) => setPeriodType(v as "monthly" | "custom")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Theo tháng</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Tùy chọn</Label>
                </div>
              </RadioGroup>
            </div>
            {periodType === "monthly" ? (
              <div className="space-y-2">
                <Label>Chọn tháng</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthlyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.range})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Từ ngày</Label>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Đến ngày</Label>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-medium">Kỳ làm việc: </span>
              {workRangeText}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreatePayroll}
              disabled={!workRangeText}
            >
              Tạo bảng lương
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Thanh toán lương</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label>Ngày thanh toán</Label>
              <Input
                type="datetime-local"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hình thức thanh toán</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v: string) =>
                  setPaymentMethod(v as "cash" | "transfer")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="transfer">Chuyển khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === "transfer" && (
              <>
                <div className="space-y-2">
                  <Label>Ngân hàng</Label>
                  <Input
                    placeholder="Tên ngân hàng"
                    value={paymentBankName}
                    onChange={(e) => setPaymentBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số tài khoản</Label>
                  <Input
                    placeholder="Số tài khoản"
                    value={paymentBankAccount}
                    onChange={(e) => setPaymentBankAccount(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="VD: Thanh toán lương tháng..."
              />
            </div>

            <div className="space-y-2">
               <Label>Danh sách nhân viên ({selectedPaymentStaffIds.length})</Label>
               <div className="border rounded-lg max-h-60 overflow-y-auto">
                 <Table>
                   <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead className="text-right">Còn lại</TableHead>
                        <TableHead className="text-right w-32">Thanh toán</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                     {(() => {
                        const currentPayroll = payrolls.find(p => p.id === paymentPayrollId);
                        if (!currentPayroll) return null;
                        
                        return currentPayroll.details
                          .filter(d => (d.finalAmount || d.totalAmount || 0) - (d.paidAmount || 0) > 0)
                          .map(d => {
                            const final = d.finalAmount || d.totalAmount || 0;
                            const paid = d.paidAmount || 0;
                            const remaining = final - paid;
                            const isSelected = selectedPaymentStaffIds.includes(d.staffId);
                            
                            return (
                               <TableRow key={d.staffId}>
                                 <TableCell>
                                   <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedPaymentStaffIds([...selectedPaymentStaffIds, d.staffId]);
                                        } else {
                                            setSelectedPaymentStaffIds(selectedPaymentStaffIds.filter(id => id !== d.staffId));
                                        }
                                      }}
                                      className="rounded border-slate-300"
                                   />
                                 </TableCell>
                                 <TableCell className="font-medium">{d.staffName}</TableCell>
                                 <TableCell className="text-right text-slate-500">{remaining.toLocaleString()}₫</TableCell>
                                 <TableCell>
                                   <Input
                                      type="text" 
                                      className="h-8 text-right"
                                      value={paymentAmounts[d.staffId] || "0"}
                                      disabled={!isSelected}
                                      onChange={(e) => {
                                          const val = e.target.value;
                                          // Format immediately
                                          const cleanVal = val.replace(/[^\d.]/g, "");
                                          if ((cleanVal.match(/\./g) || []).length > 1) return;
                                          
                                          const [intPart, decPart] = cleanVal.split(".");
                                          const formattedInt = intPart ? Number(intPart).toLocaleString("en-US") : "";
                                          let formatted = formattedInt;
                                          if (decPart !== undefined) formatted += "." + decPart;
                                          if (cleanVal === "") formatted = "";
                                          
                                          setPaymentAmounts({...paymentAmounts, [d.staffId]: formatted});
                                      }}
                                      onFocus={(e) => e.target.select()}
                                   />
                                 </TableCell>
                               </TableRow>
                            );
                          });
                     })()}
                   </TableBody>
                 </Table>
               </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (!paymentPayrollId) return;

                const currentPayroll = payrolls.find(p => p.id === paymentPayrollId);
                if (!currentPayroll) return;

                const newPayments: PayrollPayment[] = selectedPaymentStaffIds.map(
                  (staffId) => {
                      const detail = currentPayroll.details.find(d => d.staffId === staffId);
                      const amountStr = paymentAmounts[staffId] || "0";
                      const amount = Number(amountStr.replace(/,/g, ''));
  
                      return {
                        id: `PAY${Date.now()}${staffId}`,
                        date: paymentDate,
                        staffName: detail?.staffName || "",
                        amount,
                        note: paymentNote,
                        method: paymentMethod,
                        bankAccount: paymentBankAccount,
                        bankName: paymentBankName,
                      };
                    }
                  );
  
                  const updatedDetails = currentPayroll.details.map((d) => {
                    if (selectedPaymentStaffIds.includes(d.staffId)) {
                      const amountStr = paymentAmounts[d.staffId] || "0";
                      const amount = Number(amountStr.replace(/,/g, ''));
                      
                      const paid = d.paidAmount || 0;
                      const final = d.finalAmount || d.totalAmount || 0;
                      
                      const newPaid = paid + amount;
                      const newRemaining = final - newPaid;

                      return {
                        ...d,
                        paidAmount: newPaid,
                        remainingAmount: newRemaining
                      };
                    }
                    return d;
                  });

                const updatedPayroll: PayrollItem = {
                  ...currentPayroll,
                  details: updatedDetails,
                  paidAmount: updatedDetails.reduce((sum, d) => sum + d.paidAmount, 0),
                  payments: [...(currentPayroll.payments || []), ...newPayments],
                };

                const nextPayrolls = payrolls.map((p) =>
                  p.id === paymentPayrollId ? updatedPayroll : p
                );
                
                persistPayrolls(nextPayrolls);
                setPaymentDialogOpen(false);
              }}
            >
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedPayroll && (
        <>
          <PayrollDetailModal
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            payrollName={selectedPayroll.name}
            workRange={selectedPayroll.workRange}
            details={selectedPayroll.details.map(d => ({
              ...d,
              overtimeAmount: d.overtimeAmount || 0,
              bonus: d.bonus || 0,
              penalty: d.penalty || 0,
              finalAmount: d.finalAmount || d.totalAmount || 0,
              paidAmount: d.paidAmount || 0,
              remainingAmount: d.remainingAmount || ((d.finalAmount || d.totalAmount || 0) - (d.paidAmount || 0))
            }))}
            status={selectedPayroll.status}
            onSave={(updatedDetails) => handleUpdateDetails(selectedPayroll.id, updatedDetails)}
            onFinalize={() => handleFinalizePayroll(selectedPayroll.id)}
            onViewBreakdown={(staffId) => {
               setBreakdownStaffId(staffId);
               setBreakdownModalOpen(true);
            }}
            readOnly={!canUpdate}
          />

          <SalaryBreakdownModal
            open={breakdownModalOpen}
            onOpenChange={setBreakdownModalOpen}
            staff={staffMembers.find(s => s.id === breakdownStaffId) || null}
            timekeepingData={timekeepingData}
            shifts={shifts}
            periodStart={(() => {
              const parts = selectedPayroll.workRange.split(" - ");
              return parseDMYToDate(parts[0]) || new Date();
            })()}
            periodEnd={(() => {
               const parts = selectedPayroll.workRange.split(" - ");
               return parseDMYToDate(parts[1]) || new Date();
            })()}
          />
        </>
      )}

      <AlertDialog open={!!deleteData} onOpenChange={(open) => !open && setDeleteData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bảng lương</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bảng lương này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeletePayroll}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
