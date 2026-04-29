/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, CircleChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { SystemSettings } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

export const WithdrawPage: React.FC = () => {
  const { user, userData } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        setSettings(snap.data() as SystemSettings);
      }
    };
    fetchSettings();
  }, []);

  const calculateTotal = () => {
    const amt = Number(amount) || 0;
    const feePercent = settings?.withdrawalFeePercent || 0;
    const fee = (amt * feePercent) / 100;
    return { fee, net: amt - fee };
  };

  const { fee, net } = calculateTotal();

    const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData || !amount || !bankDetails || !settings) return;

    const withdrawAmt = Number(amount);

    if (withdrawAmt < (settings.minWithdrawal || 500)) {
       alert(`Minimum withdrawal is ${formatCurrency(settings.minWithdrawal || 500)}`);
       return;
    }

    if (withdrawAmt > userData.balance) {
      alert('Insufficient balance.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create withdrawal request
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        username: userData.username,
        amount: withdrawAmt,
        fee,
        netAmount: net,
        bankDetails,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 2. Deduct from balance immediately
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-withdrawAmt)
      });

      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'withdrawals');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="p-6 h-[70vh] flex flex-col items-center justify-center text-center gap-6">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">Request Sent!</h2>
        <p className="text-gray-400">Your withdrawal is being processed. Funds will be sent to your account shortly.</p>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-10 pb-24 text-white">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Extract Wealth</h1>
        <p className="text-slate-500 text-sm font-medium">Safe channel for fund extraction to your GCash Node.</p>
      </div>

      <div className="glass-panel border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">Available Cryptic Pool</span>
          <span className="text-4xl font-black text-white">
            {formatCurrency(userData?.balance || 0)}
          </span>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Extraction Amount (PHP)</label>
          <input
            type="number"
            required
            placeholder="0.00"
            className="w-full glass-panel border-white/10 rounded-[1.5rem] p-6 text-white text-2xl font-black placeholder:text-slate-800 outline-none focus:border-blue-500/30 transition-all font-mono"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex justify-between px-2 mt-2">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Protocol Fee: {settings?.withdrawalFeePercent}%</span>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Net: {formatCurrency(net)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">GCash Endpoint Details</label>
          <textarea
            required
            placeholder="GCash: 09********* - Name: [IDENTITY]"
            className="w-full glass-panel border-white/10 rounded-[1.5rem] p-6 text-white text-sm font-bold placeholder:text-slate-800 outline-none focus:border-blue-500/30 transition-all h-40 resize-none leading-relaxed"
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
          />
        </div>

        <div className="flex gap-4 p-6 bg-slate-900/40 rounded-[2rem] border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-[9px] text-slate-600 uppercase font-black leading-loose tracking-[0.1em]">
            Min: {formatCurrency(settings?.minWithdrawal || 500)} | Cycles: 1-24hrs | Verification Required
          </p>
        </div>

        <button
          disabled={loading || !amount || !bankDetails || (Number(amount) > (userData?.balance || 0))}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-900/40 active:scale-[0.98] transition-all disabled:opacity-50 text-[11px] uppercase tracking-[0.3em]"
        >
          {loading ? 'Decrypting...' : 'Initiate Extraction'}
        </button>
      </form>
    </div>
  );
};
