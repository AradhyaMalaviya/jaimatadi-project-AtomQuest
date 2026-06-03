import { GoalSheetStatus, Role, Quarter, ProgressStatus } from '@prisma/client';

export interface UserContext {
  userId: string;
  role: Role;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  thrustArea: string;
  uom: string;
  baseline?: number;
  target: string;
  weightage: number;
  isShared?: boolean;
  isLowerBetter?: boolean;
}

export interface UpdateGoalSheetDto {
  goals: CreateGoalDto[];
}

export interface ManagerReviewDto {
  goals?: {
    id: string;
    target: string;
    weightage: number;
  }[];
  managerFeedback?: string;
}

export interface CheckInDto {
  quarter: Quarter;
  achievements: {
    goalId: string;
    actual: string;
    status: ProgressStatus;
  }[];
}

export interface CheckInReviewDto {
  managerComment?: string;
  overrides?: {
    goalId: string;
    overrideScore: number;
    overrideJustification: string;
  }[];
}
