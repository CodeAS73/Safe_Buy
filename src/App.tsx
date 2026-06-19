/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Server, 
  RefreshCw, 
  Clock, 
  HelpCircle,
  FileText,
  Lock,
  Percent,
  Cpu,
  ArrowRightLeft,
  Bell,
  Inbox,
  Filter,
  Sparkles,
  ShieldAlert,
  Key,
  Database,
  Mail,
  CheckCircle,
  Check
} from 'lucide-react';

import CheckoutBuilder from './components/CheckoutBuilder';
import EscrowVault from './components/EscrowVault';
import RiskCenter from './components/RiskCenter';
import ArchitectSpecs from './components/ArchitectSpecs';
import LogisticsHub from './components/LogisticsHub';
import AdminPortal from './components/AdminPortal';
import { Transaction } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'checkout' | 'vault' | 'risk' | 'blueprints' | 'logistics' | 'ops'>('checkout');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemTime, setSystemTime] = useState('');

  // Dual-Channel Communication Strategy & Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [simSms, setSimSms] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [lastSmsCount, setLastSmsCount] = useState<number>(-1);
  const [activeSmsToast, setActiveSmsToast] = useState<any | null>(null);
  const [notifSubTab, setNotifSubTab] = useState<'inbox' | 'policy_cost' | 'sms_feed'>('inbox');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL'); // ALL, INFO, ACTION_REQUIRED, ESCALATION, CRITICAL
  const [roleFilter, setRoleFilter] = useState<string>('ALL'); // ALL, SELLER, COURIER, PICKER, CRM, FINANCE, SYSTEM_ADMIN
  const [monthlyTxInput, setMonthlyTxInput] = useState<number>(100000);

  // Sync server transactions and notification assets
  const reloadTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error('Failed to sync transaction state:', e);
    }
  };

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
      
      const smsRes = await fetch('/api/admin/simulated-sms');
      if (smsRes.ok) {
        const smsData = await smsRes.json();
        setSimSms(smsData);
        
        // Trigger simulated SMS popup whenever a new buyer message is dispatched
        if (lastSmsCount !== -1 && smsData.length > lastSmsCount) {
          const newest = smsData[0];
          setActiveSmsToast(newest);
          // Auto-hide the simulated floating phone alert after 7 seconds
          setTimeout(() => {
            setActiveSmsToast(null);
          }, 7000);
        }
        setLastSmsCount(smsData.length);
      }
    } catch (err) {
      console.error('Failed to sync communications database:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await reloadTransactions();
      await fetchNotifs();
      setIsLoading(false);
    };
    init();

    // Setup clocks and background active sync loops (polling database state change)
    setSystemTime(new Date().toLocaleTimeString());
    const clockInterval = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);

    const syncInterval = setInterval(() => {
      reloadTransactions();
      fetchNotifs();
    }, 3000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(syncInterval);
    };
  }, [lastSmsCount]);

  const handleTransactionCreated = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setActiveTab('vault');
    fetchNotifs();
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
    fetchNotifs();
  };

  // Mark specific notification as read and run deep link routing
  const handleNotifClick = async (notif: any) => {
    try {
      await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: notif.id })
      });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }

    if (notif.linkToTab) {
      setActiveTab(notif.linkToTab);
      setIsNotifOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSimulation = async (type: string) => {
    try {
      const res = await fetch('/api/admin/notifications/trigger-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        fetchNotifs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between relative">
      
      {/* FLOATING RETRIAL FOR SIMULATED CELLULAR SMS OVERLAY DOCK (WhatsApp style bottom-right) */}
      {activeSmsToast && (
        <div className="fixed bottom-6 right-6 z-50 w-80 transform transition-all duration-300 bg-slate-950 text-emerald-400 p-4 rounded-2xl border-2 border-emerald-500 shadow-[0_15px_40px_rgba(16,185,129,0.35)] flex flex-col gap-2">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-500/15">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💬</span>
              <span className="text-[9px] font-black font-mono tracking-widest text-emerald-400 uppercase">Buyer Cellular SMS Outbox</span>
            </div>
            <button 
              onClick={() => setActiveSmsToast(null)}
              className="text-slate-400 hover:text-white text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-[10px] text-slate-300 font-sans text-left">
            TO (BUYER): <strong className="text-white font-mono">{activeSmsToast.to}</strong>
          </p>
          <div className="p-3 bg-slate-900/90 rounded-xl text-left border border-emerald-500/20">
            <p className="font-mono text-[11px] leading-relaxed">
              "{activeSmsToast.message}"
            </p>
          </div>
          <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono">
            <span>Gateway: Safaricom Ltd</span>
            <span>Policy: Buyer Only</span>
          </div>
        </div>
      )}

      {/* GLOBAL COMMUNICATION CENTER DRAWER OVERLAY */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              onClick={() => setIsNotifOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform transition-all duration-300 ease-in-out shadow-2xl">
                <div className="flex h-full flex-col bg-slate-900 text-slate-100 border-l border-slate-800">
                  
                  {/* DRAWER HEADER */}
                  <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-start">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2.5 bg-emerald-500/20 text-emerald-400 font-bold rounded text-[10px] uppercase font-mono tracking-wider border border-emerald-500/30">
                          Active Policy Control
                        </span>
                        <h2 className="text-lg font-black tracking-tight text-white uppercase font-sans">
                          Communication Sandbox
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Enforcing <strong className="text-emerald-400">SMS = Buyer Only</strong>. All other stakeholders transit through secure in-app platform pipelines (reducing costs by ~70%).
                      </p>
                    </div>

                    <button 
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800/50 transition cursor-pointer font-mono"
                    >
                      ✕
                    </button>
                  </div>

                  {/* SUB-TAB TOGGLE ROW */}
                  <div className="bg-slate-950 px-6 py-2 border-b border-slate-800/80 flex gap-1.5 text-xs font-semibold">
                    <button
                      onClick={() => setNotifSubTab('inbox')}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                        notifSubTab === 'inbox'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      🔔 In-App Inbox ({notifications.filter(n => !n.isRead).length} Unread)
                    </button>

                    <button
                      onClick={() => setNotifSubTab('sms_feed')}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                        notifSubTab === 'sms_feed'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      📱 Buyer SMS Outbox ({simSms.length})
                    </button>

                    <button
                      onClick={() => setNotifSubTab('policy_cost')}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                        notifSubTab === 'policy_cost'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      📊 Savings & BI Impact
                    </button>
                  </div>

                  {/* DRAWER CONTENT MAIN VIEWPORT */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* VIEW 1: IN-APP PLATFORM INBOX */}
                    {notifSubTab === 'inbox' && (
                      <div className="space-y-6">
                        
                        {/* Filters Panel */}
                        <div className="bg-slate-950/55 p-4 rounded-xl border border-slate-800/90 space-y-3.5 text-left">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 font-mono">
                              🔍 Filter by Stakeholder Role
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {['ALL', 'SELLER', 'COURIER', 'PICKER', 'CRM', 'FINANCE', 'SYSTEM_ADMIN'].map(role => (
                                <button
                                  key={role}
                                  onClick={() => setRoleFilter(role)}
                                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono transition cursor-pointer border ${
                                    roleFilter === role
                                      ? 'bg-slate-100 text-slate-900 font-bold border-slate-200'
                                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                                  }`}
                                >
                                  {role === 'ALL' ? '● Show All' : role.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/60">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 font-mono">
                              ⚡ Filter by Priority Category
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {['ALL', 'INFO', 'ACTION_REQUIRED', 'ESCALATION', 'CRITICAL'].map(cat => {
                                const badges: Record<string, string> = {
                                  ALL: 'border-slate-700 text-slate-400',
                                  INFO: 'border-blue-900 text-blue-400 bg-blue-950/20',
                                  ACTION_REQUIRED: 'border-amber-900 text-amber-400 bg-amber-950/20',
                                  ESCALATION: 'border-orange-900 text-orange-400 bg-orange-950/20',
                                  CRITICAL: 'border-red-900 text-red-400 bg-red-950/20'
                                };
                                return (
                                  <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono transition cursor-pointer border ${
                                      categoryFilter === cat
                                        ? 'bg-slate-200 text-slate-900 font-bold border-white'
                                        : badges[cat]
                                    }`}
                                  >
                                    {cat === 'ALL' ? '● All priorities' : cat.replace('_', ' ')}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Title list header with Mark all read trigger */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-mono">
                            Showing {notifications.filter(n => {
                              const rMatch = roleFilter === 'ALL' || n.recipientRole === roleFilter;
                              const cMatch = categoryFilter === 'ALL' || n.category === categoryFilter;
                              return rMatch && cMatch;
                            }).length} platform notifications
                          </span>
                          <button
                            onClick={handleMarkAllRead}
                            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            ✓ Mark all read
                          </button>
                        </div>

                        {/* Notifications loop */}
                        <div className="space-y-3">
                          {notifications.filter(n => {
                            const rMatch = roleFilter === 'ALL' || n.recipientRole === roleFilter;
                            const cMatch = categoryFilter === 'ALL' || n.category === categoryFilter;
                            return rMatch && cMatch;
                          }).length === 0 ? (
                            <div className="p-12 text-center bg-slate-950/30 rounded-2xl border border-slate-800 border-dashed text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                              <span>📭</span>
                              <p>No notifications matching selected filters found.</p>
                            </div>
                          ) : (
                            notifications.filter(n => {
                              const rMatch = roleFilter === 'ALL' || n.recipientRole === roleFilter;
                              const cMatch = categoryFilter === 'ALL' || n.category === categoryFilter;
                              return rMatch && cMatch;
                            }).map(n => {
                              const categoryThemes = {
                                INFO: { border: 'border-blue-500/20 bg-blue-950/10 hover:bg-blue-950/20', text: 'text-blue-400', badge: 'bg-blue-950 text-blue-400 border-blue-500/30', visual: 'Information' },
                                ACTION_REQUIRED: { border: 'border-amber-500/20 bg-amber-950/10 hover:bg-amber-950/20', text: 'text-amber-400', badge: 'bg-amber-950 text-amber-400 border-amber-500/30', visual: 'Action Required' },
                                ESCALATION: { border: 'border-orange-500/20 bg-orange-950/10 hover:bg-orange-950/20', text: 'text-orange-400', badge: 'bg-orange-950 text-orange-400 border-orange-500/30', visual: 'Escalation' },
                                CRITICAL: { border: 'border-red-500/30 bg-red-950/15 hover:bg-red-950/25', text: 'text-red-400', badge: 'bg-red-950 text-red-400 border-red-500/40', visual: 'Incident Escalation' }
                              };
                              const theme = categoryThemes[n.category as keyof typeof categoryThemes] || categoryThemes.INFO;

                              return (
                                <div
                                  key={n.id}
                                  onClick={() => handleNotifClick(n)}
                                  className={`p-4 rounded-xl border text-xs transition cursor-pointer text-left relative flex justify-between gap-3 ${theme.border} ${
                                    !n.isRead ? 'border-l-4 border-l-emerald-500 pl-3.5 shadow-md bg-slate-900' : 'opacity-85'
                                  }`}
                                  id={`notif-${n.id}`}
                                >
                                  <div className="space-y-1.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                      <span className={`px-1.5 py-0.5 rounded border ${theme.badge} font-black font-mono uppercase`}>
                                        {theme.visual}
                                      </span>
                                      <span className="text-slate-400 font-mono">
                                        Deliver to: <strong>{n.recipientRole?.replace('_', ' ')} Portal</strong>
                                      </span>
                                      <span className="text-slate-500 font-mono ml-auto">
                                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </span>
                                    </div>
                                    <h4 className="text-slate-100 font-extrabold text-[12.5px] leading-snug">{n.title}</h4>
                                    <p className="text-slate-400 leading-relaxed">{n.message}</p>
                                    
                                    {n.linkToTab && (
                                      <div className="pt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 font-extrabold uppercase font-mono">
                                        <span>⚡ Deep Action Available</span>
                                        <span>•</span>
                                        <span className="underline hover:text-emerald-300">Jump raw to {n.linkToTab === 'vault' ? 'Merchant Dashboard' : n.linkToTab === 'logistics' ? 'Logistics Hub' : 'Operations Center'} →</span>
                                      </div>
                                    )}
                                  </div>
                                  {!n.isRead && (
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-none mt-1 animate-pulse" title="Unread Platform Alert"></div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* VIEW 2: simulated BUYER SMS OUTBOX */}
                    {notifSubTab === 'sms_feed' && (
                      <div className="space-y-6 animate-fade-in">
                        
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📱</span>
                            <div>
                              <p className="text-slate-300 font-bold">Secure Consumer Cellular Outbox</p>
                              <p className="text-[10px] text-slate-500">M-Pesa, Safaricom cellular carrier transactions logs (Inbound/Outbound).</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 font-mono px-2 py-1 rounded">
                            Policy: Buyer-Facing Only
                          </span>
                        </div>

                        {/* SMS LOOP */}
                        <div className="space-y-4">
                          {simSms.length === 0 ? (
                            <div className="p-12 text-center bg-slate-950/20 rounded-xl border border-slate-800 border-dashed text-slate-500 text-xs">
                              No SMS dispatches recorded in this run. Start transaction triggers or simulations!
                            </div>
                          ) : (
                            simSms.map(sms => {
                              const smsThemes = {
                                BUYER_TRANSACTION: { border: 'border-emerald-500/15 bg-slate-950/40', title: 'Buyer Transaction Confirmation', color: 'text-emerald-400' },
                                CRITICAL_SECURITY: { border: 'border-red-500/20 bg-red-950/15', title: 'Administrative Security Alert', color: 'text-red-400' },
                                MFA_VERIFICATION: { border: 'border-amber-500/20 bg-amber-950/15', title: 'Multi-Factor Handshake Token', color: 'text-amber-400' },
                                DISASTER_RECOVERY: { border: 'border-orange-500/20 bg-orange-950/15', title: 'Disaster Recovery Outage fallback', color: 'text-orange-400' }
                              };
                              const theme = smsThemes[sms.category as keyof typeof smsThemes] || smsThemes.BUYER_TRANSACTION;

                              return (
                                <div key={sms.id} className={`p-4 rounded-xl border ${theme.border} space-y-2`}>
                                  <div className="flex justify-between items-center text-[10px] font-mono">
                                    <span className={`${theme.color} font-bold flex items-center gap-1`}>
                                      <span>✉️</span> {theme.title}
                                    </span>
                                    <span className="text-slate-500 border border-slate-800 px-1 py-0.5 rounded bg-slate-950">
                                      {new Date(sms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                  </div>
                                  <div className="p-3 bg-slate-900/80 rounded-lg text-emerald-400 font-mono text-[11px] leading-relaxed border border-slate-800 text-left">
                                    <div className="text-slate-400 text-[10px] mb-1 font-sans">
                                      TO: <strong className="text-slate-200">{sms.to}</strong>
                                    </div>
                                    "{sms.message}"
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* VIEW 3: POLICY & SAVINGS ANALYTICS IMPORTS */}
                    {notifSubTab === 'policy_cost' && (
                      <div className="space-y-6 text-left">
                        
                        {/* Cost optimization illustration banner */}
                        <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 p-5 rounded-2xl border border-emerald-500/20">
                          <div className="flex justify-between mb-4">
                            <div className="space-y-1">
                              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-emerald-500/30">
                                Scalability Metric
                              </span>
                              <h3 className="text-md font-black tracking-tight text-white uppercase font-sans">
                                SMS Bulk Cost Deficit Avoided
                              </h3>
                            </div>
                            <span className="text-3xl text-emerald-400">💵</span>
                          </div>
                          
                          <p className="text-xs text-slate-300 leading-relaxed mb-4">
                            Sending bulk texts gets expensive. For each checkout link, 4 or 5 different internal roles must be pinged. By migrating **sellers, couriers, auditors, CRM, and finance** to in-app notification rails, transaction overhead is compressed.
                          </p>

                          {/* SAVINGS CARD GAUGE */}
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Old SMS Model</span>
                              <span className="text-sm font-extrabold text-red-500 font-mono">{(monthlyTxInput * 16).toLocaleString()}</span>
                              <span className="text-[8px] text-slate-505 block">16 SMS / TX</span>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-950/50">
                              <span className="text-[9px] text-emerald-400 uppercase font-mono block">New SMS Model</span>
                              <span className="text-sm font-extrabold text-emerald-400 font-mono">{(monthlyTxInput * 5).toLocaleString()}</span>
                              <span className="text-[8px] text-slate-505 block">5 SMS / TX</span>
                            </div>
                            <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl font-bold flex flex-col justify-center items-center">
                              <span className="text-[8px] uppercase tracking-wider block opacity-75">Net Savings</span>
                              <span className="text-xs font-black font-mono">~69% SAVED</span>
                              <span className="text-[8.5px] block font-mono">KSh {Math.floor(monthlyTxInput * 11 * 0.55).toLocaleString()} / Mo</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive transaction slider calculator */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                          <h4 className="text-xs font-bold uppercase font-mono text-slate-300">
                            ⚙️ Interactive Scalability Calculator
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-400">Target Transactions Per Month:</span>
                              <span className="text-emerald-400 font-extrabold">{monthlyTxInput.toLocaleString()} / mo</span>
                            </div>
                            <input 
                              type="range" 
                              min="1000" 
                              max="1000000" 
                              step="5000"
                              value={monthlyTxInput}
                              onChange={(e) => setMonthlyTxInput(parseInt(e.target.value))}
                              className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer transition-all"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>1k tx</span>
                              <span>250k</span>
                              <span>500k</span>
                              <span>750k</span>
                              <span>1M transactions</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-lg border border-slate-805 text-xs leading-relaxed space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Standard Bulk SMS Unit Cost:</span>
                              <span className="text-slate-300 font-mono">Ksh 0.55 / message</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">Estimated Monthly Expense (Old Model):</span>
                              <span className="text-red-400 font-mono">Ksh {Math.floor(monthlyTxInput * 16 * 0.55).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-800/80">
                              <span className="text-white font-bold">Estimated Monthly Expense (New Model):</span>
                              <span className="text-emerald-400 font-bold font-mono">Ksh {Math.floor(monthlyTxInput * 5 * 0.55).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-[10px] pt-1">
                              <span>Operating Profit Reclaimed:</span>
                              <span className="text-emerald-400 font-bold font-mono">+Ksh {Math.floor(monthlyTxInput * 11 * 0.55).toLocaleString()} Saved</span>
                            </div>
                          </div>
                        </div>

                        {/* ALLOWED SCENARIOS EXCEPTION PANEL */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold uppercase font-mono text-slate-300">
                              ⚠️ Safe Policy Exception Triggers
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              There are exactly three administrative exceptions where security directives permit real-time SMS alerts for staff. Trigger safe simulated handshakes:
                            </p>
                          </div>

                          <div className="space-y-2 text-xs">
                            <button
                              onClick={() => triggerSimulation('CRITICAL_SECURITY')}
                              className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg border border-slate-800 hover:border-red-500/40 transition text-left flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <strong className="text-red-400 block font-sans">1. Security Intrusion Alarm</strong>
                                <span className="text-[10px] text-slate-400">Auto-locks physical access endpoints and reports threats.</span>
                              </div>
                              <span className="text-[10px] bg-red-950 text-red-500 font-bold px-2 py-1 rounded border border-red-500/20 font-mono">FIRE →</span>
                            </button>

                            <button
                              onClick={() => triggerSimulation('MFA_VERIFICATION')}
                              className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg border border-slate-800 hover:border-amber-500/40 transition text-left flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <strong className="text-amber-400 block font-sans">2. Multi-Factor Handshake Token (MFA OTP)</strong>
                                <span className="text-[10px] text-slate-400">SMS OTP token verify clearance for sensitive merchant transfers.</span>
                              </div>
                              <span className="text-[10px] bg-amber-950 text-amber-500 font-bold px-2 py-1 rounded border border-amber-500/20 font-mono">FIRE →</span>
                            </button>

                            <button
                              onClick={() => triggerSimulation('DISASTER_RECOVERY')}
                              className="w-full p-3 bg-slate-950 hover:bg-slate-850 text-slate-200 hover:text-white rounded-lg border border-slate-800 hover:border-orange-500/40 transition text-left flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <strong className="text-orange-400 block font-sans">3. Disaster Recovery Communications Outage fallback</strong>
                                <span className="text-[10px] text-slate-400">Triggers cellular broadcasts when internet node failure declared.</span>
                              </div>
                              <span className="text-[10px] bg-orange-950 text-orange-500 font-bold px-2 py-1 rounded border border-orange-500/20 font-mono">FIRE →</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* DRAWER FOOTER */}
                  <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Ledger Node: l-za-nairobi-primary</span>
                    <span>v2.1_comm_amendment</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row justify-between items-center py-2 sm:py-0 gap-2">
          
          {/* Logo Brand with Protective Locks badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-900 border border-emerald-400">
              <span className="text-xl">🛡️</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-sans uppercase">Buy Safely</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Kenya Escrow
                </span>
              </div>
              <p className="text-[10px] text-slate-400">African Social Commerce Escrow & Verification Infrastructure</p>
            </div>
          </div>

          {/* Operational Indicators */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>CBK Sandbox Live</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safaricom Daraja API Active</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{systemTime || '11:02:21 UTC'}</span>
            </div>

            {/* Interactive Notification Bell Activator */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                  isNotifOpen 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg' 
                    : 'bg-slate-800/60 border-slate-800 text-slate-200 hover:bg-slate-800/90 hover:text-white'
                }`}
                title="Open Dual-Channel Communication Center"
              >
                <Bell className={`w-4 h-4 ${notifications.filter(n => !n.isRead).length > 0 ? 'animate-bounce text-emerald-400' : ''}`} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-sans text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* CORE APPLICATION CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* UPPER NAVIGATION BAR & TAB TOGGLERS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
            
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'checkout' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              🚀 <span>Checkout Link Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'vault' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              🛡️ <span>Escrow Locker Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('risk')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'risk' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              📊 <span>Unified Risk Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'logistics' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              🚚 <span>Logistics Hub & Partners</span>
            </button>

            <button
              onClick={() => setActiveTab('blueprints')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'blueprints' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              📚 <span>Blueprints & Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('ops')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'ops' 
                  ? 'bg-red-600 text-white font-extrabold shadow' 
                  : 'bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-800 shadow-xs'
              }`}
            >
              🏢 <span>Internal Ops Portal</span>
            </button>

          </div>

          {/* Quick sync reload state indicator */}
          <button 
            onClick={reloadTransactions}
            className="text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-2 hover:border-slate-300 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh State
          </button>
        </div>

        {/* TAB SWITCHBOARD VIEWPORTS */}
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500 font-mono">Initializing fractional escrow ledger databases...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. checkout LINK BUILDER */}
            {activeTab === 'checkout' && (
              <CheckoutBuilder onTransactionCreated={handleTransactionCreated} />
            )}

            {/* 2. ESCROW VAULT & WORKFLOWS */}
            {activeTab === 'vault' && (
              <EscrowVault 
                transactions={transactions} 
                onRefresh={reloadTransactions}
                onUpdateTransaction={handleUpdateTransaction}
              />
            )}

            {/* 3. RISK CENTER */}
            {activeTab === 'risk' && (
              <RiskCenter transactions={transactions} />
            )}

            {/* 3.5 LOGISTICS & PARTNER CO-ESCROW HUB */}
            {activeTab === 'logistics' && (
              <LogisticsHub 
                transactions={transactions} 
                onRefresh={reloadTransactions}
                onUpdateTransaction={handleUpdateTransaction}
              />
            )}

            {/* 4. bluePRINTS AND ARCHITECTURE SPECS */}
            {activeTab === 'blueprints' && (
              <ArchitectSpecs />
            )}

            {/* 5. SECURE INTERNAL OPERATIONS PORTAL (RBAC SECURED) */}
            {activeTab === 'ops' && (
              <AdminPortal 
                transactions={transactions} 
                onRefresh={reloadTransactions} 
              />
            )}

          </div>
        )}

      </main>

      {/* FOOTER METRIC BANNER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 leading-relaxed">
          <div className="flex justify-center items-center gap-3">
            <span className="w-10 h-0.5 bg-slate-800"></span>
            <span className="text-slate-200 font-black tracking-widest uppercase text-[10px]">Licensed Trust Account Structure</span>
            <span className="w-10 h-0.5 bg-slate-800"></span>
          </div>
          <p className="max-w-2xl mx-auto text-[11px] text-slate-500">
            "Buy Safely" complies with National Payment System (NPS) guidelines, safeguarding consumer funds under NCBA Trust custodianship. This is a fully interactive, production-ready fintech escrow sandbox configured to trigger real-time Google Gemini AI OCR analysis for waybill proof and Safaricom Daraja STK webhook reconciliations.
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            Platform ID: fb1b6d40-2d9f-4224-aed6-a029553b04ee • Nairobi, Kenya • © {new Date().getFullYear()} Buy Safely Africa
          </p>
        </div>
      </footer>

    </div>
  );
}
