/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Single-stage login: verify identity directly with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Secondary check to ensure it's the specific admin email
      if (userCredential.user.email === 'btechtools.ng@gmail.com') {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized: Administrative access restricted to authorized accounts.');
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Verification Failed: Passcode mismatch. Please update your account password in Firebase Console to match "FreedomAdmin2024!".');
      } else {
        setError('Access Denied: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)] pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel border-white/10 rounded-[3rem] p-10 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center gap-8 mb-10 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase leading-none">
              Admin Access
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
              Central Control Node
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase font-black text-slate-600 tracking-[0.3em] ml-2">Admin Identity (Email)</label>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[1.2rem] focus-within:border-blue-500/30 transition-all">
              <Mail className="w-5 h-5 text-slate-600" />
              <input
                type="email"
                required
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-800 font-bold"
                placeholder="admin@freedom.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase font-black text-slate-600 tracking-[0.3em] ml-2">Secure Passcode</label>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[1.2rem] focus-within:border-blue-500/30 transition-all">
              <Lock className="w-5 h-5 text-slate-600" />
              <input
                type="password"
                required
                className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-800 font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          <button
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[1.5rem] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Decrypting...' : 'Authorize Access'}
          </button>
        </form>

        <button 
          onClick={() => navigate('/')} 
          className="mt-8 flex items-center justify-center gap-3 text-[10px] text-slate-600 hover:text-slate-400 transition-colors w-full uppercase font-black tracking-[0.3em]"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Node
        </button>
      </div>
    </div>
  );
};

