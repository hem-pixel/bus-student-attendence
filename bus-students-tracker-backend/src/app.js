const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const locationRoutes = require('./routes/location.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const alertRoutes = require('./routes/alerts.routes');
const busInchargeRoutes = require('./routes/bus-incharge.routes');

const adminController = require('./controllers/admin.controller');
const { verifyToken } = require('./middleware/auth.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman) or any localhost origin
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in development
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/incharge', busInchargeRoutes);
app.use('/api/bus-incharge', busInchargeRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/buses', locationRoutes); // For GET /api/buses/:id/location and history
app.use('/api/attendance', attendanceRoutes);
app.use('/api/alerts', alertRoutes);

// Student Portal / Dashboard route
app.get('/api/student/dashboard', verifyToken, (req, res, next) => {
  req.params.id = 'current';
  adminController.getStudentDashboard(req, res, next);
});
app.get('/api/student/dashboard/:id', verifyToken, adminController.getStudentDashboard);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'Backend is running',
    version: '2.0.0',
    phase: 'Phase 2 - Core Backend API Development'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '🚌 Bus Students Tracker API is active',
    phase: 'Phase 2 - Complete'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
