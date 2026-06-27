import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createApp({ serviceName }) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: serviceName, timestamp: new Date().toISOString() });
  });

  return app;
}

export function startServer(app, port, serviceName) {
  const server = app.listen(port, () => {
    console.log(`[${serviceName}] listening on port ${port}`);
  });

  const shutdown = async (signal) => {
    console.log(`[${serviceName}] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}
