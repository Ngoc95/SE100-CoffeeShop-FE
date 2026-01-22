import React, { useMemo, useState, useEffect } from "react";
import { Calculator, ChevronDown, ChevronUp, Plus, X, FileSpreadsheet, RefreshCw, Download } from "lucide-react";
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
import { useAuth } from "../../contexts/AuthContext";
import type { TimekeepingEntry } from "./TimekeepingBoard";
import payrollApi from "../../api/payrollApi";
import timekeepingApi from "../../api/timekeepingApi";
import { Payroll, Payslip, CreatePayrollDto, PayrollPayment } from "../../types/payroll";
import { toast } from 'sonner';
import { Shift } from "../../types/hr";

// Helper types for UI
interface PayrollUI extends Payroll {
  workRange: string;
  payslips: PayslipUI[];
  payments: PayrollPayment[];
}

interface PayslipUI extends Payslip {
  overtimeAmount: number;
  staffName: string;
  finalAmount: number;
  remainingAmount: number;
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
  if (!value) return "";
  if (value.includes("T")) {
    const date = new Date(value);
    return formatDateDMY(date);
  }
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
  shifts: Shift[]
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
      salarySettings.shifts.find((sh: any) => sh.id.toString() === entry.shiftId.toString()) ||
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
  shifts: Shift[],
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
  shifts: Shift[];
  staffList?: any[];
}

export function PayrollBoard({ timekeepingData, shifts, staffList }: PayrollBoardProps) {
  const [payrolls, setPayrolls] = useState<PayrollUI[]>([]);
  
  // State for creation ONLY
  const monthlyOptions = useMemo(buildMonthlyOptions, []);
  const [createMonth, setCreateMonth] = useState(
    monthlyOptions[Math.max(monthlyOptions.length - 3, 0)]?.value || monthlyOptions[0]?.value
  );

  const [fetchedTimekeeping, setFetchedTimekeeping] = useState<TimekeepingData | undefined>(undefined);

  const fetchTimekeepingForBreakdown = async (startDate: string, endDate: string) => {
    try {
        console.log("Fetching timekeeping for breakdown:", startDate, endDate);
        // Ensure dates are ISO format for API
        const sDate = new Date(startDate).toISOString();
        const eDate = new Date(endDate).toISOString();

        const res = await timekeepingApi.getAll({
            from: sDate,
            to: eDate
        });
        const entries = (res.data as any).metaData || res.data;
        if (Array.isArray(entries)) {
             // Convert to TimekeepingData structure
             const newData: TimekeepingData = {};
             entries.forEach((entry: any) => {
                 // API might return date string, ensure we key it correctly matching SalaryBreakdownModal expectation
                 // SalaryBreakdownModal expects keys to be ISO strings usually, or whatever is in the loop. 
                 // It matches `dateStr < fromStr` ... using `date.split("T")[0]`
                 
                 const dateKey = entry.date; // Should be ISO string from backend
                 const shiftId = entry.shiftId.toString();
                 const staffId = entry.staffId.toString();
                 
                 if (!newData[dateKey]) newData[dateKey] = {};
                 if (!newData[dateKey][shiftId]) newData[dateKey][shiftId] = {};
                 
                 newData[dateKey][shiftId][staffId] = {
                     id: entry.id,
                     staffId: staffId,
                     shiftId: shiftId,
                     date: entry.date,
                     checkIn: entry.checkIn,
                     checkOut: entry.checkOut,
                     status: entry.status,
                     note: entry.note
                 } as any;
             });
             console.log("Fetched Timekeeping Data:", newData);
             setFetchedTimekeeping(newData);
        } else {
            console.warn("API response is not an array:", entries);
        }
    } catch (err) {
        console.error("Error fetching timekeeping for breakdown", err);
        toast.error("Không thể tải dữ liệu chấm công chi tiết");
    }
  };

  const staffArray = useMemo(() => {
    return (staffList || [])
      .filter((s: any) => s.position !== "manager")
      .map((s: any) => {
          // Adapt backend salarySetting to frontend salarySettings
          const backendSetting = s.salarySetting;
          let salarySettings = undefined;
          
          if (backendSetting) {
              const isFixed = backendSetting.salaryType === 'monthly';
              salarySettings = {
                  salaryType: isFixed ? 'fixed' : 'shift',
                  salaryAmount: backendSetting.baseRate?.toString() || '0',
                  shifts: shifts.map(shift => ({
                      id: shift.id,
                      name: shift.name,
                      salaryPerShift: backendSetting.baseRate?.toString() || '0',
                      saturdayCoeff: '1',
                      sundayCoeff: '1',
                      dayOffCoeff: '1',
                      holidayCoeff: '1'
                  }))
              };
          }

          return {
            id: s.id.toString(),
            fullName: s.fullName,
            salarySettings: salarySettings,
            position: s.position,
            staffCode: s.staffCode
          };
      });
  }, [staffList, shifts]);
  
  // Fetch Payrolls on mount (all)
  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await payrollApi.getAll({});
      const mapped: PayrollUI[] = (res.data as any).metaData.map((p: any) => {
        const payslips: PayslipUI[] = (p.payslips || []).map((ps: Payslip) => ({
            ...ps,
            staffName: ps.staff?.fullName || `Staff ${ps.staffId}`,
            finalAmount: Number(ps.totalSalary),
            paidAmount: Number(ps.paidAmount || 0),
            remainingAmount: Number(ps.totalSalary) - Number(ps.paidAmount)
        }));

        return {
            id: p.id,
            code: p.code || `BL${p.id}`,
            name: p.name || `Bảng lương ${p.month}/${p.year}`,
            periodType: 'monthly',
            periodStart: p.periodStart || new Date().toISOString(),
            periodEnd: p.periodEnd || new Date().toISOString(),
            workRange: p.periodStart ? `${formatDateStringDMY(p.periodStart)} - ${formatDateStringDMY(p.periodEnd)}` : '',
            totalAmount: Number(p.totalAmount),
            paidAmount: Number(p.paidAmount || 0),
            status: (p.status === 'finalized' || p.status === 'closed' || p.status === 'CLOSED') ? 'finalized' : 'draft',
            createdAt: p.createdAt,
            payslips,
            payments: payslips.flatMap(ps => (ps.payments || []).map((pm: any) => ({
                ...pm,
                staffName: ps.staffName, // Mapped in payslips
                amount: Number(pm.amount),
                payslipId: ps.id,
                financeTransaction: pm.financeTransaction
            }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        };
      });

      setPayrolls(mapped);
    } catch (error) {
       console.error("Fetch payrolls error", error);
       toast.error("Không thể tải bảng lương");
    }
  };



  const [expandedPayrollId, setExpandedPayrollId] = useState<number | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentPayrollId, setPaymentPayrollId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentBankAccount, setPaymentBankAccount] = useState("");
  const [paymentBankName, setPaymentBankName] = useState("");
  const [selectedPaymentStaffIds, setSelectedPaymentStaffIds] = useState<
    number[]
  >([]);

  const { hasPermission } = useAuth();
  const canView = hasPermission('staff_payroll:view');
  const canCreate = hasPermission('staff_payroll:create');
  const canUpdate = hasPermission('staff_payroll:update');
  const canDelete = hasPermission('staff_payroll:delete');
  const canPayment = hasPermission('staff_payroll:update'); 

  if (!canView) return null; 

  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [periodType, setPeriodType] = useState<"monthly" | "custom">("monthly");

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: number } | null>(null);

  // New states for salary breakdown modal
  const [breakdownStaffId, setBreakdownStaffId] = useState<string | null>(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);

  /* State definitions end */

  /* Helper functions using state */
  const fetchPayrollDetails = async (id: number) => {
    try {
        const res = await payrollApi.getPayslips(id);
        const payslipsData = (res.data as any).metaData || [];
        const payslips: PayslipUI[] = payslipsData.map((ps: Payslip) => ({
            ...ps,
            staffName: ps.staff?.fullName || `Staff ${ps.staffId}`,
            finalAmount: Number(ps.totalSalary),
            remainingAmount: Number(ps.totalSalary) - Number(ps.paidAmount)
        }));
        
        setPayrolls(prev => prev.map(item => {
            if (item.id === id) {
                 const payments = payslips.flatMap(ps => (ps.payments || []).map((pm: any) => ({
                    ...pm,
                    staffName: ps.staffName,
                    amount: Number(pm.amount),
                    payslipId: ps.id,
                    financeTransaction: pm.financeTransaction
                 }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                 return { ...item, payslips, payments };
            }
            return item;
        }));
    } catch (err) {
        console.log(err);
        toast.error("Lỗi tải chi tiết");
    }
  };

  // Restore details if expandedPayrollId exists but details are missing (e.g. after reload)
  useEffect(() => {
    if (expandedPayrollId) {
        const p = payrolls.find(item => item.id === expandedPayrollId);
        if (p && p.payslips.length === 0) {
            fetchPayrollDetails(expandedPayrollId);
        }
    }
  }, [expandedPayrollId, payrolls]);

  const persistPayrolls = (items: PayrollUI[]) => {
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
      const found = monthlyOptions.find((m) => m.value === createMonth);
      return found?.range || "";
    }
    if (customFrom && customTo) {
      return `${formatDateStringDMY(customFrom)} - ${formatDateStringDMY(
        customTo
      )}`;
    }
    return "";
  };

  const handleCreatePayroll = async () => {
    // Only supports monthly for now as per API DTO
    if (periodType !== 'monthly') {
        toast.error("Hiện tại chỉ hỗ trợ bảng lương theo tháng");
        return;
    }
    
    const [year, month] = createMonth.split('-').map(Number); // value is "2023-10"

    try {
        await payrollApi.create({ month, year });
        toast.success("Đã tạo bảng lương thành công");
        setCreateDialogOpen(false);
        fetchPayrolls();
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || "Lỗi không xác định";
        toast.error("Lỗi khi tạo bảng lương: " + msg);
        console.error(error);
    }
  };

  const workRangeText = getWorkRange();

  const handleReloadPayroll = async (payrollId: number) => {
    try {
        await payrollApi.reload(payrollId);
        toast.success("Đã tải lại bảng lương");
        fetchPayrolls();
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Lỗi tải lại");
    }
  };

  const handleDeletePayroll = async () => {
    if (!deleteData) return;
    try {
        await payrollApi.delete(deleteData.id);
        toast.success("Đã xóa bảng lương");
        setDeleteData(null);
        fetchPayrolls();
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Lỗi xóa bảng lương");
    }
  };

  const handleExport = async (payrollId: number) => {
      try {
          const response = await payrollApi.export(payrollId);
          const date = new Date();
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Bang_luong_${payrollId}_${date.getTime()}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success("Xuất file thành công");
      } catch (error) {
          toast.error("Lỗi xuất file");
      }
  };

  const handleUpdateDetails = async (payrollId: number, updatedDetails: { staffId: string; bonus: number; penalty: number }[]) => {
      try {
          const promises = updatedDetails.map(d => 
              payrollApi.updatePayslip(payrollId, Number(d.staffId), {
                  bonus: d.bonus,
                  penalty: d.penalty
              })
          );
          await Promise.all(promises);
          toast.success("Đã cập nhật chi tiết");
          fetchPayrolls();
      } catch (err) {
          toast.error("Lỗi cập nhật");
      }
  };

  const handleFinalizePayroll = async (payrollId: number) => {
     try {
         await payrollApi.finalize(payrollId);
         toast.success("Đã chốt bảng lương");
         fetchPayrolls();
     } catch (err) {
         toast.error("Lỗi khi chốt bảng lương");
     }
  };

  const selectedPayroll = payrolls.find(p => p.id === selectedPayrollId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Danh sách bảng lương
        </CardTitle>
        <div className="flex items-center gap-4">

          {canCreate && (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Bảng tính lương
            </Button>
          )}
        </div>
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
                      onClick={async () => {
                         if (expandedPayrollId === p.id) {
                            setExpandedPayrollId(null);
                         } else {
                            // Optimistically expand, effect will load data if missing
                            setExpandedPayrollId(p.id);
                         // Also trigger load immediately if we know it's missing (optimization)
                            if (p.payslips.length === 0) {
                                await fetchPayrollDetails(p.id);
                            }
                         }
                      }
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
                          {p.code}
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
                                    {p.code}
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
                                  onClick={() => handleExport(p.id)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Xuất Excel
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
                                        const eligiblePayslips = p.payslips.filter(
                                            (d) => (d.finalAmount || d.totalAmount || 0) > (d.paidAmount || 0)
                                        );
                                        setSelectedPaymentStaffIds(
                                          eligiblePayslips.map((d) => d.staffId) // d.staffId is number now
                                        );
                                         // ... logic update needed for setPaymentAmounts keys if number ...
                                        setPaymentDialogOpen(true);
                                        const initialAmounts: Record<string, string> = {};
                                        p.payslips.forEach(d => {
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
                                      {p.payslips.map((d) => {
                                        const final = d.finalAmount || d.totalAmount || 0;
                                        const paid = d.paidAmount || 0;
                                        const remaining = final - paid;
                                        return (
                                          <tr key={d.staffId}>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                              {d.code}
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
                                          Mã phiếu
                                        </th>
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
                                          <td className="px-4 py-2 text-sm font-medium text-blue-600">
                                            {pm.financeTransaction?.code || "---"}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-900">
                                            {formatDateStringDMY(
                                              pm.createdAt.split("T")[0]
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-900">
                                            {(pm as any).staffName}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-700">
                                            {pm.method === "cash"
                                              ? "Tiền mặt"
                                              : "Chuyển khoản"}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-right font-medium text-slate-900">
                                            {pm.amount.toLocaleString()}₫
                                          </td>
                                          <td className="px-4 py-2 text-sm text-slate-500 pl-4">
                                            {pm.note}
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
              <Label>Chọn tháng</Label>
              <Select value={createMonth} onValueChange={setCreateMonth}>
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
                type="date"
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
                        
                        return currentPayroll.payslips
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
              onClick={async () => {
                if (!paymentPayrollId) return;

                try {
                    for (const staffId of selectedPaymentStaffIds) {
                        const amountStr = paymentAmounts[staffId] || "0";
                        const amount = Number(amountStr.replace(/,/g, ''));
                        // Skip zero amounts if desired, or let backend handle
                        if (amount <= 0) continue;

                        await payrollApi.addPayment(paymentPayrollId, {
                            staffId,
                            amount,
                            method: paymentMethod,
                            note: paymentNote,
                            bankAccount: paymentBankAccount,
                            bankName: paymentBankName
                        });
                    }

                    toast.success("Thanh toán thành công");
                    
                    setPaymentDialogOpen(false);
                    // Refresh data from server to ensure accuracy
                    await fetchPayrolls();
                    await fetchPayrollDetails(paymentPayrollId);
                    
                } catch (err: any) {
                    console.error(err);
                    toast.error(err.response?.data?.message || "Lỗi thanh toán");
                }
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
            workRange={`${formatDateStringDMY(formatISODate(new Date(selectedPayroll.periodStart)))} - ${formatDateStringDMY(formatISODate(new Date(selectedPayroll.periodEnd)))}`}
            details={selectedPayroll.payslips.map(d => ({
              ...d,
              staffId: d.staffId.toString(),
              baseSalary: Number(d.baseSalary || 0),
              totalAmount: Number(d.totalSalary || 0),
              overtimeAmount: d.overtimeAmount || 0,
              bonus: d.bonus || 0,
              penalty: d.penalty || 0,
              finalAmount: d.finalAmount || Number(d.totalSalary) || 0,
              paidAmount: d.paidAmount || 0,
              remainingAmount: d.remainingAmount || ((d.finalAmount || Number(d.totalSalary) || 0) - (d.paidAmount || 0))
            }))}
            status={selectedPayroll.status}
            onSave={(updatedDetails) => handleUpdateDetails(selectedPayroll.id, updatedDetails)}
            onFinalize={() => handleFinalizePayroll(selectedPayroll.id)}
            onViewBreakdown={(staffId) => {
               setBreakdownStaffId(staffId);
               setBreakdownModalOpen(true);
            }}
            readOnly={!canUpdate || selectedPayroll.status === 'finalized'}
          />

          <SalaryBreakdownModal
            open={breakdownModalOpen}
            onOpenChange={setBreakdownModalOpen}
            staff={staffArray.find(s => s.id === breakdownStaffId) || null}
            timekeepingData={fetchedTimekeeping || timekeepingData}
            shifts={shifts}
            periodStart={new Date(selectedPayroll.periodStart)}
            periodEnd={new Date(selectedPayroll.periodEnd)}
          />
        </>
      )}

      <AlertDialog open={!!deleteData} onOpenChange={(open: boolean) => !open && setDeleteData(null)}>
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

            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
