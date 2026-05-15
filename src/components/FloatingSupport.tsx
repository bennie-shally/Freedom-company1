/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const FloatingSupport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  if (isChatPage) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate('/chat')}
      className={cn(
        "fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/20 transition-all group overflow-hidden",
        "active:bg-blue-500"
      )}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </div>

      {/* Ripple/Pulse */}
      <span className="absolute inset-0 rounded-full border border-blue-400 opacity-0 group-active:animate-ping" />
      
      {/* Optional Unread Indicator (Visual only for premium feel) */}
      <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 rounded-full border-2 border-blue-600 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
    </motion.button>
  );
};
