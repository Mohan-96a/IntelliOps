export default function Incidents() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <p className="mt-1 text-slate-400">Track, investigate, and resolve production incidents</p>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
        <p className="text-slate-400">No incidents detected yet.</p>
        <p className="mt-2 text-sm text-slate-500">
          Incidents are created when detection rules trigger (e.g. 50 ERROR logs in 60s).
        </p>
      </div>
    </div>
  );
}
