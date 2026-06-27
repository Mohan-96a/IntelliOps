import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Activity } from 'lucide-react';
import { api } from '../lib/api';
import { setCredentials } from '../features/auth/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(searchParams.get('error') === 'google_auth_failed'
    ? 'Google sign-in failed. Check your Google OAuth settings.'
    : '');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', form);
      dispatch(setCredentials(response));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-8 flex flex-col items-center">
          <Activity className="mb-3 h-10 w-10 text-primary-500" />
          <h1 className="text-2xl font-bold">IntelliOps</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your operations platform</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              placeholder="********"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-primary-500"
              required
            />
          </div>

          {error ? <p className="text-sm text-danger-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-medium transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
        >
          <span className="text-base">G</span>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          New to IntelliOps?{' '}
          <Link to="/signup" className="text-primary-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
