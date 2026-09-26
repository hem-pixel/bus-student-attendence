const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const inchargeRoutes = require('./routes/incharge');
const studentRoutes = require('./routes/student');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Bus Students Tracker Backend API',
    phase: 'Phase 1 - Foundation & Infrastructure',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('🚌 Bus Students Tracker API is running smoothly.');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/incharge', inchargeRoutes);
app.use('/api/student', studentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;
