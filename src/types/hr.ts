// SHIFT
export interface Shift {
  id: number;
  name: string;
  startTime: string; // HH:MM or ISO
  endTime: string;
  checkInTime: string;
  checkOutTime: string;
  isActive: boolean;
}

export interface CreateShiftDto {
  name: string;
  startTime: string;
  endTime: string;
  checkInTime: string;
  checkOutTime: string;
  isActive?: boolean;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}

// SCHEDULE
export interface StaffShort {
  id: number;
  fullName: string;
  code: string;
  salarySetting?: {
      salaryType: 'hourly' | 'monthly';
      baseRate: number;
  };
}

export interface StaffSchedule {
  id: number;
  staffId: number;
  shiftId: number;
  workDate: string; // YYYY-MM-DD
  status: string;
  notes?: string;
  // Relations
  staff?: StaffShort;
  shift?: Shift;
}

export interface CreateScheduleDto {
  staffId: number;
  shiftIds: number[];
  workDate: string;
  notes?: string;
}

export interface BulkCreateScheduleDto {
  schedules: {
    staffId: number;
    shiftIds: number[];
    workDate: string;
    notes?: string;
  }[];
}

export interface ScheduleQueryDto {
  from?: string;
  to?: string;
  staffId?: number;
  shiftId?: number;
}

// TIMEKEEPING
export interface Timekeeping {
  id: number;
  staffId: number;
  scheduleId?: number;
  shiftId?: number;
  workDate: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  overtimeHours?: number;
  status: 'pending' | 'on-time' | 'late' | 'early' | 'absent';
  notes?: string;
  
  staff?: StaffShort;
  shift?: Shift;
  schedule?: StaffSchedule;
}

export interface CheckInDto {
  shiftId: number;
  note?: string;
}

export interface CheckOutDto {
  note?: string;
}

export interface BulkTimekeepingDto {
  date: string;
  shiftId: number;
  checkIn: string; // HH:MM
  checkOut: string; // HH:MM
  staffIds: number[];
}

export interface UpdateTimekeepingDto {
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  status?: string;
  notes?: string;
}

export interface TimekeepingQueryDto {
  from?: string;
  to?: string;
  staffId?: number;
  shiftId?: number;
}
