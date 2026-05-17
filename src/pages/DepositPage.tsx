/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { useNavigate } from 'react-router-dom';
import { Wallet, Copy, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { SystemSettings } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { GcashLogo } from '../components/GcashLogo';

export const DepositPage: React.FC = () => {
  const { user, userData } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
          const snap = await getDoc(doc(db, 'settings', 'global'));
          if (snap.exists()) {
            setSettings(snap.data() as SystemSettings);
          } else {
            // Fallback or default
            setSettings({
              gcashName: 'Freedom Admin',
              gcashNumber: '09123456789',
              withdrawalFeePercent: 10,
              minWithdrawal: 1000,
              maxWithdrawal: 100000,
              referralBonus: 2000,
              whatsappAdmin: 'https://wa.me/1234567890',
              whatsappGroup: 'https://chat.whatsapp.com/...'
            });
          }
      } catch (err: any) {
          handleFirestoreError(err, OperationType.GET, 'settings/global');
      }
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !file || !user || !userData) return;

    setLoading(true);
    try {
      const proofUrl = await uploadToCloudinary(file);
      
      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        username: userData.username,
        amount: Number(amount),
        proofUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      console.error('Deposit error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'deposits');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="p-6 h-[70vh] flex flex-col items-center justify-center text-center gap-6">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">Deposit Submitted!</h2>
        <p className="text-gray-400">Please wait for admin to verify your proof of payment. This usually takes 5-15 minutes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-32 pt-4 px-6 text-white overflow-hidden">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Fund Your Account</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest">Deposit <span className="text-blue-500">Money</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          Send your payment via GCash. Your account will be updated within 15 minutes.
        </p>
      </div>

      {/* Step 1: Destination */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">01 / Payment Details</span>
           <div className="h-px flex-1 bg-white/5" />
        </div>
        
        <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-xl group">
          <div className="flex justify-between items-center">
            <GcashLogo />
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-500/20">Active Gateway</span>
          </div>

          <div className="grid gap-4">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between group active:scale-95 transition-all">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Wallet Number</p>
                <p className="text-lg font-black text-white italic tracking-tighter">{settings?.gcashNumber}</p>
              </div>
              <button onClick={() => handleCopy(settings?.gcashNumber || '')} className="p-3 bg-white/5 text-blue-400 rounded-xl hover:bg-white/10 transition-colors">
                <Copy className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between group active:scale-95 transition-all">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Account Holder</p>
                <p className="text-lg font-black text-white italic tracking-tighter">{settings?.gcashName}</p>
              </div>
              <button onClick={() => handleCopy(settings?.gcashName || '')} className="p-3 bg-white/5 text-blue-400 rounded-xl hover:bg-white/10 transition-colors">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Verification */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">02 / Proof of Payment</span>
           <div className="h-px flex-1 bg-white/5" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2 italic">Transfer Amount (PHP)</label>
            <input
              type="number"
              required
              min="500"
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] p-6 text-white text-3xl font-black italic tracking-tighter placeholder:text-slate-800 outline-none focus:bg-white/10 transition-all shadow-inner"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2 italic">Upload Receipt</label>
            <label className="relative h-64 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-white/10 transition-all group">
              {preview ? (
                <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Select Receipt Image</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
            </label>
          </div>

          <button
            disabled={loading || !amount || !file}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Deposit'}
          </button>
        </form>
      </section>

      {/* Support Entry */}
      <div className="flex items-center justify-between p-6 bg-slate-900/40 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Need Help?</span>
        </div>
        <a href={settings?.whatsappAdmin} className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] px-4 py-2 bg-blue-400/10 rounded-full border border-blue-400/20">Contact Support</a>
      </div>
    </div>
  );
};
