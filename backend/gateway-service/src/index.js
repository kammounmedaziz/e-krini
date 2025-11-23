import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting (in-memory store)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'gateway-service',
    timestamp: new Date().toISOString()
  });
});

// Service proxies
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  agency: process.env.AGENCY_SERVICE_URL || 'http://localhost:3002',
  search: process.env.SEARCH_SERVICE_URL || 'http://localhost:3003',
  reservation: process.env.RESERVATION_SERVICE_URL || 'http://localhost:3004',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  review: process.env.REVIEW_SERVICE_URL || 'http://localhost:3006'
};

// Proxy configurations
app.use('/api/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/v1/auth' }
}));

app.use('/api/agencies', createProxyMiddleware({
  target: services.agency,
  changeOrigin: true,
  pathRewrite: { '^/api/agencies': '' }
}));

app.use('/api/vehicles', createProxyMiddleware({
  target: services.agency,
  changeOrigin: true,
  pathRewrite: { '^/api/vehicles': '' }
}));

app.use('/api/search', createProxyMiddleware({
  target: services.search,
  changeOrigin: true,
  pathRewrite: { '^/api/search': '' }
}));

app.use('/api/reservations', createProxyMiddleware({
  target: services.reservation,
  changeOrigin: true,
  pathRewrite: { '^/api/reservations': '' }
}));

app.use('/api/payments', createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '' }
}));

app.use('/api/reviews', createProxyMiddleware({
  target: services.review,
  changeOrigin: true,
  pathRewrite: { '^/api/reviews': '' }
}));

app.use('/api/support', createProxyMiddleware({
  target: services.review,
  changeOrigin: true,
  pathRewrite: { '^/api/support': '' }
}));

app.use('/api/users', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api/v1/users' }
}));

app.use('/api/admin', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/admin': '/api/v1/admin' }
}));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
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
  console.log(`🚀 Gateway Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  process.exit(0);
});
