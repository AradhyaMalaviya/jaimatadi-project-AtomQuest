export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export type UoM = 'NUMERIC' | 'PERCENTAGE' | 'TIMELINE' | 'ZERO';

export type GoalSheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED';

export interface User {
  id: string;
  name: string;
  role: Role;
  managerId?: string; // Links Employee to their L1 Manager
  department?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: UoM;
  baseline?: string | number; // New: baseline for score calculation
  target: string | number; // Number for NUMERIC/PERCENTAGE, String for TIMELINE, 0 for ZERO
  weightage: number; // 10 to 100
  isShared?: boolean;
  isLowerBetter?: boolean; // New: lower-is-better metrics
}

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type ProgressStatus = 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED';

export interface GoalAchievement {
  actual: string | number;
  status: ProgressStatus;
  overrideScore?: number; // New: manager override score
  overrideJustification?: string; // New: justification for override
}

export interface CheckIn {
  id?: string;
  quarter: Quarter;
  achievements: Record<string, GoalAchievement>; // Keyed by goal.id
  managerComment?: string;
  isSubmitted?: boolean;
  submittedAt?: string; // New: track when check-in was submitted
}

export interface GoalSheet {
  id: string;
  employeeId: string;
  cycle?: string;
  status: GoalSheetStatus;
  goals: Goal[];
  submittedAt?: string;
  approvedAt?: string;
  managerFeedback?: string;
  checkIns?: CheckIn[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: 'SUBMIT' | 'RETURN' | 'APPROVE' | 'EDIT' | 'UNLOCK' | 'CHECK_IN' | 'CHECK_IN_REVIEW' | 'EXPORT';
  actorId: string;
  targetId: string; // e.g., GoalSheet ID
  details: string;
}

export const MOCK_USERS: User[] = [
  { id: 'user-alice', name: 'Alice (Employee)', role: 'EMPLOYEE', managerId: 'user-charlie', department: 'Engineering' },
  { id: 'user-bob', name: 'Bob (Employee)', role: 'EMPLOYEE', managerId: 'user-charlie', department: 'Engineering' },
  { id: 'user-charlie', name: 'Charlie (Manager L1)', role: 'MANAGER', managerId: 'user-diana', department: 'Engineering' },
  { id: 'user-diana', name: 'Diana (Admin)', role: 'ADMIN', department: 'HR' },
];

export const MOCK_THRUST_AREAS = [
  'Revenue Growth',
  'Operational Efficiency',
  'Customer Satisfaction',
  'Innovation',
  'Safety and Compliance',
];
