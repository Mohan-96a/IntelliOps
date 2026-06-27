import { redisConnection } from '@intelliops/shared';

const REFRESH_PREFIX = 'refresh:';
const BLACKLIST_PREFIX = 'blacklist:';

function getRedis() {
  return redisConnection.getClient();
}

export async function storeRefreshToken(tokenId, userId) {
  const redis = getRedis();
  await redis.set(`${REFRESH_PREFIX}${tokenId}`, userId, 'EX', 7 * 24 * 60 * 60);
}

export async function getRefreshTokenUserId(tokenId) {
  const redis = getRedis();
  return redis.get(`${REFRESH_PREFIX}${tokenId}`);
}

export async function revokeRefreshToken(tokenId) {
  const redis = getRedis();
  await redis.del(`${REFRESH_PREFIX}${tokenId}`);
}

export async function blacklistAccessToken(jti, ttlSeconds) {
  if (!jti || ttlSeconds <= 0) return;
  const redis = getRedis();
  await redis.set(`${BLACKLIST_PREFIX}${jti}`, '1', 'EX', ttlSeconds);
}

export async function isAccessTokenBlacklisted(jti) {
  if (!jti) return false;
  const redis = getRedis();
  const value = await redis.get(`${BLACKLIST_PREFIX}${jti}`);
  return value === '1';
}
