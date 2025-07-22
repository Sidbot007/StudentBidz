import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiGet, apiPost } from './api';

interface User {
  id?: number;
  username: string;
  email: string;
  name?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiGet<User>('/me')
        .then(res => {
          setUser(res);
          localStorage.setItem('username', res.username);
          localStorage.setItem('email', res.email);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('email');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const register = async (name: string, email: string, password: string) => {
    try {
      await apiPost('/register', {
        username: name,
        email,
        password,
      });
      // After successful registration, log the user in to get a token
      await login(name, password);
    } catch (err: any) {
      if (err.message && err.message.includes('exists')) {
        throw new Error('User is already registered');
      }
      throw new Error('Registration failed');
    }
  };

  const login = async (username: string, password: string) => {
    const res = await apiPost<{ token: string }>('/login', { username, password });
    const { token } = res;
    localStorage.setItem('token', token);
    
    // The interceptor will now add the token, so we can refetch user
    const meRes = await apiGet<User>('/me');
    setUser(meRes);
    localStorage.setItem('username', meRes.username);
    localStorage.setItem('email', meRes.email);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 