/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import {ArrowLeft, Send, User, Phone, Mail, MapPin, Building, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';

export const LoanApplicationPage: React.FC = () => {
  const { amount } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    bankName: '',
    accountNumber: '',
    monthlyIncome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('You must be logged in to apply');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loanData = {
        userId: auth.currentUser.uid,
        ...formData,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        amountRequested: parseFloat(amount || '0'),
        status: 'processing',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'loanApplications'), loanData);
      
      // Navigate to processing page with ID
      navigate(`/loans/processing/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-10 pb-24 relative min-h-screen pt-8">
      {/* Header */}
      <div className="px-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/loans')}
          className="w-12 h-12 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Loan Application</h1>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">{formatCurrency(parseFloat(amount || '0'))}</p>
        </div>
      </div>

      <section className="px-6">
        <div className="glass-panel rounded-[2.5rem] border border-white/10 p-8 bg-slate-900/50 relative overflow-hidden">
          {/* Form Header */}
          <div className="mb-10">
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Personal Details</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ensure all information is accurate</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-tight">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <InputGroup label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} icon={<User />} placeholder="Juan Dela Cruz" required />
              <InputGroup label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} icon={<Phone />} placeholder="09123456789" required />
              <InputGroup label="Email Address" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail />} placeholder="juan@example.com" type="email" required />
              <InputGroup label="Home Address" name="address" value={formData.address} onChange={handleInputChange} icon={<MapPin />} placeholder="Full Address" required />
              
              <div className="pt-6">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 opacity-70">Banking Information</h3>
                <div className="space-y-4">
                  <InputGroup label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} icon={<Building />} placeholder="GCash, BDO, BPI..." required />
                  <InputGroup label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} icon={<CreditCard />} placeholder="1234 5678 9012" required />
                  <InputGroup label="Monthly Income" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} icon={<Wallet />} placeholder="50000" type="number" required />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className={cn(
                "w-full py-6 mt-8 rounded-3xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all",
                loading ? "bg-slate-800 text-slate-500" : "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20"
              )}
            >
              {loading ? "SUBMITTING..." : <>SUBMIT APPLICATION <Send className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </section>

      {/* Safety Notice */}
      <div className="px-10 text-center opacity-40">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
          Your data is safe and secure. Freedom Company never shares your data with third parties.
        </p>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, icon, placeholder, type = "text", required = false }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-slate-800/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/60 transition-all"
      />
    </div>
  </div>
);
