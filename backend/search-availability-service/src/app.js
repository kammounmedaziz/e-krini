import express from 'express';
import mongoose from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import { createClient } from 'redis';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Elasticsearch client
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
await redisClient.connect();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/search-availability-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Health check
app.get('/health', async (req, res) => {
  try {
    const esHealth = await esClient.ping();
    res.status(200).json({ 
      status: 'OK', 
      service: 'search-availability-service',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      elasticsearch: esHealth ? 'connected' : 'disconnected',
      redis: redisClient.isOpen ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR',
      message: error.message
    });
  }
});

// API routes (placeholder)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Search & Availability Service API',
    version: '1.0.0',
    endpoints: [
      'GET /search/vehicles',
      'GET /search/autocomplete',
      'POST /availability/check',
      'GET /availability/:vehicleId',
      'POST /index/vehicle',
      'DELETE /index/vehicle/:id'
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
app.listen(PORT, () => {
  console.log(`🚀 Search & Availability Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await mongoose.connection.close();
  await redisClient.quit();
  await esClient.close();
  process.exit(0);
});
