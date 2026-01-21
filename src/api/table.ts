import axiosClient from "./axiosClient";
import { Area } from "./area";

export interface SuccessResponse<T> {
  message: string;
  statusCode: number;
  metaData: T;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Table {
  id: number;
  tableName: string;
  areaId: number;
  capacity: number;
  isActive: boolean;
  currentStatus: 'available' | 'occupied';
  areaName?: string;
  area?: Area;
  createdAt: string;
  updatedAt: string;
  order_id?: number;
}

export interface CreateTableDto {
  tableName: string;
  areaId?: number;
  capacity?: number;
  isActive?: boolean;
  currentStatus?: 'available' | 'occupied';
}

export interface UpdateTableDto {
  tableName?: string;
  areaId?: number;
  capacity?: number;
  isActive?: boolean;
  currentStatus?: 'available' | 'occupied';
}

export const getTables = async (params?: { 
  page?: number; 
  limit?: number; 
  q?: string;
  areaId?: number;
  isActive?: boolean;
  sort?: string;
}) => {
  const response = await axiosClient.get<SuccessResponse<PaginatedResult<Table>>>("/tables", { params });
  return response.data;
};

export const getTableById = async (id: number) => {
  const response = await axiosClient.get<SuccessResponse<Table>>(`/tables/${id}`);
  return response.data;
};

export const createTable = async (data: CreateTableDto) => {
  const response = await axiosClient.post<SuccessResponse<Table>>("/tables", data);
  return response.data;
};

export const updateTable = async (id: number, data: UpdateTableDto) => {
  const response = await axiosClient.patch<SuccessResponse<Table>>(`/tables/${id}`, data);
  return response.data;
};

export const deleteTable = async (id: number) => {
  const response = await axiosClient.delete<SuccessResponse<{ message: string }>>(`/tables/${id}`);
  return response.data;
};
