import React, { useState, useEffect } from 'react';
import { getStorageItem, KEYS } from '../utils/storage';
import Modal from '../components/Modal';
import { Search, ChevronRight } from 'lucide-react';

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    const list = getStorageItem(KEYS.CALLS, []);
    setCalls(list);
  }, []);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.callerName.toLowerCase().includes(search.toLowerCase()) ||
      call.callerPhone.includes(search) ||
      call.summary.toLowerCase().includes(search.toLowerCase());

    const matchesOutcome =
      outcomeFilter === 'All' || call.outcome === outcomeFilter;

    return matchesSearch && matchesOutcome;
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
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Complete archive of AI intercepted calls, transcripts, and action logs.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by caller, text, summary..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Completed', 'AI Handled', 'Handover'].map((tab) => (
            <button
              key={tab}
              onClick={() => setOutcomeFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                outcomeFilter === tab
                  ? 'bg-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3.5">
        {filteredCalls.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-white/5 text-slate-400 text-sm">
            No call records found matching your filters.
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              onClick={() => setActiveCall(call)}
              className="glass-card p-5 rounded-2xl border border-white/5 hover:border-cyan-500/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group"
            >
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={call.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={call.callerName}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-cyan-400 transition-colors shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {call.callerName}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">({call.callerPhone})</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        call.status === 'Important'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {call.status}
                    </span>
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
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                      call.outcome === 'Handover'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : call.outcome === 'AI Handled'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {call.outcome}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
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
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cyan-400">{activeCall.outcome}</span>
                <p className="text-xs text-slate-500">{activeCall.duration} · {activeCall.timestamp}</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Executive AI Summary
              </h5>
              <p className="text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5">
                {activeCall.summary}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Recorded Transcript
              </h5>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {activeCall.transcript?.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs ${
                      msg.sender === 'AI'
                        ? 'bg-indigo-950/50 border border-indigo-500/20 text-indigo-200'
                        : 'bg-slate-900 border border-white/5 text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-[10px] uppercase text-cyan-400 block mb-0.5">
                      {msg.sender}
                    </span>
                    <p>{msg.text}</p>
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
