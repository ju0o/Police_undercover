import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, ensureAppCheck } from '@/shared/config/firebase';
import type { AppUser } from '@/shared/types/user';
import { AuthContext, type AuthContextValue } from './AuthContext';

// Context is defined in separate file to satisfy react-refresh rule

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAppCheck();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      try {
        if (u) {
          const ref = doc(db, 'users', u.uid);
          const snap = await getDoc(ref);
          setProfile((snap.data() as AppUser) ?? null);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    firebaseUser,
    profile,
    role: profile?.role ?? null,
    loading,
  }), [firebaseUser, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hooks moved to separate file (useAuth.ts) for react-refresh rule compliance


