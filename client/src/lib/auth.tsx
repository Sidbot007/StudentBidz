import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

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
      axios.get('http://localhost:8080/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setUser(res.data);
          localStorage.setItem('username', res.data.username);
          localStorage.setItem('email', res.data.email);
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
      await axios.post('http://localhost:8080/register', {
        username: name,
        email,
        password,
      });
      setUser({ username: name, email });
      localStorage.setItem('username', name);
      localStorage.setItem('email', email);
    } catch (err: any) {
      if (err.response && typeof err.response.data === 'string' && err.response.data.includes('exists')) {
        throw new Error('User is already registered');
      }
      throw new Error('Registration failed');
    }
  };

  const login = async (username: string, password: string) => {
    const res = await axios.post('http://localhost:8080/login', { username, password });
    const { token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setUser({ username, email: '' });
    // Fetch user info after login
    try {
      const meRes = await axios.get('http://localhost:8080/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(meRes.data);
      localStorage.setItem('email', meRes.data.email);
    } catch {
      // fallback: keep minimal user info
    }
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