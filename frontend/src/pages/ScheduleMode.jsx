import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStorageItem, setStorageItem } from '../utils/storage';
import Modal from '../components/Modal';
import {
  Clock,
  BookOpen,
  PhoneForwarded,
  CheckCircle2,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Shield
} from 'lucide-react';

const INITIAL_TEACHING_HOURS = [
  {
    id: 'tch-1',
    day: 'Monday',
    time: '09:00 AM – 10:30 AM',
    subject: 'Data Structures & Algorithms',
    section: 'CSE - Section A',
    room: 'Hall 201',
    autoForward: true
  },
  {
    id: 'tch-2',
    day: 'Monday',
    time: '01:30 PM – 03:00 PM',
    subject: 'Discrete Mathematics',
    section: 'CSE - Section A',
    room: 'Hall 203',
    autoForward: true
  },
  {
    id: 'tch-3',
    day: 'Tuesday',
    time: '10:00 AM – 11:30 AM',
    subject: 'Database Management Systems',
    section: 'CSE - Section A',
    room: 'Lab 4',
    autoForward: true
  },
  {
    id: 'tch-4',
    day: 'Wednesday',
    time: '09:00 AM – 10:30 AM',
    subject: 'Object Oriented Programming',
    section: 'CSE - Section A',
    room: 'Hall 201',
    autoForward: true
  },
  {
    id: 'tch-5',
    day: 'Thursday',
    time: '11:00 AM – 12:30 PM',
    subject: 'Computer Networks',
    section: 'CSE - Section A',
    room: 'Hall 105',
    autoForward: true
  },
  {
    id: 'tch-6',
    day: 'Friday',
    time: '02:00 PM – 03:30 PM',
    subject: 'Operating Systems & System Architecture',
    section: 'CSE - Section A',
    room: 'Hall 302',
    autoForward: true
  }
];

const INITIAL_OFFICE_HOURS = [
  {
    id: 'off-1',
    day: 'Monday',
    time: '03:30 PM – 05:00 PM',
    location: 'Cabin 304, Academic Block 2',
    status: 'Open for Walk-ins',
    slots: '4 / 4 Available'
  },
  {
    id: 'off-2',
    day: 'Wednesday',
    time: '03:30 PM – 05:00 PM',
    location: 'Cabin 304, Academic Block 2',
    status: 'Open for Walk-ins',
    slots: '3 / 4 Available'
  },
  {
    id: 'off-3',
    day: 'Friday',
    time: '03:30 PM – 05:00 PM',
    location: 'Cabin 304, Academic Block 2',
    status: 'Open for Walk-ins',
    slots: '2 / 4 Available'
  }
];

const INITIAL_CALLBACK_SLOTS = [
  {
    id: 'cb-1',
    parentName: 'Ramesh Sundaram (Father)',
    studentName: 'Aarav Sundaram',
    section: 'CSE - Section A',
    phone: '+91 98401 23456',
    requestedSlot: 'Today, 04:00 PM',
    topic: 'Mid-semester test performance & counseling guidance',
    urgency: 'Medium',
    status: 'Confirmed'
  },
  {
    id: 'cb-2',
    parentName: 'Meenakshi Iyer (Mother)',
    studentName: 'Diya Iyer',
    section: 'CSE - Section A',
    phone: '+91 98202 34567',
    requestedSlot: 'Tomorrow, 03:30 PM',
    topic: 'Attendance review (currently at 72% attendance threshold)',
    urgency: 'High',
    status: 'Confirmed'
  },
  {
    id: 'cb-3',
    parentName: 'Karthik Narayanan (Father)',
    studentName: 'Varun Narayanan',
    section: 'CSE - Section A',
    phone: '+91 97111 88990',
    requestedSlot: 'Wednesday, 04:15 PM',
    topic: 'Career mentorship & elective track selections',
    urgency: 'Low',
    status: 'Pending'
  }
];

export default function ScheduleMode() {
  const { showToast } = useAuth();

  // Schedule States with Local Storage Persistence
  const [teachingHours, setTeachingHours] = useState(() =>
    getStorageItem('callmate_v1_teaching_hours', INITIAL_TEACHING_HOURS)
  );
  const [officeHours, setOfficeHours] = useState(() =>
    getStorageItem('callmate_v1_office_hours', INITIAL_OFFICE_HOURS)
  );
  const [callbackSlots, setCallbackSlots] = useState(() =>
    getStorageItem('callmate_v1_callback_slots', INITIAL_CALLBACK_SLOTS)
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState('teaching'); // 'teaching', 'office', 'callbacks'

  // Modals
  const [isTeachingModalOpen, setIsTeachingModalOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  // Form State: Add Teaching Hour
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('09:00 AM – 10:30 AM');
  const [newSubject, setNewSubject] = useState('');
  const [newRoom, setNewRoom] = useState('Hall 201');

  // Form State: Add Callback Slot
  const [cbParentName, setCbParentName] = useState('');
  const [cbStudentName, setCbStudentName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbSlotTime, setCbSlotTime] = useState('Today, 04:30 PM');
  const [cbTopic, setCbTopic] = useState('');
  const [cbUrgency, setCbUrgency] = useState('Medium');

  // Save changes to localStorage
  useEffect(() => {
    setStorageItem('callmate_v1_teaching_hours', teachingHours);
  }, [teachingHours]);

  useEffect(() => {
    setStorageItem('callmate_v1_office_hours', officeHours);
  }, [officeHours]);

  useEffect(() => {
    setStorageItem('callmate_v1_callback_slots', callbackSlots);
  }, [callbackSlots]);

  // Toggle Auto-Forward for a specific lecture slot
  const handleToggleAutoForward = (id) => {
    setTeachingHours((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          const nextState = !slot.autoForward;
          showToast(
            `${slot.subject}: AI auto-forwarding ${nextState ? 'ENABLED' : 'PAUSED'}.`,
            nextState ? 'success' : 'info'
          );
          return { ...slot, autoForward: nextState };
        }
        return slot;
      })
    );
  };

  // Add Teaching Slot
  const handleAddTeachingSlot = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      showToast('Please enter the Subject / Course title.', 'warning');
      return;
    }

    const newSlot = {
      id: `tch-${Date.now()}`,
      day: newDay,
      time: newTime,
      subject: newSubject.trim(),
      section: 'CSE - Section A',
      room: newRoom.trim() || 'Hall 201',
      autoForward: true
    };

    setTeachingHours((prev) => [...prev, newSlot]);
    setIsTeachingModalOpen(false);
    setNewSubject('');
    showToast(`Added teaching block: ${newSlot.subject} (${newSlot.day})`, 'success');
  };

  // Delete Teaching Slot
  const handleDeleteTeachingSlot = (id) => {
    setTeachingHours((prev) => prev.filter((slot) => slot.id !== id));
    showToast('Teaching lecture slot removed.', 'info');
  };

  // Add Callback Slot
  const handleAddCallbackSlot = (e) => {
    e.preventDefault();
    if (!cbParentName.trim() || !cbStudentName.trim() || !cbPhone.trim()) {
      showToast('Please enter parent name, student name, and phone number.', 'warning');
      return;
    }

    const newCallback = {
      id: `cb-${Date.now()}`,
      parentName: cbParentName.trim(),
      studentName: cbStudentName.trim(),
      section: 'CSE - Section A',
      phone: cbPhone.trim(),
      requestedSlot: cbSlotTime.trim() || 'Today, 04:30 PM',
      topic: cbTopic.trim() || 'General counseling review',
      urgency: cbUrgency,
      status: 'Confirmed'
    };

    setCallbackSlots((prev) => [newCallback, ...prev]);
    setIsCallbackModalOpen(false);
    setCbParentName('');
    setCbStudentName('');
    setCbPhone('');
    setCbTopic('');
    showToast(`Callback appointment booked for ${newCallback.parentName}.`, 'success');
  };

  // Complete Callback Slot
  const handleCompleteCallback = (id) => {
    setCallbackSlots((prev) =>
      prev.map((cb) => (cb.id === id ? { ...cb, status: 'Completed' } : cb))
    );
    showToast('Callback appointment marked as completed.', 'success');
  };

  // Delete Callback Slot
  const handleDeleteCallback = (id) => {
    setCallbackSlots((prev) => prev.filter((cb) => cb.id !== id));
    showToast('Callback appointment slot dismissed.', 'info');
  };

  const activeForwardingCount = teachingHours.filter((s) => s.autoForward).length;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Schedule Mode & Forwarding
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-wider">
              CSE - Section A
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure teaching class hours for autonomous AI forwarding, set office hours, and review parent callback appointments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Auto-Forwarding: Active ({activeForwardingCount} Lecture Blocks)</span>
          </div>
        </div>
      </div>

      {/* Operational Highlights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Teaching Hours
            </span>
            <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-full">
              {teachingHours.length} Slots
            </span>
          </div>
          <p className="text-xl font-extrabold text-white">Lecture Time-Locks</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            During registered classes, incoming calls route instantly to CallMateAI without disturbing the lecture.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Weekly Office Hours
            </span>
            <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-full">
              {officeHours.length} Days / Wk
            </span>
          </div>
          <p className="text-xl font-extrabold text-white">Walk-in Availability</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Designated counselor consultation windows when parents can connect directly or walk in to Cabin 304.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneForwarded className="w-4 h-4" />
              Parent Callback Queue
            </span>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              {callbackSlots.filter((c) => c.status !== 'Completed').length} Pending
            </span>
          </div>
          <p className="text-xl font-extrabold text-white">Callback Appointments</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated callback reservations generated by CallMateAI when parents request direct counselor follow-ups.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('teaching')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'teaching'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Teaching Class Hours ({teachingHours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('office')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'office'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Weekly Office Hours ({officeHours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('callbacks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'callbacks'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <PhoneForwarded className="w-3.5 h-3.5" />
            <span>Parent Callback Slots ({callbackSlots.length})</span>
          </button>
        </div>

        {activeTab === 'teaching' && (
          <button
            onClick={() => setIsTeachingModalOpen(true)}
            className="gradient-btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class Slot</span>
          </button>
        )}

        {activeTab === 'callbacks' && (
          <button
            onClick={() => setIsCallbackModalOpen(true)}
            className="gradient-btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Callback</span>
          </button>
        )}
      </div>

      {/* TAB 1: TEACHING CLASS HOURS */}
      {activeTab === 'teaching' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Automated Teaching Rule:</strong> When active, CallMateAI answers on behalf of Dr. Lakshmi Prasad, answers parental queries using verified student attendance & grades, and offers a callback if needed.
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">
              Auto-Routing Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachingHours.map((slot) => (
              <div
                key={slot.id}
                className={`p-5 rounded-2xl border transition-all glass-card flex flex-col justify-between ${
                  slot.autoForward
                    ? 'border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                    : 'border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
                        {slot.day} · {slot.room}
                      </span>
                      <h3 className="text-sm font-bold text-white">{slot.subject}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{slot.time}</p>
                    </div>

                    <button
                      onClick={() => handleToggleAutoForward(slot.id)}
                      title={slot.autoForward ? 'Disable auto-forward' : 'Enable auto-forward'}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {slot.autoForward ? (
                        <ToggleRight className="w-7 h-7 text-cyan-400 fill-cyan-400/20" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-500" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Class Section:</span>
                      <span className="font-semibold text-white">{slot.section}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CallMateAI Interception:</span>
                      <span
                        className={`font-semibold ${
                          slot.autoForward ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {slot.autoForward ? 'Active (Auto-Forwarding)' : 'Paused (Direct Ring)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Counselor: Dr. Lakshmi Prasad
                  </span>
                  <button
                    onClick={() => handleDeleteTeachingSlot(slot.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Remove slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY OFFICE HOURS */}
      {activeTab === 'office' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>
                Parents can schedule walk-in visits or direct phone calls during these dedicated office hours.
              </span>
            </div>
            <span className="text-xs text-cyan-400 font-bold">Location: Academic Block 2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {officeHours.map((slot) => (
              <div
                key={slot.id}
                className="glass-card p-5 rounded-2xl border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white font-display">{slot.day}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {slot.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
                    <span>Timing:</span>
                    <span className="text-cyan-400 font-mono font-medium">{slot.time}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
                    <span>Location:</span>
                    <span className="text-white">{slot.location}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Capacity:</span>
                    <span className="text-emerald-400 font-medium">{slot.slots}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">Direct Bridge: Counselor 1</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PARENT CALLBACK QUEUE */}
      {activeTab === 'callbacks' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneForwarded className="w-4 h-4 text-amber-400" />
              <span>
                Parent follow-up appointments generated automatically by CallMateAI during lecture auto-forwarding sessions.
              </span>
            </div>
            <span className="text-xs font-bold text-amber-300">
              {callbackSlots.filter((c) => c.status !== 'Completed').length} Pending Calls
            </span>
          </div>

          <div className="space-y-3">
            {callbackSlots.length === 0 ? (
              <div className="p-12 text-center rounded-2xl glass-panel border border-white/5 text-slate-400 text-sm">
                No callback appointments queued at this time.
              </div>
            ) : (
              callbackSlots.map((cb) => (
                <div
                  key={cb.id}
                  className={`p-4 rounded-2xl border transition-all glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    cb.status === 'Completed'
                      ? 'border-white/5 opacity-50 bg-white/5'
                      : cb.urgency === 'High'
                      ? 'border-rose-500/30 bg-rose-950/20'
                      : 'border-white/10 bg-slate-900/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-bold text-white">{cb.parentName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cb.urgency === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : cb.urgency === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {cb.urgency} Priority
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cb.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {cb.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Student: <strong className="text-white">{cb.studentName}</strong> ({cb.section}) · Phone: <span className="font-mono text-cyan-400">{cb.phone}</span>
                    </p>
                    <p className="text-xs text-slate-300 italic pt-1">
                      "{cb.topic}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Requested Window:</span>
                      <span className="text-xs font-bold text-cyan-300 font-mono">
                        {cb.requestedSlot}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {cb.status !== 'Completed' ? (
                        <button
                          onClick={() => handleCompleteCallback(cb.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteCallback(cb.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete callback record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Teaching Slot Modal */}
      <Modal
        isOpen={isTeachingModalOpen}
        onClose={() => setIsTeachingModalOpen(false)}
        title="Add Teaching Class Hour"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddTeachingSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Weekday
            </label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="form-input"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Lecture Time Window
            </label>
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="e.g. 09:30 AM – 11:00 AM"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Course / Subject Title
            </label>
            <input
              type="text"
              required
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Artificial Intelligence & Algorithms"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Classroom / Hall
              </label>
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="e.g. Hall 201"
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Section
              </label>
              <input
                type="text"
                readOnly
                value="CSE - Section A"
                className="form-input opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTeachingModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold gradient-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gradient-btn-primary px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Save Class Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Callback Modal */}
      <Modal
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
        title="Schedule Parent Callback"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCallbackSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Parent Name
            </label>
            <input
              type="text"
              required
              value={cbParentName}
              onChange={(e) => setCbParentName(e.target.value)}
              placeholder="e.g. Smt. Radhika Krishnan"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Student Name
              </label>
              <input
                type="text"
                required
                value={cbStudentName}
                onChange={(e) => setCbStudentName(e.target.value)}
                placeholder="e.g. Siddharth K"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={cbPhone}
                onChange={(e) => setCbPhone(e.target.value)}
                placeholder="e.g. +91 98000 12345"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Scheduled Slot
              </label>
              <input
                type="text"
                value={cbSlotTime}
                onChange={(e) => setCbSlotTime(e.target.value)}
                placeholder="e.g. Today, 04:30 PM"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Urgency
              </label>
              <select
                value={cbUrgency}
                onChange={(e) => setCbUrgency(e.target.value)}
                className="form-input"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Reason / Topic
            </label>
            <textarea
              rows={2}
              value={cbTopic}
              onChange={(e) => setCbTopic(e.target.value)}
              placeholder="e.g. Inquired about low attendance during 3rd period lecture..."
              className="form-input resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCallbackModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold gradient-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gradient-btn-primary px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Book Callback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
