import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth';
import { reportService } from '../services/reportService';
import { prisma } from '../db/client';

const escapeCsvValue = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const rowsToCsv = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ].join('\n');
};

export default async function reportRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', requireRole(['ADMIN']));

  fastify.get('/stats', async () => {
    const stats = await reportService.getDashboardStats();
    return { success: true, data: stats };
  });

  fastify.get('/alignment', async () => {
    const alignment = await reportService.getAlignmentByThrustArea();
    return { success: true, data: alignment };
  });

  fastify.get('/compliance', async () => {
    const compliance = await reportService.getCheckInCompliance();
    return { success: true, data: compliance };
  });

  fastify.get('/managers', async () => {
    const summaries = await reportService.getManagerSummaries();
    return { success: true, data: summaries };
  });

  fastify.get('/departments', async () => {
    const summaries = await reportService.getDepartmentSummaries();
    return { success: true, data: summaries };
  });

  fastify.get('/returned-analysis', async () => {
    const analysis = await reportService.getReturnedGoalAnalysis();
    return { success: true, data: analysis };
  });

  // CSV Export implementation
  fastify.get('/export/:type', async (request, reply) => {
    const { userId } = (request as any).user;
    const { type } = request.params as { type: string };
    
    // Log the export action as required by Phase 5
    await prisma.auditEvent.create({
      data: {
        action: 'EXPORT',
        actorId: userId,
        details: { exportType: type },
      },
    });

    let dataToExport: any[] = [];
    
    try {
      switch (type) {
        case 'goals':
          const goalSheets = await prisma.goalSheet.findMany({
            include: {
              employee: true,
              goals: true,
              checkIns: {
                include: { achievements: true }
              }
            }
          });
          
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          
          dataToExport = [];
          for (const sheet of goalSheets) {
            for (const goal of sheet.goals) {
              for (const quarter of quarters) {
                const checkIn = sheet.checkIns.find(c => c.quarter === quarter);
                const achievement = checkIn?.achievements.find(a => a.goalId === goal.id);
                
                // Simple score calculation implementation without external dependencies
                let score = null;
                if (achievement && achievement.actual !== null && achievement.actual !== undefined && achievement.actual !== '') {
                  if (achievement.overrideScore !== null) {
                    score = achievement.overrideScore;
                  } else {
                    const target = goal.target;
                    const actual = achievement.actual;
                    if (goal.uom === 'ZERO') score = Number(actual) === 0 ? 100 : 0;
                    else if (goal.uom === 'TIMELINE') {
                      const targetDate = new Date(target as string);
                      const actualDate = new Date(actual as string);
                      if (!isNaN(targetDate.getTime()) && !isNaN(actualDate.getTime())) {
                        score = actualDate <= targetDate ? 100 : 0;
                      }
                    } else {
                      const numTarget = Number(target);
                      const numActual = Number(actual);
                      if (!isNaN(numTarget) && !isNaN(numActual)) {
                        if (goal.baseline !== null) {
                          const numBaseline = Number(goal.baseline);
                          if (!isNaN(numBaseline) && numTarget !== numBaseline) {
                            if (goal.isLowerBetter) score = ((numBaseline - numActual) / (numBaseline - numTarget)) * 100;
                            else score = ((numActual - numBaseline) / (numTarget - numBaseline)) * 100;
                          }
                        } else if (numTarget !== 0) {
                          if (goal.isLowerBetter) score = numActual === 0 ? 200 : (numTarget / numActual) * 100;
                          else score = (numActual / numTarget) * 100;
                        }
                      }
                    }
                  }
                }
                
                if (score !== null) score = Math.min(Math.max(score, 0), 200);
                
                const weightedContribution = score !== null ? (score * goal.weightage) / 100 : null;

                dataToExport.push({
                  'Employee': sheet.employee.name,
                  'Department': sheet.employee.department || '-',
                  'Cycle': sheet.cycle || '-',
                  'Sheet ID': sheet.id,
                  'Sheet Status': sheet.status,
                  'Submitted At': sheet.submittedAt ? sheet.submittedAt.toISOString() : '-',
                  'Approved At': sheet.approvedAt ? sheet.approvedAt.toISOString() : '-',
                  'Manager Feedback': sheet.managerFeedback || '-',
                  'Goal ID': goal.id,
                  'Goal Title': goal.title,
                  'Thrust Area': goal.thrustArea,
                  'UoM': goal.uom,
                  'Baseline': goal.baseline ?? '-',
                  'Target': goal.target,
                  'Lower Is Better': goal.isLowerBetter ? 'Yes' : 'No',
                  'Weightage': `${goal.weightage}%`,
                  'Quarter': quarter,
                  'Check-in Submitted': checkIn?.isSubmitted ? 'Yes' : 'No',
                  'Check-in Submitted At': checkIn?.submittedAt ? checkIn.submittedAt.toISOString() : '-',
                  'Actual': achievement?.actual ?? '-',
                  'Progress Status': achievement?.status || '-',
                  'Goal Score': score === null ? '-' : `${score.toFixed(1)}%`,
                  'Weighted Contribution': weightedContribution === null ? '-' : `${weightedContribution.toFixed(1)}%`,
                  'Override Score': achievement?.overrideScore ?? '-',
                  'Override Justification': achievement?.overrideJustification || '-',
                  'Manager Check-in Comment': checkIn?.managerComment || '-',
                });
              }
            }
          }
          break;
        case 'audit':
          const events = await prisma.auditEvent.findMany({ include: { actor: true }, orderBy: { timestamp: 'desc' } });
          dataToExport = events.map(e => ({
            Timestamp: e.timestamp,
            Actor: e.actor.name,
            Action: e.action,
            TargetId: e.targetId,
            Details: JSON.stringify(e.details)
          }));
          break;
        case 'check-ins':
          const checkIns = await prisma.checkIn.findMany({ include: { sheet: { include: { employee: true } } } });
          dataToExport = checkIns.map(c => ({
            Employee: c.sheet.employee.name,
            Cycle: c.sheet.cycle,
            Quarter: c.quarter,
            Submitted: c.isSubmitted,
            ManagerComment: c.managerComment
          }));
          break;
        default:
          return reply.status(400).send({ success: false, message: 'Invalid export type' });
      }

      if (dataToExport.length === 0) {
        return reply.status(404).send({ success: false, message: 'No data found to export' });
      }

      const csv = rowsToCsv(dataToExport);

      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`);
      return reply.send(csv);

    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ success: false, message: 'Export failed' });
    }
  });
}
