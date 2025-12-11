const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3004;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Assurance Claims Service API',
      version: '1.0.0',
      description: 'API for assurance and claims management',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Database connection
connectDB();

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
console.log('🔧 Loading routes...');
const constatRoutes = require('./routes/newConstatRoutes');
console.log('✅ Constat routes loaded');
const assuranceRoutes = require('./routes/assuranceRoutes');
console.log('✅ Assurance routes loaded');

// Utilisation des routes
console.log('🔌 Mounting routes...');
app.use('/api/constats', constatRoutes);
console.log('✅ Mounted /api/constats');
app.use('/api/assurances', assuranceRoutes);
console.log('✅ Mounted /api/assurances');

// Route de base pour tester l'API
app.get('/', (req, res) => {
    res.json({
        message: 'API Assurance et Constats - Serveur actif',
        version: '1.0.0',
        endpoints: {
            assurances: '/api/assurances',
            constats: '/api/constats'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'assurance-claims-service',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route non trouvée',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handling
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(error.errors).map(err => err.message)
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');

    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');

        server.close(() => {
            console.log('✅ Server shut down gracefully');
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down...');
    
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');

        server.close(() => {
            console.log('✅ Server shut down gracefully');
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

module.exports = app;