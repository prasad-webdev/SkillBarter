import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api/axios';

const BookSession: React.FC = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();

  const [mentor, setMentor]       = useState<any>(null);
  const [wallet, setWallet]       = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    skillTopic:  '',
    scheduledAt: '',
    scheduledTime: '',
    durationMin: '60',
    credits:     '10',
    notes:       '',
  });

  useEffect(() => {
    Promise.all([
      API.get(`/users/${mentorId}`),
      API.get('/wallet'),
    ]).then(([uRes, wRes]) => {
      setMentor(uRes.data.user);
      setWallet(wRes.data.wallet);
    }).catch(() => setServerError('Could not load data'))
      .finally(() => setFetchLoading(false));
  }, [mentorId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.skillTopic.trim())    e.skillTopic  = '⚠ Please enter the skill topic';
    if (!form.scheduledAt)          e.scheduledAt = '⚠ Please select a date';
    if (!form.scheduledTime)        e.scheduledTime = '⚠ Please select a time';
    if (!form.credits || Number(form.credits) < 1)
      e.credits = '⚠ Credits must be at least 1';
    if (wallet && Number(form.credits) > wallet.balance)
      e.credits = `⚠ Insufficient credits. You have ${wallet.balance} credits.`;
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    setServerError('');
    try {
      const scheduledAt = `${form.scheduledAt}T${form.scheduledTime}:00`;
      await API.post('/sessions', {
        mentorId: Number(mentorId),
        skillTopic: form.skillTopic,
        scheduledAt,
        durationMin: Number(form.durationMin),
        credits:     Number(form.credits),
        notes:       form.notes,
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to book session');
    } finally { setLoading(false); }
  };

  /* ── SUCCESS ─────────────────────────────────────────────── */
  if (success) return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-xl font-bold text-[#1a237e]">Session Booked!</h2>
        <p className="text-sm text-gray-400 mt-1">Credits held in escrow until session completes.</p>
        <p className="text-xs text-gray-300 mt-3">Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold">
          <span className="text-[#1a237e]">Skill</span><span className="text-[#FF6F00]">Barter</span>
        </div>
        <Link to="/directory" className="text-sm text-[#1a237e] font-semibold">← Directory</Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-[#1a237e] mb-1">📅 Book a Session</h2>
          <p className="text-gray-400 text-sm mb-6">Schedule a learning session with this mentor</p>

          {fetchLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <>
              {/* Mentor card */}
              {mentor && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-[#f4f6fb] rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#1a237e] flex items-center justify-center text-white font-bold">
                    {mentor.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{mentor.name}</p>
                    <p className="text-xs text-gray-400">{mentor.role}</p>
                  </div>
                  {wallet && (
                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-400">Your credits</p>
                      <p className="text-sm font-bold text-[#1a237e]">{wallet.balance} 💰</p>
                    </div>
                  )}
                </div>
              )}

              {serverError && (
                <div className="bg-red-50 border border-red-300 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                  ⚠ {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Skill Topic */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Skill / Topic <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.skillTopic}
                    onChange={e => { setForm(f => ({...f, skillTopic: e.target.value})); setErrors(er => ({...er, skillTopic:''})); }}
                    placeholder="e.g. React Hooks, Python Basics"
                    className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.skillTopic ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
                  />
                  {errors.skillTopic && <p className="text-red-500 text-xs mt-1">{errors.skillTopic}</p>}
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.scheduledAt}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => { setForm(f => ({...f, scheduledAt: e.target.value})); setErrors(er => ({...er, scheduledAt:''})); }}
                      className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.scheduledAt ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
                    />
                    {errors.scheduledAt && <p className="text-red-500 text-xs mt-1">{errors.scheduledAt}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time <span className="text-red-500">*</span></label>
                    <input type="time" value={form.scheduledTime}
                      onChange={e => { setForm(f => ({...f, scheduledTime: e.target.value})); setErrors(er => ({...er, scheduledTime:''})); }}
                      className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.scheduledTime ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
                    />
                    {errors.scheduledTime && <p className="text-red-500 text-xs mt-1">{errors.scheduledTime}</p>}
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                  <select value={form.durationMin}
                    onChange={e => setForm(f => ({...f, durationMin: e.target.value}))}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a237e]">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Credits */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Skill Credits to Pay <span className="text-red-500">*</span>
                    {wallet && <span className="font-normal text-gray-400 text-xs ml-2">(Balance: {wallet.balance})</span>}
                  </label>
                  <input type="number" value={form.credits} min="1"
                    onChange={e => { setForm(f => ({...f, credits: e.target.value})); setErrors(er => ({...er, credits:''})); }}
                    className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.credits ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
                  />
                  {errors.credits && <p className="text-red-500 text-xs mt-1">{errors.credits}</p>}
                  <p className="text-xs text-gray-400 mt-1">Credits are held in escrow until session is completed</p>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea rows={2} value={form.notes}
                    onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                    placeholder="What do you want to learn? Any prerequisites?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:border-[#1a237e]"
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 bg-[#1a237e] text-white font-bold rounded-lg hover:bg-[#283593] transition-colors disabled:opacity-50">
                  {loading ? 'Booking...' : '📅 Book Session'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookSession;
