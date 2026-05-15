/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, History, Filter, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

type Tab = 'all' | 'deposits' | 'withdrawals' | 'investments' | 'loans';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let unsubs: (() => void)[] = [];

    const fetchData = () => {
      if (activeTab === 'all') {
        const collections = ['investments', 'deposits', 'withdrawals', 'loanApplications'];
        const collectionResults: Record<string, any[]> = {};
        
        collections.forEach(col => {
          const q = query(
            collection(db, col),
            where('userId', '==', user.uid),
            limit(50)
          );

          const unsub = onSnapshot(q, (snapshot) => {
            const mapped = snapshot.docs.map(doc => ({ 
              id: doc.id, 
              type: col === 'loanApplications' ? 'loans' : col, 
              ...doc.data() 
            }));
            collectionResults[col] = mapped;
            
            // Merge all current results and sort client-side to avoid index errors
            const merged = Object.values(collectionResults)
              .flat()
              .sort((a, b) => {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
              });
            
            setData(merged);
            setLoading(false);
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, col);
            if (Object.keys(collectionResults).length === 0) setLoading(false);
          });
          unsubs.push(unsub);
        });
      } else {
        const col = activeTab === 'loans' ? 'loanApplications' : activeTab;
        const q = query(
          collection(db, col),
          where('userId', '==', user.uid),
          limit(50)
        );

        const unsub = onSnapshot(q, (snapshot) => {
          const sorted = snapshot.docs
            .map(doc => ({ id: doc.id, type: activeTab, ...doc.data() }))
            .sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setData(sorted);
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, col);
          setLoading(false);
        });
        unsubs.push(unsub);
      }
    };

    fetchData();
    return () => unsubs.forEach(u => u());
  }, [user, activeTab]);

  return (
    <div className="flex flex-col gap-10 pb-32 pt-4 px-6 text-white overflow-hidden">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Digital History</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Transaction <span className="text-blue-500">History</span></h1>
      </div>

      <div className="flex gap-2 p-1 bg-[#121212] rounded-2xl border border-white/5 no-scrollbar overflow-x-auto min-w-full">
        <TabButton active={activeTab === 'all'} label="All" onClick={() => setActiveTab('all')} />
        <TabButton active={activeTab === 'investments'} label="Plans" onClick={() => setActiveTab('investments')} />
        <TabButton active={activeTab === 'deposits'} label="Deposit" onClick={() => setActiveTab('deposits')} />
        <TabButton active={activeTab === 'withdrawals'} label="Withdraw" onClick={() => setActiveTab('withdrawals')} />
        <TabButton active={activeTab === 'loans'} label="Loans" onClick={() => setActiveTab('loans')} />
      </div>

      {/* List */}
      <section className="flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
             <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Updating History...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] p-16 text-center flex flex-col items-center gap-6">
            <History className="w-10 h-10 text-slate-700" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-loose">
              No transactions yet.<br/>Start by making a deposit.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {data.map((item) => (
              <TransactionItem key={item.id} item={item} tab={activeTab} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const TabButton = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
      active 
        ? "bg-white text-black shadow-xl" 
        : "text-slate-500 hover:text-slate-300"
    )}
  >
    {label}
  </button>
);

const TransactionItem: React.FC<{ item: any, tab: Tab }> = ({ item, tab }) => {
  const getIcon = () => {
    if (item.type === 'deposits') return <ArrowDownLeft className="w-5 h-5" />;
    if (item.type === 'withdrawals') return <ArrowUpRight className="w-5 h-5" />;
    if (item.type === 'loans') return <Banknote className="w-5 h-5" />;
    return <TrendingUp className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': 
      case 'completed': return 'text-emerald-500';
      case 'pending': 
      case 'running': 
      case 'processing': return 'text-blue-400';
      case 'rejected': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  const amount = item.amount || item.amountRequested || item.totalReturn || 0;
  const itemName = item.planName || (item.type === 'deposits' ? 'Deposit' : item.type === 'withdrawals' ? 'Withdrawal' : 'Loan Application');
  const dateField = item.createdAt || item.startedAt;
  const date = dateField 
    ? format(dateField.toDate?.() || new Date(dateField), 'MMM dd, hh:mm a') 
    : 'Pending';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between backdrop-blur-md"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5",
          item.type === 'withdrawals' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-400"
        )}>
          {getIcon()}
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-black text-xs text-white uppercase tracking-tight">{itemName}</p>
          <div className="flex items-center gap-2">
            <span className={cn("text-[8px] font-black uppercase tracking-widest", getStatusColor(item.status))}>
              {item.status}
            </span>
            <span className="text-slate-700 font-black">•</span>
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{date}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="font-black text-sm text-white">{formatCurrency(amount)}</span>
        <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md mt-1 border border-white/5">ID: {item.id.substring(0, 4)}</span>
      </div>
    </motion.div>
  );
};
