/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, writeBatch, increment, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { generateReferralCode } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

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

      let referrerUid = null;
      let bonus = 0;

      // Lookup referrer and settings
      if (formData.referralCode) {
        try {
          const referralCode = formData.referralCode.toUpperCase();
          const [settingsSnap, referrerQuerySnap] = await Promise.all([
            getDoc(doc(db, 'settings', 'global')),
            getDocs(query(collection(db, 'users'), where('referralCode', '==', referralCode), limit(1)))
          ]);

          if (settingsSnap.exists()) {
            bonus = settingsSnap.data().referralBonus || 0;
          }

          if (!referrerQuerySnap.empty) {
            referrerUid = referrerQuerySnap.docs[0].id;
          } else {
            // Fallback: check lowercase if uppercase not found (for old codes)
            const fallbackSnap = await getDocs(query(collection(db, 'users'), where('referralCode', '==', formData.referralCode.toLowerCase()), limit(1)));
            if (!fallbackSnap.empty) {
              referrerUid = fallbackSnap.docs[0].id;
            } else {
              throw new Error('Invalid referral code. Please check and try again.');
            }
          }
        } catch (err: any) {
          if (err.message.includes('Invalid referral code')) throw err;
          console.error("Referral check failed:", err);
        }
      }

      const batch = writeBatch(db);

      // Initialize user data in Firestore
      batch.set(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: formData.username,
        email: formData.email,
        balance: 0,
        totalEarnings: 0,
        referralCode: generateReferralCode(),
        referredBy: formData.referralCode ? formData.referralCode.toUpperCase() : null,
        referredByUid: referrerUid,
        role: 'user',
        createdAt: serverTimestamp(),
      });

      // Apply referral bonus to referrer
      if (referrerUid && bonus > 0) {
        batch.update(doc(db, 'users', referrerUid), {
          balance: increment(bonus),
          totalEarnings: increment(bonus)
        });
      }

      await batch.commit();

      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or login.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        try {
          handleFirestoreError(err, OperationType.WRITE, 'users');
        } catch (e) {
          // If handleFirestoreError throws, it's already logged or handled
        }
        setError(err.message || 'An error occurred during registration.');
      }
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
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Create Account</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Join <span className="text-blue-500">Freedom</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          Create your account and start earning today.
        </p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-6">
        <div className="space-y-5">
          <InputGroup label="Full Name" icon={<User className="w-5 h-5" />}>
            <input
              type="text"
              required
              className="bg-transparent border-none outline-none w-full text-slate-100 placeholder:text-slate-700 font-bold uppercase tracking-tight text-sm"
              placeholder="Ex. Juan Dela Cruz"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </InputGroup>

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
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </InputGroup>

          <InputGroup label="Referral Code (Optional)" icon={<UserPlus className="w-5 h-5" />}>
            <input
              type="text"
              className="bg-transparent border-none outline-none w-full text-blue-400 placeholder:text-slate-700 font-black uppercase tracking-widest text-sm"
              placeholder="Ex. ABCD12"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
            />
          </InputGroup>
        </div>

        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">{error}</p>}

        <button
          disabled={loading}
          className="mt-4 w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Register Now'}
        </button>

        <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-4">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-blue-500">
            Login here
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
