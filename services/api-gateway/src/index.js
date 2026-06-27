import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { createApp, startServer, config } from '@intelliops/shared';

const SERVICE_NAME = 'api-gateway';
const PORT = config.services.gateway;

const app = createApp({ serviceName: SERVICE_NAME });

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(limiter);

const proxyOptions = (target, pathRewrite = {}) => ({
  target,
  changeOrigin: true,
  pathRewrite,
  on: {
  error: (err, _req, res) => {
    console.error(`[${SERVICE_NAME}] Proxy error:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Backend unavailable. Start Docker Desktop, run npm run dev:infra, then npm run dev.',
      });
    }
  },
  },
});

app.use('/api/auth', createProxyMiddleware(proxyOptions(config.services.user, { '^/api/auth': '/auth' })));
app.use('/api/users', createProxyMiddleware(proxyOptions(config.services.user, { '^/api/users': '/users' })));
app.use('/api/logs', createProxyMiddleware(proxyOptions(config.services.log, { '^/api/logs': '/logs' })));
app.use('/api/incidents', createProxyMiddleware(proxyOptions(config.services.incident, { '^/api/incidents': '/incidents' })));
app.use('/api/analytics', createProxyMiddleware(proxyOptions(config.services.incident, { '^/api/analytics': '/analytics' })));
app.use('/api/alerts', createProxyMiddleware(proxyOptions(config.services.alert, { '^/api/alerts': '/alerts' })));

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

startServer(app, PORT, SERVICE_NAME);
