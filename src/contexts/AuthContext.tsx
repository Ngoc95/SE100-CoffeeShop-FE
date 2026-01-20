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
      try {
        const parsed: any = JSON.parse(storedUser);
        // If permissions missing or empty, hydrate from local role/account maps
        if (!Array.isArray(parsed.permissions) || parsed.permissions.length === 0) {
          const account = initialAccounts.find((acc) => acc.username === parsed.username);
          let hydrated: Permission[] | undefined;
          if (account?.customPermissions && account.customPermissions.length > 0) {
            hydrated = account.customPermissions;
          } else {
            const roleId = parsed.roleId || account?.roleId;
            const role = roleId ? initialRoles.find((r) => r.id === roleId) : undefined;
            hydrated = role?.permissions;
          }
          parsed.permissions = hydrated ?? [];
          localStorage.setItem('user', JSON.stringify(parsed));
        }
        setUser(parsed as User);
      } catch {
        setUser(null);
      }
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
    // Fallback: ensure permissions present; if missing, hydrate from local role definitions
    let hydratedPermissions: Permission[] | undefined = Array.isArray((user as any)?.permissions)
      ? ((user as any).permissions as Permission[])
      : undefined;

    if (!hydratedPermissions || hydratedPermissions.length === 0) {
      // Try customPermissions from accountData if username matches
      const account = initialAccounts.find((acc) => acc.username === username);
      if (account?.customPermissions && account.customPermissions.length > 0) {
        hydratedPermissions = account.customPermissions;
      } else {
        // Map by roleId from backend payload when available
        const roleId = (user as any).roleId || account?.roleId;
        const role = roleId ? initialRoles.find((r) => r.id === roleId) : undefined;
        hydratedPermissions = role?.permissions;
      }
    }

    const finalUser: User = {
      id: String((user as any).id),
      username: (user as any).username ?? username,
      fullName: (user as any).fullName ?? (user as any).name ?? username,
      role: (user as any).role ?? (account ? (account as any).role : 'manager'),
      roleLabel: (user as any).roleLabel ?? (initialRoles.find((r) => r.id === (user as any).roleId)?.name ?? 'Quản lý'),
      roleId: (user as any).roleId ?? (account?.roleId ?? 'role-manager'),
      permissions: (hydratedPermissions ?? []) as Permission[],
    };

    localStorage.setItem('user', JSON.stringify(finalUser));
    setUser(finalUser);
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
