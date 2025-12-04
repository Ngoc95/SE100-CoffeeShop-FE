import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  Info,
  Clock,
  PowerOff,
  Power,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

// Generate time options from 00:00 to 23:45 with 15-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      options.push(timeString);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  active?: boolean;
}

interface ShiftManagementProps {
  shifts: Shift[];
  setShifts: (shifts: Shift[]) => void;
}

export function ShiftManagement({ shifts, setShifts }: ShiftManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Shift>>({
    name: "",
    startTime: "",
    endTime: "",
    checkInTime: "",
    checkOutTime: "",
    active: true,
  });

  const handleOpenDialog = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData(shift);
    } else {
      setEditingShift(null);
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        checkInTime: "",
        checkOutTime: "",
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      return;
    }

    if (editingShift) {
      // Update existing shift
      setShifts(
        shifts.map((s) =>
          s.id === editingShift.id ? ({ ...formData, id: s.id } as Shift) : s
        )
      );
    } else {
      // Create new shift
      const newShift: Shift = {
        ...(formData as Shift),
        id: Date.now().toString(),
      };
      setShifts([...shifts, newShift]);
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa ca làm việc này?")) {
      setShifts(shifts.filter((s) => s.id !== id));
    }
  };

  const calculateShiftDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    let hours = endHour - startHour;
    let mins = endMin - startMin;

    if (hours < 0) hours += 24; // Handle overnight shifts
    if (mins < 0) {
      hours -= 1;
      mins += 60;
    }

    return `${hours}`;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    return `${hour}:${minute}`;
  };

  // Calculate end time (start time + 4 hours)
  const calculateEndTime = (startTime: string) => {
    if (!startTime) return "";
    const [hour, minute] = startTime.split(":").map(Number);
    let endHour = hour + 4;
    if (endHour >= 24) endHour -= 24;
    return `${endHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate check-in time (start time - 1 hour)
  const calculateCheckInTime = (startTime: string) => {
    if (!startTime) return "";
    const [hour, minute] = startTime.split(":").map(Number);
    let checkInHour = hour - 1;
    if (checkInHour < 0) checkInHour += 24;
    return `${checkInHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate check-out time (end time + 1 hour)
  const calculateCheckOutTime = (endTime: string) => {
    if (!endTime) return "";
    const [hour, minute] = endTime.split(":").map(Number);
    let checkOutHour = hour + 1;
    if (checkOutHour >= 24) checkOutHour -= 24;
    return `${checkOutHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-900">
            Danh sách ca làm việc
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Cấu hình chi tiết cho từng ca làm việc
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm ca mới
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-16">STT</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Ca làm việc
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                </div>
              </TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Tổng thời gian làm việc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift, index) => (
              <TableRow key={shift.id}>
                <TableCell className="font-medium text-blue-600">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{shift.name}</TableCell>
                <TableCell>
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </TableCell>
                <TableCell>
                  {calculateShiftDuration(shift.startTime, shift.endTime)}h
                </TableCell>
                <TableCell>
                  {shift.active !== false ? (
                    <Badge className="bg-emerald-500">Hoạt động</Badge>
                  ) : (
                    <Badge variant="secondary">Ngừng hoạt động</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenDialog(shift)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(shift.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        shift.active !== false
                          ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      }
                      onClick={() => {
                        setShifts(
                          shifts.map((s) =>
                            s.id === shift.id
                              ? { ...s, active: !(s.active !== false) }
                              : s
                          )
                        );
                      }}
                      title={
                        shift.active !== false ? "Ngừng hoạt động" : "Hoạt động"
                      }
                    >
                      {shift.active !== false ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tên ca */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên</Label>
              <Input
                id="name"
                placeholder="VD: Ca sáng, Ca chiều..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Giờ làm việc */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Giờ làm việc</Label>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => {
                    // Only auto-calculate if creating new shift
                    if (!editingShift) {
                      const endTime = calculateEndTime(value);
                      const checkInTime = calculateCheckInTime(value);
                      const checkOutTime = calculateCheckOutTime(endTime);
                      setFormData({
                        ...formData,
                        startTime: value,
                        endTime: endTime,
                        checkInTime: checkInTime,
                        checkOutTime: checkOutTime,
                      });
                    } else {
                      setFormData({ ...formData, startTime: value });
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-600">Đến</span>
                <Select
                  value={formData.endTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, endTime: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.startTime && formData.endTime && (
                  <span className="text-sm text-slate-600 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {calculateShiftDuration(
                      formData.startTime,
                      formData.endTime
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Giờ cho phép chấm công */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Giờ cho phép chấm công</Label>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={formData.checkInTime || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, checkInTime: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-600">Đến</span>
                <Select
                  value={formData.checkOutTime || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, checkOutTime: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Trạng thái - chỉ hiển thị khi chỉnh sửa */}
            {editingShift && (
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <RadioGroup
                  value={formData.active !== false ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, active: value === "active" })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label
                      htmlFor="active"
                      className="cursor-pointer font-normal"
                    >
                      Hoạt động
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" />
                    <Label
                      htmlFor="inactive"
                      className="cursor-pointer font-normal"
                    >
                      Ngừng hoạt động
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <DialogFooter>
            {editingShift && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("Bạn có chắc muốn xóa ca làm việc này?")) {
                    handleDelete(editingShift.id);
                    setDialogOpen(false);
                  }
                }}
                className="mr-auto"
              >
                Xóa
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Bỏ qua
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !formData.name || !formData.startTime || !formData.endTime
              }
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
