/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, increment, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Wallet, TrendingUp, Users, ArrowUpRight, ArrowDownLeft, Clock, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Investment } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

export const Dashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'investments'),
      where('userId', '==', user.uid),
      where('status', '==', 'running')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const investments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
      setActiveInvestments(investments);

      // Check for matured investments
      const now = new Date();
      for (const inv of investments) {
        const endTime = inv.endsAt?.toDate?.() || new Date(inv.endsAt);
        if (endTime <= now) {
          await completeInvestment(inv);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'investments');
    });

    return () => unsubscribe();
  }, [user]);

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/10" />
        <p className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">Synchronizing Node...</p>
      </div>
    );
  }

  const completeInvestment = async (inv: Investment) => {
    try {
      const batch = writeBatch(db);
      
      // Update investment status
      batch.update(doc(db, 'investments', inv.id), {
        status: 'completed'
      });

      // Credit user balance and total earnings
      batch.update(doc(db, 'users', inv.userId), {
        balance: increment(isNaN(inv.totalReturn) ? 0 : inv.totalReturn),
        totalEarnings: increment(isNaN(inv.profit) ? 0 : inv.profit)
      });

      await batch.commit();
      console.log(`Investment ${inv.id} completed and credited.`);
    } catch (err) {
      console.error('Error completing investment:', err);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8 pb-12">
      {/* User Hello */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400">Good morning,</p>
          <h2 className="text-xl font-bold">{userData.username}</h2>
        </div>
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
          <span className="text-sm font-black text-blue-400">{userData.username.substring(0, 2).toUpperCase()}</span>
        </div>
      </div>

      {/* Balance Card (Frosted Glass) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl border-white/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-10 rounded-full select-none pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 blur-[80px] -z-10 rounded-full select-none pointer-events-none" />
        
        <div className="flex justify-between items-start mb-10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Cryptographic Balance</span>
            <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Secured via SHA-256</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-3 py-1 rounded-full border border-emerald-500/20 font-black tracking-widest shadow-xl shadow-emerald-900/10">ACTIVE SYNC</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mb-12">
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
            {formatCurrency(userData.balance)}
          </h2>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Institutional Liquidity Pool</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <button 
            onClick={() => navigate('/deposit')}
            className="py-5 bg-blue-600 hover:bg-blue-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-blue-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Inject
          </button>
          <button 
            onClick={() => navigate('/withdraw')}
            className="py-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <ArrowUpRight className="w-4 h-4" />
            Extract
          </button>
        </div>
      </motion.div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-5">
        <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <span className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-500 relative z-10">Accumulated</span>
          <span className="text-2xl font-black text-emerald-400 relative z-10">+{formatCurrency(userData.totalEarnings)}</span>
        </div>
        <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all" />
          <span className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-500 relative z-10">Live Nodes</span>
          <span className="text-2xl font-black text-blue-400 relative z-10">{activeInvestments.length}</span>
        </div>
      </div>

      {/* Active Growth Plan */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Growth Plan</h3>
          <Link to="/plans" className="text-[10px] text-blue-400 font-black uppercase tracking-widest">New Cycle</Link>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="bg-slate-800/30 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-medium">Ready to start your next cycle?</p>
            <button 
              onClick={() => navigate('/plans')}
              className="mt-2 text-blue-400 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-blue-400/10 rounded-xl border border-blue-400/20"
            >
              Start Cycle
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeInvestments.map(inv => (
              <InvestmentCard key={inv.id} investment={inv} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-4 gap-4 mt-2">
        <MenuIcon emoji="📈" label="Plans" onClick={() => navigate('/plans')} />
        <MenuIcon emoji="👥" label="Referral" onClick={() => navigate('/referral')} />
        <MenuIcon emoji="📜" label="History" onClick={() => navigate('/history')} />
        <MenuIcon emoji="💬" label="Support" onClick={() => navigate('/chat')} />
      </div>

      {/* Live Payouts (Social Proof) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Payouts</h3>
        <div className="space-y-3">
          <PayoutItem user="Maria***" amount="₱8,500.00" />
          <PayoutItem user="Kevin***" amount="₱12,000.00" />
        </div>
      </section>
    </div>
  );
};

const MenuIcon = ({ emoji, label, onClick }: { emoji: string, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group">
    <div className="w-14 h-14 bg-slate-800 rounded-[20px] border border-white/5 flex items-center justify-center text-2xl group-active:scale-90 transition-all shadow-lg group-hover:border-blue-500/30">
      {emoji}
    </div>
    <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const PayoutItem = ({ user, amount }: { user: string, amount: string }) => (
  <div className="flex justify-between items-center text-[10px] bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
    <span className="text-slate-400 font-medium">{user} just withdrew</span>
    <span className="text-emerald-400 font-black">{amount} via GCash</span>
  </div>
);

const InvestmentCard: React.FC<{ investment: Investment }> = ({ investment }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = investment.endsAt?.toDate?.() || new Date(investment.endsAt);
      const end = endTime.getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Completed');
        clearInterval(timer);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [investment]);

  return (
    <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shadow-inner">
        <div className={cn("w-6 h-6 border-2 border-blue-500 rounded-full", timeLeft !== 'Completed' && "border-t-transparent animate-spin")} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-black uppercase tracking-wider">{investment.planName}</p>
          <p className="text-blue-400 text-xs font-mono font-black">{timeLeft}</p>
        </div>
        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: timeLeft === 'Completed' ? '100%' : '65%' }}
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[9px] text-slate-500 font-bold uppercase">Profit Target</p>
          <p className="text-[10px] text-emerald-400 font-bold">+{formatCurrency(investment.profit)}</p>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) => (
  <button 
    onClick={onClick}
    className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border transition-all active:scale-95", color)}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);
