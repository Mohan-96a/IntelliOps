import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { api } from '../lib/api';

const statCards = [
  { label: 'Active Incidents', key: 'active', icon: AlertTriangle, color: 'text-danger-500' },
  { label: 'Resolved Today', key: 'resolvedToday', icon: CheckCircle2, color: 'text-success-500' },
  { label: 'Avg Resolution', key: 'avgResolution', icon: Clock, color: 'text-warning-500' },
  { label: 'AI Analyses', key: 'aiAnalyses', icon: Zap, color: 'text-primary-400' },
];

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/incidents').catch(() => null),
    retry: false,
  });

  const stats = {
    active: data?.active ?? 0,
    resolvedToday: data?.resolvedToday ?? 0,
    avgResolution: data?.avgResolution ?? '—',
    aiAnalyses: data?.aiAnalyses ?? 0,
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Operations Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Real-time incident monitoring and AI-powered root cause analysis
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, key, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold">{stats[key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Incidents</h2>
        <p className="text-sm text-slate-500">
          Incident detection engine activates on Day 7. Connect log ingestion to begin monitoring.
        </p>
      </div>
    </div>
  );
}
