import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { AppUser, UserRole } from '@/shared/types/user';

export interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: AppUser | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);


