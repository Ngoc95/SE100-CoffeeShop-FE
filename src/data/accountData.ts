import { Account } from '../types/account';

// Mock accounts data - corresponds to existing mock users in AuthContext
export const initialAccounts: Account[] = [
  {
    id: 'acc-1',
    username: 'admin',
    fullName: 'Nguyễn Văn A',
    roleId: 'role-manager',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc-2',
    username: 'phache',
    fullName: 'Trần Thị B',
    roleId: 'role-barista',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc-3',
    username: 'thungan',
    fullName: 'Lê Văn C',
    roleId: 'role-cashier',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc-4',
    username: 'phucvu',
    fullName: 'Phạm Thị D',
    roleId: 'role-server',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];
