import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../../.env') });

export function getEnv(key, fallback) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  mongoUri: getEnv('MONGO_URI', 'mongodb://localhost:27017/intelliops'),
  redisUrl: getEnv('REDIS_URL', 'redis://localhost:6379'),
  kafkaBrokers: getEnv('KAFKA_BROKERS', 'localhost:9092').split(','),
  jwtSecret: getEnv('JWT_SECRET', 'dev-secret-change-in-production'),
  jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
  geminiApiKey: getEnv('GEMINI_API_KEY', ''),
  googleClientId: getEnv('GOOGLE_CLIENT_ID', ''),
  googleClientSecret: getEnv('GOOGLE_CLIENT_SECRET', ''),
  googleCallbackUrl: getEnv('GOOGLE_CALLBACK_URL', 'http://localhost:3000/api/auth/google/callback'),
  gatewayUrl: getEnv('GATEWAY_URL', 'http://localhost:3000'),
  smtpHost: getEnv('SMTP_HOST', ''),
  smtpPort: Number(getEnv('SMTP_PORT', '587')),
  smtpUser: getEnv('SMTP_USER', ''),
  smtpPass: getEnv('SMTP_PASS', ''),
  frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),
  services: {
    gateway: Number(getEnv('GATEWAY_PORT', '3000')),
    user: getEnv('USER_SERVICE_URL', 'http://localhost:3001'),
    log: getEnv('LOG_SERVICE_URL', 'http://localhost:3002'),
    incident: getEnv('INCIDENT_SERVICE_URL', 'http://localhost:3003'),
    ai: getEnv('AI_SERVICE_URL', 'http://localhost:3004'),
    alert: getEnv('ALERT_SERVICE_URL', 'http://localhost:3005'),
  },
};
