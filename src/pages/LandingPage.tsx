/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, TrendingUp, Users, CheckCircle2, ChevronRight } from 'lucide-react';
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
    <div className="flex flex-col gap-16 pb-20 overflow-x-hidden relative min-h-screen">
      {/* Hidden Admin Entry */}
      <div 
        onClick={() => navigate('/admin/login')}
        className="absolute bottom-4 right-4 w-4 h-4 opacity-0 cursor-default hover:opacity-10 transition-opacity z-50 bg-white/5 rounded-full"
        title="Admin Entry"
      />
      {/* Hero Section */}
      <section className="px-6 md:px-8 pt-10 md:pt-16 text-center relative max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 md:gap-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            Vercel Powered Nodes
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white">
            Freedom <span className="text-blue-400">Company</span> Ecosystem
          </h1>
          <p className="text-slate-400 max-w-[280px] md:max-w-sm mx-auto text-xs md:text-sm leading-relaxed font-medium">
            The Philippines' most trusted investment platform. Experience seamless cycles with GCash integration.
          </p>
          <div className="flex flex-col w-full gap-3 md:gap-4 mt-2">
            <Link 
              to={user ? "/dashboard" : "/register"}
              className="py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Start Earning Now
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live Activity Board */}
      <section className="px-6">
        <div className="glass-panel border-white/10 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Live Payout Engine</h3>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Synchronized</span>
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
          
          <p className="mt-8 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">High Volume Traffic: 1.2k req/sec</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 grid grid-cols-2 gap-4">
        <StatCard label="Circulating" value="₱24.5M+" />
        <StatCard label="Success Rate" value="100%" />
        <StatCard label="Verified" value="12k+" />
        <StatCard label="Cycles" value="8" />
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
