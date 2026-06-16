// /admin/app/clubs/:id — view + manage a single club's members + join requests.
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Trash2, Crown, Shield, UserMinus, Ban, Check, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';

const ROLES = ['owner', 'moderator', 'member', 'banned'];

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub]       = useState(null);
  const [members, setMembers] = useState(null);
  const [requests, setRequests] = useState(null);
  const [busy, setBusy]       = useState(null); // id of row being updated
  const [error, setError]     = useState(null);

  const load = async () => {
    setError(null);
    try {
      const [c, m, r] = await Promise.all([
        api(`/api/admin/app/clubs/${id}`),
        api(`/api/admin/app/clubs/${id}/members`),
        api(`/api/admin/app/clubs/${id}/join-requests`),
      ]);
      setClub(c.item);
      setMembers(m.items ?? []);
      setRequests(r.items ?? []);
    } catch (e) { setError(e.message); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const setRole = async (memberId, role) => {
    setBusy(memberId);
    try {
      await api(`/api/admin/app/clubs/${id}/members?memberId=${encodeURIComponent(memberId)}`, {
        method: 'PATCH', body: { role },
      });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(null); }
  };

  const removeMember = async (memberId) => {
    if (!confirm('Remove this member from the club?')) return;
    setBusy(memberId);
    try {
      await api(`/api/admin/app/clubs/${id}/members?memberId=${encodeURIComponent(memberId)}`, { method: 'DELETE' });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(null); }
  };

  const decideRequest = async (requestId, action) => {
    setBusy(requestId);
    try {
      await api(`/api/admin/app/clubs/${id}/join-requests?requestId=${encodeURIComponent(requestId)}&action=${action}`, {
        method: 'POST',
      });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(null); }
  };

  if (!club) {
    return error
      ? <p className="text-red-300 text-sm">{error}</p>
      : <Loader2 className="animate-spin text-[#FF7A00] mx-auto my-12" />;
  }

  return (
    <div className="space-y-8">
      <button onClick={() => navigate('/admin/app/clubs')} className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white">
        <ArrowLeft size={12} /> Back to clubs
      </button>

      <PageHeader
        eyebrow="Track-Your-Walk · Clubs"
        title={club.name ?? '(unnamed)'}
        description={club.description ?? '—'}
        actions={
          <>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-white/65">
              {club.visibility ?? 'public'} · {club.joinPolicy ?? 'open'}
            </span>
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white">
              <RefreshCw size={12} /> Refresh
            </button>
          </>
        }
      />

      {error && <p className="text-red-300 text-sm">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Stat label="Members"    value={club.memberCount ?? members?.length ?? 0} />
        <Stat label="Posts"      value={club.postCount ?? 0} />
        <Stat label="Challenges" value={club.challengeCount ?? 0} />
      </div>

      {/* Pending join requests */}
      {requests && requests.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <header className="px-6 py-3 border-b border-white/10 text-sm uppercase tracking-[0.25em] text-white/55 font-orbitron">
            Pending join requests
          </header>
          <ul className="divide-y divide-white/5">
            {requests.map(r => (
              <li key={r.id} className="flex items-center justify-between px-6 py-3 text-sm">
                <span className="font-mono text-xs text-white/65">{r.userId ?? r.id}</span>
                <div className="flex items-center gap-2">
                  <button disabled={busy === r.id} onClick={() => decideRequest(r.id, 'approve')} className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 px-3 py-1 text-[11px]">
                    <Check size={10} /> Approve
                  </button>
                  <button disabled={busy === r.id} onClick={() => decideRequest(r.id, 'deny')} className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 text-red-300 px-3 py-1 text-[11px]">
                    <X size={10} /> Deny
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Members */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <header className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.25em] text-white/55 font-orbitron">Members</h2>
          <Link to={`/admin/app/users`} className="text-xs text-white/45 hover:text-white">Manage users →</Link>
        </header>
        {!members ? <Loader2 className="animate-spin text-[#FF7A00] mx-auto my-6" /> :
          members.length === 0 ? <p className="p-8 text-center text-white/45">No members.</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-white/55">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map(m => (
                    <tr key={m.id}>
                      <td className="px-4 py-2 font-mono text-xs flex items-center gap-2">
                        {m.role === 'owner' && <Crown size={12} className="text-[#F4EC47]" />}
                        {m.role === 'moderator' && <Shield size={12} className="text-[#FF7A00]" />}
                        {m.userId ?? m.id}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          defaultValue={m.role ?? 'member'}
                          disabled={busy === m.id}
                          onChange={(e) => setRole(m.id, e.target.value)}
                          className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-xs text-white/45">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {m.role !== 'owner' && (
                          <button disabled={busy === m.id} onClick={() => removeMember(m.id)} className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 text-red-300 px-3 py-1 text-[11px]">
                            {busy === m.id ? <Loader2 size={10} className="animate-spin" /> : <UserMinus size={10} />}
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 mb-1">{label}</p>
      <p className="text-2xl font-mono tabular-nums">{value}</p>
    </div>
  );
}
