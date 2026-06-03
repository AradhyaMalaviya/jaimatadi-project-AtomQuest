import React, { useState } from 'react';
import type { GoalSheet, Quarter, GoalAchievement, ProgressStatus } from '../types';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { calculateScore } from '../utils/scoreCalculator';

interface EmployeeCheckInProps {
  sheet: GoalSheet;
}

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const EmployeeCheckIn: React.FC<EmployeeCheckInProps> = ({ sheet }) => {
  const { saveCheckIn } = useData();
  const { currentUser } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const existingCheckIn = sheet.checkIns?.find(c => c.quarter === selectedQuarter);
  
  const [achievements, setAchievements] = useState<Record<string, GoalAchievement>>(() => {
    return existingCheckIn?.achievements || {};
  });

  const handleQuarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const q = e.target.value as Quarter;
    setSelectedQuarter(q);
    const checkInForQ = sheet.checkIns?.find(c => c.quarter === q);
    setAchievements(checkInForQ?.achievements || {});
  };

  const handleActualChange = (goalId: string, value: string) => {
    setAchievements(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], actual: value, status: prev[goalId]?.status || 'NOT_STARTED' }
    }));
  };

  const handleStatusChange = (goalId: string, status: ProgressStatus) => {
    setAchievements(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], actual: prev[goalId]?.actual || '', status }
    }));
  };

  const handleSubmit = async () => {
    setError('');
    try {
      setIsSubmitting(true);
      await saveCheckIn(sheet.id, {
        id: existingCheckIn?.id,
        quarter: selectedQuarter,
        achievements,
        isSubmitted: true,
        managerComment: existingCheckIn?.managerComment,
        submittedAt: existingCheckIn?.submittedAt || new Date().toISOString()
      }, {
        actorId: currentUser?.id || sheet.employeeId,
        action: 'CHECK_IN',
        details: `Employee submitted ${selectedQuarter} check-in.`,
      });
      alert('Check-in submitted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const weightedOverallScore = sheet.goals.reduce((acc, g) => {
    const score = calculateScore(g, achievements[g.id]);
    if (score === null) return acc;
    return acc + (score * (g.weightage / 100));
  }, 0);

  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Quarterly Check-in</h3>
        <div style={{ padding: '10px', backgroundColor: '#e2e8f0', borderRadius: '4px', fontWeight: 'bold' }}>
          Weighted Overall Score: {weightedOverallScore.toFixed(1)}%
        </div>
      </div>
      <div style={{ marginBottom: '15px', marginTop: '10px' }}>
        <label style={{ marginRight: '10px' }}><strong>Select Quarter:</strong></label>
        <select value={selectedQuarter} onChange={handleQuarterChange} style={{ padding: '5px' }}>
          {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>
      {error && <div style={{ color: '#b91c1c', marginBottom: '10px' }}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Goal</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Weight</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Target</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>UoM</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actual Achievement</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {sheet.goals.map(g => {
            const ach = achievements[g.id];
            const score = calculateScore(g, ach);
            return (
              <tr key={g.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.title}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.weightage}%</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.target}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.uom}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <input 
                    type={g.uom === 'TIMELINE' ? 'date' : 'text'}
                    value={ach?.actual || ''}
                    onChange={(e) => handleActualChange(g.id, e.target.value)}
                    style={{ width: '100%', padding: '4px' }}
                  />
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <select 
                    value={ach?.status || 'NOT_STARTED'} 
                    onChange={(e) => handleStatusChange(g.id, e.target.value as ProgressStatus)}
                    style={{ width: '100%', padding: '4px' }}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="ON_TRACK">On Track</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {score !== null ? (
                    <div>
                      {ach?.overrideScore !== undefined ? (
                        <span style={{ color: 'red', fontWeight: 'bold' }} title={ach.overrideJustification}>
                          {score.toFixed(1)}% (Overridden)
                        </span>
                      ) : (
                        `${score.toFixed(1)}%`
                      )}
                    </div>
                  ) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {existingCheckIn?.managerComment && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
          <strong>Manager Feedback:</strong> {existingCheckIn.managerComment}
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: isSubmitting ? 'wait' : 'pointer', borderRadius: '4px' }}>
          {isSubmitting ? 'Submitting...' : `Submit ${selectedQuarter} Check-in`}
        </button>
      </div>
    </div>
  );
};

export default EmployeeCheckIn;
