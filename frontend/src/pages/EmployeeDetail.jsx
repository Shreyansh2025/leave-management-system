import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import Spinner from '../components/Spinner';
import StatusPill from '../components/StatusPill';

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/employees/${id}`),
      api.get('/leaves', { params: { employeeId: id } }),
    ])
      .then(([empRes, leavesRes]) => {
        setEmployee(empRes.data.data);
        setLeaves(leavesRes.data.data);
      })
      .catch(() => setError('Could not load this employee.'));
  }, [id]);

  if (error) return <p className="text-rejected-600">{error}</p>;
  if (!employee || !leaves) return <Spinner label="Loading employee…" />;

  return (
    <div>
      <Link to="/manager/employees" className="text-sm text-ink-400 hover:text-ink-700">← Back to employees</Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">{employee.name}</h1>
          <p className="text-sm text-ink-400 mt-1">{employee.email} · {employee.department}</p>
        </div>
      </div>

      <h2 className="font-medium text-ink-900 mb-3">Leave history</h2>
      {leaves.length === 0 ? (
        <div className="bg-white border border-ink-100 rounded-xl px-5 py-10 text-center text-sm text-ink-400">No leave requests on record.</div>
      ) : (
        <div className="bg-white border border-ink-100 rounded-xl divide-y divide-ink-100">
          {leaves.map((leave) => (
            <div key={leave.id} className="status-stub px-5 py-4 flex items-center justify-between" data-status={leave.status}>
              <div>
                <p className="text-sm font-medium text-ink-900">{leave.leave_type} leave</p>
                <p className="text-xs text-ink-400 mt-0.5">{leave.start_date} → {leave.end_date}</p>
                <p className="text-sm text-ink-600 mt-2">{leave.reason}</p>
              </div>
              <StatusPill status={leave.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
