import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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

interface PayrollDetail {
  staffId: string;
  staffName: string;
  baseSalary: number;
  totalAmount: number;
  bonus: number;
  penalty: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overtimeAmount?: number; // Tiền làm thêm
}

interface PayrollDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollName: string;
  workRange: string;
  details: PayrollDetail[];
  status: "draft" | "finalized";
  onSave: (details: PayrollDetail[]) => Promise<void> | void;
  onFinalize: () => Promise<void> | void;
  onViewBreakdown?: (staffId: string) => void;
  readOnly?: boolean;
}

interface LocalPayrollDetail extends PayrollDetail {
  bonusStr: string;
  penaltyStr: string;
}

export function PayrollDetailModal({
  open,
  onOpenChange,
  payrollName,
  workRange,
  details,
  status,
  onSave,
  onFinalize,
  onViewBreakdown,
  readOnly = false,
}: PayrollDetailModalProps) {
  const [localDetails, setLocalDetails] = useState<LocalPayrollDetail[]>(() =>
    details.map((d) => ({
      ...d,
      bonusStr: d.bonus === 0 ? "0" : d.bonus.toLocaleString(),
      penaltyStr: d.penalty === 0 ? "0" : d.penalty.toLocaleString(),
    }))
  );
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

  // Update local state when details prop changes
  React.useEffect(() => {
    setLocalDetails(
      details.map((d) => ({
        ...d,
        bonusStr: d.bonus === 0 ? "0" : d.bonus.toLocaleString(),
        penaltyStr: d.penalty === 0 ? "0" : d.penalty.toLocaleString(),
      }))
    );
  }, [details]);

  const handleBonusChange = (staffId: string, value: string) => {
    // Remove all non-digit and non-decimal characters
    const cleanValue = value.replace(/[^\d.]/g, "");
    
    // Prevent multiple decimals
    if ((cleanValue.match(/\./g) || []).length > 1) return;

    const numValue = cleanValue === "" || cleanValue === "." ? 0 : Number(cleanValue);
    
    // Format logic:
    // Split integer and decimal parts
    const [intPart, decPart] = cleanValue.split(".");
    
    // Format integer part with commas
    // If intPart is empty but there's a decimal (e.g. ".5"), treat int as "0" visually? 
    // Usually input "0.5" types as "0." then "0.5".
    // intPart "" -> let's keep it "" if user is typing? No, Number("") is 0.
    // Use BigInt/Intl logic or simple regex
    const formattedInt = intPart ? Number(intPart).toLocaleString("en-US") : "";
    
    // Check if input started with "0" and is just "0" or "0." -> keep it simple
    // Actually, "05" -> Number -> 5 -> "5". It strips leading zero. This is desired.
    // If user types "0.", Number("0") is 0. formattedInt is "0". Result "0.". Correct.
    
    let formattedValue = formattedInt;
    if (decPart !== undefined) {
      formattedValue += "." + decPart;
    }
    
    // Special case: if input is empty, clear it
    if (cleanValue === "") formattedValue = "";

    setLocalDetails((prev) =>
      prev.map((d) => {
        if (d.staffId === staffId) {
          const finalAmount = d.baseSalary + numValue - d.penalty;
          const remainingAmount = finalAmount - d.paidAmount;
          return { ...d, bonus: numValue, bonusStr: formattedValue, finalAmount, remainingAmount };
        }
        return d;
      })
    );
  };

  const handleBonusBlur = (staffId: string) => {
    setLocalDetails((prev) =>
      prev.map((d) => {
        if (d.staffId === staffId) {
          return { ...d, bonusStr: d.bonus === 0 ? "0" : d.bonus.toLocaleString() };
        }
        return d;
      })
    );
  };

  const handlePenaltyChange = (staffId: string, value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "");
    
    if ((cleanValue.match(/\./g) || []).length > 1) return;

    const numValue = cleanValue === "" || cleanValue === "." ? 0 : Number(cleanValue);

    const [intPart, decPart] = cleanValue.split(".");
    const formattedInt = intPart ? Number(intPart).toLocaleString("en-US") : "";
    
    let formattedValue = formattedInt;
    if (decPart !== undefined) {
      formattedValue += "." + decPart;
    }
    if (cleanValue === "") formattedValue = "";

    setLocalDetails((prev) =>
      prev.map((d) => {
        if (d.staffId === staffId) {
          const finalAmount = d.baseSalary + d.bonus - numValue;
          const remainingAmount = finalAmount - d.paidAmount;
          return { ...d, penalty: numValue, penaltyStr: formattedValue, finalAmount, remainingAmount };
        }
        return d;
      })
    );
  };

  const handlePenaltyBlur = (staffId: string) => {
    setLocalDetails((prev) =>
      prev.map((d) => {
        if (d.staffId === staffId) {
          return { ...d, penaltyStr: d.penalty === 0 ? "0" : d.penalty.toLocaleString() };
        }
        return d;
      })
    );
  };

  const handleSave = () => {
    onSave(localDetails.map(d => ({
        ...d,
        bonus: Number(d.bonus || 0),
        penalty: Number(d.penalty || 0)
    })));
    onOpenChange(false);
  };

  const handleFinalize = () => {
    setFinalizeDialogOpen(true);
  };

  const confirmFinalize = async () => {
    // 1. Save changes first
    const mappedDetails = localDetails.map(d => ({
        ...d,
        bonus: Number(d.bonus || 0),
        penalty: Number(d.penalty || 0)
    }));
    
    // We can show a loading state here if desired
    await onSave(mappedDetails);

    // 2. Then finalize
    await onFinalize();
    
    setFinalizeDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[2xl] max-h-[90vh] overflow-y-auto"
        style={{
          maxWidth: '60vw',
        }}>
          <DialogHeader>
            <DialogTitle className="text-xl">
              Chi tiết bảng lương - {payrollName}
            </DialogTitle>
            <p className="text-sm text-slate-600">Kỳ làm việc: {workRange}</p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      Nhân viên
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Lương chính
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Thưởng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Phạt
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Tổng lương
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Đã trả
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                      Còn lại
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localDetails.map((d) => (
                    <tr key={d.staffId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-slate-900">
                              {d.staffName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-900">
                        <button 
                          className="hover:underline hover:text-blue-600 font-medium"
                          onClick={() => onViewBreakdown?.(d.staffId)}
                        >
                          {d.baseSalary.toLocaleString()}₫
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right text-sm">
                        {status === "draft" && !readOnly ? (
                          <Input
                            type="text"
                            value={d.bonusStr}
                            onChange={(e) => handleBonusChange(d.staffId, e.target.value)}
                            onBlur={() => handleBonusBlur(d.staffId)}
                            onFocus={(e) => e.target.select()}
                            className="w-32 h-8 text-right"
                          />
                        ) : (
                          <span className="text-emerald-600">
                            {d.bonus.toLocaleString()}₫
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {status === "draft" && !readOnly ? (
                          <Input
                            type="text"
                            value={d.penaltyStr}
                            onChange={(e) => handlePenaltyChange(d.staffId, e.target.value)}
                            onBlur={() => handlePenaltyBlur(d.staffId)}
                            onFocus={(e) => e.target.select()}
                            className="w-32 h-8 text-right"
                          />
                        ) : (
                          <span className="text-red-600">
                            {d.penalty.toLocaleString()}₫
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {d.finalAmount.toLocaleString()}₫
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {d.paidAmount.toLocaleString()}₫
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                        {d.remainingAmount.toLocaleString()}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Tổng lương cần trả</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {localDetails
                      .reduce((sum, d) => sum + Number(d.finalAmount || 0), 0)
                      .toLocaleString()}
                    ₫
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">Đã thanh toán</div>
                  <div className="text-lg font-semibold text-emerald-600">
                    {localDetails
                      .reduce((sum, d) => sum + Number(d.paidAmount || 0), 0)
                      .toLocaleString()}
                    ₫
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">Còn lại</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {localDetails
                      .reduce((sum, d) => sum + Number(d.remainingAmount || 0), 0)
                      .toLocaleString()}
                    ₫
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            {status === "draft" && !readOnly && (
              <>
                <Button variant="outline" onClick={handleSave}>
                  Lưu tạm
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleFinalize}
                >
                  Chốt lương
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize Confirmation Dialog */}
      <AlertDialog open={finalizeDialogOpen} onOpenChange={setFinalizeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chốt lương</AlertDialogTitle>
            <AlertDialogDescription>
              Sau khi chốt lương, bạn sẽ không thể chỉnh sửa thưởng/phạt. Bạn có chắc chắn muốn
              chốt bảng lương này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={confirmFinalize}
            >
              Chốt lương
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
