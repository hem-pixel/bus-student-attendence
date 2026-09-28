require('dotenv').config();
const http = require('http');
const socketIO = require('socket.io');
const app = require('./app');
const { testConnection } = require('./config/database');
const SocketService = require('./services/socketService');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

SocketService.initialize(io);

server.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready for real-time location tracking`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);

  // Run database connection test if credentials exist
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-project-ref')) {
    await testConnection();
  }
});

module.exports = server;

