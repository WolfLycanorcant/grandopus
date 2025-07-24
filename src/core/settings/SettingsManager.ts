import { GameSettings, AppInfo, SettingsState } from './types';

const DEFAULT_SETTINGS: GameSettings = {
  // Display Settings
  theme: 'dark',
  language: 'en',
  showAnimations: true,
  showTutorials: true,
  
  // Audio Settings
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  voiceVolume: 0.8,
  muteAll: false,
  
  // Gameplay Settings
  autoSave: true,
  autoSaveInterval: 5,
  difficulty: 'normal',
  showDamageNumbers: true,
  pauseOnFocusLoss: true,
  
  // UI Settings
  showGrid: true,
  showHealthBars: true,
  showMinimap: true,
  uiScale: 1.0,
  
  // Developer/Debug Settings (hidden by default)
  showHomeTab: false,
  showAIInfo: false,
  debugMode: false,
  showFPS: false,
  logLevel: 'error'
};

const APP_INFO: AppInfo = {
  version: '15.1',
  buildDate: new Date().toISOString().split('T')[0],
  buildNumber: 1510,
  platform: 'Web',
  engine: 'React + TypeScript',
  author: 'Grand Opus Development Team',
  website: 'https://grandopus.game',
  supportEmail: 'support@grandopus.game'
};

export class SettingsManager {
  private state: SettingsState;
  private listeners: Array<(state: SettingsState) => void> = [];
  private readonly STORAGE_KEY = 'grand-opus-settings';
  private readonly VERSION_CLICK_TIMEOUT = 3000; // 3 seconds timeout for version clicks

  constructor() {
    this.state = {
      settings: { ...DEFAULT_SETTINGS },
      appInfo: { ...APP_INFO },
      isSettingsOpen: false,
      versionClickCount: 0,
      lastVersionClickTime: 0
    };

    this.loadSettings();
  }

  public subscribe(listener: (state: SettingsState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): SettingsState {
    return { ...this.state };
  }

  public getSettings(): GameSettings {
    return { ...this.state.settings };
  }

  public getAppInfo(): AppInfo {
    return { ...this.state.appInfo };
  }

  public updateSetting<K extends keyof GameSettings>(
    key: K, 
    value: GameSettings[K]
  ): void {
    this.state.settings[key] = value;
    this.saveSettings();
    this.notifyListeners();
  }

  public updateSettings(newSettings: Partial<GameSettings>): void {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  public resetSettings(): void {
    this.state.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.notifyListeners();
  }

  public openSettings(): void {
    this.state.isSettingsOpen = true;
    this.notifyListeners();
  }

  public closeSettings(): void {
    this.state.isSettingsOpen = false;
    this.notifyListeners();
  }

  public handleVersionClick(): void {
    const now = Date.now();
    const timeSinceLastClick = now - this.state.lastVersionClickTime;

    // Reset counter if too much time has passed
    if (timeSinceLastClick > this.VERSION_CLICK_TIMEOUT) {
      this.state.versionClickCount = 1;
    } else {
      this.state.versionClickCount++;
    }

    this.state.lastVersionClickTime = now;

    // Check if we've reached the magic number
    if (this.state.versionClickCount >= 10) {
      this.unlockDeveloperMode();
      this.state.versionClickCount = 0; // Reset counter
    }

    this.notifyListeners();
  }

  private unlockDeveloperMode(): void {
    this.state.settings.showHomeTab = true;
    this.state.settings.showAIInfo = true;
    this.state.settings.debugMode = true;
    
    this.saveSettings();
    
    // Show a notification or toast that developer mode is unlocked
    console.log('🎉 Developer mode unlocked! Home tab and AI information are now visible.');
    
    // You could also dispatch a custom event for UI notifications
    window.dispatchEvent(new CustomEvent('developerModeUnlocked', {
      detail: { message: 'Developer mode unlocked!' }
    }));
  }

  public isDeveloperModeUnlocked(): boolean {
    return this.state.settings.showHomeTab && this.state.settings.showAIInfo;
  }

  public getVersionClickProgress(): { count: number; remaining: number } {
    return {
      count: this.state.versionClickCount,
      remaining: Math.max(0, 10 - this.state.versionClickCount)
    };
  }

  private saveSettings(): void {
    try {
      const settingsToSave = {
        settings: this.state.settings,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) {
          // Merge with defaults to ensure all properties exist
          this.state.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.state.settings = { ...DEFAULT_SETTINGS };
    }
  }

  public exportSettings(): string {
    return JSON.stringify({
      settings: this.state.settings,
      appInfo: this.state.appInfo,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  public importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      if (imported.settings) {
        this.state.settings = { ...DEFAULT_SETTINGS, ...imported.settings };
        this.saveSettings();
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  public getSettingsForExport(): any {
    return {
      version: this.state.appInfo.version,
      settings: this.state.settings,
      exportDate: new Date().toISOString()
    };
  }

  // Utility methods for common settings checks
  public shouldShowAnimations(): boolean {
    return this.state.settings.showAnimations;
  }

  public shouldShowTutorials(): boolean {
    return this.state.settings.showTutorials;
  }

  public shouldAutoSave(): boolean {
    return this.state.settings.autoSave;
  }

  public getAutoSaveInterval(): number {
    return this.state.settings.autoSaveInterval * 60 * 1000; // Convert to milliseconds
  }

  public getMasterVolume(): number {
    return this.state.settings.muteAll ? 0 : this.state.settings.masterVolume;
  }

  public getMusicVolume(): number {
    return this.state.settings.muteAll ? 0 : this.state.settings.musicVolume * this.state.settings.masterVolume;
  }

  public getSFXVolume(): number {
    return this.state.settings.muteAll ? 0 : this.state.settings.sfxVolume * this.state.settings.masterVolume;
  }

  public getVoiceVolume(): number {
    return this.state.settings.muteAll ? 0 : this.state.settings.voiceVolume * this.state.settings.masterVolume;
  }

  public shouldShowHomeTab(): boolean {
    return this.state.settings.showHomeTab;
  }

  public shouldShowAIInfo(): boolean {
    return this.state.settings.showAIInfo;
  }

  public isDebugMode(): boolean {
    return this.state.settings.debugMode;
  }
}