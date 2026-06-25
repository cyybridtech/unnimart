import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../data/mockData';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: any) => Promise<boolean>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('unimart_token');
    if (token) {
      try {
        const userData = await api.get('/auth/profile');
        setUser(userData);
      } catch (err) {
        console.error('Session recovery failed', err);
        localStorage.removeItem('unimart_token');
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('unimart_token', data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      await api.post('/auth/register', userData);
      // If it's a buyer, we could auto-login, but for now let's just return true
      // and let the user log in, or we can implement auto-login here if the backend returns a token.
      return true;
    } catch (err) {
      console.error('Signup failed', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unimart_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, signup, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
