/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, ShieldCheck, Clock, Percent } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const loanPlans = [
  { 
    amount: 50000, 
    interest: '2.5%', 
    duration: '6-12 Months',
    features: ['Low Interest Rate', 'Fast Approval', 'Direct to GCash/Bank']
  },
  { 
    amount: 70000, 
    interest: '2.8%', 
    duration: '12-24 Months',
    features: ['Flexible Terms', 'No Hidden Fees', 'Instant Transfer']
  },
  { 
    amount: 100000, 
    interest: '3.0%', 
    duration: '24-36 Months',
    features: ['Business Capital', 'High Approval Rate', 'Secured Transaction']
  },
  { 
    amount: 200000, 
    interest: '3.5%', 
    duration: '36-48 Months',
    features: ['Emergency Funding', 'Premium Support', 'Tailored Payments']
  },
  { 
    amount: 300000, 
    interest: '4.0%', 
    duration: '48-60 Months',
    features: ['Maximum Expansion', 'VIP Processing', 'Legacy Support']
  },
];

export const LoansPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-12 pb-24 overflow-x-hidden relative min-h-screen pt-8">
      {/* Header */}
      <div className="px-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/landing')}
          className="w-12 h-12 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-white italic tracking-tighter">FREEDOM LOANS</h1>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Premium Credit Solutions</p>
        </div>
      </div>

      {/* Hero Stats */}
      <section className="px-6 flex flex-col gap-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">No Money to Invest?</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Freedom Loans specialized in bridging the gap. We provide the capital you need to start your investment cycles now, so you can earn even if you start from zero.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 rounded-[2rem] border-white/5 bg-slate-800/30">
            <ShieldCheck className="w-6 h-6 text-blue-400 mb-4" />
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Approved</p>
            <p className="text-xl font-black text-white">₱150M+</p>
          </div>
          <div className="glass-card p-6 rounded-[2rem] border-white/5 bg-slate-800/30">
            <Clock className="w-6 h-6 text-emerald-400 mb-4" />
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Time</p>
            <p className="text-xl font-black text-white">5-10 MINS</p>
          </div>
        </div>
      </section>

      {/* Loan Plans Grid */}
      <section className="px-6 space-y-6">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-black text-white tracking-widest">SELECT PLAN</h2>
          <div className="h-1 w-20 bg-blue-600 rounded-full" />
        </div>

        <div className="flex flex-col gap-6">
          {loanPlans.map((plan, idx) => (
            <motion.div
              key={plan.amount}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel group relative overflow-hidden rounded-[2.5rem] border border-white/10 p-8 hover:border-blue-500/30 hover:bg-slate-800/40 transition-all duration-500"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all" />
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-2">
                       {formatCurrency(plan.amount)}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <Percent className="w-3.5 h-3.5" />
                        {plan.interest} / Month
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        {plan.duration}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400">
                    <Banknote className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-3 py-4 border-y border-white/5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#2563eb]" />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/loans/apply/${plan.amount}`)}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-sm uppercase tracking-[0.2em]"
                >
                  Apply For Loan
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Quote */}
      <section className="px-8 py-10 opacity-60 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] leading-relaxed">
          Secured By Freedom Advanced Credit Verification Systems v4.2
        </p>
      </section>
    </div>
  );
};
