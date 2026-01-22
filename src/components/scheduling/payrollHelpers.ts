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
  staff: any,
  timekeepingData: TimekeepingData | undefined,
  shifts: { id: string | number; startTime: string; endTime: string }[],
  periodStart: Date,
  periodEnd: Date
) => {
  // Overtime calculation disabled as requested
  return 0;
};
