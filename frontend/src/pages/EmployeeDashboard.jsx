import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import StatusPill from '../components/StatusPill';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/employee')
      .then((res) => setData(res.data.data))
      .catch(() => setError('Could not load your dashboard right now.'));
  }, []);

  if (error) return <p className="text-rejected-600">{error}</p>;
  if (!data) return <Spinner label="Loading your dashboard…" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-ink-400 mt-1">Here's where your leave requests stand.</p>
        </div>
        <Link to="/employee/apply" className="bg-ink-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-ink-600 transition-colors">
          Apply for leave
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Requests" value={data.totalLeaveRequests} />
        <StatCard label="Approved" value={data.approved} accent="approved" />
        <StatCard label="Pending" value={data.pending} accent="marigold" />
        <StatCard label="Rejected" value={data.rejected} accent="rejected" />
      </div>

      <div className="bg-white rounded-xl border border-ink-100">
        <div className="px-5 py-4 border-b border-ink-100">
          <h2 className="font-medium text-ink-900">Recent activity</h2>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-ink-400 px-5 py-8 text-center">No leave requests yet. Apply for your first one above.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {data.recentActivity.map((leave) => (
              <li key={leave.id} className="status-stub px-5 py-4 flex items-center justify-between" data-status={leave.status}>
                <div>
                  <p className="text-sm font-medium text-ink-900">{leave.leave_type} leave</p>
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
