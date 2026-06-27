import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp, mongoConnection, redisConnection, config } from '@intelliops/shared';
import alertRoutes from './routes/alert.routes.js';

const SERVICE_NAME = 'alert-service';
const PORT = 3005;

const app = createApp({ serviceName: SERVICE_NAME });
app.use('/alerts', alertRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[${SERVICE_NAME}] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[${SERVICE_NAME}] Client disconnected: ${socket.id}`);
  });
});

export { io };

Promise.all([
  mongoConnection.connect(),
  redisConnection.connect(),
]).then(() => {
  httpServer.listen(PORT, () => {
    console.log(`[${SERVICE_NAME}] listening on port ${PORT} (HTTP + WebSocket)`);
  });
}).catch((err) => {
  console.error(`[${SERVICE_NAME}] Startup failed:`, err.message);
  process.exit(1);
});
