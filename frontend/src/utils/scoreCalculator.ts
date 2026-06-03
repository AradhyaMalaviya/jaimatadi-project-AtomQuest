import type { Goal, GoalAchievement } from '../types';

export const calculateScore = (goal: Goal, achievement: GoalAchievement | undefined): number | null => {
  if (!achievement || achievement.actual === undefined || achievement.actual === '') return null;

  if (achievement.overrideScore !== undefined && achievement.overrideScore !== null) {
    return achievement.overrideScore;
  }

  const target = goal.target;
  const actual = achievement.actual;

  if (goal.uom === 'ZERO') {
    return Number(actual) === 0 ? 100 : 0;
  }

  if (goal.uom === 'TIMELINE') {
    const targetDate = new Date(target as string);
    const actualDate = new Date(actual as string);
    if (isNaN(targetDate.getTime()) || isNaN(actualDate.getTime())) return null;
    return actualDate <= targetDate ? 100 : 0;
  }

  // NUMERIC or PERCENTAGE
  const numTarget = Number(target);
  const numActual = Number(actual);

  if (isNaN(numTarget) || isNaN(numActual)) return null;

  let score: number;

  if (goal.baseline !== undefined && goal.baseline !== '') {
    const numBaseline = Number(goal.baseline);
    if (isNaN(numBaseline) || numTarget === numBaseline) return null;

    if (goal.isLowerBetter) {
      score = ((numBaseline - numActual) / (numBaseline - numTarget)) * 100;
    } else {
      score = ((numActual - numBaseline) / (numTarget - numBaseline)) * 100;
    }
  } else {
    if (numTarget === 0) return null;
    if (goal.isLowerBetter) {
      score = numActual === 0 ? 200 : (numTarget / numActual) * 100;
    } else {
      score = (numActual / numTarget) * 100;
    }
  }

  return Math.min(Math.max(score, 0), 200); // cap at 200%
};
