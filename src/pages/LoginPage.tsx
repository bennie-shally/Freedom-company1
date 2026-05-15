/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate(redirectTo);
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8 flex flex-col pt-12 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />

      <button onClick={() => navigate('/')} className="mb-12 p-3 w-fit rounded-2xl bg-white/5 text-slate-400 border border-white/5 active:scale-95 transition-all">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex flex-col gap-3 mb-12">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Secure Login</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Welcome <span className="text-blue-500">Back</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          Log in to your account to manage your investments.
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="space-y-5">
          <InputGroup label="Email Address" icon={<Mail className="w-5 h-5" />}>
            <input
              type="email"
              required
              className="bg-transparent border-none outline-none w-full text-slate-100 placeholder:text-slate-700 font-bold text-sm"
              placeholder="Ex. juan@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </InputGroup>

          <InputGroup label="Password" icon={<Lock className="w-5 h-5" />}>
            <input
              type="password"
              required
              className="bg-transparent border-none outline-none w-full text-slate-100 placeholder:text-slate-700 font-black text-sm"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </InputGroup>
        </div>

        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">{error}</p>}

        <button
          disabled={loading}
          className="mt-4 w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Logging in...' : <><LogIn className="w-5 h-5" /> Login Now</>}
        </button>

        <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-4">
          No account yet?{' '}
          <button type="button" onClick={() => navigate('/register')} className="text-blue-500">
            Register here
          </button>
        </p>
      </form>
    </div>
  );
};

const InputGroup = ({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] uppercase font-black text-slate-600 tracking-[0.3em] ml-2">{label}</label>
    <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-3xl focus-within:bg-white/10 focus-within:border-white/10 transition-all backdrop-blur-md">
      <div className="text-slate-500">{icon}</div>
      {children}
    </div>
  </div>
);
