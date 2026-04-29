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

const defaultPlans: InvestmentPlan[] = [
  { id: '1', name: 'Freedom Starter', minAmount: 5000, maxAmount: 10000, profitPercent: 50, durationHours: 8 },
  { id: '2', name: 'Freedom Pro', minAmount: 15000, maxAmount: 25000, profitPercent: 75, durationHours: 8 },
  { id: '3', name: 'Freedom Elite', minAmount: 30000, maxAmount: 50000, profitPercent: 100, durationHours: 8 },
];

export const PlansPage: React.FC = () => {
  const { userData, user } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>(defaultPlans);
  const [investAmount, setInvestAmount] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally fetch dynamic plans from admin settings
    const fetchPlans = async () => {
      const snap = await getDocs(collection(db, 'investment_plans'));
      if (!snap.empty) {
        setPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestmentPlan)));
      }
    };
    fetchPlans();
  }, []);

  const handleInvest = async (plan: InvestmentPlan) => {
    if (!userData || !user) return;

    if (userData.balance < plan.minAmount) {
      alert(`Insufficient balance. Minimum investment for this plan is ${formatCurrency(plan.minAmount)}.`);
      navigate('/deposit');
      return;
    }

    setLoading(true);
    try {
      const amount = plan.minAmount; // Simplification: always invest min for now or add an input
      const profit = (amount * plan.profitPercent) / 100;
      const totalReturn = amount + profit;
      const startedAt = new Date();
      const endsAt = new Date(startedAt.getTime() + plan.durationHours * 60 * 60 * 1000);

      // Create investment record
      await addDoc(collection(db, 'investments'), {
        userId: user.uid,
        planName: plan.name,
        amount,
        profit,
        totalReturn,
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
    } catch (err) {
      console.error('Investment error:', err);
      alert('Failed to process investment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Growth Plans</h1>
        <p className="text-slate-500 text-sm font-medium">Choose a plan that fits your goals. High-speed cycles with guaranteed returns.</p>
      </div>

      <div className="flex flex-col gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col gap-8 transition-all hover:border-blue-500/30"
          >
            {/* Plan Header */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-white leading-none">{plan.name}</h3>
                <div className="flex items-center gap-1.5 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mt-3">
                  <Shield className="w-3 h-3" />
                  Secured Payout
                </div>
              </div>
              <div className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-2xl text-2xl font-black shadow-inner shadow-blue-500/10">
                {plan.profitPercent}%
              </div>
            </div>

            {/* Plan Details */}
            <div className="grid grid-cols-2 gap-8">
              <DetailItem label="Cycle" value={`${plan.durationHours} Hours`} />
              <DetailItem label="Range" value={`${formatCurrency(plan.minAmount)}`} />
            </div>

            {/* CTA */}
            <button
              onClick={() => handleInvest(plan)}
              disabled={loading}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              Invest Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest font-black">
          Automatic maturity: Your profit is credited exactly 8 hours after cycle initiation. Terms & conditions apply.
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
