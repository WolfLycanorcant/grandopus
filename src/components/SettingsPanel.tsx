import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Monitor,
  Gamepad2,
  Info,
  Download,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Palette,
  Save,
  HelpCircle
} from 'lucide-react';
import { SettingsManager } from '../core/settings/SettingsManager';
import { SettingsState, GameSettings } from '../core/settings/types';

interface SettingsPanelProps {
  settingsManager: SettingsManager;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settingsManager,
  isOpen,
  onClose
}) => {
  const [settingsState, setSettingsState] = useState<SettingsState>(settingsManager.getState());
  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'gameplay' | 'about'>('display');
  const [showImportExport, setShowImportExport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe(setSettingsState);
    return unsubscribe;
  }, [settingsManager]);

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    settingsManager.updateSetting(key, value);
  };

  const handleVersionClick = () => {
    settingsManager.handleVersionClick();
    const progress = settingsManager.getVersionClickProgress();
    
    if (progress.remaining === 0) {
      // Show success message
      setTimeout(() => {
        alert('🎉 Developer mode unlocked! Home tab and AI information are now visible.');
      }, 100);
    } else if (progress.count > 5) {
      // Give a hint when they're halfway there
      console.log(`${progress.remaining} more clicks to unlock developer mode...`);
    }
  };

  const handleExportSettings = () => {
    const settings = settingsManager.exportSettings();
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grand-opus-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    if (importText.trim()) {
      const success = settingsManager.importSettings(importText);
      if (success) {
        alert('Settings imported successfully!');
        setImportText('');
        setShowImportExport(false);
      } else {
        alert('Failed to import settings. Please check the format.');
      }
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      settingsManager.resetSettings();
    }
  };

  if (!isOpen) return null;

  const { settings, appInfo } = settingsState;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-slate-900 p-4 border-r border-slate-700">
            <nav className="space-y-2">
              {[
                { id: 'display', label: 'Display', icon: Monitor },
                { id: 'audio', label: 'Audio', icon: Volume2 },
                { id: 'gameplay', label: 'Gameplay', icon: Gamepad2 },
                { id: 'about', label: 'About', icon: Info }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 pt-4 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowImportExport(!showImportExport)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded text-sm transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Import/Export
                </button>
                <button
                  onClick={handleResetSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded text-sm transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset All
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Display Settings
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Theme */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Theme</label>
                        <p className="text-slate-400 text-sm">Choose your preferred color scheme</p>
                      </div>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value as any)}
                        className="bg-slate-700 text-white rounded px-3 py-2 min-w-32"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Language</label>
                        <p className="text-slate-400 text-sm">Select your preferred language</p>
                      </div>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value as any)}
                        className="bg-slate-700 text-white rounded px-3 py-2 min-w-32"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>

                    {/* UI Scale */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">UI Scale</label>
                        <p className="text-slate-400 text-sm">Adjust interface size</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">Small</span>
                        <input
                          type="range"
                          min="0.8"
                          max="1.5"
                          step="0.1"
                          value={settings.uiScale}
                          onChange={(e) => handleSettingChange('uiScale', parseFloat(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-slate-400 text-sm">Large</span>
                        <span className="text-white text-sm min-w-12">{Math.round(settings.uiScale * 100)}%</span>
                      </div>
                    </div>

                    {/* Toggle Settings */}
                    <div className="space-y-3">
                      {[
                        { key: 'showAnimations', label: 'Show Animations', desc: 'Enable UI animations and transitions' },
                        { key: 'showTutorials', label: 'Show Tutorials', desc: 'Display helpful tutorial messages' },
                        { key: 'showGrid', label: 'Show Grid', desc: 'Display grid lines in battle view' },
                        { key: 'showHealthBars', label: 'Show Health Bars', desc: 'Display unit health bars' },
                        { key: 'showMinimap', label: 'Show Minimap', desc: 'Display minimap in overworld' }
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <label className="text-white font-medium">{label}</label>
                            <p className="text-slate-400 text-sm">{desc}</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange(key as keyof GameSettings, !settings[key as keyof GameSettings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[key as keyof GameSettings] ? 'bg-blue-600' : 'bg-slate-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[key as keyof GameSettings] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Audio Settings
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Mute All */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Mute All Audio</label>
                        <p className="text-slate-400 text-sm">Disable all game sounds</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('muteAll', !settings.muteAll)}
                        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                          settings.muteAll ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {settings.muteAll ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        {settings.muteAll ? 'Muted' : 'Enabled'}
                      </button>
                    </div>

                    {/* Volume Sliders */}
                    {[
                      { key: 'masterVolume', label: 'Master Volume', desc: 'Overall audio level' },
                      { key: 'musicVolume', label: 'Music Volume', desc: 'Background music level' },
                      { key: 'sfxVolume', label: 'Sound Effects', desc: 'Game sound effects level' },
                      { key: 'voiceVolume', label: 'Voice Volume', desc: 'Character voice level' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-white font-medium">{label}</label>
                            <p className="text-slate-400 text-sm">{desc}</p>
                          </div>
                          <span className="text-white text-sm min-w-12">
                            {Math.round(settings[key as keyof GameSettings] as number * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={settings[key as keyof GameSettings] as number}
                          onChange={(e) => handleSettingChange(key as keyof GameSettings, parseFloat(e.target.value) as any)}
                          disabled={settings.muteAll}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gameplay' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Gameplay Settings
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Difficulty */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Difficulty</label>
                        <p className="text-slate-400 text-sm">Game challenge level</p>
                      </div>
                      <select
                        value={settings.difficulty}
                        onChange={(e) => handleSettingChange('difficulty', e.target.value as any)}
                        className="bg-slate-700 text-white rounded px-3 py-2 min-w-32"
                      >
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                        <option value="nightmare">Nightmare</option>
                      </select>
                    </div>

                    {/* Auto Save Interval */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Auto Save Interval</label>
                        <p className="text-slate-400 text-sm">How often to auto-save (minutes)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="1"
                          value={settings.autoSaveInterval}
                          onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                          disabled={!settings.autoSave}
                          className="w-24"
                        />
                        <span className="text-white text-sm min-w-12">{settings.autoSaveInterval}m</span>
                      </div>
                    </div>

                    {/* Toggle Settings */}
                    <div className="space-y-3">
                      {[
                        { key: 'autoSave', label: 'Auto Save', desc: 'Automatically save game progress' },
                        { key: 'showDamageNumbers', label: 'Show Damage Numbers', desc: 'Display damage values in combat' },
                        { key: 'pauseOnFocusLoss', label: 'Pause on Focus Loss', desc: 'Pause game when window loses focus' }
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <label className="text-white font-medium">{label}</label>
                            <p className="text-slate-400 text-sm">{desc}</p>
                          </div>
                          <button
                            onClick={() => handleSettingChange(key as keyof GameSettings, !settings[key as keyof GameSettings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[key as keyof GameSettings] ? 'bg-blue-600' : 'bg-slate-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[key as keyof GameSettings] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Developer Settings (only show if unlocked) */}
                    {settingsManager.isDeveloperModeUnlocked() && (
                      <div className="mt-8 pt-4 border-t border-slate-700">
                        <h4 className="text-md font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Developer Settings
                        </h4>
                        <div className="space-y-3">
                          {[
                            { key: 'showHomeTab', label: 'Show Home Tab', desc: 'Display the home tab in navigation' },
                            { key: 'showAIInfo', label: 'Show AI Information', desc: 'Display AI debug information' },
                            { key: 'showFPS', label: 'Show FPS Counter', desc: 'Display frames per second' }
                          ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between">
                              <div>
                                <label className="text-white font-medium">{label}</label>
                                <p className="text-slate-400 text-sm">{desc}</p>
                              </div>
                              <button
                                onClick={() => handleSettingChange(key as keyof GameSettings, !settings[key as keyof GameSettings])}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings[key as keyof GameSettings] ? 'bg-yellow-600' : 'bg-slate-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings[key as keyof GameSettings] ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    About Grand Opus
                  </h3>
                  
                  <div className="space-y-6">
                    {/* App Info */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-400 text-sm">Version</label>
                          <button
                            onClick={handleVersionClick}
                            className="block text-white font-mono text-lg hover:text-blue-400 transition-colors cursor-pointer"
                            title="Click me multiple times..."
                          >
                            {appInfo.version}
                          </button>
                        </div>
                        <div>
                          <label className="text-slate-400 text-sm">Build</label>
                          <p className="text-white font-mono">{appInfo.buildNumber}</p>
                        </div>
                        <div>
                          <label className="text-slate-400 text-sm">Build Date</label>
                          <p className="text-white">{appInfo.buildDate}</p>
                        </div>
                        <div>
                          <label className="text-slate-400 text-sm">Platform</label>
                          <p className="text-white">{appInfo.platform}</p>
                        </div>
                        <div>
                          <label className="text-slate-400 text-sm">Engine</label>
                          <p className="text-white">{appInfo.engine}</p>
                        </div>
                        <div>
                          <label className="text-slate-400 text-sm">Author</label>
                          <p className="text-white">{appInfo.author}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">About This Game</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Grand Opus is a tactical RPG featuring deep strategic combat, unit recruitment, 
                        and progression systems. Build your army, train individual units, and engage in 
                        epic battles across diverse campaigns. Experience the ultimate in tactical warfare 
                        with stunning 3D graphics and immersive gameplay.
                      </p>
                    </div>

                    {/* Links */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Links & Support</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Website</span>
                          <a 
                            href={appInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {appInfo.website}
                          </a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Support</span>
                          <a 
                            href={`mailto:${appInfo.supportEmail}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {appInfo.supportEmail}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Credits */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Credits</h4>
                      <div className="text-slate-300 text-sm space-y-1">
                        <p><strong>Game Design:</strong> Grand Opus Development Team</p>
                        <p><strong>Programming:</strong> React + TypeScript</p>
                        <p><strong>Graphics:</strong> PlayCanvas 3D Engine</p>
                        <p><strong>UI Framework:</strong> Tailwind CSS</p>
                        <p><strong>Icons:</strong> Lucide React</p>
                      </div>
                    </div>

                    {/* Easter Egg Progress (only show if clicks detected) */}
                    {settingsState.versionClickCount > 0 && !settingsManager.isDeveloperModeUnlocked() && (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-400 mb-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-medium">Something is happening...</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(settingsState.versionClickCount / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-yellow-400 text-xs">
                            {settingsState.versionClickCount}/10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Import/Export Panel */}
            {showImportExport && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Import/Export Settings</h3>
                    <button
                      onClick={() => setShowImportExport(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleExportSettings}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export Settings
                    </button>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Import Settings (paste JSON)
                      </label>
                      <textarea
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Paste exported settings JSON here..."
                        className="w-full h-32 bg-slate-700 text-white rounded px-3 py-2 text-sm resize-none"
                      />
                    </div>
                    
                    <button
                      onClick={handleImportSettings}
                      disabled={!importText.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Import Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};