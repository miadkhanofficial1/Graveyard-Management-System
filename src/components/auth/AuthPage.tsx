import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
}

const springPhysics = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 26,
  mass: 0.7,
};

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'signin' }) => {
  const { login, signup, setActiveView } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sign In form fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Moderate', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Strong', color: 'bg-sky-500' };
      case 4:
        return { score: 100, label: 'Excellent', color: 'bg-emerald-500' };
      default:
        return { score: 15, label: 'Very Weak', color: 'bg-rose-500' };
    }
  };

  const strength = getPasswordStrength(signUpPassword);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = login(signInEmail, signInPassword);
    if (!result.success && result.error) {
      setAuthError(result.error);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (signUpPassword.length < 6) {
      setAuthError('Password must be at least 6 characters in length.');
      return;
    }

    const result = signup({
      name: signUpName,
      email: signUpEmail,
      phone: signUpPhone,
      password: signUpPassword,
    });

    if (!result.success && result.error) {
      setAuthError(result.error);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springPhysics}
        className="backdrop-blur-3xl bg-white/75 dark:bg-[#0c121e]/75 border border-white/50 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.22)] rounded-3xl p-6 sm:p-7 space-y-5"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-accentEmerald shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Graveyard<span className="text-accentEmerald">Track</span>™
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              National Cemetery Spatial Management Portal
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setAuthError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setAuthError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{authError}</p>
          </motion.div>
        )}

        {/* FORM A: SIGN IN */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin.banani@graveyard.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={springPhysics}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
        )}

        {/* FORM B: SIGN UP (PUBLIC RELATIVE) */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariqul Islam"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+880 1711-..."
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {signUpPassword && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type password"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={springPhysics}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>Register Relative Account</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
        )}

        {/* Committee Graveyard Registration Callout */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authorized Municipal Committee?{' '}
            <button
              type="button"
              onClick={() => setActiveView('register_graveyard')}
              className="font-bold text-emerald-600 dark:text-accentEmerald hover:underline ml-1"
            >
              Register Facility →
            </button>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 dark:bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={springPhysics}
            className="w-full max-w-sm backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accentEmerald" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetSent(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-3 py-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Recovery Token Sent!
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Password reset link dispatched to <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{resetEmail}</span>.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold mt-2"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered municipal or relative email address to receive password recovery instructions.
                </p>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin.banani@graveyard.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Send Recovery
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
