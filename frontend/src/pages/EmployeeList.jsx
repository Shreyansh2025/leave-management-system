import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Spinner from '../components/Spinner';

export default function EmployeeList() {
  const [employees, setEmployees] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchEmployees = useCallback(() => {
    api.get('/employees', { params: search ? { search } : {} })
      .then((res) => setEmployees(res.data.data))
      .catch(() => setError('Could not load employees.'));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">Employees</h1>
      <p className="text-sm text-ink-400 mb-6">Search your team and review individual leave history.</p>

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-ink-100 px-3 py-2 text-sm outline-none focus:border-ink-600 focus:ring-1 focus:ring-ink-600 mb-5"
      />

      {error && <p className="text-rejected-600">{error}</p>}
      {!employees && !error && <Spinner label="Loading employees…" />}

      {employees && employees.length === 0 && (
        <div className="bg-white border border-ink-100 rounded-xl px-5 py-10 text-center text-sm text-ink-400">No employees match your search.</div>
      )}

      {employees && employees.length > 0 && (
        <div className="bg-white border border-ink-100 rounded-xl divide-y divide-ink-100">
          {employees.map((emp) => (
            <Link key={emp.id} to={`/manager/employees/${emp.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-ink-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-ink-900">{emp.name}</p>
                <p className="text-xs text-ink-400 mt-0.5">{emp.email}</p>
              </div>
              <span className="text-xs text-ink-400 bg-ink-50 rounded-full px-3 py-1">{emp.department}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
