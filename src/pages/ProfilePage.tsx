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

export const ProfilePage: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/10" />
        <p className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">Synchronizing Node...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/landing');
  };

  return (
    <div className="p-8 flex flex-col gap-10 pb-24 text-slate-100">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Security Vault</h1>
        <p className="text-slate-500 text-sm font-medium">Verified Identity & Encryption Settings</p>
      </div>

      <div className="flex flex-col items-center gap-6 py-4">
        <div className="w-28 h-28 rounded-[40px] glass-panel flex items-center justify-center text-blue-400 text-5xl font-black shadow-2xl relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full -z-10" />
          {userData.username[0].toUpperCase()}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black">{userData.username}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{userData.email}</p>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <ProfileItem icon={<User className="w-5 h-5" />} label="Account Profile" sub="Status: Premium Active" />
        <ProfileItem icon={<Settings className="w-5 h-5" />} label="Security Node" sub="2FA & Passkey" />
        <ProfileItem icon={<Bell className="w-5 h-5" />} label="Alert Hub" sub="Real-time Webhooks" />
        <ProfileItem icon={<Shield className="w-5 h-5" />} label="Legal Ledger" sub="Terms of Service" />
      </section>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-4 w-full py-5 bg-red-500/10 text-red-500 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] border border-red-500/20 active:scale-95 transition-all shadow-lg"
      >
        <LogOut className="w-5 h-5" />
        Terminate Session
      </button>

      <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 text-center">
        <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.3em] leading-relaxed">
          System Core: 2.4.0 (Node.js)<br/>
          Licensed to Freedom Infrastructures<br/>
          Encrypted Tunnel: Multi-Path Active
        </p>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) => (
  <button className="flex items-center justify-between p-6 glass-card border-white/5 rounded-[2rem] hover:bg-white/5 transition-all group active:scale-[0.98]">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-600/10 transition-all">
        {icon}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-sm font-black text-slate-200">{label}</span>
        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{sub}</span>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors" />
  </button>
);
