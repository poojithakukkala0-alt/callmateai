import React, { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Check,
  Search,
  Filter,
  Info
} from 'lucide-react';

export default function PriorityAlerts() {
  const { showToast } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All', 'High', 'Medium', 'Resolved'
  const [search, setSearch] = useState('');

  useEffect(() => {
    const list = getStorageItem(KEYS.ALERTS, []);
    setAlerts(list);
  }, []);

  const handleAcknowledge = (id) => {
    const updated = alerts.map((alt) => {
      if (alt.id === id) {
        return { ...alt, acknowledged: true, status: 'Resolved' };
      }
      return alt;
    });
    setAlerts(updated);
    setStorageItem(KEYS.ALERTS, updated);
    showToast('Alert acknowledged & resolved.', 'success');
  };

  const handleEscalate = (id) => {
    const updated = alerts.map((alt) => {
      if (alt.id === id) {
        return {
          ...alt,
          severity: 'High',
          description: `${alt.description} [ESCALATED: Forwarded instant push alert to primary phone.]`
        };
      }
      return alt;
    });
    setAlerts(updated);
    setStorageItem(KEYS.ALERTS, updated);
    showToast('Simulated escalation: Priority flagged to High & push alert dispatched.', 'warning');
  };

  const filteredAlerts = alerts.filter((alt) => {
    const matchesSearch =
      alt.title.toLowerCase().includes(search.toLowerCase()) ||
      alt.callerName.toLowerCase().includes(search.toLowerCase()) ||
      alt.description.toLowerCase().includes(search.toLowerCase());

    if (filter === 'All') return matchesSearch;
    if (filter === 'Resolved') return matchesSearch && alt.status === 'Resolved';
    return matchesSearch && alt.severity === filter && alt.status !== 'Resolved';
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Priority Alerts
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold uppercase">
              {alerts.filter((a) => !a.acknowledged).length} Pending
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time escalation triggers and urgent notifications identified by CallMateAI.
          </p>
        </div>

        {/* Disclaimer pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Fictional alerts simulation only. Real emergency services are not contacted.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts, callers, keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'High', 'Medium', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-white/5 text-slate-400 text-sm">
            No priority alerts matching your criteria.
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-5 rounded-2xl glass-card border transition-all ${
                alt.status === 'Resolved'
                  ? 'border-white/5 opacity-65'
                  : alt.severity === 'High'
                  ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-slate-900/80'
                  : 'border-amber-500/30 bg-slate-900/70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      alt.status === 'Resolved'
                        ? 'bg-emerald-400'
                        : alt.severity === 'High'
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-amber-400'
                    }`}
                  />
                  <h3 className="text-base font-bold text-white">{alt.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      alt.severity === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {alt.severity} Priority
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                    {alt.timestamp}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {alt.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{alt.callerName}</span>
                  <span className="font-mono text-slate-400">({alt.callerPhone})</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px]">
                    {alt.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!alt.acknowledged ? (
                    <>
                      <button
                        onClick={() => handleEscalate(alt.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Escalate</span>
                      </button>

                      <button
                        onClick={() => handleAcknowledge(alt.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
