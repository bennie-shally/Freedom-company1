/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, TrendingUp, Users, CheckCircle2, ChevronRight, Banknote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const testimonials = [
  { name: "Juan Dela Cruz", comment: "Malaking tulong talaga ang Freedom Company. 100% paying!", location: "Quezon City" },
  { name: "Maria Santos", comment: "Sobrang daling gamitin. Legit na legit!", location: "Cebu City" },
  { name: "Robert Lim", comment: "The best investment platform in the Philippines.", location: "Davao City" },
];

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveTransactions, setLiveTransactions] = useState<{name: string, type: string, amount: number}[]>([]);

  useEffect(() => {
    // Generate fake live transactions for "100+ loading withdrawals/deposits" vibe
    const firstNames = ["James", "Anne", "Kevin", "Lisa", "Mark", "Grace", "Paul", "Sarah", "Ryan", "Elena"];
    const types = ["Withdrawal", "Deposit"];
    
    const interval = setInterval(() => {
      const newTx = {
        name: firstNames[Math.floor(Math.random() * firstNames.length)],
        type: types[Math.floor(Math.random() * types.length)],
        amount: Math.floor(Math.random() * 45000) + 5000
      };
      setLiveTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-20 overflow-x-hidden relative min-h-screen">
      {/* Hidden Admin Entry */}
      <div 
        onClick={() => navigate('/admin/login')}
        className="absolute bottom-4 right-4 w-4 h-4 opacity-0 cursor-default hover:opacity-10 transition-opacity z-50 bg-white/5 rounded-full"
        title="Admin Entry"
      />
      {/* Hero Section */}
      <section className="px-6 md:px-8 pt-8 md:pt-14 text-center relative flex flex-col justify-center min-h-[45vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 md:gap-6"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-[0.3em] shadow-xl backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Verified Investment Network
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl xs:text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white italic uppercase bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              Freedom <br/> <span className="text-blue-500">Company</span>
            </h1>
            <p className="text-slate-500 max-w-[280px] md:max-w-md mx-auto text-[10px] md:text-sm leading-relaxed font-bold uppercase tracking-widest opacity-80">
              Freedom Company - Premium Investment Platform. Secure your financial freedom with real-time earnings and reliable growth.
            </p>
          </div>

          <div className="flex flex-col w-full max-w-sm gap-4 mt-2">
            <Link 
              to={user ? "/dashboard" : "/register"}
              className="group relative py-6 bg-white text-black font-black rounded-[2rem] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white group-hover:opacity-90 transition-opacity" />
              <span className="relative z-10 text-xs uppercase tracking-[0.2em]">Get Started Now</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="mt-0.5 flex flex-col items-center gap-2">
              <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-transparent" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Easy Investments</span>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest max-w-[200px]">Start even with zero capital via our Loan system</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Loan Highlight Section */}
      <section className="px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-10 border border-white/10 shadow-2xl"
        >
          {/* Decorative icons */}
          <div className="absolute -top-6 -right-6 opacity-10 rotate-12">
            <Banknote className="w-32 h-32 text-white" />
          </div>
          <div className="absolute -bottom-10 -left-10 opacity-5 -rotate-12">
            <ShieldCheck className="w-40 h-40 text-white" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Freedom Capital</span>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                Start Growing <br/> Without <span className="text-blue-300 underline decoration-blue-400 underline-offset-4">Capital</span>
              </h2>
              <p className="text-blue-100/70 text-[10px] md:text-xs font-black uppercase tracking-widest max-w-sm leading-relaxed">
                Freedom Company empowers everyone to build wealth. Our exclusive Loan System provides instant capital for your first investment plan. 
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Processing Time</span>
                <span className="text-white font-black">FAST APPROVAL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Max Loan</span>
                <span className="text-white font-black">₱1,000,000.00</span>
              </div>
            </div>

            <Link 
              to="/loan-info"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95"
            >
              Learn More About Loans
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Activity Board */}
      <section className="px-6">
        <div className="glass-panel border-white/10 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Live Payouts</h3>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Live</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {liveTransactions.map((tx, idx) => (
                <motion.div
                  key={idx + tx.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-800/40 border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tx.type === 'Deposit' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400')}>
                      {tx.type === 'Deposit' ? <TrendingUp className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-white">{tx.name}****</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{tx.type}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-blue-400">
                    {formatCurrency(tx.amount)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <p className="mt-8 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">100% Secure & Reliable Platform</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 grid grid-cols-2 gap-4">
        <StatCard label="Total Payouts" value="₱24.5M+" />
        <StatCard label="Success Rate" value="100%" />
        <StatCard label="Active Users" value="12k+" />
        <StatCard label="Reliability" value="High" />
      </section>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string, value: string }) => (
  <div className="glass-card p-6 rounded-[2rem] text-center border-white/10">
    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">{label}</p>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);
