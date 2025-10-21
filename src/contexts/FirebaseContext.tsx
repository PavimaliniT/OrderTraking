import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { app, auth, db } from '../lib/firebase';

type FirebaseContextValue = {
  app: typeof app;
  auth: typeof auth;
  db: typeof db;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseContext.Provider value={{ app, auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebase must be used within FirebaseProvider');
  return ctx;
};

// Non-throwing variant — returns null if provider missing. Useful for diagnostic checks.
export const useFirebaseOptional = () => {
  return useContext(FirebaseContext);
};
