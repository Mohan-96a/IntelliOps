import { Router } from 'express';
import { config } from '@intelliops/shared';
import {
  login,
  signup,
  logout,
  refreshSession,
  getUserById,
  getGoogleAuthUrl,
  handleGoogleCallback,
} from '../services/auth.service.js';
import { validate, loginSchema, signupSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ message: 'Auth routes ready' });
});

router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const result = await signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Unable to create account' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Unable to log in' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    const result = await refreshSession(refreshToken);
    return res.json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Unable to refresh session' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const result = await logout({
      accessToken: req.accessToken,
      refreshToken: req.body.refreshToken,
    });
    return res.json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Unable to log out' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Unable to fetch current user' });
  }
});

router.get('/google', (_req, res) => {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Google OAuth unavailable' });
  }
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${config.frontendUrl}/login?error=google_auth_failed`);
    }

    const result = await handleGoogleCallback(code);
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return res.redirect(`${config.frontendUrl}/auth/callback?${params.toString()}`);
  } catch (error) {
    console.error('[user-service] Google callback error:', error.message);
    return res.redirect(`${config.frontendUrl}/login?error=google_auth_failed`);
  }
});

export default router;
