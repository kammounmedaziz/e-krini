import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve static files for KYC documents
app.use('/uploads', express.static('uploads'));

// Database connection
connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'auth-user-service',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/', (req, res) => {
  res.json({
    message: 'Auth & User Service API',
    version: '1.0.0',
    endpoints: [
      'POST /auth/register',
      'POST /auth/login',
      'POST /auth/logout',
      'POST /auth/refresh-token',
      'POST /auth/forgot-password',
      'POST /auth/reset-password',
      'GET /auth/google',
      'GET /auth/facebook',
      'GET /users/profile',
      'PUT /users/profile',
      'POST /users/2fa/enable',
      'POST /users/2fa/verify'
    ]
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import agencyRoutes from './routes/agencyRoutes.js';
import insuranceRoutes from './routes/insuranceRoutes.js';
import twoFactorRoutes from './routes/twoFactor.js';
import passwordResetRoutes from './routes/passwordReset.js';
import loginHistoryRoutes from './routes/loginHistory.js';
import kycRoutes from './routes/kyc.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/agency', agencyRoutes);
app.use('/api/v1/insurance', insuranceRoutes);
app.use('/api/v1/2fa', twoFactorRoutes);
app.use('/api/v1/password', passwordResetRoutes);
app.use('/api/v1/login-history', loginHistoryRoutes);
app.use('/api/v1/kyc', kycRoutes);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth & User Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
