import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Settings, Calendar, Clock, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ShiftManagement } from "../scheduling/ShiftManagement";
import { ScheduleCalendar } from "../scheduling/ScheduleCalendar";
import { TimekeepingBoard } from "../scheduling/TimekeepingBoard";
import { PayrollBoard } from "../scheduling/PayrollBoard";
import shiftApi from "../../api/shiftApi";
import staffApi from "../../api/staffApi";
import { Shift } from "../../types/hr";
import { toast } from "sonner"; // Assuming toast usage

export function Scheduling() {
  const { hasPermission } = useAuth();
  const canViewScheduling = hasPermission('staff_scheduling:view');
  const canViewTimekeeping = hasPermission('staff_timekeeping:view');
  const canViewPayroll = hasPermission('staff_payroll:view');

  const [activeTab, setActiveTab] = useState(() => {
    if (canViewScheduling) return "shifts";
    if (canViewTimekeeping) return "timekeeping";
    if (canViewPayroll) return "payroll";
    return "shifts";
  });

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch shifts & staff
  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await shiftApi.getAll(); // Fetch all shifts
      const responseData = res.data as any;
      const data = Array.isArray(responseData) ? responseData : (responseData.data || responseData.metaData || []);
      setShifts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch shifts", error);
      toast.error("Không thể tải danh sách ca làm việc");
    } finally {
      setLoading(false);
    }
  }, []);

  const [staffList, setStaffList] = useState<any[]>([]); // Use 'any' temporarily or import Staff type

  const fetchStaff = useCallback(async () => {
    try {
      const res = await staffApi.getAll({ limit: 100, status: 'active' });
      const responseData = res.data as any;
      const staffArray = responseData.staffs || responseData.metaData?.staffs || responseData.data?.staffs || [];
      setStaffList(Array.isArray(staffArray) ? staffArray : []);
    } catch (error) {
      console.error("Failed to fetch staff", error);
    }
  }, []);

  useEffect(() => {
    if (canViewScheduling || canViewTimekeeping) {
        fetchShifts();
        fetchStaff();
    }
  }, [canViewScheduling, canViewTimekeeping, fetchShifts, fetchStaff]);

  useEffect(() => {
    if (canViewScheduling || canViewTimekeeping) {
        fetchShifts();
    }
  }, [canViewScheduling, canViewTimekeeping, fetchShifts]);

  // Pass fetchShifts to ShiftManagement so it can refresh list after changes
  const handleRefreshShifts = () => {
      fetchShifts();
  };


  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold">Lịch làm việc</h1>
          <p className="text-neutral-600 mt-1">
            Quản lý ca làm và xếp lịch nhân viên
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          {canViewScheduling && (
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quản lý ca làm việc
          </TabsTrigger>
          )}
          {canViewScheduling && (
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Xếp lịch nhân viên
          </TabsTrigger>
          )}
          {canViewTimekeeping && (
          <TabsTrigger value="timekeeping" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Bảng chấm công
          </TabsTrigger>
          )}
          {canViewPayroll && (
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Bảng lương
          </TabsTrigger>
          )}
        </TabsList>

        {canViewScheduling && (
        <TabsContent value="shifts" className="mt-6">
          <ShiftManagement shifts={shifts} onRefresh={handleRefreshShifts} />
        </TabsContent>
        )}

        {/* Placeholder for other tabs - they will need updates too */}
        {canViewScheduling && (
        <TabsContent value="schedule" className="mt-6">
          <ScheduleCalendar shifts={shifts} staffList={staffList} />
        </TabsContent>
        )}

        {canViewTimekeeping && (
        <TabsContent value="timekeeping" className="mt-6">
           <TimekeepingBoard shifts={shifts} staffList={staffList} />
        </TabsContent>
        )}

        {canViewPayroll && (
        <TabsContent value="payroll" className="mt-6">
           <PayrollBoard shifts={shifts} staffList={staffList} />
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
