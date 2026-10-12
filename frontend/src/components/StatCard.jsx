import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'cyan',
  badgeText = null
}) {
  const variantStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)]',
      valueColor: 'text-cyan-400'
    },
    red: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.2)]',
      valueColor: 'text-rose-400'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
      valueColor: 'text-amber-400'
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]',
      valueColor: 'text-indigo-400'
    }
  };

  const style = variantStyles[variant] || variantStyles.cyan;

  return (
    <div
      className={`glass-card p-5 rounded-2xl border ${style.border} ${style.glow} flex flex-col justify-between transition-all duration-300 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${style.iconBg} border flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {title}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {value}
              </span>
            </div>
          </div>
        </div>

        {badgeText && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            {badgeText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-2 pt-2 border-t border-white/5">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-emerald-400">{subtext}</span>
      </div>
    </div>
  );
}
