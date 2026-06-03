import { prisma } from '../db/client';

export const userService = {
  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { manager: true, reports: true },
    });
  },

  async getReports(managerId: string) {
    return prisma.user.findMany({
      where: { managerId },
    });
  },

  async getOrganizationHierarchy() {
    return prisma.user.findMany({
      include: {
        reports: true,
      },
    });
  },
};
