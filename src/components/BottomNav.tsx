/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Users, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 sm:h-20 items-center justify-around bg-slate-900/80 border-t border-white/5 backdrop-blur-md px-4 sm:px-6 pb-safe">
      <NavItem to="/" icon={<Home className="h-6 w-6" />} label="Home" />
      <NavItem to="/plans" icon={<BarChart2 className="h-6 w-6" />} label="Invest" />
      <NavItem to="/referral" icon={<Users className="h-6 w-6" />} label="Refer" />
      <NavItem to="/profile" icon={<UserCircle className="h-6 w-6" />} label="Account" />
    </nav>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-1.5 transition-all duration-300",
          isActive ? "text-blue-500 scale-110" : "text-slate-500 hover:text-slate-300"
        )
      }
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </NavLink>
  );
};
