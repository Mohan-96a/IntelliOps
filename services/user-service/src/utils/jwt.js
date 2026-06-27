import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '@intelliops/shared';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

export function signAccessToken(payload) {
  const jti = randomUUID();
  const token = jwt.sign({ ...payload, jti }, config.jwtSecret, { expiresIn: ACCESS_EXPIRY });
  return { token, jti, expiresIn: ACCESS_EXPIRY };
}

export function signRefreshToken(payload) {
  const tokenId = randomUUID();
  const token = jwt.sign({ ...payload, tokenId }, config.jwtRefreshSecret, { expiresIn: REFRESH_EXPIRY });
  return { token, tokenId, expiresIn: REFRESH_EXPIRY };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

export function getTokenTtlSeconds(token, secret) {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return 0;
  return Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0);
}
