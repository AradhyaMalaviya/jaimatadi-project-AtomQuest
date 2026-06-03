import React, { useState } from 'react';
import type { GoalSheet, Quarter, CheckIn, GoalAchievement } from '../types';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { calculateScore } from '../utils/scoreCalculator';

interface ManagerCheckInReviewProps {
  sheet: GoalSheet;
  employeeName: string;
  onClose: () => void;
}

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const ManagerCheckInReview: React.FC<ManagerCheckInReviewProps> = ({ sheet, employeeName, onClose }) => {
  const { saveCheckIn } = useData();
  const { currentUser } = useAuth();
  const initialCheckIn = sheet.checkIns?.find(c => c.quarter === 'Q1');
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1');
  const [achievements, setAchievements] = useState<Record<string, GoalAchievement>>(initialCheckIn?.achievements || {});
  const [comment, setComment] = useState(initialCheckIn?.managerComment || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const checkIn = sheet.checkIns?.find(c => c.quarter === selectedQuarter) || { quarter: selectedQuarter, achievements: {} } as CheckIn;

  const handleQuarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const q = e.target.value as Quarter;
    setSelectedQuarter(q);
    const qCheckIn = sheet.checkIns?.find(c => c.quarter === q);
    setAchievements(qCheckIn?.achievements || {});
    setComment(qCheckIn?.managerComment || '');
  };

  const handleOverrideChange = (goalId: string, field: 'overrideScore' | 'overrideJustification', value: string) => {
    setAchievements(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: field === 'overrideScore' ? (value ? Number(value) : undefined) : value
      }
    }));
  };

  const handleSave = async () => {
    const missingJustification = Object.values(achievements).some(
      (achievement) => achievement.overrideScore !== undefined && !achievement.overrideJustification?.trim()
    );

    if (missingJustification) {
      setError('Override justification is required when an override score is provided.');
      return;
    }

    try {
      setError('');
      setIsSaving(true);
      await saveCheckIn(sheet.id, {
        ...checkIn,
        achievements,
        managerComment: comment
      }, {
        actorId: currentUser?.id || 'manager',
        action: 'CHECK_IN_REVIEW',
        details: `Manager reviewed ${selectedQuarter} check-in for ${employeeName}.`,
      });
      alert('Check-in feedback saved!');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save check-in feedback.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Check-in Review for {employeeName}</h3>
        <button onClick={onClose} style={{ padding: '5px 10px' }}>Back</button>
      </div>

      <div style={{ margin: '15px 0' }}>
        <label style={{ marginRight: '10px' }}><strong>Select Quarter:</strong></label>
        <select value={selectedQuarter} onChange={handleQuarterChange} style={{ padding: '5px' }}>
          {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>
      {error && <div style={{ color: '#b91c1c', marginBottom: '10px' }}>{error}</div>}

      {!checkIn.isSubmitted ? (
        <p>Employee has not submitted a check-in for {selectedQuarter} yet.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Goal</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Target</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actual</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Score</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Override Score</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Override Justification</th>
              </tr>
            </thead>
            <tbody>
              {sheet.goals.map(g => {
                const ach = achievements[g.id];
                const score = calculateScore(g, ach);
                return (
                  <tr key={g.id}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.title}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.target}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ach?.actual || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      {score !== null ? `${score.toFixed(1)}%` : '-'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={ach?.overrideScore ?? ''}
                        onChange={(e) => handleOverrideChange(g.id, 'overrideScore', e.target.value)}
                        style={{ width: '80px', padding: '4px' }}
                      />
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <input
                        type="text"
                        placeholder="Reason for override..."
                        value={ach?.overrideJustification || ''}
                        onChange={(e) => handleOverrideChange(g.id, 'overrideJustification', e.target.value)}
                        style={{ width: '100%', padding: '4px' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Manager Comment (Overall):</label>
            <textarea 
              placeholder="Structured Check-in Comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '10px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} disabled={isSaving} style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', border: 'none', cursor: isSaving ? 'wait' : 'pointer', borderRadius: '4px' }}>
              {isSaving ? 'Saving...' : 'Save Check-in Feedback'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerCheckInReview;
