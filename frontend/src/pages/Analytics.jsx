export default function Analytics() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-slate-400">Incident trends, severity distribution, and resolution metrics</p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
        <p className="text-slate-400">Charts coming in Day 10</p>
        <p className="mt-2 text-sm text-slate-500">
          Incidents per day, severity distribution, and mean time to resolution.
        </p>
      </div>
    </div>
  );
}
