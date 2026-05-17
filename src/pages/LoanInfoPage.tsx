/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Banknote, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Scale
} from 'lucide-react';

export const LoanInfoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-10 pb-32 pt-8 px-6 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1 text-right">Freedom Capital</span>
          <span className="text-[12px] font-black text-white italic tracking-tighter leading-none text-right">EXPLAINED</span>
        </div>
      </div>

      {/* Hero */}
      <section className="flex flex-col gap-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 bg-blue-600/20 rounded-[2rem] flex items-center justify-center border border-blue-500/20 text-blue-400">
            <Banknote className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
            Grow Wealth <br/> <span className="text-blue-500">With Us</span>
          </h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
            Freedom Company - The only platform that gives you capital to start your investment journey.
          </p>
        </motion.div>
      </section>

      {/* Main Pitch */}
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6">
             <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
               <Zap className="w-6 h-6" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic tracking-tight">Zero Capital Start</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Freedom Company understands that many people have the ambition but lack the initial capital. We bridges this gap by providing internal loans specifically for investment purposes. Start earning even if you have zero savings today.
                </p>
             </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
               <TrendingUp className="w-6 h-6" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic tracking-tight">Repay From Profit</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Our system is unique: your loan is used to fund an investment plan. Once that plan generates profit, you can easily pay back the loan from your earnings. No other site offers this level of trust and financial empowerment.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Limits & Legitimacy */}
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Global Standards</span>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Verified & Trusted</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="px-6 py-8 bg-blue-900/10 border border-blue-500/10 rounded-[2rem] text-center">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Maximum Loan</p>
             <p className="text-xl font-black text-white italic tracking-tighter">₱1,000,000</p>
          </div>
          <div className="px-6 py-8 bg-blue-900/10 border border-blue-500/10 rounded-[2rem] text-center">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Minimum Loan</p>
             <p className="text-xl font-black text-white italic tracking-tighter">₱50,000</p>
          </div>
        </div>

        <div className="grid gap-4">
           <TrustBadge icon={<ShieldCheck className="w-4 h-4" />} text="Philippines Number 1 Trusted Platform" />
           <TrustBadge icon={<CheckCircle2 className="w-4 h-4" />} text="Official Government Verified Platform" />
           <TrustBadge icon={<Scale className="w-4 h-4" />} text="Legit & Secure Investment Capital" />
        </div>
      </section>

      {/* Call to Action */}
      <div className="mt-8 flex flex-col gap-6 items-center">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center max-w-xs leading-relaxed">
          Freedom Company is the only legitimate platform that provides direct capital to help people grow their investments.
        </p>

        <button 
          onClick={() => navigate('/register')}
          className="w-full py-6 bg-white text-black font-black rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
        >
          Create Free Account
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-[9px] text-slate-700 font-black uppercase tracking-widest pb-10">
        © 2024 Freedom Company Capital Group
      </p>
    </div>
  );
};

const TrustBadge = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-5 rounded-2xl">
    <div className="text-blue-500">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{text}</span>
  </div>
);
