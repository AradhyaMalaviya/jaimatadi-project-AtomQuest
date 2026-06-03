import React, { useEffect, useState } from 'react';
import { MOCK_USERS } from '../types';
import type { User } from '../types';
import { AuthContext } from './AuthContext';
import {
  api,
  clearAccessToken,
  clearStoredCurrentUser,
  getAccessToken,
  getStoredCurrentUser,
  setAccessToken,
  setStoredCurrentUser,
} from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredCurrentUser());
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const availableUsers = await api.getAuthUsers();
        if (isMounted) setUsers(availableUsers);

        if (getAccessToken()) {
          const user = await api.getCurrentUser();
          if (isMounted) {
            setCurrentUser(user);
            setStoredCurrentUser(user);
          }
        }
      } catch {
        clearAccessToken();
        clearStoredCurrentUser();
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (userId: string) => {
    const response = await api.login(userId);
    setAccessToken(response.accessToken);
    setStoredCurrentUser(response.user);
    setCurrentUser(response.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      clearAccessToken();
      clearStoredCurrentUser();
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, users, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
