import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const Wallet: React.FC = () => {
  const [wallet, setWallet]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    API.get('/wallet')
      .then(r => setWallet(r.data.wallet))
      .catch(() => setError('Could not load wallet.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold">
          <span className="text-[#1a237e]">Skill</span><span className="text-[#FF6F00]">Barter</span>
        </div>
        <Link to="/dashboard" className="text-sm text-[#1a237e] font-semibold">← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1a237e] mb-6">💰 My Wallet</h1>

        {loading && <p className="text-gray-400">Loading wallet...</p>}
        {error   && <p className="text-red-500">{error}</p>}

        {wallet && (
          <>
            {/* Balance Card */}
            <div className="bg-[#1a237e] text-white rounded-2xl p-8 mb-6 shadow-lg">
              <p className="text-sm opacity-70 mb-1">Available Skill Credits</p>
              <p className="text-5xl font-extrabold">{wallet.balance}</p>
              <p className="text-sm opacity-70 mt-2">credits</p>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-base font-bold text-gray-700 mb-4">Transaction History</h2>
              {wallet.transactions?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {wallet.transactions?.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{t.description}</p>
                        <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`text-sm font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'credit' ? '+' : '-'}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wallet;
