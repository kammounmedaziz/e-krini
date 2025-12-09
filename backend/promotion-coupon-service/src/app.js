import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import connectDB from './config/database.js';
import couponRoutes from './routes/couponRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';

// Load environment variables
dotenv.config();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Promotion Coupon Service API',
      version: '1.0.0',
      description: 'API for promotion and coupon management',
    },
    servers: [
      {
        url: 'http://localhost:3006',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Promotion & Coupon Service is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/coupons', couponRoutes);
app.use('/api/promotions', promotionRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════════╗
    ║   🚀 Server Started Successfully          ║
    ║   📍 Port: ${PORT}                         ║
    ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}        ║
    ║   📚 API Documentation:                    ║
    ║      - Coupons: /api/coupons              ║
    ║      - Promotions: /api/promotions        ║
    ╚════════════════════════════════════════════╝
  `);
});

export default app;