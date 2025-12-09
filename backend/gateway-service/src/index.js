import express from "express";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

console.log('Starting gateway service...');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Krini Car Rental API Gateway",
      version: "1.0.0",
      description: "API Gateway for E-Krini microservices car rental platform"
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server"
      }
    ],
    paths: {}
  }
};

const swaggerSpec = swaggerOptions.definition;

// Swagger JSON endpoint (before any middleware)
app.get("/swagger.json", (req, res) => {
  console.log('Swagger JSON endpoint called');
  console.log('Swagger spec type:', typeof swaggerSpec);
  console.log('Swagger spec keys:', Object.keys(swaggerSpec));
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Middleware global
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// Test route
app.get("/test", (req, res) => {
  console.log('Test route called');
  res.json({ message: "Test route works" });
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Service discovery endpoint
/**
 * @swagger
 * /services:
 *   get:
 *     tags: [Service Discovery]
 *     summary: Get service registry
 *     description: Retrieve the complete list of registered microservices and their URLs
 *     responses:
 *       200:
 *         description: Service registry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   default: true
 *                 data:
 *                   type: object
 *                   description: Object containing service names as keys and their URLs as values
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: When the registry was last updated
 */
app.get("/services", (req, res) => {
  // Service registry - in a real implementation this would be dynamic
  const services = {
    "auth-user-service": "http://auth-user-service:3001",
    "fleet-service": "http://fleet-service:3002", 
    "reservation-service": "http://reservation-service:3003",
    "assurence-claims-service": "http://assurence-claims-service:3004",
    "feedback-complaints-service": "http://feedback-complaints-service:3005",
    "promotion-coupon-service": "http://promotion-coupon-service:3006",
    "maintenance-service": "http://maintenance-service:3007",
    "discovery-service": "http://discovery-service:3000"
  };
  
  res.json({
    success: true,
    data: services,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    service: "api-gateway",
    timestamp: new Date().toISOString()
  });
});

// Create proxy middleware for services
const createProxyRoute = (serviceName) => {
  return async (req, res) => {
    try {
      const serviceUrls = {
        auth: process.env.AUTH_SERVICE_URL || "http://auth-user-service:3001",
        fleet: process.env.FLEET_SERVICE_URL || "http://fleet-service:3002",
        reservation: process.env.RESERVATION_SERVICE_URL || "http://reservation-service:3003",
        assurence: process.env.ASSURANCE_SERVICE_URL || "http://assurence-claims-service:3004",
        feedback: process.env.FEEDBACK_SERVICE_URL || "http://feedback-complaints-service:3005",
        promotion: process.env.PROMOTION_SERVICE_URL || "http://promotion-coupon-service:3006",
        maintenance: process.env.MAINTENANCE_SERVICE_URL || "http://maintenance-service:3007"
      };

      const targetUrl = serviceUrls[serviceName];
      if (!targetUrl) {
        return res.status(404).json({ success: false, error: "Service not found" });
      }

      const url = `${targetUrl}${req.url}`;
      
      // Forward the request
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          ...req.headers,
          host: new URL(targetUrl).host
        },
        timeout: 30000
      });

      // Forward the response
      res.status(response.status).json(response.data);
      
    } catch (error) {
      console.error(`Proxy error for ${serviceName}:`, error.message);
      
      if (error.response) {
        // Forward the error response from the service
        res.status(error.response.status).json(error.response.data);
      } else {
        // Service unavailable or timeout
        res.status(503).json({ 
          success: false, 
          error: "Service temporarily unavailable",
          service: serviceName
        });
      }
    }
  };
};

// API Routes - proxy to respective services
// app.use("/api/auth", createProxyRoute("auth"));
// app.use("/api/fleet", createProxyRoute("fleet"));
// app.use("/api/reservation", createProxyRoute("reservation"));
// app.use("/api/assurance", createProxyRoute("assurence"));
// app.use("/api/feedback", createProxyRoute("feedback"));
// app.use("/api/promotion", createProxyRoute("promotion"));
// app.use("/api/maintenance", createProxyRoute("maintenance"));

// 404 handler for unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Endpoint not found",
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ 
    success: false, 
    error: "Internal server error" 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});

export default app;
