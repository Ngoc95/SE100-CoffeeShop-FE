import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Permission } from '../types/account';
import { initialAccounts } from '../data/accountData';
import { initialRoles } from '../data/roleData';
import { login as loginApi } from '../api/authApi';

export type UserRole = 'manager' | 'barista' | 'cashier' | 'server';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleLabel: string;
  roleId: string;
  permissions: Permission[];
}

// interface AuthContextType {
//   user: User | null;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
//   hasPermission: (permission: Permission) => boolean;
//   canView: (module: string) => boolean;
//   canCreate: (module: string) => boolean;
//   canUpdate: (module: string) => boolean;
//   canDelete: (module: string) => boolean;
// }
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  canView: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canUpdate: (module: string) => boolean;
  canDelete: (module: string) => boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database (in real app, this would be from backend/Supabase)
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    fullName: 'Nguyễn Văn A',
    role: 'manager',
    roleLabel: 'Quản lý',
    roleId: 'role-manager',
    permissions: [], // Will be loaded from account data
  },
  {
    id: '2',
    username: 'phache',
    password: 'phache123',
    fullName: 'Trần Thị B',
    role: 'barista',
    roleLabel: 'Pha chế',
    roleId: 'role-barista',
    permissions: [],
  },
  {
    id: '3',
    username: 'thungan',
    password: 'thungan123',
    fullName: 'Lê Văn C',
    role: 'cashier',
    roleLabel: 'Thu ngân',
    roleId: 'role-cashier',
    permissions: [],
  },
  {
    id: '4',
    username: 'phucvu',
    password: 'phucvu123',
    fullName: 'Phạm Thị D',
    role: 'server',
    roleLabel: 'Phục vụ',
    roleId: 'role-server',
    permissions: [],
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [user, setUser] = useState<User | null>(null);

  // const login = (username: string, password: string): boolean => {
  //   const foundUser = MOCK_USERS.find(
  //     (u) => u.username === username && u.password === password
  //   );

  //   if (foundUser) {
  //     // Find account in account data
  //     const account = initialAccounts.find((acc) => acc.username === username);

  //     let permissions: Permission[] = [];

  //     if (account) {
  //       // Use custom permissions if available, otherwise use role permissions
  //       if (account.customPermissions) {
  //         permissions = account.customPermissions;
  //       } else {
  //         const role = initialRoles.find((r) => r.id === account.roleId);
  //         permissions = role?.permissions || [];
  //       }
  //     }

  //     const { password: _, ...userWithoutPassword } = foundUser;
  //     const userWithPermissions = {
  //       ...userWithoutPassword,
  //       permissions,
  //     };

  //     setUser(userWithPermissions);
  //     localStorage.setItem('user', JSON.stringify(userWithPermissions));
  //     return true;
  //   }

  //   return false;
  // };
  const login = async (username: string, password: string) => {
    const res = await loginApi(username, password);

    const { accessToken, user } = res.data.metaData;

    // Lưu token
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    // Set state
    setUser(user);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  // Permission helper functions
  const hasPermission = (permission: Permission | string): boolean => {
    if (!user) return false;
    const requested = String(permission);
    const alt = requested.includes(":")
      ? requested.replace(/:/g, "_").toUpperCase()
      : requested;
    return (
      user.permissions.includes(requested as Permission) ||
      (user.permissions as unknown as string[]).includes(alt)
    );
  };

  const canView = (module: string): boolean => {
    if (!user) return false;
    const viewPermission = `${module}:view` as Permission;
    return hasPermission(viewPermission);
  };

  const canCreate = (module: string): boolean => {
    if (!user) return false;
    const createPermission = `${module}:create` as Permission;
    return hasPermission(createPermission);
  };

  const canUpdate = (module: string): boolean => {
    if (!user) return false;
    const updatePermission = `${module}:update` as Permission;
    return hasPermission(updatePermission);
  };

  const canDelete = (module: string): boolean => {
    if (!user) return false;
    const deletePermission = `${module}:delete` as Permission;
    return hasPermission(deletePermission);
  };

  // return (
  //   <AuthContext.Provider
  //     value={{
  //       user,
  //       login,
  //       logout,
  //       isAuthenticated: !!user,
  //       hasPermission,
  //       canView,
  //       canCreate,
  //       canUpdate,
  //       canDelete,
  //     }}
  //   >
  //     {children}
  //   </AuthContext.Provider>
  // );
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
        canView,
        canCreate,
        canUpdate,
        canDelete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
