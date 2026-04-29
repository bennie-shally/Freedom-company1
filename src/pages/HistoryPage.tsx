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

type Tab = 'all' | 'deposits' | 'withdrawals' | 'investments';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let unsub: () => void;

    if (activeTab === 'all') {
      // In a real app we'd fetch all 3 and merge, but Firestore doesn't do cross-collection queries well.
      // I'll fetch them individually and merge client side if necessary, but for now I'll just show investments as "all" for demo or fetch one by one.
      // Better to fetch the active tab specifically.
    }

    const col = activeTab === 'all' || activeTab === 'investments' ? 'investments' : activeTab;
    const q = query(
      collection(db, col),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    unsub = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, type: col, ...doc.data() })));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [user, activeTab]);

  return (
    <div className="p-6 flex flex-col gap-8 pb-24 text-white">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-gray-500 text-sm">Track all your financial movements and returns.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
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
      "whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
      active 
        ? "bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/20" 
        : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
    )}
  >
    {label}
  </button>
);

const TransactionItem: React.FC<{ item: any, tab: Tab }> = ({ item, tab }) => {
  const getIcon = () => {
    if (tab === 'deposits') return <ArrowDownLeft className="text-blue-400" />;
    if (tab === 'withdrawals') return <ArrowUpRight className="text-red-400" />;
    return <TrendingUp className="text-brand-primary" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': 
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'pending': 
      case 'running': return 'text-brand-primary bg-brand-primary/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const amount = item.amount || item.totalReturn || 0;
  const date = item.createdAt ? format(item.createdAt.toDate(), 'MMM dd, hh:mm a') : 'Pending';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-brand-muted/50 border border-white/5 p-5 rounded-3xl flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-sm">{item.planName || (tab === 'deposits' ? 'GCash Deposit' : 'Withdrawal')}</p>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{date}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <span className="font-mono font-bold text-sm">{formatCurrency(amount)}</span>
        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full", getStatusColor(item.status))}>
          {item.status}
        </span>
      </div>
    </motion.div>
  );
};
