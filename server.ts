import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { Transaction, TransactionStatus, TimelineEvent, DeliveryPartner, DeliveryBid, VerifiedProduct } from './src/types';

dotenv.config();

const deliveryPartners: DeliveryPartner[] = [
  {
    id: 'DP-001',
    name: 'Rider John (Boda Dispatch)',
    phone: '254711223344',
    type: 'RIDER',
    avatar: '🏍️',
    nationalId: '32094182',
    isVerified: true,
    trustScore: 98,
    completedDeliveries: 342,
    disputeRate: 0.5,
    onTimeRate: 98,
    feedbackScore: 99,
    vehicleDetails: 'Bajaj Boxer KMDQ 102Z',
    drivingLicense: 'DL-9082AA',
    emergencyContact: 'Mother (254711000000)',
    availability: 'ONLINE',
    aiRiskScore: 2
  },
  {
    id: 'DP-002',
    name: 'Driver Mary (City Probox)',
    phone: '254722334455',
    type: 'DRIVER',
    avatar: '🚗',
    nationalId: '29871021',
    isVerified: true,
    trustScore: 96,
    completedDeliveries: 120,
    disputeRate: 1.2,
    onTimeRate: 94,
    feedbackScore: 95,
    vehicleDetails: 'Toyota Probox KCK 489Y',
    drivingLicense: 'DL-2184BC',
    emergencyContact: 'Husband (254722000000)',
    availability: 'ONLINE',
    aiRiskScore: 4
  },
  {
    id: 'DP-003',
    name: 'Picker Alex (Safety Inspector)',
    phone: '254733445566',
    type: 'PICKER',
    avatar: '🔍',
    nationalId: '30485912',
    isVerified: true,
    trustScore: 99,
    completedDeliveries: 88,
    disputeRate: 0.0,
    onTimeRate: 100,
    feedbackScore: 100,
    vehicleDetails: 'On-Foot (Nairobi Central Area / Westlands)',
    drivingLicense: 'N/A',
    emergencyContact: 'Sister (254733000000)',
    availability: 'ONLINE',
    aiRiskScore: 1
  },
  {
    id: 'DP-004',
    name: 'Fargo Courier Kenya',
    phone: '254722888888',
    type: 'COURIER',
    avatar: '🏢',
    isVerified: true,
    trustScore: 97,
    completedDeliveries: 4500,
    disputeRate: 0.2,
    onTimeRate: 97,
    feedbackScore: 96,
    availability: 'ONLINE',
    aiRiskScore: 2
  },
  {
    id: 'DP-005',
    name: 'Wells Fargo Express Ltd',
    phone: '254711999999',
    type: 'COURIER',
    avatar: '🏢',
    isVerified: true,
    trustScore: 99,
    completedDeliveries: 8200,
    disputeRate: 0.1,
    onTimeRate: 99,
    feedbackScore: 98,
    availability: 'ONLINE',
    aiRiskScore: 1
  }
];

const verifiedProducts: VerifiedProduct[] = [
  {
    id: 'PROD-7102',
    title: 'Toyota Probox KCK 489Y (White Edition, 1.5L Engine)',
    category: 'Vehicles & Motors',
    price: 840000,
    description: 'Extremely fuel-efficient Toyota Probox, 1.5L active engine, genuine white paint with robust suspensions. Regularly serviced and used for Nairobi light deliveries. Pre-sale certified and odometer physically verified.',
    sellerHandle: '@probox_deals_kenya',
    sellerPhone: '254711223344',
    verificationStatus: 'VERIFIED',
    verificationTier: 'PREMIUM',
    verificationFee: 1500,
    auditorId: 'DP-003',
    auditorName: 'Picker Alex (Safety Inspector)',
    verificationReport: {
      productName: 'Toyota Probox KCK 489Y',
      category: 'Vehicles & Motors',
      sellerId: 'USR-802',
      condition: 'Excellent',
      functionalPass: true,
      serialNumber: 'NCP51-018249',
      notes: 'Odometer matches digital dashboard reports. Frame inspected for previous repair welds or structural damage—none found. Engine idling is steady and gear shifts are seamless.',
      outcome: 'Verified',
      submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    verifiedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString(), // Vehicles valid for 14 days
    bulkPlanSubscribed: 'NONE',
    isFeatured: true
  },
  {
    id: 'PROD-2900',
    title: 'Apple iPhone 15 Pro Max (Titanium Blue, 512GB)',
    category: 'Electronics & Gadgets',
    price: 142000,
    description: 'Perfect original iPhone 15 Pro Max with 96% battery health. Blue Titanium texture, fully unlocked, no iCloud lock. Tested facial ID and speaker grilles.',
    sellerHandle: '@apple_resellers_ke',
    sellerPhone: '254798765432',
    verificationStatus: 'VERIFIED',
    verificationTier: 'STANDARD',
    verificationFee: 450,
    auditorId: 'DP-003',
    auditorName: 'Picker Alex (Safety Inspector)',
    verificationReport: {
      productName: 'Apple iPhone 15 Pro Max',
      category: 'Electronics & Gadgets',
      sellerId: 'USR-104',
      condition: 'Good',
      functionalPass: true,
      serialNumber: 'C39DK0L8Q5',
      notes: 'No scratches on the front display or rear frosted glass. Camera focal lenses and speaker output tested at 100% capacity. Charging port operates without loose contact.',
      outcome: 'Verified',
      submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    verifiedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(), // Electronics valid for 30 days
    bulkPlanSubscribed: 'BASIC',
    isFeatured: true
  },
  {
    id: 'PROD-3891',
    title: 'Sany Heavy Duty Excavator SY215C (Excellent Technical Grade)',
    category: 'Machinery & Tools',
    price: 6800000,
    description: 'Heavy duty commercial crawler excavator. Features powerful Sany mechanical arm, hydraulic seal kit with high operational pressure, and high-performance diesel engine. Perfect for commercial construction sites.',
    sellerHandle: '@machinery_solutions_east_africa',
    sellerPhone: '254711999999',
    verificationStatus: 'UNVERIFIED',
    bulkPlanSubscribed: 'NONE',
    isFeatured: false
  },
  {
    id: 'PROD-9031',
    title: 'Premium Chesterfield L-Shaped Executive Leather Sofa',
    category: 'Furniture & Living',
    price: 185000,
    description: 'Beautiful full grain mahogany leather Chesterfield sectional sofa. Handcrafted with heavy deep tufting, brass nailhead trims, and high-density foam padding. Extremely luxurious furniture for upscale lounges.',
    sellerHandle: '@chesterfield_furnitures_nairobi',
    sellerPhone: '254722334455',
    verificationStatus: 'VERIFIED',
    verificationTier: 'PRIORITY',
    verificationFee: 800,
    auditorId: 'DP-003',
    auditorName: 'Picker Alex (Safety Inspector)',
    verificationReport: {
      productName: 'Chesterfield L-Shaped Sofa',
      category: 'Furniture & Living',
      sellerId: 'USR-209',
      condition: 'Excellent',
      functionalPass: true,
      serialNumber: 'CHEST-8942-A',
      notes: 'Inspected frame density—constructed with high-grade cured cypress and mahogany feet. Upholstery is genuine top grain leather, smells fresh, no standard synthetic tears or loose tufts.',
      outcome: 'Verified',
      submittedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
    },
    verifiedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 48 * 24 * 3600 * 1000).toISOString(), // Furniture valid for 60 days
    bulkPlanSubscribed: 'GROWTH',
    isFeatured: true
  }
];


const app = express();
const PORT = 3000;

// Set high limits for base64 image uploads (screenshots)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Lazy initializer for Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('GEMINI_API_KEY is not configured or uses placeholder. Real-time AI proof validation will run in high-fidelity sandbox mode.');
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log('Gemini client initialized successfully with User-Agent: aistudio-build');
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client:', e);
      return null;
    }
  }
  return aiClient;
}

// Global server state representing the "Buy Safely" transaction & ledger database
const transactions: Transaction[] = [
  {
    id: 'BS-KSH-8942',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    buyerPhone: '254712345678',
    buyerEmail: 'kamau.buyer@gmail.com',
    sellerPhone: '254798765432',
    sellerHandle: '@trendy_thrifts_ke',
    socialPlatform: 'Instagram',
    amount: 4500,
    fee: 40,
    platformFee: 12,
    description: 'Vintage Retro Denim Jacket (Large, Excellent Condition)',
    status: 'ESCROW_HELD',
    countdownHours: 43,
    riskScore: 12,
    buyerTrustScore: 94,
    sellerTrustScore: 91,
    shippingMethod: 'Courier',
    shippingFee: 220,
    totalAmount: 4772, // 4500 + 220 + 40 + 12
    deliveryPin: '392014',
    deliveryPinEntered: false,
    deliveryStatus: 'PICKUP_REQUESTED',
    escrowModel: 'model_1',
    deliveryBids: [
      {
        id: 'BID-1001',
        partnerId: 'DP-001',
        partnerName: 'Rider John (Boda Dispatch)',
        partnerType: 'RIDER',
        bidAmount: 220,
        estimatedHours: 1,
        trustScore: 98,
        deliveryCount: 342
      },
      {
        id: 'BID-1002',
        partnerId: 'DP-002',
        partnerName: 'Driver Mary (City Probox)',
        partnerType: 'DRIVER',
        bidAmount: 380,
        estimatedHours: 3,
        trustScore: 96,
        deliveryCount: 120
      },
      {
        id: 'BID-1003',
        partnerId: 'DP-003',
        partnerName: 'Picker Alex (Safety Inspector)',
        partnerType: 'PICKER',
        bidAmount: 300,
        estimatedHours: 2,
        trustScore: 99,
        deliveryCount: 88
      }
    ],
    securityScorecard: {
      velocityLimitPassed: true,
      deviceFingerprintScore: 96,
      simSwapRisk: 'LOW',
      ipLocationMatch: true,
      overallRisk: 8,
    },
    history: [
      {
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'PENDING_DEPOSIT',
        title: 'Transaction Generated via Instagram Link',
        description: 'Lightweight order link accessed from Nairobi, Kenya.',
        actor: 'BUYER',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 4.9).toISOString(),
        status: 'ESCROW_HELD',
        title: 'M-Pesa STK Push Deposit Locked',
        description: 'Simulated M-Pesa receipt #SH89CBA094 transaction matching Ksh 4,540 successfully added to secure ledger wallet.',
        actor: 'SYSTEM',
      },
    ],
  },
  {
    id: 'BS-KSH-1029',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    buyerPhone: '254722334455',
    buyerEmail: 'sarah_w@outlook.com',
    sellerPhone: '254700112233',
    sellerHandle: '@nairobi_gadget_hub',
    socialPlatform: 'WhatsApp',
    amount: 18500,
    fee: 50,
    platformFee: 12,
    description: 'Sony WH-1000XM4 Noise Canceling Headphones',
    status: 'ITEMS_SHIPPED',
    countdownHours: 23,
    riskScore: 35,
    buyerTrustScore: 89,
    sellerTrustScore: 98,
    shippingMethod: 'Courier',
    shippingFee: 300,
    totalAmount: 18862, // 18500 + 300 + 50 + 12
    deliveryPin: '824761',
    deliveryPinEntered: false,
    deliveryStatus: 'IN_TRANSIT',
    deliveryPartnerId: 'DP-004',
    deliveryPartnerName: 'Fargo Courier Kenya',
    deliveryPartnerType: 'COURIER',
    escrowModel: 'model_1',
    shippingProofUrl: 'fargo_express_receipt_892.png',
    receiptAnalysis: {
      verified: true,
      confidence: 88,
      extractedMpesaCode: 'SD91EKE183',
      extractedCarrier: 'Fargo Courier',
      merchantName: '@nairobi_gadget_hub',
      detectedText: 'DISPATCHED RECIEPT - FARGO COURIER KENYA - SHIPMENT #FAR-NBI-3921. RECIPIENT: SARAH W. DECLARED VALUE: 18,500 KSH',
      flaggedAnomalies: [],
      fraudScore: 5,
    },
    securityScorecard: {
      velocityLimitPassed: true,
      deviceFingerprintScore: 92,
      simSwapRisk: 'LOW',
      ipLocationMatch: true,
      overallRisk: 15,
    },
    history: [
      {
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'PENDING_DEPOSIT',
        title: 'Social escrow contract created',
        description: 'Created reference order for headphones.',
        actor: 'SELLER',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 23.8).toISOString(),
        status: 'ESCROW_HELD',
        title: 'M-Pesa Funds Held',
        description: 'M-Pesa prompt confirmed. Ksh 18,550 secured in lockbox.',
        actor: 'BUYER',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: 'ITEMS_SHIPPED',
        title: 'Courier Shipment Uploaded',
        description: 'Fargo Courier receipt uploaded. System ran preliminary optical character check and confirmed active dispatch track.',
        actor: 'SELLER',
      },
    ],
  },
  {
    id: 'BS-KSH-4109',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    buyerPhone: '254733445566',
    buyerEmail: 'njeri.j@gmail.com',
    sellerPhone: '254701201201',
    sellerHandle: '@glow_skincare_hub',
    socialPlatform: 'TikTok',
    amount: 3200,
    fee: 40,
    platformFee: 12,
    description: 'Korean Skincare Glass Skin Bundle (Kose, COSRX, Centella)',
    status: 'FUNDS_RELEASED',
    countdownHours: 0,
    riskScore: 8,
    buyerTrustScore: 99,
    sellerTrustScore: 95,
    totalAmount: 3252, // 3200 + 40 + 12
    securityScorecard: {
      velocityLimitPassed: true,
      deviceFingerprintScore: 98,
      simSwapRisk: 'LOW',
      ipLocationMatch: true,
      overallRisk: 4,
    },
    history: [
      {
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        status: 'PENDING_DEPOSIT',
        title: 'Link built on TikTok Checkout',
        description: 'Order started.',
        actor: 'BUYER',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 47.9).toISOString(),
        status: 'ESCROW_HELD',
        title: 'STK Push Completed',
        description: 'Funds secured.',
        actor: 'BUYER',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        status: 'ITEMS_SHIPPED',
        title: 'Boda Delivery Dispatched',
        description: 'Delivered via Bolt Boda.',
        actor: 'SELLER',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'FUNDS_RELEASED',
        title: 'Fulfillment Acknowledged & Released',
        description: 'Buyer tapped "Accept & Confirm Arrival". Escrow ledger settled to Seller wallet. Ksh 3,200 credited.',
        actor: 'BUYER',
      },
    ],
  },
  {
    id: 'BS-KSH-9150',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(), // 5 days ago
    buyerPhone: '254799001122',
    buyerEmail: 'peter.odhiambo@outlook.com',
    sellerPhone: '254711998877',
    sellerHandle: '@scam_kicks_nairobi',
    socialPlatform: 'Facebook',
    amount: 11000,
    fee: 45,
    platformFee: 12,
    description: 'Air Jordan 1 High OG (Deadstock Edition)',
    status: 'DISPUTED',
    countdownHours: 0,
    riskScore: 78,
    buyerTrustScore: 82,
    sellerTrustScore: 42,
    totalAmount: 11057, // 11000 + 45 + 12
    securityScorecard: {
      velocityLimitPassed: false,
      deviceFingerprintScore: 45,
      simSwapRisk: 'HIGH',
      ipLocationMatch: false,
      overallRisk: 84,
    },
    history: [
      {
        timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
        status: 'PENDING_DEPOSIT',
        title: 'FB Marketplace Order Created',
        description: 'High risk flags elevated on Seller: multiple device fingerprints associated with suspended handles.',
        actor: 'SYSTEM',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 119.5).toISOString(),
        status: 'ESCROW_HELD',
        title: 'M-Pesa Funds Held',
        description: 'Ksh 11,045 held. Security warning triggered to Buyer advising that Seller rating is low.',
        actor: 'SYSTEM',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
        status: 'ITEMS_SHIPPED',
        title: 'Proof Uploaded (Flagged by AI)',
        description: 'Seller uploaded high-compression screenshot of a WhatsApp conversation. AI analyzer flagged as "Likely forged: Text alignment discrepancies at timestamp."',
        actor: 'SELLER',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        status: 'DISPUTED',
        title: 'Dispute Lodged by Buyer',
        description: 'Buyer claims product delivered was a low-quality counterfeit variant from Gikomba market rather than genuine deadstock. Escrow frozen.',
        actor: 'BUYER',
      },
    ],
  },
];

// Helper to update global wallet summaries
function calculateLedgerSummary() {
  let held = 0;
  let fees = 0;
  let settled = 0;
  transactions.forEach((tx) => {
    if (tx.status === 'ESCROW_HELD' || tx.status === 'ITEMS_SHIPPED' || tx.status === 'DISPUTED') {
      held += tx.amount;
    }
    if (tx.status !== 'PENDING_DEPOSIT') {
      fees += tx.fee + (tx.platformFee || 12);
    }
    if (tx.status === 'FUNDS_RELEASED') {
      settled += tx.amount;
    }
  });
  return {
    currency: 'Ksh' as const,
    totalEscrowHeld: held,
    totalFeesCollected: fees,
    totalSettled: settled,
    reservePool: Math.floor(fees * 0.15), // 15% system reserve pool
  };
}

// -------------------------------------------------------------
// INTERNAL PORTAL STATE DATABASES & REPOSITORIES (In-Memory Audit Ledger)
// -------------------------------------------------------------
interface PlatformNotification {
  id: string;
  timestamp: string;
  recipientRole: string; // 'SELLER' | 'COURIER' | 'PICKER' | 'CRM' | 'FINANCE' | 'SYSTEM_ADMIN' | 'BI' | 'SUPERVISOR' | 'CHIEF_OPERATING_OFFICER' | 'STAFF'
  category: 'INFO' | 'ACTION_REQUIRED' | 'ESCALATION' | 'CRITICAL';
  title: string;
  message: string;
  isRead: boolean;
  linkToTab?: string;
  recordId?: string;
}

interface SimulatedSMS {
  id: string;
  timestamp: string;
  to: string;
  message: string;
  category: 'BUYER_TRANSACTION' | 'CRITICAL_SECURITY' | 'MFA_VERIFICATION' | 'DISASTER_RECOVERY';
}

const platformNotifications: PlatformNotification[] = [
  {
    id: 'NOTIF-001',
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    recipientRole: 'SYSTEM_ADMIN',
    category: 'CRITICAL',
    title: 'Failover: Africa\'s Talking Fiber Cut',
    message: 'Primary Africa\'s Talking gateway experienced fiber line cut. System auto-routed 42,000 pending transactions to Safaricom direct bulk terminal. Delivery rate is steady at 99.8%. No SMS outage reported.',
    isRead: false,
    linkToTab: 'ops'
  },
  {
    id: 'NOTIF-002',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    recipientRole: 'FINANCE',
    category: 'INFO',
    title: 'STK Settlement Batch Reconciled',
    message: 'Daily Safaricom STK Push webhook positions (Ksh 1,420,500) successfully reconciled with NCBA Trust custody account. Variance auto-settled within 0.00% clearance margin.',
    isRead: false,
    linkToTab: 'ops'
  },
  {
    id: 'NOTIF-003',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    recipientRole: 'PICKER',
    category: 'ACTION_REQUIRED',
    title: 'New Cargo Verification Assigned',
    message: 'Verification request scheduled for Apple iPhone 15 Pro Max (PROD-2900). Please complete physical inspection report checklist.',
    isRead: false,
    linkToTab: 'logistics'
  },
  {
    id: 'NOTIF-004',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    recipientRole: 'CRM',
    category: 'ESCALATION',
    title: 'Dispute SLA Threshold Alert',
    message: 'Dispute case BS-KSH-8942 has been under investigation for 20 hours. Nearing 24-hour SLA alert threshold. System has auto-escalated file to Supervisor David Chemosit.',
    isRead: true,
    linkToTab: 'ops'
  },
  {
    id: 'NOTIF-005',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    recipientRole: 'SELLER',
    category: 'INFO',
    title: 'Product Verification Approved',
    message: 'Cargo report submitted by Picker Alex has passed with 99.0% trust score. Product PROD-7102 is now designated with Verified Trust badge.',
    isRead: true,
    linkToTab: 'vault'
  }
];

const simulatedSMS: SimulatedSMS[] = [
  {
    id: 'SMS-001',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    to: '+254711000222 (Buyer Guest)',
    message: 'Your Safe Buy payment has been secured in escrow for transaction TX-8042. Safe Buy confirmation PIN is 824961.',
    category: 'BUYER_TRANSACTION'
  },
  {
    id: 'SMS-002',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    to: '+254712431052 (Buyer Guest)',
    message: 'Safaricom Direct: Your OTP code for multi-factor login verification is 492084. Expires in 5 minutes.',
    category: 'MFA_VERIFICATION'
  },
  {
    id: 'SMS-003',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    to: '+254722334455 (Staff Admin)',
    message: 'CRITICAL SECURITY: Attempted unauthorized login flagged bypass on SysAdmin terminal L4 (IP: 196.201.214.52). Account locked pending biometric review.',
    category: 'CRITICAL_SECURITY'
  }
];

function addSimulatedNotification(recipientRole: string, category: 'INFO' | 'ACTION_REQUIRED' | 'ESCALATION' | 'CRITICAL', title: string, message: string, linkToTab?: string, recordId?: string) {
  const newNotif: PlatformNotification = {
    id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    recipientRole,
    category,
    title,
    message,
    isRead: false,
    linkToTab,
    recordId
  };
  platformNotifications.unshift(newNotif);
  return newNotif;
}

function addSimulatedSMS(to: string, message: string, category: 'BUYER_TRANSACTION' | 'CRITICAL_SECURITY' | 'MFA_VERIFICATION' | 'DISASTER_RECOVERY' = 'BUYER_TRANSACTION') {
  const newSms: SimulatedSMS = {
    id: `SMS-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    to,
    message,
    category
  };
  simulatedSMS.unshift(newSms);
  return newSms;
}

const adminLogs: any[] = [
  {
    id: 'LOG-309104',
    user: 'COO Silas',
    role: 'CHIEF_OPERATING_OFFICER',
    action: 'Executive clearance: Approved manual override for escrow payout dispatch release',
    date: '10/06/2026',
    time: '14:25:01',
    previousValue: 'Status: ESCROW_HELD (Pending Inspection confirmation)',
    newValue: 'Status: FUNDS_RELEASED (Bypassed with biometric supervisor token)'
  },
  {
    id: 'LOG-309103',
    user: 'Finance Analyst Peter',
    role: 'FINANCE_OFFICER',
    action: 'Executed automated escrow settlement distribution shares for Courier Express Rider Kenya',
    date: '10/06/2026',
    time: '13:10:45',
    previousValue: 'Gross: Ksh 300, Courier Net: Not Computed',
    newValue: 'Courier net: Ksh 255 | Buy Safely Referral Commission: Ksh 30 | PSP Settlement Cost: Ksh 15 (Audited)'
  },
  {
    id: 'LOG-309102',
    user: 'CRM Supervisor David',
    role: 'CRM_SUPERVISOR',
    action: 'Escalated disputed transaction BS-KSH-8942 to Field Ops for physical inspection',
    date: '10/06/2026',
    time: '11:05:12',
    previousValue: 'Status: DISPUTED (Pending Support Queue)',
    newValue: 'Status: ESCALATED_TO_FIELD (Under active physical inspection assignment)'
  },
  {
    id: 'LOG-309101',
    user: 'System Admin Alex',
    role: 'SYSTEM_ADMIN',
    action: 'Applied security hardening patches on escrow vault database rulesets',
    date: '10/06/2026',
    time: '09:00:24',
    previousValue: 'Auth Access rules v1.2',
    newValue: 'Auth Access rules v1.3 (Strict compartmentalization of role scopes)'
  },
  {
    id: 'LOG-309100',
    user: 'BI Analyst Mary',
    role: 'BI_ANALYST',
    action: 'Calculated and exported monthly fraud trend analytics dashboard to COO',
    date: '09/06/2026',
    time: '17:40:55',
    previousValue: 'KPI Draft',
    newValue: 'Report Published'
  }
];

const crmTickets: any[] = [
  {
    id: 'CRM-101',
    customer: 'Kamau Njoroge',
    category: 'Recipient Dispatch OTP Check',
    urgency: 'High',
    status: 'NEW',
    assignedTo: 'Mike Otieno',
    message: 'Recipient received item but states that the Safaricom SMS containing the OTP PIN was blocked by spam filter. Needs supervisor manual validation pin check.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    amount: 3500,
    transactionId: 'BS-KSH-8942',
    attachments: ['chat_log_kamau.pdf', 'delivery_proof_boda.jpg'],
    communications: [
      { sender: 'System Intake', role: 'SYSTEM', text: 'Queue auto-dispatch assigned case to CRM Agent Mike Otieno.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
    ],
    history: [
      { user: 'System Ingest', role: 'SYSTEM', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), previousStatus: 'NONE', newStatus: 'NEW', notes: 'disputed escrow ticket filed.' }
    ],
    report: {
      caseSummary: '',
      partiesInvolved: { buyer: 'Kamau Njoroge', seller: 'Jumia Vendor West', courier: 'Rider Joseph', picker: 'N/A' },
      evidenceReviewed: [],
      findings: '',
      recommendation: ''
    },
    decision: { outcome: '', justification: '', financialAction: '' }
  },
  {
    id: 'CRM-102',
    customer: 'Mercy Kiende',
    category: 'Escrow Reserve Release Delay',
    urgency: 'Medium',
    status: 'UNDER_REVIEW',
    assignedTo: 'Mike Otieno',
    message: 'Seller requesting payout release. Courier express dispatch shows item delivered 4 hours ago, but status in portal did not auto-transition to CONFIRMED.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    amount: 15000,
    transactionId: 'BS-KSH-4712',
    attachments: ['delivery_receipt_fargo.pdf'],
    communications: [
      { sender: 'System Intake', role: 'SYSTEM', text: 'Queue auto-dispatch assigned case to CRM Agent Mike Otieno.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
      { sender: 'Mike Otieno', role: 'CRM_AGENT', text: 'Initiated investigation. Reviewing Fargo courier tracking ledger.', timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString() }
    ],
    history: [
      { user: 'System Ingest', role: 'SYSTEM', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), previousStatus: 'NONE', newStatus: 'NEW', notes: 'disputed escrow ticket filed.' },
      { user: 'Mike Otieno', role: 'CRM_AGENT', timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(), previousStatus: 'NEW', newStatus: 'UNDER_REVIEW', notes: 'Assigned and initiated manual review.' }
    ],
    report: {
      caseSummary: 'Buyer Mercy Kiende claims courier delivered goods but system status is stuck in ITEMS_SHIPPED.',
      partiesInvolved: { buyer: 'Mercy Kiende', seller: 'Soni Traders Kenya', courier: 'Fargo Courier Ltd', picker: 'N/A' },
      evidenceReviewed: ['Delivery proof'],
      findings: 'Fargo invoice tracking reference #FRG-9842 verified completed on courier portal.',
      recommendation: 'Release Funds to Seller'
    },
    decision: { outcome: '', justification: '', financialAction: '' }
  },
  {
    id: 'CRM-104',
    customer: 'Antony Onyango',
    category: 'Fraudulent Till link Reported',
    urgency: 'Critical',
    status: 'AWAITING_SUPERVISOR_REVIEW',
    assignedTo: 'David Chemosit',
    message: 'Report of instagram seller attempting to forge CBK Buy Safely badge link details with spoofed payment credentials.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    amount: 25000,
    transactionId: 'BS-KSH-5921',
    attachments: ['screenshot_insta_till.png'],
    communications: [
      { sender: 'Mike Otieno', role: 'CRM_AGENT', text: 'Completed investigations. Discovered high likeness of spoof credentials. Demands full escrow refund and blacklist.', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() }
    ],
    history: [
      { user: 'System Ingest', role: 'SYSTEM', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), previousStatus: 'NONE', newStatus: 'NEW', notes: 'High alert dispute received.' },
      { user: 'Mike Otieno', role: 'CRM_AGENT', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), previousStatus: 'NEW', newStatus: 'AWAITING_SUPERVISOR_REVIEW', notes: 'Completed report. Escalated to supervisor due to high-value escrow.' }
    ],
    report: {
      caseSummary: 'Suspected spoofing of CBK badge ID links by merchant handle @trendy_vibes_ke.',
      partiesInvolved: { buyer: 'Antony Onyango', seller: 'Suspect @trendy_vibes_ke', courier: 'N/A', picker: 'N/A' },
      evidenceReviewed: ['Chat records', 'Escrow logs'],
      findings: 'Checked backend payload of merchant till, found mismatch with Safaricom Daraja registered credentials.',
      recommendation: 'Refund Buyer'
    },
    decision: { outcome: '', justification: '', financialAction: '' }
  },
  {
    id: 'CRM-105',
    customer: 'Phyllis Wambui',
    category: 'Damaged Goods Dispute',
    urgency: 'High',
    status: 'CLOSED',
    assignedTo: 'David Chemosit',
    originalDecisionBy: 'David Chemosit',
    message: 'Buyer claims laptop arrived with broken screen. Seller states item was pristine when handed to courier. Picker checked but did not note package integrity.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    amount: 45000,
    transactionId: 'BS-KSH-1102',
    attachments: ['broken_screen_photo.jpg', 'picker_initial_check.pdf'],
    communications: [
      { sender: 'David Chemosit', role: 'CRM_SUPERVISOR', text: 'Escrow release modified. Partial refund approved.', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() }
    ],
    history: [
      { user: 'David Chemosit', role: 'CRM_SUPERVISOR', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), previousStatus: 'SUPERVISOR_DECISION_PENDING', newStatus: 'CLOSED', notes: 'Completed dispute and closed ticket. Split 50/50 escrow settled.' }
    ],
    report: {
      caseSummary: 'Laptop screen damaged during express transit. Liability unclear.',
      partiesInvolved: { buyer: 'Phyllis Wambui', seller: 'Bargain Laptops Ltd', courier: 'Rider Charles', picker: 'Picker Silas' },
      evidenceReviewed: ['Photos', 'Inspection reports'],
      findings: 'Rider admitted package fell off tail-rack. Packaging was insufficient.',
      recommendation: 'Partial Refund'
    },
    decision: {
      outcome: 'Modify Recommendation',
      justification: 'Adjusted to 50/50 split. Courier is penalised of shipping fee and remainder split.',
      financialAction: 'Split Settlement',
      decidedBy: 'David Chemosit',
      decidedRole: 'CRM_SUPERVISOR',
      decidedAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  }
];

const fieldAssignments: any[] = [
  {
    id: 'FLD-201',
    merchantName: 'Nairobi Thrift Outlet',
    location: 'Luthuli Avenue, Electronic Center Room 4B',
    task: 'Merchant Verification',
    status: 'NEW_ASSIGNMENT',
    assignedBy: 'John Kamau',
    assignedTo: 'Ken Bwire',
    reportDetails: 'Pending dispatch out-call.',
    assignmentType: 'Merchant Verification',
    dateAssigned: new Date(Date.now() - 3600000 * 48).toISOString(),
    chargeAmount: 2500,
    chargeStatus: 'UNPAID',
    visitDate: '',
    visitTime: '',
    gpsCoordinates: '',
    contactPerson: 'Abdi Ibrahim (Manager)',
    partiesInterviewed: { merchant: false, buyer: false, courier: false, witness: false },
    evidenceUploaded: { photos: [], videos: [], documents: [], audioNotes: [] },
    findings: '',
    riskAssessment: 'Low Risk',
    recommendation: 'Approve Merchant',
    history: [
      { timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), user: 'System Auto-Ingest', action: 'ASSIGNED', prevStatus: 'NONE', newStatus: 'NEW_ASSIGNMENT', notes: 'Merchant verification file registered. Generated Verification Invoice Ksh 2,500.' }
    ]
  },
  {
    id: 'FLD-202',
    merchantName: 'Kenyan Vintage Sellers',
    location: 'Westlands, Woodvale Grove Block A',
    task: 'Merchant Verification',
    status: 'APPROVED',
    assignedBy: 'John Kamau',
    assignedTo: 'Kiprop Rono',
    reportDetails: 'Inspected premises and certified serial number matching and owner identity. Safe to proceed as trusted seller status.',
    assignmentType: 'Merchant Verification',
    dateAssigned: new Date(Date.now() - 3600000 * 96).toISOString(),
    chargeAmount: 2500,
    chargeStatus: 'PAID',
    visitDate: '2026-06-10',
    visitTime: '11:30',
    gpsCoordinates: '1.2625 S, 36.8042 E',
    contactPerson: 'Jane Wafula',
    partiesInterviewed: { merchant: true, buyer: false, courier: false, witness: true },
    evidenceUploaded: {
      photos: ['https://images.unsplash.com/photo-1578575437130-527eed3abbec'],
      videos: [],
      documents: ['Business_Permit_NBO_2026.pdf'],
      audioNotes: []
    },
    findings: 'Premises is fully staffed. Verified physical stock inventory of over 42 vintage leather items. Verified physical ownership matches Safaricom till certificate.',
    riskAssessment: 'Low Risk',
    recommendation: 'Approve Merchant',
    decidedBy: 'Silas Mugo',
    decidedRole: 'CHIEF_OPERATING_OFFICER',
    decidedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    badgeIssued: 'VERIFIED MERCHANT',
    history: [
      { timestamp: new Date(Date.now() - 3600000 * 96).toISOString(), user: 'System Auto-Ingest', action: 'ASSIGNED', prevStatus: 'NONE', newStatus: 'NEW_ASSIGNMENT', notes: 'Merchant verification file registered. Generated Verification Invoice Ksh 2,500.' },
      { timestamp: new Date(Date.now() - 3600000 * 90).toISOString(), user: 'Kenyan Vintage Sellers', action: 'PAYMENT_RECEIVED', prevStatus: 'NEW_ASSIGNMENT', newStatus: 'NEW_ASSIGNMENT', notes: 'Invoice fully settled via M-Pesa Daraja Webhook ID #MP98421.' },
      { timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), user: 'Kiprop Rono', action: 'START_REVIEW', prevStatus: 'NEW_ASSIGNMENT', newStatus: 'CASE_REVIEW', notes: 'Reviewing historical activity and merchant credentials.' },
      { timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), user: 'Kiprop Rono', action: 'SCHEDULE_VISIT', prevStatus: 'CASE_REVIEW', newStatus: 'INVESTIGATION_SCHEDULED', notes: 'Scheduled site visit with Jane Wafula.' },
      { timestamp: new Date(Date.now() - 3600000 * 30).toISOString(), user: 'Kiprop Rono', action: 'LOG_ARRIVAL', prevStatus: 'INVESTIGATION_SCHEDULED', newStatus: 'IN_FIELD', notes: 'Arrived on location. Capturing GPS coordinates and telemetry.' },
      { timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), user: 'Kiprop Rono', action: 'SUBMIT_REPORT', prevStatus: 'IN_FIELD', newStatus: 'REPORT_SUBMITTED', notes: 'Mandatory report submitted to supervisor. Recommended Approval.' },
      { timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), user: 'Silas Mugo', action: 'APPROVED', prevStatus: 'REPORT_SUBMITTED', newStatus: 'APPROVED', notes: 'All findings verified. Issuing VERIFIED MERCHANT badge!' }
    ]
  },
  {
    id: 'FLD-203',
    merchantName: 'Mara Safari Gear',
    location: 'Nairobi CBD, River Road Block B',
    task: 'Dispute Investigation',
    status: 'IN_FIELD',
    assignedBy: 'John Kamau',
    assignedTo: 'Ken Bwire',
    reportDetails: 'Disputed delivery investigation dispatched.',
    assignmentType: 'Dispute Investigation',
    dateAssigned: new Date(Date.now() - 3600000 * 12).toISOString(),
    chargeAmount: 0,
    chargeStatus: 'PAID',
    visitDate: '2026-06-11',
    visitTime: '09:00',
    gpsCoordinates: '1.2842 S, 36.8251 E',
    contactPerson: 'David Mutua',
    partiesInterviewed: { merchant: true, buyer: false, courier: true, witness: false },
    evidenceUploaded: { photos: [], videos: [], documents: [], audioNotes: [] },
    findings: '',
    riskAssessment: 'Medium Risk',
    recommendation: 'Release Escrow',
    history: [
      { timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), user: 'CRM Department', action: 'ASSIGNED', prevStatus: 'NONE', newStatus: 'NEW_ASSIGNMENT', notes: 'Disputed delivery investigation dispatched.' },
      { timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), user: 'Ken Bwire', action: 'START_REVIEW', prevStatus: 'NEW_ASSIGNMENT', newStatus: 'CASE_REVIEW', notes: 'Reviewing transaction parameters.' },
      { timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), user: 'Ken Bwire', action: 'SCHEDULE_VISIT', prevStatus: 'CASE_REVIEW', newStatus: 'INVESTIGATION_SCHEDULED', notes: 'Scheduled meeting.' },
      { timestamp: new Date().toISOString(), user: 'Ken Bwire', action: 'LOG_ARRIVAL', prevStatus: 'INVESTIGATION_SCHEDULED', newStatus: 'IN_FIELD', notes: 'Arrived at site.' }
    ]
  }
];

const hrStaffDirectory: any[] = [
  { 
    id: 'STF-01', name: 'Mike Otieno', role: 'CRM Agent', department: 'CRM', roleKey: 'CRM_AGENT', email: 'mike.ot@buysafely.africa', performanceRating: 4.8,
    dob: '1995-04-12', joinDate: '2022-03-01', contractType: 'Permanent', certifications: ['CRM Specialist Tier-2', 'Conflict De-escalation'],
    trainingCompleted: [
      { name: 'Mandatory Securities & Escrow Compliance', completedAt: '2025-01-10', expiryDate: '2026-01-10' },
      { name: 'Customer Anti-Fraud Screening', completedAt: '2025-02-15' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 92, evaluation: 'Exceeds Expectations', managerRemarks: 'Great resolution speed on ticket dispute boards.' }
    ],
    rewardsHistory: [
      { awardDate: '2025-11-30', title: 'Spot Award for Excellent Dispute Mediation', bonusAmount: 1500, justification: 'Mediated a complex Ksh 45,000 variance amicably.' }
    ]
  },
  { 
    id: 'STF-02', name: 'Sarah Mwangi', role: 'CRM Manager', department: 'CRM', roleKey: 'CRM_MANAGER', email: 'sarah.mw@buysafely.africa', performanceRating: 4.9,
    dob: '1989-08-22', joinDate: '2021-06-15', contractType: 'Permanent', certifications: ['ITIL v4 Expert', 'SAFe Product Owner'],
    trainingCompleted: [
      { name: 'Mandatory Securities & Escrow Compliance', completedAt: '2025-01-10', expiryDate: '2026-01-10' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 97, evaluation: 'Outstanding', managerRemarks: 'Outstanding operational leadership on dispute management pipelines.' }
    ],
    rewardsHistory: [
      { awardDate: '2025-12-15', title: 'Manager Performance Bonus', bonusAmount: 12000, justification: 'Achieved 98% SLA adherence across CRM department.' }
    ]
  },
  { 
    id: 'STF-03', name: 'David Chemosit', role: 'CRM Supervisor', department: 'CRM', roleKey: 'CRM_SUPERVISOR', email: 'david.ch@buysafely.africa', performanceRating: 4.9,
    dob: '1992-11-05', joinDate: '2022-09-01', contractType: 'Permanent', certifications: ['Customer Experience Leader'],
    trainingCompleted: [
      { name: 'Mandatory Securities & Escrow Compliance', completedAt: '2025-01-10', expiryDate: '2026-01-10' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 94, evaluation: 'Exceeds Expectations', managerRemarks: 'Handles complex merchant escalations with diligence.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-04', name: 'Ken Bwire', role: 'Field Agent', department: 'Field Operations', roleKey: 'FIELD_AGENT', email: 'ken.bw@buysafely.africa', performanceRating: 4.6,
    dob: '1996-01-30', joinDate: '2023-01-15', contractType: 'Contract', certifications: ['Motorcycle Safety Compliance'],
    trainingCompleted: [
      { name: 'Field Operational Safety & Verification', completedAt: '2025-03-01', expiryDate: '2026-03-01' }
    ],
    disciplinaryRecords: [
      { id: 'DIS-001', incidentDate: '2025-05-10', description: 'Brief delay in submitting product inspection files', status: 'Closure', outcome: 'Warning', notes: 'Diligence improved after visual warning.' }
    ],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 84, evaluation: 'Meets Expectations', managerRemarks: 'Solid physical inspections completed; needs to speed up report logging.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-05', name: 'Kiprop Rono', role: 'Senior Field Agent', department: 'Field Operations', roleKey: 'SENIOR_FIELD_AGENT', email: 'kiprop.ro@buysafely.africa', performanceRating: 4.8,
    dob: '1991-03-24', joinDate: '2022-05-10', contractType: 'Permanent', certifications: ['Advanced Threat Assessment'],
    trainingCompleted: [
      { name: 'Field Operational Safety & Verification', completedAt: '2025-03-01', expiryDate: '2026-03-01' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 91, evaluation: 'Exceeds Expectations', managerRemarks: 'High accuracy in anti-fraud merchant inspections.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-06', name: 'Peter Karanja', role: 'Finance Officer', department: 'Finance', roleKey: 'FINANCE_OFFICER', email: 'peter.ka@buysafely.africa', performanceRating: 4.9,
    dob: '1988-10-14', joinDate: '2021-02-01', contractType: 'Permanent', certifications: ['CPA-K', 'Certified Fraud Examiner'],
    trainingCompleted: [
      { name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20', expiryDate: '2026-01-20' },
      { name: 'Mandatory Securities & Escrow Compliance', completedAt: '2025-01-10', expiryDate: '2026-01-10' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 96, evaluation: 'Outstanding', managerRemarks: 'Extremely accurate escrow ledgers. Zero mismatch recorded over Q4.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-07', name: 'Jane Wairimu', role: 'HR Officer', department: 'HR', roleKey: 'HR_OFFICER', email: 'jane.wa@buysafely.africa', performanceRating: 4.7,
    dob: '1993-07-07', joinDate: '2022-07-01', contractType: 'Permanent', certifications: ['IHRM Kenya Practicing License'],
    trainingCompleted: [
      { name: 'Strategic Workforce Planning', completedAt: '2024-11-20' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 89, evaluation: 'Meets Expectations', managerRemarks: 'Solid handling of leave portals and daily compliance rosters.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-08', name: 'Alex Ondieki', role: 'System Administrator', department: 'System Administration', roleKey: 'SYSTEM_ADMIN', email: 'alex.on@buysafely.africa', performanceRating: 5.0,
    dob: '1990-09-09', joinDate: '2020-01-10', contractType: 'Permanent', certifications: ['CISSP', 'AWS Certified Security - Speciality'],
    trainingCompleted: [
      { name: 'Advanced Cryptographic Key Management', completedAt: '2025-04-12' },
      { name: 'Mandatory Securities & Escrow Compliance', completedAt: '2025-01-10', expiryDate: '2026-01-10' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 100, evaluation: 'Outstanding', managerRemarks: 'Exceptional network uptime. Impeccable infrastructure management.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-09', name: 'Mary Mweru', role: 'BI Analyst', department: 'Business Intelligence', roleKey: 'BI_ANALYST', email: 'mary.mw@buysafely.africa', performanceRating: 4.9,
    dob: '1994-12-18', joinDate: '2023-10-01', contractType: 'Permanent', certifications: ['Google Data Analytics Professional'],
    trainingCompleted: [
      { name: 'Predictive BI Modeling Sandbox', completedAt: '2025-02-10' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 93, evaluation: 'Exceeds Expectations', managerRemarks: 'Developed incredible escrow leakage visual maps.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-10', name: 'Silas Mugo', role: 'Chief Operating Officer (COO)', department: 'Executive Management', roleKey: 'CHIEF_OPERATING_OFFICER', email: 'silas.mu@buysafely.africa', performanceRating: 5.0,
    dob: '1982-05-14', joinDate: '2019-03-01', contractType: 'Permanent', certifications: ['MBA - Strathmore University', 'PMP'],
    trainingCompleted: [
      { name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20', expiryDate: '2026-01-20' },
      { name: 'Mandatory Securities & Escrow Compliance', completedAt: '2025-01-10', expiryDate: '2026-01-10' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [],
    rewardsHistory: []
  },
  { 
    id: 'STF-11', name: 'Alice Koech', role: 'Field Supervisor', department: 'Field Operations', roleKey: 'FIELD_SUPERVISOR', email: 'alice.ko@buysafely.africa', performanceRating: 4.7,
    dob: '1987-02-14', joinDate: '2022-08-15', contractType: 'Permanent', certifications: ['Supply Chain Quality Assurance'],
    trainingCompleted: [
      { name: 'Field Operational Safety & Verification', completedAt: '2025-03-01', expiryDate: '2026-03-01' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 90, evaluation: 'Exceeds Expectations', managerRemarks: 'Great job coordinating rural pickers and agent safety networks.' }
    ],
    rewardsHistory: []
  },
  { 
    id: 'STF-12', name: 'John Kamau', role: 'Field Operations Manager', department: 'Field Operations', roleKey: 'FIELD_MANAGER', email: 'john.ka@buysafely.africa', performanceRating: 4.9,
    dob: '1984-06-20', joinDate: '2021-04-10', contractType: 'Permanent', certifications: ['FICS - Operations Lead'],
    trainingCompleted: [
      { name: 'Field Operational Safety & Verification', completedAt: '2025-03-01', expiryDate: '2026-03-01' }
    ],
    disciplinaryRecords: [],
    reviewHistory: [
      { period: '2025 Q4', kpiScore: 95, evaluation: 'Outstanding', managerRemarks: 'Superb coordination of mobile OTP tracking verification systems.' }
    ],
    rewardsHistory: []
  },
  // Finance & Audit Roster
  { 
    id: 'STF-13', name: 'Lucy Njeri', role: 'Finance Analyst', department: 'Finance', roleKey: 'FINANCE_ANALYST', email: 'lucy.nj@buysafely.africa', performanceRating: 4.5,
    dob: '1997-03-11', joinDate: '2024-02-01', contractType: 'Permanent', certifications: ['CPA-II'],
    trainingCompleted: [{ name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  { 
    id: 'STF-14', name: 'James Mwangi', role: 'Reconciliation Officer', department: 'Finance', roleKey: 'RECON_OFFICER', email: 'james.mw@buysafely.africa', performanceRating: 4.7,
    dob: '1995-10-18', joinDate: '2023-08-15', contractType: 'Permanent', certifications: ['CPA-Section 3'],
    trainingCompleted: [{ name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  { 
    id: 'STF-15', name: 'Grace Kendi', role: 'Finance Supervisor', department: 'Finance', roleKey: 'FINANCE_SUPERVISOR', email: 'grace.ke@buysafely.africa', performanceRating: 4.8,
    dob: '1991-05-19', joinDate: '2022-01-10', contractType: 'Permanent', certifications: ['CPA-K', 'MSc Finance'],
    trainingCompleted: [{ name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20', expiryDate: '2026-01-20' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  { 
    id: 'STF-16', name: 'Evans Kosgei', role: 'Finance Manager', department: 'Finance', roleKey: 'FINANCE_MANAGER', email: 'evans.ko@buysafely.africa', performanceRating: 4.9,
    dob: '1987-12-04', joinDate: '2021-11-01', contractType: 'Permanent', certifications: ['CPA-K', 'CIFA'],
    trainingCompleted: [{ name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20', expiryDate: '2026-01-20' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  { 
    id: 'STF-17', name: 'Benson Obwoge', role: 'Internal Auditor', department: 'Finance', roleKey: 'INTERNAL_AUDITOR', email: 'benson.ob@buysafely.africa', performanceRating: 4.9,
    dob: '1986-02-28', joinDate: '2022-04-01', contractType: 'Permanent', certifications: ['CIA', 'CISA', 'CPA-K'],
    trainingCompleted: [{ name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20', expiryDate: '2026-01-20' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  { 
    id: 'STF-18', name: 'Hezron Ombati', role: 'Head of Finance', department: 'Finance', roleKey: 'HEAD_OF_FINANCE', email: 'hezron.om@buysafely.africa', performanceRating: 5.0,
    dob: '1981-11-09', joinDate: '2019-10-01', contractType: 'Permanent', certifications: ['FCCA', 'MBA'],
    trainingCompleted: [{ name: 'Financial Integrity & Anti-Money Laundering (AML)', completedAt: '2025-01-20', expiryDate: '2026-01-20' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  // HR Expanded Roster
  { 
    id: 'STF-19', name: 'Rosebell Awuor', role: 'HR Business Partner', department: 'HR', roleKey: 'HR_BP', email: 'rosebell.aw@buysafely.africa', performanceRating: 4.6,
    dob: '1992-06-15', joinDate: '2023-05-15', contractType: 'Permanent', certifications: ['CHRP-K'],
    trainingCompleted: [{ name: 'Conflict Resolution & Mediation', completedAt: '2024-09-12' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  { 
    id: 'STF-20', name: 'Philip Maingi', role: 'HR Supervisor', department: 'HR', roleKey: 'HR_SUPERVISOR', email: 'philip.ma@buysafely.africa', performanceRating: 4.8,
    dob: '1989-08-11', joinDate: '2021-12-01', contractType: 'Permanent', certifications: ['CHRP-K', 'MHD'],
    trainingCompleted: [{ name: 'Strategic Workforce Planning', completedAt: '2024-10-18' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  },
  { 
    id: 'STF-21', name: 'Catherine Mutua', role: 'HR Manager', department: 'HR', roleKey: 'HR_MANAGER', email: 'catherine.mu@buysafely.africa', performanceRating: 4.9,
    dob: '1984-01-25', joinDate: '2020-10-15', contractType: 'Permanent', certifications: ['Fellow IHRM', 'SHRM-SCP'],
    trainingCompleted: [{ name: 'Strategic Workforce Planning', completedAt: '2024-10-18' }],
    disciplinaryRecords: [], reviewHistory: [], rewardsHistory: []
  }
];

const hrLeaves: any[] = [
  { id: 'LEV-301', staffMember: 'Jane Wairimu', department: 'HR', duration: '3 Days', type: 'Annual Leave', status: 'PENDING' },
  { id: 'LEV-302', staffMember: 'Mike Otieno', department: 'CRM', duration: '5 Days', type: 'Sick Leave', status: 'APPROVED' },
  { id: 'LEV-303', staffMember: 'Peter Karanja', department: 'Finance', duration: '2 Days', type: 'Personal Leave', status: 'REJECTED' }
];

// 1. Escrow Reconciliation State
let statsToday = {
  transactionsProcessed: 250000,
  autoReconciled: 249710,
  exceptionCases: 290,
  successRate: 99.88,
  rulesEngineState: 'LIVE',
  lastEvaluated: new Date().toISOString(),
  lastAuditRun: null as string | null,
  auditSampleRate: 1.0, // 1%
  auditRandomSamples: [] as any[]
};

let financeReconciliations: any[] = [
  {
    id: 'REC-001',
    transactionId: 'BS-KSH-8942',
    transactionAmount: 2342,
    expectedEscrow: 2342,
    actualEscrow: 2342,
    varianceAmount: 0,
    pspFee: 0,
    platformFee: 12,
    status: 'AUTO_RECONCILED',
    riskTier: 'LOW',
    exceptionType: 'NONE',
    exceptionReason: 'Perfect Match. PSP confirms Ksh 2,342, Escrow matches transaction amount.',
    lastChecked: new Date(Date.now() - 3600000 * 3).toISOString(),
    auditorRemarks: 'Automatic rules verified. Bypassed manual review.',
    reconciledBy: 'Reconciliation Engine AI',
    reconciledAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    auditTrail: [
      { timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), user: 'Reconciliation Engine AI', role: 'SYSTEM', action: 'Auto Reconciled', prevStatus: 'PENDING', newStatus: 'AUTO_RECONCILED', justification: 'Auto-matching rules perfect correspondence.' }
    ]
  },
  {
    id: 'REC-002',
    transactionId: 'BS-KSH-1029',
    transactionAmount: 2342,
    expectedEscrow: 2342,
    actualEscrow: 2300,
    varianceAmount: 42,
    pspFee: 15,
    platformFee: 12,
    status: 'AWAITING_FINANCE_REVIEW',
    riskTier: 'LOW',
    exceptionType: 'AMOUNT_VARIANCE',
    exceptionReason: 'Expected Ksh 2,342. Received Ksh 2,300 in Safaricom STK Push callback database. Amount Variance Ksh 42.',
    lastChecked: new Date(Date.now() - 3600000 * 2).toISOString(),
    auditorRemarks: 'Ksh 42 variance identified during Airtel money network matching. Investigating.',
    reconciledBy: 'Lucy Njeri',
    reconciledAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    auditTrail: [
      { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'Lucy Njeri', role: 'FINANCE_ANALYST', action: 'Flag Variance', prevStatus: 'PENDING', newStatus: 'AWAITING_FINANCE_REVIEW', justification: 'Slight mismatch in incoming credit. Marked for inquiry.' }
    ]
  },
  {
    id: 'REC-003',
    transactionId: 'BS-KSH-4109',
    transactionAmount: 45000,
    expectedEscrow: 45000,
    actualEscrow: 45000,
    varianceAmount: 0,
    pspFee: 25,
    platformFee: 12,
    status: 'AWAITING_FINANCE_REVIEW',
    riskTier: 'MEDIUM',
    exceptionType: 'FAILED_SETTLEMENT',
    exceptionReason: 'Airtel Money gateway reported settlement bank callback timeout. Beneficiary merchant wallet @trendy_thrifts_ke liabilities currently on hold.',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    auditTrail: []
  },
  {
    id: 'REC-004',
    transactionId: 'BS-KSH-9150',
    transactionAmount: 120000,
    expectedEscrow: 120000,
    actualEscrow: 120000,
    varianceAmount: 0,
    status: 'AWAITING_FINANCE_REVIEW',
    riskTier: 'HIGH',
    exceptionType: 'FRAUD_ALERT',
    exceptionReason: 'AI Safeguard Engine flagged structural card velocity. IP geolocation mismatch with billing country. Fraud risk score is 89/100.',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    auditTrail: []
  },
  {
    id: 'REC-005',
    transactionId: 'BS-KSH-1029',
    transactionAmount: 8400,
    expectedEscrow: 8400,
    actualEscrow: 16800,
    varianceAmount: 8400,
    status: 'AWAITING_FINANCE_REVIEW',
    riskTier: 'LOW',
    exceptionType: 'DUPLICATE_PAYMENT',
    exceptionReason: 'Double payment webhooks detected. Gateway IDs STK_9102A and STK_9102B confirmed for identical Order BS-KSH-1029.',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    auditTrail: []
  },
  {
    id: 'REC-006',
    transactionId: 'BS-KSH-2849',
    transactionAmount: 15200,
    expectedEscrow: 15200,
    actualEscrow: 15200,
    varianceAmount: 0,
    status: 'UNDER_INVESTIGATION',
    riskTier: 'LOW',
    exceptionType: 'DISPUTE_RAISED',
    exceptionReason: 'CRM Ticket #TC-9281. Buyer logged a formal dispute on Courier Logistics partner Ken Bwire claiming package tamper.',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    auditTrail: []
  },
  {
    id: 'REC-007',
    transactionId: 'BS-KSH-9159',
    transactionAmount: 640000,
    expectedEscrow: 640000,
    actualEscrow: 640000,
    varianceAmount: 0,
    status: 'ESCALATED',
    riskTier: 'ENTERPRISE',
    exceptionType: 'HIGH_VALUE_AUDIT',
    exceptionReason: 'Enterprise escrow exceeding Ksh 500,000 threshold limits. Mandates dual-officer executive verification before bank clearance.',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    auditTrail: []
  },
  {
    id: 'REC-008',
    transactionId: 'BS-KSH-4112',
    transactionAmount: 8500,
    expectedEscrow: 8500,
    actualEscrow: 8500,
    varianceAmount: 0,
    status: 'AWAITING_FINANCE_REVIEW',
    riskTier: 'LOW',
    exceptionType: 'COMMISSION_EXCEPTION',
    exceptionReason: 'Calculated platform commission mismatch. Expected 12 Ksh flat + 2% verification split (242 Ksh). Received commission flat fee was 12 Ksh.',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    auditTrail: []
  }
];

// 2. PSP Reconciliations State
let pspReconciliations: any[] = [
  { id: 'PSP-001', pspName: 'M-PESA', referenceId: 'RK92JL81F8', pspCollectedAmount: 4500, platformLedgerAmount: 4500, variance: 0, status: 'MATCHED', reconciledBy: 'James Mwangi', reconciledAt: '2026-06-11T10:00:00Z', auditTrail: [] },
  { id: 'PSP-002', pspName: 'AIRTEL_MONEY', referenceId: 'AY827BL902', pspCollectedAmount: 8400, platformLedgerAmount: 8500, variance: 100, status: 'ESCALATED', reconciledBy: 'Lucy Njeri', reconciledAt: '2026-06-11T11:30:00Z', auditTrail: [] },
  { id: 'PSP-003', pspName: 'T-CASH', referenceId: 'TC77291102', pspCollectedAmount: 3200, platformLedgerAmount: 3200, variance: 0, status: 'UNMATCHED', auditTrail: [] }
];

// 3. Commission Verifications State
let commissionVerifications: any[] = [
  { id: 'COM-001', transactionId: 'BS-KSH-8942', escrowFees: 40, platformFees: 12, courierReferralCommissions: 33, pickerVerificationFees: 0, merchantSubscriptionRevenue: 0, totalComputed: 85, status: 'VALIDATED', auditedBy: 'Grace Kendi', auditedAt: '2026-06-11T09:00:00Z', auditTrail: [] },
  { id: 'COM-002', transactionId: 'BS-KSH-1029', escrowFees: 80, platformFees: 12, courierReferralCommissions: 45, pickerVerificationFees: 150, merchantSubscriptionRevenue: 0, totalComputed: 287, status: 'PENDING_VALIDATION', auditTrail: [] },
  { id: 'COM-003', transactionId: 'BS-KSH-4109', escrowFees: 120, platformFees: 12, courierReferralCommissions: 0, pickerVerificationFees: 0, merchantSubscriptionRevenue: 1500, totalComputed: 1632, status: 'ANOMALY_FLAGGED', remarks: 'Suspected duplicate billing for merchant subscriptions in same cycle.', auditTrail: [] }
];

// 4. Settlement Approvals State
let settlementApprovals: any[] = [
  { id: 'SET-001', type: 'MERCHANT_SETTLEMENT', targetBeneficiary: '@trendy_thrifts_ke', amount: 4460, status: 'PENDING_APPROVAL', relatedTransactionId: 'BS-KSH-8942', auditTrail: [] },
  { id: 'SET-002', type: 'COURIER_PAYOUT', targetBeneficiary: 'Rider Peter Kamau', amount: 187, status: 'APPROVED', relatedTransactionId: 'BS-KSH-8942', approvedBy: 'Grace Kendi', approvedAt: '2026-06-11T12:00:00Z', auditTrail: [] },
  { id: 'SET-003', type: 'REFUND', targetBeneficiary: 'kamau.buyer@gmail.com', amount: 4500, status: 'REJECTED', relatedTransactionId: 'BS-KSH-1029', justification: 'Proof of receipt confirmed by dispatcher.', auditTrail: [] },
  { id: 'SET-004', type: 'PICKER_PAYOUT', targetBeneficiary: 'Picker Ken Bwire', amount: 450, status: 'HOLD', relatedTransactionId: 'BS-KSH-4109', justification: 'Fails matching verification rules.', auditTrail: [] }
];

// 5. Revenue Assurance State
let revenueAssuranceItems: any[] = [
  { id: 'REV-001', leakageType: 'DUPLICATE_SETTLEMENT', description: 'Suspected duplicate M-Pesa STK push for Order BS-KSH-1029.', estimatedLeakage: 8500, transactionId: 'BS-KSH-1029', status: 'UNDER_INVESTIGATION', auditTrail: [] },
  { id: 'REV-002', leakageType: 'MISSING_FEE', description: 'Platform fee bypass on multi-card transactions.', estimatedLeakage: 144, transactionId: 'BS-KSH-9150', status: 'CORRECTED_JUSTIFIED', actionTaken: 'Adjusted billing engine Ksh +144.', auditTrail: [] }
];

// 6. Refund Review State
let refundReviews: any[] = [
  { id: 'REF-001', transactionId: 'BS-KSH-8942', refundType: 'PARTIAL_REFUND', amount: 1500, requestedBy: 'Sarah Mwangi', customerJustification: 'Stitch tear in sleeve not disclosed on listing.', status: 'PENDING', auditTrail: [] },
  { id: 'REF-002', transactionId: 'BS-KSH-9150', refundType: 'FULL_REFUND', amount: 11000, requestedBy: 'Sarah Mwangi', customerJustification: 'Counterfeit product confirmed by field operations audit.', status: 'APPROVED', reviewedBy: 'Evans Kosgei', reviewedAt: '2026-06-11T12:30:00Z', auditTrail: [] }
];

// 7. Audit Cases State
let auditCases: any[] = [
  { id: 'AUD-001', title: 'Q2 Escrow Reserves Verification', category: 'Financial', auditorName: 'Benson Obwoge', assignedTo: 'Benson Obwoge', findings: 'All NCBA trust ledger accounts correspond completely to in-app holdings.', recommendations: 'Continue weekly automated reconciliation loops.', status: 'CLOSED', createdAt: '2026-06-01T08:00:00Z', auditTrail: [] },
  { id: 'AUD-002', title: 'Rural Merchant Verification Loop', category: 'Merchant', auditorName: 'Benson Obwoge', assignedTo: 'Benson Obwoge', status: 'OPEN_AUDIT', createdAt: '2026-06-11T13:00:00Z', auditTrail: [] }
];

// 8. HR Vacancies State
let hrVacancies: any[] = [
  { 
    id: 'VAC-001', title: 'Senior Dispute Analyst', department: 'CRM', status: 'INTERVIEW_STAGE', description: 'Responsible for leading high-value escrow resolutions.', candidatesCount: 4,
    candidates: [
      { name: 'Sylvia Wanjiku', email: 'sylvia@gmail.com', score: 88, status: 'INTERVIEWED' },
      { name: 'Robert Kirui', email: 'robert.k@yahoo.com', score: 92, status: 'SHORTLISTED' },
      { name: 'Ann Mwatha', email: 'ann.mwatha@gmail.com', score: 72, status: 'SCREENED' }
    ],
    recruitWorkflowLogs: [{ event: 'Vacancy created by Catherine Mutua', date: '2026-06-01' }]
  },
  { 
    id: 'VAC-002', title: 'Compliance Auditor', department: 'Finance', status: 'CREATED', description: 'Audits PSP wallets and merchant payouts.', candidatesCount: 0,
    candidates: [], recruitWorkflowLogs: []
  }
];

// 9. Succession Planning State
let hrSuccession: any[] = [
  { id: 'SUC-001', position: 'Head of Finance', criticalLevel: 'High', currentIncumbent: 'Hezron Ombati', readySuccessors: [{ name: 'Evans Kosgei', readiness: 'Ready Now', developmentGap: 'Regulatory compliance seminars' }] },
  { id: 'SUC-002', position: 'CRM Manager', criticalLevel: 'Medium', currentIncumbent: 'Sarah Mwangi', readySuccessors: [{ name: 'David Chemosit', readiness: '1-2 Years', developmentGap: 'Executive operations coursework' }] }
];

// REST API Endpoints

// 1. Get ledger wallets balance
app.get('/api/escrow/ledger', (req, res) => {
  res.json(calculateLedgerSummary());
});

// 2. Fetch all transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// Notifications and Communication API routes
app.get('/api/admin/notifications', (req, res) => {
  res.json(platformNotifications);
});

app.get('/api/admin/simulated-sms', (req, res) => {
  res.json(simulatedSMS);
});

app.post('/api/admin/notifications/mark-read', (req, res) => {
  const { ids, all } = req.body;
  if (all) {
    platformNotifications.forEach(n => n.isRead = true);
  } else if (Array.isArray(ids)) {
    platformNotifications.forEach(n => {
      if (ids.includes(n.id)) n.isRead = true;
    });
  } else if (typeof ids === 'string') {
    const n = platformNotifications.find(x => x.id === ids);
    if (n) n.isRead = true;
  }
  res.json({ success: true, platformNotifications });
});

app.post('/api/admin/notifications/trigger-simulation', (req, res) => {
  const { type } = req.body;
  const timestamp = new Date().toISOString();
  
  if (type === 'CRITICAL_SECURITY') {
    // Non-buyer SMS bypassed to respect the strict scale communication cost amendment
    addSimulatedNotification(
      'SYSTEM_ADMIN',
      'CRITICAL',
      'Intrusion Prevention Triggered',
      `Staff Admin notified on-platform. Multiple faulty web API handshake events detected. Intrusion core blocked IP block matching. (SMS bypassed for cost-efficiency: routed via encrypted platform notification).`,
      'ops'
    );
  } else if (type === 'MFA_VERIFICATION') {
    // Authorized session token sent inside platform notification center
    addSimulatedNotification(
      'FINANCE',
      'ACTION_REQUIRED',
      'Admin MFA Token Generated',
      `Staff Grace Kendi initiated manual NCBA Trust escrow release. Multi-factor handshake token generated: [OTP-${Math.floor(100000 + Math.random() * 900000)}]. (SMS bypassed for cost-efficiency: token served in secure staff console).`,
      'ops'
    );
  } else if (type === 'DISASTER_RECOVERY') {
    addSimulatedNotification(
      'SYSTEM_ADMIN',
      'CRITICAL',
      'Database Secondary Node Takeover',
      `Cluster master peaked above threshold. Backup container node online within 1.2 seconds. (SMS bypassed for cost-efficiency: routed to Systems Engineer via priority platform channel).`,
      'ops'
    );
  }
  
  res.json({ success: true, platformNotifications, simulatedSMS });
});

// Admin-specific endpoints
app.get('/api/admin/logs', (req, res) => {
  res.json(adminLogs);
});

app.post('/api/admin/logs', (req, res) => {
  const { user, role, action, previousValue, newValue } = req.body;
  const newLog = {
    id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
    user: user || 'Anonymous Staff',
    role: role || 'STAFF',
    action: action || 'Perform Administrative Routine',
    date: new Date().toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' }),
    time: new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi' }),
    previousValue: previousValue || 'N/A',
    newValue: newValue || 'N/A'
  };
  adminLogs.unshift(newLog);
  res.json(newLog);
});

app.get('/api/admin/crm/tickets', (req, res) => {
  res.json(crmTickets);
});

app.post('/api/admin/crm/tickets', (req, res) => {
  const { customer, category, urgency, message, assignedTo, transactionId, amount } = req.body;
  const newTicket = {
    id: `CRM-${Math.floor(100 + Math.random() * 900)}`,
    customer,
    category,
    urgency: urgency || 'Medium',
    status: 'NEW',
    assignedTo: assignedTo || 'Mike Otieno',
    message,
    createdAt: new Date().toISOString(),
    amount: amount || 0,
    transactionId: transactionId || '',
    attachments: [],
    communications: [
      { sender: 'System Intake', role: 'SYSTEM', text: 'Queue auto-dispatch assigned case to CRM Agent Mike Otieno.', timestamp: new Date().toISOString() }
    ],
    history: [
      { user: 'System Ingest', role: 'SYSTEM', timestamp: new Date().toISOString(), previousStatus: 'NONE', newStatus: 'NEW', notes: 'Disputed escrow ticket filed.' }
    ],
    report: {
      caseSummary: '',
      partiesInvolved: { buyer: customer, seller: 'Jumia Vendor West', courier: 'N/A', picker: 'N/A' },
      evidenceReviewed: [],
      findings: '',
      recommendation: ''
    },
    decision: { outcome: '', justification: '', financialAction: '' }
  };
  crmTickets.unshift(newTicket);
  res.json(newTicket);
});

app.post('/api/admin/crm/tickets/:id/update-status', (req, res) => {
  const { id } = req.params;
  const { status, remarks, user, role } = req.body;
  const ticket = crmTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const prevStatus = ticket.status;
  ticket.status = status;

  if (!ticket.history) ticket.history = [];
  if (!ticket.communications) ticket.communications = [];

  const timestamp = new Date().toISOString();

  ticket.history.push({
    user: user || 'Anonymous User',
    role: role || 'UNKNOWN',
    timestamp,
    previousStatus: prevStatus,
    newStatus: status,
    notes: remarks || `Status transitioned from ${prevStatus} to ${status}`
  });

  ticket.communications.push({
    sender: 'System Protocol',
    role: 'SYSTEM',
    text: `Status changed to ${status} by ${user} (${role}). Remarks: ${remarks || 'None'}`,
    timestamp
  });

  // Sync to shipping insurance transaction if applicable
  if (ticket.category === 'SHIPPING_INSURANCE_CLAIM' && ticket.transactionId) {
    const tx = transactions.find(t => t.id === ticket.transactionId);
    if (tx) {
      // Map CRM ticket status to Shipping Insurance Claim states
      let claimStatus: any = 'UNDER_REVIEW';
      if (status === 'NEW') claimStatus = 'SUBMITTED';
      else if (status === 'INFORMATION_REQUESTED') claimStatus = 'AWAITING_EVIDENCE';
      else if (status === 'CLOSED' || status === 'RESOLVED') {
        const isDecline = (remarks && remarks.toLowerCase().includes('decline')) || status === 'RESOLVED';
        claimStatus = isDecline ? 'REJECTED' : 'PAID';
      }
      else if (status === 'UNDER_REVIEW' || status === 'INVESTIGATION_IN_PROGRESS') claimStatus = 'UNDER_REVIEW';

      tx.insuranceClaimStatus = claimStatus;
      if (!tx.insuranceClaims) tx.insuranceClaims = [];
      if (tx.insuranceClaims.length > 0) {
        tx.insuranceClaims[tx.insuranceClaims.length - 1].status = claimStatus;
        if (claimStatus === 'PAID') {
          tx.insuranceClaims[tx.insuranceClaims.length - 1].payoutAmount = tx.amount;
        }
      }

      tx.history.push({
        timestamp: new Date().toISOString(),
        status: tx.status,
        title: `Insurance Claim: ${claimStatus}`,
        description: `Underwriter partner reviewed file. Current claim status transitioned to ${claimStatus}. Remarks: ${remarks || 'None'}`,
        actor: 'SYSTEM'
      });
    }
  }

  res.json(ticket);
});

app.post('/api/admin/crm/tickets/:id/report', (req, res) => {
  const { id } = req.params;
  const { report, user, role } = req.body;
  const ticket = crmTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  ticket.report = {
    caseSummary: report.caseSummary || '',
    partiesInvolved: report.partiesInvolved || { buyer: '', seller: '', courier: '', picker: '' },
    evidenceReviewed: report.evidenceReviewed || [],
    findings: report.findings || '',
    recommendation: report.recommendation || '',
    submittedBy: user,
    submittedAt: new Date().toISOString()
  };

  const prevStatus = ticket.status;
  ticket.status = 'INVESTIGATION_COMPLETED';

  if (!ticket.history) ticket.history = [];
  ticket.history.push({
    user,
    role,
    timestamp: new Date().toISOString(),
    previousStatus: prevStatus,
    newStatus: 'INVESTIGATION_COMPLETED',
    notes: `Submitted mandatory Case Investigation Report with recommendation: ${report.recommendation}`
  });

  res.json(ticket);
});

app.post('/api/admin/crm/tickets/:id/decision', (req, res) => {
  const { id } = req.params;
  const { outcome, justification, financialAction, user, role } = req.body;
  const ticket = crmTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  ticket.decision = {
    outcome,
    justification,
    financialAction,
    decidedBy: user,
    decidedRole: role,
    decidedAt: new Date().toISOString()
  };

  const prevStatus = ticket.status;

  if (outcome === 'Return for More Information') {
    ticket.status = 'MORE_INFORMATION_REQUIRED';
  } else if (financialAction && financialAction !== 'None' && financialAction !== 'Hold Funds' && financialAction !== 'Fraud Investigation Hold') {
    ticket.status = 'ESCROW_ACTION_PENDING';
  } else {
    ticket.status = 'RESOLUTION_APPROVED';
  }

  if (!ticket.history) ticket.history = [];
  ticket.history.push({
    user,
    role,
    timestamp: new Date().toISOString(),
    previousStatus: prevStatus,
    newStatus: ticket.status,
    notes: `Supervisor Decision: ${outcome}. Financial Payout: ${financialAction || 'None'}. Notes: ${justification}`
  });

  // Integrate with Actual transactions array if applicable
  if (ticket.transactionId && typeof transactions !== 'undefined') {
    const tx = (transactions as any[]).find(t => t.id === ticket.transactionId);
    if (tx) {
      if (financialAction === 'Release Escrow') {
        tx.status = 'FUNDS_RELEASED';
        tx.history.push({
          timestamp: new Date().toISOString(),
          status: 'FUNDS_RELEASED',
          title: 'Escrow Released by CRM Decision',
          description: `CRM Supervisor authorized release after dispute adjudication. Reference: ${ticket.id}`,
          actor: 'HUMAN_MODERATOR'
        });
      } else if (financialAction === 'Full Refund' || financialAction === 'Partial Refund' || financialAction === 'Split Settlement') {
        tx.status = 'REFUNDED';
        tx.history.push({
          timestamp: new Date().toISOString(),
          status: 'REFUNDED',
          title: 'Escrow Refunded by CRM Decision',
          description: `CRM Supervisor authorized refund settlement: ${financialAction}. Reference: ${ticket.id}`,
          actor: 'HUMAN_MODERATOR'
        });
      }
    }
  }

  res.json(ticket);
});

app.post('/api/admin/crm/tickets/:id/communication', (req, res) => {
  const { id } = req.params;
  const { sender, role, text } = req.body;
  const ticket = crmTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (!ticket.communications) ticket.communications = [];
  ticket.communications.push({
    sender,
    role,
    text,
    timestamp: new Date().toISOString()
  });

  res.json(ticket);
});

app.post('/api/admin/crm/tickets/:id/appeal', (req, res) => {
  const { id } = req.params;
  const { user, role, notes } = req.body;
  const ticket = crmTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const prevStatus = ticket.status;
  ticket.status = 'APPEAL_PENDING';

  if (!ticket.history) ticket.history = [];
  ticket.history.push({
    user: user || 'Anonymous Customer',
    role: role || 'BUYER',
    timestamp: new Date().toISOString(),
    previousStatus: prevStatus,
    newStatus: 'APPEAL_PENDING',
    notes: notes || 'User filed split escrow or decision appeal review requested.'
  });

  res.json(ticket);
});

const merchantVerificationLocks: Record<string, boolean> = {};

app.get('/api/admin/field/assignments', (req, res) => {
  res.json(fieldAssignments);
});

app.post('/api/admin/field/assignments', (req, res) => {
  const { merchantName, location, task, assignedTo, user, role } = req.body;
  const isVerification = task && task.includes('Verification');
  const assignmentType = task || 'Merchant Verification';
  const newAssignment = {
    id: `FLD-${Math.floor(200 + Math.random() * 800)}`,
    merchantName,
    location,
    task: assignmentType,
    status: 'NEW_ASSIGNMENT',
    assignedBy: user || 'John Kamau',
    assignedTo: assignedTo || 'Ken Bwire',
    reportDetails: 'Pending dispatch out-call.',
    assignmentType,
    dateAssigned: new Date().toISOString(),
    chargeAmount: isVerification ? 2500 : 0,
    chargeStatus: isVerification ? 'UNPAID' : 'PAID',
    visitDate: '',
    visitTime: '',
    gpsCoordinates: '',
    contactPerson: 'Abdi Ibrahim (Manager)',
    partiesInterviewed: { merchant: false, buyer: false, courier: false, witness: false },
    evidenceUploaded: { photos: [], videos: [], documents: [], audioNotes: [] },
    findings: '',
    riskAssessment: 'Low Risk',
    recommendation: 'Approve Merchant',
    history: [
      {
        timestamp: new Date().toISOString(),
        user: user || 'John Kamau',
        role: role || 'FIELD_MANAGER',
        action: 'ASSIGNED',
        prevStatus: 'NONE',
        newStatus: 'NEW_ASSIGNMENT',
        notes: `New mission assigned. ${isVerification ? 'Generated Verification Request Invoice of Ksh 2,500.' : 'Standard operations assignment.'}`
      }
    ]
  };
  fieldAssignments.unshift(newAssignment);
  res.json(newAssignment);
});

app.post('/api/admin/field/assignments/:id/pay-charge', (req, res) => {
  const { id } = req.params;
  const { user, role } = req.body;
  const assignment = fieldAssignments.find(a => a.id === id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  assignment.chargeStatus = 'PAID';
  if (!assignment.history) assignment.history = [];
  assignment.history.push({
    timestamp: new Date().toISOString(),
    user: user || 'Merchant client',
    role: role || 'MERCHANT',
    action: 'PAYMENT_RECEIVED',
    prevStatus: assignment.status,
    newStatus: assignment.status,
    notes: 'Invoice of Ksh 2,500 fully paid via integration hook (M-Pesa Express).'
  });
  res.json(assignment);
});

app.post('/api/admin/field/assignments/:id/update-status', (req, res) => {
  const { id } = req.params;
  const { status, user, role, remarks } = req.body;
  const assignment = fieldAssignments.find(a => a.id === id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  const prevStatus = assignment.status;
  assignment.status = status;
  if (!assignment.history) assignment.history = [];
  assignment.history.push({
    timestamp: new Date().toISOString(),
    user: user || 'Anonymous',
    role: role || 'UNKNOWN',
    action: 'STATUS_UPDATE',
    prevStatus,
    newStatus: status,
    notes: remarks || `Transitioned status from ${prevStatus} to ${status}`
  });
  res.json(assignment);
});

app.post('/api/admin/field/assignments/:id/schedule', (req, res) => {
  const { id } = req.params;
  const { visitDate, visitTime, contactPerson, user, role } = req.body;
  const assignment = fieldAssignments.find(a => a.id === id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  const prevStatus = assignment.status;
  assignment.status = 'INVESTIGATION_SCHEDULED';
  assignment.visitDate = visitDate;
  assignment.visitTime = visitTime;
  assignment.contactPerson = contactPerson || assignment.contactPerson;
  if (!assignment.history) assignment.history = [];
  assignment.history.push({
    timestamp: new Date().toISOString(),
    user: user || 'Field Specialist',
    role: role || 'FIELD_AGENT',
    action: 'SCHEDULE_VISIT',
    prevStatus,
    newStatus: 'INVESTIGATION_SCHEDULED',
    notes: `Scheduled site inspection: Date=${visitDate}, Time=${visitTime}, Contact=${contactPerson}`
  });
  res.json(assignment);
});

app.post('/api/admin/field/assignments/:id/in-field', (req, res) => {
  const { id } = req.params;
  const { gpsCoordinates, user, role } = req.body;
  const assignment = fieldAssignments.find(a => a.id === id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  const prevStatus = assignment.status;
  assignment.status = 'IN_FIELD';
  assignment.gpsCoordinates = gpsCoordinates || '-1.2921 S, 36.8219 E';
  if (!assignment.history) assignment.history = [];
  assignment.history.push({
    timestamp: new Date().toISOString(),
    user: user || 'Field Specialist',
    role: role || 'FIELD_AGENT',
    action: 'LOG_ARRIVAL',
    prevStatus,
    newStatus: 'IN_FIELD',
    notes: `Agent checked in on-site. GPS validated: [${assignment.gpsCoordinates}]`
  });
  res.json(assignment);
});

app.post('/api/admin/field/assignments/:id/evidence', (req, res) => {
  const { id } = req.params;
  const { files, type, user, role } = req.body;
  const assignment = fieldAssignments.find(a => a.id === id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  const prevStatus = assignment.status;
  assignment.status = 'EVIDENCE_COLLECTION';
  if (!assignment.evidenceUploaded) {
    assignment.evidenceUploaded = { photos: [], videos: [], documents: [], audioNotes: [] };
  }
  const list = assignment.evidenceUploaded[type] || [];
  if (Array.isArray(files)) {
    files.forEach(f => list.push(f));
  } else if (files) {
    list.push(files);
  }
  assignment.evidenceUploaded[type] = list;
  if (!assignment.history) assignment.history = [];
  assignment.history.push({
    timestamp: new Date().toISOString(),
    user: user || 'Field Specialist',
    role: role || 'FIELD_AGENT',
    action: 'EVIDENCE_COLLECTED',
    prevStatus,
    newStatus: 'EVIDENCE_COLLECTION',
    notes: `Uploaded evidence attachment pack: Type=${type}. Filename=${Array.isArray(files) ? files.join(', ') : files}`
  });
  res.json(assignment);
});

app.post('/api/admin/field/assignments/:id/submit-report', (req, res) => {
  const { id } = req.params;
  const { findings, riskAssessment, recommendation, partiesInterviewed, user, role } = req.body;
  const assignment = fieldAssignments.find(a => a.id === id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  const prevStatus = assignment.status;
  assignment.status = 'REPORT_SUBMITTED';
  assignment.findings = findings;
  assignment.riskAssessment = riskAssessment || 'Low Risk';
  assignment.recommendation = recommendation || 'Approve Merchant';
  if (partiesInterviewed) {
    assignment.partiesInterviewed = partiesInterviewed;
  }
  if (!assignment.history) assignment.history = [];
  assignment.history.push({
    timestamp: new Date().toISOString(),
    user: user || 'Field Specialist',
    role: role || 'FIELD_AGENT',
    action: 'SUBMIT_REPORT',
    prevStatus,
    newStatus: 'REPORT_SUBMITTED',
    notes: `Investigation report submitted for review. Risk Rating: ${riskAssessment}. Candidate Recommendation: ${recommendation}`
  });
  res.json(assignment);
});

app.post('/api/admin/field/assignments/:id/adjudicate', (req, res) => {
  const { id } = req.params;
  const { action, overrideRecommendation, supervisorNotes, user, role } = req.body;
  const assignment = fieldAssignments.find(a => a.id === id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  const prevStatus = assignment.status;
  assignment.supervisorNotes = supervisorNotes || '';
  if (overrideRecommendation) {
    assignment.modifiedRecommendation = overrideRecommendation;
  }

  let nextStatus = prevStatus;
  let actionNotes = '';

  if (action === 'APPROVE') {
    nextStatus = 'APPROVED';
    assignment.decidedBy = user;
    assignment.decidedRole = role;
    assignment.decidedAt = new Date().toISOString();
    if (assignment.assignmentType === 'Merchant Verification') {
      assignment.badgeIssued = 'VERIFIED MERCHANT';
    }
    actionNotes = `Supervisor approved investigation findings. Recommendation output accepted. Issued badge: ${assignment.badgeIssued || 'Approved'}`;
  } else if (action === 'REQUEST_INFO') {
    nextStatus = 'RETURNED_FOR_MORE_INFORMATION';
    actionNotes = `Supervisor returned file requesting more information: ${supervisorNotes}`;
  } else if (action === 'ESCALATE_CRITICAL') {
    nextStatus = 'CLOSED';
    actionNotes = `Supervisor issued high integrity file escalation. Transferred to executive COO desk: ${supervisorNotes || 'Standard'}`;
  } else if (action === 'ESCALATE_FRAUD') {
    nextStatus = 'CLOSED';
    actionNotes = `CRITICAL FRAUD ESCALATION: Locked merchant account. Automatically registered high-risk CRM fraud case file registry. notes: ${supervisorNotes || 'None'}`;
    merchantVerificationLocks[assignment.merchantName] = true;

    // Standard automated fraud ticket integration! We can push a new Ticket to crmTickets:
    if (typeof crmTickets !== 'undefined' && Array.isArray(crmTickets)) {
      const newTicket = {
        id: `CRM-${Math.floor(100 + Math.random() * 900)}`,
        customer: assignment.merchantName,
        category: 'Fraud Escalation',
        urgency: 'Critical',
        status: 'NEW',
        assignedTo: 'Mike Otieno',
        message: `AUTOMATED SYSTEM ALARM triggering physical FRAUD LOCK warning from Field Operations team. Subject merchant "${assignment.merchantName}" flag-marked for suspicious Multiple Account Abuse / Identity Mismatch or transaction layering. Dispatched Agent findings: "${assignment.findings || 'Not specified'}"`,
        createdAt: new Date().toISOString(),
        amount: assignment.chargeAmount || 0,
        transactionId: assignment.id,
        attachments: [],
        communications: [
          { sender: 'Field Ops Integration System', role: 'SYSTEM', text: `Automated dispatch originating from Field Office supervisor. Target store account locked. Supervisor details: "${supervisorNotes || 'Escalated by supervisor'}"`, timestamp: new Date().toISOString() }
        ],
        history: [
          { user: user, role: role, timestamp: new Date().toISOString(), previousStatus: 'NONE', newStatus: 'NEW', notes: `Automatic operational lock spawned from field inspection ID ${assignment.id}.` }
        ]
      };
      crmTickets.unshift(newTicket);
    }
  }

  assignment.status = nextStatus;
  if (!assignment.history) assignment.history = [];
  assignment.history.push({
    timestamp: new Date().toISOString(),
    user: user || 'Field Supervisor',
    role: role || 'FIELD_SUPERVISOR',
    action,
    prevStatus,
    newStatus: nextStatus,
    notes: actionNotes
  });
  res.json(assignment);
});

// =========================================================================
// NEW TRANSACTIONAL CONTROL PATHS: FINANCE & AUDITS
// =========================================================================

app.get('/api/admin/finance/stats', (req, res) => {
  res.json(statsToday);
});

app.post('/api/admin/finance/simulate', (req, res) => {
  const incrementVol = 10000;
  const incrementAuto = 9988; // 99.88%
  const incrementExceptions = 12;

  statsToday.transactionsProcessed += incrementVol;
  statsToday.autoReconciled += incrementAuto;
  statsToday.exceptionCases += incrementExceptions;
  statsToday.successRate = Number(((statsToday.autoReconciled / statsToday.transactionsProcessed) * 105 / 1.05).toFixed(4));
  if (statsToday.successRate > 99.95) statsToday.successRate = 99.88; // Keep it balanced
  statsToday.lastEvaluated = new Date().toISOString();

  // Dynamically push a new live exception to the queue for the user to solve!
  const exceptionPool = [
    {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      transactionId: `BS-KSH-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionAmount: 3800,
      expectedEscrow: 3800,
      actualEscrow: 3650,
      varianceAmount: 150,
      status: 'AWAITING_FINANCE_REVIEW',
      riskTier: 'LOW',
      exceptionType: 'AMOUNT_VARIANCE',
      exceptionReason: 'Safaricom M-Pesa STK push mismatch. Expected Ksh 3,800, received Ksh 3,650. Difference: Ksh 150.',
      lastChecked: new Date().toISOString(),
      auditTrail: []
    },
    {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      transactionId: `BS-KSH-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionAmount: 145000,
      expectedEscrow: 145000,
      actualEscrow: 0,
      varianceAmount: 145000,
      status: 'AWAITING_FINANCE_REVIEW',
      riskTier: 'HIGH',
      exceptionType: 'FAILED_SETTLEMENT',
      exceptionReason: 'NCBA Escrow Reserve settlement failure. Courier referral pay failed due to invalid bank routing.',
      lastChecked: new Date().toISOString(),
      auditTrail: []
    },
    {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      transactionId: `BS-KSH-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionAmount: 4300,
      expectedEscrow: 4300,
      actualEscrow: 4300,
      varianceAmount: 0,
      status: 'AWAITING_FINANCE_REVIEW',
      riskTier: 'LOW',
      exceptionType: 'DUPLICATE_PAYMENT',
      exceptionReason: 'Duplicate transaction alert. Multi-STK trigger callback on dispatch.',
      lastChecked: new Date().toISOString(),
      auditTrail: []
    }
  ];

  const chosen = exceptionPool[Math.floor(Math.random() * exceptionPool.length)];
  financeReconciliations.unshift(chosen);

  adminLogs.unshift({
    timestamp: new Date().toISOString(),
    action: 'BULK_SIMULATION_RUN',
    prevValue: 'Transactions processed: ' + (statsToday.transactionsProcessed - incrementVol),
    newValue: 'Engine analyzed +10,000 transactions. Registered 12 Exception Breaks.'
  });

  res.json({ success: true, stats: statsToday, addedException: chosen });
});

app.post('/api/admin/finance/run-audit-sample', (req, res) => {
  const rate = req.body.rate || 1.0;
  statsToday.auditSampleRate = rate;
  statsToday.lastAuditRun = new Date().toISOString();

  // Create random 5 samples from Virtual Safaricom logs representing auto-reconciled items
  const handles = ['@trendy_thrifts_ke', '@nairobi_dropship', '@kicks_and_caps', '@glam_wear_kenya', '@vintage_classic'];
  const samples = [];
  for (let i = 0; i < 5; i++) {
    const txVal = Math.floor(1500 + Math.random() * 15000);
    samples.push({
      id: `SMP-${1000 + i}`,
      timestamp: new Date(Date.now() - Math.random() * 12 * 3600000).toISOString(),
      sellerHandle: handles[i % handles.length],
      amount: txVal,
      auditStatus: 'MATCH_CONFIRMED',
      integrityResult: 'PASSED (100% Core Ledger Coherence)',
      verificationFlow: 'PSP Gateway ➔ Escrow Vault ➔ Settlement Ledgers'
    });
  }
  statsToday.auditRandomSamples = samples;

  adminLogs.unshift({
    timestamp: new Date().toISOString(),
    action: 'INTEGRITY_SAMPLE_RUN',
    prevValue: 'Inactive sampling state',
    newValue: `Randomly auditor-sampled ${rate}% auto-reconciled entries. High coherence validated.`
  });

  res.json({ success: true, samples });
});

app.post('/api/admin/finance/run-revenue-scan', (req, res) => {
  // Automatically identify any platform/escrow missing commission anomalies
  const newAssurance = {
    id: `REV-00${revenueAssuranceItems.length + 1}`,
    leakageType: 'MISSING_COURIER_COMMISSION',
    description: 'System identified a platform fee bypass or uncharged dispatch liability.',
    estimatedLeakage: 220,
    status: 'UNDER_INVESTIGATION',
    detailedLeakageScenario: 'Courier referral transaction for Rider John had +Ksh 220 commission discrepancy due to outdated webhook callback script. Revenue assurance guard logged item.',
    auditTrail: []
  };

  revenueAssuranceItems.unshift(newAssurance);

  adminLogs.unshift({
    timestamp: new Date().toISOString(),
    action: 'REVENUE_ASSURANCE_RUN',
    prevValue: 'Active scanning',
    newValue: 'Revenue assurance scanner auto-registered leakage file ' + newAssurance.id
  });

  res.json({ success: true, addedAssurance: newAssurance });
});

app.get('/api/admin/finance/reconciliations', (req, res) => {
  res.json(financeReconciliations);
});

app.post('/api/admin/finance/reconciliations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, user, role, justification, amount, prevStatus } = req.body;
  const reconcStep = financeReconciliations.find(r => r.id === id);
  if (reconcStep) {
    const oldStatus = reconcStep.status;
    reconcStep.status = status;
    reconcStep.lastChecked = new Date().toISOString();
    reconcStep.reconciledBy = user;
    reconcStep.reconciledAt = new Date().toISOString();
    reconcStep.auditorRemarks = justification;
    
    if (!reconcStep.auditTrail) reconcStep.auditTrail = [];
    reconcStep.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous',
      role: role || 'FINANCE_OFFICER',
      amount: amount || reconcStep.transactionAmount,
      prevStatus: prevStatus || oldStatus,
      newStatus: status,
      justification: justification || 'No justification provided'
    });
  }
  res.json(reconcStep || { error: 'Reconciliation record not found' });
});

app.get('/api/admin/finance/psp-reconciliations', (req, res) => {
  res.json(pspReconciliations);
});

app.post('/api/admin/finance/psp-reconciliations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, user, role, justification } = req.body;
  const psp = pspReconciliations.find(p => p.id === id);
  if (psp) {
    psp.status = status;
    psp.reconciledBy = user;
    psp.reconciledAt = new Date().toISOString();
    if (!psp.auditTrail) psp.auditTrail = [];
    psp.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous',
      role: role || 'FINANCE_OFFICER',
      action: `Update status to ${status}`,
      notes: justification
    });
  }
  res.json(psp || { error: 'PSP record not found' });
});

app.get('/api/admin/finance/commissions', (req, res) => {
  res.json(commissionVerifications);
});

app.post('/api/admin/finance/commissions/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, user, role, remarks, adjustmentAmount } = req.body;
  const comm = commissionVerifications.find(c => c.id === id);
  if (comm) {
    comm.status = status;
    comm.auditedBy = user;
    comm.auditedAt = new Date().toISOString();
    comm.remarks = remarks;
    if (adjustmentAmount !== undefined) {
      comm.totalComputed = adjustmentAmount;
    }
    if (!comm.auditTrail) comm.auditTrail = [];
    comm.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous',
      role: role || 'FINANCE_OFFICER',
      action: `Validate with status: ${status}`,
      notes: remarks
    });
  }
  res.json(comm || { error: 'Commission record not found' });
});

app.get('/api/admin/finance/settlements', (req, res) => {
  res.json(settlementApprovals);
});

app.post('/api/admin/finance/settlements/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, user, role, justification } = req.body;
  const s = settlementApprovals.find(item => item.id === id);
  if (s) {
    s.status = status;
    s.approvedBy = user;
    s.approvedAt = new Date().toISOString();
    s.justification = justification;
    if (!s.auditTrail) s.auditTrail = [];
    s.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous',
      role: role || 'FINANCE_OFFICER',
      action: `Action: ${status}`,
      notes: justification
    });
    
    // Lock or execute the actual order/refund states if applicable
    const tx = transactions.find(t => t.id === s.relatedTransactionId);
    if (tx && status === 'APPROVED') {
      if (s.type === 'REFUND') {
        tx.status = 'REFUNDED';
      }
    }
  }
  res.json(s || { error: 'Settlement record not found' });
});

app.get('/api/admin/finance/revenue-assurance', (req, res) => {
  res.json(revenueAssuranceItems);
});

app.post('/api/admin/finance/revenue-assurance/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, user, role, remarks, actionTaken } = req.body;
  const rav = revenueAssuranceItems.find(item => item.id === id);
  if (rav) {
    rav.status = status;
    if (actionTaken) rav.actionTaken = actionTaken;
    if (remarks) rav.auditorRemarks = remarks;
    if (!rav.auditTrail) rav.auditTrail = [];
    rav.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous',
      role: role || 'FINANCE_OFFICER',
      action: `Update revenue state: ${status}`,
      notes: remarks
    });
  }
  res.json(rav || { error: 'Revenue assurance file not found' });
});

app.get('/api/admin/finance/refunds', (req, res) => {
  res.json(refundReviews);
});

app.post('/api/admin/finance/refunds/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, user, role, justification } = req.body;
  const ref = refundReviews.find(item => item.id === id);
  if (ref) {
    ref.status = status;
    ref.reviewedBy = user;
    ref.reviewedAt = new Date().toISOString();
    if (!ref.auditTrail) ref.auditTrail = [];
    ref.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous',
      role: role || 'FINANCE_OFFICER',
      action: `Refund review decision: ${status}`,
      notes: justification
    });
    
    // Also update settlements trigger for refund if approved
    if (status === 'APPROVED') {
      settlementApprovals.push({
        id: `SET-${Math.floor(1000 + Math.random() * 9000).toString()}`,
        type: 'REFUND',
        targetBeneficiary: ref.requestedBy,
        amount: ref.amount,
        status: 'PENDING_APPROVAL',
        relatedTransactionId: ref.transactionId,
        auditTrail: []
      });
    }
  }
  res.json(ref || { error: 'Refund review not found' });
});

app.get('/api/admin/finance/audits', (req, res) => {
  res.json(auditCases);
});

app.post('/api/admin/finance/audits', (req, res) => {
  const { title, category, auditorName, assignedTo } = req.body;
  const newAudit = {
    id: `AUD-${Math.floor(100 + Math.random() * 900).toString()}`,
    title,
    category: category || 'Financial',
    auditorName: auditorName || 'Internal Auditor',
    assignedTo: assignedTo || 'Internal Auditor',
    status: 'OPEN_AUDIT',
    createdAt: new Date().toISOString(),
    auditTrail: [{ timestamp: new Date().toISOString(), user: auditorName, role: 'INTERNAL_AUDITOR', action: 'Create Audit Case' }]
  };
  auditCases.push(newAudit);
  res.json(newAudit);
});

app.post('/api/admin/finance/audits/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, findings, recommendations, user, role } = req.body;
  const audit = auditCases.find(a => a.id === id);
  if (audit) {
    audit.status = status;
    if (findings) audit.findings = findings;
    if (recommendations) audit.recommendations = recommendations;
    if (!audit.auditTrail) audit.auditTrail = [];
    audit.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'Auditory Warden',
      role: role || 'INTERNAL_AUDITOR',
      action: `Audit state: ${status}`,
      notes: findings || 'Updated findings'
    });
  }
  res.json(audit || { error: 'Audit case not found' });
});

// =========================================================================
// NEW TRANSACTIONAL CONTROL PATHS: HR DEPARTMENT
// =========================================================================

app.get('/api/admin/hr/vacancies', (req, res) => {
  res.json(hrVacancies);
});

app.post('/api/admin/hr/vacancies', (req, res) => {
  const { title, department, description, user, role } = req.body;
  const newVacancy = {
    id: `VAC-${Math.floor(100 + Math.random() * 900).toString()}`,
    title,
    department,
    status: 'CREATED',
    description,
    candidatesCount: 0,
    candidates: [],
    recruitWorkflowLogs: [
      { event: `Vacancy created by ${user || 'HR Officer'}`, date: new Date().toLocaleDateString() }
    ]
  };
  hrVacancies.unshift(newVacancy);
  res.json(newVacancy);
});

app.post('/api/admin/hr/vacancies/:id/workflow', (req, res) => {
  const { id } = req.params;
  const { status, user, role, logsText } = req.body;
  const vac = hrVacancies.find(v => v.id === id);
  if (vac) {
    vac.status = status;
    vac.recruitWorkflowLogs.push({
      event: logsText || `Vacancy advanced to ${status} by ${user}`,
      date: new Date().toLocaleDateString()
    });
    
    // Auto populate realistic candidates at different stages if needed
    if (status === 'PUBLISHED' && vac.candidates.length === 0) {
      vac.candidates = [
        { name: 'John Doe', email: 'john.doe@gmail.com', status: 'SCREENED', score: 75 },
        { name: 'Suki Langat', email: 'suki.langat@icloud.com', status: 'SCREENED', score: 85 }
      ];
      vac.candidatesCount = 2;
    }
  }
  res.json(vac || { error: 'Vacancy not found' });
});

app.post('/api/admin/hr/vacancies/:id/candidates/:email/status', (req, res) => {
  const { id, email } = req.params;
  const { status, score, user, role } = req.body;
  const vac = hrVacancies.find(v => v.id === id);
  if (vac) {
    const candidate = vac.candidates.find(c => c.email === email);
    if (candidate) {
      candidate.status = status;
      if (score !== undefined) candidate.score = score;
      
      vac.recruitWorkflowLogs.push({
        event: `Candidate ${candidate.name} updated to ${status} (Score: ${score || 'N/A'}) by ${user}`,
        date: new Date().toLocaleDateString()
      });
      
      // If hired and onboarded, add them to the HR Directory automatically!
      if (status === 'HIRED') {
        const checkExist = hrStaffDirectory.find(s => s.email === candidate.email);
        if (!checkExist) {
          const newStaff = {
            id: `STF-${Math.floor(10 + Math.random() * 90).toString()}`,
            name: candidate.name,
            role: `${vac.title}`,
            department: vac.department,
            roleKey: `${vac.department.toUpperCase().replace(/\s+/g, '_')}_STAFF`,
            email: candidate.email,
            performanceRating: 5.0, // perfect rating to start!
            dob: '1995-01-01',
            joinDate: new Date().toLocaleDateString(),
            contractType: 'Permanent',
            certifications: ['Onboarded Star'],
            disciplinaryRecords: [],
            reviewHistory: [],
            rewardsHistory: [],
            trainingCompleted: []
          };
          hrStaffDirectory.push(newStaff);
        }
      }
    }
  }
  res.json(vac || { error: 'Vacancy or candidate not found' });
});

app.post('/api/admin/hr/staff/rewards', (req, res) => {
  const { staffId, title, bonusAmount, justification, user, role } = req.body;
  const staff = hrStaffDirectory.find(s => s.id === staffId);
  if (staff) {
    if (!staff.rewardsHistory) staff.rewardsHistory = [];
    staff.rewardsHistory.push({
      awardDate: new Date().toLocaleDateString(),
      title,
      bonusAmount: bonusAmount ? Number(bonusAmount) : 0,
      justification
    });
    res.json({ success: true, staff });
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

app.post('/api/admin/hr/staff/performance', (req, res) => {
  const { staffId, period, kpiScore, evaluation, managerRemarks } = req.body;
  const staff = hrStaffDirectory.find(s => s.id === staffId);
  if (staff) {
    if (!staff.reviewHistory) staff.reviewHistory = [];
    staff.reviewHistory.unshift({
      period,
      kpiScore: Number(kpiScore),
      evaluation,
      managerRemarks
    });
    // Adjust performanceRating rolling average
    staff.performanceRating = Number(((staff.performanceRating * 3 + (Number(kpiScore) / 20)) / 4).toFixed(1));
    res.json({ success: true, staff });
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

app.post('/api/admin/hr/staff/disciplinary', (req, res) => {
  const { staffId, description, status, outcome, notes, user, role } = req.body;
  const staff = hrStaffDirectory.find(s => s.id === staffId);
  if (staff) {
    if (!staff.disciplinaryRecords) staff.disciplinaryRecords = [];
    const newCase = {
      id: `DIS-${Math.floor(100 + Math.random() * 900).toString()}`,
      incidentDate: new Date().toLocaleDateString(),
      description,
      status: status || 'Complaint',
      outcome: outcome || 'None',
      notes
    };
    staff.disciplinaryRecords.push(newCase);
    
    // If warning/termination outcome, update rating or flag immediately
    if (outcome === 'Termination') {
      staff.role = 'Terminated / Suspended';
      staff.performanceRating = 0;
    }
    res.json({ success: true, staff });
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

app.post('/api/admin/hr/staff/:id/separation', (req, res) => {
  const { id } = req.params;
  const { type, equipmentReturned, accessRemoved, finalSettlementDone, knowledgeTransferred } = req.body;
  const staff = hrStaffDirectory.find(s => s.id === id);
  if (staff) {
    staff.role = `Ex-Staff (${type})`;
    staff.status = 'Separated';
    staff.finalChecklist = {
      equipmentReturned,
      accessRemoved,
      finalSettlementDone,
      knowledgeTransferred,
      separatedAt: new Date().toLocaleDateString()
    };
    res.json({ success: true, staff });
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

app.get('/api/admin/hr/succession', (req, res) => {
  res.json(hrSuccession);
});

app.get('/api/admin/hr/leaves', (req, res) => {
  res.json(hrLeaves);
});

app.get('/api/admin/hr/staff', (req, res) => {
  res.json(hrStaffDirectory);
});

app.post('/api/admin/hr/leaves/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED | REJECTED
  const leave = hrLeaves.find(l => l.id === id);
  if (leave) {
    leave.status = status;
  }
  res.json(leave || { error: 'Leave not found' });
});

// 3. Create a transaction (Buy Safely payment link trigger)
app.post('/api/transactions', (req, res) => {
  const {
    buyerPhone,
    buyerEmail,
    buyerName,
    buyerAccountType,
    buyerNationalId,
    isNotRecipient,
    recipientDetails,
    sellerPhone,
    sellerHandle,
    socialPlatform,
    amount,
    description,
    quantity,
    shippingMethod,
    shippingFee,
    totalAmount,
    paymentNetwork,
    shippingDetails,
    orderStatus,
    deliveryPartnerId,
    deliveryPartnerName,
    deliveryPartnerType,
    deliveryStatus,
    deliveryPin,
    deliveryPinEntered,
    insurancePolicy,
    insuranceOption,
    insurancePremium,
    insurancePaidBy,
  } = req.body;

  if (!buyerPhone || !sellerPhone || !sellerHandle || !amount || !description) {
    return res.status(400).json({ error: 'Missing required link parameters.' });
  }

  const amt = parseFloat(amount);
  const qty = parseInt(quantity) || 1;
  const shipFee = parseFloat(shippingFee) || 0;
  const subtotal = amt * qty;
  const protectionFee = 0; // FREE escrow protection for buyers (already 0)
  const platformFee = Math.max(Math.round(subtotal * 0.01), 25); // 1% of transaction value, min Ksh 25
  const calcTotal = subtotal + shipFee + platformFee;

  const finalTotal = parseFloat(totalAmount) || calcTotal;
  const finalNetwork = paymentNetwork || 'mpesa';

  const formatNetwork = finalNetwork === 'mpesa' ? 'M-Pesa' : finalNetwork === 'airtel' ? 'Airtel Money' : 'T-Cash';

  const newTx: Transaction = {
    id: `BS-KSH-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    buyerPhone,
    buyerEmail: buyerEmail || '',
    buyerName: buyerName || 'Guest User',
    buyerAccountType: buyerAccountType || 'GUEST',
    buyerNationalId: buyerNationalId || '',
    isNotRecipient: isNotRecipient !== undefined ? isNotRecipient : false,
    recipientDetails: recipientDetails || {
      name: buyerName || 'Guest User',
      phone: buyerPhone,
      address: shippingMethod === 'Courier' ? `${shippingDetails?.county || 'Nairobi'}, ${shippingDetails?.town || 'Kilimani'}, ${shippingDetails?.address || ''}` : (shippingMethod === 'Pickup' ? 'Self Collect' : 'Seller Delivery'),
      relationship: 'Self'
    },
    sellerPhone,
    sellerHandle: sellerHandle.startsWith('@') ? sellerHandle : `@${sellerHandle}`,
    socialPlatform: socialPlatform || 'WhatsApp',
    amount: amt * qty, // Subtotal store item portion
    fee: protectionFee,
    platformFee,
    description: `${description} (Qty: ${qty})`,
    status: 'PENDING_DEPOSIT',
    countdownHours: 48,
    riskScore: Math.floor(10 + Math.random() * 20),
    buyerTrustScore: 95,
    sellerTrustScore: 90,
    securityScorecard: {
      velocityLimitPassed: true,
      deviceFingerprintScore: 95,
      simSwapRisk: 'LOW',
      ipLocationMatch: true,
      overallRisk: 12,
    },
    // Insurance Parameters
    insurancePolicy: insurancePolicy || 'NONE',
    insuranceOption: insuranceOption || 'NONE',
    insurancePremium: insurancePremium !== undefined ? parseFloat(insurancePremium) : 0,
    insurancePaidBy: insurancePaidBy || 'NONE',
    insuranceClaims: [],
    // New parameters saved in memory ledger
    quantity: qty,
    shippingMethod,
    shippingFee: shipFee,
    totalAmount: finalTotal,
    paymentNetwork: finalNetwork,
    shippingDetails,
    orderStatus: orderStatus || 'ORDER_CREATED',
    // Logistics Partner defaults or checkout data
    deliveryPartnerId,
    deliveryPartnerName,
    deliveryPartnerType,
    deliveryPin: deliveryPin || Math.floor(100000 + Math.random() * 900000).toString(),
    deliveryPinEntered: deliveryPinEntered !== undefined ? deliveryPinEntered : false,
    deliveryStatus: deliveryStatus || (shippingMethod === 'Courier' ? 'PICKUP_REQUESTED' : undefined),
    escrowModel: 'model_1', 
    deliveryBids: shippingMethod === 'Courier' ? [
      {
        id: `BID-${Math.floor(1001 + Math.random() * 8000)}`,
        partnerId: 'DP-001',
        partnerName: 'Rider John (Boda Dispatch)',
        partnerType: 'RIDER',
        bidAmount: 220,
        estimatedHours: 1,
        trustScore: 98,
        deliveryCount: 342
      },
      {
        id: `BID-${Math.floor(1001 + Math.random() * 8000)}`,
        partnerId: 'DP-002',
        partnerName: 'Driver Mary (City Probox)',
        partnerType: 'DRIVER',
        bidAmount: 380,
        estimatedHours: 3,
        trustScore: 96,
        deliveryCount: 120
      },
      {
        id: `BID-${Math.floor(1001 + Math.random() * 8000)}`,
        partnerId: 'DP-003',
        partnerName: 'Picker Alex (Safety Inspector)',
        partnerType: 'PICKER',
        bidAmount: 300,
        estimatedHours: 2,
        trustScore: 99,
        deliveryCount: 88
      }
    ] : [],
    history: [
      {
        timestamp: new Date().toISOString(),
        status: 'PENDING_DEPOSIT',
        title: 'Buy Safely Order Received',
        description: `Secure checkout complete. Order total: Ksh ${finalTotal.toLocaleString()} (${qty}x @ Ksh ${amt.toLocaleString()} + Ksh ${shipFee} shipment). Created with status: ORDER_CREATED.`,
        actor: 'SYSTEM',
      },
      {
        timestamp: new Date().toISOString(),
        status: 'PENDING_DEPOSIT',
        title: `${formatNetwork} STK Push Triggered`,
        description: `Initiated STK Push request to payment number ${buyerPhone} for Ksh ${finalTotal.toLocaleString()}. Status updated to PAYMENT_PENDING.`,
        actor: 'SYSTEM',
      },
    ],
  };

  transactions.unshift(newTx);
  
  // Apply cost-optimized SMS/Platform notification strategy
  addSimulatedSMS(newTx.buyerPhone, `Your Safe Buy transaction has been created: "${newTx.description}". Order ID: ${newTx.id}. Total Amount: Ksh ${newTx.totalAmount.toLocaleString()}.`);
  addSimulatedNotification(
    'SELLER',
    'INFO',
    'New Order Received (Pending Escrow)',
    `A secure checkout link has been generated by @buysafely for payment Ksh ${newTx.amount.toLocaleString()}. Waiting for the buyer to deposit escrow.`,
    'vault',
    newTx.id
  );
  addSimulatedNotification(
    'SYSTEM_ADMIN',
    'INFO',
    'Secure Escrow Ledger Opened',
    `New escrow ledger opened for checkout ID ${newTx.id}. Fee: Ksh ${newTx.fee}. Platform Fee: Ksh ${newTx.platformFee}. Status initialized: PENDING_DEPOSIT.`,
    'ops',
    newTx.id
  );

  res.status(201).json(newTx);
});

// 4. Simulate M-Pesa payment STK push completion
app.post('/api/transactions/:id/deposit', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  tx.status = 'ESCROW_HELD';
  tx.orderStatus = 'ESCROW_FUNDED';
  const timestamp = new Date().toISOString();
  tx.history.push({
    timestamp,
    status: 'ESCROW_HELD',
    title: 'M-Pesa STK Push Verified',
    description: `Transaction receipt #MP-${Math.random().toString(36).substring(3, 10).toUpperCase()} verified via Central Safaricom Daraja Webhook. Escrow wallet locked (Status: ESCROW_FUNDED).`,
    actor: 'BUYER',
  });

  // Communication strategy triggers
  addSimulatedSMS(tx.buyerPhone, `Your Safe Buy payment of Ksh ${tx.totalAmount?.toLocaleString()} is secured in NCBA Trust escrow. Order ID: ${tx.id}. (Status: ESCROW_FUNDED).`);
  addSimulatedNotification(
    'SELLER',
    'ACTION_REQUIRED',
    'Escrow Funded & Locked',
    `Safaricom Daraja STK Push verified. Escrow is safely secured in NCBA custody. You are now cleared to ship: "${tx.description}".`,
    'vault',
    tx.id
  );
  addSimulatedNotification(
    'SYSTEM_ADMIN',
    'INFO',
    'STK Push Reconciled Successfully',
    `Webhook verification passed for ${tx.id}. NCBA Custody settlement holding incremented: Ksh ${tx.amount}.`,
    'ops',
    tx.id
  );

  res.json(tx);
});

// 4b. Lodge shipping insurance claim for cargo loss or transit damage
app.post('/api/transactions/:id/claim', (req, res) => {
  const { id } = req.params;
  const { type, evidenceNotes, evidencePhotos } = req.body;
  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const claimId = `CLM-${Math.floor(100 + Math.random() * 900)}`;
  const claim = {
    id: claimId,
    type: (type === 'LOSS' ? 'LOSS' : 'DAMAGE') as 'DAMAGE' | 'LOSS',
    status: 'SUBMITTED' as 'SUBMITTED' | 'UNDER_REVIEW' | 'AWAITING_EVIDENCE' | 'APPROVED' | 'REJECTED' | 'PAID',
    submittedAt: new Date().toISOString(),
    evidenceNotes: evidenceNotes || '',
    evidencePhotos: evidencePhotos || [],
  };

  tx.insuranceClaimStatus = 'SUBMITTED';
  if (!tx.insuranceClaims) {
    tx.insuranceClaims = [];
  }
  tx.insuranceClaims.push(claim);

  // Generate support ticket representing the insurance claim
  const newTicket = {
    id: `CRM-${Math.floor(100 + Math.random() * 900)}`,
    customer: tx.buyerPhone,
    category: 'SHIPPING_INSURANCE_CLAIM',
    urgency: 'High',
    status: 'NEW',
    assignedTo: 'Mike Otieno',
    message: `[SHIPPING INSURANCE CLAIM] ${claim.type === 'LOSS' ? 'Lost Shipment' : 'Transit Damage'} filed. Evidence details: ${claim.evidenceNotes}. Claim ID: ${claim.id}. Policy Ref: Jubilee Safe Buy`,
    createdAt: new Date().toISOString(),
    amount: tx.amount || 0,
    transactionId: tx.id || '',
    attachments: evidencePhotos || [],
    communications: [
      { sender: 'System Intake', role: 'SYSTEM', text: `Insurance Claim ${claim.id} received. Auto-filed with Jubilee underwriters.`, timestamp: new Date().toISOString() }
    ],
    history: [
      { user: 'System Ingest', role: 'SYSTEM', timestamp: new Date().toISOString(), previousStatus: 'NONE', newStatus: 'NEW', notes: `Insurance claim registered against transaction ${tx.id}.` }
    ],
    report: {
      caseSummary: `Claim filed for ${claim.type}. Action path covers underwriter disbursement or shipper liability check.`,
      partiesInvolved: { buyer: tx.buyerName, seller: tx.sellerHandle, courier: tx.deliveryPartnerName || 'Assigned Courier', picker: 'N/A' },
      evidenceReviewed: [],
      findings: `Assessing ${claim.type} on cargo parcel. Evidence provided: ${claim.evidenceNotes}`,
      recommendation: ''
    },
    decision: { outcome: '', justification: '', financialAction: '' }
  };
  crmTickets.unshift(newTicket);

  // Add event to transaction history
  tx.history.push({
    timestamp: new Date().toISOString(),
    status: tx.status,
    title: 'Shipping Insurance Claim Lodged',
    description: `Filed ${claim.type === 'DAMAGE' ? 'Transit Damage' : 'Lost Shipment'} claim ${claim.id} with underwriter under policy. Status: SUBMITTED.`,
    actor: 'BUYER'
  });

  res.json({ success: true, claim, transaction: tx });
});

// 5. Update shipping status & supply tracking detail
app.post('/api/transactions/:id/ship', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { carrierName } = req.body;
  tx.status = 'ITEMS_SHIPPED';
  tx.orderStatus = 'SHIPPED';
  tx.shippingProofUrl = `${carrierName || 'boda_dispatch'}_receipt.png`;

  const timestamp = new Date().toISOString();
  tx.history.push({
    timestamp,
    status: 'ITEMS_SHIPPED',
    title: 'Goods Dispatched by Seller',
    description: `Shipping declared via ${carrierName || 'Local Messenger / Ride Boda'}. Preliminary AI tracking verify active. Waiting for buyer confirmation (Status: SHIPPED).`,
    actor: 'SELLER',
  });

  // Communication strategy triggers
  addSimulatedSMS(tx.buyerPhone, `Seller has dispatched your order via ${carrierName || 'boda transport'}. Delivery confirmation PIN is: ${tx.deliveryPin}. Give this PIN to the courier ONLY upon safe handover!`);
  addSimulatedNotification(
    'COURIER',
    'INFO',
    'Delivery Package Dispatched',
    `Merchant has packed and declared dispatch for "${tx.description}" via ${carrierName || 'boda dispatch'}. Route optimization active.`,
    'logistics',
    tx.id
  );
  addSimulatedNotification(
    'SYSTEM_ADMIN',
    'INFO',
    'Waybill OCR Scanner Ready',
    `Merchant waybill uploaded for ${tx.id}. Multimodal AI vision engine holding verification slot.`,
    'ops',
    tx.id
  );

  res.json(tx);
});

// 6. Release escrow funds to seller
app.post('/api/transactions/:id/release', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  tx.status = 'FUNDS_RELEASED';
  tx.orderStatus = 'RELEASED';
  tx.countdownHours = 0;
  const timestamp = new Date().toISOString();
  tx.history.push({
    timestamp,
    status: 'FUNDS_RELEASED',
    title: 'Escrow Released to Seller Wallet',
    description: `Buyer verified receipt. Safe disbursal initiated via M-Pesa B2C payout API into seller terminal: ${tx.sellerPhone} (Status: RELEASED).`,
    actor: 'BUYER',
  });

  // Communication strategy triggers
  addSimulatedSMS(tx.buyerPhone, `Transaction complete. Your NCBA Trust escrow fund (Ksh ${tx.amount.toLocaleString()}) has been released successfully to the seller. Thank you for using Buy Safely!`);
  addSimulatedNotification(
    'SELLER',
    'INFO',
    'Escrow Released - Funds Sent!',
    `M-Pesa B2C Payout verified. Ksh ${tx.amount.toLocaleString()} has been credited to your linked business number: ${tx.sellerPhone}.`,
    'vault',
    tx.id
  );
  addSimulatedNotification(
    'FINANCE',
    'INFO',
    'B2C Settlement Completed',
    `Reconciliation audit: Disbursed merchant subtotal Ksh ${tx.amount} and collected fees (Ksh ${tx.fee} + Ksh ${tx.platformFee}) for ${tx.id}.`,
    'ops',
    tx.id
  );
  if (tx.deliveryPartnerId) {
    addSimulatedNotification(
      'COURIER',
      'INFO',
      'Logistics Payout Released',
      `Courier fee payout successfully disbursed to linked account for rider/carrier on ${tx.id}.`,
      'logistics',
      tx.id
    );
  }

  res.json(tx);
});

// 7. Dispute transaction
app.post('/api/transactions/:id/dispute', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { reason } = req.body;
  tx.status = 'DISPUTED';
  tx.orderStatus = 'DISPUTED';
  tx.countdownHours = 0;
  const timestamp = new Date().toISOString();
  tx.history.push({
    timestamp,
    status: 'DISPUTED',
    title: 'Dispute Logged & Escrow Frozen',
    description: `Escrow frozen. Dispute trigger reason: "${reason || 'Product not delivered / Counterfeit item received'}". AI Moderation scoring initiated (Status: DISPUTED).`,
    actor: 'BUYER',
  });

  // Communication strategy triggers
  addSimulatedSMS(tx.buyerPhone, `Your dispute has been received. Your escrow fund of Ksh ${tx.amount.toLocaleString()} is frozen and has been put under immediate review. Case ID: ${tx.id}.`);
  addSimulatedNotification(
    'SELLER',
    'ESCALATION',
    'Transaction Disputed - Escrow Frozen',
    `The buyer has raised a formal dispute for Order ${tx.id}. Escrow funds are frozen under safeguarding locks pending resolution.`,
    'vault',
    tx.id
  );
  addSimulatedNotification(
    'CRM',
    'ACTION_REQUIRED',
    'Dispute Ticket Intake Route',
    `Filing investigation ticket for dispute on ${tx.id}. System assigned SLA countdown of 24 hours. Reason: "${reason || 'N/A'}"`,
    'ops',
    tx.id
  );

  res.json(tx);
});

// 8. Refund buyer
app.post('/api/transactions/:id/refund', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  tx.status = 'REFUNDED';
  tx.orderStatus = 'REFUNDED';
  tx.countdownHours = 0;
  const timestamp = new Date().toISOString();
  tx.history.push({
    timestamp,
    status: 'REFUNDED',
    title: 'Escrow Refund Approved & Disbursed',
    description: `Dispute investigation completed. Safe rollback verified. Ksh ${tx.amount} disbursed back to buyer mobile money wallet (Status: REFUNDED).`,
    actor: 'HUMAN_MODERATOR',
  });

  // Communication strategy triggers
  addSimulatedSMS(tx.buyerPhone, `Your refund of Ksh ${tx.amount.toLocaleString()} for transaction ${tx.id} has been processed successfully. The funds will appear in your mobile wallet shortly.`);
  addSimulatedNotification(
    'SELLER',
    'INFO',
    'Dispute Case Refunded',
    `Dispute investigation on Order ${tx.id} resolved. Escrow has been rolled back and refunded to the buyer.`,
    'vault',
    tx.id
  );
  addSimulatedNotification(
    'FINANCE',
    'INFO',
    'Refund Rolled Back Reconciled',
    `Escrow reversal completed: Ksh ${tx.amount} returned to buyer linked account for transaction ${tx.id}. Fees waived/refunded.`,
    'ops',
    tx.id
  );

  res.json(tx);
});

// Extra: Manual advancement of fine-grained order tracking statuses for testing
app.post('/api/transactions/:id/status', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { orderStatus } = req.body;
  if (orderStatus) {
    tx.orderStatus = orderStatus;
    
    // Synced base state transition in case it matches certain milestones
    if (orderStatus === 'ORDER_CREATED') {
      tx.status = 'PENDING_DEPOSIT';
    } else if (orderStatus === 'PAYMENT_PENDING') {
      tx.status = 'PENDING_DEPOSIT';
    } else if (orderStatus === 'ESCROW_FUNDED' || orderStatus === 'PAID_PENDING_FULFILLMENT') {
      tx.status = 'ESCROW_HELD';
    } else if (orderStatus === 'PROCESSING' || orderStatus === 'READY_FOR_PICKUP') {
      tx.status = 'ESCROW_HELD';
    } else if (orderStatus === 'SHIPPED' || orderStatus === 'OUT_FOR_DELIVERY') {
      tx.status = 'ITEMS_SHIPPED';
    } else if (orderStatus === 'DELIVERED' || orderStatus === 'AWAITING_CONFIRMATION') {
      tx.status = 'ITEMS_SHIPPED';
    } else if (orderStatus === 'RELEASED') {
      tx.status = 'FUNDS_RELEASED';
    } else if (orderStatus === 'DISPUTED') {
      tx.status = 'DISPUTED';
    } else if (orderStatus === 'REFUNDED') {
      tx.status = 'REFUNDED';
    }

    const timestamp = new Date().toISOString();
    tx.history.push({
      timestamp,
      status: tx.status,
      title: `Order Tracking Advanced: ${orderStatus.replace(/_/g, ' ')}`,
      description: `Seller or logistics system updated tracking status to matches ${orderStatus.replace(/_/g, ' ')}. Sandbox simulation log initialized active.`,
      actor: 'SYSTEM',
    });
  }
  res.json(tx);
});

// --- BUY SAFELY VERIFIED PRODUCT INSPECTION PROGRAM ENDPOINTS ---

// Fetch all registered/verified products
app.get('/api/verified-products', (req, res) => {
  res.json(verifiedProducts);
});

// Create/Register a product listing
app.post('/api/verified-products/create', (req, res) => {
  const { title, category, price, description, sellerHandle, sellerPhone } = req.body;
  if (!title || !category || !price) {
    return res.status(400).json({ error: 'Missing core product details (title, category, price)' });
  }

  const newProduct: VerifiedProduct = {
    id: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    category,
    price: Number(price),
    description: description || '',
    sellerHandle: sellerHandle || '@anonymous_seller',
    sellerPhone: sellerPhone || '254700000000',
    verificationStatus: 'UNVERIFIED',
    bulkPlanSubscribed: 'NONE',
    isFeatured: false
  };

  verifiedProducts.push(newProduct);
  res.status(201).json(newProduct);
});

// Request Trust Auditor Verification for a product
app.post('/api/verified-products/:id/request', (req, res) => {
  const product = verifiedProducts.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { tier, fee, auditorId, auditorName } = req.body;
  
  product.verificationStatus = 'AUDITOR_ASSIGNED';
  product.verificationTier = tier || 'STANDARD';
  product.verificationFee = Number(fee) || 450;
  product.auditorId = auditorId || 'DP-003';
  product.auditorName = auditorName || 'Picker Alex (Safety Inspector)';

  res.json(product);
});

// Submit verification report (completed by Picker Auditor)
app.post('/api/verified-products/:id/submit-report', (req, res) => {
  const product = verifiedProducts.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { condition, functionalPass, serialNumber, notes, outcome } = req.body;

  product.verificationStatus = 'INSPECTION_COMPLETED';
  product.verificationReport = {
    productName: product.title,
    category: product.category,
    sellerId: product.sellerHandle,
    condition: condition || 'Good',
    functionalPass: !!functionalPass,
    serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: notes || 'Product verified on-site. Condition matches parameters.',
    outcome: outcome || 'Verified',
    submittedAt: new Date().toISOString()
  };

  res.json(product);
});

// Approve verification and issue the Badge & Validity period
app.post('/api/verified-products/:id/approve', (req, res) => {
  const product = verifiedProducts.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const validityDays: Record<string, number> = {
    'Electronics & Gadgets': 30,
    'Furniture & Living': 60,
    'Machinery & Tools': 30,
    'Vehicles & Motors': 14,
    'Apparel & Fashion': 30,
    'Other Products': 30
  };

  const days = validityDays[product.category] || 30;
  product.verificationStatus = 'VERIFIED';
  product.verifiedAt = new Date().toISOString();
  product.expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
  product.isFeatured = true;

  res.json(product);
});

// Buy a bulk merchant store package
app.post('/api/verified-products/subscribe-bulk', (req, res) => {
  const { sellerHandle, planName } = req.body;
  if (!sellerHandle || !planName) {
    return res.status(400).json({ error: 'Missing sellerHandle or planName' });
  }

  // Set subscription plans on any products belonging to this seller
  verifiedProducts.forEach(p => {
    if (p.sellerHandle === p.sellerHandle) {
      p.bulkPlanSubscribed = planName.toUpperCase() as any;
    }
  });

  res.json({ success: true, planName, sellerHandle });
});

// --- LOGISTICS & INTEGRATED DELIVERY ECOSYSTEM ENDPOINTS ---

// List all logistics partners
app.get('/api/logistics/partners', (req, res) => {
  res.json(deliveryPartners);
});

// Register a new partner (Individual or Courier)
app.post('/api/logistics/partners/register', (req, res) => {
  const { name, phone, type, vehicleDetails, nationalId, drivingLicense, emergencyContact, isCourierCompany, companyReg, kraPin, servicePricing } = req.body;
  
  if (!name || !phone || !type) {
    return res.status(400).json({ error: 'Missing core registration information.' });
  }

  const newPartner: DeliveryPartner = {
    id: `DP-00${deliveryPartners.length + 1}`,
    name,
    phone,
    type: type.toUpperCase() as 'COURIER' | 'RIDER' | 'DRIVER' | 'PICKER',
    avatar: type.toUpperCase() === 'COURIER' || isCourierCompany ? '🏢' : '👤',
    nationalId: nationalId || companyReg || `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
    isVerified: true,
    trustScore: 90 + Math.floor(Math.random() * 10),
    completedDeliveries: 0,
    disputeRate: 0,
    onTimeRate: 100,
    feedbackScore: 100,
    vehicleDetails: vehicleDetails || (isCourierCompany ? `Courier Fleet: ${servicePricing || 'Standard rates'}` : 'On-Foot'),
    drivingLicense: drivingLicense || (isCourierCompany ? kraPin : 'N/A'),
    emergencyContact: emergencyContact || 'N/A',
    availability: 'ONLINE',
    aiRiskScore: 1
  };

  deliveryPartners.push(newPartner);
  res.status(201).json(newPartner);
});

// Post a bidder competitive amount
app.post('/api/transactions/:id/bid', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  
  const { partnerId, bidAmount, estimatedHours } = req.body;
  const partner = deliveryPartners.find(p => p.id === partnerId);
  if (!partner) return res.status(404).json({ error: 'Logistics partner not found' });

  if (!tx.deliveryBids) {
    tx.deliveryBids = [];
  }

  const existingBidIdx = tx.deliveryBids.findIndex(b => b.partnerId === partnerId);
  const newBid: DeliveryBid = {
    id: `BID-${Math.floor(1001 + Math.random() * 8000)}`,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerType: partner.type,
    bidAmount: parseFloat(bidAmount) || 250,
    estimatedHours: parseInt(estimatedHours) || 2,
    trustScore: partner.trustScore,
    deliveryCount: partner.completedDeliveries
  };

  if (existingBidIdx >= 0) {
    tx.deliveryBids[existingBidIdx] = newBid;
  } else {
    tx.deliveryBids.push(newBid);
  }

  tx.history.push({
    timestamp: new Date().toISOString(),
    status: tx.status,
    title: `Competitive Bid Received`,
    description: `Independent Partner ${partner.name} placed a competitive bid of Ksh ${newBid.bidAmount.toLocaleString()} to fulfill this transaction (Est: ${newBid.estimatedHours} Hours).`,
    actor: 'SYSTEM'
  });

  res.json(tx);
});

// Accept a specific competitive bid
app.post('/api/transactions/:id/accept-bid', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { partnerId, bidAmount, escrowModel } = req.body;
  const partner = deliveryPartners.find(p => p.id === partnerId);
  if (!partner) return res.status(404).json({ error: 'Logistics partner not found' });

  tx.deliveryPartnerId = partner.id;
  tx.deliveryPartnerName = partner.name;
  tx.deliveryPartnerType = partner.type;
  tx.deliveryStatus = 'COURIER_ASSIGNED';
  tx.shippingFee = parseFloat(bidAmount) || tx.shippingFee || 250;
  tx.escrowModel = escrowModel || 'model_1';

  // Recalculate billing
  if (tx.amount) {
    const subtotal = tx.amount; 
    const pFee = tx.fee;
    const shipFee = tx.shippingFee || 0;
    
    if (tx.escrowModel === 'model_1') {
      tx.totalAmount = subtotal + shipFee + pFee;
    } else {
      tx.totalAmount = subtotal + pFee; 
    }
  }

  tx.history.push({
    timestamp: new Date().toISOString(),
    status: tx.status,
    title: `Delivery Logistics Partner Paired`,
    description: `Matched & locked carrier contract: ${partner.name} (${partner.type}) is assigned to dispatch. Delivery escrow mode configured: ${tx.escrowModel === 'model_1' ? 'Model 1 (Buyer Pays Delivery Escrow)' : 'Model 2 (Seller Pays Delivery Escrow)'}. Shipping fee set to Ksh ${tx.shippingFee.toLocaleString()}.`,
    actor: 'SYSTEM'
  });

  // Communication & Notification strategy triggers
  addSimulatedSMS(tx.buyerPhone, `Premium Logistics: Courier ${partner.name} (${partner.type === 'RIDER' ? 'Boda' : partner.type}) has been assigned to dispatch your order ${tx.id}. Your Safe Buy confirmation PIN is: ${tx.deliveryPin}. Give this PIN to the courier ONLY upon safe handover!`);
  addSimulatedNotification(
    'COURIER',
    'ACTION_REQUIRED',
    'Job Assigned - Pickup Pending',
    `You have been paired with dispatch order ${tx.id} for seller ${tx.sellerHandle}. Proceed to pick up package. Fee: Ksh ${tx.shippingFee}.`,
    'logistics',
    tx.id
  );
  addSimulatedNotification(
    'SELLER',
    'INFO',
    'Courier Partner On the Way',
    `Courier ${partner.name} has accepted dispatch. Preparing pickup collection for Order ${tx.id}.`,
    'vault',
    tx.id
  );

  res.json(tx);
});

// Post a Picker Inspection Report
app.post('/api/transactions/:id/picker-report', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { conditionReport, pickerId } = req.body;
  const partner = deliveryPartners.find(p => p.id === pickerId) || deliveryPartners.find(p => p.type === 'PICKER') || deliveryPartners[2];
  
  tx.pickerInspected = true;
  tx.pickerReport = conditionReport || 'Product physically verified at seller premise. Condition matches description, structure confirmed fully functional.';
  tx.pickerFee = 350; 

  tx.history.push({
    timestamp: new Date().toISOString(),
    status: tx.status,
    title: `Local Inspection Verified by Picker`,
    description: `Independent Picker ${partner.name} completed physical inspection at pickup coordinates: "${tx.pickerReport}". Product authenticity confirmed.`,
    actor: 'SYSTEM'
  });

  // Communication & Notification strategy triggers
  addSimulatedSMS(tx.buyerPhone, `Quality Audit Passed: Trust Auditor ${partner.name} has physically verified the build authenticity and checked the serial numbers of product for trans ${tx.id}. Status: APPROVED.`);
  addSimulatedNotification(
    'PICKER',
    'INFO',
    'Inspection Report Submitted',
    `Inspection report checklist for Order ${tx.id} compiled and locked. Net payout credit Ksh ${tx.pickerFee} queued.`,
    'logistics',
    tx.id
  );
  addSimulatedNotification(
    'SELLER',
    'INFO',
    'Product Audit Approved',
    `Independent picker report submitted successfully for Order ${tx.id}. Authenticity Verified.`,
    'vault',
    tx.id
  );

  res.json(tx);
});

// Update delivery tracking milestone 
app.post('/api/transactions/:id/delivery-milestone', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { status, signature, photoUrl } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing milestone status.' });

  tx.deliveryStatus = status;

  if (signature) tx.deliveryAgentSignature = signature;
  if (photoUrl) tx.deliveryAgentPhotoUrl = photoUrl;

  let routeAnomalies: string[] = [];
  tx.deliveryRiskScore = Math.floor(1 + Math.random() * 8);

  if (status === 'IN_TRANSIT') {
    tx.orderStatus = 'OUT_FOR_DELIVERY';
    tx.status = 'ITEMS_SHIPPED';
  } else if (status === 'DELIVERED') {
    tx.orderStatus = 'DELIVERED';
    tx.status = 'ITEMS_SHIPPED';
    
    const timeDelta = Date.now() - new Date(tx.createdAt).getTime();
    if (timeDelta < 180000) { 
      tx.deliveryRiskScore = 78; 
      routeAnomalies.push("Velocity matching flag: Delivery submitted exceptionally quick for destination distance. Flagged for verification PIN challenge.");
    }
  }

  const formattedStatus = status.replace(/_/g, ' ');
  tx.history.push({
    timestamp: new Date().toISOString(),
    status: tx.status,
    title: `Logistics Dispatch: ${formattedStatus}`,
    description: `Courier status updated to ${formattedStatus}. GPS waypoints logged successfully.${routeAnomalies.length > 0 ? ' [AI WARNING: ' + routeAnomalies.join(', ') + ']' : ''}`,
    actor: 'SYSTEM'
  });

  res.json(tx);
});

// Decline courier job simulation
app.post('/api/transactions/:id/decline-courier', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const prevCourier = tx.deliveryPartnerName || 'Rider John (Boda Dispatch)';
  const prevId = tx.deliveryPartnerId || 'DP-001';

  tx.deliveryStatus = 'PICKUP_REQUESTED'; 
  tx.deliveryPartnerId = undefined; // set undefined to show alternative marketplace selection
  tx.deliveryPartnerName = undefined;

  tx.history.push({
    timestamp: new Date().toISOString(),
    status: tx.status,
    title: `Logistics Job Declined`,
    description: `Assigned courier ${prevCourier} (ID: ${prevId}) declined the transit job. Order returned to marketplace. Presenting alternative couriers. Escrow remains funded.`,
    actor: 'SYSTEM'
  });

  res.json(tx);
});

// Admin override of courier assignment with mandatory audit log
app.post('/api/transactions/:id/override-courier', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { newCourierId, newCourierName, newCourierType, reason, actor } = req.body;
  if (!newCourierId || !newCourierName) {
    return res.status(400).json({ error: 'Missing new courier details.' });
  }

  const prevCourierName = tx.deliveryPartnerName || 'None / Not Assigned';
  const prevCourierId = tx.deliveryPartnerId || 'N/A';
  
  tx.deliveryPartnerId = newCourierId;
  tx.deliveryPartnerName = newCourierName;
  tx.deliveryPartnerType = newCourierType || 'RIDER';
  tx.deliveryStatus = 'COURIER_ASSIGNED';

  tx.history.push({
    timestamp: new Date().toISOString(),
    status: tx.status,
    title: `Admin Override: Logistics Reassignment`,
    description: `Admin ${actor || '@admin_cbk'} overrode courier assignment. Previous: ${prevCourierName} (ID: ${prevCourierId}) -> New: ${newCourierName} (ID: ${newCourierId}). Reason: "${reason || 'Operational Optimization'}".`,
    actor: 'HUMAN_MODERATOR'
  });

  res.json(tx);
});

// OTP validation & funds release
app.post('/api/transactions/:id/validate-pin', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'Verification PIN is required for secure handover.' });

  if (tx.deliveryPin && tx.deliveryPin !== pin.trim()) {
    tx.history.push({
      timestamp: new Date().toISOString(),
      status: tx.status,
      title: `OTP Handover Failed`,
      description: `Delivery partner submitted invalid verification PIN attempt: "${pin}". Access blocked.`,
      actor: 'SYSTEM'
    });
    return res.status(400).json({ error: 'Verification PIN matches failed. Handover authorization blocked.' });
  }

  tx.deliveryPinEntered = true;
  tx.deliveryStatus = 'CONFIRMED';
  tx.status = 'FUNDS_RELEASED';
  tx.orderStatus = 'RELEASED';
  tx.countdownHours = 0;

  const courierRate = tx.shippingFee || 250;
  const platformCommission = Math.ceil(courierRate * 0.10); // 10% Buy Safely fee
  const partnerPayout = courierRate - platformCommission;

  tx.history.push({
    timestamp: new Date().toISOString(),
    status: 'FUNDS_RELEASED',
    title: `PIN Confirmed: Secure Handover Match`,
    description: `Recipient validation matched successfully. Handover PIN ${pin} cleared. Escrow wallet assets disengaged.`,
    actor: 'SYSTEM'
  });

  tx.history.push({
    timestamp: new Date().toISOString(),
    status: 'FUNDS_RELEASED',
    title: `Logistics Cash Flows Cleared`,
    description: `Executed logistics settlement: disbursed product escrow Ksh ${tx.amount.toLocaleString()} to seller handle ${tx.sellerHandle}. Disbursed courier delivery fee of Ksh ${courierRate.toLocaleString()} to carrier ${tx.deliveryPartnerName || 'Logistics Partner'}.`,
    actor: 'SYSTEM'
  });

  res.json(tx);
});

// 9. Real AI image analysis using server-side Gemini SDK
app.post('/api/transactions/:id/analyze-proof', async (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { imageBase64, expectedAmount } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Please select or upload a screenshot for AI validation.' });
  }

  // Retrieve Gemini Client (lazy load)
  const ai = getGeminiClient();

  if (!ai) {
    // High-fidelity sandbox mode if API key is not configured yet
    const simulatedResponse = {
      verified: true,
      confidence: 94,
      extractedMpesaCode: 'SD89' + Math.random().toString(36).substring(3, 7).toUpperCase(),
      extractedCarrier: 'Sendy Courier Kenya',
      merchantName: tx.sellerHandle,
      detectedText: `SENDY EXPRESS SERVICES - CONFIRMED DELIVERED. ORDER ID: ${tx.id}. VALUE: KSH ${tx.amount}. SIGNED: BY CUSTOMER. STATUS: COMPLETED`,
      flaggedAnomalies: [],
      fraudScore: 3,
    };

    tx.receiptAnalysis = simulatedResponse;
    const timestamp = new Date().toISOString();
    tx.history.push({
      timestamp,
      status: 'ITEMS_SHIPPED',
      title: 'AI Proof Analysis (Sandbox)',
      description: `Mock AI inspection verified. Extracted carrier: "${simulatedResponse.extractedCarrier}" with confidence of ${simulatedResponse.confidence}%. No counterfeit/manipulation markers detected on screenshot.`,
      actor: 'AI_MODERATOR',
    });

    return res.json({
      success: true,
      sandbox: true,
      result: simulatedResponse,
    });
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const promptInstructions = `
      You are the "Buy Safely African Social Commerce AI Integrity Engine", specialized in detecting and verifying fulfillment, delivery, or money receipts in East African fintech (specifically Kenya).
      Analyze this image which is claiming to be proof of carrier shipping, boda boda delivery, courier receipt, WhatsApp text confirmation containing delivery stamps, or a Safaricom M-Pesa receipt.
      
      Verify against these expected conditions:
      - We expect transaction item value around Ksh ${expectedAmount || tx.amount}.
      - Check for visual artifacts indicating photoshopping or digital editing of prices, phone numbers, or dates.
      - Check if this is an unrelated image (e.g., random view, screenshot of game, etc.)

      Provide output in STRICT JSON format with EXACTLY these fields:
      {
        "verified": boolean,
        "confidence": number, // an integer from 0 to 100
        "extractedMpesaCode": string or null, // extract Safaricom Mpesa transactional code like RTH782910 if present
        "extractedCarrier": string or null, // e.g. Fargo Courier, Sendy, DHL, Bolt Boda, SafeBoda, WhatsApp, Airtel etc
        "merchantName": string or null, // extracted business or handle
        "detectedText": string, // brief summary of important text read from the image
        "flaggedAnomalies": string[], // list any anomalies (e.g. "Counterfeit font weights detected near amount", "No delivery details found")
        "fraudScore": number // estimated risk 0-100 (where 0 is clean, 100 is absolute fraud)
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64,
          },
        },
        {
          text: promptInstructions,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verified: { type: Type.BOOLEAN },
            confidence: { type: Type.INTEGER },
            extractedMpesaCode: { type: Type.STRING },
            extractedCarrier: { type: Type.STRING },
            merchantName: { type: Type.STRING },
            detectedText: { type: Type.STRING },
            flaggedAnomalies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            fraudScore: { type: Type.INTEGER },
          },
          required: ['verified', 'confidence', 'detectedText', 'flaggedAnomalies', 'fraudScore'],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || '{}');
    tx.receiptAnalysis = parsedResult;
    tx.riskScore = parsedResult.fraudScore;
    
    // Update security dashboard assessment based on dynamic results
    if (tx.securityScorecard) {
      tx.securityScorecard.overallRisk = Math.floor((tx.securityScorecard.overallRisk + parsedResult.fraudScore) / 2);
    }

    const timestamp = new Date().toISOString();
    tx.history.push({
      timestamp,
      status: tx.status,
      title: 'AI Fraud Inspection Completed',
      description: `AI scanned image with confidence of ${parsedResult.confidence}%. Result: Cleared=${parsedResult.verified}. Extracted Carrier: "${parsedResult.extractedCarrier || 'Unknown'}" | Flagged anomalies: ${parsedResult.flaggedAnomalies?.join(', ') || 'None'}.`,
      actor: 'AI_MODERATOR',
    });

    res.json({
      success: true,
      sandbox: false,
      result: parsedResult,
    });
  } catch (error: any) {
    console.error('Gemini proof verification failed:', error);
    res.status(500).json({
      error: 'AI Optical Parsing failed.',
      message: error.message,
    });
  }
});

// 10. Extract product specs from social posts or screenshots using the AI Product Acquisition Engine (PAE)
app.post('/api/social-extract', async (req, res) => {
  const { socialUrl, imageBase64, importMethod } = req.body;
  
  const ai = getGeminiClient();

  // Define fallback/mock PAE logic for sandbox mode when the real Gemini key is not configured.
  // It simulates all 6 layers of PAE, smart price detection, confidence rankings, and recommendations.
  if (!ai) {
    let fallbackTitle = 'Premium Sourced Item';
    let fallbackPrice = 3500;
    let fallbackOriginalText = 'Ksh 3,500';
    let fallbackCategory = 'Apparel & Fashion';
    let fallbackDesc = 'A premium item sourced safely via social commerce channels.';
    let layersApplied = ['Layer 7: Manual Confirmation'];
    let primaryLayerUsed = 'Layer 7: Manual Entry Baseline';
    let confidenceScore = 55;
    let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let highlightedFields: string[] = ['productTitle', 'price', 'category'];
    let brand = 'Generic';
    let colors = ['N/A'];
    let sizes = ['One Size'];
    let creatorName = 'Social Merchant';
    let pageName = 'Social Market';

    const method = importMethod || 'url';

    if (method === 'url' && socialUrl) {
      layersApplied = ['Layer 1: Metadata Extraction', 'Layer 2: Caption & Description Analysis', 'Layer 7: Manual Confirmation'];
      primaryLayerUsed = 'Layer 2: Caption & Description Analysis';
      confidenceScore = 85; 
      confidenceLevel = 'MEDIUM';
      highlightedFields = ['category'];

      const lower = socialUrl.toLowerCase();
      if (lower.includes('shoe') || lower.includes('jordans') || lower.includes('kicks') || lower.includes('sneaker')) {
        fallbackTitle = 'Retro Deadstock Air Jordan Sneakers';
        fallbackPrice = 8500;
        fallbackOriginalText = 'Price: 8500 KES';
        fallbackCategory = 'Footwear & Kicks';
        fallbackDesc = 'Rare classic retro sneakers in excellent condition, verified original silhouette and box accessories.';
        brand = 'Nike';
        colors = ['Black/Red', 'White/Blue'];
        sizes = ['UK 8', 'UK 9', 'UK 10'];
        creatorName = 'Gikomba Kicks Hub';
        pageName = '@gikomba_kicks';
      } else if (lower.includes('jacket') || lower.includes('leather') || lower.includes('thrift') || lower.includes('denim')) {
        fallbackTitle = 'Classic Vintage Oversized Leather Bomber';
        fallbackPrice = 4800;
        fallbackOriginalText = 'Now only 4800';
        fallbackCategory = 'Apparel & Fashion';
        fallbackDesc = 'Heavyweight original cowstride leather bomber coat. Premium brass lining zipper. Classic thrift grade, minimal wear.';
        brand = 'Harley Vintage';
        colors = ['Distressed Brown', 'Classic Black'];
        sizes = ['L', 'XL'];
        creatorName = 'Trendy Thrifts KE';
        pageName = '@trendy_thrifts_ke';
      } else if (lower.includes('phone') || lower.includes('iphone') || lower.includes('gadget') || lower.includes('sony')) {
        fallbackTitle = 'Sony WH-1000XM4 Noise Cancelling Headset';
        fallbackPrice = 18500;
        fallbackOriginalText = 'Ksh 18,500!';
        fallbackCategory = 'Electronics & Gadgets';
        fallbackDesc = 'Superb noise cancelling spatial audios. Pristine functional condition. Comes with original auxiliary jack and carry-case.';
        brand = 'Sony';
        colors = ['Slate Black', 'Silver Gray'];
        sizes = ['Standard fit'];
        creatorName = 'Nairobi Gadget Hub';
        pageName = '@nairobi_gadget_hub';
      } else {
        // Parse from URL slugs
        try {
          const urlObj = new URL(socialUrl);
          const segments = urlObj.pathname.split('/').filter(Boolean);
          if (segments.length > 0) {
            const lastSeg = segments[segments.length - 1].replace(/[-_]/g, ' ');
            if (lastSeg.length > 3) {
              fallbackTitle = lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1);
            }
          }
        } catch (e) { /* ignore */ }
      }
    } else if (method === 'screenshot' || method === 'image') {
      layersApplied = ['Layer 3: AI Image OCR Analysis', 'Layer 5: Screenshot Import Pipeline', 'Layer 7: Manual Confirmation'];
      primaryLayerUsed = 'Layer 3: AI Image OCR Analysis';
      confidenceScore = 92;
      confidenceLevel = 'HIGH';
      highlightedFields = [];

      fallbackTitle = 'Authentic Kenyan Social Thrift Outerwear';
      fallbackPrice = 2500;
      fallbackOriginalText = 'Ksh 2,500';
      fallbackCategory = 'Apparel & Fashion';
      fallbackDesc = 'Discovered via visual upload. Beautifully detailed garment with high durability fabrics, clean stitching, and active social listing tags.';
      brand = 'Kenyan Artisans';
      colors = ['Earth Brown', 'Camel Tan'];
      sizes = ['Medium', 'Large'];
      creatorName = 'Nairobi Style Collective';
      pageName = '@style_collective_ke';
    } else if (method === 'whatsapp') {
      layersApplied = ['Layer 3: AI Image OCR Analysis', 'Layer 6: WhatsApp Catalog Import Engine', 'Layer 7: Manual Confirmation'];
      primaryLayerUsed = 'Layer 6: WhatsApp Catalog Import Engine';
      confidenceScore = 94;
      confidenceLevel = 'HIGH';
      highlightedFields = [];

      fallbackTitle = 'Cosmetic Glycolic Hydration Serum';
      fallbackPrice = 2999;
      fallbackOriginalText = 'Now only 2999';
      fallbackCategory = 'Apparel & Fashion';
      fallbackDesc = 'Imported directly from private merchant catalog screenshot. Restores glow, targets pigmentation, and hydrates intensely.';
      brand = 'The Ordinary';
      colors = ['Clear Liquid'];
      sizes = ['30ml', '50ml'];
      creatorName = '+254 700 112 233';
      pageName = 'Glow Cosmetics Catalog';
    } else if (method === 'video') {
      layersApplied = ['Layer 4: Video Frame Analysis', 'Layer 3: AI Image OCR Analysis', 'Layer 7: Manual Confirmation'];
      primaryLayerUsed = 'Layer 4: Video Frame Analysis';
      confidenceScore = 78;
      confidenceLevel = 'MEDIUM';
      highlightedFields = ['price', 'brand'];

      fallbackTitle = 'Artisanal Hand-crafted Beaded Maasai Sandals';
      fallbackPrice = 1800;
      fallbackOriginalText = 'Maasai Sandals @ 1.8k';
      fallbackCategory = 'Footwear & Kicks';
      fallbackDesc = 'Analyzed from video keyframes. Stunning traditional bead styling, comfortable rubber non-slip bases, perfect for everyday sandals.';
      brand = 'Maasai Handmades';
      colors = ['Multi-color Beaded'];
      sizes = ['EU 38', 'EU 39', 'EU 40'];
      creatorName = '@maasai_beads_art';
      pageName = 'TikTok Video Showcase';
    }

    const simResult = {
      productTitle: fallbackTitle,
      price: fallbackPrice,
      originalPriceText: fallbackOriginalText,
      category: fallbackCategory,
      description: fallbackDesc,
      estimatedRisk: confidenceScore > 85 ? 8 : 18,
      duplicateScamRating: 'No suspicious replication markers. Standard merchant profile matches high reputation scorecards.',
      sellerHandle: socialUrl ? ('@' + (socialUrl.split('instagram.com/')?.[1]?.split('/')?.[0] || 'social_vendor_ke')) : (pageName.startsWith('@') ? pageName : creatorName),
      deliveryTimelineDays: 2,
      colors: colors,
      sizes: sizes,
      deliveryInfo: 'Boda dispatch within Nairobi available or countrywide Fargo Express courier delivery.',
      brand: brand,
      stock: 12,
      creatorName: creatorName,
      pageName: pageName,
      confidenceScore: confidenceScore,
      confidenceLevel: confidenceLevel,
      highlightedFields: highlightedFields,
      confidenceReason: `Fulfillment parameters verified via ${primaryLayerUsed} with ${confidenceScore}% score. All key escrow factors extracted.`,
      layersApplied: layersApplied,
      primaryLayerUsed: primaryLayerUsed,
      suggestions: {
        productTitle: [
          `${fallbackTitle} (Custom Edit)`,
          `Social Exclusive: ${fallbackTitle}`,
          `Original High Quality ${fallbackTitle}`
        ],
        category: [
          'Apparel & Fashion',
          'Footwear & Kicks',
          'Electronics & Gadgets',
          'Home & Decors',
          'Health & Skincare'
        ],
        tags: ['EscrowProtected', 'VerifiedSocialSeller', 'NairobiFashion', 'BuySafelyKe'],
        description: `${fallbackDesc} Hand-sorted by native African vendor. 100% money-back escrow guarantee protected.`
      }
    };

    return res.json({
      success: true,
      sandbox: true,
      result: simResult
    });
  }

  // Real Gemini-3.5-flash AI Model Parser with Vision capabilities
  try {
    let contents: any[] = [];
    let textPrompt = `
      You are the "Buy Safely African Social Commerce AI Product Acquisition Engine (PAE)".
      Your ultimate goal is to achieve extremely high product listing creation success (at least 95% usability), even when direct scraping fails or is blocked by social media platforms login prompts.
      You perform a comprehensive multi-layered analysis:
      - Layer 1: Open Graph & Metadata parsing (infer titles, thumbnails, creators from link characteristics).
      - Layer 2: Caption & Description Analysis (scan captions, comments, hashtags for name, price, sizes, colors, delivery).
      - Layer 3: AI Image OCR Analysis (look at the screenshot or product image, read exact text overlaid, like prices "Ksh 2,500", "Price: 3500", tags, labels).
      - Layer 4: Video Frame Analysis (if video screenshots are provided, analyze labels, overlays, package pricing, brand names).
      - Layer 5: Screenshot Import (parse Instagram, Telegram, Facebook Marketplace posts).
      - Layer 6: WhatsApp Catalog Screenshot OCR (parse catalog style and map it to product drafts automatically without scraping public sites).
      - Layer 7: Generate smart defaults and auto-populates so the creation process NEVER blocks.

      --- Price Extraction Rules:
      Identify pricing patterns like: "Ksh 3,500", "KES 3,500", "Price: 3500", "3500", "Now only 2999", "6k", "8.5k", etc.
      Return the numerical amount in "price" as integer, and store the exact matched phrase string in "originalPriceText" field.
      If currency is unclear, assume Kenyan Shillings (KES / Ksh) and default to 2500.

      --- Confidence Mappings:
      - HIGH (90%+): Fully identified product name, price, and category. Confident values. "highlightedFields" array is empty.
      - MEDIUM (60%-89%): Some uncertainty (e.g. price was inferred, description guessed). Identify these fields in the "highlightedFields" array (e.g., ["price"]).
      - LOW (<60%): Missing prominent details or completely inferred. list uncertain fields in "highlightedFields" so the seller can manually correct them.

      Prepare and output your findings in STRICT JSON format matching this SCHEMA:
      {
        "productTitle": "string (the product name or a beautiful clean inferred title)",
        "price": number (integer total representing price in Kenyan Shillings),
        "originalPriceText": "string (exact matched pricing text e.g., 'Ksh 3,500' or 'Now only 2999')",
        "category": "string (categorized as: 'Apparel & Fashion', 'Footwear & Kicks', 'Electronics & Gadgets', 'Home & Living', 'Health & Skincare', or 'Other')",
        "description": "string (clean, friendly, detailed product summary formulated from visual/social signals)",
        "estimatedRisk": number (0-100 score on escrow risk or fake seller suspicion),
        "duplicateScamRating": "string (brief assessment of scam risk)",
        "sellerHandle": "string (expected handle e.g. @trendy_thrifts_ke or @social_merchant)",
        "deliveryTimelineDays": number (typically 1 to 3),
        "colors": ["string"],
        "sizes": ["string"],
        "deliveryInfo": "string (shipping notes found or implied)",
        "brand": "string (detected merchant brand or maker)",
        "stock": number (default to 12),
        "creatorName": "string (creator handle or seller handle)",
        "pageName": "string",
        "confidenceScore": number (0 to 100 representing confidence),
        "confidenceLevel": "string (HIGH, MEDIUM, or LOW based on details found)",
        "highlightedFields": ["string (list of field-keys that are low confidence and should be highlighted, e.g. 'price' or 'category')"],
        "confidenceReason": "string (why that confidence score was chosen)",
        "layersApplied": ["string (e.g., 'Layer 3: AI Image OCR Analysis', 'Layer 5: Screenshot Import Pipeline')"],
        "primaryLayerUsed": "string (the highest quality layer that succeeded)",
        "suggestions": {
          "productTitle": ["string (list of 3 beautiful alternative titles for this product)"],
          "category": ["string (list of 2 alternative best-fit categories)"],
          "tags": ["string (3 to 4 recommended social hashtags/escrow tags)"],
          "description": "string (a longer, beautifully formatted premium product description with emojis for instant copying/applying)"
        }
      }
    `;

    if (socialUrl) {
      textPrompt += `\nInput URL to extract from: "${socialUrl}" (import method chosen was "${importMethod || 'url'}").`;
    }

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64
        }
      });
      textPrompt += `\nAn image has been attached. Perform OCR text analysis, visual packaging detection, and parse product catalog or screenshots.`;
    }

    contents.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productTitle: { type: Type.STRING },
            price: { type: Type.INTEGER },
            originalPriceText: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedRisk: { type: Type.INTEGER },
            duplicateScamRating: { type: Type.STRING },
            sellerHandle: { type: Type.STRING },
            deliveryTimelineDays: { type: Type.INTEGER },
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
            sizes: { type: Type.ARRAY, items: { type: Type.STRING } },
            deliveryInfo: { type: Type.STRING },
            brand: { type: Type.STRING },
            stock: { type: Type.INTEGER },
            creatorName: { type: Type.STRING },
            pageName: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            confidenceLevel: { type: Type.STRING },
            highlightedFields: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceReason: { type: Type.STRING },
            layersApplied: { type: Type.ARRAY, items: { type: Type.STRING } },
            primaryLayerUsed: { type: Type.STRING },
            suggestions: {
              type: Type.OBJECT,
              properties: {
                productTitle: { type: Type.ARRAY, items: { type: Type.STRING } },
                category: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING }
              },
              required: ['productTitle', 'category', 'tags', 'description']
            }
          },
          required: [
            'productTitle', 'price', 'originalPriceText', 'category', 'description', 
            'estimatedRisk', 'duplicateScamRating', 'sellerHandle', 'deliveryTimelineDays',
            'confidenceScore', 'confidenceLevel', 'highlightedFields', 'layersApplied', 'primaryLayerUsed'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      sandbox: false,
      result: parsed
    });

  } catch (error: any) {
    console.error('PAE multi-layered extraction failed:', error);
    res.status(500).json({
      error: 'AI extraction pipeline failed.',
      message: error.message,
    });
  }
});



// Start server (either using Vite middleware or static delivery in prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Buy Safely Node/Express server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
