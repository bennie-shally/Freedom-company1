/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, increment, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, TrendingUp, Users, ArrowUpRight, ArrowDownLeft, Clock, Zap, Banknote, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Investment } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { TradingChart } from '../components/TradingChart';

// Real-time Simulated Payout Pool (100+ items)
const PAYOUT_POOL = [
  { user: "Juan D.", amount: "₱15,000" }, { user: "Maria C.", amount: "₱8,500" },
  { user: "Ricardo S.", amount: "₱25,000" }, { user: "Elena G.", amount: "₱12,000" },
  { user: "Paolo M.", amount: "₱50,000" }, { user: "Sarah L.", amount: "₱4,200" },
  { user: "Benji K.", amount: "₱9,000" }, { user: "Chris T.", amount: "₱18,500" },
  { user: "Dina V.", amount: "₱30,000" }, { user: "Emman R.", amount: "₱2,500" },
  { user: "Flexi J.", amount: "₱11,000" }, { user: "Gelo P.", amount: "₱7,800" },
  { user: "Hanz B.", amount: "₱45,000" }, { user: "Ivy W.", amount: "₱13,200" },
  { user: "Jojo F.", amount: "₱6,000" }, { user: "Kiko L.", amount: "₱22,000" },
  { user: "Lina M.", amount: "₱16,500" }, { user: "Manny P.", amount: "₱100,000" },
  { user: "Nico S.", amount: "₱3,500" }, { user: "Odie R.", amount: "₱14,000" },
  { user: "Pia G.", amount: "₱28,000" }, { user: "Quinn D.", amount: "₱9,500" },
  { user: "Renz V.", amount: "₱17,000" }, { user: "Santi L.", amount: "₱5,000" },
  { user: "Toni C.", amount: "₱12,500" }, { user: "Uly B.", amount: "₱8,900" },
  { user: "Vina K.", amount: "₱21,000" }, { user: "Wally G.", amount: "₱35,000" },
  { user: "Xander M.", amount: "₱4,800" }, { user: "Yani R.", amount: "₱15,500" },
  { user: "Zack P.", amount: "₱60,000" }, { user: "Abby S.", amount: "₱7,200" },
  { user: "Bobby J.", amount: "₱19,000" }, { user: "Cathy T.", amount: "₱11,500" },
  { user: "Danny L.", amount: "₱33,000" }, { user: "Erika F.", amount: "₱5,500" },
  { user: "Fred G.", amount: "₱40,000" }, { user: "Gina M.", amount: "₱14,500" },
  { user: "Harry D.", amount: "₱2,200" }, { user: "Isay C.", amount: "₱18,000" },
  { user: "Jake V.", amount: "₱25,500" }, { user: "Karl R.", amount: "₱9,200" },
  { user: "Liza S.", amount: "₱12,800" }, { user: "Mike O.", amount: "₱48,000" },
  { user: "Neneng B.", amount: "₱3,800" }, { user: "Oscar L.", amount: "₱16,000" },
  { user: "Precious T.", amount: "₱22,500" }, { user: "Qer R.", amount: "₱7,000" },
  { user: "Roly S.", amount: "₱13,500" }, { user: "Sally B.", amount: "₱30,500" },
  { user: "Tim K.", amount: "₱5,800" }, { user: "Uma J.", amount: "₱11,200" },
  { user: "Vince P.", amount: "₱27,000" }, { user: "Weng M.", amount: "₱4,500" },
  { user: "Xena G.", amount: "₱19,500" }, { user: "Yuri F.", amount: "₱15,200" },
  { user: "Zoren D.", amount: "₱38,000" }
];

export const Dashboard: React.FC = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [activePayouts, setActivePayouts] = useState(PAYOUT_POOL.slice(0, 5));
  const navigate = useNavigate();

  // Rotate payouts every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const start = Math.floor(Math.random() * (PAYOUT_POOL.length - 5));
      setActivePayouts(PAYOUT_POOL.slice(start, start + 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'investments');
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || (user && !userData)) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/10" />
        <p className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user || !userData) {
    navigate('/landing');
    return null;
  }

  return (
    <div className="flex flex-col gap-8 pb-32 pt-4 px-5">
      {/* User Header */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <span className="text-sm font-black text-white">{userData.username.substring(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-tight mb-0.5">Account Overview</p>
            <h2 className="text-lg font-black tracking-tighter uppercase italic">{userData.username}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
             <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-400/10 rounded-full border border-emerald-400/20">VERIFIED</span>
             <span className="text-[7px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">SECURE SERVER</span>
          </div>
        </div>
      </div>

      {/* Balance Card (Enhanced Premium) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group h-64 overflow-hidden rounded-[3rem]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 shadow-2xl" />
        {/* Abstract Shapes */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

        <div className="relative h-full flex flex-col justify-between p-8">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Main Balance</span>
              <div className="flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Total Balance</p>
            <h2 className="text-4xl xs:text-5xl font-black text-white tracking-tighter">
              {formatCurrency(userData.balance)}
            </h2>
          </div>

          <div className="flex gap-3 mt-4">
             <button onClick={() => navigate('/deposit')} className="flex-1 py-4 bg-white text-blue-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">DEPOSIT</button>
             <button onClick={() => navigate('/withdraw')} className="flex-1 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">WITHDRAW</button>
          </div>
        </div>
      </motion.div>

      {/* Loan Callout for Investors without money */}
      <section className="flex flex-col gap-4">
        <div className="glass-panel border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
             <Banknote className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="relative z-10 space-y-3">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Investment Opportunity</span>
             </div>
             <h4 className="text-lg font-black text-white italic tracking-tighter uppercase leading-tight">No money to invest?</h4>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[220px]">
               Freedom Loans provides the capital you need to start earning today. Apply now and grow your wealth.
             </p>
             <button 
               onClick={() => navigate('/loans')}
               className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/40"
             >
               Apply for a Loan
             </button>
          </div>
        </div>
      </section>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
             <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-500 mb-1">Total Earnings</span>
            <span className="text-xl font-black text-emerald-400 tracking-tighter">+{formatCurrency(userData.totalEarnings)}</span>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
             <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-500 mb-1">Active</span>
            <span className="text-xl font-black text-blue-400 tracking-tighter">{activeInvestments.length} Investments</span>
          </div>
        </div>
      </div>

      {/* Menu Grid - Premium Mobile Navigation */}
      <div className="grid grid-cols-4 gap-3">
        <MenuIcon emoji="📈" label="Invest" onClick={() => navigate('/plans')} />
        <MenuIcon emoji="🤝" label="Loans" onClick={() => navigate('/loans')} />
        <MenuIcon emoji="👥" label="Refer" onClick={() => navigate('/referral')} />
        <MenuIcon emoji="📜" label="History" onClick={() => navigate('/history')} />
      </div>

      {/* Active Investments */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Investments</h3>
          <Link to="/plans" className="text-[10px] text-blue-400 font-black uppercase tracking-widest">New Plan</Link>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="bg-slate-800/30 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-xs font-medium">You have no active investments.</p>
            <button 
              onClick={() => navigate('/plans')}
              className="mt-2 text-blue-400 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-blue-400/10 rounded-xl border border-blue-400/20"
            >
              Invest Now
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

      {/* Quick Access List */}
      <div className="grid grid-cols-5 gap-3 md:gap-4 mt-2">
        <MenuIcon emoji="💳" label="Deposit" onClick={() => navigate('/deposit')} />
        <MenuIcon emoji="💸" label="Withdraw" onClick={() => navigate('/withdraw')} />
        <MenuIcon emoji="📊" label="History" onClick={() => navigate('/history')} />
        <MenuIcon emoji="📱" label="Support" onClick={() => navigate('/chat')} />
        <MenuIcon emoji="👤" label="Profile" onClick={() => navigate('/profile')} />
      </div>

      {/* Live Payouts (Social Proof) */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Payouts</h3>
          </div>
          <span className="text-[8px] font-black text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded-md border border-blue-400/10">ACTIVITY: HIGH</span>
        </div>
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {activePayouts.map((payout, i) => (
              <motion.div
                key={`${payout.user}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <PayoutItem user={payout.user} amount={payout.amount} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

const MenuIcon = ({ emoji, label, onClick }: { emoji: string, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group active:scale-90 transition-all">
    <div className="w-full aspect-square bg-[#121212] rounded-3xl border border-white/5 flex items-center justify-center text-xl shadow-lg relative overflow-hidden group-hover:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative z-10">{emoji}</span>
    </div>
    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 group-hover:text-white transition-colors">{label}</span>
  </button>
);

const PayoutItem = ({ user, amount }: { user: string, amount: string }) => (
  <div className="flex justify-between items-center bg-[#0C121D] p-4 rounded-2xl border border-white/5 shadow-inner group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px]">
        ✅
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-white font-black tracking-tight">{user}</span>
        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Withdrawal Successful</span>
      </div>
    </div>
    <div className="flex flex-col items-end">
      <span className="text-emerald-400 font-black text-xs">+{amount}</span>
      <span className="text-[8px] text-emerald-500/50 font-black uppercase tracking-tighter">via GCash</span>
    </div>
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
