import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebase } from './FirebaseContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface VillageContextType {
  activeVillage: string;
  setActiveVillage: (village: string) => void;
  clearActiveVillage: () => void;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firebaseCtx = (() => {
    try {
      return useFirebase();
    } catch {
      return null;
    }
  })();

  const [activeVillage, setActiveVillageState] = useState<string>(() => {
    return localStorage.getItem('activeVillage') || '';
  });

  useEffect(() => {
    if (firebaseCtx) {
      console.debug('VillageContext: Firestore available', { projectId: (firebaseCtx.app as any)?.options?.projectId });
    } else {
      console.debug('VillageContext: Firestore not available, local-only');
    }
  }, [firebaseCtx]);

  // When firebase is available, load stored activeVillage from Firestore (meta/activeVillage)
  useEffect(() => {
    if (!firebaseCtx) return;
    (async () => {
      try {
        const docRef = doc(firebaseCtx.db, 'meta', 'activeVillage');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data?.value) {
            setActiveVillageState(data.value);
            return;
          }
        }
      } catch (err) {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseCtx]);

  useEffect(() => {
    if (activeVillage) {
      localStorage.setItem('activeVillage', activeVillage);
    } else {
      localStorage.removeItem('activeVillage');
    }

    if (!firebaseCtx) return;
    (async () => {
      try {
        await setDoc(doc(firebaseCtx.db, 'meta', 'activeVillage'), { value: activeVillage });
      } catch (err) {
        console.error('Failed to persist activeVillage to Firestore', err);
      }
    })();
  }, [activeVillage, firebaseCtx]);

  const setActiveVillage = (village: string) => {
    setActiveVillageState(village);
  };

  const clearActiveVillage = () => {
    setActiveVillageState('');
  };

  return (
    <VillageContext.Provider value={{ activeVillage, setActiveVillage, clearActiveVillage }}>
      {children}
    </VillageContext.Provider>
  );
};

export const useVillage = () => {
  const context = useContext(VillageContext);
  if (!context) {
    throw new Error('useVillage must be used within VillageProvider');
  }
  return context;
};
