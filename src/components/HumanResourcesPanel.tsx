import React, { useState } from 'react';
import { 
  Users, User, Briefcase, Award, GraduationCap, CheckCircle, Scale, 
  Trash2, ShieldCheck, TrendingUp, HelpCircle, Search, Mail, Calendar, 
  Clock, Check, AlertTriangle, Shield, GitBranch, ArrowRight
} from 'lucide-react';

interface HRStaff {
  id: string;
  name: string;
  role: string;
  department: string;
  roleKey: string;
  email: string;
  performanceRating: number;
  dob?: string;
  joinDate?: string;
  contractType?: string;
  certifications?: string[];
  disciplinaryRecords?: any[];
  reviewHistory?: any[];
  rewardsHistory?: any[];
  trainingCompleted?: any[];
  status?: string;
  finalChecklist?: any;
}

interface HumanResourcesPanelProps {
  currentStaff: any;
  leaves: any[];
  staff: HRStaff[];
  vacancies: any[];
  successionPlan: any[];
  fetchOperationsData: () => Promise<void>;
  STAFF_LIST: any[];
}

export default function HumanResourcesPanel({
  currentStaff,
  leaves,
  staff,
  vacancies,
  successionPlan,
  fetchOperationsData,
  STAFF_LIST
}: HumanResourcesPanelProps) {
  // Sub-tabs for the HR module
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

  // Subtab selections states
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  const [selectedStaffIdForRecords, setSelectedStaffIdForRecords] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Multi-stage rewards approval workflow simulation
  const [rewardsRecommendations, setRewardsRecommendations] = useState<any[]>([
    { id: 'REC-AW-01', staffId: 'STF-01', staffName: 'Mike Otieno', awardType: 'SPOT_AWARD', title: 'Spot Award for Dispute Mediation', amount: 5000, status: 'RECOMMENDED', submittedBy: 'Jane Wairimu', submittedDate: '2026-06-12', remarks: 'Exceptional de-escalation of complex customer dispute.' },
    { id: 'REC-AW-02', staffId: 'STF-04', staffName: 'Ken Bwire', awardType: 'PERFORMANCE_BONUS', title: 'Field Excellence Bonus', amount: 8000, status: 'ENDORSED', submittedBy: 'Rosebell Awuor', submittedDate: '2026-06-11', remarks: 'Verified maximum rural onboarding milestones in single month.' }
  ]);

  // Disciplinary stages
  // Complaint -> Investigation -> Hearing -> Decision -> Appeal -> Closure
  const [disciplinaryCases, setDisciplinaryCases] = useState<any[]>([
    { id: 'DIS-001', staffId: 'STF-04', name: 'Ken Bwire', description: 'Brief delay in submitting product inspection files', category: 'attendance', outcome: 'Warning', status: 'Closure', incidentDate: '2025-05-10', notes: 'Diligence improved after hearing.' },
    { id: 'DIS-002', staffId: 'STF-13', name: 'Lucy Njeri', description: 'Suspected override of secondary reconciliation perimeter check', category: 'security', outcome: 'None', status: 'Investigation', incidentDate: '2026-06-11', notes: 'Reviewing database logs to isolate root credential access.' }
  ]);

  // Custom KPI tracker
  const [customKPIs, setCustomKPIs] = useState<any[]>([
    { id: 'KPI-101', staffId: 'STF-01', kpiName: 'SLA dispute response under 15 mins', val: '95%', period: 'Quarterly', state: 'Active' },
    { id: 'KPI-102', staffId: 'STF-04', kpiName: 'Total field fraud inspections accuracy', val: '98%', period: 'Annual', state: 'Active' }
  ]);

  // Training enrollments
  const [enrolledTrainings, setEnrolledTrainings] = useState<any[]>([
    { staffId: 'STF-01', courseName: 'CBK Escrow Compliance Certification', targetDate: '2026-09-30' },
    { staffId: 'STF-06', courseName: 'Advanced Threat & SIM Swap Assessment', targetDate: '2026-08-15' }
  ]);

  // HR Approval Matrix Interactive Tester state
  const [testerAction, setTesterAction] = useState('TERMINATE');
  const [testerStaffId, setTesterStaffId] = useState('STF-07'); // Jane Wairimu (HR Officer)
  const [testerResult, setTesterResult] = useState<any>(null);

  // Leave approval handler
  const handleLeaveAction = async (id: string, staffName: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/hr/leaves/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Leave request for ${staffName} has been ${status.toLowerCase()} successfully.`);
        fetchOperationsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create vacancy Requisition Opening
  const handleCreateVacancy = async (title: string, dept: string, desc: string) => {
    try {
      const res = await fetch('/api/admin/hr/vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department: dept,
          description: desc,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        alert('Vacancy Campaign Launched Successfully');
        fetchOperationsData();
        // Clear inputs
        (document.getElementById('new-vac-title') as HTMLInputElement).value = '';
        (document.getElementById('new-vac-desc') as HTMLInputElement).value = '';
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVacancyStatusChange = async (vacId: string, status: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/hr/vacancies/${vacId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          user: currentStaff.name,
          role: currentStaff.roleKey,
          logsText: notes
        })
      });
      if (res.ok) {
        alert(`Vacancy campaign updated to: ${status}`);
        fetchOperationsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCandidateStatusChange = async (vacId: string, email: string, status: string, score: number) => {
    try {
      const res = await fetch(`/api/admin/hr/vacancies/${vacId}/candidates/${email}/status`, {
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
        alert(`Candidate status updated to: ${status}`);
        fetchOperationsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Performance submission
  const handleStaffPerformance = async (staffId: string, period: string, kpiScore: number, evaluation: string, managerRemarks: string) => {
    try {
      const res = await fetch('/api/admin/hr/staff/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, period, kpiScore, evaluation, managerRemarks })
      });
      if (res.ok) {
        alert('Employee KPI Evaluation logged & performance scorecard updated successfully.');
        fetchOperationsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Rewards recommendations approval path execution
  const executeRewardsSubmit = (targetEnrollmentId: string, awardTitle: string, bonusAmount: number, remarks: string) => {
    const isOfficer = ['HR_OFFICER', 'HR_BP'].includes(currentStaff.roleKey);
    const newAward = {
      id: `REC-AW-${Math.floor(100 + Math.random() * 900).toString()}`,
      staffId: targetEnrollmentId,
      staffName: STAFF_LIST.find(s => s.id === targetEnrollmentId)?.name || 'Employee',
      awardType: 'SPOT_AWARD',
      title: awardTitle,
      amount: Number(bonusAmount),
      status: 'RECOMMENDED',
      submittedBy: currentStaff.name,
      submittedDate: new Date().toISOString().split('T')[0],
      remarks
    };
    setRewardsRecommendations([newAward, ...rewardsRecommendations]);
    alert(`Reward recommendation for ${newAward.staffName} submitted to supervisor endorsement pipeline.`);
  };

  const endorseRewardRecommendation = (id: string) => {
    const isSupervisor = ['HR_SUPERVISOR', 'HR_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);
    if (!isSupervisor) {
      alert(`COMPLIANCE BLOCK: Character ${currentStaff.name} is not authorized to Endorse rewards. Required: HR Supervisor & above.`);
      return;
    }
    setRewardsRecommendations(rewardsRecommendations.map(r => r.id === id ? { ...r, status: 'ENDORSED' } : r));
    alert('Reward recommendation successfully endorsed & promoted to CFO / HR Manager authorization cycle.');
  };

  const approveRewardRecommendation = async (id: string) => {
    const isManager = ['HR_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);
    if (!isManager) {
      alert(`COMPLIANCE BLOCK: Character ${currentStaff.name} is not authorized to Approve and Disburse funds. Required: HR Manager or COO.`);
      return;
    }
    const rec = rewardsRecommendations.find(r => r.id === id);
    if (!rec) return;

    try {
      const res = await fetch('/api/admin/hr/staff/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: rec.staffId,
          title: rec.title,
          bonusAmount: rec.amount,
          justification: rec.remarks,
          user: currentStaff.name,
          role: currentStaff.roleKey
        })
      });
      if (res.ok) {
        setRewardsRecommendations(rewardsRecommendations.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
        alert(`Disbursement Approved! Ksh ${rec.amount.toLocaleString()} spot bonus has been released to ${rec.staffName}'s NCBA corporate trust subwallet.`);
        fetchOperationsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Enrollment
  const handleEnrollTraining = (staffId: string, courseName: string, targetDate: string) => {
    const fresh = { staffId, courseName, targetDate };
    setEnrolledTrainings([fresh, ...enrolledTrainings]);
    alert(`Personnel ${STAFF_LIST.find(s => s.id === staffId)?.name} enrolled successfully in course: ${courseName}.`);
  };

  // Disciplinary Case
  const handleCreateDisciplinary = async (staffId: string, description: string, category: string, outcome: string, notes: string) => {
    const staffName = STAFF_LIST.find(s => s.id === staffId)?.name || 'Employee';
    const newCase = {
      id: `DIS-${Math.floor(100 + Math.random() * 900).toString()}`,
      staffId,
      name: staffName,
      description,
      category,
      outcome,
      status: 'Complaint',
      incidentDate: new Date().toISOString().split('T')[0],
      notes
    };
    setDisciplinaryCases([newCase, ...disciplinaryCases]);
    alert(`Disciplinary incident ticket initiated under status "Complaint" for ${staffName}.`);
  };

  const advanceDisciplinaryStatus = async (id: string, nextStatus: string) => {
    // Enforcement matrix
    const isSupervisor = ['HR_SUPERVISOR', 'HR_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(currentStaff.roleKey);
    if (nextStatus === 'Decision' && !isSupervisor) {
      alert(`GOVERNANCE BLOCK: Only HR Supervisor or higher can commit and close hearing findings.`);
      return;
    }

    const tCase = disciplinaryCases.find(c => c.id === id);
    if (!tCase) return;

    setDisciplinaryCases(disciplinaryCases.map(c => c.id === id ? { ...c, status: nextStatus } : c));

    if (nextStatus === 'Decision' && tCase.outcome === 'Termination') {
      try {
        await fetch('/api/admin/hr/staff/disciplinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffId: tCase.staffId,
            description: tCase.description,
            status: 'Closure',
            outcome: 'Termination',
            notes: tCase.notes,
            user: currentStaff.name,
            role: currentStaff.roleKey
          })
        });
        fetchOperationsData();
        alert(`Disciplinary Hearing outcome committed: Employee ${tCase.name} terminated from organizational active rosters.`);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert(`Disciplinary case ${id} advanced to workflow phase: ${nextStatus}`);
    }
  };

  // Offboarding separation
  const handleSeparationExit = async (staffId: string, type: string) => {
    const eq = (document.getElementById('talent-sep-eq') as HTMLInputElement)?.checked;
    const access = (document.getElementById('talent-sep-access') as HTMLInputElement)?.checked;
    const settle = (document.getElementById('talent-sep-settle') as HTMLInputElement)?.checked;
    const transfer = (document.getElementById('talent-sep-trans') as HTMLInputElement)?.checked;

    if (!eq || !access || !settle || !transfer) {
      alert('PENDING CHECKLIST VALIDATION: All separation parameters (equipment, digital keys, exit settlement, core knowledge transfer) must be verified and checked before offboarding completes.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/hr/staff/${staffId}/separation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          equipmentReturned: eq,
          accessRemoved: access,
          finalSettlementDone: settle,
          knowledgeTransferred: transfer
        })
      });
      if (res.ok) {
        alert(`Employee offboarded successfully under category: ${type}. All active key access tokens are revoked.`);
        fetchOperationsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sandbox Clearance Tester Matrix calculation
  const runMatrixClearanceTester = () => {
    const actor = STAFF_LIST.find(s => s.id === testerStaffId);
    if (!actor) return;

    const role = actor.roleKey;
    const action = testerAction;

    let allowed = false;
    let requiredRole = '';

    switch (action) {
      case 'CREATE_VACANCY':
        allowed = true; // Officer, Supervisor, Manager can do it
        requiredRole = 'HR Officer & Above';
        break;
      case 'HIRE_EMPLOYEE':
        allowed = ['HR_BP', 'HR_SUPERVISOR', 'HR_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(role);
        requiredRole = 'HR Supervisor / BP & Above';
        break;
      case 'APPROVE_PROMOTION':
        allowed = ['HR_SUPERVISOR', 'HR_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(role);
        requiredRole = 'HR Supervisor & Above';
        break;
      case 'ISSUE_WARNING':
        allowed = true; // Anyone on HR team
        requiredRole = 'HR Officer & Above';
        break;
      case 'SUSPEND_EMPLOYEE':
        allowed = ['HR_SUPERVISOR', 'HR_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(role);
        requiredRole = 'HR Supervisor & Above';
        break;
      case 'TERMINATE_EMPLOYEE':
        allowed = ['HR_MANAGER', 'CHIEF_OPERATING_OFFICER'].includes(role);
        requiredRole = 'HR Manager / COO Only';
        break;
    }

    setTesterResult({
      actorName: actor.name,
      actorRole: actor.role,
      actorKey: role,
      actionName: action.replace('_', ' '),
      allowed,
      requiredRole,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  // Filters for staff directory
  const filteredStaffFiles = staff.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || st.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* 11 Subtab Navigation */}
      <div className="flex flex-wrap gap-1 border-b pb-2 bg-slate-50 p-2.5 rounded-xl border">
        {[
          { id: 'RECRUITMENT', label: '💼 Recruitment' },
          { id: 'RECORDS', label: '📂 Records & Leaves' },
          { id: 'PERFORMANCE', label: '📈 Performance' },
          { id: 'REWARDS', label: '🏆 Rewards' },
          { id: 'TRAINING', label: '🎓 Training & Dev' },
          { id: 'DISCIPLINARY', label: '⚖️ Disciplinary' },
          { id: 'SEPARATION', label: '🛑 Separation' },
          { id: 'SUCCESSION', label: '🎯 Succession' },
          { id: 'ORG_STRUCTURE', label: '🔗 Org Structure' },
          { id: 'ANALYTICS', label: '📊 Analytics' },
          { id: 'APPROVAL_MATRIX', label: '🛡️ Governance Matrix' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setHrSubTab(sub.id as any)}
            className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition ${
              hrSubTab === sub.id
                ? 'bg-rose-950 text-white shadow-sm font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-650 font-bold border'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: RECRUITMENT MANAGEMENT */}
      {hrSubTab === 'RECRUITMENT' && (
        <div className="space-y-6">
          {/* Create vacancy Requisition Opening Form */}
          <div className="bg-slate-50 border rounded-2xl p-4.5 space-y-4 shadow-sm">
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
                  className="bg-white border rounded text-[11px] p-2.5 w-full font-semibold text-slate-700 font-mono"
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

          {/* Requisition matching and Pipeline progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-black">Active Requisitions ({vacancies.length})</span>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 flex flex-col">
                {vacancies.map(vac => (
                  <div
                    key={vac.id}
                    onClick={() => setSelectedVacancyId(vac.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer text-[11px] transition ${
                      selectedVacancyId === vac.id
                        ? 'bg-rose-50 border-rose-400 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-250'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-[9.5px] text-slate-400">{vac.id}</span>
                      <span className={`text-[8px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded ${
                        vac.status === 'PUBLISHED' ? 'bg-purple-100 text-purple-850' :
                        vac.status === 'CLOSED' ? 'bg-slate-100 text-slate-500' :
                        'bg-amber-50 text-amber-705 border border-amber-200'
                      }`}>{vac.status}</span>
                    </div>
                    <h5 className="font-black text-slate-900 text-[11.5px] mt-1">{vac.title}</h5>
                    <span className="bg-slate-100 text-slate-605 font-bold px-1.5 py-0.5 rounded text-[8.5px] uppercase mt-1.5 inline-block">
                      {vac.department}
                    </span>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold pt-2 border-t mt-2">
                      <span>Applicants: {vac.candidatesCount}</span>
                      <span className="text-indigo-900">Configure Pipeline ➔</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {selectedVacancyId ? (() => {
                const activeVac = vacancies.find(v => v.id === selectedVacancyId);
                if (!activeVac) return <p className="text-slate-450 text-[11px]">Select a vacancy list item.</p>;

                // Interactive Campaign offer letters states
                return (
                  <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{activeVac.title} Pipeline Workflow</h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">Ref ID: {activeVac.id} | Status: <strong className="text-rose-900 uppercase font-bold">{activeVac.status}</strong></span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleVacancyStatusChange(activeVac.id, 'PUBLISHED', `Campaign published to open job boards.`)}
                          className="bg-indigo-900 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg transition"
                        >
                          Publish
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVacancyStatusChange(activeVac.id, 'CLOSED', 'Campaign closed.')}
                          className="bg-slate-900 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg transition"
                        >
                          Close Requisition
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Visual Workflow Progress Bar */}
                    <div className="bg-slate-50 p-3 rounded-lg border text-[10px] font-bold">
                      <span className="text-slate-400 font-black text-[8px] uppercase tracking-wider block mb-2">Campaign Pipeline progress Workflow</span>
                      <div className="flex flex-wrap items-center gap-1">
                        {['CREATED', 'PUBLISHED', 'SHORTLISTED', 'INTERVIEW', 'SELECTION', 'OFFER', 'ACCEPTANCE', 'ONBOARDED'].map((st, idx, arr) => {
                          const isActive = activeVac.status === st || (st === 'ONBOARDED' && activeVac.status === 'CLOSED');
                          return (
                            <React.Fragment key={st}>
                              <span className={`px-2 py-1 rounded-md ${isActive ? 'bg-rose-950 text-white font-black' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                {st}
                              </span>
                              {idx < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium">Description: "{activeVac.description}"</p>

                    {/* Candidate lists */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-black">Active Candidates Application Roster</span>
                      <div className="space-y-2.5 text-[11px]">
                        {activeVac.candidates && activeVac.candidates.map((cand: any) => (
                          <div key={cand.email} className="bg-slate-50 border p-3.5 rounded-xl space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                              <div>
                                <strong className="text-slate-800 text-xs font-bold">{cand.name}</strong>
                                <span className="text-slate-400 font-bold block">{cand.email} | Assessment rating: <strong className="text-indigo-900">{cand.score || 0}%</strong></span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[8px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded ${
                                  cand.status === 'HIRED' ? 'bg-emerald-100 text-emerald-800' :
                                  cand.status === 'INTERVIEWED' ? 'bg-purple-100 text-purple-800' :
                                  'bg-slate-200 text-slate-705'
                                }`}>{cand.status}</span>
                                
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
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] px-2 py-1 rounded-lg font-black uppercase transition"
                                  >
                                    Onboard Employee ➔
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Offer letter sandbox if hired */}
                            {cand.status === 'HIRED' && (
                              <div className="p-3 bg-slate-900 text-rose-100 rounded-lg border font-mono text-[9.5px] leading-relaxed space-y-2">
                                <strong className="text-white uppercase flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-yellow-500" /> CBK REGULATED DIGITAL OFFER LETTER GENERATOR</strong>
                                <p>Dear {cand.name}, on behalf of Buy Safely Escrow Platforms, we are pleased to offer you the position of "{activeVac.title}" on a continuous permanent basis with NCBA sovereign insurance. Your training starts instantly on the secure escrow verification sandbox.</p>
                                <div className="flex justify-end">
                                  <span className="text-[8px] text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded tracking-widest font-black">NCBA REGULATED</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {(!activeVac.candidates || activeVac.candidates.length === 0) && (
                          <p className="text-slate-405 italic">No active candidates. Publish your requisition loop to populate initial applicant rosters.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-white border text-center p-12 rounded-2xl text-slate-400 text-[11px] font-medium">
                  Select a vacancy folder requisition to publish jobs, review workflows, or trigger instant regulatory candidate onboarding procedures.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: EMPLOYEE RECORDS */}
      {hrSubTab === 'RECORDS' && (
        <div className="space-y-6">
          {/* Leaves Request Queue */}
          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-black">Staff Annual Leave Request Forms</span>
            <div className="space-y-2.5">
              {leaves.map(lv => (
                <div key={lv.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-lg border border-slate-250 gap-2 text-[11px]">
                  <div>
                    <strong className="text-slate-800 font-extrabold text-xs">{lv.staffMember}</strong>
                    <span className="text-slate-405 font-bold block">Department: {lv.department} • Type: {lv.type} ({lv.duration})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8.5px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      lv.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : lv.status === 'REJECTED' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800 font-bold'
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

          {/* Searchable filterable Corporate Personnel Directory */}
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
              <div>
                <h4 className="font-extrabold text-slate-850 text-sm flex items-center gap-1.5">📁 Human Resource Digital Dossier Index</h4>
                <p className="text-[10px] text-slate-500">Query personnel information, contractual position history, certifications, and multi-record audit trail.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by name / ID / role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border rounded text-[11px] pl-8 pr-2.5 py-1.5 w-full sm:w-48 font-medium focus:bg-white"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-50 border rounded text-[11px] p-1.5 font-bold text-slate-700"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Finance">Finance & Audit</option>
                  <option value="HR">HR</option>
                  <option value="CRM">CRM</option>
                  <option value="Field Operations">Field Operations</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personnel table */}
              <div className="lg:col-span-1 overflow-x-auto border rounded-xl bg-white max-h-[400px]">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-extrabold">
                      <th className="p-2">ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaffFiles.map(st => (
                      <tr 
                        key={st.id} 
                        onClick={() => setSelectedStaffIdForRecords(st.id)}
                        className={`border-b hover:bg-slate-50 cursor-pointer ${
                          selectedStaffIdForRecords === st.id ? 'bg-rose-50/70 border-rose-300 font-bold' : ''
                        }`}
                      >
                        <td className="p-2 font-mono font-bold text-slate-500">{st.id}</td>
                        <td className="p-2 text-slate-800">{st.name}</td>
                        <td className="p-2 text-slate-550 italic">{st.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detail Dossier View */}
              <div className="lg:col-span-2 border rounded-xl p-4.5 bg-slate-50/50 space-y-4">
                {selectedStaffIdForRecords ? (() => {
                  const target = staff.find(s => s.id === selectedStaffIdForRecords);
                  if (!target) return null;
                  return (
                    <div className="space-y-4 text-[11px]">
                      <div className="flex justify-between items-start border-b pb-2">
                        <div>
                          <strong className="text-indigo-950 text-sm font-black block">{target.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">Dossier Access Token: #{target.id} | Department: {target.department}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          ★ {target.performanceRating?.toFixed(1) || 'N/A'}/5.0 Performer
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-white p-2.5 rounded border shadow-2xs">
                          <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Corporate Contact</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block">{target.email}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded border shadow-2xs">
                          <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Contract Parameters</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block">{target.contractType || 'Permanent'} • Joined {target.joinDate || '2022'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded border shadow-2xs">
                          <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Position Status</span>
                          <span className="font-semibold text-red-950 mt-0.5 block uppercase font-mono">{target.status || 'Active Active'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 bg-white border p-3 rounded-xl">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Completed Compliance Training Program Curriculums</span>
                        <div className="space-y-1.5">
                          {target.trainingCompleted && target.trainingCompleted.map((t, idx) => (
                            <div key={idx} className="flex justify-between border-b pb-1">
                              <span className="font-bold text-slate-700">✓ {t.name}</span>
                              <span className="text-slate-400 font-mono text-[9px]">Competency score: 100% • Exp: {t.expiryDate || 'Continuous'}</span>
                            </div>
                          ))}
                          {(!target.trainingCompleted || target.trainingCompleted.length === 0) && (
                            <span className="text-slate-400 italic">No formal training programs assigned or completed.</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 bg-white border p-3 rounded-xl">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Official Technical Certifications</span>
                        <div className="flex flex-wrap gap-1.5">
                          {target.certifications && target.certifications.map((cert, idx) => (
                            <span key={idx} className="bg-indigo-50 border border-indigo-200 text-indigo-950 font-black px-2.5 py-1 rounded text-[9.5px]">
                              {cert}
                            </span>
                          ))}
                          {(!target.certifications || target.certifications.length === 0) && (
                            <span className="text-slate-400 italic">None logged to professional file.</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border p-3 rounded-xl space-y-1.5 leading-relaxed">
                          <span className="text-[9px] text-slate-400 block font-black uppercase">KPI Review History Log</span>
                          {target.reviewHistory && target.reviewHistory.map((r, idx) => (
                            <div key={idx} className="border-b pb-1 mt-1 text-[10.5px]">
                              <span className="font-black text-slate-800">{r.period} ({r.evaluation}): Score {r.kpiScore}%</span>
                              <p className="text-slate-500 italic">"{r.managerRemarks}"</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white border p-3 rounded-xl space-y-1.5 leading-relaxed">
                          <span className="text-[9px] text-slate-400 block font-black uppercase">Disbursed Spot Awards & Recognition</span>
                          {target.rewardsHistory && target.rewardsHistory.map((w, idx) => (
                            <div key={idx} className="border-b pb-1 mt-1 text-[10.5px]">
                              <span className="font-black text-emerald-800">{w.title}</span>
                              <strong className="block text-slate-600 font-mono">Released: Ksh {w.bonusAmount?.toLocaleString() || 'N/A'}</strong>
                              <p className="text-slate-405 italic">"{w.justification}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <p className="text-slate-400 italic text-center py-10">Select an employee from the left panel index to inspect full digital dossiers, contract history, leaves, and rewards audits.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PERFORMANCE MANAGEMENT */}
      {hrSubTab === 'PERFORMANCE' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-850 text-sm">📈 Performance Management Console</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form 1: Assign Special KPI target */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500">🏆 Formulate & Assign New Custom KPI target</span>
                <div className="space-y-3 text-[11px]">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Target Personnel</label>
                    <select id="kpi-staff-select" className="bg-white border rounded w-full p-2 font-bold text-slate-700">
                      {staff.map(st => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Custom Measurable KPI Target Name</label>
                    <input id="kpi-target-name" type="text" placeholder="e.g. Courier referral verification speed SLA" className="bg-white border rounded w-full p-2 font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Target Value Threshold</label>
                      <input id="kpi-target-val" type="text" defaultValue="98.5% Accuracy" className="bg-white border rounded w-full p-2 font-mono font-bold" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Fulfillment Target Period</label>
                      <select id="kpi-target-period" className="bg-white border rounded w-full p-2 font-bold text-slate-700">
                        <option value="Quarterly">Quarterly Review Cycle</option>
                        <option value="Annual">Annual Review Cycle</option>
                        <option value="Monthly">Monthly Spot Check</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const staffId = (document.getElementById('kpi-staff-select') as HTMLSelectElement).value;
                      const name = (document.getElementById('kpi-target-name') as HTMLInputElement).value;
                      const val = (document.getElementById('kpi-target-val') as HTMLInputElement).value;
                      const period = (document.getElementById('kpi-target-period') as HTMLSelectElement).value;
                      if (!name) {
                        alert('Provide a valid KPI name.');
                        return;
                      }
                      setCustomKPIs([...customKPIs, { id: `KPI-${Math.floor(100+Math.random()*900)}`, staffId, kpiName: name, val, period, state: 'Active' }]);
                      alert(`Successfully assigned custom KPI target to ${STAFF_LIST.find(s=>s.id === staffId)?.name}`);
                    }}
                    className="bg-indigo-950 text-white font-black uppercase text-[10px] py-2 w-full rounded-lg hover:bg-slate-900 transition"
                  >
                    Assign Target Clearances
                  </button>
                </div>
              </div>

              {/* Form 2: Direct KPI evaluation */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500">📈 Record Employee Quarterly Evaluation (Sync)</span>
                <div className="space-y-3 text-[11px]">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Evaluate Personnel</label>
                    <select id="eval-staff-select" className="bg-white border rounded w-full p-2 font-bold text-slate-700">
                      {staff.map(st => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 font-bold block mb-1">KPI Rating Score (0 to 100)</label>
                      <input id="eval-kpi-score" type="number" min="0" max="100" defaultValue="88" className="bg-white border rounded w-full p-2 font-mono font-bold" />
                    </div>
                    <div>
                      <label className="text-slate-500 font-bold block mb-1">General Evaluation Rating</label>
                      <select id="eval-outcome" className="bg-white border rounded w-full p-2 font-bold text-slate-750">
                        <option value="Outstanding">Outstanding Performer</option>
                        <option value="Exceeds Expectations">Exceeds Expectations</option>
                        <option value="Meets Expectations">Meets Expectations</option>
                        <option value="Development Needed">Development Needed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Evaluation Period</label>
                    <input id="eval-period" type="text" defaultValue="2026 Q2 Evaluation" className="bg-white border rounded w-full p-2 font-semibold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Evaluated Manager detailed feedback</label>
                    <textarea id="eval-remarks" placeholder="Provide factual KPI remarks..." className="bg-white border text-[11px] p-2 rounded w-full font-medium h-12" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const staffId = (document.getElementById('eval-staff-select') as HTMLSelectElement).value;
                      const score = Number((document.getElementById('eval-kpi-score') as HTMLInputElement).value);
                      const outcome = (document.getElementById('eval-outcome') as HTMLSelectElement).value;
                      const period = (document.getElementById('eval-period') as HTMLInputElement).value;
                      const remarks = (document.getElementById('eval-remarks') as HTMLTextAreaElement).value;
                      handleStaffPerformance(staffId, period, score, outcome, remarks || 'Evaluated meets parameters.');
                    }}
                    className="bg-indigo-900 text-white font-black uppercase text-[10px] py-2 w-full rounded-lg transition"
                  >
                    Commit KPI Review Log (✓)
                  </button>
                </div>
              </div>
            </div>

            {/* List of active assigned targets */}
            <div className="space-y-3 pt-4">
              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 font-black">Active Assigned Target KPIs</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                {customKPIs.map(kpi => (
                  <div key={kpi.id} className="bg-white p-3 border rounded-xl flex justify-between items-center shadow-2xs">
                    <div>
                      <strong className="text-slate-800 text-xs font-bold block">{kpi.kpiName}</strong>
                      <span className="text-slate-400 font-bold block">Assigned ID: {STAFF_LIST.find(s=>s.id === kpi.staffId)?.name || 'Employee'} | Cycle: {kpi.period}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-black px-2.5 py-1 rounded">
                      {kpi.val} Target
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: REWARDS & RECOGNITION */}
      {hrSubTab === 'REWARDS' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-850 text-sm">🏆 Corporate Rewards & Recognition Department</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form: Submitting Recommendations */}
              <div className="lg:col-span-1 bg-slate-50 border p-4 rounded-xl space-y-4 text-[11px]">
                <strong className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">🏅 Recommend Spot Award or Performance Bonus</strong>
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Select Nominee Personnel</label>
                    <select id="rewards-staff-id" className="bg-white border rounded w-full p-2.5 font-bold text-slate-700">
                      {staff.map(st => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Award Recognition Title</label>
                    <input id="rewards-title" type="text" placeholder="e.g. Employee of the Month" className="bg-white border rounded w-full p-2.5 font-semibold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Disbursement Bonus Amount (Ksh)</label>
                    <input id="rewards-amount" type="number" defaultValue="5000" className="bg-white border rounded w-full p-2.5 font-mono font-bold text-indigo-950" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Factual Audit Remarks & Justification</label>
                    <textarea id="rewards-remarks" placeholder="Write comprehensive justification remarks..." className="bg-white border text-[11px] p-2 w-full font-medium h-16" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const staffId = (document.getElementById('rewards-staff-id') as HTMLSelectElement).value;
                      const title = (document.getElementById('rewards-title') as HTMLInputElement).value;
                      const amount = Number((document.getElementById('rewards-amount') as HTMLInputElement).value);
                      const remarks = (document.getElementById('rewards-remarks') as HTMLTextAreaElement).value;
                      if (!title || !remarks) {
                        alert('Provide a valid award title & remarks.');
                        return;
                      }
                      executeRewardsSubmit(staffId, title, amount, remarks);
                    }}
                    className="bg-indigo-950 text-white font-black uppercase text-[10px] py-2.5 w-full rounded-xl hover:bg-slate-900 transition"
                  >
                    Recommend Spot Reward ➔
                  </button>
                </div>
              </div>

              {/* Multi-stage interactive Approval trail visualization */}
              <div className="lg:col-span-2 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-black">Hierarchical Auditable Release Clearances</span>
                <div className="space-y-3">
                  {rewardsRecommendations.map(rec => {
                    const isRec = rec.status === 'RECOMMENDED';
                    const isEnd = rec.status === 'ENDORSED';
                    const isApp = rec.status === 'APPROVED';

                    return (
                      <div key={rec.id} className="bg-white border rounded-xl p-4 shadow-2xs space-y-3.5">
                        <div className="flex justify-between items-start border-b pb-2 text-[11px]">
                          <div>
                            <span className="bg-neutral-100 text-slate-500 font-mono font-bold px-1.5 py-0.5 rounded text-[8.5px] uppercase">{rec.id}</span>
                            <h5 className="font-extrabold text-slate-800 text-[12.5px] mt-1">Recommended Nominee: {rec.staffName}</h5>
                            <span className="text-[9.5px] text-slate-400 block mt-0.5 font-medium">Recommender: {rec.submittedBy} | Released Amount: <strong className="text-indigo-950">Ksh {rec.amount.toLocaleString()}</strong></span>
                          </div>
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                            isApp ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            isEnd ? 'bg-purple-50 text-purple-705 border-purple-200' :
                            'bg-amber-50 text-amber-705 border-amber-200'
                          }`}>{rec.status}</span>
                        </div>

                        {/* Hierarchical Progress Indicators */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border grid grid-cols-3 text-center text-[9px] font-black tracking-widest leading-relaxed uppercase">
                          <div>
                            <span className="text-slate-400 block font-bold text-[8.5px]">1. SUBMISSION</span>
                            <span className="text-emerald-600 font-extrabold">COMPLETED</span>
                          </div>
                          <div className="border-x">
                            <span className="text-slate-400 block font-bold text-[8.5px]">2. ENDORSEMENT</span>
                            <span className={isEnd || isApp ? 'text-emerald-600 font-extrabold' : 'text-slate-400'}>{isEnd || isApp ? 'ENDORSED' : 'PENDING'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold text-[8.5px]">3. DISBURSEMENT</span>
                            <span className={isApp ? 'text-emerald-600 font-black' : 'text-slate-400'}>{isApp ? 'DIBSURSED' : 'WAITING'}</span>
                          </div>
                        </div>

                        <p className="text-[10.5px] text-slate-500 italic">"Justification: {rec.remarks}"</p>

                        {/* Condition Release actions inside panel */}
                        {!isApp && (
                          <div className="flex justify-end gap-1.5 pt-1 text-[10px]">
                            {isRec && (
                              <button
                                type="button"
                                onClick={() => endorseRewardRecommendation(rec.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-3 py-1.5 rounded-lg transition"
                              >
                                Endorse Nomination ➔
                              </button>
                            )}
                            {isEnd && (
                              <button
                                type="button"
                                onClick={() => approveRewardRecommendation(rec.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wide px-3 py-1.5 rounded-lg transition"
                              >
                                Release Spot Bonus (Ksh {rec.amount.toLocaleString()})
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: TRAINING & DEVELOPMENT */}
      {hrSubTab === 'TRAINING' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-850 text-sm">🎓 Technical Education & Compliance Program Certifications</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form to Enroll Employee */}
              <div className="bg-slate-50 border p-4 rounded-xl space-y-3.5 text-[11px]">
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500">🎓 Enroll Corporate Personnel In Compliance Certifications</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Candidate Personnel</label>
                    <select id="course-staff-select" className="bg-white border rounded w-full p-2 font-bold text-slate-700">
                      {staff.map(st => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Official Technical Certification Curriculum Course</label>
                    <select id="course-name-select" className="bg-white border rounded w-full p-2 font-black text-slate-700">
                      <option value="CBK Escrow Compliance Certification">CBK Escrow Compliance Certification</option>
                      <option value="Advanced Threat & SIM Swap Assessment">Advanced Threat & SIM Swap Assessment</option>
                      <option value="Central Bank Sandbox Compliance">Central Bank Sandbox Compliance</option>
                      <option value="Financial Integrity & AML">Financial Integrity & AML</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Target Compliance Milestone Date</label>
                    <input id="course-date" type="date" defaultValue="2026-09-30" className="bg-white border rounded w-full p-2 font-semibold text-slate-700" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const staffId = (document.getElementById('course-staff-select') as HTMLSelectElement).value;
                      const course = (document.getElementById('course-name-select') as HTMLSelectElement).value;
                      const d = (document.getElementById('course-date') as HTMLInputElement).value;
                      handleEnrollTraining(staffId, course, d);
                    }}
                    className="bg-indigo-950 text-white font-black uppercase text-[10px] py-2 w-full rounded-lg transition"
                  >
                    Commit Active Training Enrollment
                  </button>
                </div>
              </div>

              {/* Status Tracking compliance rates and enrollments */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 font-black">Active Program Enrollments</span>
                <div className="space-y-2 text-[11px]">
                  {enrolledTrainings.map((en, idx) => (
                    <div key={idx} className="bg-slate-50 border p-3 rounded-xl flex justify-between items-center shadow-2xs">
                      <div>
                        <strong className="text-slate-800 text-xs font-bold block">{en.courseName}</strong>
                        <span className="text-slate-400 font-medium">Assigned Pilot: {STAFF_LIST.find(s=>s.id === en.staffId)?.name || 'Employee'} | Target Completion: {en.targetDate}</span>
                      </div>
                      <span className="bg-indigo-150 text-indigo-950 text-[8px] font-black px-2 py-0.5 rounded font-mono uppercase">
                        ACTIVE ENROLLMENT
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress bars representing completion rates */}
                <div className="bg-white border rounded-xl p-4.5 space-y-3 shadow-2xs text-[11px]">
                  <span className="text-[10px] text-slate-505 font-extrabold uppercase tracking-wide block">Technical Completion Rates index (By Course)</span>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>CBK Escrow Compliance Certification</span>
                        <span className="font-mono text-indigo-950">92%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-950 h-full rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Advanced Threat & SIM Swap Assessment</span>
                        <span className="font-mono text-indigo-950">84%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-950 h-full rounded-full" style={{ width: '84%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Central Bank Sandbox Compliance</span>
                        <span className="font-mono text-indigo-950">75%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-950 h-full rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: DISCIPLINARY MANAGEMENT */}
      {hrSubTab === 'DISCIPLINARY' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-850 text-sm">⚖️ Disciplinary & Corporate Incident Investigation System</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to submit Incident Case */}
              <div className="lg:col-span-1 bg-slate-50 border p-4 rounded-xl space-y-3.5 text-[11px]">
                <strong className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">⚖️ Record Corporate/Operational Breach Incident Case</strong>
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Incident Defendant Personnel</label>
                    <select id="case-staff-id" className="bg-white border rounded w-full p-2 font-bold text-slate-750">
                      {staff.map(st => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Issue Classification Category</label>
                    <select id="case-cat" className="bg-white border rounded w-full p-2 font-bold text-slate-700">
                      <option value="misconduct">General Professional Misconduct</option>
                      <option value="fraud">Suspected External/Internal Fraud</option>
                      <option value="policy">Core Operational Policy Breach</option>
                      <option value="attendance">Repeated Work Attendance/SLA Overruns</option>
                      <option value="security">High-Impact Security Parameter Bypass</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Audit Incident Description</label>
                    <input id="case-desc" type="text" placeholder="e.g. Unreconciled trust vault logs" className="bg-white border rounded w-full p-2 font-medium" />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Proposed Committee Outcome</label>
                    <select id="case-outcome-select" className="bg-white border rounded w-full p-2 font-black text-rose-950">
                      <option value="Written Warning">Official Written Warning</option>
                      <option value="Suspension">Temporary Employment Suspension</option>
                      <option value="Termination">Immediate Contractual Separation</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Notes classification & context</label>
                    <textarea id="case-notes" placeholder="Detailed notes / log references..." className="bg-white border text-[11px] p-2 rounded w-full font-medium h-14" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const staffId = (document.getElementById('case-staff-id') as HTMLSelectElement).value;
                      const desc = (document.getElementById('case-desc') as HTMLInputElement).value;
                      const cat = (document.getElementById('case-cat') as HTMLSelectElement).value;
                      const outcome = (document.getElementById('case-outcome-select') as HTMLSelectElement).value;
                      const notes = (document.getElementById('case-notes') as HTMLTextAreaElement).value;
                      if (!desc) {
                        alert('Provide incident description details.');
                        return;
                      }
                      handleCreateDisciplinary(staffId, desc, cat, outcome, notes);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[10px] py-2 w-full rounded-lg transition"
                  >
                    Initialize Active Warning Ticket
                  </button>
                </div>
              </div>

              {/* Active Cases Timeline Progress bar map mapping */}
              <div className="lg:col-span-2 space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-black">Active Disciplinary Incident Pipeline Case files</span>
                <div className="space-y-3 text-[11px]">
                  {disciplinaryCases.map(dc => (
                    <div key={dc.id} className="bg-white border rounded-xl p-4 shadow-2xs space-y-3 leading-relaxed">
                      <div className="flex justify-between items-start border-b pb-2">
                        <div>
                          <span className="bg-red-50 text-red-650 font-mono font-bold px-1.5 py-0.5 rounded text-[8.5px] border border-red-200 uppercase">{dc.id}</span>
                          <h5 className="font-extrabold text-slate-800 mt-1">Defendant: {dc.name}</h5>
                          <span className="text-[9.5px] text-slate-400 font-medium font-mono block">Incident Class: {dc.category} • Date: {dc.incidentDate}</span>
                        </div>
                        <span className="bg-rose-950 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">
                          STAGE: {dc.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Complaint -> Investigation -> Hearing -> Decision -> Appeal -> Closure */}
                      <div className="bg-slate-50 rounded p-2 text-[8px] font-bold">
                        <span className="text-[7.5px] text-slate-400 font-extrabold uppercase block mb-1.5">Action Progression Trail Index</span>
                        <div className="flex flex-wrap items-center gap-1 font-mono">
                          {['Complaint', 'Investigation', 'Hearing', 'Decision', 'Appeal', 'Closure'].map((st, idx, arr) => {
                            const isCurrent = dc.status === st;
                            return (
                              <React.Fragment key={st}>
                                <span className={`px-1 rounded ${isCurrent ? 'bg-red-500 text-white font-black' : 'bg-white text-slate-405 border'}`}>
                                  {st}
                                </span>
                                {idx < arr.length - 1 && <span>➔</span>}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1 bg-slate-50/70 p-2 text-[10.5px] rounded border">
                        <p className="font-semibold text-slate-800">📋 Findings: <span className="font-semibold text-slate-650 font-medium">"{dc.description}"</span></p>
                        <p className="font-semibold text-slate-850 block">Notes: "{dc.notes}"</p>
                        <p className="font-bold text-red-750">Proposed Outcome Verdict: {dc.outcome}</p>
                      </div>

                      {/* Manual pipeline increment controller */}
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-[10px]">
                        <span className="text-slate-450 font-black">ADVANCE TICKET STATUS:</span>
                        <div className="flex gap-1">
                          {dc.status === 'Complaint' && (
                            <button onClick={() => advanceDisciplinaryStatus(dc.id, 'Investigation')} className="bg-indigo-900 text-white px-2.5 py-1 rounded font-bold transition">Start Investigation</button>
                          )}
                          {dc.status === 'Investigation' && (
                            <button onClick={() => advanceDisciplinaryStatus(dc.id, 'Hearing')} className="bg-indigo-900 text-white px-2.5 py-1 rounded font-bold transition">Schedule Hearing</button>
                          )}
                          {dc.status === 'Hearing' && (
                            <button onClick={() => advanceDisciplinaryStatus(dc.id, 'Decision')} className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-black transition">Commit Final Decision Verdict (⚠️)</button>
                          )}
                          {dc.status === 'Decision' && (
                            <button onClick={() => advanceDisciplinaryStatus(dc.id, 'Appeal')} className="bg-slate-900 text-white px-2.5 py-1 rounded font-bold transition">Open Appeal Window</button>
                          )}
                          {dc.status === 'Appeal' && (
                            <button onClick={() => advanceDisciplinaryStatus(dc.id, 'Closure')} className="bg-slate-900 text-white px-2.5 py-1 rounded font-bold transition">Close Case File (✓)</button>
                          )}
                          {dc.status === 'Closure' && (
                            <span className="text-emerald-700 font-extrabold">CASE CLOSED & ARCHIVED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: EMPLOYEE SEPARATION */}
      {hrSubTab === 'SEPARATION' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-850 text-sm">🛑 Professional Separation exit & transition procedures</h4>
            
            <div className="bg-slate-50 border p-4.5 rounded-xl space-y-4 text-[11px] max-w-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-bold">🛠️ Execute Separation exit Dossier checklist</span>
              
              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Separated Personnel</label>
                  <select id="sep-staff-id" className="bg-white border rounded w-full p-2.5 font-bold text-slate-705">
                    {staff.filter(st => st.status !== 'Separated').map(st => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Separation category</label>
                  <select id="sep-type-opt" className="bg-white border text-[11px] p-2.5 rounded w-full font-bold text-slate-750">
                    <option value="Resignation">Voluntary Resignation</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Redundancy">Redundancy / Structural Layoff</option>
                    <option value="Dismissal">Contractual Dismissal Action</option>
                    <option value="Contract Expiry">Contract Expiration</option>
                  </select>
                </div>

                {/* Checklist validation checkpoints */}
                <div className="bg-white border p-3 rounded-lg text-[11px] space-y-2">
                  <span className="text-[9px] font-black text-rose-950 uppercase tracking-widest block font-bold">CRITICAL SECURE EXIT CHECKLISTS VALIDATION</span>
                  
                  <label className="flex items-center gap-2 cursor-pointer py-1 border-b">
                    <input id="talent-sep-eq" type="checkbox" className="rounded" />
                    <span className="font-semibold text-slate-700">Verifiable corporate physical equipment returned (Laptops, SIM arrays, Hardware keys)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer py-1 border-b">
                    <input id="talent-sep-access" type="checkbox" className="rounded" />
                    <span className="font-semibold text-slate-700">Remove corporate digital cloud system authentication credentials instantly</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer py-1 border-b">
                    <input id="talent-sep-settle" type="checkbox" className="rounded text-indigo-900" />
                    <span className="font-semibold text-slate-700">Approve final financial exit payout & CBK trust ledger settlement account balance release</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer py-1">
                    <input id="talent-sep-trans" type="checkbox" className="rounded font-bold" />
                    <span className="font-semibold text-slate-700">Corporate knowledge and active dispute board passwords transferred successfully</span>
                  </label>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const staffId = (document.getElementById('sep-staff-id') as HTMLSelectElement).value;
                      const type = (document.getElementById('sep-type-opt') as HTMLSelectElement).value;
                      handleSeparationExit(staffId, type);
                    }}
                    className="bg-slate-900 hover:bg-rose-950 text-white font-extrabold uppercase text-[10.5px] px-5 py-2.5 rounded-lg transition"
                  >
                    Commit Formal Separation Exit Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 8: SUCCESSION PLANNING */}
      {hrSubTab === 'SUCCESSION' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-850 text-sm">🎯 Successors Planning Contingency maps</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to submit success pipelines */}
              <div className="lg:col-span-1 bg-slate-50 border p-4 rounded-xl space-y-4 text-[11px]">
                <strong className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">🎯 Register Nominated successors pipeline mapping</strong>
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Key Corporate Position</label>
                    <select id="suc-position" className="bg-white border rounded w-full p-2.5 font-bold text-slate-700">
                      <option value="Chief Executive Officer">Chief Executive Officer (CEO)</option>
                      <option value="Chief Operating Officer">Chief Operating Officer (COO)</option>
                      <option value="Head of Finance">Head of Finance</option>
                      <option value="CRM Manager">CRM Manager</option>
                      <option value="Field Operations Manager">Field Operations Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-505 block font-bold mb-1">Nominated Target Successor Candidate</label>
                    <select id="suc-nominee" className="bg-white border rounded w-full p-2.5 font-bold text-slate-700">
                      {staff.map(st => <option key={st.id} value={st.name}>{st.name} ({st.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-505 block font-bold mb-1">Nominee Readiness timeline pipeline</label>
                    <select id="suc-readiness" className="bg-white border rounded w-full p-2.5 font-bold text-slate-700">
                      <option value="Ready Now">Ready Now (Instant)</option>
                      <option value="1-2 Years">1-2 Years (Mid-term)</option>
                      <option value="3-5 Years">3-5 Years (Long-term)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-505 block font-bold mb-1">Primary Skill / Competency Gaps</label>
                    <input id="suc-gap" type="text" placeholder="e.g. Regulatory central bank seminars" className="bg-white border rounded w-full p-2.5 font-medium" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Succession pipeline nominee successfully committed to emergency organizational charts.');
                    }}
                    className="bg-indigo-950 text-white font-black uppercase text-[10px] py-2.5 w-full rounded-xl hover:bg-slate-900 transition"
                  >
                    Nominate Succession Pipeline
                  </button>
                </div>
              </div>

              {/* Success list visualization */}
              <div className="lg:col-span-2 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-black">Designated Corporate succession trees</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {successionPlan.map((succ, idx) => (
                    <div key={idx} className="bg-white border rounded-2xl p-4.5 shadow-2xs space-y-2.5">
                      <div className="flex justify-between items-start border-b pb-1.5 text-[11px]">
                        <div>
                          <span className="bg-rose-50 border border-rose-200 text-rose-950 font-black px-2 py-0.5 rounded text-[8px] uppercase">Contingency Map</span>
                          <h5 className="font-extrabold text-slate-800 text-[13px] mt-1.5">{succ.position}</h5>
                        </div>
                        <span className="bg-red-50 text-red-750 text-[8px] font-black px-2 py-0.5 rounded uppercase">HIGH RISK</span>
                      </div>

                      <div className="bg-slate-50/70 p-2.5 rounded border text-[11px] grid grid-cols-2 gap-3 leading-relaxed">
                        <div>
                          <span className="text-slate-400 block font-bold text-[8.5px] uppercase">Current Incumbent</span>
                          <strong className="text-slate-800">{succ.currentIncumbent || 'Silas Mugo'}</strong>
                        </div>
                        <div>
                          <span className="text-indigo-900 block font-bold text-[8.5px] uppercase">Successor Nominees</span>
                          <strong className="text-indigo-900">{succ.readySuccessors?.[0]?.name || 'Evan Kosgei'}</strong>
                        </div>
                      </div>

                      <div className="text-[10px] space-y-1">
                        <span className="font-semibold block text-slate-500">Readiness Tier: <strong className="text-slate-700 uppercase font-mono">{succ.readySuccessors?.[0]?.readiness || 'Ready Now'}</strong></span>
                        <span className="font-semibold block text-slate-505">Training Gap Development Plan: <span className="text-slate-650 italic font-medium">"{succ.readySuccessors?.[0]?.developmentGap}"</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 9: ORGANIZATIONAL STRUCTURE MANAGEMENT */}
      {hrSubTab === 'ORG_STRUCTURE' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-850 text-sm">🔗 Human Resource Corporate Reporting Lines Structure Diagram</h4>
              <p className="text-[10px] text-slate-450 mt-1">Diagram represents current organizational reporting trees at Buy Safely. The active user profile is highlighted in gold.</p>
            </div>

            {/* Premium CSS-centric visual Org structure chart */}
            <div className="bg-slate-900 text-slate-250 p-6 rounded-2xl border flex flex-col items-center justify-center space-y-5 shadow-inner">
              
              {/* Box 1: CEO */}
              <div className="bg-indigo-950 border border-indigo-400/35 p-3 rounded-lg text-center w-52 shadow">
                <span className="text-[8px] tracking-widest text-slate-400 font-extrabold block">CHIEF EXECUTIVE OFFICE</span>
                <strong className="text-white text-xs block">Sovereign Executive Committee</strong>
                <span className="text-[9px] text-indigo-300 font-mono">CEO Board Authority</span>
              </div>

              <div className="w-1 h-5 bg-indigo-500/40"></div>

              {/* Box 2: COO (Highlighted dynamically if matching active user) */}
              <div className={`p-3.5 rounded-xl text-center w-60 shadow-lg ${
                currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER'
                  ? 'bg-yellow-950 border-2 border-yellow-400 animate-pulse text-yellow-50'
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}>
                <span className="text-[8.5px] tracking-widest font-black block text-slate-400">CHIEF OPERATING OFFICER (COO)</span>
                <strong className="text-xs block font-extrabold">{STAFF_LIST.find(s=>s.roleKey==='CHIEF_OPERATING_OFFICER')?.name}</strong>
                <span className="text-[9px] font-mono leading-relaxed block mt-1 py-0.5 px-2 bg-slate-900/60 rounded border border-slate-750">
                  Department Controller: SYSTEM_ADMIN & OPS
                </span>
                {currentStaff.roleKey === 'CHIEF_OPERATING_OFFICER' && (
                  <span className="mt-1.5 inline-block text-[8px] uppercase tracking-widest px-1.5 py-0.5 bg-yellow-500 text-yellow-950 rounded font-black">YOUR ACTIVE PROFILE</span>
                )}
              </div>

              <div className="w-1 h-6 bg-indigo-500/40"></div>

              {/* Department level 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-[10px] leading-relaxed pt-2 border-t border-slate-800">
                
                {/* Finance Team Box */}
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  currentStaff.department === 'Finance' ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <strong className="text-white text-[11px] block text-center border-b border-slate-700 pb-1">💰 FINANCE & AUDIT TEAM</strong>
                  <p>• <strong className="text-slate-100">Head of Finance:</strong> Hezron Ombati</p>
                  <p>• <strong className="text-slate-100">Finance Manager:</strong> Evans Kosgei</p>
                  <p>• <strong className="text-slate-100">Supervisors:</strong> Grace Kendi</p>
                  <p>• <strong className="text-slate-100">Analysts:</strong> Lucy Njeri, Peter Karanja</p>
                </div>

                {/* CRM Team Box */}
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  currentStaff.department === 'CRM' ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <strong className="text-white text-[11px] block text-center border-b border-slate-700 pb-1">👥 CUSTOMER SUPPORT & CRM</strong>
                  <p>• <strong className="text-slate-100">CRM Manager:</strong> Sarah Mwangi</p>
                  <p>• <strong className="text-slate-100">CRM Supervisor:</strong> David Chemosit</p>
                  <p>• <strong className="text-slate-100">CRM Agents:</strong> Mike Otieno</p>
                </div>

                {/* HR Team Box */}
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  currentStaff.department === 'HR' ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-800/40 border-slate-700/60'
                }`}>
                  <strong className="text-white text-[11px] block text-center border-b border-slate-700 pb-1">👥 HUMAN RESOURCES CO-OP</strong>
                  <p>• <strong className="text-slate-100">HR Manager:</strong> Catherine Mutua</p>
                  <p>• <strong className="text-slate-100">HR Supervisor:</strong> Philip Maingi</p>
                  <p>• <strong className="text-slate-100">HR Officers:</strong> Jane Wairimu, Rosebell Awuor</p>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 10: WORKFORCE ANALYTICS */}
      {hrSubTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border p-4 rounded-xl text-center shadow-2xs">
              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block mb-1">Total Headcount</span>
              <strong className="text-rose-950 font-mono text-xl font-black">{staff.filter(s=>s.status !== 'Separated').length} Active</strong>
              <span className="text-[9px] text-slate-402 block mt-1">+2 Candidates Onboarding</span>
            </div>
            <div className="bg-white border p-4 rounded-xl text-center shadow-2xs">
              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block mb-1">Company Turnover Rate</span>
              <strong className="text-rose-950 font-mono text-xl font-black">4.7%</strong>
              <span className="text-[9px] text-slate-402 block mt-1">Below industry limit</span>
            </div>
            <div className="bg-white border p-4 rounded-xl text-center shadow-2xs">
              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block mb-1">Training Completion avg</span>
              <strong className="text-rose-950 font-mono text-xl font-black">83.6%</strong>
              <span className="text-[9px] text-slate-402 block mt-1">98% compliance score</span>
            </div>
            <div className="bg-white border p-4 rounded-xl text-center shadow-2xs">
              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block mb-1">Recruitment Time to Fill</span>
              <strong className="text-rose-950 font-mono text-xl font-black">21 Days</strong>
              <span className="text-[9px] text-slate-402 block mt-1">SLA Target: 30 days</span>
            </div>
            <div className="bg-white border p-4 rounded-xl text-center shadow-2xs col-span-2 md:col-span-1">
              <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block mb-1">Workforce Absenteeism</span>
              <strong className="text-rose-950 font-mono text-xl font-black">1.8%</strong>
              <span className="text-[9px] text-slate-402 block mt-1">98.2% attendance ledger</span>
            </div>
          </div>

          {/* Performance Rating Curve CSS representations */}
          <div className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-3">
            <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">📊 Corporate Performer Star Rating Distributions (Bell Curve)</h5>
            <div className="space-y-3.5 pt-2 text-[10.5px]">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Outstanding Performer (4.8 - 5.0 Rating Stars)</span>
                  <span className="font-mono text-slate-900">7 Personnel (50%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-950 h-full rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Exceeds Expectations (4.4 - 4.7 Rating Stars)</span>
                  <span className="font-mono text-slate-900">4 Personnel (28%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-950 h-full rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Meets expectations (3.5 - 4.3 Rating Stars)</span>
                  <span className="font-mono text-slate-900">3 Personnel (22%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-950 h-full rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 11: HR APPROVAL MATRIX & GOVERNANCE TESTER */}
      {hrSubTab === 'APPROVAL_MATRIX' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <h4 className="font-extrabold text-slate-850 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Enterprise Governance Approval Matrix
              </h4>
              <p className="text-[10px] text-slate-450 mt-1">Review organizational action authorization thresholds across the HR Lifecycle tree.</p>
            </div>

            {/* Structured Table for Matrix clearances */}
            <div className="overflow-x-auto border rounded-xl bg-white shadow-2xs">
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-extrabold uppercase tracking-wide">
                    <th className="p-3">Governance Flow Action</th>
                    <th className="p-3 text-center">HR Officer / BP</th>
                    <th className="p-3 text-center">HR Supervisor</th>
                    <th className="p-3 text-center">HR Manager / COO</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-slate-700">
                  <tr className="border-b">
                    <td className="p-3 font-bold text-slate-800">Create Vacancy campaign</td>
                    <td className="p-3 text-center text-emerald-600">✓ YES</td>
                    <td className="p-3 text-center text-emerald-600">✓ YES</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ YES</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-bold text-slate-800">Hire / Onboard Applicants</td>
                    <td className="p-3 text-center text-red-500">❌ NO</td>
                    <td className="p-3 text-center text-emerald-600">✓ YES</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ YES</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-bold text-slate-800">Approve Promotion Nomination</td>
                    <td className="p-3 text-center text-red-500">❌ NO</td>
                    <td className="p-3 text-center text-emerald-600">✓ YES</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ YES</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-bold text-slate-800">Issue Disciplinary Warning</td>
                    <td className="p-3 text-center text-emerald-600">✓ YES</td>
                    <td className="p-3 text-center text-emerald-600">✓ YES</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ YES</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-bold text-slate-800">Suspend Personnel Employee</td>
                    <td className="p-3 text-center text-red-500">❌ NO</td>
                    <td className="p-3 text-center text-emerald-600">✓ YES</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ YES</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Terminate Contractual Relationship</td>
                    <td className="p-3 text-center text-red-500">❌ NO</td>
                    <td className="p-3 text-center text-red-500">❌ NO</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ YES (COO)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interactive Sandbox Matrix Tester */}
            <div className="bg-slate-50 border p-4 rounded-xl space-y-4">
              <strong className="text-[11px] text-slate-800 font-extrabold flex items-center gap-1">
                🛡️ Interactive Governance Sandbox Matrix Tester
              </strong>
              <p className="text-[10px] text-slate-500">Pick any personnel from the staff identity select box, pick an action, and run matrix clearances dynamically to see if authorization is granted.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                <div className="space-y-1">
                  <label className="text-slate-505 font-bold block">1. Select Identity Context Developer</label>
                  <select
                    value={testerStaffId}
                    onChange={(e) => setTesterStaffId(e.target.value)}
                    className="bg-white border rounded p-2.5 w-full font-bold text-slate-700"
                  >
                    {STAFF_LIST.filter(s => s.department === 'HR' || s.roleKey === 'CHIEF_OPERATING_OFFICER').map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-550 font-bold block">2. Select Operation Action flow</label>
                  <select
                    value={testerAction}
                    onChange={(e) => setTesterAction(e.target.value)}
                    className="bg-white border rounded p-2.5 w-full font-bold text-slate-705"
                  >
                    <option value="CREATE_VACANCY">Create Vacancy campaign</option>
                    <option value="HIRE_EMPLOYEE">Hire / Onboard Applicant</option>
                    <option value="APPROVE_PROMOTION">Approve Promotion Nomination</option>
                    <option value="ISSUE_WARNING">Issue Disciplinary Warning</option>
                    <option value="SUSPEND_EMPLOYEE">Suspend Personnel Employee</option>
                    <option value="TERMINATE_EMPLOYEE">Terminate Employee Contract</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={runMatrixClearanceTester}
                    className="bg-indigo-950 hover:bg-slate-900 text-white font-extrabold uppercase text-[10px] py-3 tracking-wide rounded-lg w-full transition shadow-sm"
                  >
                    Check Authorization Clearance ➔
                  </button>
                </div>
              </div>

              {/* Clearance Results Alert Box */}
              {testerResult && (
                <div className={`p-4 border rounded-xl flex items-start gap-3.5 ${
                  testerResult.allowed 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-850' 
                    : 'bg-rose-50 border-rose-250 text-rose-850'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {testerResult.allowed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-650" />
                    )}
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <strong className="block text-xs uppercase tracking-wide">
                      {testerResult.allowed ? '✓ AUTHORIZATION GRANTED' : '⚠️ COMPLIANCE ACCESS DENIED'}
                    </strong>
                    <p className="mt-1 font-semibold text-slate-700">
                      Operator <strong className="font-extrabold text-slate-800">{testerResult.actorName} ({testerResult.actorRole})</strong> attempted to execute <strong className="font-extrabold text-indigo-900 font-mono">[{testerResult.actionName}]</strong>.
                    </p>
                    <p className="mt-1 text-slate-600 font-medium">
                      Outcome classification: <span className="font-bold underline">{testerResult.allowed ? 'CLEARANCE VERIFIED' : 'UNAUTHORIZED LEVEL'}</span>. {testerResult.allowed ? 'Proceed with execution to secure production database.' : `Requires level clearance: ${testerResult.requiredRole}.`}
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-2 font-mono">Sandbox Verification Run: {testerResult.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
