/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Copy, Share2, TrendingUp, Gift } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

export const ReferralPage: React.FC = () => {
  const { userData } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [bonus, setBonus] = useState(2000);
  const referralLink = `${window.location.origin}/register?ref=${userData?.referralCode}`;

  useEffect(() => {
    if (!userData) return;

    // Fetch referral bonus
    getDoc(doc(db, 'settings', 'global')).then(snap => {
      if (snap.exists()) setBonus(snap.data().referralBonus || 2000);
    }).catch(err => handleFirestoreError(err, OperationType.GET, 'settings/global'));

    const q = query(collection(db, 'users'), where('referredByUid', '==', userData.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReferrals(snapshot.docs.map(doc => doc.data()));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users/referrals'));

    return () => unsubscribe();
  }, [userData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  if (!userData) return null;

  return (
    <div className="flex flex-col gap-10 pb-32 pt-4 px-6 text-white">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Refer & Earn</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Invite <span className="text-blue-500">Friends</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          Invite people to join Freedom Company and get a bonus for every successful referral.
        </p>
      </div>

      {/* Bonus Card (Premium) */}
      <div className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600 to-blue-900 p-8 shadow-2xl">
        <div className="absolute -top-10 -right-10 opacity-20 group-hover:scale-110 transition-transform">
          <Users className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/50">Active Referrals</span>
            <h2 className="text-5xl font-black text-white italic tracking-tighter">{referrals.length}</h2>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 self-start">
             <Gift className="w-4 h-4 text-white" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Bonus: {formatCurrency(bonus)} / referral</span>
          </div>
        </div>
      </div>

      {/* Referral Controls */}
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Referral Code</h3>
          <div className="flex items-center justify-between bg-white/5 border border-white/5 p-8 rounded-[2.5rem] shadow-inner backdrop-blur-md">
            <span className="text-4xl font-black tracking-[0.2em] text-white uppercase italic">{userData.referralCode}</span>
            <button onClick={handleCopy} className="p-4 bg-white text-blue-900 rounded-2xl active:scale-95 transition-all shadow-xl">
              <Copy className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Referral Link</h3>
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-5 rounded-3xl backdrop-blur-md">
            <p className="text-[9px] text-blue-400 font-black truncate flex-1 uppercase tracking-widest">{referralLink}</p>
            <button onClick={handleCopy} className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl active:scale-95 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* My Referrals List */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Your Referrals</h3>
        {referrals.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] leading-loose">
            No referrals yet.<br/>Share your link to start earning.
          </div>
        ) : (
          <div className="grid gap-3">
            {referrals.map((ref, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-xs font-black text-blue-400">
                    {ref.username[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-200 uppercase tracking-tight">{ref.username}</span>
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Active Member</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
