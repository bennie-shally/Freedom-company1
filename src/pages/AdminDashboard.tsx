/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, increment, getDoc, setDoc, orderBy, writeBatch, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { 
  BarChart3, Users, Wallet, ReceiptText, Settings, MessageSquare, 
  Check, X, Eye, ArrowUpRight, ArrowDownLeft, Save, Plus, Trash2, 
  Menu as Hamburger, User as UserIcon, Shield as AdminShield,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

type AdminTab = 'overview' | 'users' | 'plans' | 'deposits' | 'withdrawals' | 'settings' | 'chats';

export const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Auth check
  useEffect(() => {
    if (loading) return;
    
    // Auto-authenticate if logged in as the specific admin email
    if (user?.email === 'btechtools.ng@gmail.com') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setAuthenticated(true);
      return;
    }

    const isAdminAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    
    if (!isAdminAuth) {
      if (user) {
        // If logged in but not admin email, definitely no access
        navigate('/landing');
      } else {
        navigate('/admin/login', { replace: true });
      }
    } else if (user) {
      setAuthenticated(true);
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-black tracking-[0.5em] text-blue-500 uppercase animate-pulse">Security Check...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center gap-8">
        <div className="w-20 h-20 rounded-[2rem] bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-2xl shadow-red-500/10">
          <AdminShield className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Identity Required</h1>
            <p className="text-slate-500 text-sm font-medium">To access administrative functions, you must first verify your primary identity. Please log in to your account.</p>
        </div>
        <button 
            onClick={() => navigate('/login?redirect=/admin/dashboard')}
            className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-2xl"
        >
            Identity Verification
        </button>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-brand-muted/50 border-r border-white/5 p-6 gap-8">
        <Logo />
        <nav className="flex flex-col gap-2">
          <SidebarLink active={activeTab === 'overview'} icon={<BarChart3 className="w-5 h-5"/>} label="Overview" onClick={() => setActiveTab('overview')} />
          <SidebarLink active={activeTab === 'users'} icon={<Users className="w-5 h-5"/>} label="Users" onClick={() => setActiveTab('users')} />
          <SidebarLink active={activeTab === 'plans'} icon={<ReceiptText className="w-5 h-5"/>} label="Investment Plans" onClick={() => setActiveTab('plans')} />
          <SidebarLink active={activeTab === 'deposits'} icon={<ArrowDownLeft className="w-5 h-5"/>} label="Deposits" onClick={() => setActiveTab('deposits')} />
          <SidebarLink active={activeTab === 'withdrawals'} icon={<ArrowUpRight className="w-5 h-5"/>} label="Withdrawals" onClick={() => setActiveTab('withdrawals')} />
          <SidebarLink active={activeTab === 'chats'} icon={<MessageSquare className="w-5 h-5"/>} label="Live Chats" onClick={() => setActiveTab('chats')} />
          <SidebarLink active={activeTab === 'settings'} icon={<Settings className="w-5 h-5"/>} label="System Settings" onClick={() => setActiveTab('settings')} />
          <div className="mt-auto pt-4 border-t border-white/5">
            <button 
              onClick={async () => {
                sessionStorage.removeItem('isAdminAuthenticated');
                await auth.signOut();
                navigate('/landing');
              }}
              className="flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold w-full"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm tracking-wide">Secure Exit</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-muted/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-6">
        <Logo />
        <button onClick={() => setIsSidebarOpen(true)}><Hamburger className="w-6 h-6"/></button>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed top-0 left-0 bottom-0 w-72 bg-brand-muted z-[60] p-8 flex flex-col gap-10 shadow-2xl lg:hidden">
              <div className="flex justify-between items-center">
                <Logo />
                <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6"/></button>
              </div>
              <nav className="flex flex-col gap-2">
                <SidebarLink active={activeTab === 'overview'} icon={<BarChart3 className="w-5 h-5"/>} label="Overview" onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'users'} icon={<Users className="w-5 h-5"/>} label="Users" onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'plans'} icon={<ReceiptText className="w-5 h-5"/>} label="Plans" onClick={() => { setActiveTab('plans'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'deposits'} icon={<ArrowDownLeft className="w-5 h-5"/>} label="Deposits" onClick={() => { setActiveTab('deposits'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'withdrawals'} icon={<ArrowUpRight className="w-5 h-5"/>} label="Withdrawals" onClick={() => { setActiveTab('withdrawals'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'chats'} icon={<MessageSquare className="w-5 h-5"/>} label="Live Chats" onClick={() => { setActiveTab('chats'); setIsSidebarOpen(false); }} />
                <SidebarLink active={activeTab === 'settings'} icon={<Settings className="w-5 h-5"/>} label="Settings" onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
                <button 
                  onClick={async () => {
                    sessionStorage.removeItem('isAdminAuthenticated');
                    await auth.signOut();
                    navigate('/landing');
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold w-full mt-4 border-t border-white/5"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm tracking-wide">Secure Exit</span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 pt-24 md:pt-10 overflow-y-auto">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'plans' && <AdminPlans />}
        {activeTab === 'deposits' && <AdminDeposits />}
        {activeTab === 'withdrawals' && <AdminWithdrawals />}
        {activeTab === 'settings' && <AdminSettings />}
        {activeTab === 'chats' && <AdminChats />}
      </main>
    </div>
  );
};

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-black font-black">F</div>
    <div className="flex flex-col">
      <span className="font-black tracking-widest text-lg">FREEDOM</span>
      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">Admin Control</span>
    </div>
  </div>
);

const SidebarLink = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group w-full",
      active 
        ? "bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/10" 
        : "text-gray-400 hover:text-white hover:bg-white/5 font-medium"
    )}
  >
    <div className={cn("transition-colors", active ? "text-black" : "text-gray-500 group-hover:text-white")}>
      {icon}
    </div>
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);

// --- Sub Panels ---

const AdminPlans = () => {
    const [plans, setPlans] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [formData, setFormData] = useState({
      name: '', minAmount: 300, maxAmount: 5000, 
      profitPercent: 50, durationHours: 8, description: ''
    });

    useEffect(() => {
      const q = query(collection(db, 'investment_plans'), orderBy('minAmount', 'asc'));
      return onSnapshot(q, s => setPlans(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.LIST, 'investment_plans'));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = {
              ...formData,
              returnPercent: formData.profitPercent // Sync for rules
            };
            if (editingPlan) {
                await updateDoc(doc(db, 'investment_plans', editingPlan.id), dataToSave);
            } else {
                await addDoc(collection(db, 'investment_plans'), dataToSave);
            }
            setIsAdding(false);
            setEditingPlan(null);
            setFormData({ name: '', minAmount: 300, maxAmount: 5000, profitPercent: 50, durationHours: 8, description: '' });
        } catch (err: any) {
            handleFirestoreError(err, OperationType.WRITE, 'investment_plans');
        }
    };

    const deletePlan = async (id: string) => {
        // Use a standard non-blocking confirm if window.confirm is quirky
        const confirmed = window.confirm('RECOVERY ALERT: Are you sure you want to permanently delete this Matrix Node? This action is irreversible.');
        if (!confirmed) return;
        
        try {
            console.log("Attempting to delete plan:", id);
            await deleteDoc(doc(db, 'investment_plans', id));
            console.log("Plan deleted successfully");
        } catch (err: any) {
            console.error("Critical Failure: Delete operation rejected by cloud node.", err);
            handleFirestoreError(err, OperationType.DELETE, `investment_plans/${id}`);
            alert(`OPERATIONAL ERROR: ${err.message || 'Access Denied. Check System Rules.'}`);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Investment Plans</h2>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-6 py-3 bg-brand-primary text-black font-black uppercase text-xs tracking-widest rounded-2xl flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.length === 0 ? (
                    <div className="col-span-full py-20 bg-brand-muted/20 border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center gap-4 opacity-50">
                        <ReceiptText className="w-12 h-12" />
                        <div className="flex flex-col">
                            <span className="font-bold uppercase tracking-widest text-sm">No Active Nodes</span>
                            <p className="text-[10px] uppercase font-bold text-gray-500">Initialize a new investment plan to begin intake</p>
                        </div>
                    </div>
                ) : (
                    plans.map(p => (
                        <div key={p.id} className="bg-brand-muted/50 border border-white/5 rounded-[32px] p-8 flex flex-col gap-6 relative group">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Plan Name</span>
                                    <h4 className="text-xl font-black text-white">{p.name}</h4>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { 
                                            setEditingPlan(p); 
                                            setFormData({
                                                name: p.name || '',
                                                minAmount: p.minAmount || 0,
                                                maxAmount: p.maxAmount || 0,
                                                profitPercent: p.profitPercent || p.returnPercent || 0,
                                                durationHours: p.durationHours || 8,
                                                description: p.description || ''
                                            }); 
                                            setIsAdding(true); 
                                        }}
                                        className="p-2 bg-white/5 hover:bg-brand-primary hover:text-black rounded-lg transition-all"
                                        title="Edit Node"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deletePlan(p.id);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                        title="Delete Node"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-500 uppercase font-bold">Min-Max</span>
                                    <span className="font-mono text-sm">{formatCurrency(p.minAmount)} - {formatCurrency(p.maxAmount)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-500 uppercase font-bold">Duration</span>
                                    <span className="font-mono text-sm">{p.durationHours || p.durationDays} Hours</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-brand-primary uppercase font-bold">Returns</span>
                                    <span className="font-black text-xl text-brand-primary">{p.profitPercent || p.returnPercent}%</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-brand-muted border border-white/10 w-full max-w-xl rounded-[40px] p-10 flex flex-col gap-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black uppercase tracking-tight">{editingPlan ? 'Edit Plan' : 'New Matrix Node'}</h3>
                                <button onClick={() => { setIsAdding(false); setEditingPlan(null); }} className="p-3 bg-white/5 rounded-full"><X className="w-6 h-6"/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <SettingsInput label="Plan Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <SettingsInput label="Min Amount (PHP)" type="number" value={(formData.minAmount ?? '').toString()} onChange={v => setFormData({...formData, minAmount: Number(v)})} />
                                    <SettingsInput label="Max Amount (PHP)" type="number" value={(formData.maxAmount ?? '').toString()} onChange={v => setFormData({...formData, maxAmount: Number(v)})} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <SettingsInput label="Returns (%)" type="number" value={(formData.profitPercent ?? '').toString()} onChange={v => setFormData({...formData, profitPercent: Number(v)})} />
                                    <SettingsInput label="Duration (Hours)" type="number" value={(formData.durationHours ?? '').toString()} onChange={v => setFormData({...formData, durationHours: Number(v)})} />
                                </div>

                                <button className="w-full py-5 bg-brand-primary text-black font-black uppercase tracking-widest rounded-3xl mt-4 active:scale-95 transition-all">
                                    {editingPlan ? 'Confirm Matrix Update' : 'Initialize Node'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AdminOverview = () => {
  const [stats, setStats] = useState({ users: 0, depositSum: 0, withdrawSum: 0, pendingDep: 0, pendingWit: 0 });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), s => setStats(prev => ({...prev, users: s.size})), (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
    const unsubDep = onSnapshot(query(collection(db, 'deposits'), where('status', '==', 'pending')), s => setStats(prev => ({...prev, pendingDep: s.size})), (err) => handleFirestoreError(err, OperationType.LIST, 'deposits'));
    const unsubWit = onSnapshot(query(collection(db, 'withdrawals'), where('status', '==', 'pending')), s => setStats(prev => ({...prev, pendingWit: s.size})), (err) => handleFirestoreError(err, OperationType.LIST, 'withdrawals'));
    
    return () => { unsubUsers(); unsubDep(); unsubWit(); };
  }, []);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-white uppercase">System Matrix</h2>
        <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">Real-time operational awareness</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard label="Verified Identities" value={stats.users.toString()} icon={<Users className="w-6 h-6"/>} color="text-blue-400" />
        <StatsCard label="Pending Injections" value={stats.pendingDep.toString()} icon={<ArrowDownLeft className="w-6 h-6"/>} color="text-emerald-400" />
        <StatsCard label="Pending Extractions" value={stats.pendingWit.toString()} icon={<ArrowUpRight className="w-6 h-6"/>} color="text-red-400" />
      </div>

      <div className="glass-panel border-white/10 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl -z-10" />
        <div className="w-24 h-24 rounded-[2rem] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-2xl">
          <AdminShield className="w-12 h-12" />
        </div>
        <div className="max-w-lg">
          <h3 className="text-3xl font-black mb-4 tracking-tight text-white uppercase">Neural Link Active</h3>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Core infrastructure is synchronized across all browser nodes. Encryption tunnels (AES-256) are maintaining 99.9% uptime for transaction validation.
          </p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Database Sync</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">HMR Socket</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-brand-muted/50 border border-white/5 p-8 rounded-[32px] flex flex-col gap-4">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5", color)}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">{label}</span>
      <span className="text-4xl font-mono font-bold tracking-tighter">{value}</span>
    </div>
  </div>
);

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => setUsers(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
  }, []);

    const adjustBalance = async (uid: string, amount: number) => {
        try {
            await updateDoc(doc(db, 'users', uid), { balance: increment(amount) });
        } catch (err: any) {
            handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }
    };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold">Manage Users</h2>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] uppercase font-black tracking-widest text-gray-500">
              <th className="px-4 pb-2">User</th>
              <th className="px-4 pb-2">Balance</th>
              <th className="px-4 pb-2">Referred By</th>
              <th className="px-4 pb-2">Role</th>
              <th className="px-4 pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="bg-brand-muted/50 border border-white/5 transition-all hover:bg-white/5 group">
                <td className="px-4 py-6 rounded-l-3xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{u.username}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{u.email}</span>
                    <span className="text-[8px] text-brand-primary font-bold uppercase mt-1">Code: {u.referralCode}</span>
                  </div>
                </td>
                <td className="px-4 py-6 font-mono text-brand-primary font-bold">{formatCurrency(u.balance)}</td>
                <td className="px-4 py-6">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{u.referredBy || 'Organic'}</span>
                </td>
                <td className="px-4 py-6">
                   <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full", u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400')}>
                    {u.role}
                   </span>
                </td>
                <td className="px-4 py-6 rounded-r-3xl text-right flex items-center justify-end gap-2 h-full">
                  <button onClick={() => adjustBalance(u.id, 1000)} className="p-2 bg-green-500/10 text-green-400 rounded-lg"><Plus className="w-4 h-4"/></button>
                  <button onClick={() => adjustBalance(u.id, -1000)} className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Check className="w-4 h-4 rotate-180"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, s => setDeposits(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.LIST, 'deposits'));
  }, []);

  const handleAction = async (dep: any, action: 'approved' | 'rejected') => {
    try {
        const batch = writeBatch(db);
        batch.update(doc(db, 'deposits', dep.id), { status: action, reviewedAt: serverTimestamp() });
        if (action === 'approved') {
          batch.update(doc(db, 'users', dep.userId), { balance: increment(dep.amount) });
        }
        await batch.commit();
    } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, 'deposits/batch');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold">Deposits Approval</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {deposits.map(d => (
          <div key={d.id} className="bg-brand-muted/50 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">User</span>
                <span className="font-bold text-lg">{d.username}</span>
                <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">
                  {d.createdAt ? format(d.createdAt.toDate?.() || new Date(d.createdAt), 'PPP pp') : 'Pending'}
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-2xl font-mono font-black text-brand-primary">{formatCurrency(d.amount)}</span>
                <span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-full mt-1", d.status === 'pending' ? 'bg-orange-500/10 text-orange-400' : d.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                  {d.status}
                </span>
              </div>
            </div>

            <div className="h-48 bg-black/50 rounded-2xl overflow-hidden relative group">
              <img src={d.proofUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Proof" />
              <button 
                onClick={() => window.open(d.proofUrl, '_blank')}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Eye className="w-8 h-8 text-white" />
              </button>
            </div>

            {d.status === 'pending' && (
              <div className="flex gap-3">
                <button onClick={() => handleAction(d, 'approved')} className="flex-1 py-4 bg-green-500 text-black font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95">Approve</button>
                <button onClick={() => handleAction(d, 'rejected')} className="flex-1 py-4 bg-white/5 border border-white/10 text-red-500 font-bold uppercase tracking-widest rounded-2xl transition-all active:scale-95">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);

    useEffect(() => {
      const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, s => setWithdrawals(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.LIST, 'withdrawals'));
    }, []);

    const handleAction = async (wit: any, action: 'approved' | 'rejected') => {
      try {
          const batch = writeBatch(db);
          batch.update(doc(db, 'withdrawals', wit.id), { status: action });
          // If rejected, refund the balance (already deducted on request)
          if (action === 'rejected') {
            batch.update(doc(db, 'users', wit.userId), { balance: increment(wit.amount) });
          }
          await batch.commit();
      } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, 'withdrawals/batch');
      }
    };

    return (
      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold">Withdrawals Approval</h2>
        <div className="flex flex-col gap-4">
          {withdrawals.map(w => (
            <div key={w.id} className="bg-brand-muted/50 border border-white/5 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1 pr-4 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0">
                <span className="text-[10px] text-gray-500 font-black uppercase">Recipient</span>
                <span className="font-bold">{w.username}</span>
                <span className="text-xs text-gray-400">{w.bankDetails}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-black uppercase">Payout Details</span>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase">Gross</span>
                    <span className="font-mono text-sm line-through opacity-50">{formatCurrency(w.amount)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-green-500 uppercase">Net (After Fee)</span>
                    <span className="font-mono text-xl font-black text-brand-primary">{formatCurrency(w.netAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {w.status === 'pending' ? (
                  <>
                    <button onClick={() => handleAction(w, 'approved')} className="p-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95">Complete Transfer</button>
                    <button onClick={() => handleAction(w, 'rejected')} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95">Reject</button>
                  </>
                ) : (
                  <span className={cn("px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest", w.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                    {w.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
};

const AdminSettings = () => {
    const [settings, setSettings] = useState<any>({
      gcashName: '', gcashNumber: '', withdrawalFeePercent: 10, minWithdrawal: 1000, 
      maxWithdrawal: 100000, referralBonus: 2000, whatsappAdmin: '', whatsappGroup: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      getDoc(doc(db, 'settings', 'global')).then(s => s.exists() && setSettings(s.data()));
    }, []);

    const saveSettings = async () => {
      setLoading(true);
      await setDoc(doc(db, 'settings', 'global'), settings);
      setLoading(false);
      alert('Settings saved successfully!');
    };

    return (
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Global Configuration</h2>
            <button onClick={saveSettings} disabled={loading} className="px-8 py-3 bg-brand-primary text-black font-black uppercase tracking-widest rounded-2xl flex items-center gap-2">
                <Save className="w-5 h-5"/> {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SettingsBox title="Payment (GCash)">
                <SettingsInput label="Account Name" value={settings.gcashName} onChange={v => setSettings({...settings, gcashName: v})} />
                <SettingsInput label="Account Number" value={settings.gcashNumber} onChange={v => setSettings({...settings, gcashNumber: v})} />
            </SettingsBox>
            
            <SettingsBox title="Fees & Limits">
                <SettingsInput label="Withdrawal Fee (%)" value={(settings.withdrawalFeePercent ?? '').toString()} onChange={v => setSettings({...settings, withdrawalFeePercent: Number(v)})} type="number" />
                <div className="grid grid-cols-2 gap-4">
                    <SettingsInput label="Min Withdraw" value={(settings.minWithdrawal ?? '').toString()} onChange={v => setSettings({...settings, minWithdrawal: Number(v)})} type="number" />
                    <SettingsInput label="Max Withdraw" value={(settings.maxWithdrawal ?? '').toString()} onChange={v => setSettings({...settings, maxWithdrawal: Number(v)})} type="number" />
                </div>
            </SettingsBox>

            <SettingsBox title="Bonuses">
                <SettingsInput label="Referral Bonus (PHP)" value={(settings.referralBonus ?? '').toString()} onChange={v => setSettings({...settings, referralBonus: Number(v)})} type="number" />
            </SettingsBox>

            <SettingsBox title="Links">
                <SettingsInput label="WhatsApp Admin Link" value={settings.whatsappAdmin} onChange={v => setSettings({...settings, whatsappAdmin: v})} />
                <SettingsInput label="WhatsApp Group Link" value={settings.whatsappGroup} onChange={v => setSettings({...settings, whatsappGroup: v})} />
            </SettingsBox>
        </div>
      </div>
    );
};

const SettingsBox = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-brand-muted/50 border border-white/5 rounded-[32px] p-8 flex flex-col gap-6">
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-4">{title}</h4>
        {children}
    </div>
);

const SettingsInput = ({ label, value, onChange, type='text' }: { label: string, value: string, onChange: (v: string) => void, type?: string }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase font-bold text-gray-600 tracking-widest ml-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium outline-none focus:border-brand-primary/30"
        />
    </div>
);

const AdminChats = () => {
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
      return onSnapshot(collection(db, 'chats'), s => setChats(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.LIST, 'chats'));
    }, []);

    useEffect(() => {
      if (!selectedChatId) return;
      const q = query(collection(db, 'chats', selectedChatId, 'messages'), orderBy('timestamp', 'asc'));
      return onSnapshot(q, s => setMessages(s.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.LIST, `chats/${selectedChatId}/messages`));
    }, [selectedChatId]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedChatId) return;
        
        const text = replyText;
        setReplyText('');

        const batch = writeBatch(db);
        batch.update(doc(db, 'chats', selectedChatId), {
            lastMessage: text,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        batch.set(doc(collection(db, 'chats', selectedChatId, 'messages')), {
            text,
            senderId: 'admin',
            isAdmin: true,
            timestamp: serverTimestamp()
        });

        await batch.commit();
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-80 flex flex-col gap-4">
                <h2 className="text-3xl font-bold">Support Inbox</h2>
                <div className="flex flex-col gap-2 overflow-y-auto pr-2">
                    {chats.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => setSelectedChatId(c.id)}
                            className={cn("p-5 rounded-3xl border text-left transition-all", selectedChatId === c.id ? "bg-brand-primary text-black border-brand-primary shadow-lg" : "bg-brand-muted/50 border-white/5 hover:bg-white/5")}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", selectedChatId === c.id ? "bg-black text-white" : "bg-white/10 text-brand-primary")}>
                                    {(c.username || c.id)[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-sm truncate">{c.username || c.id}</span>
                                    <span className="text-[9px] uppercase font-bold opacity-60 truncate">{c.lastMessage || 'Active Chat'}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-brand-muted/50 border border-white/5 rounded-[40px] flex flex-col overflow-hidden min-h-[600px]">
                {selectedChatId ? (
                    <>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <span className="font-bold uppercase tracking-widest text-[10px] text-gray-500">Chatting with: {selectedChatId}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={cn("flex flex-col", m.isAdmin ? "items-end" : "items-start")}>
                                    <div className={cn("max-w-[80%] p-4 rounded-3xl text-sm", m.isAdmin ? "bg-brand-primary text-black rounded-tr-none" : "bg-white/5 text-white rounded-tl-none border border-white/5")}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleReply} className="p-4 bg-black/30 border-t border-white/5 flex gap-3">
                            <input 
                                value={replyText} 
                                onChange={e => setReplyText(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-brand-primary/30"
                                placeholder="Write a reply..."
                            />
                            <button className="px-8 bg-brand-primary text-black font-black uppercase text-xs rounded-2xl">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 p-20 opacity-30">
                        <MessageSquare className="w-20 h-20" />
                        <p className="text-sm font-bold uppercase tracking-[0.3em]">Select a chat to begin support</p>
                    </div>
                )}
            </div>
        </div>
    );
};
