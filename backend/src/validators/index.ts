import { z } from 'zod';
import { Quarter, ProgressStatus } from '@prisma/client';

export const CreateGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  thrustArea: z.string().min(1, "Thrust area is required"),
  uom: z.string().min(1, "UoM is required"),
  baseline: z.number().optional(),
  target: z.string().min(1, "Target is required"),
  weightage: z.number().min(10, "Minimum 10% weightage per goal required").max(100),
  isShared: z.boolean().optional(),
  isLowerBetter: z.boolean().optional(),
});

export const UpdateGoalSheetSchema = z.object({
  goals: z.array(CreateGoalSchema).max(8, "Maximum 8 goals allowed"),
});

export const ManagerReviewSchema = z.object({
  goals: z.array(
    z.object({
      id: z.string().uuid(),
      target: z.string().min(1, "Target is required"),
      weightage: z.number().min(10, "Minimum 10% weightage per goal required").max(100),
    })
  ).optional(),
  managerFeedback: z.string().optional(),
  action: z.enum(['APPROVE', 'RETURN']),
}).refine(data => data.action !== 'RETURN' || (data.action === 'RETURN' && !!data.managerFeedback), {
  message: "Feedback is required when returning a goal sheet",
  path: ["managerFeedback"],
});

export const CheckInSchema = z.object({
  quarter: z.nativeEnum(Quarter),
  achievements: z.array(
    z.object({
      goalId: z.string().uuid(),
      actual: z.string().optional(),
      status: z.nativeEnum(ProgressStatus),
    })
  ),
});

export const CheckInReviewSchema = z.object({
  managerComment: z.string().optional(),
  overrides: z.array(
    z.object({
      goalId: z.string().uuid(),
      overrideScore: z.number().min(0).max(200),
      overrideJustification: z.string().min(1, "Justification is required when overriding score"),
    })
  ).optional(),
});
