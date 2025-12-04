import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'manager' | 'barista' | 'cashier' | 'server';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleLabel: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
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
  },
  {
    id: '2',
    username: 'phache',
    password: 'phache123',
    fullName: 'Trần Thị B',
    role: 'barista',
    roleLabel: 'Pha chế',
  },
  {
    id: '3',
    username: 'thungan',
    password: 'thungan123',
    fullName: 'Lê Văn C',
    role: 'cashier',
    roleLabel: 'Thu ngân',
  },
  {
    id: '4',
    username: 'phucvu',
    password: 'phucvu123',
    fullName: 'Phạm Thị D',
    role: 'server',
    roleLabel: 'Phục vụ',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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
