import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';

export default async function auditEventRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', authMiddleware);
  fastify.addHook('preHandler', requireRole(['ADMIN']));

  fastify.get('/', async (request) => {
    const filters = request.query as any;
    const events = await auditService.getEvents(filters);
    return { success: true, data: events };
  });
}
