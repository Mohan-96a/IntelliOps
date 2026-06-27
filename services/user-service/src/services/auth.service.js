import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import { config } from '@intelliops/shared';
import { User } from '../models/User.model.js';
import { ROLES } from '../constants/roles.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  getTokenTtlSeconds,
} from '../utils/jwt.js';
import {
  storeRefreshToken,
  getRefreshTokenUserId,
  revokeRefreshToken,
  blacklistAccessToken,
} from '../utils/tokenStore.js';

const SALT_ROUNDS = 12;

function getGoogleClient() {
  if (!config.googleClientId || !config.googleClientSecret) {
    const error = new Error('Google OAuth is not configured');
    error.status = 503;
    throw error;
  }

  return new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    config.googleCallbackUrl,
  );
}

async function issueTokens(user) {
  const safeUser = user.toSafeJSON();
  const access = signAccessToken({
    sub: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  });
  const refresh = signRefreshToken({ sub: safeUser.id });
  await storeRefreshToken(refresh.tokenId, safeUser.id);

  return {
    user: safeUser,
    accessToken: access.token,
    refreshToken: refresh.token,
  };
}

export async function signup({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const userCount = await User.countDocuments();
  const role = userCount === 0 ? ROLES.ADMIN : ROLES.VIEWER;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    provider: 'local',
  });

  return issueTokens(user);
}

export async function login({ email, password }) {
  const user = await User.findOne({ email, provider: 'local' }).select('+password');
  if (!user || !user.password) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return issueTokens(user);
}

export async function refreshSession(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }

  const userId = await getRefreshTokenUserId(payload.tokenId);
  if (!userId || userId !== payload.sub) {
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  await revokeRefreshToken(payload.tokenId);
  return issueTokens(user);
}

export async function logout({ accessToken, refreshToken }) {
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await revokeRefreshToken(payload.tokenId);
    } catch {
      // Ignore invalid refresh token on logout
    }
  }

  if (accessToken) {
    try {
      const { jti } = verifyAccessToken(accessToken);
      const ttl = getTokenTtlSeconds(accessToken, config.jwtSecret);
      await blacklistAccessToken(jti, ttl);
    } catch {
      // Ignore invalid access token on logout
    }
  }

  return { message: 'Logged out successfully' };
}

export function getGoogleAuthUrl() {
  const client = getGoogleClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
  });
}

export async function handleGoogleCallback(code) {
  const client = getGoogleClient();
  const { tokens } = await client.getToken(code);
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.googleClientId,
  });

  const profile = ticket.getPayload();
  if (!profile?.email || !profile.sub) {
    const error = new Error('Unable to read Google profile');
    error.status = 400;
    throw error;
  }

  let user = await User.findOne({
    $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }],
  });

  if (!user) {
    const userCount = await User.countDocuments();
    user = await User.create({
      name: profile.name || profile.email.split('@')[0],
      email: profile.email.toLowerCase(),
      googleId: profile.sub,
      role: userCount === 0 ? ROLES.ADMIN : ROLES.VIEWER,
      provider: 'google',
    });
  } else if (!user.googleId) {
    user.googleId = profile.sub;
    user.provider = 'google';
    await user.save();
  }

  return issueTokens(user);
}

export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user.toSafeJSON();
}

export async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map((u) => u.toSafeJSON());
}
