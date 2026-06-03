import { prisma } from '../db/client';

export const auditService = {
  async logEvent(action: string, actorId: string, targetId?: string, details?: any) {
    return prisma.auditEvent.create({
      data: {
        action,
        actorId,
        targetId,
        details,
      },
    });
  },

  async getEvents(filters: { action?: string; actorId?: string; targetId?: string }) {
    return prisma.auditEvent.findMany({
      where: filters,
      include: { actor: true },
      orderBy: { timestamp: 'desc' },
    });
  },
};
