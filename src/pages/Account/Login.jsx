import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/auth.js';
import { api } from '../../lib/api.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, loading: authLoading, signIn, signUp, signInWithGoogle, hasRole } = useAuth();

  const [mode, setMode] = useState('signin'); // signin | signup | reset
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [notice, setNotice]   = useState(null);

  // Route after auth resolves
  useEffect(() => {
    if (authLoading || !user) return;
    const dest = location.state?.from
      ?? (hasRole('fulfillment') ? '/admin' : '/account/orders');
    navigate(dest, { replace: true });
  }, [authLoading, user, role, navigate, location.state, hasRole]);

  const doGoogle = async () => {
    setError(null); setNotice(null); setLoading(true);
    try {
      await signInWithGoogle();
      // Best-effort welcome email — server is idempotent.
      api('/api/auth/welcome', { method: 'POST' }).catch(() => {});
    }
    catch (err) { setError(prettyError(err)); setLoading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setNotice(null); setLoading(true);
    try {
      if (mode === 'signin') await signIn(email, pw);
      else if (mode === 'signup') {
        await signUp(email, pw, name);
        api('/api/auth/welcome', { method: 'POST' }).catch(() => {});
      }
      else if (mode === 'reset') {
        await api('/api/auth/password-reset', { method: 'POST', body: { email } });
        setNotice('If an account exists, a reset link is on its way.');
        setMode('signin');
      }
    } catch (err) {
      setError(prettyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-28 pb-24 bg-[#070707] text-white grid place-items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,122,0,0.10),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-[92%] max-w-md rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <Lock size={14} className="text-[#FF7A00]" />
          <p className="text-xs uppercase tracking-[0.3em] text-white/55 font-orbitron">
            ABX Motion
          </p>
        </div>

        <h1 className="text-3xl font-bold font-orbitron mb-1">
          {mode === 'signin' && 'Welcome back'}
          {mode === 'signup' && 'Create account'}
          {mode === 'reset'  && 'Reset password'}
        </h1>
        <p className="text-sm text-white/55 mb-7">
          {mode === 'signin' && 'Customers, staff and admins sign in here.'}
          {mode === 'signup' && 'One account works across the app and the storefront.'}
          {mode === 'reset'  && 'We’ll email you a link to reset your password.'}
        </p>

        {mode !== 'reset' && (
          <>
            <button
              type="button"
              onClick={doGoogle}
              disabled={loading}
              className="group mb-4 inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.04] py-3.5 text-sm font-semibold tracking-wide text-white hover:bg-white/[0.08] hover:border-white/30 disabled:opacity-60"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <div className="relative my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <Field label="Name">
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className={inputCls} autoComplete="name"
              />
            </Field>
          )}
          <Field label="Email" icon={<Mail size={14} />}>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls} autoComplete="email"
            />
          </Field>

          {mode !== 'reset' && (
            <Field label="Password" icon={<Lock size={14} />}>
              <input
                type="password" required value={pw} onChange={(e) => setPw(e.target.value)}
                minLength={6} className={inputCls}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </Field>
          )}

          {error  && <p className="text-sm text-red-300">{error}</p>}
          {notice && <p className="text-sm text-[#F4EC47]">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF7A00] py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all hover:shadow-[0_0_30px_rgba(255,122,0,0.45)] disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>
                {mode === 'signin' && 'Sign in'}
                {mode === 'signup' && 'Create account'}
                {mode === 'reset'  && 'Send reset email'}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/55">
          {mode === 'signin' ? (
            <>
              <button onClick={() => { setMode('reset'); setError(null); }} className="hover:text-white">
                Forgot password?
              </button>
              <button onClick={() => { setMode('signup'); setError(null); }} className="hover:text-white">
                Need an account? <span className="text-[#FF7A00]">Sign up</span>
              </button>
            </>
          ) : (
            <button onClick={() => { setMode('signin'); setError(null); }} className="hover:text-white">
              ← Back to sign in
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/35">
          By continuing you agree to the <Link to="/" className="underline">terms</Link>.
        </p>
      </motion.div>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#FF7A00]/60 focus:bg-black/60';

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs text-white/55">
        {icon}{label}
      </span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFC107" d="M21.8 10.2H12v3.9h5.6c-.8 2.4-3 4.1-5.6 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.9.6 3.9 1.5l2.8-2.8C16.9 3.1 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5 0 9.6-3.6 9.6-10 0-.6-.1-1.2-.2-1.8z"/>
      <path fill="#FF3D00" d="M3.3 7.3l3.2 2.4C7.4 7.6 9.5 6 12 6c1.5 0 2.9.6 3.9 1.5l2.8-2.8C16.9 3.1 14.6 2 12 2 8.1 2 4.7 4.1 3.3 7.3z"/>
      <path fill="#4CAF50" d="M12 22c2.6 0 4.9-1 6.6-2.6l-3-2.5c-1 .7-2.2 1.1-3.6 1.1-2.6 0-4.8-1.6-5.6-4l-3.2 2.5C4.6 19.9 8 22 12 22z"/>
      <path fill="#1976D2" d="M21.8 10.2H12v3.9h5.6c-.4 1.1-1.1 2-2 2.7l3 2.5c-.2.2 3.2-2.3 3.2-7.3 0-.6-.1-1.2-.2-1.8z"/>
    </svg>
  );
}

function prettyError(err) {
  const code = err?.code ?? '';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Wrong email or password.';
  if (code.includes('user-not-found'))     return 'No account with that email.';
  if (code.includes('email-already-in-use'))return 'An account with that email already exists.';
  if (code.includes('weak-password'))      return 'Password is too weak (min 6 chars).';
  if (code.includes('too-many-requests'))  return 'Too many attempts. Try again in a moment.';
  if (code.includes('popup-closed-by-user')) return 'Google sign-in was canceled.';
  if (code.includes('account-exists-with-different-credential')) return 'An account with this email already exists with a different sign-in method.';
  return err?.message || 'Something went wrong.';
}
