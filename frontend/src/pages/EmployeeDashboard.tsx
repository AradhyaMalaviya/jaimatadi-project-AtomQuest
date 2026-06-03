import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import GoalForm from '../components/GoalForm';
import EmployeeCheckIn from '../components/EmployeeCheckIn';

const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { getGoalSheetByEmployee } = useData();

  if (!currentUser) return null;

  const existingSheet = getGoalSheetByEmployee(currentUser.id);

  return (
    <div>
      <h2>Employee Dashboard</h2>
      
      {existingSheet && existingSheet.status !== 'DRAFT' && existingSheet.status !== 'RETURNED' ? (
        <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>Goal Sheet Status: {existingSheet.status}</h3>
          {existingSheet.status === 'APPROVED' && <p>Your goals have been approved and are locked.</p>}
          {existingSheet.status === 'SUBMITTED' && <p>Your goals are pending manager approval.</p>}
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Thrust Area</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Title</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Target</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>UoM</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Weightage</th>
              </tr>
            </thead>
            <tbody>
              {existingSheet.goals.map((g, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.thrustArea}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.title}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.target}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.uom}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{g.weightage}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {existingSheet.status === 'APPROVED' && (
            <EmployeeCheckIn sheet={existingSheet} />
          )}
        </div>
      ) : (
        <>
          {existingSheet?.status === 'RETURNED' && (
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
              <strong>Manager Feedback:</strong> {existingSheet.managerFeedback}
            </div>
          )}
          <GoalForm existingSheet={existingSheet} onSaved={() => {}} />
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;