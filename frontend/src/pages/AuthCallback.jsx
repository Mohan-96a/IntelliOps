import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { api } from '../lib/api';
import { setCredentials } from '../features/auth/authSlice';

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    localStorage.setItem('accessToken', accessToken);

    api.me()
      .then(({ user }) => {
        dispatch(setCredentials({ user, accessToken, refreshToken }));
        navigate('/', { replace: true });
      })
      .catch(() => {
        setError('Unable to complete Google sign-in.');
      });
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <Activity className="mx-auto mb-4 h-10 w-10 text-primary-500" />
        {error ? (
          <>
            <p className="text-danger-500">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-4 text-sm text-primary-400 hover:underline"
            >
              Back to login
            </button>
          </>
        ) : (
          <p className="text-slate-400">Completing Google sign-in...</p>
        )}
      </div>
    </div>
  );
}
