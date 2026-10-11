import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStorageItem, setStorageItem, resetDemoData, KEYS } from '../utils/storage';
import Modal from '../components/Modal';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  RotateCcw,
  LogOut,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Save,
  Volume2,
  Smartphone
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, logout, showToast } = useAuth();
  const { theme, setTheme: setGlobalTheme } = useTheme();
  const navigate = useNavigate();

  // Profile Form
  const [name, setName] = useState(user?.name || 'Thanu Sharma');
  const [email] = useState(user?.email || 'thanu@gmail.com');

  // Preferences
  const [prefs, setPrefs] = useState({
    soundEnabled: true,
    pushNotifications: true,
    autoSummarize: true,
    autoHandoverThreshold: 'high',
    voiceAssistantStyle: 'Friendly & Concise',
    vibration: true
  });

  // Modals
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const storedPrefs = getStorageItem(KEYS.PREFERENCES, null);
    if (storedPrefs) setPrefs(storedPrefs);
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }
    updateProfile({ name: name.trim() });
  };

  const handleTogglePref = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setStorageItem(KEYS.PREFERENCES, updated);
    showToast('Preference updated and saved.', 'info');
  };

  const handleChangeTheme = (newTheme) => {
    setGlobalTheme(newTheme);
    showToast(`Theme updated to ${newTheme === 'dark' ? 'Dark Mode (Midnight Navy)' : 'Light Mode (Clean Slate)'}!`, 'success');
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetDemoData();
    setIsResetting(false);
    setConfirmResetOpen(false);
    showToast('All demo records, calls, and alerts have been restored to initial sample state.', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          System Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure your personal AI assistant behavior, demo profile, and persistent storage.
        </p>
      </div>

      {/* Section 1: Profile Settings */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Demo Profile Information</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
            />
            <div>
              <h3 className="text-sm font-bold text-white">{user?.name || 'Thanu Sharma'}</h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email || 'thanu@gmail.com'}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Active Demo Session
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Account Email (Locked)
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="form-input opacity-60 cursor-not-allowed bg-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="gradient-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Notification & Assistant Toggles */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Assistant & Notification Directives</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div>
              <h4 className="text-sm font-bold text-white">Audible Call Ring Chimes</h4>
              <p className="text-xs text-slate-400">Play pleasant synthesized chime during simulated incoming calls.</p>
            </div>
            <button
              onClick={() => handleTogglePref('soundEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                prefs.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div>
              <h4 className="text-sm font-bold text-white">Real-Time Urgent Toast Alerts</h4>
              <p className="text-xs text-slate-400">Display floating popups when priority calls or handovers are triggered.</p>
            </div>
            <button
              onClick={() => handleTogglePref('pushNotifications')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                prefs.pushNotifications ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.pushNotifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div>
              <h4 className="text-sm font-bold text-white">Automated Conversation Summarization</h4>
              <p className="text-xs text-slate-400">Generate structured executive summaries at the end of each call.</p>
            </div>
            <button
              onClick={() => handleTogglePref('autoSummarize')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                prefs.autoSummarize ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.autoSummarize ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Visual Theme Palette */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Palette className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Theme & Visual Palette</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleChangeTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-950/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                : 'border-white/5 bg-slate-900/60 hover:border-white/20'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 shrink-0 mt-0.5 shadow-sm" />
            <div>
              <h4 className="text-sm font-bold text-white">Dark Mode (Midnight Navy)</h4>
              <p className="text-xs text-slate-400 mt-1">Deep space navy backgrounds with glowing cyan & violet accents.</p>
            </div>
          </button>

          <button
            onClick={() => handleChangeTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'light'
                ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'border-white/5 bg-slate-900/60 hover:border-white/20'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 to-orange-400 shrink-0 mt-0.5 shadow-sm" />
            <div>
              <h4 className="text-sm font-bold text-white">Light Mode (Clean Slate)</h4>
              <p className="text-xs text-slate-400 mt-1">Clean slate background with high-contrast text and luminous cards.</p>
            </div>
          </button>
        </div>
      </div>

      {/* Section 4: Data Management & Reset */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/20 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Shield className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg font-bold text-white">Data Management & Session</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
          <div>
            <h4 className="text-sm font-bold text-white">Reset Demo Data</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Restore initial sample calls, callers directory, and priority alerts to default state.
            </p>
          </div>
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-colors flex items-center gap-2 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/5">
          <div>
            <h4 className="text-sm font-bold text-white">Sign Out of Session</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Clears current session token. Preserves all registered accounts and call history.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors flex items-center gap-2 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Confirm Reset Data Modal */}
      <Modal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Confirm Demo Data Reset"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Are you sure you want to reset all demo data? This will restore the initial 12 sample calls, caller directory contacts, and priority alerts.
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Your registered user account will remain safe in localStorage.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setConfirmResetOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold gradient-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              disabled={isResetting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-colors"
            >
              {isResetting ? 'Resetting...' : 'Yes, Reset Data'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
