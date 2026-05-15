/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, LogOut, Wallet, UserCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';

export const TopNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
    navigate('/landing');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/80 border-b border-white/5 backdrop-blur-xl px-6 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] text-lg border border-white/10">F</div>
        <div className="flex flex-col -gap-1">
           <span className="font-black tracking-[-0.05em] text-white text-lg leading-none uppercase italic">FREEDOM</span>
           <span className="text-[7px] font-black tracking-[0.4em] text-blue-500 uppercase leading-none">Company</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {userData && (
          <div className="flex flex-col items-end">
            <span className="text-[7px] text-slate-500 uppercase font-black tracking-[0.3em] leading-none mb-1">Available Balance</span>
            <span className="text-sm font-black text-white italic tracking-tighter leading-none">{formatCurrency(userData.balance)}</span>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-white/10 rounded-2xl border border-white/20 text-white active:scale-90 transition-all shadow-lg backdrop-blur-md"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#050505] border-l border-white/5 z-50 p-10 flex flex-col gap-10 shadow-[0_0_100px_rgba(37,99,235,0.1)]"
            >
              <div className="flex justify-between items-center text-white">
                <span className="font-black text-xs uppercase tracking-[0.5em] text-slate-600">Main Menu</span>
                <button 
                   onClick={() => setIsOpen(false)}
                   className="p-2 bg-white/5 rounded-xl border border-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <MenuLink to="/dashboard" icon={<TrendingUp className="h-5 w-5" />} label="Dashboard" onClick={() => setIsOpen(false)} />
                <MenuLink to="/deposit" icon={<Wallet className="h-5 w-5" />} label="Deposit" onClick={() => setIsOpen(false)} />
                <MenuLink to="/withdraw" icon={<ReceiptText className="h-5 w-5" />} label="Withdraw" onClick={() => setIsOpen(false)} />
                <MenuLink to="/profile" icon={<UserCircle className="h-5 w-5" />} label="Profile" onClick={() => setIsOpen(false)} />
                <MenuLink to="/chat" icon={<MessageSquare className="h-5 w-5" />} label="Support" onClick={() => setIsOpen(false)} />
              </div>

              <div className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-red-500 font-black uppercase tracking-widest text-[10px] w-full p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-[2rem] transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

const MenuLink: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-5 p-5 text-slate-400 hover:text-white hover:bg-white/5 rounded-[1.5rem] transition-all border border-transparent hover:border-white/5"
  >
    <div className="p-3 bg-white/5 rounded-xl text-blue-500">{icon}</div>
    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
  </Link>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const ReceiptText = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
);
