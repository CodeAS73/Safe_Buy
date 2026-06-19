import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Briefcase, 
  Cpu, 
  Lock, 
  CheckCircle, 
  Plus, 
  RefreshCw, 
  UserCheck, 
  Check, 
  X,
  Play,
  HeartHandshake,
  ChevronRight
} from 'lucide-react';
import { 
  Server, 
  Settings, 
  Database, 
  Search, 
  FileCheck, 
  Activity, 
  HardDrive, 
  Terminal, 
  UserMinus, 
  Key, 
  LifeBuoy,
  GitPullRequest,
  CheckCircle2,
  AlertOctagon,
  Power,
  RotateCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';
import HumanResourcesPanel from './HumanResourcesPanel';
import BusinessIntelligence from './BusinessIntelligence';

interface HRStaff {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  performanceRating: number;
}

interface Ticket {
  id: string;
  customer: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'OPEN' | 'RESOLVED';
  assignedTo: string;
  message: string;
  createdAt: string;
}

interface FieldAssignment {
  id: string;
  merchantName: string;
  location: string;
  task: string;
  status: string;
  assignedBy: string;
  assignedTo: string;
  reportDetails: string;
  assignmentType?: string;
  dateAssigned?: string;
  chargeAmount?: number;
  chargeStatus?: 'UNPAID' | 'PAID';
  visitDate?: string;
  visitTime?: string;
  gpsCoordinates?: string;
  contactPerson?: string;
  partiesInterviewed?: {
    merchant: boolean;
    buyer: boolean;
    courier: boolean;
    witness: boolean;
  };
  evidenceUploaded?: {
    photos: string[];
    videos: string[];
    documents: string[];
    audioNotes?: string[];
  };
  findings?: string;
  riskAssessment?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  recommendation?: string;
  supervisorNotes?: string;
  modifiedRecommendation?: string;
  decidedBy?: string;
  decidedRole?: string;
  decidedAt?: string;
  badgeIssued?: string;
  history?: Array<{
    timestamp: string;
    user: string;
    role: string;
    action: string;
    prevStatus: string;
    newStatus: string;
    notes?: string;
  }>;
}

interface HRLeave {
  id: string;
  staffMember: string;
  department: string;
  duration: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AdminLog {
  id: string;
  user: string;
  role: string;
  action: string;
  date: string;
  time: string;
  previousValue: string;
  newValue: string;
}

interface AdminPortalProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

// Map of staff members that models the server directory
const STAFF_LIST = [
  // CRM Team
  { id: 'STF-01', name: 'Mike Otieno', role: 'CRM Agent', department: 'CRM', roleKey: 'CRM_AGENT', email: 'mike.ot@buysafely.africa' },
  { id: 'STF-02', name: 'Sarah Mwangi', role: 'CRM Manager', department: 'CRM', roleKey: 'CRM_MANAGER', email: 'sarah.mw@buysafely.africa' },
  { id: 'STF-03', name: 'David Chemosit', role: 'CRM Supervisor', department: 'CRM', roleKey: 'CRM_SUPERVISOR', email: 'david.ch@buysafely.africa' },
  
  // Field Operations
  { id: 'STF-04', name: 'Ken Bwire', role: 'Field Agent', department: 'Field Operations', roleKey: 'FIELD_AGENT', email: 'ken.bw@buysafely.africa' },
  { id: 'STF-05', name: 'Kiprop Rono', role: 'Senior Field Agent', department: 'Field Operations', roleKey: 'SENIOR_FIELD_AGENT', email: 'kiprop.ro@buysafely.africa' },
  { id: 'STF-11', name: 'Alice Koech', role: 'Field Supervisor', department: 'Field Operations', roleKey: 'FIELD_SUPERVISOR', email: 'alice.ko@buysafely.africa' },
  { id: 'STF-12', name: 'John Kamau', role: 'Field Operations Manager', department: 'Field Operations', roleKey: 'FIELD_MANAGER', email: 'john.ka@buysafely.africa' },
  
  // Finance & Audit Team
  { id: 'STF-06', name: 'Peter Karanja', role: 'Finance Officer', department: 'Finance', roleKey: 'FINANCE_OFFICER', email: 'peter.ka@buysafely.africa' },
  { id: 'STF-13', name: 'Lucy Njeri', role: 'Finance Analyst', department: 'Finance', roleKey: 'FINANCE_ANALYST', email: 'lucy.nj@buysafely.africa' },
  { id: 'STF-14', name: 'James Mwangi', role: 'Reconciliation Officer', department: 'Finance', roleKey: 'RECON_OFFICER', email: 'james.mw@buysafely.africa' },
  { id: 'STF-15', name: 'Grace Kendi', role: 'Finance Supervisor', department: 'Finance', roleKey: 'FINANCE_SUPERVISOR', email: 'grace.ke@buysafely.africa' },
  { id: 'STF-16', name: 'Evans Kosgei', role: 'Finance Manager', department: 'Finance', roleKey: 'FINANCE_MANAGER', email: 'evans.ko@buysafely.africa' },
  { id: 'STF-17', name: 'Benson Obwoge', role: 'Internal Auditor', department: 'Finance', roleKey: 'INTERNAL_AUDITOR', email: 'benson.ob@buysafely.africa' },
  { id: 'STF-18', name: 'Hezron Ombati', role: 'Head of Finance', department: 'Finance', roleKey: 'HEAD_OF_FINANCE', email: 'hezron.om@buysafely.africa' },

  // HR Team
  { id: 'STF-07', name: 'Jane Wairimu', role: 'HR Officer', department: 'HR', roleKey: 'HR_OFFICER', email: 'jane.wa@buysafely.africa' },
  { id: 'STF-19', name: 'Rosebell Awuor', role: 'HR Business Partner', department: 'HR', roleKey: 'HR_BP', email: 'rosebell.aw@buysafely.africa' },
  { id: 'STF-20', name: 'Philip Maingi', role: 'HR Supervisor', department: 'HR', roleKey: 'HR_SUPERVISOR', email: 'philip.ma@buysafely.africa' },
  { id: 'STF-21', name: 'Catherine Mutua', role: 'HR Manager', department: 'HR', roleKey: 'HR_MANAGER', email: 'catherine.mu@buysafely.africa' },

  // Administrative & executive
  { id: 'STF-08', name: 'Alex Ondieki', role: 'System Administrator', department: 'System Administration', roleKey: 'SYSTEM_ADMIN', email: 'alex.on@buysafely.africa' },
  { id: 'STF-09', name: 'Mary Mweru', role: 'BI Analyst', department: 'Business Intelligence', roleKey: 'BI_ANALYST', email: 'mary.mw@buysafely.africa' },
  { id: 'STF-10', name: 'Silas Mugo', role: 'Chief Operating Officer (COO)', department: 'Executive Management', roleKey: 'CHIEF_OPERATING_OFFICER', email: 'silas.mu@buysafely.africa' }
];

export default function AdminPortal({ transactions, onRefresh }: AdminPortalProps) {
  // Current active staff member / role select state
  const [selectedStaffId, setSelectedStaffId] = useState('STF-10'); // Defaults to Silas Mugo (COO)
  const currentStaff = STAFF_LIST.find(s => s.id === selectedStaffId) || STAFF_LIST[STAFF_LIST.length - 1];

  // Active module tab within operations workspace
  const [activeTab, setActiveTab] = useState<'CRM' | 'FIELD' | 'FINANCE' | 'HR' | 'SYS_LOGS' | 'BI'>('CRM');

  // --- SYSTEM ADMINISTRATION PLATFORM OPERATIONS STATES ---
  const [adminLevel, setAdminLevel] = useState<number>(5); // Default to L5 Head of Technology for maximum capability default
  const [sysAdminSubTab, setSysAdminSubTab] = useState<string>('SUPPORT');
  
  // 1. Technical Support tickets
  const [supportTickets, setSupportTickets] = useState<any[]>([
    {
      id: 'TKT-1001',
      title: 'Webhook callback failures (M-Pesa validation response timeout)',
      category: 'API Failure',
      raisedBy: 'SYSTEM_DAEMON',
      urgency: 'Critical',
      status: 'INVESTIGATING',
      levelAssigned: 3,
      assignedUser: 'SysAdmin-02',
      notes: 'M-Pesa IPNs are failing with 504 gateway timeout on validation edge.',
      createdAt: '2026-06-12T06:12:00Z',
      timeline: [
        { timestamp: '2026-06-12T06:12:00Z', action: 'Ticket Created', user: 'SYSTEM_DAEMON', details: 'Automatic telemetry alert triggered.' },
        { timestamp: '2026-06-12T06:15:00Z', action: 'Assigned to SysAdmin-02', user: 'SysSupervisor-Alpha', details: 'Assigned to SysAdmin-02.' },
        { timestamp: '2026-06-12T06:30:00Z', action: 'Investigation Started', user: 'SysAdmin-02', details: 'Tracing validation handshake timeouts.' }
      ]
    },
    {
      id: 'TKT-1002',
      title: 'Merchant account locked (Suspicious multi-device login activity)',
      category: 'Account Lock',
      raisedBy: 'm.nyeri@nyeristores.co.ke',
      urgency: 'High',
      status: 'CLOSED',
      levelAssigned: 1,
      assignedUser: 'SysAdmin-01',
      notes: 'User triggered 10 failed logins followed by sim swap check flag.',
      createdAt: '2026-06-12T05:40:00Z',
      closureNotes: 'Account was verified with secondary photo ID and video handshake match.',
      preventiveActions: 'Configured Cognito SMS fallback triggers block.',
      timeline: [
        { timestamp: '2026-06-12T05:40:00Z', action: 'Ticket Created', user: 'SecAuditBot', details: 'User failed Cognito login checklist.' },
        { timestamp: '2026-06-12T05:55:00Z', action: 'Assigned to SysAdmin-01', user: 'SysSupervisor-Alpha', details: 'Assigned to Support Tech.' },
        { timestamp: '2026-06-12T06:20:00Z', action: 'Investigation Started', user: 'SysAdmin-01', details: 'MFA and SIM swap records examined.' },
        { timestamp: '2026-06-12T06:35:00Z', action: 'Resolution Submitted', user: 'SysAdmin-01', details: 'Credentials restored. Code lock decrypted.' },
        { timestamp: '2026-06-12T06:40:00Z', action: 'Ticket Closed', user: 'SysSupervisor-Alpha', details: 'Resolved & Signed on compliance board.' }
      ]
    },
    {
      id: 'TKT-1003',
      title: 'Rider dispatch service malfunction (Mombasa hub geofence)',
      category: 'Courier API',
      raisedBy: 'rider.john@bodariders.co.ke',
      urgency: 'Medium',
      status: 'ASSIGNED',
      levelAssigned: 2,
      assignedUser: 'SysAdmin-01',
      notes: 'Riders cannot submit pickup clearance pin due to coordinates delta.',
      createdAt: '2026-06-12T04:22:00Z',
      timeline: [
        { timestamp: '2026-06-12T04:22:00Z', action: 'Ticket Created', user: 'John Momanyi (Rider)', details: 'Reported via mobile dispatch node.' },
        { timestamp: '2026-06-12T04:30:00Z', action: 'Assigned to SysAdmin-01', user: 'SysAdmin-Operator', details: 'Assigned to regional dispatch specialist.' }
      ]
    },
    {
      id: 'TKT-1003-B',
      title: 'Settlement failure during weekly payout loop batch',
      category: 'Settlement Failure',
      raisedBy: 'reconciliation@buysafely.africa',
      urgency: 'High',
      status: 'RESOLUTION_PENDING_APPROVAL',
      levelAssigned: 3,
      assignedUser: 'SysAdmin-02',
      notes: 'Total of 42 merchant settlements was aborted due to bulk payment payload exception.',
      createdAt: '2026-06-12T05:10:00Z',
      rootCause: 'PSP callback timeout',
      correctiveAction: 'Reprocessed payload block in test sandbox and routed manually.',
      impactAssessment: 'Partial impact',
      resolutionNotes: 'Transactions manually reconciled on Spanner backup tables. Action pending reviewer confirmation.',
      timeline: [
        { timestamp: '2026-06-12T05:10:00Z', action: 'Ticket Created', user: 'reconciliation@buysafely.africa', details: 'Batch processing error detected.' },
        { timestamp: '2026-06-12T05:15:00Z', action: 'Assigned to SysAdmin-02', user: 'System-AutoAssign', details: 'Assigned' },
        { timestamp: '2026-06-12T05:25:00Z', action: 'Investigation Started', user: 'SysAdmin-02', details: 'Identified payload truncation in API response.' },
        { timestamp: '2026-06-12T06:00:00Z', action: 'Resolution Submitted', user: 'SysAdmin-02', details: 'Pending Supervisor review and approval.' }
      ]
    },
    {
      id: 'TKT-1004',
      title: 'KYC Document verification upload timeout on S3 region',
      category: 'Database Failure',
      raisedBy: 'w.chege@gmail.com',
      urgency: 'Low',
      status: 'RESOLVED',
      levelAssigned: 1,
      assignedUser: 'SysAdmin-01',
      notes: 'Fixed by rotating cloudfront bucket certificate.',
      resolutionNotes: 'Flushed region cache and rotated edge tokens.',
      timeline: [
        { timestamp: '2026-06-12T03:00:00Z', action: 'Ticket Created', user: 'w.chege@gmail.com', details: 'Raised via support email.' },
        { timestamp: '2026-06-12T03:15:00Z', action: 'Investigation Started', user: 'SysAdmin-01', details: 'Cloudfront log index searched.' },
        { timestamp: '2026-06-12T03:30:00Z', action: 'Resolution Submitted', user: 'SysAdmin-01', details: 'Region cache purged.' }
      ]
    },
    {
      id: 'TKT-1005',
      title: 'Buyer cannot log in: "Cognito UserPool mismatch error"',
      category: 'Login Failure',
      raisedBy: 'b.otieno@outlook.com',
      urgency: 'Medium',
      status: 'NEW',
      levelAssigned: 1,
      assignedUser: 'Unassigned',
      notes: 'Getting token expired payload during initial callback redirect.',
      createdAt: '2026-06-12T06:05:00Z',
      timeline: [
        { timestamp: '2026-06-12T06:05:00Z', action: 'Ticket Created', user: 'b.otieno@outlook.com', details: 'Direct portal error report uploaded.' }
      ]
    },
  ]);

  // --- SYS ADMIN INCIDENT WORKFLOW MODAL STATES ---
  const [activeWorkflowTicketId, setActiveWorkflowTicketId] = useState<string | null>(null);
  const [workflowModalType, setWorkflowModalType] = useState<'INVESTIGATE' | 'REQUEST_INFO' | 'RESOLVE' | 'CLOSE' | 'REOPEN' | null>(null);

  // Temporary active form states for input control
  const [tempNotes, setTempNotes] = useState('');
  const [tempRootCause, setTempRootCause] = useState('Under Investigation');
  const [tempNextAction, setTempNextAction] = useState('Continue Investigation');
  const [tempEvidence, setTempEvidence] = useState<string[]>([]);
  const [tempRecipient, setTempRecipient] = useState('Infrastructure Team');
  const [tempRequiredInfo, setTempRequiredInfo] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');
  const [tempCorrectiveAction, setTempCorrectiveAction] = useState('');
  const [tempImpact, setTempImpact] = useState('No customer impact');
  const [tempApproval, setTempApproval] = useState(true);
  const [tempVerified, setTempVerified] = useState('Yes');
  const [tempImpactAddressed, setTempImpactAddressed] = useState('Yes');
  const [tempMonitoring, setTempMonitoring] = useState('Yes');
  const [tempClosureNotes, setTempClosureNotes] = useState('');
  const [tempPreventive, setTempPreventive] = useState('');
  const [tempReopenReason, setTempReopenReason] = useState('Issue recurred');
  const [tempReopenDetails, setTempReopenDetails] = useState('');



  // 2. User Accounts Management database
  const [adminAccounts, setAdminAccounts] = useState<any[]>([
    { id: 'USR-892', name: 'Wycliffe Ochieng', handle: 'wycliffe@buyer.africa', type: 'Buyer', status: 'Active', mfaEnabled: true, lastLogout: '2026-06-12T05:00:00Z' },
    { id: 'USR-401', name: 'Nyeri Wholesalers', handle: 'm.nyeri@nyeristores.co.ke', type: 'Seller', status: 'Locked', mfaEnabled: true, lastLogout: '2026-06-12T03:30:00Z' },
    { id: 'USR-505', name: 'John Momanyi', handle: 'rider.john@bodariders.co.ke', type: 'Courier', status: 'Suspended', mfaEnabled: false, lastLogout: '2026-06-11T12:00:00Z' },
    { id: 'USR-612', name: 'Alex Kipchirchir', handle: 'alex.kip@inspectors.co.ke', type: 'Picker', status: 'Needs Verification', mfaEnabled: false, lastLogout: null },
    { id: 'USR-088', name: 'Alex Ondieki', handle: 'alex.on@buysafely.africa', type: 'Internal Staff', status: 'Active', mfaEnabled: true, lastLogout: '2026-06-12T01:15:00Z' },
  ]);

  // 3. RBAC Rules & Permissions
  const [rbacRoles, setRbacRoles] = useState<any[]>([
    { roleName: 'Support Administrator', level: 1, desc: 'User operations, simple troubleshooting, resets', depts: ['CRM', 'FIELD'], permissions: ['Unlock User', 'Reset MFA', 'Reset Password'] },
    { roleName: 'Systems Administrator', level: 2, desc: 'Systems management, integrations, health', depts: ['CRM', 'FIELD', 'FINANCE'], permissions: ['Unlock User', 'Reset MFA', 'Suspend Account', 'Modify Roles'] },
    { roleName: 'Security Administrator', level: 3, desc: 'SOC ops, fraud investigations, token control', depts: ['FINANCE', 'SYS_LOGS'], permissions: ['Unlock User', 'Reset MFA', 'Suspend Account', 'Modify Roles', 'Security Override'] },
    { roleName: 'Infrastructure Supervisor', level: 4, desc: 'Emergency escalations, change approval, master operations', depts: ['CRM', 'FIELD', 'FINANCE', 'HR', 'SYS_LOGS', 'BI'], permissions: ['Unlock User', 'Reset MFA', 'Suspend Account', 'Modify Roles', 'Change Platform Rules'] },
    { roleName: 'Head of Technology / PlatOps', level: 5, desc: 'Total infrastructure governance, disaster recovery', depts: ['All Departments'], permissions: ['Unlock User', 'Reset MFA', 'Suspend Account', 'Modify Roles', 'Change Platform Rules', 'Execute DR Plan'] },
  ]);

  const [temporaryBypassActive, setTemporaryBypassActive] = useState(false);
  const [emergencyBypassActive, setEmergencyBypassActive] = useState(false);

  // 4. Service monitoring
  const [monitoredServices, setMonitoredServices] = useState<any[]>([
    { id: 'SVC-1', name: 'M-Pesa Payment Linkage Edge', category: 'Payment Services', status: 'Healthy', latency: '12ms', lastActive: '2026-06-12T06:33:00Z', host: 'mpesa-api.internal.buysafely.africa', activeNode: 'n-ke-nairobi-01' },
    { id: 'SVC-2', name: 'Airtel Money Disbursement API', category: 'Payment Services', status: 'Healthy', latency: '24ms', lastActive: '2026-06-12T06:34:00Z', host: 'airtel-disburse.internal.buysafely.africa', activeNode: 'n-ke-nairobi-01' },
    { id: 'SVC-3', name: 'T-Cash Escrow Wallet Controller', category: 'Payment Services', status: 'Failover', latency: '344ms', lastActive: '2026-06-12T06:30:00Z', host: 'tcash-mirror.internal.buysafely.africa', activeNode: 'n-ke-mombasa-failover' },
    { id: 'SVC-4', name: 'Central Bank Ledger Engine Node', category: 'Databases', status: 'Healthy', latency: '4ms', lastActive: '2026-06-12T06:35:00Z', host: 'spanner-ledger.internal.buysafely.africa', activeNode: 'n-us-central-05' },
    { id: 'SVC-5', name: 'BuySafely Smart Escrow Engine', category: 'Escrow Engine', status: 'Healthy', latency: '8ms', lastActive: '2026-06-12T06:35:20Z', host: 'escrow.core.buysafely.africa', activeNode: 'n-ke-nairobi-02' },
    { id: 'SVC-6', name: 'Dispatched Courier Locator Ingress', category: 'Courier Services', status: 'Intermittent', latency: '891ms', lastActive: '2026-06-12T06:31:00Z', host: 'tracking.core.buysafely.africa', activeNode: 'n-ke-nairobi-01' },
    { id: 'SVC-7', name: 'Africa\'s Talking SMS Webhook Inbound', category: 'Notification Services', status: 'Healthy', latency: '110ms', lastActive: '2026-06-12T06:35:00Z', host: 'sms.notifications.buysafely.africa', activeNode: 'n-za-capetown-01' },
  ]);

  // 5. Incident Management
  const [majorIncidents, setMajorIncidents] = useState<any[]>([
    { id: 'INC-2026-004', summary: 'Outage of Africa\'s Talking gateway caused message drops', status: 'POST_MORTEM', severity: 'L3 Major Outage', raisedAt: '2026-06-10T12:00:00Z', resolvedAt: '2026-06-10T14:30:00Z', incidentReport: 'AT experienced an fiber cable cut. SMS queue backed up for 40,000 transactions.', rootCause: 'Fiber cuts along central trunk line in Thika Road without automatic backup failover to Safaricom SMS link.', preventiveActions: 'Installed secondary automatic routes to Safaricom bulk direct terminal.' },
    { id: 'INC-2026-005', summary: 'M-Pesa Webhook SSL verification handshake failures', status: 'RESOLVED', severity: 'L4 Critical', raisedAt: '2026-06-11T16:00:00Z', resolvedAt: '2026-06-11T16:45:00Z', incidentReport: 'Expired Let\'s Encrypt cross trust bundle on webhook proxy validator.', rootCause: 'Automatic cert renewal failed on Nginx ingress controller.', preventiveActions: 'Updated cron frequency and added failover Let\'s Encrypt fallback validation client.' },
    { id: 'INC-2026-006', summary: 'Database Connection Pool Exhaustion on Spanner Cluster', status: 'INVESTIGATING', severity: 'L4 Critical', raisedAt: '2026-06-12T05:30:00Z', incidentReport: 'Active database connections exceeded default pool of 50 causing backlogs.', rootCause: 'Undergoing forensic trace. Appears linked to runaway validation loops on merchant onboarding.', preventiveActions: 'Awaiting completion.' },
  ]);

  // 6. Security Operations Center (SOC)
  const [socAlerts, setSocAlerts] = useState<any[]>([
    { id: 'SEC-9001', eventType: 'Failed Logins Escalation', targetUser: 'm.nyeri@nyeristores.co.ke', ipAddress: '197.248.33.204', frequency: '12 events / 1min', severity: 'High', status: 'Active Alert', timestamp: '2026-06-12T06:22:00Z' },
    { id: 'SEC-9002', eventType: 'Suspicious Transaction Value Variance', targetUser: 'rider.john@bodariders.co.ke', ipAddress: '41.80.32.12', frequency: 'Ksh 150,000 gross transfer in 5s', severity: 'Critical', status: 'Active Alert', timestamp: '2026-06-12T06:31:00Z' },
    { id: 'SEC-9003', eventType: 'Privilege Escalation Attempt', targetUser: 'STF-01 (Mike Otieno)', ipAddress: '197.248.81.42', frequency: 'Invocations on `/api/admin/roles/write` direct endpoint', severity: 'Medium', status: 'Mitigated', timestamp: '2026-06-12T04:10:00Z' },
    { id: 'SEC-9004', eventType: 'API Key Scraping Guard', targetUser: 'Anonymous Bot Core', ipAddress: '104.144.15.22', frequency: '980 requests / minute path brute forcing', severity: 'High', status: 'Mitigated', timestamp: '2026-06-12T02:00:00Z' },
  ]);

  // 7. Integration monitoring
  const [liveIntegrations, setLiveIntegrations] = useState<any[]>([
    { name: 'Safaricom M-Pesa C2B/B2C API Backend', type: 'Payment Provider', credentialExpiry: '2026-12-15T00:00:00Z', url: 'https://api.safaricom.co.ke/mpesa', activeHost: 'Primary Link', state: 'Active' },
    { name: 'Airtel Money Inbound Ingress Provider', type: 'Payment Provider', credentialExpiry: '2026-09-01T00:00:00Z', url: 'https://api.airtel.africa/money', activeHost: 'Primary Link', state: 'Active' },
    { name: 'Africa\'s Talking Bulk SMS Web gateway', type: 'SMS Gateway', credentialExpiry: '2026-07-20T00:00:00Z', url: 'https://api.africastalking.com', activeHost: 'Backup: Twilio SMS Link Secondary', state: 'Active' },
    { name: 'SendGrid Platform Notifications SMTP Edge', type: 'Email Provider', credentialExpiry: '2027-01-31T00:00:00Z', url: 'https://api.sendgrid.com/v3', activeHost: 'Primary Link', state: 'Active' },
    { name: 'Google Workspace Cloud Auth and Drive Client', type: 'Auth & KYC Storage', credentialExpiry: '2026-08-30T00:00:00Z', url: 'https://oauth2.googleapis.com', activeHost: 'Primary Link', state: 'Active' },
  ]);

  // 8. Platform Configurations
  const [platformConfigurations, setPlatformConfigurations] = useState<any>({
    platformFeePercent: 1.5,
    minTransactionLimitKsh: 50,
    maxTransactionLimitKsh: 250000,
    escrowAutoReleaseHrs: 72,
    kycValidationEnforced: 'YES',
    mfaThresholdKsh: 15000,
  });

  // 9. Data Integrity anomalies
  const [dataAnomalyRecords, setDataAnomalyRecords] = useState<any[]>([
    { id: 'ANM-402', anomalyType: 'Orphan Transaction Log', affectedTable: 'Escrow Ledgers', description: 'Transaction #BS-TX-984 has settlement references but no buyer matching table indices.', severity: 'High', detectedAt: '2026-06-12T01:00:00Z', status: 'Detected' },
    { id: 'ANM-403', anomalyType: 'Duplicate Webhook Transaction Hash', affectedTable: 'M-Pesa Edge Logs', description: 'Payload received double-hash check on `MP_2834A81X94` within 3 seconds.', severity: 'Medium', detectedAt: '2026-06-12T03:45:00Z', status: 'Detected' },
    { id: 'ANM-404', anomalyType: 'Broken Escrow Lock Coherence', affectedTable: 'Secure Escrow Holds', description: 'Escrow contract #ESC-892 shows release status but holds un-dispatched balance of Ksh 4,500.', severity: 'Critical', detectedAt: '2026-06-12T05:22:00Z', status: 'Detected' },
  ]);

  // 10. Disaster Recovery Core
  const [drBackups, setDrBackups] = useState<any[]>([
    { id: 'BKP-2026-06-12-00', timestamp: '2026-06-12T00:00:00Z', size: '1.24 TB', storageTarget: 'AWS Glacier (Mombasa Isolated S3)', completeStatus: 'Successful Verified', integrityScore: '100%' },
    { id: 'BKP-2026-06-11-00', timestamp: '2026-06-11T00:00:00Z', size: '1.21 TB', storageTarget: 'AWS Glacier (Mombasa Isolated S3)', completeStatus: 'Successful Verified', integrityScore: '100%' },
    { id: 'BKP-2026-06-10-00', timestamp: '2026-06-10T00:00:00Z', size: '1.18 TB', storageTarget: 'AWS Glacier (Mombasa Isolated S3)', completeStatus: 'Successful Verified', integrityScore: '100%' },
  ]);

  // Change Requests pipeline
  const [changeRequests, setChangeRequests] = useState<any[]>([
    { id: 'RFC-4001', description: 'Adjust basic platform fee threshold to 1.8% for bulk merchants', requestedBy: 'HEZRON OMBATI (Head of Finance)', status: 'APPROVED', dateRequested: '2026-06-11T14:00:00Z' },
    { id: 'RFC-4002', description: 'Rotate M-Pesa client credentials certificate on Safaricom G2 API Portal', requestedBy: 'ALEX ONDIEKI (System Admin)', status: 'REQUESTED', dateRequested: '2026-06-12T05:20:00Z' },
    { id: 'RFC-4003', description: 'Deploy secondary backup routers for Airtel webhook validation lines', requestedBy: 'MARY MWERU (Systems Analyst)', status: 'CLOSED', dateRequested: '2026-06-10T11:00:00Z', remarks: 'Deployed and verified on secondary zone.' },
  ]);

  // Search filter and states for the Enhanced Audit Log search & Investigation case manager
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logSearchType, setLogSearchType] = useState('ALL');
  const [selectedLogForInvestigation, setSelectedLogForInvestigation] = useState<any | null>(null);
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [investigationEvidence, setInvestigationEvidence] = useState<any[]>([]);
  const [investigationLinkedTicket, setInvestigationLinkedTicket] = useState('');
  
  const [activeInvestigations, setActiveInvestigations] = useState<any[]>([
    { id: 'INV-2026-001', logId: 'LOG-7722', title: 'Suspicious multiple role access check by Mike Otieno', status: 'OPEN', evidenceNotes: 'Log audit showed Mike Otieno requesting access bounds for leaves and financial records simultaneously from non-standard IP.', linkedTicketId: 'TKT-1002', remarks: 'Awaiting security review.' }
  ]);

  // Server managed states
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [fieldAssignments, setFieldAssignments] = useState<FieldAssignment[]>([]);
  const [leaves, setLeaves] = useState<HRLeave[]>([]);
  const [staff, setStaff] = useState<HRStaff[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // New persistent Finance dashboards state
  const [financeSubTab, setFinanceSubTab] = useState<'ESCROW' | 'PSP' | 'COMMISSIONS' | 'SETTLEMENTS' | 'REVENUE' | 'REFUNDS' | 'AUDITS'>('ESCROW');
  const [financeStats, setFinanceStats] = useState<any>({
    transactionsProcessed: 250000,
    autoReconciled: 249710,
    exceptionCases: 290,
    successRate: 99.88,
    rulesEngineState: 'LIVE',
    lastEvaluated: new Date().toISOString(),
    lastAuditRun: null,
    auditSampleRate: 1.0,
    auditRandomSamples: []
  });
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [exceptionTypeFilter, setExceptionTypeFilter] = useState<string>('ALL');
  const [pspRecons, setPspRecons] = useState<any[]>([]);
  const [commVerifs, setCommVerifs] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [revenueLeakages, setRevenueLeakages] = useState<any[]>([]);
  const [refundReviews, setRefundReviews] = useState<any[]>([]);
  const [auditCases, setAuditCases] = useState<any[]>([]);

  // New persistent HR Lifecycle states
  const [hrSubTab, setHrSubTab] = useState<
    | 'RECRUITMENT'
    | 'RECORDS'
    | 'PERFORMANCE'
    | 'REWARDS'
    | 'TRAINING'
    | 'DISCIPLINARY'
    | 'SEPARATION'
    | 'SUCCESSION'
    | 'ORG_STRUCTURE'
    | 'ANALYTICS'
    | 'APPROVAL_MATRIX'
  >('RECRUITMENT');
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  const [selectedStaffIdForTalent, setSelectedStaffIdForTalent] = useState<string | null>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [successionPlan, setSuccessionPlan] = useState<any[]>([]);

  // HR Extension Interactive states
  const [rewardsRecommendations, setRewardsRecommendations] = useState<any[]>([
    { id: 'REC-AW-01', staffId: 'STF-01', staffName: 'Mike Otieno', awardTitle: 'Standard Spot Award', amount: 5000, status: 'RECOMMENDED', submittedBy: 'Jane Wairimu', submittedDate: '2026-06-12', remarks: 'Exceptional de-escalation of complex dispute.' },
    { id: 'REC-AW-02', staffId: 'STF-04', staffName: 'Ken Bwire', awardTitle: 'Field Excellence Badge', amount: 2500, status: 'ENDORSED', submittedBy: 'Rosebell Awuor', submittedDate: '2026-06-11', remarks: 'Fastest turn-around on visual cargo safety screening.' }
  ]);
  const [customKPIs, setCustomKPIs] = useState<any[]>([
    { id: 'KPI-101', staffId: 'STF-01', kpiName: 'SLA dispute response under 15 mins', val: '95%', period: 'Quarterly', state: 'Active' },
    { id: 'KPI-102', staffId: 'STF-04', kpiName: 'Total field fraud inspections accuracy', val: '98%', period: 'Annual', state: 'Active' }
  ]);
  const [enrolledTrainings, setEnrolledTrainings] = useState<any[]>([
    { staffId: 'STF-01', courseName: 'CBK Escrow Compliance Certification', targetDate: '2026-09-30' },
    { staffId: 'STF-06', courseName: 'Advanced Threat & SIM Swap Assessment', targetDate: '2026-08-15' }
  ]);

  // Error modal / permission block overlay state
  const [rbacError, setRbacError] = useState<{ targetDept: string; allowedRoles: string[] } | null>(null);

  // Form input states for dispatch & create
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketCustomer, setNewTicketCustomer] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Payment Recipient Validation');
  const [newTicketUrgency, setNewTicketUrgency] = useState<'Medium' | 'High' | 'Critical'>('Medium');
  const [newTicketAmount, setNewTicketAmount] = useState('4500');
  const [newTicketTransactionId, setNewTicketTransactionId] = useState('BS-KSH-8942');

  const [newFieldMerchant, setNewFieldMerchant] = useState('');
  const [newFieldLocation, setNewFieldLocation] = useState('');
  const [newFieldTask, setNewFieldTask] = useState('Physical Address Verification');
  const [selectedFieldOfficerToAssign, setSelectedFieldOfficerToAssign] = useState('Ken Bwire');

  // Case investigation active ticket and workspace panel inputs
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // Case report form states
  const [caseSummaryInput, setCaseSummaryInput] = useState('');
  const [buyerInput, setBuyerInput] = useState('');
  const [sellerInput, setSellerInput] = useState('');
  const [courierInput, setCourierInput] = useState('');
  const [pickerInput, setPickerInput] = useState('');
  const [evidenceChecked, setEvidenceChecked] = useState<string[]>([]);
  const [findingsInput, setFindingsInput] = useState('');
  const [recommendationSelect, setRecommendationSelect] = useState<'Release Funds to Seller' | 'Refund Buyer' | 'Partial Refund' | 'Courier Compensation' | 'Reject Claim' | 'Escalate to Fraud Team' | 'Escalate to Field Operations' | ''>('');

  // Supervisor decision inputs
  const [outcomeSelect, setOutcomeSelect] = useState<'Approve Recommendation' | 'Modify Recommendation' | 'Return for More Information' | 'Escalate to CRM Manager' | 'Escalate to Finance' | 'Escalate to Fraud Review' | ''>('');
  const [justificationInput, setJustificationInput] = useState('');
  const [financialActionSelect, setFinancialActionSelect] = useState<'Release Escrow' | 'Full Refund' | 'Partial Refund' | 'Split Settlement' | 'Hold Funds' | 'Fraud Investigation Hold' | 'None' | ''>('');

  // Timeline inputs
  const [chatMessageText, setChatMessageText] = useState('');
  const [appealNotesInput, setAppealNotesInput] = useState('');

  // Watch for active ticket switch to pre-populate inputs live
  useEffect(() => {
    if (selectedTicket) {
      setCaseSummaryInput(selectedTicket.report?.caseSummary || selectedTicket.message || '');
      setBuyerInput(selectedTicket.report?.partiesInvolved?.buyer || selectedTicket.customer || '');
      setSellerInput(selectedTicket.report?.partiesInvolved?.seller || 'Jumia Vendor West');
      setCourierInput(selectedTicket.report?.partiesInvolved?.courier || 'Rider Joseph');
      setPickerInput(selectedTicket.report?.partiesInvolved?.picker || 'N/A');
      setEvidenceChecked(selectedTicket.report?.evidenceReviewed || []);
      setFindingsInput(selectedTicket.report?.findings || '');
      setRecommendationSelect(selectedTicket.report?.recommendation || '');

      setOutcomeSelect(selectedTicket.decision?.outcome || '');
      setJustificationInput(selectedTicket.decision?.justification || '');
      setFinancialActionSelect(selectedTicket.decision?.financialAction || '');
    }
  }, [selectedTicketId, tickets]);

  // Field Operations multi-stage workspace states
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedFieldAssignment = fieldAssignments.find(f => f.id === selectedFieldId) || null;
  const [fieldSubDashboardTab, setFieldSubDashboardTab] = useState<'ASSIGNMENTS' | 'INVESTIGATIONS' | 'REPORTS' | 'APPROVAL_QUEUE'>('ASSIGNMENTS');
  
  // Field Form states
  const [fieldVisitDate, setFieldVisitDate] = useState('');
  const [fieldVisitTime, setFieldVisitTime] = useState('');
  const [fieldContactPerson, setFieldContactPerson] = useState('');
  const [fieldGpsCoordinates, setFieldGpsCoordinates] = useState('');
  const [fieldFindings, setFieldFindings] = useState('');
  const [fieldRiskAssessment, setFieldRiskAssessment] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
  const [fieldRecommendation, setFieldRecommendation] = useState('Approve Merchant');
  const [fieldPartiesInterviewed, setFieldPartiesInterviewed] = useState({
    merchant: false,
    buyer: false,
    courier: false,
    witness: false
  });
  const [fieldSupervisorNotes, setFieldSupervisorNotes] = useState('');
  const [fieldSupervisorAction, setFieldSupervisorAction] = useState<'APPROVE' | 'REQUEST_INFO' | 'ESCALATE_CRITICAL' | 'ESCALATE_FRAUD' | ''>('');
  const [fieldOverrideRecommendation, setFieldOverrideRecommendation] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const [docInput, setDocInput] = useState('');

  // Watch selected field assignment to pre-populate inputs on selection
  useEffect(() => {
    if (selectedFieldAssignment) {
      setFieldVisitDate(selectedFieldAssignment.visitDate || '');
      setFieldVisitTime(selectedFieldAssignment.visitTime || '');
      setFieldContactPerson(selectedFieldAssignment.contactPerson || '');
      setFieldGpsCoordinates(selectedFieldAssignment.gpsCoordinates || '');
      setFieldFindings(selectedFieldAssignment.findings || '');
      setFieldRiskAssessment((selectedFieldAssignment.riskAssessment as any) || 'Low');
      setFieldRecommendation(selectedFieldAssignment.recommendation || 'Approve Merchant');
      setFieldPartiesInterviewed(selectedFieldAssignment.partiesInterviewed || {
        merchant: false,
        buyer: false,
        courier: false,
        witness: false
      });
      setFieldSupervisorNotes(selectedFieldAssignment.supervisorNotes || '');
      setFieldOverrideRecommendation(selectedFieldAssignment.modifiedRecommendation || '');
    }
  }, [selectedFieldId, fieldAssignments]);

  // Fetch all operations datasets from the server
  const fetchOperationsData = async () => {
    setIsSyncing(true);
    try {
      const [
        ticketsRes, fieldRes, leavesRes, staffRes, logsRes,
        reconRes, pspRes, commRes, settleRes, leakRes, refundRes, auditRes,
        vacRes, succRes, statsRes
      ] = await Promise.all([
        fetch('/api/admin/crm/tickets'),
        fetch('/api/admin/field/assignments'),
        fetch('/api/admin/hr/leaves'),
        fetch('/api/admin/hr/staff'),
        fetch('/api/admin/logs'),
        // Finance APIs
        fetch('/api/admin/finance/reconciliations'),
        fetch('/api/admin/finance/psp-reconciliations'),
        fetch('/api/admin/finance/commissions'),
        fetch('/api/admin/finance/settlements'),
        fetch('/api/admin/finance/revenue-assurance'),
        fetch('/api/admin/finance/refunds'),
        fetch('/api/admin/finance/audits'),
        // HR APIs
        fetch('/api/admin/hr/vacancies'),
        fetch('/api/admin/hr/succession'),
        // Stats API
        fetch('/api/admin/finance/stats')
      ]);

      if (ticketsRes.ok) setTickets(await ticketsRes.json());
      if (fieldRes.ok) setFieldAssignments(await fieldRes.json());
      if (leavesRes.ok) setLeaves(await leavesRes.json());
      if (staffRes.ok) setStaff(await staffRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      
      // Finance States
      if (reconRes.ok) setReconciliations(await reconRes.json());
      if (pspRes.ok) setPspRecons(await pspRes.json());
      if (commRes.ok) setCommVerifs(await commRes.json());
      if (settleRes.ok) setSettlements(await settleRes.json());
      if (leakRes.ok) setRevenueLeakages(await leakRes.json());
      if (refundRes.ok) setRefundReviews(await refundRes.json());
      if (auditRes.ok) setAuditCases(await auditRes.json());
      if (statsRes.ok) setFinanceStats(await statsRes.json());

      // HR States
      if (vacRes.ok) setVacancies(await vacRes.json());
      if (succRes.ok) setSuccessionPlan(await succRes.json());
    } catch (e) {
      console.error('Failed to sync Ops datasets', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  // Log administrative audit action to immutable ledger
  const triggerLogWrite = async (action: string, prevVal: string, newVal: string) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentStaff.name,
          role: currentStaff.roleKey,
          action,
          previousValue: prevVal,
          newValue: newVal
        })
      });
      // reload
      const logsRes = await fetch('/api/admin/logs');
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      console.error('Audit trail write failure', err);
    }
  };

  const assignTicket = (ticketId: string) => {
    const userStr = adminLevel === 1 ? 'SysAdmin-01' : adminLevel === 2 ? 'SysAdmin-02' : adminLevel === 3 ? 'SecAdmin-Alpha' : adminLevel === 4 ? 'InfraSupervisor' : 'HeadOfTech';
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const now = new Date().toISOString();
        const newTimeline = [...(t.timeline || [])];
        newTimeline.push({
          timestamp: now,
          action: 'Assigned to ' + userStr,
          user: userStr,
          details: 'Self-assigned via administrative dashboard'
        });
        return {
          ...t,
          assignedUser: userStr,
          status: t.status === 'NEW' ? 'ASSIGNED' : t.status,
          timeline: newTimeline
        };
      }
      return t;
    }));
    triggerLogWrite("Assigned support ticket", ticketId, `Assigned to ${userStr}`);
  };

  const reassignTicket = (ticketId: string, assignee: string) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const now = new Date().toISOString();
        const userStr = adminLevel === 1 ? 'SysAdmin-01' : adminLevel === 2 ? 'SysAdmin-02' : adminLevel === 3 ? 'SecAdmin-Alpha' : adminLevel === 4 ? 'InfraSupervisor' : 'HeadOfTech';
        const newTimeline = [...(t.timeline || [])];
        newTimeline.push({
          timestamp: now,
          action: `Ticket Reassigned to ${assignee}`,
          user: userStr,
          details: `Reassigned from ${t.assignedUser || 'None'}`
        });
        return {
          ...t,
          assignedUser: assignee,
          timeline: newTimeline
        };
      }
      return t;
    }));
    triggerLogWrite("Reassigned support ticket user", ticketId, `Moved to ${assignee}`);
  };

  const escalateTicket = (ticketId: string) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const now = new Date().toISOString();
        const userStr = adminLevel === 1 ? 'SysAdmin-01' : adminLevel === 2 ? 'SysAdmin-02' : adminLevel === 3 ? 'SecAdmin-Alpha' : adminLevel === 4 ? 'InfraSupervisor' : 'HeadOfTech';
        const nextLevel = Math.min(5, t.levelAssigned + 1);
        const nextUrgency = t.urgency === 'Low' ? 'Medium' : t.urgency === 'Medium' ? 'High' : 'Critical';
        const newTimeline = [...(t.timeline || [])];
        newTimeline.push({
          timestamp: now,
          action: 'Ticket Escalated and Level Shifted',
          user: userStr,
          details: `Escalated from L${t.levelAssigned} (${t.urgency}) to L${nextLevel} (${nextUrgency})`
        });
        return {
          ...t,
          levelAssigned: nextLevel,
          urgency: nextUrgency,
          timeline: newTimeline
        };
      }
      return t;
    }));
    triggerLogWrite("Escalated support ticket clearance", ticketId, `Clearance Level Shifted`);
  };

  const approveResolution = (ticketId: string) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const now = new Date().toISOString();
        const userStr = adminLevel === 3 ? 'SecAdmin-Supervisor' : adminLevel === 4 ? 'InfraSupervisor' : 'HeadOfTech-COO';
        const newTimeline = [...(t.timeline || [])];
        newTimeline.push({
          timestamp: now,
          action: 'Resolution Approved',
          user: userStr,
          details: 'Supervisor approved audit credentials.'
        });
        return {
          ...t,
          status: 'RESOLVED',
          timeline: newTimeline
        };
      }
      return t;
    }));
    triggerLogWrite("Approved incident resolution", ticketId, "Status becomes RESOLVED");
  };

  const setTicketsQueryNotes = (ticketId: string) => {
    const feedback = prompt("Enter additional feedback / information required:");
    if (!feedback) return;
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const now = new Date().toISOString();
        const userStr = adminLevel === 3 ? 'SecAdmin-Supervisor' : adminLevel === 4 ? 'InfraSupervisor' : 'HeadOfTech-COO';
        const newTimeline = [...(t.timeline || [])];
        newTimeline.push({
          timestamp: now,
          action: 'Returned for Information',
          user: userStr,
          details: `Supervisor review feedback: ${feedback}`
        });
        return {
          ...t,
          status: 'INVESTIGATING',
          requestRecipient: 'Infrastructure Team',
          informationRequired: feedback,
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          timeline: newTimeline
        };
      }
      return t;
    }));
    triggerLogWrite("Returned ticket for info", ticketId, `Feedback: ${feedback}`);
  };

  // Safe tab switcher that enforces RBAC and logs violations
  const tryNavigateToTab = (dept: 'CRM' | 'FIELD' | 'FINANCE' | 'HR' | 'SYS_LOGS' | 'BI') => {
    const permissions: Record<string, string[]> = {
      CRM: ['CRM_AGENT', 'CRM_SUPERVISOR', 'CRM_MANAGER', 'CHIEF_OPERATING_OFFICER'],
      FIELD: ['FIELD_AGENT', 'SENIOR_FIELD_AGENT', 'FIELD_SUPERVISOR', 'FIELD_MANAGER', 'CHIEF_OPERATING_OFFICER'],
      FINANCE: ['FINANCE_OFFICER', 'FINANCE_ANALYST', 'RECON_OFFICER', 'FINANCE_SUPERVISOR', 'FINANCE_MANAGER', 'INTERNAL_AUDITOR', 'HEAD_OF_FINANCE', 'CHIEF_OPERATING_OFFICER'],
      HR: ['HR_OFFICER', 'HR_BP', 'HR_SUPERVISOR', 'HR_MANAGER', 'CHIEF_OPERATING_OFFICER'],
      SYS_LOGS: ['SYSTEM_ADMIN', 'CHIEF_OPERATING_OFFICER'],
      BI: [
        'CRM_AGENT', 'CRM_SUPERVISOR', 'CRM_MANAGER',
        'FIELD_AGENT', 'SENIOR_FIELD_AGENT', 'FIELD_SUPERVISOR', 'FIELD_MANAGER',
        'FINANCE_OFFICER', 'FINANCE_ANALYST', 'RECON_OFFICER', 'FINANCE_SUPERVISOR', 'FINANCE_MANAGER', 'INTERNAL_AUDITOR', 'HEAD_OF_FINANCE',
        'HR_OFFICER', 'HR_BP', 'HR_SUPERVISOR', 'HR_MANAGER',
        'SYSTEM_ADMIN', 'BI_ANALYST', 'CHIEF_OPERATING_OFFICER'
      ]
    };

    const allowed = permissions[dept];
    if (allowed.includes(currentStaff.roleKey)) {
      setRbacError(null);
      setActiveTab(dept);
    } else {
      // Access Denied! Record violation attempt to immutable logs
      const deptLabels: Record<string, string> = {
        CRM: 'Customer Relations Management',
        FIELD: 'Field Inspections & Verification',
        FINANCE: 'Escrow Settlements Ledger',
        HR: 'HR & Employee payroll records',
        SYS_LOGS: 'Immutable System audit logs',
        BI: 'Executive analytics Dashboard'
      };

      triggerLogWrite(
        `🔴 SECURITY ALERT: Prevented unauthorized area access attempt by ${currentStaff.name}`,
        `Current Location: ${activeTab}`,
        `Attempted unauthorized bypass to: ${deptLabels[dept]} Area`
      );

      setRbacError({
        targetDept: deptLabels[dept],
        allowedRoles: allowed.map(r => r.replace('_', ' '))
      });
    }
  };

  // Close RBAC error toast/panel
  const clearRbacError = () => setRbacError(null);

  // CRM Ticket creation
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketMessage || !newTicketCustomer) return;

    try {
      const res = await fetch('/api/admin/crm/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: newTicketCustomer,
          category: newTicketCategory,
          urgency: newTicketUrgency,
          message: newTicketMessage,
          amount: parseFloat(newTicketAmount) || 0,
          transactionId: newTicketTransactionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(prev => [data, ...prev]);
        setNewTicketCustomer('');
        setNewTicketMessage('');
        triggerLogWrite(
          `Logged new customer ticket ${data.id} for ${newTicketCustomer}`,
          'N/A',
          `Ticket Subject: ${newTicketCategory} [Urgency: ${newTicketUrgency}]`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRM Ticket Status update
  const handleUpdateStatus = async (id: string, newStatus: string, remarksInput?: string) => {
    try {
      const remarks = remarksInput || `Status transitioned to ${newStatus}`;
      const res = await fetch(`/api/admin/crm/tickets/${id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          remarks,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
        triggerLogWrite(
          `Transitioned case ${id} to status ${newStatus}`,
          `Previous state: ${selectedTicket?.status || 'N/A'}`,
          `New state: ${newStatus} (Logged in case timeline)`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit case investigation finding report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!recommendationSelect) {
      alert('Please select a recommended outcome recommendation before escalating!');
      return;
    }

    const reportPayload = {
      caseSummary: caseSummaryInput,
      partiesInvolved: {
        buyer: buyerInput,
        seller: sellerInput,
        courier: courierInput,
        picker: pickerInput
      },
      evidenceReviewed: evidenceChecked,
      findings: findingsInput,
      recommendation: recommendationSelect
    };

    try {
      const res = await fetch(`/api/admin/crm/tickets/${selectedTicket.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: reportPayload,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        triggerLogWrite(
          `Case report submitted for ${selectedTicket.id}`,
          'Report: Pending',
          `Recommendation: ${recommendationSelect}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit supervisor/manager decision outcome details
  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!outcomeSelect) {
      alert('Please select a decision outcome!');
      return;
    }
    if (!justificationInput.trim()) {
      alert('A decision justification is mandatory. Comments must be entered to record a decision workflow!');
      return;
    }

    // Role-based authority Matrix validation checking
    const amount = selectedTicket.amount || 0;
    const isHighValue = amount > 10000;
    
    if (outcomeSelect === 'Approve Recommendation' || outcomeSelect === 'Modify Recommendation') {
      if (financialActionSelect !== 'None' && financialActionSelect !== 'Hold Funds' && financialActionSelect !== 'Fraud Investigation Hold') {
        if (isHighValue && currentStaff.roleKey === 'CRM_SUPERVISOR') {
          alert(`CRITICAL VIOLATION: Dispute involving Ksh ${amount.toLocaleString()} is classified as a HIGH-VALUE transaction. Releasing escrow or refunds above Ksh 10,000 exceeds standard CRM Supervisor authorization limit. Manager or COO override credential access required!`);
          return;
        }
      }
    }

    // Original decision maker appeals constraint loop checking
    if (selectedTicket.status === 'APPEAL_PENDING') {
      if (selectedTicket.originalDecisionBy === currentStaff.name) {
        alert(`CRITICAL COMPLIANCE LOCK: CRM Supervisor ${currentStaff.name} is forbidden from reviewing this appeal. The original decision maker cannot self-approve their own appeal. Please switch session to CRM Manager or COO to proceed!`);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/crm/tickets/${selectedTicket.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome: outcomeSelect,
          justification: justificationInput,
          financialAction: financialActionSelect,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        onRefresh();
        triggerLogWrite(
          `Approved final decision for ${selectedTicket.id}`,
          `outcome: Pending`,
          `supervisor decision: ${outcomeSelect} & payout settlement: ${financialActionSelect}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add communication text log line
  const handleAddCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !chatMessageText.trim()) return;

    try {
      const res = await fetch(`/api/admin/crm/tickets/${selectedTicket.id}/communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentStaff.name,
          role: currentStaff.roleKey,
          text: chatMessageText
        })
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        setChatMessageText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // File formal appeal
  const handleFileAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !appealNotesInput.trim()) return;

    try {
      const res = await fetch(`/api/admin/crm/tickets/${selectedTicket.id}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentStaff.name,
          role: currentStaff.roleKey,
          notes: appealNotesInput
        })
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        setAppealNotesInput('');
        triggerLogWrite(
          `Logged decision Appeal for dispute ${selectedTicket.id}`,
          `Status: CLOSED`,
          'Status: APPEAL_PENDING (Assigned to CRM Manager)'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Field Assignment creation
  const handleCreateFieldAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldMerchant || !newFieldLocation) return;

    try {
      const res = await fetch('/api/admin/field/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName: newFieldMerchant,
          location: newFieldLocation,
          task: newFieldTask,
          assignedTo: selectedFieldOfficerToAssign,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFieldAssignments(prev => [data, ...prev]);
        setNewFieldMerchant('');
        setNewFieldLocation('');
        triggerLogWrite(
          `Created field verification job ${data.id} for ${newFieldMerchant}`,
          'Unverified Status',
          `Verification Job: ${newFieldTask} assigned to ${selectedFieldOfficerToAssign}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pay verification fee
  const handlePayFieldCharge = async (id: string, merchantName: string) => {
    try {
      const res = await fetch(`/api/admin/field/assignments/${id}/pay-charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentStaff.name, role: currentStaff.roleKey })
      });
      if (res.ok) {
        const updated = await res.json();
        setFieldAssignments(prev => prev.map(a => a.id === id ? updated : a));
        triggerLogWrite(
          `Safaricom Daraja webhook verified verification fee paid for ${merchantName}`,
          'Verification Invoice Status: UNPAID',
          'Verification Invoice Status: PAID (Ready for field officer)'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Schedule visit
  const handleScheduleInspection = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!fieldVisitDate || !fieldVisitTime || !fieldContactPerson) {
      alert("All visit information fields are mandatory");
      return;
    }

    const allowedRoles = ['FIELD_AGENT', 'SENIOR_FIELD_AGENT', 'FIELD_SUPERVISOR', 'FIELD_MANAGER', 'CHIEF_OPERATING_OFFICER'];
    if (!allowedRoles.includes(currentStaff.roleKey)) {
      alert(`COMPLIANCE BLOCK: Role ${currentStaff.role} (${currentStaff.roleKey}) cannot schedule or conduct visits under Field Operations matrix. Please switch role to Field Agent, Senior Agent, Supervisor, or COO.`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/field/assignments/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitDate: fieldVisitDate,
          visitTime: fieldVisitTime,
          contactPerson: fieldContactPerson,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setFieldAssignments(prev => prev.map(a => a.id === id ? updated : a));
        triggerLogWrite(
          `Scheduled field audit dispatch for ${updated.merchantName}`,
          'Case Status: NEW_ASSIGNMENT',
          `Case Status: INVESTIGATION_SCHEDULED (Contact: ${fieldContactPerson})`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Log Arrival (In field)
  const handleLogArrival = async (id: string) => {
    const defaultGps = "-1.2921 S, 36.8219 E";
    const gpsInput = prompt("Confirm current GPS Lat/Long coordinates:", fieldGpsCoordinates || defaultGps);
    if (gpsInput === null) return;

    const allowedRoles = ['FIELD_AGENT', 'SENIOR_FIELD_AGENT', 'FIELD_SUPERVISOR', 'FIELD_MANAGER', 'CHIEF_OPERATING_OFFICER'];
    if (!allowedRoles.includes(currentStaff.roleKey)) {
      alert(`COMPLIANCE BLOCK: Role ${currentStaff.role} cannot conduct visits under Field Operations matrix. Switch to Field Specialist.`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/field/assignments/${id}/in-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpsCoordinates: gpsInput || defaultGps,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setFieldAssignments(prev => prev.map(a => a.id === id ? updated : a));
        triggerLogWrite(
          `Logged Field Arrival & Verified GPS for ${updated.merchantName}`,
          'Case Status: INVESTIGATION_SCHEDULED',
          `Case Status: IN_FIELD (GPS Checked: ${gpsInput || defaultGps})`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add evidence to assignment
  const handleUploadEvidence = async (id: string, type: 'photos' | 'videos' | 'documents') => {
    let promptMsg = `Enter photo URL path to attach: (e.g. https://images.unsplash.com/photo-1542838132-92c53300491e)`;
    if (type === 'videos') promptMsg = 'Enter video URL or asset name:';
    if (type === 'documents') promptMsg = 'Enter document PDF / permit name:';

    const fileInput = prompt(promptMsg);
    if (!fileInput) return;

    const allowedRoles = ['FIELD_AGENT', 'SENIOR_FIELD_AGENT', 'FIELD_SUPERVISOR', 'FIELD_MANAGER', 'CHIEF_OPERATING_OFFICER'];
    if (!allowedRoles.includes(currentStaff.roleKey)) {
      alert(`COMPLIANCE BLOCK: Role ${currentStaff.role} cannot upload audit findings.`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/field/assignments/${id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: fileInput,
          type,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setFieldAssignments(prev => prev.map(a => a.id === id ? updated : a));
        triggerLogWrite(
          `Evidence uploaded to Field Assignment ${id}`,
          'Status: IN_FIELD',
          `Status: EVIDENCE_COLLECTION (Attached: ${fileInput})`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit mandatory report details
  const handleSubmitFieldReport = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!fieldFindings.trim()) {
      alert("Mandatory reporter findings cannot be empty.");
      return;
    }

    const allowedRoles = ['FIELD_AGENT', 'SENIOR_FIELD_AGENT', 'FIELD_SUPERVISOR', 'FIELD_MANAGER', 'CHIEF_OPERATING_OFFICER'];
    if (!allowedRoles.includes(currentStaff.roleKey)) {
      alert(`COMPLIANCE BLOCK: Role ${currentStaff.role} cannot submit operational audit reports.`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/field/assignments/${id}/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findings: fieldFindings,
          riskAssessment: fieldRiskAssessment,
          recommendation: fieldRecommendation,
          partiesInterviewed: fieldPartiesInterviewed,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setFieldAssignments(prev => prev.map(a => a.id === id ? updated : a));
        triggerLogWrite(
          `Submitted Field Investigation Report for ${updated.merchantName}`,
          'Status: EVIDENCE_COLLECTION',
          `Status: REPORT_SUBMITTED (Recommended: ${fieldRecommendation})`
        );
        alert("Investigation Report successfully compiled & submitted to supervisor!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Supervisor Adjudication
  const handleAdjudicateFieldAssignment = async (id: string, action: 'APPROVE' | 'REQUEST_INFO' | 'ESCALATE_CRITICAL' | 'ESCALATE_FRAUD') => {
    const supervisorRoles = ['FIELD_SUPERVISOR', 'FIELD_MANAGER', 'CHIEF_OPERATING_OFFICER', 'CRM_MANAGER'];
    if (!supervisorRoles.includes(currentStaff.roleKey)) {
      alert(`COMPLIANCE BLOCK: Only Field Supervisors (Alice Koech) or Managers (John Kamau, Silas Mugo) can adjudicate/approve reports. Your role is ${currentStaff.role}.`);
      return;
    }

    if (fieldOverrideRecommendation && currentStaff.roleKey !== 'FIELD_MANAGER' && currentStaff.roleKey !== 'CHIEF_OPERATING_OFFICER') {
      alert(`COMPLIANCE BLOCK: Under matrix protocol, only a Field Operations Manager or COO can OVERRIDE agent recommendations. Field Supervisors cannot override; please clear the override input or switch sessions.`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/field/assignments/${id}/adjudicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          overrideRecommendation: fieldOverrideRecommendation,
          supervisorNotes: fieldSupervisorNotes,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setFieldAssignments(prev => prev.map(a => a.id === id ? updated : a));
        triggerLogWrite(
          `Adjudicated field assignment ${id} as ${action}`,
          'Status: REPORT_SUBMITTED',
          `Status: ${updated.status}`
        );
        alert(`Successfully finalized case action: ${action}`);
        fetchOperationsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // HR leave approval
  const handleLeaveAction = async (id: string, staffMember: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/hr/leaves/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
        triggerLogWrite(
          `Updated Leave ID ${id} calendar status for ${staffMember}`,
          'Leave state: PENDING',
          `Leave state: ${action}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 0. Automation Engines and Simulation Triggers
  const handleSimulateTransactions = async () => {
    try {
      const res = await fetch('/api/admin/finance/simulate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setFinanceStats(data.stats);
        setReconciliations(prev => [data.addedException, ...prev]);
        alert(`SUCCESSFUL SCALING: Streamed +10,000 transactions instantly (99.88% Auto-Pilot match). Detected 12 exceptions. Loaded exceptional item ${data.addedException.id} into the live Queue!`);
        fetchOperationsData();
        triggerLogWrite(`Finance Bulk Simulation`, `Processed +10,000 transactions`, `Auto-reconciled: 9,988 | Exceptions: 12`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAuditSample = async (rate: number) => {
    try {
      const res = await fetch('/api/admin/finance/run-audit-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate })
      });
      if (res.ok) {
        const data = await res.json();
        setFinanceStats(prev => ({
          ...prev,
          lastAuditRun: new Date().toISOString(),
          auditSampleRate: rate,
          auditRandomSamples: data.samples
        }));
        alert(`INTEGRITY AUDIT RUN: Randomly sampled ${rate}% of auto-reconciled transactions. See the lower panel for detailed ledger check traces!`);
        fetchOperationsData();
        triggerLogWrite(`Finance Integrity Sampling Verification`, `Sampled ${rate}% of auto-bypassed transactions`, `Confirmed 100% ledger coherence integrity`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunRevenueScan = async () => {
    try {
      const res = await fetch('/api/admin/finance/run-revenue-scan', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRevenueLeakages(prev => [data.addedAssurance, ...prev]);
        alert(`REVENUE LEAKAGE SWEEP: Checked transactions structures. Discovered commission bypass in referral splitting. Logged ticket ${data.addedAssurance.id} as active Revenue Assurance Exception.`);
        fetchOperationsData();
        triggerLogWrite(`Revenue Assurance Engine Scan`, `Discovered commission discrepancy`, `Ticket auto-registered: ${data.addedAssurance.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Escrow Reconciliation action
  const handleEscrowReconAction = async (id: string, action: 'RECONCILED' | 'VARIANCE_IDENTIFIED' | 'ESCALATED' | 'CLOSED', justification: string) => {
    const isSupervisor = ['FINANCE_SUPERVISOR', 'FINANCE_MANAGER', 'INTERNAL_AUDITOR', 'HEAD_OF_FINANCE', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);
    if (!isSupervisor && (action === 'RECONCILED' || action === 'CLOSED')) {
      alert(`COMPLIANCE BLOCK: Financial role "${currentStaff.role}" cannot approve/close reconciliations. Please escalate or switch user to Finance Supervisor/Manager to authorize.`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/finance/reconciliations/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          user: currentStaff.name,
          role: currentStaff.roleKey,
          justification: justification || 'Reviewed ledger records.'
        })
      });
      if (res.ok) {
        alert(`Escrow reconciliation updated successfully to: ${action}`);
        fetchOperationsData();
        triggerLogWrite(`Finance Escrow Reconciliation`, `Pending action on #${id}`, `Status updated to ${action} by ${currentStaff.name}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. PSP action
  const handlePspReconAction = async (id: string, action: 'MATCHED' | 'UNMATCHED' | 'ESCALATED', justification: boolean | string) => {
    try {
      const res = await fetch(`/api/admin/finance/psp-reconciliations/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          user: currentStaff.name,
          role: currentStaff.roleKey,
          justification: typeof justification === 'string' ? justification : 'Processed PSP gateway audit.'
        })
      });
      if (res.ok) {
        alert(`PSP Gateway state updated successfully to: ${action}`);
        fetchOperationsData();
        triggerLogWrite(`PSP Reconciliation Action`, `Gate Reconciliation #${id}`, `Updated to ${action}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Commission verification
  const handleCommissionAction = async (id: string, status: 'VALIDATED' | 'ANOMALY_FLAGGED', remarks: string) => {
    try {
      const res = await fetch(`/api/admin/finance/commissions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, user: currentStaff.name, role: currentStaff.roleKey, remarks })
      });
      if (res.ok) {
        alert(`Commission status updated successfully to: ${status}`);
        fetchOperationsData();
        triggerLogWrite(`Commission Verification Action`, `Commission Ledger #${id}`, `Status updated to ${status}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Settlement approval action
  const handleSettlementAction = async (id: string, action: 'APPROVED' | 'HOLD' | 'REJECTED' | 'ESCALATED_INVESTIGATION', amount: number, justification: string) => {
    const isSupervisor = ['FINANCE_SUPERVISOR', 'FINANCE_MANAGER', 'INTERNAL_AUDITOR', 'HEAD_OF_FINANCE', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);
    const isManager = ['FINANCE_MANAGER', 'INTERNAL_AUDITOR', 'HEAD_OF_FINANCE', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);

    if (action === 'APPROVED') {
      if (!isSupervisor) {
        alert(`COMPLIANCE BLOCK: Financial role "${currentStaff.role}" cannot approve settlements. Please switch roles to Finance Supervisor or Manager.`);
        return;
      }
      if (amount >= 10000 && !isManager) {
        alert(`COMPLIANCE BLOCK: Large settlements (amount >= Ksh 10,000) require Finance Manager approval. Please switch roles to Finance Manager or higher.`);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/finance/settlements/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, user: currentStaff.name, role: currentStaff.roleKey, justification })
      });
      if (res.ok) {
        alert(`Settlement instruction #${id} updated to: ${action}`);
        fetchOperationsData();
        triggerLogWrite(`Settlement Approval action`, `Settlement #${id}`, `Status updated to ${action}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Revenue Assurance action
  const handleRevenueAssuranceAction = async (id: string, action: 'UNDER_INVESTIGATION' | 'CORRECTED_JUSTIFIED', remarks: string, actionTaken?: string) => {
    try {
      const res = await fetch(`/api/admin/finance/revenue-assurance/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, user: currentStaff.name, role: currentStaff.roleKey, remarks, actionTaken })
      });
      if (res.ok) {
        alert(`Revenue assurance item action updated!`);
        fetchOperationsData();
        triggerLogWrite(`Revenue Assurance Action`, `Assurance Code #${id}`, `State updated to ${action}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Refund Review Action
  const handleRefundReviewAction = async (id: string, action: 'APPROVED' | 'REJECTED' | 'ESCALATE', justification: string) => {
    try {
      const res = await fetch(`/api/admin/finance/refunds/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, user: currentStaff.name, role: currentStaff.roleKey, justification })
      });
      if (res.ok) {
        alert(`Refund request updated successfully to: ${action}`);
        fetchOperationsData();
        triggerLogWrite(`Refund Review Decision`, `Refund #${id}`, `Status: ${action}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Create Audit Folder
  const handleCreateAuditCase = async (title: string, category: string, assignedTo: string) => {
    const isSupervisor = ['FINANCE_SUPERVISOR', 'FINANCE_MANAGER', 'INTERNAL_AUDITOR', 'HEAD_OF_FINANCE', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);
    if (!isSupervisor) {
      alert(`COMPLIANCE BLOCK: High integrity audits can only be initiated by Supervisor tier or above. Your current role is ${currentStaff.role}.`);
      return;
    }

    try {
      const res = await fetch('/api/admin/finance/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, auditorName: currentStaff.name, assignedTo })
      });
      if (res.ok) {
        alert(`Audit dossier folders generated successfully.`);
        fetchOperationsData();
        triggerLogWrite(`Audit Dossier Initialized`, `N/A`, `Dossier Title: ${title}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Close / Update Audit Dossier
  const handleAuditCaseAction = async (id: string, action: 'OPEN_AUDIT' | 'UNDER_REMEDIATION' | 'CLOSED', findings: string, recommendations: string) => {
    const isManager = ['FINANCE_MANAGER', 'INTERNAL_AUDITOR', 'HEAD_OF_FINANCE', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);
    if (action === 'CLOSED' && !isManager) {
      alert(`COMPLIANCE BLOCK: Audit cases can only be closed by Internal Auditor, Finance Manager or COO clearance tiers.`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/finance/audits/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, findings, recommendations, user: currentStaff.name, role: currentStaff.roleKey })
      });
      if (res.ok) {
        alert(`Audit File updated successfully.`);
        fetchOperationsData();
        triggerLogWrite(`Audit Case status change`, `Audit #${id}`, `State: ${action}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Create a dynamic recruitment vacancy opening
  const handleCreateVacancy = async (title: string, department: string, description: string) => {
    try {
      const res = await fetch('/api/admin/hr/vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department,
          description,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        alert(`Hiring vacancy requisition registered successfully.`);
        fetchOperationsData();
        triggerLogWrite(`HR Vacancy Created`, `Title: ${title}`, `Registered in: ${department}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Advance recruitment vacancy status
  const handleVacancyStatusChange = async (id: string, status: 'CREATED' | 'PUBLISHED' | 'CLOSED', logsText?: string) => {
    try {
      const res = await fetch(`/api/admin/hr/vacancies/${id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          user: currentStaff.name,
          role: currentStaff.roleKey,
          logsText: logsText || `Vacancy status updated to ${status} by ${currentStaff.name}`
        })
      });
      if (res.ok) {
        alert(`Vacancy workflow state updated to: ${status}`);
        fetchOperationsData();
        triggerLogWrite(`HR Vacancy Status Update`, `Vacancy #${id}`, `Advanced to: ${status}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Advance Candidate status
  const handleCandidateStatusChange = async (id: string, email: string, status: 'SCREENED' | 'INTERVIEWED' | 'HIRED', score: number) => {
    try {
      const res = await fetch(`/api/admin/hr/vacancies/${id}/candidates/${email}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          score,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        alert(`Candidate status updated successfully to: ${status}`);
        fetchOperationsData();
        triggerLogWrite(`HR Candidate Stage Advance`, `${email}`, `Status: ${status} | Compliance Score: ${score}%`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. File performance KPI Review for Staff
  const handleStaffPerformance = async (staffId: string, period: string, kpiScore: number, evaluation: string, managerRemarks: string) => {
    try {
      const res = await fetch('/api/admin/hr/staff/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          period,
          kpiScore,
          evaluation,
          managerRemarks
        })
      });
      if (res.ok) {
        alert(`Official employee performance index updated.`);
        fetchOperationsData();
        triggerLogWrite(`HR Performance Evaluation Logged`, `Employee ID: ${staffId}`, `KPI Score: ${kpiScore}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. File critical disciplinary incident cases
  const handleStaffDisciplinary = async (staffId: string, description: string, status: string, outcome: string, notes: string) => {
    try {
      const res = await fetch('/api/admin/hr/staff/disciplinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          description,
          status,
          outcome,
          notes,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        alert(`Disciplinary incident ledger written successfully.`);
        fetchOperationsData();
        triggerLogWrite(`HR Disciplinary Record Added`, `Employee ID: ${staffId}`, `Incident: ${description}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Complete separations / offboarding checklist
  const handleStaffSeparation = async (
    id: string,
    type: string,
    equipmentReturned: boolean,
    accessRemoved: boolean,
    finalSettlementDone: boolean,
    knowledgeTransferred: boolean
  ) => {
    try {
      const res = await fetch(`/api/admin/hr/staff/${id}/separation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          equipmentReturned,
          accessRemoved,
          finalSettlementDone,
          knowledgeTransferred
        })
      });
      if (res.ok) {
        alert(`Separation & Access Revocation check completed.`);
        fetchOperationsData();
        triggerLogWrite(`HR Exit Separation Ledger Written`, `Employee ID: ${id}`, `Type: ${type}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Distribute awards, bonuses, and rewards
  const handleStaffReward = async (staffId: string, title: string, bonusAmount: number, justification: string) => {
    try {
      const res = await fetch('/api/admin/hr/staff/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          title,
          bonusAmount,
          justification,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        alert(`Employee reward / bonus disbursed successfully.`);
        fetchOperationsData();
        triggerLogWrite(`HR Employee Incentivised`, `Employee ID: ${staffId}`, `Award: ${title}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compute calculated metrics for Finance department view
  const escrowSum = transactions.reduce((acc, t) => acc + (t.status === 'ESCROW_HELD' || t.status === 'ITEMS_SHIPPED' ? t.amount : 0), 0);
  const platformRevenues = transactions.reduce((acc, t) => acc + (t.status === 'FUNDS_RELEASED' ? (t.platformFee || 12) + (t.fee || 35) : 0), 0);
  const carrierPayouts = transactions.reduce((acc, t) => acc + (t.status === 'FUNDS_RELEASED' && t.shippingFee ? t.shippingFee * 0.85 : 0), 0);

  // CRM statistical metrics computation
  const agentAssignedCases = tickets.filter(t => t.status === 'UNDER_REVIEW' && t.assignedTo === currentStaff.name).length;
  const agentPendingResponses = tickets.filter(t => t.status === 'INFORMATION_REQUESTED' && t.assignedTo === currentStaff.name).length;
  const agentAwaitingInvestigation = tickets.filter(t => t.status === 'NEW' || t.status === 'INVESTIGATION_IN_PROGRESS').length;

  const supervisorAwaitingDecision = tickets.filter(t => t.status === 'AWAITING_SUPERVISOR_REVIEW' || t.status === 'SUPERVISOR_DECISION_PENDING').length;
  const supervisorEscalatorCount = tickets.filter(t => t.status === 'AWAITING_SUPERVISOR_REVIEW' && (t.urgency === 'Critical' || t.urgency === 'High')).length;
  const supervisorSlaBreaches = tickets.filter(t => (t.status === 'NEW' || t.status === 'UNDER_REVIEW') && t.urgency === 'Critical').length;
  const supervisorTeamPerformance = "96.4% Compliance (Agent Mike: 4.8★)";

  const managerHighValue = tickets.filter(t => t.amount && t.amount > 10000).length;
  const managerAppeals = tickets.filter(t => t.status === 'APPEAL_PENDING').length;
  const managerFraudTrends = "-4% decrease in M-Pesa fraud";
  const managerEscalations = tickets.filter(t => t.status === 'AWAITING_SUPERVISOR_REVIEW').length;

  return (
    <div id="admin-portal-box" className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      
      {/* 1. BRANDING & SECURITY CONTEXT HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/10 border border-red-500/30 rounded-xl">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Buy Safely Central Governance Platform</h3>
              <span className="text-[8px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Internal Layer Only</span>
            </div>
            <p className="text-[10px] text-slate-400">Strictly confidential. Protected under CBK Trust Sandbox orchestration standards.</p>
          </div>
        </div>

        {/* 2. ENTERPRISE RBAC SELECTOR */}
        <div className="w-full md:w-auto space-y-1 bg-slate-800 p-3 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-red-400" /> ACTIVE STAFF IDENTITY:</span>
            <span className="text-emerald-400">RBAC ACTIVE</span>
          </div>
          <select 
            value={selectedStaffId}
            onChange={(e) => {
              const prevUser = currentStaff.name;
              setSelectedStaffId(e.target.value);
              const nextStaff = STAFF_LIST.find(s => s.id === e.target.value)!;
              setTimeout(() => {
                triggerLogWrite(
                  `Active administrative session switched`,
                  `User: ${prevUser} (${currentStaff.role})`,
                  `User: ${nextStaff.name} (${nextStaff.role})`
                );
              }, 100);
              setRbacError(null);
            }} 
            className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-lg py-1 px-2.5 text-xs text-white outline-none focus:border-red-500 font-extrabold cursor-pointer"
          >
            {STAFF_LIST.map(stf => (
              <option key={stf.id} value={stf.id}>
                {stf.name} ({stf.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. DYNAMIC RBAC ACCESS BLOCK BANNER */}
      {rbacError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-3 relative animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-xs font-black uppercase tracking-wide">Access Blocked by Enterprise RBAC Protocol</strong>
            <p className="text-[11px] text-red-700 leading-normal">
              Your active session profile (<span className="font-mono font-bold text-slate-900">{currentStaff.name} • {currentStaff.role}</span>) does not possess permission scopes to view the <strong className="text-slate-900">{rbacError.targetDept}</strong>.
            </p>
            <p className="text-[10px] text-red-600/95 font-medium leading-normal">
              Authorized clearance tiers: <span className="font-mono font-bold uppercase text-slate-800 bg-red-100/80 px-1 py-0.5 rounded">{rbacError.allowedRoles.join(', ')}</span> only. Action has been flagged on immutable telemetry logs.
            </p>
          </div>
          <button 
            onClick={clearRbacError}
            className="absolute top-2 right-2 hover:bg-red-100 text-red-700 p-1 rounded-full text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. WORKSPACE WORKFLOW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT NAV PANEL - ISOLATES INTERNAL DEPARTMENTS */}
        <div className="lg:col-span-3 space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departments Directory</span>
          
          <div className="flex flex-col gap-1 text-slate-600 font-semibold text-xs">
            
            <button
              onClick={() => tryNavigateToTab('CRM')}
              className={`p-3 rounded-xl transition text-left flex items-center justify-between cursor-pointer ${
                activeTab === 'CRM' && !rbacError
                  ? 'bg-red-500 text-white shadow font-bold' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>CRM Customer Care</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeTab === 'CRM' ? 'bg-red-600' : 'bg-slate-200 text-slate-600'}`}>{tickets.filter(t => t.status === 'OPEN').length} Open</span>
            </button>

            <button
              onClick={() => tryNavigateToTab('FIELD')}
              className={`p-3 rounded-xl transition text-left flex items-center justify-between cursor-pointer ${
                activeTab === 'FIELD' && !rbacError
                  ? 'bg-red-500 text-white shadow font-bold' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>Field Operations</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeTab === 'FIELD' ? 'bg-red-600' : 'bg-slate-200 text-slate-600'}`}>{fieldAssignments.filter(a => a.status !== 'APPROVED' && a.status !== 'CLOSED').length}</span>
            </button>

            <button
              onClick={() => tryNavigateToTab('FINANCE')}
              className={`p-3 rounded-xl transition text-left flex items-center justify-between cursor-pointer ${
                activeTab === 'FINANCE' && !rbacError
                  ? 'bg-red-500 text-white shadow font-bold' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span>Finance & Audits</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeTab === 'FINANCE' ? 'bg-red-600' : 'bg-slate-200 text-slate-600'}`}>Ksh {escrowSum.toLocaleString()}</span>
            </button>

            <button
              onClick={() => tryNavigateToTab('HR')}
              className={`p-3 rounded-xl transition text-left flex items-center justify-between cursor-pointer ${
                activeTab === 'HR' && !rbacError
                  ? 'bg-red-500 text-white shadow font-bold' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>Human Resources</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activeTab === 'HR' ? 'bg-red-600' : 'bg-slate-200 text-slate-600'}`}>{leaves.filter(l => l.status === 'PENDING').length}</span>
            </button>

            <button
              onClick={() => tryNavigateToTab('SYS_LOGS')}
              className={`p-3 rounded-xl transition text-left flex items-center justify-between cursor-pointer ${
                activeTab === 'SYS_LOGS' && !rbacError
                  ? 'bg-red-500 text-white shadow font-bold' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 border-dashed'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>SysAdmin & Audit Logs</span>
              </div>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'SYS_LOGS' ? 'bg-red-600' : 'bg-slate-200 text-slate-600'}`}>{logs.length}</span>
            </button>

            <button
              onClick={() => tryNavigateToTab('BI')}
              className={`p-3 rounded-xl transition text-left flex items-center justify-between cursor-pointer ${
                activeTab === 'BI' && !rbacError
                  ? 'bg-red-500 text-white shadow font-bold' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span>Business Intelligence</span>
              </div>
              <span className="text-[9px] text-emerald-600 font-extrabold">STATS</span>
            </button>

          </div>

          <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl space-y-1.5 text-[10px] leading-relaxed">
            <span className="font-extrabold text-indigo-900 block uppercase tracking-wider">Security Rule</span>
            <p className="text-slate-500">
              Only authentic internal staff can retrieve transactional structures. Customers (Buyers, Sellers, Pickers) are isolated on the external layer for ultimate platform security.
            </p>
          </div>
          
          <button 
            type="button"
            onClick={fetchOperationsData}
            disabled={isSyncing}
            className="w-full text-center text-[10px] border border-slate-200 bg-white hover:bg-slate-50 p-2 rounded-xl transition flex justify-center items-center gap-1.5 font-bold shadow-sm"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Administrative Nodes
          </button>
        </div>

        {/* RIGHT CONTENT PANEL - SUB-MODULE ENGINE */}
        <div className="lg:col-span-9 bg-slate-50/50 rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-7 min-h-[480px]">
          
          {/* A. CRM MODULE PANELS */}
          {activeTab === 'CRM' && !rbacError && (
            <div className="space-y-6">
              {/* Header and Corporate Context */}
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">💬 Customer Relations Department (CRM)</h4>
                  <p className="text-[10px] text-slate-400">Manage support tickets, capture buyer/recipient disputes, structure investigations, and execute supervised settlements.</p>
                </div>
                <div className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-bold text-slate-600 flex items-center gap-1.5 border border-slate-200">
                  <UserCheck className="w-3 h-3 text-red-500" /> Active Session: <span className="text-slate-800 font-extrabold">{currentStaff.name} ({currentStaff.role})</span>
                </div>
              </div>

              {/* Dynamic Dashboard statistical indicators depending on active staff role */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentStaff.roleKey === 'CRM_AGENT' && (
                  <>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Assigned Cases</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{agentAssignedCases}</span>
                        <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">SLA Pending</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Pending Responses</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{agentPendingResponses}</span>
                        <span className="text-[8px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">External</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Unassigned Inflow Pool</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{agentAwaitingInvestigation}</span>
                        <span className="text-[8px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full">Awaiting Audit</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Est. Resolution Time</span>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800">3.4 hr SLA Avg</span>
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </div>
                  </>
                )}

                {currentStaff.roleKey === 'CRM_SUPERVISOR' && (
                  <>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Awaiting Decision</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{supervisorAwaitingDecision}</span>
                        <span className="text-[8px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full">Supervised</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Escalated Priority</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{supervisorEscalatorCount}</span>
                        <span className="text-[8px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">Critical</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">SLA Warning States</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{supervisorSlaBreaches}</span>
                        <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1 col-span-2 md:col-span-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Operational Compliance</span>
                      <div className="text-[10px] font-bold text-slate-700 leading-tight">
                        {supervisorTeamPerformance}
                      </div>
                    </div>
                  </>
                )}

                {(currentStaff.roleKey === 'CRM_MANAGER' || currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER') && (
                  <>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">High-Risk Cases (Ksh &gt; 10k)</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{managerHighValue}</span>
                        <span className="text-[8px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">High Liability</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Case Appeals Queue</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{managerAppeals}</span>
                        <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">Escalated</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Escalation Rate</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-800">{managerEscalations} Awaiting</span>
                        <span className="text-[8px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">Review</span>
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">Anti-Fraud Metric</span>
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-[10px] font-black text-emerald-600">{managerFraudTrends}</span>
                        <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Case-file split layout workspace block */}
              {selectedTicketId && selectedTicket ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                  
                  {/* Left Side: Navigation Panel of all cases */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">CRM Active Cases ({tickets.length})</span>
                      <button 
                        onClick={() => setSelectedTicketId(null)}
                        className="text-[9px] font-extrabold text-red-500 hover:underline flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Back
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {tickets.map(tk => (
                        <button
                          key={tk.id}
                          onClick={() => setSelectedTicketId(tk.id)}
                          className={`w-full text-left p-2.5 rounded-xl border transition flex flex-col gap-1 ${
                            tk.id === selectedTicketId 
                              ? 'bg-rose-50/50 border-red-500 shadow-xs' 
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-black text-slate-800">{tk.id}</span>
                            <span className={`text-[7px] font-extrabold px-1 py-0.5 rounded ${
                              tk.urgency === 'Critical' ? 'bg-red-100 text-red-800' : tk.urgency === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                            }`}>{tk.urgency}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 truncate w-full">{tk.customer} • {tk.category}</span>
                          <span className="text-[8px] text-slate-400 font-extrabold flex justify-between w-full">
                            <span>Ksh {(tk.amount || 0).toLocaleString()}</span>
                            <span className="uppercase text-red-500 font-black">{tk.status}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Active Workspace Adjudication Canvas */}
                  <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
                    
                    {/* Active Docket Header details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                            📂 CRM Case Workdesk: <span className="text-red-500">{selectedTicket.id}</span>
                          </h5>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full ${
                            selectedTicket.urgency === 'Critical' ? 'bg-red-100 text-red-800' : selectedTicket.urgency === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                          }`}>{selectedTicket.urgency} Urgency</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Disputed liability context filed by <strong className="text-slate-600">{selectedTicket.customer}</strong> on {new Date(selectedTicket.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[8px] text-slate-400 font-bold block">Escrow value at stake</span>
                          <span className="text-xs font-black text-red-500">Ksh {(selectedTicket.amount || 0).toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedTicketId(null)}
                          className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-slate-500 transition"
                          title="Close case workspace"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Interactive Status Step Bar Tracker */}
                    <div className="bg-slate-50 border p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8px] uppercase font-extrabold text-slate-505 tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-red-505" /> Case Management Lifecycle Track
                        </span>
                        <span className="text-[9px] font-black text-rose-600 px-2 py-0.5 bg-rose-55 rounded-full border border-rose-100">{selectedTicket.status}</span>
                      </div>
                      
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 lg:gap-1.5">
                        {[
                          'NEW', 'UNDER_REVIEW', 'INFORMATION_REQUESTED',
                          'INVESTIGATION_IN_PROGRESS', 'INVESTIGATION_COMPLETED',
                          'AWAITING_SUPERVISOR_REVIEW', 'RESOLUTION_APPROVED',
                          'ESCROW_ACTION_PENDING', 'CLOSED', 'APPEAL_PENDING'
                        ].map((st, sIdx) => {
                          const isActive = selectedTicket.status === st;
                          return (
                            <div 
                              key={st} 
                              className={`text-center py-1 px-1 rounded text-[7px] font-bold border truncate transition ${
                                isActive 
                                  ? 'bg-red-505 border-red-505 text-white shadow-xs' 
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}
                              title={`Workflow State: ${st}`}
                            >
                              {st.replace(/_/g, ' ')}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Two Column Layout: Main Adjudication Form left, timeline panel right */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      
                      <div className="md:col-span-7 space-y-4">
                        
                        {/* Status Quick Transitions Trigger Block */}
                        {['NEW', 'UNDER_REVIEW', 'INFORMATION_REQUESTED', 'INVESTIGATION_IN_PROGRESS'].includes(selectedTicket.status) && (
                          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-3.5 space-y-2">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Investigation Quick State-Shifting Operations</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedTicket.status === 'NEW' && (
                                <button
                                  onClick={() => handleUpdateStatus(selectedTicket.id, 'UNDER_REVIEW', 'CRM Agent activated investigation, opening full docket details.')}
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg transition"
                                >
                                  Activate Investigation File (UNDER REVIEW)
                                </button>
                              )}
                              {['UNDER_REVIEW', 'INFORMATION_REQUESTED', 'INVESTIGATION_IN_PROGRESS'].includes(selectedTicket.status) && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'INFORMATION_REQUESTED', 'Dispatched verification requirements; pending external testimony.')}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[9px] px-3 py-1.5 rounded-lg transition"
                                  >
                                    Request External Info (INFORMATION REQUESTED)
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'INVESTIGATION_IN_PROGRESS', 'Actively compiling cargo manifest checks and chat metadata.')}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg transition"
                                  >
                                    Set Investigation In Progress
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* CASE REPORT CONTAINER BLOCK */}
                        <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-extrabold uppercase text-slate-550 tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-red-505" /> Mandatory Investigation Case Findings Report
                            </span>
                            {selectedTicket.report?.submittedBy && (
                              <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-202">
                                <Check className="w-2.5 h-2.5" /> Certified Findings Filed
                              </span>
                            )}
                          </div>

                          {/* Editable Form for writing the mandatory findings (only editable in investigations stages) */}
                          {['NEW', 'UNDER_REVIEW', 'INFORMATION_REQUESTED', 'INVESTIGATION_IN_PROGRESS', 'MORE_INFORMATION_REQUIRED'].includes(selectedTicket.status) ? (
                            <form onSubmit={handleSubmitReport} className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Buyer Filer</label>
                                  <input 
                                    type="text" 
                                    value={buyerInput} 
                                    onChange={e => setBuyerInput(e.target.value)} 
                                    className="w-full bg-white border rounded p-1.5 text-[10px]" 
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Accused Merchant</label>
                                  <input 
                                    type="text" 
                                    value={sellerInput} 
                                    onChange={e => setSellerInput(e.target.value)} 
                                    className="w-full bg-white border rounded p-1.5 text-[10px]" 
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Transit Boda Courier</label>
                                  <input 
                                    type="text" 
                                    value={courierInput} 
                                    onChange={e => setCourierInput(e.target.value)} 
                                    className="w-full bg-white border rounded p-1.5 text-[10px]" 
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Hub Picker</label>
                                  <input 
                                    type="text" 
                                    value={pickerInput} 
                                    onChange={e => setPickerInput(e.target.value)} 
                                    className="w-full bg-white border rounded p-1.5 text-[10px]" 
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Reviewed Evidence checklist</label>
                                <div className="grid grid-cols-2 gap-1 bg-white p-2 rounded border divide-y text-[9px] font-medium text-slate-600">
                                  {['Chat records', 'Delivery proof', 'Inspection reports', 'Photos', 'Videos', 'Escrow logs'].map(ev => {
                                    const checked = evidenceChecked.includes(ev);
                                    return (
                                      <label key={ev} className="flex items-center gap-1.5 p-1 cursor-pointer hover:bg-slate-50">
                                        <input 
                                          type="checkbox" 
                                          checked={checked}
                                          onChange={e => {
                                            if (e.target.checked) {
                                              setEvidenceChecked(prev => [...prev, ev]);
                                            } else {
                                              setEvidenceChecked(prev => prev.filter(x => x !== ev));
                                            }
                                          }}
                                          className="rounded text-red-500 w-3 h-3"
                                        />
                                        <span>{ev}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Case Summary</label>
                                <textarea
                                  value={caseSummaryInput}
                                  onChange={e => setCaseSummaryInput(e.target.value)}
                                  rows={1.5}
                                  placeholder="Define chronological findings of dispatch checks..."
                                  className="w-full bg-white border rounded p-1.5 text-[10px]"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Findings & Detail Analysis</label>
                                <textarea
                                  value={findingsInput}
                                  onChange={e => setFindingsInput(e.target.value)}
                                  rows={2.5}
                                  placeholder="Identify discrepancies, cite delivery PIN indicators..."
                                  className="w-full bg-white border rounded p-1.5 text-[10px]"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Recommended Outcome</label>
                                <select
                                  value={recommendationSelect}
                                  onChange={e => setRecommendationSelect(e.target.value as any)}
                                  className="w-full bg-white border rounded p-1.5 text-[10px] text-slate-705"
                                  required
                                >
                                  <option value="">-- Choose recommendation --</option>
                                  <option value="Release Funds to Seller">Release Funds to Seller</option>
                                  <option value="Refund Buyer">Refund Buyer</option>
                                  <option value="Partial Refund">Partial Refund</option>
                                  <option value="Courier Compensation">Courier Compensation</option>
                                  <option value="Reject Claim">Reject Claim</option>
                                  <option value="Escalate to Fraud Team">Escalate to Fraud Team</option>
                                  <option value="Escalate to Field Operations">Escalate to Field Operations</option>
                                </select>
                              </div>

                              <button
                                type="submit"
                                className="w-full bg-red-500 hover:bg-red-650 text-white font-extrabold text-[9px] py-2 rounded-lg transition flex justify-center items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" /> Sign & Escalate Report (Awaiting Supervisor)
                              </button>
                            </form>
                          ) : (
                            /* Read-only report layout if already submitted */
                            <div className="bg-white border rounded-xl p-3 space-y-3 text-[10px]">
                              <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <div className="bg-slate-50 p-1.5 rounded">
                                  <span className="text-slate-400 block font-bold text-[7px] uppercase">Parties Ingress Panel</span>
                                  <span className="text-slate-700 font-extrabold block">Buyer: {buyerInput}</span>
                                  <span className="text-slate-700 font-extrabold block">Seller: {sellerInput}</span>
                                </div>
                                <div className="bg-slate-50 p-1.5 rounded">
                                  <span className="text-slate-400 block font-bold text-[7px] uppercase">Logistics Handover Panel</span>
                                  <span className="text-slate-700 font-extrabold block">Courier: {courierInput}</span>
                                  <span className="text-slate-700 font-extrabold block">Hub Picker: {pickerInput}</span>
                                </div>
                              </div>

                              <div className="bg-slate-55 p-2 rounded">
                                <span className="text-slate-400 block font-bold text-[7px] uppercase">Review Checklist Checked</span>
                                <div className="flex flex-wrap gap-1 px-1 py-1">
                                  {evidenceChecked.length === 0 ? (
                                    <span className="text-slate-400 italic font-medium">None marked</span>
                                  ) : (
                                    evidenceChecked.map(ev => (
                                      <span key={ev} className="bg-red-50 text-red-700 border border-red-100 font-extrabold text-[7.5px] px-1.5 py-0.5 rounded-full">
                                        ✓ {ev}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-slate-400 font-black text-[8px] uppercase block">Analysis Findings summary</span>
                                <p className="bg-slate-55 p-2 rounded border border-slate-100 italic leading-relaxed text-slate-600 font-medium font-sans">
                                  {selectedTicket.report?.caseSummary || "No case summary report context."}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-slate-400 font-black text-[8px] uppercase block">Explicit Grounding Details</span>
                                <p className="bg-slate-55 p-2 rounded border border-slate-100 leading-relaxed text-slate-700 font-medium">
                                  {selectedTicket.report?.findings || "No findings filed."}
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-202 rounded p-2.5 flex justify-between items-center text-[9px]">
                                <div>
                                  <span className="text-slate-400 block text-[7px] uppercase font-bold">Investigator Recommendation</span>
                                  <strong className="text-slate-707">{selectedTicket.report?.recommendation || "N/A"}</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 block text-[7px] uppercase font-bold">Submitted By</span>
                                  <span className="text-slate-606 font-bold">{selectedTicket.report?.submittedBy} (Agent)</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SUPERVISOR ADJUDICATION & ESCROW RELEASE matrix */}
                        {['AWAITING_SUPERVISOR_REVIEW', 'SUPERVISOR_DECISION_PENDING', 'RESOLUTION_APPROVED', 'ESCROW_ACTION_PENDING', 'CLOSED', 'APPEAL_PENDING'].includes(selectedTicket.status) && (
                          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-red-500" /> Level 2: Supervisor Decision Adjudication Panel
                            </span>

                            {/* If a decision is not yet approval-certified, and staff is supervisor/manager/coo, render decision form */}
                            {!selectedTicket.decision?.decidedBy && ['CRM_SUPERVISOR', 'CRM_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey) ? (
                              <form onSubmit={handleSubmitDecision} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                
                                {/* Escrow Matrix informational notification */}
                                <div className="bg-red-50 border border-dashed border-red-200 p-2.5 rounded text-[9px] leading-relaxed font-bold text-red-800 space-y-1">
                                  <span className="block text-[7px] uppercase tracking-wider font-extrabold text-red-500 px-1 border border-red-200 bg-white w-max rounded">
                                    Escrow Matrix Authorization Rule System
                                  </span>
                                  <p>
                                    CRM Supervisor limits cap funds release up to <strong>Ksh 10,000</strong>. Disputes with higher staked escrow values require high-value override approval credentials from CRM Lead Manager or Executive Management!
                                  </p>
                                  {selectedTicket.amount && selectedTicket.amount > 10000 && (
                                    <p className="p-1 px-1.5 bg-yellow-105 border border-yellow-300 text-yellow-900 rounded font-black text-[8px] animate-pulse flex items-center gap-1">
                                      ⚠️ EXCEEDS LIMIT: Current case escrow Ksh {selectedTicket.amount.toLocaleString()} is labeled HIGH-VALUE. David Chemosit cannot approve. Switch identity to Sarah Mwangi (Manager) to sign!
                                    </p>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Supervisor Decision Action</label>
                                    <select
                                      value={outcomeSelect}
                                      onChange={e => setOutcomeSelect(e.target.value as any)}
                                      className="w-full bg-white border rounded p-1.5 text-[10px]"
                                      required
                                    >
                                      <option value="">-- Choose Decision --</option>
                                      <option value="Approve Recommendation">Approve Recommendation</option>
                                      <option value="Modify Recommendation">Modify Recommendation</option>
                                      <option value="Return for More Information">Return for More Information</option>
                                      <option value="Escalate to CRM Manager">Escalate to CRM Manager</option>
                                      <option value="Escalate to Finance">Escalate to Finance</option>
                                      <option value="Escalate to Fraud Review">Escalate to Fraud Review</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Financial Escrow Action</label>
                                    <select
                                      value={financialActionSelect}
                                      onChange={e => setFinancialActionSelect(e.target.value as any)}
                                      className="w-full bg-white border rounded p-1.5 text-[10px]"
                                      required
                                    >
                                      <option value="">-- Select Settlement --</option>
                                      <option value="None">None (No Payout)</option>
                                      <option value="Release Escrow">Release Escrow (Payout Seller)</option>
                                      <option value="Full Refund">Full Refund (Refund Buyer)</option>
                                      <option value="Partial Refund">Partial Refund</option>
                                      <option value="Split Settlement">Split Settlement (50/50 dispute block)</option>
                                      <option value="Hold Funds">Hold Funds (Freeze Ledger)</option>
                                      <option value="Fraud Investigation Hold">Fraud Investigation Hold</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[8px] font-bold text-slate-400 mb-0.5">Supervisor Adjudication Justification</label>
                                  <textarea
                                    value={justificationInput}
                                    onChange={e => setJustificationInput(e.target.value)}
                                    rows={2.5}
                                    placeholder="Explain matching serial proof checks... Comments are mandatory."
                                    className="w-full bg-white border rounded p-1.5 text-[10px]"
                                    required
                                  />
                                </div>

                                <button
                                  type="submit"
                                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[9px] py-1.5 rounded-lg transition"
                                >
                                  Lodge Final Checked Decision & Authenticate Settlement
                                </button>
                              </form>
                            ) : (
                              /* Read-only supervisor findings summary */
                              <div className="space-y-2 bg-slate-50 p-3 rounded-lg text-[9px]">
                                {selectedTicket.decision?.decidedBy ? (
                                  <>
                                    <div className="flex justify-between items-center bg-white border p-2 rounded">
                                      <div>
                                        <span className="text-slate-400 tracking-tight text-[7px] block uppercase font-bold">Lodge Resolution Approved</span>
                                        <strong className="text-slate-808 text-[10px]">{selectedTicket.decision.outcome}</strong>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-slate-400 block text-[7px] uppercase font-bold">Authorized Signatory</span>
                                        <span className="font-bold text-slate-707">{selectedTicket.decision.decidedBy} ({selectedTicket.decision.decidedRole})</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-slate-400 tracking-tight text-[7px] uppercase font-bold block">Justification details</span>
                                      <p className="bg-white border rounded p-2 italic leading-relaxed text-slate-606 font-sans">
                                        "{selectedTicket.decision.justification}"
                                      </p>
                                    </div>
                                    <div className="bg-red-50 text-red-808 border border-red-101 p-2 rounded flex justify-between items-center font-bold">
                                      <div>
                                        <span className="text-slate-400 tracking-tight text-[6.5px] block uppercase font-bold text-red-500">Financial Ledger Trigger</span>
                                        <strong className="text-[10px]">{selectedTicket.decision.financialAction} Action</strong>
                                      </div>
                                      <span className="text-[10px] font-bold text-red-707 bg-white border px-2 py-0.5 rounded shadow-xs">✓ Logged to DB Ledger</span>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-center text-slate-400 py-4 italic font-medium">Awaiting Level 2 Supervisor review and decision. Must be signed by David, Sarah, or Silas.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* APPEALS DESK BOX SECTION */}
                        {selectedTicket.status === 'CLOSED' && (
                          <div className="bg-amber-50 border border-amber-201 rounded-xl p-4 space-y-3">
                            <span className="text-[10px] font-black uppercase text-amber-808 block">⚠️ Client Appellate Registry</span>
                            <p className="text-[9px] text-amber-707 leading-relaxed font-semibold">
                              Has customer challenging the supervisor's split decision checkout release? Appeals reset the docket to APPEAL PENDING and must be evaluated by the High CRM Manager context.
                            </p>
                            <form onSubmit={handleFileAppeal} className="space-y-2">
                              <textarea
                                value={appealNotesInput}
                                onChange={e => setAppealNotesInput(e.target.value)}
                                rows={1.5}
                                placeholder="Explain client counter-evidence, Safaricom Daraja raw MPesa push receipt mismatches..."
                                className="w-full bg-white border rounded p-2 text-[10px]"
                                required
                              />
                              <button
                                type="submit"
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[9px] py-1.5 rounded-lg transition"
                              >
                                File Formal Appellate Challenge (Move to APPEAL PENDING)
                              </button>
                            </form>
                          </div>
                        )}

                        {selectedTicket.status === 'APPEAL_PENDING' && (
                          <div className="bg-slate-800 text-white rounded-xl p-4 space-y-3 flex flex-col">
                            <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">⚖️ Appellate Court Reviews & Escalations</span>
                            <div className="text-[9px] text-slate-202 leading-relaxed space-y-1">
                              <p>
                                <strong>Original Adjudication Signatory Check:</strong> {selectedTicket.originalDecisionBy || 'CRM Supervisor David Chemosit'}
                              </p>
                              <p>
                                Under Buy Safely compliance matrix, <strong>no caseworker who approved the original dispute resolution may evaluate its appellate challenge</strong>. Overruling appeals requires separate administrator credentials:
                              </p>
                              <div className="bg-slate-900 p-2 rounded text-[8px] text-slate-300">
                                <strong>Active Caseworker Signature:</strong> {currentStaff.name} ({currentStaff.roleKey})
                              </div>
                            </div>

                            {/* Options to satisfy appeal logic */}
                            {currentStaff.roleKey === 'CRM_MANAGER' || currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER' ? (
                              <div className="space-y-2 pt-2">
                                <label className="block text-[8px] font-bold text-slate-400 mb-1">Select Appellate Judgment Rule Outcome</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED', `Appellate Court Approved Appeal. Overriding decision from ${selectedTicket.originalDecisionBy}. Released alternate escrow settlements.`)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9.5px] font-bold p-2 rounded transition"
                                  >
                                    Approve Appeal & Overrule Decision
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED', `Appellate Court Rejected Appeal. Affirmed decision validated by ${selectedTicket.originalDecisionBy}. Case definitively closed.`)}
                                    className="bg-rose-500 hover:bg-rose-600 text-white text-[9.5px] font-bold p-2 rounded transition"
                                  >
                                    Reject Appeal & Affirm Decision
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-900 text-amber-400 text-center text-[9px] p-2 rounded font-black border border-amber-500 animate-pulse">
                                COMPLIANCE LOCK: Switch active user role to CRM Manager (Sarah Mwangi) or COO (Silas Mugo) to adjudicate appeal registry.
                              </div>
                            )}
                          </div>
                        )}

                      </div>

                      {/* Right Grid Column within detail workspace: Timelines, Communication Logs & Files */}
                      <div className="md:col-span-12 lg:col-span-5 space-y-4">
                        
                        {/* Timeline logs */}
                        <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
                          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block font-sans">🗣️ Communication Notes Diary</span>
                          
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {selectedTicket.communications?.length === 0 ? (
                              <span className="block text-[9px] text-slate-400 italic">No communication items logged.</span>
                            ) : (
                              selectedTicket.communications?.map((chat, cIdx) => (
                                <div key={cIdx} className="bg-white border rounded p-2 text-[9px] space-y-1">
                                  <div className="flex justify-between items-center text-slate-400 font-extrabold text-[8px]">
                                    <span>{chat.sender} ({chat.role})</span>
                                    <span>{new Date(chat.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-slate-700 font-semibold leading-relaxed font-sans">{chat.text}</p>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={handleAddCommunication} className="flex gap-1.5 pt-1">
                            <input
                              type="text"
                              value={chatMessageText}
                              onChange={e => setChatMessageText(e.target.value)}
                              placeholder="Write diary memo memo or status note..."
                              className="w-full bg-white border rounded-lg p-1.5 text-[10px]"
                            />
                            <button
                              type="submit"
                              className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[9px] px-3.5 py-1.5 rounded-lg transition"
                            >
                              Add Note
                            </button>
                          </form>
                        </div>

                        {/* Evidence attachments */}
                        <div className="bg-slate-55 border rounded-xl p-4 space-y-3">
                          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">📁 Escrow Document Evidence Package</span>
                          <div className="space-y-1.5 text-[9px] font-bold text-slate-450">
                            {selectedTicket.attachments?.length === 0 ? (
                              <p className="italic text-slate-400 p-2 text-center">No documentary evidence uploaded yet.</p>
                            ) : (
                              selectedTicket.attachments?.map(at => (
                                <div key={at} className="bg-white border p-2 rounded flex justify-between items-center hover:bg-slate-50 transition cursor-pointer">
                                  <span>📄 {at}</span>
                                  <span className="text-[8px] bg-red-100 text-red-800 py-0.5 px-2 rounded">Review doc</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Immutable audit logs spécifique */}
                        <div className="bg-slate-55 border rounded-xl p-4 space-y-2">
                          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">⚖️ Immutable Case Audit Ledger</span>
                          <div className="space-y-2 max-h-[150px] overflow-y-auto font-mono text-[8.5px] bg-slate-900 text-emerald-400 p-2.5 rounded-lg border border-black leading-relaxed divide-y divide-emerald-900/40">
                            {selectedTicket.history?.length === 0 ? (
                              <p className="italic text-emerald-600/60 p-2 text-center">No lifecycle changes registered.</p>
                            ) : (
                              selectedTicket.history?.map((hi, hIdx) => (
                                <div key={hIdx} className="pt-1.5 pb-1 space-y-0.5 text-[8.5px]">
                                  <div className="flex justify-between font-black text-emerald-303">
                                    <span>[USR] {hi.user} ({hi.role})</span>
                                    <span>{new Date(hi.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1 font-bold text-emerald-100">
                                    <span>TRANSITION:</span>
                                    <span className="text-red-400 uppercase">{hi.previousStatus}</span>
                                    <span>-&gt;</span>
                                    <span className="text-emerald-450 uppercase">{hi.newStatus}</span>
                                  </div>
                                  <p className="text-slate-300 italic font-sans font-medium">REMARKS: {hi.notes}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                /* Simple list view when no ticket is active */
                <div className="space-y-6">
                  
                  {/* Intake Form (Supports creating tickets with transaction and amount details!) */}
                  <form onSubmit={handleCreateTicket} className="bg-white border p-4 rounded-xl shadow-xs space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-505 tracking-wider block">Intake New Escrow Dispute Ticket</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Assistance Customer Name</label>
                        <input 
                          type="text" 
                          value={newTicketCustomer}
                          onChange={(e) => setNewTicketCustomer(e.target.value)}
                          className="w-full bg-slate-50 border rounded-lg p-2 text-xs" 
                          placeholder="e.g. Phyllis Wambui" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Dispute Category</label>
                        <select 
                          value={newTicketCategory}
                          onChange={(e) => setNewTicketCategory(e.target.value)}
                          className="w-full bg-slate-50 border rounded-lg p-2 text-xs text-slate-707"
                        >
                          <option value="Recipient Dispatch OTP Check">Recipient Dispatch OTP Check</option>
                          <option value="Escrow Reserve Release Delay">Escrow Reserve Release Delay</option>
                          <option value="Damaged Goods Dispute">Damaged Goods Dispute</option>
                          <option value="Fraudulent Till link Reported">Fraudulent Till link Reported</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Intake Urgency</label>
                        <select 
                          value={newTicketUrgency}
                          onChange={(e) => setNewTicketUrgency(e.target.value as any)}
                          className="w-full bg-slate-50 border rounded-lg p-2 text-xs text-slate-707"
                        >
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-1">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Disputed Transaction ID (Reference link)</label>
                        <input 
                          type="text"
                          value={newTicketTransactionId}
                          onChange={e => setNewTicketTransactionId(e.target.value)}
                          className="w-full bg-slate-50 border rounded-lg p-2 text-xs"
                          placeholder="e.g. BS-KSH-1102"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-550 mb-0.5">Disputed Escrow Staked Fund Amount (Ksh)</label>
                        <input 
                          type="number"
                          value={newTicketAmount}
                          onChange={e => setNewTicketAmount(e.target.value)}
                          className="w-full bg-slate-50 border rounded-lg p-2 text-xs"
                          placeholder="e.g. 15000"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Full Escalation & Complaint Context</label>
                      <textarea 
                        value={newTicketMessage}
                        onChange={(e) => setNewTicketMessage(e.target.value)}
                        rows={2} 
                        className="w-full bg-slate-50 border rounded-lg p-2 text-xs" 
                        placeholder="Detail the complete courier details, inspection results, or chat log coordinates..."
                        required
                      />
                    </div>
                    
                    <button type="submit" className="bg-red-500 hover:bg-red-650 text-white font-bold text-[10px] px-4 py-2 rounded-lg transition ml-auto flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> File Operational Dispute Case
                    </button>
                  </form>

                  {/* CRM Active Queue Queue filter buttons */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-extrabold text-slate-505 tracking-wider block">CRM Response Ticketing Queue ({tickets.length} Active cases)</span>
                    
                    {tickets.length === 0 ? (
                      <p className="text-center text-slate-400 p-4 text-[11px]">Syncing or queue empty.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {tickets.map(tk => (
                          <div 
                            key={tk.id} 
                            onClick={() => setSelectedTicketId(tk.id)}
                            className="bg-white border rounded-xl p-4 shadow-xs space-y-3 hover:border-red-505/50 transition cursor-pointer relative overflow-hidden group border-slate-200"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-800">{tk.id}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                    tk.urgency === 'Critical' ? 'bg-red-105 text-red-800' : tk.urgency === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-808'
                                  }`}>{tk.urgency} Priority</span>
                                  {tk.amount && (
                                    <span className="text-[9px] font-extrabold text-red-500">Ksh {tk.amount.toLocaleString()}</span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold block">Filer: {tk.customer} • Opened {new Date(tk.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <span className="text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded bg-rose-50 border border-slate-200 text-slate-600 group-hover:border-red-400 font-sans transition">
                                {tk.status}
                              </span>
                            </div>

                            <div className="text-[11px] bg-slate-50 rounded-lg p-2.5 font-medium leading-relaxed border border-slate-100 font-sans">
                              <span className="font-extrabold text-indigo-900 block text-[9px] mb-0.5">RE: {tk.category} [Tx: {tk.transactionId || 'None'}]</span>
                              {tk.message}
                            </div>

                            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-50 font-sans">
                              <span className="text-slate-400">Assigned Caseworker: <strong className="text-slate-600">{tk.assignedTo}</strong></span>
                              <span className="text-red-505 hover:underline font-extrabold text-[9px] flex items-center gap-0.5">Open Case File workspace →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* B. FIELD OPERATIONS MODULE PANELS */}
          {activeTab === 'FIELD' && !rbacError && (
            <div className="space-y-6">
              {/* Department Banner & Overview Metrics */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden border border-slate-800 shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 font-bold pointer-events-none text-9xl">GPS</div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1 px-2.5 bg-red-500/20 text-red-400 text-[9px] font-black uppercase rounded-lg border border-red-500/30">OPERATIONAL FORCE</span>
                      <span className="text-[10px] text-slate-400 font-medium">Platform Eyes & Ears</span>
                    </div>
                    <h4 className="text-lg font-black tracking-tight font-sans text-white flex items-center gap-2">
                      📍 Field Operations & Evidence Department
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xl mt-1">
                      Enforcing physical premises validation, verifying merchant tax registrations, collecting proof-of-operations, and investigating fraud layering on the ground.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-xs">
                      <span className="text-[9px] text-slate-400 block font-bold">ACTIVE SESSION CREDENTIALS</span>
                      <strong className="text-emerald-400 font-extrabold flex items-center gap-1">
                        {currentStaff.name} <span>({currentStaff.role})</span>
                      </strong>
                    </div>
                    <span className="text-lg">🛡️</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-800 pt-5">
                  <div className="p-3 bg-slate-800/45 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Pending Dispatch</span>
                    <strong className="text-lg font-mono font-extrabold text-amber-400">
                      {fieldAssignments.filter(a => a.status === 'NEW_ASSIGNMENT').length} cases
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-800/45 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">In Field Patrol</span>
                    <strong className="text-lg font-mono font-extrabold text-sky-400">
                      {fieldAssignments.filter(a => ['INVESTIGATION_SCHEDULED', 'IN_FIELD', 'EVIDENCE_COLLECTION'].includes(a.status)).length} agents
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-800/45 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Awaiting Approval</span>
                    <strong className="text-lg font-mono font-extrabold text-indigo-400">
                      {fieldAssignments.filter(a => a.status === 'REPORT_SUBMITTED').length} dossiers
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-800/45 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Total Verification Revenue</span>
                    <strong className="text-lg font-mono font-extrabold text-emerald-400">
                      Ksh {fieldAssignments.reduce((acc, a) => acc + (a.chargeStatus === 'PAID' ? (a.chargeAmount || 0) : 0), 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs for Task Workspace */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setFieldSubDashboardTab('ASSIGNMENTS')}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider relative transition-all ${
                    fieldSubDashboardTab === 'ASSIGNMENTS'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📁 Missions Queue & Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFieldSubDashboardTab('INVESTIGATIONS');
                    if (!selectedFieldId && fieldAssignments.length > 0) {
                      setSelectedFieldId(fieldAssignments[0].id);
                    }
                  }}
                  className={`py-3 px-5 text-xs font-black uppercase tracking-wider relative transition-all flex items-center gap-2 ${
                    fieldSubDashboardTab === 'INVESTIGATIONS'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🔍 Ground Case Workspace
                  {selectedFieldId && (
                    <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                      {selectedFieldId}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: ASSIGNMENTS QUEUE & DISPATCH WINDOW */}
              {fieldSubDashboardTab === 'ASSIGNMENTS' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left panel: Quick Dispatch Form */}
                  <div className="lg:col-span-1 space-y-4">
                    <form onSubmit={handleCreateFieldAssignment} className="bg-white border p-5 rounded-2xl shadow-sm space-y-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-xs uppercase tracking-wide border-b pb-2">
                        <span>🚀</span>
                        <span>Dispatch Ground Mission</span>
                      </div>
                      
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Entity / Merchant Trade Name</label>
                          <input 
                            type="text" 
                            value={newFieldMerchant}
                            onChange={(e) => setNewFieldMerchant(e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none rounded-xl p-3 text-xs font-mono font-bold transition" 
                            placeholder="e.g. Nairobi Hardware Hub Ltd" 
                            required 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Inspected Site Physical Location</label>
                          <input 
                            type="text" 
                            value={newFieldLocation}
                            onChange={(e) => setNewFieldLocation(e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:ring-1 focus:ring-red-500 focus:outline-none rounded-xl p-3 text-xs transition" 
                            placeholder="e.g. Suite 4C, Diamond Plaza, Parklands" 
                            required 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operational Directive Type</label>
                          <select 
                            value={newFieldTask}
                            onChange={(e) => setNewFieldTask(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700"
                          >
                            <option value="Merchant Verification">Merchant Verification (Invoice Ksh 2,500)</option>
                            <option value="Standard Operations Patrol">Standard Operations Patrol</option>
                            <option value="Address Confirmation">Address Confirmation Patrol</option>
                            <option value="Heavy Machinery & Farm Equipment Audit">Heavy Machinery & Farm Equipment Audit</option>
                            <option value="Physical Dispute Investigation">Physical Dispute Investigation (Evidence Collection)</option>
                          </select>
                          {newFieldTask === 'Merchant Verification' && (
                            <p className="text-[9px] text-red-500 mt-1 font-bold">
                              ⚠️ Verification audits trigger a Ksh 2,500 system charge invoice. The ground team cannot complete reports until paid!
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To Field Officer</label>
                          <select 
                            value={selectedFieldOfficerToAssign}
                            onChange={(e) => setSelectedFieldOfficerToAssign(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700"
                          >
                            <option value="Ken Bwire">Ken Bwire (Junior Officer)</option>
                            <option value="Kiprop Rono">Kiprop Rono (Senior Officer)</option>
                            <option value="Alice Koech">Alice Koech (Field Supervisor)</option>
                            <option value="John Kamau">John Kamau (Ops Manager)</option>
                          </select>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow">
                        <Plus className="w-4 h-4" /> Issue Patrol Force Directive
                      </button>
                    </form>
                  </div>

                  {/* Right panel: Search and Grid of Active cases */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Directives Dossier Listing</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                        {fieldAssignments.length} issued
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fieldAssignments.map(asg => {
                        const isSelected = selectedFieldId === asg.id;
                        return (
                          <div 
                            key={asg.id} 
                            onClick={() => {
                              setSelectedFieldId(asg.id);
                              setFieldSubDashboardTab('INVESTIGATIONS');
                            }}
                            className={`bg-white border rounded-xl p-4 shadow-sm hover:border-red-400 transition cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                              isSelected ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] font-mono text-slate-400 block">{asg.id}</span>
                                <strong className="text-xs font-black text-slate-800 line-clamp-1 block leading-tight">
                                  {asg.merchantName}
                                </strong>
                                <span className="text-[10px] text-slate-500 font-semibold">{asg.task}</span>
                              </div>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                asg.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                asg.status === 'REPORT_SUBMITTED' ? 'bg-purple-100 text-purple-800' :
                                asg.status === 'IN_FIELD' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                                asg.status === 'NEW_ASSIGNMENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {asg.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                              <p className="flex items-center gap-1">📍 <span className="font-semibold">{asg.location}</span></p>
                              {asg.chargeAmount ? (
                                <p className="flex justify-between text-[9px] font-bold">
                                  <span>Verification Invoice:</span>
                                  <span className={asg.chargeStatus === 'PAID' ? 'text-emerald-600' : 'text-red-500'}>
                                    Ksh {asg.chargeAmount} ({asg.chargeStatus})
                                  </span>
                                </p>
                              ) : null}
                            </div>

                            <div className="flex justify-between items-center text-[9.5px] border-t border-slate-100 pt-2 text-slate-400 mt-auto">
                              <span>Specialist: <strong>{asg.assignedTo}</strong></span>
                              <span className="text-red-500 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                Open Workspace <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RICH GROUND CASE WORKSPACE */}
              {fieldSubDashboardTab === 'INVESTIGATIONS' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (Dossiers selector sidebar) */}
                  <div className="lg:col-span-3 space-y-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inspected Dossiers Selection</span>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {fieldAssignments.map(asg => {
                        const isAct = selectedFieldId === asg.id;
                        return (
                          <button
                            key={asg.id}
                            type="button"
                            onClick={() => setSelectedFieldId(asg.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col space-y-1.5 ${
                              isAct ? 'bg-white border-red-500 rim shadow-md' : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[9px] font-mono font-bold text-slate-500">{asg.id}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                asg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                asg.status === 'REPORT_SUBMITTED' ? 'bg-indigo-100 text-indigo-800' :
                                asg.status === 'NEW_ASSIGNMENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {asg.status.slice(0, 10)}
                              </span>
                            </div>
                            <strong className="text-xs text-slate-800 block line-clamp-1 font-black">{asg.merchantName}</strong>
                            <span className="text-[10.5px] text-slate-400 block shrink-0 truncate">{asg.task}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column (The Case Workspace Detail panel) */}
                  <div className="lg:col-span-9">
                    {selectedFieldAssignment ? (
                      <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                        {/* Header Status Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                          <div>
                            <span className="text-[10px] text-indigo-600 uppercase font-black tracking-widest block">CASE RECORD DOSSIER</span>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-slate-800">{selectedFieldAssignment.id} : {selectedFieldAssignment.merchantName}</h3>
                              <span className="text-xs text-slate-400 font-mono">[{selectedFieldAssignment.location}]</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-semibold text-slate-400">Current Status:</span>
                            <span className="bg-red-50 text-red-700 border border-red-200 font-mono text-[10px] font-extrabold px-3 py-1 rounded-lg">
                              {selectedFieldAssignment.status}
                            </span>
                          </div>
                        </div>

                        {/* HIGH SECURITY PROTOCOL STAGE INTEGRATOR (BENTO LAYOUT) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                          {/* Left Panel: Workflow Progress Actions */}
                          <div className="md:col-span-7 space-y-5">
                            {/* CASE CHARGES PANEL */}
                            {selectedFieldAssignment.chargeAmount ? (
                              <section className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    💰 Secure Escrow Merchant Verification Fee
                                  </span>
                                  <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded ${
                                    selectedFieldAssignment.chargeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {selectedFieldAssignment.chargeStatus}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between items-center text-xs">
                                  <div>
                                    <p className="text-slate-600">Verification & Ground On-site Audit Invoice:</p>
                                    <p className="text-[10px] text-slate-400">Ksh 2,500 system generation fee</p>
                                  </div>
                                  <div className="text-right">
                                    <strong className="text-slate-900 font-mono font-extrabold text-base block">Ksh 2,500</strong>
                                    {selectedFieldAssignment.chargeStatus === 'UNPAID' ? (
                                      <button
                                        type="button"
                                        onClick={() => handlePayFieldCharge(selectedFieldAssignment.id, selectedFieldAssignment.merchantName)}
                                        className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] px-2.5 py-1 rounded transition shadow-sm"
                                      >
                                        Trigger Safaricom M-Pesa Hook Pay
                                      </button>
                                    ) : (
                                      <span className="text-emerald-600 font-black text-[10px] flex items-center gap-1 justify-end">
                                        ✓ Safaricom Paid
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </section>
                            ) : null}

                            {/* COMPLIANCE WARNING IF INVOICE UNPAID */}
                            {selectedFieldAssignment.chargeAmount && selectedFieldAssignment.chargeStatus === 'UNPAID' && (
                              <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed">
                                <strong>⚠️ High-Integrity Protocol Block:</strong> The verification invoice of Ksh 2,500 remains unpaid. All further investigative steps (scheduling, reporting, and badge issuances) are frozen until the merchant has clearing payment validation via the Safaricom hook.
                              </div>
                            )}

                            {/* STAGE 1: DISPATCH & SCHEDULE VISIT */}
                            <div className={`border p-4.5 rounded-xl space-y-3 ${
                              selectedFieldAssignment.status === 'NEW_ASSIGNMENT' 
                                ? 'border-amber-400 bg-amber-50/10' 
                                : 'border-slate-100 bg-neutral-50/30'
                            }`}>
                              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block">STAGE 1: Site Visit Dispatch & Scheduling</span>
                              {selectedFieldAssignment.visitDate ? (
                                <div className="bg-white border rounded-xl p-3 text-xs space-y-1">
                                  <p className="text-slate-600">Site visit is officially scheduled and registered in operational log:</p>
                                  <p className="font-extrabold text-slate-800 flex items-center gap-1">
                                    📅 Date/Time: <span className="font-mono text-slate-600">{selectedFieldAssignment.visitDate} @ {selectedFieldAssignment.visitTime}</span>
                                  </p>
                                  <p className="text-slate-500">Contact Person On-Site: <strong>{selectedFieldAssignment.contactPerson}</strong></p>
                                </div>
                              ) : (
                                <form onSubmit={(e) => handleScheduleInspection(e, selectedFieldAssignment.id)} className="space-y-3">
                                  <p className="text-xs text-slate-500">
                                    The Dispatch Officer is required to lock down the scheduled inspection date and register the on-site contact person to direct physical operations.
                                  </p>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div>
                                      <label className="block text-[8.5px] font-extrabold text-slate-500 uppercase mb-0.5">Visit Date</label>
                                      <input 
                                        type="date"
                                        value={fieldVisitDate}
                                        onChange={(e) => setFieldVisitDate(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                        required
                                        disabled={selectedFieldAssignment.chargeAmount ? selectedFieldAssignment.chargeStatus === 'UNPAID' : false}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8.5px] font-extrabold text-slate-500 uppercase mb-0.5">Visit Time</label>
                                      <input 
                                        type="time"
                                        value={fieldVisitTime}
                                        onChange={(e) => setFieldVisitTime(e.target.value)}
                                        className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                                        required
                                        disabled={selectedFieldAssignment.chargeAmount ? selectedFieldAssignment.chargeStatus === 'UNPAID' : false}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8.5px] font-extrabold text-slate-500 uppercase mb-0.5">Contact Person</label>
                                      <input 
                                        type="text"
                                        value={fieldContactPerson}
                                        onChange={(e) => setFieldContactPerson(e.target.value)}
                                        placeholder="e.g. Abdi Ibrahim (Manager)"
                                        className="w-full bg-white border border-slate-200 p-2 rounded text-xs font-semibold"
                                        required
                                        disabled={selectedFieldAssignment.chargeAmount ? selectedFieldAssignment.chargeStatus === 'UNPAID' : false}
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={selectedFieldAssignment.chargeAmount ? selectedFieldAssignment.chargeStatus === 'UNPAID' : false}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-[10px] uppercase tracking-wide py-2 px-4 rounded-lg transition disabled:opacity-50"
                                  >
                                    Register Site Inspection Appointment
                                  </button>
                                </form>
                              )}
                            </div>

                            {/* STAGE 2: GEOPRESENCE GPS CHECKIN & REPORT ARRIVAL */}
                            <div className={`border p-4.5 rounded-xl space-y-3 ${
                              selectedFieldAssignment.status === 'INVESTIGATION_SCHEDULED' 
                                ? 'border-sky-400 bg-sky-50/10' 
                                : 'border-slate-100 bg-neutral-50/30'
                            }`}>
                              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest block">STAGE 2: Ground Force Arrival Check-in</span>
                              {selectedFieldAssignment.gpsCoordinates ? (
                                <div className="bg-white border rounded-xl p-3 text-xs space-y-1">
                                  <p className="text-slate-600">On-site presence is validated through hardware GPS matching:</p>
                                  <p className="font-extrabold text-sky-700 flex items-center gap-1 text-[11px]">
                                    📍 Verified GPS Lat/Long: <span className="font-mono bg-slate-100 p-1 rounded border text-slate-700">{selectedFieldAssignment.gpsCoordinates}</span>
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs text-slate-500">
                                    Before compiling reports, the dispatched Field Agent must log in on-site. The device GPS hardware is automatically checked to prevent spoofing.
                                  </p>
                                  <button
                                    type="button"
                                    disabled={!selectedFieldAssignment.visitDate || (selectedFieldAssignment.chargeAmount ? selectedFieldAssignment.chargeStatus === 'UNPAID' : false)}
                                    onClick={() => handleLogArrival(selectedFieldAssignment.id)}
                                    className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
                                  >
                                    📍 Validate On-Site Location (Log Check-In)
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* STAGE 3: MANDATORY PROOF EVIDENCE COLLECTION */}
                            <div className={`border p-4.5 rounded-xl space-y-3 w-full ${
                              selectedFieldAssignment.status === 'IN_FIELD' 
                                ? 'border-indigo-400 bg-indigo-50/10' 
                                : 'border-slate-100 bg-neutral-50/30'
                            }`}>
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">STAGE 3: GROUND EVIDENCE DOSSIER</span>
                              
                              {/* Display Evidence Files */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="border bg-slate-50 rounded-xl p-3 space-y-2">
                                  <span className="text-[9px] uppercase font-bold text-slate-600 block">📸 Visual Proof / Photos</span>
                                  {selectedFieldAssignment.evidenceUploaded?.photos?.length ? (
                                    <div className="grid grid-cols-2 gap-2">
                                      {selectedFieldAssignment.evidenceUploaded.photos.map((ph, idx) => (
                                        <img 
                                          key={idx} 
                                          src={ph} 
                                          alt="Visual Proof Premises" 
                                          className="w-full h-16 object-cover rounded border" 
                                          referrerPolicy="no-referrer"
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-slate-400 font-medium">No site photometrics attached.</p>
                                  )}
                                  <button
                                    type="button"
                                    disabled={!selectedFieldAssignment.gpsCoordinates}
                                    onClick={() => handleUploadEvidence(selectedFieldAssignment.id, 'photos')}
                                    className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 bg-white border px-2 py-1 rounded shadow-xs"
                                  >
                                    + Attach Store Photo
                                  </button>
                                </div>

                                <div className="border bg-slate-50 rounded-xl p-3 space-y-2">
                                  <span className="text-[9px] uppercase font-bold text-slate-600 block">📄 Business Permits & Legal Documents</span>
                                  {selectedFieldAssignment.evidenceUploaded?.documents?.length ? (
                                    <ul className="text-[9.5px] font-mono text-slate-700 space-y-1">
                                      {selectedFieldAssignment.evidenceUploaded.documents.map((doc, idx) => (
                                        <li key={idx} className="bg-white p-1 rounded border truncate">
                                          📄 {doc}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-[10px] text-slate-400 font-medium">No tax certificates or licenses uploaded.</p>
                                  )}
                                  <button
                                    type="button"
                                    disabled={!selectedFieldAssignment.gpsCoordinates}
                                    onClick={() => handleUploadEvidence(selectedFieldAssignment.id, 'documents')}
                                    className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 bg-white border px-2 py-1 rounded shadow-xs"
                                  >
                                    + Upload Operational License
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* STAGE 4: FORMAL REPORT COMPILATION & DOSSIER REVIEWS */}
                            <div className={`border p-4.5 rounded-xl space-y-3 ${
                              selectedFieldAssignment.status === 'EVIDENCE_COLLECTION' || selectedFieldAssignment.status === 'IN_FIELD'
                                ? 'border-purple-400 bg-purple-50/10' 
                                : 'border-slate-100'
                            }`}>
                              <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">STAGE 4: Formal Reporter Recommendation Compilation</span>
                              
                              {selectedFieldAssignment.findings ? (
                                <div className="bg-slate-50 border rounded-xl p-4 text-xs space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                                    <p className="text-slate-500 font-bold">
                                      Parties Interviewed:
                                      <span className="block font-semibold text-slate-700">
                                        Merchant: {selectedFieldAssignment.partiesInterviewed?.merchant ? 'Yes' : 'No'} | 
                                        Buyer: {selectedFieldAssignment.partiesInterviewed?.buyer ? 'Yes' : 'No'} | 
                                        Courier: {selectedFieldAssignment.partiesInterviewed?.courier ? 'Yes' : 'No'} | 
                                        Witness: {selectedFieldAssignment.partiesInterviewed?.witness ? 'Yes' : 'No'}
                                      </span>
                                    </p>
                                    <p className="text-slate-500 font-bold">
                                      Expert Risk Rating & Escalation Choice:
                                      <span className="block font-extrabold text-red-600 uppercase font-mono">
                                        [{selectedFieldAssignment.riskAssessment}]
                                      </span>
                                    </p>
                                  </div>
                                  <div className="border-t pt-2.5 text-slate-600">
                                    <strong className="block text-slate-800">Ground Investigation Findings:</strong>
                                    <p className="italic bg-white p-3 border rounded-lg whitespace-pre-line leading-relaxed font-serif mt-1">
                                      "{selectedFieldAssignment.findings}"
                                    </p>
                                  </div>
                                  <div className="text-[11px] text-purple-700 font-black">
                                    Suggested Recommendation: {selectedFieldAssignment.recommendation}
                                  </div>
                                </div>
                              ) : (
                                <form onSubmit={(e) => handleSubmitFieldReport(e, selectedFieldAssignment.id)} className="space-y-4">
                                  <p className="text-xs text-slate-500 leading-relaxed">
                                    Compile the final, high-integrity ground investigation report dossier. Mandatory requirements demand that findings are thoroughly explained and a local risk profile is generated.
                                  </p>

                                  {/* Parties Checkboxes */}
                                  <div className="space-y-1.5 bg-white border p-3 rounded-lg">
                                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Mandatory On-site Interviews Conducted</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={fieldPartiesInterviewed.merchant}
                                          onChange={(e) => setFieldPartiesInterviewed(prev => ({ ...prev, merchant: e.target.checked }))}
                                        />
                                        <span>Merchant / Owner</span>
                                      </label>
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={fieldPartiesInterviewed.buyer}
                                          onChange={(e) => setFieldPartiesInterviewed(prev => ({ ...prev, buyer: e.target.checked }))}
                                        />
                                        <span>Local Buyer</span>
                                      </label>
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={fieldPartiesInterviewed.courier}
                                          onChange={(e) => setFieldPartiesInterviewed(prev => ({ ...prev, courier: e.target.checked }))}
                                        />
                                        <span>Courier Driver</span>
                                      </label>
                                      <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={fieldPartiesInterviewed.witness}
                                          onChange={(e) => setFieldPartiesInterviewed(prev => ({ ...prev, witness: e.target.checked }))}
                                        />
                                        <span>Witness / Neighbour</span>
                                      </label>
                                    </div>
                                  </div>

                                  {/* Risk & Recommendation */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5">Integrity Risk Assessment Rating</label>
                                      <select
                                        value={fieldRiskAssessment}
                                        onChange={(e) => setFieldRiskAssessment(e.target.value as any)}
                                        className="w-full bg-white border p-2 rounded text-xs text-slate-800 font-extrabold"
                                      >
                                        <option value="Low">Low Risk (Standard approvals)</option>
                                        <option value="Medium">Medium Risk (Heightened alerts)</option>
                                        <option value="High">High Risk (Requires override approvals)</option>
                                        <option value="Critical">Critical (Escalate immediately)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5">Candidate Recommended Verdict</label>
                                      <select
                                        value={fieldRecommendation}
                                        onChange={(e) => setFieldRecommendation(e.target.value)}
                                        className="w-full bg-white border p-2 rounded text-xs font-semibold text-slate-700"
                                      >
                                        <option value="Approve Merchant">Approve Merchant (Confirm Address)</option>
                                        <option value="Reject Merchant Account">Reject Merchant (Fake Address / Unlicensed)</option>
                                        <option value="Flag For Additional Audits">Flag For Secondary Operations Patrol</option>
                                        <option value="Decline Escrow Settlement Release">Decline Settlement Funds Release</option>
                                        <option value="Recommend Multiple Accounts Fraud Flag">Recommend Fraud Lock (Multiple identity abuse)</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Findings input text area */}
                                  <div>
                                    <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Ground Findings Narrative (No shorter than 20 characters)</label>
                                    <textarea
                                      value={fieldFindings}
                                      onChange={(e) => setFieldFindings(e.target.value)}
                                      rows={3}
                                      placeholder="e.g. Dispatched to the target physical location. Business license verified on the wall. Met store supervisor Abdi Ibrahim. Stock is actively present. Recommended for approval..."
                                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed font-serif"
                                      required
                                      disabled={!selectedFieldAssignment.gpsCoordinates}
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={!selectedFieldAssignment.gpsCoordinates}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10.5px] uppercase tracking-wider py-2.5 px-5 rounded-xl transition"
                                  >
                                    Compile & Submit Final ground Report Dossier
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>

                          {/* Right Panel: Supervisor Adjudication Matrix Panel & Audit Logs */}
                          <div className="md:col-span-5 space-y-6">
                            {/* STAGE 5: SUPERVISOR DECISION AND FRAUD ESCALATION PANEL */}
                            <section className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow space-y-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">⚖️</span>
                                <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                                  STAGE 5: GOVERNANCE & COMPLIANCE REVIEW DESK
                                </h5>
                              </div>

                              <div className="text-[10px] text-slate-400 space-y-1 bg-slate-800/50 p-3 rounded-xl border border-slate-800/80 leading-normal">
                                <p><strong>Compliance Matrix Rules:</strong></p>
                                <ul className="list-disc pl-3.5 space-y-0.5">
                                  <li>Reports must have formal findings before approval.</li>
                                  <li>Merchant validation leads to "VERIFIED MERCHANT" credentials.</li>
                                  <li className="text-red-400 font-bold">Only Ground Supervisor (Alice) or Managers can sign off.</li>
                                  <li>Only Operations Manager (John) or COO (Silas) can OVERRIDE recommendations.</li>
                                </ul>
                              </div>

                              {selectedFieldAssignment.decidedBy ? (
                                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">FINAL COMPLIANCE ORDER ISSUED</span>
                                    <span className="font-extrabold text-emerald-400 uppercase font-mono">
                                      [{selectedFieldAssignment.status}]
                                    </span>
                                  </div>
                                  <div className="border-t border-slate-800/85 pt-1.5 text-slate-300">
                                    <p>Decided By: <strong className="text-white">{selectedFieldAssignment.decidedBy}</strong> ({selectedFieldAssignment.decidedRole})</p>
                                    <p>Decided At: <span className="font-mono text-[10px] text-slate-400">{new Date(selectedFieldAssignment.decidedAt || '').toLocaleString()}</span></p>
                                    {selectedFieldAssignment.modifiedRecommendation && (
                                      <p className="text-amber-400 text-[10.5px] mt-1">⚠️ Override Recommendation: <u>{selectedFieldAssignment.modifiedRecommendation}</u></p>
                                    )}
                                    {selectedFieldAssignment.supervisorNotes && (
                                      <p className="text-[10.5px] mt-1 bg-slate-900/60 p-2 rounded italic text-slate-400">Notes: "{selectedFieldAssignment.supervisorNotes}"</p>
                                    )}
                                  </div>
                                  {selectedFieldAssignment.badgeIssued && (
                                    <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded border border-emerald-500/30 text-center font-black animate-bounce text-[10.5px]">
                                      🛡️ ISSUED BADGE: {selectedFieldAssignment.badgeIssued}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Override Recommendation Selector (Only for Managers) */}
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                                      Override Recommendation (Operations Manager & COO Only)
                                    </label>
                                    <select
                                      value={fieldOverrideRecommendation}
                                      onChange={(e) => setFieldOverrideRecommendation(e.target.value)}
                                      disabled={!['FIELD_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey)}
                                      className="w-full bg-slate-850 border border-slate-700 rounded p-2 text-xs text-white"
                                    >
                                      <option value="">-- No Override (Accept Agent recommended verdict) --</option>
                                      <option value="Override: Reassign and Audit Again">Override: Reassign and Audit Again</option>
                                      <option value="Override: Force Approve Merchant with Warning">Override: Force Approve Merchant with Warning</option>
                                      <option value="Override: Reject outright based on intelligence leak">Override: Reject outright based on intelligence leak</option>
                                    </select>
                                  </div>

                                  {/* Notes */}
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                                      Supervisor corrective instructions / internal remarks
                                    </label>
                                    <textarea
                                      value={fieldSupervisorNotes}
                                      onChange={(e) => setFieldSupervisorNotes(e.target.value)}
                                      placeholder="Provide the compliance matrix grounds & logic for approval or escalation..."
                                      rows={2}
                                      className="w-full bg-slate-850 border border-slate-700 rounded p-2 text-xs text-white"
                                    />
                                  </div>

                                  {/* Supervisor Action Knobs */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      disabled={!selectedFieldAssignment.findings}
                                      onClick={() => handleAdjudicateFieldAssignment(selectedFieldAssignment.id, 'APPROVE')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9.5px] uppercase tracking-wide p-2.5 rounded-lg transition disabled:opacity-50"
                                    >
                                      ✓ Approve / Certify Badge
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!selectedFieldAssignment.findings}
                                      onClick={() => handleAdjudicateFieldAssignment(selectedFieldAssignment.id, 'REQUEST_INFO')}
                                      className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-[9.5px] uppercase tracking-wide p-2.5 rounded-lg transition disabled:opacity-50"
                                    >
                                      ↩ Return for Details
                                    </button>
                                  </div>

                                  <div className="border-t border-slate-800 pt-3 space-y-2">
                                    <span className="text-[8.5px] uppercase font-black text-slate-500 tracking-wider block">Escalation Threshold Protocols</span>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleAdjudicateFieldAssignment(selectedFieldAssignment.id, 'ESCALATE_CRITICAL')}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[9px] uppercase tracking-wide p-2.5 rounded-lg transition"
                                      >
                                        ⚠️ Escalate to COO Desk
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAdjudicateFieldAssignment(selectedFieldAssignment.id, 'ESCALATE_FRAUD')}
                                        className="bg-red-650 hover:bg-red-600 text-white font-extrabold text-[9px] uppercase tracking-wide p-2.5 rounded-lg transition"
                                      >
                                        🛑 CRITICAL FRAUD ESCALATION
                                      </button>
                                    </div>
                                    <p className="text-[8.5px] text-red-400 text-center font-semibold italic mt-0.5">
                                      *Fraud escalation triggers a physical lock on the merchant trade count & logs a CRM case file dossier automatically!
                                    </p>
                                  </div>
                                </div>
                              )}
                            </section>

                            {/* AUDIT TRAIL LOG ENTRY */}
                            <section className="bg-slate-50 border p-4.5 rounded-2xl space-y-2.5">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">
                                📜 HIGH INTEGRITY AUDIT TIMELINE
                              </span>
                              
                              <div className="font-mono text-[9px] text-slate-500 max-h-[220px] overflow-y-auto space-y-2 pr-1 select-text">
                                {selectedFieldAssignment.history && selectedFieldAssignment.history.length > 0 ? (
                                  selectedFieldAssignment.history.map((hist, idx) => (
                                    <div key={idx} className="bg-white border rounded p-2.5 space-y-1 flex flex-col">
                                      <div className="flex justify-between items-center text-[8px] text-slate-400">
                                        <span>{new Date(hist.timestamp).toLocaleTimeString()}</span>
                                        <span className="font-bold text-red-500">{hist.action}</span>
                                      </div>
                                      <p className="text-slate-700 font-extrabold leading-tight">
                                        👤 {hist.user} <span className="font-medium text-slate-400">({hist.role})</span>
                                      </p>
                                      {hist.notes && (
                                        <p className="text-slate-500 italic bg-slate-50 p-1.5 rounded text-[8.5px]">
                                          "{hist.notes}"
                                        </p>
                                      )}
                                      <div className="flex items-center gap-1 text-[8px] text-slate-400 pt-1 border-t border-dashed mt-1 justify-between">
                                        <span>Pre: {hist.prevStatus}</span>
                                        <span>Post: {hist.newStatus}</span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-400 italic">No official timeline transitions recorded.</p>
                                )}
                              </div>
                            </section>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border text-center p-12 rounded-2xl shadow-sm text-slate-400 text-xs">
                        No inspected field dossier selected. Click on an assignment list card or create a new mission directive above!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* C. FINANCE & AUDITS MODULE PANELS */}
          {activeTab === 'FINANCE' && !rbacError && (
            <div className="space-y-6 animate-fade-in">
              {/* Branding and Subsystem header */}
              <div className="bg-slate-50 border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    💰 Financial Control & Audit Command Center
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Consolidated ledger reconciliations, real-time PSP gateway verification audits, and treasury settlement validation workflows.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-200/60 font-mono text-[9px] text-slate-700 px-3 py-1.5 rounded-lg border">
                  <span>Authorized Profile:</span>
                  <strong className="text-indigo-950 font-black">{currentStaff.name} ({currentStaff.role})</strong>
                </div>
              </div>

              {/* Approval Matrix telemetry summary header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-[10px]">
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider font-bold">Review Reconciliation</span>
                  <strong className="text-indigo-900 font-extrabold">All Roles Allowed (✓)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider font-bold">Approve Reconciliation & Settlement</span>
                  <strong className="text-indigo-900 font-extrabold">Supervisor & Manager (✓)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider font-bold">Large Settlement Approval (&gt;=10k)</span>
                  <strong className="text-indigo-900 font-extrabold">Manager Level Only (✓)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider font-bold">Audit Case Controls</span>
                  <strong className="text-indigo-900 font-extrabold">Supervisor (Init), Manager (Close)</strong>
                </div>
              </div>

              {/* Intelligent Automated Reconciliation Summary Dashboard & Rules Desk */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-6 shadow-md shadow-indigo-950/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-950/80 px-2 py-1 rounded border border-indigo-900 font-mono">
                      🛰️ Operational Status: Auto-Pilot Matcher Live
                    </span>
                    <h5 className="text-base font-black tracking-tight text-white mt-2">
                       Intelligent Auto-Reconciliation Control Tower
                    </h5>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">
                      Exception-based architecture. Automatically compares and matches 99.88% of standard incoming transactions. Highlights only exceptions for expert review.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateTransactions}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3.5 py-2 rounded-xl shadow transition duration-200 flex items-center gap-1.5"
                    >
                      ⚡ Bulk Simulate (+10,000 Tx)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunRevenueScan()}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black px-3.5 py-2 rounded-xl shadow transition duration-200 flex items-center gap-1.5"
                    >
                      🛡️ Scan Rev Leakage
                    </button>
                    <div className="flex items-center bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10">
                      <select
                        id="sample-rate-select"
                        className="bg-transparent text-[10px] text-white outline-none font-bold mr-2 border-none"
                        defaultValue="1.0"
                      >
                        <option value="0.5" className="text-slate-900 font-bold">Sample 0.5%</option>
                        <option value="1.0" className="text-slate-900 font-bold">Sample 1.0%</option>
                        <option value="2.0" className="text-slate-900 font-bold">Sample 2.0%</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const rateSelect = document.getElementById('sample-rate-select') as HTMLSelectElement;
                          handleRunAuditSample(Number(rateSelect?.value || 1.0));
                        }}
                        className="text-amber-300 hover:text-amber-400 text-[10px] font-extrabold uppercase bg-transparent border-none cursor-pointer"
                      >
                        Run Sample Audit
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-850 p-4 border border-white/5 rounded-xl font-semibold">
                    <span className="text-[8.5px] text-indigo-400 font-extrabold uppercase block tracking-wider font-mono">Total Volume Today</span>
                    <strong className="text-lg font-mono font-bold text-white tracking-widest block mt-1 font-mono">
                      {financeStats.transactionsProcessed.toLocaleString()}
                    </strong>
                    <span className="text-[8px] text-slate-405 font-semibold block mt-0.5 font-sans">Central ledger processing index</span>
                  </div>
                  <div className="bg-slate-850 p-4 border border-white/5 rounded-xl font-semibold">
                    <span className="text-[8.5px] text-emerald-400 font-extrabold uppercase block tracking-wider font-mono">Auto-Reconciled Today</span>
                    <strong className="text-lg font-mono font-bold text-emerald-300 tracking-widest block mt-1 font-mono">
                      {financeStats.autoReconciled.toLocaleString()}
                    </strong>
                    <span className="text-[8px] text-emerald-400/90 font-medium block mt-0.5 font-sans">✓ Passed checks (99.88% Auto-pilot)</span>
                  </div>
                  <div className="bg-slate-850 p-4 border border-white/5 rounded-xl font-semibold">
                    <span className="text-[8.5px] text-rose-400 font-extrabold uppercase block tracking-wider font-mono">Exceptions Remaining</span>
                    <strong className="text-lg font-mono font-bold text-rose-400 tracking-widest block mt-1 font-mono">
                      {reconciliations.filter(x => x.status !== 'AUTO_RECONCILED' && x.status !== 'RECONCILED' && x.status !== 'CLOSED' && x.status !== 'RESOLVED').length}
                    </strong>
                    <span className="text-[8px] text-rose-400/90 font-medium block mt-0.5 font-sans font-semibold">🚨 Out of matching rules bounds</span>
                  </div>
                  <div className="bg-slate-850 p-4 border border-white/5 rounded-xl font-semibold">
                    <span className="text-[8.5px] text-amber-400 font-extrabold uppercase block tracking-wider font-mono">Auto-Reconciliation Rate</span>
                    <strong className="text-lg font-mono font-bold text-amber-300 tracking-widest block mt-1 font-mono font-black">
                      {financeStats.successRate}%
                    </strong>
                    <span className="text-[8px] text-slate-400 font-semibold block mt-0.5 font-sans font-semibold">Excels target 99.0%-99.8% bounds</span>
                  </div>
                </div>

                {/* Rules Engine Validation checklist */}
                <div className="bg-slate-850 p-3 rounded-xl flex flex-wrap gap-x-6 gap-y-2 text-[9.5px] text-slate-500 border border-white/5 font-semibold">
                  <span className="text-slate-200">🤖 AI Rules Engine Validation Guards Status:</span>
                  <span className="text-emerald-400">✓ PSP Ledger Match</span>
                  <span className="text-emerald-400">✓ Expected Escrow Coherence</span>
                  <span className="text-emerald-400">✓ Risk Threshold Guard (&lt;Ksh 20k)</span>
                  <span className="text-emerald-400">✓ No Duplicate Hashes</span>
                  <span className="text-emerald-400">✓ Geolocation & Card Velocity Ok</span>
                </div>
              </div>

              {/* MODULE SUB-TAB SELECTOR GRID */}
              <div className="flex flex-wrap gap-1.5 border-b pb-2">
                {[
                  { id: 'ESCROW', label: '📊 Escrow Reconciliation' },
                  { id: 'PSP', label: '🔌 PSP Gateways Match' },
                  { id: 'COMMISSIONS', label: '🧾 Commission Audit' },
                  { id: 'SETTLEMENTS', label: '🏛️ Settlement Approvals' },
                  { id: 'REVENUE', label: '🔍 Revenue Assurance' },
                  { id: 'REFUNDS', label: '💸 Refund Review' },
                  { id: 'AUDITS', label: '📝 Audit Case Files' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setFinanceSubTab(sub.id as any)}
                    className={`text-[9.5px] font-black uppercase tracking-wide px-3 py-2 rounded-lg transition ${
                      financeSubTab === sub.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold border'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* INTERNAL VIEW SWITCHERS FOR THE 7 MODULES */}

              {/* MODULE 1: ESCROW RECONCILIATION & TIER-2 QUEUE */}
              {financeSubTab === 'ESCROW' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-1.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Module 1: Exception Queue Workstation</span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">High-Priority Exception Work Queue</h4>
                    </div>
                    <span className="bg-rose-100 text-rose-900 text-[9px] font-black px-2 py-1 rounded border border-rose-200 uppercase font-mono">
                      Queue workload size: {reconciliations.filter(x => x.status !== 'AUTO_RECONCILED' && x.status !== 'RECONCILED' && x.status !== 'CLOSED' && x.status !== 'RESOLVED').length} Items remaining
                    </span>
                  </div>

                  {/* Filter subselection representation */}
                  <div className="bg-slate-50 border p-2 rounded-xl flex flex-wrap gap-1">
                    {[
                      { id: 'ALL', label: 'All Exceptions' },
                      { id: 'AMOUNT_VARIANCE', label: '⚠️ Amount Variances' },
                      { id: 'FAILED_SETTLEMENT', label: '❌ Settlement Breaks' },
                      { id: 'FRAUD_ALERT', label: '🚨 Fraud Signals' },
                      { id: 'DUPLICATE_PAYMENT', label: '🔌 Webhook Duplicates' },
                      { id: 'COMMISSION_EXCEPTION', label: '🧾 Fee Mismatch' },
                      { id: 'DISPUTE_RAISED', label: '💬 Active Disputes' },
                      { id: 'HIGH_VALUE_AUDIT', label: '👑 High-Value Audit' },
                    ].map(flt => (
                      <button
                        key={flt.id}
                        type="button"
                        onClick={() => setExceptionTypeFilter(flt.id)}
                        className={`text-[9.5px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition ${
                          exceptionTypeFilter === flt.id
                            ? 'bg-slate-800 text-white shadow-sm'
                            : 'hover:bg-slate-200 text-slate-500 font-bold'
                        }`}
                      >
                        {flt.label}
                      </button>
                    ))}
                  </div>

                  {/* Exception cards container */}
                  <div className="grid grid-cols-1 gap-4 font-normal">
                    {reconciliations
                      .filter(recon => {
                        if (recon.status === 'AUTO_RECONCILED') return false; // Filter out bypassed automatic matches
                        if (exceptionTypeFilter === 'ALL') return true;
                        return recon.exceptionType === exceptionTypeFilter;
                      })
                      .map(recon => {
                        const isApproved = ['RECONCILED', 'CLOSED', 'RESOLVED'].includes(recon.status);
                        return (
                          <div key={recon.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-4 border-l-4 border-l-rose-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-indigo-950 text-xs">{recon.id}</span>
                                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    recon.riskTier === 'ENTERPRISE' ? 'bg-purple-950 text-white font-extrabold border' :
                                    recon.riskTier === 'HIGH' ? 'bg-red-100 text-red-900 font-black' :
                                    recon.riskTier === 'MEDIUM' ? 'bg-amber-100 text-amber-900 font-extrabold' : 'bg-slate-100 text-slate-650'
                                  }`}>
                                    Risk: {recon.riskTier}
                                  </span>
                                  <span className="text-[9px] font-mono font-bold text-rose-750 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                    {recon.exceptionType}
                                  </span>
                                  <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    recon.status === 'RECONCILED' || recon.status === 'RESOLVED' || recon.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-800 border'
                                    : recon.status === 'UNDER_INVESTIGATION' ? 'bg-blue-100 text-blue-900 border animate-pulse'
                                    : 'bg-amber-105 text-amber-900 border border-amber-200'
                                  }`}>
                                    {recon.status}
                                  </span>
                                </div>
                                <span className="text-[9.5px] text-slate-400 block mt-1.5 font-semibold">
                                  Transaction Reference: #{recon.transactionId} | Evaluation Ref: {recon.lastChecked ? new Date(recon.lastChecked).toLocaleString() : 'Pending audit evaluation'}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 text-[8px] uppercase tracking-wider block font-bold font-mono">Gross Order Value</span>
                                <strong className="text-xs font-mono font-black text-indigo-950">Ksh {(recon.transactionAmount ?? 2342).toLocaleString()}</strong>
                              </div>
                            </div>

                            {/* Deep Exception details */}
                            <div className="bg-slate-50 p-3 rounded-lg border text-[11px] leading-relaxed text-slate-705">
                              <span className="block font-bold text-slate-800 mb-1 font-sans">🚨 Exception Trigger Report & Analysis:</span>
                              <p className="font-mono text-indigo-950 font-semibold">{recon.exceptionReason || 'Variance in incoming PSP credit ledger matching.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 font-semibold">
                                <span className="text-[8px] text-slate-400 font-bold block uppercase mb-1">Vault Ledger Balance</span>
                                <span className="font-mono font-bold text-slate-850">Ksh {(recon.ledgerAmount ?? recon.expectedEscrow ?? 0).toLocaleString()}</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 font-semibold">
                                <span className="text-[8px] text-slate-400 font-bold block uppercase mb-1">Central Bank Sandbox Settled</span>
                                <span className="font-mono font-bold text-slate-850">Ksh {(recon.mpesaAmount ?? recon.actualEscrow ?? 0).toLocaleString()}</span>
                              </div>
                              <div className="bg-red-50/50 p-2.5 rounded border border-red-100 font-semibold">
                                <span className="text-[8px] text-red-700 font-bold block uppercase mb-1">Variance Identified</span>
                                <span className={`font-mono font-extrabold ${(recon.varianceAmount ?? 0) !== 0 ? 'text-red-650 font-black' : 'text-slate-700'}`}>
                                  Ksh {(recon.varianceAmount ?? 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Justification input box & triggers */}
                            <div className="space-y-2">
                              <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block font-bold">Audit Action & Manual Postings</span>
                              <div className="flex gap-2">
                                <input
                                  id={`recon-justification-${recon.id}`}
                                  type="text"
                                  disabled={isApproved}
                                  placeholder={isApproved ? "Resolved - Ledger timeline locked" : "Describe manual adjustment reasoning & bookkeeping actions..."}
                                  className="bg-slate-50 border rounded text-[11px] p-2 flex-grow font-semibold disabled:opacity-50"
                                />
                                <div className="flex gap-1.5 shrink-0 animate-fade-in">
                                  <button
                                    type="button"
                                    disabled={isApproved}
                                    onClick={() => {
                                      const input = document.getElementById(`recon-justification-${recon.id}`) as HTMLInputElement;
                                      handleEscrowReconAction(recon.id, 'RECONCILED', input?.value || 'Override reconciled by audit officer.');
                                    }}
                                    className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 text-white text-[9.5px] font-extrabold px-3 rounded-lg transition"
                                  >
                                    Resolve Match (✓)
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isApproved}
                                    onClick={() => {
                                      const input = document.getElementById(`recon-justification-${recon.id}`) as HTMLInputElement;
                                      handleEscrowReconAction(recon.id, 'VARIANCE_IDENTIFIED', input?.value || 'Investigation folder launched.');
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white text-[9.5px] font-extrabold px-3 rounded-lg transition"
                                  >
                                    Flag Dispute (⚠️)
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isApproved}
                                    onClick={() => {
                                      const input = document.getElementById(`recon-justification-${recon.id}`) as HTMLInputElement;
                                      handleEscrowReconAction(recon.id, 'ESCALATED', input?.value || 'Escalated to internal auditing supervisor.');
                                    }}
                                    className="bg-purple-600 hover:bg-purple-705 disabled:bg-slate-350 text-white text-[9.5px] font-extrabold px-3 py-1 rounded-lg transition"
                                  >
                                    Escalate (🚨)
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Record Audit timeline */}
                            <div className="bg-slate-50 border p-2.5 rounded-lg text-[9.5px] font-mono leading-relaxed max-h-24 overflow-y-auto">
                              <span className="font-extrabold text-slate-600 uppercase tracking-widest block text-[8px] mb-1">📜 AUDIT CONTROL TRANSFER LOG</span>
                              {recon.auditTrail && recon.auditTrail.length > 0 ? (
                                recon.auditTrail.map((trial: any, tIdx: number) => (
                                  <div key={tIdx} className="border-b border-slate-100 pb-1 mt-1 text-[8.5px]">
                                    <span className="text-slate-400 font-semibold">[{new Date(trial.timestamp).toLocaleTimeString()}]</span>{' '}
                                    <strong className="text-slate-700">{trial.user}</strong> <span className="text-slate-500">({trial.role})</span>{' '}
                                    status change <span className="text-indigo-600 font-extrabold">{trial.prevStatus} ➔ {trial.newStatus}</span>.{' '}
                                    <span className="italic text-slate-500">"Remarks: {trial.justification}"</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-slate-400 italic">No formal transitions signed. Queue waiting for expert intervention.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    {reconciliations.filter(recon => {
                      if (recon.status === 'AUTO_RECONCILED') return false;
                      if (exceptionTypeFilter === 'ALL') return true;
                      return recon.exceptionType === exceptionTypeFilter;
                    }).length === 0 && (
                      <div className="bg-emerald-50 border border-emerald-100 text-center p-8 rounded-xl text-emerald-850 font-bold text-xs">
                        🎉 Splendid: All caught up! No active exception records waiting review in this grouping sub-category.
                      </div>
                    )}
                  </div>

                  {/* Sampling verification results if run! */}
                  {financeStats.lastAuditRun && (
                    <div className="bg-amber-50/40 border border-amber-205 rounded-2xl p-5 space-y-4 animate-fade-in text-normal">
                      <div className="flex justify-between items-center border-b border-amber-100 pb-2">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider font-mono font-black text-amber-805 bg-amber-105 px-2 py-0.5 rounded">
                            🔬 SYSTEM INTEGRITY SAMPLING BOARD
                          </span>
                          <h4 className="text-xs font-black text-amber-900 mt-1">Integrity Point Verification Samples Logs</h4>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-amber-800">
                          Last Checked: {new Date(financeStats.lastAuditRun).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 font-semibold leading-relaxed">
                        To guarantee system safety, the framework Point-Sampled <strong className="text-amber-950 font-black">{financeStats.auditSampleRate}%</strong> of bypassed auto-reconciled transactions. All logs show 100% ledger coherence.
                      </p>

                      <div className="bg-white border rounded-xl overflow-hidden text-[10.5px]">
                        <div className="grid grid-cols-4 bg-slate-50 p-2 font-black border-b text-slate-500 uppercase tracking-tight">
                          <span>Verification ID</span>
                          <span>Registered Account</span>
                          <span>Value Checked</span>
                          <span>Result Ledger Match</span>
                        </div>
                        <div className="divide-y font-mono font-normal">
                          {financeStats.auditRandomSamples && financeStats.auditRandomSamples.map((s: any) => (
                            <div key={s.id} className="grid grid-cols-4 p-2 text-slate-700">
                              <span className="font-bold text-indigo-950 font-mono">{s.id}</span>
                              <span className="font-semibold">{s.sellerHandle}</span>
                              <span className="font-bold font-sans">Ksh {s.amount.toLocaleString()}</span>
                              <span className="text-emerald-600 font-black font-sans uppercase">✓ COHERENT MATCH</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODULE 2: PSP GATEWAYS MATCH */}
              {financeSubTab === 'PSP' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Module 2: PSP gateway Match Verification</span>
                    <span className="bg-teal-100 text-teal-900 text-[8px] font-black px-1.5 py-0.5 rounded">REAL-TIME PORTALS</span>
                  </div>

                  <div className="space-y-4">
                    {pspRecons.map(psp => {
                      const computedPspCollected = psp.pspCollectionTotal ?? psp.pspCollectedAmount ?? 0;
                      const computedPlatformLedger = psp.platformLedgerTotal ?? psp.platformLedgerAmount ?? 0;
                      const computedEscrowLedger = psp.escrowLedgerTotal ?? psp.escrowLedgerAmount ?? psp.platformLedgerAmount ?? 0;
                      return (
                        <div key={psp.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-indigo-950 text-xs font-mono">{psp.id} ({psp.gateway || psp.pspName || 'Gateway'})</span>
                                <span className={`text-[8px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded ${
                                  psp.status === 'MATCHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  psp.status === 'UNMATCHED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                  'bg-purple-100 text-purple-800 border'
                                }`}>{psp.status}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold block mt-1">Safaricom Daraja API Session Key Audit | Last Verified: {psp.reconciledAt ? new Date(psp.reconciledAt).toLocaleTimeString() : 'Awaiting Audit'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-slate-400 block font-bold uppercase">Gateway Collection gross</span>
                              <strong className="text-xs font-mono font-black text-slate-900">Ksh {computedPspCollected.toLocaleString()}</strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
                            <div className="bg-slate-50 p-2 rounded">
                              <span className="text-slate-400 block uppercase tracking-wide font-extrabold text-[7.5px]">Platform Ledger sum</span>
                              <span className="font-mono text-slate-800 font-bold">Ksh {computedPlatformLedger.toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded">
                              <span className="text-slate-400 block uppercase tracking-wide font-extrabold text-[7.5px]">Escrow ledger match</span>
                              <span className="font-mono text-slate-800 font-bold">Ksh {computedEscrowLedger.toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded">
                              <span className="text-slate-400 block uppercase tracking-wide font-extrabold text-[7.5px]">Verified auditor matches</span>
                              <span className="font-mono text-slate-800 font-bold">{psp.reconciledBy || 'Reviewer'}</span>
                            </div>
                            <div className="bg-rose-50 p-2 border border-rose-100 rounded">
                              <span className="text-rose-700 block uppercase tracking-wide font-extrabold text-[7.5px]">Discrepancy Break</span>
                              <span className="font-mono text-rose-600 font-black">
                                Ksh {Math.abs(computedPspCollected - computedPlatformLedger).toLocaleString()}
                              </span>
                            </div>
                          </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handlePspReconAction(psp.id, 'MATCHED', 'Ledgers verified against Daraja collection files.')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] px-3 py-1.5 rounded-lg transition"
                          >
                            Match & Approve (✓)
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePspReconAction(psp.id, 'UNMATCHED', 'Discrepancy identified on gateway settle.')}
                            className="bg-red-500 hover:bg-red-600 text-white font-black text-[9px] px-3 py-1.5 rounded-lg transition"
                          >
                            Investigate Breaks (⚠️)
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePspReconAction(psp.id, 'ESCALATED', 'Daraja collection discrepancies raised.')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[9px] px-3 py-1.5 rounded-lg transition"
                          >
                            Escalate Discrepancy (🚨)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* MODULE 3: COMMISSION VERIFICATION */}
              {financeSubTab === 'COMMISSIONS' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Module 3: Commission Verification Ledger</span>
                    <span className="bg-sky-100 text-sky-900 text-[8px] font-black px-1.5 py-0.5 rounded">FEE RECALCULATION</span>
                  </div>

                  <div className="space-y-4">
                    {commVerifs.map(comm => (
                      <div key={comm.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-indigo-950 font-mono text-xs">{comm.id}</span>
                              <span className="font-bold text-slate-700 text-xs">- {comm.feeType}</span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                comm.status === 'VALIDATED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>{comm.status}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium block mt-1">SST Audit Link: {comm.systemCalculated ? 'Calculations verified by script' : 'Incomplete split'} • Auditor: {comm.auditedBy || 'Global system agent'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-slate-400 block font-bold uppercase font-mono">System Computed Commission</span>
                            <strong className="text-xs font-mono font-black text-indigo-850">Ksh {comm.totalComputed.toLocaleString()}</strong>
                          </div>
                        </div>

                        {/* Split values */}
                        <div className="bg-slate-50 border p-3 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-[10.5px]">
                          <div>
                            <span className="font-semibold text-slate-500 block">System calculated:</span>
                            <strong className="font-mono text-slate-800">Ksh {comm.totalComputed.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500 block">Variance flag state:</span>
                            <span className="text-emerald-700 font-extrabold font-mono">0.00% variance</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500 block">Audited At:</span>
                            <span className="text-slate-600 font-mono font-bold">{comm.auditedAt ? new Date(comm.auditedAt).toLocaleDateString() : 'Pending verification'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500 block">System split ID:</span>
                            <span className="text-indigo-900 font-bold select-all font-mono">SPL-{comm.id.replace('COM-', '')}</span>
                          </div>
                        </div>

                        {/* Input override code to allow recomputation if necessary */}
                        <div className="flex flex-col sm:flex-row gap-2 justify-between items-end sm:items-center">
                          <div className="w-full sm:w-1/2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Recompute Commission Override Amount (Optional)</label>
                            <input
                              id={`comm-override-${comm.id}`}
                              type="number"
                              placeholder="Ksh override..."
                              className="bg-white border rounded text-[11px] p-2 w-full font-mono font-medium"
                            />
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={async () => {
                                const val = (document.getElementById(`comm-override-${comm.id}`) as HTMLInputElement)?.value;
                                if (val) {
                                  try {
                                    const res = await fetch(`/api/admin/finance/commissions/${comm.id}/status`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        status: 'VALIDATED',
                                        user: currentStaff.name,
                                        role: currentStaff.roleKey,
                                        remarks: 'Recomputed splits override manually.',
                                        adjustmentAmount: Number(val)
                                      })
                                    });
                                    if (res.ok) {
                                      alert('Commission recomputed & updated successfully');
                                      fetchOperationsData();
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                } else {
                                  handleCommissionAction(comm.id, 'VALIDATED', 'Validated standard splitting formulas.');
                                }
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] px-3.5 py-2 rounded-lg transition"
                            >
                              Validate & Release Splits
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCommissionAction(comm.id, 'ANOMALY_FLAGGED', 'Flagged for mathematical investigation.')}
                              className="bg-red-500 hover:bg-red-650 text-white font-black text-[9px] px-3.5 py-2 rounded-lg transition"
                            >
                              Flag Anomaly (🚨)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 4: SETTLEMENT APPROVAL MODULE */}
              {financeSubTab === 'SETTLEMENTS' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Module 4: Treasury Settlement approval board</span>
                    <span className="bg-indigo-105 text-indigo-900 text-[8px] font-black px-1.5 py-0.5 rounded">TREASURY LOCKED</span>
                  </div>

                  <div className="space-y-4">
                    {settlements.map(item => {
                      const isLarge = item.amount >= 10000;
                      return (
                        <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-slate-800 space-y-3">
                          {isLarge && (
                            <div className="bg-amber-50 text-amber-900 border border-amber-250 text-[9.5px] p-2.5 rounded-lg font-extrabold flex items-center justify-between">
                              <span>⚠️ CRITICAL EXECUTIVE REVIEW: Large Payout Instruction (Amount &gt;= Ksh 10,000)</span>
                              <span className="bg-amber-600 text-white px-2 py-0.5 rounded font-black text-[8px] uppercase">Manager Required</span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-indigo-950 font-mono text-xs">{item.id}</span>
                                <span className="font-black text-rose-700 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 text-[8.5px] font-mono">{item.type}</span>
                                <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  item.status === 'HOLD' ? 'bg-amber-100 text-amber-800' :
                                  item.status === 'REJECTED' ? 'bg-red-105 text-red-700' : 'bg-slate-100 text-slate-600'
                                }`}>{item.status}</span>
                              </div>
                              <span className="text-[9.5px] text-slate-400 font-semibold block mt-1">Beneficiary: {item.targetBeneficiary} | Audit Code Link: #{item.relatedTransactionId || 'N/A'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-slate-400 block font-bold uppercase">Disbursement Amount</span>
                              <strong className="text-sm font-mono font-black text-slate-900">Ksh {item.amount.toLocaleString()}</strong>
                            </div>
                          </div>

                          {/* Action log form */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Audit Compliance Justification</span>
                            <div className="flex gap-2">
                              <input
                                id={`settle-justification-${item.id}`}
                                type="text"
                                placeholder="State core reason for authorizing/holding settlement block..."
                                className="bg-slate-50 border rounded text-[11px] p-2 flex-grow font-medium"
                              />
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`settle-justification-${item.id}`) as HTMLInputElement;
                                    handleSettlementAction(item.id, 'APPROVED', item.amount, input?.value || '');
                                  }}
                                  className="bg-indigo-950 hover:bg-slate-900 text-white font-extrabold text-[9px] px-3 rounded-lg transition"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`settle-justification-${item.id}`) as HTMLInputElement;
                                    handleSettlementAction(item.id, 'HOLD', item.amount, input?.value || '');
                                  }}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[9px] px-3 rounded-lg transition"
                                >
                                  Hold
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`settle-justification-${item.id}`) as HTMLInputElement;
                                    handleSettlementAction(item.id, 'REJECTED', item.amount, input?.value || '');
                                  }}
                                  className="bg-red-500 hover:bg-red-650 text-white font-extrabold text-[9px] px-3 rounded-lg transition"
                                >
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`settle-justification-${item.id}`) as HTMLInputElement;
                                    handleSettlementAction(item.id, 'ESCALATED_INVESTIGATION', item.amount, input?.value || '');
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[9px] px-3 rounded-lg transition"
                                >
                                  Escalate Investigation
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Historical records */}
                          {item.approvedBy && (
                            <div className="bg-indigo-50/50 p-2.5 rounded-lg text-[9px] font-mono font-medium text-indigo-950">
                              🤝 Approved and signed by <strong>{item.approvedBy}</strong> ({new Date(item.approvedAt).toLocaleDateString()}) • Remarks: <em>"{item.justification || 'Legitimate payload match'}"</em>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODULE 5: REVENUE ASSURANCE */}
              {financeSubTab === 'REVENUE' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Module 5: Revenue Leakage Assurance Control</span>
                    <span className="bg-red-100 text-red-900 text-[8px] font-black px-1.5 py-0.5 rounded">LEAKAGE PREVENTED</span>
                  </div>

                  <div className="space-y-4">
                    {revenueLeakages.map(item => {
                      const computedLeakage = item.estimatedVariance ?? item.estimatedLeakage ?? 0;
                      const computedScenario = item.detailedLeakageScenario ?? item.description ?? 'No extra details provided.';
                      return (
                        <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                            <div>
                              <span className="font-mono font-black text-indigo-950 text-xs">{item.id}</span>
                              <span className="font-extrabold text-slate-800 text-xs block mt-1">{item.leakageType}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-slate-400 block font-bold uppercase font-mono">Estimated Variance Leakage</span>
                              <strong className="text-xs font-mono font-black text-rose-600">Ksh {computedLeakage.toLocaleString()}</strong>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                            🔍 Leakage Scenario Details: <span className="font-mono text-indigo-950 bg-slate-50 border p-1 rounded font-normal">{computedScenario}</span>
                          </div>

                        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-[11px] border">
                          <span>Current Status: <strong className="uppercase font-mono text-rose-700">{item.status}</strong></span>
                          {item.actionTaken && <span>Action Triggered: <strong className="text-slate-850 italic">"{item.actionTaken}"</strong></span>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Corrective Adjustments Form</label>
                          <div className="flex gap-2">
                            <input
                              id={`rav-remarks-${item.id}`}
                              type="text"
                              placeholder="Describe corrective actions & bookkeeping adjustments applied..."
                              className="bg-white border text-[11px] p-2 rounded flex-grow font-medium"
                            />
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const rInput = document.getElementById(`rav-remarks-${item.id}`) as HTMLInputElement;
                                  handleRevenueAssuranceAction(item.id, 'UNDER_INVESTIGATION', rInput?.value || 'Opened leakage investigation record.');
                                }}
                                className="bg-slate-700 hover:bg-slate-800 text-white text-[9.5px] font-black px-3.5 py-1.5 rounded-lg transition"
                              >
                                Investigate Match
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const rInput = document.getElementById(`rav-remarks-${item.id}`) as HTMLInputElement;
                                  handleRevenueAssuranceAction(item.id, 'CORRECTED_JUSTIFIED', rInput?.value || 'Leakage bookkeeping corrected.', 'Journal bookkeeping ledger correction adjustment completed.');
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9.5px] font-black px-3.5 py-1.5 rounded-lg transition"
                              >
                                Correction Applied & Settle (✓)
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* MODULE 6: REFUND REVIEW MODULE */}
              {financeSubTab === 'REFUNDS' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Module 6: Escrow Refund Reviews</span>
                    <span className="bg-slate-105 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded">CUSTOMER ASSURED</span>
                  </div>

                  <div className="space-y-4">
                    {refundReviews.map(ref => (
                      <div key={ref.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-indigo-950 text-xs">{ref.id}</span>
                              <span className="font-bold text-slate-600 text-xs">Customer: {ref.requestedBy}</span>
                              <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                ref.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                ref.status === 'REJECTED' ? 'bg-red-50 text-red-650 border' : 'bg-amber-100 text-amber-800'
                              }`}>{ref.status}</span>
                            </div>
                            <p className="text-[9.5px] text-slate-400 font-semibold mt-1">
                              Transaction Reference: #{ref.transactionId} | Raised Reason: <span className="text-slate-750 font-bold">"{ref.reason}"</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-slate-400 block font-bold uppercase font-mono">Requested Refund</span>
                            <strong className="text-xs font-mono font-black text-indigo-950">Ksh {ref.amount.toLocaleString()}</strong>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Auditor Review Justification</label>
                          <div className="flex gap-2">
                            <input
                              id={`ref-justification-${ref.id}`}
                              type="text"
                              placeholder="Justification for approving or rejecting refund back to trust wallet..."
                              className="bg-slate-50 border rounded text-[11px] p-2 flex-grow font-medium"
                            />
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const val = (document.getElementById(`ref-justification-${ref.id}`) as HTMLInputElement)?.value;
                                  handleRefundReviewAction(ref.id, 'APPROVED', val || 'Approved by audit authority.');
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] px-3 rounded-lg transition"
                              >
                                Approve Refund
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const val = (document.getElementById(`ref-justification-${ref.id}`) as HTMLInputElement)?.value;
                                  handleRefundReviewAction(ref.id, 'REJECTED', val || 'Rejected by audit authority.');
                                }}
                                className="bg-red-500 hover:bg-red-650 text-white font-extrabold text-[9px] px-3 rounded-lg transition"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const val = (document.getElementById(`ref-justification-${ref.id}`) as HTMLInputElement)?.value;
                                  handleRefundReviewAction(ref.id, 'ESCALATE', val || 'Escalation raised for high variance.');
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[9px] px-3 rounded-lg transition"
                              >
                                Escalate
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 7: AUDIT CASE FILE MANAGEMENT */}
              {financeSubTab === 'AUDITS' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Module 7: Internal Audit & Remediation Management</span>
                    <span className="bg-zinc-805 text-white text-[8px] font-black px-1.5 py-0.5 rounded font-mono">SECURE TRANSFERS</span>
                  </div>

                  {/* Create New Audit Dossier Form */}
                  <div className="bg-slate-50 border rounded-2xl p-4.5 space-y-4">
                    <strong className="text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      📝 Initialize New High-Integrity Digital Audit File
                    </strong>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase">Audit Folder Title / Scope</label>
                        <input
                          id="new-audit-title"
                          type="text"
                          placeholder="e.g. Q2 M-Pesa Discrepancy Spot Audit"
                          className="bg-white border rounded text-[11px] p-2.5 w-full font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase">Audit Focus Category</label>
                        <select
                          id="new-audit-category"
                          className="bg-white border rounded text-[11px] p-2.5 w-full font-semibold text-slate-700"
                        >
                          <option value="Financial">Financial Control</option>
                          <option value="Operational">Operational Metrics</option>
                          <option value="Security">Security Perimeter</option>
                          <option value="Merchant">Merchant Compliance</option>
                          <option value="Courier">Courier Logistics</option>
                          <option value="CRM">CRM Ticket Escalation</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase">Assigned Auditor Executive</label>
                        <select
                          id="new-audit-auditor"
                          className="bg-white border rounded text-[11px] p-2.5 w-full font-semibold text-slate-700 font-mono"
                        >
                          {STAFF_LIST.filter(s => s.department === 'Finance' || s.roleKey === 'INTERNAL_AUDITOR').map(st => (
                            <option key={st.id} value={st.name}>{st.name} ({st.role})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const title = (document.getElementById('new-audit-title') as HTMLInputElement)?.value;
                          const category = (document.getElementById('new-audit-category') as HTMLSelectElement)?.value;
                          const assignedTo = (document.getElementById('new-audit-auditor') as HTMLSelectElement)?.value;
                          if (!title) {
                            alert('Please state a valid title scope.');
                            return;
                          }
                          handleCreateAuditCase(title, category, assignedTo);
                        }}
                        className="bg-slate-900 hover:bg-indigo-950 text-white font-black text-[10px] uppercase tracking-wide px-5 py-2.5 rounded-xl shadow-sm transition"
                      >
                        Launch High-Integrity Audit Process ➔
                      </button>
                    </div>
                  </div>

                  {/* Existing Cases Grid */}
                  <div className="space-y-4">
                    <span className="text-[10.5px] font-black text-slate-705 uppercase tracking-widest block font-bold">Active/Historic Audit Dossier Files</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {auditCases.map(caseFile => (
                        <div key={caseFile.id} className="bg-white border rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-[10.5px] uppercase bg-neutral-100 px-2 py-0.5 rounded font-mono text-slate-800">{caseFile.id}</span>
                              <span className={`text-[8.5px] font-black tracking-wider uppercase px-2 py-0.5 rounded-lg border ${
                                caseFile.status === 'CLOSED' ? 'bg-slate-100 text-slate-500 border-slate-250' :
                                caseFile.status === 'UNDER_REMEDIATION' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold'
                              }`}>{caseFile.status}</span>
                            </div>
                            <h5 className="font-extrabold text-slate-800 text-[12.5px] mt-1.5">{caseFile.title}</h5>
                            <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 font-bold uppercase pt-1">
                              <span>Target: {caseFile.category}</span>
                              <span>• Assigned: {caseFile.assignedTo}</span>
                              <span>• Opened: {new Date(caseFile.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg text-[10.5px]">
                            <p className="font-semibold text-slate-700">🔍 Findings: <span className="font-normal text-slate-600 italic">"{caseFile.findings || 'Pending physical audits'}"</span></p>
                            <p className="font-semibold text-slate-700">📦 Issued Recommendations: <span className="font-normal text-slate-600 italic">"{caseFile.recommendations || 'Pending case file update'}"</span></p>
                          </div>

                          <div className="space-y-3.5 pt-2 border-t">
                            <div className="space-y-1.5">
                              <span className="text-[8.5px] text-slate-400 font-black block uppercase tracking-widest">Update Findings & Recommendations Code</span>
                              <div className="grid grid-cols-2 gap-2">
                                <textarea
                                  id={`audit-findings-${caseFile.id}`}
                                  placeholder="Log verified findings..."
                                  className="bg-white border font-medium p-2 text-[10.5px] rounded h-14 w-full"
                                  defaultValue={caseFile.findings || ''}
                                />
                                <textarea
                                  id={`audit-recomms-${caseFile.id}`}
                                  placeholder="Log action instructions..."
                                  className="bg-white border font-medium p-2 text-[10.5px] rounded h-14 w-full"
                                  defaultValue={caseFile.recommendations || ''}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const fin = (document.getElementById(`audit-findings-${caseFile.id}`) as HTMLTextAreaElement)?.value;
                                  const rec = (document.getElementById(`audit-recomms-${caseFile.id}`) as HTMLTextAreaElement)?.value;
                                  handleAuditCaseAction(caseFile.id, 'UNDER_REMEDIATION', fin, rec);
                                }}
                                className="bg-purple-500 hover:bg-purple-600 text-white text-[9px] font-black px-3 py-1.5 rounded transition"
                              >
                                Trigger Remediation
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const fin = (document.getElementById(`audit-findings-${caseFile.id}`) as HTMLTextAreaElement)?.value;
                                  const rec = (document.getElementById(`audit-recomms-${caseFile.id}`) as HTMLTextAreaElement)?.value;
                                  handleAuditCaseAction(caseFile.id, 'CLOSED', fin, rec);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black px-3 py-1.5 rounded transition"
                              >
                                Close Audit (✓)
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* D. HUMAN RESOURCES DEPARTMENT */}
          {/* D. HUMAN RESOURCES DEPARTMENT */}
          {activeTab === 'HR' && !rbacError && (
            <div className="space-y-6 animate-fade-in">
              {/* Header block */}
              <div className="bg-slate-50 border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    👥 Talent Lifecycle & HR Department Control Tower
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium font-bold">
                    Manage organizational vacancies, applicant recruitment pipelines, performance rating systems, incentive disbursements, disciplinary warnings, and emergency succession contingency maps.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-200/60 font-mono text-[9px] text-slate-700 px-3 py-1.5 rounded-lg border">
                  <span>Authorized Profile:</span>
                  <strong className="text-red-950 font-black">{currentStaff.name} ({currentStaff.role})</strong>
                </div>
              </div>

              <HumanResourcesPanel
                currentStaff={currentStaff}
                leaves={leaves}
                staff={staff}
                vacancies={vacancies}
                successionPlan={successionPlan}
                fetchOperationsData={fetchOperationsData}
                STAFF_LIST={STAFF_LIST}
              />

              {false && (
                <div>
                  {/* Bypassed inline legacy code block */}

              {/* Subtab navigation */}
              <div className="flex flex-wrap gap-1.5 border-b pb-2">
                {[
                  { id: 'LEAVES', label: '📅 Leaves & Corporate Directory' },
                  { id: 'VACANCIES', label: '💼 Recruitment & Candidates' },
                  { id: 'TALENT', label: '📈 Talent Matrix (KPI/Disciplinary/Exit)' },
                  { id: 'SUCCESSION', label: '🎯 Succession Planning Contingency' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setHrSubTab(sub.id as any);
                    }}
                    className={`text-[9.5px] font-black uppercase tracking-wide px-3 py-2 rounded-lg transition ${
                      hrSubTab === sub.id
                        ? 'bg-rose-950 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold border'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* HR MODULE SWITCHER */}

              {/* SUBTAB 1: LEAVES & DIRECTORY */}
              {hrSubTab === 'LEAVES' && (
                <div className="space-y-6">
                  {/* Staff Leave Approvals Queue */}
                  <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-bold">Staff Annual Leave Request Forms</span>
                    <div className="space-y-2.5">
                      {leaves.map(lv => (
                        <div key={lv.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-lg border border-slate-250 gap-2 text-[11px]">
                          <div>
                            <strong className="text-slate-800 font-extrabold text-xs">{lv.staffMember}</strong>
                            <span className="text-slate-400 font-bold block">Department: {lv.department} • Type: {lv.type} ({lv.duration})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8.5px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              lv.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : lv.status === 'REJECTED' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800'
                            }`}>{lv.status}</span>
                            {lv.status === 'PENDING' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleLeaveAction(lv.id, lv.staffMember, 'APPROVED')}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[8.5px] px-2.5 py-1 rounded transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleLeaveAction(lv.id, lv.staffMember, 'REJECTED')}
                                  className="bg-red-500 hover:bg-red-650 text-white font-extrabold text-[8.5px] px-2.5 py-1 rounded transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Corporate Staff Directory */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-bold">Corporate Directory (RBAC Clearances)</span>
                    <div className="overflow-x-auto border rounded-xl bg-white shadow-sm scrollbar-thin">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 font-extrabold border-b">
                            <th className="p-2.5">ID</th>
                            <th className="p-2.5">Name</th>
                            <th className="p-2.5">Corporate Role</th>
                            <th className="p-2.5">Department</th>
                            <th className="p-2.5">Email Contact</th>
                            <th className="p-2.5 text-center">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staff.map(st => (
                            <tr key={st.id} className="border-b hover:bg-slate-50/50">
                              <td className="p-2.5 font-mono font-bold text-slate-500">{st.id}</td>
                              <td className="p-2.5 font-bold text-slate-800">{st.name}</td>
                              <td className="p-2.5 text-slate-600 font-medium">{st.role}</td>
                              <td className="p-2.5">
                                <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[9.5px] uppercase">
                                  {st.department}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-slate-400">{st.email}</td>
                              <td className="p-2.5 font-mono text-center text-emerald-600 font-extrabold">{st.performanceRating?.toFixed(1)}/5.0</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: RECRUITMENT & CANDIDATES */}
              {hrSubTab === 'VACANCIES' && (
                <div className="space-y-6">
                  {/* Create vacancy Requisition Opening Form */}
                  <div className="bg-slate-50 border rounded-2xl p-4.5 space-y-4">
                    <strong className="text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 font-bold">
                      💼 Launch New Talent Acquisition Requisition
                    </strong>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase">Vacancy Job Title</label>
                        <input
                          id="new-vac-title"
                          type="text"
                          placeholder="e.g. Senior Settlement Analyst"
                          className="bg-white border rounded text-[11px] p-2.5 w-full font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase">Target Department</label>
                        <select
                          id="new-vac-dept"
                          className="bg-white border rounded text-[11px] p-2.5 w-full font-semibold text-slate-700"
                        >
                          <option value="Finance">Finance</option>
                          <option value="HR">HR</option>
                          <option value="CRM">CRM</option>
                          <option value="Field Ops">Field Ops</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase">Internal Core Duties Description</label>
                        <input
                          id="new-vac-desc"
                          type="text"
                          placeholder="e.g. Carry out M-Pesa sandbox audits"
                          className="bg-white border rounded text-[11px] p-2.5 w-full font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const title = (document.getElementById('new-vac-title') as HTMLInputElement)?.value;
                          const dept = (document.getElementById('new-vac-dept') as HTMLSelectElement)?.value;
                          const desc = (document.getElementById('new-vac-desc') as HTMLInputElement)?.value;
                          if (!title || !desc) {
                            alert('Please state vacancy job title & core duties.');
                            return;
                          }
                          handleCreateVacancy(title, dept, desc);
                        }}
                        className="bg-rose-950 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-wide px-5 py-2.5 rounded-xl shadow-sm transition"
                      >
                        Launch Vacancy Campaign ➔
                      </button>
                    </div>
                  </div>

                  {/* Vacancy active pipeline grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: List of vacancies */}
                    <div className="md:col-span-1 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-bold">Active Requisitions ({vacancies.length})</span>
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 flex flex-col">
                        {vacancies.map(vac => (
                          <div
                            key={vac.id}
                            onClick={() => setSelectedVacancyId(vac.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer text-[11px] transition ${
                              selectedVacancyId === vac.id
                                ? 'bg-rose-50 border-rose-400 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-mono font-bold text-[9.5px] text-slate-400">{vac.id}</span>
                              <span className={`text-[8px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded ${
                                vac.status === 'PUBLISHED' ? 'bg-purple-100 text-purple-850' :
                                vac.status === 'CLOSED' ? 'bg-slate-100 text-slate-500' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>{vac.status}</span>
                            </div>
                            <h5 className="font-black text-slate-900 text-[11.5px] mt-1">{vac.title}</h5>
                            <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[8.5px] uppercase mt-1.5 inline-block">
                              {vac.department}
                            </span>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold pt-2 border-t mt-2">
                              <span>Applicants: {vac.candidatesCount}</span>
                              <span className="text-indigo-900">Click to view details ➔</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column: Vacancy Candidates workflow progression */}
                    <div className="md:col-span-2 space-y-4">
                      {selectedVacancyId ? (() => {
                        const activeVac = vacancies.find(v => v.id === selectedVacancyId);
                        if (!activeVac) return <p className="text-slate-450 text-[11px]">Select a vacancy list item.</p>;
                        return (
                          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
                            <div className="flex justify-between items-start border-b pb-3">
                              <div>
                                <h4 className="font-black text-slate-900 text-sm">{activeVac.title} Campaign Details</h4>
                                <span className="text-[10px] text-slate-400 font-mono block mt-1">Ref ID: {activeVac.id} | Status: <strong className="text-rose-900 uppercase font-black">{activeVac.status}</strong></span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleVacancyStatusChange(activeVac.id, 'PUBLISHED', `Campaign published to open job boards.`)}
                                  className="bg-indigo-900 text-white font-bold text-[9.5px] px-3 py-1.5 rounded transition"
                                >
                                  Publish Campaign
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVacancyStatusChange(activeVac.id, 'CLOSED', 'Campaign closed.')}
                                  className="bg-slate-900 text-white font-bold text-[9.5px] px-3 py-1.5 rounded transition"
                                >
                                  Close Campaign
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-lg border">
                              📋 Target Scope Details: "{activeVac.description}"
                            </p>

                            {/* Candidate applications */}
                            <div className="space-y-3">
                              <span className="text-[10.5px] font-black text-slate-700 uppercase tracking-widest block font-bold">Active Candidates Pipeline List</span>
                              <div className="space-y-2.5 text-[11px]">
                                {activeVac.candidates && activeVac.candidates.map((cand: any) => (
                                  <div key={cand.email} className="bg-slate-50 border p-3.5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div>
                                      <strong className="text-slate-800 text-xs font-extrabold">{cand.name}</strong>
                                      <span className="text-slate-400 font-bold block">{cand.email} | Audited score: <strong className="text-indigo-900 font-mono">{cand.score || 0}%</strong></span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`text-[8px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded ${
                                        cand.status === 'HIRED' ? 'bg-emerald-100 text-emerald-800' :
                                        cand.status === 'INTERVIEWED' ? 'bg-purple-100 text-purple-800' :
                                        'bg-slate-200 text-slate-705'
                                      }`}>{cand.status}</span>
                                      
                                      {/* Actions */}
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleCandidateStatusChange(activeVac.id, cand.email, 'INTERVIEWED', cand.score || 85)}
                                          className="bg-indigo-900 text-white text-[8px] px-2 py-1 rounded font-bold transition"
                                        >
                                          Mark Interviewed
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleCandidateStatusChange(activeVac.id, cand.email, 'HIRED', cand.score || 95)}
                                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] px-2 py-1 rounded font-black uppercase transition"
                                        >
                                          Hired & Create Login Code
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {(!activeVac.candidates || activeVac.candidates.length === 0) && (
                                  <p className="text-slate-405 italic">No active candidate applications yet. Switch status to "PUBLISHED" to trigger applicant profiles.</p>
                                )}
                              </div>
                            </div>

                            {/* Campaign log timeline */}
                            <div className="bg-slate-900 text-slate-200 border p-3 rounded-lg text-[9.5px] font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                              <span className="font-extrabold tracking-widest text-indigo-400 block text-[8px] mb-1">// IMMUTABLE DIGITAL CAMPAIGN TRAIL</span>
                              {activeVac.recruitWorkflowLogs && activeVac.recruitWorkflowLogs.map((lg: any, lgIdx: number) => (
                                <div key={lgIdx} className="border-b border-slate-800 pb-1.5 mt-1">
                                  [{lg.date}] - {lg.event}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="bg-white border text-center p-12 rounded-2xl text-slate-400 text-[11.5px] font-medium">
                          No Active Vacancy selected. Pick a vacancy folder tracking card in the left list parameter or initialize a new requisition opening above!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: TALENT MATRIX */}
              {hrSubTab === 'TALENT' && (
                <div className="space-y-6">
                  <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-[10.5px]">
                    <strong className="text-amber-900 block font-bold mb-1">⚖️ CORPORATE COMPLIANCE NOTICE FOR HR MANAGERS</strong>
                    All staff separation, disciplinary warnings, and financial bonus disbursements trigger auditable state updates. All data is written directly to CBK databases.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Staff member picker */}
                    <div className="md:col-span-1 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-bold">Select Corporate Personnel</span>
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 flex flex-col">
                        {staff.map(st => (
                          <div
                            key={st.id}
                            onClick={() => setSelectedStaffIdForTalent(st.id)}
                            className={`p-3 rounded-xl border cursor-pointer text-[11px] transition ${
                              selectedStaffIdForTalent === st.id
                                ? 'bg-rose-50 border-rose-400 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold mb-1">
                              <span>{st.id}</span>
                              <span className="text-emerald-700 font-mono font-black">{st.performanceRating?.toFixed(1) || 'N/A'}/5.0</span>
                            </div>
                            <strong className="text-slate-800 font-extrabold block text-[11.5px]">{st.name}</strong>
                            <span className="text-slate-500 block text-[9.5px] font-bold mt-0.5">{st.role} • <span className="text-slate-450 italic font-mono">{st.department}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column: Action Panel */}
                    <div className="md:col-span-2 space-y-6">
                      {selectedStaffIdForTalent ? (() => {
                        const targetSt = staff.find(s => s.id === selectedStaffIdForTalent);
                        if (!targetSt) return null;
                        return (
                          <div className="space-y-6">
                            {/* Staff profile summary */}
                            <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
                              <div className="flex justify-between border-b pb-2">
                                <div>
                                  <h4 className="font-extrabold text-slate-800 text-sm">Action Console: {targetSt.name}</h4>
                                  <span className="text-[10.5px] font-bold text-indigo-900">Department: {targetSt.department} | Contract: {targetSt.contractType || 'Full-time'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Performance Matrix Average</span>
                                  <strong className="text-emerald-700 font-mono font-black text-sm">{targetSt.performanceRating?.toFixed(1) || '0.0'}/5.0</strong>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono leading-relaxed bg-slate-50 p-2 rounded border">
                                <div>
                                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Joining Date</span>
                                  <span className="text-slate-707 font-black">{targetSt.joinDate || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Staff Status</span>
                                  <span className="text-rose-900 font-extrabold uppercase">{targetSt.status || 'Active'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Rewards Disbursed</span>
                                  <span className="text-emerald-600 font-extrabold">Ksh {targetSt.rewardsHistory?.reduce((a: number, b: any) => a + (b.bonusAmount || 0), 0).toLocaleString() || 0}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Warnings Filed</span>
                                  <span className="text-red-650 font-black">{targetSt.disciplinaryRecords?.length || 0} Incident Reports</span>
                                </div>
                              </div>
                            </div>

                            {/* Talent Matrix Form 1: KPI Evaluations */}
                            <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-3">
                              <span className="text-[10px] uppercase font-bold text-indigo-950 tracking-wider block font-bold">📈 Register Official KPI evaluation</span>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9.5px] text-slate-505 font-extrabold block">KPI Rating Score (0 to 100)</label>
                                  <input id="talent-review-kpi" type="number" min="0" max="100" defaultValue="85" className="bg-slate-50 border rounded text-[11px] p-2 w-full font-mono font-bold" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9.5px] text-slate-505 font-extrabold block">Review Evaluation Period</label>
                                  <input id="talent-review-period" type="text" defaultValue="Q2 Review Cycle" className="bg-slate-50 border rounded text-[11px] p-2 w-full font-semibold" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9.5px] text-slate-505 font-extrabold block">General Evaluation Outcome</label>
                                  <select id="talent-review-outcome" className="bg-slate-50 border rounded text-[11px] p-2 w-full font-bold text-slate-700">
                                    <option value="EXCEEDS_EXPECTATIONS">Meets/Exceeds expectations</option>
                                    <option value="DEVELOPMENT_NEEDED">Underperforming - Needs core coaching</option>
                                    <option value="PROBATION">Immediate probation flag</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9.5px] text-slate-505 font-extrabold block">Manager Detailed Review Comments</label>
                                <textarea id="talent-review-remarks" placeholder="Provide factual KPI comments..." className="bg-slate-50 border text-[11px] p-2 rounded w-full font-medium h-12" />
                              </div>
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const score = Number((document.getElementById('talent-review-kpi') as HTMLInputElement)?.value);
                                    const period = (document.getElementById('talent-review-period') as HTMLInputElement)?.value;
                                    const evalOut = (document.getElementById('talent-review-outcome') as HTMLSelectElement)?.value;
                                    const remarks = (document.getElementById('talent-review-remarks') as HTMLTextAreaElement)?.value;
                                    handleStaffPerformance(targetSt.id, period, score, evalOut, remarks || 'Regular review cycle documented.');
                                  }}
                                  className="bg-indigo-900 text-white font-extrabold text-[9.5px] px-3.5 py-2 rounded-lg transition"
                                >
                                  Commit KPI Review Log (✓)
                                </button>
                              </div>
                            </div>

                            {/* Talent Matrix Form 2: Disciplinary Controls */}
                            <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-3">
                              <span className="text-[10px] uppercase font-bold text-red-750 tracking-wider block font-bold">⚖️ Incident Case Warn Records & Hearings</span>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9.5px] text-slate-505 font-extrabold block">Incident Description</label>
                                  <input id="talent-disc-desc" type="text" placeholder="e.g. Unreconciled vault count" className="bg-slate-50 border rounded text-[11px] p-2 w-full font-medium" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9.5px] text-slate-505 font-extrabold block">Audit Issue classification</label>
                                  <input id="talent-disc-notes" type="text" placeholder="e.g. Finance perimeter guidelines breach" className="bg-slate-50 border rounded text-[11px] p-2 w-full font-medium" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9.5px] text-slate-505 font-extrabold block">Formal Decision / Outcome</label>
                                  <select id="talent-disc-outcome" className="bg-slate-50 border rounded text-[11px] p-2 w-full font-bold text-slate-750">
                                    <option value="Written Warning">Written Warning Directive</option>
                                    <option value="Suspension">Temporary Suspension Phase</option>
                                    <option value="Termination">Immediate Separation Action</option>
                                    <option value="Case Cleared">Case Cleared / Justified</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const desc = (document.getElementById('talent-disc-desc') as HTMLInputElement)?.value;
                                    const classification = (document.getElementById('talent-disc-notes') as HTMLInputElement)?.value;
                                    const outcome = (document.getElementById('talent-disc-outcome') as HTMLSelectElement)?.value;
                                    if (!desc || !classification) {
                                      alert('Please provide dynamic description & classification.');
                                      return;
                                    }
                                    handleStaffDisciplinary(targetSt.id, desc, 'Hearing_Finalised', outcome, classification);
                                  }}
                                  className="bg-red-500 hover:bg-red-650 text-white font-extrabold text-[9.5px] px-3.5 py-2 rounded-lg transition"
                                >
                                  File Formal Decision warning (⚠️)
                                </button>
                              </div>
                            </div>

                            {/* Talent Matrix Form 3: Offboarding checklist */}
                            <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-3">
                              <span className="text-[10px] uppercase font-bold text-slate-705 tracking-wider block font-bold">🛑 Staff Separation exit offboarding checklists</span>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-2 text-[10.5px] font-bold rounded">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input id="talent-sep-eq" type="checkbox" className="rounded" />
                                  <span>Equipment Returned</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input id="talent-sep-access" type="checkbox" className="rounded" />
                                  <span>Digital Access Removed</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input id="talent-sep-settle" type="checkbox" className="rounded font-bold" />
                                  <span>Exit Payout Approved</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input id="talent-sep-trans" type="checkbox" className="rounded" />
                                  <span>Knowledge Transferred</span>
                                </label>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px]">
                                <div className="flex-grow w-full">
                                  <select id="talent-sep-type" className="bg-slate-50 border rounded text-[11px] p-2 w-full font-bold text-slate-750">
                                    <option value="Resignation">Voluntary Resignation</option>
                                    <option value="Termination">Involuntary Termination Action</option>
                                    <option value="End of Contract">Standard Contract Expiration</option>
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const eq = (document.getElementById('talent-sep-eq') as HTMLInputElement)?.checked;
                                    const access = (document.getElementById('talent-sep-access') as HTMLInputElement)?.checked;
                                    const settle = (document.getElementById('talent-sep-settle') as HTMLInputElement)?.checked;
                                    const transfer = (document.getElementById('talent-sep-trans') as HTMLInputElement)?.checked;
                                    const type = (document.getElementById('talent-sep-type') as HTMLSelectElement)?.value;
                                    handleStaffSeparation(targetSt.id, type, eq, access, settle, transfer);
                                  }}
                                  className="bg-slate-900 hover:bg-rose-950 text-white font-extrabold text-[9.5px] px-3.5 py-2 rounded-lg transition shrink-0"
                                >
                                  Process separation Exit Dossier
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="bg-white border text-center p-12 rounded-2xl text-slate-400 text-[11.5px] font-medium">
                          No Personal dossier selected. Select a employee in the left list parameter to file Performance KPI evaluations, warning incident hearings, exit offboarding checks, or awards!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: SUCCESSION PLANNING */}
              {hrSubTab === 'SUCCESSION' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-bold">Module 4: Corporate Talent succession contingency maps</span>
                    <span className="bg-rose-950 text-white text-[8px] font-black px-1.5 py-0.5 rounded font-mono">CRITICAL POSITIONS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {successionPlan.map((succ, index) => (
                      <div key={index} className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-2">
                        <div className="flex justify-between items-start border-b pb-1.5">
                          <div>
                            <span className="bg-slate-100 text-slate-700 font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded-md">Contingency Map</span>
                            <h5 className="font-extrabold text-slate-800 text-[13px] mt-1.5">{succ.position}</h5>
                          </div>
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded ${
                            succ.riskTier === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                            succ.riskTier === 'HIGH' ? 'bg-amber-50 text-amber-500 border border-amber-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>{succ.riskTier} RISK</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[11px] pt-1">
                          <div className="bg-slate-50/70 p-2.5 rounded border">
                            <span className="text-slate-400 block font-bold text-[8.5px] uppercase tracking-wider mb-0.5">Active Incumbent Officer</span>
                            <strong className="text-slate-800 font-extrabold">{succ.incumbent}</strong>
                          </div>
                          <div className="bg-rose-50/50 p-2.5 border border-rose-100 rounded">
                            <span className="text-rose-500 block font-bold text-[8.5px] uppercase tracking-wider mb-0.5 font-bold">Designated successor</span>
                            <strong className="text-rose-900 font-extrabold">{succ.designatedSuccessor}</strong>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-1">
                          <span>Readiness Clearance: <strong className="text-indigo-900 uppercase">{succ.readinessLevel}</strong></span>
                          <span>Transfer Target Date: <strong className="font-mono text-slate-700">{succ.targetDate}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </div>
              )}
            </div>
          )}

          {/* E. SYSADMIN & IMMUTABLE AUDIT LOGS */}
          {activeTab === 'SYS_LOGS' && !rbacError && (
            <div className="space-y-6">
              
              {/* POC MAIN HEADER */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-wider text-indigo-400 uppercase bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      🚨 Platform Operations Command Center (POCC)
                    </span>
                    <h3 className="text-base font-black text-white mt-1">Buy Safely Infrastructure & Operations Console</h3>
                    <p className="text-[10px] text-slate-400">Authorized personnel only. Logs are written to secure internal microservices in real-time.</p>
                  </div>

                  {/* ADMIN SIMULATOR ROLE LEVEL SELECTOR */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="text-left">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block leading-none">Administrative Credentials Level</span>
                      <strong className="text-[11px] font-bold text-slate-205">Simulate Clearance Level:</strong>
                    </div>
                    <select
                      value={adminLevel}
                      onChange={(e) => {
                        const level = parseInt(e.target.value);
                        setAdminLevel(level);
                        triggerLogWrite("Simulated admin clearance level change", `Level ${adminLevel}`, `Level ${level}`);
                      }}
                      className="bg-slate-900 border border-slate-700 text-white text-[11px] font-extrabold rounded-lg p-2 focus:ring-1 focus:ring-red-500 cursor-pointer"
                    >
                      <option value={1}>Level 1 – Support Administrator</option>
                      <option value={2}>Level 2 – Systems Administrator</option>
                      <option value={3}>Level 3 – Security Administrator</option>
                      <option value={4}>Level 4 – Infrastructure Supervisor</option>
                      <option value={5}>Level 5 – Head of Technology / PlatOps</option>
                    </select>
                  </div>
                </div>

                {/* REALTIME SYSTEM INTEGRITY KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-center space-y-1">
                    <span className="text-[8px] font-black text-slate-500 block uppercase tracking-wide">Plat Uptime</span>
                    <strong className="text-xs font-mono font-black text-emerald-400">99.98%</strong>
                    <span className="text-[7.5px] text-slate-500 block">SLA Target: 99.95%+</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-center space-y-1">
                    <span className="text-[8px] font-black text-slate-500 block uppercase tracking-wide">Avg SLA Resolution</span>
                    <strong className="text-xs font-mono font-black text-white">18.4 min</strong>
                    <span className="text-[7.5px] text-emerald-500 block">✓ Sub SLA Goal</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-center space-y-1">
                    <span className="text-[8px] font-black text-slate-500 block uppercase tracking-wide">Security Incidents</span>
                    <strong className="text-xs font-mono font-black text-amber-400">0 Active Critical</strong>
                    <span className="text-[7.5px] text-slate-500 block">4 mitigations logged</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-center space-y-1">
                    <span className="text-[8px] font-black text-slate-500 block uppercase tracking-wide">API Callback Success</span>
                    <strong className="text-xs font-mono font-black text-white">99.85%</strong>
                    <span className="text-[7.5px] text-slate-500 block">1 M-Pesa error flagged</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-center space-y-1">
                    <span className="text-[8px] font-black text-slate-500 block uppercase tracking-wide">Database Cohesion</span>
                    <strong className="text-xs font-mono font-black text-emerald-400">100.0% COHERENT</strong>
                    <span className="text-[7.5px] text-slate-500 block">3 minor anomalies traced</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-center space-y-1">
                    <span className="text-[8px] font-black text-slate-500 block uppercase tracking-wide">Backup Success Rate</span>
                    <strong className="text-xs font-mono font-black text-white">100.0% COMPLETE</strong>
                    <span className="text-[7.5px] text-slate-500 block">Verified on isolated S3</span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC TWO COLUMN SPLIT PANELS WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* LEFT RAIL MODULE NAVIGATION SELECTION & APPROVAL MATRIX CHEAT-SHEET */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white border rounded-xl p-3 shadow-sm space-y-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-1 font-sans">Active Operational Modules</span>
                    <div className="flex flex-col gap-1">
                      {[
                        { id: 'SUPPORT', label: '1. User Support Center', icon: HelpCircle, badge: supportTickets.filter(x => x.status === 'OPEN' || x.status === 'INVESTIGATING').length, badgeColor: 'bg-red-100 text-red-800' },
                        { id: 'ACCOUNTS', label: '2. User Accounts Lock', icon: Users, badge: adminAccounts.filter(x => x.status === 'Locked' || x.status === 'Suspended').length, badgeColor: 'bg-amber-100 text-amber-900 font-bold' },
                        { id: 'RBAC', label: '3. RBAC Privileges Map', icon: Key },
                        { id: 'SERVICES', label: '4. Service Heartbeats', icon: Activity, badge: monitoredServices.filter(x => x.status === 'Intermittent' || x.status === 'Failover').length, badgeColor: 'bg-indigo-100 text-indigo-900 animate-pulse' },
                        { id: 'INCIDENTS', label: '5. Incident Response', icon: AlertOctagon, badge: majorIncidents.filter(x => x.status === 'INVESTIGATING' || x.status === 'INCIDENT_CREATED').length, badgeColor: 'bg-rose-500 text-white font-mono' },
                        { id: 'SOC', label: '6. SOC Alerts Radar', icon: Shield, badge: socAlerts.filter(x => x.status === 'Active Alert').length, badgeColor: 'bg-red-500 text-white font-mono' },
                        { id: 'INTEGRATIONS', label: '7. External API Gateways', icon: GitPullRequest },
                        { id: 'CONFIG', label: '8. Platform Config Rules', icon: Settings },
                        { id: 'INTEGRITY', label: '9. Data Cleansing Cleanse', icon: Database, badge: dataAnomalyRecords.length, badgeColor: 'bg-slate-300 text-slate-800 font-bold' },
                        { id: 'RECOVERY', label: '10. Disaster Recovery', icon: HardDrive },
                        { id: 'AUDIT_SEARCH', label: '11. Enhanced Audit Search', icon: Search },
                        { id: 'CHANGE_MGMT', label: '12. Change Management RFC', icon: FileCheck, badge: changeRequests.filter(x => x.status === 'REQUESTED').length, badgeColor: 'bg-amber-500 text-white font-mono' }
                      ].map((sub) => {
                        const IconComponent = sub.icon;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSysAdminSubTab(sub.id)}
                            className={`w-full text-left text-[11px] font-extrabold p-2.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                              sysAdminSubTab === sub.id
                                ? 'bg-indigo-900 text-white shadow-sm font-black'
                                : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-3.5 h-3.5 shrink-0" />
                              <span>{sub.label}</span>
                            </div>
                            {sub.badge !== undefined && sub.badge > 0 && (
                              <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-black ${sub.badgeColor}`}>
                                {sub.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OPERATIONAL CHANGE & INTERVENTION APPROVAL MATRIX */}
                  <div className="bg-slate-900 text-slate-300 rounded-xl p-3 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[9px] font-black uppercase text-indigo-305 tracking-wider font-mono">Operations Permission Matrix</span>
                    </div>
                    <div className="space-y-2 text-[10px] font-normal leading-relaxed">
                      <p className="text-[9px] text-slate-400 font-sans italic">The Buy Safely Platform Operations Center restricts actions by minimum Clearance level:</p>
                      <div className="divide-y divide-slate-800 text-[10px] font-mono">
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Unlock & Reset password</span>
                          <span className="text-emerald-400 font-bold">L1-L5 ✓</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Suspend / Modify Roles</span>
                          <span className="text-yellow-400 font-bold">L2-L5 ⚡</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Mitigate SOC Threats</span>
                          <span className="text-amber-500 font-bold">L3-L5 🚨</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Rule change approval</span>
                          <span className="text-red-400 font-bold">L4-L5 👑</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Disaster Failover execution</span>
                          <span className="text-rose-500 font-bold">L5 Head of Tech Only</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT OPERATIONS PANEL CONTENT */}
                <div className="lg:col-span-3 bg-white border rounded-2xl p-5 shadow-sm min-h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sysAdminSubTab}
                      initial={{ opacity: 0, y: 7 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -7 }}
                      className="space-y-5"
                    >
                      
                      {/* SUB TAB 1: USER SUPPORT CENTER */}
                      {sysAdminSubTab === 'SUPPORT' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center flex-wrap gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🛠️ Technical Support Center & Incident Case Dispatch</h4>
                              <p className="text-[10px] text-slate-400 font-medium">Manage internal malfunctions, courier mobile glitches, locks, and validation errors under strict RBAC audit guidelines.</p>
                            </div>
                            <span className="bg-red-50 border border-red-200 text-red-800 text-[9px] font-mono font-black px-2 py-1 rounded">
                              Active workload: {supportTickets.filter(x => x.status !== 'RESOLVED' && x.status !== 'CLOSED').length} tickets
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* CASE DISPATCH LIST */}
                            <div className="md:col-span-2 space-y-3">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Live Incidents Queue</span>
                              <div className="space-y-4">
                                {supportTickets.map((tkt) => {
                                  // Determine badge styles for status
                                  const getStatusBadge = (status: string) => {
                                    switch (status) {
                                      case 'NEW':
                                        return 'bg-blue-105 text-blue-800 border-blue-200';
                                      case 'ASSIGNED':
                                        return 'bg-slate-100 text-slate-800 border-slate-205';
                                      case 'INVESTIGATING':
                                        return 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-bold';
                                      case 'ROOT_CAUSE_IDENTIFIED':
                                        return 'bg-teal-50 text-teal-850 border-teal-200 font-bold';
                                      case 'FIX_IN_PROGRESS':
                                        return 'bg-purple-105 text-purple-850 border-purple-200';
                                      case 'TESTING':
                                        return 'bg-pink-100 text-pink-850 border-pink-200';
                                      case 'RESOLUTION_PENDING_APPROVAL':
                                        return 'bg-red-100 text-red-900 border-red-300 font-extrabold animate-pulse';
                                      case 'RESOLVED':
                                        return 'bg-emerald-50 text-emerald-850 border-emerald-200';
                                      case 'CLOSED':
                                        return 'bg-slate-200 text-slate-600 border-slate-300';
                                      case 'AWAITING_INFORMATION':
                                        return 'bg-indigo-50 text-indigo-850 border-indigo-200';
                                      default:
                                        return 'bg-slate-50 text-slate-700 border-slate-200';
                                    }
                                  };

                                  // Determine authorized actions by clearance level list
                                  const canInvestigate = adminLevel >= 1;
                                  const canResolve = adminLevel >= 2;
                                  const canReassign = adminLevel >= 2;
                                  const canSupervisorApprove = adminLevel >= 3 && tkt.status === 'RESOLUTION_PENDING_APPROVAL';
                                  const canClose = adminLevel >= 3 || (adminLevel === 1 && tkt.urgency !== 'Critical');
                                  const canReopen = adminLevel === 5 && tkt.status === 'CLOSED';

                                  return (
                                    <div key={tkt.id} className={`border rounded-xl p-3.5 space-y-3 transition shadow-xs bg-white hover:shadow-sm ${
                                      tkt.urgency === 'Critical' ? 'border-l-4 border-l-red-650 bg-red-50/5' :
                                      tkt.urgency === 'High' ? 'border-l-4 border-l-orange-500 bg-orange-50/5' : 'border-l-4 border-l-slate-400'
                                    }`}>
                                      {/* HEADER INFO */}
                                      <div className="flex justify-between items-start flex-wrap gap-1 border-b border-slate-100 pb-2">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <strong className="text-xs font-black text-indigo-950 font-mono">{tkt.id}</strong>
                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                              tkt.urgency === 'Critical' ? 'bg-red-650 text-white' :
                                              tkt.urgency === 'High' ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-slate-100 text-slate-705 border'
                                            }`}>
                                              {tkt.urgency}
                                            </span>
                                            <span className="text-[9px] bg-slate-100 font-bold px-1.5 py-0.5 text-slate-600 rounded font-mono">{tkt.category}</span>
                                          </div>
                                          <h5 className="text-[11.5px] font-extrabold text-slate-850 mt-1 leading-tight">{tkt.title}</h5>
                                        </div>
                                        <div className="text-right">
                                          <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded border ${getStatusBadge(tkt.status)}`}>
                                            {tkt.status}
                                          </span>
                                        </div>
                                      </div>

                                      {/* NOTES & RECENT RESOLUTIONS */}
                                      <div className="space-y-1.5 text-[10.5px]">
                                        <p className="text-slate-600 font-semibold bg-slate-50 p-2 rounded-lg border border-slate-100">
                                          <strong className="text-slate-400 uppercase font-black tracking-wider text-[8px] block mb-0.5">Diagnostic Notes:</strong>
                                          {tkt.notes}
                                        </p>

                                        {tkt.assignedUser && (
                                          <div className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500 border border-slate-100 mt-1">
                                            <span>Assignee: <strong className="text-indigo-950 font-extrabold font-mono">{tkt.assignedUser}</strong></span>
                                            <span>Clearance Assigned: <strong className="text-indigo-900 font-bold">L{tkt.levelAssigned}</strong></span>
                                          </div>
                                        )}

                                        {/* Dynamic Display of Filled Diagnostics Form Info */}
                                        {tkt.investigationNotes && (
                                          <div className="bg-amber-50/20 border border-amber-200/50 p-2.5 rounded-lg text-[10px] space-y-1 font-semibold text-slate-700">
                                            <strong className="text-amber-800 uppercase font-black tracking-widest text-[8px] block">🔍 ACTIVE INVESTIGATION DOSSIER:</strong>
                                            <div>• Notes: <span className="font-normal text-slate-600 leading-tight">{tkt.investigationNotes}</span></div>
                                            {tkt.rootCause && <div>• Reported Root Cause State: <span className="font-mono text-xs font-black text-rose-850">{tkt.rootCause}</span></div>}
                                            {tkt.evidence && tkt.evidence.length > 0 && (
                                              <div className="flex gap-1 items-center flex-wrap pt-1 select-none">
                                                <span className="text-[8px] font-black uppercase text-slate-400">Files:</span>
                                                {tkt.evidence.map((f: string, i: number) => (
                                                  <span key={i} className="text-[8px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 font-extrabold">
                                                    📎 {f}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {tkt.requestRecipient && tkt.status === 'AWAITING_INFORMATION' && (
                                          <div className="bg-purple-50/50 border border-purple-200 p-2.5 rounded-lg text-[10px] space-y-1 text-slate-700">
                                            <strong className="text-purple-800 uppercase font-black text-[8px] block">📬 OUTSTANDING INFORMATION REQUEST:</strong>
                                            <div>• Recipient: <strong className="text-slate-800">{tkt.requestRecipient}</strong></div>
                                            <div>• Required Payload: <span className="text-slate-605 font-medium">{tkt.informationRequired}</span></div>
                                            <div>• Target Due: <span className="font-mono font-bold text-red-700">{tkt.dueDate}</span></div>
                                          </div>
                                        )}

                                        {tkt.correctiveAction && (
                                          <div className="bg-emerald-55/40 border border-emerald-200 p-2.5 rounded-lg text-[10px] space-y-1 text-emerald-950 font-medium">
                                            <strong className="text-emerald-800 uppercase font-black text-[8px] block">✅ MITIGATION & RESOLUTION PROFILE:</strong>
                                            <div>• Confirmed Root Cause: <strong className="text-emerald-900 font-extrabold">{tkt.rootCause}</strong></div>
                                            <div>• Corrective Action: <span className="text-emerald-800">{tkt.correctiveAction}</span></div>
                                            <div>• Impact Assessment: <span className="font-semibold underline">{tkt.impactAssessment}</span></div>
                                            {tkt.resolutionNotes && <div>• Resolver Remarks: <span className="text-slate-600 font-normal">{tkt.resolutionNotes}</span></div>}
                                          </div>
                                        )}

                                        {tkt.closureNotes && (
                                          <div className="bg-slate-100 border border-slate-205 p-2.5 rounded-lg text-[10px] space-y-1 text-slate-750">
                                            <strong className="text-slate-700 uppercase font-black text-[8px] block">🔒 IMMUTABLE SIGN-OFF CLOSED METRICS:</strong>
                                            <div>• Closure Notes: <span className="text-slate-600 font-normal">{tkt.closureNotes}</span></div>
                                            <div>• Preventive Actions Installed: <strong className="text-emerald-800">{tkt.preventiveActions}</strong></div>
                                          </div>
                                        )}
                                      </div>

                                      {/* RENDER DYNAMIC IMMUTABLE LEDGER TIMELINE EVENTS */}
                                      {tkt.timeline && tkt.timeline.length > 0 && (
                                        <div className="bg-slate-950 text-slate-200 font-mono text-[9px] p-2.5 rounded-xl border border-slate-850">
                                          <div className="flex justify-between items-center border-b border-slate-850 pb-1 mb-1.5 select-none">
                                            <span className="text-indigo-400 font-black uppercase text-[7.5px] tracking-wider flex items-center gap-1">
                                              <Terminal className="w-2.5 h-2.5 text-indigo-400" />
                                              CBK Audit Immutable Incident Case Ledger
                                            </span>
                                            <span className="text-[7px] text-slate-500 font-extrabold uppercase font-sans">SHA-255 PROTECTED</span>
                                          </div>
                                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                            {tkt.timeline.map((evt: any, idx: number) => (
                                              <div key={idx} className="hover:bg-slate-900 py-0.5 px-1 rounded transition duration-100 leading-snug border-l border-indigo-950 pl-2">
                                                <div className="flex justify-between items-center gap-2">
                                                  <span className="text-slate-500 shrink-0 select-none">[{new Date(evt.timestamp).toLocaleTimeString()}]</span>
                                                  <span className="text-amber-400 font-bold text-[8.5px] truncate flex-1">{evt.action}</span>
                                                  <span className="text-slate-400 text-[8px] font-sans font-bold select-none shrink-0 border border-slate-900 px-1 py-0.2 rounded bg-slate-900">
                                                    by {evt.user}
                                                  </span>
                                                </div>
                                                {evt.details && (
                                                  <p className="text-slate-400 text-[8px] pl-3 italic font-normal break-all">↳ {evt.details}</p>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* ACTION PANEL */}
                                      <div className="flex justify-between items-center bg-slate-55 border border-slate-200 p-2 rounded-xl text-[10px] flex-wrap gap-2">
                                        <div className="text-slate-500 font-semibold">
                                          Owner: <strong className="text-slate-850">{tkt.raisedBy}</strong>
                                        </div>
                                        
                                        <div className="flex gap-1.5 flex-wrap">
                                          {/* QUICK SELF ASSIGN BUTTON */}
                                          {(tkt.assignedUser === 'Unassigned' || !tkt.assignedUser) && (
                                            <button
                                              type="button"
                                              onClick={() => assignTicket(tkt.id)}
                                              className="bg-indigo-600 hover:bg-indigo-705 text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1"
                                            >
                                              <UserCheck className="w-2.5 h-2.5" />
                                              Self Assign
                                            </button>
                                          )}

                                          {/* Workflow Transitions */}
                                          {tkt.status !== 'RESOLVED' && tkt.status !== 'CLOSED' && (
                                            <>
                                              {/* INVESTIGATE BUTTON */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!canInvestigate) {
                                                    alert("❌ Clearance error: Minimum Level 1 Support Administrator clearance needed for investigation!");
                                                    return;
                                                  }
                                                  setActiveWorkflowTicketId(tkt.id);
                                                  setWorkflowModalType('INVESTIGATE');
                                                  // Reset control state
                                                  setTempNotes(tkt.investigationNotes || '');
                                                  setTempRootCause(tkt.rootCause || 'Under Investigation');
                                                  setTempEvidence(tkt.evidence || []);
                                                  setTempNextAction('Continue Investigation');
                                                }}
                                                className={`text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer ${
                                                  canInvestigate ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-350 opacity-55 cursor-not-allowed'
                                                }`}
                                              >
                                                {tkt.status === 'INVESTIGATING' ? 'Update Notes' : 'Investigate'}
                                              </button>

                                              {/* REQUEST INFORMATION ACTION BUTTON */}
                                              {tkt.status === 'INVESTIGATING' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (!canInvestigate) {
                                                      alert("❌ Clearance error: Minimum Level 1 needed to request information!");
                                                      return;
                                                  }
                                                    setActiveWorkflowTicketId(tkt.id);
                                                    setWorkflowModalType('REQUEST_INFO');
                                                    setTempRecipient('Infrastructure Team');
                                                    setTempRequiredInfo('');
                                                    setTempDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                                                  }}
                                                  className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer"
                                                >
                                                  Request Info
                                                </button>
                                              )}

                                              {/* RESOLVE BUTTON */}
                                              {tkt.status !== 'RESOLUTION_PENDING_APPROVAL' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (!canResolve) {
                                                      alert("❌ Clearance error: Minimum Level 2 Systems Administrator privilege needed to trigger resolution!");
                                                      return;
                                                    }
                                                    setActiveWorkflowTicketId(tkt.id);
                                                    setWorkflowModalType('RESOLVE');
                                                    setTempRootCause('PSP callback timeout');
                                                    setTempCorrectiveAction('Rotated API key');
                                                    setTempImpact('No customer impact');
                                                    setTempNotes('');
                                                    setTempApproval(true);
                                                  }}
                                                  className={`text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer ${
                                                    canResolve ? 'bg-emerald-600 hover:bg-emerald-705' : 'bg-slate-350 opacity-55 cursor-not-allowed'
                                                  }`}
                                                >
                                                  Resolve
                                                </button>
                                              )}

                                              {/* REASSIGN BUTTON */}
                                              {canReassign && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const nextAssignee = prompt("Enter target Staff ID (e.g., SysAdmin-03, SecOps-01):");
                                                    if (nextAssignee) {
                                                      reassignTicket(tkt.id, nextAssignee);
                                                    }
                                                  }}
                                                  className="bg-indigo-650 hover:bg-indigo-705 text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer"
                                                >
                                                  Reassign
                                                </button>
                                              )}

                                              {/* ESCALATE BUTTON */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  escalateTicket(tkt.id);
                                                }}
                                                className="bg-violet-600 hover:bg-violet-700 text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer"
                                              >
                                                Escalate
                                              </button>
                                            </>
                                          )}

                                          {/* SUPERVISOR APPROVAL CONTAINER PANEL */}
                                          {tkt.status === 'RESOLUTION_PENDING_APPROVAL' && (
                                            <div className="w-full bg-red-50 border border-red-200/65 rounded-lg p-3 space-y-2.5 mt-1">
                                              <div className="flex justify-between items-center select-none">
                                                <span className="text-[8px] font-black uppercase text-red-900 tracking-wider flex items-center gap-1">
                                                  <Lock className="w-3 h-3 text-red-700" />
                                                  Incidents Board Review Pending
                                                </span>
                                                <span className="bg-red-500 text-white font-mono text-[7px] px-1 rounded">L3+ DECISION</span>
                                              </div>
                                              <p className="text-[10px] text-slate-705 italic font-semibold leading-tight bg-white p-2 rounded border">
                                                RCA Review: <strong className="text-slate-900">{tkt.resolutionNotes}</strong> (Root cause: <strong>{tkt.rootCause}</strong>) Corrective: <strong>{tkt.correctiveAction}</strong>
                                              </p>
                                              
                                              <div className="flex justify-end gap-1.5 flex-wrap pt-1">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (adminLevel < 3) {
                                                      alert("❌ Supervisor Authorization: Clearance L3 Supervisor/Security Admin minimum needed to sign off resolutions!");
                                                      return;
                                                    }
                                                    approveResolution(tkt.id);
                                                  }}
                                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[8.5px] font-black px-2.5 py-1 rounded cursor-pointer"
                                                >
                                                  ✓ Approve Resolution
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (adminLevel < 3) {
                                                      alert("❌ Supervisor Authorization: L3 Clearance mandatory!");
                                                      return;
                                                    }
                                                    setTicketsQueryNotes(tkt.id);
                                                  }}
                                                  className="bg-amber-500 hover:bg-amber-600 text-slate-905 text-[8.5px] font-black px-2.5 py-1 rounded cursor-pointer"
                                                >
                                                  Return for Info
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    escalateTicket(tkt.id);
                                                  }}
                                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[8.5px] font-black px-2.5 py-1 rounded cursor-pointer"
                                                >
                                                  Escalate
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const nextAssignee = prompt("Enter target Staff ID for re-evaluation assignment:");
                                                    if (nextAssignee) reassignTicket(tkt.id, nextAssignee);
                                                  }}
                                                  className="bg-slate-700 hover:bg-slate-800 text-white text-[8.5px] font-black px-2.5 py-1 rounded cursor-pointer"
                                                >
                                                  Reassign
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* CLOSE TICKET BUTTON */}
                                          {tkt.status === 'RESOLVED' && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (!canClose) {
                                                  alert("❌ Safety policy restriction: Support Administrators cannot sign off and close Critical severity incidents. Forwarded to Supervisors.");
                                                  return;
                                                }
                                                setActiveWorkflowTicketId(tkt.id);
                                                setWorkflowModalType('CLOSE');
                                                setTempClosureNotes('');
                                                setTempPreventive('Added monitoring alert');
                                              }}
                                              className="bg-slate-900 hover:bg-black text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1"
                                            >
                                              <CheckCircle2 className="w-2.5 h-2.5" />
                                              Close Case
                                            </button>
                                          )}

                                          {/* REOPEN BUTTON FOR CLOSED TICKETS */}
                                          {tkt.status === 'CLOSED' && canReopen && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveWorkflowTicketId(tkt.id);
                                                setWorkflowModalType('REOPEN');
                                                setTempReopenReason('Issue recurred');
                                                setTempReopenDetails('');
                                              }}
                                              className="bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1"
                                            >
                                              <RotateCw className="w-2.5 h-2.5" />
                                              Reopen Case
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* CREATE DISPATCH TICKET FORM WITH HIERARCHICAL OPTGROUP CATEGORIES */}
                            <div className="bg-slate-50 border p-4 rounded-xl space-y-3.5">
                              <span className="text-[10px] uppercase font-bold text-indigo-950 tracking-wider block border-b border-indigo-100 pb-1.5">Issue Dispatch Docket</span>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const fd = new FormData(form);
                                const subj = fd.get('subject') as string;
                                const cat = fd.get('category') as string;
                                const urg = fd.get('urgency') as string;
                                const rby = fd.get('raisedBy') as string;
                                const detail = fd.get('notes') as string;

                                if (!subj || !detail) return;

                                const newT = {
                                  id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
                                  title: subj,
                                  category: cat,
                                  raisedBy: rby || 'ALEX ONDIEKI (Sys Admin)',
                                  urgency: urg,
                                  status: 'NEW',
                                  levelAssigned: 1,
                                  assignedUser: 'Unassigned',
                                  notes: detail,
                                  createdAt: new Date().toISOString(),
                                  timeline: [
                                    { timestamp: new Date().toISOString(), action: 'Case Registered', user: rby || 'System Admin', details: 'Dossier initialized via dispatcher panel.' }
                                  ]
                                };

                                setSupportTickets([newT, ...supportTickets]);
                                triggerLogWrite("Raised technical support ticket", newT.id, newT.title);
                                form.reset();
                              }} className="space-y-3 font-normal text-[10.5px]">
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-extrabold text-slate-500 uppercase">Ticket Target Issue</label>
                                  <input name="subject" required type="text" placeholder="e.g. Courier coordinate buffer failure..." className="w-full bg-white border rounded p-2 text-[10.5px] font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-extrabold text-slate-500 uppercase">Operational Category</label>
                                  <select name="category" required className="w-full bg-white border rounded p-1.5 text-xs font-bold text-slate-800">
                                    <optgroup label="Platform Availability">
                                      <option value="Website Down">Website Down</option>
                                      <option value="API Failure">API Failure</option>
                                    </optgroup>
                                    <optgroup label="Payments">
                                      <option value="M-Pesa Failure">M-Pesa Failure</option>
                                      <option value="Airtel Failure">Airtel Failure</option>
                                      <option value="T-Cash Failure">T-Cash Failure</option>
                                    </optgroup>
                                    <optgroup label="Escrow">
                                      <option value="Stuck Escrow">Stuck Escrow</option>
                                      <option value="Settlement Failure">Settlement Failure</option>
                                    </optgroup>
                                    <optgroup label="Security">
                                      <option value="Unauthorized Access">Unauthorized Access</option>
                                      <option value="Suspicious Activity">Suspicious Activity</option>
                                    </optgroup>
                                    <optgroup label="Infrastructure">
                                      <option value="Server Failure">Server Failure</option>
                                      <option value="Database Failure">Database Failure</option>
                                    </optgroup>
                                    <optgroup label="Integration">
                                      <option value="SMS Gateway">SMS Gateway</option>
                                      <option value="WhatsApp API">WhatsApp API</option>
                                      <option value="Courier API">Courier API</option>
                                    </optgroup>
                                    <optgroup label="User Support">
                                      <option value="Account Lock">Account Lock</option>
                                      <option value="RBAC Issue">RBAC Issue</option>
                                      <option value="Login Failure">Login Failure</option>
                                    </optgroup>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-extrabold text-slate-500 uppercase">Urgency Severity</label>
                                  <select name="urgency" className="w-full bg-white border rounded p-1.5 font-bold text-red-700">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-extrabold text-slate-500 uppercase">Submitter Email</label>
                                  <input name="raisedBy" type="text" defaultValue="alex.on@buysafely.africa" className="w-full bg-slate-100 border text-slate-500 rounded p-1.5 focus:outline-none" />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[9.5px] font-extrabold text-slate-500 uppercase">Malfunction Diagnostics Narrative</label>
                                  <textarea name="notes" rows={3} required placeholder="Detail the technical exception and traces..." className="w-full bg-white border rounded p-2 text-[10.5px] font-semibold"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[10.5px] py-1.5 sm:py-2 rounded-lg cursor-pointer transition">
                                  ✓ Provision & Dispatch Case
                                </button>
                              </form>
                            </div>
                          </div>

                          {/* ========================================================================= */}
                          {/* DYNAMIC CASE WORKFLOW OVERLAY MODALS */}
                          {/* ========================================================================= */}
                          {activeWorkflowTicketId && workflowModalType && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition">
                              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col">
                                {(() => {
                                  const tkt = supportTickets.find(x => x.id === activeWorkflowTicketId);
                                  if (!tkt) return <div className="p-5 text-slate-400">Loading case details...</div>;

                                  const userStr = adminLevel === 1 ? 'SysAdmin-01' : adminLevel === 2 ? 'SysAdmin-02' : adminLevel === 3 ? 'SecAdmin-Alpha' : adminLevel === 4 ? 'InfraSupervisor' : 'HeadOfTech';

                                  return (
                                    <>
                                      {/* MODAL HEADER */}
                                      <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                                        <div>
                                          <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                                            {workflowModalType} WORKFLOW STEP
                                          </span>
                                          <h4 className="text-xs font-extrabold mt-0.5">Secure Transaction Sign-off: {tkt.id}</h4>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveWorkflowTicketId(null);
                                            setWorkflowModalType(null);
                                          }}
                                          className="text-slate-400 hover:text-white transition cursor-pointer"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      {/* MODAL BODY */}
                                      <div className="p-5 overflow-y-auto space-y-4 text-[11px] font-medium text-slate-700 flex-1">
                                        
                                        {/* 1. INVESTIGATIONS MODAL */}
                                        {workflowModalType === 'INVESTIGATE' && (
                                          <div className="space-y-3.5">
                                            {/* Basic Info */}
                                            <div className="bg-slate-50 border p-3 rounded-xl grid grid-cols-2 gap-2 text-[10px]">
                                              <div>
                                                <span className="text-slate-400 block font-bold uppercase text-[7.5px]">Ticket ID</span>
                                                <strong className="text-slate-800 font-mono text-xs">{tkt.id} (READ ONLY)</strong>
                                              </div>
                                              <div>
                                                <span className="text-slate-400 block font-bold uppercase text-[7.5px]">Incident Category</span>
                                                <strong className="text-slate-800 font-mono text-xs">{tkt.category}</strong>
                                              </div>
                                              <div>
                                                <span className="text-slate-400 block font-bold uppercase text-[7.5px]">Priority Level</span>
                                                <strong className="text-amber-800 font-mono text-xs">{tkt.urgency}</strong>
                                              </div>
                                              <div>
                                                <span className="text-slate-400 block font-bold uppercase text-[7.5px]">Assigned Operator</span>
                                                <strong className="text-slate-800 font-mono text-xs">{tkt.assignedUser || 'Unassigned'}</strong>
                                              </div>
                                            </div>

                                            {/* Notes Input */}
                                            <div className="space-y-1.5">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Investigation Case Notes *</label>
                                              <textarea
                                                value={tempNotes}
                                                onChange={(e) => setTempNotes(e.target.value)}
                                                rows={3}
                                                placeholder="Input callback checks, gateway responses..."
                                                className="w-full bg-white border rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                              ></textarea>
                                              
                                              {/* Quick Fill Quickies */}
                                              <div className="flex gap-1 items-center flex-wrap">
                                                <span className="text-[7.5px] uppercase font-mono text-slate-400 block shrink-0">Click to import:</span>
                                                {['Callback logs reviewed', 'Database checked', 'API connectivity tested'].map((fill) => (
                                                  <button
                                                    key={fill}
                                                    type="button"
                                                    onClick={() => {
                                                      const prefix = tempNotes ? tempNotes + '; ' : '';
                                                      setTempNotes(prefix + fill);
                                                    }}
                                                    className="bg-slate-100 hover:bg-slate-200 border text-slate-800 text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                                  >
                                                    + {fill}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>

                                            {/* Root Cause Dropdown (Optional at this stage) */}
                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Diagnosis Status (Root Cause Indicator)</label>
                                              <select
                                                value={tempRootCause}
                                                onChange={(e) => setTempRootCause(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-bold text-slate-800"
                                              >
                                                <option value="Unknown">Unknown</option>
                                                <option value="Under Investigation">Under Investigation</option>
                                                <option value="Suspected Cause">Suspected Cause</option>
                                                <option value="Invalid API credentials">Invalid API credentials</option>
                                                <option value="PSP callback timeout">PSP callback timeout</option>
                                                <option value="Database deadlock">Database deadlock</option>
                                                <option value="SMS gateway outage">SMS gateway outage</option>
                                              </select>
                                            </div>

                                            {/* Evidence Upload */}
                                            <div className="space-y-2">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Administrative Evidence Artifacts</label>
                                              <div className="bg-slate-50 border border-dashed rounded-lg p-3 text-center space-y-2">
                                                <span className="text-[9px] text-slate-400 block font-medium">Attach mock diagnostic assets:</span>
                                                <div className="flex justify-center gap-1.5 flex-wrap">
                                                  {['Screenshot_Error.png', 'Gateway_Logs.txt', 'Error_Payload.json', 'Config_Dump.xml'].map((asset) => {
                                                    const alreadyOn = tempEvidence.includes(asset);
                                                    return (
                                                      <button
                                                        key={asset}
                                                        type="button"
                                                        onClick={() => {
                                                          if (alreadyOn) {
                                                            setTempEvidence(prev => prev.filter(x => x !== asset));
                                                          } else {
                                                            setTempEvidence(prev => [...prev, asset]);
                                                          }
                                                        }}
                                                        className={`text-[8.5px] font-mono px-2 py-1 rounded border transition font-black cursor-pointer ${
                                                          alreadyOn ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-705'
                                                        }`}
                                                      >
                                                        {alreadyOn ? '✓ Attached' : `📎 ${asset}`}
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Next Action Selection */}
                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Progression Next Action</label>
                                              <select
                                                value={tempNextAction}
                                                onChange={(e) => setTempNextAction(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-extrabold text-indigo-950"
                                              >
                                                <option value="Continue Investigation">Continue Investigation</option>
                                                <option value="Escalate">Escalate Urgency Level</option>
                                                <option value="Request Information">Request Information</option>
                                              </select>
                                            </div>

                                            {/* SUBMIT BUTTONS */}
                                            <div className="pt-3 border-t flex gap-2 justify-end">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  // SAVE AS DRAFT
                                                  setSupportTickets(prev => prev.map(x => {
                                                    if (x.id === tkt.id) {
                                                      const now2 = new Date().toISOString();
                                                      const updatedTimeline = [...(x.timeline || [])];
                                                      updatedTimeline.push({
                                                        timestamp: now2,
                                                        action: 'Draft Saved',
                                                        user: userStr,
                                                        details: `Investigation progress cached: ${tempNotes || 'No notes yet'}`
                                                      });

                                                      return {
                                                        ...x,
                                                        investigationNotes: tempNotes,
                                                        rootCause: tempRootCause,
                                                        evidence: tempEvidence,
                                                        timeline: updatedTimeline
                                                      };
                                                    }
                                                    return x;
                                                  }));
                                                  triggerLogWrite("Investigation draft updated", tkt.id, tempNotes);
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
                                              >
                                                Save Draft
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!tempNotes) {
                                                    alert("❌ Notes are mandatory for submission!");
                                                    return;
                                                  }
                                                  
                                                  setSupportTickets(prev => prev.map(x => {
                                                    if (x.id === tkt.id) {
                                                      const now2 = new Date().toISOString();
                                                      const updatedTimeline = [...(x.timeline || [])];
                                                      
                                                      let nextStatus = 'INVESTIGATING';
                                                      if (tempNextAction === 'Request Information') {
                                                        nextStatus = 'AWAITING_INFORMATION';
                                                      }

                                                      updatedTimeline.push({
                                                        timestamp: now2,
                                                        action: tempNextAction === 'Escalate' ? 'Escalated Urgency' : 'Investigation Submitted',
                                                        user: userStr,
                                                        details: tempNotes + ` | Root cause designated as: ${tempRootCause}`
                                                      });

                                                      return {
                                                        ...x,
                                                        status: nextStatus,
                                                        investigationNotes: tempNotes,
                                                        rootCause: tempRootCause,
                                                        evidence: tempEvidence,
                                                        urgency: tempNextAction === 'Escalate' ? 'Critical' : x.urgency,
                                                        levelAssigned: tempNextAction === 'Escalate' ? Math.min(5, x.levelAssigned + 1) : x.levelAssigned,
                                                        timeline: updatedTimeline
                                                      };
                                                    }
                                                    return x;
                                                  }));
                                                  
                                                  triggerLogWrite("Investigation finalized", tkt.id, `State: ${tempNextAction}`);
                                                  
                                                  if (tempNextAction === 'Request Information') {
                                                    // Immediately route into request info sub-modal
                                                    setWorkflowModalType('REQUEST_INFO');
                                                    setTempRecipient('Infrastructure Team');
                                                    setTempRequiredInfo('');
                                                    setTempDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                                                  } else {
                                                    setActiveWorkflowTicketId(null);
                                                    setWorkflowModalType(null);
                                                  }
                                                }}
                                                className="bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer transition"
                                              >
                                                Submit Investigation
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {/* 2. REQUEST INFORMATION MODAL */}
                                        {workflowModalType === 'REQUEST_INFO' && (
                                          <div className="space-y-3.5">
                                            <p className="text-[10px] text-slate-400 italic">Put the diagnostic queue on pause while awaiting target telemetry payload response from integrated stakeholders.</p>

                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Information Recipient *</label>
                                              <select
                                                value={tempRecipient}
                                                onChange={(e) => setTempRecipient(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-bold text-slate-800"
                                              >
                                                <option value="CRM">CRM</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Merchant">Merchant</option>
                                                <option value="PSP">PSP</option>
                                                <option value="Courier Partner">Courier Partner</option>
                                                <option value="Infrastructure Team">Infrastructure Team</option>
                                              </select>
                                            </div>

                                            <div className="space-y-1.5">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Information Required Payload *</label>
                                              <textarea
                                                value={tempRequiredInfo}
                                                onChange={(e) => setTempRequiredInfo(e.target.value)}
                                                required
                                                rows={3}
                                                placeholder="e.g. Please supply precise S3 Cloudfront region error response codes from 10:45 AM UTC."
                                                className="w-full bg-white border rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                              ></textarea>
                                            </div>

                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Due Date Threshold *</label>
                                              <input
                                                type="date"
                                                value={tempDueDate}
                                                onChange={(e) => setTempDueDate(e.target.value)}
                                                required
                                                className="w-full bg-white border rounded-lg p-2 text-xs text-slate-900 font-bold"
                                              />
                                            </div>

                                            {/* BUTTONS */}
                                            <div className="pt-3 border-t flex gap-2 justify-end">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  // back to investigate
                                                  setWorkflowModalType('INVESTIGATE');
                                                }}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
                                              >
                                                Back
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!tempRequiredInfo || !tempDueDate) {
                                                    alert("❌ All fields are mandatory to request information!");
                                                    return;
                                                  }

                                                  setSupportTickets(prev => prev.map(x => {
                                                    if (x.id === tkt.id) {
                                                      const now3 = new Date().toISOString();
                                                      const updatedTimeline = [...(x.timeline || [])];
                                                      updatedTimeline.push({
                                                        timestamp: now3,
                                                        action: `Information Requested from ${tempRecipient}`,
                                                        user: userStr,
                                                        details: tempRequiredInfo + ` (Due: ${tempDueDate})`
                                                      });

                                                      return {
                                                        ...x,
                                                        status: 'AWAITING_INFORMATION',
                                                        requestRecipient: tempRecipient,
                                                        informationRequired: tempRequiredInfo,
                                                        dueDate: tempDueDate,
                                                        timeline: updatedTimeline
                                                      };
                                                    }
                                                    return x;
                                                  }));

                                                  triggerLogWrite("Dispatched info request", tkt.id, `Recipient: ${tempRecipient}`);
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer transition"
                                              >
                                                Submit Request
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {/* 3. RESOLUTION MODAL */}
                                        {workflowModalType === 'RESOLVE' && (
                                          <div className="space-y-3.5">
                                            
                                            {/* Root Cause (Mandatory) */}
                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Identified Root Cause *</label>
                                              <select
                                                value={tempRootCause}
                                                onChange={(e) => setTempRootCause(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-black text-rose-850"
                                              >
                                                <option value="Invalid API credentials">Invalid API credentials</option>
                                                <option value="PSP callback timeout">PSP callback timeout</option>
                                                <option value="Database deadlock">Database deadlock</option>
                                                <option value="SMS gateway outage">SMS gateway outage</option>
                                              </select>
                                            </div>

                                            {/* Corrective Action (Mandatory) */}
                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Immediate Corrective Action Taken *</label>
                                              <select
                                                value={tempCorrectiveAction}
                                                onChange={(e) => setTempCorrectiveAction(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-bold text-slate-800"
                                              >
                                                <option value="Rotated API key">Rotated API key</option>
                                                <option value="Restarted service">Restarted service</option>
                                                <option value="Updated firewall rule">Updated firewall rule</option>
                                              </select>
                                            </div>

                                            {/* Impact Assessment (Mandatory) */}
                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Impact Assessment *</label>
                                              <select
                                                value={tempImpact}
                                                onChange={(e) => setTempImpact(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-bold text-slate-800"
                                              >
                                                <option value="No customer impact">No customer impact</option>
                                                <option value="Partial impact">Partial impact</option>
                                                <option value="Major impact">Major impact</option>
                                              </select>
                                            </div>

                                            {/* Notes (Mandatory) */}
                                            <div className="space-y-1.5">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Mitigation & Action Notes *</label>
                                              <textarea
                                                value={tempNotes}
                                                onChange={(e) => setTempNotes(e.target.value)}
                                                required
                                                rows={3}
                                                placeholder="Detail exact remediation actions step by step for the Spanner ledger logs..."
                                                className="w-full bg-white border rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                              ></textarea>
                                            </div>

                                            {/* Approval required? checkbox */}
                                            <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 select-none">
                                              <input
                                                type="checkbox"
                                                id="approvalCheck"
                                                checked={tempApproval}
                                                onChange={(e) => setTempApproval(e.target.checked)}
                                                className="mt-0.5"
                                              />
                                              <label htmlFor="approvalCheck" className="text-[10px] leading-tight text-slate-600 font-semibold cursor-pointer">
                                                <strong className="text-slate-850 block font-black">Require Supervisor Multi-Signature Approval?</strong>
                                                Check if changes require formal audit sign-off by a Level 3+ Security or Platform Operations Administrator. (Enforced on Critical incidents)
                                              </label>
                                            </div>

                                            {/* ACTION BUTTONS */}
                                            <div className="pt-3 border-t flex gap-2 justify-end">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!tempNotes) {
                                                    alert("❌ Resolution Notes are mandatory!");
                                                    return;
                                                  }

                                                  const isCriticalOrMedium = tkt.urgency !== 'Low';
                                                  const needsApproval = tempApproval || isCriticalOrMedium;
                                                  const targetStatus = needsApproval ? 'RESOLUTION_PENDING_APPROVAL' : 'RESOLVED';

                                                  setSupportTickets(prev => prev.map(x => {
                                                    if (x.id === tkt.id) {
                                                      const now3 = new Date().toISOString();
                                                      const updatedTimeline = [...(x.timeline || [])];
                                                      updatedTimeline.push({
                                                        timestamp: now3,
                                                        action: targetStatus === 'RESOLUTION_PENDING_APPROVAL' ? 'Resolution Submitted' : 'Resolution Auto-Approved',
                                                        user: userStr,
                                                        details: `Root Cause: ${tempRootCause} | Corrective Action: ${tempCorrectiveAction} | Impact Assessment: ${tempImpact} | Notes: ${tempNotes}`
                                                      });

                                                      return {
                                                        ...x,
                                                        status: targetStatus,
                                                        rootCause: tempRootCause,
                                                        correctiveAction: tempCorrectiveAction,
                                                        impactAssessment: tempImpact,
                                                        resolutionNotes: tempNotes,
                                                        timeline: updatedTimeline
                                                      };
                                                    }
                                                    return x;
                                                  }));

                                                  triggerLogWrite("Submitted resolution case", tkt.id, `Designated Status: ${targetStatus}`);
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-705 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer transition"
                                              >
                                                Submit Resolution
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {/* 4. CLOSURE MODAL */}
                                        {workflowModalType === 'CLOSE' && (
                                          <div className="space-y-4">
                                            
                                            {/* Closure verification criteria */}
                                            <div className="space-y-2 bg-slate-50 border p-3 rounded-xl">
                                              <strong className="text-[8px] uppercase tracking-wider block border-b pb-1 mb-2">Technical Checklist Verified Sign-off:</strong>
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px]">
                                                  <span>Has the resolution been fully verified?</span>
                                                  <div className="flex gap-2">
                                                    {['Yes', 'No'].map((op) => (
                                                      <label key={op} className="inline-flex items-center gap-1 cursor-pointer">
                                                        <input
                                                          type="radio"
                                                          name="verifiedCheck"
                                                          value={op}
                                                          checked={tempVerified === op}
                                                          onChange={(e) => setTempVerified(e.target.value)}
                                                        />
                                                        <strong>{op}</strong>
                                                      </label>
                                                    ))}
                                                  </div>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                  <span>Is customer/merchant impact fully addressed?</span>
                                                  <div className="flex gap-2">
                                                    {['Yes', 'No'].map((op) => (
                                                      <label key={op} className="inline-flex items-center gap-1 cursor-pointer">
                                                        <input
                                                          type="radio"
                                                          name="customerCheck"
                                                          value={op}
                                                          checked={tempImpactAddressed === op}
                                                          onChange={(e) => setTempImpactAddressed(e.target.value)}
                                                        />
                                                        <strong>{op}</strong>
                                                      </label>
                                                    ))}
                                                  </div>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                  <span>Are active monitoring alerts completed?</span>
                                                  <div className="flex gap-2">
                                                    {['Yes', 'No'].map((op) => (
                                                      <label key={op} className="inline-flex items-center gap-1 cursor-pointer">
                                                        <input
                                                          type="radio"
                                                          name="monitoringCheck"
                                                          value={op}
                                                          checked={tempMonitoring === op}
                                                          onChange={(e) => setTempMonitoring(e.target.value)}
                                                        />
                                                        <strong>{op}</strong>
                                                      </label>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Closure Notes */}
                                            <div className="space-y-1.5">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Administrative Closure Notes *</label>
                                              <textarea
                                                value={tempClosureNotes}
                                                onChange={(e) => setTempClosureNotes(e.target.value)}
                                                required
                                                rows={2.5}
                                                placeholder="Enter closure confirmation details..."
                                                className="w-full bg-white border rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                              ></textarea>
                                            </div>

                                            {/* Preventive Actions */}
                                            <div className="space-y-1.5">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-emerald-800">Preventive Actions Installed (Required to Prevent Recurrence) *</label>
                                              <select
                                                value={tempPreventive}
                                                onChange={(e) => setTempPreventive(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-bold text-slate-800"
                                              >
                                                <option value="Added monitoring alert">Added monitoring alert</option>
                                                <option value="Updated runbook instructions">Updated runbook instructions</option>
                                                <option value="Increased retry backup failover logic">Increased retry backup failover logic</option>
                                              </select>
                                            </div>

                                            {/* SUBMIT */}
                                            <div className="pt-3 border-t flex gap-2 justify-end">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!tempClosureNotes || !tempPreventive) {
                                                    alert("❌ Closure notes and Preventive actions are mandatory!");
                                                    return;
                                                  }

                                                  setSupportTickets(prev => prev.map(x => {
                                                    if (x.id === tkt.id) {
                                                      const now4 = new Date().toISOString();
                                                      const updatedTimeline = [...(x.timeline || [])];
                                                      updatedTimeline.push({
                                                        timestamp: now4,
                                                        action: 'Ticket Closed',
                                                        user: userStr,
                                                        details: tempClosureNotes + ` | Preventive measures: ${tempPreventive} [Verified: ${tempVerified}, Customer Ok: ${tempImpactAddressed}, Alarms: ${tempMonitoring}]`
                                                      });

                                                      return {
                                                        ...x,
                                                        status: 'CLOSED',
                                                        closureNotes: tempClosureNotes,
                                                        preventiveActions: tempPreventive,
                                                        timeline: updatedTimeline
                                                      };
                                                    }
                                                    return x;
                                                  }));

                                                  triggerLogWrite("Closed support case", tkt.id, "Status becomes CLOSED");
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-slate-900 hover:bg-black text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer transition"
                                              >
                                                ✓ Close Ticket
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {/* 5. REOPEN TICKET MODAL */}
                                        {workflowModalType === 'REOPEN' && (
                                          <div className="space-y-4">
                                            <p className="text-[10px] text-rose-700 italic font-medium leading-tight">This initiates a new auditable log while preserving previous timeline history states.</p>

                                            <div className="space-y-1">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Operational Reopen Reason *</label>
                                              <select
                                                value={tempReopenReason}
                                                onChange={(e) => setTempReopenReason(e.target.value)}
                                                className="w-full bg-white border rounded p-2 text-xs font-bold text-slate-800"
                                              >
                                                <option value="Issue recurred">Issue recurred</option>
                                                <option value="Resolution ineffective">Resolution ineffective</option>
                                                <option value="Additional impact discovered">Additional impact discovered</option>
                                              </select>
                                            </div>

                                            <div className="space-y-1.5">
                                              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Reopen Explanatory Notes *</label>
                                              <textarea
                                                value={tempReopenDetails}
                                                onChange={(e) => setTempReopenDetails(e.target.value)}
                                                required
                                                rows={3}
                                                placeholder="Provide detailed feedback on recurrences or new reports..."
                                                className="w-full bg-white border rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-indigo-500"
                                              ></textarea>
                                            </div>

                                            {/* SUBMIT BUTTON */}
                                            <div className="pt-3 border-t flex gap-2 justify-end">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!tempReopenDetails) {
                                                    alert("❌ Explanatory reopen notes are mandatory!");
                                                    return;
                                                  }

                                                  setSupportTickets(prev => prev.map(x => {
                                                    if (x.id === tkt.id) {
                                                      const now5 = new Date().toISOString();
                                                      const updatedTimeline = [...(x.timeline || [])];
                                                      updatedTimeline.push({
                                                        timestamp: now5,
                                                        action: 'Ticket Reopened',
                                                        user: userStr,
                                                        details: tempReopenDetails + ` (Reason: ${tempReopenReason})`
                                                      });

                                                      return {
                                                        ...x,
                                                        status: 'INVESTIGATING',
                                                        reopenReason: tempReopenReason,
                                                        timeline: updatedTimeline
                                                      };
                                                    }
                                                    return x;
                                                  }));

                                                  triggerLogWrite("Reopened closed support ticket", tkt.id, `Reason: ${tempReopenReason}`);
                                                  setActiveWorkflowTicketId(null);
                                                  setWorkflowModalType(null);
                                                }}
                                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer transition"
                                              >
                                                ✓ Reopen Ticket
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB TAB 2: USER ACCOUNT SECURITY */}
                      {sysAdminSubTab === 'ACCOUNTS' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2">
                            <h4 className="text-sm font-black text-slate-800">👤 User Account Governance & Identity Locking Operations</h4>
                            <p className="text-[10px] text-slate-400">Unlock password attempts, reset multi-factor access, deactivate, or reactivate platform stakeholders instantly.</p>
                          </div>

                          <div className="border rounded-xl overflow-hidden font-normal text-[11px] bg-white">
                            <div className="grid grid-cols-5 bg-slate-50 p-3 font-bold border-b text-slate-500 uppercase tracking-tight text-[10px]">
                              <span>Identity User Profile</span>
                              <span>Stakeholder Type</span>
                              <span>Account State</span>
                              <span>MFA Active</span>
                              <span className="text-right">Platform Interventions</span>
                            </div>
                            <div className="divide-y font-semibold">
                              {adminAccounts.map((ac) => (
                                <div key={ac.id} className="grid grid-cols-5 p-3 items-center hover:bg-slate-50">
                                  <div className="space-y-1">
                                    <span className="block font-bold text-slate-800">{ac.name}</span>
                                    <span className="text-[9.5px] text-slate-400 font-mono lowercase">{ac.handle}</span>
                                  </div>
                                  <span className="text-slate-600 bg-slate-100 border text-[9px] px-2 py-0.5 rounded w-max">{ac.type}</span>
                                  <div>
                                    <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md ${
                                      ac.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                      ac.status === 'Locked' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-slate-100 border text-slate-650'
                                    }`}>
                                      {ac.status}
                                    </span>
                                  </div>
                                  <div>
                                    <span className={`text-[9.5px] font-mono ${ac.mfaEnabled ? 'text-indigo-650 font-black' : 'text-slate-400 font-bold'}`}>
                                      {ac.mfaEnabled ? '🔒 MFA ACTIVE' : '⚠ DISABLED'}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 justify-end flex-wrap leading-none">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAdminAccounts(adminAccounts.map(x => x.id === ac.id ? { ...x, status: 'Active' } : x));
                                        triggerLogWrite("Unlocked actor account status", ac.handle, "ACTIVE Status");
                                      }}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black px-2 py-1 rounded"
                                    >
                                      Unlock
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAdminAccounts(adminAccounts.map(x => x.id === ac.id ? { ...x, mfaEnabled: !x.mfaEnabled } : x));
                                        triggerLogWrite("Override MFA security configuration", ac.handle, `Toggled to ${!ac.mfaEnabled}`);
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black px-2 py-1 rounded"
                                    >
                                      Reset MFA
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (adminLevel < 2) {
                                          alert("❌ SEC REGULATION: Deactivation and Account Suspension limits require minimum Level 2 Systems Administrator privilege!");
                                          return;
                                        }
                                        setAdminAccounts(adminAccounts.map(x => x.id === ac.id ? { ...x, status: 'Suspended' } : x));
                                        triggerLogWrite("Mandatory administrative account suspension", ac.handle, "SUSPENDED Status");
                                      }}
                                      className="bg-red-650 hover:bg-red-750 text-white text-[9px] font-black px-2 py-1 rounded"
                                    >
                                      Suspend
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const pass = Math.random().toString(36).slice(-8);
                                        alert(`🔑 Forced Password Reset Complete. New Temp Password: Buysafely_${pass}`);
                                        triggerLogWrite("Forced credentials password reset sequence", ac.handle, "Temp Password Dispatched");
                                      }}
                                      className="bg-slate-705 hover:bg-slate-800 text-white text-[9px] font-black px-2 py-1 rounded"
                                    >
                                      Reset Pass
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        alert(`🔌 Transmitted Forced Session Terminate Signal (Invalidated Jwt tokens for user: ${ac.handle})`);
                                        setAdminAccounts(adminAccounts.map(x => x.id === ac.id ? { ...x, lastLogout: new Date().toISOString() } : x));
                                        triggerLogWrite("Forced administrative logout", ac.handle, "Invalidated active sessions");
                                      }}
                                      className="bg-slate-900 hover:bg-slate-950 text-white text-[9px] font-black px-2 py-1 rounded"
                                    >
                                      Force Exit
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 3: RBAC RULES & EMERGENCY OVERRIDES */}
                      {sysAdminSubTab === 'RBAC' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🔑 Role Access governance & Emergency Permission Override</h4>
                              <p className="text-[10px] text-slate-400">Add administrative roles, map functional boundaries, grant emergency sub-level clearances.</p>
                            </div>
                            <div className="flex gap-1.5 text-[10px]">
                              <span className={`px-2 py-1 rounded font-mono font-black border ${temporaryBypassActive ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                Temporary Access Token: {temporaryBypassActive ? 'ACTIVE' : 'OFFLINE'}
                              </span>
                              <span className={`px-2 py-1 rounded font-mono font-black border ${emergencyBypassActive ? 'bg-red-600 text-white border-red-750' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                Emergency Breakout: {emergencyBypassActive ? 'ENFORCED' : 'NORMAL'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* ACTIVE RULES MATRIX */}
                            <div className="md:col-span-2 space-y-3 font-normal text-[11px]">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Governing Roles & Authorization Boundaries</span>
                              
                              <div className="space-y-2">
                                {rbacRoles.map((role) => (
                                  <div key={role.roleName} className="border rounded-xl p-3 bg-slate-50 hover:bg-white transition space-y-2">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <strong className="text-xs text-indigo-950 font-black">{role.roleName}</strong>
                                        <span className="bg-slate-200 text-slate-800 text-[8.5px] px-1.5 py-0.5 rounded font-mono">Simul Level {role.level}</span>
                                      </div>
                                      <span className="text-[8px] text-slate-450 uppercase font-black uppercase font-mono">Access: {role.depts.join(', ')}</span>
                                    </div>
                                    <p className="text-[10.5px] text-slate-500">{role.desc}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {role.permissions.map((p: string) => (
                                        <span key={p} className="bg-emerald-50 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                                          ✓ {p}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* EMERGENCY CONTROLS & NEW ROLE FORM */}
                            <div className="space-y-4">
                              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
                                <span className="text-[9.5px] font-mono uppercase tracking-widest text-red-400 block font-black">🚨 Emergency Override Bay</span>
                                <p className="text-[10px] text-slate-400">Warning: Ingress transactions and safety checks can be decoupled for maximum diagnostic restoration bypasses.</p>
                                
                                <div className="space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (adminLevel < 2) {
                                        alert("❌ Clearance error: At least Level 2 Systems access required to authorize Temporary Access Grant.");
                                        return;
                                      }
                                      setTemporaryBypassActive(!temporaryBypassActive);
                                      triggerLogWrite("Temporary administrative bypass token toggle", `Bypass state ${temporaryBypassActive}`, `Bypass state ${!temporaryBypassActive}`);
                                    }}
                                    className={`w-full py-2.5 font-black text-[10px] uppercase rounded-lg border tracking-wider cursor-pointer ${
                                      temporaryBypassActive 
                                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 border-amber-400' 
                                        : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-750'
                                    }`}
                                  >
                                    {temporaryBypassActive ? '☒ Kill Temporary Bypass' : '⚡ Grant 24hr Sandbox Bypass'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (adminLevel < 3) {
                                        alert("❌ Clearance error: Emergency break-out protocol locks strictly restricted to level-3 Security authorities!");
                                        return;
                                      }
                                      setEmergencyBypassActive(!emergencyBypassActive);
                                      triggerLogWrite("EMERGENCY MASTER ACCESS OVERRIDE ACTIVATED", `State ${emergencyBypassActive}`, `State ${!emergencyBypassActive}`);
                                    }}
                                    className={`w-full py-2.5 font-black text-[10px] uppercase rounded-lg border tracking-wider cursor-pointer ${
                                      emergencyBypassActive 
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-bounce' 
                                        : 'bg-black hover:bg-slate-950 text-rose-500 border-rose-950'
                                    }`}
                                  >
                                    {emergencyBypassActive ? '☒ De-energize Override' : '🚨 Trigger Master Security Breakout'}
                                  </button>
                                </div>
                              </div>

                              {/* NEW ROLE PROVISIONER */}
                              <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                                <span className="text-[10px] uppercase font-bold text-slate-650 tracking-wider block font-sans">Modify Role Permissions</span>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  const form = e.target as HTMLFormElement;
                                  const fd = new FormData(form);
                                  const rName = fd.get('roleName') as string;
                                  const lvlInt = parseInt(fd.get('roleLevel') as string);
                                  const rDesc = fd.get('roleDesc') as string;

                                  if (!rName || !rDesc) return;

                                  const addedR = {
                                    roleName: rName,
                                    level: lvlInt,
                                    desc: rDesc,
                                    depts: ['Internal Operations'],
                                    permissions: ['Unlock User', 'Reset MFA']
                                  };

                                  setRbacRoles([...rbacRoles, addedR]);
                                  triggerLogWrite("Provisioned Custom RBAC Role Map", rName, `Target Clearance Level ${lvlInt}`);
                                  form.reset();
                                }} className="space-y-2.5 text-[10px] font-normal leading-relaxed">
                                  <div className="space-y-1">
                                    <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Role Identifier</label>
                                    <input name="roleName" required placeholder="e.g. Lead Logistics Inspector" className="w-full bg-white border rounded p-1.5 text-[10.5px]" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Clearance Class</label>
                                    <select name="roleLevel" className="w-full bg-white border rounded p-1">
                                      <option value={1}>Clearance Level 1</option>
                                      <option value={2}>Clearance Level 2</option>
                                      <option value={3}>Clearance Level 3</option>
                                      <option value={4}>Clearance Level 4</option>
                                      <option value={5}>Clearance Level 5</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Core Mandate Brief</label>
                                    <textarea name="roleDesc" required rows={2} placeholder="Brief on tasks and clearances..." className="w-full bg-white border rounded p-1.5 text-[10px]"></textarea>
                                  </div>
                                  <button type="submit" className="w-full bg-indigo-900 hover:bg-slate-950 text-white font-extrabold py-2 rounded-lg cursor-pointer">
                                    Create Customized Role
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 4: SERVICE MONITORING */}
                      {sysAdminSubTab === 'SERVICES' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">⚡ API & Payment Channel Heartbeats Monitoring</h4>
                              <p className="text-[10px] text-slate-400">Keep track of mobile wallet callbacks, cluster databases, and SMS outbound connections.</p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-800 font-mono text-[9px] font-black px-2 py-1 rounded border border-emerald-200">
                              Average Latency: 14ms (Optimal)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* ACTIVE SERVICES GRID */}
                            <div className="md:col-span-2 space-y-3 font-normal text-[11px]">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Connected Nodes Status</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {monitoredServices.map((svc) => (
                                  <div key={svc.id} className="bg-slate-50 border rounded-xl p-3.5 space-y-2 hover:bg-white transition relative">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">{svc.category} • #{svc.id}</span>
                                        <h5 className="text-[11.5px] font-black text-slate-800 mt-0.5 leading-tight">{svc.name}</h5>
                                      </div>
                                      <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded ${
                                        svc.status === 'Healthy' ? 'bg-emerald-50 text-emerald-800 border' :
                                        svc.status === 'Failover' ? 'bg-amber-100 text-amber-900 border border-amber-305' :
                                        'bg-red-50 text-red-800 border animate-pulse'
                                      }`}>
                                        {svc.status}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                                      <span>Latency: <strong className="text-slate-800 font-bold">{svc.latency}</strong></span>
                                      <span>Host: <strong className="text-slate-600">{svc.activeNode}</strong></span>
                                    </div>

                                    <div className="pt-2 flex justify-end gap-1 font-semibold text-[8px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (adminLevel < 2) {
                                            alert("❌ Operation Blocked: Service manipulation restricts access below clearance level 2.");
                                            return;
                                          }
                                          setMonitoredServices(monitoredServices.map(x => x.id === svc.id ? { ...x, status: 'Healthy', latency: '11ms' } : x));
                                          triggerLogWrite("Forced microservice graceful cycle restart", svc.name, "Nominal Handshake Re-established");
                                          alert(`🔄 Gracefully cycled & cleared socket buffers for endpoint: ${svc.name}. Telemetry nominal.`);
                                        }}
                                        className="bg-slate-700 hover:bg-slate-800 text-white px-2 py-1 rounded"
                                      >
                                        Restart
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (adminLevel < 2) {
                                            alert("❌ Access denied: Failover rerouting restricted below Level 2 systems admin roles.");
                                            return;
                                          }
                                          setMonitoredServices(monitoredServices.map(x => x.id === svc.id ? { ...x, status: 'Failover', activeNode: 'n-ke-mombasa-failover', latency: '40ms' } : x));
                                          triggerLogWrite("Initiated service cluster failover migration", svc.name, "Migrated to Mombasa standby VM node");
                                          alert(`🛰️ Deciduous Migrated Ingress: ${svc.name} pointed to standby failover node n-ke-mombasa-failover.`);
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                                      >
                                        Failover
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (adminLevel < 2) {
                                            alert("❌ Access denied: Failover rerouting restricted below Level 2.");
                                            return;
                                          }
                                          setMonitoredServices(monitoredServices.map(x => x.id === svc.id ? { ...x, status: 'Maintenance', latency: 'N/A' } : x));
                                          triggerLogWrite("Set Service to Maintenance Mode", svc.name, "Restricted Inbound Handshakes");
                                        }}
                                        className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded"
                                      >
                                        Maintenance
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* EMERGENCY INCIDENT DISPATCH RADAR */}
                            <div className="bg-slate-900 border border-slate-850 text-white p-4 rounded-xl space-y-4">
                              <span className="text-[10px] uppercase font-extrabold text-indigo-400 tracking-wider block font-mono">⚠️ Outage Ingress Dispatch Terminal</span>
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                Deploy severe event status warnings. Declaring an outage here instantly raises incident tickets and alerts the on-duty support channels.
                              </p>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  // Auto push severe incident
                                  const ticketId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
                                  const incId = `INC-2026-${Math.floor(10 + Math.random() * 90)}`;
                                  
                                  const supportDraft = {
                                    id: ticketId,
                                    title: "EMERGENCY: Safaricom Webhook SSL key validation breakage",
                                    category: "Payment callback issues",
                                    raisedBy: "SEC_OPERATIONS_DESK",
                                    urgency: "Critical",
                                    status: "INVESTIGATING",
                                    levelAssigned: 4,
                                    notes: "Urgent: Webhooks fail connection. Automatic failover sandbox link is running with intermittent packets.",
                                    createdAt: new Date().toISOString()
                                  };

                                  const incidentDraft = {
                                    id: incId,
                                    summary: "Total M-Pesa webhook callback degradation",
                                    status: "INCIDENT_CREATED",
                                    severity: "L4 Critical",
                                    raisedAt: new Date().toISOString(),
                                    incidentReport: "SSL handshake loop failure on webhook gateway. Safaricom endpoint is responding with handshake connection resets.",
                                    rootCause: "Awaiting diagnostic confirmation.",
                                    preventiveActions: "Awaiting post-mortem evaluation."
                                  };

                                  setSupportTickets([supportDraft, ...supportTickets]);
                                  setMajorIncidents([incidentDraft, ...majorIncidents]);
                                  triggerLogWrite("EMERGENCY MAJOR OUTAGE DECLARED", incId, "Total Ingress Degradation");
                                  alert(`🚨 Platform Emergency Declared! Raised Outage Incident ${incId} and Support Ticket ${ticketId}. Supervisor chain notified.`);
                                }}
                                className="w-full bg-red-600 hover:bg-red-750 text-white font-extrabold text-[10.5px] py-3 rounded-lg flex items-center justify-center gap-2 animate-pulse cursor-pointer"
                              >
                                <AlertOctagon className="w-4 h-4" />
                                Declare Platform Major Outage
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 5: INCIDENT MANAGEMENT */}
                      {sysAdminSubTab === 'INCIDENTS' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center flex-wrap gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🚨 Incident Response Workspace & Outage Lifecycle</h4>
                              <p className="text-[10px] text-slate-400">Manage critical platform degradations step-by-step from creation down to root-cause synthesis.</p>
                            </div>
                            <span className="bg-red-50 text-red-700 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                              {majorIncidents.filter(x => x.status !== 'POST_MORTEM' && x.status !== 'RESOLVED').length} Active Outages Under Remediation
                            </span>
                          </div>

                          <div className="space-y-4">
                            {majorIncidents.map((inc) => (
                              <div key={inc.id} className="border rounded-2xl p-4 space-y-3.5 bg-white shadow-xs">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-xs font-black text-indigo-950 font-mono">{inc.id}</strong>
                                      <span className="text-red-700 bg-red-50 border text-[8px] font-mono px-1.5 py-0.5 rounded font-black">{inc.severity}</span>
                                      <span className="text-[9px] text-slate-400 font-mono">Outage initiated: {new Date(inc.raisedAt).toLocaleString()}</span>
                                    </div>
                                    <h5 className="text-[12.5px] font-black text-slate-905 mt-1">{inc.summary}</h5>
                                  </div>

                                  {/* FLOW LIFECYCLE CHIPS */}
                                  <div className="flex items-center gap-1">
                                    {['INCIDENT_CREATED', 'INVESTIGATING', 'ROOT_CAUSE_ANALYSIS', 'RESOLVED', 'POST_MORTEM'].map((step, idx) => {
                                      const active = inc.status === step;
                                      return (
                                        <span key={step} className={`text-[7px] font-bold uppercase tracking-wider px-2 py-1 rounded transition ${
                                          active 
                                            ? 'bg-red-600 text-white font-black' 
                                            : 'bg-slate-100 text-slate-400 font-medium'
                                        }`}>
                                          {idx + 1}. {step.replace('_', ' ')}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
                                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <strong className="text-[9px] uppercase tracking-wider text-slate-400 font-black block mb-1">Incident Diagnostic Log</strong>
                                    <p className="text-slate-750 font-semibold">{inc.incidentReport}</p>
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <strong className="text-[9px] uppercase tracking-wider text-slate-400 font-black block mb-1">Root Cause Analysis (RCA)</strong>
                                    <p className="text-slate-755 font-bold font-mono text-indigo-950">{inc.rootCause}</p>
                                  </div>
                                  <div className="bg-emerald-50/20 p-3 rounded-xl border border-emerald-100">
                                    <strong className="text-[9px] uppercase tracking-wider text-emerald-800 font-black block mb-1">Preventive Action Plan</strong>
                                    <p className="text-emerald-990 font-semibold font-mono text-[10.5px]">{inc.preventiveActions}</p>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] bg-slate-50 border p-2 text-slate-500 rounded-xl">
                                  <span>Status: <strong className="text-slate-800">{inc.status}</strong></span>
                                  <div className="flex gap-2">
                                    {inc.status === 'INCIDENT_CREATED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMajorIncidents(majorIncidents.map(x => x.id === inc.id ? { ...x, status: 'INVESTIGATING' } : x));
                                          triggerLogWrite("Transition incident state", inc.id, "INVESTIGATING Stage");
                                        }}
                                        className="bg-indigo-650 text-white px-2 py-1 rounded text-[9.5px] font-black cursor-pointer"
                                      >
                                        Investigate
                                      </button>
                                    )}
                                    {inc.status === 'INVESTIGATING' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const rcaText = prompt("Analyze and describe the Root Cause of this Outage:");
                                          if (rcaText) {
                                            setMajorIncidents(majorIncidents.map(x => x.id === inc.id ? { ...x, status: 'ROOT_CAUSE_ANALYSIS', rootCause: rcaText } : x));
                                            triggerLogWrite("RCA Diagnostic Written for Incident", inc.id, rcaText);
                                          }
                                        }}
                                        className="bg-amber-600 text-white px-2 py-1 rounded text-[9.5px] font-black cursor-pointer"
                                      >
                                        Verify Root Cause
                                      </button>
                                    )}
                                    {inc.status === 'ROOT_CAUSE_ANALYSIS' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const prevPl = prompt("State the preventative actions deployed to prevent repeat failures:");
                                          if (prevPl) {
                                            setMajorIncidents(majorIncidents.map(x => x.id === inc.id ? { ...x, status: 'RESOLVED', preventiveActions: prevPl, resolvedAt: new Date().toISOString() } : x));
                                            triggerLogWrite("Resolved Outage Incident", inc.id, `Preventative Actions: ${prevPl}`);
                                          }
                                        }}
                                        className="bg-emerald-600 text-white px-2 py-1 rounded text-[9.5px] font-black cursor-pointer"
                                      >
                                        De-escalate & Resolve
                                      </button>
                                    )}
                                    {inc.status === 'RESOLVED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMajorIncidents(majorIncidents.map(x => x.id === inc.id ? { ...x, status: 'POST_MORTEM' } : x));
                                          triggerLogWrite("Outage Incident Closed Post-Mortem Signed", inc.id, "Immutable Archive");
                                        }}
                                        className="bg-slate-800 text-white px-2 py-1 rounded text-[9.5px] font-black cursor-pointer"
                                      >
                                        Finalize Post-Mortem
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 6: SECURITY OPERATIONS CENTER (SOC) */}
                      {sysAdminSubTab === 'SOC' && (
                        <div className="space-y-4 font-normal">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🛡️ SOC Threat Protection & Active API Abuse Mitigation</h4>
                              <p className="text-[10px] text-slate-400">Track SIM Swap fraud coordinates, lock brute force sources, or sever active user authorization tokens.</p>
                            </div>
                            <span className="bg-red-600 text-white text-[9.5px] font-black font-mono px-2 py-1 rounded-md border animate-pulse">
                              Active Alerts: {socAlerts.filter(x => x.status === 'Active Alert').length} Threats Detected Today
                            </span>
                          </div>

                          <div className="border rounded-2xl overflow-hidden text-[11px] bg-white">
                            <div className="grid grid-cols-6 bg-slate-950 p-3 font-mono font-bold text-slate-350 border-b uppercase tracking-tight text-[10px]">
                              <span>Timestamp</span>
                              <span>Target Subsystem</span>
                              <span>Source Actor</span>
                              <span>Threat Signature</span>
                              <span>Severity</span>
                              <span className="text-right">Mitigation Shield</span>
                            </div>
                            <div className="divide-y font-semibold font-mono">
                              {socAlerts.map((e) => (
                                <div key={e.id} className="grid grid-cols-6 p-3 items-center hover:bg-slate-50 text-slate-705">
                                  <span className="text-[10px] font-medium text-slate-450">{new Date(e.timestamp).toLocaleTimeString()}</span>
                                  <span className="font-bold text-indigo-950">{e.eventType}</span>
                                  <div className="space-y-0.5">
                                    <span className="block text-slate-800 font-black">{e.targetUser}</span>
                                    <span className="block text-[8px] text-slate-400 font-semibold italic">IP: {e.ipAddress}</span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-650 font-medium font-sans leading-relaxed pr-2">{e.frequency}</p>
                                  <div>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                                      e.severity === 'Critical' ? 'bg-red-500 text-white' :
                                      e.severity === 'High' ? 'bg-orange-100 text-orange-950' : 'bg-amber-100 text-amber-900'
                                    }`}>
                                      {e.severity}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 justify-end flex-wrap">
                                    {e.status === 'Mitigated' ? (
                                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[8px] font-black px-2 py-1 rounded">
                                        🛡️ MITIGATED MATCH
                                      </span>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (adminLevel < 3) {
                                              alert("❌ Security violation: Locking users from the SOC suite requires Level 3 Security Administration clearance.");
                                              return;
                                            }
                                            setAdminAccounts(adminAccounts.map(x => x.handle === e.targetUser ? { ...x, status: 'Locked' } : x));
                                            setSocAlerts(socAlerts.map(x => x.id === e.id ? { ...x, status: 'Mitigated' } : x));
                                            triggerLogWrite("SOC: Locked threat source user account", e.targetUser, "Mitigated Security Threat");
                                          }}
                                          className="bg-red-650 hover:bg-red-750 text-white text-[8px] font-black px-2 py-0.5 rounded"
                                        >
                                          Lock User
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (adminLevel < 3) {
                                              alert("❌ Access denied: IP Firewall blocks require Level 3 Security capabilities.");
                                              return;
                                            }
                                            setSocAlerts(socAlerts.map(x => x.id === e.id ? { ...x, status: 'Mitigated' } : x));
                                            triggerLogWrite("SOC: Ingress IP Address Firewalled & Blocked", e.ipAddress, "Mitigated security threat");
                                            alert(`🛡️ IP Address ${e.ipAddress} successfully appended to core Nginx firewall rejects list.`);
                                          }}
                                          className="bg-slate-900 hover:bg-black text-rose-500 border border-rose-950 text-[8px] font-black px-2 py-0.5 rounded"
                                        >
                                          Block IP
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (adminLevel < 3) {
                                              alert("❌ Security violation: Access token revocation requires Level 3 Security Administration clearance.");
                                              return;
                                            }
                                            setSocAlerts(socAlerts.map(x => x.id === e.id ? { ...x, status: 'Mitigated' } : x));
                                            triggerLogWrite("SOC: Revoked active sessions & OAuth Tokens", e.targetUser, "Tokens Voided");
                                            alert(`🔌 Dispatched revocation signal to OAuth backend. User authorization session destroyed.`);
                                          }}
                                          className="bg-indigo-650 hover:bg-indigo-705 text-white text-[8px] font-black px-2 py-0.5 rounded"
                                        >
                                          Revoke Token
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 7: INTEGRATION MANAGEMENT */}
                      {sysAdminSubTab === 'INTEGRATIONS' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🔌 External Systems Integration & Credential Key rotation</h4>
                              <p className="text-[10px] text-slate-400">Trigger link checks, configure fallbacks, and manage credentials for Safaricom, SendGrid, and SMS APIs.</p>
                            </div>
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold px-2 py-1 rounded">
                              Registered Providers: {liveIntegrations.length}
                            </span>
                          </div>

                          <div className="space-y-3 font-normal text-[11px]">
                            {liveIntegrations.map((igt) => (
                              <div key={igt.name} className="bg-slate-50 border rounded-xl p-3.5 space-y-3 hover:bg-white transition flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-xs font-black text-indigo-950">{igt.name}</strong>
                                    <span className="bg-slate-150 border text-[8.5px] px-2 py-0.5 rounded font-mono uppercase">{igt.type}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-400 font-mono mt-1 space-y-0.5 font-semibold">
                                    <p>Primary API Host: {igt.url}</p>
                                    <p>Certificate Expiry: {new Date(igt.credentialExpiry).toLocaleDateString()} • Ingress Link: <strong className="text-indigo-600">{igt.activeHost}</strong></p>
                                  </div>
                                </div>

                                <div className="flex gap-1.5 shrink-0 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(`🔬 Connection diagnostics running for ${igt.name}...\n\nConnection Code: 200 OK\nPing Response: 14ms\nSSL Certificate: Valid Secure`);
                                    }}
                                    className="bg-slate-800 hover:bg-slate-905 text-white text-[9px] font-black px-2.5 py-1 rounded-lg cursor-pointer"
                                  >
                                    Test Link
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (adminLevel < 2) {
                                        alert("❌ Access denied: Credential rotation credentials restricted below Level 2 Systems admin roles.");
                                        return;
                                      }
                                      const confirmRot = confirm("This will cycle production certificates. Continue?");
                                      if (confirmRot) {
                                        triggerLogWrite("Rotated backend integration API credentials certificate", igt.name, "Generated SHA-256 Secret Block");
                                        alert("🔑 New API secret generated. Configurations pushed to isolated environment keys.");
                                      }
                                    }}
                                    className="bg-indigo-650 hover:bg-indigo-705 text-white text-[9px] font-black px-2.5 py-1 rounded-lg cursor-pointer"
                                  >
                                    Cycle Key
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (adminLevel < 2) {
                                        alert("❌ Access denied: Restricted below Level 2.");
                                        return;
                                      }
                                      setLiveIntegrations(liveIntegrations.map(x => x.name === igt.name ? { ...x, activeHost: 'Backup: Twilio SMS Link Secondary' } : x));
                                      triggerLogWrite("Switched API Ingress backup channel link", igt.name, "Twilio Routing Active");
                                      alert("🛰️ Swapped API traffic to fallback disaster backup gateway.");
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black px-2.5 py-1 rounded-lg cursor-pointer"
                                  >
                                    Swap Standby fallback
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 8: CONFIGURATION RULES */}
                      {sysAdminSubTab === 'CONFIG' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">⚙️ Platform configurations rules Override (change controls)</h4>
                              <p className="text-[10px] text-slate-400">Manage transaction limits, base fee overrides, compliance bounds, and auto-release SLAs.</p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-800 font-mono text-[9px] font-black px-2 py-1 rounded border border-emerald-250">
                              Production Rules State: locked
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* ACTIVE CONFIGS VALUES */}
                            <div className="bg-slate-50 border rounded-xl p-4 space-y-3.5 text-[11px] leading-relaxed">
                              <span className="text-[10px] uppercase font-bold text-slate-650 tracking-wider block font-sans">Active Sandbox Platform Parameters</span>
                              
                              <div className="space-y-2 font-semibold">
                                <div className="flex justify-between border-b pb-1">
                                  <span className="text-slate-500">Processing Fee override Level:</span>
                                  <strong className="text-slate-800 font-mono">{platformConfigurations.platformFeePercent}% of transaction value</strong>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span className="text-slate-500">Minimum Allowed Escrow:</span>
                                  <strong className="text-slate-800 font-mono">Ksh {platformConfigurations.minTransactionLimitKsh.toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span className="text-slate-500">Maximum Allowed Escrow (Auto-Match Cap):</span>
                                  <strong className="text-slate-800 font-mono">Ksh {platformConfigurations.maxTransactionLimitKsh.toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span className="text-slate-500">Default Auto-Release Hold Duration:</span>
                                  <strong className="text-slate-800 font-mono">{platformConfigurations.escrowAutoReleaseHrs} hours</strong>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span className="text-slate-500">Interactive KYC Verification Checks Required:</span>
                                  <strong className="text-indigo-650 font-mono">{platformConfigurations.kycValidationEnforced}</strong>
                                </div>
                                <div className="flex justify-between pb-1">
                                  <span className="text-slate-500">Risk Triggers Multi-factor Verification Tier:</span>
                                  <strong className="text-slate-800 font-mono">Ksh {platformConfigurations.mfaThresholdKsh.toLocaleString()}</strong>
                                </div>
                              </div>
                            </div>

                            {/* CHANGE PROPOSAL INCLUSION */}
                            <div className="bg-slate-50 border p-4 rounded-xl space-y-3 font-normal">
                              <span className="text-[10px] uppercase font-extrabold text-slate-800 tracking-wider block font-sans">Submit Production Override RFC</span>
                              <p className="text-[10px] text-slate-400">
                                ⚠️ Changing parameters requires a formal change control submission (RFC). Overrides must be approved by Level 4 Infrastructure Supervisors.
                              </p>

                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const fd = new FormData(form);
                                const fPercent = fd.get('feePercent') as string;
                                const autoReleaseVal = fd.get('autoRelease') as string;

                                if (!fPercent || !autoReleaseVal) return;

                                const rfcDraft = {
                                  id: `RFC-${Math.floor(4000 + Math.random() * 900)}`,
                                  description: `Adjust basic platform fees to ${fPercent}% and escrow SLA auto release duration to ${autoReleaseVal} hours`,
                                  requestedBy: 'ALEX ONDIEKI (Sys Admin)',
                                  status: 'REQUESTED',
                                  dateRequested: new Date().toISOString()
                                };

                                setChangeRequests([rfcDraft, ...changeRequests]);
                                triggerLogWrite("Submitted Overrides RFC change ticket", rfcDraft.id, rfcDraft.description);
                                alert(`✓ Created Change Request RFC: ${rfcDraft.id}. Request linked into pipeline queue.`);
                                form.reset();
                              }} className="space-y-3 text-[10px]">
                                <div className="space-y-1">
                                  <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Proposed Processing Fee (%)</label>
                                  <input name="feePercent" step="0.1" type="number" required placeholder="1.8" className="w-full bg-white border rounded p-1.5" />
                                </div>
                                <div className="space-y-1">
                                  <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Proposed SLA Hold (Hours)</label>
                                  <input name="autoRelease" type="number" required placeholder="48" className="w-full bg-white border rounded p-1.5" />
                                </div>
                                <button type="submit" className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold py-2 rounded-lg cursor-pointer">
                                  ✓ Submit Overrides RFC for change Approval
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 9: DATA INTEGRITY */}
                      {sysAdminSubTab === 'INTEGRITY' && (
                        <div className="space-y-4 font-normal">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🗄️ Database Integrity Doctor & Ledger Coherence Scanning</h4>
                              <p className="text-[10px] text-slate-400">Detect orphan transactional logs, mismatch parameters, callback duplications, and self-heal tables.</p>
                            </div>
                            <span className="bg-red-50 text-red-700 text-[10px] font-black px-2 py-0.5 rounded border border-red-200 font-mono">
                              Anomalies detected: {dataAnomalyRecords.filter(x => x.status === 'Detected').length} Items
                            </span>
                          </div>

                          <div className="space-y-3 font-normal text-[11px]">
                            {dataAnomalyRecords.map((anm) => (
                              <div key={anm.id} className="bg-slate-50 border rounded-2xl p-4 space-y-3 hover:bg-white transition">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-xs font-black text-indigo-950 font-mono">{anm.id}</strong>
                                      <span className="text-rose-900 bg-rose-50 border text-[8px] font-mono px-1.5 py-0.5 rounded font-black uppercase">{anm.anomalyType}</span>
                                      <span className="text-[9px] text-slate-400 font-mono">Detected At: {new Date(anm.detectedAt).toLocaleString()}</span>
                                    </div>
                                    <h5 className="text-[12px] font-extrabold text-slate-805 mt-1.5">Target Database Table: <strong className="text-slate-900">{anm.affectedTable}</strong></h5>
                                  </div>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                    anm.status === 'Healed' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-rose-50 text-rose-800 border-rose-250 animate-pulse'
                                  }`}>
                                    {anm.status}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-600 font-mono font-bold leading-relaxed">{anm.description}</p>

                                <div className="flex justify-end gap-1.5 text-[8.5px] font-mono">
                                  {anm.status !== 'Healed' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (adminLevel < 2) {
                                            alert("❌ Authorization: Healing tables restricts access below Level 2.");
                                            return;
                                          }
                                          setDataAnomalyRecords(dataAnomalyRecords.map(x => x.id === anm.id ? { ...x, status: 'Healed', description: 'Rebuilt indices successful. Coherence match 100%' } : x));
                                          triggerLogWrite("Repaired database integrity ledger record", anm.id, "Healed");
                                          alert("✓ Database repair engine running. Mismatch pointers re-built successfully. State is reconciled.");
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-705 text-white font-extrabold px-3 py-1 rounded-lg cursor-pointer"
                                      >
                                        Run Self-Heal Repair (✓)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (adminLevel < 2) {
                                            alert("❌ Authorization restrictions below Level 2.");
                                            return;
                                          }
                                          triggerLogWrite("Escaled index anomaly to system administrators", anm.id, "Investigation dossier launched");
                                          alert("🚨 Ticket escalated. Database administrator dispatched.");
                                        }}
                                        className="bg-purple-600 hover:bg-purple-705 text-white font-extrabold px-3 py-1 rounded-lg cursor-pointer"
                                      >
                                        Escalate to Supervisor (🚨)
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 10: DISASTER RECOVERY */}
                      {sysAdminSubTab === 'RECOVERY' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🗄️ Disaster Recovery, Failovers & Encrypted backups Vault</h4>
                              <p className="text-[10px] text-slate-400">Trigger isolated backup records, verify parity keys, or run emergency Platform Failover procedures.</p>
                            </div>
                            <span className="bg-red-650 text-white font-mono text-[9px] font-black px-2 py-1 rounded">
                              Isolated backup vault: CONNECTED
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* ACTIVE BACKUPS */}
                            <div className="md:col-span-2 space-y-3 font-normal text-[11px] leading-relaxed">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Isolated Encrypted Backups logs</span>
                              
                              <div className="border rounded-xl bg-white overflow-hidden">
                                <div className="grid grid-cols-4 bg-slate-50 p-2 font-black border-b text-[9.5px] text-slate-500 uppercase">
                                  <span>Backup ID</span>
                                  <span>Generated At</span>
                                  <span>Size</span>
                                  <span>Integrity Check</span>
                                </div>
                                <div className="divide-y font-mono font-medium text-[10.5px]">
                                  {drBackups.map((bk) => (
                                    <div key={bk.id} className="grid grid-cols-4 p-2 text-slate-700">
                                      <strong className="text-indigo-950">{bk.id}</strong>
                                      <span className="text-[9.5px] text-slate-500">{new Date(bk.timestamp).toLocaleDateString()}</span>
                                      <span>{bk.size}</span>
                                      <span className="text-emerald-700 font-black">{bk.completeStatus}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* DR EMERGENCY ACTION BAY */}
                            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-white space-y-4 font-normal text-[11px] leading-relaxed">
                              <span className="text-[10px] uppercase font-extrabold text-red-400 tracking-wider block font-mono">Disaster Recovery Controls</span>
                              
                              <div className="space-y-2 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert("💾 Backup engine started. Creating snapshots on Mombasa isolated vault...");
                                    const nextB = {
                                      id: `BKP-2026-06-12-${Math.floor(10 + Math.random() * 90)}`,
                                      timestamp: new Date().toISOString(),
                                      size: '1.26 TB',
                                      storageTarget: 'AWS Glacier (Mombasa Isolated S3)',
                                      completeStatus: 'Successful Verified',
                                      integrityScore: '100.0%'
                                    };
                                    setTimeout(() => {
                                      setDrBackups([nextB, ...drBackups]);
                                      triggerLogWrite("Dispatched administrative backup sequence", nextB.id, "100% Integrity Snapshot complete");
                                      alert("✓ Snapshots complete. Backups ledger updated successfully.");
                                    }, 1500);
                                  }}
                                  className="w-full bg-slate-800 hover:bg-slate-750 text-white font-extrabold py-2 rounded-lg border border-slate-700 cursor-pointer"
                                >
                                  💾 Trigger Isolated Snapshot
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    alert("⚡ running backup checksum comparisons...\n\nVerification: 100% Coherent\nChecksum ID: SHA-256 MATCH VERIFIED");
                                    triggerLogWrite("Initiated full cluster backup validation check", "All Targets", "Verified Valid");
                                  }}
                                  className="w-full bg-slate-800 hover:bg-slate-755 text-white font-extrabold py-2 rounded-lg border border-slate-705 cursor-pointer"
                                >
                                  🔬 Compare Checksum Parity
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (adminLevel < 5) {
                                      alert("❌ SECURITY LOCK: Execute Disaster Recovery failover plan strictly requires Level 5 Head of Technology clearance!");
                                      return;
                                    }
                                    const executeDr = confirm("🚨🚨 HIGH RISK ACTION: This will cycle database hosts, flip proxy ingress IPs from Nairobi Core to Mombasa DR isolated environments, and suspend primary nodes. Confirm execution of Buy Safely DR Protocols?");
                                    
                                    if (executeDr) {
                                      triggerLogWrite("DISASTER RECOVERY PLATFORM FAILOVER DEPLOYED", "Nairobi Core Network", "Mombasa Isolated Zone Cluster Live");
                                      alert("🛰️ DISASTER FAILOVER PROTOCOLS ENGAGED SUCCESSFUL. All core traffic proxies shifted. Mombasa nodes live.");
                                    }
                                  }}
                                  className="w-full bg-red-650 hover:bg-red-750 text-white font-mono font-black py-3 rounded-lg text-xs tracking-wider animate-pulse cursor-pointer"
                                >
                                  🔥 Execute Disaster Recovery failover Plan
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 11: ENHANCED AUDIT SEARCH & INVESTIGATIVE CASE MANAGER */}
                      {sysAdminSubTab === 'AUDIT_SEARCH' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center whitespace-nowrap flex-wrap gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">🔍 Immutable System Audit Search & Forensic Case Desk</h4>
                              <p className="text-[10px] text-slate-400">Query SHA-256 logged entries by User, Department, or Transactions. Deploy investigation case files.</p>
                            </div>
                            <span className="bg-slate-900 text-white text-[8px] font-mono px-2 py-1 rounded">
                              LEDGER COHESION: SECURE (SHA-256)
                            </span>
                          </div>

                          {/* SEARCH FILTERS */}
                          <div className="bg-slate-50 border p-3 rounded-xl flex flex-wrap gap-3 items-center text-[11px] font-normal">
                            <span className="font-extrabold text-slate-655 font-sans">Query Parameters:</span>
                            <input
                              type="text"
                              placeholder="Search by user handles, transaction references..."
                              value={logSearchQuery}
                              onChange={(e) => setLogSearchQuery(e.target.value)}
                              className="bg-white border rounded p-1.5 flex-grow font-bold text-[11px]"
                            />
                            <select
                              value={logSearchType}
                              onChange={(e) => setLogSearchType(e.target.value)}
                              className="bg-white border rounded p-1.5 font-bold"
                            >
                              <option value="ALL">All Categories</option>
                              <option value="Simulated">Simulated changes Only</option>
                              <option value="ticket">Ticket Interactions Only</option>
                              <option value="SOC">SOC Operations Only</option>
                            </select>
                          </div>

                          {/* DYNAMIC SEARCH RESULTS LISTING & CASE MANAGER */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-normal text-[11px]">
                            {/* RESULTS TERM */}
                            <div className="space-y-3">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Query Logs Match Ledger</span>
                              <div className="bg-slate-950 rounded-xl max-h-[350px] overflow-y-auto p-3 font-mono text-[9px] text-slate-200 divide-y divide-slate-900 scrollbar-thin">
                                {logs
                                  .filter(lg => {
                                    if (logSearchType !== 'ALL' && !lg.action.toLowerCase().includes(logSearchType.toLowerCase())) return false;
                                    const q = logSearchQuery.toLowerCase();
                                    return lg.user?.toLowerCase().includes(q) || lg.action?.toLowerCase().includes(q) || JSON.stringify(lg.newValue)?.toLowerCase().includes(q);
                                  })
                                  .map((lg, idx) => (
                                    <div key={lg.id || idx} className="py-2.5 space-y-1 hover:bg-slate-900 cursor-pointer p-1 rounded transition" onClick={() => {
                                      setSelectedLogForInvestigation(lg);
                                      setInvestigationLinkedTicket(lg.id || `TKT-${Math.floor(100+Math.random()*900)}`);
                                    }}>
                                      <p className="text-indigo-400 font-extrabold text-[8px] flex justify-between leading-none pb-0.5">
                                        <span>[{lg.date} @ {lg.time}] ENTRY #{lg.id || idx}</span>
                                        <span className="text-red-400 font-black">{lg.role}</span>
                                      </p>
                                      <p className="text-white font-bold leading-tight">&gt; <span className="text-slate-100 font-extrabold">{lg.action}</span></p>
                                      <p className="text-slate-400 text-[8.5px] pl-3">↳ New: <span className="text-emerald-300 font-bold">{JSON.stringify(lg.newValue)}</span></p>
                                      <p className="text-[8px] text-slate-500 text-right pr-1 italic">Click on log to open forensic file</p>
                                    </div>
                                  ))}
                                {logs.length === 0 && (
                                  <p className="text-center text-slate-500 italic py-6">No matching ledger entries found.</p>
                                )}
                              </div>
                            </div>

                            {/* FORENSIC CASE DESIGN DESK */}
                            <div className="space-y-4">
                              {selectedLogForInvestigation ? (
                                <div className="bg-slate-50 border p-4 rounded-xl space-y-3">
                                  <span className="text-[10px] uppercase font-bold text-slate-650 tracking-wider block font-sans">🔬 Open Forensic Investigation Folder</span>
                                  
                                  <div className="bg-white p-2.5 rounded-lg border text-[9.5px] font-mono leading-relaxed text-indigo-950">
                                    <p className="font-extrabold">Selected Entry Target:</p>
                                    <p className="font-semibold text-slate-600">Action: {selectedLogForInvestigation.action}</p>
                                    <p className="text-slate-600 font-semibold">Actor User: {selectedLogForInvestigation.user} ({selectedLogForInvestigation.role})</p>
                                  </div>

                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const fd = new FormData(form);
                                    const titleStr = fd.get('invTitle') as string;
                                    const evStr = fd.get('invEvidence') as string;

                                    if (!titleStr || !evStr) return;

                                    const nextInv = {
                                      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
                                      logId: selectedLogForInvestigation.id || 'LOG-MATCHED',
                                      title: titleStr,
                                      status: 'OPEN',
                                      evidenceNotes: evStr,
                                      linkedTicketId: investigationLinkedTicket || 'TKT-1001',
                                      remarks: 'Awaiting regulatory expert committee evaluation.'
                                    };

                                    setActiveInvestigations([nextInv, ...activeInvestigations]);
                                    triggerLogWrite("Launched formal regulatory audit investigation case folder", nextInv.id, nextInv.title);
                                    alert(`✓ Launched Forensic Case File: ${nextInv.id}. Logs locked into active evidence logs.`);
                                    setSelectedLogForInvestigation(null);
                                    form.reset();
                                  }} className="space-y-3 text-[10px]">
                                    <div className="space-y-1">
                                      <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Investigation Title</label>
                                      <input name="invTitle" required defaultValue={`Audit tracking of action by ${selectedLogForInvestigation.user}`} className="w-full bg-white border rounded p-1.5 font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Evidence Narrative</label>
                                      <textarea name="invEvidence" required rows={3} placeholder="Describe abnormal velocity, sim card swaps, or mismatched credentials coordinates..." className="w-full bg-white border rounded p-1.5 font-bold text-[10.51px]"></textarea>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block font-bold text-slate-500 uppercase text-[8.5px]">Link Support Case ID</label>
                                      <input name="linkedTicketId" type="text" value={investigationLinkedTicket} onChange={(e) => setInvestigationLinkedTicket(e.target.value)} className="w-full bg-white border rounded p-1.5 font-mono" />
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-900 hover:bg-slate-950 text-white font-extrabold py-2 rounded-lg cursor-pointer">
                                      ✓ Deploy Forensic Case File to Auditing desk
                                    </button>
                                  </form>
                                </div>
                              ) : (
                                <div className="bg-slate-50 border p-6 rounded-xl text-center text-slate-400 text-[10.5px]">
                                  💡 Tip: Click on any logged SHA-256 entry in the left box listing to automatically compile and deploy a forensic regulatory investigation folder.
                                </div>
                              )}

                              {/* ACTIVE INVESTIGATIONS LISTING */}
                              <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-slate-550 tracking-wider block font-sans">Active Investigation Cases Records</span>
                                {activeInvestigations.map((caseItem) => (
                                  <div key={caseItem.id} className="border rounded-xl p-3 bg-red-50/10 border-l-4 border-l-rose-500 space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                      <strong className="text-red-950 tracking-tight font-black">{caseItem.id} (Log: #{caseItem.logId})</strong>
                                      <span className="text-red-700 bg-red-50 font-black px-1.5 py-0.5 rounded uppercase text-[8px]">{caseItem.status}</span>
                                    </div>
                                    <h6 className="text-[11px] font-black text-slate-805 leading-dense">{caseItem.title}</h6>
                                    <p className="text-[10px] text-slate-600 font-medium font-mono leading-relaxed">{caseItem.evidenceNotes}</p>
                                    <div className="text-[9px] text-slate-400 italic">
                                      Linked Case: #{caseItem.linkedTicketId} • {caseItem.remarks}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB TAB 12: CHANGE CONTROL MANAGEMENT (RFC pipeline) */}
                      {sysAdminSubTab === 'CHANGE_MGMT' && (
                        <div className="space-y-4">
                          <div className="border-b pb-2 flex justify-between items-center flex-wrap gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-800">📋 Proactive Change Management (RFC Controls Workspace)</h4>
                              <p className="text-[10px] text-slate-400">Track and authorize fee revisions, permissions expansions, or gateway replacements through the master pipeline.</p>
                            </div>
                            <span className="bg-amber-100 text-amber-900 border border-amber-305 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                              RFC Pipeline Size: {changeRequests.filter(x => x.status === 'REQUESTED').length} Requested Overrides
                            </span>
                          </div>

                          <div className="space-y-3 font-normal text-[11px] leading-relaxed">
                            {changeRequests.map((rfc) => (
                              <div key={rfc.id} className="border rounded-2xl p-4 space-y-3 bg-white shadow-xs">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-xs font-black text-slate-900 font-mono">{rfc.id}</strong>
                                      <span className="text-indigo-850 bg-indigo-50 text-[8.5px] px-1.5 py-0.5 rounded font-bold">{new Date(rfc.dateRequested).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs font-black text-slate-800 mt-1">{rfc.description}</p>
                                  </div>

                                  {/* WORKFLOW PATH */}
                                  <div className="flex gap-1 flex-wrap">
                                    {['REQUESTED', 'REVIEWED', 'APPROVED', 'DEPLOYED', 'VERIFIED', 'CLOSED'].map((state, sIdx) => {
                                      const active = rfc.status === state;
                                      return (
                                        <span key={state} className={`text-[7px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                                          active ? 'bg-indigo-900 text-white font-black animate-pulse' : 'bg-slate-100 text-slate-400 font-medium'
                                        }`}>
                                          {idxCol => sIdx + 1}. {state}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] bg-slate-50 border p-2 text-slate-500 rounded-xl">
                                  <span>Submitter Submitter: <strong className="text-slate-800">{rfc.requestedBy}</strong> • Status Token: <strong className="text-indigo-900 font-mono font-bold font-sans uppercase">{rfc.status}</strong></span>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {rfc.status === 'REQUESTED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setChangeRequests(changeRequests.map(x => x.id === rfc.id ? { ...x, status: 'REVIEWED' } : x));
                                          triggerLogWrite("Transition Change Request status", rfc.id, "REVIEWED");
                                        }}
                                        className="bg-slate-800 hover:bg-black text-white px-2 py-1 rounded text-[9px] font-bold cursor-pointer"
                                      >
                                        Mark Reviewed
                                      </button>
                                    )}
                                    {rfc.status === 'REVIEWED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (adminLevel < 4) {
                                            alert("❌ SECURITY LOCKOUT: Production overrides approval enforces clearance level 4 Infrastructure Supervisor clearance!");
                                            return;
                                          }
                                          setChangeRequests(changeRequests.map(x => x.id === rfc.id ? { ...x, status: 'APPROVED' } : x));
                                          triggerLogWrite("Transition Change Request status", rfc.id, "APPROVED");
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-705 text-white px-2 py-1 rounded text-[9px] font-black cursor-pointer"
                                      >
                                        Approve Override (✓)
                                      </button>
                                    )}
                                    {rfc.status === 'APPROVED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setChangeRequests(changeRequests.map(x => x.id === rfc.id ? { ...x, status: 'DEPLOYED' } : x));
                                          triggerLogWrite("Transition Change Request status", rfc.id, "DEPLOYED");
                                          alert("🚀 RFC Successfully Executed. Configurations patched into the live environment keys.");
                                        }}
                                        className="bg-indigo-650 hover:bg-indigo-705 text-white px-2 py-1 rounded text-[9px] font-black cursor-pointer"
                                      >
                                        Deploy Override (🚀)
                                      </button>
                                    )}
                                    {rfc.status === 'DEPLOYED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setChangeRequests(changeRequests.map(x => x.id === rfc.id ? { ...x, status: 'VERIFIED' } : x));
                                          triggerLogWrite("Transition Change Request status", rfc.id, "VERIFIED");
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[9px] font-black cursor-pointer"
                                      >
                                        Verify Execution (✓)
                                      </button>
                                    )}
                                    {rfc.status === 'VERIFIED' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setChangeRequests(changeRequests.map(x => x.id === rfc.id ? { ...x, status: 'CLOSED' } : x));
                                          triggerLogWrite("Transition Change Request status", rfc.id, "CLOSED");
                                        }}
                                        className="bg-slate-700 hover:bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-bold cursor-pointer"
                                      >
                                        Close Request
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>

            </div>
          )}

          {/* F. BUSINESS INTELLIGENCE DASHBOARD */}
          {activeTab === 'BI' && !rbacError && (
            <div className="space-y-6 animate-fadeIn">
              <BusinessIntelligence 
                transactions={transactions} 
                currentStaff={currentStaff} 
                triggerLogWrite={triggerLogWrite}
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
