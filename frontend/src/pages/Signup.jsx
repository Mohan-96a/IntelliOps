import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Activity } from 'lucide-react';
import { api } from '../lib/api';
import { setCredentials } from '../features/auth/authSlice';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/signup', form);
      dispatch(setCredentials(response));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-8 flex flex-col items-center">
          <Activity className="mb-3 h-10 w-10 text-primary-500" />
          <h1 className="text-2xl font-bold">Create your IntelliOps account</h1>
          <p className="mt-1 text-sm text-slate-400">Start securing your incident response workflow</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Full name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Mohan Kumar"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="engineer@company.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-primary-500"
              minLength={8}
              required
            />
          </div>

          {error ? <p className="text-sm text-danger-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-medium transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
