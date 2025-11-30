import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import path from 'path';
import { fileURLToPath } from 'url';
import reservationRoutes from './routes/reservations.js';
import contractRoutes from './routes/contracts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));



const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reservation');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'reservation-service',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/reservations', reservationRoutes);
app.use('/api/contracts', contractRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Reservation & Contract Service API',
    version: '1.0.0',
    endpoints: {
      reservations: [
        'POST /api/reservations - Create',
        'GET /api/reservations/:reservationId - Get one',
        'GET /api/reservations/client/:clientId - Get by client',
        'GET /api/reservations/search/by-car-model?carModel=X - Search by model',
        'GET /api/reservations/by-status/:status - Get by status',
        'GET /api/reservations/period?startDate=X&endDate=Y - Get by period',
        'GET /api/reservations/stats/overview - Statistics',
        'GET /api/reservations/availability/check?carId=X&startDate=Y&endDate=Z - Check availability',
        'PUT /api/reservations/:reservationId - Update',
        'PUT /api/reservations/:reservationId/cancel - Cancel',
        'PUT /api/reservations/:reservationId/confirm - Confirm'
      ],
      contracts: [
        'POST /api/contracts - Create',
        'GET /api/contracts/:contractId - Get one',
        'GET /api/contracts/client/:clientId - Get by client',
        'GET /api/contracts/by-status/:status - Get by status',
        'GET /api/contracts/stats/overview - Statistics',
        'POST /api/contracts/:contractId/generate-pdf - Generate PDF',
        'GET /api/contracts/:contractId/download-pdf - Download PDF',
        'PUT /api/contracts/:contractId/status - Update status',
        'PUT /api/contracts/:contractId/rules - Update rules'
      ]
    }
  });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Reservation Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
