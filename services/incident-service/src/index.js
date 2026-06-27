import { createApp, startServer, mongoConnection } from '@intelliops/shared';
import incidentRoutes from './routes/incident.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const SERVICE_NAME = 'incident-service';
const PORT = 3003;

const app = createApp({ serviceName: SERVICE_NAME });
app.use('/incidents', incidentRoutes);
app.use('/analytics', analyticsRoutes);

mongoConnection.connect().then(() => {
  startServer(app, PORT, SERVICE_NAME);
}).catch((err) => {
  console.error(`[${SERVICE_NAME}] Failed to connect to MongoDB:`, err.message);
  process.exit(1);
});
