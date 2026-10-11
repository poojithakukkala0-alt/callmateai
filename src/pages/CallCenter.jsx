import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStorageItem, setStorageItem, KEYS } from '../utils/storage';
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Activity,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Play,
  RotateCcw
} from 'lucide-react';

const SIMULATED_SCENARIOS = [
  {
    name: 'Mom (Sarah)',
    phone: '+1 (555) 234-8901',
    category: 'Family & VIP',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    dialogues: [
      { sender: 'AI', text: 'Hello! You have reached Thanu via CallMateAI. How can I assist you?' },
      { sender: 'Caller', text: 'Hi! Just making sure we are meeting for dinner this Friday.' },
      { sender: 'AI', text: 'Thanu’s schedule is clear for Friday dinner. I am noting a 7:00 PM confirmation.' },
      { sender: 'Caller', text: 'Fantastic, thank you! Tell him love you!' }
    ],
    finalSummary: 'Confirmed family Friday dinner plans at 7:00 PM; reminder logged.',
    priority: 'High'
  },
  {
    name: 'Rahul Verma',
    phone: '+91 98765 43210',
    category: 'VIP Client',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    dialogues: [
      { sender: 'AI', text: 'CallMateAI concierge. Thanu is currently reviewing client files.' },
      { sender: 'Caller', text: 'Rahul here from Apex Corp. We have an urgent clarification on the SLA agreement.' },
      { sender: 'AI', text: 'Flagging this as urgent high priority. Notifying Thanu on desktop right now.' },
      { sender: 'Caller', text: 'Please connect as soon as he steps out.' }
    ],
    finalSummary: 'Urgent SLA agreement terms clarification; instant handover alert created.',
    priority: 'High'
  },
  {
    name: 'Dr. Priya Sharma Clinic',
    phone: '+91 91234 56789',
    category: 'Healthcare',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    dialogues: [
      { sender: 'AI', text: 'Hello! CallMateAI answering for Thanu.' },
      { sender: 'Caller', text: 'Calling from dental reception. We have an earlier slot open tomorrow at 10 AM.' },
      { sender: 'AI', text: 'Thanu prefers morning slots. Would you like me to tentatively hold it?' },
      { sender: 'Caller', text: 'Yes, holding until 5 PM today.' }
    ],
    finalSummary: 'Dental checkup rescheduled to tentative 10:00 AM slot.',
    priority: 'Medium'
  }
];

export default function CallCenter() {
  const { showToast } = useAuth();
  
  // Call States: 'idle', 'incoming', 'active', 'ended'
  const [callState, setCallState] = useState('idle');
  const [currentCall, setCurrentCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [displayedTranscript, setDisplayedTranscript] = useState([]);
  
  // Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [aiState, setAiState] = useState('Listening'); // 'Listening', 'Speaking', 'Idle', 'Handover'

  // Timer
  useEffect(() => {
    let timer = null;
    if (callState === 'active') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Dialogue streamer during active call
  useEffect(() => {
    let interval = null;
    if (callState === 'active' && currentCall) {
      interval = setInterval(() => {
        if (transcriptIndex < currentCall.dialogues.length) {
          const nextTurn = currentCall.dialogues[transcriptIndex];
          setDisplayedTranscript((prev) => [...prev, nextTurn]);
          setAiState(nextTurn.sender === 'AI' ? 'Speaking' : 'Listening');
          setTranscriptIndex((prev) => prev + 1);
        } else {
          setAiState('Idle');
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [callState, currentCall, transcriptIndex]);

  const handleSimulateIncoming = () => {
    const randomScenario = SIMULATED_SCENARIOS[Math.floor(Math.random() * SIMULATED_SCENARIOS.length)];
    setCurrentCall(randomScenario);
    setCallDuration(0);
    setTranscriptIndex(0);
    setDisplayedTranscript([]);
    setCallState('incoming');
    showToast(`Incoming call simulation: ${randomScenario.name}`, 'info');
  };

  const handleAnswerDirect = () => {
    setCallState('active');
    setAiState('Listening');
    showToast('Direct call answered. User on line.', 'success');
  };

  const handleForwardToAI = () => {
    setCallState('active');
    setAiState('Speaking');
    showToast('Call forwarded to CallMateAI assistant.', 'info');
  };

  const handleDecline = () => {
    showToast('Call declined & routed to voicemail summary.', 'warning');
    setCallState('idle');
    setCurrentCall(null);
  };

  const handleEndCall = () => {
    if (!currentCall) return;
    
    // Save call to local storage history
    const calls = getStorageItem(KEYS.CALLS, []);
    const newRecord = {
      id: `call-${Date.now()}`,
      callerName: currentCall.name,
      callerPhone: currentCall.phone,
      avatar: currentCall.avatar,
      timestamp: 'Just now',
      duration: `${Math.floor(callDuration / 60)}m ${callDuration % 60}s`,
      category: currentCall.category,
      status: currentCall.priority === 'High' ? 'Important' : 'General',
      outcome: 'Completed',
      summary: currentCall.finalSummary,
      transcript: displayedTranscript.length > 0 ? displayedTranscript : currentCall.dialogues
    };

    setStorageItem(KEYS.CALLS, [newRecord, ...calls.slice(0, 9)]);
    setCallState('ended');
    showToast('Call ended and saved to Call History.', 'success');
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Call Center Simulator
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
              Live Demo
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Simulate incoming calls, real-time audio transcripts, and AI assistant actions.
          </p>
        </div>

        {callState === 'idle' && (
          <button
            onClick={handleSimulateIncoming}
            className="gradient-btn-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <PhoneIncoming className="w-4 h-4" />
            <span>Simulate Incoming Call</span>
          </button>
        )}
      </div>

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Call Stage / Phone Interface */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Stage Panel */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden min-h-[440px] flex flex-col justify-between">
            
            {/* Top Status */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Connection Status: {callState.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-cyan-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                {formatTimer(callDuration)}
              </span>
            </div>

            {/* Stage Center Body */}
            <div className="my-8 flex flex-col items-center justify-center text-center">
              
              {/* IDLE STATE */}
              {callState === 'idle' && (
                <div className="space-y-4 max-w-sm">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                    <PhoneCall className="w-9 h-9" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Call Center Ready</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click "Simulate Incoming Call" to test how CallMateAI answers, transcribes, and organizes high-priority conversations.
                  </p>
                  <button
                    onClick={handleSimulateIncoming}
                    className="gradient-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mt-2 inline-flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Trigger Test Call</span>
                  </button>
                </div>
              )}

              {/* INCOMING STATE */}
              {callState === 'incoming' && currentCall && (
                <div className="space-y-6 max-w-md w-full animate-bounce-gentle">
                  <div className="relative mx-auto w-24 h-24">
                    <img
                      src={currentCall.avatar}
                      alt={currentCall.name}
                      className="w-full h-full rounded-full object-cover border-4 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                    />
                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center border-2 border-slate-950 animate-ping" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white">{currentCall.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">{currentCall.phone}</p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {currentCall.category} · Priority: {currentCall.priority}
                    </span>
                  </div>

                  {/* Incoming Call Action Trio */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <button
                      onClick={handleDecline}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-all"
                    >
                      <PhoneOff className="w-6 h-6 text-rose-400" />
                      <span className="text-[11px] font-bold">Decline</span>
                    </button>

                    <button
                      onClick={handleForwardToAI}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-cyan-300 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    >
                      <Bot className="w-6 h-6 text-cyan-400" />
                      <span className="text-[11px] font-bold">Forward to AI</span>
                    </button>

                    <button
                      onClick={handleAnswerDirect}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 transition-all"
                    >
                      <PhoneCall className="w-6 h-6 text-emerald-400" />
                      <span className="text-[11px] font-bold">Answer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE STATE */}
              {callState === 'active' && currentCall && (
                <div className="space-y-6 w-full max-w-md">
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={currentCall.avatar}
                      alt={currentCall.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    />
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">{currentCall.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{currentCall.phone}</p>
                      <span className="inline-block text-[11px] font-bold text-cyan-400 mt-1">
                        AI Assistant Active: {aiState}
                      </span>
                    </div>
                  </div>

                  {/* Pulsing Audio Frequency Waveform */}
                  <div className="h-16 flex items-center justify-center gap-1.5 bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    {[14, 28, 44, 20, 36, 52, 26, 48, 32, 18, 42, 30, 22, 38, 16].map((h, i) => (
                      <span
                        key={i}
                        className="wave-bar"
                        style={{
                          height: `${aiState === 'Speaking' || aiState === 'Listening' ? h : 6}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>

                  {/* In-Call Controls */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isMuted
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                      }`}
                      title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        !isSpeakerOn
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                      }`}
                      title={isSpeakerOn ? 'Mute Speaker' : 'Turn On Speaker'}
                    >
                      {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={handleEndCall}
                      className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-all"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End Call</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ENDED STATE */}
              {callState === 'ended' && currentCall && (
                <div className="space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Call Completed</h3>
                  <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                    {currentCall.finalSummary}
                  </p>
                  <button
                    onClick={() => {
                      setCallState('idle');
                      setCurrentCall(null);
                    }}
                    className="gradient-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Simulator</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Disclaimer */}
            <div className="text-center pt-3 border-t border-white/5 text-[11px] text-slate-500">
              ⚠️ Simulated call environment. Does not connect to real telephone networks.
            </div>
          </div>
        </div>

        {/* Right Side: Live Audio Transcript Stream */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 min-h-[440px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live AI Transcript
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {callState === 'active' ? 'STREAMING' : 'READY'}
                </span>
              </div>

              {/* Dialogue Bubble List */}
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {displayedTranscript.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    No active call transcript. Trigger a simulated call to inspect real-time speech turns.
                  </div>
                ) : (
                  displayedTranscript.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs animate-slide-in ${
                        turn.sender === 'AI'
                          ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 ml-4'
                          : 'bg-slate-900 border border-white/10 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[10px] uppercase text-cyan-400 font-mono">
                          {turn.sender === 'AI' ? '🤖 CallMateAI' : `👤 ${currentCall?.name || 'Caller'}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Just now</span>
                      </div>
                      <p className="leading-relaxed">{turn.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom summary note */}
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automatic Intent Extraction</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
