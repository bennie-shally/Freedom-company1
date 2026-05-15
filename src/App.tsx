/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { PlansPage } from './pages/PlansPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { ReferralPage } from './pages/ReferralPage';
import { HistoryPage } from './pages/HistoryPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoansPage } from './pages/LoansPage';
import { LoanApplicationPage } from './pages/LoanApplicationPage';
import { LoanProcessingPage } from './pages/LoanProcessingPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-bold tracking-[0.3em] text-gray-500 uppercase">Freedom Loading...</div>;
  if (!user) return <Navigate to="/landing" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
            <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
            <Route path="/loans/apply/:amount" element={<ProtectedRoute><LoanApplicationPage /></ProtectedRoute>} />
            <Route path="/loans/processing/:applicationId" element={<ProtectedRoute><LoanProcessingPage /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
