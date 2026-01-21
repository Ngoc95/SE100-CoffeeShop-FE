import axiosClient from './axiosClient';
import { Role, PermissionItem, Permission } from '../types/account';

export interface CreateRoleDto {
  name: string;
  description?: string;
  isSystem?: boolean;
  permissions: Permission[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isSystem?: boolean;
  permissions?: Permission[];
}

const roleApi = {
  getAll: () => {
    return axiosClient.get<{ metaData: { roles: Role[] } }>('/roles');
  },

  getAllPermissions: () => {
    return axiosClient.get<{ metaData: { permissions: PermissionItem[] } }>('/roles/permissions');
  },

  getById: (id: number) => {
    return axiosClient.get<{ metaData: Role }>(`/roles/${id}`);
  },

  create: (data: CreateRoleDto) => {
    return axiosClient.post<{ metaData: Role }>('/roles', data);
  },

  update: (id: number, data: UpdateRoleDto) => {
    return axiosClient.patch<{ metaData: Role }>(`/roles/${id}`, data);
  },

  delete: (id: number) => {
    return axiosClient.delete<{ message: string }>(`/roles/${id}`);
  }
};

export default roleApi;
