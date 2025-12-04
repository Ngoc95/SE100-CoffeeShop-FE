import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ShiftManagement } from '../scheduling/ShiftManagement';
import { ScheduleCalendar } from '../scheduling/ScheduleCalendar';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateAllowance: number;
  earlyLeaveAllowance: number;
  workHourCalculation: string;
  overtimeCalculation: string;
  overtimeHourlyRate?: number;
  overtimePercentage?: number;
  color: string;
}

export function Scheduling() {
  const [activeTab, setActiveTab] = useState('shifts');
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: '1',
      name: 'Ca sáng',
      startTime: '06:00',
      endTime: '14:00',
      lateAllowance: 10,
      earlyLeaveAllowance: 10,
      workHourCalculation: 'fixed',
      overtimeCalculation: 'percentage',
      overtimePercentage: 150,
      color: 'bg-amber-100 border-amber-300',
    },
    {
      id: '2',
      name: 'Ca chiều',
      startTime: '14:00',
      endTime: '22:00',
      lateAllowance: 15,
      earlyLeaveAllowance: 15,
      workHourCalculation: 'fixed',
      overtimeCalculation: 'hourly_rate',
      overtimeHourlyRate: 50000,
      color: 'bg-blue-100 border-blue-300',
    },
    {
      id: '3',
      name: 'Ca tối',
      startTime: '22:00',
      endTime: '06:00',
      lateAllowance: 10,
      earlyLeaveAllowance: 10,
      workHourCalculation: 'actual',
      overtimeCalculation: 'percentage',
      overtimePercentage: 200,
      color: 'bg-purple-100 border-purple-300',
    },
  ]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-amber-950">Lịch làm việc</h1>
          <p className="text-neutral-600 mt-1">Quản lý ca làm và xếp lịch nhân viên</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quản lý ca làm việc
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Xếp lịch nhân viên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="mt-6">
          <ShiftManagement shifts={shifts} setShifts={setShifts} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ScheduleCalendar shifts={shifts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}