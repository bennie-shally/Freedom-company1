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
    <div className="p-6 flex flex-col gap-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-gray-500 text-sm">Add funds to your wallet using GCash.</p>
      </div>

      {/* Step 1: Payment Details */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-brand-primary text-black flex items-center justify-center text-[10px] font-bold">1</div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Send Payment to</h3>
        </div>
        
        <div className="bg-brand-muted/50 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GCash_logo.svg/1024px-GCash_logo.svg.png" alt="GCash" className="h-6" />
            <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase">Official QR</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Account Number</span>
                <span className="font-mono text-lg font-bold">{settings?.gcashNumber}</span>
              </div>
              <button onClick={() => handleCopy(settings?.gcashNumber || '')} className="p-2 text-brand-primary"><Copy className="w-5 h-5" /></button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Account Name</span>
                <span className="font-bold">{settings?.gcashName}</span>
              </div>
              <button onClick={() => handleCopy(settings?.gcashName || '')} className="p-2 text-brand-primary"><Copy className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Upload Proof */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-brand-primary text-black flex items-center justify-center text-[10px] font-bold">2</div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Submit Verification</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Deposit Amount (PHP)</label>
            <input
              type="number"
              required
              min="500"
              placeholder="Ex. 5000"
              className="w-full bg-brand-muted/50 border border-white/5 rounded-2xl p-4 text-white text-lg font-mono placeholder:text-gray-700 outline-none focus:border-brand-primary/30"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Upload Receipt (Screenshot)</label>
            <label className="relative h-48 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-brand-primary/30 transition-all bg-brand-muted/20">
              {preview ? (
                <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">Tap to Upload</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
            </label>
          </div>

          <button
            disabled={loading || !amount || !file}
            className="w-full py-4 bg-brand-primary text-black font-bold rounded-2xl shadow-lg shadow-brand-primary/10 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : 'Submit Deposit'}
          </button>
        </form>
      </section>

      {/* Support Entry */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-400 font-medium">Payment not reflecting?</span>
        </div>
        <a href={settings?.whatsappAdmin} className="text-xs text-brand-primary font-bold uppercase tracking-wider">Chat Admin</a>
      </div>
    </div>
  );
};
