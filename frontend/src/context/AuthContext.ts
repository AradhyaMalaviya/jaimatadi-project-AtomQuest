import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  users: User[];
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
