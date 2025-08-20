import { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import type { UserRole } from '@/shared/types/user';

export function ProtectedRoute({ children, role }: { children: ReactElement; role?: UserRole }) {
  const { firebaseUser, profile, loading } = useAuth();
  if (loading) return children; // allow render; pages should handle their own loading UI
  if (!firebaseUser) return <Navigate to="/auth/signup" replace />;
  if (role && profile?.role !== role) return <Navigate to="/" replace />;
  return children;
}


