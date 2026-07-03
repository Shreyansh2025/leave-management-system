import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import Spinner from '../components/Spinner';
import StatusPill from '../components/StatusPill';

export default function PendingApprovals() {
  const [leaves, setLeaves] = useState(null);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(null); // { id, action }
  const [comments, setComments] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchPending = useCallback(() => {
    api.get('/pending-leaves')
      .then((res) => setLeaves(res.data.data))
      .catch(() => setError('Could not load pending requests.'));
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const openReview = (id, action) => {
    setActionError('');
    setComments('');
    setReviewing({ id, action });
  };

  const submitReview = async () => {
    setActionError('');
    try {
      await api.put(`/leaves/${reviewing.id}/${reviewing.action}`, { comments });
      setReviewing(null);
      fetchPending();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not process this request.');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">Pending approvals</h1>
      <p className="text-sm text-ink-400 mb-6">Review and act on requests awaiting your decision.</p>

      {error && <p className="text-rejected-600">{error}</p>}
      {!leaves && !error && <Spinner label="Loading pending requests…" />}

      {leaves && leaves.length === 0 && (
        <div className="bg-white border border-ink-100 rounded-xl px-5 py-10 text-center text-sm text-ink-400">
          You're all caught up — no pending requests.
        </div>
      )}

      {leaves && leaves.length > 0 && (
        <div className="bg-white border border-ink-100 rounded-xl divide-y divide-ink-100">
          {leaves.map((leave) => (
            <div key={leave.id} className="status-stub px-5 py-4" data-status={leave.status}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink-900">{leave.employee_name}</p>
                    <span className="text-xs text-ink-400">· {leave.department}</span>
                  </div>
                  <p className="text-xs text-ink-400 mt-1">{leave.leave_type} · {leave.start_date} → {leave.end_date}</p>
                  <p className="text-sm text-ink-600 mt-2">{leave.reason}</p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button onClick={() => openReview(leave.id, 'approve')} className="text-xs font-medium text-approved-600 border border-approved-50 rounded-lg px-3 py-1.5 hover:bg-approved-50">Approve</button>
                  <button onClick={() => openReview(leave.id, 'reject')} className="text-xs font-medium text-rejected-600 border border-rejected-50 rounded-lg px-3 py-1.5 hover:bg-rejected-50">Reject</button>
                </div>
              </div>

              {reviewing?.id === leave.id && (
                <div className="mt-4 bg-ink-50 rounded-lg p-4">
                  <label className="block text-xs font-medium text-ink-700 mb-1.5">
                    Comments {reviewing.action === 'reject' ? '(recommended)' : '(optional)'}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm outline-none resize-none bg-white"
                    placeholder="Add context for the employee…"
                  />
                  {actionError && <p className="text-xs text-rejected-600 mt-2">{actionError}</p>}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={submitReview}
                      className={`text-xs font-medium text-white rounded-lg px-3 py-2 ${reviewing.action === 'approve' ? 'bg-approved-600 hover:opacity-90' : 'bg-rejected-600 hover:opacity-90'}`}
                    >
                      Confirm {reviewing.action === 'approve' ? 'approval' : 'rejection'}
                    </button>
                    <button onClick={() => setReviewing(null)} className="text-xs font-medium text-ink-400 px-3 py-2 hover:text-ink-700">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
