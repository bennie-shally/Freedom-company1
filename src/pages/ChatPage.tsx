/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

export const ChatPage: React.FC = () => {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Chat is unique per user, messages are subcollection of /chats/{userId}/messages
    const q = query(
      collection(db, 'chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `chats/${user.uid}/messages`);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const messageToSend = inputText;
    setInputText('');

    try {
      // Ensure the parent chat document exists so admins can see it in their list
      await setDoc(doc(db, 'chats', user.uid), {
        lastMessage: messageToSend,
        lastMessageAt: serverTimestamp(),
        username: userData?.username || 'User',
        updatedAt: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        senderId: user.uid,
        text: messageToSend,
        timestamp: serverTimestamp(),
        isAdmin: false,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${user.uid}/messages`);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col z-[100]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-[11px] uppercase tracking-widest text-white leading-none">Freedom Support</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">Active Node</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Initialising Secure Link...</div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-8 opacity-40 px-10">
            <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-white font-black uppercase tracking-[0.2em]">Channel Secured</p>
              <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest">Hello {userData?.username || 'User'}! How can we help you today?</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-bold leading-relaxed ${
                  msg.isAdmin 
                    ? 'bg-white/5 text-slate-300 rounded-tl-none border border-white/10 shadow-2xl shadow-black' 
                    : 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-900/20'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[8px] text-gray-600 font-black uppercase mt-2 tracking-[0.2em] px-1">
                {msg.timestamp ? (
                   format(msg.timestamp.toDate?.() || new Date(msg.timestamp), 'HH:mm')
                ) : 'Syncing...'}
              </span>
            </motion.div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0D0D0D] border-t border-white/5 pb-safe shrink-0">
        <form 
          onSubmit={handleSend} 
          className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl focus-within:border-blue-500/40 transition-all"
        >
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-slate-700 text-white font-bold"
            placeholder="TYPE_YOUR_MESSAGE"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow-xl shadow-blue-900/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
