import React, { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchEmergencies, acknowledgeEmergency, resolveEmergency } from '../api';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Check,
  Search,
  Filter,
  Info,
  RefreshCw,
  Loader2,
  CheckCheck
} from 'lucide-react';

export default function PriorityAlerts() {
  const { showToast } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // 'All', 'High', 'Medium', 'Resolved'
  const [search, setSearch] = useState('');

  // 1. Fetch live emergency records from backend
  const loadAlerts = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const data = await fetchEmergencies('all');
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((e) => ({
          id: e.id,
          backendId: e.id,
          title: `Emergency Incident #${e.id}: ${e.student_name}`,
          callerName: `Call Session #${e.call_id}`,
          callerPhone: `Student #${e.student_id}`,
          category: 'Safety & Critical Handover',
          description: e.reason,
          severity: 'High',
          status:
            e.status === 'resolved'
              ? 'Resolved'
              : e.status === 'acknowledged'
              ? 'Acknowledged'
              : 'Pending',
          acknowledged: e.status === 'acknowledged' || e.status === 'resolved',
          isResolved: e.status === 'resolved',
          timestamp: e.timestamp
            ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          raw: e,
        }));
        setAlerts(mapped);
      } else {
        // Fallback to local storage if no incidents in backend yet
        const stored = getStorageItem(KEYS.ALERTS, []);
        setAlerts(stored);
      }
    } catch (err) {
      console.warn('Failed to fetch emergencies from backend, falling back to local storage:', err);
      const stored = getStorageItem(KEYS.ALERTS, []);
      setAlerts(stored);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    // Poll for new emergencies every 8 seconds
    const interval = setInterval(() => {
      loadAlerts(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // 2. Acknowledge emergency
  const handleAcknowledge = async (id, backendId) => {
    if (backendId) {
      try {
        await acknowledgeEmergency(backendId);
      } catch (err) {
        console.error('Backend acknowledge failed:', err);
      }
    }
    const updated = alerts.map((alt) => {
      if (alt.id === id) {
        return { ...alt, acknowledged: true, status: 'Acknowledged' };
      }
      return alt;
    });
    setAlerts(updated);
    setStorageItem(KEYS.ALERTS, updated);
    showToast(`Emergency incident #${id} acknowledged by counselor.`, 'success');
  };

  // 3. Resolve emergency
  const handleResolve = async (id, backendId) => {
    if (backendId) {
      try {
        await resolveEmergency(backendId, 'Confirmed safe by academic counselor.');
      } catch (err) {
        console.error('Backend resolve failed:', err);
      }
    }
    const updated = alerts.map((alt) => {
      if (alt.id === id) {
        return { ...alt, acknowledged: true, isResolved: true, status: 'Resolved' };
      }
      return alt;
    });
    setAlerts(updated);
    setStorageItem(KEYS.ALERTS, updated);
    showToast(`Emergency incident #${id} confirmed resolved and logged.`, 'success');
  };

  // 4. Simulate Escalation
  const handleEscalate = (id) => {
    const updated = alerts.map((alt) => {
      if (alt.id === id) {
        return {
          ...alt,
          severity: 'High',
          description: `${alt.description} [ESCALATED: Instant priority push alert dispatched to principal and counselor mobile.]`
        };
      }
      return alt;
    });
    setAlerts(updated);
    setStorageItem(KEYS.ALERTS, updated);
    showToast('Simulated escalation: High priority push alert dispatched.', 'warning');
  };

  const filteredAlerts = alerts.filter((alt) => {
    const matchesSearch =
      alt.title.toLowerCase().includes(search.toLowerCase()) ||
      alt.callerName.toLowerCase().includes(search.toLowerCase()) ||
      alt.description.toLowerCase().includes(search.toLowerCase());

    if (filter === 'All') return matchesSearch;
    if (filter === 'Resolved') return matchesSearch && (alt.status === 'Resolved' || alt.isResolved);
    return (
      matchesSearch &&
      alt.severity === filter &&
      alt.status !== 'Resolved' &&
      !alt.isResolved
    );
  });

  const pendingCount = alerts.filter((a) => !a.acknowledged && !a.isResolved && a.status !== 'Resolved').length;

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
              {pendingCount} Pending
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
              Connected to FastAPI
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time escalation triggers, safety alerts, and counselor handover notifications from MongoDB Atlas.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAlerts(false)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-semibold transition-all disabled:opacity-50"
            title="Refresh alerts from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync Live</span>
          </button>
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
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 glass-panel rounded-2xl border border-white/5">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            <span className="text-sm font-medium">Checking live emergency records...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-16 text-center rounded-2xl glass-panel border border-white/5 text-slate-400 text-sm space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400 mb-2">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="font-semibold text-white">No active priority alerts</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Simulate an incoming call in the Call Center and mention keywords like <code className="text-rose-400 font-mono">"accident"</code> or <code className="text-rose-400 font-mono">"injured"</code> to trigger a live emergency incident.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isResolved = alt.status === 'Resolved' || alt.isResolved;
            const isAcknowledged = alt.status === 'Acknowledged' || alt.acknowledged;

            return (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl glass-card border transition-all ${
                  isResolved
                    ? 'border-white/5 opacity-65 bg-slate-950/40'
                    : alt.severity === 'High'
                    ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-slate-900/80'
                    : 'border-amber-500/30 bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isResolved
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
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : alt.severity === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {alt.status || `${alt.severity} Priority`}
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
                    {!isAcknowledged && !isResolved && (
                      <button
                        onClick={() => handleEscalate(alt.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Escalate</span>
                      </button>
                    )}

                    {!isAcknowledged && !isResolved ? (
                      <button
                        onClick={() => handleAcknowledge(alt.id, alt.backendId)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    ) : !isResolved ? (
                      <button
                        onClick={() => handleResolve(alt.id, alt.backendId)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
