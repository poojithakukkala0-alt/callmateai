import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchStudents,
  createCall,
  forwardCallToAgent,
  sendCallMessage,
  requestHandover,
  completeCall,
  recordCallCompletionForContact
} from '../api';
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
  CheckCircle2,
  Play,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export default function CallCenter() {
  const { showToast } = useAuth();

  // Live Data from MongoDB Atlas
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Call States: 'idle', 'incoming', 'active', 'ended'
  const [callState, setCallState] = useState('idle');
  const [activeCallId, setActiveCallId] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [displayedTranscript, setDisplayedTranscript] = useState([]);

  // Controls & AI State
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [aiState, setAiState] = useState('Idle'); // 'Listening', 'Speaking', 'Idle', 'Handover'
  const [customMessage, setCustomMessage] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [alertNote, setAlertNote] = useState('');

  // Microphone Speech-to-Text State & Hands-Free Coordination Refs
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const handleSendMessageRef = useRef(null);
  const callStateRef = useRef(callState);
  const isMutedRef = useRef(isMuted);
  const isSpeakingRef = useRef(false);
  const isManuallyPausedRef = useRef(false);

  // Keep state refs synchronized
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // 1. Fetch live students from MongoDB Atlas on mount
  // 1. Fetch live students from MongoDB Atlas (LOCKED TO COUNSELOR 1)
  useEffect(() => {
    fetchStudents()
      .then((data) => {
        const allStudents = Array.isArray(data) ? data : [];

        // 🔒 SECURITY FIX: Strictly filter to ONLY Counselor 1 (Dr. Lakshmi)
        const myStudents = allStudents.filter(student => student.counselor_id === 1);

        setStudents(myStudents);
        setLoadingStudents(false);
      })
      .catch((err) => {
        console.error('Failed to fetch students:', err);
        setLoadingStudents(false);
      });
  }, []);


  // 2. Timer during active call
  useEffect(() => {
    let timer = null;
    if (callState === 'active') {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // 3. Simulate Incoming Call from a real MongoDB student record
  const handleSimulateIncoming = async () => {
    if (students.length === 0) {
      showToast('Loading students from MongoDB Atlas, please wait...', 'warning');
      return;
    }

    // Pick a random student from our 250 seeded records
    const student = students[Math.floor(Math.random() * students.length)];
    const parent = student.parents?.[0] || { name: 'Parent', phone: '+91 9800000000' };

    try {
      const callData = await createCall(student.student_id, student.counselor_id || 1);
      setActiveCallId(callData.call_id);
      setCurrentStudent({
        ...student,
        parentName: parent.name,
        parentPhone: parent.phone,
        relationship: parent.relationship || 'Parent'
      });
      setCallDuration(0);
      setDisplayedTranscript([]);
      setIsEmergency(false);
      setAlertNote('');
      setCallState('incoming');
      showToast(`Incoming call from ${parent.name} (${student.name}'s parent)`, 'info');
    } catch (err) {
      showToast(`Backend connection failed: ${err.message}`, 'error');
    }
  };

  // Helper to start recognition safely in hands-free mode
  const startListening = () => {
    if (
      !recognitionRef.current ||
      isMutedRef.current ||
      callStateRef.current !== 'active' ||
      isManuallyPausedRef.current
    ) {
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        setIsListening(true);
      } else {
        console.warn('Microphone start note:', err.message);
      }
    }
  };

  // Helper to stop recognition safely so AI does not hear itself
  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      // ignore if already stopped
    }
    setIsListening(false);
  };

  // Native Browser Speech Synthesis (TTS) with Auto-Toggle Mic & Natural Voice Pacing
  const speakText = (text) => {
    if (!window.speechSynthesis || isMutedRef.current) return;
    window.speechSynthesis.cancel();

    // Mute/pause mic while AI prepares and speaks
    isSpeakingRef.current = true;
    stopListening();

    const cleanSpokenText = text
      .replace(/[*_#`~]/g, '')
      .replace(/🚨|📋|✅|🤖|👤/g, '')
      .replace(/\[EMERGENCY_DETECTED\]/g, '')
      .replace(/\[LIVE_INQUIRY_LOGGED\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utterance.rate = 0.88; // Natural, relaxed pace rather than rushed
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setAiState('Speaking');
      isSpeakingRef.current = true;
      stopListening();
    };

    utterance.onend = () => {
      setAiState('Listening');
      isSpeakingRef.current = false;
      // When AI finishes speaking, automatically start listening for parent's response
      if (callStateRef.current === 'active' && !isMutedRef.current && !isManuallyPausedRef.current) {
        startListening();
      }
    };

    utterance.onerror = () => {
      setAiState('Listening');
      isSpeakingRef.current = false;
      if (callStateRef.current === 'active' && !isMutedRef.current && !isManuallyPausedRef.current) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Cancel speech & mic on mute or unmount
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopListening();
    } else if (callStateRef.current === 'active' && !isSpeakingRef.current && !isManuallyPausedRef.current) {
      startListening();
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopListening();
    };
  }, []);

  // Sync latest handleSendMessage to ref to avoid stale closures in Web Speech callbacks
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  // Initialize Web Speech Recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Strictly false to catch end of sentence and fire onresult
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      const transcriptText = event.results?.[0]?.[0]?.transcript;
      if (transcriptText && transcriptText.trim()) {
        const spokenText = transcriptText.trim();
        // Immediately pause listening so AI audio/backend latency doesn't trigger feedback
        isSpeakingRef.current = true;
        stopListening();
        if (handleSendMessageRef.current) {
          handleSendMessageRef.current(spokenText);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Continuous Hands-Free: Auto-restart listening if call is active, AI is quiet, and not manually paused
      if (
        callStateRef.current === 'active' &&
        !isSpeakingRef.current &&
        !isMutedRef.current &&
        !isManuallyPausedRef.current
      ) {
        setTimeout(() => {
          if (
            callStateRef.current === 'active' &&
            !isSpeakingRef.current &&
            !isMutedRef.current &&
            !isManuallyPausedRef.current
          ) {
            startListening();
          }
        }, 250);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        isManuallyPausedRef.current = true;
        showToast('Microphone access blocked. Please allow mic in browser settings.', 'error');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        showToast(`Speech notice: ${event.error}`, 'warning');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Manual toggle for Microphone (allows user to pause/resume hands-free mode)
  const toggleMicrophone = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !recognitionRef.current) {
      showToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      isManuallyPausedRef.current = true;
      stopListening();
      showToast('Microphone paused.', 'info');
    } else {
      isManuallyPausedRef.current = false;
      isSpeakingRef.current = false;
      startListening();
      showToast('Listening... Speak now!', 'info');
    }
  };

  // 4. Forward Call to AI Assistant (Auto-starts Hands-Free Mode upon Greeting completion)
  const handleForwardToAI = async () => {
    if (!activeCallId) return;
    try {
      await forwardCallToAgent(activeCallId);
      setCallState('active');
      callStateRef.current = 'active';
      isManuallyPausedRef.current = false;
      setAiState('Listening');
      showToast('Call connected. Continuous hands-free voice mode active.', 'info');

      // AI greeting turn (When greeting finishes, utterance.onend auto-starts the microphone)
      const greeting = `Hello! This is CallMateAI, assistant for counselor ${currentStudent?.counselor_name || 'Dr. Lakshmi Prasad'}. I have ${currentStudent?.name}'s records open. How can I assist you?`;
      setDisplayedTranscript([{ sender: 'AI', text: greeting }]);
      speakText(greeting);
    } catch (err) {
      showToast(`Forwarding failed: ${err.message}`, 'error');
    }
  };

  // 5. Send message through live FastAPI AI / Emergency pipeline
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || customMessage;
    if (!text || !activeCallId) return;

    // Add parent message to transcript
    setDisplayedTranscript((prev) => [...prev, { sender: 'Caller', text }]);
    setCustomMessage('');
    setAiState('Listening');

    try {
      const response = await sendCallMessage(activeCallId, text);

      // Add AI reply to transcript
      setDisplayedTranscript((prev) => [...prev, { sender: 'AI', text: response.reply }]);
      setAiState('Speaking');
      speakText(response.reply);

      // Check for Dual Escalation
      if (response.emergency_flag || response.status === 'handover requested') {
        setIsEmergency(true);
        setAiState('Handover');
        showToast('🚨 EMERGENCY DETECTED: Counselor handover triggered!', 'error');
      } else if (response.reply && (response.reply.includes('notified') || response.reply.includes('presence'))) {
        setAlertNote('📋 Note sent to counselor: Live classroom presence check.');
        showToast('Live inquiry logged for counselor.', 'info');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // 6. Accept counselor handover
  const handleAcceptHandover = async () => {
    if (!activeCallId) return;
    try {
      await requestHandover(activeCallId, 'Counselor took over the emergency call');
      setIsEmergency(false);
      setAiState('Speaking');
      showToast('Counselor connected to parent.', 'success');
      const handoverMsg = 'Counselor Dr. Lakshmi has connected to the line.';
      setDisplayedTranscript((prev) => [
        ...prev,
        { sender: 'AI', text: `✅ ${handoverMsg}` }
      ]);
      speakText(handoverMsg);
    } catch (err) {
      showToast(`Handover failed: ${err.message}`, 'error');
    }
  };

  // 7. End Call
  const handleEndCall = async () => {
    callStateRef.current = 'ended';
    isSpeakingRef.current = false;
    isManuallyPausedRef.current = false;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    if (activeCallId) {
      try {
        await completeCall(activeCallId);
      } catch (err) {
        console.warn('Call complete error:', err);
      }
    }

    // Determine AI Risk Classification (High, Medium, Low)
    let riskLevel = 'Low';
    const attendanceNum = parseFloat(currentStudent?.attendance_pct || currentStudent?.attendance || '85');
    if (
      isEmergency ||
      attendanceNum < 75 ||
      (currentStudent?.current_status && currentStudent.current_status.toLowerCase().includes('risk'))
    ) {
      riskLevel = 'High';
    } else if (attendanceNum < 85) {
      riskLevel = 'Medium';
    } else {
      const hasEmergencyOrConcern = displayedTranscript.some((turn) =>
        /urgent|emergency|accident|hospital|danger|failing|risk|warning|distress/i.test(turn.text)
      );
      if (hasEmergencyOrConcern) {
        riskLevel = 'Medium';
      }
    }

    // In-place Contact Update: Update lastCalled to "Just now", increment totalCalls, set priority without duplicate cards
    if (currentStudent) {
      recordCallCompletionForContact({
        studentId: currentStudent.student_id || currentStudent.id,
        phone: currentStudent.parentPhone,
        riskLevel
      });
    }

    setCallState('ended');
    showToast(`Call ended. AI risk classified as ${riskLevel}. Contact updated in directory.`, 'success');
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
              Connected to MongoDB Atlas ({students.length} Students)
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Simulate incoming calls from verified student records, test live AI reasoning, and evaluate emergency handovers.
          </p>
        </div>

        {callState === 'idle' && (
          <button
            onClick={handleSimulateIncoming}
            disabled={loadingStudents}
            className="gradient-btn-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <PhoneIncoming className="w-4 h-4" />
            <span>Simulate Incoming Call</span>
          </button>
        )}
      </div>

      {/* Emergency Flash Banner */}
      {isEmergency && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <div>
              <div className="font-bold text-sm">🚨 URGENT EMERGENCY DETECTED!</div>
              <div className="text-xs text-rose-300">
                Parent reported emergency for {currentStudent?.name}. AI dialogue paused.
              </div>
            </div>
          </div>
          <button
            onClick={handleAcceptHandover}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg"
          >
            Accept Handover
          </button>
        </div>
      )}

      {/* Classroom Presence Alert Banner */}
      {alertNote && (
        <div className="p-3.5 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{alertNote}</span>
          </div>
          <button
            onClick={() => setAlertNote('')}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Call Stage / Phone Interface */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden min-h-[440px] flex flex-col justify-between">
            {/* Top Status */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Connection: {callState.toUpperCase()} {activeCallId && `(#${activeCallId})`}
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
                    Click "Simulate Incoming Call" to randomly trigger an incoming parent call from your 250 MongoDB student records.
                  </p>
                  <button
                    onClick={handleSimulateIncoming}
                    disabled={loadingStudents}
                    className="gradient-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mt-2 inline-flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Trigger Verified Student Call</span>
                  </button>
                </div>
              )}

              {/* INCOMING STATE */}
              {callState === 'incoming' && currentStudent && (
                <div className="space-y-6 max-w-md w-full animate-bounce-gentle">
                  <div className="relative mx-auto w-24 h-24 rounded-full bg-indigo-500/20 border-4 border-cyan-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                    {currentStudent.name ? currentStudent.name.charAt(0) : 'S'}
                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center border-2 border-slate-950 animate-ping" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white">{currentStudent.parentName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {currentStudent.relationship} of {currentStudent.name} ({currentStudent.section})
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono">{currentStudent.parentPhone}</p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Attendance: {currentStudent.attendance_pct} · Status: {currentStudent.current_status}
                    </span>
                  </div>

                  {/* Incoming Call Action Trio */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                      onClick={handleEndCall}
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
                      <span className="text-[11px] font-bold">Forward to AI Agent</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE STATE */}
              {callState === 'active' && currentStudent && (
                <div className="space-y-6 w-full max-w-md">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-xl font-bold text-white">
                      {currentStudent.name ? currentStudent.name.charAt(0) : 'S'}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">{currentStudent.parentName}</h3>
                      <p className="text-xs text-slate-400">Student: {currentStudent.name} ({currentStudent.student_code})</p>
                      <span className="inline-block text-[11px] font-bold text-cyan-400 mt-1">
                        AI Assistant: {aiState}
                      </span>
                    </div>
                  </div>

                  {/* In-Call Controls */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3.5 rounded-2xl border transition-all ${isMuted
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                        }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className={`p-3.5 rounded-2xl border transition-all ${!isSpeakerOn
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                        }`}
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
              {callState === 'ended' && (
                <div className="space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Call Completed</h3>
                  <p className="text-xs text-slate-400">Call session #{activeCallId} archived in MongoDB Atlas.</p>
                  <button
                    onClick={() => {
                      setCallState('idle');
                      callStateRef.current = 'idle';
                      isSpeakingRef.current = false;
                      isManuallyPausedRef.current = false;
                      setActiveCallId(null);
                      setCurrentStudent(null);
                      stopListening();
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
              ⚠️ Connected to live FastAPI Backend (port 8000) & MongoDB Atlas.
            </div>
          </div>
        </div>

        {/* Right Side: Live Audio Transcript Stream & Quick Prompts */}
        <div className="lg:col-span-5 space-y-4">
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
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {displayedTranscript.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    No active call transcript. Trigger a simulated call to inspect real-time speech turns.
                  </div>
                ) : (
                  displayedTranscript.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs animate-slide-in ${turn.sender === 'AI'
                        ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 ml-4'
                        : 'bg-slate-900 border border-white/10 text-slate-200 mr-4'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[10px] uppercase text-cyan-400 font-mono">
                          {turn.sender === 'AI' ? '🤖 CallMateAI' : `👤 ${currentStudent?.parentName || 'Parent'}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Just now</span>
                      </div>
                      <p className="leading-relaxed">{turn.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Test Prompt Buttons during active call */}
            {callState === 'active' && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold">Test Scenarios with Live AI:</div>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    onClick={() => handleSendMessage(`What is ${currentStudent?.name}'s current attendance?`)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left text-xs text-slate-300 border border-white/5 transition-all"
                  >
                    📊 Check Attendance (Grounded Query)
                  </button>

                  <button
                    onClick={() => handleSendMessage(`Is ${currentStudent?.name} sitting in 1st period class right now?`)}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-left text-xs text-blue-300 border border-blue-500/20 transition-all"
                  >
                    📋 Live Classroom Check (AI Boundary / Blue Note)
                  </button>

                  <button
                    onClick={() => handleSendMessage(`My child had an accident and is injured!`)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-left text-xs text-rose-300 border border-rose-500/20 transition-all"
                  >
                    🚨 Emergency: Accident / Injured (Red Flash Alert)
                  </button>
                </div>

                {/* Custom message input with voice-to-voice microphone */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      isListening
                        ? "🎙️ Hands-free listening... Speak naturally"
                        : aiState === 'Speaking'
                        ? "🔊 CallMateAI speaking..."
                        : "Type parental message (optional)..."
                    }
                    className={`flex-1 bg-slate-900 border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all ${
                      isListening
                        ? 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] placeholder-rose-300'
                        : 'border-white/10 focus:border-cyan-400 placeholder-slate-500'
                    }`}
                  />

                  {/* Microphone STT Button */}
                  <button
                    type="button"
                    onClick={toggleMicrophone}
                    title={isListening ? "Listening... Click to stop" : "Speak into microphone"}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.8)] border border-rose-400'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'text-white animate-bounce' : 'text-cyan-400'}`} />
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
