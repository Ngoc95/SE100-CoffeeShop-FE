import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Download, Upload, Calendar as CalendarIcon, Filter, X, FileSpreadsheet, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from 'sonner';
import { Shift as HRShift, StaffSchedule, StaffShort } from '../../types/hr';
import scheduleApi from '../../api/scheduleApi';
import { format } from 'date-fns';

interface CalendarShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface StaffMember {
  id: number; // Changed to number
  name: string;
  role: string;
  positionLabel: string;
  salary?: number;
  salarySetting?: any;
}

interface ScheduleEntry {
  staffId: string;
  day: string;
  shiftIds: string[];
}

interface ScheduleCalendarProps {
  shifts: HRShift[];
  schedule?: Record<string, Record<string, string[]>>;
  setSchedule?: (schedule: Record<string, Record<string, string[]>>) => void;
  staffList?: any[];
  onRefresh?: () => void;
}

export function ScheduleCalendar({ shifts: propsShifts, schedule: propsSchedule, setSchedule: setPropsSchedule, staffList, onRefresh }: ScheduleCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ staffId: string; day: string } | null>(null);
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterShifts, setFilterShifts] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  // Use shifts from props - convert to the format needed for ScheduleCalendar
  // Mỗi ca có màu khác nhau
  const shiftColors: Record<string, string> = {
    '1': 'bg-yellow-100 text-yellow-800 border-yellow-200', // Ca sáng
    '2': 'bg-blue-100 text-blue-800 border-blue-200', // Ca chiều
    '3': 'bg-purple-100 text-purple-800 border-purple-200', // Ca tối
  };
  
  // Chỉ lấy các ca đang hoạt động
  const shifts: CalendarShift[] = propsShifts
    .filter(shift => shift.isActive !== false)
    .map(shift => ({
    id: shift.id.toString(),
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
      color: shiftColors[shift.id.toString()] || 'bg-blue-100 text-blue-800 border-blue-200',
    }));

  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [swapData, setSwapData] = useState({
    fromStaffId: "",
    fromShiftId: "",
    fromWorkDate: format(new Date(), 'yyyy-MM-dd'),
    toStaffId: "",
    toShiftId: "",
    toWorkDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Chỉ lấy nhân viên không phải quản lý (manager)
  const currentStaffList = staffList || [];
  const staff: StaffMember[] = currentStaffList
    .filter((s: any) => s.position !== 'manager')
    .map((s: any) => ({
      id: s.id,
      name: s.fullName,
      role: s.position,
      positionLabel: s.positionLabel || s.position,
      salary: s.salary,
      salarySetting: s.salarySetting
    }));

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const roles = ['Pha chế', 'Thu ngân', 'Phục vụ', 'Quản lý'];

  // Use schedule from props or local state
  const [localSchedule, setLocalSchedule] = useState<Record<string, Record<string, string[]>>>(
    propsSchedule || {}
  );
  // Separate map to store real Schedule IDs for deletion: staffId -> dayLabel -> shiftId -> scheduleId
  const [scheduleIdMap, setScheduleIdMap] = useState<Record<string, Record<string, Record<string, number>>>>({});

  const schedule = propsSchedule !== undefined ? propsSchedule : localSchedule;

  // Sync schedule với parent component
  const updateSchedule = (newSchedule: Record<string, Record<string, string[]>>) => {
    if (setPropsSchedule) {
      setPropsSchedule(newSchedule);
    } else {
      setLocalSchedule(newSchedule);
    }
  };

  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

  // Initialize schedule fetching
  useEffect(() => {
    fetchSchedules();
  }, [currentWeek]);

  const getWeekDates = () => {
    const dates = [];
    const monday = new Date(currentWeek);
    const day = monday.getDay(); // 0 is Sunday
    // if day is 0 (Sunday), diff should be -6 to get Monday
    // if day is 1 (Monday), diff should be 0
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    const newMonday = new Date(monday.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(newMonday);
      date.setDate(newMonday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const fetchSchedules = async () => {
    try {
      const from = format(weekDates[0], 'yyyy-MM-dd');
      const to = format(weekDates[6], 'yyyy-MM-dd');
      
      const response = await scheduleApi.getAll({ from, to });
      // API returns { metaData: [...] } structure
      const responseData = response.data as any;
      const schedules = responseData.metaData || responseData || [];

      const newSchedule: Record<string, Record<string, string[]>> = {};
      const newScheduleIdMap: Record<string, Record<string, Record<string, number>>> = {};

      if (Array.isArray(schedules)) {
          schedules.forEach((s: StaffSchedule) => {
            const date = new Date(s.workDate);
            // Determine day label (T2-CN)
            const dayIndex = date.getDay(); // 0=Sun, 1=Mon
            // Map 0->6 (CN), 1->0 (T2), etc.
            const mapIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            const dayLabel = daysOfWeek[mapIndex];
            const staffId = s.staffId.toString();
            // Check if shiftId exists before toString
            if (!s.shiftId) return;
            const shiftId = s.shiftId.toString();

            if (!newSchedule[staffId]) newSchedule[staffId] = {};
            if (!newSchedule[staffId][dayLabel]) newSchedule[staffId][dayLabel] = [];
            
            if (!newSchedule[staffId][dayLabel].includes(shiftId)) {
              newSchedule[staffId][dayLabel].push(shiftId);
            }

            // Store Schedule ID
            if (!newScheduleIdMap[staffId]) newScheduleIdMap[staffId] = {};
            if (!newScheduleIdMap[staffId][dayLabel]) newScheduleIdMap[staffId][dayLabel] = {};
            newScheduleIdMap[staffId][dayLabel][shiftId] = s.id;
          });
      }

      updateSchedule(newSchedule);
      setScheduleIdMap(newScheduleIdMap);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Không thể tải lịch làm việc");
    }
  };

  const handleOpenAddShift = (staffId: string, day: string) => {
    setSelectedCell({ staffId, day });
    setSelectedShifts(schedule[staffId]?.[day] || []);
    setAddShiftDialogOpen(true);
  };

  const handleSaveShifts = async () => {
    if (!selectedCell) return;

    try {
      // Calculate workDate
      const dayIndex = daysOfWeek.indexOf(selectedCell.day);
      if (dayIndex === -1) return;
      
      const workDate = weekDates[dayIndex];
      const formattedDate = format(workDate, 'yyyy-MM-dd');
      
      // 1. Identify removed shifts (present in previous but not in new selected)
      const previousShifts = schedule[selectedCell.staffId]?.[selectedCell.day] || [];
      const removedShifts = previousShifts.filter(id => !selectedShifts.includes(id));
      
      // 2. Delete removed shifts
      if (removedShifts.length > 0) {
          const shiftMap = scheduleIdMap[selectedCell.staffId]?.[selectedCell.day];
          if (shiftMap) {
              await Promise.all(removedShifts.map(async (shiftId) => {
                  const scheduleId = shiftMap[shiftId];
                  if (scheduleId) {
                      try {
                          await scheduleApi.delete(scheduleId);
                      } catch (e) {
                          console.error(`Failed to delete schedule ${scheduleId}`, e);
                      }
                  }
              }));
          }
      }

      // 3. Upsert/Create current selection
      // Only call create if there are selected shifts (or backend supports empty list?)
      // Assuming upsert, we just send the current list.
      // Optimization: filter only new shifts? 
      // User says backend is upsert. So checking 'includes' might be safer to restart.
      // But creating existing ones is fine.
      if (selectedShifts.length > 0) {
          await scheduleApi.create({
            staffId: Number(selectedCell.staffId),
            shiftIds: selectedShifts.map(Number),
            workDate: formattedDate
          });
      }

      // Refresh schedule
      await fetchSchedules();
      
      toast.success('Đã cập nhật lịch làm việc');
      setAddShiftDialogOpen(false);
    } catch (error) {
      console.error("Error saving shifts:", error);
      toast.error("Lỗi khi lưu lịch làm việc");
    }
  };

  const toggleShift = (shiftId: string) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) 
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const formatTimeStr = (time: string | undefined) => {
    if (!time) return "";
    if (time.includes("T")) {
      return time.split("T")[1].substring(0, 5);
    }
    return time.substring(0, 5);
  };

  const getShiftById = (id: string) => shifts.find(s => s.id.toString() === id);

  const getAvailableShiftsForSwap = (staffId: string, dateStr: string) => {
      // Logic: Find if dateStr matches a loaded day.
      // If yes, filter using schedule state.
      // return Shift[]
      if (!staffId || !dateStr) return [];
      
      try {
          const date = new Date(dateStr);
          // Find if this date is in weekDates
          const dayIndex = weekDates.findIndex(d => format(d, 'yyyy-MM-dd') === dateStr);
          if (dayIndex !== -1) {
              const dayLabel = daysOfWeek[dayIndex];
              const shiftIds = schedule[staffId]?.[dayLabel] || [];
              return shifts.filter(s => shiftIds.includes(s.id));
          }
      } catch (e) {}
      
      return []; // Fallback to empty if not found (per user request) or maybe load?
  };

  // Apply filters
  let filteredStaff = staff;
  if (filterRoles.length > 0) {
    filteredStaff = filteredStaff.filter(s => filterRoles.includes(s.positionLabel));
  }
  if (filterShifts.length > 0) {
    filteredStaff = filteredStaff.filter(person => {
      return daysOfWeek.some(day => {
        const personShifts = schedule[person.id]?.[day] || [];
        return personShifts.some(shiftId => filterShifts.includes(shiftId));
      });
    });
  }

  const toggleRoleFilter = (role: string) => {
    setFilterRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const toggleShiftFilter = (shiftId: string) => {
    setFilterShifts(prev =>
      prev.includes(shiftId)
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const clearFilters = () => {
    setFilterRoles([]);
    setFilterShifts([]);
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const weekStart = getWeekDates()[0];
    const weekEnd = getWeekDates()[6];
    return today >= weekStart && today <= weekEnd;
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



  const calculateEstimatedSalary = (staffId: string) => {
    // Correctly find staff member
    const staffMember = currentStaffList.find((s: any) => s.id === Number(staffId) || s.id.toString() === staffId);
    if (!staffMember) return 0;

    const salarySettings = staffMember.salarySettings || (staffMember as any).salarySetting; // Handle both structures if needed
    if (!salarySettings) return 0;

    // Fixed salary (Theo tháng)
    if (salarySettings.salaryType === 'fixed' || salarySettings.salaryType === 'monthly') {
      return Number(salarySettings.salaryAmount || salarySettings.baseRate || 0);
    }

    // Shift/Hourly salary (Theo ca)
    if (salarySettings.salaryType === 'shift' || salarySettings.salaryType === 'hourly') {
      const baseRate = Number(salarySettings.baseRate || salarySettings.salaryAmount || 0);
      let totalShifts = 0;
      
      daysOfWeek.forEach((day) => {
        const shiftIds = schedule[staffId]?.[day] || [];
        totalShifts += shiftIds.length;
      });

      return totalShifts * baseRate;
    }

    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  };
  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  // Calculate total shifts per day
  const getTotalShiftsPerDay = (day: string) => {
    let total = 0;
    filteredStaff.forEach(person => {
      total += schedule[person.id.toString()]?.[day]?.length || 0;
    });
    return total;
  };

  // Calculate total shifts per person
  const getTotalShiftsPerPerson = (staffId: number) => {
    let total = 0;
    daysOfWeek.forEach(day => {
      total += schedule[staffId.toString()]?.[day]?.length || 0;
    });
    return total;
  };


  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-amber-950 mb-1">Xếp lịch làm việc</h1>
            <p className="text-sm text-slate-600">
              Quản lý lịch làm việc theo tuần cho {filteredStaff.length} nhân viên
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSwapDialogOpen(true)}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Đổi ca
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
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

        {/* Filters - Horizontal Layout */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              {/* Filter by Role */}
              <div className="flex-1">
                <Label className="text-xs text-slate-600 mb-2 block">Chức vụ</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  {roles.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={filterRoles.includes(role)}
                        onCheckedChange={() => toggleRoleFilter(role)}
                      />
                      <label
                        htmlFor={`role-${role}`}
                        className="text-sm text-slate-700 cursor-pointer"
                      >
                        {role}
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        {staff.filter(s => s.positionLabel === role).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-slate-200" />

              {/* Filter by Shift */}
              <div className="flex-1">
                <Label className="text-xs text-slate-600 mb-2 block">Ca làm việc</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  {shifts.map(shift => (
                    <div key={shift.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shift-${shift.id}`}
                        checked={filterShifts.includes(shift.id)}
                        onCheckedChange={() => toggleShiftFilter(shift.id)}
                      />
                      <label
                        htmlFor={`shift-${shift.id}`}
                        className="text-sm text-slate-700 cursor-pointer"
                      >
                        <span>{shift.name}</span>
                        <span className="text-xs text-slate-500 ml-1">
                          ({formatTimeStr(shift.startTime)} - {formatTimeStr(shift.endTime)})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-slate-200" />

              {/* Statistics */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-600">Tổng NV</div>
                  <div className="text-lg font-semibold text-slate-900">{staff.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-600">Hiển thị</div>
                  <div className="text-lg font-semibold text-amber-600">{filteredStaff.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-600">Tổng ca</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {filteredStaff.reduce((sum, person) => sum + getTotalShiftsPerPerson(person.id), 0)}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(filterRoles.length > 0 || filterShifts.length > 0) && (
                <>
                  <div className="h-12 w-px bg-slate-200" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Calendar Content */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="border-blue-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-blue-200">
                      <th className="text-left p-3 text-sm text-neutral-700 bg-blue-50 sticky left-0 z-10">
                        <div>Nhân viên</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {filteredStaff.length} người
                        </div>
                      </th>
                      {daysOfWeek.map((day, index) => {
                        const date = weekDates[index];
                        const today = new Date();
                        const isToday = date.toDateString() === today.toDateString();
                        return (
                          <th 
                            key={day} 
                            className={`p-3 text-center bg-blue-50 min-w-[120px] ${
                              isToday ? 'bg-blue-100 border-2 border-blue-500' : ''
                            }`}
                          >
                            <div className={`text-sm ${isToday ? 'text-blue-700 font-semibold' : 'text-neutral-700'}`}>
                              {day}
                            </div>
                            <div className={`text-xs mt-1 ${isToday ? 'text-blue-600 font-medium' : 'text-neutral-500'}`}>
                              {date.getDate()}/{date.getMonth() + 1}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {getTotalShiftsPerDay(day)} ca
                          </Badge>
                        </th>
                        );
                      })}
                      <th className="p-3 text-right bg-blue-50 text-sm text-black-700 min-w-[120px]">
                        Lương dự kiến
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((person, personIndex) => (
                      <tr 
                        key={person.id} 
                        className={`border-b hover:bg-neutral-50 ${
                          personIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                        }`}
                      >
                        <td className="p-3 bg-white sticky left-0 z-10 border-r">
                          <div>
                            <p className="text-sm text-neutral-900">{person.name}</p>
                            <p className="text-xs text-neutral-500">{person.positionLabel}</p>
                          </div>
                        </td>
                        {daysOfWeek.map(day => (
                          <td 
                            key={day} 
                            className="p-2 cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => handleOpenAddShift(person.id.toString(), day)}
                          >
                            <div className="flex flex-col gap-1 min-h-[48px] items-center justify-center">
                              {schedule[person.id.toString()]?.[day]?.length > 0 ? (
                                schedule[person.id.toString()][day].map(shiftId => {
                                  const shift = getShiftById(shiftId);
                                  return shift ? (
                                    <Badge
                                      key={shiftId}
                                      className={`text-xs ${shift.color} cursor-pointer`}
                                    >
                                      {shift.name.replace('Ca ', '')}
                                    </Badge>
                                  ) : null;
                                })
                              ) : (
                                <div className="text-center">
                                  <Plus className="w-5 h-5 text-slate-400 mx-auto" />
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                        <td className="p-3 text-right">
                          <div className="font-medium text-black-900">
                            {formatCurrency(calculateEstimatedSalary(person.id.toString()))}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1">
                            {getTotalShiftsPerPerson(person.id)} ca
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Shift Dialog */}
      <Dialog open={addShiftDialogOpen} onOpenChange={setAddShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCell && (
                <>
                <>
                  Xếp ca cho {staff.find(s => s.id.toString() === selectedCell.staffId)?.name} - {selectedCell.day}
                </>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Chọn ca làm việc (có thể chọn nhiều ca):
            </p>

            <div className="space-y-2">
              {shifts.map(shift => (
                <div
                  key={shift.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedShifts.includes(shift.id)
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-neutral-200 hover:border-amber-300'
                  }`}
                  onClick={() => toggleShift(shift.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedShifts.includes(shift.id)}
                      onCheckedChange={() => toggleShift(shift.id)}
                    />
                    <div>
                      <p className="text-sm text-neutral-900">{shift.name}</p>
                      <p className="text-xs text-neutral-500">
                        {formatTimeStr(shift.startTime)} - {formatTimeStr(shift.endTime)}
                      </p>
                    </div>
                  </div>
                  <Badge className={shift.color}>{shift.name}</Badge>
                </div>
              ))}
            </div>

            {selectedShifts.length === 0 && (
              <p className="text-sm text-neutral-500 italic">
                Không chọn ca = Ngày nghỉ
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShiftDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveShifts} className="bg-amber-700 hover:bg-amber-800">
              Lưu lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Swap Shift Dialog */}
      <Dialog open={swapDialogOpen} onOpenChange={setSwapDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi ca làm việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Từ nhân viên</Label>
                    <Select value={swapData.fromStaffId} onValueChange={(v: string) => setSwapData({...swapData, fromStaffId: v})}>
                        <SelectTrigger><SelectValue placeholder="Chọn NV" /></SelectTrigger>
                        <SelectContent>
                            {staff.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Đến nhân viên</Label>
                    <Select value={swapData.toStaffId} onValueChange={(v: string) => setSwapData({...swapData, toStaffId: v})}>
                        <SelectTrigger><SelectValue placeholder="Chọn NV" /></SelectTrigger>
                        <SelectContent>
                            {staff.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Ngày (Từ)</Label>
                    <Popover onOpenChange={setFromDateOpen} open={fromDateOpen}>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={`w-full justify-start text-left font-normal ${!swapData.fromWorkDate && "text-muted-foreground"}`}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {swapData.fromWorkDate ? format(new Date(swapData.fromWorkDate), "dd-MM-yyyy") : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={new Date(swapData.fromWorkDate)}
                                onSelect={(date: Date | undefined) => {
                                  if (date) {
                                    setSwapData({...swapData, fromWorkDate: format(date, 'yyyy-MM-dd')});
                                    setFromDateOpen(false);
                                  }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label>Ngày (Đến)</Label>
                    <Popover onOpenChange={setToDateOpen} open={toDateOpen}>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={`w-full justify-start text-left font-normal ${!swapData.toWorkDate && "text-muted-foreground"}`}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {swapData.toWorkDate ? format(new Date(swapData.toWorkDate), "dd-MM-yyyy") : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={new Date(swapData.toWorkDate)}
                                onSelect={(date: Date | undefined) => {
                                  if (date) {
                                    setSwapData({...swapData, toWorkDate: format(date, 'yyyy-MM-dd')});
                                    setToDateOpen(false);
                                  }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Ca (Từ)</Label>
                    <Select value={swapData.fromShiftId} onValueChange={(v: string) => setSwapData({...swapData, fromShiftId: v})}>
                        <SelectTrigger><SelectValue placeholder="Chọn ca" /></SelectTrigger>
                        <SelectContent>
                            {getAvailableShiftsForSwap(swapData.fromStaffId, swapData.fromWorkDate).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Ca (Đến)</Label>
                    <Select value={swapData.toShiftId} onValueChange={(v: string) => setSwapData({...swapData, toShiftId: v})}>
                        <SelectTrigger><SelectValue placeholder="Chọn ca" /></SelectTrigger>
                        <SelectContent>
                            {getAvailableShiftsForSwap(swapData.toStaffId, swapData.toWorkDate).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSwapDialogOpen(false)}>Hủy</Button>
            <Button onClick={async () => {
                if (!swapData.fromStaffId || !swapData.toStaffId || !swapData.fromShiftId || !swapData.toShiftId) {
                    toast.error("Vui lòng nhập đầy đủ thông tin");
                    return;
                }
                try {
                    await scheduleApi.swap(
                        { staffId: Number(swapData.fromStaffId), shiftId: Number(swapData.fromShiftId), workDate: swapData.fromWorkDate },
                        { staffId: Number(swapData.toStaffId), shiftId: Number(swapData.toShiftId), workDate: swapData.toWorkDate }
                    );
                    toast.success("Đổi ca thành công");
                    setSwapDialogOpen(false);
                    fetchSchedules();
                } catch (err: any) {
                    toast.error(err.response?.data?.message || "Lỗi khi đổi ca");
                }
            }} className="bg-amber-700 hover:bg-amber-800 text-white">Xác nhận đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
