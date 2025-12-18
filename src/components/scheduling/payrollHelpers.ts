// Helper function to calculate overtime pay for shift-based employees
import type { StaffMember } from "../../data/staffData";
import type { TimekeepingEntry } from "./TimekeepingBoard";

type TimekeepingData = Record<string, Record<string, Record<string, TimekeepingEntry>>>;
type DayType = "weekday" | "saturday" | "sunday";

const parseCurrency = (value: string | undefined) => {
  if (!value) return 0;
  const normalized = value.replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return 0;
  return num;
};

const parseCoefficient = (value: string | undefined, defaultValue: number) => {
  if (!value) return defaultValue;
  const normalized = value.replace(/[^\d.-]/g, "");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return defaultValue;
  return num / 100;
};

const formatISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDayTypeFromDate = (date: Date): DayType => {
  const day = date.getDay();
  if (day === 0) return "sunday";
  if (day === 6) return "saturday";
  return "weekday";
};

export const calculateStaffOvertime = (
  staff: StaffMember,
  timekeepingData: TimekeepingData | undefined,
  shifts: { id: string; startTime: string; endTime: string }[],
  periodStart: Date,
  periodEnd: Date
) => {
  const salarySettings = staff.salarySettings;
  
  // Chỉ tính overtime cho lương theo ca
  if (salarySettings?.salaryType !== "shift" || !salarySettings.overtimeEnabled) {
    return 0;
  }

  if (!timekeepingData || Object.keys(timekeepingData).length === 0) {
    return 0;
  }

  let total = 0;
  const fromStr = formatISODate(periodStart);
  const toStr = formatISODate(periodEnd);

  Object.entries(timekeepingData).forEach(([date, shiftMap]) => {
    const dateStr = date.split("T")[0];
    if (dateStr < fromStr || dateStr > toStr) return;

    Object.entries(shiftMap || {}).forEach(([shiftId, staffMap]) => {
      const entry = (staffMap as any)?.[staff.id];
      if (!entry || typeof entry !== "object") return;
      
      const typedEntry = entry as TimekeepingEntry;
      if (!typedEntry.overtimeBefore && !typedEntry.overtimeAfter) return;

      const shiftInfo = shifts.find((sh) => sh.id === shiftId);
      const shiftSetting = salarySettings.shifts.find((sh) => sh.id === shiftId);
      
      if (!shiftInfo || !shiftSetting) return;

      const basePerShift = parseCurrency(shiftSetting.salaryPerShift);
      if (!basePerShift) return;

      const startParts = shiftInfo.startTime.split(":").map(Number);
      const endParts = shiftInfo.endTime.split(":").map(Number);
      const shiftMinutes =
        endParts[0] * 60 + endParts[1] - (startParts[0] * 60 + startParts[1]);
      
      if (shiftMinutes > 0) {
        const hourlyBase = basePerShift / (shiftMinutes / 60);
        const overtimeMinutes =
          (typedEntry.overtimeBeforeHours || 0) * 60 +
          (typedEntry.overtimeBeforeMinutes || 0) +
          (typedEntry.overtimeAfterHours || 0) * 60 +
          (typedEntry.overtimeAfterMinutes || 0);
        
        if (overtimeMinutes > 0) {
          const dateObj = new Date(date);
          const dayType = getDayTypeFromDate(dateObj);
          
          let coeffValue: string | undefined;
          if (typedEntry.status === "day-off") {
            coeffValue = salarySettings.overtimeCoeffs.dayOff;
          } else if (dayType === "saturday") {
            coeffValue = salarySettings.overtimeCoeffs.saturday;
          } else if (dayType === "sunday") {
            coeffValue = salarySettings.overtimeCoeffs.sunday;
          } else {
            coeffValue = salarySettings.overtimeCoeffs.weekday;
          }
          
          const overtimeFactor = parseCoefficient(coeffValue, 1);
          const overtimeHours = overtimeMinutes / 60;
          total += hourlyBase * overtimeHours * overtimeFactor;
        }
      }
    });
  });

  return total;
};
