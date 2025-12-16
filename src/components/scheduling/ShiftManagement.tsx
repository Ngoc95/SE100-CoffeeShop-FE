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
  ArrowUp,
  ArrowDown,
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
import { toast } from "sonner@2.0.3";

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
  
  // Sort state
  type SortField = "name" | "startTime" | "endTime" | "duration" | "status";
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

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
      toast.error("Vui lòng điền đầy đủ thông tin");
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
    toast.success("Đã lưu ca làm việc");
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa ca làm việc này?")) {
      setShifts(shifts.filter((s) => s.id !== id));
      toast.success("Đã xóa ca làm việc");
    }
  };

  const calculateShiftDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    let hours = endHour - startHour;
    let mins = endMin - startMin;

    const isOvernight = startHour > endHour || (startHour === endHour && startMin > endMin);

    if (isOvernight) {
      // Handle overnight shifts
      hours = (24 - startHour) + endHour;
      mins = endMin - startMin;
      if (mins < 0) {
        hours -= 1;
        mins += 60;
      }
      return { hours, minutes: mins, isOvernight: true };
    } else {
      if (mins < 0) {
        hours -= 1;
        mins += 60;
      }
      return { hours, minutes: mins, isOvernight: false };
    }
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

  const handleToggleStatus = (id: string) => {
    setShifts(
      shifts.map((s) =>
        s.id === id ? { ...s, active: s.active === false ? true : false } : s
      )
    );
    toast.success(
      shifts.find((s) => s.id === id)?.active === false
        ? "Đã vô hiệu hóa ca làm việc"
        : "Đã kích hoạt ca làm việc"
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> none -> asc
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortField(null);
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === "none") {
      return null;
    }
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  let sortedShifts = [...shifts];
  
  // Apply sorting
  if (sortField && sortOrder !== "none") {
    sortedShifts = sortedShifts.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "name") {
        aValue = a.name;
        bValue = b.name;
      } else if (sortField === "startTime") {
        const [aHour, aMin] = a.startTime.split(":").map(Number);
        const [bHour, bMin] = b.startTime.split(":").map(Number);
        aValue = aHour * 60 + aMin;
        bValue = bHour * 60 + bMin;
      } else if (sortField === "endTime") {
        const [aHour, aMin] = a.endTime.split(":").map(Number);
        const [bHour, bMin] = b.endTime.split(":").map(Number);
        aValue = aHour * 60 + aMin;
        bValue = bHour * 60 + bMin;
      } else if (sortField === "duration") {
        const aDuration = calculateShiftDuration(a.startTime, a.endTime);
        const bDuration = calculateShiftDuration(b.startTime, b.endTime);
        aValue = aDuration.hours * 60 + aDuration.minutes;
        bValue = bDuration.hours * 60 + bDuration.minutes;
      } else if (sortField === "status") {
        // Sort by active status: true (active) = 0, false (inactive) = 1
        aValue = a.active === false ? 1 : 0;
        bValue = b.active === false ? 1 : 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "vi");
        return sortOrder === "asc" ? comparison : -comparison;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

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

      <div className="border rounded-xl overflow-hidden">
        <div className="overflow-x-auto rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-100">
                <TableHead className="w-16 text-sm">STT</TableHead>
                <TableHead
                  className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Ca làm việc
                    {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort("startTime")}
                >
                  <div className="flex items-center">
                    Thời gian
                    {getSortIcon("startTime")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort("duration")}
                >
                  <div className="flex items-center">
                    Tổng thời gian làm việc
                    {getSortIcon("duration")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {getSortIcon("status")}
                  </div>
                </TableHead>
                <TableHead className="text-sm">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShifts.map((shift, index) => (
              <TableRow key={shift.id}>
                <TableCell className="text-sm font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="text-sm text-slate-900">{shift.name}</TableCell>
                <TableCell className="text-sm text-slate-700">
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </TableCell>
                <TableCell className="text-sm text-slate-700">
                  {(() => {
                    const duration = calculateShiftDuration(shift.startTime, shift.endTime);
                    return `${duration.hours}h${duration.minutes}p`;
                  })()}
                </TableCell>
                <TableCell className="text-sm">
                  {shift.active !== false ? (
                    <Badge className="bg-emerald-500">Hoạt động</Badge>
                  ) : (
                    <Badge variant="secondary">Ngừng hoạt động</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
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
                        handleToggleStatus(shift.id);
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
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
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
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>

            {/* Giờ làm việc */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Giờ làm việc</Label>
             
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
                  <SelectTrigger className="flex-1 bg-white border-slate-300 shadow-none">
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
                  <SelectTrigger className="flex-1 bg-white border-slate-300 shadow-none">
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
                {formData.startTime && formData.endTime && (() => {
                  const duration = calculateShiftDuration(
                    formData.startTime,
                    formData.endTime
                  );
                  return (
                    <span className="text-sm text-slate-600 whitespace-nowrap flex items-center gap-1">
                      {duration.hours}h{duration.minutes}p
                      {duration.isOvernight && (
                        <span className="text-sm text-slate-600 whitespace-nowrap flex items-center gap-1">, qua đêm</span>
                      )}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Giờ cho phép chấm công */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Giờ cho phép chấm công</Label>
                
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={formData.checkInTime || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, checkInTime: value })
                  }
                >
                  <SelectTrigger className="flex-1 bg-white border-slate-300 shadow-none">
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
                  <SelectTrigger className="flex-1 bg-white border-slate-300 shadow-none">
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
                    <RadioGroupItem value="active" id="active" className="border-slate-300" />
                    <Label
                      htmlFor="active"
                      className="cursor-pointer font-normal"
                    >
                      Hoạt động
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" className="border-slate-300" />
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
