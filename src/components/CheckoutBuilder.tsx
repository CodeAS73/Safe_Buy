import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Send, 
  Link as LinkIcon, 
  Sparkles, 
  Smartphone, 
  CheckCircle, 
  HelpCircle, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  FileText,
  Clock,
  QrCode,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  Image as ImageIcon,
  AlertTriangle,
  UserCheck,
  Building,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Zap,
  Truck,
  MapPin,
  Calendar,
  Code,
  Globe,
  Plus,
  Minus,
  Briefcase
} from 'lucide-react';
import { Transaction } from '../types';

const BASE_COURIERS = [
  {
    id: 'DP-001',
    name: 'Express Rider Kenya',
    phone: '254711223344',
    type: 'RIDER',
    avatar: '🏍️',
    isVerified: true,
    trustScore: 98,
    rating: 4.8,
    completedDeliveries: 342,
    availability: 'ONLINE',
    vehicleDetails: 'Motorcycle',
    vehicleType: 'Motorcycle',
    company: 'Express Rider Kenya',
    baseFee: 300,
    perKm: 0,
    timeText: '2 Hours',
    totalMins: 120
  },
  {
    id: 'DP-002',
    name: 'Swift Courier',
    phone: '254722334455',
    type: 'COURIER',
    avatar: '⚡',
    isVerified: true,
    trustScore: 99,
    rating: 4.9,
    completedDeliveries: 120,
    availability: 'ONLINE',
    vehicleDetails: 'Motorcycle / Sedan',
    vehicleType: 'Motorcycle',
    company: 'Swift Courier',
    baseFee: 350,
    perKm: 0,
    timeText: 'Same Day',
    totalMins: 480
  },
  {
    id: 'DP-003',
    name: 'Metro Logistics',
    phone: '254733445566',
    type: 'COURIER',
    avatar: '🚚',
    isVerified: true,
    trustScore: 97,
    rating: 4.7,
    completedDeliveries: 88,
    availability: 'ONLINE',
    vehicleDetails: 'Motorcycle',
    vehicleType: 'Motorcycle',
    company: 'Metro Logistics',
    baseFee: 280,
    perKm: 0,
    timeText: '4 Hours',
    totalMins: 240
  }
];

interface CheckoutBuilderProps {
  onTransactionCreated: (newTx: Transaction) => void;
}

export default function CheckoutBuilder({ onTransactionCreated }: CheckoutBuilderProps) {
  // Vendor Form/Config States (Left Side)
  const [socialUrl, setSocialUrl] = useState('https://www.instagram.com/p/C7W2be_sy1g/');
  const [itemName, setItemName] = useState('Classic Oversized Leather Bomber');
  const [price, setPrice] = useState('4800');
  const [stock, setStock] = useState('15');
  const [sellerHandle, setSellerHandle] = useState('@trendy_thrifts_ke');
  const [sellerPhone, setSellerPhone] = useState('254798765432');
  const [platform, setPlatform] = useState<'WhatsApp' | 'Instagram' | 'TikTok' | 'Facebook' | 'Telegram'>('Instagram');
  const [daysToDeliver, setDaysToDeliver] = useState(2);
  const [description, setDescription] = useState('Vintage premium heavy leather aviator jacket. Oversized fit, minimal wear, and authenticated hardware.');

  // Seller delivery rates configuration
  const [courierFee, setCourierFee] = useState('300');
  const [pickupFee, setPickupFee] = useState('0');
  const [sellerDeliveryFee, setSellerDeliveryFee] = useState('150');

  // Shipping Insurance states
  const [insurancePolicy, setInsurancePolicy] = useState<'NONE' | 'BUYER_CHOOSES' | 'SELLER_COVERS' | 'MANDATORY' | 'SHARED'>('BUYER_CHOOSES');
  const [selectedInsuranceOption, setSelectedInsuranceOption] = useState<'NONE' | 'BASIC' | 'ENHANCED'>('BASIC');

  // Interactive Embed Tab State
  const [formTab, setFormTab] = useState<'configure' | 'embeds'>('configure');

  // Product Inspection Program States
  const [productCategory, setProductCategory] = useState<'Apparel & Fashion' | 'Electronics & Gadgets' | 'Vehicles & Motors' | 'Machinery & Tools' | 'Furniture & Living' | 'Other Products'>('Electronics & Gadgets');
  const [verificationStatus, setVerificationStatus] = useState<'UNVERIFIED' | 'AUDITOR_ASSIGNED' | 'INSPECTION_COMPLETED' | 'VERIFIED' | 'EXPIRED'>('UNVERIFIED');
  const [verificationTier, setVerificationTier] = useState<'STANDARD' | 'PRIORITY' | 'PREMIUM'>('STANDARD');
  const [verificationFee, setVerificationFee] = useState<number>(450);
  const [selectedAuditorId, setSelectedAuditorId] = useState<string>('DP-003');
  const [verificationReport, setVerificationReport] = useState<any>(null);
  const [verificationAt, setVerificationAt] = useState<string>('');
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<string>('');
  const [showMpesaPrompt, setShowMpesaPrompt] = useState(false);
  const [mpesaPaymentNumber, setMpesaPaymentNumber] = useState('0712345678');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [bulkPlanSubscribed, setBulkPlanSubscribed] = useState<'NONE' | 'BASIC' | 'GROWTH' | 'ENTERPRISE'>('NONE');
  const [showBulkPlanSuccess, setShowBulkPlanSuccess] = useState(false);

  // Form Condition Audit
  const [auditCondition, setAuditCondition] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Excellent');
  const [auditSerial, setAuditSerial] = useState('X894-AUDIT-KE');
  const [auditFunctional, setAuditFunctional] = useState(true);
  const [auditNotes, setAuditNotes] = useState('Physically verified pre-sale product on premise. Tested buttons, chassis condition, and serial number. Everything operates properly without standard faults.');

  const CATEGORY_DETAILS: Record<string, { standard: number, priority: number, premium: number, validity: number }> = {
    'Apparel & Fashion': { standard: 300, priority: 500, premium: 800, validity: 30 },
    'Electronics & Gadgets': { standard: 500, priority: 750, premium: 1000, validity: 30 },
    'Vehicles & Motors': { standard: 1200, priority: 1500, premium: 2000, validity: 14 },
    'Machinery & Tools': { standard: 500, priority: 850, premium: 1500, validity: 30 },
    'Furniture & Living': { standard: 400, priority: 800, premium: 1100, validity: 60 },
    'Other Products': { standard: 300, priority: 500, premium: 800, validity: 30 }
  };


  // Image Upload State
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraction Progress State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionAlert, setExtractionAlert] = useState<{ type: 'success' | 'warn' | 'error', text: string } | null>(null);
  const [scamRisk, setScamRisk] = useState<number | null>(null);
  const [scamComments, setScamComments] = useState<string>('');

  // PAE Specific Workspace States
  const [importMethod, setImportMethod] = useState<'url' | 'screenshot' | 'image' | 'video' | 'whatsapp' | 'manual'>('url');
  const [paeDetails, setPaeDetails] = useState<any>({
    confidenceScore: 85,
    confidenceLevel: 'MEDIUM',
    highlightedFields: ['category'],
    originalPriceText: 'Ksh 4,800',
    layersApplied: ['Layer 1: Open Graph Metadata', 'Layer 2: Caption & Description Analysis', 'Layer 7: Manual Confirmation'],
    primaryLayerUsed: 'Layer 2: Caption Analysis',
    confidenceReason: 'Price matches caption tags. Category inferred with 85% confidence score.',
    suggestions: {
      productTitle: [
        'Classic Vintage Oversized Leather Bomber',
        'Thrift Premium Heavy Aviator Jacket',
        'Double-zipper Distressed Cowstride Bomber'
      ],
      category: ['Apparel & Fashion', 'Other Products'],
      tags: ['EscrowProtected', 'NairobiFashion', 'ThriftOriginals', 'VintageGradeA'],
      description: '✨ Vintage premium heavy leather aviator jacket. Fitted with oversized shoulders, robust brass zipper, and soft leather collar. Authentic hardware.'
    }
  });

  // Link status
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [copiedSnippetType, setCopiedSnippetType] = useState<string | null>(null);

  // --- Buyer Checkout Sandbox States (Right Side Phone Simulator) ---
  const [buyerQty, setBuyerQty] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<'Courier' | 'Pickup' | 'Seller Delivery'>('Courier');
  const [selectedCourierId, setSelectedCourierId] = useState<string>('DP-001');
  const [courierSort, setCourierSort] = useState<'recommended' | 'cheapest' | 'fastest' | 'highest_rated'>('recommended');
  const [phoneError, setPhoneError] = useState('');
  
  // Buyer profile integration flags
  const [buyerName, setBuyerName] = useState('James Kamau');
  const [buyerAccountType, setBuyerAccountType] = useState<'REGISTERED' | 'GUEST'>('GUEST');
  const [buyerNationalId, setBuyerNationalId] = useState('');
  
  // Alternative recipient details check
  const [isNotRecipient, setIsNotRecipient] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientRelationship, setRecipientRelationship] = useState('Friend');

  // Mobile Network details
  const [buyerPhoneInput, setBuyerPhoneInput] = useState('0712345678');
  const [buyerNetwork, setBuyerNetwork] = useState<'mpesa' | 'airtel' | 'tcash'>('mpesa');

  // Delivery details filled by guest buyer in checkout simulator
  const [county, setCounty] = useState('Nairobi');
  const [town, setTown] = useState('Kilimani');
  const [address, setAddress] = useState('Yaya Centre Apartments, Block C, Apt 4');
  const [contactPerson, setContactPerson] = useState('James Kamau');
  const [buyerContactPhone, setBuyerContactPhone] = useState('0712345678');

  const [pickupLocation, setPickupLocation] = useState('Nairobi CBD - Kimathi Street Coop Tower Ground Floor Shop');
  const [pickupDate, setPickupDate] = useState('2026-06-03');
  const [pickupContact, setPickupContact] = useState('Main Office Agent');

  const [deliveryArea, setDeliveryArea] = useState('Westlands & Parklands General Area');
  const [deliveryContactDetails, setDeliveryContactDetails] = useState('0722334455 (Boda Despatcher)');

  // Smartphone simulator checkout flow step: 'form' | 'confirmation' | 'stk_paying' | 'success'
  const [phoneStep, setPhoneStep] = useState<'form' | 'confirmation' | 'stk_paying' | 'success'>('form');

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileInput(e.dataTransfer.files[0]);
    }
  };

  const processFileInput = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileInput(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setUploadedImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [activeProductId, setActiveProductId] = useState<string>('');

  const handleRegisterAndRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      let prodId = activeProductId;
      if (!prodId) {
        const createRes = await fetch('/api/verified-products/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: itemName,
            category: productCategory,
            price: Number(price) || 2500,
            description: description,
            sellerHandle,
            sellerPhone
          })
        });
        if (createRes.ok) {
          const newProd = await createRes.json();
          if (newProd) {
            prodId = newProd.id;
            setActiveProductId(prodId);
          }
        }
      }

      setShowMpesaPrompt(true);
    } catch (err) {
      console.error('Failed to initiate product verification request:', err);
    }
  };

  const handleConfirmMpesaPayment = async () => {
    if (!mpesaPaymentNumber) {
      alert('Please enter a valid M-Pesa phone number.');
      return;
    }
    setIsVerifyingPayment(true);
    
    setTimeout(async () => {
      try {
        const feeAmount = CATEGORY_DETAILS[productCategory][verificationTier.toLowerCase() as 'standard' | 'priority' | 'premium'];
        
        const response = await fetch(`/api/verified-products/${activeProductId}/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: verificationTier,
            fee: feeAmount,
            auditorId: selectedAuditorId,
            auditorName: selectedAuditorId === 'DP-003' ? 'Picker Alex (Safety Inspector)' : 'Independent Trust Auditor'
          })
        });

        if (response.ok) {
          const updatedProd = await response.json();
          setVerificationStatus(updatedProd.verificationStatus);
          setVerificationTier(updatedProd.verificationTier);
          setVerificationFee(updatedProd.verificationFee);
          setVerificationReport(updatedProd.verificationReport);
        }
        
        setShowMpesaPrompt(false);
        setIsVerifyingPayment(false);
      } catch (err) {
        console.error('Error recording verification payment:', err);
        setIsVerifyingPayment(false);
      }
    }, 1500);
  };

  const handleAuditorInspectSubmit = async () => {
    try {
      const response = await fetch(`/api/verified-products/${activeProductId}/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition: auditCondition,
          functionalPass: auditFunctional,
          serialNumber: auditSerial,
          notes: auditNotes,
          outcome: auditFunctional ? 'Verified' : 'Verification Failed'
        })
      });

      if (response.ok) {
        const updatedProd = await response.json();
        setVerificationStatus(updatedProd.verificationStatus);
        setVerificationReport(updatedProd.verificationReport);
      }
    } catch (err) {
      console.error('Error submitting auditor inspection report:', err);
    }
  };

  const handleInstantSystemApprove = async () => {
    try {
      const response = await fetch(`/api/verified-products/${activeProductId}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        const updatedProd = await response.json();
        setVerificationStatus(updatedProd.verificationStatus);
        setVerificationAt(updatedProd.verifiedAt || '');
        setVerificationExpiresAt(updatedProd.expiresAt || '');
      }
    } catch (err) {
      console.error('Error approving product verification report:', err);
    }
  };

  const handleSubscribeBulkPlan = async (plan: 'BASIC' | 'GROWTH' | 'ENTERPRISE') => {
    try {
      const response = await fetch('/api/verified-products/subscribe-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerHandle,
          planName: plan
        })
      });

      if (response.ok) {
        setBulkPlanSubscribed(plan);
        setShowBulkPlanSuccess(true);
        setTimeout(() => setShowBulkPlanSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error subscribing to bulk package:', err);
    }
  };

  // AI OCR and PAE details extractor call
  const handleAIExtract = async () => {
    if (importMethod === 'url' && !socialUrl) {
      setExtractionAlert({ type: 'error', text: 'Please paste a social post URL first.' });
      return;
    }
    if ((importMethod === 'screenshot' || importMethod === 'image' || importMethod === 'video' || importMethod === 'whatsapp') && !uploadedImageBase64) {
      setExtractionAlert({ type: 'error', text: 'Please select or upload a media file/screenshot first for visual parsing.' });
      return;
    }

    setIsExtracting(true);
    setExtractionAlert(null);

    try {
      const response = await fetch('/api/social-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialUrl: importMethod === 'url' ? socialUrl : '',
          imageBase64: uploadedImageBase64 || '',
          importMethod: importMethod
        })
      });

      if (!response.ok) throw new Error('AI extraction pipeline timed out or encountered an error.');
      const data = await response.json();
      
      if (data.success && data.result) {
        const res = data.result;
        setPaeDetails(res);
        setItemName(res.productTitle || itemName);
        setPrice(String(res.price || price));
        setSellerHandle(res.sellerHandle || sellerHandle);
        setDescription(res.description || description);
        setDaysToDeliver(res.deliveryTimelineDays || daysToDeliver);
        setScamRisk(res.estimatedRisk || 5);
        setScamComments(res.duplicateScamRating || '');
        
        // Match discovery platform dynamically based on url / selection
        if (importMethod === 'url' && socialUrl) {
          if (socialUrl.includes('instagram.com')) setPlatform('Instagram');
          else if (socialUrl.includes('tiktok.com')) setPlatform('TikTok');
          else if (socialUrl.includes('facebook.com')) setPlatform('Facebook');
          else if (socialUrl.includes('t.me') || socialUrl.includes('telegram')) setPlatform('Telegram');
          else if (socialUrl.includes('whatsapp')) setPlatform('WhatsApp');
        } else if (importMethod === 'whatsapp') {
          setPlatform('WhatsApp');
        } else if (importMethod === 'video') {
          setPlatform('TikTok');
        }

        setExtractionAlert({
          type: res.confidenceLevel === 'LOW' ? 'warn' : 'success',
          text: `Success: Product draft compiled from ${res.primaryLayerUsed} at ${res.confidenceScore}% confidence.`
        });
      }
    } catch (e: any) {
      setExtractionAlert({ type: 'error', text: 'PAE Pipeline Failure: ' + e.message });
    } finally {
      setIsExtracting(false);
    }
  };

  // Helper to load sample files for immediate testing of fallback visual layers
  const handleLoadSample = (methodType: 'screenshot' | 'image' | 'video' | 'whatsapp') => {
    let mockImg = '';
    if (methodType === 'screenshot') {
      mockImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%23eceff1"><text x="20" y="50" font-family="sans-serif" font-weight="bold" font-size="14" fill="%2337474f">Instagram Post Screenshot</text><text x="20" y="80" font-family="sans-serif" font-size="12" fill="%23455a64">Handle: @trendy_thrifts_ke</text><text x="20" y="110" font-family="sans-serif" font-weight="bold" font-size="16" fill="%231b5e20">Price: KES 4,800</text></svg>';
    } else if (methodType === 'image') {
      mockImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%23e8eaf6"><text x="20" y="50" font-family="sans-serif" font-weight="bold" font-size="14" fill="%231a237e">Product Photo Asset</text><text x="20" y="100" font-family="sans-serif" font-size="12" fill="%23283593">Vintage Leather Jacket Details</text></svg>';
    } else if (methodType === 'video') {
      mockImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%23f3e5f5"><text x="20" y="50" font-family="sans-serif" font-weight="bold" font-size="14" fill="%234a148c">TikTok Frame Overlay Extraction</text><text x="20" y="80" font-family="sans-serif" font-size="12" fill="%236a1b9a">Maasai Sandals video snippet</text><text x="20" y="110" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23311b92">Ksh 1,800</text></svg>';
    } else if (methodType === 'whatsapp') {
      mockImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" style="background:%23e8f5e9"><text x="20" y="50" font-family="sans-serif" font-weight="bold" font-size="14" fill="%231b5e20">WhatsApp Catalog Snapshot</text><text x="20" y="80" font-family="sans-serif" font-size="12" fill="%232e7d32">Catalog Item: Glycolic Hydration Serum</text><text x="20" y="110" font-family="sans-serif" font-weight="bold" font-size="16" fill="%231b5e20">Ksh 2,999</text></svg>';
    }
    setUploadedImageBase64(mockImg);
  };

  // Courier list generation with dynamic distance, dynamic fee, and sorting
  const getEnrichedCouriers = () => {
    // Determine base distance multiplier based on town
    let distanceMultiplier = 1.0;
    const normalizedTown = (town || '').toLowerCase().trim();
    if (normalizedTown.includes('kilimani') || normalizedTown.includes('yaya')) {
      distanceMultiplier = 1.2;
    } else if (normalizedTown.includes('westlands')) {
      distanceMultiplier = 1.0;
    } else if (normalizedTown.includes('cbd') || normalizedTown.includes('town') || normalizedTown.includes('central')) {
      distanceMultiplier = 0.5;
    } else if (normalizedTown.includes('karen') || normalizedTown.includes('runda')) {
      distanceMultiplier = 2.8;
    } else if (normalizedTown.includes('imara') || normalizedTown.includes('mombasa')) {
      distanceMultiplier = 2.0;
    } else if (normalizedTown.length > 0) {
      distanceMultiplier = 1.5;
    }

    // 1. Filter couriers based on rules:
    //    - Active status = ONLINE
    //    - Verified identity = TRUE
    //    - Minimum rating threshold (rating > 3.5)
    //    - Within service radius (modeled dynamically)
    const filtered = BASE_COURIERS.filter(c => {
      const isOnline = c.availability === 'ONLINE';
      const isVerified = c.isVerified === true;
      const isGoodRating = c.rating > 3.5;
      return isOnline && isVerified && isGoodRating;
    });

    // 2. Enrich couriers with distance, pricing, and estimated time
    const enriched = filtered.map(c => {
      let baseDistance = 3.5;
      if (c.type === 'PICKER') baseDistance = 1.2;
      else if (c.type === 'RIDER') baseDistance = 2.8;
      else if (c.type === 'DRIVER') baseDistance = 4.2;
      else if (c.type === 'COURIER') baseDistance = 5.0;

      const finalDistance = Math.round((baseDistance * distanceMultiplier) * 10) / 10;
      
      // Delivery fee is calculated from base fee + distance rate
      const finalFee = Math.round(c.baseFee + (finalDistance * c.perKm));

      // Estimated speed factor in minutes per km
      let speedFactor = 5;
      if (c.type === 'RIDER') speedFactor = 4;
      else if (c.type === 'DRIVER') speedFactor = 6;
      else if (c.type === 'PICKER') speedFactor = 15;
      else if (c.type === 'COURIER') speedFactor = 8;
      
      const totalMins = c.totalMins !== undefined ? c.totalMins : Math.round(finalDistance * speedFactor + 10);
      const timeText = c.timeText || (totalMins < 60 ? `${totalMins} Mins` : `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`);

      return {
        ...c,
        distance: finalDistance,
        fee: finalFee,
        timeText,
        totalMins
      };
    });

    // 3. Sort based on buyer preferences
    if (courierSort === 'cheapest') {
      return enriched.sort((a, b) => a.fee - b.fee);
    } else if (courierSort === 'fastest') {
      return enriched.sort((a, b) => a.totalMins - b.totalMins);
    } else if (courierSort === 'highest_rated') {
      return enriched.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: Recommended (closest and highest rated)
      return enriched.sort((a, b) => (b.rating * 10 - b.distance) - (a.rating * 10 - a.distance));
    }
  };

  // Real-time Shipping cost calculations based on user config values
  const getSelectedShippingFee = () => {
    if (selectedShipping === 'Courier') {
      const enriched = getEnrichedCouriers();
      const selectedCourier = enriched.find(c => c.id === selectedCourierId);
      if (selectedCourier) return selectedCourier.fee;
      // return first one as fallback if selected ID was filtered out
      if (enriched.length > 0) return enriched[0].fee;
      return parseFloat(courierFee) || 0;
    }
    if (selectedShipping === 'Pickup') return parseFloat(pickupFee) || 0;
    if (selectedShipping === 'Seller Delivery') return parseFloat(sellerDeliveryFee) || 0;
    return 0;
  };

  const getSubtotal = () => {
    const unitPrice = parseFloat(price) || 0;
    return unitPrice * buyerQty;
  };

  const getInsurancePremium = (amount: number, option: 'NONE' | 'BASIC' | 'ENHANCED') => {
    if (option === 'NONE') return 0;
    
    // Choose rate based on amount tiers
    let rate = 0;
    if (amount <= 5000) rate = 0.015; // 1.5%
    else if (amount <= 20000) rate = 0.012; // 1.2%
    else if (amount <= 100005) rate = 0.010; // 1.0%
    else rate = 0.008; // 0.8%

    // Calculate premium
    let premium = amount * rate;
    
    // Apply Enhanced Cover loading fee (+25% premium and +Ksh 50 basic fee loading)
    if (option === 'ENHANCED') {
      premium = premium * 1.25 + 50;
    }

    // Minimum premium Ksh 40
    return Math.max(Math.round(premium), 40);
  };

  const getBuyerInsurancePremium = () => {
    if (insurancePolicy === 'NONE' || insurancePolicy === 'SELLER_COVERS' || selectedInsuranceOption === 'NONE') {
      return 0;
    }
    const fullPremium = getInsurancePremium(getSubtotal(), selectedInsuranceOption);
    if (insurancePolicy === 'SHARED') {
      return Math.round(fullPremium * 0.5);
    }
    return fullPremium;
  };

  const getProtectionFee = () => {
    const subtotal = getSubtotal();
    return Math.max(Math.round(subtotal * 0.01), 25);
  };

  const buyerInsurancePremium = getBuyerInsurancePremium();
  const totalCheckoutAmount = getSubtotal() + getSelectedShippingFee() + getProtectionFee() + buyerInsurancePremium;

  // STK mobile number validation check
  const validatePhone = (num: string) => {
    // Kenya standard coordinates - 07XXXXXXXX or 01XXXXXXXX (10 digits)
    const normalized = num.trim();
    if (!/^(07|01)\d{8}$/.test(normalized)) {
      setPhoneError('Please enter a valid Kenayan mobile number (07XXXXXXXX or 01XXXXXXXX)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // Build Short protected pay Link for vendor listing
  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const shortCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const link = `https://buysafely.africa/pay/${shortCode}`;
    setGeneratedLink(link);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Copy code snippets for WordPress / Shopify
  const handleCopySnippet = (snippet: string, type: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetType(type);
    setTimeout(() => setCopiedSnippetType(null), 2540);
  };

  // Initiate real transaction upon STK trigger inside mock phone
  const handleTriggerSTKPayment = async () => {
    if (!validatePhone(buyerPhoneInput)) return;
    
    setPhoneStep('stk_paying');
    
    // Simulate Daraja network STK response loop
    setTimeout(async () => {
      try {
        const unitPrice = parseFloat(price) || 0;
        const currentShippingDetails = selectedShipping === 'Courier' ? {
          county,
          town,
          address,
          contactPerson: isNotRecipient ? recipientName : buyerName,
          phone: isNotRecipient ? recipientPhone : buyerPhoneInput
        } : selectedShipping === 'Pickup' ? {
          pickupLocation,
          pickupDate,
          pickupContact
        } : {
          deliveryArea,
          deliveryContact: deliveryContactDetails
        };

        const selectedCourier = selectedShipping === 'Courier' ? getEnrichedCouriers().find(c => c.id === selectedCourierId) : null;

        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerPhone: buyerPhoneInput,
            buyerEmail: buyerAccountType === 'REGISTERED' ? `${buyerName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : '',
            buyerName,
            buyerAccountType,
            buyerNationalId: buyerAccountType === 'REGISTERED' ? buyerNationalId : '',
            isNotRecipient,
            recipientDetails: isNotRecipient ? {
              name: recipientName,
              phone: recipientPhone,
              address: recipientAddress || `${county}, ${town}, ${address}`,
              relationship: recipientRelationship
            } : {
              name: buyerName,
              phone: buyerPhoneInput,
              address: selectedShipping === 'Courier' ? `${county}, ${town}, ${address}` : (selectedShipping === 'Pickup' ? pickupLocation : deliveryArea),
              relationship: 'Self'
            },
            sellerPhone,
            sellerHandle,
            socialPlatform: platform,
            amount: unitPrice,
            description: itemName,
            quantity: buyerQty,
            shippingMethod: selectedShipping,
            shippingFee: getSelectedShippingFee(),
            totalAmount: totalCheckoutAmount,
            paymentNetwork: buyerNetwork,
            shippingDetails: currentShippingDetails,
            orderStatus: 'PAID_PENDING_FULFILLMENT', // Starts as paid pending escrow hold
            deliveryPartnerId: selectedCourier ? selectedCourier.id : undefined,
            deliveryPartnerName: selectedCourier ? selectedCourier.name : undefined,
            deliveryPartnerType: selectedCourier ? selectedCourier.type : undefined,
            deliveryStatus: selectedCourier ? 'COURIER_ASSIGNED' : undefined,
            deliveryPin: selectedCourier ? Math.floor(100000 + Math.random() * 900000).toString() : undefined,
            deliveryPinEntered: selectedCourier ? false : false,
            // Transit Insurance metadata payload integration
            insurancePolicy,
            insuranceOption: selectedInsuranceOption,
            insurancePremium: getInsurancePremium(getSubtotal(), selectedInsuranceOption),
            insurancePaidBy: insurancePolicy === 'SELLER_COVERS' ? 'SELLER' : (insurancePolicy === 'SHARED' ? 'SHARED' : (selectedInsuranceOption === 'NONE' ? 'NONE' : 'BUYER'))
          })
        });

        if (!response.ok) throw new Error('STK push register failed');
        const newTx = await response.json();
        
        // Auto-complete deposit sequence to capture FUNDS_HELD
        await fetch(`/api/transactions/${newTx.id}/deposit`, { method: 'POST' });
        
        // Move phone state to complete checkout
        setPhoneStep('success');

        // Refresh global state so parent dashboard can map it in escrow timeline
        onTransactionCreated(newTx);
        
      } catch (err) {
        console.error(err);
        setPhoneStep('form');
        alert('STK push network simulation timing overflowed. Please try again.');
      }
    }, 1500);
  };

  // Embed widgets code generation templates
  const embedCodeHTML = `<!-- Buy Safely Trust Button Embed -->
<button onclick="window.location.href='${generatedLink || 'https://buysafely.africa/pay/productID'}'" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: system-ui, sans-serif;">
  🛡️ <span style="font-size: 13px;">Buy Safely (Escrow Active) • Ksh ${(parseFloat(price) || 2500).toLocaleString()}</span>
</button>`;

  const embeddedWidgetHTML = `<!-- Buy Safely Bento Trust Widget -->
<div style="background: #ffffff; border: 1px solid #f1f5f9; padding: 18px; border-radius: 24px; font-family: system-ui, sans-serif; max-width: 280px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
  <div style="font-size: 11px; font-weight: bold; color: #10b981; margin-bottom: 8px;">🛡️ CBK LICENSED ESCROW PROTECTED</div>
  <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #0f172a;">${itemName}</h4>
  <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b; line-height: 1.4;">Seller handles: ${sellerHandle}</p>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 16px; font-weight: 900; color: #0f172a;">Ksh ${(parseFloat(price) || 2500).toLocaleString()}</span>
    <button onclick="window.location.href='${generatedLink || 'https://buysafely.africa/pay/productID'}'" style="background: #0f172a; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">Buy Safely</button>
  </div>
</div>`;

  return (
    <div className="space-y-6 my-2 font-sans text-xs">
      
      {/* EXPLANATORY HERO SUB-HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 uppercase">
            ⚡ Universal Social Checkout Layer
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Escrow Commerce Link & Multi-Option Checkout
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Social commerce sellers do not need to generate new payment links for every variation. Create one link, allow buyers to configure quantity, pick courier/pickup preferences, pay via multiple mobile money networks, and activate the CBK-regulated escrow lockbox instantly.
          </p>
        </div>
        <div className="absolute right-[-10%] bottom-[-20%] opacity-15 aspect-square bg-emerald-500 rounded-full w-96 blur-3xl"></div>
      </div>

      {/* SPLIT WINDOW - BUILDER LEFT, SMARTPHONE INTEGRATION RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: VENDOR CONTEXT HUB & EMBEDS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Builder Form Frame */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Tab selection */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Active Configurations
              </h3>

              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold text-slate-500">
                <button 
                  onClick={() => setFormTab('configure')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${formTab === 'configure' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
                >
                  ⚙️ Listing Config
                </button>
                <button 
                  onClick={() => setFormTab('embeds')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${formTab === 'embeds' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
                >
                  🔌 Embed Snippets
                </button>
              </div>
            </div>

            {/* TAB 1: CONFIGURE THE SHARED SOCIAL PRODUCT */}
            {formTab === 'configure' && (
              <div className="space-y-6">
                
                {/* ADVANCED AI PRODUCT ACQUISITION ENGINE (PAE) WORKSPACE */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" /> AI Product Acquisition Engine (PAE)
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                      Adaptive Multi-Layer
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    Paves a fast route for social commerce vendors. Paste links or upload screenshots of your posts (Instagram, WhatsApp catalogs, TikTok showcase etc.) to auto-populate high assurance listings in seconds.
                  </p>

                  {/* LAYER SELECTORS (1-6) */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-200/50 p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => { setImportMethod('url'); clearImage(); }}
                      className={`py-2 text-[10px] font-bold rounded-lg transition flex flex-col items-center justify-center gap-1 ${importMethod === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>1. URL Link</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setImportMethod('screenshot'); handleLoadSample('screenshot'); }}
                      className={`py-2 text-[10px] font-bold rounded-lg transition flex flex-col items-center justify-center gap-1 ${importMethod === 'screenshot' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>2. Screenshot</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setImportMethod('image'); handleLoadSample('image'); }}
                      className={`py-2 text-[10px] font-bold rounded-lg transition flex flex-col items-center justify-center gap-1 ${importMethod === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>3. Image OCR</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setImportMethod('video'); handleLoadSample('video'); }}
                      className={`py-2 text-[10px] font-bold rounded-lg transition flex flex-col items-center justify-center gap-1 ${importMethod === 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>4. Video Frame</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setImportMethod('whatsapp'); handleLoadSample('whatsapp'); }}
                      className={`py-2 text-[10px] font-bold rounded-lg transition flex flex-col items-center justify-center gap-1 ${importMethod === 'whatsapp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>5. WA Catalog</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setImportMethod('manual')}
                      className={`py-2 text-[10px] font-bold rounded-lg transition flex flex-col items-center justify-center gap-1 ${importMethod === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>6. Pure Manual</span>
                    </button>
                  </div>

                  {/* ACTIVE IMPORT METHOD SUB-COMPONENTS */}
                  <div className="space-y-4 pt-1">
                    {importMethod === 'url' && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-600">Product URL (Instagram / TikTok / Catalog Link)</label>
                        <div className="relative">
                          <Instagram className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input 
                            type="url"
                            value={socialUrl}
                            onChange={(e) => setSocialUrl(e.target.value)}
                            placeholder="e.g. Paste Instagram page or WhatsApp catalog link"
                            className="w-full pl-9 pr-24 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-mono"
                          />
                          <button 
                            type="button" 
                            onClick={() => setSocialUrl('https://www.tiktok.com/@gikomba_kicks/video/ClassicSneakersPair')}
                            className="absolute right-2 top-1.5 text-[10px] bg-slate-100 hover:bg-slate-200 font-bold px-2.5 py-1.5 rounded-lg border text-slate-700"
                          >
                            Use Demo URL
                          </button>
                        </div>
                      </div>
                    )}

                    {importMethod !== 'url' && importMethod !== 'manual' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold leading-none">
                          <span>
                            {importMethod === 'screenshot' && "📂 Layer 5: Screenshot Import Pipeline (PRIMARY FALLBACK)"}
                            {importMethod === 'image' && "📂 Layer 3: Visual Product Photo Analysis"}
                            {importMethod === 'video' && "📂 Layer 4: Video Frame Analysis (TikTok, Reels, Shorts)"}
                            {importMethod === 'whatsapp' && "📂 Layer 6: WhatsApp Catalog Direct Snapshot"}
                          </span>
                          <span className="text-emerald-500 font-mono">Simulators Preloaded</span>
                        </div>

                        {/* File Upload / Drag space */}
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                            dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageSelect} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          {uploadedImageBase64 ? (
                            <div className="flex items-center gap-3 w-full justify-between text-left">
                              <img src={uploadedImageBase64} alt="Screenshot Data" className="w-14 h-12 object-cover rounded border" />
                              <div className="flex-1">
                                <p className="font-bold text-slate-800 text-xs">Media Extracted to Sandbox Buffer</p>
                                <span className="text-[9px] text-slate-400">Clicking extraction will parse using multimodal OCR coordinates</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); clearImage(); }} 
                                className="text-xs text-rose-600 font-extrabold hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <ImageIcon className="w-6 h-6 text-indigo-400" />
                              <p className="text-xs font-bold text-slate-700">Drag or click to attach product attachment metadata</p>
                              <span className="text-[9px] text-slate-400">Suports PNG, JPG, or WhatsApp Chat logs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {importMethod === 'manual' && (
                      <div className="text-[11px] bg-slate-100 p-3 rounded-xl border border-slate-200">
                        👨🔬 <strong>Direct Input Mode:</strong> Skip AI extraction layers. Type details directly into the fields below to construct the CBK-regulated escrow payment.
                      </div>
                    )}

                    {importMethod !== 'manual' && (
                      <button 
                        type="button"
                        onClick={handleAIExtract}
                        disabled={isExtracting || (importMethod === 'url' ? !socialUrl : !uploadedImageBase64)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        {isExtracting ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin text-white" />
                            <span>Gemini AI executing layer checklists...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                            <span>Run Multi-Layered Product Extraction Pipeline</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {extractionAlert && (
                    <div className={`p-3 rounded-xl border flex items-center gap-2 leading-tight ${
                      extractionAlert.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    }`}>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{extractionAlert.text}</span>
                    </div>
                  )}
                </div>

                {/* PAE DYNAMIC WORKSPACE: CONFIDENCE LEVEL FEEDBACK & MANUAL CONFIRMATION LAYER */}
                {paeDetails && importMethod !== 'manual' && (
                  <div className="p-5 bg-indigo-50/20 rounded-2xl border border-indigo-100/60 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        🛡️ Layer 7: Manual Confirmation Workspace
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        AI publishes NEVER silently. Review draft details
                      </span>
                    </div>

                    {/* CONFIDENCE BANNER DECISIONS */}
                    {paeDetails.confidenceLevel === 'HIGH' && (
                      <div className="bg-emerald-50 border border-emerald-200 px-4 py-3.5 rounded-xl flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-950 block font-bold text-xs">⚡ High Confidence Extract ({paeDetails.confidenceScore}%)</strong>
                          <span className="text-emerald-800/90 text-[10px] leading-relaxed block mt-0.5">
                            All necessary parameters verified via **{paeDetails.primaryLayerUsed}**. Check form inputs and click Generate to publish protected checkout link.
                          </span>
                        </div>
                      </div>
                    )}

                    {paeDetails.confidenceLevel === 'MEDIUM' && (
                      <div className="bg-amber-50 border border-amber-200 px-4 py-3.5 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-950 block font-bold text-xs">⚠️ Medium Confidence Extract ({paeDetails.confidenceScore}%)</strong>
                          <span className="text-amber-800/90 text-[10px] leading-relaxed block mt-0.5">
                            Some uncertainty identified. We highlighted uncertain fields (glowing gold borders) for easy seller correction to bypass blocks.
                          </span>
                        </div>
                      </div>
                    )}

                    {paeDetails.confidenceLevel === 'LOW' && (
                      <div className="bg-rose-50 border border-rose-200 px-4 py-3.5 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-rose-950 block font-bold text-xs">🛑 Low Confidence Extract ({paeDetails.confidenceScore}%)</strong>
                          <span className="text-rose-800/90 text-[10px] leading-relaxed block mt-0.5">
                            Confidence score is under threshold. System defaults applied across fields to ensure the product creation flow is NEVER blocked. Fill fields manually below.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* EXTRACTED PROFILE ANALYSIS LOG LINES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] bg-white p-3.5 rounded-xl border">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase tracking-wider text-[8px]">Primary extraction Layer Succeeded</span>
                        <p className="font-extrabold text-slate-800 mt-0.5">{paeDetails.primaryLayerUsed}</p>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase tracking-wider text-[8px]">Verification Trace Layers Applied</span>
                        <p className="font-semibold text-slate-600 mt-0.5">{paeDetails.layersApplied?.join(', ') || 'N/A'}</p>
                      </div>
                      {paeDetails.originalPriceText && (
                        <div className="sm:col-span-2 border-t pt-2 border-slate-100 flex justify-between items-center flex-wrap">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">🎯 Smart Price Detector Match:</span>
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                            Detected {paeDetails.originalPriceText} • Confidence {paeDetails.confidenceScore}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* AI BENTO SUGGESTION ENGINE PANEL */}
                    {paeDetails.suggestions && (
                      <div className="space-y-3 bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-4.5 rounded-xl">
                        <div className="flex justify-between items-center border-b border-indigo-900 pb-2.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            💡 AI Product Suggestion Engine
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">Click any pill to instantly apply to form</span>
                        </div>

                        <div className="space-y-3.5">
                          {/* Alternative name titles selection */}
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight">Suggested Product Titles:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {paeDetails.suggestions.productTitle?.map((t: string, idx: number) => (
                                <button 
                                  key={idx}
                                  type="button" 
                                  onClick={() => setItemName(t)} 
                                  className="text-[10px] font-bold bg-white/10 hover:bg-emerald-500 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/5 transition text-left cursor-pointer text-slate-200"
                                >
                                  👉 "{t}"
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick Category switcher suggestion */}
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight">Suggested Categories:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {paeDetails.suggestions.category?.map((cat: string, idx: number) => (
                                <button 
                                  key={idx}
                                  type="button" 
                                  onClick={() => {
                                    // Map categories securely
                                    if (cat.includes('Fashion')) setPaeDetails({...paeDetails, category: 'Apparel & Fashion'});
                                    else if (cat.includes('Footwear') || cat.includes('Shoes')) setPaeDetails({...paeDetails, category: 'Footwear & Kicks'});
                                  }} 
                                  className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full text-slate-300 font-bold transition cursor-pointer"
                                >
                                  📂 {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Suggested safeguard Tags */}
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight">Escrow Safeguard Tags:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {paeDetails.suggestions.tags?.map((tg: string, idx: number) => (
                                <button 
                                  key={idx}
                                  type="button" 
                                  onClick={() => setDescription(description + ` #${tg}`)} 
                                  className="text-[9px] font-mono bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 transition cursor-pointer"
                                >
                                  #{tg}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Beautiful description rewrite templates block */}
                          {paeDetails.suggestions.description && (
                            <div className="space-y-1.5 border-t border-indigo-900 pt-3">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight">Polished Social Commerce Template:</span>
                              <div className="p-3 bg-white/5 text-slate-200 text-[10px] rounded-lg relative leading-relaxed font-mono">
                                <p className="line-clamp-3">{paeDetails.suggestions.description}</p>
                                <button 
                                  type="button"
                                  onClick={() => setDescription(paeDetails.suggestions.description)}
                                  className="mt-2 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
                                >
                                  ✨ Apply Premium Description with Emojis
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Main product creation settings fields */}
                <form onSubmit={handleGenerateLink} className="space-y-4">
                  <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-t border-slate-100 pt-3">Product Particulars</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Item Title Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between items-center">
                        <span>Product Title</span>
                        {paeDetails && paeDetails.confidenceLevel !== 'HIGH' && paeDetails.highlightedFields?.includes('productTitle') && (
                          <span className="text-[9px] font-bold text-amber-600 animate-pulse bg-amber-50 px-1 rounded">Amber Level Verify</span>
                        )}
                      </label>
                      <input 
                        type="text" 
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className={`w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5 outline-none focus:bg-white font-semibold text-slate-800 transition ${
                          paeDetails && paeDetails.confidenceLevel !== 'HIGH' && paeDetails.highlightedFields?.includes('productTitle') 
                            ? 'border-amber-400 ring-2 ring-amber-100 focus:border-amber-500' 
                            : 'border-slate-200 focus:border-indigo-500'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Product Category</label>
                      <select 
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-slate-700 font-semibold"
                      >
                        <option value="Electronics & Gadgets">📱 Electronics & Gadgets</option>
                        <option value="Vehicles & Motors">🚗 Vehicles & Motors</option>
                        <option value="Machinery & Tools">⚙️ Machinery & Tools</option>
                        <option value="Furniture & Living">🛋️ Furniture & Living</option>
                        <option value="Apparel & Fashion">👕 Apparel & Fashion</option>
                        <option value="Other Products">📦 Other Products</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Discovery Platform</label>
                      <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-slate-700 font-semibold"
                      >
                        <option value="Instagram">🟣 Instagram Commerce</option>
                        <option value="WhatsApp">🟢 WhatsApp Catalog</option>
                        <option value="TikTok">⚫ TikTok Showcase</option>
                        <option value="Facebook">🔵 Facebook Marketplace</option>
                        <option value="Telegram">🔵 Telegram Group channel</option>
                      </select>
                    </div>
                  </div>

                  {/* Description input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between items-center">
                      <span>Product Description</span>
                      {paeDetails && paeDetails.confidenceLevel !== 'HIGH' && paeDetails.highlightedFields?.includes('description') && (
                        <span className="text-[9px] font-bold text-amber-600 animate-pulse bg-amber-50 px-1 rounded">Amber Review</span>
                      )}
                    </label>
                    <textarea 
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5 outline-none focus:bg-white text-slate-600 resize-none font-medium leading-relaxed transition ${
                        paeDetails && paeDetails.confidenceLevel !== 'HIGH' && paeDetails.highlightedFields?.includes('description') 
                          ? 'border-amber-400 ring-2 ring-amber-100 focus:border-amber-500' 
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Price Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between items-center">
                        <span>Price (Ksh)</span>
                        {paeDetails && paeDetails.confidenceLevel !== 'HIGH' && paeDetails.highlightedFields?.includes('price') && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded animate-pulse">Assign Value</span>
                        )}
                      </label>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className={`w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5 outline-none focus:bg-white font-mono font-bold text-slate-800 transition ${
                          paeDetails && paeDetails.confidenceLevel !== 'HIGH' && paeDetails.highlightedFields?.includes('price') 
                            ? 'border-amber-400 ring-2 ring-amber-100 focus:border-amber-500 animate-pulse' 
                            : 'border-slate-200 focus:border-indigo-500'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Inventory Stock</label>
                      <input 
                        type="number" 
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-800"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Est. Ship-out Time</label>
                      <select 
                        value={daysToDeliver}
                        onChange={(e) => setDaysToDeliver(parseInt(e.target.value))}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-slate-700 font-semibold"
                      >
                        <option value={1}>24 Hours Dispatch</option>
                        <option value={2}>2 Days Courier</option>
                        <option value={3}>3 Days Fargo/Boda</option>
                        <option value={7}>7 Days (CBK Max Limit)</option>
                      </select>
                    </div>
                  </div>

                  {/* SHIPPING COST CONFIGURATION ENGINE */}
                  <div className="border border-slate-100 p-4 rounded-2xl bg-indigo-50/30 space-y-3">
                    <span className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Configure Shipping Rates (Ksh)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Courier (Flat-rate)</label>
                        <input 
                          type="number" 
                          value={courierFee}
                          onChange={(e) => setCourierFee(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Pickup (Store)</label>
                        <input 
                          type="number" 
                          value={pickupFee}
                          onChange={(e) => setPickupFee(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Boda / Self Delivery</label>
                        <input 
                          type="number" 
                          value={sellerDeliveryFee}
                          onChange={(e) => setSellerDeliveryFee(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BUY SAFELY VERIFIED PRODUCT INSPECTION PROGRAM */}
                  <div className="border border-indigo-200 p-5 rounded-2xl bg-indigo-50/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="block text-[11px] font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        🔬 Buy Safely Product Inspection Program
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        verificationStatus === 'UNVERIFIED' ? 'bg-amber-100 text-amber-800' :
                        verificationStatus === 'AUDITOR_ASSIGNED' ? 'bg-amber-500 text-white animate-pulse' :
                        verificationStatus === 'INSPECTION_COMPLETED' ? 'bg-blue-600 text-white animate-pulse' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {verificationStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal">
                      Connect an independent Trust Auditor (Picker) to inspect and certify your products before sale. Displays the verified badge on social storefronts, lowering counterfeit disputes, increasing buyer conversions, and fast-tracking escrow payouts. Recommended for vehicles, machinery, electronics, and furniture.
                    </p>

                    {/* EXPIRATION GUIDE */}
                    <div className="bg-white/80 rounded-xl p-2.5 border border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                      <div>
                        <span className="font-bold text-slate-700 block">Category Expiry Policy:</span>
                        <span className="font-semibold text-indigo-600">Electronics: 30D | Furniture: 60D | Vehicles: 14D | Machinery: 30D | Fashion: 30D</span>
                      </div>
                      <div className="text-right border-l border-slate-100 pl-2">
                        <span className="font-bold text-slate-700 block text-right">Current Category Exp:</span>
                        <span className="font-bold text-slate-900">{CATEGORY_DETAILS[productCategory]?.validity || 30} Days validity</span>
                      </div>
                    </div>

                    {verificationStatus === 'UNVERIFIED' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Select Inspection Tier:</label>
                            <select
                              value={verificationTier}
                              onChange={(e) => setVerificationTier(e.target.value as any)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold text-slate-700"
                            >
                              <option value="STANDARD">Standard Inspection (Ksh {CATEGORY_DETAILS[productCategory]?.standard})</option>
                              <option value="PRIORITY">Priority Inspection (Ksh {CATEGORY_DETAILS[productCategory]?.priority})</option>
                              <option value="PREMIUM">Premium Inspection (Ksh {CATEGORY_DETAILS[productCategory]?.premium})</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Assigned Trust Auditor:</label>
                            <div className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1.55">
                              🕵️ Picker Alex (Trust Rating: 99%)
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRegisterAndRequest}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow cursor-pointer text-center border-0"
                        >
                          Request Independent Product Verification (Setup Audit)
                        </button>
                      </div>
                    )}

                    {/* AUDITOR ASSIGNED TIMELINE & ACTIONS */}
                    {verificationStatus === 'AUDITOR_ASSIGNED' && (
                      <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                        <div className="flex gap-2.5 items-start">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-[10px] text-slate-600 space-y-0.5">
                            <span className="font-bold text-slate-900 block">Trust Auditor Dispatched to Seller Location</span>
                            <p>Auditor Alex (CBD Representative) is carrying out the verified audit scheduling. He will physically check dimensions, seller ID/location, take high-res media, and run operational diagnostic tests.</p>
                          </div>
                        </div>

                        {/* Interactive Auditor Checklist Simulation block */}
                        <div className="bg-white p-3 rounded-lg border border-amber-100 space-y-3">
                          <strong className="block text-[10px] text-slate-700">✍️ Simulated Physical Inspection Diagnostic Checklist:</strong>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                            <div>
                              <span className="block font-bold text-slate-500 mb-0.5 font-mono text-[9px]">Item Condition:</span>
                              <select 
                                value={auditCondition}
                                onChange={(e) => setAuditCondition(e.target.value as any)}
                                className="bg-slate-50 border border-slate-200 rounded p-1 w-full text-[10px]"
                              >
                                <option value="Excellent">🌟 Excellent (Flawless)</option>
                                <option value="Good">👍 Good (Light wear)</option>
                                <option value="Fair">😐 Fair (Average)</option>
                                <option value="Poor">🚨 Poor (Damaged)</option>
                              </select>
                            </div>
                            <div>
                              <span className="block font-bold text-slate-500 mb-0.5 font-mono text-[9px]">Tested Serial Number:</span>
                              <input 
                                type="text"
                                value={auditSerial}
                                onChange={(e) => setAuditSerial(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded p-1 w-full text-[10px]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-700 font-mono">
                            <input 
                              type="checkbox"
                              checked={auditFunctional}
                              onChange={(e) => setAuditFunctional(e.target.checked)}
                              id="functional-audit-pass"
                            />
                            <label htmlFor="functional-audit-pass" className="font-semibold cursor-pointer">Functional Diagnostic Tests PASS</label>
                          </div>

                          <div>
                            <span className="block font-bold text-slate-500 mb-0.5 text-[9px] uppercase font-mono">Auditor Notes & Visual Media Logs:</span>
                            <textarea 
                              value={auditNotes}
                              onChange={(e) => setAuditNotes(e.target.value)}
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[9px] font-mono"
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={handleAuditorInspectSubmit}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold py-2 rounded-lg transition border-0 cursor-pointer text-center"
                          >
                            🕵️ Record Physical Verification & Submit Report
                          </button>
                        </div>
                      </div>
                    )}

                    {/* REPORT SUBMITTED, REVIEW PENDING */}
                    {verificationStatus === 'INSPECTION_COMPLETED' && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-3 text-[10px] text-slate-600">
                        <div className="flex gap-2.5 items-start">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block font-mono">PHYSICAL REPORT SUBMITTED SUCCESSFULLY</span>
                            <p>Independent Picker report received. Product is waiting for instant CBK platform vetting. The checklist passed and verification recommendation is locked on-chain.</p>
                          </div>
                        </div>

                        {/* Summary of what picker filed */}
                        <div className="bg-white p-2.5 rounded-lg border border-blue-100 font-mono text-[9px] space-y-1">
                          <p><span className="text-slate-400">Condition:</span> <span className="font-bold text-slate-800">{auditCondition}</span></p>
                          <p><span className="text-slate-400">Serial No:</span> <span className="font-bold text-slate-800">{auditSerial}</span></p>
                          <p><span className="text-slate-400">Functional Test:</span> <span className="font-bold text-emerald-700">{auditFunctional ? 'PASS' : 'FAIL'}</span></p>
                          <p><span className="text-slate-400">Notes:</span> <span>"{auditNotes}"</span></p>
                        </div>

                        <button
                          type="button"
                          onClick={handleInstantSystemApprove}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 rounded-lg transition border-0 cursor-pointer"
                        >
                          🎓 Instant Review, Approve & Issue Verification Badge
                        </button>
                      </div>
                    )}

                    {/* GOLD BADGE ACTIVE WITH TOOLTIP */}
                    {verificationStatus === 'VERIFIED' && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-[10px] text-slate-600">
                        <div className="flex gap-2 items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-950 block">BUY SAFELY VERIFIED BADGE ACTIVE! 🛡️</span>
                            <p className="text-[8px] text-slate-500 font-medium font-mono">Inspected on {new Date(verificationAt || Date.now()).toLocaleDateString()} • Expires: {new Date(verificationExpiresAt || (Date.now() + 30*24*3600*1000)).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed">
                          Your social checkout link has been upgraded with the verified badge. It ranks higher, enjoys optimized conversions, and demonstrates physical availability of the checked items to risk models.
                        </p>
                        <div className="bg-white p-2 rounded border border-emerald-100 text-[9px] italic text-slate-500 font-mono">
                          "Independently inspected and verified by a Buy Safely Trust Auditor."
                        </div>
                      </div>
                    )}

                    {/* STORE PLANS (BULK PACKS) */}
                    <div className="border-t border-slate-100 pt-3 space-y-2.5">
                      <span className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        🏬 Store Verification Subscription Plans (Bulk Merchants)
                      </span>
                      <p className="text-[9px] text-slate-500">
                        Sellers running high volume social commerce can subscribe to monthly package plans containing automatic, pre-paid, priority auditor bookings:
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSubscribeBulkPlan('BASIC')}
                          className={`p-2 rounded-xl text-center border-2 transition cursor-pointer ${
                            bulkPlanSubscribed === 'BASIC' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-150 bg-white hover:border-slate-200'
                          }`}
                        >
                          <strong className="block text-slate-800 text-[10px]">Basic (10)</strong>
                          <span className="text-[9px] font-mono block text-slate-500">Ksh 3,999/mo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSubscribeBulkPlan('GROWTH')}
                          className={`p-2 rounded-xl text-center border-2 transition cursor-pointer ${
                            bulkPlanSubscribed === 'GROWTH' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-150 bg-white hover:border-slate-200'
                          }`}
                        >
                          <strong className="block text-slate-800 text-[10px]">Growth (50)</strong>
                          <span className="text-[9px] font-mono block text-slate-500">Ksh 14,999/mo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSubscribeBulkPlan('ENTERPRISE')}
                          className={`p-2 rounded-xl text-center border-2 transition cursor-pointer ${
                            bulkPlanSubscribed === 'ENTERPRISE' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-150 bg-white hover:border-slate-200'
                          }`}
                        >
                          <strong className="block text-slate-800 text-[10px]">Enterprise (∞)</strong>
                          <span className="text-[9px] font-mono block text-slate-500">Ksh 29,999/mo</span>
                        </button>
                      </div>

                      {showBulkPlanSuccess && (
                        <div className="p-2 text-center bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] rounded-xl font-bold font-mono">
                          ✓ Subscribed successfully! High conversion status unlocked.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TRANSIT & CARGO INSURANCE CONFIGURATION */}
                  <div className="border border-slate-150 p-5 rounded-2xl bg-white space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="block text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        🛡️ Transit & Cargo Insurance Settings
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Safe Buy Insured
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal">
                      Establish the shipping protection policy for this social checkout link. Insure shipments against theft, damage, or loss in transit underwritten by Jubilee and Britam Insurance.
                    </p>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Transit Protection Policy Mode:</label>
                      <select
                        value={insurancePolicy}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setInsurancePolicy(val);
                          // Force logical default chosen values inside Checkout Simulator based on Selected settings!
                          if (val === 'NONE' || val === 'SELLER_COVERS') {
                            setSelectedInsuranceOption('NONE');
                          } else {
                            setSelectedInsuranceOption('BASIC');
                          }
                        }}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-semibold text-slate-700 font-sans"
                      >
                        <option value="NONE">No Insurance (Deactivated)</option>
                        <option value="BUYER_CHOOSES">Buyer May Choose Insurance (Optional)</option>
                        <option value="SELLER_COVERS">Seller Covers Insurance (Free for Buyer)</option>
                        <option value="MANDATORY">Insurance Mandatory (Required for Escrow Release)</option>
                        <option value="SHARED">Shared Cost (50/50 Split between Buyer & Seller)</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-[10px] text-slate-650">
                      <strong className="text-slate-850 block text-[9.5px] font-bold">💡 Jubilee/Britam Underwriter Premium Tiers:</strong>
                      <ul className="list-disc leading-relaxed pl-4 space-y-0.5 text-[9px] text-slate-450">
                        <li>Up to Ksh 5,000: <strong className="text-slate-700 font-mono">1.5% premium rate</strong></li>
                        <li>Ksh 5,001–20,000: <strong className="text-slate-700 font-mono">1.2% premium rate</strong></li>
                        <li>Ksh 20,001–100,000: <strong className="text-slate-700 font-mono">1.0% premium rate</strong></li>
                        <li>Above Ksh 100,000: <strong className="text-slate-700 font-mono">0.8% premium rate</strong></li>
                        <li>Minimum absolute underwriter cover rate is <strong className="text-indigo-600 font-mono">Ksh 40</strong> per parcel.</li>
                      </ul>
                    </div>
                  </div>

                  {showMpesaPrompt && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center space-y-1">
                          <span className="text-3xl">📲</span>
                          <h3 className="font-black text-slate-900 tracking-tight text-base">Safaricom M-Pesa STK Push</h3>
                          <p className="text-[10px] text-slate-500">Physical Pre-Sale Inspection Escrow Fee Payout Authorization</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-[10px] text-slate-600">
                          <div className="flex justify-between font-mono">
                            <span>Verification Fee:</span>
                            <strong className="text-slate-900">Ksh {CATEGORY_DETAILS[productCategory][verificationTier.toLowerCase() as 'standard' | 'priority' | 'premium'].toLocaleString()} Relator</strong>
                          </div>
                          <div className="flex justify-between font-mono text-[9px] text-indigo-600 border-t border-slate-100 pt-2 font-bold font-mono">
                            <span>Service Tier:</span>
                            <span>{verificationTier} EXPEDITION</span>
                          </div>
                        </div>

                        {/* REVENUE BREAKDOWN - AUDITABILITY SYNC (Hides commission details from buyers/sellers) */}
                        <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1.5 text-[9px] text-slate-600">
                          <strong className="block text-[10px] text-indigo-950 font-extrabold font-mono uppercase">📊 Internal Financial Allocation Sync:</strong>
                          <p className="text-[8px] text-slate-400 font-medium font-sans">To maintain privacy, the following revenue distribution split is restricted to the platform ledger account logs:</p>
                          <div className="space-y-1 font-mono text-[9px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Auditor Delivery Compensation (75%):</span>
                              <span className="font-bold text-slate-800">Ksh {(CATEGORY_DETAILS[productCategory][verificationTier.toLowerCase() as 'standard' | 'priority' | 'premium'] * 0.75).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold text-indigo-800">Buy Safely Network Allocation (20%):</span>
                              <span className="font-bold text-indigo-600">Ksh {(CATEGORY_DETAILS[productCategory][verificationTier.toLowerCase() as 'standard' | 'priority' | 'premium'] * 0.20).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">M-Pesa API Settlement PSP (5%):</span>
                              <span className="font-bold text-slate-800">Ksh {(CATEGORY_DETAILS[productCategory][verificationTier.toLowerCase() as 'standard' | 'priority' | 'premium'] * 0.05).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500">Enter Payment Number:</label>
                          <input 
                            type="text"
                            value={mpesaPaymentNumber}
                            onChange={(e) => setMpesaPaymentNumber(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold font-mono text-center outline-none focus:border-indigo-500 focus:bg-white"
                          />
                        </div>

                        {isVerifyingPayment ? (
                          <div className="flex items-center justify-center gap-2 text-indigo-600 text-xs font-black py-2.5">
                            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            Authorizing Secure Escrow Ledgers...
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowMpesaPrompt(false)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl cursor-pointer border-0"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmMpesaPayment}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer border-0"
                            >
                              Authorize & Pay
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-slate-100 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Payout Mobile Money M-Pesa Number</label>
                      <input 
                        type="text" 
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold text-slate-800"
                        placeholder="254798765432"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Public Seller Store Handle</label>
                      <input 
                        type="text" 
                        value={sellerHandle}
                        onChange={(e) => setSellerHandle(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3.5 rounded-xl transition shadow active:scale-[0.98] cursor-pointer mt-4 flex items-center justify-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4 text-emerald-400" />
                    <span>Generate Universal Buyer Escrow Link</span>
                  </button>
                </form>

                {scamRisk !== null && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">AI Safety Score assessment:</span>
                      <span className={`font-mono text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${scamRisk > 30 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {scamRisk > 30 ? 'Moderate Flag' : 'High Trust Verified'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{scamComments}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EMBEDDED BUTTONS & INTEGRATION PLUGINS */}
            {formTab === 'embeds' && (
              <div className="space-y-6">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1">
                    <Code className="w-4 h-4" /> Code Snippet Copy Hub
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Insert Buy Safely credentials directly on WordPress, custom Shopify pages, WooCommerce items, or Linktree pages. No backend code required. Simply copy the code snippets and let customers pay securely.
                  </p>
                </div>

                {/* VISUAL LAYOUT OF EMBEDDABLE WIDGET */}
                <div className="space-y-4 border border-slate-100 p-5 rounded-3xl bg-slate-50/50">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Interactive Widgets Mock Preview</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* WIDGET 1: Embedded Trust Button */}
                    <div className="bg-white border p-4 rounded-2xl space-y-3 shadow-sm select-none">
                      <span className="block text-[9px] text-indigo-600 uppercase font-black font-mono">1. Embedded Button</span>
                      <p className="text-[10px] text-slate-500 leading-snug">Renders a compact, high-converting trust CTA button anywhere.</p>
                      
                      <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                        🛡️ Buy Safely • Ksh {(parseFloat(price) || 2500).toLocaleString()}
                      </button>
                    </div>

                    {/* WIDGET 2: Embedded Compact Bento Card */}
                    <div className="bg-white border p-4 rounded-2xl space-y-4 shadow-sm select-none flex flex-col justify-between">
                      <span className="block text-[9px] text-indigo-600 uppercase font-black font-mono">2. Premium Bento Widget</span>
                      
                      <div className="space-y-1">
                        <div className="bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-full w-max uppercase tracking-wider">
                          🔒 CBK Escrow Guarded
                        </div>
                        <h5 className="font-extrabold text-slate-900 line-clamp-1">{itemName}</h5>
                        <p className="text-[9px] text-slate-400">Seller Trust Level: 9.8/10 rating</p>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-800 text-xs font-black font-mono">Ksh {(parseFloat(price) || 2500).toLocaleString()}</span>
                        <button className="bg-slate-900 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg">Buy Safely</button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* COPYABLE CODE SNIPPET BOXES */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">HTML Trust Button Embed Snippet</label>
                      <button 
                        onClick={() => handleCopySnippet(embedCodeHTML, 'btn')}
                        className="text-xs text-indigo-600 font-black flex items-center gap-1"
                      >
                        {copiedSnippetType === 'btn' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSnippetType === 'btn' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono leading-normal bg-slate-900 text-emerald-300 p-3 rounded-xl overflow-x-auto border border-slate-800 select-all max-h-24">
                      {embedCodeHTML}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">Premium Bento Card Widget HTML</label>
                      <button 
                        onClick={() => handleCopySnippet(embeddedWidgetHTML, 'card')}
                        className="text-xs text-indigo-600 font-black flex items-center gap-1"
                      >
                        {copiedSnippetType === 'card' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSnippetType === 'card' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono leading-normal bg-slate-900 text-emerald-300 p-3 rounded-xl overflow-x-auto border border-slate-800 select-all max-h-32">
                      {embeddedWidgetHTML}
                    </pre>
                  </div>
                </div>

              </div>
            )}

            {/* LIVE SHARE LINK PANEL */}
            {generatedLink && (
              <div className="bg-emerald-500 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden select-none">
                <div className="absolute right-[-10%] top-[-20%] opacity-20 aspect-square bg-white rounded-full w-48 blur-2xl"></div>

                <div className="space-y-2 relative z-10">
                  <span className="text-[9px] text-emerald-950 bg-white/20 px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-widest font-black">
                    ✓ Escrow Checkouts Activated
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">Protected Seller Link Generated</h3>
                  <p className="text-xs text-emerald-100">Copy and place this URL in WhatsApp catalogs, Instagram profiles, TikTok bios, or WordPress links.</p>
                </div>

                {/* Main Link box */}
                <div className="flex bg-white/20 rounded-2xl p-2 border border-white/10 items-center justify-between gap-2 relative z-10">
                  <div className="font-mono text-xs text-white font-medium overflow-x-auto whitespace-nowrap px-2">
                    {generatedLink}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="bg-white text-emerald-800 hover:bg-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy link'}</span>
                  </button>
                </div>

                {/* Social media direct shares */}
                <div className="border-t border-white/10 pt-4 flex flex-wrap gap-2 text-xs font-semibold relative z-10">
                  <a 
                    href={`https://wa.me/?text=Buy%20safely%20with%20escrow%20protection:%20${generatedLink}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Shop
                  </a>
                  
                  <button 
                    onClick={() => alert(`Please paste: "${generatedLink}" in Instagram direct messages.`)}
                    className="bg-pink-600 hover:bg-pink-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Instagram className="w-3.5 h-3.5" /> Instagram DM
                  </button>

                  <a 
                    href={`https://t.me/share/url?url=${generatedLink}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-sky-600 hover:bg-sky-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Telegram Post
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: SMARTPHONE USER CHECKOUT SANDBOX (HIGHLY INTERACTIVE) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="flex justify-between items-center select-none">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">M-Pesa Buyer Device Playground</h4>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold font-mono px-2 py-0.5 rounded">Checkout Simulator</span>
          </div>

          {/* REAL MOBILE BROWSER INTEGRATION SHELL */}
          <div className="relative mx-auto max-w-[340px] border-[10px] border-slate-900 rounded-[44px] bg-white h-[680px] shadow-2xl overflow-hidden flex flex-col justify-between font-sans ring-1 ring-slate-100">
            
            {/* Phone Top Notch Speaker */}
            <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 z-50 rounded-b-xl flex justify-center items-center">
              <div className="w-16 h-2 bg-slate-800 rounded-full"></div>
            </div>

            {/* In-app Browser Address Header */}
            <div className="bg-slate-900 text-white pt-6 pb-2.5 px-4 text-xs flex justify-between items-center border-b border-slate-800 shrink-0 select-none">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-200">buysafely.africa/pay/BS-{socialUrl ? 'LINK' : 'PORTAL'}</span>
              </div>
              <div className="flex gap-2 text-slate-400">
                <span>🔒 Secure API</span>
              </div>
            </div>

            {/* INTERACTIVE COMPONENT SWITCHER STEP PANEL */}
            <div className="flex-1 bg-slate-50/50 overflow-y-auto p-4 space-y-4 pt-4 text-xs">
              
              {/* STAGE 1: DYNAMIC CHECKOUT FORM */}
              {phoneStep === 'form' && (
                <div className="space-y-4">
                  
                  {/* Item Summary Header */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold rounded-full px-2 py-0.5 text-[8px] uppercase tracking-wider flex items-center gap-1 w-max">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> CBK Protected Trade
                      </span>
                      {verificationStatus === 'VERIFIED' && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 font-extrabold rounded-full px-2 py-0.5 text-[8px] uppercase tracking-wider flex items-center gap-1 w-max relative group cursor-help">
                          <CheckCircle className="w-3 h-3 text-amber-600 fill-amber-100" /> Buy Safely Verified
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-44 p-2 bg-slate-900 text-white font-sans text-[8px] font-medium rounded-lg shadow-xl z-20 normal-case leading-normal text-center">
                            🛡️ "Independently inspected and verified by a Buy Safely Trust Auditor."
                          </span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 tracking-tight leading-snug">{itemName}</h4>
                        <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{description}</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0 overflow-hidden border">
                        {uploadedImageBase64 ? (
                          <img src={uploadedImageBase64} alt="Pre" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-4 h-4" /></div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2 text-white font-mono flex justify-between items-center rounded-lg leading-none">
                      <span className="text-[9px] font-bold text-slate-400">Unit Price:</span>
                      <strong className="text-xs">Ksh {(parseFloat(price) || 2500).toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* STEP A: QUANTITY SELECTOR (REACTIVE) */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 tracking-tight">1. Determine Quantity</span>
                      <span className="text-[9px] text-slate-400 font-bold">Stock available: {stock}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => buyerQty > 1 && setBuyerQty(buyerQty - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-extrabold font-mono text-slate-900 w-6 text-center">{buyerQty}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (buyerQty < parseInt(stock)) {
                            setBuyerQty(buyerQty + 1);
                          } else {
                            alert(`Seller stock limit reached (${stock} units left).`);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {buyerQty >= parseInt(stock) && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">STOCK LIMIT</span>
                      )}
                    </div>
                  </div>

                  {/* BUYER PROFILE & IDENTITY STATE FORM */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center whitespace-nowrap">
                      <span className="font-extrabold text-slate-800 tracking-tight text-[11px]">2. Buyer Profile &amp; Identity</span>
                      <span className="text-[7.5px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">CBK Sandbox Mode</span>
                    </div>

                    {/* Account Switcher */}
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-150/60 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => {
                          setBuyerAccountType('GUEST');
                          setBuyerNationalId('');
                        }}
                        className={`py-1 text-[9.5px] font-extrabold text-center rounded-lg cursor-pointer transition ${buyerAccountType === 'GUEST' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                      >
                        Guest Checkout
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setBuyerAccountType('REGISTERED');
                        }}
                        className={`py-1 text-[9.5px] font-extrabold text-center rounded-lg cursor-pointer transition ${buyerAccountType === 'REGISTERED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                      >
                        Registered User
                      </button>
                    </div>

                    {/* Common Name Field */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[8.5px] font-bold text-slate-500 mb-0.5">Purchaser Full Name</label>
                        <input 
                          type="text" 
                          value={buyerName} 
                          onChange={(e) => {
                            setBuyerName(e.target.value);
                            if (!isNotRecipient) setContactPerson(e.target.value);
                          }} 
                          className="w-full bg-slate-50 border rounded-lg p-2 text-xs font-semibold" 
                          placeholder="e.g. James Kamau"
                          required 
                        />
                      </div>

                      {/* Conditional National ID field for registered */}
                      {buyerAccountType === 'REGISTERED' && (
                        <div className="animate-fadeIn">
                          <label className="block text-[8.5px] font-bold text-slate-500 mb-0.5">National ID (Required for Verified Members)</label>
                          <input 
                            type="text" 
                            value={buyerNationalId} 
                            onChange={(e) => setBuyerNationalId(e.target.value)} 
                            className="w-full bg-slate-50 border rounded-lg p-2 text-xs font-mono" 
                            placeholder="e.g. 32098412" 
                            required 
                          />
                        </div>
                      )}

                      {/* Recipient Checkbox */}
                      <div className="pt-1.5 border-t border-slate-100 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-600">
                          <input 
                            type="checkbox" 
                            checked={isNotRecipient} 
                            onChange={(e) => {
                              setIsNotRecipient(e.target.checked);
                              if (!e.target.checked) {
                                setContactPerson(buyerName);
                              } else {
                                setContactPerson('');
                              }
                            }} 
                            className="rounded text-indigo-600 accent-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span>Deliver to a separate recipient</span>
                        </label>
                      </div>

                      {/* Conditional Separate Recipient Fields */}
                      {isNotRecipient && (
                        <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-2.5 space-y-2 mt-2 animate-fadeIn">
                          <span className="text-[8.5px] uppercase font-bold text-indigo-800 tracking-wider block">Recipient Contact Details</span>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 mb-0.5">Recipient Full Name</label>
                            <input 
                              type="text" 
                              value={recipientName} 
                              onChange={(e) => {
                                setRecipientName(e.target.value);
                                setContactPerson(e.target.value);
                              }} 
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs" 
                              placeholder="e.g. Mary Wanjiku"
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 mb-0.5">Recipient Phone Number</label>
                            <input 
                              type="text" 
                              value={recipientPhone} 
                              onChange={(e) => {
                                setRecipientPhone(e.target.value);
                                setBuyerContactPhone(e.target.value);
                              }} 
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono" 
                              placeholder="e.g. 0722334455"
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 mb-0.5">Relationship to Purchaser</label>
                            <select 
                              value={recipientRelationship} 
                              onChange={(e) => setRecipientRelationship(e.target.value)} 
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                            >
                              <option value="Friend">Friend / Colleague</option>
                              <option value="Spouse">Spouse / Partner</option>
                              <option value="Family">Family Member / Relative</option>
                              <option value="Client">Corporate Client</option>
                              <option value="Gift Receiver">Gift Receiver</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP B: DELIVERY METHOD SELECTION */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-3">
                    <span className="font-extrabold text-slate-800 tracking-tight block text-[11px]">3. Select Handover Method</span>
                    
                    <div className="grid grid-cols-1 gap-1.5 font-sans">
                      <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${selectedShipping === 'Courier' ? 'bg-indigo-50/40 border-indigo-200 text-indigo-950 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" checked={selectedShipping === 'Courier'} onChange={() => setSelectedShipping('Courier')} />
                          <div>
                            <p className="text-xs">Courier Express Dispatch</p>
                            <span className="text-[9px] text-slate-400 font-medium">Delivered to County & Address</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-indigo-600 font-bold">Ksh {selectedShipping === 'Courier' ? getSelectedShippingFee() : courierFee}</span>
                      </label>

                      <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${selectedShipping === 'Pickup' ? 'bg-indigo-50/40 border-indigo-200 text-indigo-950 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" checked={selectedShipping === 'Pickup'} onChange={() => setSelectedShipping('Pickup')} />
                          <div>
                            <p className="text-xs">Self Collect / Pickup</p>
                            <span className="text-[9px] text-slate-400 font-medium">Collect from verified location</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px]">Ksh {pickupFee}</span>
                      </label>

                      <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${selectedShipping === 'Seller Delivery' ? 'bg-indigo-50/40 border-indigo-200 text-indigo-950 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" checked={selectedShipping === 'Seller Delivery'} onChange={() => setSelectedShipping('Seller Delivery')} />
                          <div>
                            <p className="text-xs">Seller Custom Delivery</p>
                            <span className="text-[9px] text-slate-400 font-medium">Delivered directly by vendor</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px]">Ksh {sellerDeliveryFee}</span>
                      </label>
                    </div>

                    {/* DYNAMIC SHIFT OF DELIVERY FIELDS */}
                    <AnimatePresence mode="wait">
                      {selectedShipping === 'Courier' && (
                        <motion.div 
                          key="courier"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 border-t pt-3.5 border-slate-100"
                        >
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Delivery County</label>
                            <select value={county} onChange={(e) => setCounty(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 font-semibold">
                              <option value="Nairobi">Nairobi County</option>
                              <option value="Mombasa">Mombasa County</option>
                              <option value="Kiambu">Kiambu County</option>
                              <option value="Kisumu">Kisumu County</option>
                              <option value="Nakuru">Nakuru County</option>
                              <option value="Uasin Gishu">Uasin Gishu County</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Town</label>
                              <input type="text" value={town} onChange={(e) => setTown(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2" required />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Recipient Phone</label>
                              <input type="text" value={buyerContactPhone} onChange={(e) => setBuyerContactPhone(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 font-mono" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Fulfillment Address / Landmarks</label>
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2" required />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Recipient Name</label>
                            <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2" required />
                          </div>

                          {/* COURIER SELECTION STEP inside Courier option */}
                          <div className="pt-3.5 border-t border-dashed border-slate-100 space-y-2 mt-2">
                            <div className="flex justify-between items-center leading-none">
                              <span className="text-[10px] uppercase font-extrabold text-indigo-950 tracking-wider">Choose your delivery partner</span>
                              <span className="text-[8px] text-indigo-650 bg-indigo-50 border border-indigo-100 font-bold px-1.5 py-0.5 rounded-sm shrink-0">Marketplace Bids</span>
                            </div>

                            {/* Sorting Controls */}
                            <div className="flex flex-wrap gap-1 justify-between select-none">
                              <span className="text-[8px] font-bold text-slate-400 self-center">Sort:</span>
                              <div className="flex gap-1">
                                {[
                                  { id: 'recommended', label: '⭐ Recommended' },
                                  { id: 'cheapest', label: '💰 Cheapest' },
                                  { id: 'fastest', label: '⚡ Fastest' },
                                  { id: 'highest_rated', label: '👑 Top Rated' }
                                ].map(st => (
                                  <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setCourierSort(st.id as any)}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${courierSort === st.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                  >
                                    {st.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Scrollable Couriers List */}
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                              {getEnrichedCouriers().length === 0 ? (
                                <div className="p-3 text-center text-slate-400 text-[10px] bg-slate-50 rounded-lg">
                                  No available couriers in this radius. Enter town destination.
                                </div>
                              ) : (
                                getEnrichedCouriers().map(courier => {
                                  const isSelected = selectedCourierId === courier.id;
                                  return (
                                    <div
                                      key={courier.id}
                                      onClick={() => setSelectedCourierId(courier.id)}
                                      className={`p-2 rounded-xl border text-[11px] cursor-pointer transition-all duration-150 flex flex-col gap-1.5 relative ${
                                        isSelected
                                          ? 'bg-indigo-50/40 border-2 border-indigo-600 shadow-sm'
                                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      {/* Core details */}
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-sm shrink-0 border border-indigo-100/50">
                                            {courier.avatar || '🏍️'}
                                          </div>
                                          <div className="leading-tight">
                                            <div className="flex items-center gap-1 flex-wrap">
                                              <span className="font-extrabold text-slate-800 tracking-tight">{courier.name}</span>
                                              {courier.isVerified && (
                                                <span className="bg-sky-50 text-sky-700 text-[6px] font-black px-1 rounded-sm uppercase tracking-wide border border-sky-100">Verified</span>
                                              )}
                                            </div>
                                            <p className="text-[8px] text-slate-400 font-medium">{courier.company || courier.vehicleDetails}</p>
                                          </div>
                                        </div>
                                        <div className="text-right leading-none shrink-0">
                                          <span className="text-indigo-600 font-bold font-mono text-xs block">Ksh {courier.fee}</span>
                                          <span className="text-[8px] text-slate-400 font-medium font-sans block mt-0.5">{courier.distance} KM away</span>
                                        </div>
                                      </div>

                                      {/* Detailed telemetry row */}
                                      <div className="flex items-center justify-between text-[8px] bg-slate-50 rounded-lg p-1.5 border border-slate-100 leading-none">
                                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                          <span className="flex items-center gap-0.5"><span className="text-amber-500">★</span> {courier.rating}</span>
                                          <span className="text-slate-300">•</span>
                                          <span>{courier.completedDeliveries} trips</span>
                                          <span className="text-slate-300">•</span>
                                          <span className="capitalize font-mono text-[7px] text-indigo-700 font-black">{courier.vehicleType || 'bike'}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 font-bold">⏱️ {courier.timeText}</span>
                                        </div>
                                      </div>

                                      {/* Selected badge overlay */}
                                      {isSelected && (
                                        <div className="absolute top-1.5 right-1.5 bg-indigo-600 text-white rounded-full p-0.5">
                                          <svg className="w-2 h-2 stroke-[3.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {selectedShipping === 'Pickup' && (
                        <motion.div 
                          key="pickup"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 border-t pt-3.5 border-slate-100"
                        >
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Select Pickup Location</label>
                            <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 font-semibold">
                              <option value="Nairobi CBD - Kimathi Street Coop Tower">Nairobi CBD - Kimathi Street Coop Tower</option>
                              <option value="Westlands Shop - Mall Chambers Floor 1">Westlands Shop - Mall Chambers Floor 1</option>
                              <option value="Mombasa Hub - Nyali Plaza Arcade Ground Floor">Mombasa Hub - Nyali Plaza Arcade Ground Floor</option>
                              <option value="Eldoret Point - Zion Mall Wing B">Eldoret Point - Zion Mall Wing B</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Pickup Date</label>
                              <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 font-semibold" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Collector Contact</label>
                              <input type="text" value={pickupContact} onChange={(e) => setPickupContact(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {selectedShipping === 'Seller Delivery' && (
                        <motion.div 
                          key="seller"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 border-t pt-3.5 border-slate-100"
                        >
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Specify Handover Area</label>
                            <input type="text" value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2 font-semibold" placeholder="e.g. Ruiru, Upperhill office blocks, etc." />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Delivery Contact/Boda Coordinates</label>
                            <input type="text" value={deliveryContactDetails} onChange={(e) => setDeliveryContactDetails(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-2" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* SHIPPING PROTECTION SELECTOR */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 tracking-tight block">🛡️ Shipping Protection</span>
                      {selectedInsuranceOption !== 'NONE' && (
                        <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase">Insured</span>
                      )}
                    </div>
                    
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Protect this shipment against loss, theft, damage, and delivery failures.
                    </p>

                    {insurancePolicy === 'NONE' ? (
                      <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[9px] text-slate-500">
                        ⚠️ Seller has disabled insurance for this shipment link. Underwriting is turned off.
                      </div>
                    ) : insurancePolicy === 'SELLER_COVERS' ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl text-[9px] text-emerald-800 space-y-1">
                        <strong className="block font-bold">✓ Seller Covered Shipping protection active!</strong>
                        <p>The merchant includes full transit coverage under Safe Buy Jubilee Underwriting. You pay <span className="font-mono font-bold">Ksh 0</span> premium.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {insurancePolicy === 'SHARED' && (
                          <div className="bg-indigo-50/50 border border-indigo-150 p-1.5 rounded-lg text-[8px] text-indigo-700 font-semibold">
                            🤝 Shared Cost: Merchant covers 50% of the active premium load!
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-1.5">
                          {insurancePolicy !== 'MANDATORY' && (
                            <button
                              type="button"
                              onClick={() => setSelectedInsuranceOption('NONE')}
                              className={`p-2 rounded-xl border text-left flex items-start justify-between transition text-[9px] ${
                                selectedInsuranceOption === 'NONE' ? 'border-indigo-600 bg-indigo-50/20' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              <div className="leading-tight">
                                <strong className="block text-slate-800">No Insurance</strong>
                                <span className="text-[8px] text-slate-400">Buyer bears complete transit dispute liabilities</span>
                              </div>
                              <span className="font-mono font-bold text-slate-500">Ksh 0</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedInsuranceOption('BASIC')}
                            className={`p-2 rounded-xl border text-left flex items-start justify-between transition text-[9px] ${
                              selectedInsuranceOption === 'BASIC' ? 'border-indigo-600 bg-indigo-50/20' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="leading-tight">
                              <strong className="block text-slate-800">Basic Cover</strong>
                              <span className="text-[8px] text-slate-400">Parcel loss/damage compensation up to item value</span>
                            </div>
                            <span className="font-mono font-bold text-indigo-650">
                              Ksh {insurancePolicy === 'SHARED' 
                                ? Math.round(getInsurancePremium(getSubtotal(), 'BASIC') * 0.5) 
                                : getInsurancePremium(getSubtotal(), 'BASIC')}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedInsuranceOption('ENHANCED')}
                            className={`p-2 rounded-xl border text-left flex items-start justify-between transition text-[9px] ${
                              selectedInsuranceOption === 'ENHANCED' ? 'border-indigo-600 bg-indigo-50/20' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="leading-tight">
                              <strong className="block text-slate-800">Enhanced Cover</strong>
                              <span className="text-[8px] text-slate-400 font-medium text-indigo-600">Priority claim processing • Underwriter fast-track status</span>
                            </div>
                            <span className="font-mono font-bold text-indigo-650">
                              Ksh {insurancePolicy === 'SHARED' 
                                ? Math.round(getInsurancePremium(getSubtotal(), 'ENHANCED') * 0.5) 
                                : getInsurancePremium(getSubtotal(), 'ENHANCED')}
                            </span>
                          </button>
                        </div>

                        {selectedInsuranceOption !== 'NONE' && (
                          <div className="text-[8.5px] text-slate-400 font-mono flex justify-between px-1">
                            <span>Total Underwriter Premium:</span>
                            <span>Ksh {getInsurancePremium(getSubtotal(), selectedInsuranceOption)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* STEP C: PAYMENT DETAILS SETUP */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-2.5">
                    <span className="font-extrabold text-slate-800 tracking-tight block">3. Mobile Money Payment details</span>
                    
                    <div className="grid grid-cols-3 gap-1.5 font-bold font-sans">
                      <button 
                        type="button" 
                        onClick={() => setBuyerNetwork('mpesa')}
                        className={`py-2 rounded-xl border text-[9px] flex items-center justify-center gap-1.5 transition ${buyerNetwork === 'mpesa' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>M-Pesa</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setBuyerNetwork('airtel')}
                        className={`py-2 rounded-xl border text-[9px] flex items-center justify-center gap-1.5 transition ${buyerNetwork === 'airtel' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span>Airtel</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setBuyerNetwork('tcash')}
                        className={`py-2 rounded-xl border text-[9px] flex items-center justify-center gap-1.5 transition ${buyerNetwork === 'tcash' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>T-Cash</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <label className="text-slate-500">Destination Mobile Number</label>
                        <span className="text-slate-400">07XXXXXXXX</span>
                      </div>
                      <input 
                        type="tel" 
                        value={buyerPhoneInput}
                        onChange={(e) => setBuyerPhoneInput(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold text-slate-800 tracking-wider"
                        placeholder="0712345678"
                      />
                      {phoneError && <p className="text-[9px] font-bold text-red-600 mt-0.5">{phoneError}</p>}
                    </div>
                  </div>

                  {/* STEP D: TRANSPARENT COST RECONCILIATION BREAKDOWN */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-2 text-slate-600 select-none">
                    <span className="font-extrabold text-slate-800 tracking-tight block">4. Cost Reconciliation Breakdown</span>
                    
                    <div className="space-y-1.5 font-sans leading-none text-[11px]">
                      <div className="flex justify-between">
                        <span>Product Cost (Escrow Subtotal):</span>
                        <strong className="text-slate-800">Ksh {getSubtotal().toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Cost:</span>
                        <strong className="text-slate-800">Ksh {getSelectedShippingFee().toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-indigo-650 font-medium md:relative group">
                        <span className="flex items-center gap-1">
                          <span>Safe Buy Protection Fee:</span>
                          <span className="cursor-help bg-slate-100 hover:bg-slate-200 text-slate-500 text-[8px] font-bold px-1 rounded-sm">What is this?</span>
                        </span>
                        <strong className="text-indigo-600">Ksh {getProtectionFee().toLocaleString()}</strong>
                        {/* Interactive info absolute card on hover */}
                        <div className="hidden group-hover:block absolute bg-slate-900 text-white rounded-xl p-3 shadow-xl w-64 -top-32 left-0 text-[10px] font-normal tracking-normal leading-normal z-50">
                          <strong className="block text-indigo-300 font-bold mb-1">Safe Buy Protection Fee</strong>
                          Formula: <span className="font-mono bg-slate-800 px-1 rounded">MAX(Amount × 1%, Ksh 25)</span>
                          <p className="text-[9.5px] mt-1 text-slate-300">
                            Based on subtotal of Ksh {getSubtotal().toLocaleString()}: 1% is Ksh {(getSubtotal() * 0.01).toFixed(0)}. Min Ksh 25 applies if under Ksh 2,500.
                          </p>
                          <div className="mt-1.5 border-t border-slate-800 pt-1 text-[8.5px] text-slate-400">
                            Covers secure OTP handovers, SMS communication loops, fraud screening models, and 24/7 client dispute handling.
                          </div>
                        </div>
                      </div>
                      
                      {selectedInsuranceOption !== 'NONE' && (
                        <div className="flex justify-between items-center text-emerald-700 font-semibold text-[11px]">
                          <span className="flex items-center gap-1">
                            <span>Jubilee Cargo Insurance:</span>
                            <span className="bg-emerald-50 text-emerald-800 text-[7px] font-black px-1 rounded-sm uppercase">
                              {insurancePolicy === 'SELLER_COVERS' ? 'Seller Paid' : (insurancePolicy === 'SHARED' ? '50% Split' : 'Buyer Paid')}
                            </span>
                          </span>
                          <strong className="font-mono">
                            {insurancePolicy === 'SELLER_COVERS' ? 'Ksh 0 (Covered)' : `Ksh ${buyerInsurancePremium.toLocaleString()}`}
                          </strong>
                        </div>
                      )}

                      <div className="flex justify-between border-b pb-1.5 border-slate-100">
                        <span>Value Added Taxes (VAT):</span>
                        <span className="text-slate-400 font-bold">Ksh 0 (VAT Exempt)</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 font-mono">
                        <span className="font-bold text-indigo-750 text-xs">TOTAL PAYABLE AMOUNT:</span>
                        <strong className="text-indigo-700 text-sm font-black">Ksh {totalCheckoutAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT STEP TRIGGER BUTTON */}
                  <button 
                    onClick={() => {
                      if (validatePhone(buyerPhoneInput)) {
                        setPhoneStep('confirmation');
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl uppercase tracking-wider text-[11px] shadow-sm flex items-center justify-center gap-1 transition select-none active:scale-[0.98] mt-2"
                  >
                    <span>Inspect Order Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>
              )}

              {/* STAGE 2: STK CONFIRMATION AND ESCROW NOTICE LOCKS SCREEN */}
              {phoneStep === 'confirmation' && (
                <div className="space-y-4">
                  
                  {/* Back arrow header */}
                  <button onClick={() => setPhoneStep('form')} className="flex items-center gap-1 text-xs text-indigo-600 font-extrabold select-none">
                    ← Edit Checkout Parameters
                  </button>

                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-4 shadow-sm select-none">
                    <div className="text-center pb-2.5 border-b border-slate-800 space-y-1">
                      <span className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase font-black">Daraja Secure Node</span>
                      <h4 className="text-sm font-extrabold">Confirm STK Push Dispatch</h4>
                    </div>

                    <div className="space-y-2.5 text-[11px] font-sans">
                      <div className="flex justify-between leading-none">
                        <span className="text-slate-400">Product Particular:</span>
                        <strong className="text-white line-clamp-1 max-w-[120px]">{itemName}</strong>
                      </div>
                      <div className="flex justify-between leading-none">
                        <span className="text-slate-400">Units Demanded:</span>
                        <strong className="text-white font-mono">x {buyerQty}</strong>
                      </div>
                      <div className="flex justify-between leading-none">
                        <span className="text-slate-400">Delivery Profile:</span>
                        <strong className="text-white font-semibold">{selectedShipping} ({selectedShipping === 'Courier' ? county : selectedShipping === 'Pickup' ? 'Collect' : 'Direct'})</strong>
                      </div>
                      <div className="flex justify-between leading-none">
                        <span className="text-slate-400">Payment Wallet:</span>
                        <strong className="text-emerald-400 uppercase font-mono">{buyerNetwork} • {buyerPhoneInput}</strong>
                      </div>
                      {selectedInsuranceOption !== 'NONE' && (
                        <div className="flex justify-between leading-none text-emerald-400">
                          <span>Transit Insurance Cover:</span>
                          <strong>
                            {insurancePolicy === 'SHARED' ? 'Ksh ' + buyerInsurancePremium.toLocaleString() + ' (Shared)' : (insurancePolicy === 'SELLER_COVERS' ? 'Ksh 0 (Seller Covered)' : 'Ksh ' + buyerInsurancePremium.toLocaleString())}
                          </strong>
                        </div>
                      )}
                      <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center">
                        <span className="text-slate-300 font-bold">TOTAL AMOUNT CHARGED:</span>
                        <strong className="text-white font-mono text-base font-black">Ksh {totalCheckoutAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Escrow regulatory protection disclaimer notice card */}
                  <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-2 text-[10px] leading-relaxed">
                    <h5 className="font-extrabold text-sky-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> CBK ESCROW REGULATORY NOTICE
                    </h5>
                    <p className="text-slate-600 text-[9.5px]">
                      Under Central Bank of Kenya trust frameworks, your Ksh {totalCheckoutAmount.toLocaleString()} is safeguarded inside a monitored lockbox under NCBA trusteeship. Payment will <strong className="text-sky-900">NOT</strong> be forwarded to storefront handle <strong className="text-indigo-950">{sellerHandle}</strong> until you verify package receipt or the delivery period resolves. Full dispute mechanism triggers inside.
                    </p>
                  </div>

                  {/* ACTION TRIGGER: INITIATE STK WEBHOOK */}
                  <button 
                    onClick={handleTriggerSTKPayment}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl uppercase tracking-wider text-[11px] shadow-md flex items-center justify-center gap-2 transition select-none active:scale-[0.98]"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pay Ksh {totalCheckoutAmount.toLocaleString()} Safely</span>
                  </button>

                </div>
              )}

              {/* STAGE 3: INTERACTIVE STK RING / WAITING SIMULATE */}
              {phoneStep === 'stk_paying' && (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-16 text-center select-none">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                    <Lock className="w-6 h-6 text-indigo-600 absolute left-5 top-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900">Pushing STK API Prompt...</h4>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-[220px] mx-auto">
                      Safaricom Daraja secure node routing Ksh {totalCheckoutAmount.toLocaleString()} to buyer mobile number {buyerPhoneInput}. Enter your mobile money PIN tool to establish trust ledger deposits.
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE 4: CHECKOUT PROCESS SUCCESS BANNER */}
              {phoneStep === 'success' && (
                <div className="h-full flex flex-col justify-center items-center py-8 space-y-6 text-center select-none">
                  
                  {/* Success lock logo asset */}
                  <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-200 flex items-center justify-center relative shadow-sm">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border uppercase tracking-wider">
                      ✓ Deposit Escrow Funded
                    </span>
                    <h4 className="text-base font-black text-slate-900">Payment Received Safely!</h4>
                    <p className="text-[10px] text-slate-500 max-w-[240px] leading-relaxed mx-auto">
                      Safaricom webhook confirmed. Order code registered onto the public trust timeline. Status advanced to <strong className="text-indigo-950 font-bold">PAID_PENDING_FULFILLMENT</strong>.
                    </p>
                  </div>

                  {/* Summary receipt box */}
                  <div className="bg-white border rounded-2xl p-3.5 w-full space-y-2 text-left text-[10px] leading-relaxed">
                    <div className="flex justify-between font-bold border-b pb-1">
                      <span>Store Handout:</span>
                      <span className="font-mono text-slate-800">{sellerHandle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Items:</span>
                      <span>{buyerQty}x {itemName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Handover:</span>
                      <span>{selectedShipping} ({selectedShipping === 'Courier' ? county : selectedShipping === 'Pickup' ? 'Store' : 'Boda'})</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Escrow Secured:</span>
                      <span className="font-mono">Ksh {totalCheckoutAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setPhoneStep('form');
                      setBuyerQty(1);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition"
                  >
                    Generate Another Checkout Form
                  </button>

                </div>
              )}

            </div>

            {/* LOWER THUMB PAY SAFELY ACTION FOOTER PREVENTATIVE MARGINS */}
            <div className="bg-slate-900 text-[9px] text-slate-400 py-3 text-center tracking-wide shrink-0 select-none">
              <span>🛡️ Securely Hosted on Buy Safely Africa Nodes </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
