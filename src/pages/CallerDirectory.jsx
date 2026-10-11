import React, { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  Plus,
  PhoneCall,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Star,
  CheckCircle2
} from 'lucide-react';

export default function CallerDirectory() {
  const { showToast } = useAuth();
  const [callers, setCallers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeCaller, setActiveCaller] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New caller form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('Family & VIP');
  const [newPriority, setNewPriority] = useState('High');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    const list = getStorageItem(KEYS.CALLERS, []);
    setCallers(list);
  }, []);

  const filteredCallers = callers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.priority === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCaller = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast('Please enter both name and phone number.', 'warning');
      return;
    }

    const newContact = {
      id: `clr-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      category: newCategory,
      priority: newPriority,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      notes: newNotes.trim() || 'Custom added contact.',
      lastCalled: 'Never',
      totalCalls: 0
    };

    const updated = [newContact, ...callers];
    setCallers(updated);
    setStorageItem(KEYS.CALLERS, updated);
    setAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewNotes('');
    showToast(`Added ${newContact.name} to Caller Directory!`, 'success');
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
              {filteredCallers.length} Contacts
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage caller profiles, priority VIP tags, and tailored assistant directives.
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

      {/* Callers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCallers.map((caller) => (
          <div
            key={caller.id}
            onClick={() => setActiveCaller(caller)}
            className="glass-card p-5 rounded-2xl border border-white/5 hover:border-cyan-500/40 cursor-pointer flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={caller.avatar}
                    alt={caller.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-cyan-400 transition-colors shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {caller.name}
                    </h3>
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

      {/* Add Caller Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Caller"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCaller} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +1 (555) 321-7890"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="form-input"
              >
                <option value="Family & VIP">Family & VIP</option>
                <option value="VIP Client">VIP Client</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Business">Business</option>
                <option value="Service / Courier">Service / Courier</option>
              </select>
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
              Assistant Directives / Notes
            </label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="How should CallMateAI handle this caller?"
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
