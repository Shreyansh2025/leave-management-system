import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) return setFormError('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError('Enter a valid email address.');
    if (!password) return setFormError('Password is required.');

    try {
      const user = await login(email.trim(), password);
      navigate(user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-2xl font-semibold text-ink-700">LeaveDesk</p>
          <p className="text-sm text-ink-400 mt-1">Sign in to manage leave requests</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-ink-100 rounded-xl p-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-ink-600 focus:ring-1 focus:ring-ink-600 outline-none"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-ink-600 focus:ring-1 focus:ring-ink-600 outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {formError && (
            <p className="text-sm text-rejected-600 bg-rejected-50 rounded-lg px-3 py-2" role="alert">{formError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-700 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-ink-600 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-xs text-ink-400 bg-ink-50 rounded-lg p-3 space-y-1">
          <p className="font-medium text-ink-600">Sample credentials</p>
          <p>Manager: manager@company.com / Password123!</p>
          <p>Employee: aarav@company.com / Password123!</p>
        </div>
      </div>
    </div>
  );
}
