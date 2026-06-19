import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRightLeft, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  ExternalLink, 
  Upload, 
  Cpu, 
  Smartphone,
  Info,
  ChevronDown,
  RefreshCw,
  Plus,
  Truck,
  Package,
  Check,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Transaction, TimelineEvent, AIVerificationResult } from '../types';

interface EscrowVaultProps {
  transactions: Transaction[];
  onRefresh: () => void;
  onUpdateTransaction: (updatedTx: Transaction) => void;
}

export const FINE_GRAINED_TRACKING_STATUSES = [
  'ORDER_CREATED',
  'PAYMENT_PENDING',
  'ESCROW_FUNDED',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'AWAITING_CONFIRMATION',
  'RELEASED',
  'DISPUTED',
  'REFUNDED'
];

export default function EscrowVault({ transactions, onRefresh, onUpdateTransaction }: EscrowVaultProps) {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('fargo'); // fargo, mpesaSMS, manipulated
  const [shippingCarrier, setShippingCarrier] = useState('Fargo Courier');
  const [disputeReason, setDisputeReason] = useState('Counterfeit or low-grade leather variant delivered.');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [viewingRole, setViewingRole] = useState<'admin' | 'buyer' | 'seller' | 'courier'>('admin');

  // Advanced logistics simulation states
  const getMerchantSuccessFeeDetails = (amount: number) => {
    let pct = 3.0; // Tier 1: 0 - 100,000 GMV or smaller transactions
    if (amount > 100000) pct = 1.5;
    else if (amount > 20000) pct = 2.0;
    else if (amount > 5000) pct = 2.5;
    const feeAmount = Math.round(amount * (pct / 100));
    return { pct, feeAmount };
  };

  const [adminOverrideCourierId, setAdminOverrideCourierId] = useState('DP-002');
  const [adminOverrideReason, setAdminOverrideReason] = useState('Rider mechanical issue / Route re-optimization');
  const [enteredHandoverPin, setEnteredHandoverPin] = useState('');
  const [showLiveGPS, setShowLiveGPS] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const declineCourier = async () => {
    if (!activeTx) return;
    try {
      const response = await fetch(`/api/transactions/${activeTx.id}/decline-courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const overrideCourier = async () => {
    if (!activeTx) return;
    const items = [
      { id: 'DP-001', name: 'Rider John (Boda Dispatch)', type: 'RIDER' },
      { id: 'DP-002', name: 'Driver Mary (City Probox)', type: 'DRIVER' },
      { id: 'DP-003', name: 'Picker Alex (Safety Inspector)', type: 'PICKER' },
    ];
    const item = items.find(i => i.id === adminOverrideCourierId) || items[1];

    try {
      const response = await fetch(`/api/transactions/${activeTx.id}/override-courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newCourierId: item.id,
          newCourierName: item.name,
          newCourierType: item.type,
          reason: adminOverrideReason,
          actor: viewingRole === 'admin' ? '@admin_cbk' : '@system_dispatch'
        })
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
        setAdminOverrideReason('Rider mechanical issue / Route re-optimization');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateDeliveryMilestone = async (status: string, additional = {}) => {
    if (!activeTx) return;
    try {
      const response = await fetch(`/api/transactions/${activeTx.id}/delivery-milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additional })
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const validateHandoverPin = async () => {
    if (!activeTx) return;
    setOtpError(null);
    try {
      const response = await fetch(`/api/transactions/${activeTx.id}/validate-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredHandoverPin })
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
        setEnteredHandoverPin('');
      } else {
        const err = await response.json();
        setOtpError(err.error || 'Invalid verification PIN.');
      }
    } catch (e) {
      console.error(e);
      setOtpError('Network connection issue during Daraja OTP node check.');
    }
  };

  const activeTx = transactions.find((t) => t.id === selectedTxId) || transactions[0];

  useEffect(() => {
    if (transactions.length > 0 && !selectedTxId) {
      setSelectedTxId(transactions[0].id);
    }
  }, [transactions, selectedTxId]);

  // Handle standard API status operations
  const triggerStatusChange = async (action: 'deposit' | 'ship' | 'release' | 'dispute' | 'refund', payload?: any) => {
    if (!activeTx) return;
    try {
      const response = await fetch(`/api/transactions/${activeTx.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Perform manual advancement of fine-grained order status for testing
  const advanceOrderStatus = async (nextStatus: string) => {
    if (!activeTx) return;
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/transactions/${activeTx.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: nextStatus })
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Draw preset receipts onto canvas and return base64 data URL
  const generatePresetDataUrl = (presetType: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 600, 400);

    // Common border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 580, 380);

    if (presetType === 'fargo') {
      ctx.fillStyle = '#1e3a8a'; // Dark blue header
      ctx.fillRect(10, 10, 580, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('FARGO COURIER KENYA LIMITED', 30, 48);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Nairobi Hub, Mombasa Road', 420, 45);

      ctx.fillStyle = '#0f172a';
      ctx.font = '14px sans-serif';
      ctx.fillText(`WAYBILL ID: FG-NB-109-${activeTx?.id || 'TEST'}`, 30, 110);
      ctx.fillText(`Sender Account: ${activeTx?.sellerHandle || '@seller'}`, 30, 135);
      ctx.fillText(`Recipient Contact: ${activeTx?.buyerPhone || '254712345678'}`, 30, 160);
      ctx.fillText(`Declared Weight: 1.8kg`, 30, 185);

      ctx.fillStyle = '#475569';
      ctx.fillText(`Description: Active social checkout transit (${activeTx?.quantity || 1} units)`, 30, 215);

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(30, 240, 540, 1);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Declared Escrow Value: KSH ${activeTx?.totalAmount?.toLocaleString() || activeTx?.amount?.toLocaleString() || '4,500'}`, 30, 275);
      ctx.fillText('STATUS: ASSIGNED FOR COURIER DISPATCH', 30, 305);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Authorized Signature: Fargo Agent Nairobi Junction O.', 30, 350);
      ctx.fillText(new Date().toDateString(), 460, 350);

    } else if (presetType === 'mpesasMS') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 10, 580, 380);

      ctx.fillStyle = '#15803d'; // Green banner
      ctx.fillRect(10, 10, 580, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('M-PESA TRANSACTION CONFIRMATION', 35, 42);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px monospace';
      const fakeCode = 'SD89' + Math.random().toString(36).substring(3, 8).toUpperCase();
      ctx.fillText(`${fakeCode} Confirmed.`, 35, 110);

      ctx.font = '15px monospace';
      ctx.fillText(`Ksh${activeTx?.totalAmount?.toLocaleString() || activeTx?.amount?.toLocaleString()}.00 sent to`, 35, 140);
      ctx.fillText(`${activeTx?.sellerHandle || 'BUY SAFELY TRUSTEE'}`, 35, 165);
      ctx.fillText(`on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.`, 35, 192);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#475569';
      const platFee = activeTx?.platformFee !== undefined ? activeTx.platformFee : Math.max(Math.round((activeTx?.amount || 2500) * 0.01), 25);
      ctx.fillText(`Escrow fee Ksh 0.00 • Safe Buy Protection Fee Ksh${platFee}.00.`, 35, 230);
      ctx.fillText('Safaricom trust account ledger protected.', 35, 255);

      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#15803d';
      ctx.fillText('● CBK Approved NPS Escrow Integration', 35, 305);

    } else if (presetType === 'manipulated') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 10, 580, 380);

      ctx.fillStyle = '#e11d48'; 
      ctx.fillRect(10, 10, 15, 380);

      ctx.fillStyle = '#0f172a';
      ctx.font = "bold 22px 'Courier New'";
      ctx.fillText('RECEIPT OF DISPATCH', 40, 60);

      ctx.font = "14px Arial";
      ctx.fillText('ORDER NUM: ', 40, 110);
      ctx.font = "bold 19px 'Comic Sans MS'"; 
      ctx.fillText(`${activeTx?.id || 'BS-TEST'}`, 150, 110);

      ctx.font = "14px Arial";
      ctx.fillText('PAYMENT TYPE: M-PESA LOCK_HOLD', 40, 150);
      ctx.fillText('Carrier Provider: Courier Bike Express', 40, 190);

      ctx.fillStyle = '#b91c1c';
      ctx.font = "30px 'Georgia'"; 
      ctx.fillText(`Ksh ${activeTx ? (activeTx.amount * 5 ) : '24,000'}`, 40, 260); // Intentionally massive fraud mismatch

      ctx.fillStyle = '#0f172a';
      ctx.font = "11px sans-serif";
      ctx.fillText('Created using Free Online Receipt Maker 2026', 40, 340);
    } else {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(10, 10, 580, 380);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('INVALID/BLANK TEST IMAGE', 180, 180);
    }

    return canvas.toDataURL('image/png');
  };

  // Trigger server-side Gemini analysis of generated preset image waybill
  const handleLetAIEvaluateProof = async () => {
    if (!activeTx) return;
    setIsAnalyzing(true);
    setUploadError(null);

    try {
      const imageBase64 = generatePresetDataUrl(selectedPresetImage);
      const response = await fetch(`/api/transactions/${activeTx.id}/analyze-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          expectedAmount: activeTx.amount
        })
      });

      if (!response.ok) throw new Error('AI parser pipeline rejected screenshot');
      onRefresh();

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'AI verification failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 my-2">
      
      {/* LEFT COLUMN: Escrows selector and status tracking */}
      <div className="xl:col-span-5 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-slate-100/50 p-2.5 rounded-2xl border border-slate-200/50">
          <span className="text-xs font-extrabold text-slate-700 font-mono flex items-center gap-1.5 uppercase tracking-wider pl-1.5">
            🔑 Escrow Transactions Pool ({transactions.length})
          </span>
          <button 
            onClick={onRefresh}
            className="p-1.5 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload List
          </button>
        </div>

        {/* List scrollbox */}
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {transactions.map((tx) => {
            const isSelected = tx.id === selectedTxId;
            const currentOrderState = tx.orderStatus || (
              tx.status === 'PENDING_DEPOSIT' ? 'ORDER_CREATED' :
              tx.status === 'ESCROW_HELD' ? 'ESCROW_FUNDED' :
              tx.status === 'ITEMS_SHIPPED' ? 'SHIPPED' :
              tx.status === 'FUNDS_RELEASED' ? 'RELEASED' : tx.status
            );
            return (
              <div 
                key={tx.id}
                onClick={() => setSelectedTxId(tx.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800 shadow-sm'
                }`}
              >
                {/* Visual marker of shipping method */}
                <div className="absolute right-0 top-0 w-1.5 h-full bg-emerald-500 opacity-80"></div>

                <div className="flex justify-between items-start mb-2 pr-2">
                  <div>
                    <span className={`text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-slate-800 text-sky-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tx.id}
                    </span>
                    <h3 className="font-bold text-xs mt-1.5 line-clamp-1">{tx.description}</h3>
                  </div>
                  <span className={`text-[10px] font-mono font-black tracking-tight px-2 py-0.5 rounded-lg ${
                    tx.status === 'FUNDS_RELEASED' ? 'bg-emerald-500/20 text-emerald-400' :
                    tx.status === 'DISPUTED' ? 'bg-rose-500/20 text-rose-400' :
                    tx.status === 'ESCROW_HELD' ? 'bg-sky-500/20 text-sky-400' :
                    tx.status === 'ITEMS_SHIPPED' ? 'bg-indigo-505/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {currentOrderState.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-slate-100/10 pt-3 mt-1.5 text-xs pr-1">
                  <div className="flex flex-col text-left">
                    <span className={`${isSelected ? 'text-slate-200 font-extrabold' : 'text-slate-900 font-extrabold'} font-mono text-xs`}>
                      Ksh {(tx.totalAmount || tx.amount).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400">Qty: {tx.quantity || 1} • {tx.shippingMethod || 'Courier'}</span>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {tx.socialPlatform} • {tx.sellerHandle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Specific active transaction playground */}
      {activeTx && (
        <div className="xl:col-span-7 bg-white/75 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
              {/* Upper title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-4 gap-2">
              <div>
                <span className="text-xs bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  Escrow Contract ID: {activeTx.id}
                </span>
                <h2 className="text-base font-black text-slate-900 mt-1">{activeTx.description}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 animate-pulse flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600"></span> Active Cycle:
                </span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                  {activeTx.countdownHours > 0 ? `${activeTx.countdownHours} Hours Remaining` : 'Released / Resolved'}
                </span>
              </div>
            </div>

            {/* THREE-SIDED MARKETPLACE ROLE VISIBILITY DECK */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4.5 mb-5 shadow-md border border-slate-800 space-y-3.5 leading-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.12em] block">🛡️ Role-Based Compliance Simulator</span>
                  <h3 className="text-[13px] font-extrabold text-slate-100 tracking-tight block animate-fade-in">
                    Financial Ledger Visibility & Privacy Controls
                  </h3>
                </div>
                <div className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded uppercase font-black shrink-0 tracking-wider">
                  🔐 CBK Audit Sandbox Live
                </div>
              </div>
              
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                To reduce friction and protect business models, Buy Safely enforces <strong className="text-white">"Separation of Perception vs. Settlement Truth"</strong>. Buyers & Sellers see clean, simplified bills while platform smart-ledgers split funds securely. Select a role below to simulate their customized dashboard visibility:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 pt-1">
                {[
                  { id: 'buyer', label: '🛍️ Buyer view', desc: 'No internal splits, flat shipping fee' },
                  { id: 'seller', label: '🏪 Merchant view', desc: 'Product income only, zero logistics split visibility' },
                  { id: 'courier', label: '🏍️ Rider view', desc: 'Earnings payout of 85% only' },
                  { id: 'admin', label: '👑 Admin Ledger', desc: 'Full 3-way internal splits' }
                ].map((role) => {
                  const isActive = viewingRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setViewingRole(role.id as any)}
                      className={`p-2 rounded-xl text-left border flex flex-col justify-between transition-all select-none group relative ${
                        isActive 
                          ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-950/20' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold tracking-tight block">{role.label}</span>
                      <span className={`text-[7.5px] mt-1 block leading-tight ${isActive ? 'text-indigo-200 font-semibold' : 'text-slate-500 font-medium'}`}>{role.desc}</span>
                      {isActive && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ORDER STATUS STEP TRACKER timeline */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-5 space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Social-Commerce Delivery Status Stepper</span>
              
              {/* Stepper display */}
              <div className="flex justify-between items-center text-[8px] font-mono leading-none select-none overflow-x-auto gap-2 pb-1.5 pt-1 scrollbar-thin">
                {FINE_GRAINED_TRACKING_STATUSES.map((st, idx) => {
                  const currentOrderState = activeTx.orderStatus || (
                    activeTx.status === 'PENDING_DEPOSIT' ? 'ORDER_CREATED' :
                    activeTx.status === 'ESCROW_HELD' ? 'ESCROW_FUNDED' :
                    activeTx.status === 'ITEMS_SHIPPED' ? 'SHIPPED' :
                    activeTx.status === 'FUNDS_RELEASED' ? 'RELEASED' : activeTx.status
                  );
                  const activeIdx = FINE_GRAINED_TRACKING_STATUSES.indexOf(currentOrderState);
                  const isPassed = idx < activeIdx;
                  const isCurrent = idx === activeIdx;
                  
                  return (
                    <div key={st} className="flex flex-col items-center gap-1 shrink-0 min-w-[50px]">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] border ${
                        isCurrent ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200' :
                        isPassed ? 'bg-emerald-500 text-white border-emerald-500' :
                        'bg-white text-slate-400 border-slate-200'
                      }`}>
                        {isPassed ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span className={`text-[8px] block mt-0.5 text-center truncate w-14 font-semibold ${isCurrent ? 'text-indigo-600 font-extrabold' : isPassed ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {st.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* SIMULATED STATUS CONTROL BAR (Allow advancing in sandbox) */}
              <div className="border-t border-slate-200/50 pt-2.5 flex items-center justify-between gap-2.5">
                <span className="text-[10px] font-extrabold text-slate-600 uppercase flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-indigo-600" /> Advance Order Status:
                </span>
                
                <div className="flex flex-wrap gap-1">
                  {['PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'AWAITING_CONFIRMATION'].map((statusOption) => {
                    const currentOrderState = activeTx.orderStatus || 'ORDER_CREATED';
                    const activeOption = currentOrderState === statusOption;
                    
                    return (
                      <button
                        key={statusOption}
                        onClick={() => advanceOrderStatus(statusOption)}
                        disabled={isUpdatingStatus || activeOption}
                        className={`px-2 py-1 text-[9px] rounded-lg font-bold border transition ${
                          activeOption 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {statusOption.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* EXPANDED SENSITIVE SOCIAL CHECKOUT FIELDS DETAILED RENDER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Product order specs & phone wallet */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-500" /> Ordered Package details
                </h4>
                
                <div className="space-y-1.5 leading-none text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Item Unit Price:</span>
                    <strong className="text-slate-800">Ksh {Math.round((activeTx.amount || 2500) / (activeTx.quantity || 1)).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity Ordered:</span>
                    <strong className="text-slate-900 font-mono">x {activeTx.quantity || 1}</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 border-dashed">
                    <span className="text-slate-500">Fulfillment Period:</span>
                    <strong className="text-slate-800">{activeTx.countdownHours > 0 ? `${activeTx.countdownHours} Hrs` : 'Resolved'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">M-Pesa Payout:</span>
                    <strong className="text-indigo-950 font-mono">{activeTx.sellerPhone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buyer Wallet Destination:</span>
                    <strong className="text-slate-700 font-mono">{activeTx.buyerPhone} ({activeTx.paymentNetwork || 'M-Pesa'})</strong>
                  </div>
                </div>
              </div>

              {/* Handover delivery selections & county towns details */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Handover Delivery Selections
                  </h4>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider">
                    {activeTx.shippingMethod || 'Courier Delivery'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-700 leading-tight">
                  {/* Courier detail fields render */}
                  {(!activeTx.shippingMethod || activeTx.shippingMethod === 'Courier') && (
                    <>
                      <p><strong>County:</strong> {activeTx.shippingDetails?.county || 'Nairobi'}</p>
                      <p><strong>Town / Area:</strong> {activeTx.shippingDetails?.town || 'Kilimani'}</p>
                      <p><strong>Address:</strong> {activeTx.shippingDetails?.address || 'Yaya Centre Blocks, Apt 4'}</p>
                      <p><strong>Contact Name:</strong> {activeTx.shippingDetails?.contactPerson || 'James Kamau'}</p>
                    </>
                  )}

                  {/* Pickup detail fields render */}
                  {activeTx.shippingMethod === 'Pickup' && (
                    <>
                      <p><strong>Pickup Station:</strong> {activeTx.shippingDetails?.pickupLocation || 'CBD Kimathi Coop Tower Ground Shop'}</p>
                      <p><strong>Collect Date:</strong> {new Date(activeTx.shippingDetails?.pickupDate || Date.now()).toLocaleDateString()}</p>
                      <p><strong>Agent Contact:</strong> {activeTx.shippingDetails?.pickupContact || 'Main Desk Agent'}</p>
                    </>
                  )}

                  {/* Seller delivery fields */}
                  {activeTx.shippingMethod === 'Seller Delivery' && (
                    <>
                      <p><strong>Zone:</strong> {activeTx.shippingDetails?.deliveryArea || 'Westlands & Parklands General Area'}</p>
                      <p><strong>Boda Dispatch:</strong> {activeTx.shippingDetails?.deliveryContact || '0722334455'}</p>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* COST RECONCILIATION DISPLAY DYNAMIC TO SELECTED SIMULATION ROLE */}
            <div className={`p-4 rounded-2xl border leading-none text-xs font-mono space-y-2 mt-4 transition-all duration-200 ${
              viewingRole === 'admin' ? 'bg-slate-900 border-slate-950 text-slate-350' :
              viewingRole === 'buyer' ? 'bg-indigo-950 text-indigo-100 border-indigo-950' :
              viewingRole === 'seller' ? 'bg-emerald-950 text-emerald-100 border-emerald-950' :
              'bg-amber-950 text-amber-100 border-amber-950'
            }`}>
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-1.5 border-dashed border-white/10 select-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-opacity-80">
                  {viewingRole === 'admin' ? '🔒 SECURE AUDIT LEDGER (ADMIN ONLY VIEW)' :
                   viewingRole === 'buyer' ? '🛍️ CUSTOMER BILL STATEMENT (BUYER VIEW)' :
                   viewingRole === 'seller' ? '🏪 BUSINESS INVOICE RECORD (MERCHANT VIEW)' :
                   '🏍️ COURIER TASK PAYOUT LEDGER (RIDER VIEW)'}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase text-white bg-white/10">
                  {viewingRole}
                </span>
              </div>

              {/* BUYER VIEW */}
              {viewingRole === 'buyer' && (() => {
                const protectionFee = activeTx.platformFee !== undefined ? activeTx.platformFee : Math.max(Math.round((activeTx.amount || 2500) * 0.01), 25);
                const hasInsurance = activeTx.insurancePremium && activeTx.insurancePremium > 0;
                const insuranceCostForBuyer = !hasInsurance ? 0 : (activeTx.insurancePaidBy === 'SELLER' ? 0 : (activeTx.insurancePaidBy === 'SHARED' ? Math.round(activeTx.insurancePremium! * 0.5) : activeTx.insurancePremium!));
                const totalPaidAmount = (activeTx.amount || 2500) + (activeTx.shippingFee || 0) + protectionFee + insuranceCostForBuyer;
                return (
                  <div className="space-y-1.5 text-[11px] pt-1">
                    <div className="flex justify-between">
                      <span className="opacity-70">Item Subtotal ({activeTx.quantity || 1} units):</span>
                      <span className="font-bold text-white">Ksh {(activeTx.amount || 2500).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Courier Delivery Fee:</span>
                      <span className="font-bold text-white">Ksh {(activeTx.shippingFee || 0).toLocaleString()}</span>
                    </div>
                    {hasInsurance && (
                      <div className="flex justify-between">
                        <span className="opacity-70">Cargo Transit Insurance ({activeTx.insuranceOption} Cover):</span>
                        <span className="font-bold text-emerald-400">
                          {activeTx.insurancePaidBy === 'SELLER' ? 'Ksh 0 (Seller Covered)' : (activeTx.insurancePaidBy === 'SHARED' ? `Ksh ${insuranceCostForBuyer.toLocaleString()} (Shared 50%)` : `Ksh ${insuranceCostForBuyer.toLocaleString()}`)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="opacity-70">Escrow Buyer Protection:</span>
                      <span className="font-bold text-emerald-400">Ksh 0 (FREE)</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-1.5">
                      <span className="opacity-70">Safe Buy Protection Fee:</span>
                      <span className="font-bold text-lime-400">Ksh {protectionFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-sm bg-indigo-950/40 p-2 rounded-xl border border-indigo-900/45">
                      <span className="font-bold tracking-tight text-white/90">TOTAL AMOUNT paid via STK Push:</span>
                      <span className="text-white font-black text-sm">Ksh {totalPaidAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              {/* SELLER VIEW */}
              {viewingRole === 'seller' && (() => {
                const { pct, feeAmount } = getMerchantSuccessFeeDetails(activeTx.amount || 2500);
                const hasInsurance = activeTx.insurancePremium && activeTx.insurancePremium > 0;
                const merchantInsuranceDeduction = (hasInsurance && (activeTx.insurancePaidBy === 'SELLER' || activeTx.insurancePaidBy === 'SHARED'))
                  ? (activeTx.insurancePaidBy === 'SHARED' ? Math.round(activeTx.insurancePremium! * 0.5) : activeTx.insurancePremium!)
                  : 0;
                const netMerchantPayout = (activeTx.amount || 2500) - feeAmount - merchantInsuranceDeduction;
                return (
                  <div className="space-y-1.5 text-[11px] pt-1 leading-normal">
                    <div className="flex justify-between">
                      <span className="opacity-70">Product Gross Revenue:</span>
                      <span className="font-bold text-white">Ksh {(activeTx.amount || 2500).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-350">
                      <span className="opacity-75">Merchant Success Commission ({pct}%):</span>
                      <span className="font-bold">- Ksh {feeAmount.toLocaleString()}</span>
                    </div>
                    {merchantInsuranceDeduction > 0 && (
                      <div className="flex justify-between text-rose-350">
                        <span className="opacity-75">Jubilee Cargo Insurance ({activeTx.insurancePaidBy === 'SHARED' ? '50% Shared' : '100% Covered'}):</span>
                        <span className="font-bold font-mono">- Ksh {merchantInsuranceDeduction.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex flex-col bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-800/20 text-[10px] mt-1 space-y-1 text-white/90">
                      <span className="font-bold text-emerald-300 block">📦 Logistics & Handover Status</span>
                      <p className="text-[9.5px] text-emerald-250 leading-normal">
                        Platform assigned delivery is handled direct by the platform's independent dispatch. There are <strong className="text-white font-extrabold">Ksh 0 deductions</strong> or pay-outs towards logistics on your merchant account ledger. No visibility into external courier fee splits.
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-1 text-white/60">
                      <span>CBK Escrow ID status:</span>
                      <span className="font-semibold text-emerald-400">Escrow Secure Safeguard Enabled</span>
                    </div>
                    <div className="border-t border-white/10 pt-1.5 flex justify-between items-center text-xs">
                      <span className="font-bold text-white/90">NET ESCROW MERCHANT SETTLEMENT PAYOUT:</span>
                      <span className="text-lime-400 font-extrabold text-sm font-mono">Ksh {netMerchantPayout.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              {/* COURIER RIDER VIEW */}
              {viewingRole === 'courier' && (
                <div className="space-y-2 text-[11px] pt-1 leading-normal">
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Assigned Transit Job:</span>
                    <span className="text-white font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">{activeTx.shippingDetails?.county || 'Nairobi'} Delivery</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="opacity-70">Gross Job Pricing allocation:</span>
                    <span className="font-mono text-white/85">Ksh {(activeTx.shippingFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-yellow-500/80 text-[10.5px]">
                    <span className="opacity-75">Safe Buy Referral Fee (10%):</span>
                    <span className="font-mono">- Ksh {Math.ceil((activeTx.shippingFee || 0) * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-sm text-amber-200">
                    <span className="font-bold text-amber-100">YOUR DISPATCH PAYOUT (90% Net):</span>
                    <span className="text-amber-450 font-black text-sm font-mono">Ksh {Math.floor((activeTx.shippingFee || 0) * 0.9).toLocaleString()}</span>
                  </div>
                  <div className="bg-amber-900/20 p-2 rounded-lg border border-amber-800/20 text-[9.5px] text-amber-300/80 leading-normal">
                    <span className="font-bold text-amber-200 block">🔒 OTP Delivery Pin Required</span>
                    To release your Ksh {Math.floor((activeTx.shippingFee || 0) * 0.9).toLocaleString()} dispatch payout, the buyer must confirm receipt via OTP PIN or delivery confirmation signature in the mobile app.
                  </div>
                </div>
              )}

              {/* ADMIN INTERNAL LEDGER VIEW */}
              {viewingRole === 'admin' && (() => {
                const { pct, feeAmount } = getMerchantSuccessFeeDetails(activeTx.amount || 2500);
                const grossCourier = activeTx.shippingFee || 0;
                const courierReferral = Math.ceil(grossCourier * 0.1);
                const courierPayout = Math.floor(grossCourier * 0.9);
                const txPlatformFee = activeTx.platformFee !== undefined ? activeTx.platformFee : Math.max(Math.round((activeTx.amount || 2500) * 0.01), 25);
                const hasInsurance = activeTx.insurancePremium && activeTx.insurancePremium > 0;
                const insurancePremiumVal = hasInsurance ? activeTx.insurancePremium! : 0;
                const netUnderwriterRetention = Math.round(insurancePremiumVal * 0.85);
                const distributorCommission = insurancePremiumVal - netUnderwriterRetention;
                
                const totalLedgerBalance = (activeTx.amount || 2500) + grossCourier + txPlatformFee + insurancePremiumVal;
                return (
                  <div className="space-y-1.5 text-[11px] pt-0.5 font-sans">
                    <div className="flex justify-between">
                      <span>Store Item Gross Subtotal:</span>
                      <span className="text-white font-semibold flex items-center gap-1.5">
                        <span>Ksh {(activeTx.amount || 2500).toLocaleString()}</span>
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded uppercase font-bold">Qty: {activeTx.quantity || 1}</span>
                      </span>
                    </div>
                    
                    {/* Logistics Splits Table */}
                    <div className="flex justify-between border-t border-slate-800/85 pt-1">
                      <span className="text-slate-400 font-bold">Gross courier fee collected:</span>
                      <span className="text-white font-bold">Ksh {grossCourier}</span>
                    </div>
                    
                    {/* Detailed split ledger */}
                    <div className="pl-3.5 space-y-1.5 border-l border-indigo-900 pb-1.5 pt-0.5 text-[9.5px] text-slate-400 tracking-wide font-sans">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="flex items-center gap-1">
                          <span>↳ Carrier Direct Share (90%):</span>
                          <span className="text-[6px] bg-amber-950 text-amber-400 px-1 rounded uppercase font-sans">Rider Payout</span>
                        </span>
                        <span className="font-mono text-slate-300">Ksh {courierPayout.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-indigo-355 font-bold font-sans">
                        <span className="flex items-center gap-1">
                          <span>↳ Courier Referral Commission (10%):</span>
                          <span className="text-[6px] bg-indigo-950 text-indigo-350 px-1 rounded uppercase font-black font-sans">Ref Commission</span>
                        </span>
                        <span className="font-mono text-indigo-200">Ksh {courierReferral.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Integrated Insurance split ledger */}
                    {hasInsurance && (
                      <>
                        <div className="flex justify-between border-t border-slate-800/85 pt-1">
                          <span className="text-slate-400 font-bold">Transit Insurance Gross Premium:</span>
                          <span className="text-white font-bold">Ksh {insurancePremiumVal.toLocaleString()}</span>
                        </div>
                        <div className="pl-3.5 space-y-1.5 border-l border-emerald-950 pb-1.5 pt-0.5 text-[9.5px] text-slate-400 tracking-wide font-sans">
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="flex items-center gap-1">
                              <span>↳ Jubilee Underwriter Premium Transfer (85%):</span>
                              <span className="text-[6px] bg-sky-950 text-sky-400 px-1 rounded uppercase font-sans">Risk Premium</span>
                            </span>
                            <span className="font-mono text-slate-300">Ksh {netUnderwriterRetention.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-450 font-bold font-sans">
                            <span className="flex items-center gap-1">
                              <span>↳ Buy Safely Distributor Commission (15%):</span>
                              <span className="text-[6.5px] bg-emerald-950 text-emerald-400 px-1 rounded uppercase font-black font-sans">Distributor Comm.</span>
                            </span>
                            <span className="font-mono text-emerald-300">Ksh {distributorCommission.toLocaleString()}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between border-t border-slate-800/80 pt-1">
                      <span>Escrow Trust Protection Service Fee (Buyer pays 0):</span>
                      <span className="text-emerald-400 font-bold">Ksh 0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-indigo-300 font-sans">
                        <span>Safe Buy Protection Fee (Paid by Buyer):</span>
                        <span className="text-[8px] bg-indigo-950 px-1 py-0.5 rounded text-indigo-400 text-indigo-400 font-sans uppercase font-bold">SMS, OTP & Ops</span>
                      </span>
                      <span className="text-white">Ksh {txPlatformFee}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800 pb-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-indigo-300 font-sans">
                        <span>Merchant Success fee (Deducted from Seller, {pct}%):</span>
                        <span className="text-[8px] bg-emerald-950 px-1 py-0.5 rounded text-emerald-400 uppercase font-sans">On Success Sale</span>
                      </span>
                      <span className="text-emerald-400 font-bold">Ksh {feeAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-1.5 text-xs bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 leading-normal">
                      <span className="font-black text-slate-350 tracking-tight text-[9px]">TOTAL ESCROWED FUNDS SECURELY DEPOSITED (CBK TRUSTEE LEDGER):</span>
                      <span className="text-indigo-400 font-black text-sm">Ksh {totalLedgerBalance.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* LIVE ACTIONS & SIMULATION CTAs */}
            <div className="mt-6 border-t border-dashed border-slate-100 pt-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Escrow Status Action Panel</h3>

              {/* PENDING_DEPOSIT STATE */}
              {activeTx.status === 'PENDING_DEPOSIT' && (
                <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <Smartphone className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">STK Webhook pending verification</h4>
                      <p className="text-[11px] text-amber-700/80 leading-snug">The Safaricom node holds an active query for Ksh {(activeTx.totalAmount || activeTx.amount).toLocaleString()}. Click to mock receipt webhook.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerStatusChange('deposit')}
                    className="w-full bg-slate-900 text-white font-extrabold py-3 rounded-xl text-[10px] uppercase tracking-wider hover:bg-slate-800 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    ✓ Simulate M-Pesa STK Callback (Secure Escrow)
                  </button>
                </div>
              )}

              {/* ESCROW_HELD STATE */}
              {activeTx.status === 'ESCROW_HELD' && (
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">🛡️ IMMUTABLE LOGISTICS REFERENCE</span>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">Assigned Courier</h4>
                    </div>
                    <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-indigo-700 font-extrabold text-[10px] uppercase">
                      <Truck className="w-3.5 h-3.5" />
                      {activeTx.shippingMethod || 'Courier Express Dispatch'}
                    </div>
                  </div>

                  {/* Read-only Logistics Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Courier Name</span>
                      <p className="font-extrabold text-slate-800">
                        {activeTx.deliveryPartnerName ? activeTx.deliveryPartnerName : (
                          activeTx.deliveryStatus === 'PICKUP_REQUESTED' ? (
                            <span className="text-amber-600 italic">Pending Assignment</span>
                          ) : 'Rider John (Boda Dispatch)'
                        )}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Courier ID</span>
                      <p className="font-mono font-bold text-slate-600">
                        {activeTx.deliveryPartnerId ? activeTx.deliveryPartnerId : (
                          activeTx.deliveryStatus === 'PICKUP_REQUESTED' ? 'Pending Acceptance' : 'DP-001'
                        )}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Delivery Fee</span>
                      <p className="font-black text-slate-800">Ksh {(activeTx.shippingFee || 220).toLocaleString()}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Courier Contact</span>
                      <p className="font-mono font-bold text-slate-700 font-sans text-xs">
                        {activeTx.deliveryPartnerName ? "+254 711 *** 392" : "N/A"}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Est. Delivery Time</span>
                      <p className="font-bold text-slate-700">2 Hours (On-Demand Dispatch)</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Security Handover Pin</span>
                      <p className="font-mono text-xs font-extrabold text-indigo-600 tracking-wider">
                        {viewingRole === 'buyer' || viewingRole === 'admin' ? (
                          <span>🔑 {activeTx.deliveryPin || '392014'}</span>
                        ) : (
                          <span className="text-slate-350 select-none">🔒 Masked (OTP Check)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* COURIER ASSIGNMENT STATUS */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Logistics Status Indicators</span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mt-0.5">
                        {activeTx.deliveryStatus === 'PICKUP_REQUESTED' ? (
                          <>
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                            <span className="text-amber-700 font-extrabold">Courier Assignment Pending Acceptance</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-emerald-700 font-extrabold uppercase text-xs">
                              {activeTx.deliveryStatus ? activeTx.deliveryStatus.replace(/_/g, ' ') : 'COURIER_ASSIGNED'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Progress Percentage */}
                    <div className="text-right text-xs font-mono">
                      <span className="text-slate-400 block text-[9px]">PROGRESS</span>
                      <span className="font-extrabold text-slate-700 text-xs">
                        {activeTx.deliveryStatus === 'PICKUP_REQUESTED' ? '10%' :
                         activeTx.deliveryStatus === 'COURIER_ASSIGNED' ? '30%' :
                         activeTx.deliveryStatus === 'PICKED_UP' ? '50%' :
                         activeTx.deliveryStatus === 'IN_TRANSIT' ? '70%' :
                         activeTx.deliveryStatus === 'ARRIVED' ? '90%' : '100%'}
                      </span>
                    </div>
                  </div>

                  {/* PROGRESS ROAD TIMELINE STEPPER */}
                  <div className="relative pt-2 pb-1">
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded"></div>
                    {/* Active colored bar */}
                    <div 
                      className="absolute top-1/2 left-4 h-1 bg-indigo-500 -translate-y-1/2 z-0 rounded transition-all duration-300"
                      style={{
                        width: activeTx.deliveryStatus === 'PICKUP_REQUESTED' ? '5%' :
                               activeTx.deliveryStatus === 'COURIER_ASSIGNED' ? '25%' :
                               activeTx.deliveryStatus === 'PICKED_UP' ? '50%' :
                               activeTx.deliveryStatus === 'IN_TRANSIT' ? '75%' : '100%'
                      }}
                    ></div>
                    <div className="relative z-10 flex justify-between px-2 text-[9px] font-bold select-none text-slate-400">
                      {[
                        { key: 'PICKUP_REQUESTED', label: 'Offer Pub' },
                        { key: 'COURIER_ASSIGNED', label: 'Assigned' },
                        { key: 'PICKED_UP', label: 'Collected' },
                        { key: 'IN_TRANSIT', label: 'In Transit' },
                        { key: 'DELIVERED', label: 'Delivered' }
                      ].map((step, idx) => {
                        const statusesArr = ['PICKUP_REQUESTED', 'COURIER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED'];
                        const currentIdx = statusesArr.indexOf(activeTx.deliveryStatus || 'COURIER_ASSIGNED');
                        const stepIdx = statusesArr.indexOf(step.key);
                        const isDone = currentIdx >= stepIdx;
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-bold text-[9px] ${
                              isDone ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </span>
                            <span className={`mt-1 font-bold text-[8px] tracking-tight ${isDone ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SIMULATED GPS LIVE TRACKING COMPONENT */}
                  {showLiveGPS && (
                    <div className="p-3 bg-indigo-950 text-indigo-200 rounded-xl border border-indigo-900 font-mono text-[10px] space-y-2 leading-snug">
                      <div className="flex justify-between items-center text-white border-b border-indigo-900 pb-1.5">
                        <span className="font-extrabold flex items-center gap-1">📍 CBK REAL-TIME GPS GROUND VERIFICATION</span>
                        <button onClick={() => setShowLiveGPS(false)} className="text-[9px] hover:text-white bg-indigo-900 px-1.5 py-0.5 rounded">Hide</button>
                      </div>
                      <div className="space-y-1 leading-normal">
                        <div className="flex justify-between">
                          <span>Route Node Origin:</span>
                          <span className="text-white">Nairobi Central Business Premises</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Route Node Destination:</span>
                          <span className="text-white">{activeTx.shippingDetails?.county || 'Nairobi'}, {(activeTx.shippingDetails?.town || 'Kilimani')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satellite Integrity lock:</span>
                          <span className="text-emerald-400">98.2% Accurate (Diff GPS)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rider Coordinates:</span>
                          <span className="text-indigo-300 font-bold">-1.2891° S, 36.8219° E</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Arrival Distance:</span>
                          <span className="text-yellow-400">1.8 km out</span>
                        </div>
                      </div>
                      <div className="h-2 bg-indigo-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 animate-pulse" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  )}

                  {/* OPERATIONAL SIMULATION ROLES SWITCHBOARD ACTIONS */}
                  <div className="border-t border-dashed border-slate-200 pt-4 mt-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-indigo-900 tracking-wider uppercase block">⚙️ Operational Role-Specific Controls ({viewingRole.toUpperCase()})</span>
                      <span className="text-[9px] text-slate-400 italic">Select persona above to toggle simulated control access</span>
                    </div>

                    {/* 1. SELLER CONTROLS */}
                    {(viewingRole === 'seller' || viewingRole === 'admin') && (
                      <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 flex flex-col gap-2">
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">🏬 MERCHANT ACTION CONTROLS</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => updateDeliveryMilestone('COURIER_ASSIGNED')}
                            disabled={activeTx.deliveryStatus !== 'PICKUP_REQUESTED'}
                            className="text-[10px] font-bold py-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 disabled:opacity-40 transition"
                          >
                            Mark Package Ready / Booked
                          </button>
                          <button
                            onClick={() => triggerStatusChange('ship', { carrierName: activeTx.deliveryPartnerName || 'Express Rider Kenya' })}
                            className="text-[10px] font-black py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            ✓ Hand Over & Run AI Audit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. COURIER CONTROLS */}
                    {(viewingRole === 'courier' || viewingRole === 'admin') && (
                      <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100 space-y-2.5">
                        <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">🏍️ COURIER DISPATCH OPERATIONS</span>
                        
                        {/* Courier decline or pending assignment scenario */}
                        {activeTx.deliveryStatus === 'PICKUP_REQUESTED' ? (
                          <div className="space-y-2">
                            <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200/80 leading-normal">
                              No active Courier has confirmed acceptance for this job yet. Standard checkout assignment is pending.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  // Accept job under Rider John
                                  updateDeliveryMilestone('COURIER_ASSIGNED', {
                                    deliveryPartnerId: 'DP-001',
                                    deliveryPartnerName: 'Rider John (Boda Dispatch)'
                                  });
                                }}
                                className="flex-1 text-[10px] font-extrabold py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                              >
                                ✓ Accept Job (Simulate John)
                              </button>
                              <button
                                onClick={declineCourier}
                                className="text-[10px] font-bold py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition"
                              >
                                Decline Job
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 text-xs">
                              <button
                                onClick={() => updateDeliveryMilestone('PICKED_UP')}
                                disabled={activeTx.deliveryStatus !== 'COURIER_ASSIGNED'}
                                className="flex-1 text-[10px] font-bold py-2 bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 disabled:opacity-40 transition"
                              >
                                Confirm Package Collected
                              </button>
                              <button
                                onClick={() => updateDeliveryMilestone('IN_TRANSIT')}
                                disabled={activeTx.deliveryStatus !== 'PICKED_UP'}
                                className="flex-1 text-[10px] font-bold py-2 bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 disabled:opacity-40 transition"
                              >
                                Register In Transit
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <button
                                onClick={() => updateDeliveryMilestone('ARRIVED')}
                                disabled={activeTx.deliveryStatus !== 'IN_TRANSIT'}
                                className="flex-1 text-[10px] font-bold py-2 bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 disabled:opacity-40 transition"
                              >
                                Arrived at Destination
                              </button>
                              <button
                                onClick={() => updateDeliveryMilestone('DELIVERED')}
                                disabled={activeTx.deliveryStatus !== 'ARRIVED'}
                                className="flex-1 text-[10px] font-black py-2 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 transition shadow-sm"
                              >
                                Confirm Delivered (Pin Checked)
                              </button>
                            </div>

                            <button
                              onClick={declineCourier}
                              className="w-full text-[10px] font-bold py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition"
                            >
                              ⚠️ Simulation: Reject Job after Acceptance (Marketplace Re-offer)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. BUYER CONTROLS */}
                    {(viewingRole === 'buyer' || viewingRole === 'admin') && (
                      <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-150 space-y-2.5">
                        <span className="text-[9px] font-black text-indigo-800 uppercase tracking-widest block">🛍️ BUYER VERIFICATION OPERATIONS</span>
                        
                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => setShowLiveGPS(!showLiveGPS)}
                            className="flex-1 text-[10px] font-bold py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-800 transition flex items-center justify-center gap-1"
                          >
                            📍 {showLiveGPS ? "Close GPS" : "Track Delivery Live"}
                          </button>
                          
                          <button
                            onClick={() => triggerStatusChange('release')}
                            disabled={activeTx.deliveryStatus !== 'DELIVERED'}
                            className="flex-1 text-[10px] font-black py-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            ✓ Confirm Receipt & Release Escrow
                          </button>
                        </div>

                        {/* Direct Secure PIN handoff option */}
                        <div className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl space-y-2 transition duration-150 leading-normal">
                          <span className="text-[9px] font-black text-indigo-750 block uppercase tracking-wider leading-none">🔐 Secure Transit Handover Verification API</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            The Courier must enter the Buyer's unique OTP Handover PIN (<strong className="text-indigo-600 font-extrabold">{activeTx.deliveryPin || '392014'}</strong>) to safely complete handover and trigger split payment settlements instantly.
                          </p>
                          <div className="flex gap-2 pt-1 text-xs">
                            <input 
                              type="text" 
                              maxLength={6}
                              value={enteredHandoverPin}
                              onChange={(e) => setEnteredHandoverPin(e.target.value)}
                              placeholder="Enter 6-digit OTP PIN"
                              className="w-2/3 text-xs bg-slate-50 border rounded-lg px-2.5 py-1.5 font-mono font-extrabold text-slate-800 tracking-widest outline-none focus:bg-white"
                            />
                            <button
                              onClick={validateHandoverPin}
                              className="w-1/3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-lg transition"
                            >
                              Verify M-Pesa
                            </button>
                          </div>
                          {otpError && (
                            <p className="text-[9.5px] font-bold text-rose-600 animate-pulse">{otpError}</p>
                          )}
                        </div>

                        <div className="flex gap-2 border-t border-indigo-100 pt-3 text-xs">
                          <input 
                            type="text" 
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            placeholder="State reason for CBK dispute check..."
                            className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-medium"
                          />
                          <button
                            onClick={() => triggerStatusChange('dispute', { reason: disputeReason })}
                            className="bg-rose-600 text-white font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-rose-700 transition"
                          >
                            Lodge Dispute
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4. ADMIN ONLY OVERRIDE CONTROLS */}
                    {(viewingRole === 'admin') && (
                      <div className="bg-slate-900 text-slate-350 p-4 rounded-xl border border-slate-950 space-y-3 leading-normal">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block font-mono">🔑 ADMIN TRUSTEE ESCROW OVERRIDE LOG</span>
                          <span className="text-[8px] bg-red-500/10 text-red-400 px-1 py-0.2 rounded font-black font-mono">HIGH AUDIT TRAIL ACCESSIBILITY</span>
                        </div>
                        
                        <p className="text-[10px] text-slate-400 leading-normal font-sans">
                          Central Bank Sandbox Rules grant administrative authorization to bypass checkout logistics configuration. Changing courier is securely recorded with preceding metadata in a immutable audit trail.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reroute to Alternative Courier:</label>
                            <select 
                              value={adminOverrideCourierId} 
                              onChange={(e) => setAdminOverrideCourierId(e.target.value)} 
                              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-sans"
                            >
                              <option value="DP-051">No alternative matching</option>
                              <option value="DP-001">Rider John (Boda Dispatch) - ID: DP-001</option>
                              <option value="DP-002">Driver Mary (City Probox) - ID: DP-002</option>
                              <option value="DP-003">Picker Alex (Safety Inspector) - ID: DP-003</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Override Audit Reason Statement:</label>
                            <input 
                              type="text"
                              value={adminOverrideReason}
                              onChange={(e) => setAdminOverrideReason(e.target.value)}
                              placeholder="Reason code e.g. Boda mechanical failure"
                              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-sans"
                            />
                          </div>
                        </div>

                        <button
                          onClick={overrideCourier}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-2.5 rounded-lg text-[10px] transition font-mono tracking-wider shadow-md"
                        >
                          ⚖️ AUTHORIZE OVERRIDE (COMMIT TO BLOCKCHAIN AUDIT LOG)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ITEMS_SHIPPED STATE (THE AI ENGINE SHOWCASE) */}
              {activeTx.status === 'ITEMS_SHIPPED' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-900 mb-1">Optical Receipts AI Sandbox Verification</h4>
                    <p className="text-[11px] text-indigo-600 leading-normal">The package is marked shipped. Test our multimodal Gemini AI waybill audit scanner using preset screenshot scenarios to clear fraud risks.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left: Template Selection */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Waybill Receipt Proof</label>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input 
                            type="radio" 
                            name="preset" 
                            checked={selectedPresetImage === 'fargo'} 
                            onChange={() => setSelectedPresetImage('fargo')} 
                          />
                          <div>
                            <p className="font-bold text-slate-700">Fargo Courier Receipt</p>
                            <p className="text-[10px] text-slate-500">Matches amount Ksh {activeTx.amount}</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input 
                            type="radio" 
                            name="preset" 
                            checked={selectedPresetImage === 'mpesasMS'} 
                            onChange={() => setSelectedPresetImage('mpesasMS')} 
                          />
                          <div>
                            <p className="font-bold text-slate-700">M-Pesa SMS Confirmation Slip</p>
                            <p className="text-[10px] text-slate-500">Standard secure hold ledger match</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input 
                            type="radio" 
                            name="preset" 
                            checked={selectedPresetImage === 'manipulated'} 
                            onChange={() => setSelectedPresetImage('manipulated')} 
                          />
                          <div>
                            <p className="font-bold text-rose-700">Counterfeit waybill layout (Altered)</p>
                            <p className="text-[10px] text-rose-500 font-medium">Flagged by Gemini character check</p>
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={handleLetAIEvaluateProof}
                        disabled={isAnalyzing}
                        className="w-full bg-slate-900 border border-slate-900 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Cpu className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        {isAnalyzing ? 'Gemini parsing pixels...' : '✓ AI Verification Scan'}
                      </button>
                    </div>

                    {/* Right: Simulated Preview */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Screenshot canvas preset</span>
                        <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono font-bold">Base64</span>
                      </div>
                      
                      <div className="w-full h-32 border border-slate-300 rounded bg-white p-2 text-[9px] font-mono select-none overflow-hidden text-slate-600 relative flex flex-col justify-between">
                        {selectedPresetImage === 'fargo' && (
                          <>
                            <div className="bg-blue-900 text-white p-1 text-center font-sans font-bold">FARGO COURIER KENYA</div>
                            <div>
                              <p>WAYBILL NO: FG-NB-109-{activeTx.id}</p>
                              <p>Merchant account: {activeTx.sellerHandle}</p>
                              <p>Escrow Hold: Ksh {activeTx.amount.toLocaleString()}</p>
                            </div>
                          </>
                        )}
                        {selectedPresetImage === 'mpesasMS' && (
                          <>
                            <div className="bg-emerald-600 text-white p-1 text-center font-sans font-bold">M-PESA DEPOSIT SLIP</div>
                            <div>
                              <p>MP-CODE: SD89{activeTx.id.split('-').pop()}</p>
                              <p>Amount: Ksh {(activeTx.totalAmount || activeTx.amount).toLocaleString()}.00</p>
                            </div>
                          </>
                        )}
                        {selectedPresetImage === 'manipulated' && (
                          <>
                            <div className="bg-rose-900 text-white p-1 text-center font-sans font-bold font-serif">ALTERED RECEIPTS TICKET</div>
                            <div>
                              <p className="text-rose-700 font-bold">Amount Mismatch forgery</p>
                              <p className="font-bold underline text-rose-800">Ksh {(activeTx.amount * 5).toLocaleString()}.00</p>
                            </div>
                          </>
                        )}
                        <span className="absolute bottom-1 right-1 bg-slate-100 text-[8px] text-slate-500 px-1 rounded uppercase font-bold border">Waybill</span>
                      </div>

                      <AnimatePresence>
                        {activeTx.receiptAnalysis && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-2.5 rounded-lg border text-xs mt-3 ${
                              activeTx.receiptAnalysis.verified 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                                : 'bg-red-50 border-red-100 text-red-800'
                            }`}
                          >
                            <div className="flex justify-between font-bold items-center mb-1 text-[10px]">
                              <span>AI result: {activeTx.receiptAnalysis.verified ? '✓ CLEAR OF RISK' : '⚠️ HIGH RISK ALERT'}</span>
                              <span>Score: {activeTx.receiptAnalysis.confidence}%</span>
                            </div>
                            <p className="text-[9.5px] leading-tight"><strong className="uppercase">OCR character:</strong> "{activeTx.receiptAnalysis.detectedText}"</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Buyer confirm receipt action */}
                  <div className="border-t border-dashed border-slate-100 pt-3 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => triggerStatusChange('release')}
                      className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl text-xs hover:bg-emerald-700 transition"
                    >
                      ✓ Confirm Arrival (Disburse Held Funds)
                    </button>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Reason for dispute..."
                        className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                      />
                      <button
                        onClick={() => triggerStatusChange('dispute', { reason: disputeReason })}
                        className="bg-rose-600 text-white font-semibold px-4 py-3 rounded-xl text-xs hover:bg-rose-700 transition"
                      >
                        ⚠️ Lodge Dispute
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DISPUTED STATE */}
              {activeTx.status === 'DISPUTED' && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl space-y-3">
                  <div className="flex gap-2 text-rose-800">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold font-sans">Dispute Ledger Frozen (ES-DISPUTED)</h4>
                      <p className="text-[11px] text-rose-600 leading-normal">Compliance guidelines hold Ksh {(activeTx.totalAmount || activeTx.amount).toLocaleString()} locked. System allows dispute assessment audits or reverse rollovers.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => triggerStatusChange('release')}
                      className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                    >
                      Release to Seller
                    </button>
                    <button
                      onClick={() => triggerStatusChange('refund')}
                      className="flex-1 bg-red-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-red-700 transition active:scale-95 cursor-pointer"
                    >
                      Process Reverse Refund
                    </button>
                  </div>
                </div>
              )}

              {/* FUNDS_RELEASED STATE */}
              {activeTx.status === 'FUNDS_RELEASED' && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Escrow Capital Released Successfully</h4>
                    <p className="text-[11px] text-emerald-600/90 leading-tight">Ksh {activeTx.amount} settled to merchant account: {activeTx.sellerPhone}. Safe trust ledger closed.</p>
                  </div>
                </div>
              )}

              {/* REFUNDED STATE */}
              {activeTx.status === 'REFUNDED' && (
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                  <Info className="w-6 h-6 text-slate-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Escrow Capital Refunded</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Funds rolled back successfully straight to buyer mobile money: {activeTx.buyerPhone}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TIMELINE TRACK */}
          <div className="border-t border-slate-100 pt-4 mt-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Immutable Verification Timeline
            </h4>
            
            <div className="space-y-4 text-xs">
              {activeTx.history.map((h, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  {idx < activeTx.history.length - 1 && (
                    <span className="absolute left-[13px] top-[14px] bottom-[-24px] w-0.5 bg-slate-100"></span>
                  )}
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    h.actor === 'AI_MODERATOR' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                    h.actor === 'SYSTEM' ? 'bg-sky-50 text-sky-600 border border-sky-200' :
                    h.actor === 'BUYER' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {h.actor === 'AI_MODERATOR' ? 'AI' : h.actor[0]}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-800 leading-none">{h.title}</h5>
                      <span className="text-[9px] text-slate-400 font-mono leading-none">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
