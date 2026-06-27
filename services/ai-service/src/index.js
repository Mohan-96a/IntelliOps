import { createApp, startServer, mongoConnection } from '@intelliops/shared';

const SERVICE_NAME = 'ai-service';
const PORT = 3004;

const app = createApp({ serviceName: SERVICE_NAME });

app.get('/', (_req, res) => {
  res.json({ message: 'AI root cause analysis — implemented in Day 9' });
});

mongoConnection.connect().then(() => {
  startServer(app, PORT, SERVICE_NAME);
}).catch((err) => {
  console.error(`[${SERVICE_NAME}] Failed to connect to MongoDB:`, err.message);
  process.exit(1);
});
