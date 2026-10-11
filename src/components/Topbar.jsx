import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, Menu, Sparkles, Check, ChevronDown, PhoneCall, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Topbar({ onMenuClick, onSearch, searchQuery = '' }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'Urgent callback requested', caller: 'Rahul Verma', time: '10m ago', unread: true },
    { id: 2, title: 'Dental appointment confirmed', caller: 'Priya Sharma', time: '1h ago', unread: true },
    { id: 3, title: 'New caller added to VIP', caller: 'Mom', time: '2h ago', unread: false }
  ]);

  const markAllRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notificationsList.filter(n => n.unread).length;

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4 transition-colors duration-300">
      
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            placeholder="Search calls, contacts, summaries..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>
      </div>

      {/* Right: AI Status, Theme Toggle, Notifications & User Pill */}
      <div className="flex items-center gap-3">
        {/* Assistant status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AI Assistant Online</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel border border-indigo-500/30 p-4 shadow-2xl z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      n.unread ? 'bg-indigo-950/40 border border-indigo-500/30' : 'bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between font-semibold text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">Caller: {n.caller}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <Link
          to="/dashboard/settings"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 transition-all"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="w-7 h-7 rounded-full object-cover border border-cyan-400"
          />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-white block leading-tight">{user?.name || 'Thanu'}</span>
            <span className="text-[10px] text-slate-400 block leading-none">Online</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
