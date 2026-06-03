import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth';
import { goalSheetService } from '../services/goalSheetService';
import { UpdateGoalSheetDto, ManagerReviewDto } from '../types';
import { UpdateGoalSheetSchema, ManagerReviewSchema } from '../validators';
import { prisma } from '../db/client';

export default async function goalSheetRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', authMiddleware);

  // Get all goal sheets visible to the signed-in user.
  fastify.get('/', async (request) => {
    const { userId, role } = (request as any).user;
    const { cycle } = request.query as { cycle?: string };
    const sheets = await goalSheetService.getVisibleSheets(userId, role, cycle);
    return { success: true, data: sheets };
  });

  // Manager/Admin: Get a specific employee's goal sheet
  fastify.get('/:employeeId/:cycle', async (request, reply) => {
    const { userId, role } = (request as any).user;
    const { employeeId, cycle } = request.params as { employeeId: string; cycle: string };
    
    // Authorization: Self, Manager of employee, or Admin
    if (userId !== employeeId && role === 'EMPLOYEE') {
      return reply.status(403).send({ success: false, message: 'Forbidden' });
    }

    if (role === 'MANAGER') {
      const employee = await prisma.user.findUnique({ where: { id: employeeId } });
      if (!employee || employee.managerId !== userId) {
        return reply.status(403).send({ success: false, message: 'Forbidden: Not your report' });
      }
    }

    const sheet = await goalSheetService.getByEmployeeId(employeeId, cycle);
    return { success: true, data: sheet };
  });

  // Admin: Unlock a sheet
  fastify.post('/unlock/:id', { preHandler: [requireRole(['ADMIN'])] }, async (request) => {
    const { userId } = (request as any).user;
    const { id } = request.params as { id: string };
    const sheet = await goalSheetService.unlockSheet(id, userId);
    return { success: true, data: sheet };
  });

  // Create or update draft
  fastify.post('/draft/:cycle', async (request, reply) => {
    const { userId } = (request as any).user;
    const { cycle } = request.params as { cycle: string };
    
    const parsedBody = UpdateGoalSheetSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, message: 'Validation failed', errors: parsedBody.error.format() });
    }
    
    const sheet = await goalSheetService.createOrUpdateDraft(userId, cycle, parsedBody.data as UpdateGoalSheetDto);
    return { success: true, data: sheet };
  });

  // Submit for approval
  fastify.post('/submit/:cycle', async (request) => {
    const { userId } = (request as any).user;
    const { cycle } = request.params as { cycle: string };
    const sheet = await goalSheetService.submitForApproval(userId, cycle);
    return { success: true, data: sheet };
  });

  // Manager: Get pending approvals
  fastify.get('/pending', { preHandler: [requireRole(['MANAGER', 'ADMIN'])] }, async (request) => {
    const { userId } = (request as any).user;
    const sheets = await goalSheetService.getPendingApprovals(userId);
    return { success: true, data: sheets };
  });

  // Manager: Review (Approve/Return)
  fastify.post('/review/:id', { preHandler: [requireRole(['MANAGER', 'ADMIN'])] }, async (request, reply) => {
    const { userId } = (request as any).user;
    const { id } = request.params as { id: string };
    
    const parsedBody = ManagerReviewSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, message: 'Validation failed', errors: parsedBody.error.format() });
    }
    
    const { action, ...data } = parsedBody.data;

    const sheet = await goalSheetService.managerReview(id, userId, data as ManagerReviewDto, action as 'APPROVE' | 'RETURN');
    return { success: true, data: sheet };
  });
}
