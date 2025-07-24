import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsManager } from '../core/settings/SettingsManager';
import { SettingsState } from '../core/settings/types';

interface SettingsContextType {
  settingsManager: SettingsManager;
  settingsState: SettingsState;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create global settings manager instance
const settingsManager = new SettingsManager();

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settingsState, setSettingsState] = useState<SettingsState>(settingsManager.getState());

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe(setSettingsState);
    return unsubscribe;
  }, []);

  return (
    <SettingsContext.Provider value={{ settingsManager, settingsState }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export { settingsManager };