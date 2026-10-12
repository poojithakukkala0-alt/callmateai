import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStorageItem, setStorageItem, KEYS } from '../utils/storage';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  PhoneCall,
  Sparkles,
  AlertOctagon,
  Users,
  PhoneIncoming,
  CheckCircle2,
  Activity,
  ShieldAlert,
  ChevronRight,
  PhoneForwarded,
  Bot
} from 'lucide-react';

const COUNSELOR_ROSTER = [
  {
    id: 'cns-1',
    name: 'Dr. Priya Sharma',
    role: 'Lead Counselor',
    sections: 'Grades 9 & 10 (Sections A, B)',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    activeCalls: 0
  },
  {
    id: 'cns-2',
    name: 'Ms. Neha Verma',
    role: 'Academic & Career Counselor',
    sections: 'Grades 11 & 12 (All Sections)',
    status: 'On Call',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    activeCalls: 1
  },
  {
    id: 'cns-3',
    name: 'Mr. Arjun Rao',
    role: 'Crisis Intervention Specialist',
    sections: 'Schoolwide Emergency Liaison',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    activeCalls: 0
  },
  {
    id: 'cns-4',
    name: 'Ms. Kavya Iyer',
    role: 'Student Wellness Counselor',
    sections: 'Grades 6 to 8 (Sections A to D)',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    activeCalls: 0
  }
];

const INITIAL_PENDING_HANDOVERS = [
  {
    id: 'hnd-1',
    parentName: 'Ananya Reddy (Parent)',
    studentInfo: 'Class 9A — Aarav Reddy',
    counselor: 'Dr. Priya Sharma',
    urgency: 'High',
    topic: 'Emotional distress concern regarding exam anxiety',
    status: 'Pending Connection'
  },
  {
    id: 'hnd-2',
    parentName: 'Vihaan Kumar (Parent)',
    studentInfo: 'Class 6C — Sneha Kumar',
    counselor: 'Ms. Kavya Iyer',
    urgency: 'Medium',
    topic: 'Clinic physician prescription leave authorization',
    status: 'Pending Connection'
  }
];

export default function Dashboard() {
  const { user, showToast } = useAuth();

  const [calls, setCalls] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [callers, setCallers] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [pendingHandovers, setPendingHandovers] = useState(INITIAL_PENDING_HANDOVERS);

  // AI Operational Mode State ("Autonomous AI Assistant", "Supervised Handover Only", "Off")
  const [aiMode, setAiMode] = useState(() =>
    getStorageItem('callmate_v1_ai_mode', 'Autonomous AI Assistant')
  );

  const handleModeChange = (mode) => {
    setAiMode(mode);
    setStorageItem('callmate_v1_ai_mode', mode);
    showToast(`AI Operational Mode updated: ${mode}`, 'success');
  };

  useEffect(() => {
    const storedCalls = getStorageItem(KEYS.CALLS, []);
    const storedAlerts = getStorageItem(KEYS.ALERTS, []);
    const storedCallers = getStorageItem(KEYS.CALLERS, []);
    setCalls(storedCalls);
    setAlerts(storedAlerts);
    setCallers(storedCallers);
  }, []);

  const totalCallsCount = calls.length;
  const importantCallsCount = calls.filter((c) => c.status === 'Important').length;
  const attentionAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const handoversCount = calls.filter((c) => c.outcome === 'Handover').length;

  const handleAcknowledgeAlert = (alertId) => {
    const updated = alerts.map((a) => {
      if (a.id === alertId) {
        return { ...a, acknowledged: true, status: 'Resolved' };
      }
      return a;
    });
    setAlerts(updated);
    setStorageItem(KEYS.ALERTS, updated);
    showToast('Alert acknowledged & marked as resolved.', 'success');
  };

  const handleConnectHandover = (handoverId) => {
    setPendingHandovers((prev) =>
      prev.map((h) => (h.id === handoverId ? { ...h, status: 'Connected with Counselor' } : h))
    );
    showToast('Handover connected: Audio bridge opened with designated counselor.', 'success');
  };

  const handleCompleteHandover = (handoverId) => {
    setPendingHandovers((prev) => prev.filter((h) => h.id !== handoverId));
    showToast('Handover consultation logged and marked completed.', 'info');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-panel border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-500/10 to-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AI Assistant Active & Listening</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Welcome back, {user?.name || 'Thanu'}!
          </h1>
          <p className="text-sm text-slate-300">
            Overview of calls, counselor availability, and intelligent triage actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/dashboard/call-center"
            className="gradient-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            <PhoneIncoming className="w-4 h-4" />
            <span>Open Call Center</span>
          </Link>
        </div>
      </div>

      {/* High-Visibility AI Mode Operational Control Card */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.12)] relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/90 to-indigo-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Status Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                Operational AI Control Hub
              </span>

              {/* Pulsing Green Status Indicator */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  aiMode === 'Autonomous AI Assistant'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : aiMode === 'Supervised Handover Only'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-white/10 text-slate-400'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    aiMode === 'Autonomous AI Assistant'
                      ? 'bg-emerald-400 animate-ping'
                      : aiMode === 'Supervised Handover Only'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span>
                  {aiMode === 'Autonomous AI Assistant'
                    ? 'Autonomous Active'
                    : aiMode === 'Supervised Handover Only'
                    ? 'Supervised Mode'
                    : 'System Offline'}
                </span>
              </div>

              {/* Current Active Section Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                CSE - Section A
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Mode: {aiMode}
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {aiMode === 'Autonomous AI Assistant'
                ? 'Autonomous AI Assistant is actively intercepting incoming parent calls, answering queries from verified MongoDB Atlas student attendance records, and escalating urgent safety keywords in real time.'
                : aiMode === 'Supervised Handover Only'
                ? 'Supervised Handover is active. AI screens caller intent and holds the line until Dr. Lakshmi Prasad reviews and accepts the handover.'
                : 'AI mode is Off. All incoming parent calls bypass automated reasoning and ring directly on the counselor phone extension.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500">Auto-Forwarding:</span>
                <strong
                  className={
                    aiMode !== 'Off'
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-500 font-semibold'
                  }
                >
                  {aiMode === 'Autonomous AI Assistant'
                    ? 'Active (100% Routed to AI)'
                    : aiMode === 'Supervised Handover Only'
                    ? 'Screening Queue Active'
                    : 'Disabled'}
                </strong>
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500">Active Counselor:</span>
                <strong className="text-white font-medium">Dr. Lakshmi Prasad (ID: 1)</strong>
              </span>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            {[
              {
                id: 'Autonomous AI Assistant',
                label: 'Autonomous AI Assistant',
                tag: 'Active',
                desc: 'Full autonomous voice & safety'
              },
              {
                id: 'Supervised Handover Only',
                label: 'Supervised Handover Only',
                tag: 'Screening',
                desc: 'Counselor takeover prompt'
              },
              {
                id: 'Off',
                label: 'Off',
                tag: 'Manual',
                desc: 'Direct counselor phone ringing'
              }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleModeChange(option.id)}
                className={`px-4 py-3 rounded-2xl text-left transition-all border flex items-center justify-between gap-4 ${
                  aiMode === option.id
                    ? 'bg-cyan-500/15 border-cyan-400/80 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{option.label}</span>
                    {aiMode === option.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{option.desc}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    aiMode === option.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {option.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Calls"
          value={totalCallsCount}
          subtext="+20% from last week"
          icon={PhoneCall}
          variant="cyan"
          badgeText="Active"
        />
        <StatCard
          title="Important Calls"
          value={importantCallsCount}
          subtext="+3 new today"
          icon={Sparkles}
          variant="red"
          badgeText="Priority"
        />
        <StatCard
          title="Requiring Attention"
          value={attentionAlertsCount}
          subtext="+2 pending"
          icon={AlertOctagon}
          variant="amber"
          badgeText="Attention"
        />
        <StatCard
          title="Handover Simulations"
          value={handoversCount}
          subtext="+1 today"
          icon={Users}
          variant="indigo"
          badgeText="Simulated"
        />
      </div>

      {/* Current Real-Time Call Status Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Current Call Status & Live Lines
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Carrier Gateway Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase">Line 1 · Active</span>
              <p className="text-xs font-bold text-white mt-0.5">AI Answering: Mom (Sarah)</p>
              <p className="text-[11px] text-slate-400">Duration: 01:24 · Intent: Family Schedule</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase">Line 2 · Triage</span>
              <p className="text-xs font-bold text-white mt-0.5">Parent Inquiry: Class 9A Attendance</p>
              <p className="text-[11px] text-slate-400">Queued for Counselor Briefing</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Line 3 · Standby</span>
              <p className="text-xs font-bold text-white mt-0.5">Emergency Triage Line Ready</p>
              <p className="text-[11px] text-slate-400">Direct Bridge to Dr. Priya Sharma</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Grid: Operational Panels (No Graphs / Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Recent Calls & Counselor Roster */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Recent Calls Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Recent Calls</h3>
                <p className="text-xs text-slate-400">Incoming calls categorized by AI assistant</p>
              </div>
              <Link
                to="/dashboard/history"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {calls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={call.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={call.callerName}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-cyan-400 transition-colors"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {call.callerName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{call.callerPhone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        call.status === 'Important'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : call.status === 'Business'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {call.status}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">{call.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Counselor Availability and Section Assignments Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Counselor Availability & Section Assignments</h3>
                <p className="text-xs text-slate-400">Designated staff available for instant human handover</p>
              </div>
              <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                Staff Roster
              </span>
            </div>

            <div className="space-y-3">
              {COUNSELOR_ROSTER.map((cns) => (
                <div
                  key={cns.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={cns.avatar}
                        alt={cns.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                          cns.status === 'Available'
                            ? 'bg-emerald-400'
                            : cns.status === 'On Call'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{cns.name}</h4>
                      <p className="text-[11px] text-slate-400">{cns.role}</p>
                      <span className="text-[10px] text-cyan-400 font-mono">{cns.sections}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cns.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : cns.status === 'On Call'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cns.status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {cns.activeCalls > 0 ? `${cns.activeCalls} active call` : 'Ready to receive'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Emergency Alerts & Pending Counselor Handovers */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Urgent Priority / Emergency Alerts Widget */}
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.1)]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Emergency Alerts</h3>
              </div>
              <Link
                to="/dashboard/alerts"
                className="text-xs font-semibold text-rose-400 hover:underline"
              >
                Manage All
              </Link>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 3).map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alt.acknowledged
                      ? 'bg-white/5 border-white/5 opacity-60'
                      : 'bg-rose-950/30 border-rose-500/30 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-white">{alt.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alt.severity === 'High'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 mb-3">
                    {alt.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span>{alt.callerName}</span>
                    {!alt.acknowledged ? (
                      <button
                        onClick={() => handleAcknowledgeAlert(alt.id)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-colors"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Counselor Handovers Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <PhoneForwarded className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Pending Counselor Handovers</h3>
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                {pendingHandovers.length} Queued
              </span>
            </div>

            <div className="space-y-3">
              {pendingHandovers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  All counselor handovers currently connected and resolved.
                </div>
              ) : (
                pendingHandovers.map((hnd) => (
                  <div
                    key={hnd.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">{hnd.parentName}</h4>
                        <p className="text-[11px] text-slate-400">{hnd.studentInfo}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {hnd.urgency}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                      {hnd.topic}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-cyan-400 font-mono">Assigned: {hnd.counselor}</span>
                      <div className="flex items-center gap-2">
                        {hnd.status !== 'Connected with Counselor' ? (
                          <button
                            onClick={() => handleConnectHandover(hnd.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                          >
                            Connect
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCompleteHandover(hnd.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Call Detail Modal */}
      <Modal
        isOpen={!!selectedCall}
        onClose={() => setSelectedCall(null)}
        title={selectedCall ? `Call Details — ${selectedCall.callerName}` : ''}
        maxWidth="max-w-xl"
      >
        {selectedCall && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCall.avatar}
                  alt={selectedCall.callerName}
                  className="w-11 h-11 rounded-full object-cover border border-cyan-400"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedCall.callerName}</h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedCall.callerPhone}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cyan-400">{selectedCall.category}</span>
                <p className="text-xs text-slate-500">Duration: {selectedCall.duration}</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                AI Executive Summary
              </h5>
              <p className="text-sm text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5">
                {selectedCall.summary}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Simulated Conversation Transcript
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedCall.transcript?.map((turn, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs ${
                      turn.sender === 'AI'
                        ? 'bg-indigo-950/50 border border-indigo-500/20 text-indigo-200'
                        : 'bg-slate-900 border border-white/5 text-slate-200'
                    }`}
                  >
                    <span className="font-bold block text-[10px] uppercase text-cyan-400 mb-0.5">
                      {turn.sender}
                    </span>
                    <p>{turn.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCall(null)}
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
