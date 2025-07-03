//server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cameraRoutes from './routes/cameraRoutes.js';
import { initializeSocket } from './socket/alertSocket.js';
import { startCameraMonitoring } from './services/cameraMonitor.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cameras', cameraRoutes);

// Initialize WebSocket
initializeSocket(io);

// Start camera monitoring service
startCameraMonitoring(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Smart CCTV Server running on port ${PORT}`);
  console.log(`📡 WebSocket server initialized`);
  console.log(`🔍 Camera monitoring service started`);
  console.log(`📬 Notification system ready`);
  console.log(`📧 Email notifications: ${process.env.EMAIL_NOTIFICATIONS === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`📱 SMS notifications: ${process.env.SMS_NOTIFICATIONS === 'true' ? 'ENABLED' : 'DISABLED'}`);
});