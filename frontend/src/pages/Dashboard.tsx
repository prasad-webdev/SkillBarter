import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [sessions, setSessions] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, walRes, notifRes] = await Promise.all([
          API.get('/sessions'),
          API.get('/wallet'),
          API.get('/notifications'),
        ]);
        setSessions(sessRes.data.sessions || []);
        setWallet(walRes.data.wallet);
        setNotifications(notifRes.data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold">
          <span className="text-[#1a237e]">Skill</span>
          <span className="text-[#FF6F00]">Barter</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile"    className="text-sm text-gray-600 hover:text-[#1a237e] font-medium">Profile</Link>
          <Link to="/directory"  className="text-sm text-gray-600 hover:text-[#1a237e] font-medium">Directory</Link>
          <Link to="/proposals"  className="text-sm text-gray-600 hover:text-[#1a237e] font-medium">Proposals</Link>
          <Link to="/wallet"     className="text-sm text-gray-600 hover:text-[#1a237e] font-medium">Wallet</Link>
          <button onClick={handleLogout}
            className="text-sm bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-100 font-medium">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a237e]">Welcome back, {user.name || 'User'} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Role: <span className="font-semibold text-[#FF6F00]">{user.role}</span></p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Skill Credits</p>
            <p className="text-3xl font-extrabold text-[#1a237e]">
              {loading ? '...' : (wallet?.balance ?? 50)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Available balance</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Sessions</p>
            <p className="text-3xl font-extrabold text-[#FF6F00]">
              {loading ? '...' : sessions.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total booked</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Notifications</p>
            <p className="text-3xl font-extrabold text-green-600">
              {loading ? '...' : notifications.filter(n => !n.isRead).length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Unread</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-base font-bold text-gray-700 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/profile"
              className="px-5 py-2 bg-[#1a237e] text-white rounded-lg text-sm font-semibold hover:bg-[#283593] transition-colors">
              ✏️ Edit Skill Profile
            </Link>
            <Link to="/directory"
              className="px-5 py-2 bg-[#FF6F00] text-white rounded-lg text-sm font-semibold hover:bg-[#e65c00] transition-colors">
              🔍 Browse Users
            </Link>
            <Link to="/wallet"
              className="px-5 py-2 border border-[#1a237e] text-[#1a237e] rounded-lg text-sm font-semibold hover:bg-[#e8eaf6] transition-colors">
              💰 My Wallet
            </Link>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-bold text-gray-700 mb-4">Recent Sessions</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No sessions yet.</p>
              <Link to="/directory"
                className="text-[#1a237e] text-sm underline font-semibold mt-2 inline-block">
                Find a mentor →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{s.skillTopic}</p>
                    <p className="text-xs text-gray-400">{new Date(s.scheduledAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold
                    ${s.status === 'completed' ? 'bg-green-100 text-green-700' :
                      s.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
