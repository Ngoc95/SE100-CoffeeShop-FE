export interface StaffSalarySetting {
  id: number;
  staffId: number;
  salaryType: 'hourly' | 'monthly';
  baseRate: number;
}

export interface StaffUser {
  id: number;
  username: string;
  role: {
    id: number;
    name: string;
  };
  status: string;
  lastLogin?: string;
}

export interface Staff {
  id: number;
  code: string;
  fullName: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  idCard?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  status: 'active' | 'quit' | 'inactive';
  userId?: number;
  avatarUrl?: string;
  createdAt: string;
  
  // Relations
  user?: StaffUser;
  salarySetting?: StaffSalarySetting;
}

export interface CreateStaffDto {
  fullName: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  idCard?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  
  // Account
  username?: string;
  password?: string;
  roleId?: number;
  
  // Salary
  salaryType?: 'hourly' | 'monthly';
  baseRate?: number;
}

export interface UpdateStaffDto {
  fullName?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  idCard?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  status?: 'active' | 'quit' | 'inactive';
  
  // Account Updates
  username?: string;
  password?: string;
  roleId?: number;
  
  // Salary Updates
  salaryType?: 'hourly' | 'monthly';
  baseRate?: number;
}

export interface StaffQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  position?: string;
  status?: string;
  sort?: Record<string, 'asc' | 'desc'>;
}

export interface StaffListResponse {
  currentPage: number;
  totalPages: number;
  total: number;
  staffs: Staff[];
}
