import axiosClient from './axiosClient';
import { BulkTimekeepingDto, CheckInDto, CheckOutDto, Timekeeping, TimekeepingQueryDto, UpdateTimekeepingDto } from '../types/hr';

const timekeepingApi = {
  checkIn: (data: CheckInDto) => {
    return axiosClient.post<Timekeeping>('/timekeeping/check-in', data);
  },

  checkOut: (data: CheckOutDto) => {
    return axiosClient.post<Timekeeping>('/timekeeping/check-out', data);
  },
  
  // Admin methods
  getAll: (params?: TimekeepingQueryDto) => {
    return axiosClient.get<Timekeeping[]>('/timekeeping', { params });
  },

  bulkCheckIn: (data: BulkTimekeepingDto) => {
    return axiosClient.post<Timekeeping[]>('/timekeeping/bulk', data);
  },

  update: (id: number, data: UpdateTimekeepingDto) => {
    return axiosClient.patch<Timekeeping>(`/timekeeping/${id}`, data);
  },

  create: (data: any) => {
    return axiosClient.post<Timekeeping>('/timekeeping', data);
  }
};

export default timekeepingApi;
