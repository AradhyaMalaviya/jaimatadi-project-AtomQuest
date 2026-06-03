import React, { useCallback, useEffect, useState } from 'react';
import type { AuditEvent, CheckIn, Goal, GoalSheet } from '../types';
import { DataContext } from './DataContext';
import type { AuditMeta } from './DataContext';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const DEFAULT_CYCLE = '2026 Annual';

const getSheetCycle = (sheet: GoalSheet) => sheet.cycle || DEFAULT_CYCLE;

const mergeSheet = (sheets: GoalSheet[], updatedSheet: GoalSheet) => {
  return [
    updatedSheet,
    ...sheets.filter((sheet) => {
      const sameId = sheet.id === updatedSheet.id;
      const sameEmployeeCycle = sheet.employeeId === updatedSheet.employeeId && getSheetCycle(sheet) === getSheetCycle(updatedSheet);
      return !sameId && !sameEmployeeCycle;
    }),
  ];
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [goalSheets, setGoalSheets] = useState<GoalSheet[]>([]);
  const [sharedGoals] = useState<Goal[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const refreshAuditEvents = useCallback(async () => {
    if (currentUser?.role !== 'ADMIN') {
      setAuditEvents([]);
      return;
    }

    const events = await api.getAuditEvents();
    setAuditEvents(events);
  }, [currentUser?.role]);

  const refreshGoalSheets = useCallback(async () => {
    if (!currentUser) {
      setGoalSheets([]);
      setAuditEvents([]);
      return;
    }

    const sheets = await api.getGoalSheets(DEFAULT_CYCLE);
    setGoalSheets(sheets);
    await refreshAuditEvents();
  }, [currentUser, refreshAuditEvents]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshGoalSheets();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshGoalSheets]);

  const saveGoalSheet = async (sheet: GoalSheet) => {
    const cycle = getSheetCycle(sheet);
    let updatedSheet = await api.saveDraft(cycle, sheet.goals);

    if (sheet.status === 'SUBMITTED') {
      updatedSheet = await api.submitGoalSheet(cycle);
    }

    setGoalSheets((previous) => mergeSheet(previous, updatedSheet));
    await refreshAuditEvents();
  };

  const getGoalSheetByEmployee = (employeeId: string) => {
    return goalSheets.find((sheet) => sheet.employeeId === employeeId);
  };

  const getGoalSheetsForManager = (managerId: string) => {
    if (!managerId) return [];
    return goalSheets;
  };

  const updateGoalSheetStatus = async (
    sheetId: string,
    status: GoalSheet['status'],
    feedback?: string,
    _audit?: AuditMeta,
    goals?: Goal[]
  ) => {
    if (status !== 'APPROVED' && status !== 'RETURNED') {
      await refreshGoalSheets();
      return;
    }

    const updatedSheet = await api.reviewGoalSheet(sheetId, status === 'APPROVED' ? 'APPROVE' : 'RETURN', feedback, goals);
    setGoalSheets((previous) => mergeSheet(previous, updatedSheet));
    await refreshAuditEvents();
  };

  const saveCheckIn = async (sheetId: string, checkIn: CheckIn, audit?: AuditMeta) => {
    if (audit?.action === 'CHECK_IN_REVIEW') {
      const existingCheckInId = checkIn.id || goalSheets
        .find((sheet) => sheet.id === sheetId)
        ?.checkIns?.find((candidate) => candidate.quarter === checkIn.quarter)
        ?.id;

      if (!existingCheckInId) {
        throw new Error('Cannot review a check-in before the employee submits it.');
      }

      await api.reviewCheckIn(existingCheckInId, checkIn);
    } else {
      await api.submitCheckIn(sheetId, checkIn);
    }

    await refreshGoalSheets();
  };

  const logAuditEvent = async () => {
    await refreshAuditEvents();
  };

  return (
    <DataContext.Provider value={{
      goalSheets,
      sharedGoals,
      auditEvents,
      saveGoalSheet,
      getGoalSheetByEmployee,
      getGoalSheetsForManager,
      updateGoalSheetStatus,
      saveCheckIn,
      logAuditEvent,
    }}>
      {children}
    </DataContext.Provider>
  );
};
