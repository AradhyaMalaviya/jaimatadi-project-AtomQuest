import React, { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { api } from '../services/api';
import { MOCK_THRUST_AREAS } from '../types';
import type { AuditEvent, GoalSheet, GoalSheetStatus, Quarter, User } from '../types';
import { calculateScore } from '../utils/scoreCalculator';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const DEFAULT_CYCLE = '2026 Annual';
const STATUS_OPTIONS: Array<'ALL' | GoalSheetStatus> = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED'];
const AUDIT_ACTION_OPTIONS: Array<'ALL' | AuditEvent['action']> = [
  'ALL',
  'SUBMIT',
  'RETURN',
  'APPROVE',
  'EDIT',
  'UNLOCK',
  'CHECK_IN',
  'CHECK_IN_REVIEW',
  'EXPORT',
];

const DETAIL_HEADERS = [
  'Employee',
  'Employee ID',
  'Department',
  'Manager',
  'Manager ID',
  'Cycle',
  'Sheet ID',
  'Sheet Status',
  'Submitted At',
  'Approved At',
  'Manager Feedback',
  'Goal ID',
  'Goal Title',
  'Thrust Area',
  'UoM',
  'Baseline',
  'Target',
  'Lower Is Better',
  'Weightage',
  'Quarter',
  'Check-in Submitted',
  'Check-in Submitted At',
  'Actual',
  'Progress Status',
  'Goal Score',
  'Weighted Contribution',
  'Override Score',
  'Override Justification',
  'Manager Check-in Comment',
];

const AUDIT_HEADERS = ['Timestamp', 'Actor', 'Action', 'Target ID', 'Details'];

type ReportRow = Record<string, string | number>;

const formatPercent = (value: number | null) => value === null ? 'N/A' : `${value.toFixed(1)}%`;

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const csvEscape = (value: unknown) => {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const htmlEscape = (value: unknown) => {
  const text = value === undefined || value === null ? '' : String(value);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const rowsToCsv = (headers: string[], rows: ReportRow[]) => {
  return [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n');
};

const rowsToHtmlTable = (headers: string[], rows: ReportRow[]) => `
  <table>
    <thead>
      <tr>${headers.map((header) => `<th>${htmlEscape(header)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map((row) => `<tr>${headers.map((header) => `<td>${htmlEscape(row[header])}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
`;

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const calculateWeightedScore = (sheet: GoalSheet, quarter: Quarter): number | null => {
  const checkIn = sheet.checkIns?.find((ci) => ci.quarter === quarter);
  if (!checkIn?.isSubmitted) return null;

  let hasScore = false;
  const weightedScore = sheet.goals.reduce((total, goal) => {
    const score = calculateScore(goal, checkIn.achievements[goal.id]);
    if (score === null) return total;
    hasScore = true;
    return total + (score * (goal.weightage / 100));
  }, 0);

  return hasScore ? weightedScore : null;
};

const average = (values: number[]) => {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const AdminDashboard: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { goalSheets, auditEvents, logAuditEvent } = useData();
  const [managerFilter, setManagerFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [cycleFilter, setCycleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | GoalSheetStatus>('ALL');
  const [quarterFilter, setQuarterFilter] = useState<'ALL' | Quarter>('ALL');
  const [thrustAreaFilter, setThrustAreaFilter] = useState('ALL');
  const [auditActionFilter, setAuditActionFilter] = useState<'ALL' | AuditEvent['action']>('ALL');

  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const employees = users.filter((user) => user.role === 'EMPLOYEE');
  const managers = users.filter((user) => user.role === 'MANAGER');
  const departments = Array.from(new Set(users.map((user) => user.department).filter(Boolean))) as string[];
  const cycles = Array.from(new Set(goalSheets.map((sheet) => sheet.cycle || DEFAULT_CYCLE)));

  const getUserName = useCallback((userId?: string) => userId ? userById.get(userId)?.name || userId : '-', [userById]);
  const getEmployee = useCallback((employeeId: string) => userById.get(employeeId), [userById]);
  const getManager = useCallback((employee?: User) => employee?.managerId ? userById.get(employee.managerId) : undefined, [userById]);

  const filteredSheets = useMemo(() => {
    return goalSheets.filter((sheet) => {
      const employee = userById.get(sheet.employeeId);
      const manager = getManager(employee);

      if (managerFilter !== 'ALL' && employee?.managerId !== managerFilter) return false;
      if (departmentFilter !== 'ALL' && employee?.department !== departmentFilter) return false;
      if (employeeFilter !== 'ALL' && sheet.employeeId !== employeeFilter) return false;
      if (cycleFilter !== 'ALL' && (sheet.cycle || DEFAULT_CYCLE) !== cycleFilter) return false;
      if (statusFilter !== 'ALL' && sheet.status !== statusFilter) return false;
      if (thrustAreaFilter !== 'ALL' && !sheet.goals.some((goal) => goal.thrustArea === thrustAreaFilter)) return false;
      if (quarterFilter !== 'ALL' && !sheet.checkIns?.some((checkIn) => checkIn.quarter === quarterFilter && checkIn.isSubmitted)) return false;
      if (managerFilter !== 'ALL' && manager?.id !== managerFilter) return false;

      return true;
    });
  }, [cycleFilter, departmentFilter, employeeFilter, getManager, goalSheets, managerFilter, quarterFilter, statusFilter, thrustAreaFilter, userById]);

  const filteredApprovedSheets = filteredSheets.filter((sheet) => sheet.status === 'APPROVED');
  const filteredSheetIds = useMemo(() => new Set(filteredSheets.map((sheet) => sheet.id)), [filteredSheets]);

  const selectedQuarters = useMemo(() => quarterFilter === 'ALL' ? QUARTERS : [quarterFilter], [quarterFilter]);

  const detailedRows = useMemo<ReportRow[]>(() => {
    const rows: ReportRow[] = [];

    filteredSheets.forEach((sheet) => {
      const employee = getEmployee(sheet.employeeId);
      const manager = getManager(employee);
      const goals = thrustAreaFilter === 'ALL'
        ? sheet.goals
        : sheet.goals.filter((goal) => goal.thrustArea === thrustAreaFilter);

      goals.forEach((goal) => {
        selectedQuarters.forEach((quarter) => {
          const checkIn = sheet.checkIns?.find((ci) => ci.quarter === quarter);
          const achievement = checkIn?.achievements[goal.id];
          const score = calculateScore(goal, achievement);
          const weightedContribution = score === null ? null : score * (goal.weightage / 100);

          rows.push({
            Employee: employee?.name || sheet.employeeId,
            'Employee ID': sheet.employeeId,
            Department: employee?.department || '-',
            Manager: manager?.name || '-',
            'Manager ID': manager?.id || '-',
            Cycle: sheet.cycle || DEFAULT_CYCLE,
            'Sheet ID': sheet.id,
            'Sheet Status': sheet.status,
            'Submitted At': formatDate(sheet.submittedAt),
            'Approved At': formatDate(sheet.approvedAt),
            'Manager Feedback': sheet.managerFeedback || '-',
            'Goal ID': goal.id,
            'Goal Title': goal.title,
            'Thrust Area': goal.thrustArea,
            UoM: goal.uom,
            Baseline: goal.baseline ?? '-',
            Target: goal.target,
            'Lower Is Better': goal.isLowerBetter ? 'Yes' : 'No',
            Weightage: `${goal.weightage}%`,
            Quarter: quarter,
            'Check-in Submitted': checkIn?.isSubmitted ? 'Yes' : 'No',
            'Check-in Submitted At': formatDate(checkIn?.submittedAt),
            Actual: achievement?.actual ?? '-',
            'Progress Status': achievement?.status || '-',
            'Goal Score': score === null ? '-' : `${score.toFixed(1)}%`,
            'Weighted Contribution': weightedContribution === null ? '-' : `${weightedContribution.toFixed(1)}%`,
            'Override Score': achievement?.overrideScore ?? '-',
            'Override Justification': achievement?.overrideJustification || '-',
            'Manager Check-in Comment': checkIn?.managerComment || '-',
          });
        });
      });
    });

    return rows;
  }, [filteredSheets, getEmployee, getManager, selectedQuarters, thrustAreaFilter]);

  const scoreRecords = useMemo(() => {
    return filteredApprovedSheets.flatMap((sheet) => {
      const employee = getEmployee(sheet.employeeId);
      const manager = getManager(employee);
      return selectedQuarters.flatMap((quarter) => {
        const score = calculateWeightedScore(sheet, quarter);
        if (score === null) return [];
        return [{
          sheet,
          employee,
          manager,
          quarter,
          score,
        }];
      });
    });
  }, [filteredApprovedSheets, getEmployee, getManager, selectedQuarters]);

  const alignmentByThrustArea = useMemo(() => {
    const counts: Record<string, { goals: number; weight: number; scores: number[] }> = {};
    MOCK_THRUST_AREAS.forEach((area) => counts[area] = { goals: 0, weight: 0, scores: [] });

    filteredSheets.forEach((sheet) => {
      sheet.goals.forEach((goal) => {
        if (thrustAreaFilter !== 'ALL' && goal.thrustArea !== thrustAreaFilter) return;
        const summary = counts[goal.thrustArea] || { goals: 0, weight: 0, scores: [] };
        summary.goals += 1;
        summary.weight += goal.weightage;
        selectedQuarters.forEach((quarter) => {
          const checkIn = sheet.checkIns?.find((ci) => ci.quarter === quarter);
          const score = calculateScore(goal, checkIn?.achievements[goal.id]);
          if (score !== null) summary.scores.push(score);
        });
        counts[goal.thrustArea] = summary;
      });
    });

    return counts;
  }, [filteredSheets, selectedQuarters, thrustAreaFilter]);

  const checkInCompliance = useMemo(() => {
    const compliance: Record<Quarter, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    filteredApprovedSheets.forEach((sheet) => {
      QUARTERS.forEach((quarter) => {
        const checkIn = sheet.checkIns?.find((ci) => ci.quarter === quarter);
        if (checkIn?.isSubmitted) compliance[quarter] += 1;
      });
    });
    return compliance;
  }, [filteredApprovedSheets]);

  const approvalTurnaround = useMemo(() => {
    const turnaroundHours = filteredApprovedSheets.flatMap((sheet) => {
      if (!sheet.submittedAt || !sheet.approvedAt) return [];
      const submittedAt = new Date(sheet.submittedAt).getTime();
      const approvedAt = new Date(sheet.approvedAt).getTime();
      if (Number.isNaN(submittedAt) || Number.isNaN(approvedAt) || approvedAt < submittedAt) return [];
      return [(approvedAt - submittedAt) / (1000 * 60 * 60)];
    });
    return average(turnaroundHours);
  }, [filteredApprovedSheets]);

  const managerSummary = useMemo(() => {
    return managers.map((manager) => {
      const teamMembers = employees.filter((employee) => employee.managerId === manager.id);
      const teamMemberIds = new Set(teamMembers.map((employee) => employee.id));
      const teamSheets = filteredSheets.filter((sheet) => teamMemberIds.has(sheet.employeeId));
      const teamScores = scoreRecords
        .filter((record) => record.manager?.id === manager.id)
        .map((record) => record.score);

      return {
        manager,
        teamSize: teamMembers.length,
        submitted: teamSheets.filter((sheet) => sheet.status !== 'DRAFT').length,
        pending: teamSheets.filter((sheet) => sheet.status === 'SUBMITTED').length,
        approved: teamSheets.filter((sheet) => sheet.status === 'APPROVED').length,
        returned: teamSheets.filter((sheet) => sheet.status === 'RETURNED').length,
        averageScore: average(teamScores),
      };
    });
  }, [employees, filteredSheets, managers, scoreRecords]);

  const departmentSummary = useMemo(() => {
    return departments.map((department) => {
      const departmentEmployees = employees.filter((employee) => employee.department === department);
      const employeeIds = new Set(departmentEmployees.map((employee) => employee.id));
      const departmentSheets = filteredSheets.filter((sheet) => employeeIds.has(sheet.employeeId));
      const departmentScores = scoreRecords
        .filter((record) => record.employee?.department === department)
        .map((record) => record.score);

      return {
        department,
        employees: departmentEmployees.length,
        submitted: departmentSheets.filter((sheet) => sheet.status !== 'DRAFT').length,
        approved: departmentSheets.filter((sheet) => sheet.status === 'APPROVED').length,
        returned: departmentSheets.filter((sheet) => sheet.status === 'RETURNED').length,
        averageScore: average(departmentScores),
      };
    });
  }, [departments, employees, filteredSheets, scoreRecords]);

  const returnedSheets = filteredSheets.filter((sheet) => sheet.status === 'RETURNED');
  const pendingSheets = filteredSheets.filter((sheet) => sheet.status === 'SUBMITTED');
  const averageWeightedScore = average(scoreRecords.map((record) => record.score));
  const submittedSheetsCount = filteredSheets.filter((sheet) => sheet.status !== 'DRAFT').length;

  const filteredAuditEvents = useMemo(() => {
    return auditEvents.filter((event) => {
      if (auditActionFilter !== 'ALL' && event.action !== auditActionFilter) return false;
      if (event.targetId === 'REPORT') return true;
      return filteredSheetIds.has(event.targetId);
    });
  }, [auditActionFilter, auditEvents, filteredSheetIds]);

  const auditRows = filteredAuditEvents.map((event) => ({
    Timestamp: formatDate(event.timestamp),
    Actor: getUserName(event.actorId),
    Action: event.action,
    'Target ID': event.targetId,
    Details: event.details,
  }));

  const logExport = (details: string) => {
    logAuditEvent({
      action: 'EXPORT',
      actorId: currentUser?.id || 'admin',
      targetId: 'REPORT',
      details,
    });
  };

  const handleExportDetailedCSV = async () => {
    try {
      await api.downloadExport('goals', `atomquest-detailed-report-${new Date().toISOString().split('T')[0]}.csv`);
      logExport('Admin exported detailed Phase 4 report as CSV via backend.');
    } catch (e) {
      console.error(e);
      alert('Failed to export detailed report from backend.');
    }
  };

  const handleExportExcel = () => {
    const html = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>${rowsToHtmlTable(DETAIL_HEADERS, detailedRows)}</body>
      </html>
    `;
    downloadFile('atomquest-detailed-report.xls', html, 'application/vnd.ms-excel;charset=utf-8;');
    logExport('Admin exported detailed Phase 4 report as Excel-compatible XLS.');
  };

  const handleExportAuditCSV = async () => {
    try {
      await api.downloadExport('audit', `atomquest-audit-report-${new Date().toISOString().split('T')[0]}.csv`);
      logExport('Admin exported persistent audit report as CSV via backend.');
    } catch (e) {
      console.error(e);
      alert('Failed to export audit report from backend.');
    }
  };

  const handleExportPDF = () => {
    const summaryRows: ReportRow[] = [
      { Metric: 'Visible Employees', Value: employees.filter((employee) => departmentFilter === 'ALL' || employee.department === departmentFilter).length },
      { Metric: 'Submitted Goal Sheets', Value: submittedSheetsCount },
      { Metric: 'Pending Reviews', Value: pendingSheets.length },
      { Metric: 'Approved Sheets', Value: filteredApprovedSheets.length },
      { Metric: 'Returned Sheets', Value: returnedSheets.length },
      { Metric: 'Average Approval Turnaround', Value: approvalTurnaround === null ? 'N/A' : `${approvalTurnaround.toFixed(1)} hours` },
      { Metric: 'Average Weighted Score', Value: formatPercent(averageWeightedScore) },
    ];
    const printable = window.open('', '_blank');
    if (!printable) return;
    printable.document.write(`
      <html>
        <head>
          <title>AtomQuest Phase 4 Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1, h2 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0 28px; font-size: 11px; }
            th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>AtomQuest Phase 4 Governance Report</h1>
          <p>Generated ${htmlEscape(new Date().toLocaleString())}</p>
          <h2>Summary</h2>
          ${rowsToHtmlTable(['Metric', 'Value'], summaryRows)}
          <h2>Detailed Goal and Check-in Report</h2>
          ${rowsToHtmlTable(DETAIL_HEADERS, detailedRows)}
          <h2>Audit Report</h2>
          ${rowsToHtmlTable(AUDIT_HEADERS, auditRows)}
          <script>window.print();</script>
        </body>
      </html>
    `);
    printable.document.close();
    logExport('Admin opened printable Phase 4 report for PDF export.');
  };

  const resetFilters = () => {
    setManagerFilter('ALL');
    setDepartmentFilter('ALL');
    setEmployeeFilter('ALL');
    setCycleFilter('ALL');
    setStatusFilter('ALL');
    setQuarterFilter('ALL');
    setThrustAreaFilter('ALL');
    setAuditActionFilter('ALL');
  };

  const cardStyle: React.CSSProperties = {
    padding: '18px',
    border: '1px solid #d9e2ec',
    borderRadius: '8px',
    backgroundColor: '#fff',
    minWidth: '180px',
    flex: '1 1 180px',
  };

  const tableWrapStyle: React.CSSProperties = {
    overflowX: 'auto',
    border: '1px solid #d9e2ec',
    borderRadius: '8px',
    backgroundColor: '#fff',
  };

  const thStyle: React.CSSProperties = {
    padding: '8px',
    borderBottom: '1px solid #d9e2ec',
    backgroundColor: '#f3f6f9',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '8px',
    borderBottom: '1px solid #edf2f7',
    verticalAlign: 'top',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #0f766e',
    borderRadius: '4px',
    backgroundColor: '#0f766e',
    color: 'white',
    cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2>Admin Dashboard</h2>
          <p>Monitor Phase 4 reporting, analytics, exports, and governance controls.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleExportDetailedCSV} style={buttonStyle}>Export CSV</button>
          <button onClick={handleExportExcel} style={buttonStyle}>Export Excel</button>
          <button onClick={handleExportPDF} style={buttonStyle}>Export PDF</button>
          <button onClick={handleExportAuditCSV} style={buttonStyle}>Audit CSV</button>
        </div>
      </div>

      <section style={{ marginTop: '20px', padding: '16px', border: '1px solid #d9e2ec', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
        <h3>Report Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <label>
            Manager
            <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="ALL">All managers</option>
              {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
            </select>
          </label>
          <label>
            Department
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="ALL">All departments</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </label>
          <label>
            Employee
            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="ALL">All employees</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </select>
          </label>
          <label>
            Cycle
            <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="ALL">All cycles</option>
              {cycles.map((cycle) => <option key={cycle} value={cycle}>{cycle}</option>)}
            </select>
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'ALL' | GoalSheetStatus)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Quarter
            <select value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value as 'ALL' | Quarter)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="ALL">All quarters</option>
              {QUARTERS.map((quarter) => <option key={quarter} value={quarter}>{quarter}</option>)}
            </select>
          </label>
          <label>
            Thrust Area
            <select value={thrustAreaFilter} onChange={(e) => setThrustAreaFilter(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="ALL">All thrust areas</option>
              {MOCK_THRUST_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </label>
          <label>
            Audit Action
            <select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value as 'ALL' | AuditEvent['action'])} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              {AUDIT_ACTION_OPTIONS.map((action) => <option key={action} value={action}>{action}</option>)}
            </select>
          </label>
        </div>
        <button onClick={resetFilters} style={{ ...buttonStyle, marginTop: '12px', backgroundColor: '#475569', borderColor: '#475569' }}>Reset Filters</button>
      </section>

      <section style={{ display: 'flex', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={cardStyle}><h3>Visible Employees</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{employees.filter((employee) => departmentFilter === 'ALL' || employee.department === departmentFilter).length}</p></div>
        <div style={cardStyle}><h3>Submitted Sheets</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{submittedSheetsCount}</p></div>
        <div style={cardStyle}><h3>Pending Reviews</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{pendingSheets.length}</p></div>
        <div style={cardStyle}><h3>Approved Sheets</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredApprovedSheets.length}</p></div>
        <div style={cardStyle}><h3>Returned Sheets</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{returnedSheets.length}</p></div>
        <div style={cardStyle}><h3>Avg Turnaround</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{approvalTurnaround === null ? 'N/A' : `${approvalTurnaround.toFixed(1)}h`}</p></div>
        <div style={cardStyle}><h3>Avg Weighted Score</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatPercent(averageWeightedScore)}</p></div>
        <div style={cardStyle}><h3>Audit Events</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredAuditEvents.length}</p></div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div style={tableWrapStyle}>
          <h3 style={{ padding: '16px', margin: 0 }}>Check-in Compliance</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {QUARTERS.map((quarter) => (
                <tr key={quarter}>
                  <td style={tdStyle}>{quarter}</td>
                  <td style={tdStyle}>{checkInCompliance[quarter]} / {filteredApprovedSheets.length} submitted</td>
                  <td style={tdStyle}>{filteredApprovedSheets.length === 0 ? 'N/A' : `${((checkInCompliance[quarter] / filteredApprovedSheets.length) * 100).toFixed(1)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={tableWrapStyle}>
          <h3 style={{ padding: '16px', margin: 0 }}>Thrust Area Summary</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Thrust Area</th>
                <th style={thStyle}>Goals</th>
                <th style={thStyle}>Weight</th>
                <th style={thStyle}>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(alignmentByThrustArea).map(([area, summary]) => (
                <tr key={area}>
                  <td style={tdStyle}>{area}</td>
                  <td style={tdStyle}>{summary.goals}</td>
                  <td style={tdStyle}>{summary.weight}%</td>
                  <td style={tdStyle}>{formatPercent(average(summary.scores))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h3>Manager Summary</h3>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Manager</th>
                <th style={thStyle}>Team Size</th>
                <th style={thStyle}>Submitted</th>
                <th style={thStyle}>Pending</th>
                <th style={thStyle}>Approved</th>
                <th style={thStyle}>Returned</th>
                <th style={thStyle}>Avg Weighted Score</th>
              </tr>
            </thead>
            <tbody>
              {managerSummary.map((summary) => (
                <tr key={summary.manager.id}>
                  <td style={tdStyle}>{summary.manager.name}</td>
                  <td style={tdStyle}>{summary.teamSize}</td>
                  <td style={tdStyle}>{summary.submitted}</td>
                  <td style={tdStyle}>{summary.pending}</td>
                  <td style={tdStyle}>{summary.approved}</td>
                  <td style={tdStyle}>{summary.returned}</td>
                  <td style={tdStyle}>{formatPercent(summary.averageScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h3>Department Summary</h3>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Employees</th>
                <th style={thStyle}>Submitted</th>
                <th style={thStyle}>Approved</th>
                <th style={thStyle}>Returned</th>
                <th style={thStyle}>Avg Weighted Score</th>
              </tr>
            </thead>
            <tbody>
              {departmentSummary.map((summary) => (
                <tr key={summary.department}>
                  <td style={tdStyle}>{summary.department}</td>
                  <td style={tdStyle}>{summary.employees}</td>
                  <td style={tdStyle}>{summary.submitted}</td>
                  <td style={tdStyle}>{summary.approved}</td>
                  <td style={tdStyle}>{summary.returned}</td>
                  <td style={tdStyle}>{formatPercent(summary.averageScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h3>Weighted Score Rollups</h3>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Manager</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Quarter</th>
                <th style={thStyle}>Weighted Score</th>
              </tr>
            </thead>
            <tbody>
              {scoreRecords.map((record) => (
                <tr key={`${record.sheet.id}-${record.quarter}`}>
                  <td style={tdStyle}>{record.employee?.name || record.sheet.employeeId}</td>
                  <td style={tdStyle}>{record.manager?.name || '-'}</td>
                  <td style={tdStyle}>{record.employee?.department || '-'}</td>
                  <td style={tdStyle}>{record.quarter}</td>
                  <td style={tdStyle}>{record.score.toFixed(1)}%</td>
                </tr>
              ))}
              {scoreRecords.length === 0 && (
                <tr><td style={tdStyle} colSpan={5}>No submitted check-ins match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h3>Returned Goal Analysis</h3>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Manager</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Sheet ID</th>
                <th style={thStyle}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {returnedSheets.map((sheet) => {
                const employee = getEmployee(sheet.employeeId);
                const manager = getManager(employee);
                return (
                  <tr key={sheet.id}>
                    <td style={tdStyle}>{employee?.name || sheet.employeeId}</td>
                    <td style={tdStyle}>{manager?.name || '-'}</td>
                    <td style={tdStyle}>{employee?.department || '-'}</td>
                    <td style={tdStyle}>{sheet.id}</td>
                    <td style={tdStyle}>{sheet.managerFeedback || '-'}</td>
                  </tr>
                );
              })}
              {returnedSheets.length === 0 && (
                <tr><td style={tdStyle} colSpan={5}>No returned goal sheets match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h3>Detailed Goal, Check-in, and Score Report</h3>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1400px' }}>
            <thead>
              <tr>
                {DETAIL_HEADERS.slice(0, 14).map((header) => <th key={header} style={thStyle}>{header}</th>)}
                <th style={thStyle}>Quarter</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Weighted</th>
                <th style={thStyle}>Manager Comment</th>
              </tr>
            </thead>
            <tbody>
              {detailedRows.slice(0, 40).map((row, index) => (
                <tr key={`${row['Sheet ID']}-${row['Goal ID']}-${row.Quarter}-${index}`}>
                  {DETAIL_HEADERS.slice(0, 14).map((header) => <td key={header} style={tdStyle}>{row[header]}</td>)}
                  <td style={tdStyle}>{row.Quarter}</td>
                  <td style={tdStyle}>{row['Goal Score']}</td>
                  <td style={tdStyle}>{row['Weighted Contribution']}</td>
                  <td style={tdStyle}>{row['Manager Check-in Comment']}</td>
                </tr>
              ))}
              {detailedRows.length === 0 && (
                <tr><td style={tdStyle} colSpan={18}>No report rows match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {detailedRows.length > 40 && <p>Showing first 40 rows. Use export for the complete detailed report.</p>}
      </section>

      <section style={{ marginTop: '24px' }}>
        <h3>Persistent Audit Trail</h3>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Actor</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Target ID</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditEvents.map((event) => (
                <tr key={event.id}>
                  <td style={tdStyle}>{formatDate(event.timestamp)}</td>
                  <td style={tdStyle}>{getUserName(event.actorId)}</td>
                  <td style={tdStyle}>{event.action}</td>
                  <td style={tdStyle}>{event.targetId}</td>
                  <td style={tdStyle}>{event.details}</td>
                </tr>
              ))}
              {filteredAuditEvents.length === 0 && (
                <tr><td style={tdStyle} colSpan={5}>No audit events match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
