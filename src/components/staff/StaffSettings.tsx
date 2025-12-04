import { useState } from "react";
import * as React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";

export function StaffSettings() {
  const [lateEarlyDialogOpen, setLateEarlyDialogOpen] = useState(false);
  const [overtimeDialogOpen, setOvertimeDialogOpen] = useState(false);
  const [payrollDateDialogOpen, setPayrollDateDialogOpen] = useState(false);

  const [lateEarlySettings, setLateEarlySettings] = useState({
    lateEnabled: false,
    earlyEnabled: false,
    lateMinutes: "",
    earlyMinutes: "",
  });

  const [overtimeSettings, setOvertimeSettings] = useState({
    beforeShiftEnabled: false,
    beforeShiftMinutes: "",
    afterShiftEnabled: false,
    afterShiftMinutes: "",
  });

  const [payrollDate, setPayrollDate] = useState("1");

  const payrollDateOptions = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Ngày ${i + 1}`,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Thiết lập</h1>
        <p className="text-slate-600">
          Thiết lập các thông số để tối ưu vận hành và tính lương cho nhân viên
        </p>
      </div>

      <div className="space-y-4">
        {/* Cài đặt đi muộn - về sớm */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Cài đặt đi muộn - về sớm
                </h3>
                <p className="text-sm text-slate-600">
                  Cài đặt thời gian tối đa được đi muộn hoặc về sớm
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLateEarlyDialogOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              >
                Chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cài đặt làm thêm giờ */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Cài đặt làm thêm giờ
                </h3>
                <p className="text-sm text-slate-600">
                  Tính làm thêm giờ cho nhân viên khi vào ca sớm hoặc tan ca
                  muộn
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setOvertimeDialogOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              >
                Chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ngày tính lương */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Ngày tính lương
                </h3>
                <p className="text-sm text-slate-600">
                  Ngày bắt đầu tính công cho nhân viên có kỳ lương hàng tháng
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setPayrollDateDialogOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              >
                Chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Late/Early Settings Dialog */}
      <Dialog open={lateEarlyDialogOpen} onOpenChange={setLateEarlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cài đặt đi muộn - về sớm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="late-enabled"
                checked={lateEarlySettings.lateEnabled}
                onCheckedChange={(checked) =>
                  setLateEarlySettings({
                    ...lateEarlySettings,
                    lateEnabled: !!checked,
                  })
                }
              />
              <Label htmlFor="late-enabled" className="flex-1 cursor-pointer">
                Tính đi muộn sau
              </Label>
              <Input
                type="number"
                value={lateEarlySettings.lateMinutes}
                onChange={(e) =>
                  setLateEarlySettings({
                    ...lateEarlySettings,
                    lateMinutes: e.target.value,
                  })
                }
                placeholder="0"
                className="w-24"
                disabled={!lateEarlySettings.lateEnabled}
              />
              <span className="text-sm text-slate-600">phút</span>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="early-enabled"
                checked={lateEarlySettings.earlyEnabled}
                onCheckedChange={(checked) =>
                  setLateEarlySettings({
                    ...lateEarlySettings,
                    earlyEnabled: !!checked,
                  })
                }
              />
              <Label htmlFor="early-enabled" className="flex-1 cursor-pointer">
                Tính về sớm trước
              </Label>
              <Input
                type="number"
                value={lateEarlySettings.earlyMinutes}
                onChange={(e) =>
                  setLateEarlySettings({
                    ...lateEarlySettings,
                    earlyMinutes: e.target.value,
                  })
                }
                placeholder="0"
                className="w-24"
                disabled={!lateEarlySettings.earlyEnabled}
              />
              <span className="text-sm text-slate-600">phút</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLateEarlyDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Save logic here
                setLateEarlyDialogOpen(false);
              }}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overtime Settings Dialog */}
      <Dialog open={overtimeDialogOpen} onOpenChange={setOvertimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cài đặt làm thêm giờ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="before-shift-enabled"
                checked={overtimeSettings.beforeShiftEnabled}
                onCheckedChange={(checked) =>
                  setOvertimeSettings({
                    ...overtimeSettings,
                    beforeShiftEnabled: !!checked,
                  })
                }
              />
              <Label
                htmlFor="before-shift-enabled"
                className="flex-1 cursor-pointer"
              >
                Tính làm thêm giờ trước ca
              </Label>
              <Input
                type="number"
                value={overtimeSettings.beforeShiftMinutes}
                onChange={(e) =>
                  setOvertimeSettings({
                    ...overtimeSettings,
                    beforeShiftMinutes: e.target.value,
                  })
                }
                placeholder="0"
                className="w-24"
                disabled={!overtimeSettings.beforeShiftEnabled}
              />
              <span className="text-sm text-slate-600">phút</span>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="after-shift-enabled"
                checked={overtimeSettings.afterShiftEnabled}
                onCheckedChange={(checked) =>
                  setOvertimeSettings({
                    ...overtimeSettings,
                    afterShiftEnabled: !!checked,
                  })
                }
              />
              <Label
                htmlFor="after-shift-enabled"
                className="flex-1 cursor-pointer"
              >
                Tính làm thêm giờ sau ca
              </Label>
              <Input
                type="number"
                value={overtimeSettings.afterShiftMinutes}
                onChange={(e) =>
                  setOvertimeSettings({
                    ...overtimeSettings,
                    afterShiftMinutes: e.target.value,
                  })
                }
                placeholder="0"
                className="w-24"
                disabled={!overtimeSettings.afterShiftEnabled}
              />
              <span className="text-sm text-slate-600">phút</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOvertimeDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Save logic here
                setOvertimeDialogOpen(false);
              }}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payroll Date Dialog */}
      <Dialog
        open={payrollDateDialogOpen}
        onOpenChange={setPayrollDateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ngày tính lương</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="flex-1">
                Chọn ngày bắt đầu kỳ lương hàng tháng
              </Label>
              <Select value={payrollDate} onValueChange={setPayrollDate}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {payrollDateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayrollDateDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Save logic here
                setPayrollDateDialogOpen(false);
              }}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
