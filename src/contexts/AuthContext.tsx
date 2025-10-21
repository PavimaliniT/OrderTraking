import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, linkWithPopup, signInWithRedirect, linkWithRedirect, getRedirectResult, signOut as fbSignOut, User } from 'firebase/auth';
import { toast } from 'sonner';
import { useFirebase } from './FirebaseContext';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    }, (err) => {
      setError(err?.message || String(err));
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  // Handle result if we returned from a redirect sign-in flow
  useEffect(() => {
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // eslint-disable-next-line no-console
          console.debug('Auth: redirect sign-in success');
          toast.success('Signed in');
        }
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.debug('Auth: getRedirectResult error', e?.code || e?.message || String(e));
      }
    })();
  }, [auth]);

  // Attempt anonymous sign-in for development convenience if not signed in.
  useEffect(() => {
    if (!loading && !user) {
      (async () => {
        try {
          await signInAnonymously(auth);
          // eslint-disable-next-line no-console
          console.debug('Auth: signed in anonymously');
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.debug('Auth: anonymous sign-in failed (enable in Firebase Console if desired):', e?.message || String(e));
        }
      })();
    }
  }, [auth, loading, user]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const current = auth.currentUser;
      if (current && current.isAnonymous) {
        try {
          await linkWithPopup(current, provider);
        } catch (e: any) {
          if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
            await linkWithRedirect(current, provider);
            return;
          }
          throw e;
        }
      } else {
        try {
          await signInWithPopup(auth, provider);
        } catch (e: any) {
          if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
            await signInWithRedirect(auth, provider);
            return;
          }
          throw e;
        }
      }
      toast.success('Signed in with Google');
    } catch (e: any) {
      const msg = e?.code ? `${e.code}: ${e.message}` : (e?.message || String(e));
      setError(msg);
      toast.error(`Sign-in failed: ${msg}`);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      toast.success('Signed out');
    } catch (e: any) {
      const msg = e?.code ? `${e.code}: ${e.message}` : (e?.message || String(e));
      setError(msg);
      toast.error(`Sign-out failed: ${msg}`);
      throw e;
    }
  };

  const value = useMemo<AuthContextValue>(() => ({ user, loading, error, signInWithGoogle, signOut }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
