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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 bg-slate-900/80 border-b border-white/5 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-sm sm:text-base">F</div>
        <span className="font-bold tracking-tight text-white text-base sm:text-lg">FREEDOM</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        {userData && (
          <div className="flex flex-col items-end mr-1 sm:mr-2">
            <span className="text-[8px] sm:text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">Available</span>
            <span className="text-sm sm:text-base font-black text-blue-400 leading-tight">{formatCurrency(userData.balance)}</span>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 sm:p-2.5 bg-slate-800 rounded-lg sm:rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
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
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-white/5 z-50 p-8 flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setIsOpen(false)}><X className="h-6 w-6" /></button>
              </div>

              <div className="flex flex-col gap-4">
                <MenuLink to="/deposit" icon={<Wallet className="h-5 w-5" />} label="Deposit" onClick={() => setIsOpen(false)} />
                <MenuLink to="/withdraw" icon={<ReceiptText className="h-5 w-5" />} label="Withdraw" onClick={() => setIsOpen(false)} />
                <MenuLink to="/profile" icon={<UserCircle className="h-5 w-5" />} label="Profile" onClick={() => setIsOpen(false)} />
                <MenuLink to="/chat" icon={<MessageSquare className="h-5 w-5" />} label="Support Chat" onClick={() => setIsOpen(false)} />
              </div>

              <div className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-400 font-medium w-full p-3 hover:bg-red-400/10 rounded-xl transition-colors"
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
    className="flex items-center gap-3 p-3 text-gray-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const ReceiptText = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
);
