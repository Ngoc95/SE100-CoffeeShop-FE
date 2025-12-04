import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Download, Upload, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';

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
}

interface ScheduleEntry {
  staffId: string;
  day: string;
  shiftIds: string[];
}

interface ScheduleCalendarProps {
  shifts: Shift[];
}

export function ScheduleCalendar({ shifts: propsShifts }: ScheduleCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ staffId: string; day: string } | null>(null);
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterShifts, setFilterShifts] = useState<string[]>([]);

  // Use shifts from props - convert to the format needed for ScheduleCalendar
  const shifts = propsShifts.map(shift => ({
    id: shift.id,
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
    color: shift.color.includes('amber') ? 'bg-amber-100 text-amber-800' :
           shift.color.includes('blue') ? 'bg-blue-100 text-blue-800' :
           shift.color.includes('purple') ? 'bg-purple-100 text-purple-800' :
           shift.color.includes('green') ? 'bg-green-100 text-green-800' :
           shift.color.includes('pink') ? 'bg-pink-100 text-pink-800' :
           shift.color.includes('red') ? 'bg-red-100 text-red-800' :
           'bg-amber-100 text-amber-800',
  }));

  const staff: StaffMember[] = [
    { id: '1', name: 'Nguyễn Văn A', role: 'Quản lý' },
    { id: '2', name: 'Trần Thị B', role: 'Pha chế' },
    { id: '3', name: 'Lê Văn C', role: 'Thu ngân' },
    { id: '4', name: 'Phạm Thị D', role: 'Phục vụ' },
    { id: '5', name: 'Hoàng Văn E', role: 'Pha chế' },
    { id: '6', name: 'Võ Thị F', role: 'Phục vụ' },
    { id: '7', name: 'Đặng Văn G', role: 'Thu ngân' },
    { id: '8', name: 'Phan Thị H', role: 'Pha chế' },
  ];

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const roles = ['Quản lý', 'Pha chế', 'Thu ngân', 'Phục vụ'];

  const [schedule, setSchedule] = useState<Record<string, Record<string, string[]>>>({
    '1': { 'T2': ['1'], 'T3': ['1'], 'T4': ['1'], 'T5': ['1'], 'T6': ['1'], 'T7': [], 'CN': [] },
    '2': { 'T2': ['1'], 'T3': ['1', '2'], 'T4': ['1'], 'T5': ['1'], 'T6': ['1', '2'], 'T7': ['2'], 'CN': ['2'] },
    '3': { 'T2': ['2'], 'T3': [], 'T4': ['2'], 'T5': ['2'], 'T6': [], 'T7': ['1', '2'], 'CN': ['1'] },
    '4': { 'T2': ['2'], 'T3': ['2'], 'T4': [], 'T5': ['2'], 'T6': ['2'], 'T7': ['2'], 'CN': [] },
    '5': { 'T2': ['1'], 'T3': ['1'], 'T4': ['1', '2'], 'T5': ['1'], 'T6': ['1'], 'T7': ['1'], 'CN': ['2'] },
    '6': { 'T2': ['2'], 'T3': ['2'], 'T4': ['2'], 'T5': [], 'T6': ['2'], 'T7': ['2'], 'CN': ['1'] },
    '7': { 'T2': ['1', '2'], 'T3': ['2'], 'T4': [], 'T5': ['2'], 'T6': ['1'], 'T7': [], 'CN': ['2'] },
    '8': { 'T2': [], 'T3': ['1'], 'T4': ['1'], 'T5': ['1', '2'], 'T6': [], 'T7': ['1', '2'], 'CN': [] },
  });

  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

  const handleOpenAddShift = (staffId: string, day: string) => {
    setSelectedCell({ staffId, day });
    setSelectedShifts(schedule[staffId]?.[day] || []);
    setAddShiftDialogOpen(true);
  };

  const handleSaveShifts = () => {
    if (!selectedCell) return;

    setSchedule(prev => ({
      ...prev,
      [selectedCell.staffId]: {
        ...prev[selectedCell.staffId],
        [selectedCell.day]: selectedShifts,
      },
    }));

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

  // Apply role filter
  let filteredStaff = filterRoles.length > 0
    ? staff.filter(s => filterRoles.includes(s.role))
    : staff;

  // Apply shift filter - only show staff that have at least one of the selected shifts
  if (filterShifts.length > 0) {
    filteredStaff = filteredStaff.filter(person => {
      // Check if this person has any of the selected shifts in their schedule
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

  // Statistics
  const totalStaff = staff.length;
  const staffByRole = roles.map(role => ({
    role,
    count: staff.filter(s => s.role === role).length
  }));
  const totalShiftsThisWeek = filteredStaff.reduce((sum, person) => {
    return sum + getTotalShiftsPerPerson(person.id);
  }, 0);

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <div className="w-64 bg-white border-r p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </h3>
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
                <span className="text-slate-900">{totalStaff}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Đang hiển thị</span>
                <span className="text-amber-600">{filteredStaff.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng ca tuần này</span>
                <span className="text-slate-900">{totalShiftsThisWeek}</span>
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
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={goToCurrentWeek}
                className="text-sm text-neutral-700 hover:text-amber-700"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {formatWeekRange()}
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">Ca làm việc:</span>
              {shifts.map(shift => (
                <Badge key={shift.id} className={shift.color}>
                  {shift.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="border-amber-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left p-3 text-sm text-neutral-700 bg-amber-50 sticky left-0 z-10">
                        <div>Nhân viên</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {filteredStaff.length} người
                        </div>
                      </th>
                      {daysOfWeek.map((day, index) => (
                        <th key={day} className="p-3 text-center bg-amber-50 min-w-[120px]">
                          <div className="text-sm text-neutral-700">{day}</div>
                          <div className="text-xs text-neutral-500 mt-1">
                            {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {getTotalShiftsPerDay(day)} ca
                          </Badge>
                        </th>
                      ))}
                      <th className="p-3 text-center bg-amber-50 text-sm text-neutral-700">
                        Tổng
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
                            <p className="text-xs text-neutral-500">{person.role}</p>
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
                                  <Plus className="w-4 h-4 text-neutral-300 mx-auto" />
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                        <td className="p-3 text-center">
                          <Badge variant="outline">
                            {getTotalShiftsPerPerson(person.id)} ca
                          </Badge>
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
    </div>
  );
}