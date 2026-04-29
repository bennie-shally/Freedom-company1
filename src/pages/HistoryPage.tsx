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
import { ArrowDownLeft, ArrowUpRight, TrendingUp, History, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

type Tab = 'all' | 'deposits' | 'withdrawals' | 'investments';

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
        const collections = ['investments', 'deposits', 'withdrawals'];
        const collectionResults: Record<string, any[]> = {};
        
        collections.forEach(col => {
          const q = query(
            collection(db, col),
            where('userId', '==', user.uid),
            limit(50)
          );

          const unsub = onSnapshot(q, (snapshot) => {
            collectionResults[col] = snapshot.docs.map(doc => ({ id: doc.id, type: col, ...doc.data() }));
            
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
        const col = activeTab;
        const q = query(
          collection(db, col),
          where('userId', '==', user.uid),
          limit(50)
        );

        const unsub = onSnapshot(q, (snapshot) => {
          const sorted = snapshot.docs
            .map(doc => ({ id: doc.id, type: col, ...doc.data() }))
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
    <div className="p-8 flex flex-col gap-10 pb-24 text-white">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase leading-none">Ledger Matrix</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Transaction History & Synchronization Logs</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
        <TabButton active={activeTab === 'all'} label="Everything" onClick={() => setActiveTab('all')} />
        <TabButton active={activeTab === 'investments'} label="Investments" onClick={() => setActiveTab('investments')} />
        <TabButton active={activeTab === 'deposits'} label="Deposits" onClick={() => setActiveTab('deposits')} />
        <TabButton active={activeTab === 'withdrawals'} label="Withdrawals" onClick={() => setActiveTab('withdrawals')} />
      </div>

      {/* List */}
      <section className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500 uppercase text-[10px] font-bold tracking-widest">Loading...</div>
        ) : data.length === 0 ? (
          <div className="bg-brand-muted/30 border border-white/5 rounded-[32px] p-20 text-center flex flex-col items-center gap-4">
            <History className="w-12 h-12 text-gray-700" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-loose">
              No transactions found in this category.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
      "whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
      active 
        ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-900/40" 
        : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300"
    )}
  >
    {label}
  </button>
);

const TransactionItem: React.FC<{ item: any, tab: Tab }> = ({ item, tab }) => {
  const getIcon = () => {
    if (item.type === 'deposits') return <ArrowDownLeft className="text-blue-400" />;
    if (item.type === 'withdrawals') return <ArrowUpRight className="text-red-400" />;
    return <TrendingUp className="text-blue-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': 
      case 'completed': return 'text-emerald-500 bg-emerald-500/10';
      case 'pending': 
      case 'running': return 'text-blue-400 bg-blue-400/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const amount = item.amount || item.totalReturn || 0;
  const dateField = item.createdAt || item.startedAt;
  const date = dateField 
    ? format(dateField.toDate?.() || new Date(dateField), 'MMM dd, hh:mm a') 
    : 'Pending';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-white/5 p-5 rounded-[2rem] flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-black text-sm text-slate-100">{item.planName || (item.type === 'deposits' ? 'GCash Deposit' : 'Withdrawal Request')}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{date}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <span className="font-black text-sm text-white">{formatCurrency(amount)}</span>
        <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full", getStatusColor(item.status))}>
          {item.status}
        </span>
      </div>
    </motion.div>
  );
};
