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
    <div className="flex flex-col gap-10 pb-32 pt-4 px-6 text-white overflow-hidden">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Withdraw Funds</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Withdraw <span className="text-blue-500">Money</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          Request a withdrawal of your earnings. Funds will be sent directly to your GCash account.
        </p>
      </div>

      <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="flex flex-col gap-1 relative z-10">
          <span className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em]">Available Balance</span>
          <span className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mt-2">
            {formatCurrency(userData?.balance || 0)}
          </span>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="flex flex-col gap-10">
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] ml-2 italic">Withdraw Amount (PHP)</label>
          <input
            type="number"
            required
            placeholder="0.00"
            className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] p-8 text-white text-4xl font-black italic tracking-tighter placeholder:text-slate-800 outline-none focus:bg-white/10 transition-all shadow-inner"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex justify-between px-4">
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic">Withdrawal Fee: {settings?.withdrawalFeePercent}%</span>
            <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest italic">Net Received: {formatCurrency(net)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] ml-2 italic">Your GCash Details</label>
          <textarea
            required
            placeholder="GCash Name & Number"
            className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 text-white text-sm font-bold placeholder:text-slate-800 outline-none focus:bg-white/10 transition-all h-32 resize-none leading-relaxed shadow-inner"
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
          />
        </div>

        <div className="p-6 bg-[#121212] rounded-[2rem] border border-white/5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <p className="text-[8px] text-slate-600 uppercase font-black leading-relaxed tracking-[0.2em]">
            Min Withdrawal: {formatCurrency(settings?.minWithdrawal || 500)}<br/>
            Processing Time: 1-24 hours<br/>
            Status: Active
          </p>
        </div>

        <button
          disabled={loading || !amount || !bankDetails || (Number(amount) > (userData?.balance || 0))}
          className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
};
