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
    } catch (err) {
      console.error('Withdrawal error:', err);
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
    <div className="p-6 flex flex-col gap-8 pb-20 text-white">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Withdraw</h1>
        <p className="text-gray-500 text-sm">Transfer your earnings to your GCash or Bank.</p>
      </div>

      <div className="bg-brand-muted/50 border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Available Balance</span>
          <span className="text-3xl font-mono font-bold text-brand-primary">
            {formatCurrency(userData?.balance || 0)}
          </span>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Withdrawal Amount (PHP)</label>
          <input
            type="number"
            required
            placeholder="Ex. 1000"
            className="w-full bg-brand-muted/50 border border-white/5 rounded-2xl p-4 text-white text-lg font-mono placeholder:text-gray-700 outline-none focus:border-brand-primary/30 transition-all"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex justify-between px-1 mt-1">
            <span className="text-[10px] text-gray-500 font-medium">Fee: {settings?.withdrawalFeePercent}% ({formatCurrency(fee)})</span>
            <span className="text-[10px] text-green-400 font-bold">You receive: {formatCurrency(net)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Payment Method (GCash/Bank Details)</label>
          <textarea
            required
            placeholder="GCash: 09123456789 - Name: Juan Dela Cruz"
            className="w-full bg-brand-muted/50 border border-white/5 rounded-2xl p-4 text-white text-sm placeholder:text-gray-700 outline-none focus:border-brand-primary/30 transition-all h-32 resize-none"
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
          />
        </div>

        <div className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
          <AlertCircle className="w-5 h-5 text-gray-500 shrink-0" />
          <p className="text-[10px] text-gray-500 uppercase font-bold leading-relaxed tracking-wider">
            Minimum withdrawal: {formatCurrency(settings?.minWithdrawal || 500)}. Process time: 1-24 hours.
          </p>
        </div>

        <button
          disabled={loading || !amount || !bankDetails || (Number(amount) > (userData?.balance || 0))}
          className="w-full py-4 bg-brand-primary text-black font-bold rounded-2xl shadow-lg shadow-brand-primary/10 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'Processing...' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
};
