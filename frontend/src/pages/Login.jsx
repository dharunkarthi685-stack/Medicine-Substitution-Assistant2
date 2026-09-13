import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Pill,
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { login, savedAccounts, removeAccount } = useAuth();
  const { success, error, info } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'demos', 'registered'

  const from = location.state?.from?.pathname || '/';
  const justRegistered = location.state?.justRegistered;
  const registeredEmail = location.state?.registeredEmail;
  const registeredPass = location.state?.registeredPass;
  const registeredName = location.state?.registeredName;

  // Auto populate if coming directly from registration
  useEffect(() => {
    if (justRegistered && registeredEmail) {
      setEmail(registeredEmail);
      if (registeredPass) {
        setPassword(registeredPass);
      }
    }
  }, [justRegistered, registeredEmail, registeredPass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.first_name || user.email}!`);
      if (user.is_admin || user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.message ||
        'Invalid email or password. Please try again.';
      error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accountEmail, accountPass, accountRole, accountName) => {
    setEmail(accountEmail);
    if (accountPass) {
      setPassword(accountPass);
    }
    setLoading(true);
    try {
      const user = await login(accountEmail, accountPass || 'userpassword123');
      const displayName = accountName || user.first_name || (accountRole === 'admin' ? 'Administrator' : 'Patient');
      success(`Logged in successfully as ${displayName}!`);
      if (user.is_admin || user.role === 'admin' || accountRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Demo login error:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to authenticate demo account.';
      error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (accountEmail, accountPass) => {
    setEmail(accountEmail);
    if (accountPass) {
      setPassword(accountPass);
    }
    info(`Filled credentials for ${accountEmail}`);
  };

  const defaultDemos = savedAccounts?.filter((a) => a.is_demo) || [];
  const registeredAccounts = savedAccounts?.filter((a) => !a.is_demo) || [];

  const displayedAccounts =
    activeTab === 'demos'
      ? defaultDemos
      : activeTab === 'registered'
      ? registeredAccounts
      : savedAccounts || [];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/25">
            <Pill className="w-7 h-7 rotate-45" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to MedSubstitute
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Access your prescription substitutions, cart orders & tax invoices
          </p>
        </div>

        {/* New Registration Success Banner */}
        {justRegistered && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Account Created Successfully!
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Welcome <strong>{registeredName || registeredEmail}</strong>. Your account has been saved and is ready for 1-click instant login below.
                </p>
              </div>
            </div>
            {registeredEmail && registeredPass && (
              <button
                type="button"
                onClick={() => handleQuickLogin(registeredEmail, registeredPass, 'user', registeredName)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Instant 1-Click Login as {registeredName || registeredEmail}</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Accounts & Demo Panel */}
        <div className="p-5 rounded-3xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-soft space-y-3.5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">
                Instant Demo & Registered Accounts
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  activeTab === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                All ({savedAccounts?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('demos')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  activeTab === 'demos'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                Demo ({defaultDemos.length})
              </button>
              {registeredAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('registered')}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    activeTab === 'registered'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  Registered ({registeredAccounts.length})
                </button>
              )}
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {displayedAccounts.map((acc) => {
              const isAdminRole = acc.is_admin || acc.role === 'admin';
              const isDefaultDemo = !!acc.is_demo;

              return (
                <div
                  key={acc.email}
                  className={`relative p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isAdminRole
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-700/40 hover:border-amber-500'
                      : isDefaultDemo
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-700/40 hover:border-emerald-500'
                      : 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-300/60 dark:border-sky-700/40 hover:border-sky-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {acc.first_name ? `${acc.first_name} ${acc.last_name || ''}`.trim() : acc.email.split('@')[0]}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                            isAdminRole
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : isDefaultDemo
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {isAdminRole ? 'Admin' : isDefaultDemo ? 'Patient' : 'Registered'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px]">
                        {acc.email}
                      </p>
                    </div>

                    {!isDefaultDemo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAccount(acc.email);
                          info(`Removed ${acc.email} from saved list`);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Remove from saved accounts"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickLogin(acc.email, acc.password, acc.role, `${acc.first_name || ''} ${acc.last_name || ''}`.trim())}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1 shadow-sm transition active:scale-95 ${
                        isAdminRole
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <Zap className="w-3 h-3 fill-white" />
                      <span>1-Click Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofill(acc.email, acc.password)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title="Fill form with this account"
                    >
                      Autofill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Click any account above to log in instantly.</span>
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register New</span>
            </Link>
          </div>

        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
          </button>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Create Patient Account
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
}
