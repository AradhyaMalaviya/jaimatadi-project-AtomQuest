import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authMiddleware, requireRole } from '../middleware/auth';
import { userService } from '../services/userService';

export default async function userRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preHandler', authMiddleware);

  // Get current user profile
  fastify.get('/me', async (request) => {
    const { userId } = (request as any).user;
    const user = await userService.getById(userId);
    return { success: true, data: user };
  });

  // Get team members (for managers)
  fastify.get('/my-reports', { preHandler: [requireRole(['MANAGER', 'ADMIN'])] }, async (request) => {
    const { userId } = (request as any).user;
    const reports = await userService.getReports(userId);
    return { success: true, data: reports };
  });

  // Get full hierarchy (for admins)
  fastify.get('/hierarchy', { preHandler: [requireRole(['ADMIN'])] }, async () => {
    const hierarchy = await userService.getOrganizationHierarchy();
    return { success: true, data: hierarchy };
  });
}
