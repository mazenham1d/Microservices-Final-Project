import React, { createContext, useState, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('credentials');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    try {
      const data = await api.login(username, password);
      const userData = { username: data.user.username, role: data.user.role };
      const creds = { username, password };
      
      setUser(userData);
      setCredentials(creds);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('credentials', JSON.stringify(creds));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setCredentials(null);
    localStorage.removeItem('user');
    localStorage.removeItem('credentials');
  };

  return (
    <AuthContext.Provider value={{ user, credentials, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

