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
  CheckCircle2,
  Play,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export default function CallCenter() {
  const { user, showToast } = useAuth();

  // Active logged-in counselor ID (defaults to 1 if not set)
  const activeCounselorId = Number(user?.counselor_id || user?.counselorId || 1);

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
  const [aiState, setAiState] = useState('Idle'); // 'Listening', 'Speaking', 'Idle', 'Handover', 'Offline (Human Takeover)'
  const [customMessage, setCustomMessage] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [hasHandoverOccurred, setHasHandoverOccurred] = useState(false);
  const [isCounselorActive, setIsCounselorActive] = useState(false);
  const [alertNote, setAlertNote] = useState('');

  // Microphone Speech-to-Text State & Hands-Free Coordination Refs
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const handleSendMessageRef = useRef(null);
  const callStateRef = useRef(callState);
  const isMutedRef = useRef(isMuted);
  const isSpeakingRef = useRef(false);
  const isManuallyPausedRef = useRef(false);
  const isCounselorActiveRef = useRef(false);

  // Keep state refs synchronized
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isCounselorActiveRef.current = isCounselorActive;
  }, [isCounselorActive]);

  // 1. Fetch live students from MongoDB Atlas (dynamically scoped to logged-in counselor)
  useEffect(() => {
    setLoadingStudents(true);
    fetchStudents()
      .then((data) => {
        const allStudents = Array.isArray(data) ? data : [];
        const myStudents = allStudents.filter(
          (student) => Number(student.counselor_id || student.counselorId) === activeCounselorId
        );
        setStudents(myStudents);
        setLoadingStudents(false);
      })
      .catch((err) => {
        console.error('Failed to fetch students:', err);
        setLoadingStudents(false);
      });
  }, [activeCounselorId]);

  // 2. Timer during active call (including counselor takeover phase)
  useEffect(() => {
    let timer = null;
    if (callState === 'active' || callState === 'counselor_connected') {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // 3. Simulate Incoming Call from a real MongoDB student record for this counselor
  const handleSimulateIncoming = async () => {
    if (students.length === 0) {
      showToast('Loading students from MongoDB Atlas, please wait...', 'warning');
      return;
    }

    // Pick a random student from this counselor's 50 records
    const student = students[Math.floor(Math.random() * students.length)];
    const parent = student.parents?.[0] || { name: 'Parent', phone: '+91 9800000000' };

    try {
      const callData = await createCall(student.student_id, student.counselor_id || activeCounselorId);
      setActiveCallId(callData.call_id);
      setCurrentStudent({
        ...student,
        parentName: parent.name,
        parentPhone: parent.phone,
        relationship: parent.relationship || 'Parent',
        section: student.section || user?.section || 'CSE - Section A'
      });
      setCallDuration(0);
      setDisplayedTranscript([]);
      setIsEmergency(false);
      setHasHandoverOccurred(false);
      setAlertNote('');
      setCallState('incoming');
      showToast(`Incoming call from ${parent.name} (${student.name}'s parent)`, 'info');
    } catch (err) {
      showToast(`Backend connection failed: ${err.message}`, 'error');
    }
  };

  // Helper to start recognition safely in hands-free mode
  const startListening = () => {
    const isCallActive =
      callStateRef.current === 'active' || callStateRef.current === 'counselor_connected';
    if (
      !recognitionRef.current ||
      isMutedRef.current ||
      !isCallActive ||
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

    // Mute/pause mic while voice prepares and speaks
    isSpeakingRef.current = true;
    stopListening();

    const cleanSpokenText = text
      .replace(/[*_#`~]/g, '')
      .replace(/🚨|📋|✅|🤖|👤|👩‍🏫|🟢/g, '')
      .replace(/\[EMERGENCY_DETECTED\]/g, '')
      .replace(/\[LIVE_INQUIRY_LOGGED\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utterance.rate = 0.88; // Natural, relaxed pace at 0.88x speed
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (isCounselorActiveRef.current || callStateRef.current === 'counselor_connected') {
        setAiState('Offline (Human Takeover)');
      } else {
        setAiState('Speaking');
      }
      isSpeakingRef.current = true;
      stopListening();
    };

    utterance.onend = () => {
      if (isCounselorActiveRef.current || callStateRef.current === 'counselor_connected') {
        setAiState('Offline (Human Takeover)');
      } else {
        setAiState('Listening');
      }
      isSpeakingRef.current = false;
      // When voice finishes, automatically start listening for parent's response
      if (
        (callStateRef.current === 'active' || callStateRef.current === 'counselor_connected') &&
        !isMutedRef.current &&
        !isManuallyPausedRef.current
      ) {
        startListening();
      }
    };

    utterance.onerror = () => {
      if (isCounselorActiveRef.current || callStateRef.current === 'counselor_connected') {
        setAiState('Offline (Human Takeover)');
      } else {
        setAiState('Listening');
      }
      isSpeakingRef.current = false;
      if (
        (callStateRef.current === 'active' || callStateRef.current === 'counselor_connected') &&
        !isMutedRef.current &&
        !isManuallyPausedRef.current
      ) {
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
    } else if (
      (callStateRef.current === 'active' || callStateRef.current === 'counselor_connected') &&
      !isSpeakingRef.current &&
      !isManuallyPausedRef.current
    ) {
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
        // Immediately pause listening so audio playback doesn't trigger feedback
        isSpeakingRef.current = true;
        stopListening();
        if (handleSendMessageRef.current) {
          handleSendMessageRef.current(spokenText);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Continuous Hands-Free: Auto-restart listening if call is active, speech is quiet, and not manually paused
      if (
        (callStateRef.current === 'active' || callStateRef.current === 'counselor_connected') &&
        !isSpeakingRef.current &&
        !isMutedRef.current &&
        !isManuallyPausedRef.current
      ) {
        setTimeout(() => {
          if (
            (callStateRef.current === 'active' || callStateRef.current === 'counselor_connected') &&
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
      const counselorDisplayName = user?.name || currentStudent?.counselor_name || 'Dr. Lakshmi Prasad';
      const greeting = `Hello! This is CallMateAI, assistant for counselor ${counselorDisplayName}. I have ${currentStudent?.name}'s records open. How can I assist you?`;
      setDisplayedTranscript([{ sender: 'AI', text: greeting }]);
      speakText(greeting);
    } catch (err) {
      showToast(`Forwarding failed: ${err.message}`, 'error');
    }
  };

  // Dispatch live classroom presence boundary inquiry alert (Medium Priority)
  const dispatchPresenceAlert = (student) => {
    if (!student) return;
    const counselorIdForAlert = Number(user?.counselor_id || user?.counselorId || student.counselor_id || 1);

    // Alert object conforming to exact specification
    const alertObject = {
      id: `alt-presence-${Date.now()}`,
      title: `Classroom Presence Check: ${student.name}`,
      student_name: student.name,
      section: student.section || user?.section || 'CSE - Section A',
      caller: student.parentName || 'Parent',
      callerName: student.parentName || 'Parent',
      phone: student.parentPhone || '+91 9800000000',
      callerPhone: student.parentPhone || '+91 9800000000',
      priority: 'medium',
      severity: 'Medium',
      status: 'open',
      timestamp: 'Just now',
      note: 'Parent requested live visual classroom presence confirmation.',
      description: 'Parent requested live visual classroom presence confirmation.',
      category: 'Classroom Inquiry',
      counselorId: counselorIdForAlert,
      counselor_id: counselorIdForAlert,
      acknowledged: false,
      isResolved: false
    };

    try {
      const stored = getStorageItem('callmate_alerts_pool', null) || getStorageItem(KEYS.ALERTS, []);
      const pool = Array.isArray(stored) ? stored : [];
      const updated = [alertObject, ...pool.filter((a) => !(a.student_name === student.name && a.status === 'open'))];
      setStorageItem(KEYS.ALERTS, updated);
      setStorageItem('callmate_alerts', updated);
      localStorage.setItem('callmate_alerts_pool', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed saving classroom presence alert:', err);
    }

    setAlertNote(`📋 Note sent to counselor: Live visual classroom presence check for ${student.name}.`);
    showToast(`Live inquiry logged: Classroom Presence Check for ${student.name} (Medium Priority)`, 'info');
  };

  // 5. Send message through live FastAPI AI / Emergency pipeline or Counselor Direct Line
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || customMessage;
    if (!text || !activeCallId) return;

    // Add parent message to transcript
    setDisplayedTranscript((prev) => [...prev, { sender: 'Caller', text }]);
    setCustomMessage('');

    // TWO-WAY CONVERSATION ENGINE (HUMAN COUNSELOR DIRECT LINE)
    const isCounselorSession =
      isCounselorActive ||
      isCounselorActiveRef.current ||
      callState === 'counselor_connected' ||
      callStateRef.current === 'counselor_connected' ||
      hasHandoverOccurred ||
      aiState === 'Offline (Human Takeover)';

    if (isCounselorSession) {
      // FRONTEND STATE LOCK: Ensure counselor mode remains firmly active until handleEndCall
      setIsCounselorActive(true);
      isCounselorActiveRef.current = true;
      setAiState('Offline (Human Takeover)');

      const studentName = currentStudent?.name || 'the student';
      const parentName = currentStudent?.parentName || 'Parent';
      const cleanLower = text.toLowerCase().trim();

      // Check if user mentions leave/absence ("cannot attend for 10 days", "leave for 10 days", "not coming for 10 days", etc.)
      const isLeaveMention =
        /cannot attend for 10 days|leave for 10 days|not coming for 10 days|absent for 10 days/i.test(cleanLower) ||
        (/10\s*days|ten\s*days|10-day/i.test(cleanLower) && (/attend|leave|absence|hospital|accident|classes/i.test(cleanLower))) ||
        (/cannot attend|leave|absence|not coming/i.test(cleanLower) && /10/i.test(cleanLower));

      // Check if user says simple conversational check-ins ("hello", "what", "can you hear me", etc.)
      const isCheckIn =
        /^(hello|hi|hey|what|can you hear me|are you there|hello\?|can you hear me\?)\s*$/i.test(cleanLower) ||
        /can you hear me|are you there/i.test(cleanLower);

      let counselorDirectReply = null;
      if (isLeaveMention) {
        const recoveryTarget = /she|her|daughter/i.test(cleanLower) ? 'her' : `${studentName}'s`;
        counselorDirectReply = `Please do not worry about attendance. I am officially granting a 10-day medical leave of absence right now. Please focus entirely on ${recoveryTarget} recovery.`;
      } else if (isCheckIn) {
        counselorDirectReply = `Yes Mr./Mrs. ${parentName}, I am right here on the line. Please go ahead.`;
      }

      if (counselorDirectReply) {
        setDisplayedTranscript((prev) => [
          ...prev,
          { sender: 'Counselor', text: counselorDirectReply }
        ]);
        speakText(counselorDirectReply);

        // Notify backend with [COUNSELOR_DIRECT] prefix to archive turn in call session
        sendCallMessage(activeCallId, `[COUNSELOR_DIRECT] ${text}`).catch((e) =>
          console.warn('Backend call logging note:', e)
        );
        return;
      }

      // Query dynamic backend with [COUNSELOR_DIRECT] prefix
      const counselorPayload = `[COUNSELOR_DIRECT] ${text}`;
      try {
        const response = await sendCallMessage(activeCallId, counselorPayload);
        const replyText =
          response?.reply ||
          `I understand your concern for ${studentName}. I have made a direct note and am taking care of this personally.`;

        setDisplayedTranscript((prev) => [
          ...prev,
          { sender: 'Counselor', text: replyText }
        ]);
        speakText(replyText);
      } catch (err) {
        console.error('Counselor mode backend response notice:', err);
        const fallbackReply = `I understand your concern for ${studentName}. I am handling this situation personally.`;
        setDisplayedTranscript((prev) => [
          ...prev,
          { sender: 'Counselor', text: fallbackReply }
        ]);
        speakText(fallbackReply);
      }
      return;
    }

    setAiState('Listening');

    // Check if parent asks an in-class presence boundary inquiry (e.g. "Is my child in class right now?", "1st period check")
    const isPresenceInquiry =
      /in class right now|1st period|first period|period check|presence|sitting in.*class|classroom right now/i.test(text);

    if (isPresenceInquiry && currentStudent) {
      dispatchPresenceAlert(currentStudent);
    }

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
      } else if (
        !isPresenceInquiry &&
        currentStudent &&
        response.reply &&
        (response.reply.includes('notified') || response.reply.includes('presence') || response.reply.includes('classroom'))
      ) {
        dispatchPresenceAlert(currentStudent);
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // 6. Accept counselor handover - Transition to active Two-Way Counselor-Parent Dialogue
  const handleAcceptHandover = async () => {
    if (!activeCallId) return;
    try {
      // Cancel any pending AI dialogue and set AI state to 'Offline (Human Takeover)'
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopListening();
      isSpeakingRef.current = false;

      await requestHandover(activeCallId, 'Counselor took over the emergency call');
      setHasHandoverOccurred(true);
      setIsEmergency(false);
      setIsCounselorActive(true);
      isCounselorActiveRef.current = true;
      setCallState('counselor_connected');
      callStateRef.current = 'counselor_connected';
      setAiState('Offline (Human Takeover)');

      showToast('Counselor connected: Live Counselor-Parent dialogue initiated.', 'success');

      const counselorGreeting = `Hello Mr./Mrs. ${currentStudent?.parentName || 'Parent'}, this is ${user?.name || 'Dr. Lakshmi Prasad'}. I received the urgent emergency alert regarding ${currentStudent?.name}. Please tell me what happened.`;

      // Append an official counselor entry to displayedTranscript
      setDisplayedTranscript((prev) => [
        ...prev,
        { sender: 'Counselor', text: counselorGreeting }
      ]);

      // Browser TTS voices greeting at 0.88x speed, auto-opening microphone on onend
      speakText(counselorGreeting);
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

    // Determine session outcome tag matching specification:
    // - If emergency takeover occurred -> tag: 'handover'
    // - If AI handled without handover -> tag: 'ai_handled'
    // - Default status -> tag: 'completed'
    let outcomeTag = 'completed';
    if (isCounselorActiveRef.current || hasHandoverOccurred || isEmergency) {
      outcomeTag = 'handover';
    } else if (displayedTranscript.length > 1) {
      outcomeTag = 'ai_handled';
    }

    const durationStr = formatTimer(callDuration);
    const counselorIdForCall = Number(user?.counselor_id || user?.counselorId || currentStudent?.counselor_id || 1);

    let summaryText = `Call completed with ${currentStudent?.parentName || 'parent'} regarding ${currentStudent?.name || 'student'}.`;
    if (outcomeTag === 'handover') {
      summaryText = isCounselorActiveRef.current
        ? `Emergency takeover resolved via live counselor dialogue between ${user?.name || 'Counselor'} and ${currentStudent?.parentName || 'parent'} regarding ${currentStudent?.name || 'student'}. Immediate assistance coordinated.`
        : `Emergency takeover occurred during inquiry for ${currentStudent?.name}; counselor handled call.`;
    } else if (outcomeTag === 'ai_handled') {
      summaryText = `AI assistant autonomously handled parent inquiry for ${currentStudent?.name} (${currentStudent?.section || 'General'}).`;
    }

    // Create call record per specification:
    // id, callerName (parent name), callerPhone, studentName, studentCode, timestamp ('Just now'),
    // duration, outcome ('Completed'), summary, transcript, and 'tag' matching session outcome
    const callRecord = {
      id: `call-${activeCallId || Date.now()}`,
      callerName: currentStudent?.parentName || 'Parent',
      callerPhone: currentStudent?.parentPhone || '+91 9800000000',
      studentName: currentStudent?.name || 'Student',
      studentCode: currentStudent?.student_code || `STU-${currentStudent?.student_id || currentStudent?.id || 101}`,
      counselorId: counselorIdForCall,
      counselor_id: counselorIdForCall,
      timestamp: 'Just now',
      duration: durationStr,
      outcome: 'Completed',
      displayOutcome: outcomeTag === 'handover' ? 'Handover' : outcomeTag === 'ai_handled' ? 'AI Handled' : 'Completed',
      status: outcomeTag === 'handover' ? 'Important' : 'General',
      summary: summaryText,
      transcript: displayedTranscript.length > 0 ? displayedTranscript : [
        { sender: 'AI', text: 'Call session initiated.' },
        { sender: 'Caller', text: 'Call session concluded.' }
      ],
      tag: outcomeTag,
      avatar: currentStudent?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentStudent?.parentName || 'Parent')}`
    };

    // Save this record to the top of the call history list (in state / storage key `callmate_calls`)
    try {
      const stored = localStorage.getItem('callmate_calls');
      const existingCalls = stored ? JSON.parse(stored) : getStorageItem(KEYS.CALLS, []);
      const cleanExisting = Array.isArray(existingCalls)
        ? existingCalls.filter((c) => {
            const name = (c.callerName || '').toLowerCase();
            return !name.includes('mom (sarah)') && !name.includes('amit kumar') && c.id !== 'call-101' && c.id !== 'call-104';
          })
        : [];
      const updatedCalls = [callRecord, ...cleanExisting];
      localStorage.setItem('callmate_calls', JSON.stringify(updatedCalls));
      setStorageItem(KEYS.CALLS, updatedCalls);
    } catch (err) {
      console.error('Failed saving call to callmate_calls:', err);
    }

    // Determine AI Risk Classification (High, Medium, Low) for contact directory
    let riskLevel = 'Low';
    const attendanceNum = parseFloat(currentStudent?.attendance_pct || currentStudent?.attendance || '85');
    if (
      isCounselorActiveRef.current ||
      isEmergency ||
      hasHandoverOccurred ||
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

    if (currentStudent) {
      recordCallCompletionForContact({
        studentId: currentStudent.student_id || currentStudent.id,
        phone: currentStudent.parentPhone,
        riskLevel
      });
    }

    setIsCounselorActive(false);
    isCounselorActiveRef.current = false;
    setCallState('ended');
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Call Center Simulator
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
              {user?.name || 'Dr. Lakshmi Prasad'} ({user?.section || 'CSE - Section A'}) · {students.length} Students
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

      {/* Dedicated Counselor-Parent Line Live Connection Badge */}
      {isCounselorActive && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className="font-bold text-sm text-white tracking-wide">
                🟢 Counselor Connected: {user?.name || 'Dr. Lakshmi Prasad'} &lt;-&gt; Parent Direct Line
              </div>
              <div className="text-xs text-emerald-300">
                AI assistant offline. Two-way continuous voice dialogue with {currentStudent?.parentName || 'Parent'} active.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              HUMAN VOICE LINE
            </span>
            <button
              onClick={handleEndCall}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Emergency Call</span>
            </button>
          </div>
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
                Connection: {isCounselorActive ? 'COUNSELOR DIRECT LINE' : callState.toUpperCase()} {activeCallId && `(#${activeCallId})`}
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

              {/* ACTIVE OR COUNSELOR CONNECTED STATE */}
              {(callState === 'active' || callState === 'counselor_connected') && currentStudent && (
                <div className="space-y-6 w-full max-w-md">
                  <div className="flex items-center justify-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-bold text-white transition-all ${
                        isCounselorActive
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                          : 'bg-cyan-500/20 border-cyan-400'
                      }`}
                    >
                      {currentStudent.name ? currentStudent.name.charAt(0) : 'S'}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">{currentStudent.parentName}</h3>
                      <p className="text-xs text-slate-400">Student: {currentStudent.name} ({currentStudent.student_code})</p>
                      {isCounselorActive ? (
                        <span className="inline-block text-[11px] font-bold text-emerald-400 mt-1">
                          👩‍🏫 Counselor Direct: {user?.name || 'Dr. Lakshmi Prasad'}
                        </span>
                      ) : (
                        <span className="inline-block text-[11px] font-bold text-cyan-400 mt-1">
                          AI Assistant: {aiState}
                        </span>
                      )}
                    </div>
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
                    >
                      {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={handleEndCall}
                      className={`px-6 py-3.5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                        isCounselorActive
                          ? 'bg-rose-600 hover:bg-rose-500 border border-rose-400 shadow-[0_0_25px_rgba(225,29,72,0.6)]'
                          : 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.5)]'
                      }`}
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>{isCounselorActive ? 'End Emergency Call' : 'End Call'}</span>
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
                      setIsCounselorActive(false);
                      isCounselorActiveRef.current = false;
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
                    {isCounselorActive ? 'Counselor-Parent Dialogue' : 'Live AI Transcript'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {(callState === 'active' || callState === 'counselor_connected')
                    ? isCounselorActive
                      ? 'COUNSELOR LINE'
                      : 'STREAMING'
                    : 'READY'}
                </span>
              </div>

              {/* Dialogue Bubble List */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {displayedTranscript.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    No active call transcript. Trigger a simulated call to inspect real-time speech turns.
                  </div>
                ) : (
                  displayedTranscript.map((turn, idx) => {
                    if (turn.sender === 'Counselor') {
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl text-xs animate-slide-in bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 text-emerald-100 ml-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[10px] uppercase text-emerald-400 font-mono flex items-center gap-1.5">
                              <span>👩‍🏫</span>
                              <span>Counselor ({user?.name || 'Dr. Lakshmi Prasad'})</span>
                            </span>
                            <span className="text-[10px] text-emerald-500/80 font-mono">Live Counselor Line</span>
                          </div>
                          <p className="leading-relaxed text-slate-100 font-medium">{turn.text}</p>
                        </div>
                      );
                    }

                    if (turn.sender === 'AI') {
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl text-xs animate-slide-in bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 ml-4"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[10px] uppercase text-cyan-400 font-mono flex items-center gap-1.5">
                              <span>🤖</span>
                              <span>CallMateAI</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Just now</span>
                          </div>
                          <p className="leading-relaxed">{turn.text}</p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl text-xs animate-slide-in bg-slate-900 border border-white/10 text-slate-200 mr-4"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[10px] uppercase text-slate-300 font-mono flex items-center gap-1.5">
                            <span>👤</span>
                            <span>{currentStudent?.parentName || 'Parent'}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Just now</span>
                        </div>
                        <p className="leading-relaxed">{turn.text}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Test Prompt Buttons during active call or counselor connected */}
            {(callState === 'active' || callState === 'counselor_connected') && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                {isCounselorActive ? (
                  <>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Counselor-Parent Dialogue Scenarios:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        onClick={() =>
                          handleSendMessage(`she got an accident outside the college and cannot attend the classes for the next 10 days`)
                        }
                        className="p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-left text-xs text-amber-200 border border-amber-500/30 transition-all"
                      >
                        🚑 10-Day Leave: "she got an accident outside the college and cannot attend the classes for the next 10 days"
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(`Can you hear me?`)
                        }
                        className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-left text-xs text-emerald-200 border border-emerald-500/30 transition-all"
                      >
                        👋 Check-in: "Can you hear me?"
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(`My child had an accident on campus in the college ground and is injured!`)
                        }
                        className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-left text-xs text-rose-200 border border-rose-500/30 transition-all"
                      >
                        🚨 On-Campus: "My child had an accident on campus in the college ground and is injured!"
                      </button>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                {/* Custom message input with voice-to-voice microphone */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      isListening
                        ? isCounselorActive
                          ? "🎙️ Counselor-Parent line listening... Speak naturally"
                          : "🎙️ Hands-free listening... Speak naturally"
                        : isCounselorActive
                        ? `Speak or type to Counselor ${user?.name || 'Dr. Lakshmi Prasad'}...`
                        : aiState === 'Speaking'
                        ? "🔊 CallMateAI speaking..."
                        : "Type parental message (optional)..."
                    }
                    className={`flex-1 bg-slate-900 border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all ${
                      isListening
                        ? isCounselorActive
                          ? 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] placeholder-emerald-300'
                          : 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] placeholder-rose-300'
                        : isCounselorActive
                        ? 'border-emerald-500/40 focus:border-emerald-400 placeholder-slate-400'
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
                        ? isCounselorActive
                          ? 'bg-emerald-600 text-white animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)] border border-emerald-400'
                          : 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.8)] border border-rose-400'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Mic
                      className={`w-4 h-4 ${
                        isListening
                          ? 'text-white animate-bounce'
                          : isCounselorActive
                          ? 'text-emerald-400'
                          : 'text-cyan-400'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    className={`px-3.5 py-1.5 text-white rounded-xl text-xs font-bold transition-all ${
                      isCounselorActive
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-cyan-600 hover:bg-cyan-500'
                    }`}
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
