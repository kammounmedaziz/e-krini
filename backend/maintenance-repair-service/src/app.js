const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const maintenanceRoutes = require('./src/routes/maintenanceRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const partsRoutes = require('./src/routes/partsRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/parts', partsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'maintenance-repair-service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  console.log(`Maintenance & Repair Service running on port ${PORT}`);
});

module.exports = app;