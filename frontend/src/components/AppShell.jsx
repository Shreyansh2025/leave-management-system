import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, History, Users, ClipboardList, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/apply', label: 'Apply Leave', icon: FilePlus2 },
    { to: '/employee/history', label: 'Leave History', icon: History },
    { to: '/employee/profile', label: 'Profile', icon: User },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/pending', label: 'Pending Approvals', icon: ClipboardList },
    { to: '/manager/employees', label: 'Employees', icon: Users },
  ];

  const links = user?.role === 'manager' ? managerLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 shrink-0 bg-ink-700 text-ink-50 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-display text-lg font-semibold text-white">LeaveDesk</p>
          <p className="text-xs text-ink-100/70 mt-0.5">Leave Management</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-ink-100/80 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-ink-100/60 capitalize">{user?.role} · {user?.department}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-100/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
