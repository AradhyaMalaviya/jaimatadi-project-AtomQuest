import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth';
import { checkInService } from '../services/checkInService';
import { CheckInDto, CheckInReviewDto } from '../types';
import { CheckInReviewSchema, CheckInSchema } from '../validators';

export default async function checkInRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', authMiddleware);

  // Submit check-in
  fastify.post('/:sheetId/submit', async (request, reply) => {
    const { userId } = (request as any).user;
    const { sheetId } = request.params as { sheetId: string };

    const parsedBody = CheckInSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, message: 'Validation failed', errors: parsedBody.error.format() });
    }

    const checkIn = await checkInService.submitCheckIn(sheetId, userId, parsedBody.data as CheckInDto);
    return { success: true, data: checkIn };
  });

  // Manager: Review check-in
  fastify.post('/review/:checkInId', { preHandler: [requireRole(['MANAGER', 'ADMIN'])] }, async (request, reply) => {
    const { userId } = (request as any).user;
    const { checkInId } = request.params as { checkInId: string };

    const parsedBody = CheckInReviewSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({ success: false, message: 'Validation failed', errors: parsedBody.error.format() });
    }

    const checkIn = await checkInService.managerReview(checkInId, userId, parsedBody.data as CheckInReviewDto);
    return { success: true, data: checkIn };
  });

  // Get scores for a check-in
  fastify.get('/:checkInId/scores', async (request) => {
    const { checkInId } = request.params as { checkInId: string };
    const scores = await checkInService.getCalculatedScores(checkInId);
    return { success: true, data: scores };
  });
}
