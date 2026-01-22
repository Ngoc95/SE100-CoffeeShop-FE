import { useState, useEffect } from "react";
import * as React from "react";
import {
  ArrowLeftRight,
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
import { toast } from "sonner";
import { BulkAttendanceDialog } from "./BulkAttendanceDialog";

import scheduleApi from '../../api/scheduleApi';
import timekeepingApi from '../../api/timekeepingApi';
import { Timekeeping, Shift } from '../../types/hr'; // Import Shift directly
import { format } from 'date-fns';

interface StaffMember {
  id: string;
  name: string;
  code: string;
  role: string;
}

export interface TimekeepingEntry {
  leaveType: string;
  id?: number; // Added ID from backend
  staffId: string;
  shiftId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "on-time" | "late-early" | "missing" | "not-checked" | "day-off" | "absent";
  note?: string;
}

export interface TimekeepingBoardProps {
  shifts: Shift[];
  schedule?: Record<string, Record<string, string[]>>;
  setSchedule?: (schedule: Record<string, Record<string, string[]>>) => void;
  staffList?: any[];
  value?: Record<string, Record<string, Record<string, TimekeepingEntry>>>;
  onChange?: (
    data: Record<string, Record<string, Record<string, TimekeepingEntry>>>
  ) => void;
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

export function TimekeepingBoard(props: TimekeepingBoardProps) {
  const { shifts, schedule: propsSchedule, setSchedule: setPropsSchedule, staffList, value, onChange } =
    props;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any[]>([]);
  // Use any[] for selectedStaff to match usage if it was string[] before but logic implies Set or Array. 
  // Actually line 119 says `useState<string[]>([])`. Let's keep it safe or check usage.
  // Wait, previous view showed: `const [selectedStaff, setSelectedStaff] = useState<string[]>([]);`
  // I will just insert rawSchedules below it.
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Store raw schedules to lookup IDs
  const [rawSchedules, setRawSchedules] = useState<any[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timekeepingDialogOpen, setTimekeepingDialogOpen] = useState(false);
  const [swapShiftDialogOpen, setSwapShiftDialogOpen] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);
  const [swapShiftData, setSwapShiftData] = useState({
    fromStaffId: "",
    fromDate: new Date(),
    fromShiftId: "",
    toStaffId: "",
    toDate: new Date(),
    toShiftId: "",
  });

  const [selectedTimekeeping, setSelectedTimekeeping] = useState<{
    staffId: string;
    shiftId: string;
    date: string;
  } | null>(null);
  const [timekeepingStatus, setTimekeepingStatus] = useState<
    "working" | "absent"
  >("working");
  const [currentSelectedStaff, setCurrentSelectedStaff] = useState<any>(null);
  const [checkInEnabled, setCheckInEnabled] = useState(true);
  const [checkOutEnabled, setCheckOutEnabled] = useState(true);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [checkOutTime, setCheckOutTime] = useState<string>("");
  const [note, setNote] = useState("");
  // Local schedule state in case props doesn't provide it
  const [localSchedule, setLocalSchedule] = useState<Record<string, Record<string, string[]>>>({});
  const schedule = propsSchedule || localSchedule;


  // Sử dụng staffList từ props và loại bỏ quản lý (manager)
  const currentStaffList = staffList || [];
      const staff: StaffMember[] = currentStaffList
    .map((s: any) => ({
      id: s.id.toString(),
      name: s.fullName,
      code: s.staffCode,
      role: s.positionLabel || s.position,
    }));

  // Fetch schedule if not provided
  // Define fetchSchedules outside useEffect for reuse
  const fetchSchedules = async () => {
    try {
      const from = format(weekDates[0], 'yyyy-MM-dd');
      const to = format(weekDates[6], 'yyyy-MM-dd');
      const response = await scheduleApi.getAll({ from, to });
      const responseData = response.data as any;
      const schedules = responseData.metaData || responseData || [];
      
      setRawSchedules(schedules); // Store raw data

      const newSchedule: Record<string, Record<string, string[]>> = {};

      if (Array.isArray(schedules)) {
        const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        schedules.forEach((s: any) => { 
          const date = new Date(s.workDate);
          const dayIndex = date.getDay();
          const dayLabel = daysOfWeek[dayIndex];
          const staffId = s.staffId.toString();
          const shiftId = s.shiftId?.toString();

          if (!shiftId) return;

          if (!newSchedule[staffId]) newSchedule[staffId] = {};
          if (!newSchedule[staffId][dayLabel]) newSchedule[staffId][dayLabel] = [];
          if (!newSchedule[staffId][dayLabel].includes(shiftId)) {
            newSchedule[staffId][dayLabel].push(shiftId);
          }
        });
      }
      
      if (setPropsSchedule) {
          // If parent provides setter, use it (although structure might mismatch if parent expects different format, assuming it matches local logic)
          // Actually propsSchedule is usually the processed object. 
          // If setPropsSchedule expects the processed object:
          setPropsSchedule(newSchedule);
      } else {
          setLocalSchedule(newSchedule);
      }
    } catch (error) {
      console.error("Error fetching schedules for timekeeping:", error);
    }
  };

  // Fetch schedule if not provided or on mount/change
  useEffect(() => {
    // We always fetch if we need to refresh, but usually rely on provided schedule. 
    // If propsSchedule is null, we fetch.
    if (!propsSchedule) {
      fetchSchedules();
    }
    // Also fetch raw schedules even if propsSchedule is provided, because we need IDs for deletion!
    // But ideally we should avoid double fetching if parent passes everything. 
    // Since parent only passes processed schedule (dates/shifts), it probably doesn't pass IDs.
    // So we MUST fetch raw schedules ourselves to support deletion.
    if (propsSchedule) {
         fetchSchedules();
    }
  }, [currentWeek]); 

  // Filter staff based on search query (for display in dropdown)
  const filteredStaffForDropdown = searchQuery
    ? staff.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : staff;

  // Filter staff for table display (only when selectedStaff is set)
  const filteredStaff =
    selectedStaff.length > 0
      ? staff.filter((s) => selectedStaff.includes(s.id))
      : staff;

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const normalizeToLocalDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const formatDateInput = (date: Date) => {
    const d = normalizeToLocalDate(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getWeekDates = () => {
    const dates: Date[] = [];
    const monday = normalizeToLocalDate(currentWeek);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(normalizeToLocalDate(date));
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

  const getDayLabelFromDate = (date: Date) => {
    const dayIndex = normalizeToLocalDate(date).getDay();
    const dayMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return dayMap[dayIndex] || "T2";
  };

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTimeStr = (time: string | undefined) => {
    if (!time) return "";
    if (time.includes("T")) {
      return time.split("T")[1].substring(0, 5);
    }
    // Remove seconds if present (HH:mm:ss -> HH:mm)
    if (time.length >= 5) {
        return time.substring(0, 5);
    }
    return time;
  };

  // Timekeeping data state
  const [timekeepingData, setTimekeepingData] = useState<
    Record<string, Record<string, Record<string, TimekeepingEntry>>>
  >(value || {});

  // Fetch timekeeping data
  useEffect(() => {
    fetchTimekeeping();
  }, [currentWeek]);

  const fetchTimekeeping = async () => {
    try {
      const from = format(weekDates[0], 'yyyy-MM-dd');
      const to = format(weekDates[6], 'yyyy-MM-dd');

      const response = await timekeepingApi.getAll({ from, to });
      const responseData = response.data as any;
      const data = responseData.metaData || [];
      console.log(data)
      const newData: Record<string, Record<string, Record<string, TimekeepingEntry>>> = {};

      if (Array.isArray(data)) {
        data.forEach((tk: any) => {
          // Use format from date-fns to respect local timezone
          const dateStr = format(new Date(tk.workDate), 'yyyy-MM-dd');
          const shiftId = tk.shiftId?.toString() || "";
          const staffId = tk.staffId.toString();

          if (!shiftId) return;

          // Correct structure: dateStr -> shiftId -> staffId
          if (!newData[dateStr]) newData[dateStr] = {};
          if (!newData[dateStr][shiftId]) newData[dateStr][shiftId] = {};
          
          let status: TimekeepingEntry["status"] = "not-checked"; 
          if (['late', 'early', 'on-time'].includes(tk.status)) status = 'on-time';
          else if (['absent', 'unapproved-leave', 'approved-leave'].includes(tk.status)) status = 'day-off';
          else status = 'not-checked';

          newData[dateStr][shiftId][staffId] = {
            id: tk.id,
            staffId: staffId, // ensure ID is string
            shiftId: shiftId,
            date: dateStr,
            checkIn: tk.clockIn,
            checkOut: tk.clockOut,
            status: status,
            note: tk.notes,
          };
        });
      }
      setTimekeepingData(newData);
    } catch (error) {
      console.error("Error fetching timekeeping:", error);
      toast.error("Không thể tải bảng chấm công");
    }
  };

  const handleSwapShift = () => {
    if (
      !swapShiftData.fromStaffId ||
      !swapShiftData.fromShiftId ||
      !swapShiftData.toStaffId ||
      !swapShiftData.toShiftId
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin đổi ca");
      return;
    }

    // Kiểm tra ca của nhân viên hiện tại: chỉ cho phép đổi nếu chưa chấm công/thiếu
    const fromDateStr = formatDateInput(swapShiftData.fromDate);
    const fromEntry = getTimekeepingEntry(
      swapShiftData.fromStaffId,
      swapShiftData.fromShiftId,
      fromDateStr
    );
    
    if (
      fromEntry &&
      fromEntry.status !== "not-checked" &&
      fromEntry.status !== "missing"
    ) {
      toast.error("Không thể đổi ca đã được chấm công");
      return;
    }

    // Kiểm tra ca của nhân viên muốn đổi
    const toDateStr = formatDateInput(swapShiftData.toDate);
    const toEntry = getTimekeepingEntry(
      swapShiftData.toStaffId,
      swapShiftData.toShiftId,
      toDateStr
    );

    if (
      toEntry &&
      toEntry.status !== "not-checked" &&
      toEntry.status !== "missing"
    ) {
      toast.error("Không thể đổi ca với ca đã được chấm công");
      return;
    }

    if (schedule) {
      const fromStaffId = swapShiftData.fromStaffId;
      const toStaffId = swapShiftData.toStaffId;
      const fromShiftId = swapShiftData.fromShiftId;
      const toShiftId = swapShiftData.toShiftId;

      const fromDay = getDayLabelFromDate(swapShiftData.fromDate);
      const toDay = getDayLabelFromDate(swapShiftData.toDate);

      const originalFromDayShifts =
        schedule[fromStaffId]?.[fromDay] || [];
      const originalToDayShifts =
        schedule[toStaffId]?.[toDay] || [];

      if (!originalFromDayShifts.includes(fromShiftId)) {
        toast.error("Ca gốc không tồn tại trong lịch làm việc");
        return;
      }

      if (!originalToDayShifts.includes(toShiftId)) {
        toast.error("Ca muốn đổi không tồn tại trong lịch làm việc");
        return;
      }

      if (
        fromStaffId === toStaffId &&
        fromDay === toDay &&
        fromShiftId === toShiftId
      ) {
        toast.error("Không thể đổi cùng một ca");
        return;
      }

      if (fromStaffId !== toStaffId) {
        if (schedule[fromStaffId]?.[toDay]?.includes(toShiftId)) {
          toast.error("Bạn đã có ca này trong ngày muốn đổi");
          return;
        }

        if (schedule[toStaffId]?.[fromDay]?.includes(fromShiftId)) {
          toast.error("Nhân viên được chọn đã có ca này trong ngày ban đầu");
          return;
        }
      }

      // Call API to swap shifts
      const swapShifts = async () => {
        try {
          await scheduleApi.swap(
            {
              staffId: Number(fromStaffId),
              shiftId: Number(fromShiftId),
              workDate: formatDateInput(swapShiftData.fromDate),
            },
            {
              staffId: Number(toStaffId),
              shiftId: Number(toShiftId),
              workDate: formatDateInput(swapShiftData.toDate),
            }
          );

          toast.success("Đổi ca thành công");
          setSwapShiftDialogOpen(false);
          
          // Refresh data
          await Promise.all([
            fetchTimekeeping(),
            fetchSchedules() // Call the extracted fetch function
          ]);
        } catch (error) {
          console.error("Swap shift error:", error);
          toast.error("Lỗi khi đổi ca");
        }
      };
      
      swapShifts();
    }

  };

  const handleOpenSwapFromTimekeeping = () => {
    if (!selectedTimekeeping) return;
    const date = new Date(selectedTimekeeping.date);
    setSwapShiftData((prev) => ({
      ...prev,
      fromStaffId: selectedTimekeeping.staffId,
      fromDate: date,
      fromShiftId: selectedTimekeeping.shiftId,
      toStaffId: "",
      toDate: date,
      toShiftId: "",
    }));
    setTimekeepingDialogOpen(false);
    setSwapShiftDialogOpen(true);
  };

  const getTimekeepingEntry = (
    staffId: string,
    shiftId: string,
    date: string
  ): TimekeepingEntry | null => {
    return timekeepingData?.[date]?.[shiftId]?.[staffId] || null;
  };

  const handleOpenTimekeeping = (
    staffId: string,
    shiftId: string,
    date: string
  ) => {
    setSelectedTimekeeping({ staffId, shiftId, date });
    const shift = shifts.find((s) => s.id.toString() === shiftId); 
    setCurrentSelectedStaff(staff.find(s => s.id === staffId));

    const entry = getTimekeepingEntry(staffId, shiftId, date);

    if (entry && entry.status !== "not-checked") {
      if (entry.status === "day-off" || entry.status === "absent" as any) {
          setTimekeepingStatus("absent");
      } else {
          setTimekeepingStatus("working");
      }

      setCheckInTime(entry.checkIn ? formatTimeStr(entry.checkIn) : (shift?.startTime ? formatTimeStr(shift.startTime) : "07:00"));
      setCheckOutTime(entry.checkOut ? formatTimeStr(entry.checkOut) : (shift?.endTime ? formatTimeStr(shift.endTime) : "11:00"));
      
      setCheckInEnabled(true);
      setCheckOutEnabled(true);
      setNote(entry.note || "");
    } else {
      setTimekeepingStatus("working");
      setCheckInTime(shift?.startTime ? formatTimeStr(shift.startTime) : "07:00");
      setCheckOutTime(shift?.endTime ? formatTimeStr(shift.endTime) : "11:00");
      setCheckInEnabled(true);
      setCheckOutEnabled(true);
      setNote("");
    }
    setTimekeepingDialogOpen(true);
  };

  const handleSaveTimekeeping = async () => {
    if (!selectedTimekeeping) return;

    const payload: any = {
        notes: note
    };

    if (timekeepingStatus === 'working') {
        if (checkInTime) payload.checkIn = checkInTime;
        if (checkOutTime) payload.checkOut = checkOutTime;
    } else {
        payload.status = 'absent';
    }

    try {
        const existingEntry = getTimekeepingEntry(selectedTimekeeping.staffId, selectedTimekeeping.shiftId, selectedTimekeeping.date);

        if (existingEntry && existingEntry.id) {
            await timekeepingApi.update(existingEntry.id, payload);
        } else {
             await timekeepingApi.create({
                staffId: Number(selectedTimekeeping.staffId),
                shiftId: Number(selectedTimekeeping.shiftId),
                workDate: selectedTimekeeping.date,
                ...payload
             });
        }
        
        fetchTimekeeping();
        toast.success("Đã cập nhật");
        setTimekeepingDialogOpen(false);
    } catch (err) {
        console.error(err);
        toast.error("Lỗi cập nhật");
    }
  };

  const getStatusIcon = (status: TimekeepingEntry["status"]) => {
    switch (status) {
      case "on-time":
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case "day-off":
        return <Ban className="w-4 h-4 text-slate-400" />;
      case "not-checked":
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        // Fallback for any other status to avoid crash, map to check or clock
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const goToPreviousWeek = () => {
    const newDate = normalizeToLocalDate(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = normalizeToLocalDate(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(normalizeToLocalDate(new Date()));
  };

  // Handle bulk attendance save
  const handleBulkSave = async (data: {
    date: Date;
    shiftId: number;
    checkIn: string;
    checkOut: string;
    selectedStaff: number[];
  }) => {
    const { date, shiftId, checkIn, checkOut, selectedStaff } = data;
    const dateStr = formatDateInput(date);

    try {
        await timekeepingApi.bulkCheckIn({
            date: dateStr,
            shiftId: shiftId,
            checkIn,
            checkOut,
            staffIds: selectedStaff
        });
        
        fetchTimekeeping();
        toast.success("Đã chấm công hàng loạt");
        setBulkDialogOpen(false);
    } catch (err) {
        toast.error("Lỗi chấm công hàng loạt");
        console.error(err);
    }
  };

  // Chỉ lấy các ca đang hoạt động
  // const activeShifts = shifts.filter((s) => s.active !== false); // active property might not exist on HRShift, or check HRShift definition
  const activeShifts = shifts; // Assume all fetched shifts are active or filter by status if available

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
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm relative z-10 px-4 focus:outline-none"
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkDialogOpen(true)}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Chấm công tất cả
          </Button>

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
                  onSelect={(date: Date | undefined) => {
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
                      {shift.isActive === false && (
                        <div className="text-xs text-red-600">
                          (Ngừng hoạt động)
                        </div>
                      )}
                      <div className="text-xs text-slate-500">
                        {formatTimeStr(shift.startTime)} - {formatTimeStr(shift.endTime)}
                      </div>
                    </div>
                  </td>
                  {daysOfWeek.map((day, dayIndex) => {
                    const date = weekDates[dayIndex];
                    const dateStr = formatDateInput(date); // Use formatDateInput for consistency
                    // Chỉ hiển thị nhân viên có lịch làm việc trong schedule HOẶC có chấm công
                    const staffWithSchedule = filteredStaff.filter((s) => {
                      if (
                        selectedStaff.length > 0 &&
                        !selectedStaff.includes(s.id)
                      )
                        return false;
                      
                      const staffShifts = schedule[s.id]?.[day] || [];
                      const hasSchedule = staffShifts.includes(shift.id.toString());
                      
                      // Check timekeeping existence
                      const entry = getTimekeepingEntry(s.id, shift.id.toString(), dateStr);
                      const hasTimekeeping = !!entry;

                      return hasSchedule || hasTimekeeping;
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
                                // Fix type mismatch by converting shift.id (number) to string
                                const entry = getTimekeepingEntry(
                                  staffMember.id,
                                  shift.id.toString(),
                                  dateStr
                                );
                                const status = entry?.status || "not-checked";
                                const statusColors: Record<string, string> = {
                                  "on-time":
                                    "bg-blue-100 border-blue-200 text-blue-800",
                                  "late-early":
                                    "bg-blue-100 border-blue-200 text-blue-800",
                                  missing:
                                    "bg-red-100 border-red-200 text-red-800",
                                  "not-checked":
                                    "bg-orange-100 border-orange-200 text-orange-800",
                                  "day-off":
                                    "bg-slate-100 border-slate-200 text-slate-600",
                                  "absent":
                                    "bg-slate-100 border-slate-200 text-slate-600",
                                };
                                // Xác định label cho status
                                let statusLabel = "";
                                if (status === "day-off" || status === "absent") {
                                  statusLabel = "Nghỉ";
                                } else {
                                  const statusLabels: Record<string, string> = {
                                    "on-time": "Đã chấm công",
                                    "late-early": "Đã chấm công",
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
                                        shift.id.toString(), // Fix type mismatch
                                        dateStr
                                      );
                                    }}
                                  >
                                    <div className="font-medium">
                                      {staffMember.name}
                                    </div>
                                    <div className="text-slate-600 mt-1">
                                      {formatTimeStr(entry?.checkIn) ||
                                        formatTimeStr(shift.startTime)}{" "}
                                      -{" "}
                                      {formatTimeStr(entry?.checkOut) ||
                                        formatTimeStr(shift.endTime)}
                                    </div>

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
          <span className="text-sm text-slate-700">Đã chấm công</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-slate-700">Chưa chấm công</span>
        </div>
        <div className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">Nghỉ</span>
        </div>
      </div>

      {/* Swap Shift Dialog */}
      <Dialog
        open={swapShiftDialogOpen}
        onOpenChange={(open: boolean) => {
          setSwapShiftDialogOpen(open);
          if (!open) {
            setSwapShiftData({
              fromStaffId: "",
              fromDate: new Date(),
              fromShiftId: "",
              toStaffId: "",
              toDate: new Date(),
              toShiftId: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Đổi ca làm việc</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 items-start py-4">
            {/* From Staff */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 border-b pb-2">
                Nhân viên hiện tại
              </h3>

              <div className="space-y-2">
                <Label>Ngày làm việc</Label>
                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !swapShiftData.fromDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {swapShiftData.fromDate ? (
                        format(swapShiftData.fromDate, "dd/MM/yyyy")
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={swapShiftData.fromDate}
                      onSelect={(date: Date | undefined) => {
                         if (date) {
                            setSwapShiftData((prev) => ({
                              ...prev,
                              fromDate: date,
                              fromShiftId: "",
                            }));
                            setFromDateOpen(false);
                         }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Nhân viên</Label>
                <Input
                  value={
                    staff.find((s) => s.id === swapShiftData.fromStaffId)
                      ?.name || ""
                  }
                  readOnly
                  className="bg-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label>Ca</Label>
                <Select
                  value={swapShiftData.fromShiftId}
                  onValueChange={(value: string) =>
                    setSwapShiftData((prev) => ({
                      ...prev,
                      fromShiftId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ca làm việc..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const day = getDayLabelFromDate(swapShiftData.fromDate);
                      const staffShifts =
                        schedule[swapShiftData.fromStaffId]?.[day] || [];
                      const availableShifts = activeShifts.filter((shift) =>
                        staffShifts.includes(shift.id.toString())
                      );
                      return availableShifts.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name} ({formatTimeStr(s.startTime)} - {formatTimeStr(s.endTime)})
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* To Staff */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 border-b pb-2">
                Nhân viên muốn đổi
              </h3>

              <div className="space-y-2">
                <Label>Ngày làm việc</Label>
                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !swapShiftData.toDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {swapShiftData.toDate ? (
                        format(swapShiftData.toDate, "dd/MM/yyyy")
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={swapShiftData.toDate}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                            setSwapShiftData((prev) => ({
                              ...prev,
                              toDate: date,
                              toStaffId: "",
                              toShiftId: "",
                            }));
                            setToDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Nhân viên</Label>
                <Select
                  value={swapShiftData.toStaffId}
                  onValueChange={(value: string) =>
                    setSwapShiftData((prev) => ({
                      ...prev,
                      toStaffId: value,
                      toShiftId: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const day = getDayLabelFromDate(swapShiftData.toDate);
                      const candidates = staff.filter((s) => {
                        if (s.id === swapShiftData.fromStaffId) return false;
                        const staffShifts = schedule[s.id]?.[day] || [];
                        if (swapShiftData.toShiftId) {
                          // Nếu đã chọn ca đích, chỉ hiện những nhân viên có ca đó
                          return staffShifts.includes(swapShiftData.toShiftId);
                        }
                        // Nếu chưa chọn ca đích, cho phép chọn bất kỳ nhân viên nào
                        // có ít nhất một ca trong ngày đó
                        return staffShifts.length > 0;
                      });
                      return candidates.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ca</Label>
                <Select
                  value={swapShiftData.toShiftId}
                  onValueChange={(value: string) =>
                    setSwapShiftData((prev) => ({
                      ...prev,
                      toShiftId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ca làm việc..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const day = getDayLabelFromDate(swapShiftData.toDate);
                      const staffShifts =
                        swapShiftData.toStaffId
                          ? schedule[swapShiftData.toStaffId]?.[day] || []
                          : [];
                      const availableShifts = activeShifts.filter((shift) =>
                        staffShifts.includes(shift.id.toString())
                      );
                      return availableShifts.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name} ({formatTimeStr(s.startTime)} - {formatTimeStr(s.endTime)})
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSwapShiftDialogOpen(false)}>Bỏ qua</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSwapShift}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timekeeping Dialog */}
      <Dialog
        open={timekeepingDialogOpen}
        onOpenChange={setTimekeepingDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Chấm công</DialogTitle>
          </DialogHeader>

          {selectedTimekeeping && (
            <div className="space-y-6">
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
                        label: "Đã chấm công",
                        color: "text-blue-600",
                      },
                      "not-checked": {
                        icon: (
                          <Clock className="w-3 h-3 mr-1 text-orange-600" />
                        ),
                        label: "Chưa chấm công", // or "Chưa chấm"
                        color: "text-orange-600",
                      },
                      "day-off": {
                        icon: <Ban className="w-3 h-3 mr-1 text-slate-400" />,
                        label: "Nghỉ làm",
                        color: "text-slate-400",
                      },
                      // Keep old keys just in case, but map them to new labels if needed
                      "late-early": {
                         icon: <AlertCircle className="w-3 h-3 mr-1 text-purple-600" />,
                         label: "Đã chấm công", // Map to same as on-time
                         color: "text-purple-600",
                      },
                      "missing": {
                         icon: <XCircle className="w-3 h-3 mr-1 text-red-600" />,
                         label: "Chưa chấm công",
                         color: "text-red-600",
                      },
                      "absent": {
                         icon: <Ban className="w-3 h-3 mr-1 text-slate-400" />,
                         label: "Nghỉ",
                         color: "text-slate-400",
                      },
                    };
                    const badge =
                      statusBadges[status] || statusBadges["not-checked"];
                    return (
                      <div className="ml-auto flex items-center gap-3">
                        <Badge variant="outline" className={`${badge.color}`}>
                          {badge.icon}
                          {badge.label}
                        </Badge>
                        {(!entry ||
                          entry?.status === "not-checked" ||
                          entry?.status === "missing") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={handleOpenSwapFromTimekeeping}
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            Đổi ca
                          </Button>
                        )}
                      </div>
                    );
                  })()}
              </div>

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
                     {(() => {
                       // Find schedule if possible for accurate shift? Or just use ID match on shifts
                       const sId = Number(selectedTimekeeping.shiftId);
                       const shift = shifts.find(s => s.id === sId);
                       return shift ? `${shift.name} (${formatTimeStr(shift.startTime)} - ${formatTimeStr(shift.endTime)})` : 'N/A';
                     })()}
                  </div>
                </div>
              </div>

               <div className="space-y-4 pt-4">
                 <div className="space-y-3">
                    <Label>Trạng thái</Label>
                    <RadioGroup
                        value={timekeepingStatus}
                        onValueChange={(val: any) => setTimekeepingStatus(val)}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="working" id="working" />
                        <Label htmlFor="working">Đi làm</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="absent" id="absent" />
                        <Label htmlFor="absent">Nghỉ</Label>
                        </div>
                    </RadioGroup>
                 </div>

                 {timekeepingStatus === "working" && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label>Giờ vào</Label>
                        <Select
                            value={checkInTime}
                            onValueChange={setCheckInTime}
                            disabled={!checkInEnabled}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Chọn giờ" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                            {timeOptions.map((time) => (
                                <SelectItem key={`in-${time}`} value={time}>
                                {time}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>

                        <div className="space-y-2">
                        <Label>Giờ ra</Label>
                        <Select
                            value={checkOutTime}
                            onValueChange={setCheckOutTime}
                            disabled={!checkOutEnabled}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Chọn giờ" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                            {timeOptions.map((time) => (
                                <SelectItem key={`out-${time}`} value={time}>
                                {time}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                 )}

                 <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Input
                        placeholder="Nhập ghi chú..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                 </div>
               </div>
            </div>
          )}

                  <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (
                  selectedTimekeeping &&
                  confirm(
                    "Bạn có chắc muốn hủy ca làm việc của nhân viên này? Hành động này sẽ xóa chấm công và lịch làm việc."
                  )
                ) {
                   try {
                     // User requested to DELETE SCHEDULE ONLY. Backend will cascade delete Timekeeping.
                     
                     if (rawSchedules) {
                        const scheduleToDelete = rawSchedules.find((s: any) => 
                            s.staffId.toString() === selectedTimekeeping.staffId && 
                            s.shiftId?.toString() === selectedTimekeeping.shiftId &&
                            formatDateInput(new Date(s.workDate)) === selectedTimekeeping.date
                        );
                        
                        if (scheduleToDelete) {
                            await scheduleApi.delete(scheduleToDelete.id);
                            toast.success("Đã hủy ca làm việc");
                        } else {
                            // Only if schedule not found, we might consider deleting timekeeping if it's an orphan?
                            // But user said "delete schedule only".
                            // If it's a manual timekeeping (no schedule), creating it creates a 'schedule' implicitly?
                            // Backend 'create' timekeeping (status pending) requires shift.
                            // If we can't find schedule, we probably can't delete it via schedule API.
                            // Let's assume sync is good.
                            toast.error("Không tìm thấy lịch làm việc gốc");
                        }
                     }
                     
                     setTimekeepingDialogOpen(false);
                     
                     // Refresh
                     fetchTimekeeping();
                     fetchSchedules();

                   } catch (e) {
                      console.error(e);
                      toast.error("Có lỗi xảy ra khi hủy");
                   }
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

      {/* Bulk Attendance Dialog */}
      <BulkAttendanceDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        shifts={shifts}
        staffList={staff.map(s => ({
          id: Number(s.id),
          fullName: s.name,
          staffCode: s.code,
          position: s.role,
          positionLabel: s.role,
        }))}
        schedule={schedule}
        onSave={handleBulkSave}
      />
    </div>
  );
}
