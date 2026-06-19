export type TransactionStatus =
  | 'PENDING_DEPOSIT'
  | 'ESCROW_HELD'
  | 'ITEMS_SHIPPED'
  | 'FUNDS_RELEASED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface TimelineEvent {
  timestamp: string;
  status: string;
  title: string;
  description: string;
  actor: 'BUYER' | 'SELLER' | 'SYSTEM' | 'AI_MODERATOR' | 'HUMAN_MODERATOR';
}

export interface SecurityScorecard {
  velocityLimitPassed: boolean;
  deviceFingerprintScore: number; // 0-100
  simSwapRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  ipLocationMatch: boolean;
  overallRisk: number; // 0-100
}

export interface AIVerificationResult {
  verified: boolean;
  confidence: number;
  extractedMpesaCode?: string;
  extractedCarrier?: string;
  merchantName?: string;
  detectedText?: string;
  flaggedAnomalies?: string[];
  fraudScore?: number;
}

export interface Transaction {
  id: string;
  createdAt: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerAccountType?: 'GUEST' | 'REGISTERED';
  buyerNationalId?: string;
  isNotRecipient?: boolean;
  recipientDetails?: {
    name: string;
    phone: string;
    address: string;
    relationship?: string;
  };
  sellerPhone: string;
  sellerHandle: string;
  socialPlatform: 'WhatsApp' | 'Instagram' | 'TikTok' | 'Facebook' | 'Telegram';
  amount: number; // in Ksh
  fee: number; // in Ksh (Ksh 20 - 50)
  platformFee?: number; // in Ksh (mandatory platform fee of Ksh 12)
  description: string;
  status: TransactionStatus;
  shippingProofUrl?: string;
  receiptAnalysis?: AIVerificationResult;
  countdownHours: number;
  riskScore: number;
  buyerTrustScore: number;
  sellerTrustScore: number;
  securityScorecard?: SecurityScorecard;
  history: TimelineEvent[];
  // Social Commerce Checkout Extensions
  quantity?: number;
  shippingMethod?: 'Courier' | 'Pickup' | 'Seller Delivery';
  shippingFee?: number;
  totalAmount?: number;
  paymentNetwork?: 'mpesa' | 'airtel' | 'tcash';
  orderStatus?: string; // Fine-grained tracking statuses
  shippingDetails?: {
    county?: string;
    town?: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    pickupLocation?: string;
    pickupDate?: string;
    pickupContact?: string;
    deliveryArea?: string;
    deliveryContact?: string;
  };
  insurancePolicy?: 'NONE' | 'BUYER_CHOOSES' | 'SELLER_COVERS' | 'MANDATORY';
  insuranceOption?: 'NONE' | 'BASIC' | 'ENHANCED';
  insurancePremium?: number;
  insurancePaidBy?: 'BUYER' | 'SELLER' | 'SHARED' | 'NONE';
  insuranceClaimStatus?: 'SUBMITTED' | 'UNDER_REVIEW' | 'AWAITING_EVIDENCE' | 'APPROVED' | 'REJECTED' | 'PAID';
  insuranceClaims?: InsuranceClaim[];
}

export interface EscrowWallet {
  currency: 'Ksh';
  totalEscrowHeld: number;
  totalFeesCollected: number;
  totalSettled: number;
  reservePool: number;
}

export interface Merchant {
  id: string;
  businessName: string;
  sellerHandle: string;
  phone: string;
  email: string;
  onboardingStep: 'KYC' | 'TILL_LINKED' | 'VERIFIED';
  verifiedAt?: string;
  volumeKsh: number;
  trustRating: number;
}

export interface DeliveryBid {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerType: 'RIDER' | 'DRIVER' | 'PICKER' | 'COURIER';
  bidAmount: number; // competitive bid in Ksh
  estimatedHours: number;
  trustScore: number;
  deliveryCount: number;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  type: 'COURIER' | 'RIDER' | 'DRIVER' | 'PICKER';
  avatar?: string;
  nationalId?: string;
  isVerified: boolean;
  trustScore: number;
  completedDeliveries: number;
  disputeRate: number; // percentage
  onTimeRate: number; // percentage
  feedbackScore: number; // out of 100
  vehicleDetails?: string;
  drivingLicense?: string;
  emergencyContact?: string;
  availability: 'ONLINE' | 'OFFLINE' | 'BUSY';
  aiRiskScore: number; // computed by AI Intelligence
}

export interface Transaction {
  id: string;
  createdAt: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerAccountType?: 'GUEST' | 'REGISTERED';
  buyerNationalId?: string;
  isNotRecipient?: boolean;
  recipientDetails?: {
    name: string;
    phone: string;
    address: string;
    relationship?: string;
  };
  sellerPhone: string;
  sellerHandle: string;
  socialPlatform: 'WhatsApp' | 'Instagram' | 'TikTok' | 'Facebook' | 'Telegram';
  amount: number; // in Ksh
  fee: number; // in Ksh (Ksh 20 - 50)
  platformFee?: number; // in Ksh (mandatory platform fee of Ksh 12)
  description: string;
  status: TransactionStatus;
  shippingProofUrl?: string;
  receiptAnalysis?: AIVerificationResult;
  countdownHours: number;
  riskScore: number;
  buyerTrustScore: number;
  sellerTrustScore: number;
  securityScorecard?: SecurityScorecard;
  history: TimelineEvent[];
  // Social Commerce Checkout Extensions
  quantity?: number;
  shippingMethod?: 'Courier' | 'Pickup' | 'Seller Delivery';
  shippingFee?: number;
  totalAmount?: number;
  paymentNetwork?: 'mpesa' | 'airtel' | 'tcash';
  orderStatus?: string; // Fine-grained tracking statuses
  shippingDetails?: {
    county?: string;
    town?: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    pickupLocation?: string;
    pickupDate?: string;
    pickupContact?: string;
    deliveryArea?: string;
    deliveryContact?: string;
  };
  // Logistics Partner Extensions
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerType?: 'COURIER' | 'RIDER' | 'DRIVER' | 'PICKER';
  deliveryPin?: string; // One-Time Handover Confirmation Code, e.g. "824761"
  deliveryPinEntered?: boolean;
  deliveryStatus?: 'PICKUP_REQUESTED' | 'COURIER_ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'CONFIRMED';
  deliveryRiskScore?: number;
  deliveryBids?: DeliveryBid[];
  pickerInspected?: boolean;
  pickerReport?: string;
  pickerFee?: number;
  escrowModel?: 'model_1' | 'model_2'; // model_1: Buyer pays logistics escrow fee, model_2: Seller pays
  deliveryAgentSignature?: string;
  deliveryAgentPhotoUrl?: string;
  insurancePolicy?: 'NONE' | 'BUYER_CHOOSES' | 'SELLER_COVERS' | 'MANDATORY';
  insuranceOption?: 'NONE' | 'BASIC' | 'ENHANCED';
  insurancePremium?: number;
  insurancePaidBy?: 'BUYER' | 'SELLER' | 'SHARED' | 'NONE';
  insuranceClaimStatus?: 'SUBMITTED' | 'UNDER_REVIEW' | 'AWAITING_EVIDENCE' | 'APPROVED' | 'REJECTED' | 'PAID';
  insuranceClaims?: InsuranceClaim[];
}

export interface VerifiedProduct {
  id: string;
  title: string;
  category: 'Apparel & Fashion' | 'Electronics & Gadgets' | 'Vehicles & Motors' | 'Machinery & Tools' | 'Furniture & Living' | 'Other Products';
  price: number;
  description: string;
  sellerHandle: string;
  sellerPhone: string;
  verificationStatus: 'UNVERIFIED' | 'AUDITOR_ASSIGNED' | 'INSPECTION_COMPLETED' | 'VERIFIED' | 'EXPIRED';
  verificationTier?: 'STANDARD' | 'PRIORITY' | 'PREMIUM';
  verificationFee?: number;
  auditorId?: string;
  auditorName?: string;
  verificationReport?: {
    productName: string;
    category: string;
    sellerId: string;
    condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    functionalPass: boolean;
    serialNumber?: string;
    photos?: string[];
    notes?: string;
    outcome: 'Verified' | 'Verified with Notes' | 'Verification Failed';
    submittedAt?: string;
  };
  verifiedAt?: string;
  expiresAt?: string;
  bulkPlanSubscribed?: 'NONE' | 'BASIC' | 'GROWTH' | 'ENTERPRISE';
  isFeatured?: boolean;
}

export interface InsuranceClaim {
  id: string;
  type: 'DAMAGE' | 'LOSS';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'AWAITING_EVIDENCE' | 'APPROVED' | 'REJECTED' | 'PAID';
  submittedAt: string;
  evidenceNotes?: string;
  evidencePhotos?: string[];
  feedback?: string;
  payoutAmount?: number;
}

