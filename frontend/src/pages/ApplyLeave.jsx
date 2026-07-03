import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const LEAVE_TYPES = ['Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity'];

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.startDate) errs.startDate = 'Start date is required.';
    if (!form.endDate) errs.endDate = 'End date is required.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = 'End date cannot be before start date.';
    }
    if (!form.reason.trim() || form.reason.trim().length < 3) {
      errs.reason = 'Please provide a reason (at least 3 characters).';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await api.post('/leaves', form);
      navigate('/employee/history');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">Apply for leave</h1>
      <p className="text-sm text-ink-400 mb-6">Fill in the details below. Your manager will review it shortly.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-ink-100 rounded-xl p-6 space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Leave type</label>
          <select
            value={form.leaveType}
            onChange={(e) => field('leaveType', e.target.value)}
            className="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-ink-600 focus:ring-1 focus:ring-ink-600 outline-none"
          >
            {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Start date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => field('startDate', e.target.value)}
              className="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-ink-600 focus:ring-1 focus:ring-ink-600 outline-none"
            />
            {errors.startDate && <p className="text-xs text-rejected-600 mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">End date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => field('endDate', e.target.value)}
              className="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-ink-600 focus:ring-1 focus:ring-ink-600 outline-none"
            />
            {errors.endDate && <p className="text-xs text-rejected-600 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Reason</label>
          <textarea
            value={form.reason}
            onChange={(e) => field('reason', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-ink-600 focus:ring-1 focus:ring-ink-600 outline-none resize-none"
            placeholder="Briefly describe why you're requesting leave"
          />
          {errors.reason && <p className="text-xs text-rejected-600 mt-1">{errors.reason}</p>}
        </div>

        {serverError && <p className="text-sm text-rejected-600 bg-rejected-50 rounded-lg px-3 py-2" role="alert">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink-700 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-ink-600 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </div>
  );
}
