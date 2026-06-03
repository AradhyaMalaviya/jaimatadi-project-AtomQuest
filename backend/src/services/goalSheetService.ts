import { prisma } from '../db/client';
import { GoalSheetStatus } from '@prisma/client';
import { UpdateGoalSheetDto, ManagerReviewDto } from '../types';
import { auditService } from './auditService';

const goalSheetInclude = {
  goals: true,
  checkIns: { include: { achievements: true } },
};

export const goalSheetService = {
  async getVisibleSheets(userId: string, role: string, cycle?: string) {
    const cycleFilter = cycle ? { cycle } : {};

    if (role === 'ADMIN') {
      return prisma.goalSheet.findMany({
        where: cycleFilter,
        include: goalSheetInclude,
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (role === 'MANAGER') {
      return prisma.goalSheet.findMany({
        where: {
          ...cycleFilter,
          employee: { managerId: userId },
        },
        include: goalSheetInclude,
        orderBy: { updatedAt: 'desc' },
      });
    }

    return prisma.goalSheet.findMany({
      where: {
        ...cycleFilter,
        employeeId: userId,
      },
      include: goalSheetInclude,
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getByEmployeeId(employeeId: string, cycle: string) {
    return prisma.goalSheet.findUnique({
      where: { employeeId_cycle: { employeeId, cycle } },
      include: goalSheetInclude,
    });
  },

  async createOrUpdateDraft(employeeId: string, cycle: string, data: UpdateGoalSheetDto) {
    // Validate business rules
    if (data.goals.length > 8) throw new Error('Maximum 8 goals allowed');
    
    for (const goal of data.goals) {
      if (goal.weightage < 10) throw new Error('Minimum 10% weightage per goal required');
    }

    return prisma.$transaction(async (tx) => {
      let sheet = await tx.goalSheet.findUnique({
        where: { employeeId_cycle: { employeeId, cycle } },
      });

      if (sheet && sheet.status !== GoalSheetStatus.DRAFT && sheet.status !== GoalSheetStatus.RETURNED) {
        throw new Error('Cannot edit a locked goal sheet');
      }

      if (!sheet) {
        sheet = await tx.goalSheet.create({
          data: { employeeId, cycle, status: GoalSheetStatus.DRAFT },
        });
      }

      // Replace goals
      await tx.goal.deleteMany({ where: { sheetId: sheet.id } });
      await tx.goal.createMany({
        data: data.goals.map((g) => ({ ...g, sheetId: sheet!.id })),
      });

      await auditService.logEvent('EDIT', employeeId, sheet.id);

      return tx.goalSheet.findUnique({
        where: { id: sheet.id },
        include: goalSheetInclude,
      });
    });
  },

  async unlockSheet(sheetId: string, adminId: string) {
    const sheet = await prisma.goalSheet.findUnique({ where: { id: sheetId } });
    if (!sheet) throw new Error('Goal sheet not found');
    
    const result = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.DRAFT },
      include: goalSheetInclude,
    });

    await auditService.logEvent('UNLOCK', adminId, sheetId);
    return result;
  },

  async submitForApproval(employeeId: string, cycle: string) {
    const sheet = await prisma.goalSheet.findUnique({
      where: { employeeId_cycle: { employeeId, cycle } },
      include: { goals: true },
    });

    if (!sheet) throw new Error('Goal sheet not found');
    if (sheet.status !== GoalSheetStatus.DRAFT && sheet.status !== GoalSheetStatus.RETURNED) {
      throw new Error('Goal sheet is already submitted or approved');
    }

    const totalWeightage = sheet.goals.reduce((sum, g) => sum + g.weightage, 0);
    if (totalWeightage !== 100) throw new Error('Total weightage must equal exactly 100%');

    for (const goal of sheet.goals) {
      if (!goal.title || !goal.target) {
        throw new Error(`Goal "${goal.title || 'Untitled'}" is missing title or target`);
      }
    }

    const result = await prisma.goalSheet.update({
      where: { id: sheet.id },
      data: { status: GoalSheetStatus.SUBMITTED, submittedAt: new Date() },
      include: goalSheetInclude,
    });

    await auditService.logEvent('SUBMIT', employeeId, sheet.id);
    return result;
  },

  async managerReview(sheetId: string, managerId: string, data: ManagerReviewDto, action: 'APPROVE' | 'RETURN') {
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: sheetId },
      include: { employee: true, goals: true },
    });

    if (!sheet) throw new Error('Goal sheet not found');
    if (sheet.employee.managerId !== managerId) throw new Error('Unauthorized: You are not this employee\'s manager');
    if (sheet.status !== GoalSheetStatus.SUBMITTED) throw new Error('Goal sheet is not pending approval');

    if (action === 'APPROVE') {
      const result = await prisma.$transaction(async (tx) => {
        // Apply edits if provided
        if (data.goals) {
          for (const gUpdate of data.goals) {
            await tx.goal.update({
              where: { id: gUpdate.id },
              data: { target: gUpdate.target, weightage: gUpdate.weightage },
            });
          }
        }

        // Re-validate weightage after potential edits
        const updatedGoals = await tx.goal.findMany({ where: { sheetId } });
        const totalWeightage = updatedGoals.reduce((sum, g) => sum + g.weightage, 0);
        if (totalWeightage !== 100) throw new Error('Total weightage must be exactly 100% for approval');

        return tx.goalSheet.update({
          where: { id: sheetId },
          data: { status: GoalSheetStatus.APPROVED, approvedAt: new Date(), managerFeedback: data.managerFeedback },
          include: goalSheetInclude,
        });
      });

      await auditService.logEvent('APPROVE', managerId, sheetId);
      return result;
    } else {
      if (!data.managerFeedback) throw new Error('Feedback is required when returning a goal sheet');
      const result = await prisma.goalSheet.update({
        where: { id: sheetId },
        data: { status: GoalSheetStatus.RETURNED, managerFeedback: data.managerFeedback },
        include: goalSheetInclude,
      });

      await auditService.logEvent('RETURN', managerId, sheetId, { feedback: data.managerFeedback });
      return result;
    }
  },

  async getPendingApprovals(managerId: string) {
    return prisma.goalSheet.findMany({
      where: {
        employee: { managerId },
        status: GoalSheetStatus.SUBMITTED,
      },
      include: { employee: true, ...goalSheetInclude },
    });
  },
};
