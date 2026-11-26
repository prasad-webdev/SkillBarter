import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

// ── Skill Tag Component ───────────────────────────────────
const SkillTag = ({ skill, onRemove }: { skill: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 bg-[#e8eaf6] text-[#1a237e] text-sm px-3 py-1 rounded-full font-medium">
    {skill}
    <button
      type="button"
      onClick={onRemove}
      className="ml-1 text-[#1a237e] hover:text-red-500 font-bold text-base leading-none"
      title="Remove"
    >
      ×
    </button>
  </span>
);

// ── Main Component ────────────────────────────────────────
const SkillProfile: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    bio: '',
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    proficiency: '',
    availableDays: [] as string[],
    preferredTime: '',
    hourlyRate: '',
    linkedin: '',
    portfolio: '',
  });

  // Input state for adding tags
  const [offerInput, setOfferInput] = useState('');
  const [wantInput, setWantInput] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const TIME_SLOTS = ['Morning (6am–12pm)', 'Afternoon (12pm–6pm)', 'Evening (6pm–10pm)', 'Flexible'];

  // ── Add skill tag ───────────────────────────────────────
  const addSkillOffered = () => {
    const val = offerInput.trim();
    if (!val) return;
    if (form.skillsOffered.includes(val)) return;
    if (form.skillsOffered.length >= 10) {
      setErrors(e => ({ ...e, skillsOffered: '⚠ Maximum 10 skills allowed' }));
      return;
    }
    setForm(f => ({ ...f, skillsOffered: [...f.skillsOffered, val] }));
    setOfferInput('');
    setErrors(e => ({ ...e, skillsOffered: '' }));
  };

  const addSkillWanted = () => {
    const val = wantInput.trim();
    if (!val) return;
    if (form.skillsWanted.includes(val)) return;
    if (form.skillsWanted.length >= 10) {
      setErrors(e => ({ ...e, skillsWanted: '⚠ Maximum 10 skills allowed' }));
      return;
    }
    setForm(f => ({ ...f, skillsWanted: [...f.skillsWanted, val] }));
    setWantInput('');
    setErrors(e => ({ ...e, skillsWanted: '' }));
  };

  // ── Toggle availability day ─────────────────────────────
  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day],
    }));
    setErrors(e => ({ ...e, availableDays: '' }));
  };

  // ── Validation ──────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bio || form.bio.trim().length < 20)
      e.bio = '⚠ Bio must be at least 20 characters';
    if (form.bio.length > 500)
      e.bio = '⚠ Bio cannot exceed 500 characters';
    if (form.skillsOffered.length === 0)
      e.skillsOffered = '⚠ Please add at least 1 skill you can teach/offer';
    if (form.skillsWanted.length === 0)
      e.skillsWanted = '⚠ Please add at least 1 skill you want to learn';
    if (!form.proficiency)
      e.proficiency = '⚠ Please select your proficiency level';
    if (form.availableDays.length === 0)
      e.availableDays = '⚠ Please select at least 1 available day';
    if (!form.preferredTime)
      e.preferredTime = '⚠ Please select your preferred time slot';
    if (form.hourlyRate && (isNaN(Number(form.hourlyRate)) || Number(form.hourlyRate) < 0))
      e.hourlyRate = '⚠ Hourly rate must be a valid positive number';
    if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(form.linkedin))
      e.linkedin = '⚠ Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname)';
    return e;
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await API.post('/skills/profile', {
        bio: form.bio.trim(),
        skillsOffered: form.skillsOffered,
        skillsWanted: form.skillsWanted,
        proficiency: form.proficiency,
        availableDays: form.availableDays,
        preferredTime: form.preferredTime,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : 0,
        linkedin: form.linkedin.trim(),
        portfolio: form.portfolio.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/directory'), 1500);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success banner ──────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#1a237e] mb-2">Profile Saved!</h2>
          <p className="text-gray-500">Redirecting you to User Directory...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F6FB] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold mb-1">
            <span className="text-[#1a237e]">Skill</span>
            <span className="text-[#FF6F00]">Barter</span>
          </div>
          <h2 className="text-[#1a237e] font-bold text-xl">Complete Your Skill Profile</h2>
          <p className="text-gray-500 text-sm mt-1">Tell others what you can teach and what you want to learn</p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="bg-red-50 border border-red-400 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Bio ──────────────────────────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Short Bio <span className="text-gray-400 font-normal">(20–500 characters)</span>
            </label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={e => { setForm(f => ({ ...f, bio: e.target.value })); setErrors(er => ({ ...er, bio: '' })); }}
              placeholder="e.g. I am a React developer with 2 years experience. I want to learn Python and Machine Learning..."
              className={`w-full px-4 py-3 border rounded-lg text-sm outline-none resize-none transition-colors ${errors.bio ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            <div className="flex justify-between">
              {errors.bio ? <p className="text-red-500 text-xs mt-1">{errors.bio}</p> : <span />}
              <span className="text-xs text-gray-400 mt-1">{form.bio.length}/500</span>
            </div>
          </div>

          {/* ── Skills Offered ───────────────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Skills You Can Teach / Offer <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={offerInput}
                onChange={e => setOfferInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillOffered(); } }}
                placeholder="e.g. React, Node.js, Python"
                className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a237e]"
              />
              <button
                type="button"
                onClick={addSkillOffered}
                className="px-4 h-10 bg-[#1a237e] text-white rounded-lg text-sm font-semibold hover:bg-[#283593] transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {form.skillsOffered.map(s => (
                <SkillTag key={s} skill={s} onRemove={() => setForm(f => ({ ...f, skillsOffered: f.skillsOffered.filter(x => x !== s) }))} />
              ))}
            </div>
            {errors.skillsOffered && <p className="text-red-500 text-xs mt-1">{errors.skillsOffered}</p>}
          </div>

          {/* ── Skills Wanted ────────────────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Skills You Want to Learn <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={wantInput}
                onChange={e => setWantInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillWanted(); } }}
                placeholder="e.g. Machine Learning, Figma, SQL"
                className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a237e]"
              />
              <button
                type="button"
                onClick={addSkillWanted}
                className="px-4 h-10 bg-[#FF6F00] text-white rounded-lg text-sm font-semibold hover:bg-[#e65c00] transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {form.skillsWanted.map(s => (
                <SkillTag key={s} skill={s} onRemove={() => setForm(f => ({ ...f, skillsWanted: f.skillsWanted.filter(x => x !== s) }))} />
              ))}
            </div>
            {errors.skillsWanted && <p className="text-red-500 text-xs mt-1">{errors.skillsWanted}</p>}
          </div>

          {/* ── Proficiency ──────────────────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Overall Proficiency Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PROFICIENCY_LEVELS.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, proficiency: level })); setErrors(e => ({ ...e, proficiency: '' })); }}
                  className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-colors
                    ${form.proficiency === level
                      ? 'bg-[#1a237e] text-white border-[#1a237e]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#1a237e]'}`}
                >
                  {level}
                </button>
              ))}
            </div>
            {errors.proficiency && <p className="text-red-500 text-xs mt-1">{errors.proficiency}</p>}
          </div>

          {/* ── Availability Days ────────────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Available Days <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-1 px-3 rounded-full border text-sm font-medium transition-colors
                    ${form.availableDays.includes(day)
                      ? 'bg-[#FF6F00] text-white border-[#FF6F00]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#FF6F00]'}`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
            {errors.availableDays && <p className="text-red-500 text-xs mt-1">{errors.availableDays}</p>}
          </div>

          {/* ── Preferred Time ───────────────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Preferred Time Slot <span className="text-red-500">*</span>
            </label>
            <select
              value={form.preferredTime}
              onChange={e => { setForm(f => ({ ...f, preferredTime: e.target.value })); setErrors(er => ({ ...er, preferredTime: '' })); }}
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.preferredTime ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            >
              <option value="">-- Select preferred time --</option>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>}
          </div>

          {/* ── Hourly Rate (optional) ───────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Skill Credits per Session <span className="text-gray-400 font-normal">(optional, e.g. 10)</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.hourlyRate}
              onChange={e => { setForm(f => ({ ...f, hourlyRate: e.target.value })); setErrors(er => ({ ...er, hourlyRate: '' })); }}
              placeholder="e.g. 10 credits"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.hourlyRate ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate}</p>}
          </div>

          {/* ── LinkedIn (optional) ──────────────────── */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              LinkedIn Profile URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={form.linkedin}
              onChange={e => { setForm(f => ({ ...f, linkedin: e.target.value })); setErrors(er => ({ ...er, linkedin: '' })); }}
              placeholder="https://linkedin.com/in/yourname"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.linkedin ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.linkedin && <p className="text-red-500 text-xs mt-1">{errors.linkedin}</p>}
          </div>

          {/* ── Portfolio (optional) ─────────────────── */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Portfolio / GitHub URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={form.portfolio}
              onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))}
              placeholder="https://github.com/yourusername"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a237e] transition-colors"
            />
          </div>

          {/* ── Submit Button ────────────────────────── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#1a237e] text-white font-bold rounded-lg hover:bg-[#283593] transition-colors disabled:opacity-50 text-base"
          >
            {loading ? 'Saving Profile...' : 'Save & Continue →'}
          </button>

        </form>

        {/* Skip link */}
        <p className="text-center text-sm text-gray-400 mt-4">
          <button
            type="button"
            onClick={() => navigate('/directory')}
            className="underline hover:text-gray-600"
          >
            Skip for now →
          </button>
        </p>

      </div>
    </div>
  );
};

export default SkillProfile;
