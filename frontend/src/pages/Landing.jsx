import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Robot3D from '../components/Robot3D';
import FeatureCard from '../components/FeatureCard';
import FeatureDetailModal from '../components/FeatureDetailModal';
import ScrollStory from '../components/ScrollStory';
import {
  PhoneCall,
  Sparkles,
  PhoneIncoming,
  Activity,
  UserCheck,
  BellRing,
  Users2,
  Clock,
  ArrowRight,
  Play,
  CheckCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Calendar,
  User,
  ShieldAlert,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';

// Comprehensive Data for All 6 Features
const FEATURES_DATA = [
  {
    id: 'handling',
    title: 'AI Call Handling',
    icon: PhoneCall,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    borderColor: 'hover:border-indigo-500/50',
    description: 'Answers routine calls and understands intent with polite intelligence.',
    howItWorks: 'Real-time speech-to-intent analysis evaluates voice input in milliseconds, verifying caller identity and answering standard questions without human intervention.',
    benefits: [
      '24/7 polite answering with natural conversational voice',
      'Instant resolution for common repetitive queries',
      'Filters robocalls, telemarketers, and spam automatically',
      'Zero hold times for callers'
    ],
    example: 'A parent calls asking about tomorrow\'s exam schedule; CallMateAI instantly references the authorized school database and provides the exact classroom and time.'
  },
  {
    id: 'prioritization',
    title: 'Smart Prioritization',
    icon: Sparkles,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    borderColor: 'hover:border-cyan-500/50',
    description: 'Identifies important calls automatically so you never miss urgent needs.',
    howItWorks: 'A multi-factor priority algorithm scores incoming conversations based on relationship tiers, emotional distress markers, and urgent keywords like "health", "urgent", or "deadline".',
    benefits: [
      'Critical family and VIP calls are immediately flagged',
      'Automatic urgency score ranking (1-100)',
      'Prevents emergency calls from getting lost in voicemail',
      'Peace of mind while focusing on your work'
    ],
    example: 'An urgent inquiry mentioning a sudden clinic visit receives an immediate 94/100 priority score and triggers high-urgency notifications.'
  },
  {
    id: 'information',
    title: 'Caller Information',
    icon: UserCheck,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    borderColor: 'hover:border-emerald-500/50',
    description: 'Shows relevant caller details, past history, and relationship context instantly.',
    howItWorks: 'Matches the caller ID with your secure contact records to display relationship tags, past conversation recaps, and special handling instructions before you even pick up.',
    benefits: [
      'Instant context without having to search notes',
      'Remembers past conversation agreements and preferences',
      'Categorizes by VIP, Family, Healthcare, or Business',
      'Synchronizes with personal calendars seamlessly'
    ],
    example: 'When Sarah (Mom) calls, CallMateAI retrieves her Family VIP badge, recalls her preferred evening check-in time, and prepares calendar sync.'
  },
  {
    id: 'alerts',
    title: 'Important Call Alerts',
    icon: BellRing,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    borderColor: 'hover:border-rose-500/50',
    description: 'Notifies you about urgent family or VIP matters without distraction.',
    howItWorks: 'Broadcasts instant visual banners, audible chime alerts, and structured push summaries only when high-priority thresholds are breached.',
    benefits: [
      'Only interrupts you when it genuinely matters',
      'Clear, actionable bullet-point summary on your screen',
      'One-tap acknowledgement and escalation options',
      'Reduces alert fatigue from unimportant notifications'
    ],
    example: 'A delivery rider waiting at the front gate or an unexpected meeting reschedule generates an instant desktop toast with one-touch response actions.'
  },
  {
    id: 'handover',
    title: 'Human Handover',
    icon: Users2,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    borderColor: 'hover:border-amber-500/50',
    description: 'Connects important calls directly to you or your designated delegate.',
    howItWorks: 'When a situation exceeds automated parameters or requires human empathy, CallMateAI places the caller on courteous hold and bridges your phone line or counselor workstation.',
    benefits: [
      'Caller never needs to repeat their story',
      'Transfers complete live transcript directly to you',
      'Smooth, professional escalation without abrupt disconnects',
      'Supports counselor and department routing'
    ],
    example: 'A parent expressing deep emotional distress regarding their student is smoothly bridged to Dr. Priya Sharma with the full conversation history ready on screen.'
  },
  {
    id: 'history',
    title: 'Call History',
    icon: Clock,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    borderColor: 'hover:border-purple-500/50',
    description: 'Keep track of all your conversations with crystal-clear searchable summaries.',
    howItWorks: 'Every conversation is logged with duration, timestamp, outcome tags, key takeaways, and complete verbatim speaker transcripts for future review.',
    benefits: [
      'Instant search by caller name, date, or keyword',
      'Verbatim dialogue transcript archives',
      'Track outcomes: Completed, AI Handled, or Handover',
      'Exportable records for audit and compliance'
    ],
    example: 'Quickly search "dental appointment" to verify the exact rescheduled time and read the verbatim conversation between the AI assistant and the receptionist.'
  }
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleExploreDashboard = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors duration-300">
      
      {/* Background Cosmic Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[700px] h-[700px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[800px] h-[800px] rounded-full bg-cyan-600/10 blur-[180px]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        
        {/* ========================================================================= */}
        {/* HERO SECTION                                                              */}
        {/* ========================================================================= */}
        <section id="hero" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Copy, Action Buttons */}
            <div className="lg:col-span-6 space-y-7 text-left">
              
              {/* Ready Indicator Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Assistant Ready · Demo</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-display">
                Every Call Matters.<br />
                <span className="gradient-text-vivid">Every Connection Counts.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Your intelligent AI call assistant that helps you manage calls, prioritize what matters, and stay connected to the people who matter most.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleExploreDashboard}
                  className="gradient-btn-primary flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-[0_8px_30px_rgba(99,102,241,0.45)] group"
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="gradient-btn-secondary flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold text-slate-200 hover:text-white"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                  </div>
                  <span>See How It Works</span>
                </button>
              </div>
            </div>

            {/* Right Column: 3D Robot Mascot & Floating Holographic Cards */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[480px]">
              
              {/* Genuine 3D Robot Canvas (Exact preserved 3D mascot) */}
              <div className="relative w-full h-[480px] sm:h-[540px]">
                <Robot3D pose="hero" interactive={true} />
              </div>

              {/* Holographic Element 1: Incoming Call Mom Card */}
              <div className="absolute top-6 left-2 sm:left-6 p-3.5 rounded-2xl glass-panel border border-cyan-400/40 shadow-[0_0_25px_rgba(56,189,248,0.3)] animate-float flex items-center gap-3 backdrop-blur-xl z-20 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
                  <PhoneIncoming className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">Incoming Call</span>
                  <span className="text-sm font-bold text-white block">Mom</span>
                </div>
              </div>

              {/* Holographic Element 2: Speech Bubble */}
              <div className="absolute top-12 right-2 sm:right-6 p-4 rounded-2xl holo-bubble border border-indigo-400/40 shadow-[0_0_30px_rgba(168,85,247,0.35)] animate-float max-w-[210px] z-20 pointer-events-none" style={{ animationDelay: '1.5s' }}>
                <p className="text-xs font-bold text-white leading-snug">
                  Hi!<br />
                  I'm <span className="text-cyan-400">CallMateAI</span><br />
                  Your personal call assistant 💙
                </p>
              </div>

              {/* Holographic Element 3: Listening Sound Waveform */}
              <div className="absolute bottom-28 right-4 sm:right-10 p-3 rounded-2xl glass-panel border border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.25)] flex items-center gap-3 z-20 pointer-events-none animate-float" style={{ animationDelay: '2.5s' }}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    Listening
                  </span>
                  <span className="text-[9px] text-slate-400">Analyzing voice...</span>
                </div>
                <div className="flex items-center gap-1 h-7 px-1">
                  {[10, 22, 14, 26, 18, 24, 12].map((h, i) => (
                    <span
                      key={i}
                      className="wave-bar"
                      style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Holographic Element 4: Floating Mini Badges */}
              <div className="absolute bottom-16 left-6 p-2 rounded-xl glass-panel border border-white/10 text-cyan-400 shadow-lg animate-float" style={{ animationDelay: '3s' }}>
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="absolute bottom-6 right-28 p-2 rounded-xl glass-panel border border-white/10 text-cyan-400 shadow-lg animate-float" style={{ animationDelay: '0.8s' }}>
                <PhoneCall className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURE CARDS — SIX COMPACT CARDS WITH WORKING EXPLORE BUTTONS            */}
        {/* ========================================================================= */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Engineered for Effortless Call Management
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Click Explore on any card to inspect full feature mechanics, benefits, and simulated examples.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {FEATURES_DATA.map((feat) => (
              <FeatureCard
                key={feat.id}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                iconColor={feat.iconColor}
                iconBg={feat.iconBg}
                borderColor={feat.borderColor}
                onExplore={() => setSelectedFeature(feat)}
              />
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SCROLL STORYTELLING                                                        */}
        {/* ========================================================================= */}
        <ScrollStory />

        {/* ========================================================================= */}
        {/* HOW IT WORKS — FOUR CONNECTED STEPS                                       */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              Simple · Smart · Effective
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              How It <span className="gradient-text-vivid">Works</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From incoming calls to meaningful connections in just a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col items-center text-center group hover:border-cyan-500/40 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PhoneIncoming className="w-7 h-7 text-blue-400" />
              </div>
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center mb-2">
                1
              </span>
              <h3 className="text-base font-bold text-white mb-1">Receive a Call</h3>
              <p className="text-xs text-slate-400">Carrier connects incoming signal silently to CallMateAI.</p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col items-center text-center group hover:border-cyan-500/40 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-cyan-400" />
              </div>
              <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center mb-2">
                2
              </span>
              <h3 className="text-base font-bold text-white mb-1">AI Assistant Analyses</h3>
              <p className="text-xs text-slate-400">Answers politely, extracts intent, and measures urgency.</p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col items-center text-center group hover:border-cyan-500/40 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-indigo-400" />
              </div>
              <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center mb-2">
                3
              </span>
              <h3 className="text-base font-bold text-white mb-1">Identify What Matters</h3>
              <p className="text-xs text-slate-400">Classifies context, verifies history, and filters nuisance calls.</p>
            </div>

            {/* Step 4 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative flex flex-col items-center text-center group hover:border-cyan-500/40 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-purple-400" />
              </div>
              <span className="w-6 h-6 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center mb-2">
                4
              </span>
              <h3 className="text-base font-bold text-white mb-1">Notify or Hand Over</h3>
              <p className="text-xs text-slate-400">Routes urgent calls or delivers crisp summaries to you.</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* COMPACT WORKFLOW HIGHLIGHT (REPLACES REMOVED DASHBOARD PREVIEW)            */}
        {/* ========================================================================= */}
        <section id="workflow" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-500/25 shadow-xl relative overflow-hidden">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Continuous Connection Workflow
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Parent & Counselor Incident Pipeline
              </h3>
            </div>

            {/* 5-Step Compact Workflow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative">
              
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-3 text-blue-400">
                  <PhoneIncoming className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Parent Calls</h4>
                <p className="text-[11px] text-slate-400 mt-1">Inquires about student safety or section schedule.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mb-3 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">AI Agent Answers</h4>
                <p className="text-[11px] text-slate-400 mt-1">Greets caller with verified natural language context.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-3 text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Retrieves Student Info</h4>
                <p className="text-[11px] text-slate-400 mt-1">Fetches authorized attendance & section details.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center mb-3 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Detects Emergencies</h4>
                <p className="text-[11px] text-slate-400 mt-1">Identifies distress signals & urgent health queries.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3 text-emerald-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Connects Counselor</h4>
                <p className="text-[11px] text-slate-400 mt-1">Bridges active call to designated counselor station.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CTA SECTION                                                         */}
        {/* ========================================================================= */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.25)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 font-display">
              Stay Connected to What Matters.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Experience intelligent call filtering, smart notifications, and seamless human handover right in your browser.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleExploreDashboard}
                className="gradient-btn-primary px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/register"
                className="gradient-btn-secondary px-8 py-4 rounded-full text-sm font-semibold text-slate-200 hover:text-white"
              >
                Create Demo Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Feature Detail Modal Dialog */}
      <FeatureDetailModal
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />

      {/* ========================================================================= */}
      {/* PROFESSIONAL FOOTER                                                       */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-white">
              CallMate<span className="text-cyan-400">AI</span>
            </span>
            <span className="text-xs text-slate-500 ml-2">Personal AI Call Assistant</span>
          </div>

          <p className="text-xs text-slate-500 text-center md:text-right">
            © 2026 CallMateAI. Complete Frontend Prototype. Local browser storage only.
          </p>
        </div>
      </footer>
    </div>
  );
}
