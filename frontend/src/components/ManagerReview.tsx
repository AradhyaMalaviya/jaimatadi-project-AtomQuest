import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type { GoalSheet } from '../types';

interface ManagerReviewProps {
  sheet: GoalSheet;
  employeeName: string;
  onClose: () => void;
}

const ManagerReview: React.FC<ManagerReviewProps> = ({ sheet, employeeName, onClose }) => {
  const { updateGoalSheetStatus } = useData();
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState(sheet.goals);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateGoal = (id: string, field: 'weightage' | 'target', value: string | number) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        return { ...g, [field]: field === 'weightage' ? Number(value) : value };
      }
      return g;
    }));
  };

  const validate = (): boolean => {
    const totalWeight = goals.reduce((sum, g) => sum + g.weightage, 0);
    if (totalWeight !== 100) {
      setError(`Total weightage must be exactly 100%. Current: ${totalWeight}%`);
      return false;
    }
    const invalidWeight = goals.some(g => g.weightage < 10);
    if (invalidWeight) {
      setError('Each goal must have a minimum weightage of 10%.');
      return false;
    }
    setError('');
    return true;
  };

  const handleAction = async (action: 'APPROVE' | 'RETURN') => {
    try {
      setIsSaving(true);
      if (action === 'APPROVE') {
        if (!validate()) return;
        await updateGoalSheetStatus(sheet.id, 'APPROVED', undefined, {
          actorId: currentUser?.id || 'manager',
          action: 'APPROVE',
          details: `Manager approved and locked goal sheet for ${employeeName}.`,
        }, goals);
      } else {
        if (!feedback.trim()) {
          setError('Feedback is required when returning a goal sheet.');
          return;
        }
        await updateGoalSheetStatus(sheet.id, 'RETURNED', feedback, {
          actorId: currentUser?.id || 'manager',
          action: 'RETURN',
          details: `Manager returned goal sheet for ${employeeName}. Feedback: ${feedback}`,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete manager review.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Reviewing Goals for {employeeName}</h3>
        <button onClick={onClose} style={{ padding: '5px 10px' }}>Back</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fde8e8', borderRadius: '4px' }}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Thrust Area</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Title</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Target (Editable)</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>UoM</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', width: '120px' }}>Weightage (%)</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((g) => (
            <tr key={g.id}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.thrustArea}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.title} {g.isShared && '(Shared)'}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type={g.uom === 'TIMELINE' ? 'date' : 'text'} 
                  value={g.target} 
                  onChange={(e) => updateGoal(g.id, 'target', e.target.value)}
                  disabled={g.isShared}
                  style={{ width: '100%', padding: '4px' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.uom}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                <input 
                  type="number" 
                  min="10" max="100" 
                  value={g.weightage} 
                  onChange={(e) => updateGoal(g.id, 'weightage', e.target.value)}
                  style={{ width: '100%', padding: '4px' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea 
          placeholder="Manager Feedback (Required if returning)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          style={{ width: '100%', height: '80px', padding: '10px', fontFamily: 'inherit' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <div style={{ alignSelf: 'center', marginRight: 'auto', fontWeight: 'bold' }}>
            Total Weight: {goals.reduce((sum, g) => sum + g.weightage, 0)}%
          </div>
          <button onClick={() => handleAction('RETURN')} disabled={isSaving} style={{ padding: '10px 15px', cursor: isSaving ? 'wait' : 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
            {isSaving ? 'Saving...' : 'Return for Rework'}
          </button>
          <button onClick={() => handleAction('APPROVE')} disabled={isSaving} style={{ padding: '10px 15px', cursor: isSaving ? 'wait' : 'pointer', backgroundColor: '#22c55e', color: 'white', border: 'none' }}>
            {isSaving ? 'Saving...' : 'Approve & Lock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerReview;
