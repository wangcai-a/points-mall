import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, LoginCredentials, LoginResponse } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: Teacher | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Teacher | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
    };
    initAuth();
  }, [token]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setToken(response.token);
    setUser(response.teacher);
    setIsAuthenticated(true);
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
