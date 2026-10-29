import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
}

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

  // Quick Demo credentials
  const demoAccounts = [
    {
      label: 'Super Admin',
      email: 'superadmin@graveyard.com',
      pass: 'SuperAdmin@123',
      badge: 'System Governance',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />,
      color: 'hover:border-purple-500/60',
    },
    {
      label: 'Graveyard Admin (Approved)',
      email: 'admin.banani@graveyard.com',
      pass: 'Admin@123',
      badge: 'Banani Municipal',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
      color: 'hover:border-emerald-500/60',
    },
    {
      label: 'Graveyard Admin (Pending)',
      email: 'admin.uttara@graveyard.com',
      pass: 'Pending@123',
      badge: 'Uttara (Awaiting Review)',
      icon: <Building2 className="w-3.5 h-3.5 text-amber-500" />,
      color: 'hover:border-amber-500/60',
    },
    {
      label: 'Security Staff',
      email: 'guard.karim@graveyard.com',
      pass: 'Guard@123',
      badge: 'Rayerbazar Patrol',
      icon: <UserCheck className="w-3.5 h-3.5 text-sky-500" />,
      color: 'hover:border-sky-500/60',
    },
    {
      label: 'Public Relative',
      email: 'relative.rahim@gmail.com',
      pass: 'User@123',
      badge: 'Ancestral Visitor',
      icon: <User className="w-3.5 h-3.5 text-indigo-500" />,
      color: 'hover:border-indigo-500/60',
    },
  ];

  const handleSelectDemo = (email: string, pass: string) => {
    setSignInEmail(email);
    setSignInPassword(pass);
    setAuthError(null);
  };

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

    if (!signInEmail || !signInPassword) {
      setAuthError('Please fill in both email and password.');
      return;
    }

    const result = login(signInEmail, signInPassword);
    if (!result.success && result.error) {
      setAuthError(result.error);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!signUpName || !signUpEmail || !signUpPhone || !signUpPassword) {
      setAuthError('Please fill in all required registration fields.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Passwords do not match. Please re-enter identical passwords.');
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
    <div className="max-w-4xl mx-auto py-4 sm:py-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brand & Security Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-accentEmerald border border-emerald-500/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block">
                  Graveyard<span className="text-accentEmerald">Track</span> Portal
                </span>
                <span className="text-[11px] text-slate-400">
                  National Cemetery Management Access
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Dignified municipal cemetery operations, multi-occupancy spatial tracking, and encrypted ancestral memorial recordkeeping.
            </p>

            <div className="space-y-2.5 pt-2 border-t border-slate-700/70 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Protected Role-Based Access Controls</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2-Tier Relative Privacy & NID Verification</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Police-Ready Anti-Desecration Audit Chain</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Accounts Pill Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accentGold" />
                1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Instant Autofill</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Click any persona below to instantly pre-fill credentials for testing:
            </p>

            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    handleSelectDemo(acc.email, acc.pass);
                  }}
                  className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-left transition-all ${acc.color} hover:shadow-sm flex items-center justify-between gap-2 group`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                      {acc.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {acc.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0">
                    Autofill →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Unified Sign In / Sign Up Card */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-xl space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-darkMuted text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setAuthError(null);
                }}
                className={`py-2.5 rounded-xl transition-all ${
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
                className={`py-2.5 rounded-xl transition-all ${
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
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{authError}</p>
              </div>
            )}

            {/* FORM A: SIGN IN */}
            {mode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Official Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin.banani@graveyard.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
                      placeholder="Enter account password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
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

                <div className="flex items-center justify-between pt-1 text-xs">
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

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* FORM B: SIGN UP (PUBLIC RELATIVE) */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="+880 1711-..."
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {signUpPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Password Strength:</span>
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50/60 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2.5"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  <span>Register Relative Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Committee Graveyard Registration Callout */}
            <div className="pt-4 border-t border-slate-100 dark:border-darkMuted/60 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you an authorized Municipal Cemetery Committee representative?{' '}
                <button
                  type="button"
                  onClick={() => setActiveView('register_graveyard')}
                  className="font-bold text-emerald-600 dark:text-accentEmerald hover:underline ml-1"
                >
                  Register Graveyard Facility →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 dark:bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-darkMuted p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accentEmerald" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
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
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-3 py-2 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Recovery Instructions Sent!
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  We have dispatched temporary recovery tokens to <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{resetEmail}</span>. Check your inbox to reset credentials.
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
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your registered municipal or relative email address to receive password reset authorization.
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
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
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
