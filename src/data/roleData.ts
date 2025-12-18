import { Role, Permission } from '../types/account';
import { ALL_PERMISSIONS } from './permissionData';

// Default system roles with predefined permissions
export const defaultRoles: Role[] = [
  {
    id: 'role-manager',
    name: 'Quản lý',
    description: 'Toàn quyền quản lý hệ thống',
    isSystem: true,
    permissions: ALL_PERMISSIONS, // Manager has all permissions
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-cashier',
    name: 'Thu ngân',
    description: 'Nhân viên thu ngân - Quản lý bán hàng và khách hàng',
    isSystem: true,
    permissions: [
      'pos:access',
      'dashboard:view',
      'invoices:view',
      'invoices:create',
      'invoices:update',
      'customers:view',
      'customers:create',
      'customers:update',
      'goods_inventory:view',
      'goods_pricing:view',
    ] as Permission[],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-server',
    name: 'Phục vụ',
    description: 'Nhân viên phục vụ - Quản lý bàn và đơn hàng',
    isSystem: true,
    permissions: [
      'pos:access',
      'dashboard:view',
      'tables:view',
      'tables:update',
      'invoices:view',
      'invoices:create',
      'goods_inventory:view',
    ] as Permission[],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-barista',
    name: 'Pha chế',
    description: 'Nhân viên pha chế - Xem và xử lý đơn hàng',
    isSystem: true,
    permissions: [
      'kitchen:access',
      'dashboard:view',
      'goods_inventory:view',
      'goods_recipe:view',
    ] as Permission[],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Initial roles state (can be modified by adding custom roles)
export const initialRoles: Role[] = [...defaultRoles];
