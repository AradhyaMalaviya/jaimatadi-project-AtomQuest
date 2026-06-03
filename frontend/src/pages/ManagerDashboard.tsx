import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import ManagerReview from '../components/ManagerReview';
import ManagerCheckInReview from '../components/ManagerCheckInReview';
import type { GoalSheet } from '../types';

const ManagerDashboard: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { getGoalSheetsForManager } = useData();
  const [selectedSheet, setSelectedSheet] = useState<{ sheet: GoalSheet, employeeName: string, mode: 'REVIEW' | 'CHECKIN' } | null>(null);

  if (!currentUser) return null;

  // Filter users that report to this manager
  const teamMembers = users.filter(u => u.managerId === currentUser.id);
  // Get all sheets and filter only for team members
  const allSheets = getGoalSheetsForManager(currentUser.id);
  const teamSheets = allSheets.filter(s => teamMembers.some(tm => tm.id === s.employeeId));

  const pendingReviews = teamSheets.filter(s => s.status === 'SUBMITTED');
  const completedReviews = teamSheets.filter(s => s.status === 'APPROVED' || s.status === 'RETURNED');

  if (selectedSheet) {
    if (selectedSheet.mode === 'REVIEW') {
      return (
        <ManagerReview 
          sheet={selectedSheet.sheet} 
          employeeName={selectedSheet.employeeName} 
          onClose={() => setSelectedSheet(null)} 
        />
      );
    } else {
      return (
        <ManagerCheckInReview 
          sheet={selectedSheet.sheet} 
          employeeName={selectedSheet.employeeName} 
          onClose={() => setSelectedSheet(null)} 
        />
      );
    }
  }

  return (
    <div>
      <h2>Manager Dashboard</h2>

      <div style={{ marginBottom: '30px' }}>
        <h3>Pending Approvals</h3>
        {pendingReviews.length === 0 ? (
          <p>No sheets pending review.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {pendingReviews.map(sheet => {
              const emp = teamMembers.find(t => t.id === sheet.employeeId);
              return (
                <li key={sheet.id} style={{ padding: '15px', border: '1px solid #ddd', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                  <div>
                    <strong>{emp?.name}</strong> - Submitted on {sheet.submittedAt ? new Date(sheet.submittedAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <button onClick={() => setSelectedSheet({ sheet, employeeName: emp?.name || 'Unknown', mode: 'REVIEW' })} style={{ padding: '5px 15px' }}>
                    Review
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h3>Reviewed Goal Sheets</h3>
        {completedReviews.length === 0 ? (
          <p>No reviewed sheets.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Employee</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Feedback</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedReviews.map(sheet => {
                const emp = teamMembers.find(t => t.id === sheet.employeeId);
                return (
                  <tr key={sheet.id}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{emp?.name}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: sheet.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: sheet.status === 'APPROVED' ? '#166534' : '#991b1b' }}>
                        {sheet.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{sheet.managerFeedback || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {sheet.status === 'APPROVED' && (
                        <button onClick={() => setSelectedSheet({ sheet, employeeName: emp?.name || 'Unknown', mode: 'CHECKIN' })} style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>
                          Quarterly Check-in
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;