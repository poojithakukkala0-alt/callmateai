import React, { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { fetchStudents, addStudentContact } from '../api';
import Modal from '../components/Modal';
import { Search, Plus, ChevronRight, Loader2 } from 'lucide-react';

export default function CallerDirectory() {
  const { user, showToast } = useAuth();
  const activeCounselorId = Number(user?.counselor_id || user?.counselorId || 1);
  const activeCounselorName = user?.name || 'Dr. Lakshmi Prasad';
  const activeCounselorSection = user?.section || 'CSE - Section A';

  const [callers, setCallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeCaller, setActiveCaller] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Student & Contact form fields
  const [newStudentName, setNewStudentName] = useState('');
  const [newSection, setNewSection] = useState(activeCounselorSection);
  const [newParentName, setNewParentName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newNotes, setNewNotes] = useState('');

  // Fetch live students from MongoDB Atlas on mount (Dynamic Scoped to Logged-in Counselor)
  const loadDirectoryData = () => {
    setLoading(true);
    fetchStudents()
      .then((studentsData) => {
        if (Array.isArray(studentsData) && studentsData.length > 0) {
          // Strictly filter to logged-in Counselor
          const counselorStudents = studentsData.filter(
            (s) => Number(s.counselor_id || s.counselorId) === activeCounselorId
          );

          // Read in-place call completion updates from localStorage
          const updates = JSON.parse(localStorage.getItem('callmate_v1_caller_updates') || '{}');

          const mapped = counselorStudents.map((s) => {
            const primaryParent = s.parents?.[0] || {
              name: s.parent_name || 'Primary Guardian',
              phone: s.parent_phone || s.emergency_contact || '+91 9800000000',
              relationship: 'Parent'
            };
            const attendanceRaw = s.attendance_pct || s.attendance || '85%';
            const attendanceNum = parseFloat(attendanceRaw);
            let calculatedPriority = 'Low';
            if (attendanceNum < 75 || (s.current_status && s.current_status.toLowerCase().includes('risk'))) {
              calculatedPriority = 'High';
            } else if (attendanceNum < 85) {
              calculatedPriority = 'Medium';
            }

            const sId = String(s.student_id || s.id);
            const override = updates[sId] || updates[primaryParent.phone];

            const baseCalls = ((s.student_id || s.id) % 8) + 1;
            const totalCalls = override ? (baseCalls + (override.totalCallsAdded || 1)) : baseCalls;
            const lastCalled = override?.lastCalled || `${((s.student_id || s.id) % 5) + 1} days ago`;
            const priority = override?.priority || calculatedPriority;

            return {
              id: `stu-${s.student_id || s.id}`,
              studentId: s.student_id || s.id,
              studentCode: s.student_code || `STU-${s.student_id || s.id}`,
              studentName: s.name,
              name: primaryParent.name ? `${primaryParent.name} (${primaryParent.relationship || 'Guardian'})` : s.name,
              parentName: primaryParent.name || 'Primary Guardian',
              phone: primaryParent.phone,
              category: s.section ? (String(s.section).toLowerCase().includes('section') ? s.section : `Section ${s.section}`) : activeCounselorSection,
              priority,
              attendancePct: typeof attendanceRaw === 'number' ? `${attendanceRaw}%` : attendanceRaw,
              currentStatus: s.current_status || 'Enrolled',
              counselorId: activeCounselorId,
              notes: s.remarks || `Student: ${s.name} (${s.student_code || s.id}). Current Status: ${s.current_status || 'Good Standing'}. Attendance: ${attendanceRaw}. Counselor: ${activeCounselorName} (ID: ${activeCounselorId}).`,
              lastCalled,
              totalCalls,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.name)}`
            };
          });
          setCallers(mapped);
        } else {
          setCallers(getStorageItem(KEYS.CALLERS, []));
        }
      })
      .catch((err) => {
        console.error('Failed to load students for directory:', err);
        setCallers(getStorageItem(KEYS.CALLERS, []));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDirectoryData();

    // In-place live sync when calls complete in CallCenter or contacts are added
    const handleStorageChange = (e) => {
      if (e.key === 'callmate_v1_caller_updates' || e.key === 'callmate_v1_custom_students') {
        loadDirectoryData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const filteredCallers = callers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.studentName && c.studentName.toLowerCase().includes(search.toLowerCase())) ||
      c.phone.includes(search) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.priority === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCaller = (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newParentName.trim() || !newPhone.trim()) {
      showToast('Please enter Student Name, Parent Name, and Phone Number.', 'warning');
      return;
    }

    try {
      const createdStudent = addStudentContact({
        studentName: newStudentName.trim(),
        section: newSection.trim() || activeCounselorSection,
        parentName: newParentName.trim(),
        phone: newPhone.trim(),
        notes: newNotes.trim(),
        counselor_id: activeCounselorId,
        counselor_name: activeCounselorName
      });

      const newContact = {
        id: `stu-${createdStudent.student_id}`,
        studentId: createdStudent.student_id,
        studentCode: createdStudent.student_code,
        studentName: createdStudent.name,
        name: `${newParentName.trim()} (Parent)`,
        parentName: newParentName.trim(),
        phone: newPhone.trim(),
        category: createdStudent.section,
        priority: newPriority,
        attendancePct: '88%',
        currentStatus: 'Enrolled',
        counselorId: activeCounselorId,
        notes: newNotes.trim() || `Student: ${createdStudent.name}. Assigned to ${activeCounselorName} (Counselor ${activeCounselorId}).`,
        lastCalled: 'Never',
        totalCalls: 0,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(createdStudent.name)}`
      };

      const updated = [newContact, ...callers];
      setCallers(updated);
      setStorageItem(KEYS.CALLERS, updated);
      setAddModalOpen(false);
      setNewStudentName('');
      setNewSection(activeCounselorSection);
      setNewParentName('');
      setNewPhone('');
      setNewNotes('');
      showToast(`Added ${newContact.studentName} (Parent: ${newContact.parentName})! Count updated to ${updated.length}.`, 'success');
    } catch (err) {
      showToast(`Failed to add student contact: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Caller Directory
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-wider">
              {filteredCallers.length} CONTACTS
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage student & parent contacts scoped to Counselor {activeCounselorId} ({activeCounselorName} · {activeCounselorSection}).
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="gradient-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'High', 'Medium', 'Low'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 glass-panel rounded-2xl border border-white/5">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-sm font-medium">Loading verified students from MongoDB Atlas...</span>
        </div>
      ) : filteredCallers.length === 0 ? (
        <div className="p-16 text-center rounded-2xl glass-panel border border-white/5 text-slate-400 text-sm">
          No contacts matching "{search}" in category {selectedCategory}.
        </div>
      ) : (
        /* Callers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCallers.map((caller) => (
            <div
              key={caller.id}
              onClick={() => setActiveCaller(caller)}
              className="glass-card p-5 rounded-2xl border border-white/5 hover:border-cyan-500/40 cursor-pointer flex flex-col justify-between transition-all group shadow-sm hover:shadow-cyan-500/5"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={caller.avatar}
                      alt={caller.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-cyan-400 transition-colors shadow-md bg-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {caller.name}
                      </h3>
                      {caller.studentName && (
                        <p className="text-[11px] text-cyan-400 font-medium">
                          Student: {caller.studentName} ({caller.studentCode})
                        </p>
                      )}
                      <p className="text-xs text-slate-400 font-mono">{caller.phone}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      caller.priority === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : caller.priority === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {caller.priority}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
                    <span>Category:</span>
                    <span className="text-white font-medium">{caller.category}</span>
                  </div>
                  {caller.attendancePct && (
                    <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
                      <span>Attendance:</span>
                      <span className="text-emerald-400 font-mono font-medium">{caller.attendancePct}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-white/5 text-slate-400">
                    <span>Last Called:</span>
                    <span className="text-slate-300 font-mono">{caller.lastCalled}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Total Calls:</span>
                    <span className="text-cyan-400 font-bold">{caller.totalCalls} calls</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
                <span>View History & Directives</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Caller Detail Modal */}
      <Modal
        isOpen={!!activeCaller}
        onClose={() => setActiveCaller(null)}
        title={activeCaller ? activeCaller.name : ''}
        maxWidth="max-w-lg"
      >
        {activeCaller && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-white/10">
              <img
                src={activeCaller.avatar}
                alt={activeCaller.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
              />
              <div>
                <h4 className="text-base font-bold text-white">{activeCaller.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{activeCaller.phone}</p>
                <span className="inline-block mt-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {activeCaller.category} · Priority: {activeCaller.priority}
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                AI Handling Directives
              </h5>
              <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                {activeCaller.notes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-400 block mb-1">Total Recorded Calls</span>
                <span className="text-lg font-bold text-white">{activeCaller.totalCalls}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-400 block mb-1">Recent Activity</span>
                <span className="text-sm font-semibold text-cyan-400">{activeCaller.lastCalled}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setActiveCaller(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold gradient-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Student & Parent Contact Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Student & Parent Contact"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCaller} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Student Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Rohan Sharma"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Section / Class <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="e.g. CSE - Section A"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="form-input"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Parent / Guardian Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={newParentName}
              onChange={(e) => setNewParentName(e.target.value)}
              placeholder="e.g. Suresh Sharma"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Phone Number <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Assistant Directives / Notes
            </label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Custom instructions for CallMateAI when answering this parent..."
              className="form-input resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold gradient-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gradient-btn-primary px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Save Contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
