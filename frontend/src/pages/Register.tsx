import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Client-side validation ─────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 3)
      e.name = '⚠ Name must be at least 3 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = '⚠ Please enter a valid email address';
    if (!form.password || form.password.length < 8)
      e.password = '⚠ Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password))
      e.password = '⚠ Password must contain at least 1 uppercase letter';
    if (!/[0-9]/.test(form.password))
      e.password = '⚠ Password must contain at least 1 number';
    if (form.confirmPassword !== form.password)
      e.confirmPassword = '⚠ Passwords do not match';
    if (!form.role)
      e.role = '⚠ Please select a role';
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const { data } = await API.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/profile');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="text-center text-2xl font-extrabold mb-1">
          <span className="text-[#1a237e]">Skill</span>
          <span className="text-[#FF6F00]">Barter</span>
        </div>
        <h2 className="text-center text-[#1a237e] font-bold text-xl mb-6">Create Your Account</h2>

        {/* Server error */}
        {serverError && (
          <div className="bg-red-50 border border-red-400 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              name="name" type="text" value={form.name} onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="Enter your email address"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Min 8 characters, 1 uppercase, 1 number"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input
              name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
              placeholder="Re-enter your password"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Role</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.role ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            >
              <option value="">-- Select your role --</option>
              <option value="Mentor">Mentor</option>
              <option value="Learner">Learner</option>
              <option value="PeerSwapper">Peer Swapper</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full h-12 bg-[#1a237e] text-white font-bold rounded-lg hover:bg-[#283593] transition-colors disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1a237e] underline font-semibold">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
