import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
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

function createServiceProxy(target, servicePrefix) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    // Express strips the mount path (e.g. /api/auth) before the proxy sees it,
    // so /api/auth/signup arrives here as /signup — prepend the service prefix.
    pathRewrite: (path) => `${servicePrefix}${path}`,
    on: {
      proxyReq: fixRequestBody,
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
}

app.use('/api/auth', createServiceProxy(config.services.user, '/auth'));
app.use('/api/users', createServiceProxy(config.services.user, '/users'));
app.use('/api/logs', createServiceProxy(config.services.log, '/logs'));
app.use('/api/incidents', createServiceProxy(config.services.incident, '/incidents'));
app.use('/api/analytics', createServiceProxy(config.services.incident, '/analytics'));
app.use('/api/alerts', createServiceProxy(config.services.alert, '/alerts'));

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

startServer(app, PORT, SERVICE_NAME);
