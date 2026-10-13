import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStorageItem, setStorageItem, KEYS } from '../utils/storage';
import { getInitialCounselorCalls } from '../data/counselors';
import Modal from '../components/Modal';
import { Search, ChevronRight, PhoneCall, Sparkles, Bot, PhoneForwarded, CheckCircle2 } from 'lucide-react';

export default function CallHistory() {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All'); // 'All', 'Completed', 'AI Handled', 'Handover'
  const [activeCall, setActiveCall] = useState(null);

  const activeCounselorId = Number(user?.counselor_id || user?.counselorId || 1);

  // Load call records from storage key `callmate_calls` and remove stale dummy records
  const loadCallsFromStorage = () => {
    try {
      const stored = localStorage.getItem('callmate_calls');
      let parsed = stored ? JSON.parse(stored) : getStorageItem(KEYS.CALLS, []);
      if (!Array.isArray(parsed)) parsed = [];

      // Remove stale static dummy records (e.g. 'Mom (Sarah)', 'Amit Kumar', 'Elena Rostova', etc.)
      const cleaned = parsed.filter((c) => {
        const name = (c.callerName || '').toLowerCase();
        if (
          name.includes('mom (sarah)') ||
          name.includes('amit kumar') ||
          c.id === 'call-101' ||
          c.id === 'call-104'
        ) {
          return false;
        }
        return true;
      });

      // If storage is empty, initialize with realistic seeded counselor records
      if (cleaned.length === 0) {
        const initial = getInitialCounselorCalls();
        localStorage.setItem('callmate_calls', JSON.stringify(initial));
        setStorageItem(KEYS.CALLS, initial);
        setCalls(initial);
      } else {
        localStorage.setItem('callmate_calls', JSON.stringify(cleaned));
        setCalls(cleaned);
      }
    } catch (err) {
      console.error('Failed reading calls:', err);
    }
  };

  useEffect(() => {
    loadCallsFromStorage();

    // Live sync when new call ends in CallCenter
    const handleStorageChange = (e) => {
      if (e.key === 'callmate_calls' || e.key === KEYS.CALLS) {
        loadCallsFromStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeCounselorId]);

  // Filter archived calls:
  // - Remove stale dummy records
  // - Filter by logged-in counselor
  // - Filter by active tab ('All', 'Completed', 'AI Handled', 'Handover') based on call.tag
  const filteredCalls = calls.filter((call) => {
    // 1. Remove stale dummy records
    const callerNameLower = (call.callerName || '').toLowerCase();
    if (callerNameLower.includes('mom (sarah)') || callerNameLower.includes('amit kumar')) {
      return false;
    }

    // 2. Filter by counselor: 'All': Displays all archived calls for the logged-in counselor.
    const callCounselorId = Number(call.counselorId || call.counselor_id);
    if (callCounselorId && callCounselorId !== activeCounselorId) {
      return false;
    }

    // 3. Search query matching
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (call.callerName || '').toLowerCase().includes(searchLower) ||
      (call.callerPhone || '').includes(search) ||
      (call.studentName || '').toLowerCase().includes(searchLower) ||
      (call.studentCode || '').toLowerCase().includes(searchLower) ||
      (call.summary || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // 4. Active tab filtering:
    // - 'All': Displays all archived calls for the logged-in counselor.
    // - 'Completed': Displays calls marked 'completed'.
    // - 'AI Handled': Displays calls resolved autonomously by AI ('ai_handled').
    // - 'Handover': Displays calls that required human takeover ('handover').
    if (outcomeFilter === 'All') return true;

    if (outcomeFilter === 'Completed') {
      return (
        call.tag === 'completed' ||
        (call.outcome?.toLowerCase() === 'completed' &&
          call.tag !== 'ai_handled' &&
          call.tag !== 'handover')
      );
    }

    if (outcomeFilter === 'AI Handled') {
      return (
        call.tag === 'ai_handled' ||
        call.tag === 'ai-handled' ||
        call.outcome?.toLowerCase() === 'ai handled'
      );
    }

    if (outcomeFilter === 'Handover') {
      return (
        call.tag === 'handover' ||
        call.outcome?.toLowerCase() === 'handover'
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Call History
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
              {filteredCalls.length} Records
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
              {user?.name || 'Dr. Lakshmi Prasad'} ({user?.section || 'CSE - Section A'})
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time archive of AI intercepted parent calls, transcripts, and counselor handover logs.
          </p>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by parent, student, phone, summary..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* 4 Tabs: All, Completed, AI Handled, Handover */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'All', label: 'All' },
            { id: 'Completed', label: 'Completed' },
            { id: 'AI Handled', label: 'AI Handled' },
            { id: 'Handover', label: 'Handover' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOutcomeFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                outcomeFilter === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3.5">
        {filteredCalls.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-white/5 text-slate-400 text-sm">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400 mb-2">
              <PhoneCall className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="font-semibold text-white">No calls found matching "{outcomeFilter}" tab.</div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate and conclude calls in the Call Center to populate real-time session logs.
            </p>
          </div>
        ) : (
          filteredCalls.map((call) => {
            const isHandover = call.tag === 'handover' || call.outcome === 'Handover';
            const isAiHandled = call.tag === 'ai_handled' || call.outcome === 'AI Handled';

            return (
              <div
                key={call.id}
                onClick={() => setActiveCall(call)}
                className="glass-card p-5 rounded-2xl border border-white/5 hover:border-cyan-500/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={call.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(call.callerName || 'Parent')}`}
                    alt={call.callerName}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-cyan-400 transition-colors shadow-md shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {call.callerName}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">({call.callerPhone})</span>
                      {call.studentName && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 border border-white/10">
                          Student: {call.studentName} ({call.studentCode || 'N/A'})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1 max-w-xl">
                      {call.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs font-mono text-slate-400 block">{call.timestamp}</span>
                    <span className="text-[11px] text-slate-500 block">Duration: {call.duration}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                        isHandover
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isAiHandled
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isHandover ? 'Handover' : isAiHandled ? 'AI Handled' : 'Completed'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Call Detail Modal */}
      <Modal
        isOpen={!!activeCall}
        onClose={() => setActiveCall(null)}
        title={activeCall ? `Call Record — ${activeCall.callerName}` : ''}
        maxWidth="max-w-xl"
      >
        {activeCall && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={activeCall.avatar}
                  alt={activeCall.callerName}
                  className="w-12 h-12 rounded-full object-cover border border-cyan-400"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{activeCall.callerName}</h4>
                  <p className="text-xs text-slate-400 font-mono">{activeCall.callerPhone}</p>
                  {activeCall.studentName && (
                    <p className="text-[11px] text-cyan-300 mt-0.5">
                      Student: {activeCall.studentName} ({activeCall.studentCode || 'N/A'})
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded-lg border ${
                    activeCall.tag === 'handover' || activeCall.outcome === 'Handover'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : activeCall.tag === 'ai_handled' || activeCall.outcome === 'AI Handled'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {activeCall.tag === 'handover'
                    ? 'Handover'
                    : activeCall.tag === 'ai_handled'
                    ? 'AI Handled'
                    : 'Completed'}
                </span>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {activeCall.duration} · {activeCall.timestamp}
                </p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Executive AI Summary
              </h5>
              <p className="text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                {activeCall.summary}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Recorded Transcript
              </h5>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeCall.transcript?.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs ${
                      msg.sender === 'AI'
                        ? 'bg-indigo-950/50 border border-indigo-500/20 text-indigo-200'
                        : 'bg-slate-900 border border-white/5 text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-[10px] uppercase text-cyan-400 block mb-0.5 font-mono">
                      {msg.sender === 'AI' ? '🤖 CallMateAI' : `👤 ${activeCall.callerName}`}
                    </span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveCall(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold gradient-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
