import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import carRoutes from './routes/carRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Mount fleet routes
app.use('/api/categories', categoryRoutes);
app.use('/api/cars', carRoutes);

// Health check (always reachable even if DB is down)
app.get('/health', (req, res) => {
  const dbState = mongoose.connection && mongoose.connection.readyState === 1 ? 'connected' : 'down';
  res.status(200).json({
    status: 'OK',
    service: 'agency-fleet-service',
    timestamp: new Date().toISOString(),
    db: dbState,
  });
});

// Connect to DB but don't block server start if DB is unavailable
connectDB().then((conn) => {
  if (conn) {
    console.log('DB: connected');
  } else {
    console.warn('DB: connection unavailable at startup — continuing without DB');
  }
}).catch((err) => {
  console.error('DB connection error (async):', err);
});

// API routes (placeholder)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fleet Management Service API',
    version: '1.0.0',
    endpoints: [
      'POST /agencies',
      'GET /agencies',
      'GET /agencies/:id',
      'PUT /agencies/:id',
      'DELETE /agencies/:id',
      'POST /vehicles',
      'GET /vehicles',
      'GET /vehicles/:id',
      'PUT /vehicles/:id',
      'DELETE /vehicles/:id',
      'POST /vehicles/:id/images',
      'GET /vehicles/agency/:agencyId'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
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
// Bind to localhost (127.0.0.1) for local development and Postman access
const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Agency & Fleet Service running on http://${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Ready for requests`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server gracefully...');
  server.close();
  await mongoose.connection.close();
  process.exit(0);
});
