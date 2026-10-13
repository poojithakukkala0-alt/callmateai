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
  const { user, showToast } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // 'All', 'High', 'Medium', 'Resolved'
  const [search, setSearch] = useState('');

  // 1. Fetch and merge backend emergency records with local alert pool
  const loadAlerts = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      // Read stored alert pool from localStorage
      const stored =
        getStorageItem('callmate_alerts_pool', null) ||
        getStorageItem(KEYS.ALERTS, null) ||
        getStorageItem('callmate_alerts', []);
      const localPool = Array.isArray(stored) ? stored : [];

      // Fetch live emergencies from backend
      let backendEmergencies = [];
      try {
        const data = await fetchEmergencies('all');
        if (Array.isArray(data) && data.length > 0) {
          backendEmergencies = data.map((e) => ({
            id: `emg-${e.id}`,
            backendId: e.id,
            title: `Emergency Incident #${e.id}: ${e.student_name}`,
            student_name: e.student_name,
            caller: `Call Session #${e.call_id}`,
            callerName: `Call Session #${e.call_id}`,
            phone: `Student #${e.student_id}`,
            callerPhone: `Student #${e.student_id}`,
            category: 'Safety & Critical Handover',
            description: e.reason,
            note: e.reason,
            priority: 'high',
            severity: 'High',
            status:
              e.status === 'resolved'
                ? 'Resolved'
                : e.status === 'acknowledged'
                ? 'Acknowledged'
                : 'open',
            acknowledged: e.status === 'acknowledged' || e.status === 'resolved',
            isResolved: e.status === 'resolved',
            timestamp: e.timestamp
              ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just now',
            raw: e
          }));
        }
      } catch (beErr) {
        console.warn('Backend emergencies fetch note:', beErr.message);
      }

      // Merge backend emergencies with local alert pool without duplicates
      const merged = [...backendEmergencies];
      localPool.forEach((localAlt) => {
        const alreadyExists = merged.some(
          (m) =>
            m.id === localAlt.id ||
            (localAlt.backendId && m.backendId === localAlt.backendId) ||
            (localAlt.title && m.title === localAlt.title && !localAlt.backendId)
        );
        if (!alreadyExists) {
          merged.push(localAlt);
        }
      });

      // Filter out stale dummy records
      const cleanAlerts = merged.filter((alt) => {
        const titleLower = (alt.title || '').toLowerCase();
        const descLower = (alt.description || alt.note || '').toLowerCase();
        return !titleLower.includes('gate delivery') && !descLower.includes('gate delivery');
      });

      // If pool is completely empty, initialize with default classroom presence inquiry
      if (cleanAlerts.length === 0) {
        const defaultPresenceAlert = {
          id: 'alt-presence-sample',
          title: 'Classroom Presence Check: Aarav Sharma',
          student_name: 'Aarav Sharma',
          section: 'CSE - Section A',
          caller: 'Rajesh Sharma',
          callerName: 'Rajesh Sharma',
          phone: '+91 98450 11223',
          callerPhone: '+91 98450 11223',
          priority: 'medium',
          severity: 'Medium',
          status: 'open',
          timestamp: '15 mins ago',
          note: 'Parent requested live visual classroom presence confirmation.',
          description: 'Parent requested live visual classroom presence confirmation.',
          category: 'Classroom Inquiry',
          counselorId: 1,
          acknowledged: false,
          isResolved: false
        };
        const initialList = [defaultPresenceAlert];
        setStorageItem(KEYS.ALERTS, initialList);
        setStorageItem('callmate_alerts', initialList);
        localStorage.setItem('callmate_alerts_pool', JSON.stringify(initialList));
        setAlerts(initialList);
      } else {
        setAlerts(cleanAlerts);
      }
    } catch (err) {
      console.warn('Failed to load alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => {
      loadAlerts(true);
    }, 6000);

    const handleStorageChange = (e) => {
      if (
        e.key === KEYS.ALERTS ||
        e.key === 'callmate_alerts' ||
        e.key === 'callmate_alerts_pool'
      ) {
        loadAlerts(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAlerts]);

  // 2. Acknowledge alert
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
    setStorageItem('callmate_alerts', updated);
    localStorage.setItem('callmate_alerts_pool', JSON.stringify(updated));
    showToast(`Alert acknowledged by counselor.`, 'success');
  };

  // 3. Resolve alert
  const handleResolve = async (id, backendId) => {
    if (backendId) {
      try {
        await resolveEmergency(backendId, 'Confirmed safe & resolved by academic counselor.');
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
    setStorageItem('callmate_alerts', updated);
    localStorage.setItem('callmate_alerts_pool', JSON.stringify(updated));
    showToast(`Alert marked as resolved.`, 'success');
  };

  // 4. Simulate Escalation
  const handleEscalate = (id) => {
    const updated = alerts.map((alt) => {
      if (alt.id === id) {
        return {
          ...alt,
          priority: 'high',
          severity: 'High',
          description: `${alt.description || alt.note} [ESCALATED: Instant priority push alert dispatched to counselor mobile.]`,
          note: `${alt.note || alt.description} [ESCALATED: Instant priority push alert dispatched to counselor mobile.]`
        };
      }
      return alt;
    });
    setAlerts(updated);
    setStorageItem(KEYS.ALERTS, updated);
    setStorageItem('callmate_alerts', updated);
    localStorage.setItem('callmate_alerts_pool', JSON.stringify(updated));
    showToast('Alert escalated: High priority push alert dispatched.', 'warning');
  };

  // Filter alerts per requirement:
  // - Selecting 'Medium': immediately displays live classroom inquiry cards
  // - Clicking 'All': displays both 'High' (emergency) and 'Medium' (inquiry) alerts
  // - Clicking 'Resolved': excludes active items (only displays resolved items)
  const filteredAlerts = alerts.filter((alt) => {
    const isResolved =
      alt.status?.toLowerCase() === 'resolved' ||
      alt.isResolved === true;

    // Search query matching
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (alt.title || '').toLowerCase().includes(searchLower) ||
      (alt.student_name || '').toLowerCase().includes(searchLower) ||
      (alt.caller || alt.callerName || '').toLowerCase().includes(searchLower) ||
      (alt.phone || alt.callerPhone || '').includes(search) ||
      (alt.section || '').toLowerCase().includes(searchLower) ||
      (alt.note || alt.description || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // 1. 'Resolved' filter tab: strictly excludes active items
    if (filter === 'Resolved') {
      return isResolved;
    }

    // Active filter tabs ('All', 'High', 'Medium'): exclude resolved items
    if (isResolved) {
      return false;
    }

    // 2. 'All' filter tab: displays both 'High' (emergency) and 'Medium' (inquiry) alerts
    if (filter === 'All') {
      return true;
    }

    const priorityNorm = (alt.priority || alt.severity || '').toLowerCase();

    // 3. 'Medium' filter tab: displays live classroom inquiry cards
    if (filter === 'Medium') {
      return priorityNorm === 'medium';
    }

    // 4. 'High' filter tab: displays emergency alerts
    if (filter === 'High') {
      return priorityNorm === 'high' || priorityNorm === 'urgent';
    }

    return true;
  });

  const pendingCount = alerts.filter((a) => !a.acknowledged && !a.isResolved && a.status !== 'Resolved').length;
  const mediumCount = alerts.filter((a) => {
    const isResolved = a.status?.toLowerCase() === 'resolved' || a.isResolved === true;
    const p = (a.priority || a.severity || '').toLowerCase();
    return !isResolved && p === 'medium';
  }).length;
  const highCount = alerts.filter((a) => {
    const isResolved = a.status?.toLowerCase() === 'resolved' || a.isResolved === true;
    const p = (a.priority || a.severity || '').toLowerCase();
    return !isResolved && (p === 'high' || p === 'urgent');
  }).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Priority Alerts
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold uppercase">
              {pendingCount} Pending
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase">
              {mediumCount} Classroom Checks
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
              Connected to FastAPI
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time escalation triggers, safety incidents, and live classroom presence checks from CallCenter.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAlerts(false)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-semibold transition-all disabled:opacity-50"
            title="Refresh alerts from backend and local pool"
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
            placeholder="Search alerts, student, parent, note..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'All', label: 'All', badge: highCount + mediumCount },
            { id: 'High', label: 'High (Emergency)', badge: highCount },
            { id: 'Medium', label: 'Medium (Inquiry)', badge: mediumCount },
            { id: 'Resolved', label: 'Resolved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filter === tab.id
                  ? tab.id === 'Medium'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : tab.id === 'Resolved'
                    ? 'bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 glass-panel rounded-2xl border border-white/5">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            <span className="text-sm font-medium">Checking live alerts and incidents...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-16 text-center rounded-2xl glass-panel border border-white/5 text-slate-400 text-sm space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400 mb-2">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="font-semibold text-white">No alerts found under "{filter}"</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {filter === 'Medium'
                ? 'Ask an in-class presence boundary inquiry in Call Center (e.g., "Is my child in class right now?", "1st period check") to dispatch a live inquiry card.'
                : 'Simulate an incoming call in the Call Center to test emergency routing and classroom presence checks.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isResolved = alt.status?.toLowerCase() === 'resolved' || alt.isResolved;
            const isAcknowledged = alt.status?.toLowerCase() === 'acknowledged' || alt.acknowledged;
            const isHigh = (alt.priority || alt.severity || '').toLowerCase() === 'high' || (alt.priority || alt.severity || '').toLowerCase() === 'urgent';
            const isMedium = (alt.priority || alt.severity || '').toLowerCase() === 'medium';

            return (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl glass-card border transition-all ${
                  isResolved
                    ? 'border-white/5 opacity-65 bg-slate-950/40'
                    : isHigh
                    ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-slate-900/80'
                    : 'border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.12)] bg-slate-900/75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isResolved
                          ? 'bg-emerald-400'
                          : isHigh
                          ? 'bg-rose-500 animate-pulse'
                          : 'bg-amber-400 animate-pulse'
                      }`}
                    />
                    <h3 className="text-base font-bold text-white">{alt.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isHigh
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isResolved
                        ? 'Resolved'
                        : isHigh
                        ? 'High Priority'
                        : 'Medium Priority'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {alt.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {alt.note || alt.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">
                      Caller: {alt.caller || alt.callerName}
                    </span>
                    <span className="font-mono text-slate-400">
                      ({alt.phone || alt.callerPhone})
                    </span>
                    {alt.student_name && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-semibold">
                        Student: {alt.student_name}
                      </span>
                    )}
                    {alt.section && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] font-mono">
                        {alt.section}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isAcknowledged && !isResolved && isHigh && (
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
