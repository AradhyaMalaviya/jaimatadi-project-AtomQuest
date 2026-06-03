import type {
  AuditEvent,
  CheckIn,
  Goal,
  GoalAchievement,
  GoalSheet,
  GoalSheetStatus,
  ProgressStatus,
  Quarter,
  Role,
  UoM,
  User,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'auth_access_token';
const CURRENT_USER_KEY = 'auth_current_user';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message?: string;
  };
}

interface BackendUser {
  id: string;
  name: string;
  email?: string;
  role: Role;
  managerId?: string | null;
  department?: string | null;
}

interface BackendGoal {
  id: string;
  title: string;
  description?: string | null;
  thrustArea: string;
  uom: UoM;
  baseline?: number | null;
  target: string;
  weightage: number;
  isShared?: boolean;
  isLowerBetter?: boolean;
}

interface BackendAchievement {
  goalId: string;
  actual?: string | null;
  status: ProgressStatus;
  overrideScore?: number | null;
  overrideJustification?: string | null;
}

interface BackendCheckIn {
  id: string;
  quarter: Quarter;
  achievements: BackendAchievement[];
  managerComment?: string | null;
  isSubmitted?: boolean;
  submittedAt?: string | null;
}

interface BackendGoalSheet {
  id: string;
  employeeId: string;
  cycle?: string;
  status: GoalSheetStatus;
  goals: BackendGoal[];
  submittedAt?: string | null;
  approvedAt?: string | null;
  managerFeedback?: string | null;
  checkIns?: BackendCheckIn[];
}

interface BackendAuditEvent {
  id: string;
  timestamp: string;
  action: AuditEvent['action'];
  actorId: string;
  targetId?: string | null;
  details?: unknown;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getStoredCurrentUser = (): User | null => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
};

export const setStoredCurrentUser = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const clearStoredCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

const toFrontendUser = (user: BackendUser): User => ({
  id: user.id,
  name: user.name,
  role: user.role,
  managerId: user.managerId || undefined,
  department: user.department || undefined,
});

const request = async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const payload = await response.json().catch(() => ({})) as ApiEnvelope<T>;

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || payload.error?.message || 'API request failed');
  }

  return payload.data as T;
};

const goalBaselineToBackend = (baseline: Goal['baseline']) => {
  if (baseline === undefined || baseline === null || baseline === '') return undefined;
  const parsed = Number(baseline);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const goalsToBackend = (goals: Goal[]) => goals.map((goal) => ({
  title: goal.title,
  description: goal.description || undefined,
  thrustArea: goal.thrustArea,
  uom: goal.uom,
  baseline: goalBaselineToBackend(goal.baseline),
  target: String(goal.target),
  weightage: goal.weightage,
  isShared: Boolean(goal.isShared),
  isLowerBetter: Boolean(goal.isLowerBetter),
}));

export const toFrontendGoalSheet = (sheet: BackendGoalSheet): GoalSheet => ({
  id: sheet.id,
  employeeId: sheet.employeeId,
  cycle: sheet.cycle,
  status: sheet.status,
  submittedAt: sheet.submittedAt || undefined,
  approvedAt: sheet.approvedAt || undefined,
  managerFeedback: sheet.managerFeedback || undefined,
  goals: sheet.goals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description || '',
    thrustArea: goal.thrustArea,
    uom: goal.uom,
    baseline: goal.baseline ?? undefined,
    target: goal.target,
    weightage: goal.weightage,
    isShared: goal.isShared,
    isLowerBetter: goal.isLowerBetter,
  })),
  checkIns: sheet.checkIns?.map((checkIn) => ({
    id: checkIn.id,
    quarter: checkIn.quarter,
    managerComment: checkIn.managerComment || undefined,
    isSubmitted: checkIn.isSubmitted,
    submittedAt: checkIn.submittedAt || undefined,
    achievements: checkIn.achievements.reduce<Record<string, GoalAchievement>>((acc, achievement) => {
      acc[achievement.goalId] = {
        actual: achievement.actual || '',
        status: achievement.status,
        overrideScore: achievement.overrideScore ?? undefined,
        overrideJustification: achievement.overrideJustification || undefined,
      };
      return acc;
    }, {}),
  })),
});

export const toFrontendAuditEvent = (event: BackendAuditEvent): AuditEvent => ({
  id: event.id,
  timestamp: event.timestamp,
  action: event.action,
  actorId: event.actorId,
  targetId: event.targetId || 'SYSTEM',
  details: typeof event.details === 'string' ? event.details : JSON.stringify(event.details || {}),
});

const checkInToBackend = (checkIn: CheckIn) => ({
  quarter: checkIn.quarter,
  achievements: Object.entries(checkIn.achievements).map(([goalId, achievement]) => ({
    goalId,
    actual: String(achievement.actual ?? ''),
    status: achievement.status,
  })),
});

const checkInReviewToBackend = (checkIn: CheckIn) => ({
  managerComment: checkIn.managerComment,
  overrides: Object.entries(checkIn.achievements)
    .filter(([, achievement]) => achievement.overrideScore !== undefined)
    .map(([goalId, achievement]) => ({
      goalId,
      overrideScore: achievement.overrideScore as number,
      overrideJustification: achievement.overrideJustification || '',
    })),
});

export const api = {
  async getAuthUsers() {
    const users = await request<BackendUser[]>('/auth/users');
    return users.map(toFrontendUser);
  },

  async login(userId: string) {
    const response = await request<{ user: BackendUser; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });

    return {
      user: toFrontendUser(response.user),
      accessToken: response.accessToken,
    };
  },

  async logout() {
    await request('/auth/logout', { method: 'POST' });
  },

  async getCurrentUser() {
    const user = await request<BackendUser>('/users/me');
    return toFrontendUser(user);
  },

  async getGoalSheets(cycle?: string) {
    const query = cycle ? `?cycle=${encodeURIComponent(cycle)}` : '';
    const sheets = await request<BackendGoalSheet[]>(`/goal-sheets${query}`);
    return sheets.map(toFrontendGoalSheet);
  },

  async saveDraft(cycle: string, goals: Goal[]) {
    const sheet = await request<BackendGoalSheet>(`/goal-sheets/draft/${encodeURIComponent(cycle)}`, {
      method: 'POST',
      body: JSON.stringify({ goals: goalsToBackend(goals) }),
    });
    return toFrontendGoalSheet(sheet);
  },

  async submitGoalSheet(cycle: string) {
    const sheet = await request<BackendGoalSheet>(`/goal-sheets/submit/${encodeURIComponent(cycle)}`, {
      method: 'POST',
    });
    return toFrontendGoalSheet(sheet);
  },

  async reviewGoalSheet(sheetId: string, action: 'APPROVE' | 'RETURN', managerFeedback?: string, goals?: Goal[]) {
    const sheet = await request<BackendGoalSheet>(`/goal-sheets/review/${sheetId}`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        managerFeedback,
        goals: goals?.map((goal) => ({
          id: goal.id,
          target: String(goal.target),
          weightage: goal.weightage,
        })),
      }),
    });
    return toFrontendGoalSheet(sheet);
  },

  async submitCheckIn(sheetId: string, checkIn: CheckIn) {
    await request<BackendCheckIn>(`/check-ins/${sheetId}/submit`, {
      method: 'POST',
      body: JSON.stringify(checkInToBackend(checkIn)),
    });
  },

  async reviewCheckIn(checkInId: string, checkIn: CheckIn) {
    await request<BackendCheckIn>(`/check-ins/review/${checkInId}`, {
      method: 'POST',
      body: JSON.stringify(checkInReviewToBackend(checkIn)),
    });
  },

  async getAuditEvents() {
    const events = await request<BackendAuditEvent[]>('/audit-events');
    return events.map(toFrontendAuditEvent);
  },

  async downloadExport(type: 'goals' | 'audit' | 'check-ins', filename: string) {
    const token = getAccessToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}/reports/export/${type}`, { headers });
    if (!response.ok) throw new Error('Export failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
