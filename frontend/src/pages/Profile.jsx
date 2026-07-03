import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const rows = [
    ['Full name', user.name],
    ['Email', user.email],
    ['Department', user.department],
    ['Role', user.role],
    ['Joined', new Date(user.created_at).toLocaleDateString()],
  ];

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">Your profile</h1>
      <p className="text-sm text-ink-400 mb-6">Account details on file with your organization.</p>

      <div className="bg-white border border-ink-100 rounded-xl divide-y divide-ink-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-ink-400">{label}</span>
            <span className="text-sm font-medium text-ink-900 capitalize">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
