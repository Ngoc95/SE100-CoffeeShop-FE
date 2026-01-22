import axiosClient from "./axiosClient";

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

export interface Area {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const getAreas = async (params?: { page?: number; limit?: number; sort?: string }) => {
  const response = await axiosClient.get<SuccessResponse<PaginatedResult<Area>>>("/areas", { params });
  return response.data;
};

export const createArea = async (data: { name: string }) => {
  const response = await axiosClient.post<SuccessResponse<Area>>("/areas", data);
  return response.data;
};

export const updateArea = async (id: number, data: { name: string }) => {
  const response = await axiosClient.patch<SuccessResponse<Area>>(`/areas/${id}`, data);
  return response.data;
};

export const deleteArea = async (id: number) => {
  const response = await axiosClient.delete<SuccessResponse<{ message: string }>>(`/areas/${id}`);
  return response.data;
};
