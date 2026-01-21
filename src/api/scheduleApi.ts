import axiosClient from './axiosClient';
import { BulkCreateScheduleDto, CreateScheduleDto, ScheduleQueryDto, StaffSchedule } from '../types/hr';

const scheduleApi = {
  getAll: (params?: ScheduleQueryDto) => {
    return axiosClient.get<StaffSchedule[]>('/schedules', { params });
  },

  create: (data: CreateScheduleDto) => {
    return axiosClient.post<StaffSchedule[]>('/schedules', data);
  },

  createBulk: (data: BulkCreateScheduleDto) => {
    return axiosClient.post<StaffSchedule[]>('/schedules/bulk', data);
  },

  delete: (id: number) => {
    return axiosClient.delete<{ message: string }>(`/schedules/${id}`);
  },

  swap: (from: { staffId: number; shiftId: number; workDate: string }, to: { staffId: number; shiftId: number; workDate: string }) => {
    return axiosClient.post<{ message: string }>('/schedules/swap', { from, to });
  }
};

export default scheduleApi;
