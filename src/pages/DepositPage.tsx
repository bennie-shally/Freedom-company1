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
    } catch (err) {
      console.error('Deposit error:', err);
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
    <div className="p-6 flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white">Inject Funds</h1>
        <p className="text-slate-500 text-sm font-medium">Power up your account using GCash Direct.</p>
      </div>

      {/* Step 1: Payment Details */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-blue-900/20">01</div>
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Destination Account</h3>
        </div>
        
        <div className="glass-panel border-white/10 rounded-[2rem] p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GCash_logo.svg/1024px-GCash_logo.svg.png" alt="GCash" className="h-5 opacity-80" />
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Instant Node</div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/20 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Wallet Address</span>
                <span className="font-mono text-xl font-black text-white">{settings?.gcashNumber}</span>
              </div>
              <button onClick={() => handleCopy(settings?.gcashNumber || '')} className="p-3 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Copy className="w-5 h-5" /></button>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/20 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Receiver Hub</span>
                <span className="font-black text-white text-lg">{settings?.gcashName}</span>
              </div>
              <button onClick={() => handleCopy(settings?.gcashName || '')} className="p-3 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Copy className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Upload Proof */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-blue-900/20">02</div>
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Validation Protocol</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Transfer Amount (PHP)</label>
            <input
              type="number"
              required
              min="500"
              placeholder="0.00"
              className="w-full glass-card border-white/10 rounded-[1.5rem] p-5 text-white text-2xl font-black placeholder:text-slate-700 outline-none focus:border-blue-500/30 transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Transaction Receipt</label>
            <label className="relative h-60 glass-card border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all group">
              {preview ? (
                <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-4">Drop digital receipt here</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
            </label>
          </div>

          <button
            disabled={loading || !amount || !file}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-900/40 active:scale-[0.98] transition-all disabled:opacity-50 text-[11px] uppercase tracking-[0.3em]"
          >
            {loading ? 'Initializing...' : 'Confirm Injection'}
          </button>
        </form>
      </section>

      {/* Support Entry */}
      <div className="flex items-center justify-between p-6 bg-slate-900/40 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sync Issues?</span>
        </div>
        <a href={settings?.whatsappAdmin} className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] px-4 py-2 bg-blue-400/10 rounded-full border border-blue-400/20">Support Node</a>
      </div>
    </div>
  );
};
