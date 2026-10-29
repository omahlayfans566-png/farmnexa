import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { IUser } from '../types/index.js';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string, userData: IUser) => void;
  logout: () => Promise<void>;
  updateUser: (userData: IUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('fnx_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('fnx_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: IUser) => {
    localStorage.setItem('fnx_token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('fnx_token');
    setUser(null);
  };

  const updateUser = (userData: IUser) => {
    setUser(userData);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
