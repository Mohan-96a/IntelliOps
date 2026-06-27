import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, AlertTriangle, BarChart3, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { ROLE_LABELS } from '../../constants/auth';
import { api } from '../../lib/api';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout() {
  const dispatch = useDispatch();
  const { realtimeConnected } = useSelector((s) => s.incidents);
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear local session even if API logout fails
    }
    dispatch(logout());
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900 p-6">
        <div className="mb-8 flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary-500" />
          <span className="text-xl font-bold tracking-tight">IntelliOps</span>
        </div>

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ShieldCheck className="h-4 w-4 text-primary-400" />
            {ROLE_LABELS[user?.role] || 'User'}
          </div>
          <p className="mt-2 font-semibold">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${realtimeConnected ? 'bg-success-500' : 'bg-slate-600'}`}
            />
            {realtimeConnected ? 'Live connected' : 'Connecting...'}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
