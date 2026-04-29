/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'FreedomAdmin2024!') {
      // For this demo context, we'll store a flag in sessionStorage or check role in AuthContext.
      // The user specially asked for a "Fixed password" access.
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect Admin Password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-brand-muted/50 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 mb-8 text-center">
          <div className="w-16 h-16 rounded-[24px] bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-widest">Admin Control</h1>
            <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">Restricted Area - Authorized Personnel Only</p>
          </div>
        </div>

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Access Key</label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl focus-within:border-brand-primary/30 transition-all">
              <Lock className="w-5 h-5 text-gray-600" />
              <input
                type="password"
                required
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-700 font-mono tracking-[0.5em]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-bold text-center uppercase tracking-wider">{error}</p>}

          <button
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all"
          >
            Authenticate
          </button>
        </form>

        <button 
          onClick={() => navigate('/')} 
          className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors w-full uppercase font-bold tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
      </div>
    </div>
  );
};
