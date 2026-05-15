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
    <div className="flex flex-col gap-6 pb-36 pt-4 px-6 md:px-10 max-w-4xl mx-auto">
      {/* User Header */}
      <div className="flex justify-between items-center bg-white/5 p-5 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.25rem] flex items-center justify-center border border-white/20 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <span className="text-base font-black text-white">{userData.username.substring(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] leading-tight mb-1">Authenticated Node</p>
            <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">{userData.username}</h2>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">ACTIVE</span>
          </div>
          <span className="text-[8px] font-bold text-slate-700 mt-1 uppercase tracking-widest">v4.2 PROTECTED</span>
        </div>
      </div>

      {/* Balance Card (Enhanced Premium) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group h-72 overflow-hidden rounded-[3rem] shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950" />
        
        {/* Visual elements */}
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
           <Wallet className="w-40 h-40 text-white" />
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px]" />
        
        <div className="relative h-full flex flex-col justify-between p-10">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[1.25rem] border border-white/20 shadow-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Institutional Node</p>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Real-time Balance</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">Available Funds</p>
            <h2 className="text-5xl xs:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
              {formatCurrency(userData.balance)}
            </h2>
          </div>

          <div className="flex gap-4 mt-6">
             <button 
               onClick={() => navigate('/deposit')} 
               className="flex-1 py-5 bg-white text-blue-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-blue-50"
             >
               DEPOSIT
             </button>
             <button 
               onClick={() => navigate('/withdraw')} 
               className="flex-1 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-white/15"
             >
               WITHDRAW
             </button>
          </div>
        </div>
      </motion.div>

      {/* Live Market Analysis Chart */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-3 px-2">
           <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <TrendingUp className="w-4 h-4 text-blue-400" />
           </div>
           <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Live Market Analysis</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time Cryptographic Yield Cycles</p>
           </div>
        </div>
        <TradingChart />
      </section>

      {/* Loan Callout for Investors without money */}
      <section className="flex flex-col gap-4">
        <div className="glass-panel border-emerald-500/20 bg-emerald-500/5 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <Banknote className="w-32 h-32 text-emerald-400" />
          </div>
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Investment Support</span>
             </div>
             <div className="space-y-2">
                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Capital Deficit?</h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-sm">
                  Our instant loan system provides the necessary leverage for users to initiate High-Yield growth plans without initial personal funds. 
                </p>
             </div>
             <button 
               onClick={() => navigate('/loans')}
               className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-900/40 active:scale-95 flex items-center gap-3"
             >
               Apply for a Loan <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </section>

      {/* Primary Navigation Grid */}
      <div className="grid grid-cols-4 gap-4">
        <MenuIcon emoji="🚀" label="Invest" onClick={() => navigate('/plans')} />
        <MenuIcon emoji="💰" label="Loans" onClick={() => navigate('/loans')} />
        <MenuIcon emoji="🤝" label="Refer" onClick={() => navigate('/referral')} />
        <MenuIcon emoji="📄" label="History" onClick={() => navigate('/history')} />
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 relative overflow-hidden group shadow-lg">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/15 transition-all duration-500" />
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
             <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-500">Cumulative Returns</span>
            <span className="text-2xl font-black text-white tracking-tighter">{formatCurrency(userData.totalEarnings)}</span>
            <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mt-1">Validated Growth</span>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 relative overflow-hidden group shadow-lg">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/15 transition-all duration-500" />
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
             <Clock className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-500">Active Nodes</span>
            <span className="text-2xl font-black text-white tracking-tighter">{activeInvestments.length} <span className="text-sm font-black text-blue-400/50 italic opacity-50 ml-1">UNITS</span></span>
            <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest mt-1">Uptime: 99.9%</span>
          </div>
        </div>
      </div>

      {/* Active Investments */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end px-2">
          <div className="flex flex-col">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Production Cycles</h3>
             <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Your active interest nodes</p>
          </div>
          <Link to="/plans" className="text-[10px] text-blue-400 font-black uppercase tracking-wider px-4 py-1.5 bg-blue-400/5 rounded-full border border-blue-400/10 hover:bg-blue-400/10 transition-colors">INITIATE NODE</Link>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="bg-[#121212]/50 border border-dashed border-white/10 rounded-[2.5rem] p-16 text-center flex flex-col items-center gap-6 group">
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700 transition-all group-hover:scale-110 group-hover:text-blue-500/50">
              <Zap className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-white text-[11px] font-black uppercase tracking-[0.2em]">No Active Production</p>
              <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">System is idle. Launch your first production cycle to begin earnings.</p>
            </div>
            <button 
              onClick={() => navigate('/plans')}
              className="px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all"
            >
              Start Earning
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

      {/* Quick Utilities List */}
      <div className="grid grid-cols-5 gap-3 mt-4">
        <MenuIcon emoji="💳" label="Deposit" onClick={() => navigate('/deposit')} />
        <MenuIcon emoji="💸" label="Withdraw" onClick={() => navigate('/withdraw')} />
        <MenuIcon emoji="📊" label="History" onClick={() => navigate('/history')} />
        <MenuIcon emoji="💬" label="Support" onClick={() => navigate('/chat')} />
        <MenuIcon emoji="👤" label="ID" onClick={() => navigate('/profile')} />
      </div>

      {/* Live System Activity (Social Proof) */}
      <section className="flex flex-col gap-5 pt-4">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Network Activity</h3>
          </div>
          <div className="flex items-center gap-2">
             <Users className="w-3 h-3 text-slate-600" />
             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">12.4K ONLINE</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {activePayouts.map((payout, i) => (
              <motion.div
                key={`${payout.user}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <PayoutItem user={payout.user} amount={payout.amount} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <p className="text-center text-[8px] text-slate-700 font-black uppercase tracking-[0.5em] mt-2">Freedom Company Network v4.2 • Secured</p>
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
