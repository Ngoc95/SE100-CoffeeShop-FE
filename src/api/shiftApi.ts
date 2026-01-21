import axiosClient from './axiosClient';
import { CreateShiftDto, Shift, UpdateShiftDto } from '../types/hr';

const shiftApi = {
  getAll: (isActive?: boolean) => {
    return axiosClient.get<Shift[]>('/shifts', { params: { isActive } });
  },

  getById: (id: number) => {
    return axiosClient.get<Shift>(`/shifts/${id}`);
  },

  create: (data: CreateShiftDto) => {
    return axiosClient.post<Shift>('/shifts', data);
  },

  update: (id: number, data: UpdateShiftDto) => {
    return axiosClient.patch<Shift>(`/shifts/${id}`, data);
  },

  delete: (id: number) => {
    return axiosClient.delete<{ message: string }>(`/shifts/${id}`);
  },
  
  toggleActive: (id: number) => {
    return axiosClient.patch<{ message: string; metaData: Shift }>(`/shifts/${id}/toggle`);
  }
};

export default shiftApi;
