import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = '⚠ Please enter a valid email address';
    if (!form.password)
      e.password = '⚠ Password is required';
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-xl">
        <div className="text-center text-2xl font-extrabold mb-1">
          <span className="text-[#1a237e]">Skill</span><span className="text-[#FF6F00]">Barter</span>
        </div>
        <h2 className="text-center text-[#1a237e] font-bold text-xl mb-2">Welcome Back!</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Login to continue your skill journey</p>

        {serverError && (
          <div className="bg-red-50 border border-red-400 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#1a237e]'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="text-right mb-6">
            <button type="button" className="text-[#1a237e] text-xs underline">Forgot Password?</button>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full h-12 bg-[#1a237e] text-white font-bold rounded-lg hover:bg-[#283593] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#1a237e] underline font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
