import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PhoneIncoming, Activity, Sparkles, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

const STORY_STEPS = [
  {
    step: 1,
    title: '1. Incoming Call Detected',
    subtitle: 'Mom is calling (+1 555-234-8901)',
    description: 'CallMateAI detects the incoming carrier signal and intercepts without disrupting your focus.',
    icon: PhoneIncoming,
    color: 'from-blue-500 to-cyan-400',
    badge: 'Carrier Signal Active',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  {
    step: 2,
    title: '2. Robot Listening & Analyzing',
    subtitle: 'Voice stream transcribed in real-time',
    description: 'The AI assistant answers in natural audio, processing tone, context, and caller urgency instantly.',
    icon: Activity,
    color: 'from-indigo-500 to-purple-400',
    badge: 'Neural Analysis',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  {
    step: 3,
    title: '3. Caller Information Retrieved',
    subtitle: 'Family & VIP profile synced',
    description: 'CallMateAI correlates caller history, calendar commitments, and relationship preferences.',
    icon: UserCheck,
    color: 'from-cyan-500 to-emerald-400',
    badge: 'Profile Matched',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    step: 4,
    title: '4. Priority Classification',
    subtitle: 'Urgency: High (Dinner confirmation)',
    description: 'Intent is analyzed. Routine queries are resolved automatically while high-value calls are highlighted.',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-400',
    badge: 'High Priority Alert',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  {
    step: 5,
    title: '5. Intelligent Handover or Summary',
    subtitle: 'Seamless connection to your screen',
    description: 'If you want to take over, one click bridges the call; otherwise, a smart concise recap is delivered.',
    icon: ShieldAlert,
    color: 'from-purple-500 to-pink-500',
    badge: 'Handover Ready',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  }
];

export default function ScrollStory() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  return (
    <section ref={containerRef} className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Journey</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          From Incoming Ring to <span className="gradient-text-vivid">Flawless Handover</span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg">
          Watch how CallMateAI intelligently intercepts, understands, and prioritizes calls in milliseconds.
        </p>
      </div>

      {/* Step Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
        {STORY_STEPS.map((s, idx) => (
          <button
            key={s.step}
            onClick={() => setActiveStep(idx)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeStep === idx
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/20'
                : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeStep === idx ? 'bg-white text-indigo-950 font-bold' : 'bg-slate-800 text-slate-400'
            }`}>
              {s.step}
            </span>
            <span className="hidden md:inline">{s.title.split('. ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Story Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${STORY_STEPS[activeStep].color}`} />
            
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STORY_STEPS[activeStep].badgeColor}`}>
                {STORY_STEPS[activeStep].badge}
              </span>
              <span className="text-xs text-slate-500 font-mono">Step {activeStep + 1} of 5</span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {STORY_STEPS[activeStep].title}
            </h3>

            <p className="text-cyan-400 text-sm font-medium mb-4">
              {STORY_STEPS[activeStep].subtitle}
            </p>

            <p className="text-slate-300 text-base leading-relaxed mb-6">
              {STORY_STEPS[activeStep].description}
            </p>

            {/* Step navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                &larr; Previous
              </button>
              <button
                disabled={activeStep === STORY_STEPS.length - 1}
                onClick={() => setActiveStep((prev) => Math.min(STORY_STEPS.length - 1, prev + 1))}
                className="gradient-btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Simulation Canvas */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative min-h-[420px] flex flex-col justify-between overflow-hidden">
            
            {/* Background glowing particles and network lines */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900/60 pointer-events-none" />
            
            {/* Top Stage Bar */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Live Simulation Engine
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i <= activeStep ? 'bg-cyan-400 scale-110 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic Center Simulation Element */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center">
              {activeStep === 0 && (
                <div className="flex flex-col items-center animate-bounce-gentle">
                  <div className="relative w-28 h-28 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.6)]">
                    <PhoneIncoming className="w-12 h-12 text-blue-400 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">
                      1
                    </span>
                  </div>
                  <div className="mt-6 text-center">
                    <h4 className="text-xl font-bold text-white">Incoming Call from Mom</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">+1 (555) 234-8901 • Carrier: Verizon</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold animate-pulse">
                      Ringing... Auto-intercept in 0.8s
                    </span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="w-full max-w-md space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                        Speech-to-Intent Pipeline
                      </span>
                      <span className="font-mono text-cyan-400">Latency: 14ms</span>
                    </div>
                    {/* Pulsing Waveform */}
                    <div className="h-14 flex items-center justify-center gap-1.5 bg-slate-950/80 rounded-xl px-4">
                      {[12, 28, 42, 16, 34, 48, 22, 38, 52, 18, 30, 44, 26, 36, 14].map((h, i) => (
                        <span
                          key={i}
                          className="wave-bar"
                          style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic text-center">
                      "Hi sweetheart, it's Mom! Just checking on Friday dinner..."
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-xl flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
                    alt="Mom"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Mom (Sarah)</h4>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Family VIP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Total calls: 14 • Preferred: Evening</p>
                    <div className="mt-2 text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                      📅 Calendar Match: Open slot Friday 7:00 PM
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-bold text-amber-300">Priority Engine Decision</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                      Score: 94 / 100
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span>Caller Category:</span>
                      <span className="text-white font-medium">Immediate Family (High)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span>Sentiment:</span>
                      <span className="text-emerald-400 font-medium">Positive & Warm</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Suggested Action:</span>
                      <span className="text-cyan-400 font-medium">Confirm & Notify User</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.3)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Resolution Completed</h4>
                      <p className="text-xs text-purple-300">Action items summarized & logged</p>
                    </div>
                  </div>
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 mb-4 font-mono">
                    ✅ Friday dinner reminder created for 7:00 PM<br/>
                    ✅ Confirmation SMS draft prepared<br/>
                    ✅ Logged to Call History with high priority
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-xs font-bold text-slate-300 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      View Summary
                    </button>
                    <button className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:opacity-90 transition-opacity">
                      Open Call Center
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stepper progress indicators */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-medium pt-4 border-t border-white/5">
              <span>Interactive Story Visualizer</span>
              <span className="text-cyan-400">Click steps above to explore flow</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
