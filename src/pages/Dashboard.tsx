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
import { Wallet, TrendingUp, Users, ArrowUpRight, ArrowDownLeft, Clock, Zap, Banknote } from 'lucide-react';
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

  useEffect(() => {
    if (!activeInvestments.length) return;

    // Periodic check for maturation while user is on page
    const interval = setInterval(() => {
      const now = new Date();
      activeInvestments.forEach(inv => {
        const endTime = inv.endsAt?.toDate?.() || new Date(inv.endsAt);
        if (inv.status === 'running' && endTime <= now) {
          completeInvestment(inv);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [activeInvestments]);

  if (authLoading || (user && !userData)) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/10" />
        <p className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">Synchronizing Node...</p>
      </div>
    );
  }

  if (!user || !userData) {
    navigate('/landing');
    return null;
  }

  const completeInvestment = async (inv: Investment) => {
    if (inv.status !== 'running') return;
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
    } catch (err: any) {
      console.error('Error completing investment:', err);
      handleFirestoreError(err, OperationType.WRITE, 'investments/completion');
    }
  };

  return (
    <div className="p-5 sm:p-6 flex flex-col gap-12 pb-24 sm:pb-12">
      {/* User Hello */}
      <div className="flex justify-between items-center px-2">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Good morning,</p>
          <h2 className="text-xl sm:text-2xl font-bold">{userData.username}</h2>
        </div>
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
          <span className="text-sm font-black text-blue-400">{userData.username.substring(0, 2).toUpperCase()}</span>
        </div>
      </div>

      {/* Balance Card (Frosted Glass) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-2xl border-white/10"
      >
        <div className="absolute top-4 right-6 flex items-center gap-2 pointer-events-none opacity-40 grayscale group-hover:grayscale-0 transition-all">
          <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.2em]">Partner Node:</span>
          <div className="flex gap-2">
            <span className="text-[8px] font-black text-blue-400">GCash</span>
            <span className="text-[8px] font-black text-emerald-400">Maya</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-10 rounded-full select-none pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 blur-[80px] -z-10 rounded-full select-none pointer-events-none" />
        
        <div className="flex justify-between items-start mb-8 md:mb-10 pt-2">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] sm:text-[10px] md:text-xs font-black tracking-[0.4em] text-slate-500 uppercase">Cryptographic Balance</span>
            <span className="text-white/40 text-[7px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest leading-none">Secured via SHA-256 Node</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-3 py-1 rounded-full border border-emerald-500/20 font-black tracking-widest shadow-xl shadow-emerald-900/10">ACTIVE</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mb-10 md:mb-12 min-w-0">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {formatCurrency(userData.balance)}
          </h2>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Institutional Liquidity Pool</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-5">
          <button 
            onClick={() => navigate('/deposit')}
            className="py-4 sm:py-5 bg-blue-600 hover:bg-blue-500 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-blue-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Inject
          </button>
          <button 
            onClick={() => navigate('/withdraw')}
            className="py-4 sm:py-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] text-white border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <ArrowUpRight className="w-4 h-4" />
            Extract
          </button>
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
             <h4 className="text-lg font-black text-white italic tracking-tighter uppercase leading-tight">Want to invest but lack the capital?</h4>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[220px]">
               Freedom Loans offers specialized credit for members ready to start their growth cycle today. Get funded instantly.
             </p>
             <button 
               onClick={() => navigate('/loans')}
               className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/40"
             >
               Apply for Funding
             </button>
          </div>
        </div>
      </section>

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
      <div className="grid grid-cols-5 gap-3 md:gap-4 mt-2">
        <MenuIcon emoji="📈" label="Invest" onClick={() => navigate('/plans')} />
        <MenuIcon emoji="🤝" label="Loans" onClick={() => navigate('/loans')} />
        <MenuIcon emoji="👥" label="Affiliate" onClick={() => navigate('/referral')} />
        <MenuIcon emoji="📜" label="Logs" onClick={() => navigate('/history')} />
        <MenuIcon emoji="💬" label="Support" onClick={() => navigate('/chat')} />
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
  <button onClick={onClick} className="flex flex-col items-center gap-2 group">
    <div className="w-14 h-14 bg-slate-800 rounded-[20px] border border-white/5 flex items-center justify-center text-2xl group-active:scale-90 transition-all shadow-lg group-hover:border-blue-500/30">
      {emoji}
    </div>
    <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{label}</span>
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
