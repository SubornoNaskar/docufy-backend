import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSearch,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/errorMessage';

const EMPTY_FORM = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function validate(values, isLogin) {
  const errors = {};

  if (!values.username.trim()) {
    errors.username = 'Username is required.';
  } else if (!isLogin && values.username.trim().length < 3) {
    errors.username = 'Use at least 3 characters.';
  }

  if (!isLogin) {
    if (!values.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (!isLogin && values.password.length < 6) {
    errors.password = 'Use at least 6 characters.';
  }

  if (!isLogin && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-rose-300">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

export default function AuthPage({ mode = 'login', onModeChange, onNotice }) {
  const { login, register } = useAuth();
  const isLogin = mode !== 'register';

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFieldErrors({});
    setFormError('');
    setShowPassword(false);
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
    setFormError('');
  };

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setFormError('');
    setFieldErrors({});
    onModeChange?.(nextMode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const errors = validate(form, isLogin);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please correct the highlighted fields.');
      return;
    }

    setFieldErrors({});
    setFormError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login({
          username: form.username.trim(),
          password: form.password,
        });
        onNotice?.('Welcome back to Docufy.', 'success');
      } else {
        await register({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        onNotice?.('Account created. Welcome to Docufy!', 'success');
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (invalid) =>
    `w-full rounded-xl border bg-[#070b14] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 ${
      invalid
        ? 'border-rose-500/70 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10'
        : 'border-[#1e2a44] hover:border-[#2b3c60] focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10'
    }`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans">
      {/* Brand / marketing panel */}
      <div
        className="relative hidden lg:flex lg:w-1/2 xl:w-[54%] flex-col justify-between overflow-hidden p-10 xl:p-14 border-r border-[#17223b]"
        style={{
          background:
            'radial-gradient(circle at 15% 15%, rgba(37,99,235,0.24), transparent 42%), radial-gradient(circle at 85% 80%, rgba(99,102,241,0.20), transparent 45%), #070b14',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-white tracking-tight">Docufy</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60">
                <Sparkles className="w-3 h-3" />
                AI RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide">
              Spring AI • PostgreSQL pgvector • OpenAI
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-950/30 px-3 py-1.5 text-[11px] font-medium text-blue-300 mb-7">
            <ShieldCheck className="w-3.5 h-3.5" />
            Private, JWT-secured document workspace
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight text-white">
            Your documents.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Answers in seconds.
            </span>
          </h1>

          <p className="mt-5 text-sm xl:text-base leading-7 text-slate-400 max-w-lg">
            Upload documents, build a searchable knowledge base, and ask grounded questions with
            citations — all from one focused workspace.
          </p>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: UploadCloud,
                title: 'Upload & index',
                text: 'PDF, DOCX, MD, TXT and CSV with progress tracking.',
              },
              {
                icon: MessageSquare,
                title: 'Ask anything',
                text: 'Streamed answers with document-grounded citations.',
              },
              {
                icon: FileSearch,
                title: 'Search chunks',
                text: 'Semantic search across clauses and concepts.',
              },
              {
                icon: ShieldCheck,
                title: 'Your data stays yours',
                text: 'Per-user documents protected by bearer tokens.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#1e2a44] bg-[#0b111e]/70 backdrop-blur-sm p-4 hover:border-blue-500/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-3">
                  <item.icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-[11px] text-slate-500">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            PgVector embeddings
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Conversation memory
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Real-time streaming
          </span>
        </div>
      </div>

      {/* Form panel */}
      <div
        className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.10), transparent 55%), #080d17',
        }}
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">Docufy</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60">
                <Sparkles className="w-3 h-3" />
                AI RAG
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2a44] bg-[#0b111e] shadow-2xl shadow-black/40 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#17223b]">
              <div className="inline-flex rounded-xl border border-[#1e2a44] bg-[#070b14] p-1 mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isLogin
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    !isLogin
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create account
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1.5 text-xs text-slate-400 leading-5">
                {isLogin
                  ? 'Sign in to continue to your private Docufy workspace.'
                  : 'Register to start uploading and querying your documents.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-800/60 bg-rose-950/35 px-3.5 py-3 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-5">{formError}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="your-username"
                    disabled={submitting}
                    className={inputClass(fieldErrors.username)}
                  />
                </div>
                <FieldError message={fieldErrors.username} />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="email" className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      disabled={submitting}
                      className={inputClass(fieldErrors.email)}
                    />
                  </div>
                  <FieldError message={fieldErrors.email} />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                    disabled={submitting}
                    className={`${inputClass(fieldErrors.password)} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError message={fieldErrors.password} />
              </div>

              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-[11px] font-semibold text-slate-300 mb-1.5"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      disabled={submitting}
                      className={inputClass(fieldErrors.confirmPassword)}
                    />
                  </div>
                  <FieldError message={fieldErrors.confirmPassword} />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign in to Docufy' : 'Create account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <p className="text-center text-[11px] text-slate-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchMode(isLogin ? 'register' : 'login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {isLogin ? 'Create one here' : 'Sign in instead'}
                </button>
              </p>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protected by JWT authentication
          </p>
        </div>
      </div>
    </div>
  );
}
