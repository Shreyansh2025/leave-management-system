import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import Spinner from '../components/Spinner';
import StatusPill from '../components/StatusPill';

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
const TYPES = ['All', 'Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity'];

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ reason: '', startDate: '', endDate: '' });
  const [actionError, setActionError] = useState('');

  const fetchLeaves = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (status !== 'All') params.status = status;
    if (type !== 'All') params.type = type;

    api.get('/leaves', { params })
      .then((res) => setLeaves(res.data.data))
      .catch(() => setError('Could not load leave history.'));
  }, [search, status, type]);

  useEffect(() => {
    const timer = setTimeout(fetchLeaves, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchLeaves]);

  const startEdit = (leave) => {
    setActionError('');
    setEditingId(leave.id);
    setEditForm({ reason: leave.reason, startDate: leave.start_date, endDate: leave.end_date });
  };

  const saveEdit = async (id) => {
    setActionError('');
    if (editForm.endDate < editForm.startDate) {
      setActionError('End date cannot be before start date.');
      return;
    }
    try {
      await api.put(`/leaves/${id}`, editForm);
      setEditingId(null);
      fetchLeaves();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not update this request.');
    }
  };

  const cancelLeave = async (id) => {
    setActionError('');
    try {
      await api.delete(`/leaves/${id}`);
      fetchLeaves();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not cancel this request.');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">Leave history</h1>
      <p className="text-sm text-ink-400 mb-6">Search, filter, and manage your leave requests.</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by reason…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-ink-100 px-3 py-2 text-sm focus:border-ink-600 focus:ring-1 focus:ring-ink-600 outline-none"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-ink-100 px-3 py-2 text-sm outline-none">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-ink-100 px-3 py-2 text-sm outline-none">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {actionError && <p className="text-sm text-rejected-600 bg-rejected-50 rounded-lg px-3 py-2 mb-4" role="alert">{actionError}</p>}

      {error && <p className="text-rejected-600">{error}</p>}
      {!leaves && !error && <Spinner label="Loading history…" />}

      {leaves && leaves.length === 0 && (
        <div className="bg-white border border-ink-100 rounded-xl px-5 py-10 text-center text-sm text-ink-400">
          No leave requests match your filters.
        </div>
      )}

      {leaves && leaves.length > 0 && (
        <div className="bg-white border border-ink-100 rounded-xl divide-y divide-ink-100">
          {leaves.map((leave) => (
            <div key={leave.id} className="status-stub px-5 py-4" data-status={leave.status}>
              {editingId === leave.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={editForm.startDate} onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))} className="rounded-lg border border-ink-100 px-3 py-2 text-sm outline-none" />
                    <input type="date" value={editForm.endDate} onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))} className="rounded-lg border border-ink-100 px-3 py-2 text-sm outline-none" />
                  </div>
                  <textarea value={editForm.reason} onChange={(e) => setEditForm((f) => ({ ...f, reason: e.target.value }))} rows={2} className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm outline-none resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(leave.id)} className="bg-ink-700 text-white text-xs font-medium rounded-lg px-3 py-2 hover:bg-ink-600">Save changes</button>
                    <button onClick={() => setEditingId(null)} className="text-xs font-medium text-ink-400 px-3 py-2 hover:text-ink-700">Cancel edit</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink-900">{leave.leave_type} leave</p>
                      <StatusPill status={leave.status} />
                    </div>
                    <p className="text-xs text-ink-400 mt-1">{leave.start_date} → {leave.end_date}</p>
                    <p className="text-sm text-ink-600 mt-2">{leave.reason}</p>
                    {leave.manager_comments && (
                      <p className="text-xs text-ink-400 mt-2 italic">Manager: "{leave.manager_comments}"</p>
                    )}
                  </div>
                  {leave.status === 'Pending' && (
                    <div className="flex gap-2 shrink-0 ml-4">
                      <button onClick={() => startEdit(leave)} className="text-xs font-medium text-ink-600 border border-ink-100 rounded-lg px-3 py-1.5 hover:bg-ink-50">Edit</button>
                      <button onClick={() => cancelLeave(leave.id)} className="text-xs font-medium text-rejected-600 border border-rejected-50 rounded-lg px-3 py-1.5 hover:bg-rejected-50">Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
