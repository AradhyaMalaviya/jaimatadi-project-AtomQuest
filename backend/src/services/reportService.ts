import { prisma } from '../db/client';
import { GoalSheetStatus } from '@prisma/client';

export const reportService = {
  async getDashboardStats() {
    const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
    const submittedSheets = await prisma.goalSheet.count({ where: { status: GoalSheetStatus.SUBMITTED } });
    const approvedSheets = await prisma.goalSheet.count({ where: { status: GoalSheetStatus.APPROVED } });
    
    // Simple average turnaround (approvedAt - submittedAt)
    const approved = await prisma.goalSheet.findMany({
      where: { status: GoalSheetStatus.APPROVED, NOT: { submittedAt: null } },
      select: { submittedAt: true, approvedAt: true },
    });

    let avgTurnaroundHours = 0;
    if (approved.length > 0) {
      const totalHours = approved.reduce((sum, s) => {
        const diff = s.approvedAt!.getTime() - s.submittedAt!.getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgTurnaroundHours = totalHours / approved.length;
    }

    return {
      totalEmployees,
      submittedSheets,
      approvedSheets,
      avgTurnaroundHours,
    };
  },

  async getAlignmentByThrustArea() {
    const goals = await prisma.goal.findMany({
      select: { thrustArea: true },
    });

    const alignment: Record<string, number> = {};
    goals.forEach((g) => {
      alignment[g.thrustArea] = (alignment[g.thrustArea] || 0) + 1;
    });

    return alignment;
  },

  async getCheckInCompliance() {
    const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
    const compliance = await prisma.checkIn.groupBy({
      by: ['quarter'],
      where: { isSubmitted: true },
      _count: { _all: true },
    });

    return compliance.map((c) => ({
      quarter: c.quarter,
      count: c._count._all,
      percentage: (c._count._all / totalEmployees) * 100,
    }));
  },

  async getManagerSummaries() {
    return prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        name: true,
        department: true,
        _count: {
          select: {
            reports: true,
          },
        },
        reports: {
          select: {
            goalSheets: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });
  },

  async getDepartmentSummaries() {
    const departments = await prisma.user.groupBy({
      by: ['department'],
      _count: {
        _all: true,
      },
    });

    const summaries = await Promise.all(
      departments.map(async (d) => {
        if (!d.department) return null;
        const totalInDept = d._count._all;
        const approvedCount = await prisma.goalSheet.count({
          where: {
            employee: { department: d.department },
            status: GoalSheetStatus.APPROVED,
          },
        });
        return {
          department: d.department,
          totalEmployees: totalInDept,
          approvedSheets: approvedCount,
          complianceRate: (approvedCount / totalInDept) * 100,
        };
      })
    );

    return summaries.filter(Boolean);
  },

  async getReturnedGoalAnalysis() {
    return prisma.goalSheet.findMany({
      where: { status: GoalSheetStatus.RETURNED },
      select: {
        id: true,
        employee: { select: { name: true, department: true } },
        managerFeedback: true,
        updatedAt: true,
      },
    });
  },
};
