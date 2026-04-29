/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { generateReferralCode } from '../lib/utils';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    referralCode: searchParams.get('ref') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Initialize user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: formData.username,
        email: formData.email,
        balance: 0,
        totalEarnings: 0,
        referralCode: generateReferralCode(),
        referredBy: formData.referralCode || null,
        role: 'user',
        createdAt: serverTimestamp(),
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
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
        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        <p className="text-gray-500">Join Freedom Company today and start earning.</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div className="space-y-4">
          <InputGroup label="Full Name" icon={<User className="w-5 h-5" />}>
            <input
              type="text"
              required
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600"
              placeholder="Ex. Juan Dela Cruz"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </InputGroup>

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
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </InputGroup>

          <InputGroup label="Referral Code (Optional)" icon={<UserPlus className="w-5 h-5" />}>
            <input
              type="text"
              className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 uppercase"
              placeholder="Ex. ABCD12"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
            />
          </InputGroup>
        </div>

        {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

        <button
          disabled={loading}
          className="mt-4 w-full py-4 bg-brand-primary text-black font-bold rounded-2xl shadow-lg shadow-brand-primary/10 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Continue'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-brand-primary font-bold">
            Login here
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
