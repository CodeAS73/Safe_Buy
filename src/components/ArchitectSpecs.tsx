import React, { useState } from 'react';
import { 
  Network, 
  Database, 
  Code2, 
  Milestone, 
  FileCheck, 
  ChevronRight, 
  Binary, 
  ListOrdered,
  Layers,
  GitBranch,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function ArchitectSpecs() {
  const [activeTab, setActiveTab] = useState<'topology' | 'db' | 'api' | 'scaling' | 'regulatory'>('topology');

  return (
    <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-sm my-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-indigo-50 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> "Buy Safely" Production Blueprints
          </h2>
          <p className="text-xs text-slate-500">Fine-grained technical architecture specifications for African microtransaction volume</p>
        </div>

        {/* Tab Links */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button 
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'topology' ? 'bg-slate-950 text-white shadow-sm' : 'hover:bg-slate-200'}`}
          >
            Topology Guide
          </button>
          <button 
            onClick={() => setActiveTab('db')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'db' ? 'bg-slate-950 text-white shadow-sm' : 'hover:bg-slate-200'}`}
          >
            Postgres DB Schema
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'api' ? 'bg-slate-950 text-white shadow-sm' : 'hover:bg-slate-200'}`}
          >
            Daraja & Escrow APIs
          </button>
          <button 
            onClick={() => setActiveTab('regulatory')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'regulatory' ? 'bg-slate-950 text-white shadow-sm' : 'hover:bg-slate-200'}`}
          >
            CBK Regulation
          </button>
          <button 
            onClick={() => setActiveTab('scaling')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'scaling' ? 'bg-slate-950 text-white shadow-sm' : 'hover:bg-slate-200'}`}
          >
            Scaling Roadmap
          </button>
        </div>
      </div>

      <div className="text-xs">
        
        {/* TAB 1: TOPOLOGY */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <div className="bg-indigo-950/5 border border-indigo-200 p-4 rounded-xl">
              <h3 className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-indigo-700" /> Consolidated Multi-tenant Microservices Map
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                To process over 3 million microtransactions daily at Ksh 20–50 operating costs, "Buy Safely" operates an asynchronous, event-driven, zero-trust backend utilizing NGINX, NestJS gateway clusters, Kafka state queues, and dual storage databases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="font-extrabold uppercase text-[10px] text-indigo-600">Clientless Integration Edge</span>
                <p className="text-slate-700 font-bold text-xs">Ingress / CDN Layer</p>
                <ul className="space-y-2 text-slate-500 text-[11px] list-disc pl-4 leading-relaxed">
                  <li><strong>Cloudflare WAF / Enterprise Edge</strong> throttling bots, scraping networks, and rate-limiting STK triggers (max 3 per MSISDN per minute).</li>
                  <li><strong>Lightweight SDK Web Components</strong> loaded dynamically within Instagram WebView, WhatsApp message templates, or Facebook canvas tabs.</li>
                  <li><strong>Clientless Instant Checkouts</strong> bypassing standard application installations.</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="font-extrabold uppercase text-[10px] text-indigo-600">Event-driven Core Ledger</span>
                <p className="text-slate-700 font-bold text-xs">NestJS Transaction Engines</p>
                <ul className="space-y-2 text-slate-500 text-[11px] list-disc pl-4 leading-relaxed">
                  <li><strong>Escrow Ledger Service</strong> executing Double-entry ledger postings (balanced bookkeeping of liabilities vs asset pools).</li>
                  <li><strong>Daraja M-Pesa Router</strong> polling Safaricom OpenAPI nodes, Airtel Money platforms, and cellular network USSD bridges.</li>
                  <li><strong>Kafka Event Queue</strong> prioritizing and buffering M-Pesa instant payment notifications to handle peak demand (15k tps during holiday shopping).</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="font-extrabold uppercase text-[10px] text-indigo-600">AI Trust Integrity Pipeline</span>
                <p className="text-slate-700 font-bold text-xs">Python Microservices + Gemini</p>
                <ul className="space-y-2 text-slate-500 text-[11px] list-disc pl-4 leading-relaxed">
                  <li><strong>Optical Verification Service:</strong> Real-time processing of waybills, stamps, or M-Pesa SMS using Gemini (Multimodal reasoning).</li>
                  <li><strong>Velocity Scoring:</strong> Behavioral analysis that correlates IP addresses, geolocations, and SIMswap frequency.</li>
                  <li><strong>Boda/Rider Dispatch Validator:</strong> Geofencing validation that cross-checks Uber Boda or Bolt courier delivery receipts against target coordinates.</li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: POSTGRES DB SCHEMA */}
        {activeTab === 'db' && (
          <div className="space-y-6 select-text">
            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono overflow-x-auto space-y-5 shadow-inner">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <span className="text-xs font-bold text-sky-400">PostgreSQL Relational DB Structure suggestions (SQL)</span>
                <span className="text-[10px] text-slate-500">Ksh Microtransaction Optimized</span>
              </div>

              <code className="block whitespace-pre text-[11px] text-slate-300 leading-relaxed scrollbar-thin">
{`-- 1. Dual Entry Ledger Account Wallets
CREATE TABLE customer_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holder_phone VARCHAR(15) UNIQUE NOT NULL, -- MSISDN Format (+254...)
    currency VARCHAR(3) DEFAULT 'Ksh',
    available_balance NUMERIC(15, 2) DEFAULT 0.00,
    escrow_held_balance NUMERIC(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Social Merchant Verification profiles
CREATE TABLE social_sellers (
    seller_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES customer_wallets(wallet_id),
    shop_handle VARCHAR(50) UNIQUE NOT NULL, -- e.g. @trendy_thrifts_ke
    business_phone VARCHAR(15) NOT NULL,
    linked_whatsapp VARCHAR(15),
    verif_status VARCHAR(20) DEFAULT 'STANDARD_VERIFIED', -- PREMIUM_BADGED
    reputation_score INT DEFAULT 100, -- 0-100 Rating Scale
    volume_ksh NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Unified Social Escrow Transactions
CREATE TABLE transactions (
    transaction_id VARCHAR(30) PRIMARY KEY, -- e.g. 'BS-KSH-8942'
    buyer_phone VARCHAR(15) NOT NULL,
    seller_id UUID REFERENCES social_sellers(seller_id),
    item_description TEXT NOT NULL,
    social_origin VARCHAR(20) NOT NULL, -- INSTAGRAM, WHATSAPP, TIKTOK, FB
    amount NUMERIC(12, 2) NOT NULL,
    escrow_fee NUMERIC(6, 2) NOT NULL, -- Scaled Ksh 20-50 based on value
    status VARCHAR(25) NOT NULL, -- PENDING_DEPOSIT, ESCROW_HELD, ITEMS_SHIPPED, RELEASED
    shipping_partner VARCHAR(50),
    waybill_number VARCHAR(100),
    device_ip INET NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Multi-tenant Client Fingerprint Verification
CREATE TABLE device_metrics (
    fingerprint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(30) REFERENCES transactions(transaction_id),
    device_hardware_hash VARCHAR(120) NOT NULL,
    client_ip INET NOT NULL,
    sim_serial_hash VARCHAR(64),
    sim_swap_last_48h BOOLEAN DEFAULT FALSE,
    flagged_abuse_ring_id INT
);

-- 5. AI Reasoning Verification Output
CREATE TABLE ai_receipt_verifications (
    verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(30) REFERENCES transactions(transaction_id),
    extracted_text TEXT,
    confidence_percentage INT check(confidence_percentage BETWEEN 0 AND 100),
    match_code VARCHAR(20), -- Extracted Safaricom transaction ID
    manipulation_flags TEXT[],
    decision_passed BOOLEAN DEFAULT FALSE,
    fraud_score	INT CHECK(fraud_score BETWEEN 0 AND 100),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
              </code>
            </div>
          </div>
        )}

        {/* TAB 3: DARAJA APIs */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <Code2 className="w-4 h-4 text-indigo-600" /> API Contract Specification
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                To securely lock buyer funds immediately from an Instagram bubble click, "Buy Safely" triggers a Safaricom Daraja STK Push webhook.
              </p>

              <div className="space-y-3">
                <p className="font-extrabold text-[10px] uppercase text-indigo-600">Safaricom STK API Webhook Endpoint (POST /api/pay/daraja-callback)</p>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto shadow-inner leading-relaxed">
{`{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29112-3921021-1",
      "CheckoutRequestID": "ws_CO_240520261102213456",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 4540.00 },
          { "Name": "MpesaReceiptNumber", "Value": "SD89CBA094" },
          { "Name": "TransactionDate", "Value": 20260524110221 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}`}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-extrabold text-[10px] uppercase text-indigo-600">Unified B2C Escrow Release API (POST /api/escrow/release)</p>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto shadow-inner leading-relaxed">
{`{
  "transactionId": "BS-KSH-8942",
  "actorPhone": "254712345678",
  "releaseKey": "sha256_e109d94cb4567",
  "channelOptions": {
    "provider": "MPESA_B2C",
    "b2cCommand": "BusinessPayment",
    "remarks": "Escrow released for Retro Denim Jacket"
  }
}`}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: CBK REGULATIONS */}
        {activeTab === 'regulatory' && (
          <div className="space-y-6">
            <div className="p-5 bg-sky-50/50 border border-sky-100 rounded-2xl space-y-4">
              <h3 className="font-bold text-sky-950 flex items-center gap-1.5 text-xs">
                <FileCheck className="w-4 h-4 text-sky-600" /> Central Bank of Kenya PSP Trust Compliance Guidelines
              </h3>
              <p className="text-slate-700 leading-relaxed text-xs">
                Escrow fintechs in East Africa operate under tight CBK National Payment System (NPS) regulatory umbrellas. "Buy Safely" maintains compliance using strict technical guards:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-slate-600 leading-relaxed text-xs">
                <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trust Capital Separation
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Customer escrow balances must be deposited into distinct accounts with Tier-1 Kenyan banking trustees (e.g. NCBA or KCB). Operational fees (Ksh 20–50) are dynamically processed through different transaction IDs.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AML / KYC Compliance
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sellers must verify their identity using National ID or Business Registration records via Integrated Population Registration System (IPRS) bridges. All transactions over Ksh 100,000 require manual compliance approval.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Consumer Protection Guarantees
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Under the Consumer Protection Act of Kenya, the maximum delivery countdown period is hardcoded at 7 calendar days before automatic refund routines can be initiated.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Airtel Money / Multi-Tenant PSPs
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    The platform backend uses an abstraction layer for payment processing so that other networks like Airtel Money or T-Kash can be easily integrated using the same ledger structures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SCALING ROADMAP */}
        {activeTab === 'scaling' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <Milestone className="w-4 h-4 text-indigo-600" /> Multi-region African Scale-out Roadmap
              </h3>
              
              <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-4 font-sans text-xs">
                
                <div className="relative">
                  <span className="absolute left-[-31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[8px] text-white">1</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">Days 1 - 90: Kenyan Sandbox and MVP Release</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Establish high-speed M-Pesa Daraja STK webhook servers, local database infrastructure, clientless checkout links for Instagram, and a server-side Gemini prototype for Fargo and G4S courier validations.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-[-31px] top-0 w-4 h-4 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-[8px] text-white">2</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">Months 4 - 12: Pan-African Regional Rollout</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Integrate Airtel Money, MTN Mobile Money (Uganda, Rwanda, Ghana), and Safaricom M-Pesa (Tanzania). Scale out NestJS gateway nodes on Kubernetes with Postgres read replicas. Use Redis Bloom Filters to prevent code collision.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-[-31px] top-0 w-4 h-4 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-[8px] text-white">3</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">Months 13 - 24: Nigeria, West-African Banking and Enterprise SDKs</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Integrate with Paystack, Flutterwave, and instant bank transfers in Nigeria. Launch lightweight Android and iOS merchant helper SDKs. Build an analytics pipeline with Clickhouse to monitor risk trends and transaction velocities.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
