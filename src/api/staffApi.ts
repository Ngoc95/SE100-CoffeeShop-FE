import axiosClient from './axiosClient';
import { CreateStaffDto, Staff, StaffListResponse, StaffQueryDto, UpdateStaffDto } from '../types/staff';

const staffApi = {
  getAll: (params?: StaffQueryDto) => {
    return axiosClient.get<StaffListResponse>('/staff', { params });
  },

  getById: (id: number) => {
    return axiosClient.get<Staff>(`/staff/${id}`);
  },

  create: (data: CreateStaffDto) => {
    return axiosClient.post<Staff>('/staff', data);
  },

  update: (id: number, data: UpdateStaffDto) => {
    return axiosClient.patch<Staff>(`/staff/${id}`, data);
  },

  delete: (id: number) => {
    return axiosClient.delete<{ message: string }>(`/staff/${id}`);
  }
};

export default staffApi;
