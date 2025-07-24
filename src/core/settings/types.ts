export interface GameSettings {
  // Display Settings
  theme: 'dark' | 'light' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
  showAnimations: boolean;
  showTutorials: boolean;
  
  // Audio Settings
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  muteAll: boolean;
  
  // Gameplay Settings
  autoSave: boolean;
  autoSaveInterval: number; // in minutes
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  showDamageNumbers: boolean;
  pauseOnFocusLoss: boolean;
  
  // UI Settings
  showGrid: boolean;
  showHealthBars: boolean;
  showMinimap: boolean;
  uiScale: number;
  
  // Developer/Debug Settings (hidden by default)
  showHomeTab: boolean;
  showAIInfo: boolean;
  debugMode: boolean;
  showFPS: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
}

export interface AppInfo {
  version: string;
  buildDate: string;
  buildNumber: number;
  platform: string;
  engine: string;
  author: string;
  website: string;
  supportEmail: string;
}

export interface SettingsState {
  settings: GameSettings;
  appInfo: AppInfo;
  isSettingsOpen: boolean;
  versionClickCount: number;
  lastVersionClickTime: number;
}