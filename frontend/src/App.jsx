import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import Profile from './pages/Profile';
import ManagerDashboard from './pages/ManagerDashboard';
import PendingApprovals from './pages/PendingApprovals';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import NotFound from './pages/NotFound';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />;
}

function Shielded({ allowedRoles, children }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route path="/employee/dashboard" element={<Shielded allowedRoles={['employee']}><EmployeeDashboard /></Shielded>} />
          <Route path="/employee/apply" element={<Shielded allowedRoles={['employee']}><ApplyLeave /></Shielded>} />
          <Route path="/employee/history" element={<Shielded allowedRoles={['employee']}><LeaveHistory /></Shielded>} />
          <Route path="/employee/profile" element={<Shielded allowedRoles={['employee']}><Profile /></Shielded>} />

          <Route path="/manager/dashboard" element={<Shielded allowedRoles={['manager']}><ManagerDashboard /></Shielded>} />
          <Route path="/manager/pending" element={<Shielded allowedRoles={['manager']}><PendingApprovals /></Shielded>} />
          <Route path="/manager/employees" element={<Shielded allowedRoles={['manager']}><EmployeeList /></Shielded>} />
          <Route path="/manager/employees/:id" element={<Shielded allowedRoles={['manager']}><EmployeeDetail /></Shielded>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
