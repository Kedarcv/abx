import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../store/auth.js';
import { api } from '../../lib/api.js';

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'idle', role: null, error: null });

  useEffect(() => {
    let cancelled = false;
    const update = (s) => { if (!cancelled) setState(s); };

    if (!token) { update({ status: 'error', error: 'Missing invitation token.' }); return; }
    if (authLoading) return;
    if (!user) { update({ status: 'need-login' }); return; }

    update({ status: 'accepting' });
    api('/api/admin/invitations/accept', { method: 'POST', body: { token } })
      .then(({ role }) => {
        update({ status: 'done', role });
        setTimeout(() => navigate('/admin'), 1500);
      })
      .catch(err => update({ status: 'error', error: err.message }));

    return () => { cancelled = true; };
  }, [token, user, authLoading, navigate]);

  return (
    <div className="relative min-h-screen pt-32 pb-24 bg-[#070707] text-white grid place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-[92%] max-w-md rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 text-center"
      >
        {state.status === 'idle' && <Loader2 className="mx-auto animate-spin text-[#FF7A00]" />}
        {state.status === 'accepting' && (
          <>
            <Loader2 className="mx-auto mb-5 animate-spin text-[#FF7A00]" size={36} />
            <h1 className="text-2xl font-bold font-orbitron">Accepting invitation…</h1>
          </>
        )}
        {state.status === 'done' && (
          <>
            <CheckCircle2 className="mx-auto mb-5 text-[#FF7A00]" size={36} />
            <h1 className="text-2xl font-bold font-orbitron mb-2">You're in</h1>
            <p className="text-white/60">Role granted: <span className="text-[#FF7A00] font-mono">{state.role}</span></p>
          </>
        )}
        {state.status === 'need-login' && (
          <>
            <ShieldAlert className="mx-auto mb-5 text-[#F4EC47]" size={36} />
            <h1 className="text-2xl font-bold font-orbitron mb-2">Sign in first</h1>
            <p className="text-white/60 mb-6">Sign in with the invited email to accept this invitation.</p>
            <Link
              to="/login"
              state={{ from: `/admin/accept-invite?token=${token}` }}
              className="inline-flex rounded-full bg-[#FF7A00] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-black"
            >
              Sign in
            </Link>
          </>
        )}
        {state.status === 'error' && (
          <>
            <ShieldAlert className="mx-auto mb-5 text-red-400" size={36} />
            <h1 className="text-2xl font-bold font-orbitron mb-2">Couldn't accept</h1>
            <p className="text-white/60">{state.error}</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
