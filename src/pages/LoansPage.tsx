/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, ShieldCheck, Clock, Percent, ArrowDownLeft } from 'lucide-react';
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
    <div className="flex flex-col gap-10 pb-32 pt-4 px-6 text-white overflow-hidden">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Credit System</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Loan <span className="text-blue-500">Service</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          Need capital? Apply for a loan and start your investment journey with Freedom Company.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-md">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Loans</p>
           <p className="text-xl font-black text-white italic tracking-tighter uppercase">₱150M+</p>
        </div>
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-md">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
           <p className="text-xl font-black text-emerald-400 italic tracking-tighter uppercase">Online</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {loanPlans.map((plan, idx) => (
          <motion.div
            key={plan.amount}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/5 backdrop-blur-xl p-8 transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all" />

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                   <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                     {formatCurrency(plan.amount)}
                   </h3>
                   <div className="flex gap-3">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{plan.interest} APR</span>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{plan.duration}</span>
                   </div>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500">
                   <Banknote className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2 py-4 border-y border-white/5">
                 {plan.features.slice(0, 2).map((f) => (
                   <div key={f} className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                     {f}
                   </div>
                 ))}
              </div>

              <button
                onClick={() => navigate(`/loans/apply/${plan.amount}`)}
                className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Apply For Loan
                <ArrowDownLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Quote */}
      <section className="px-8 py-10 opacity-60 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] leading-relaxed">
          Secure Investment Credit System
        </p>
      </section>
    </div>
  );
};
