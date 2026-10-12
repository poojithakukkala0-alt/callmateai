import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = 'text-cyan-400',
  iconBg = 'bg-cyan-500/10',
  borderColor = 'hover:border-cyan-500/40',
  onExplore
}) {
  return (
    <div
      onClick={onExplore}
      className={`group relative p-6 rounded-2xl glass-card border border-white/5 ${borderColor} flex flex-col justify-between h-full transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] cursor-pointer`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExplore && onExplore();
        }
      }}
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 group-hover:via-cyan-400/50 to-transparent transition-all" />

      <div>
        {/* Icon pill */}
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
          {description}
        </p>
      </div>

      {/* Interactive explore action */}
      <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 group-hover:text-slate-400 transition-colors">AI Powered</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExplore && onExplore();
          }}
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-all"
        >
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
