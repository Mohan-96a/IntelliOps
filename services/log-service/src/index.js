import { createApp, startServer, mongoConnection } from '@intelliops/shared';
import logRoutes from './routes/log.routes.js';

const SERVICE_NAME = 'log-service';
const PORT = 3002;

const app = createApp({ serviceName: SERVICE_NAME });
app.use('/logs', logRoutes);

mongoConnection.connect().then(() => {
  startServer(app, PORT, SERVICE_NAME);
}).catch((err) => {
  console.error(`[${SERVICE_NAME}] Failed to connect to MongoDB:`, err.message);
  process.exit(1);
});
