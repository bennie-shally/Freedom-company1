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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency, cn } from '../lib/utils';

export const TopNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          <div className="flex flex-col items-end max-w-[100px] sm:max-w-none">
            <span className="text-[7px] text-slate-500 uppercase font-black tracking-[0.3em] leading-none mb-1">Balance</span>
            <span className="text-[11px] sm:text-sm font-black text-white italic tracking-tighter leading-none truncate w-full text-right">{formatCurrency(userData.balance)}</span>
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
              className="fixed right-0 top-0 bottom-0 w-[70%] max-w-[280px] bg-[#050b18] border-l border-blue-500/30 z-50 p-6 flex flex-col gap-5 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
            >
              <div className="flex justify-between items-center text-white mt-6 px-1">
                <div className="flex flex-col">
                  <span className="font-black text-[9px] uppercase tracking-[0.3em] text-blue-400">Navigation</span>
                  <span className="font-black text-[11px] uppercase tracking-[0.1em] text-slate-400">Control Panel</span>
                </div>
                <button 
                   onClick={() => setIsOpen(false)}
                   className="p-2.5 bg-white/5 rounded-xl border border-white/10 active:scale-90 transition-all text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1 mt-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 scrollbar-hide">
                <MenuLink to="/dashboard" active={location.pathname === '/dashboard'} icon={<TrendingUp className="h-4 w-4" />} label="Dashboard" onClick={() => setIsOpen(false)} />
                <MenuLink to="/deposit" active={location.pathname === '/deposit'} icon={<Wallet className="h-4 w-4" />} label="Deposit" onClick={() => setIsOpen(false)} />
                <MenuLink to="/withdraw" active={location.pathname === '/withdraw'} icon={<ReceiptText className="h-4 w-4" />} label="Withdraw" onClick={() => setIsOpen(false)} />
                <MenuLink to="/plans" active={location.pathname === '/plans'} icon={<Zap className="h-4 w-4" />} label="Plans" onClick={() => setIsOpen(false)} />
                <MenuLink to="/loans" active={location.pathname === '/loans'} icon={<Banknote className="h-4 w-4" />} label="Loans" onClick={() => setIsOpen(false)} />
                <MenuLink to="/history" active={location.pathname === '/history'} icon={<History className="h-4 w-4" />} label="History" onClick={() => setIsOpen(false)} />
                <MenuLink to="/profile" active={location.pathname === '/profile'} icon={<UserCircle className="h-4 w-4" />} label="Profile" onClick={() => setIsOpen(false)} />
                <MenuLink to="/chat" active={location.pathname === '/chat'} icon={<MessageSquare className="h-4 w-4" />} label="Support" onClick={() => setIsOpen(false)} />
              </div>

              <div className="mt-auto pb-4 pt-2 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-[9px] w-full p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl transition-all"
                >
                  <LogOut className="h-4 w-4" />
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

const MenuLink: React.FC<{ to: string; active?: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ to, active, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 p-3 rounded-2xl transition-all border group",
      active 
        ? "bg-blue-600/15 border-blue-500/40 text-white shadow-[0_0_20px_rgba(37,99,235,0.15)]" 
        : "bg-white/[0.03] border-transparent text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/10"
    )}
  >
    <div className={cn(
      "p-2 rounded-xl transition-all",
      active ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-white/5 text-blue-500 group-hover:text-blue-400"
    )}>
      {icon}
    </div>
    <span className={cn(
      "font-black text-[9px] uppercase tracking-[0.15em] transition-colors",
      active ? "text-white" : "text-slate-400 group-hover:text-white"
    )}>{label}</span>
  </Link>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const ReceiptText = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
);

const Zap = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

const Banknote = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>
);

const History = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
