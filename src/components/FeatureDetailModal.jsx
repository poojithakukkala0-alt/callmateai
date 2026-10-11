import React, { useEffect } from 'react';
import { X, ArrowLeft, CheckCircle2, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function FeatureDetailModal({ feature, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && feature) {
        onClose();
      }
    };
    if (feature) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [feature, onClose]);

  if (!feature) return null;

  const Icon = feature.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl glass-panel border border-indigo-500/30 p-6 sm:p-8 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] z-10 animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Features</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Hero Banner */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} border border-white/10 flex items-center justify-center shrink-0 shadow-lg`}>
            <Icon className={`w-7 h-7 ${feature.iconColor}`} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              CallMateAI Feature Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              {feature.title}
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>

        {/* How It Works & Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* How It Works */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Activity className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {feature.howItWorks}
            </p>
          </div>

          {/* Benefits */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Key Benefits</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {feature.benefits.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Realistic CallMateAI Example */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 mb-6">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>CallMateAI In Action</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-white/5">
            "{feature.example}"
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="gradient-btn-primary px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            Close & Return
          </button>
        </div>
      </div>
    </div>
  );
}
