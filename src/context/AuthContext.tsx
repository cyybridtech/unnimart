import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../data/mockData';

// Production pre-seeded admin user details
export const PRODUCTION_ADMIN_USER: User = {
  id: 1,
  username: 'admin',
  email: 'admin@unimart.edu',
  role: 'admin',
  status: 'active',
  phone: '+1 (555) 000-0000',
  dorm: 'System Headquarter Suite 1',
  joined_date: new Date().toISOString().split('T')[0],
  balance: 0.00,
  avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
  password_hash: 'e21e890807d56df225030fbd44356587b0d5457614de4a7c02219aad522ba62e' // UniMartAdmin2026!
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: (demoUser: User) => void;
  logout: () => void;
  signup: (userData: Partial<User> & { password?: string }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cryptographic hash helper using browser-native subtle crypto
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Persistent session recovery
    const storedUser = localStorage.getItem('unimart_session');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('unimart_session');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Reads the live users list from localStorage (so newly registered users are found),
   * falling back to ONLY the production admin user if nothing is stored yet.
   */
  const getLiveUsers = (): User[] => {
    try {
      const stored = localStorage.getItem('unimart_users');
      if (stored) return JSON.parse(stored);
      // Seed ONLY the admin user initially in production mode
      const defaultUsers = [PRODUCTION_ADMIN_USER];
      localStorage.setItem('unimart_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    } catch {
      return [PRODUCTION_ADMIN_USER];
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const hashed = await hashPassword(password);
    return new Promise((resolve) => {
      setTimeout(() => {
        const liveUsers = getLiveUsers();
        const found = liveUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          if (found.status === 'suspended') {
            resolve(false);
          } else if (found.password_hash === hashed) {
            setUser(found);
            localStorage.setItem('unimart_session', JSON.stringify(found));
            resolve(true);
          } else {
            resolve(false); // Password mismatch
          }
        } else {
          resolve(false); // User not found
        }
        setIsLoading(false);
      }, 600);
    });
  };

  /**
   * Demo-only: instantly switch to a known user without credentials.
   * Used by the role quick-switcher in the Header.
   */
  const loginAsDemo = (demoUser: User) => {
    const liveUsers = getLiveUsers();
    const fresh = liveUsers.find((u) => u.id === demoUser.id) ?? demoUser;
    setUser(fresh);
    localStorage.setItem('unimart_session', JSON.stringify(fresh));
  };

  const signup = async (userData: Partial<User> & { password?: string }): Promise<boolean> => {
    setIsLoading(true);
    const password = userData.password || 'password123';
    const hashed = await hashPassword(password);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now(), // Unique ID via timestamp
          username: userData.username || 'new_user',
          email: userData.email || '',
          role: userData.role || 'buyer',
          status: userData.role === 'seller' ? 'pending' : 'active',
          joined_date: new Date().toISOString().split('T')[0],
          balance: 0,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userData.username}`,
          password_hash: hashed,
          ...userData,
        };
        // Remove cleartext password property if present
        delete (newUser as { password?: string }).password;

        // Add the new user to the live users list in localStorage
        const liveUsers = getLiveUsers();
        
        // Prevent duplicate emails
        const emailExists = liveUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
        if (emailExists) {
          setIsLoading(false);
          resolve(false);
          return;
        }

        const updated = [...liveUsers, newUser];
        localStorage.setItem('unimart_users', JSON.stringify(updated));

        // Only auto-login buyers; sellers must wait for admin approval
        if (newUser.role !== 'seller') {
          setUser(newUser);
          localStorage.setItem('unimart_session', JSON.stringify(newUser));
        }

        setIsLoading(false);
        resolve(true);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unimart_session');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginAsDemo, logout, signup, isLoading }}>
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
