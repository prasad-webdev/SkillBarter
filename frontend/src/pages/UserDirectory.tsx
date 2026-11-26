import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const UserDirectory: React.FC = () => {
  const [users, setUsers]     = useState<any[]>([]);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (role)   params.role   = role;
      const { data } = await API.get('/users', { params });
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(); };

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold">
          <span className="text-[#1a237e]">Skill</span><span className="text-[#FF6F00]">Barter</span>
        </div>
        <Link to="/dashboard" className="text-sm text-[#1a237e] font-semibold">← Dashboard</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1a237e] mb-2">🔍 User Directory</h1>
        <p className="text-gray-500 text-sm mb-6">Find mentors and learners to swap skills with</p>

        {/* Search + Filter */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8 flex-wrap">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, skill..."
            className="flex-1 h-11 px-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a237e] min-w-[200px]"
          />
          <select value={role} onChange={e => setRole(e.target.value)}
            className="h-11 px-4 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a237e]">
            <option value="">All Roles</option>
            <option value="Mentor">Mentor</option>
            <option value="Learner">Learner</option>
            <option value="PeerSwapper">Peer Swapper</option>
          </select>
          <button type="submit"
            className="h-11 px-6 bg-[#1a237e] text-white rounded-lg text-sm font-semibold hover:bg-[#283593] transition-colors">
            Search
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <p className="text-gray-400 text-center py-10">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No users found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.map((u: any) => (
              <div key={u.id} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a237e] flex items-center justify-center text-white font-bold text-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${u.role === 'Mentor' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'PeerSwapper' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'}`}>
                      {u.role}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {u.bio && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{u.bio}</p>
                )}

                {/* Skills Offered */}
                {u.skillsOffered?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Can Teach:</p>
                    <div className="flex flex-wrap gap-1">
                      {u.skillsOffered.slice(0, 3).map((s: any) => (
                        <span key={s.skillName} className="text-xs bg-[#e8eaf6] text-[#1a237e] px-2 py-0.5 rounded-full font-medium">
                          {s.skillName}
                        </span>
                      ))}
                      {u.skillsOffered.length > 3 && (
                        <span className="text-xs text-gray-400">+{u.skillsOffered.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Credits */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    💰 {u.wallet?.balance ?? 50} credits
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/book/${u.id}`}
                      className="text-xs font-semibold text-white bg-[#1a237e] px-2 py-1 rounded-lg hover:bg-[#283593] transition-colors">
                      📅 Book
                    </Link>
                    <Link to={`/proposals/${u.id}`}
                      className="text-xs font-semibold text-[#FF6F00] border border-[#FF6F00] px-2 py-1 rounded-lg hover:bg-[#fff3e0] transition-colors">
                      🤝 Swap
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDirectory;
