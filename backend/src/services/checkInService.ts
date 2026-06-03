import { prisma } from '../db/client';
import { Quarter, GoalSheetStatus } from '@prisma/client';
import { CheckInDto, CheckInReviewDto } from '../types';
import { calculateScore } from '../utils/scoreCalculator';
import { auditService } from './auditService';

export const checkInService = {
  async submitCheckIn(sheetId: string, employeeId: string, data: CheckInDto) {
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: sheetId },
      include: { goals: true },
    });

    if (!sheet) throw new Error('Goal sheet not found');
    if (sheet.employeeId !== employeeId) throw new Error('Unauthorized');
    if (sheet.status !== GoalSheetStatus.APPROVED) throw new Error('Check-ins are only allowed for approved sheets');

    return prisma.$transaction(async (tx) => {
      let checkIn = await tx.checkIn.findUnique({
        where: { sheetId_quarter: { sheetId, quarter: data.quarter } },
      });

      if (!checkIn) {
        checkIn = await tx.checkIn.create({
          data: { sheetId, quarter: data.quarter, isSubmitted: true, submittedAt: new Date() },
        });
      } else {
        await tx.checkIn.update({
          where: { id: checkIn.id },
          data: { isSubmitted: true, submittedAt: new Date() },
        });
      }

      // Upsert achievements
      for (const ach of data.achievements) {
        await tx.achievement.upsert({
          where: { checkInId_goalId: { checkInId: checkIn.id, goalId: ach.goalId } },
          update: { actual: ach.actual, status: ach.status },
          create: { checkInId: checkIn.id, goalId: ach.goalId, actual: ach.actual, status: ach.status },
        });
      }

      const result = await tx.checkIn.findUnique({
        where: { id: checkIn.id },
        include: { achievements: true },
      });

      await auditService.logEvent('CHECK_IN', employeeId, sheetId, { quarter: data.quarter });
      return result;
    });
  },

  async managerReview(checkInId: string, managerId: string, data: CheckInReviewDto) {
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: { sheet: { include: { employee: true } } },
    });

    if (!checkIn) throw new Error('Check-in not found');
    if (checkIn.sheet.employee.managerId !== managerId) throw new Error('Unauthorized');

    return prisma.$transaction(async (tx) => {
      // Update manager comment
      await tx.checkIn.update({
        where: { id: checkInId },
        data: { managerComment: data.managerComment },
      });

      // Update overrides
      if (data.overrides) {
        for (const over of data.overrides) {
          if (over.overrideScore !== null && !over.overrideJustification) {
            throw new Error('Override justification is required when an override score is provided');
          }
          await tx.achievement.update({
            where: { checkInId_goalId: { checkInId, goalId: over.goalId } },
            data: {
              overrideScore: over.overrideScore,
              overrideJustification: over.overrideJustification,
            },
          });
        }
      }

      const result = await tx.checkIn.findUnique({
        where: { id: checkInId },
        include: { achievements: true },
      });

      await auditService.logEvent('CHECK_IN_REVIEW', managerId, checkIn.sheetId, { quarter: checkIn.quarter });
      return result;
    });
  },

  async getCalculatedScores(checkInId: string) {
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: {
        achievements: { include: { goal: true } },
      },
    });

    if (!checkIn) return null;

    const scores = checkIn.achievements.map((ach) => {
      const calculated = calculateScore(ach.goal, ach);

      return {
        goalId: ach.goalId,
        calculatedScore: calculated,
        finalScore: ach.overrideScore !== null ? ach.overrideScore : calculated,
        weightage: ach.goal.weightage,
      };
    });

    const weightedTotal = scores.reduce((sum, s) => {
      if (s.finalScore === null) return sum;
      return sum + (s.finalScore * s.weightage) / 100;
    }, 0);

    return { scores, weightedTotal };
  },
};
