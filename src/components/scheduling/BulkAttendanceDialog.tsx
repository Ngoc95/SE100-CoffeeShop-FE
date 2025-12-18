import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface StaffMember {
  id: string;
  fullName: string;
  staffCode: string;
  position: string;
  positionLabel: string;
}

interface BulkAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shifts: Shift[];
  staffList: StaffMember[];
  schedule: Record<string, Record<string, string[]>>;
  onSave: (data: {
    date: Date;
    shiftId: string;
    checkIn: string;
    checkOut: string;
    selectedStaff: string[];
  }) => void;
}

// Generate time options from 00:00 to 23:45 with 15-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export function BulkAttendanceDialog({
  open,
  onOpenChange,
  shifts,
  staffList,
  schedule,
  onSave,
}: BulkAttendanceDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Get day label from date (T2, T3, T4, T5, T6, T7, CN)
  const getDayLabel = (date: Date): string => {
    const day = date.getDay();
    const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return labels[day];
  };

  // Get staff who have the selected shift on the selected date
  const getStaffForShift = (): StaffMember[] => {
    if (!selectedShift) return [];
    
    const dayLabel = getDayLabel(selectedDate);
    
    return staffList.filter(staff => {
      const staffSchedule = schedule[staff.id];
      if (!staffSchedule) return false;
      
      const dayShifts = staffSchedule[dayLabel];
      return dayShifts && dayShifts.includes(selectedShift);
    });
  };

  const availableStaff = getStaffForShift();

  // Handle select all toggle
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStaff(new Set(availableStaff.map(s => s.id)));
    } else {
      setSelectedStaff(new Set());
    }
  };

  // Handle individual staff selection
  const handleStaffToggle = (staffId: string) => {
    const newSelected = new Set(selectedStaff);
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId);
    } else {
      newSelected.add(staffId);
    }
    setSelectedStaff(newSelected);
    setSelectAll(newSelected.size === availableStaff.length);
  };

  // Handle save
  const handleSave = () => {
    if (!selectedShift) {
      toast.error('Vui lòng chọn ca làm việc');
      return;
    }
    if (!checkInTime || !checkOutTime) {
      toast.error('Vui lòng chọn giờ vào và giờ ra');
      return;
    }
    if (selectedStaff.size === 0) {
      toast.error('Vui lòng chọn ít nhất một nhân viên');
      return;
    }

    onSave({
      date: selectedDate,
      shiftId: selectedShift,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      selectedStaff: Array.from(selectedStaff),
    });

    // Reset form
    setSelectedShift('');
    setCheckInTime('');
    setCheckOutTime('');
    setSelectedStaff(new Set());
    setSelectAll(false);
    onOpenChange(false);
    
    toast.success(`Đã chấm công cho ${selectedStaff.size} nhân viên`);
  };

  // Auto-fill check-in/out times when shift is selected
  const handleShiftChange = (shiftId: string) => {
    setSelectedShift(shiftId);
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      setCheckInTime(shift.startTime);
      setCheckOutTime(shift.endTime);
    }
    // Reset staff selection when shift changes
    setSelectedStaff(new Set());
    setSelectAll(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chấm công hàng loạt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Ngày</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'dd/MM/yyyy - EEEE', { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Shift Selection */}
          <div className="space-y-2">
            <Label>Ca làm việc</Label>
            <Select value={selectedShift} onValueChange={handleShiftChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn ca" />
              </SelectTrigger>
              <SelectContent>
                {shifts.filter(s => s.active !== false).map(shift => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giờ vào</Label>
              <Select value={checkInTime} onValueChange={setCheckInTime}>
                <SelectTrigger>
                  <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      <Clock className="w-3 h-3 inline mr-2" />
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Giờ ra</Label>
              <Select value={checkOutTime} onValueChange={setCheckOutTime}>
                <SelectTrigger>
                  <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      <Clock className="w-3 h-3 inline mr-2" />
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Staff Selection */}
          {selectedShift && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Nhân viên ({availableStaff.length} người có ca này)</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="cursor-pointer font-normal">
                    Chọn tất cả
                  </Label>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                {availableStaff.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Không có nhân viên nào được phân ca này
                  </p>
                ) : (
                  availableStaff.map(staff => (
                    <div key={staff.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
                      <Checkbox
                        id={`staff-${staff.id}`}
                        checked={selectedStaff.has(staff.id)}
                        onCheckedChange={() => handleStaffToggle(staff.id)}
                      />
                      <Label
                        htmlFor={`staff-${staff.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <div className="flex items-center justify-between">
                          <span>{staff.fullName}</span>
                          <span className="text-xs text-slate-500">
                            {staff.staffCode} - {staff.positionLabel}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
              
              {selectedStaff.size > 0 && (
                <p className="text-sm text-slate-600">
                  Đã chọn: <span className="font-semibold">{selectedStaff.size}</span> nhân viên
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            Chấm công
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
