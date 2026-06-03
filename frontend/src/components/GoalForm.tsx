import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { MOCK_THRUST_AREAS } from '../types';
import type { Goal, GoalSheet, UoM } from '../types';

interface GoalFormProps {
  existingSheet?: GoalSheet;
  onSaved: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ existingSheet, onSaved }) => {
  const { currentUser } = useAuth();
  const { saveGoalSheet, sharedGoals } = useData();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (existingSheet && existingSheet.goals.length > 0) {
      return existingSheet.goals;
    }
    const initialGoals = sharedGoals.map(sg => ({ ...sg, id: generateId() }));
    if (initialGoals.length === 0) {
      initialGoals.push({
        id: generateId(),
        title: '',
        description: '',
        thrustArea: MOCK_THRUST_AREAS[0],
        uom: 'NUMERIC',
        target: '',
        weightage: 10,
        isLowerBetter: false,
      });
    }
    return initialGoals;
  });
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const addGoal = () => {
    if (goals.length >= 8) return;
    setGoals([...goals, {
      id: generateId(),
      title: '',
      description: '',
      thrustArea: MOCK_THRUST_AREAS[0],
      uom: 'NUMERIC',
      target: '',
      weightage: 10,
      isLowerBetter: false,
    }]);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, field: keyof Goal, value: string | number | boolean) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        return { ...g, [field]: field === 'weightage' ? Number(value) : value };
      }
      return g;
    }));
  };

  const validate = (): boolean => {
    if (goals.length > 8) {
      setError('Maximum 8 goals allowed.');
      return false;
    }
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
    const emptyFields = goals.some(g => !g.title || !g.target);
    if (emptyFields) {
      setError('All goals must have a title and target.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = async (status: GoalSheet['status']) => {
    if (!validate()) return;

    const sheet: GoalSheet = {
      id: existingSheet ? existingSheet.id : generateId(),
      employeeId: currentUser!.id,
      cycle: existingSheet?.cycle || '2026 Annual',
      status,
      goals,
      submittedAt: status === 'SUBMITTED' ? new Date().toISOString() : existingSheet?.submittedAt,
    };

    try {
      setIsSaving(true);
      await saveGoalSheet(sheet, {
        actorId: currentUser!.id,
        action: status === 'SUBMITTED' ? 'SUBMIT' : 'EDIT',
        details: status === 'SUBMITTED'
          ? 'Employee submitted goal sheet for approval.'
          : 'Employee saved goal sheet draft.',
      });
      if (status === 'SUBMITTED') {
        onSaved();
      } else {
        alert('Draft saved successfully!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save goal sheet.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3>Create / Edit Goals</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fde8e8', borderRadius: '4px' }}>{error}</div>}
      
      {goals.map((goal, index) => (
        <div key={goal.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Goal {index + 1} {goal.isShared ? '(Shared KPI)' : ''}</strong>
            {!goal.isShared && goals.length > 1 && (
              <button onClick={() => removeGoal(goal.id)} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>Remove</button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Thrust Area</label>
              <select 
                value={goal.thrustArea} 
                onChange={(e) => updateGoal(goal.id, 'thrustArea', e.target.value)}
                disabled={goal.isShared}
                style={{ width: '100%', padding: '8px' }}
              >
                {MOCK_THRUST_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Unit of Measure</label>
              <select 
                value={goal.uom} 
                onChange={(e) => updateGoal(goal.id, 'uom', e.target.value as UoM)}
                disabled={goal.isShared}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="NUMERIC">Numeric</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="TIMELINE">Timeline</option>
                <option value="ZERO">Zero-based</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / span 2' }}>
              <label style={{ display: 'block', fontSize: '12px' }}>Title</label>
              <input 
                type="text" 
                value={goal.title} 
                onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
                disabled={goal.isShared}
                style={{ width: '100%', padding: '8px' }}
                placeholder="e.g. Increase sales revenue"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Baseline (Optional)</label>
              <input 
                type={goal.uom === 'TIMELINE' ? 'date' : 'text'} 
                value={goal.baseline || ''} 
                onChange={(e) => updateGoal(goal.id, 'baseline', e.target.value)}
                disabled={goal.isShared}
                style={{ width: '100%', padding: '8px' }}
                placeholder="Starting value"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Target</label>
              <input 
                type={goal.uom === 'TIMELINE' ? 'date' : 'text'} 
                value={goal.target} 
                onChange={(e) => updateGoal(goal.id, 'target', e.target.value)}
                disabled={goal.isShared}
                style={{ width: '100%', padding: '8px' }}
                placeholder={goal.uom === 'ZERO' ? '0' : 'Enter target'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Weightage (%)</label>
              <input 
                type="number" 
                min="10" 
                max="100" 
                value={goal.weightage} 
                onChange={(e) => updateGoal(goal.id, 'weightage', e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
              <input 
                type="checkbox" 
                id={`lowerBetter-${goal.id}`}
                checked={!!goal.isLowerBetter} 
                onChange={(e) => updateGoal(goal.id, 'isLowerBetter', e.target.checked)}
                disabled={goal.isShared || goal.uom === 'TIMELINE' || goal.uom === 'ZERO'}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor={`lowerBetter-${goal.id}`} style={{ fontSize: '12px' }}>Lower is Better (e.g. Bugs)</label>
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button 
          onClick={addGoal} 
          disabled={goals.length >= 8}
          style={{ padding: '10px 15px', cursor: goals.length >= 8 ? 'not-allowed' : 'pointer' }}
        >
          + Add Goal
        </button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ alignSelf: 'center', fontWeight: 'bold' }}>
            Total Weight: {goals.reduce((sum, g) => sum + g.weightage, 0)}%
          </div>
          <button onClick={() => handleSave('DRAFT')} style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1' }}>
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave('SUBMITTED')} style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: '#0ea5e9', color: 'white', border: 'none' }}>
            {isSaving ? 'Saving...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalForm;
