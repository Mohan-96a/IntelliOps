const API_BASE = '/api';

async function parseError(res) {
  const error = await res.json().catch(() => ({}));
  if (res.status === 502) {
    return 'Backend unavailable. Start Docker Desktop, then run: npm run dev:infra && npm run dev';
  }
  return error.error || error.message || res.statusText || 'Request failed';
}

async function request(path, options = {}, retry = true) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request(path, options, false);
    }
  }

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

async function tryRefreshToken() {
  const stored = localStorage.getItem('intelliops-auth');
  if (!stored) return false;

  try {
    const parsed = JSON.parse(stored);
    if (!parsed.refreshToken) return false;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: parsed.refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem(
      'intelliops-auth',
      JSON.stringify({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }),
    );
    localStorage.setItem('accessToken', data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  logout: () => {
    const stored = localStorage.getItem('intelliops-auth');
    const refreshToken = stored ? JSON.parse(stored).refreshToken : null;
    return request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
