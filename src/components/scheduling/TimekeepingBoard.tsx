import { useState } from "react";
import * as React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Download,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Ban,
  Trash2,
  Info,
  Plus,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner@2.0.3";
import { staffMembers, initialSchedule } from "../../data/staffData";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  active?: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  code: string;
  role: string;
}

interface TimekeepingEntry {
  staffId: string;
  shiftId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "on-time" | "late-early" | "missing" | "not-checked" | "day-off";
  note?: string;
  // Loại nghỉ
  leaveType?: "approved-leave" | "unapproved-leave";
  // Làm thêm trước ca
  overtimeBefore?: boolean;
  overtimeBeforeHours?: number;
  overtimeBeforeMinutes?: number;
  // Làm thêm sau ca
  overtimeAfter?: boolean;
  overtimeAfterHours?: number;
  overtimeAfterMinutes?: number;
  // Đi muộn
  late?: boolean;
  lateHours?: number;
  lateMinutes?: number;
  // Về sớm
  early?: boolean;
  earlyHours?: number;
  earlyMinutes?: number;
}

interface TimekeepingBoardProps {
  shifts: Shift[];
  schedule?: Record<string, Record<string, string[]>>;
  setSchedule?: (schedule: Record<string, Record<string, string[]>>) => void;
}

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

export function TimekeepingBoard({
  shifts,
  schedule: propsSchedule,
  setSchedule: setPropsSchedule,
}: TimekeepingBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timekeepingDialogOpen, setTimekeepingDialogOpen] = useState(false);
  const [selectedTimekeeping, setSelectedTimekeeping] = useState<{
    staffId: string;
    shiftId: string;
    date: string;
  } | null>(null);
  const [timekeepingStatus, setTimekeepingStatus] = useState<
    "working" | "approved-leave" | "unapproved-leave"
  >("working");
  const [checkInEnabled, setCheckInEnabled] = useState(true);
  const [checkOutEnabled, setCheckOutEnabled] = useState(true);
  const [checkInTime, setCheckInTime] = useState("07:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [note, setNote] = useState("");
  // Làm thêm trước ca
  const [overtimeBefore, setOvertimeBefore] = useState(false);
  const [overtimeBeforeHours, setOvertimeBeforeHours] = useState(0);
  const [overtimeBeforeMinutes, setOvertimeBeforeMinutes] = useState(0);
  // Làm thêm sau ca
  const [overtimeAfter, setOvertimeAfter] = useState(false);
  const [overtimeAfterHours, setOvertimeAfterHours] = useState(0);
  const [overtimeAfterMinutes, setOvertimeAfterMinutes] = useState(0);
  // Đi muộn
  const [late, setLate] = useState(false);
  const [lateHours, setLateHours] = useState(0);
  const [lateMinutes, setLateMinutes] = useState(0);
  // Về sớm
  const [early, setEarly] = useState(false);
  const [earlyHours, setEarlyHours] = useState(0);
  const [earlyMinutes, setEarlyMinutes] = useState(0);

  // Sử dụng staffMembers từ staffData và chỉ lấy 4-5 nhân viên đầu tiên
  const staff: StaffMember[] = staffMembers.slice(0, 4).map((s) => ({
    id: s.id,
    name: s.fullName,
    code: s.staffCode,
    role: s.positionLabel,
  }));

  // Sử dụng schedule từ props hoặc initialSchedule
  const schedule = propsSchedule || initialSchedule;

  // Filter staff based on search query (for display in dropdown)
  const filteredStaffForDropdown = searchQuery
    ? staff.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : staff;

  // Filter staff for table display (only when selectedStaff is set)
  const filteredStaff =
    selectedStaff.length > 0
      ? staff.filter((s) => selectedStaff.includes(s.id))
      : staff;

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const getWeekDates = () => {
    const dates = [];
    const monday = new Date(currentWeek);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${
      end.getMonth() + 1
    }/${end.getFullYear()}`;
  };

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  };

  // Chưa có ai chấm công hết
  const [timekeepingData, setTimekeepingData] = useState<
    Record<string, Record<string, Record<string, TimekeepingEntry>>>
  >({});

  const getTimekeepingEntry = (
    staffId: string,
    shiftId: string,
    date: string
  ): TimekeepingEntry | null => {
    return timekeepingData[staffId]?.[shiftId]?.[date] || null;
  };

  const handleOpenTimekeeping = (
    staffId: string,
    shiftId: string,
    date: string
  ) => {
    setSelectedTimekeeping({ staffId, shiftId, date });
    const entry = getTimekeepingEntry(staffId, shiftId, date);
    const shift = shifts.find((s) => s.id === shiftId);

    if (entry) {
      setTimekeepingStatus(
        entry.status === "day-off" ? "approved-leave" : "working"
      );
      setCheckInTime(entry.checkIn || shift?.startTime || "07:00");
      setCheckOutTime(entry.checkOut || shift?.endTime || "11:00");
      setCheckInEnabled(!!entry.checkIn);
      setCheckOutEnabled(!!entry.checkOut);
      setNote(entry.note || "");
      setOvertimeBefore(entry.overtimeBefore || false);
      setOvertimeBeforeHours(entry.overtimeBeforeHours || 0);
      setOvertimeBeforeMinutes(entry.overtimeBeforeMinutes || 0);
      setOvertimeAfter(entry.overtimeAfter || false);
      setOvertimeAfterHours(entry.overtimeAfterHours || 0);
      setOvertimeAfterMinutes(entry.overtimeAfterMinutes || 0);
      setLate(entry.late || false);
      setLateHours(entry.lateHours || 0);
      setLateMinutes(entry.lateMinutes || 0);
      setEarly(entry.early || false);
      setEarlyHours(entry.earlyHours || 0);
      setEarlyMinutes(entry.earlyMinutes || 0);
    } else {
      setTimekeepingStatus("working");
      setCheckInTime(shift?.startTime || "07:00");
      setCheckOutTime(shift?.endTime || "11:00");
      setCheckInEnabled(true);
      setCheckOutEnabled(true);
      setNote("");
      setOvertimeBefore(false);
      setOvertimeBeforeHours(0);
      setOvertimeBeforeMinutes(0);
      setOvertimeAfter(false);
      setOvertimeAfterHours(0);
      setOvertimeAfterMinutes(0);
      setLate(false);
      setLateHours(0);
      setLateMinutes(0);
      setEarly(false);
      setEarlyHours(0);
      setEarlyMinutes(0);
    }
    setTimekeepingDialogOpen(true);
  };

  const handleSaveTimekeeping = () => {
    if (!selectedTimekeeping) return;

    // Nếu uncheck vào hoặc ra thì set status là chưa chấm công
    if (!checkInEnabled || !checkOutEnabled) {
      const entry: TimekeepingEntry = {
        staffId: selectedTimekeeping.staffId,
        shiftId: selectedTimekeeping.shiftId,
        date: selectedTimekeeping.date,
        checkIn: checkInEnabled ? checkInTime : undefined,
        checkOut: checkOutEnabled ? checkOutTime : undefined,
        status: "not-checked",
        note,
      };

      setTimekeepingData((prev) => ({
        ...prev,
        [selectedTimekeeping.staffId]: {
          ...(prev[selectedTimekeeping.staffId] || {}),
          [selectedTimekeeping.shiftId]: {
            ...(prev[selectedTimekeeping.staffId]?.[
              selectedTimekeeping.shiftId
            ] || {}),
            [selectedTimekeeping.date]: entry,
          },
        },
      }));

      toast.success("Đã lưu chấm công");
      setTimekeepingDialogOpen(false);
      return;
    }

    // Nếu là nghỉ làm
    if (
      timekeepingStatus === "approved-leave" ||
      timekeepingStatus === "unapproved-leave"
    ) {
      const entry: TimekeepingEntry = {
        staffId: selectedTimekeeping.staffId,
        shiftId: selectedTimekeeping.shiftId,
        date: selectedTimekeeping.date,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: "day-off",
        leaveType:
          timekeepingStatus === "approved-leave"
            ? "approved-leave"
            : "unapproved-leave",
        note,
      };

      setTimekeepingData((prev) => ({
        ...prev,
        [selectedTimekeeping.staffId]: {
          ...(prev[selectedTimekeeping.staffId] || {}),
          [selectedTimekeeping.shiftId]: {
            ...(prev[selectedTimekeeping.staffId]?.[
              selectedTimekeeping.shiftId
            ] || {}),
            [selectedTimekeeping.date]: entry,
          },
        },
      }));

      toast.success("Đã lưu chấm công");
      setTimekeepingDialogOpen(false);
      return;
    }

    // Tính toán status dựa trên thời gian chấm công và làm thêm/đi muộn/về sớm
    const shift = shifts.find((s) => s.id === selectedTimekeeping.shiftId);
    let status: TimekeepingEntry["status"] = "on-time";
    let calculatedOvertimeBeforeHours = 0;
    let calculatedOvertimeBeforeMinutes = 0;
    let calculatedOvertimeAfterHours = 0;
    let calculatedOvertimeAfterMinutes = 0;
    let calculatedLateHours = 0;
    let calculatedLateMinutes = 0;
    let calculatedEarlyHours = 0;
    let calculatedEarlyMinutes = 0;

    if (shift) {
      const checkInTimeNum = checkInTime.split(":").map(Number);
      const checkOutTimeNum = checkOutTime.split(":").map(Number);
      const shiftStartNum = shift.startTime.split(":").map(Number);
      const shiftEndNum = shift.endTime.split(":").map(Number);

      const checkInMinutes = checkInTimeNum[0] * 60 + checkInTimeNum[1];
      const checkOutMinutes = checkOutTimeNum[0] * 60 + checkOutTimeNum[1];
      const shiftStartMinutes = shiftStartNum[0] * 60 + shiftStartNum[1];
      const shiftEndMinutes = shiftEndNum[0] * 60 + shiftEndNum[1];

      // Làm thêm trước ca (vào sớm)
      if (checkInMinutes < shiftStartMinutes) {
        const diffMinutes = shiftStartMinutes - checkInMinutes;
        calculatedOvertimeBeforeHours = Math.floor(diffMinutes / 60);
        calculatedOvertimeBeforeMinutes = diffMinutes % 60;
      }

      // Làm thêm sau ca (ra trễ)
      if (checkOutMinutes > shiftEndMinutes) {
        const diffMinutes = checkOutMinutes - shiftEndMinutes;
        calculatedOvertimeAfterHours = Math.floor(diffMinutes / 60);
        calculatedOvertimeAfterMinutes = diffMinutes % 60;
      }

      // Đi muộn
      if (checkInMinutes > shiftStartMinutes) {
        const diffMinutes = checkInMinutes - shiftStartMinutes;
        calculatedLateHours = Math.floor(diffMinutes / 60);
        calculatedLateMinutes = diffMinutes % 60;
        status = "late-early";
      }

      // Về sớm
      if (checkOutMinutes < shiftEndMinutes) {
        const diffMinutes = shiftEndMinutes - checkOutMinutes;
        calculatedEarlyHours = Math.floor(diffMinutes / 60);
        calculatedEarlyMinutes = diffMinutes % 60;
        status = "late-early";
      }
    }

    const entry: TimekeepingEntry = {
      staffId: selectedTimekeeping.staffId,
      shiftId: selectedTimekeeping.shiftId,
      date: selectedTimekeeping.date,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      status,
      note,
      overtimeBefore: overtimeBefore && checkInEnabled ? true : undefined,
      overtimeBeforeHours:
        overtimeBefore && checkInEnabled
          ? calculatedOvertimeBeforeHours
          : undefined,
      overtimeBeforeMinutes:
        overtimeBefore && checkInEnabled
          ? calculatedOvertimeBeforeMinutes
          : undefined,
      overtimeAfter: overtimeAfter && checkOutEnabled ? true : undefined,
      overtimeAfterHours:
        overtimeAfter && checkOutEnabled
          ? calculatedOvertimeAfterHours
          : undefined,
      overtimeAfterMinutes:
        overtimeAfter && checkOutEnabled
          ? calculatedOvertimeAfterMinutes
          : undefined,
      late: late && checkInEnabled ? true : undefined,
      lateHours: late && checkInEnabled ? calculatedLateHours : undefined,
      lateMinutes: late && checkInEnabled ? calculatedLateMinutes : undefined,
      early: early && checkOutEnabled ? true : undefined,
      earlyHours: early && checkOutEnabled ? calculatedEarlyHours : undefined,
      earlyMinutes:
        early && checkOutEnabled ? calculatedEarlyMinutes : undefined,
    };

    setTimekeepingData((prev) => ({
      ...prev,
      [selectedTimekeeping.staffId]: {
        ...(prev[selectedTimekeeping.staffId] || {}),
        [selectedTimekeeping.shiftId]: {
          ...(prev[selectedTimekeeping.staffId]?.[
            selectedTimekeeping.shiftId
          ] || {}),
          [selectedTimekeeping.date]: entry,
        },
      },
    }));

    toast.success("Đã lưu chấm công");
    setTimekeepingDialogOpen(false);
  };

  const getStatusIcon = (status: TimekeepingEntry["status"]) => {
    switch (status) {
      case "on-time":
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case "late-early":
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
      case "missing":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "not-checked":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "day-off":
        return <Ban className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Chỉ lấy các ca đang hoạt động
  const activeShifts = shifts.filter((s) => s.active !== false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Bảng chấm công</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-20 pointer-events-none" />
            <div
              className="flex items-center gap-1 flex-wrap min-h-[2.5rem] px-10 pr-8 py-2 border border-slate-200 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text relative"
              onClick={() => {
                setSearchDropdownOpen(true);
              }}
            >
              {/* Selected tags */}
              {selectedStaff.length > 0 && (
                <>
                  {selectedStaff.slice(0, 1).map((staffId) => {
                    const staffMember = staff.find((s) => s.id === staffId);
                    if (!staffMember) return null;
                    return (
                      <div
                        key={staffId}
                        className="flex items-center gap-1 bg-blue-600 text-white ml-1 px-1.5 py-0.5 rounded text-sm relative z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{staffMember.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaff(
                              selectedStaff.filter((id) => id !== staffId)
                            );
                          }}
                          className="hover:bg-blue-700 rounded p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {selectedStaff.length > 1 && (
                    <div
                      className="flex items-center gap-1 bg-blue-600 text-white px-1.5 py-0.5 rounded text-sm relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>+{selectedStaff.length - 1} khác</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStaff([]);
                        }}
                        className="hover:bg-blue-700 rounded p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </>
              )}
              {/* Input field */}
              <input
                type="text"
                placeholder={
                  selectedStaff.length === 0 ? "Tìm kiếm nhân viên" : ""
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onFocus={() => {
                  setSearchDropdownOpen(true);
                }}
                onBlur={() => {
                  // Delay để cho phép click vào dropdown item
                  setTimeout(() => setSearchDropdownOpen(false), 200);
                }}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm relative z-10 px-4"
                onClick={(e) => e.stopPropagation()}
              />
              {/* Chevron down icon */}
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform pointer-events-none z-20 ${
                  searchDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {searchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredStaffForDropdown.length > 0 ? (
                  filteredStaffForDropdown.map((s) => {
                    const isSelected = selectedStaff.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        className="p-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur
                          if (isSelected) {
                            // Remove from selection
                            setSelectedStaff(
                              selectedStaff.filter((id) => id !== s.id)
                            );
                          } else {
                            // Add to selection
                            setSelectedStaff([...selectedStaff, s.id]);
                          }
                          setSearchQuery("");
                        }}
                      >
                        <div>
                          <div className="text-sm font-medium">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.code}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-2 text-sm text-slate-500 text-center">
                    Không tìm thấy nhân viên
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Week Navigation - giống ScheduleCalendar */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-neutral-700 hover:text-amber-700"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {formatWeekRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentWeek}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentWeek(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timekeeping Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left p-3 text-sm font-medium text-slate-700 sticky left-0 bg-slate-50 z-10 border-r">
                  <div className="flex items-center gap-2">Ca làm việc</div>
                </th>
                {daysOfWeek.map((day, index) => {
                  const date = weekDates[index];
                  const today = new Date();
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <th
                      key={day}
                      className={`p-3 text-center text-sm font-medium min-w-[120px] ${
                        isToday
                          ? "bg-blue-100 border-2 border-blue-500 text-blue-700"
                          : "text-slate-700"
                      }`}
                    >
                      <div className={isToday ? "font-semibold" : ""}>
                        {day}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isToday
                            ? "text-blue-600 font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {formatDate(date)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activeShifts.map((shift, shiftIndex) => (
                <tr
                  key={shift.id}
                  className={shiftIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="p-3 sticky left-0 bg-inherit z-10 border-r">
                    <div>
                      <div className="font-medium text-slate-900">
                        {shift.name}
                      </div>
                      {shift.active === false && (
                        <div className="text-xs text-red-600">
                          (Ngừng hoạt động)
                        </div>
                      )}
                      <div className="text-xs text-slate-500">
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </div>
                  </td>
                  {daysOfWeek.map((day, dayIndex) => {
                    const dateStr = weekDates[dayIndex]
                      .toISOString()
                      .split("T")[0];
                    // Chỉ hiển thị nhân viên có lịch làm việc trong schedule
                    const staffWithSchedule = filteredStaff.filter((s) => {
                      if (
                        selectedStaff.length > 0 &&
                        !selectedStaff.includes(s.id)
                      )
                        return false;
                      // Kiểm tra xem nhân viên có lịch làm việc trong ca này không
                      const staffShifts = schedule[s.id]?.[day] || [];
                      return staffShifts.includes(shift.id);
                    });

                    // Kiểm tra xem có nhân viên nào có lịch làm việc không
                    const hasSchedule = staffWithSchedule.length > 0;

                    return (
                      <td
                        key={day}
                        className={`p-2 align-top ${
                          hasSchedule ? "" : "bg-white"
                        }`}
                        onClick={(e) => {
                          // Nếu click vào td nhưng không phải div nhân viên, không làm gì
                          e.stopPropagation();
                        }}
                      >
                        <div className="flex flex-col gap-1 min-h-[60px]">
                          {hasSchedule
                            ? staffWithSchedule.map((staffMember) => {
                                const entry = getTimekeepingEntry(
                                  staffMember.id,
                                  shift.id,
                                  dateStr
                                );
                                const status = entry?.status || "not-checked";
                                const statusColors: Record<string, string> = {
                                  "on-time":
                                    "bg-blue-100 border-blue-200 text-blue-800",
                                  "late-early":
                                    "bg-purple-100 border-purple-200 text-purple-800",
                                  missing:
                                    "bg-red-100 border-red-200 text-red-800",
                                  "not-checked":
                                    "bg-orange-100 border-orange-200 text-orange-800",
                                  "day-off":
                                    "bg-slate-100 border-slate-200 text-slate-600",
                                };
                                // Xác định label cho status
                                let statusLabel = "";
                                if (status === "day-off") {
                                  if (entry?.leaveType === "approved-leave") {
                                    statusLabel = "Nghỉ có phép";
                                  } else if (
                                    entry?.leaveType === "unapproved-leave"
                                  ) {
                                    statusLabel = "Nghỉ không phép";
                                  } else {
                                    statusLabel = "Nghỉ làm";
                                  }
                                } else {
                                  const statusLabels: Record<string, string> = {
                                    "on-time": "Đúng giờ",
                                    "late-early": "Đi muộn / Về sớm",
                                    missing: "Chấm công thiếu",
                                    "not-checked": "Chưa chấm công",
                                  };
                                  statusLabel =
                                    statusLabels[status] || "Chưa chấm công";
                                }

                                return (
                                  <div
                                    key={staffMember.id}
                                    className={`border rounded p-2 text-xs cursor-pointer hover:shadow-sm transition-shadow ${statusColors[status]}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleOpenTimekeeping(
                                        staffMember.id,
                                        shift.id,
                                        dateStr
                                      );
                                    }}
                                  >
                                    <div className="font-medium">
                                      {staffMember.name}
                                    </div>
                                    <div className="text-slate-600 mt-1">
                                      {entry?.checkIn || shift.startTime} -{" "}
                                      {entry?.checkOut || shift.endTime}
                                    </div>
                                    {/* Hiển thị làm thêm TC nếu vào sớm và có check làm thêm */}
                                    {entry?.overtimeBefore &&
                                      entry.overtimeBeforeHours !== undefined &&
                                      entry.overtimeBeforeMinutes !==
                                        undefined && (
                                        <div className="text-xs mt-1">
                                          Làm thêm TC:{" "}
                                          {entry.overtimeBeforeHours}h{" "}
                                          {entry.overtimeBeforeMinutes}p
                                        </div>
                                      )}
                                    {/* Hiển thị làm thêm SC nếu ra trễ và có check làm thêm */}
                                    {entry?.overtimeAfter &&
                                      entry.overtimeAfterHours !== undefined &&
                                      entry.overtimeAfterMinutes !==
                                        undefined && (
                                        <div className="text-xs mt-1">
                                          Làm thêm SC:{" "}
                                          {entry.overtimeAfterHours}h{" "}
                                          {entry.overtimeAfterMinutes}p
                                        </div>
                                      )}
                                    {/* Dòng trạng thái chấm công */}
                                    <div className="text-xs mt-1 font-medium border-t pt-1">
                                      {statusLabel}
                                    </div>
                                  </div>
                                );
                              })
                            : null}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-slate-700">Đúng giờ</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-slate-700">Đi muộn / Về sớm</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-slate-700">Chấm công thiếu</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-slate-700">Chưa chấm công</span>
        </div>
        <div className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">Nghỉ làm</span>
        </div>
      </div>

      {/* Timekeeping Dialog */}
      <Dialog
        open={timekeepingDialogOpen}
        onOpenChange={setTimekeepingDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chấm công</DialogTitle>
          </DialogHeader>

          {selectedTimekeeping && (
            <div className="space-y-6">
              {/* Staff Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {staff
                        .find((s) => s.id === selectedTimekeeping.staffId)
                        ?.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {
                        staff.find((s) => s.id === selectedTimekeeping.staffId)
                          ?.name
                      }
                    </div>
                    <div className="text-sm text-slate-600">
                      {
                        staff.find((s) => s.id === selectedTimekeeping.staffId)
                          ?.code
                      }
                    </div>
                  </div>
                </div>
                {selectedTimekeeping &&
                  (() => {
                    const entry = getTimekeepingEntry(
                      selectedTimekeeping.staffId,
                      selectedTimekeeping.shiftId,
                      selectedTimekeeping.date
                    );
                    const status = entry?.status || "not-checked";
                    const statusBadges: Record<
                      string,
                      { icon: React.ReactNode; label: string; color: string }
                    > = {
                      "on-time": {
                        icon: (
                          <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
                        ),
                        label: "Đúng giờ",
                        color: "text-blue-600",
                      },
                      "late-early": {
                        icon: (
                          <AlertCircle className="w-3 h-3 mr-1 text-purple-600" />
                        ),
                        label: "Đi muộn / Về sớm",
                        color: "text-purple-600",
                      },
                      missing: {
                        icon: <XCircle className="w-3 h-3 mr-1 text-red-600" />,
                        label: "Chấm công thiếu",
                        color: "text-red-600",
                      },
                      "not-checked": {
                        icon: (
                          <Clock className="w-3 h-3 mr-1 text-orange-600" />
                        ),
                        label: "Chưa chấm công",
                        color: "text-orange-600",
                      },
                      "day-off": {
                        icon: <Ban className="w-3 h-3 mr-1 text-slate-400" />,
                        label: "Nghỉ làm",
                        color: "text-slate-400",
                      },
                    };
                    const badge =
                      statusBadges[status] || statusBadges["not-checked"];
                    return (
                      <Badge
                        variant="outline"
                        className={`ml-auto ${badge.color}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </Badge>
                    );
                  })()}
              </div>

              {/* Date and Shift Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">
                    Thời gian
                  </Label>
                  <div className="text-sm font-medium">
                    {new Date(selectedTimekeeping.date).toLocaleDateString(
                      "vi-VN",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">
                    Ca làm việc
                  </Label>
                  <div className="text-sm font-medium">
                    {
                      shifts.find((s) => s.id === selectedTimekeeping.shiftId)
                        ?.name
                    }{" "}
                    (
                    {
                      shifts.find((s) => s.id === selectedTimekeeping.shiftId)
                        ?.startTime
                    }{" "}
                    -{" "}
                    {
                      shifts.find((s) => s.id === selectedTimekeeping.shiftId)
                        ?.endTime
                    }
                    )
                  </div>
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">
                    Trạng thái
                  </Label>
                  <RadioGroup
                    value={timekeepingStatus}
                    onValueChange={(
                      v: "working" | "approved-leave" | "unapproved-leave"
                    ) => setTimekeepingStatus(v)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="working" id="working" />
                        <Label
                          htmlFor="working"
                          className="cursor-pointer font-normal"
                        >
                          Đi làm
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="approved-leave"
                          id="approved-leave"
                        />
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="approved-leave"
                            className="cursor-pointer font-normal"
                          >
                            Nghỉ có phép
                          </Label>
                          <Info className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="unapproved-leave"
                          id="unapproved-leave"
                        />
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="unapproved-leave"
                            className="cursor-pointer font-normal"
                          >
                            Nghỉ không phép
                          </Label>
                          <Info className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Check-in/Check-out */}
                {timekeepingStatus === "working" &&
                  selectedTimekeeping &&
                  (() => {
                    const shift = shifts.find(
                      (s) => s.id === selectedTimekeeping.shiftId
                    );
                    const shiftStartTime = shift?.startTime || "07:00";
                    const shiftEndTime = shift?.endTime || "11:00";

                    // Tính toán đi muộn/về sớm
                    const checkInTimeNum = checkInTime.split(":").map(Number);
                    const checkOutTimeNum = checkOutTime.split(":").map(Number);
                    const shiftStartNum = shiftStartTime.split(":").map(Number);
                    const shiftEndNum = shiftEndTime.split(":").map(Number);

                    const checkInMinutes =
                      checkInTimeNum[0] * 60 + checkInTimeNum[1];
                    const checkOutMinutes =
                      checkOutTimeNum[0] * 60 + checkOutTimeNum[1];
                    const shiftStartMinutes =
                      shiftStartNum[0] * 60 + shiftStartNum[1];
                    const shiftEndMinutes =
                      shiftEndNum[0] * 60 + shiftEndNum[1];

                    const isLate = checkInMinutes > shiftStartMinutes;
                    const lateDiffMinutes = isLate
                      ? checkInMinutes - shiftStartMinutes
                      : 0;
                    const calculatedLateHours = Math.floor(
                      lateDiffMinutes / 60
                    );
                    const calculatedLateMins = lateDiffMinutes % 60;

                    const isEarly = checkOutMinutes < shiftEndMinutes;
                    const earlyDiffMinutes = isEarly
                      ? shiftEndMinutes - checkOutMinutes
                      : 0;
                    const calculatedEarlyHours = Math.floor(
                      earlyDiffMinutes / 60
                    );
                    const calculatedEarlyMins = earlyDiffMinutes % 60;

                    const isOvertimeBefore = checkInMinutes < shiftStartMinutes;
                    const overtimeBeforeDiffMinutes = isOvertimeBefore
                      ? shiftStartMinutes - checkInMinutes
                      : 0;
                    const calculatedOvertimeBeforeHours = Math.floor(
                      overtimeBeforeDiffMinutes / 60
                    );
                    const calculatedOvertimeBeforeMins =
                      overtimeBeforeDiffMinutes % 60;

                    const isOvertimeAfter = checkOutMinutes > shiftEndMinutes;
                    const overtimeAfterDiffMinutes = isOvertimeAfter
                      ? checkOutMinutes - shiftEndMinutes
                      : 0;
                    const calculatedOvertimeAfterHours = Math.floor(
                      overtimeAfterDiffMinutes / 60
                    );
                    const calculatedOvertimeAfterMins =
                      overtimeAfterDiffMinutes % 60;

                    return (
                      <div className="space-y-3">
                        {/* Vào */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={checkInEnabled}
                              onCheckedChange={(checked) => {
                                setCheckInEnabled(checked);
                                if (checked) {
                                  // Khi check lại, set về giờ ca làm
                                  setCheckInTime(shiftStartTime);
                                  // Reset làm thêm và đi muộn
                                  setOvertimeBefore(false);
                                  setOvertimeBeforeHours(0);
                                  setOvertimeBeforeMinutes(0);
                                  setLate(false);
                                  setLateHours(0);
                                  setLateMinutes(0);
                                } else {
                                  // Khi uncheck, reset làm thêm và đi muộn
                                  setOvertimeBefore(false);
                                  setOvertimeBeforeHours(0);
                                  setOvertimeBeforeMinutes(0);
                                  setLate(false);
                                  setLateHours(0);
                                  setLateMinutes(0);
                                }
                              }}
                            />
                            <Label className="flex-1">Vào</Label>
                            <Select
                              value={checkInTime}
                              onValueChange={(value) => {
                                setCheckInTime(value);
                                // Tự động tính và check làm thêm/đi muộn
                                const checkInTimeNum = value
                                  .split(":")
                                  .map(Number);
                                const shiftStartNum = shiftStartTime
                                  .split(":")
                                  .map(Number);
                                const checkInMinutes =
                                  checkInTimeNum[0] * 60 + checkInTimeNum[1];
                                const shiftStartMinutes =
                                  shiftStartNum[0] * 60 + shiftStartNum[1];

                                if (checkInMinutes < shiftStartMinutes) {
                                  // Vào sớm - làm thêm
                                  const diffMinutes =
                                    shiftStartMinutes - checkInMinutes;
                                  setOvertimeBefore(true);
                                  setOvertimeBeforeHours(
                                    Math.floor(diffMinutes / 60)
                                  );
                                  setOvertimeBeforeMinutes(diffMinutes % 60);
                                  setLate(false);
                                  setLateHours(0);
                                  setLateMinutes(0);
                                } else if (checkInMinutes > shiftStartMinutes) {
                                  // Đi muộn
                                  const diffMinutes =
                                    checkInMinutes - shiftStartMinutes;
                                  setLate(true);
                                  setLateHours(Math.floor(diffMinutes / 60));
                                  setLateMinutes(diffMinutes % 60);
                                  setOvertimeBefore(false);
                                  setOvertimeBeforeHours(0);
                                  setOvertimeBeforeMinutes(0);
                                } else {
                                  // Đúng giờ
                                  setOvertimeBefore(false);
                                  setOvertimeBeforeHours(0);
                                  setOvertimeBeforeMinutes(0);
                                  setLate(false);
                                  setLateHours(0);
                                  setLateMinutes(0);
                                }
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48">
                                <div className="space-y-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    Chỉnh sửa
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          {/* Làm thêm trước ca */}
                          {isOvertimeBefore && checkInEnabled && (
                            <div className="flex items-center gap-3 ml-7">
                              <Checkbox
                                checked={overtimeBefore}
                                onCheckedChange={(checked) => {
                                  setOvertimeBefore(checked);
                                  if (!checked) {
                                    setOvertimeBeforeHours(0);
                                    setOvertimeBeforeMinutes(0);
                                  }
                                }}
                              />
                              <Label className="flex-1">Làm thêm</Label>
                              <Input
                                type="number"
                                value={calculatedOvertimeBeforeHours}
                                className="w-16 h-8"
                                min="0"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                giờ
                              </span>
                              <Input
                                type="number"
                                value={calculatedOvertimeBeforeMins}
                                className="w-16 h-8"
                                min="0"
                                max="59"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                phút
                              </span>
                            </div>
                          )}
                          {/* Đi muộn */}
                          {isLate && checkInEnabled && (
                            <div className="flex items-center gap-3 ml-7">
                              <Checkbox
                                checked={late}
                                onCheckedChange={(checked) => {
                                  setLate(checked);
                                  if (!checked) {
                                    setLateHours(0);
                                    setLateMinutes(0);
                                  }
                                }}
                              />
                              <Label className="flex-1">Đi muộn</Label>
                              <Input
                                type="number"
                                value={calculatedLateHours}
                                className="w-16 h-8"
                                min="0"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                giờ
                              </span>
                              <Input
                                type="number"
                                value={calculatedLateMins}
                                className="w-16 h-8"
                                min="0"
                                max="59"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                phút
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Ra */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={checkOutEnabled}
                              onCheckedChange={(checked) => {
                                setCheckOutEnabled(checked);
                                if (checked) {
                                  // Khi check lại, set về giờ ca làm
                                  setCheckOutTime(shiftEndTime);
                                  // Reset làm thêm và về sớm
                                  setOvertimeAfter(false);
                                  setOvertimeAfterHours(0);
                                  setOvertimeAfterMinutes(0);
                                  setEarly(false);
                                  setEarlyHours(0);
                                  setEarlyMinutes(0);
                                } else {
                                  // Khi uncheck, reset làm thêm và về sớm
                                  setOvertimeAfter(false);
                                  setOvertimeAfterHours(0);
                                  setOvertimeAfterMinutes(0);
                                  setEarly(false);
                                  setEarlyHours(0);
                                  setEarlyMinutes(0);
                                }
                              }}
                            />
                            <Label className="flex-1">Ra</Label>
                            <Select
                              value={checkOutTime}
                              onValueChange={(value) => {
                                setCheckOutTime(value);
                                // Tự động tính và check làm thêm/về sớm
                                const checkOutTimeNum = value
                                  .split(":")
                                  .map(Number);
                                const shiftEndNum = shiftEndTime
                                  .split(":")
                                  .map(Number);
                                const checkOutMinutes =
                                  checkOutTimeNum[0] * 60 + checkOutTimeNum[1];
                                const shiftEndMinutes =
                                  shiftEndNum[0] * 60 + shiftEndNum[1];

                                if (checkOutMinutes > shiftEndMinutes) {
                                  // Ra trễ - làm thêm
                                  const diffMinutes =
                                    checkOutMinutes - shiftEndMinutes;
                                  setOvertimeAfter(true);
                                  setOvertimeAfterHours(
                                    Math.floor(diffMinutes / 60)
                                  );
                                  setOvertimeAfterMinutes(diffMinutes % 60);
                                  setEarly(false);
                                  setEarlyHours(0);
                                  setEarlyMinutes(0);
                                } else if (checkOutMinutes < shiftEndMinutes) {
                                  // Về sớm
                                  const diffMinutes =
                                    shiftEndMinutes - checkOutMinutes;
                                  setEarly(true);
                                  setEarlyHours(Math.floor(diffMinutes / 60));
                                  setEarlyMinutes(diffMinutes % 60);
                                  setOvertimeAfter(false);
                                  setOvertimeAfterHours(0);
                                  setOvertimeAfterMinutes(0);
                                } else {
                                  // Đúng giờ
                                  setOvertimeAfter(false);
                                  setOvertimeAfterHours(0);
                                  setOvertimeAfterMinutes(0);
                                  setEarly(false);
                                  setEarlyHours(0);
                                  setEarlyMinutes(0);
                                }
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48">
                                <div className="space-y-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    Chỉnh sửa
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          {/* Làm thêm sau ca */}
                          {isOvertimeAfter && checkOutEnabled && (
                            <div className="flex items-center gap-3 ml-7">
                              <Checkbox
                                checked={overtimeAfter}
                                onCheckedChange={(checked) => {
                                  setOvertimeAfter(checked);
                                  if (!checked) {
                                    setOvertimeAfterHours(0);
                                    setOvertimeAfterMinutes(0);
                                  }
                                }}
                              />
                              <Label className="flex-1">Làm thêm</Label>
                              <Input
                                type="number"
                                value={calculatedOvertimeAfterHours}
                                className="w-16 h-8"
                                min="0"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                giờ
                              </span>
                              <Input
                                type="number"
                                value={calculatedOvertimeAfterMins}
                                className="w-16 h-8"
                                min="0"
                                max="59"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                phút
                              </span>
                            </div>
                          )}
                          {/* Về sớm */}
                          {isEarly && checkOutEnabled && (
                            <div className="flex items-center gap-3 ml-7">
                              <Checkbox
                                checked={early}
                                onCheckedChange={(checked) => {
                                  setEarly(checked);
                                  if (!checked) {
                                    setEarlyHours(0);
                                    setEarlyMinutes(0);
                                  }
                                }}
                              />
                              <Label className="flex-1">Về sớm</Label>
                              <Input
                                type="number"
                                value={calculatedEarlyHours}
                                className="w-16 h-8"
                                min="0"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                giờ
                              </span>
                              <Input
                                type="number"
                                value={calculatedEarlyMins}
                                className="w-16 h-8"
                                min="0"
                                max="59"
                                disabled={true}
                                readOnly
                              />
                              <span className="text-sm text-slate-600">
                                phút
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>

              {/* Note */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Ghi chú
                </Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  className="w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  selectedTimekeeping &&
                  confirm(
                    "Bạn có chắc muốn hủy ca làm việc của nhân viên này? Hành động này sẽ xóa chấm công và không thể hoàn tác."
                  )
                ) {
                  setTimekeepingData((prev) => {
                    const newData = { ...prev };
                    if (
                      newData[selectedTimekeeping.staffId]?.[
                        selectedTimekeeping.shiftId
                      ]?.[selectedTimekeeping.date]
                    ) {
                      delete newData[selectedTimekeeping.staffId][
                        selectedTimekeeping.shiftId
                      ][selectedTimekeeping.date];
                      // Nếu không còn entry nào trong shift này, xóa shift
                      if (
                        Object.keys(
                          newData[selectedTimekeeping.staffId]?.[
                            selectedTimekeeping.shiftId
                          ] || {}
                        ).length === 0
                      ) {
                        delete newData[selectedTimekeeping.staffId][
                          selectedTimekeeping.shiftId
                        ];
                      }
                      // Nếu không còn shift nào, xóa staff
                      if (
                        Object.keys(newData[selectedTimekeeping.staffId] || {})
                          .length === 0
                      ) {
                        delete newData[selectedTimekeeping.staffId];
                      }
                    }
                    return newData;
                  });

                  // Xóa ca khỏi schedule
                  if (setPropsSchedule && selectedTimekeeping) {
                    const date = new Date(selectedTimekeeping.date);
                    const dayIndex = date.getDay();
                    // Chuyển đổi từ Sunday (0) sang Monday (0) format
                    const dayMap: Record<number, string> = {
                      0: "CN", // Sunday
                      1: "T2", // Monday
                      2: "T3", // Tuesday
                      3: "T4", // Wednesday
                      4: "T5", // Thursday
                      5: "T6", // Friday
                      6: "T7", // Saturday
                    };
                    const day = dayMap[dayIndex];

                    if (day && schedule[selectedTimekeeping.staffId]?.[day]) {
                      const newSchedule = { ...schedule };
                      const staffShifts = [
                        ...(newSchedule[selectedTimekeeping.staffId]?.[day] ||
                          []),
                      ];
                      const shiftIndex = staffShifts.indexOf(
                        selectedTimekeeping.shiftId
                      );

                      if (shiftIndex !== -1) {
                        staffShifts.splice(shiftIndex, 1);
                        newSchedule[selectedTimekeeping.staffId] = {
                          ...newSchedule[selectedTimekeeping.staffId],
                          [day]: staffShifts,
                        };
                        setPropsSchedule(newSchedule);
                      }
                    }
                  }

                  toast.success("Đã hủy ca làm việc");
                  setTimekeepingDialogOpen(false);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              variant="outline"
              onClick={() => setTimekeepingDialogOpen(false)}
            >
              Đóng
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveTimekeeping}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
