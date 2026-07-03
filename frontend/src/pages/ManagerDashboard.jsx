import { useEffect, useState } from 'react';
import api from '../api/client';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import StatusPill from '../components/StatusPill';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/manager')
      .then((res) => setData(res.data.data))
      .catch(() => setError('Could not load the dashboard right now.'));
  }, []);

  if (error) return <p className="text-rejected-600">{error}</p>;
  if (!data) return <Spinner label="Loading dashboard…" />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">Team overview</h1>
      <p className="text-sm text-ink-400 mb-6">Leave activity across your team.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Employees" value={data.totalEmployees} />
        <StatCard label="Pending Approvals" value={data.pendingApprovals} accent="marigold" />
        <StatCard label="Approved" value={data.approved} accent="approved" />
        <StatCard label="Rejected" value={data.rejected} accent="rejected" />
      </div>

      <div className="bg-white rounded-xl border border-ink-100">
        <div className="px-5 py-4 border-b border-ink-100">
          <h2 className="font-medium text-ink-900">Recent activity</h2>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-ink-400 px-5 py-8 text-center">No leave activity yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {data.recentActivity.map((leave) => (
              <li key={leave.id} className="status-stub px-5 py-4 flex items-center justify-between" data-status={leave.status}>
                <div>
                  <p className="text-sm font-medium text-ink-900">{leave.employee_name} · {leave.leave_type}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{leave.start_date} → {leave.end_date}</p>
                </div>
                <StatusPill status={leave.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
