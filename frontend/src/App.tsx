import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register      from './pages/Register';
import Login         from './pages/Login';
import SkillProfile  from './pages/SkillProfile';
import Dashboard     from './pages/Dashboard';
import UserDirectory from './pages/UserDirectory';
import Wallet        from './pages/Wallet';
import SwapProposal  from './pages/SwapProposal';
import BookSession   from './pages/BookSession';

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login"    element={<Login />} />

      {/* Protected */}
      <Route path="/profile"              element={<ProtectedRoute><SkillProfile /></ProtectedRoute>} />
      <Route path="/dashboard"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/directory"            element={<ProtectedRoute><UserDirectory /></ProtectedRoute>} />
      <Route path="/wallet"               element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/proposals"            element={<ProtectedRoute><SwapProposal /></ProtectedRoute>} />
      <Route path="/proposals/:userId"    element={<ProtectedRoute><SwapProposal /></ProtectedRoute>} />
      <Route path="/book/:mentorId"       element={<ProtectedRoute><BookSession /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
