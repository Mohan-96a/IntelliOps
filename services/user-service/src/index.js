import { createApp, startServer, mongoConnection, redisConnection } from '@intelliops/shared';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

const SERVICE_NAME = 'user-service';
const PORT = 3001;

const app = createApp({ serviceName: SERVICE_NAME });

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

Promise.all([
  mongoConnection.connect(),
  redisConnection.connect(),
]).then(() => {
  startServer(app, PORT, SERVICE_NAME);
}).catch((err) => {
  console.error(`[${SERVICE_NAME}] Startup failed:`, err.message);
  console.error(`[${SERVICE_NAME}] Make sure Docker Desktop is running, then: npm run dev:infra`);
  process.exit(1);
});
