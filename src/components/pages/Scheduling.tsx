import { useState } from "react";
import { Settings, Calendar, Clock, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShiftManagement } from "../scheduling/ShiftManagement";
import { ScheduleCalendar } from "../scheduling/ScheduleCalendar";
import { TimekeepingBoard } from "../scheduling/TimekeepingBoard";
import { PayrollBoard } from "../scheduling/PayrollBoard";
import { initialSchedule } from "../../data/staffData";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  active?: boolean;
}

export function Scheduling() {
  const [activeTab, setActiveTab] = useState("shifts");
  const [schedule, setSchedule] =
    useState<Record<string, Record<string, string[]>>>(initialSchedule);
  const [timekeepingData, setTimekeepingData] = useState<
    Record<string, Record<string, Record<string, any>>>
  >({});
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "1",
      name: "Ca sáng",
      startTime: "07:00",
      endTime: "11:00",
      checkInTime: "06:00",
      checkOutTime: "12:00",
      active: true,
    },
    {
      id: "2",
      name: "Ca chiều",
      startTime: "14:00",
      endTime: "18:00",
      checkInTime: "13:00",
      checkOutTime: "19:00",
      active: true,
    },
    {
      id: "3",
      name: "Ca tối",
      startTime: "18:00",
      endTime: "22:00",
      checkInTime: "17:00",
      checkOutTime: "23:00",
      active: true,
    },
  ]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Lịch làm việc</h1>
          <p className="text-neutral-600 mt-1">
            Quản lý ca làm và xếp lịch nhân viên
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quản lý ca làm việc
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Xếp lịch nhân viên
          </TabsTrigger>
          <TabsTrigger value="timekeeping" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Bảng chấm công
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Bảng lương
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="mt-6">
          <ShiftManagement shifts={shifts} setShifts={setShifts} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ScheduleCalendar
            shifts={shifts}
            schedule={schedule}
            setSchedule={setSchedule}
          />
        </TabsContent>

        <TabsContent value="timekeeping" className="mt-6">
          <TimekeepingBoard
            shifts={shifts}
            schedule={schedule}
            setSchedule={setSchedule}
            value={timekeepingData}
            onChange={setTimekeepingData}
          />
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          <PayrollBoard
            shifts={shifts}
            timekeepingData={timekeepingData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
