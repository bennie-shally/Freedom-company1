/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, ChevronRight, Settings, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/10" />
        <p className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">Loading Profile...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/landing');
  };

  return (
    <div className="flex flex-col gap-10 pb-32 pt-4 px-6 text-slate-100">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Verified Account</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">User <span className="text-blue-500">Profile</span></h1>
      </div>

      <div className="flex flex-col items-center gap-8 py-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white text-5xl font-black shadow-[0_0_50px_rgba(59,130,246,0.3)] border-4 border-white/10">
            {userData.username[0].toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-[#0F172A] shadow-xl">
             <Shield className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter uppercase">{userData.username}</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{userData.email}</p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col gap-1 items-center">
          <span className="text-[8px] font-black uppercase text-blue-500 tracking-[0.4em]">Your Referral Code</span>
          <span className="text-2xl font-black tracking-[0.2em] text-white select-all">{userData.referralCode}</span>
        </div>
        <ProfileItem icon={<Settings className="w-5 h-5" />} label="Account Settings" sub="Update your defaults" />
        <ProfileItem icon={<Bell className="w-5 h-5" />} label="Notifications" sub="Manage alerts" />
        <ProfileItem icon={<LogOut className="w-5 h-5" />} label="Logout" sub="Exit your account" onClick={handleLogout} isDanger />
      </div>

      <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 text-center mt-4">
        <p className="text-[8px] text-slate-600 uppercase font-black tracking-[0.4em] leading-relaxed">
          Freedom Company<br/>
          All Rights Reserved © 2026<br/>
          ID: {userData.username.substring(0, 4)}-{Math.floor(Math.random() * 9000) + 1000}
        </p>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon, label, sub, onClick, isDanger }: { icon: React.ReactNode, label: string, sub: string, onClick?: () => void, isDanger?: boolean }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[2rem] transition-all group active:scale-[0.98]",
      isDanger ? "hover:bg-red-500/10 hover:border-red-500/20" : "hover:bg-white/10 hover:border-white/10"
    )}
  >
    <div className="flex items-center gap-5">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
        isDanger ? "bg-red-500/10 text-red-500" : "bg-[#121212] text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-600/10"
      )}>
        {icon}
      </div>
      <div className="flex flex-col text-left">
        <span className={cn("text-xs font-black uppercase tracking-widest", isDanger ? "text-red-500" : "text-slate-200")}>{label}</span>
        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{sub}</span>
      </div>
    </div>
    <ChevronRight className={cn("w-5 h-5", isDanger ? "text-red-500/30" : "text-slate-700 group-hover:text-blue-500")} />
  </button>
);
