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
  const [step, setStep] = useState(1); // 1: Password, 2: Firebase Identity
  const [accessKey, setAccessKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccessKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === 'FreedomAdmin2024!') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setStep(2);
      setError('');
    } else {
      setError('Invalid Operational Access Key');
    }
  };

  const handleIdentityLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError('Identity Verification Failed: ' + err.message);
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
              {step === 1 ? 'Security Node' : 'Identity Protocol'}
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
              {step === 1 ? 'Phase 01: Encryption' : 'Phase 02: Verification'}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleAccessKey} className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-[9px] uppercase font-black text-slate-600 tracking-[0.3em] ml-2">Access Key Override</label>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-[1.5rem] focus-within:border-blue-500/30 transition-all group">
                <Lock className="w-5 h-5 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-800 font-black tracking-[0.5em] text-lg uppercase"
                  placeholder="••••••••"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
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
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[1.5rem] shadow-2xl shadow-blue-900/40 active:scale-[0.98] transition-all"
            >
              Verify Phase 01
            </button>
          </form>
        ) : (
          <form onSubmit={handleIdentityLogin} className="flex flex-col gap-6">
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
              className="w-full py-5 bg-white text-black hover:bg-slate-200 font-black uppercase tracking-[0.3em] text-[11px] rounded-[1.5rem] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Decrypting...' : 'Finalize Access'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-slate-400">Back to Phase 01</button>
          </form>
        )}

        <button 
          onClick={() => navigate('/')} 
          className="mt-8 flex items-center justify-center gap-3 text-[10px] text-slate-600 hover:text-slate-400 transition-colors w-full uppercase font-black tracking-[0.3em]"
        >
          <ArrowLeft className="w-4 h-4" /> Terminate Link
        </button>
      </div>
    </div>
  );
};
