'use client';

import React, { createContext, useContext, useState } from 'react';

interface UIContextProps {
  showFavorites: boolean;
  setShowFavorites: (val: boolean) => void;
}

const UIContext = createContext<UIContextProps | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [showFavorites, setShowFavorites] = useState(false);

  return (
    <UIContext.Provider value={{ showFavorites, setShowFavorites }}>{children}</UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
