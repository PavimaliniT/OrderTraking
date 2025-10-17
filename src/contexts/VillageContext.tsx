import React, { createContext, useContext, useState, useEffect } from 'react';

interface VillageContextType {
  activeVillage: string;
  setActiveVillage: (village: string) => void;
  clearActiveVillage: () => void;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeVillage, setActiveVillageState] = useState<string>(() => {
    return localStorage.getItem('activeVillage') || '';
  });

  useEffect(() => {
    if (activeVillage) {
      localStorage.setItem('activeVillage', activeVillage);
    } else {
      localStorage.removeItem('activeVillage');
    }
  }, [activeVillage]);

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
