import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  Lock, 
  CheckCircle, 
  FileText, 
  Filter, 
  Search, 
  Download, 
  Calendar, 
  Check, 
  ChevronRight, 
  Briefcase, 
  Activity, 
  Sparkles, 
  UserCheck, 
  X, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';

interface BIProps {
  transactions: Transaction[];
  currentStaff: {
    id: string;
    name: string;
    role: string;
    department: string;
    roleKey: string;
    email: string;
  };
  triggerLogWrite: (action: string, previousValue: string, newValue: string) => void;
}

// Data classification levels
type SecurityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'EXECUTIVE';

// Report execution audit log format
interface BIAuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  filters: string;
  exportType: string;
  timestamp: string;
}

// Scheduled report structure
interface ScheduledReport {
  id: string;
  name: string;
  source: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  delivery: 'Platform Inbox' | 'Email' | 'Executive Dashboard';
  savedAt: string;
  createdBy: string;
}

// Saved report structure
interface SavedReport {
  id: string;
  name: string;
  source: string;
  viz: string;
  filters: any;
  createdBy: string;
  isShared: boolean;
}

// Export Approval Request format 
interface ExportRequest {
  id: string;
  datasetName: string;
  securityLevel: SecurityLevel;
  requestedBy: string;
  role: string;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  decidedBy?: string;
  decidedAt?: string;
}

export default function BusinessIntelligence({ transactions, currentStaff, triggerLogWrite }: BIProps) {
  // Navigation internal state within the BI Platform
  const [biSubTab, setBiSubTab] = useState<'exec' | 'builder' | 'kpis' | 'drill' | 'actions' | 'predictions'>('exec');

  // Ad-Hoc user query prompt list and interactive state
  const [adHocLoading, setAdHocLoading] = useState(false);
  const [adHocSuccess, setAdHocSuccess] = useState(false);
  const [adHocPrompt, setAdHocPrompt] = useState('');
  const [aiInsightSummary, setAiInsightSummary] = useState('');

  // Report Builder Controls
  const [dataSource, setDataSource] = useState<string>('Transactions');
  const [selectedFields, setSelectedFields] = useState<string[]>(['id', 'amount', 'status', 'sellerHandle', 'createdAt']);
  const [filterDateRange, setFilterDateRange] = useState<string>('THIS_MONTH');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [filterMinAmount, setFilterMinAmount] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [vizType, setVizType] = useState<'table' | 'line' | 'bar' | 'pie' | 'heatmap' | 'kpi'>('bar');
  const [groupingField, setGroupingField] = useState<string>('location');

  // Generated results cache
  const [queryExecuted, setQueryExecuted] = useState(true);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [reportResultSummary, setReportResultSummary] = useState<string>('');

  // Saved & Scheduled Reports States
  const [savedReports, setSavedReports] = useState<SavedReport[]>([
    { id: 'RPT-101', name: 'Nairobi High-Value Escrow Ledger', source: 'Transactions', viz: 'table', filters: { location: 'Nairobi', minAmount: 10000 }, createdBy: 'Mary Mweru', isShared: true },
    { id: 'RPT-102', name: 'Courier Performance KPI Scorecard', source: 'Couriers', viz: 'bar', filters: { range: 'LAST_90_DAYS' }, createdBy: 'Silas Mugo', isShared: true },
    { id: 'RPT-103', name: 'Disputed Orders Verification Rates', source: 'Disputes', viz: 'pie', filters: { status: 'DISPUTED' }, createdBy: 'Sarah Mwangi', isShared: false }
  ]);

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    { id: 'SCH-501', name: 'Executive Revenue Daily Summary', source: 'Finance', frequency: 'Daily', delivery: 'Platform Inbox', savedAt: '2026-06-10T08:00:00Z', createdBy: 'Silas Mugo' },
    { id: 'SCH-502', name: 'Monthly Regional Compliance Audit', source: 'System Administration', frequency: 'Monthly', delivery: 'Email', savedAt: '2026-06-01T12:00:00Z', createdBy: 'Mary Mweru' }
  ]);

  const [newReportName, setNewReportName] = useState('');
  const [schedFrequency, setSchedFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');
  const [schedDelivery, setSchedDelivery] = useState<'Platform Inbox' | 'Email' | 'Executive Dashboard'>('Platform Inbox');

  // Security levels classification mappings based on dataset
  const getSecurityLevelOfSource = (src: string): SecurityLevel => {
    switch (src) {
      case 'Transactions': return 'CONFIDENTIAL';
      case 'Merchants': return 'CONFIDENTIAL';
      case 'Buyers': return 'INTERNAL';
      case 'Couriers': return 'INTERNAL';
      case 'Pickers': return 'INTERNAL';
      case 'Disputes': return 'CONFIDENTIAL';
      case 'Finance': return 'RESTRICTED';
      case 'CRM': return 'INTERNAL';
      case 'HR': return 'RESTRICTED';
      case 'System Administration': return 'EXECUTIVE';
      default: return 'PUBLIC';
    }
  };

  // Determine if the current active role possesses clearances to view the target source dataset
  // RBAC permissions rule engine
  const checkRbacForSource = (src: string, roleKey: string): { allowed: boolean; requiredLevel: SecurityLevel } => {
    const level = getSecurityLevelOfSource(src);
    
    // COO can access everything
    if (roleKey === 'CHIEF_OPERATING_OFFICER') {
      return { allowed: true, requiredLevel: level };
    }

    // BI Analyst can access all datasets except HR and System Admin
    if (roleKey === 'BI_ANALYST') {
      if (src === 'HR' || src === 'System Administration') {
        return { allowed: false, requiredLevel: level };
      }
      return { allowed: true, requiredLevel: level };
    }

    // CRM Agent/Manager can ONLY access CRM, disputes, buyers, couriers
    if (roleKey.startsWith('CRM_')) {
      const allowedSources = ['CRM', 'Disputes', 'Buyers', 'Couriers', 'Pickers'];
      return { allowed: allowedSources.includes(src), requiredLevel: level };
    }

    // Finance staff (Officer, Analyst, Recon, Supervisor, Mgr, Auditor, Head) can access Transactions, Merchants, Finance, Disputes
    if (roleKey.startsWith('FINANCE_') || roleKey === 'RECON_OFFICER' || roleKey === 'INTERNAL_AUDITOR' || roleKey === 'HEAD_OF_FINANCE' || roleKey.startsWith('FINANCE_OFFICER')) {
      const allowedSources = ['Transactions', 'Merchants', 'Finance', 'Disputes', 'Couriers', 'Pickers'];
      return { allowed: allowedSources.includes(src), requiredLevel: level };
    }

    // HR staff can access HR, CRM (performance logs)
    if (roleKey.startsWith('HR_')) {
      const allowedSources = ['HR', 'CRM'];
      return { allowed: allowedSources.includes(src), requiredLevel: level };
    }

    // Field staff can access Transactions, Merchants, Couriers, Pickers
    if (roleKey.startsWith('FIELD_')) {
      const allowedSources = ['Transactions', 'Merchants', 'Couriers', 'Pickers', 'CRM'];
      return { allowed: allowedSources.includes(src), requiredLevel: level };
    }

    // System admin can access System Administration, Transactions, Merchants, CRM, Finance
    if (roleKey === 'SYSTEM_ADMIN') {
      if (src === 'HR') return { allowed: false, requiredLevel: level }; // System admin cannot access employee HR folders due to direct policy
      return { allowed: true, requiredLevel: level };
    }

    return { allowed: false, requiredLevel: level };
  };

  // Self-contained simulation datasets 
  const regionStats = [
    { name: 'Nairobi', amount: 5410000, txCount: 1420, activeMerchants: 88, disputes: 15, satisfaction: 4.88, rate: '2.5%' },
    { name: 'Mombasa', amount: 2840000, txCount: 780, activeMerchants: 42, disputes: 8, satisfaction: 4.79, rate: '2.8%' },
    { name: 'Kisumu', amount: 1220000, txCount: 340, activeMerchants: 18, disputes: 5, satisfaction: 4.90, rate: '1.4%' },
    { name: 'Nakuru', amount: 980000, txCount: 290, activeMerchants: 22, disputes: 3, satisfaction: 4.81, rate: '1.0%' },
    { name: 'Eldoret', amount: 730000, txCount: 182, activeMerchants: 14, disputes: 2, satisfaction: 4.92, rate: '1.1%' }
  ];

  const courierLogisticsData = [
    { name: 'Rider John (Boda Dispatch)', county: 'Nairobi', successRate: 98.4, assignments: 342, ontimeRate: 98, avgTime: '42 mins' },
    { name: 'Fargo Courier Ltd', county: 'Nationwide', successRate: 97.1, assignments: 1420, ontimeRate: 96, avgTime: '18 hours' },
    { name: 'Driver Mary (Probox Express)', county: 'Nairobi/Nakuru', successRate: 94.2, assignments: 120, ontimeRate: 92, avgTime: '3.5 hours' },
    { name: 'Safaricom Posta G4S', county: 'Nationwide', successRate: 96.8, assignments: 480, ontimeRate: 95, avgTime: '24 hours' },
    { name: 'Mombasa Ocean Rider Pool', county: 'Mombasa', successRate: 98.1, assignments: 210, ontimeRate: 97, avgTime: '35 mins' }
  ];

  const employeePerformanceData = [
    { name: 'Mike Otieno', dept: 'CRM', role: 'CRM Agent', salary: 'Ksh 95,000', rating: 4.7, status: 'Active' },
    { name: 'Sarah Mwangi', dept: 'CRM', role: 'CRM Manager', salary: 'Ksh 180,000', rating: 4.9, status: 'Active' },
    { name: 'Kiprop Rono', dept: 'Field Operations', role: 'Senior Field Agent', salary: 'Ksh 120,000', rating: 4.5, status: 'Active' },
    { name: 'Nancy Awuor', dept: 'Finance', role: 'Finance Analyst', salary: 'Ksh 140,000', rating: 4.8, status: 'Active' },
    { name: 'Peter Karanja', dept: 'Finance', role: 'Finance Officer', salary: 'Ksh 105,000', rating: 4.2, status: 'On probation' }
  ];

  const fraudIncidentsData = [
    { merchant: 'Nairobi Tech Imports', handle: '@nairortec', status: 'BLACKLISTED', riskFactor: 94, blockedEscrow: 420000, trigger: 'High volume credit micro-velocity pattern alert' },
    { merchant: 'Boda Parts Express', handle: '@bodaexpress', status: 'SUSPENDED', riskFactor: 78, blockedEscrow: 85000, trigger: 'SIM card swap validation failure alert' },
    { merchant: 'Elegant Swag Kenya', handle: '@elegantswag', status: 'UNDER_MONITORING', riskFactor: 42, blockedEscrow: 0, trigger: 'Multiple distinct IP handshakes signature match' }
  ];

  // Active state for Drill-Down Explorer
  // Depth levels: 0 (KPI/Summary) -> 1 (Merchant list) -> 2 (Merchant Transactions) -> 3 (Order Details)
  const [drillLevel, setDrillLevel] = useState<number>(0);
  const [drillMerchant, setDrillMerchant] = useState<any | null>(null);
  const [drillTx, setDrillTx] = useState<Transaction | null>(null);

  // Export approvals center state
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([
    { id: 'EQ-8001', datasetName: 'All Merchants PII (Nairobi Hub)', securityLevel: 'RESTRICTED', requestedBy: 'Sarah Mwangi', role: 'CRM Manager', justification: 'To assist regional courier delivery partner in sorting custom warehouse geofences.', status: 'PENDING', requestedAt: '2026-06-13T09:12:00Z' },
    { id: 'EQ-8002', datasetName: 'HR Staff Payroll Salaries Ledger (Q2)', securityLevel: 'RESTRICTED', requestedBy: 'Jane Wairimu', role: 'HR Officer', justification: 'Filing returns with the Kenya Revenue Authority (KRA) for compliance board verification.', status: 'APPROVED', requestedAt: '2026-06-12T14:22:00Z', decidedBy: 'Silas Mugo', decidedAt: '2026-06-12T15:30:00Z' }
  ]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportJustification, setExportJustification] = useState('');
  const [currentExportFormat, setCurrentExportFormat] = useState<'Excel' | 'CSV' | 'PDF' | 'PPT'>('Excel');
  const [currentExportSource, setCurrentExportSource] = useState('Transactions');

  // Interactive self-service logs state
  const [biLogs, setBiLogs] = useState<BIAuditLog[]>([
    { id: 'BIL-901', user: 'Mary Mweru', role: 'BI Analyst', action: 'Query executed on "Transactions" dataset', filters: 'Location: Nairobi, Value > KSh 5,000', exportType: 'NONE', timestamp: '2026-06-13T10:11:42Z' },
    { id: 'BIL-902', user: 'Silas Mugo', role: 'Chief Operating Officer', action: 'Exported "Finance" dataset as PDF', filters: 'Month: Current, Range: All', exportType: 'PDF', timestamp: '2026-06-12T15:31:02Z' }
  ]);

  // Execute Search Builder query dynamically
  const handleRunQuery = () => {
    // Audit check
    const rbac = checkRbacForSource(dataSource, currentStaff.roleKey);
    if (!rbac.allowed) {
      triggerLogWrite(
        `⚠️ SECURITY EXCEPTION: Prevented unauthorized self-service query by ${currentStaff.name}`,
        `Attempted Source: ${dataSource}`,
        `Current Role: ${currentStaff.role}`
      );
      alert(`RBAC Unauthorized: Your active session lacks credentials to read the "${dataSource}" dataset. Sensitive indicators require the higher level: ${rbac.requiredLevel}.`);
      return;
    }

    setQueryExecuted(true);

    // Let's filter data based on controls
    let rawResults: any[] = [];
    let summaryText = '';

    if (dataSource === 'Transactions') {
      // Use existing transactions system state
      let list = [...transactions];
      if (filterStatus !== 'ALL') {
        list = list.filter(t => t.status === filterStatus);
      }
      if (filterMinAmount > 0) {
        list = list.filter(t => t.amount >= filterMinAmount);
      }
      // For locations filter
      if (filterLocation !== 'ALL') {
        // Mock and real matching
        list = list.filter(t => t.description.toLowerCase().includes(filterLocation.toLowerCase()) || t.id.charCodeAt(0) % 2 === 0);
      }
      
      rawResults = list.map(t => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        sellerHandle: t.sellerHandle,
        socialPlatform: t.socialPlatform,
        createdAt: t.createdAt.split('T')[0],
        location: t.id.charCodeAt(0) % 2 === 0 ? 'Nairobi' : 'Mombasa'
      }));

      summaryText = `Found ${rawResults.length} transaction records fitting filters. Total value secured: KSh ${rawResults.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}.`;
    } 
    else if (dataSource === 'Couriers') {
      rawResults = courierLogisticsData;
      summaryText = `Compiled logistics efficiency scores for 5 verified contract boda & vehicle dispatch channels.`;
    }
    else if (dataSource === 'HR') {
      rawResults = employeePerformanceData;
      summaryText = `Accessed active employee structures: 5 staff records matching departmental payroll.`;
    }
    else if (dataSource === 'Disputes') {
      rawResults = transactions.filter(t => t.status === 'DISPUTED').map(t => ({
        id: t.id,
        customer: t.buyerPhone,
        amount: t.amount,
        socialPlatform: t.socialPlatform,
        riskScore: t.riskScore,
        createdAt: t.createdAt.split('T')[0]
      }));
      if (rawResults.length === 0) {
        rawResults = [
          { id: 'TX-5049', customer: '0722100412', amount: 18400, socialPlatform: 'WhatsApp', riskScore: 82, createdAt: '2026-06-11' },
          { id: 'TX-5091', customer: '0711902844', amount: 8900, socialPlatform: 'Instagram', riskScore: 65, createdAt: '2026-06-12' }
        ];
      }
      summaryText = `Retrieved active investigations: ${rawResults.length} contested escrow transactions under safeguarding locks.`;
    }
    else if (dataSource === 'Merchants') {
      rawResults = [
        { handle: '@nairotech', business: 'Nairobi Electronics', rating: '★ 4.9', county: 'Nairobi', sales: 'KSt 1.2M', status: 'VERIFIED' },
        { handle: '@coastcloth', business: 'Coast Apparel Mombasa', rating: '★ 4.7', county: 'Mombasa', sales: 'Ksh 340k', status: 'VERIFIED' },
        { handle: '@kismubiz', business: 'Kisumu Smart Hub', rating: '★ 4.8', county: 'Kisumu', sales: 'Ksh 180k', status: 'UNVERIFIED_PENDING' },
        { handle: '@eldoparts', business: 'Eldoret Tractor Hardware', rating: '★ 4.6', county: 'Eldoret', sales: 'Ksh 540k', status: 'VERIFIED' }
      ];
      summaryText = `Analyzing merchant profiles database. 4 active commerce profiles compiled.`;
    }
    else {
      rawResults = regionStats;
      summaryText = `Executing system queries on multi-dimensional regional growth indices.`;
    }

    setGeneratedData(rawResults);
    setReportResultSummary(summaryText);

    // Write audit log
    const newLog: BIAuditLog = {
      id: `BIL-${Math.floor(Math.random() * 900) + 100}`,
      user: currentStaff.name,
      role: currentStaff.role,
      action: `Executed Report: "${dataSource}" Source Dataset`,
      filters: `Date:${filterDateRange}, Loc:${filterLocation}, MinKsh:${filterMinAmount}`,
      exportType: 'NONE',
      timestamp: new Date().toISOString()
    };
    setBiLogs(prev => [newLog, ...prev]);

    triggerLogWrite(
      `📊 BI Report Build`,
      `User: ${currentStaff.name}`,
      `Generated Report on ${dataSource} (${rawResults.length} rows, Viz: ${vizType.toUpperCase()})`
    );
  };

  // Run dynamic generation first load or when filters change
  useEffect(() => {
    handleRunQuery();
  }, [dataSource, vizType, filterLocation, filterStatus]);

  // Handle Saved Report Execute
  const handleLoadSavedReport = (rpt: SavedReport) => {
    setDataSource(rpt.source);
    setVizType(rpt.viz as any);
    if (rpt.filters.location) setFilterLocation(rpt.filters.location);
    if (rpt.filters.minAmount) setFilterMinAmount(rpt.filters.minAmount);
    setBiSubTab('builder');

    // Audit trace
    const newLog: BIAuditLog = {
      id: `BIL-${Math.floor(Math.random() * 900) + 100}`,
      user: currentStaff.name,
      role: currentStaff.role,
      action: `Loaded Saved Shared Report: "${rpt.name}"`,
      filters: JSON.stringify(rpt.filters),
      exportType: 'NONE',
      timestamp: new Date().toISOString()
    };
    setBiLogs(prev => [newLog, ...prev]);

    triggerLogWrite(
      `📂 Loaded BI Saved Report`,
      `Report Name: ${rpt.name}`,
      `Opened successfully in workspace`
    );
  };

  // Save Current Report Configuration
  const handleSaveReportConfig = () => {
    if (!newReportName) {
      alert('Specify a descriptive name to save this configuration.');
      return;
    }
    const newR: SavedReport = {
      id: `RPT-${Math.floor(Math.random() * 900) + 100}`,
      name: newReportName,
      source: dataSource,
      viz: vizType,
      filters: { location: filterLocation, minAmount: filterMinAmount, status: filterStatus },
      createdBy: currentStaff.name,
      isShared: true
    };
    setSavedReports(prev => [newR, ...prev]);
    setNewReportName('');
    alert(`Report "${newReportName}" has been encrypted and committed to system metadata rules.`);
  };

  // Register Scheduled Report Dispatch Setup
  const handleRegisterSchedule = () => {
    const newS: ScheduledReport = {
      id: `SCH-${Math.floor(Math.random() * 900) + 100}`,
      name: `Automated ${dataSource} ${schedFrequency} Audit`,
      source: dataSource,
      frequency: schedFrequency,
      delivery: schedDelivery,
      savedAt: new Date().toISOString(),
      createdBy: currentStaff.name
    };
    setScheduledReports(prev => [newS, ...prev]);
    alert(`Automation Active on Ledger: System will transmit automated ${schedFrequency} reports to ${schedDelivery} securely.`);
  };

  // Ad-hoc Natural Language query engine parsing
  const handleAskAdHocQuery = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adHocPrompt) return;

    setAdHocLoading(true);
    setAdHocSuccess(false);

    // Simulate AI extraction delay
    setTimeout(() => {
      const q = adHocPrompt.toLowerCase();
      let detectedSource = 'Transactions';
      let detectedViz: 'table' | 'line' | 'bar' | 'pie' | 'heatmap' | 'kpi' = 'bar';
      let loc = 'ALL';
      let amt = 0;
      let status = 'ALL';
      let textResponse = '';

      if (q.includes('merchant') || q.includes('top 20')) {
        detectedSource = 'Merchants';
        detectedViz = 'table';
        textResponse = `Analysed Natural Language Query. Activating Merchant database query parameters. Discovered top sales performers in Nairobi and Eldoret.`;
      } 
      else if (q.includes('courier') || q.includes('performance') || q.includes('logistics')) {
        detectedSource = 'Couriers';
        detectedViz = 'bar';
        textResponse = `Parsing NLP Prompt. Directing to Logistics/Courier database performance statistics. Highlighting Fargo Courier contract volume vs local boda-riders trips count.`;
      }
      else if (q.includes('dispute') || q.includes('disputes')) {
        detectedSource = 'Disputes';
        detectedViz = 'pie';
        textResponse = `Searching active investigations folder. Compiled contested escrow checkout locks with specific risk verification scores.`;
      }
      else if (q.includes('nairobi') || q.includes('mombasa')) {
        detectedSource = 'Transactions';
        detectedViz = 'line';
        loc = q.includes('nairobi') ? 'Nairobi' : 'Mombasa';
        textResponse = `Regional filter isolated: "${loc}". Plotting monthly checkout transaction volumes sequentially.`;
      }
      else if (q.includes('above') || q.includes('revenue') || q.includes('50,000')) {
        detectedSource = 'Transactions';
        detectedViz = 'kpi';
        amt = 50000;
        textResponse = `Executing Financial revenue filter scan. Criteria locked: Transactions with value >= KSh 50,000.`;
      }
      else {
        detectedSource = 'Transactions';
        detectedViz = 'bar';
        textResponse = `Understood: "${adHocPrompt}". Auto-generated report mapping current transaction ledger to regional indicators.`;
      }

      setDataSource(detectedSource);
      setVizType(detectedViz);
      setFilterLocation(loc);
      setFilterMinAmount(amt);
      setBiSubTab('builder');
      setAiInsightSummary(textResponse);
      setAdHocLoading(false);
      setAdHocSuccess(true);

      // Audit log
      const newLog: BIAuditLog = {
        id: `BIL-${Math.floor(Math.random() * 900) + 100}`,
        user: currentStaff.name,
        role: currentStaff.role,
        action: `AI Ad-Hoc Natural Query: "${adHocPrompt}"`,
        filters: `Parsed Source: ${detectedSource}, Location: ${loc}`,
        exportType: 'NONE',
        timestamp: new Date().toISOString()
      };
      setBiLogs(prev => [newLog, ...prev]);

      triggerLogWrite(
        `🤖 AI Ad-Hoc Query`,
        `Prompt: "${adHocPrompt}"`,
        `Auto-loaded builder config: DataSet ${detectedSource} | Viz ${detectedViz}`
      );

    }, 1200);
  };

  // Trigger export request workflow
  const handleTriggerExport = (format: 'Excel' | 'CSV' | 'PDF' | 'PPT') => {
    const level = getSecurityLevelOfSource(dataSource);
    setCurrentExportFormat(format);
    setCurrentExportSource(dataSource);

    // If source is HR, Finance, or Transactions, it's Confidential/Restricted/Executive status level
    if (level === 'RESTRICTED' || level === 'EXECUTIVE' || level === 'CONFIDENTIAL') {
      setShowExportModal(true);
    } else {
      // Free download simulation
      triggerLogWrite(
        `💾 BI Data Exported`,
        `Dataset: ${dataSource}`,
        `Downloaded as ${format} (Audited under level: ${level})`
      );

      const newLog: BIAuditLog = {
        id: `BIL-${Math.floor(Math.random() * 900) + 100}`,
        user: currentStaff.name,
        role: currentStaff.role,
        action: `Downloaded ${dataSource} Dataset`,
        filters: `Format: ${format}, Status: Instant Access`,
        exportType: format,
        timestamp: new Date().toISOString()
      };
      setBiLogs(prev => [newLog, ...prev]);
      alert(`Export Successful: Downloaded authenticated "${dataSource}" as ${format}. Audit control event committed successfully.`);
    }
  };

  // Submit formal authorization request for restricted datasets
  const handleSubmitExportRequest = () => {
    if (!exportJustification) {
      alert('Provide a corporate business justification to request credentials clearance.');
      return;
    }

    // CRM Agent cannot even request sensitive lists
    if (currentStaff.roleKey === 'CRM_AGENT' || currentStaff.roleKey === 'FIELD_AGENT') {
      alert('Access Blocked: Your clearance tier lacks capability to request exports of RESTRICTED/EXECUTIVE data scopes.');
      setShowExportModal(false);
      return;
    }

    const newReq: ExportRequest = {
      id: `EQ-${Math.floor(Math.random() * 900) + 8000}`,
      datasetName: `${currentExportSource} Export (${currentExportFormat})`,
      securityLevel: getSecurityLevelOfSource(currentExportSource),
      requestedBy: currentStaff.name,
      role: currentStaff.role,
      justification: exportJustification,
      status: currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER' ? 'APPROVED' : 'PENDING',
      requestedAt: new Date().toISOString(),
      decidedBy: currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER' ? currentStaff.name : undefined,
      decidedAt: currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER' ? new Date().toISOString() : undefined
    };

    setExportRequests(prev => [newReq, ...prev]);
    setShowExportModal(false);
    setExportJustification('');

    // Audit trail
    triggerLogWrite(
      `⚖️ Export License Request Filed`,
      `User: ${currentStaff.name}`,
      `Request ID: ${newReq.id} for dataset ${newReq.datasetName}`
    );

    if (currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER') {
      alert('Instant Approval Issued: As Chief Operating Officer, system auto-approved and downloaded your requested dataset.');
    } else {
      alert(`Request Queued: Authorization file #${newReq.id} submitted for review by BI Supervisors / COO.`);
    }
  };

  // Approve pending request 
  const handleApproveRequest = (reqId: string) => {
    // Only COO and BI Supervisor blocks allowed
    if (currentStaff.roleKey !== 'CHIEF_OPERATING_OFFICER' && currentStaff.roleKey !== 'BI_ANALYST' && currentStaff.roleKey !== 'CRM_MANAGER' && currentStaff.roleKey !== 'HR_MANAGER' && currentStaff.roleKey !== 'FINANCE_MANAGER') {
      alert('Access Denied: Only executive management can approve sensitive database releases.');
      return;
    }

    setExportRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: 'APPROVED',
          decidedBy: currentStaff.name,
          decidedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    // Audit logs
    triggerLogWrite(
      `💚 Export License Approved`,
      `Approver: ${currentStaff.name}`,
      `Released Request: ${reqId}`
    );
  };

  // Render Customized SVG Visualization charts
  const renderSVGChart = () => {
    if (vizType === 'bar') {
      // Regional transactions or Courier trips
      const chartItems = dataSource === 'Couriers' ? courierLogisticsData : regionStats;
      const maxVal = Math.max(...chartItems.map((item: any) => item.amount || item.assignments || 1));
      
      return (
        <div className="space-y-4">
          <div className="h-64 flex items-end gap-6 pt-6 border-b pb-1 px-4 relative">
            {chartItems.map((item: any, i) => {
              const val = item.amount || item.assignments;
              const heightPct = Math.max(10, Math.floor((val / maxVal) * 90));
              const displayVal = item.amount ? `Ksh ${(item.amount/1000).toFixed(0)}k` : `${item.assignments} trips`;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip bar indicator */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[9.5px] font-mono px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                    {displayVal}
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-red-650 via-red-500 to-amber-400 rounded-t-lg transition-all duration-700 hover:opacity-90 cursor-pointer shadow-sm shadow-red-500/10"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-700 truncate w-full text-center">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-400 px-4">
            <span>Volume Indicator Gauge</span>
            <span>Scale: Zero to {maxVal.toLocaleString()}</span>
          </div>
        </div>
      );
    }

    if (vizType === 'line') {
      // SECURE ESCROW SECURED GROWTH OVER MONTHS
      return (
        <div className="space-y-4">
          <div className="h-60 border-b border-l pb-1 relative px-6 flex items-center justify-center">
            {/* Elegant Vector Path illustration with dynamic glowing nodes */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area Under Curve */}
              <path 
                d="M 10 180 Q 100 130 180 80 T 380 30 L 380 200 L 10 200 Z" 
                fill="url(#lineGrad)" 
              />
              {/* Glowing Line */}
              <path 
                d="M 10 180 Q 100 130 180 80 T 380 30" 
                fill="none" 
                stroke="#dc2626" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />

              {/* Data points nodes */}
              <circle cx="10" cy="180" r="5" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
              <circle cx="110" cy="120" r="5" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
              <circle cx="210" cy="74" r="5" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
              <circle cx="380" cy="30" r="6.5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 px-4 font-bold font-mono">
            <span>Jan (Ksh 180k)</span>
            <span>Feb (Ksh 320k)</span>
            <span>Mar (Ksh 540k)</span>
            <span>Apr (Current Escrow Live)</span>
          </div>
        </div>
      );
    }

    if (vizType === 'pie') {
      // 5 segments region shares
      return (
        <div className="flex flex-col sm:flex-row items-center justify-around p-4 gap-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Concentric rings to bypass raw complex trig */}
            <div className="absolute inset-0 rounded-full border-[10px] border-amber-400 rotate-12"></div>
            <div className="absolute inset-2 rounded-full border-[12px] border-red-500 rotate-45"></div>
            <div className="absolute inset-4 rounded-full border-[14px] border-blue-500 rotate-[120deg]"></div>
            <div className="absolute inset-6 rounded-full border-[16px] border-emerald-500 rotate-[210deg]"></div>
            
            <div className="bg-white w-20 h-20 rounded-full shadow flex flex-col items-center justify-center z-10">
              <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">SECURED</span>
              <strong className="text-xs font-black text-slate-850">100%</strong>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Regional Escrow Shares</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10.5px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-550 rounded-full"></span>
                <span>Nairobi (54%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
                <span>Mombasa (28%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                <span>Kisumu (12%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <span>Others (6%)</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (vizType === 'heatmap') {
      // Grid of regions vs time of day activity values
      return (
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-left block font-mono">
            Transaction Density Matrix (Region vs Hours peak logs)
          </span>

          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            {/* Header row */}
            <div className="text-[8px] text-slate-500 font-mono">Region</div>
            <div className="text-[8px] text-slate-500 font-mono">00:00 - 04:00</div>
            <div className="text-[8px] text-slate-500 font-mono">04:00 - 08:00</div>
            <div className="text-[8px] text-slate-500 font-mono">08:00 - 12:00</div>
            <div className="text-[8px] text-slate-500 font-mono">12:00 - 16:00</div>
            <div className="text-[8px] text-slate-500 font-mono">16:00 - 24:00</div>

            {regionStats.map((item: any, row) => (
              <>
                <div className="text-[9px] font-bold text-slate-400 truncate max-w-16 font-mono text-left">{item.name}</div>
                <div className="h-6 rounded bg-red-950/20 border border-slate-900 group relative">
                  <span className="absolute scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[8px] font-mono p-1 rounded z-10 whitespace-nowrap">Low velocity</span>
                </div>
                <div className="h-6 rounded bg-red-800/40 border border-slate-900 group relative">
                  <span className="absolute scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[8px] font-mono p-1 rounded z-10 whitespace-nowrap">Standard index</span>
                </div>
                <div className="h-6 rounded bg-red-600/70 border border-slate-900 group relative animate-pulse">
                  <span className="absolute scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[8px] font-mono p-1 rounded z-10 whitespace-nowrap">Peak workload (142 txs)</span>
                </div>
                <div className="h-6 rounded bg-red-500 border border-slate-900 group relative">
                  <span className="absolute scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[8px] font-mono p-1 rounded z-10 whitespace-nowrap">Maximum throughput</span>
                </div>
                <div className="h-6 rounded bg-red-900/60 border border-slate-900 group relative">
                  <span className="absolute scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[8px] font-mono p-1 rounded z-10 whitespace-nowrap">Standard dispatching</span>
                </div>
              </>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[9.5px]">
            <span className="text-slate-500">Legend density:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-950/20"></span>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-805/40"></span>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
              <span>Extreme Peak</span>
            </div>
          </div>
        </div>
      );
    }

    // Default KPI layout
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 border p-4 rounded-xl text-left space-y-1">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">Average Deal Value</span>
          <strong className="text-lg font-black text-slate-800 font-mono">Ksh 18,420</strong>
          <span className="text-[8.5px] text-emerald-600 block font-mono">↑ +14.2% since last month</span>
        </div>
        <div className="bg-slate-50 border p-4 rounded-xl text-left space-y-1">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">Escrow Velocity SLA</span>
          <strong className="text-lg font-black text-slate-800 font-mono">98.5% Checked</strong>
          <span className="text-[8.5px] text-emerald-600 block font-mono">↑ 100% Daraja callback sync</span>
        </div>
        <div className="bg-slate-50 border p-4 rounded-xl text-left space-y-1">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">Integrity Ledger Confirmed</span>
          <strong className="text-lg font-black text-emerald-650 font-mono">100% Audited</strong>
          <span className="text-[8.5px] text-slate-400 block font-mono">Total anomalies: Zero cases</span>
        </div>
      </div>
    );
  };

  // Render drill down dynamic elements
  const selectDrillMerchant = (mName: string) => {
    // Audit check
    const rbac = checkRbacForSource('Merchants', currentStaff.roleKey);
    if (!rbac.allowed) {
      alert(`RBAC Unauthorized: Your active session profile lacks permission to drill down into restricted Merchant accounts (Level ${rbac.requiredLevel}).`);
      return;
    }

    const tFiltered = transactions.filter(t => t.id.charCodeAt(0) % 2 === 0);
    setDrillMerchant({
      name: mName,
      county: mName === 'Nairobi Electronics' ? 'Nairobi' : 'Mombasa',
      rating: '★ 4.9',
      verified: true,
      mpesaAccount: 'Ksh 240,000 Payouts Ledger',
      transactionsCount: tFiltered.length,
      revenueGenerated: tFiltered.reduce((acc, x) => acc + x.amount, 0),
      rawTxs: tFiltered
    });
    setDrillLevel(1);

    triggerLogWrite(
      `🔍 Drilled down Merchant analytics`,
      `Home`,
      `Merchant Name: ${mName}`
    );
  };

  const selectDrillTx = (tx: Transaction) => {
    // Check permission level Confidential
    const rbac = checkRbacForSource('Transactions', currentStaff.roleKey);
    if (!rbac.allowed) {
      alert(`RBAC Unauthorized: Access is masked for direct Escrow transactions Ledger (Confidential Level required).`);
      return;
    }
    setDrillTx(tx);
    setDrillLevel(2);

    triggerLogWrite(
      `🔍 Drilled down Transaction details`,
      drillMerchant?.name || 'Unknown',
      `Transaction ID: ${tx.id}`
    );
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* SENSITIVE EXPORT AUTHORIZATION REQUEST WORKFLOW MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="space-y-1">
                <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded border border-amber-200">
                  Sensitive Export Governance
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase font-sans tracking-tight">
                  Authorization License Required
                </h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-650 font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-850 space-y-1 pointer-events-none pb-2 font-sans">
              <p className="font-bold">⚠️ Regulatory Risk Profile: RESTRICTED</p>
              <p>Under Kenya Data Protection Act, exporting Merchant PII, Financial ledgers, or employee salaries requires a formal approval justification trace logged in system metadata.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wide block font-mono">
                Dataset requested:
              </label>
              <input 
                type="text" 
                disabled 
                value={`${currentExportSource} (.${currentExportFormat.toLowerCase()})`}
                className="w-full text-xs font-mono bg-slate-50 border p-2 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wide block font-mono">
                Business Justification Purpose:
              </label>
              <textarea
                placeholder="Enterprise justification (e.g. Monthly tax reconciliation, regional delivery geofencing audits)"
                rows={3}
                value={exportJustification}
                onChange={(e) => setExportJustification(e.target.value)}
                className="w-full text-xs border p-3 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border rounded-xl text-xs hover:bg-slate-50 cursor-pointer font-extrabold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExportRequest}
                className="px-4 py-2 bg-slate-900 border border-slate-905 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1"
              >
                ✓ Submit Authorization Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENT TITLE BAR & SECURITY PILL */}
      <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-red-100 text-red-600 font-black rounded-lg text-[9px] uppercase font-mono tracking-wider border border-red-200">
              Analytics Center
            </span>
            <h2 className="text-md font-black tracking-tight text-slate-850 uppercase font-sans">
              Business Intelligence Operations Platform
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
            Enforcing strict data access controls across <strong className="text-slate-800">Finance, Logistics, CRM, and HR</strong> departments under RBAC policies.
          </p>
        </div>

        {/* ACTIVE STAFF IDENTITY & RBAC CARD */}
        <div className="bg-slate-50 border p-3.5 rounded-xl text-left min-w-56 space-y-1.5">
          <div className="flex items-center justify-between text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono">
            <span>Identity Session</span>
            <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded font-black font-mono">
              Cleared: {getSecurityLevelOfSource(dataSource === 'HR' && currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER' ? 'System Administration' : dataSource)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <div>
              <p className="font-extrabold text-slate-800 text-xs leading-none">{currentStaff.name}</p>
              <p className="text-[10px] text-slate-450 font-mono font-bold mt-1 uppercase tracking-wide">{currentStaff.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="bg-white border p-1 rounded-2xl flex flex-wrap gap-1 text-xs">
        {[
          { id: 'exec', label: 'COO Executive Board', icon: '📊' },
          { id: 'builder', label: 'Self-Service Report Builder', icon: '⚙️' },
          { id: 'kpis', label: 'KPI Monitoring Center', icon: '🎯' },
          { id: 'drill', label: 'Interactive Drill-Down', icon: '🔍' },
          { id: 'actions', label: 'Governance & Approval Workflows', icon: '⚖️' },
          { id: 'predictions', label: 'AI Trend Predictor', icon: '🔮' }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setBiSubTab(tb.id as any)}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
              biSubTab === tb.id 
                ? 'bg-red-500 text-white shadow-md shadow-red-500/15' 
                : 'text-slate-505 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span>{tb.icon}</span>
            <span>{tb.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN VIEW WORKSPACE */}
      <div className="space-y-6">
        
        {/* VIEW 1: COO EXECUTIVE BOARD */}
        {biSubTab === 'exec' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* KPI GRID CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {[
                { label: 'Revenue Generated', val: 'Ksh 2,420,000', change: '↑ +18% MoM', desc: 'Secure fee collections', icon: '💰', restricted: false },
                { label: 'Escrow Volume Locked', val: `Ksh ${(transactions.reduce((acc, t) => acc + t.amount, 0) + 12420000).toLocaleString()}`, change: '↑ +12.4% MoM', desc: 'Safeguarded in NCBA Trust', icon: '🔒', restricted: false },
                { label: 'Settlement Volume', val: 'Ksh 10,120,400', change: '↑ +22.1%', desc: 'M-Pesa B2C disbursements', icon: '🏦', restricted: false },
                { label: 'Disputes Rate', val: '1.24% of Txs', change: '↓ -0.85% Decr', desc: 'SLA standard under threshold', icon: '⚖️', restricted: false },
                { label: 'Active Merchants', val: '184 Providers', change: '↑ +15 joined', desc: 'Nairobi & Mombasa hubs', icon: '🏬', restricted: false },
                { label: 'Active Custody Buyers', val: '2,104 Users', change: '↑ +420 active', desc: 'Social commerce customers', icon: '🛒', restricted: false },
                { label: 'Active Couriers Pool', val: '38 Carriers', change: '96.5% SLA fulfilled', desc: 'G4S, Fargo, Local Boda', icon: '🏍️', restricted: false },
                { label: 'AI Fraud Block Rate', val: '99.85% Blocked', change: '17 incidents neutralized', desc: 'SIM swap & velocity shields', icon: '🛡️', restricted: false }
              ].map((card, i) => {
                // For demonstrating CRM agent cannot access payroll/settlements, we lock/mask settlements and revenue cards from CRM Agents or Field Agents
                const isMasked = (card.label.includes('Revenue') || card.label.includes('Settlement') || card.label.includes('Escrow')) && 
                                  (currentStaff.roleKey.startsWith('CRM_') || currentStaff.roleKey.startsWith('FIELD_'));

                return (
                  <div key={i} className="bg-white border rounded-2xl p-4.5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    {isMasked ? (
                      <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-xs flex flex-col justify-center items-center text-center p-3 z-10 pointer-events-none">
                        <span className="text-sm">🔒</span>
                        <strong className="text-[10.5px] uppercase font-mono tracking-wider font-extrabold text-slate-800">RBAC Masked Value</strong>
                        <p className="text-[8.5px] text-slate-400 mt-0.5 font-sans">Clearance LEVEL 3 required</p>
                      </div>
                    ) : null}

                    <div className="flex justify-between items-start leading-none mb-3">
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] font-extrabold uppercase font-mono text-slate-400 tracking-wide">{card.label}</span>
                        <p className="text-[8.5px] text-slate-450 font-sans">{card.desc}</p>
                      </div>
                      <span className="text-md">{card.icon}</span>
                    </div>

                    <div className="space-y-1 mt-auto">
                      <strong className="text-md font-black text-slate-800 font-mono block leading-none">{card.val}</strong>
                      <span className="text-[9px] font-bold font-mono text-emerald-600 tracking-tight block">{card.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AD-HOC NATURAL LANGUAGE QUERY LAYER */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="p-1 px-1.5 bg-red-500/10 text-red-400 font-bold rounded text-[8px] uppercase font-mono tracking-widest border border-red-500/20">
                    AD-HOC INSIGHTS AGENT
                  </span>
                  <h4 className="text-xs font-black uppercase text-slate-200 tracking-tight font-sans">
                    Conversational BI Parser Engine
                  </h4>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  Ask administrative natural language query. The BI engine maps queries instantly into dynamic filters and returns analytical records.
                </p>
              </div>

              <form onSubmit={handleAskAdHocQuery} className="flex gap-2">
                <input 
                  type="text"
                  placeholder='e.g. "Show top 20 merchants this month", "Show courier performance for last 90 days", etc.'
                  value={adHocPrompt}
                  onChange={(e) => setAdHocPrompt(e.target.value)}
                  className="flex-1 bg-slate-950 font-sans text-xs border border-slate-850 focus:border-red-500/60 rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={adHocLoading}
                  className="bg-red-500 hover:bg-red-650 text-slate-950 px-5 py-3 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {adHocLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Query</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Prompt Recommendation tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9.5px] text-slate-500 uppercase tracking-wider font-mono">Suggested ad-hoc questions:</span>
                {[
                  { q: 'Show courier performance last 90 days', key: 'courier' },
                  { q: 'Show disputes involving verified merchants', key: 'disputes' },
                  { q: 'Compare Nairobi and Mombasa transaction volumes', key: 'nairobi' },
                  { q: 'Show all merchants in Nairobi with revenue above Ksh 50,000', key: 'above' }
                ].map((tag, t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setAdHocPrompt(tag.q);
                    }}
                    className="bg-slate-950/80 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850 px-2 py-1 rounded text-[9.5px] font-mono transition cursor-pointer"
                  >
                    "{tag.q}"
                  </button>
                ))}
              </div>

              {adHocSuccess && aiInsightSummary && (
                <div className="p-4 bg-slate-950 rounded-xl border border-red-500/20 text-xs text-left animate-slideUp font-sans text-slate-350 space-y-2">
                  <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-[10.5px]">
                    <span>✓</span> AI Query Compilation Complete
                  </div>
                  <p className="italic leading-relaxed">"{aiInsightSummary}"</p>
                  <p className="text-[9.5px] text-slate-500 font-mono">Dynamic filters applied successfully. Open Report Builder sub-tab below to visualize or export the results.</p>
                </div>
              )}
            </div>

            {/* SAFE BUY SHIPPING PROTECTION INSURED HUB */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-left font-sans">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-tight flex items-center gap-1.5">
                    🛡️ Transit Protection & Underwriting Hub (Jubilee / Britam)
                  </h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    Financial performance, risk analysis, and underwriting uptake rates parsed across active logistics contracts.
                  </p>
                </div>
                <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                  Model 1: Direct Carrier Indemnity
                </span>
              </div>

              {(() => {
                const totalTxs = transactions.length;
                const insuredTxs = transactions.filter(t => t.insuranceOption && t.insuranceOption !== 'NONE').length;
                const uptakeRate = totalTxs > 0 ? ((insuredTxs / totalTxs) * 100).toFixed(1) : "64.2";
                
                // Base static amounts + dynamic values from active sandbox interactions
                const dynamicPremiums = transactions.reduce((acc, t) => acc + (t.insurancePremium || 0), 0);
                const premiumTotal = 46280 + dynamicPremiums;
                const dynamicCommission = Math.round(dynamicPremiums * 0.15);
                const commissionTotal = 6942 + dynamicCommission;

                // Outstanding transiting liabilities
                const dynamicLiability = transactions.filter(t => t.insuranceOption && t.insuranceOption !== 'NONE' && ['ESCROW_HELD', 'PICKUP_REQUESTED', 'COURIER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status || '')).reduce((acc, t) => acc + (t.amount || 0), 0);
                const liabilityTotal = 1420000 + dynamicLiability;

                // Claims frequency and payouts
                const dynamicClaimsCount = transactions.flatMap(t => t.insuranceClaims || []).length;
                const claimsCountTotal = 14 + dynamicClaimsCount;
                
                const dynamicPayouts = transactions.flatMap(t => t.insuranceClaims || []).filter(c => c.status === 'PAID').reduce((acc, c) => acc + (c.payoutAmount || 0), 0);
                const payoutsTotal = 3900 + dynamicPayouts;

                const lossRatio = premiumTotal > 0 ? ((payoutsTotal / premiumTotal) * 100).toFixed(1) : "8.4";

                return (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-sans">
                      <div className="bg-slate-50 border rounded-xl p-3 space-y-1">
                        <span className="text-[8px] font-bold uppercase text-slate-400 block tracking-wider">Uptake Rate</span>
                        <div className="flex justify-between items-baseline gap-1 leading-none">
                          <strong className="text-sm font-black text-slate-800">{uptakeRate}%</strong>
                          <span className="text-[7px] text-emerald-600 font-bold">🎯 Target &gt; 60%</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 border rounded-xl p-3 space-y-1">
                        <span className="text-[8px] font-bold uppercase text-slate-400 block tracking-wider">Gross Premiums</span>
                        <div className="flex justify-between items-baseline gap-1 leading-none">
                          <strong className="text-sm font-black text-slate-800 font-mono">Ksh {premiumTotal.toLocaleString()}</strong>
                          <span className="text-[7.5px] text-slate-450">Collected</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 border rounded-xl p-3 space-y-1">
                        <span className="text-[8px] font-bold uppercase text-slate-400 block tracking-wider">Commission (15%)</span>
                        <div className="flex justify-between items-baseline gap-1 leading-none">
                          <strong className="text-sm font-black text-emerald-700 font-mono">Ksh {commissionTotal.toLocaleString()}</strong>
                          <span className="text-[7px] text-emerald-600 font-bold">Earned</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 border rounded-xl p-3 space-y-1">
                        <span className="text-[8px] font-bold uppercase text-slate-400 block tracking-wider">Active Cover Liability</span>
                        <div className="flex justify-between items-baseline gap-1 leading-none">
                          <strong className="text-sm font-black text-indigo-700 font-mono">Ksh {liabilityTotal.toLocaleString()}</strong>
                          <span className="text-[7px] text-indigo-650">Active</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 border rounded-xl p-3 space-y-1">
                        <span className="text-[8px] font-bold uppercase text-slate-400 block tracking-wider">Claims Loss Ratio</span>
                        <div className="flex justify-between items-baseline gap-1 leading-none">
                          <strong className="text-sm font-black text-red-500">{lossRatio}%</strong>
                          <span className="text-[7px] text-red-400 font-bold">Limit 15%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div className="p-3 bg-emerald-950 text-emerald-100 rounded-xl space-y-2 text-[10px] leading-relaxed border border-emerald-900 border-opacity-40">
                        <span className="font-extrabold text-[9px] uppercase tracking-wider block text-emerald-300">🏪 Underwriter Partner Ecosystem</span>
                        <p>
                          Buy Safely acts as distributor and premiums collector under Jubilee Insurance Block policy No. JUB-SB-2026-X. Payouts are triggered electronically via NCBA-MPesa APIs directly upon CRM approval of a Loss or Damage claim ticket.
                        </p>
                        <div className="flex justify-between text-[8.5px] border-t border-emerald-900 pt-1.5 text-emerald-400">
                          <span>Facilitation Commission: 15% retains</span>
                          <span>Audit Frequency: Continuous</span>
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-950 text-indigo-100 rounded-xl space-y-2 text-[10px] leading-relaxed border border-indigo-900 border-opacity-40">
                        <span className="font-extrabold text-[9px] uppercase tracking-wider block text-indigo-300">⚖️ Claims Frequency & SLA Tracker</span>
                        <div className="grid grid-cols-3 gap-1 text-center font-mono">
                          <div className="bg-indigo-900 p-1.5 rounded border border-indigo-855">
                            <span className="text-[7px] block text-indigo-405 uppercase">Claims Filed</span>
                            <strong className="text-xs font-black">{claimsCountTotal}</strong>
                          </div>
                          <div className="bg-indigo-900 p-1.5 rounded border border-indigo-855">
                            <span className="text-[7px] block text-indigo-405 uppercase">Total Paid</span>
                            <strong className="text-xs font-black">Ksh {payoutsTotal.toLocaleString()}</strong>
                          </div>
                          <div className="bg-indigo-900 p-1.5 rounded border border-indigo-855">
                            <span className="text-[7px] block text-indigo-405 uppercase">Avg SLA Turnaround</span>
                            <strong className="text-xs font-black font-sans text-amber-300">2.4 hrs</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* TWO GRAPH GRID COOP PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-3.5 relative">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                    Escrow Trust Ledger Expansion (Monthly Value KSh Index)
                  </span>
                  <span className="bg-indigo-50 border border-indigo-250 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                    Secure
                  </span>
                </div>
                {/* Visual Chart - Transaction Line Chart */}
                <div className="pt-2">
                  <div className="h-44 border-b border-l pb-1 relative px-6 flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible animate-fadeIn" viewBox="0 0 400 200">
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                      <path d="M 10 180 Q 100 130 180 80 T 380 30 L 380 200 L 10 200 Z" fill="rgba(239, 68, 68, 0.08)" />
                      <path d="M 10 180 Q 100 130 180 80 T 380 30" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="10" cy="180" r="4.5" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                      <circle cx="110" cy="120" r="4.5" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                      <circle cx="210" cy="74" r="4.5" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                      <circle cx="380" cy="30" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 px-4 font-bold font-mono mt-2">
                    <span>Jan (Ksh 180k)</span>
                    <span>Feb (Ksh 320k)</span>
                    <span>Mar (Ksh 540k)</span>
                    <span>Apr (Secured Escrow Live)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-3.5">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                    Contract Courier Trust & Dispatch Scorecard
                  </span>
                  <span className="bg-emerald-50 border border-emerald-250 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                    Logistics
                  </span>
                </div>
                {/* Visual Chart - Simple Table */}
                <div className="space-y-2 mt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10.5px] border-collapse text-left">
                      <thead>
                        <tr className="border-b text-slate-400 uppercase font-mono tracking-wider font-extrabold">
                          <th className="pb-2">Courier Partner</th>
                          <th className="pb-2 text-center">Deliveries</th>
                          <th className="pb-2 text-center">On-Time</th>
                          <th className="pb-2 text-right">Trust Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Rider John (Boda Dispatch)', trips: 342, ontime: '98%', rank: '★ 4.9' },
                          { name: 'Fargo Courier Ltd', trips: 1420, ontime: '97%', rank: '★ 4.8' },
                          { name: 'Driver Mary (Probox Express)', trips: 120, ontime: '94%', rank: '★ 4.7' },
                          { name: 'Picker Alex (Trust Auditor)', trips: 88, ontime: '100%', rank: '★ 5.0' },
                        ].map((cr, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-slate-50/50">
                            <td className="py-2.5 font-bold text-slate-800 font-sans">{cr.name}</td>
                            <td className="py-2.5 text-center font-mono">{cr.trips}</td>
                            <td className="py-2.5 text-center font-mono text-indigo-650">{cr.ontime}</td>
                            <td className="py-2.5 text-right font-mono text-amber-550">{cr.rank}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: SELF-SERVICE REPORT BUILDER */}
        {biSubTab === 'builder' && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* CONTROL PANEL */}
            <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
              <span className="text-[10px] font-extrabold uppercase font-mono text-slate-500 tracking-wider block">
                ⚙️ Self-Service Query Configuration Board
              </span>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                
                {/* 1. DATA SOURCE select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wide">
                    1. Target Dataset Source
                  </label>
                  <select
                    value={dataSource}
                    onChange={(e) => {
                      setDataSource(e.target.value);
                      if (e.target.value === 'HR') {
                        setSelectedFields(['name', 'dept', 'role', 'salary', 'rating']);
                      } else if (e.target.value === 'Couriers') {
                        setSelectedFields(['name', 'county', 'successRate', 'assignments', 'ontimeRate']);
                      } else {
                        setSelectedFields(['id', 'amount', 'status', 'sellerHandle', 'createdAt']);
                      }
                    }}
                    className="w-full border rounded-xl p-2.5 font-sans bg-slate-50 focus:ring-1 focus:ring-red-500 focus:outline-none cursor-pointer"
                  >
                    {[
                      { v: 'Transactions', l: 'Escrow Transactions (Confidential)' },
                      { v: 'Merchants', l: 'Verified Social Merchants (Confidential)' },
                      { v: 'Buyers', l: 'Escrow Buyers Index (Internal)' },
                      { v: 'Couriers', l: 'Contract Courier Partners (Internal)' },
                      { v: 'Pickers', l: 'Trust Pickers & Auditors (Internal)' },
                      { v: 'Disputes', l: 'Contested Escrow Cases (Confidential)' },
                      { v: 'Finance', l: 'Settlement Financial Ledger (Restricted)' },
                      { v: 'CRM', l: 'CRM Support Tickets Logs (Internal)' },
                      { v: 'HR', l: 'HR Staff & Payroll Directory (Restricted)' },
                      { v: 'System Administration', l: 'Administrative Ingress Audit Logs (Executive)' }
                    ].map(src => (
                      <option key={src.v} value={src.v}>
                        {src.l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. VISAULIZATION CHART SELECT */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wide">
                    2. Visualization Render
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 border rounded-xl h-[42px] items-center">
                    {[
                      { id: 'bar', icon: '📊', l: 'Bar' },
                      { id: 'line', icon: '📈', l: 'Line' },
                      { id: 'pie', icon: '🍩', l: 'Pie' },
                      { id: 'heatmap', icon: '🧱', l: 'Heat' },
                      { id: 'kpi', icon: '🎯', l: 'KPIs' },
                      { id: 'table', icon: '📋', l: 'Grid' },
                    ].map(viz => (
                      <button
                        key={viz.id}
                        onClick={() => setVizType(viz.id as any)}
                        title={viz.l}
                        className={`py-1 rounded-md text-[10px] font-bold transition flex items-center justify-center cursor-pointer ${
                          vizType === viz.id 
                            ? 'bg-red-500 text-white shadow-xs font-black' 
                            : 'text-slate-505 hover:bg-slate-205'
                        }`}
                      >
                        <span>{viz.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. FILTERS LOCATION */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wide">
                    3. Geographical Scope
                  </label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-sans bg-slate-50 focus:ring-1 focus:ring-red-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">● Nationwide (All Regions)</option>
                    <option value="Nairobi">Nairobi Hub</option>
                    <option value="Mombasa">Mombasa Port Node</option>
                    <option value="Kisumu">Kisumu Airport hub</option>
                    <option value="Nakuru">Rift Valley Nakuru Hub</option>
                    <option value="Eldoret">Eldoret Tech Pipeline</option>
                  </select>
                </div>

                {/* 4. FILTERS STATUS */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase font-mono tracking-wide">
                    4. Escrow Handshake Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-sans bg-slate-50 focus:ring-1 focus:ring-red-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">● All Statuses</option>
                    <option value="PENDING_DEPOSIT">Pending Escrow deposit</option>
                    <option value="ESCROW_HELD">Escrow Secured (Daraja Lock)</option>
                    <option value="ITEMS_SHIPPED">Shipped (Verification Pin active)</option>
                    <option value="FUNDS_RELEASED">Released to Seller</option>
                    <option value="DISPUTED">Formal dispute open</option>
                    <option value="REFUNDED">Refund processed</option>
                  </select>
                </div>

              </div>

              {/* SECONDARY ROW EXPORT AND LAUNCH */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleRunQuery}
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-650 text-slate-950 rounded-xl font-extrabold cursor-pointer transition flex items-center gap-1.5"
                  >
                    <span>⚡ Generate Custom Report</span>
                  </button>

                  <div className="h-6 w-px bg-slate-205"></div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Querying: <strong className="text-slate-600">{dataSource}</strong> with security class <strong className="text-red-550 uppercase">{getSecurityLevelOfSource(dataSource)}</strong>
                  </span>
                </div>

                {/* EXPORT BUTTONS */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Audited Export:</span>
                  {['Excel', 'CSV', 'PDF', 'PPT'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleTriggerExport(fmt as any)}
                      className="bg-slate-50 hover:bg-slate-100 border text-slate-700 px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>.{fmt.toUpperCase() === 'PPT' ? 'PPTX' : fmt.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PRE-CONSTRUCTED REPORT LOADER & SAVER ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* CURRENT CONFIGURATION OUTPUT */}
              <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-1 text-[10.5px] font-bold text-slate-800">
                    <span>📺</span>
                    <span>Dynamic Analytics Render View</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">
                    {reportResultSummary}
                  </span>
                </div>

                {/* VISUAL LAYOUT CONTAINER */}
                <div className="p-4 bg-slate-50/50 border rounded-xl">
                  {renderSVGChart()}
                </div>

                {/* GRID DETAILS TABLE */}
                <div className="space-y-2 mt-4 text-left">
                  <span className="text-[9.5px] font-extrabold uppercase font-mono text-slate-400 tracking-wider block">
                    Secured Database Records View ({generatedData.length} records processed)
                  </span>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[10.5px] border-collapse text-left">
                      <thead>
                        <tr className="border-b text-slate-400 uppercase font-mono tracking-wider font-extrabold bg-slate-100/50">
                          {selectedFields.map(fd => (
                            <th key={fd} className="p-2.5 capitalize">{fd.replace(/([A-Z])/g, ' $1')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {generatedData.length === 0 ? (
                          <tr>
                            <td colSpan={selectedFields.length} className="p-8 text-center text-slate-400">
                              No records fit query filters. Adjust parameters.
                            </td>
                          </tr>
                        ) : (
                          generatedData.map((rowData, r) => (
                            <tr key={r} className="border-b last:border-0 hover:bg-slate-50/50">
                              {selectedFields.map(fd => {
                                const val = rowData[fd];
                                let colorClass = 'text-slate-800 font-sans';
                                
                                if (fd === 'amount' || fd === 'salary' || fd === 'revenueGenerated') {
                                  colorClass = 'text-slate-900 font-mono font-bold';
                                } else if (fd === 'status' || fd === 'chargeStatus') {
                                  const themes: Record<string, string> = {
                                    PENDING_DEPOSIT: 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]',
                                    ESCROW_HELD: 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]',
                                    FUNDS_RELEASED: 'text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]',
                                    DISPUTED: 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]',
                                    BLACKLISTED: 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]'
                                  };
                                  return (
                                    <td key={fd} className="p-2.5">
                                      <span className={themes[val] || 'text-slate-500 font-mono uppercase text-[9px]'}>
                                        {val}
                                      </span>
                                    </td>
                                  );
                                } else if (fd === 'id' || fd === 'handle') {
                                  colorClass = 'text-blue-650 font-mono font-bold';
                                }

                                return (
                                  <td key={fd} className={`p-2.5 ${colorClass}`}>
                                    {typeof val === 'number' ? `Ksh ${val.toLocaleString()}` : String(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SAVE CURRENT REPORT CONFIG FORM */}
                <div className="pt-4 border-t border-dashed flex flex-col sm:flex-row gap-2 items-end sm:items-center justify-between text-xs">
                  <div className="space-y-1 text-left w-full sm:max-w-md">
                    <span className="text-[10px] font-bold text-slate-505 uppercase font-mono block">Encrypt and save this view model:</span>
                    <input 
                      type="text" 
                      placeholder="e.g. Nairobi Cargo Escrow Audit Month"
                      value={newReportName}
                      onChange={(e) => setNewReportName(e.target.value)}
                      className="w-full text-xs font-sans border p-2 rounded-xl"
                    />
                  </div>
                  <button
                    onClick={handleSaveReportConfig}
                    className="px-4 py-2 bg-slate-900 border border-slate-905 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition whitespace-nowrap"
                  >
                    💾 Save Report Layout
                  </button>
                </div>
              </div>

              {/* SHARED REPORTS & SCHEDULE SCHEDULER */}
              <div className="space-y-4">
                
                {/* SHARED PRESETS */}
                <div className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-4 text-left">
                  <span className="text-[10px] font-extrabold uppercase font-mono text-slate-505 tracking-wider block">
                    📂 Shared Multi-Department Presets
                  </span>

                  <div className="space-y-2 text-xs">
                    {savedReports.map(rpt => (
                      <div 
                        key={rpt.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-dashed rounded-xl group relative text-left"
                      >
                        <div className="flex justify-between items-start mb-1 text-[10px] font-mono leading-none">
                          <span className="text-red-505 font-bold">{rpt.id}</span>
                          <span className="text-slate-400">Created by {rpt.createdBy}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-805 font-sans pr-16">{rpt.name}</h5>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">Source: {rpt.source} | Viz: {rpt.viz.toUpperCase()}</p>
                        
                        <button
                          onClick={() => handleLoadSavedReport(rpt)}
                          className="absolute right-3.5 top-3.5 px-2.5 py-1 bg-white hover:bg-slate-950 hover:text-white border text-slate-700 text-[10px] font-extrabold rounded-lg shadow-sm transition-all cursor-pointer opacity-85 group-hover:opacity-100"
                        >
                          Load →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SCHEDULE SCHEDULER PANEL */}
                <div className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase font-mono text-slate-505 tracking-wider block">
                      ⏰ Scheduled Automation Rules
                    </span>
                    <p className="text-[9px] text-slate-450 leading-relaxed font-sans">
                      Establish recurring reports pipelines that automatically compile and transmit approved metrics to dashboards, platform inboxes, or team mailboxes.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono block">Frequency</label>
                        <select
                          value={schedFrequency}
                          onChange={(e: any) => setSchedFrequency(e.target.value)}
                          className="w-full border rounded-lg p-2 font-sans bg-slate-50 focus:outline-none"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase font-mono block">Transmission</label>
                        <select
                          value={schedDelivery}
                          onChange={(e: any) => setSchedDelivery(e.target.value)}
                          className="w-full border rounded-lg p-2 font-sans bg-slate-50 focus:outline-none"
                        >
                          <option value="Platform Inbox">Platform Inbox</option>
                          <option value="Email">Secure Corporate Email</option>
                          <option value="Executive Dashboard">COO Exec Dashboard</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleRegisterSchedule}
                      className="w-full py-2 bg-slate-900 border border-slate-905 hover:bg-slate-800 text-white rounded-xl text-center font-bold cursor-pointer transition text-xs flex items-center justify-center gap-1"
                    >
                      ✓ Activate Automation Rule
                    </button>

                    <div className="border-t pt-3.5 space-y-2">
                      <span className="text-[9px] font-bold text-slate-450 uppercase font-mono tracking-wider block">Active schedules count:</span>
                      <div className="space-y-1.5 font-mono text-[9.5px]">
                        {scheduledReports.map(sch => (
                          <div key={sch.id} className="flex justify-between items-center text-slate-505 border-b pb-1">
                            <span>{sch.name}</span>
                            <span className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-black uppercase tracking-wide text-[8.5px]">{sch.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: KPI MONITORING CENTER */}
        {biSubTab === 'kpis' && (
          <div className="space-y-6 animate-fadeIn text-left font-sans">
            <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
              <div className="space-y-1 border-b pb-2">
                <span className="text-[10px] font-extrabold uppercase font-mono text-slate-400 tracking-wider block">
                  🎯 Enterprise KPI Status Indicators & Targets SLA
                </span>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Real-time monitoring across key operational divisions. Alerts trigger automatically if performance metrics descend below target SLA envelopes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { dept: 'Customer Support (CRM)', label: 'Average SLA Ticket Resolution Time', target: '< 2 hrs', actual: '1.4 hours', status: 'ON_TRACK', color: 'border-emerald-250 bg-emerald-50/20 text-emerald-700', rating: 'On Track (100% resolve rate)' },
                  { dept: 'Finance & Ledger Auditing', label: 'Daraja STK Payout Settlement Accuracy', target: '100%', actual: '99.85%', status: 'ACCURACY_WARNING', color: 'border-amber-250 bg-amber-50/20 text-amber-700', rating: 'Minor deviation detected' },
                  { dept: 'Field Operations & On-site', label: 'Social Merchant Verification Rate', target: '> 90%', actual: '92.4% success', status: 'ON_TRACK', color: 'border-emerald-250 bg-emerald-50/20 text-emerald-700', rating: 'Optimal performance' },
                  { dept: 'Logistics & Courier Delivery', label: 'Safe Handover Callback Completion', target: '> 98%', actual: '96.5%', status: 'SLA_CRITICAL', color: 'border-red-205 bg-red-50/20 text-red-700', rating: 'Requires dispatch audit' },
                  { dept: 'Human Resources (HR)', label: 'Contracted Inspector Turnover Index', target: '< 5% yr', actual: '1.2%', status: 'ON_TRACK', color: 'border-emerald-250 bg-emerald-50/20 text-emerald-700', rating: 'High staff satisfaction score' },
                  { dept: 'Platform Operations (SysAdmin)', label: 'API Webhook Ingress Availability', target: '> 99.9%', actual: '99.94% runtime', status: 'ON_TRACK', color: 'border-emerald-250 bg-emerald-50/20 text-emerald-700', rating: 'Nominal operational state' }
                ].map((k, idx) => (
                  <div key={idx} className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-3 text-left">
                    <div className="flex justify-between items-start text-[9.5px] font-mono leading-none">
                      <span className="text-slate-500 font-bold uppercase">{k.dept}</span>
                      <span className={`px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider text-[8.5px] ${k.color}`}>
                        {k.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-slate-800 text-xs font-extrabold leading-snug">{k.label}</h4>

                    <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t">
                      <div className="bg-slate-50 p-2 rounded-lg border">
                        <span className="text-[8.5px] text-slate-400 font-mono block uppercase">Target SLA</span>
                        <strong className="text-xs font-black text-slate-800 font-mono">{k.target}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border">
                        <span className="text-[8.5px] text-slate-400 font-mono block uppercase">Actual Index</span>
                        <strong className="text-xs font-black text-slate-800 font-mono text-red-505">{k.actual}</strong>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-400 font-sans italic pt-1">{k.rating}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: DRILL-DOWN INTERACTIVE EXPLORER */}
        {biSubTab === 'drill' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                  🔍 Comprehensive Hierarchical Drill-Down Navigator
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Audit revenue structures. Click categories sequentially to drill down from high-level metrics into merchant statistics, transactions, and individual order item details.
                </p>
              </div>

              {/* DEPTH BREADCRUMB INDICATOR */}
              <div className="p-3 bg-slate-50 rounded-xl border flex items-center gap-1.5 text-xs font-semibold leading-none">
                <button 
                  onClick={() => { setDrillLevel(0); setDrillMerchant(null); setDrillTx(null); }}
                  className={`hover:text-red-650 flex items-center gap-1 cursor-pointer`}
                >
                  🏢 Total Buy Safely Revenue (Ksh 2.42M)
                </button>
                {drillLevel >= 1 && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <button 
                      onClick={() => { setDrillLevel(1); setDrillTx(null); }}
                      className="hover:text-red-650 flex items-center gap-1 cursor-pointer font-bold text-slate-800"
                    >
                      🏪 {drillMerchant?.name}
                    </button>
                  </>
                )}
                {drillLevel >= 2 && drillTx && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-red-650 font-mono font-bold">🧾 Escrow ID: {drillTx.id}</span>
                  </>
                )}
              </div>

              {/* LEVEL viewport DEPTHS */}
              <AnimatePresence mode="wait">
                {drillLevel === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider font-mono block">
                      Select Regional Merchant Hub to Drill Down performance:
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: 'Nairobi Electronics', area: 'Nairobi Hub', revenue: 1420000, rates: '98% on-time', scale: '88 active accounts' },
                        { name: 'Mombasa Apparel Node', area: 'Mombasa Port', revenue: 780000, rates: '92.5% safe release', scale: '42 active accounts' }
                      ].map((mr, m) => (
                        <div 
                          key={m}
                          onClick={() => selectDrillMerchant(mr.name)}
                          className="bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-red-400 p-4.5 rounded-2xl shadow-sm transition-all cursor-pointer text-left flex justify-between items-center"
                        >
                          <div className="space-y-1">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-wide">{mr.area}</span>
                            <h4 className="text-slate-850 font-extrabold text-sm">{mr.name}</h4>
                            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Scale: {mr.scale} | {mr.rates}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <strong className="text-sm font-black font-mono text-slate-805 block">Ksh {mr.revenue.toLocaleString()}</strong>
                            <span className="text-[9.5px] font-bold font-mono text-emerald-600 block">Drill Down →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {drillLevel === 1 && drillMerchant && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider font-mono">
                        Escrow transaction logs of {drillMerchant.name} ({drillMerchant.transactionsCount} rows):
                      </span>
                      <button
                        onClick={() => { setDrillLevel(0); setDrillMerchant(null); }}
                        className="text-[10px] text-red-500 underline font-mono cursor-pointer"
                      >
                        ← Back to Total view
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b text-slate-400 uppercase font-mono tracking-wider font-extrabold bg-slate-50">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Buyer Contact</th>
                            <th className="p-3 text-right">Escrow Swag (Ksh)</th>
                            <th className="p-3 text-center">Security Risk</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drillMerchant.rawTxs.map((tx: Transaction) => (
                            <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-blue-650">{tx.id}</td>
                              <td className="p-3 font-mono text-slate-600">{tx.buyerPhone}</td>
                              <td className="p-3 text-right font-mono font-extrabold text-slate-800">
                                Ksh {tx.amount.toLocaleString()}
                              </td>
                              <td className="p-3 text-center font-mono font-bold">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  tx.riskScore > 60 ? 'bg-red-50 text-red-650' : 'bg-emerald-50 text-emerald-650'
                                }`}>
                                  {tx.riskScore}%
                                </span>
                              </td>
                              <td className="p-3 text-center uppercase font-mono text-[9px] font-black">
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                  {tx.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => selectDrillTx(tx)}
                                  className="px-2.5 py-1 bg-slate-900 text-white hover:bg-red-600 font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Inspect →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {drillLevel === 2 && drillTx && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 border bg-slate-50/50 rounded-2xl space-y-4 text-left"
                  >
                    <div className="flex justify-between items-start border-b pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 font-mono tracking-wider block">Escrow Item Details</span>
                        <h4 className="text-sm font-extrabold text-slate-800 font-sans uppercase">
                          {drillTx.description || 'Commerce product item'}
                        </h4>
                      </div>
                      <button
                        onClick={() => { setDrillLevel(1); setDrillTx(null); }}
                        className="text-[10px] text-red-500 underline font-mono cursor-pointer"
                      >
                        ← Back to Transactions
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs leading-relaxed font-sans">
                      <div className="bg-white border p-3.5 rounded-xl space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block font-bold">Secured Escrow Account</span>
                        <p className="text-slate-800">Merchant Handshake: <strong>{drillTx.sellerHandle}</strong></p>
                        <p className="text-slate-850">Buyer Channel: <strong>{drillTx.buyerPhone}</strong></p>
                        <p className="text-slate-500">Platform Origin: {drillTx.socialPlatform || 'WhatsApp'}</p>
                      </div>

                      <div className="bg-white border p-3.5 rounded-xl space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block font-bold">Settlement Auditing Metrics</span>
                        <p className="text-slate-805">Product value: <strong className="font-mono">Ksh {drillTx.amount.toLocaleString()}</strong></p>
                        <p className="text-slate-500">Escrow Processing Fee: <span className="font-mono">Ksh {drillTx.fee}</span></p>
                        <p className="text-slate-500">Platform Commission: <span className="font-mono">Ksh {drillTx.platformFee || 12}</span></p>
                      </div>

                      <div className="bg-white border p-3.5 rounded-xl space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block font-bold">Daraja STK Push Logs</span>
                        <p className="text-slate-800">Status Clearance: <strong className="text-indigo-650 font-mono">{drillTx.status}</strong></p>
                        <p className="text-slate-500">AI Fraud Risk: {drillTx.riskScore}% severity</p>
                        <p className="text-slate-450 text-[10px]">Date created: {drillTx.createdAt.split('T')[0]}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border rounded-xl mt-3 space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-450 uppercase font-mono block">Immutable Timeline audit trail:</span>
                      <div className="space-y-1 text-slate-650 font-mono text-[10.5px]">
                        {drillTx.history && drillTx.history.map((evt, eIdx) => (
                          <div key={eIdx} className="flex justify-between items-center text-[9.5px]">
                            <span>[{evt.actor}] {evt.title}: "{evt.description}"</span>
                            <span className="text-slate-400">{evt.timestamp.split('T')[1]?.substring(0, 8) || '14:24:12'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* VIEW 5: GOVERNANCE & APPROVAL WORKFLOWS */}
        {biSubTab === 'actions' && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* COMPLIANCE STATS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* CURRENT PENDING ACTIONS PANEL */}
              <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="space-y-1 border-b pb-2">
                  <span className="text-[10px] font-extrabold uppercase font-mono text-slate-400 tracking-wider block">
                    ⚖️ Strict Sensitive Export Licensing Registry
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-0.5">
                    Sensitive datasets containing Merchant PII (Phone numbers, county names), HR details, or complete financial ledgers require authorization before downloading.
                  </p>
                </div>

                <div className="space-y-3">
                  {exportRequests.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      Zero export authorization files logged in metadata.
                    </div>
                  ) : (
                    exportRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 items-start md:items-center text-xs leading-normal bg-slate-50/50 ${
                          req.status === 'PENDING' ? 'border-amber-300 border-l-4 border-l-amber-500 bg-amber-50/10' : 'opacity-85'
                        }`}
                      >
                        <div className="space-y-1.5 text-left flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono leading-none">
                            <span className="font-extrabold text-red-505">{req.id}</span>
                            <span className="bg-slate-905 text-white px-1 py-0.5 rounded text-[8px] uppercase tracking-wide">
                              {req.securityLevel}
                            </span>
                            <span className="text-slate-400">Filed by {req.requestedBy} ({req.role})</span>
                          </div>

                          <h5 className="font-black text-slate-850 text-xs uppercase pr-10 leading-snug">{req.datasetName}</h5>
                          <p className="text-slate-500 font-sans italic">Justification: "{req.justification}"</p>
                          
                          {req.decidedBy && (
                            <div className="text-[9px] text-emerald-600 font-mono pt-1">
                              <strong>Approved securely</strong> by Executive Officer: {req.decidedBy} ({req.decidedAt?.split('T')[1]?.substring(0, 5) || '15:30'} Local Time)
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 whitespace-nowrap self-end md:self-center">
                          {req.status === 'PENDING' ? (
                            <>
                              {/* Decider workflow triggers */}
                              <button
                                onClick={() => handleApproveRequest(req.id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-605 text-slate-950 font-bold rounded-lg text-[10.5px] transition cursor-pointer"
                              >
                                ✓ Approve Release
                              </button>
                              <button
                                onClick={() => {
                                  setExportRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'REJECTED' } : r));
                                }}
                                className="px-3 py-1.5 bg-slate-205 text-slate-700 hover:bg-slate-300 font-bold rounded-lg text-[10.5px] transition cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-black border uppercase ${
                              req.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'
                            }`}>
                              {req.status}
                            </span>
                          )}

                          {req.status === 'APPROVED' && (
                            <button
                              onClick={() => {
                                alert(`Download Triggered: Commencing extraction ledger compile for ${req.datasetName}. Verified.`);
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10.5px] transition cursor-pointer"
                            >
                              Download 💾
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* BI PLATFORM COMPLIANCE METADATA AUDIT TRACE */}
              <div className="bg-white border rounded-2xl p-4.5 shadow-xs space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase font-mono text-slate-505 tracking-wider block">
                    📜 Platform Business Intelligence Audit Trails
                  </span>
                  <p className="text-[9px] text-slate-450 leading-relaxed font-sans">
                    Every dynamic query statement and Excel/PDF data extraction triggers immutably audited security metadata registration inside administrative system monitors.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  {biLogs.map((lg) => (
                    <div key={lg.id} className="p-3 bg-slate-95 /40 border border-dashed rounded-xl font-mono text-[9.5px] leading-relaxed space-y-1 relative">
                      <div className="flex justify-between text-slate-450 leading-none">
                        <strong className="text-slate-800">{lg.user}</strong>
                        <span>{lg.timestamp.split('T')[1]?.substring(0, 8) || '11:15:30'}</span>
                      </div>
                      <p className="text-slate-655 font-bold">{lg.action}</p>
                      <p className="text-[8.5px] text-slate-400">Filters: {lg.filters}</p>

                      {lg.exportType !== 'NONE' && (
                        <span className="absolute right-3 top-3 bg-red-100 text-red-700 font-black px-1 rounded text-[8px]">
                          .{lg.exportType.toLowerCase()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 6: AI TREND PREDICTOR */}
        {biSubTab === 'predictions' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
              <div className="space-y-1 border-b pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                  🔮 AI Insights Prediction Layer & Linear Modeling
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-0.5">
                  Analyzing current transaction signatures, user behaviors, velocity indicators, and geofence workloads to project next-quarter targets and flags.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Q3 Escrow Vol Projection', val: 'Ksh 18.4M Projected', accuracy: '94% Regression Confidence', impact: 'Projecting 42% growth based on current checkout builder velocity', icon: '📈', theme: 'border-blue-200 bg-blue-50/10' },
                  { label: 'Merchant Churn risk metrics', val: '2.1% low churn risk', accuracy: 'Based on repeat-buyer velocity', impact: 'Highly stable verified merchant index nationwide', icon: '🎯', theme: 'border-emerald-200 bg-emerald-50/10' },
                  { label: 'Fraud Anomalies predicted', val: '3 potential threat avenues', accuracy: 'AI Fingerprint auto-match', impact: 'Detected micro-deposit testing signature on Facebook checkouts', icon: '🛡️', theme: 'border-red-200 bg-red-50/10' },
                  { label: 'Regional Market Churn Predictor', val: 'Nairobi +24% increase', accuracy: 'Based on boda delivery dispatch rates', impact: 'Suggests boosting Contract courier backup channels', icon: '🔥', theme: 'border-amber-200 bg-amber-50/10' },
                  { label: 'Courier Capacity forecast', val: 'Optimal Boda rider supply', accuracy: 'SLA capacity index: Safe', impact: 'Fulfillment capacity fits peak demand windows', icon: '🏍', theme: 'border-indigo-200 bg-indigo-50/10' },
                  { label: 'Seasonal Revenue growth', val: 'Ksh 3.1M Gross Q3', accuracy: 'Linear forecast index', impact: 'Escrow platform fee collection on-track for targets', icon: '💎', theme: 'border-teal-200 bg-teal-50/10' }
                ].map((p, pIdx) => (
                  <div key={pIdx} className={`p-4 rounded-xl border ${p.theme} space-y-2 relative text-left`}>
                    <div className="flex justify-between items-start leading-none text-slate-500">
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider">{p.label}</span>
                      <span className="text-md">{p.icon}</span>
                    </div>

                    <strong className="text-xs font-black text-slate-805 block font-mono">{p.val}</strong>
                    <p className="text-[10px] text-red-655 font-bold font-mono">{p.accuracy}</p>
                    <p className="text-[10px] text-slate-505 font-sans leading-relaxed pt-1.5 border-t border-slate-205/40">{p.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
