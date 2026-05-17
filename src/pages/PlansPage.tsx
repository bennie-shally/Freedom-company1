/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Wallet, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InvestmentPlan } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

export const PlansPage: React.FC = () => {
  const { userData, user } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally fetch dynamic plans from admin settings
    const fetchPlans = async () => {
      try {
          const snap = await getDocs(collection(db, 'investment_plans'));
          if (!snap.empty) {
            const fetchedPlans = snap.docs.map(doc => {
              const data = doc.data();
              return { 
                id: doc.id, 
                ...data,
                // Ensure compatibility with different property names
                profitAmount: data.profitAmount || (data.minAmount * (data.profitPercent || 0) / 100) || 0 
              } as InvestmentPlan;
            });
            setPlans(fetchedPlans);
            
            // Initialize default amounts
            const initialAmounts: { [key: string]: number } = {};
            fetchedPlans.forEach(p => {
              initialAmounts[p.id] = p.minAmount;
            });
            setAmounts(initialAmounts);
          } else {
            setPlans([]); // Ensure empty array if no plans found
          }
      } catch (err: any) {
          handleFirestoreError(err, OperationType.LIST, 'investment_plans');
      }
    };
    fetchPlans();
  }, []);

  const handleInvest = async (plan: InvestmentPlan) => {
    if (!userData || !user) return;
    
    const amount = amounts[plan.id] || plan.minAmount;

    if (amount < plan.minAmount) {
      alert(`Minimum investment for this plan is ${formatCurrency(plan.minAmount)}.`);
      return;
    }

    if (amount > plan.maxAmount) {
      alert(`Maximum investment for this plan is ${formatCurrency(plan.maxAmount)}.`);
      return;
    }

    if (userData.balance < amount) {
      alert(`Insufficient balance. Your balance is ${formatCurrency(userData.balance)}.`);
      navigate('/deposit');
      return;
    }

    setLoading(true);
    try {
      // PROPORTIONAL PROFIT CALCULATION
      // (amount / plan.minAmount) * plan.profitAmount
      const ratio = amount / plan.minAmount;
      const profit = Math.floor((plan.profitAmount || 0) * ratio);
      const totalReturn = amount + profit;
      const startedAt = new Date();
      
      let durationMs = 0;
      if (plan.durationHours) durationMs = plan.durationHours * 60 * 60 * 1000;
      else if (plan.durationDays) durationMs = plan.durationDays * 24 * 60 * 60 * 1000;
      
      const endsAt = new Date(startedAt.getTime() + durationMs);

      // Create investment record
      await addDoc(collection(db, 'investments'), {
        userId: user.uid,
        planName: plan.name,
        amount,
        profit: isNaN(profit) ? 0 : profit,
        totalReturn: isNaN(totalReturn) ? 0 : totalReturn,
        startedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // Added for consistency in history
        endsAt: endsAt,
        status: 'running',
      });

      // Deduct from balance
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-amount)
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Investment error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'investments');
      alert('Failed to process investment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-32 pt-4 px-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Available Plans</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Investment <span className="text-blue-500">Plans</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          Choose a plan that fits your budget. Your earnings are guaranteed and secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-[2rem] bg-[#121212] border border-white/5 backdrop-blur-xl p-6 transition-all hover:border-blue-500/30 active:scale-[0.99] flex flex-col gap-6"
          >
            {/* Header: Name & Badge */}
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{plan.name}</h3>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500/70">
                  <Shield className="w-3 h-3" />
                  Verified Asset
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg text-blue-400 text-[10px] font-black uppercase tracking-widest">
                {plan.durationHours || (plan.durationDays ? plan.durationDays * 24 : 8)}H Term
              </div>
            </div>

            {/* Profit & Stats */}
            <div className="flex justify-between items-center py-5 border-y border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Potential ROI</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-none whitespace-nowrap">
                  <span className="text-blue-500 mr-0.5">+</span>{formatCurrency(Math.floor(((amounts[plan.id] || plan.minAmount) / plan.minAmount) * (plan.profitAmount || 0)))}
                </div>
              </div>
              <div className="text-right flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Policy Limit</span>
                <div className="text-xs font-black text-white/70 uppercase tracking-tight">Max {formatCurrency(plan.maxAmount)}</div>
              </div>
            </div>

            {/* Amount Input Section */}
            <div className="space-y-5">
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="text-xl font-black text-blue-500 shadow-blue-500/20">₱</span>
                </div>
                <input 
                  type="number"
                  value={amounts[plan.id] || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmounts({ ...amounts, [plan.id]: val });
                  }}
                  placeholder={`Min Amount: ${plan.minAmount}`}
                  className="w-full bg-white/5 border border-white/5 rounded-[1.25rem] py-5 pl-12 pr-5 text-2xl font-black text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/5"
                />
                <div className="flex justify-between items-center mt-3 px-2">
                  <button 
                    onClick={() => setAmounts({...amounts, [plan.id]: plan.minAmount})}
                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors py-1 underline underline-offset-4 decoration-blue-500/30"
                  >
                    Set Minimum
                  </button>
                  <button 
                    onClick={() => setAmounts({...amounts, [plan.id]: Math.min(userData?.balance || 0, plan.maxAmount)})}
                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors py-1 underline underline-offset-4 decoration-blue-500/30"
                  >
                    Max Available
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleInvest(plan)}
                disabled={loading}
                className="w-full py-6 bg-white text-black rounded-[1.25rem] font-black uppercase tracking-[0.25em] text-[11px] shadow-[0_15px_40px_-15px_rgba(255,255,255,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-white/90 disabled:opacity-50"
              >
                Capitalize Plan
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Background Grain/Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-50" />
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest font-black">
          Automatic payout: Your profit is credited to your balance after the plan duration ends. Terms & conditions apply.
        </p>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">{label}</span>
    <span className="text-base font-black text-white">{value}</span>
  </div>
);
