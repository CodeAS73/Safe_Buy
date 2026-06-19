import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Key, 
  Cpu, 
  Coins, 
  AlertCircle, 
  Clock, 
  Search, 
  Building, 
  Camera, 
  CheckCircle, 
  Check, 
  TrendingUp, 
  User, 
  CheckSquare, 
  Info, 
  DollarSign, 
  Navigation,
  FileCheck,
  AlertTriangle,
  Map,
  BadgePercent
} from 'lucide-react';
import { Transaction, DeliveryPartner, DeliveryBid, VerifiedProduct } from '../types';

interface LogisticsHubProps {
  transactions: Transaction[];
  onRefresh: () => void;
  onUpdateTransaction: (updatedTx: Transaction) => void;
}

export default function LogisticsHub({ transactions, onRefresh, onUpdateTransaction }: LogisticsHubProps) {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [activePartnerTab, setActivePartnerTab] = useState<'marketplace' | 'bid_portal' | 'onboard' | 'picker_ops' | 'threat_logs'>('marketplace');
  const [userRole, setUserRole] = useState<'buyer_seller' | 'indie_partner'>('indie_partner');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form State (Indie)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regType, setRegType] = useState<'RIDER' | 'DRIVER' | 'PICKER'>('RIDER');
  const [regNationalId, setRegNationalId] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regVehicle, setRegVehicle] = useState('');
  const [regEmergencyContact, setRegEmergencyContact] = useState('');
  const [isRegSuccess, setIsRegSuccess] = useState(false);

  // Business Courier State
  const [bizName, setBizName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizReg, setBizReg] = useState('');
  const [bizPin, setBizPin] = useState('');
  const [bizPricing, setBizPricing] = useState('Standard (Ksh 220 per 5KM)');
  const [isBizSuccess, setIsBizSuccess] = useState(false);

  // Bid / Activity States
  const [selectedTxId, setSelectedTxId] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<number>(250);
  const [estHours, setEstHours] = useState<number>(2);
  const [selectedBidderId, setSelectedBidderId] = useState<string>('DP-001');
  const [bidSuccessMessage, setBidSuccessMessage] = useState<string | null>(null);

  // Verification PIN form
  const [verificationPin, setVerificationPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<boolean>(false);

  // Picker Report Form
  const [conditionReport, setConditionReport] = useState('Product physically inspected on-site. Verified brand authenticity, tested ports, no structural defects reported. Item successfully sealed for escrow dispatch.');
  const [pickerSuccess, setPickerSuccess] = useState(false);

  // Pre-Sale Verified Product Inspection List
  const [auditorProducts, setAuditorProducts] = useState<VerifiedProduct[]>([]);
  const [selectedAuditorProdId, setSelectedAuditorProdId] = useState<string>('');
  const [auditorCondition, setAuditorCondition] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Excellent');
  const [auditorSerial, setAuditorSerial] = useState('X894-AUDIT-KE');
  const [auditorFunctional, setAuditorFunctional] = useState(true);
  const [auditorNotes, setAuditorNotes] = useState('Tested pre-sale product on premise. Checked ports, buttons, chassis condition. No blemishes or firmware bugs. Verified authenticity of unit.');
  const [pickerSuccessMsg, setPickerSuccessMsg] = useState(false);

  const fetchAuditorProducts = async () => {
    try {
      const res = await fetch('/api/verified-products');
      if (res.ok) {
        const data = await res.json();
        setAuditorProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch auditor products:', err);
    }
  };

  useEffect(() => {
    fetchAuditorProducts();
  }, [activePartnerTab]);

  const handleAuditorProductSubmit = async () => {
    if (!selectedAuditorProdId) {
      alert('Please select a target product request.');
      return;
    }
    try {
      setIsLoading(true);
      const reportRes = await fetch(`/api/verified-products/${selectedAuditorProdId}/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition: auditorCondition,
          functionalPass: auditorFunctional,
          serialNumber: auditorSerial,
          notes: auditorNotes,
          outcome: auditorFunctional ? 'Verified' : 'Verification Failed'
        })
      });

      if (reportRes.ok) {
        await fetch(`/api/verified-products/${selectedAuditorProdId}/approve`, {
          method: 'POST'
        });
        
        setPickerSuccessMsg(true);
        setTimeout(() => setPickerSuccessMsg(false), 4000);
        await fetchAuditorProducts();
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to submit auditor verified product report:', err);
      setIsLoading(false);
    }
  };

  // Local Waybill signature
  const [signerName, setSignerName] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState<'PICKED_UP' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED'>('PICKED_UP');
  
  // Load logistics partners data
  const loadPartners = async () => {
    try {
      const response = await fetch('/api/logistics/partners');
      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      }
    } catch (e) {
      console.error('Failed to load logistics partners:', e);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const openCourierOrders = transactions.filter(t => t.shippingMethod === 'Courier');

  // Handle Indie Partner Registration
  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regNationalId) {
      alert('Please fill out required credentials.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/logistics/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          type: regType,
          nationalId: regNationalId,
          drivingLicense: regLicense,
          vehicleDetails: regVehicle,
          emergencyContact: regEmergencyContact
        })
      });

      if (response.ok) {
        setIsRegSuccess(true);
        loadPartners();
        setTimeout(() => {
          setIsRegSuccess(false);
          setRegName('');
          setRegPhone('');
          setRegNationalId('');
          setRegLicense('');
          setRegVehicle('');
          setRegEmergencyContact('');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Courier Firm Onboarding
  const handleBizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !bizPhone || !bizReg || !bizPin) {
      alert('Please fill out all registered company parameters.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/logistics/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bizName,
          phone: bizPhone,
          type: 'COURIER',
          nationalId: bizReg,
          drivingLicense: bizPin,
          vehicleDetails: bizPricing,
          emergencyContact: 'Business Headquarters',
          isCourierCompany: true,
          companyReg: bizReg,
          kraPin: bizPin,
          servicePricing: bizPricing
        })
      });

      if (response.ok) {
        setIsBizSuccess(true);
        loadPartners();
        setTimeout(() => {
          setIsBizSuccess(false);
          setBizName('');
          setBizPhone('');
          setBizReg('');
          setBizPin('');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Place Competitive Bid
  const handlePlaceBid = async () => {
    if (!selectedTxId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${selectedTxId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedBidderId,
          bidAmount: bidAmount,
          estimatedHours: estHours
        })
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
        setBidSuccessMessage(`Bid of Ksh ${bidAmount} submitted successfully by ${partners.find(p => p.id === selectedBidderId)?.name || 'partner'}`);
        setTimeout(() => setBidSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Accept Selected Bid
  const handleAcceptBid = async (txId: string, bid: DeliveryBid) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${txId}/accept-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: bid.partnerId,
          bidAmount: bid.bidAmount,
          escrowModel: 'model_1' // model 1 is default (Buyer Pays Courier Fee)
        })
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Picker Inspection report
  const handleSubmitPickerReport = async (txId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/transactions/${txId}/picker-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conditionReport,
          pickerId: 'DP-003' // Alex Picker ID
        })
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
        setPickerSuccess(true);
        setTimeout(() => setPickerSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Advance delivery status milestone
  const handleAdvanceMilestone = async (txId: string, customStatus?: string) => {
    setIsLoading(true);
    try {
      const targetStatus = customStatus || milestoneStatus;
      const response = await fetch(`/api/transactions/${txId}/delivery-milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          signature: signerName || 'Electronic Dispatch Signed'
        })
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
        setSignerName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate Delivery PIN
  const handleValidatePin = async (txId: string, customPin?: string) => {
    setPinError(null);
    setPinSuccess(false);
    setIsLoading(true);
    
    const targetPin = customPin || verificationPin;
    if (!targetPin) {
      setPinError('Please enter the 6-digit confirmation PIN code.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${txId}/validate-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: targetPin })
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdateTransaction(updated);
        onRefresh();
        setPinSuccess(true);
        setVerificationPin('');
        setTimeout(() => setPinSuccess(false), 3000);
      } else {
        const errData = await response.json();
        setPinError(errData.error || 'Invalid OTP Handover PIN entered.');
      }
    } catch (err) {
      setPinError('Server offline. Validate PIN failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // AI intelligence risk scores summary
  const totalCompleted = partners.reduce((acc, p) => acc + p.completedDeliveries, 0);
  const overallSafetyRate = 98.6;

  // Selected Order details for quick actions
  const selectedTx = openCourierOrders.find(t => t.id === selectedTxId) || openCourierOrders[0];

  useEffect(() => {
    if (openCourierOrders.length > 0 && !selectedTxId) {
      setSelectedTxId(openCourierOrders[0].id);
    }
  }, [openCourierOrders, selectedTxId]);

  return (
    <div id="logistics-ecosystem-hub" className="space-y-6">
      
      {/* HUB HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/6">
          <Truck className="w-96 h-96" />
        </div>
        
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 font-bold border border-emerald-500/20 font-mono">
              CO-ESCROW PAYOUT ARCHITECTURE
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Logistics & Delivery Partner Ecosystem
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate social commerce fraud with Buy Safely's decentralized trust layer. Sellers, buyers, independent riders, drivers, and visual product pickers transact securely. Delivery fees reside in escrow protection—released only after verification matching PIN handshakes.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/50">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 leading-none uppercase font-mono">Ledger Security</p>
                <p className="text-xs font-bold text-slate-200">100% Locked Escrow</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/50">
              <Cpu className="w-4.5 h-4.5 text-amber-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 leading-none uppercase font-mono">Matching Engine</p>
                <p className="text-xs font-bold text-slate-200">Competitive Bidding</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/50">
              <Key className="w-4.5 h-4.5 text-indigo-400" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 leading-none uppercase font-mono">Anti-Cheat</p>
                <p className="text-xs font-bold text-slate-200">Handover PIN Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE PORTALS SELECTOR RAIL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setActivePartnerTab('marketplace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePartnerTab === 'marketplace'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            🏢 <span>Verified Partner Registry</span>
          </button>
          
          <button
            onClick={() => setActivePartnerTab('bid_portal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePartnerTab === 'bid_portal'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            🏍️ <span>Competitive Bid Lobby</span>
          </button>

          <button
            onClick={() => setActivePartnerTab('picker_ops')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePartnerTab === 'picker_ops'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            🕵️ <span>Picker Inspection Network</span>
          </button>

          <button
            onClick={() => setActivePartnerTab('onboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePartnerTab === 'onboard'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            📝 <span>Join Partner System</span>
          </button>

          <button
            onClick={() => setActivePartnerTab('threat_logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePartnerTab === 'threat_logs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            👁️ <span>AI Delivery Intelligence</span>
          </button>
        </div>

        {/* ROLE SIMULATOR SWITCH */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch md:self-auto text-xs font-medium">
          <button
            onClick={() => setUserRole('buyer_seller')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              userRole === 'buyer_seller'
                ? 'bg-white shadow text-slate-950 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Seller / Buyer Portal
          </button>
          <button
            onClick={() => setUserRole('indie_partner')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              userRole === 'indie_partner'
                ? 'bg-white shadow text-slate-950 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Legistics Partner
          </button>
        </div>
      </div>

      {/* RENDER CURRENT VIEWPORTS */}
      <div id="logistics-hub-viewport" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: PRIMARY ACTION CARD & SELECTION DETAILS */}
        <div className="lg:col-span-2 space-y-6">

          {/* TAB 1: VERIFIED LOGISTICS PARTNERS REGISTRY */}
          {activePartnerTab === 'marketplace' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Active Logistics Partners</h3>
                  <p className="text-xs text-slate-500">Live registry of authenticated couriers, drivers, riders and pickers in Kenya</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-emerald-800 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span>System Safe Active</span>
                </div>
              </div>

              {/* PARTNERS LISTING INTERACTIVE CARDS */}
              <div id="partner-registry-list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.map(p => (
                  <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-3 relative overflow-hidden">
                    {/* Availability Dot Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        p.availability === 'ONLINE' ? 'bg-emerald-500' : p.availability === 'BUSY' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}></span>
                      <span className="text-[10px] text-slate-500 font-bold font-mono uppercase">{p.availability}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-200 rounded-xl">{p.avatar || '👤'}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1">{p.name}</h4>
                        <p className="text-[11px] text-indigo-600 font-mono font-bold uppercase">{p.type} PARTNER</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200/60 text-slate-600">
                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-mono">Trust Rating</span>
                        <span className="font-bold text-slate-900">⭐ {p.trustScore}%</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-mono">Trips Completed</span>
                        <span className="font-bold text-slate-900">{p.completedDeliveries}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-mono">Dispute Rate</span>
                        <span className="font-bold text-slate-900">{p.disputeRate}%</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-mono">On-Time Dispatches</span>
                        <span className="font-bold text-slate-900">{p.onTimeRate}%</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-1 space-y-1">
                      <p><span className="font-semibold text-slate-800">Phone Match:</span> {p.phone}</p>
                      {p.vehicleDetails && <p><span className="font-semibold text-slate-800 font-sans">Details:</span> {p.vehicleDetails}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">Verified ID</span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        🛡️ Escrow Ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COMPETITIVE BIDDING INTERACTIVE LOBBY */}
          {activePartnerTab === 'bid_portal' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Active Deliveries Bidding Room</h3>
                <p className="text-xs text-slate-500">Riders, drivers, and couriers place competitive delivery quotes on pending escrow orders.</p>
              </div>

              {openCourierOrders.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Truck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-xs font-semibold">No active courier checkout contracts needing dispatches.</p>
                  <p className="text-slate-400 text-[10px] mt-1">Generate a social checkouts link selection "Courier Delivery" to trigger bidding.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* BID SELECTOR SECTION */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 font-mono tracking-wider">Select Order & Submit Quote (Indie Simulator)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Target Order</label>
                        <select
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none"
                          value={selectedTxId}
                          onChange={(e) => setSelectedTxId(e.target.value)}
                        >
                          <option value="">-- Choose Order --</option>
                          {openCourierOrders.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.id} - {t.description.substring(0, 30)}... (Ksh {t.amount})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Select Partner Bidding</label>
                        <select
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none"
                          value={selectedBidderId}
                          onChange={(e) => setSelectedBidderId(e.target.value)}
                        >
                          <option value="">-- Choose Independent Professional --</option>
                          {partners.filter(p => p.type !== 'COURIER').map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.type} - Trust: {p.trustScore}%)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                          Delivery Quote Bidding Amount (Ksh)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2 text-xs text-slate-500 font-bold">Ksh</span>
                          <input
                            type="number"
                            min="200"
                            max="600"
                            className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-3 py-2 text-xs font-bold shadow-sm focus:outline-none"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(parseInt(e.target.value) || 200)}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">Market range for courier routes: Min Ksh 200 / Max Ksh 500. Underbidding increases checkout chances!</span>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                          Estimated Transit speed (Hours)
                        </label>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none"
                          value={estHours}
                          onChange={(e) => setEstHours(parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceBid}
                      disabled={!selectedTxId || !selectedBidderId || isLoading}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-slate-800 transition shadow disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? 'Posting Secure Quote Bid...' : '🚀 Submit Competitive Bid'}
                    </button>

                    {bidSuccessMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-fade-in flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> {bidSuccessMessage}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE CONTRACT ORDERS LIST WITH SECURED BIDS */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-xs font-black uppercase text-slate-700 font-mono tracking-wider">Active Contract Dispatches & Received Bids</h4>
                    
                    {openCourierOrders.map(t => (
                      <div key={t.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">TRANSACTION ID: {t.id}</span>
                            <h5 className="font-bold text-slate-950 text-sm">{t.description}</h5>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> 
                              {t.shippingDetails?.county || 'Nairobi'} (Pickup) → {t.shippingDetails?.town || 'Mombasa Road'} (Destination)
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 text-[10px] uppercase block font-mono">Item Escrow Pool</span>
                            <span className="font-black text-slate-950 text-sm">Ksh {t.amount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* DISPLAY GPS BOUNDARY TRACES - STRICTLY DESTINATIONS, NO TRACKERS IN TRANSIT */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-3">
                          <Map className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div className="flex-1 space-y-0.5">
                            <p className="font-bold text-slate-800">Escrow Route Boundary Limits Saved</p>
                            <p>GPS limits locked between <span className="font-mono font-bold text-slate-900">{t.shippingDetails?.county || 'Nairobi County'}</span> and <span className="font-mono font-bold text-slate-900">{t.shippingDetails?.town || 'Area Boundary Drop point'}</span>. Continuous route monitoring replaced with handover verification OTP keys.</p>
                          </div>
                        </div>

                        {/* BIDS SECTION */}
                        <div className="space-y-2">
                          <h6 className="text-[11px] font-bold text-slate-700">Received Bids Matrix ({t.deliveryBids?.length || 0})</h6>
                          
                          {(!t.deliveryBids || t.deliveryBids.length === 0) ? (
                            <p className="text-xs text-slate-400">Waiting for live courier pricing bids...</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {t.deliveryBids.map(bid => (
                                <div key={bid.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                                  <div>
                                    <div className="flex justify-between items-start">
                                      <span className="font-bold text-slate-900 text-xs">{bid.partnerName}</span>
                                      <span className="text-[9px] bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-bold uppercase font-mono">{bid.partnerType}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Trust Index: {bid.trustScore}% • Completed: {bid.deliveryCount}</p>
                                    <p className="text-xs font-black text-indigo-600 mt-2">Ksh {bid.bidAmount}</p>
                                    <p className="text-[10px] text-slate-400">{bid.estimatedHours} Hours delivery transit</p>
                                  </div>

                                  {userRole === 'buyer_seller' && (
                                    <button
                                      onClick={() => handleAcceptBid(t.id, bid)}
                                      disabled={t.deliveryPartnerId === bid.partnerId}
                                      className={`w-full py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                        t.deliveryPartnerId === bid.partnerId
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                      }`}
                                    >
                                      {t.deliveryPartnerId === bid.partnerId ? (
                                        <>
                                          <Check className="w-3 h-3" /> Partner Matched
                                        </>
                                      ) : (
                                        'Accept & Pair Carrier'
                                      )}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* HIGHLIGHT COMPLETED SELECTION OR OTP CODES */}
                        {t.deliveryPartnerId && (
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                              <span>Carrier matched: <span className="font-bold">{t.deliveryPartnerName}</span>. Payout held in escrow vault.</span>
                            </div>
                            
                            <div className="bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5 font-mono">
                              <Key className="w-3.5 h-3.5 text-emerald-800" />
                              <span className="text-[11px] font-black tracking-widest">PIN: {t.deliveryPin}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGISTER / JOIN THE PARTNER SYSTEM */}
          {activePartnerTab === 'onboard' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Join the Buy Safely Partner Network</h3>
                <p className="text-xs text-slate-500">Become an authorized logistics fulfillment component</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CATEGORY 2: INDIE REGISTER */}
                <form onSubmit={handleRegSubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider font-mono flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500" /> CATEGORY 2: Independent Partner
                  </h4>
                  <p className="text-[11px] text-slate-500">Perfect for individual motorcycle riders, pickup truck operators, drivers, and visual premis inspection pickers.</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="John Kamau"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">M-Pesa Connected Phone</label>
                      <input
                        type="tel"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="254712345678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Partner Type</label>
                        <select
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                          value={regType}
                          onChange={(e) => setRegType(e.target.value as any)}
                        >
                          <option value="RIDER">🏍️ Rider (Boda)</option>
                          <option value="DRIVER">🚗 Driver (Probox / Car)</option>
                          <option value="PICKER">🕵️ Picker (Inspector)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">National ID Number</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                          placeholder="32098412"
                          value={regNationalId}
                          onChange={(e) => setRegNationalId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Driving License (if applicable)</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="DL-89/102A"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Vehicle / Asset details</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="Bajaj Boxer KMDQ 991F"
                        value={regVehicle}
                        onChange={(e) => setRegVehicle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Emergency Contact Info</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="Sister Mary - 0711999999"
                        value={regEmergencyContact}
                        onChange={(e) => setRegEmergencyContact(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-3 rounded-lg text-[10px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1">🛡️ ONBOARDING CHECKLISTS FOR COMPLIANCE</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <input type="checkbox" defaultChecked disabled /> Phone Network SMS Checked
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <input type="checkbox" defaultChecked disabled /> Safaricom Til M-Pesa match
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <input type="checkbox" defaultChecked disabled /> Selfie Facetime match ID verified
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-slate-800 transition shadow disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Hashing Trust Record...' : '✅ Register Independent partner'}
                  </button>

                  {isRegSuccess && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-bold text-center">
                      Onboarding Clear! System assigned DP-006. Live online.
                    </div>
                  )}
                </form>

                {/* CATEGORY 1: COURIER FIRM ONBOARD */}
                <form onSubmit={handleBizSubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider font-mono flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-slate-500" /> CATEGORY 1: Professional Logistics firm
                  </h4>
                  <p className="text-[11px] text-slate-500">Compatible with local motorcycle parcel services, inter-county courier terminals and national delivery firms.</p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Company Registered Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="Nairobi Express Boda Transporters"
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Corporate Dispatch Hotline</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="254700000123"
                        value={bizPhone}
                        onChange={(e) => setBizPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Business Registration Certificate (BRN)</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="PVT-CR-789392"
                        value={bizReg}
                        onChange={(e) => setBizReg(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">KRA PIN (Kenya Revenue Authority)</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="P05102948F"
                        value={bizPin}
                        onChange={(e) => setBizPin(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Settlement Details & Pricing model</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                        placeholder="Flat Rate: Ksh 250 (Within Nairobi Central)"
                        value={bizPricing}
                        onChange={(e) => setBizPricing(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-[10px] text-slate-600">
                    <p className="font-bold text-slate-800 leading-none mb-1">🔒 SECURE BUSINESS DEPOSIT ESCROW LAYER</p>
                    <p>Corporate courier entries undergo direct merchant ledger audit and billing matching with 10% auto commission split deducted.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-slate-800 transition shadow disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Validating KRA PIN...' : '🏢 Submit Commercial Onboarding'}
                  </button>

                  {isBizSuccess && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-bold text-center">
                      Corporate Portal Configured! Commercial account listed.
                    </div>
                  )}
                </form>

              </div>
            </div>
          )}

          {/* TAB 4: PICKER INSPECTION NETWORK OPERATIONS */}
          {activePartnerTab === 'picker_ops' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    🕵️ Trust Auditor & Picker Console
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify seller locations, product authenticity, and condition. Pre-sale audits secure high-value escrow transactions.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-3 py-1 text-xs font-bold w-max">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Auditor Alex Connected
                </div>
              </div>

              {/* AUDITOR QUALITY CONTROL CORE METRICS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Auditor Trust Score</span>
                  <strong className="text-xl font-black text-slate-900 font-mono">99.6%</strong>
                  <span className="block text-[9px] text-emerald-600 font-semibold mt-1">✓ Top Tier Level</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inspection Quality</span>
                  <strong className="text-xl font-black text-slate-900 font-mono">4.9 / 5.0</strong>
                  <span className="block text-[9px] text-slate-500 font-medium mt-1">from 48 reviews</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dispute Score</span>
                  <strong className="text-xl font-black text-slate-900 font-mono">0.4%</strong>
                  <span className="block text-[9px] text-slate-500 font-medium mt-1">Nairobi CBD average</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center bg-indigo-50/20 border-indigo-150">
                  <span className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Auditor Revenue</span>
                  <strong className="text-xl font-black text-indigo-950 font-mono font-mono">Ksh 24,800</strong>
                  <span className="block text-[9px] text-indigo-600 font-bold mt-1">Escrow Disbursed</span>
                </div>
              </div>

              {/* INTERNAL REVENUE ALLOCATION SCHEME */}
              <div className="p-4 bg-indigo-950 text-indigo-200 rounded-2xl border border-indigo-900 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Auditability & Standard Revenue Allocation Scheme (Ledger Sync)</span>
                </div>
                <p className="text-[10px] text-indigo-300 leading-relaxed font-sans">
                  To preserve platform commercial secrecy and seller margins, the following financial ledger split is restricted to internal operational bookkeeping. It remains invisible to standard buyers and sellers visiting checkout portals:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[10px] bg-slate-950/45 p-3 rounded-xl font-mono">
                  <div className="flex justify-between sm:block border-b sm:border-b-0 sm:border-r border-indigo-900 pb-1.5 sm:pb-0 sm:pr-3">
                    <span className="text-indigo-400 block sm:mb-0.5">Auditor Compensation (75%):</span>
                    <strong className="text-slate-100">Ksh 337 to Ksh 1,500 per audit</strong>
                  </div>
                  <div className="flex justify-between sm:block border-b sm:border-b-0 sm:border-r border-indigo-900 py-1.5 sm:py-0 sm:px-3">
                    <span className="text-indigo-400 block sm:mb-0.5">Buy Safely Network (20%):</span>
                    <strong className="text-emerald-300">Ksh 90 to Ksh 400 platform fee</strong>
                  </div>
                  <div className="flex justify-between sm:block pt-1.5 sm:pt-0 sm:pl-3">
                    <span className="text-indigo-400 block sm:mb-0.5">M-Pesa API / PSP SLA (5%):</span>
                    <strong className="text-slate-100">Ksh 22 to Ksh 100 transaction fee</strong>
                  </div>
                </div>
              </div>

              {/* ACTIVE PRE-SALE CERTIFICATION CONTROLS */}
              <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50/50 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider font-mono">
                  🔬 Pre-Sale Physical Inspection Diagnostic Hub
                </h4>
                <p className="text-xs text-slate-500 font-sans">
                  Select listings with requested verification audits. Visually inspect product authenticity, chassis numbers, serial hashes, and enter standard condition parameters.
                </p>

                {auditorProducts.filter(p => p.verificationStatus === 'AUDITOR_ASSIGNED').length === 0 ? (
                  <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-200">
                    <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-slate-500 text-xs font-semibold">No active listings awaiting on-site physical audits.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Sellers can request pre-sale verification using the Checkout Link Builder tab above.</p>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Pick Product Listing to Audit</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                          value={selectedAuditorProdId}
                          onChange={(e) => {
                            const prodId = e.target.value;
                            setSelectedAuditorProdId(prodId);
                            const found = auditorProducts.find(p => p.id === prodId);
                            if (found) {
                              setAuditorNotes(`Checked product "${found.title}". Checked brand features, diagnostic test suite, chassis frame, and serial number matches. Authentic unit.`);
                            }
                          }}
                        >
                          <option value="">-- Choose Target Listing --</option>
                          {auditorProducts.filter(p => p.verificationStatus === 'AUDITOR_ASSIGNED').map(p => (
                            <option key={p.id} value={p.id}>
                              [{p.category}] {p.id} - {p.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">Audit Fee Reimbursement Split</span>
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 font-mono">
                          Ksh {selectedAuditorProdId ? Math.floor((auditorProducts.find(p => p.id === selectedAuditorProdId)?.verificationFee || 450) * 0.75) : 350} (75% Auditor Split)
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 font-mono uppercase">Item Physical Condition</label>
                        <select
                          value={auditorCondition}
                          onChange={(e) => setAuditorCondition(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          <option value="Excellent">🌟 Excellent (Flawless condition)</option>
                          <option value="Good">👍 Good (Minor cosmetic wear)</option>
                          <option value="Fair">😐 Fair (Moderate usage visible)</option>
                          <option value="Poor">🚨 Poor (Requires critical service)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 font-mono uppercase">Unit Serial Hash / Chassis ID</label>
                        <input
                          type="text"
                          value={auditorSerial}
                          onChange={(e) => setAuditorSerial(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none"
                          placeholder="SerialNumber-NCP51"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={auditorFunctional}
                        onChange={(e) => setAuditorFunctional(e.target.checked)}
                        id="auditor-functional-check"
                        className="cursor-pointer"
                      />
                      <label htmlFor="auditor-functional-check" className="font-semibold cursor-pointer select-none">
                        Tested operational parameters and verified original manufacturer components.
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1 font-mono">Media & Inspector Diagnostic Notes</label>
                      <textarea
                        value={auditorNotes}
                        onChange={(e) => setAuditorNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleAuditorProductSubmit}
                      disabled={isLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-extrabold transition shadow border-0 cursor-pointer text-center"
                    >
                      {isLoading ? 'Uploading High-fidelity Verification reports...' : '🕵️ Submit On-Site Physical Inspection Report'}
                    </button>

                    {pickerSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-900 text-xs rounded-xl font-bold font-mono">
                        ✓ Report logged + approved. Verified product badge issued recursively.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DETAILED VERIFIED CATALOG ARCHIVE */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider font-mono flex items-center gap-1.5">
                  📁 Buy Safely Verified Product Registry Catalog
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3 text-left">Product ID</th>
                        <th className="py-2.5 px-3 text-left">Product Title</th>
                        <th className="py-2.5 px-3 text-left">Category</th>
                        <th className="py-2.5 px-3 text-right">Price (Ksh)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-left">Expiration Validity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditorProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 font-medium">
                          <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">{p.id}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-800">{p.title}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">{p.category}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-bold">{(p.price || 0).toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              p.verificationStatus === 'UNVERIFIED' ? 'bg-slate-150 text-slate-600' :
                              p.verificationStatus === 'AUDITOR_ASSIGNED' ? 'bg-amber-100 text-amber-800' :
                              p.verificationStatus === 'INSPECTION_COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.verificationStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {p.verificationStatus === 'VERIFIED' ? (
                              <span className="font-bold text-slate-700 font-mono text-[10px]">
                                Exp: {new Date(p.expiresAt || '').toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-slate-400">Not Certified</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI DELIVERY THREAT LOGS */}
          {activePartnerTab === 'threat_logs' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-950">AI Social Commerce Delivery Monitor</h3>
                <p className="text-xs text-slate-500">Autonomous evaluation of delayed transits, hijack attempts, route deviations, and transaction anomalies.</p>
              </div>

              {/* STATS OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-400 text-[10px] uppercase block font-mono">Risk Mitigations</span>
                  <span className="text-lg font-black text-slate-950">{totalCompleted} monitored dispatches</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-400 text-[10px] uppercase block font-mono">System Clean Rate</span>
                  <span className="text-lg font-black text-slate-950">{overallSafetyRate}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-400 text-[10px] uppercase block font-mono">Anomalous Suspended Partners</span>
                  <span className="text-lg font-black text-slate-950">0 active</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Autonomous Threat Risk Rule-Escrow</p>
                  <p>In addition to monitoring routes, our AI scans for velocity matching triggers. If a carrier attempts to submit a "HANDOVER COMPLETE" marker without realistic physical transit travel times, the system overrides status: freezes release disengaged, alerts moderators, and elevates recipient OTP verification PIN challenges.</p>
                </div>
              </div>

              {/* LIST OF SYSTEM OBSERVATIONS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider font-mono">AI Active Observations Ledger</h4>
                
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <p className="font-bold text-slate-900">DP-001 (Rider John) Route Check</p>
                      <p className="text-[11px] text-slate-500">Boda Boxer matched waypoint coordinates in Westlands. On schedule.</p>
                    </div>
                  </div>
                  <span className="text-emerald-700 font-mono text-[10px]">NORMAL VELOCITY</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <div>
                      <p className="font-bold text-slate-900">DP-002 (Driver Mary) Transit Deviation Check</p>
                      <p className="text-[11px] text-slate-500">Delay flagged. Minor high-traffic density logged on Murang'a Road.</p>
                    </div>
                  </div>
                  <span className="text-amber-700 font-mono text-[10px]">CONGESTION DELAY (AI TRACKED)</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <div>
                      <p className="font-bold text-slate-900">Corporate Carrier Fargo Express</p>
                      <p className="text-[11px] text-slate-500">Waybill #FAR-391B matched optical character scans with 98% confidence score.</p>
                    </div>
                  </div>
                  <span className="text-teal-700 font-mono text-[10px]">VERIFIED OK</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INTERACTIVE HARDWARE DRIVER (PARTNER HANDOVER CONTROLLER) */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                🏍️
              </span>
              <div>
                <h4 className="text-xs font-black uppercase text-slate-100 leading-none font-mono">Carrier Terminal Driver</h4>
                <p className="text-[9px] text-slate-500 uppercase font-mono">Simulate Dispatcher Workflows</p>
              </div>
            </div>

            {openCourierOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 block font-mono">No active courier checkout contracts detected inside platform ledger.</p>
            ) : (
              <div className="space-y-6">
                
                {/* SELECT ACTIVE SIMULATED TRANSACTION */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 font-mono">Simulate Carrier Dispatch for Area Code:</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none"
                    value={selectedTxId}
                    onChange={(e) => setSelectedTxId(e.target.value)}
                  >
                    {openCourierOrders.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} - {t.description.substring(0, 20)}...
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTx && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    
                    {/* CURRENT ORDER PARAMS */}
                    <div className="p-3 bg-slate-800/80 border border-slate-800 rounded-xl space-y-1">
                      <p className="text-indigo-400 font-mono text-[10px] font-bold uppercase">Status: {selectedTx.deliveryStatus || 'PENDING_MATCH'}</p>
                      <p><span className="text-slate-400">Buyer Phone:</span> <span className="font-bold text-slate-200">{selectedTx.buyerPhone}</span></p>
                      <p><span className="text-slate-400">Escrow Value:</span> <span className="font-bold text-emerald-400 font-mono">Ksh {selectedTx.amount?.toLocaleString()}</span></p>
                      <p><span className="text-slate-400">Shipping Escrow Rate:</span> <span className="font-bold text-slate-200 font-mono">Ksh {selectedTx.shippingFee || 250}</span></p>
                     
                      {selectedTx.deliveryPartnerName ? (
                        <p><span className="text-slate-400">Secured Carrier:</span> <span className="font-bold text-slate-200">{selectedTx.deliveryPartnerName}</span></p>
                      ) : (
                        <p className="text-amber-400 font-bold text-[10px] flex items-center gap-0.5">⚠️ No dispatch carrier paired yet. Pls accept a bid in competitive lobby.</p>
                      )}
                    </div>

                    {/* ACTION PANEL 1: ADVANCE MILESTONES (DELIVERY AGENT STAGES) */}
                    {selectedTx.deliveryPartnerId && selectedTx.deliveryStatus !== 'CONFIRMED' && (
                      <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-800/80">
                        <h5 className="font-bold text-slate-100 text-xs flex items-center gap-1">📍 Fulfill Milestones Waypoint</h5>
                        
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <button
                            onClick={() => handleAdvanceMilestone(selectedTx.id, 'PICKED_UP')}
                            disabled={selectedTx.deliveryStatus === 'PICKED_UP'}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 py-1 px-2 rounded border border-slate-700 font-bold transition cursor-pointer"
                          >
                            📦 PICKED_UP
                          </button>
                          <button
                            onClick={() => handleAdvanceMilestone(selectedTx.id, 'IN_TRANSIT')}
                            disabled={selectedTx.deliveryStatus === 'IN_TRANSIT'}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 py-1 px-2 rounded border border-slate-700 font-bold transition cursor-pointer"
                          >
                            🚚 IN_TRANSIT
                          </button>
                          <button
                            onClick={() => handleAdvanceMilestone(selectedTx.id, 'ARRIVED')}
                            disabled={selectedTx.deliveryStatus === 'ARRIVED'}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 py-1 px-2 rounded border border-slate-700 font-bold transition cursor-pointer"
                          >
                            📍 ARRIVED
                          </button>
                          <button
                            onClick={() => handleAdvanceMilestone(selectedTx.id, 'DELIVERED')}
                            disabled={selectedTx.deliveryStatus === 'DELIVERED'}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 py-1 px-2 rounded border border-slate-700 font-bold transition cursor-pointer"
                          >
                            🏠 DELIVERED
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Recipient physical receiver signature matching:</label>
                          <input
                            type="text"
                            className="w-full bg-slate-850 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-white focus:outline-none"
                            placeholder="Sig: Sarah Wanyama"
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* ACTION PANEL 2: HANDOVER VALIDATION PIN INPUT */}
                    {selectedTx.deliveryStatus === 'DELIVERED' && (
                      <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-900/40 space-y-3">
                        <div className="flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-indigo-400" />
                          <h5 className="font-bold text-slate-100 text-xs">Authorize escrow Release</h5>
                        </div>
                        <p className="text-[10px] text-slate-400">Submit the 6-digit handover PIN provided by the Buyer upon actual handover of package to close transit ledger holds.</p>

                        <div className="space-y-2">
                          <input
                            type="text"
                            maxLength={6}
                            className="w-full bg-slate-800 border-2 border-indigo-900 text-center tracking-widest text-white rounded-xl py-2 px-3 text-sm font-black focus:outline-none"
                            value={verificationPin}
                            onChange={(e) => setVerificationPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 824761"
                          />

                          <button
                            onClick={() => handleValidatePin(selectedTx.id)}
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2 text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {isLoading ? 'Verifying PIN hash...' : '🔑 Authorize Release Escrow'}
                          </button>
                        </div>

                        {pinError && (
                          <p className="text-[11px] text-rose-400 font-semibold text-center flex items-center justify-center gap-0.5">
                            ✕ {pinError}
                          </p>
                        )}

                        {pinSuccess && (
                          <p className="text-[11px] text-emerald-400 font-bold text-center flex items-center justify-center gap-0.5 animate-bounce">
                            ✓ PIN Matches! Funds released successfully.
                          </p>
                        )}
                      </div>
                    )}

                    {/* RELEASED / SETTLED STATUS MARK */}
                    {selectedTx.deliveryStatus === 'CONFIRMED' && (
                      <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-center space-y-2 animate-fade-in text-emerald-400">
                        <CheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
                        <h5 className="font-bold text-xs">Safe Handover Completed Successfully</h5>
                        <p className="text-[10px] text-slate-400">The 6-digit Handover PIN matcher cleared successfully. split ledger payment issued, and funds disbursed to courier partner and item merchant handle.</p>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>

          {/* ESCROW PROTECTION BANNER CARD */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-900 font-sans flex items-center gap-1.5">
              ⚖️ Logistics Escrow Protection
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a buyer matches a delivery quote:
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Fees are isolated securely in a CBK-sandbox NCBA trust lockbox.</li>
              <li>Independent pickers get fully protected split fees upon inspection.</li>
              <li>Platform commissions (10% of courier fee) are captured automatically.</li>
              <li>Neither buyer nor seller can seize delivery funds prior to OTP security clears.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
