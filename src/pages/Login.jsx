import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validation';
import Robot3D from '../components/Robot3D';
import Modal from '../components/Modal';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Sparkles,
  PhoneCall,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);

  // Requirement 6: Immediately convert email to lowercase as user types, preserving cursor
  const handleEmailChange = (e) => {
    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const lowerVal = input.value.toLowerCase();

    setEmail(lowerVal);
    if (emailError) setEmailError('');
    if (formError) setFormError('');

    // Restore cursor position if needed
    requestAnimationFrame(() => {
      if (input && input.setSelectionRange && start !== null) {
        input.setSelectionRange(start, end);
      }
    });
  };

  const handleEmailBlur = () => {
    setEmail((prev) => prev.trim().toLowerCase());
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (formError) setFormError('');
  };

  const handleFillDemoCreds = () => {
    setEmail('thanu@gmail.com');
    setPassword('CallMate@123');
    setEmailError('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();
    setEmail(normalizedEmail);

    // 1. Validate email
    const emailValidation = validateEmail(normalizedEmail);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }

    // 2. Validate password exists
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(normalizedEmail, password, rememberMe);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setFormError(result.error);
      }
    } catch {
      setFormError('An unexpected error occurred during sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden text-slate-100 transition-colors duration-300">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[650px] h-[650px] rounded-full bg-purple-600/15 blur-[180px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full relative z-20">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white font-display">
            CallMate<span className="text-cyan-400">AI</span>
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content: Two Columns */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: 3D Robot Mascot (Preserved exactly as is) */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Personal AI Concierge</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3 font-display">
              Welcome <span className="gradient-text-vivid">Back!</span>
            </h1>

            <p className="text-slate-300 text-base max-w-md mb-6 leading-relaxed">
              Your smarter way to manage every call, prioritize what matters, and never miss an important conversation.
            </p>

            <div className="relative w-full max-w-md h-72 sm:h-80 my-2">
              <Robot3D pose="greeting" interactive={true} />
              
              <div className="absolute top-4 right-2 p-2.5 rounded-xl glass-panel border border-cyan-400/40 text-[11px] font-bold text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.3)] animate-float pointer-events-none">
                💙 AI Ready to Assist
              </div>
            </div>

            <div className="hidden lg:block pt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Every Call. Every Connection. Always Organized.
            </div>
          </div>

          {/* Right Column: Premium Glass Sign-in Card with Fixed Spacing */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-md p-8 sm:p-9 rounded-3xl glass-panel border border-indigo-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
                  <p className="text-xs text-slate-400 mt-1">Access your simulated AI call assistant dashboard</p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCreds}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/20 transition-colors"
                  title="Fill demo credentials: thanu@gmail.com / CallMate@123"
                >
                  ⚡ Auto-fill Demo
                </button>
              </div>

              {formError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email Field with Guaranteed Icon & Text Spacing (pl-12) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      placeholder="youremail@gmail.com"
                      autoComplete="email"
                      className={`form-input h-12 pl-12 pr-4 ${
                        emailError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
                      }`}
                    />
                  </div>
                  {emailError ? (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Must be a valid @gmail.com address (converted to lowercase automatically)
                    </p>
                  )}
                </div>

                {/* Password Field with Generous Right & Left Padding (pl-12, pr-12) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordModalOpen(true)}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="form-input h-12 pl-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors z-10"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me on this browser</span>
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gradient-btn-primary w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-slate-900 text-xs text-slate-500 font-semibold uppercase">
                  or
                </span>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="w-full h-12 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center gap-2.5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Link to Register */}
              <div className="mt-6 text-center text-xs text-slate-400">
                New to CallMateAI?{' '}
                <Link to="/register" className="text-cyan-400 font-bold hover:underline">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-4 text-center text-xs text-slate-500 relative z-10">
        Demo Credentials: <span className="text-slate-300 font-mono">thanu@gmail.com</span> / <span className="text-slate-300 font-mono">CallMate@123</span>
      </footer>

      {/* Google Sign-In Informational Modal */}
      <Modal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        title="Google Authentication Demo"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <p>
            This application is a <strong>frontend-only prototype</strong> with local browser storage.
          </p>
          <p className="text-slate-400">
            Real Google Sign-In requires an active OAuth 2.0 provider configuration (such as Firebase Authentication or Google Cloud Identity) backed by a secure identity server.
          </p>
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-medium">
            💡 For this demo, please use email & password authentication or click the <strong>⚡ Auto-fill Demo</strong> button to test the dashboard.
          </div>
          <button
            onClick={() => setGoogleModalOpen(false)}
            className="w-full py-2.5 rounded-xl gradient-btn-primary font-bold text-xs uppercase tracking-wider"
          >
            Understood
          </button>
        </div>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        title="Demo Password Recovery"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <p>
            Because CallMateAI stores demo accounts locally in your browser's localStorage, you can log in using the pre-seeded demo account:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-200 space-y-1">
            <p><strong>Email:</strong> thanu@gmail.com</p>
            <p><strong>Password:</strong> CallMate@123</p>
          </div>
          <p className="text-xs text-slate-400">
            Alternatively, create a new demo account from the registration page or reset demo storage in Settings.
          </p>
          <button
            onClick={() => {
              handleFillDemoCreds();
              setForgotPasswordModalOpen(false);
            }}
            className="w-full py-2.5 rounded-xl gradient-btn-primary font-bold text-xs uppercase tracking-wider"
          >
            Auto-fill These Credentials
          </button>
        </div>
      </Modal>
    </div>
  );
}
