/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, BarChart2, Users, UserCircle, Banknote } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around bg-slate-900/90 border-t border-white/5 backdrop-blur-xl px-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
      <NavItem to="/" icon={<Home strokeWidth={1.5} className="h-6 w-6" />} label="Home" />
      <NavItem to="/plans" icon={<BarChart2 strokeWidth={1.5} className="h-6 w-6" />} label="Plans" />
      <NavItem to="/loans" icon={<Banknote strokeWidth={1.5} className="h-6 w-6" />} label="Loans" />
      <NavItem to="/referral" icon={<Users strokeWidth={1.5} className="h-6 w-6" />} label="Invite" />
      <NavItem to="/profile" icon={<UserCircle strokeWidth={1.5} className="h-6 w-6" />} label="Profile" />
    </nav>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative flex flex-col items-center justify-center gap-1.5 transition-all duration-500 py-2 min-w-[64px]",
          isActive ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "relative z-10 p-2 rounded-2xl transition-all duration-500",
            isActive ? "bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "bg-transparent"
          )}>
            {icon}
          </div>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-tighter transition-all duration-500",
            isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0.5"
          )}>
            {label}
          </span>
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-1 w-12 h-[2px] bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
};
