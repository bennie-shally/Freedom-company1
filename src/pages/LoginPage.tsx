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
    <div className="min-h-screen bg-[#0A0A0A] p-6 flex flex-col pt-12">
      <button onClick={() => navigate('/')} className="mb-8 p-2 w-fit rounded-full bg-white/5 text-gray-400">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-gray-500">Log in to manage your investments.</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="space-y-4">
          <InputGroup label="Email Address" icon={<Mail className="w-5 h-5" />}>
            <input
              type="email"
              required
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600"
              placeholder="Ex. juan@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </InputGroup>

          <InputGroup label="Password" icon={<Lock className="w-5 h-5" />}>
            <input
              type="password"
              required
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </InputGroup>
        </div>

        {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

        <button
          disabled={loading}
          className="mt-4 w-full py-4 bg-brand-primary text-black font-bold rounded-2xl shadow-lg shadow-brand-primary/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Logging in...' : <><LogIn className="w-5 h-5" /> Login</>}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/register')} className="text-brand-primary font-bold">
            Create one now
          </button>
        </p>
      </form>
    </div>
  );
};

const InputGroup = ({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">{label}</label>
    <div className="flex items-center gap-3 bg-brand-muted/50 border border-white/5 p-4 rounded-2xl focus-within:border-brand-primary/30 transition-all">
      <div className="text-gray-500">{icon}</div>
      {children}
    </div>
  </div>
);
