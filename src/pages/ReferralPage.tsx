/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Copy, Share2, TrendingUp, Gift } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const ReferralPage: React.FC = () => {
  const { userData } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const referralLink = `${window.location.origin}/register?ref=${userData?.referralCode}`;

  useEffect(() => {
    if (!userData) return;

    const q = query(collection(db, 'users'), where('referredBy', '==', userData.referralCode));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReferrals(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [userData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  if (!userData) return null;

  return (
    <div className="p-6 flex flex-col gap-8 pb-24 text-white">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Refer & Earn</h1>
        <p className="text-gray-500 text-sm">Spread the word and earn ₱2,000 for every active referral.</p>
      </div>

      {/* Bonus Card */}
      <div className="bg-gradient-to-br from-purple-600/20 to-brand-primary/10 border border-white/5 rounded-[32px] p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10">
          <Gift className="w-40 h-40" />
        </div>
        
        <div className="flex flex-col gap-1 mb-8 relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-purple-300">Total Referrals</span>
          <h2 className="text-4xl font-mono font-bold text-white tracking-tight">{referrals.length}</h2>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Passive Income Growing</span>
        </div>
      </div>

      {/* Referral Link */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 ml-1">Your Referral Link</h3>
        <div className="flex items-center gap-2 bg-brand-muted/50 border border-white/5 p-4 rounded-2xl">
          <p className="text-xs text-brand-primary font-mono truncate flex-1">{referralLink}</p>
          <button onClick={handleCopy} className="p-2 bg-brand-primary text-black rounded-xl active:scale-95 transition-all">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Referral Code */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 ml-1">Referral Code</h3>
        <div className="flex items-center justify-between bg-brand-muted/50 border border-white/5 p-6 rounded-[32px]">
          <span className="text-4xl font-mono font-black tracking-widest text-white">{userData.referralCode}</span>
          <button onClick={() => handleCopy()} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all">
            Copy
          </button>
        </div>
      </div>

      {/* My Referrals List */}
      <section className="flex flex-col gap-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 ml-1">My Network</h3>
        {referrals.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 text-center text-gray-500 text-xs font-medium uppercase tracking-widest leading-loose">
            No referrals yet.<br/>Start sharing your link!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {referrals.map((ref, idx) => (
              <div key={idx} className="bg-brand-muted/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-brand-primary">
                    {ref.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{ref.username}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Active User</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
