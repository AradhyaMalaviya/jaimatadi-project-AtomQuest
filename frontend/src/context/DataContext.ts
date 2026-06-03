import { createContext } from 'react';
import type { GoalSheet, Goal, CheckIn, AuditEvent } from '../types';

export interface AuditMeta {
  actorId?: string;
  action?: AuditEvent['action'];
  details?: string;
  targetId?: string;
}

export interface DataContextType {
  goalSheets: GoalSheet[];
  sharedGoals: Goal[];
  auditEvents: AuditEvent[];
  saveGoalSheet: (sheet: GoalSheet, audit?: AuditMeta) => Promise<void>;
  getGoalSheetByEmployee: (employeeId: string) => GoalSheet | undefined;
  getGoalSheetsForManager: (managerId: string) => GoalSheet[];
  updateGoalSheetStatus: (sheetId: string, status: GoalSheet['status'], feedback?: string, audit?: AuditMeta, goals?: Goal[]) => Promise<void>;
  saveCheckIn: (sheetId: string, checkIn: CheckIn, audit?: AuditMeta) => Promise<void>;
  logAuditEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'> & Partial<Pick<AuditEvent, 'id' | 'timestamp'>>) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
