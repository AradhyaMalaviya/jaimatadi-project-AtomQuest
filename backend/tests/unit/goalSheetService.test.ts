import { describe, it, expect, vi, beforeEach } from 'vitest';
import { goalSheetService } from '../../src/services/goalSheetService';
import { prisma } from '../../src/db/client';

// Mock Prisma
vi.mock('../../src/db/client', () => ({
  prisma: {
    goalSheet: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    goal: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => {
      return cb(prisma);
    }),
  },
}));

vi.mock('../../src/services/auditService', () => ({
  auditService: {
    logEvent: vi.fn(),
  },
}));

describe('GoalSheetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitForApproval', () => {
    it('should throw if sheet is not found', async () => {
      vi.mocked(prisma.goalSheet.findUnique).mockResolvedValue(null);
      await expect(goalSheetService.submitForApproval('emp1', '2024')).rejects.toThrow('Goal sheet not found');
    });

    it('should throw if weightage is not exactly 100%', async () => {
      vi.mocked(prisma.goalSheet.findUnique).mockResolvedValue({
        id: 'sheet1',
        employeeId: 'emp1',
        cycle: '2024',
        status: 'DRAFT',
        goals: [{ id: 'g1', weightage: 50, title: 'Goal 1', target: 'Target 1' }],
      } as any);

      await expect(goalSheetService.submitForApproval('emp1', '2024')).rejects.toThrow('Total weightage must equal exactly 100%');
    });

    it('should successfully submit valid sheet', async () => {
      const validSheet = {
        id: 'sheet1',
        employeeId: 'emp1',
        cycle: '2024',
        status: 'DRAFT',
        goals: [
          { id: 'g1', weightage: 50, title: 'Goal 1', target: 'Target 1' },
          { id: 'g2', weightage: 50, title: 'Goal 2', target: 'Target 2' }
        ],
      };
      
      vi.mocked(prisma.goalSheet.findUnique).mockResolvedValue(validSheet as any);
      vi.mocked(prisma.goalSheet.update).mockResolvedValue({ ...validSheet, status: 'SUBMITTED' } as any);

      const result = await goalSheetService.submitForApproval('emp1', '2024');
      
      expect(result.status).toBe('SUBMITTED');
      expect(prisma.goalSheet.update).toHaveBeenCalled();
    });
  });
});
