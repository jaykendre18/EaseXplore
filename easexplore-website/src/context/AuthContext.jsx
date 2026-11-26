import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, onAuthChange, signOut } from '@/services/auth';
import { isSupabaseConfigured } from '@/services/supabase';

const AuthContext = createContext(null);

/**
 * Keeps track of who is logged in. Wrap the app once, then call `useAuth()` anywhere:
 *   const { user, loading, signOut } = useAuth();
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // Without Supabase keys there is nothing to wait for.
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;

    getSession()
      .then((current) => {
        if (active) setSession(current);
      })
      .catch((error) => console.error('Could not read the login session', error))
      .finally(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = onAuthChange((next) => {
      if (!active) return;
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isConfigured: isSupabaseConfigured,
      signOut,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
