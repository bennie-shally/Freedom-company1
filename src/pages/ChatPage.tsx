/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

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
      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        senderId: user.uid,
        text: messageToSend,
        timestamp: serverTimestamp(),
        isAdmin: false,
      });
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col z-[60]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-brand-muted/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-gray-400">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm">Freedom Support</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Connecting...</div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 px-10">
            <div className="p-6 bg-brand-muted/30 rounded-full">
              <User className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">Hello {userData?.username}! How can we help you today? Send a message to start.</p>
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
                className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                  msg.isAdmin 
                    ? 'bg-brand-muted/80 text-white rounded-tl-none border border-white/5' 
                    : 'bg-brand-primary text-black rounded-tr-none shadow-lg shadow-brand-primary/10'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-gray-600 font-bold uppercase mt-1 px-1">
                {msg.timestamp ? format(msg.timestamp.toDate(), 'hh:mm a') : '...ing'}
              </span>
            </motion.div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-brand-muted/30 border-t border-white/5 safe-area-bottom">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-[28px] focus-within:border-brand-primary/30 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-gray-700"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-brand-primary text-black rounded-full disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
