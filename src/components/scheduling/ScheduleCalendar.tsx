import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Download, Upload, Calendar as CalendarIcon, Filter, X, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { toast } from 'sonner@2.0.3';
import { staffMembers, initialSchedule } from '../../data/staffData';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  positionLabel: string;
}

interface ScheduleEntry {
  staffId: string;
  day: string;
  shiftIds: string[];
}

interface ScheduleCalendarProps {
  shifts: Shift[];
  schedule?: Record<string, Record<string, string[]>>;
  setSchedule?: (schedule: Record<string, Record<string, string[]>>) => void;
  staffList?: any[];
}

export function ScheduleCalendar({ shifts: propsShifts, schedule: propsSchedule, setSchedule: setPropsSchedule, staffList }: ScheduleCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ staffId: string; day: string } | null>(null);
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterShifts, setFilterShifts] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Use shifts from props - convert to the format needed for ScheduleCalendar
  // Mỗi ca có màu khác nhau
  const shiftColors: Record<string, string> = {
    '1': 'bg-yellow-100 text-yellow-800 border-yellow-200', // Ca sáng
    '2': 'bg-blue-100 text-blue-800 border-blue-200', // Ca chiều
    '3': 'bg-purple-100 text-purple-800 border-purple-200', // Ca tối
  };
  
  // Chỉ lấy các ca đang hoạt động
  const shifts = propsShifts
    .filter(shift => shift.active !== false)
    .map(shift => ({
    id: shift.id,
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
      color: shiftColors[shift.id] || 'bg-blue-100 text-blue-800 border-blue-200',
    }));

  // Chỉ lấy nhân viên không phải quản lý (manager)
  const currentStaffList = staffList || staffMembers;
  const staff: StaffMember[] = currentStaffList
    .filter(s => s.position !== 'manager')
    .slice(0, 4)
    .map(s => ({
      id: s.id,
      name: s.fullName,
      role: s.position,
      positionLabel: s.positionLabel,
    }));

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const roles = ['Pha chế', 'Thu ngân', 'Phục vụ'];

  // Use schedule from props or local state
  const [localSchedule, setLocalSchedule] = useState<Record<string, Record<string, string[]>>>(
    propsSchedule || initialSchedule
  );
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

  const handleOpenAddShift = (staffId: string, day: string) => {
    setSelectedCell({ staffId, day });
    setSelectedShifts(schedule[staffId]?.[day] || []);
    setAddShiftDialogOpen(true);
  };

  const handleSaveShifts = () => {
    if (!selectedCell) return;

    const newSchedule = {
      ...schedule,
      [selectedCell.staffId]: {
        ...schedule[selectedCell.staffId],
        [selectedCell.day]: selectedShifts,
      },
    };
    updateSchedule(newSchedule);

    toast.success('Đã cập nhật lịch làm việc');
    setAddShiftDialogOpen(false);
  };

  const toggleShift = (shiftId: string) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) 
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const getShiftById = (id: string) => shifts.find(s => s.id === id);

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

  const calculateEstimatedSalary = (staffId: string) => {
    const staffMember = staffMembers.find((s) => s.id === staffId);
    if (!staffMember) return 0;

    const salarySettings = staffMember.salarySettings;
    let totalSalary = 0;

    daysOfWeek.forEach((day) => {
      const shiftIds = schedule[staffId]?.[day] || [];
      shiftIds.forEach((shiftId) => {
        if (salarySettings && salarySettings.salaryType === "shift") {
          const shiftSetting =
            salarySettings.shifts.find((sh) => sh.id === shiftId) ||
            salarySettings.shifts[0];
          if (shiftSetting) {
            const normalized = shiftSetting.salaryPerShift
              .toString()
              .replace(/[^\d]/g, "");
            const perShift = Number(normalized) || 0;
            totalSalary += perShift;
          }
        } else {
          const basePerShift = staffMember.salary
            ? Math.round(staffMember.salary / 26)
            : 200000;
          totalSalary += basePerShift;
        }
      });
    });

    return totalSalary;
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
      total += schedule[person.id]?.[day]?.length || 0;
    });
    return total;
  };

  // Calculate total shifts per person
  const getTotalShiftsPerPerson = (staffId: string) => {
    let total = 0;
    daysOfWeek.forEach(day => {
      total += schedule[staffId]?.[day]?.length || 0;
    });
    return total;
  };


  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <div className="w-64 bg-white border-r p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <div className="space-y-4">
              {/* Filter by Role */}
              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Chức vụ</Label>
                <div className="space-y-2">
                  {roles.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={filterRoles.includes(role)}
                        onCheckedChange={() => toggleRoleFilter(role)}
                      />
                      <label
                        htmlFor={`role-${role}`}
                        className="text-sm text-slate-700 cursor-pointer flex-1"
                      >
                        {role}
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        {staff.filter(s => s.role === role).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter by Shift */}
              <div className="pt-4 border-t">
                <Label className="text-xs text-slate-600 mb-2 block">Ca làm việc</Label>
                <div className="space-y-2">
                  {shifts.map(shift => (
                    <div key={shift.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shift-${shift.id}`}
                        checked={filterShifts.includes(shift.id)}
                        onCheckedChange={() => toggleShiftFilter(shift.id)}
                      />
                      <label
                        htmlFor={`shift-${shift.id}`}
                        className="text-sm text-slate-700 cursor-pointer flex-1"
                      >
                        <div className="flex flex-col gap-1">
                          <span>{shift.name}</span>
                          <span className="text-xs text-slate-500">
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="pt-4 border-t">
            <h3 className="text-sm text-slate-700 mb-3">Thống kê</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng nhân viên</span>
                <span className="text-slate-900">{staff.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Đang hiển thị</span>
                <span className="text-amber-600">{filteredStaff.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng ca tuần này</span>
                <span className="text-slate-900">
                  {filteredStaff.reduce((sum, person) => sum + getTotalShiftsPerPerson(person.id), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(filterRoles.length > 0 || filterShifts.length > 0) && (
            <Button
              variant="outline"
              className="w-full"
              onClick={clearFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
              <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
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
                            className="p-2 cursor-pointer hover:bg-amber-50 transition-colors"
                            onClick={() => handleOpenAddShift(person.id, day)}
                          >
                            <div className="flex flex-col gap-1 min-h-[48px] items-center justify-center">
                              {schedule[person.id]?.[day]?.length > 0 ? (
                                schedule[person.id][day].map(shiftId => {
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
                            {formatCurrency(calculateEstimatedSalary(person.id))}
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
                  Xếp ca cho {staff.find(s => s.id === selectedCell.staffId)?.name} - {selectedCell.day}
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
                        {shift.startTime} - {shift.endTime}
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

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import lịch làm việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 mb-2">
                Kéo thả file Excel vào đây hoặc click để chọn file
              </p>
              <Button variant="outline" size="sm">
                Chọn file
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileSpreadsheet className="w-4 h-4" />
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={() => {
                  // Download template file
                  toast.success('Đang tải file mẫu...');
                }}
              >
                Tải file Excel mẫu
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Bỏ qua
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export lịch làm việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Bạn muốn export lịch làm việc cho tuần này?
            </p>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-slate-900">{formatWeekRange()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Bỏ qua
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
