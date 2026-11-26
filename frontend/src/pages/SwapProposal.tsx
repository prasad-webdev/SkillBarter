import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api/axios';

const SwapProposal: React.FC = () => {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [form, setForm]   = useState({ offeredSkill: '', wantedSkill: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess]     = useState(false);
  const [serverError, setServerError] = useState('');

  // Load proposals list when no userId (inbox view)
  const [proposals, setProposals]   = useState<any[]>([]);
  const [viewMode, setViewMode]     = useState<'sent'|'received'>('received');
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      API.get(`/users/${userId}`)
        .then(r => setTargetUser(r.data.user))
        .catch(() => setServerError('User not found'))
        .finally(() => setFetchLoading(false));
    } else {
      setFetchLoading(false);
      fetchProposals('received');
    }
  }, [userId]);

  const fetchProposals = async (type: 'sent'|'received') => {
    setListLoading(true);
    setViewMode(type);
    try {
      const { data } = await API.get('/proposals', { params: { type } });
      setProposals(data.proposals || []);
    } catch { setProposals([]); }
    finally   { setListLoading(false); }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.offeredSkill.trim()) e.offeredSkill = '⚠ Enter a skill you are offering';
    if (!form.wantedSkill.trim())  e.wantedSkill  = '⚠ Enter the skill you want in return';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    try {
      await API.post('/proposals', { toUserId: Number(userId), ...form });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to send proposal');
    } finally { setLoading(false); }
  };

  const handleRespond = async (id: number, status: 'accepted'|'rejected') => {
    try {
      await API.patch(`/proposals/${id}`, { status });
      fetchProposals(viewMode);
    } catch { alert('Action failed. Please try again.'); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending:  'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-600',
      cancelled:'bg-gray-100 text-gray-500',
    };
    return map[s] || 'bg-gray-100 text-gray-500';
  };

  /* ── SUCCESS ─────────────────────────────────────────────── */
  if (success) return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-[#1a237e]">Proposal Sent!</h2>
        <p className="text-gray-400 text-sm mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  );

  /* ── SEND PROPOSAL FORM ──────────────────────────────────── */
  if (userId) return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold">
          <span className="text-[#1a237e]">Skill</span><span className="text-[#FF6F00]">Barter</span>
        </div>
        <Link to="/directory" className="text-sm text-[#1a237e] font-semibold">← Directory</Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-[#1a237e] mb-1">Send Swap Proposal</h2>
          {fetchLoading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <>
              {targetUser && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-[#f4f6fb] rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#1a237e] flex items-center justify-center text-white font-bold">
                    {targetUser.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{targetUser.name}</p>
                    <p className="text-xs text-gray-400">{targetUser.role}</p>
                  </div>
                </div>
              )}

              {serverError && (
                <div className="bg-red-50 border border-red-300 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                  ⚠ {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Skill You Offer */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Skill You Are Offering <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.offeredSkill}
                    onChange={e => { setForm(f => ({...f, offeredSkill: e.target.value})); setErrors(er => ({...er, offeredSkill:''})); }}
                    placeholder="e.g. React, Python, Figma"
                    className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.offeredSkill ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
                  />
                  {errors.offeredSkill && <p className="text-red-500 text-xs mt-1">{errors.offeredSkill}</p>}
                </div>

                {/* Skill You Want */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Skill You Want in Return <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.wantedSkill}
                    onChange={e => { setForm(f => ({...f, wantedSkill: e.target.value})); setErrors(er => ({...er, wantedSkill:''})); }}
                    placeholder="e.g. Machine Learning, SQL"
                    className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.wantedSkill ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
                  />
                  {errors.wantedSkill && <p className="text-red-500 text-xs mt-1">{errors.wantedSkill}</p>}
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Message <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea rows={3} value={form.message}
                    onChange={e => setForm(f => ({...f, message: e.target.value}))}
                    placeholder="Introduce yourself and why you want to swap..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:border-[#1a237e] transition-colors"
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 bg-[#FF6F00] text-white font-bold rounded-lg hover:bg-[#e65c00] transition-colors disabled:opacity-50">
                  {loading ? 'Sending...' : '🤝 Send Proposal'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  /* ── PROPOSALS INBOX ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold">
          <span className="text-[#1a237e]">Skill</span><span className="text-[#FF6F00]">Barter</span>
        </div>
        <Link to="/dashboard" className="text-sm text-[#1a237e] font-semibold">← Dashboard</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1a237e] mb-6">🤝 Skill Swap Proposals</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['received','sent'] as const).map(t => (
            <button key={t} onClick={() => fetchProposals(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize
                ${viewMode === t ? 'bg-[#1a237e] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#1a237e]'}`}>
              {t}
            </button>
          ))}
        </div>

        {listLoading ? (
          <p className="text-gray-400 text-center py-10">Loading proposals...</p>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <p className="text-gray-400 text-sm">No {viewMode} proposals yet.</p>
            {viewMode === 'sent' && (
              <Link to="/directory" className="text-[#1a237e] text-sm underline font-semibold mt-2 inline-block">
                Browse users to send a proposal →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#1a237e] flex items-center justify-center text-white text-xs font-bold">
                        {(viewMode === 'received' ? p.fromUser : p.toUser)?.name?.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {viewMode === 'received' ? p.fromUser?.name : p.toUser?.name}
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm mb-2">
                      <span className="bg-[#e8eaf6] text-[#1a237e] px-3 py-1 rounded-full font-medium text-xs">
                        Offers: {p.offeredSkill}
                      </span>
                      <span className="text-gray-400 text-xs self-center">↔</span>
                      <span className="bg-[#fff3e0] text-[#FF6F00] px-3 py-1 rounded-full font-medium text-xs">
                        Wants: {p.wantedSkill}
                      </span>
                    </div>
                    {p.message && <p className="text-xs text-gray-500 italic">"{p.message}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ml-3 ${statusBadge(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                {/* Action buttons for received pending proposals */}
                {viewMode === 'received' && p.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleRespond(p.id, 'accepted')}
                      className="flex-1 h-9 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                      ✅ Accept
                    </button>
                    <button onClick={() => handleRespond(p.id, 'rejected')}
                      className="flex-1 h-9 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors">
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapProposal;
