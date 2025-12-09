import express from "express";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

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
      description: "API Gateway for E-Krini microservices car rental platform",
      contact: {
        name: "E-Krini Support",
        email: "support@ekrini.com"
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./src/index.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware global
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Hardcoded service URLs for direct routing
const serviceURLs = {
  auth: "http://localhost:3001",
  fleet: "http://localhost:3002",
  reservation: "http://localhost:3003",
  promotion: "http://localhost:3006",
  feedback: "http://localhost:3005",
  assurance: "http://localhost:3004",
  maintenance: "http://localhost:3007"
};

// Get service URL (hardcoded)
async function getServiceURL(serviceName) {
  return serviceURLs[serviceName] || null;
}

// Service replace mappings
const serviceReplace = {
  auth: { from: "/api/auth", to: "/auth" },
  fleet: { from: "/api/fleet", to: "/api" },
  reservation: { from: "/api/reservation", to: "/api" },
  promotion: { from: "/api/promotion", to: "/api" },
  feedback: { from: "/api/feedback", to: "/api/feedback" },
  assurance: { from: "/api/assurance", to: "/api" },
  maintenance: { from: "/api/maintenance", to: "" }
};

// Fonction générique de proxy
async function proxyRequest(req, res, serviceName) {
  const baseURL = await getServiceURL(serviceName);

  if (!baseURL) {
    return res.status(503).json({
      success: false,
      message: `Service ${serviceName} unavailable`,
    });
  }

  const { from, to } = serviceReplace[serviceName] || { from: "", to: "" };
  const targetURL = baseURL + req.originalUrl.replace(from, to);

  console.log(`🔀 Proxying ${req.method} ${req.originalUrl} → ${targetURL}`);

  try {
    const response = await axios({
      method: req.method,
      url: targetURL,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
        'content-length': undefined,
      },
      validateStatus: () => true, // Accept all status codes
    });

    // Set response headers
    Object.keys(response.headers).forEach(key => {
      if (!['connection', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, response.headers[key]);
      }
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`❌ Gateway error for ${serviceName}:`, error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Gateway error",
      details: error.response?.data || error.message,
    });
  }
}

// Routes du gateway → basées sur le nom des services
const createProxyRoute = (serviceName) => {
  return async (req, res, next) => {
    try {
      await proxyRequest(req, res, serviceName);
    } catch (err) {
      next(err);
    }
  };
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [client, agency, admin, insurance]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */

/**
 * @swagger
 * /api/fleet/cars:
 *   get:
 *     tags: [Fleet]
 *     summary: Get all cars
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cars
 *   post:
 *     tags: [Fleet]
 *     summary: Add new car (Agency/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [brand, model, year, licensePlate, pricePerDay]
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               licensePlate:
 *                 type: string
 *               pricePerDay:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, rented, maintenance]
 *               category:
 *                 type: string
 *               fuelType:
 *                 type: string
 *               transmission:
 *                 type: string
 *               seats:
 *                 type: number
 *               color:
 *                 type: string
 *               mileage:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Car added successfully
 */

/**
 * @swagger
 * /api/fleet/cars/{id}:
 *   get:
 *     tags: [Fleet]
 *     summary: Get car by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car details
 *   put:
 *     tags: [Fleet]
 *     summary: Update car (Agency/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Car updated
 *   delete:
 *     tags: [Fleet]
 *     summary: Delete car (Agency/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted
 */

/**
 * @swagger
 * /api/reservation/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Get all reservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reservations
 *   post:
 *     tags: [Reservations]
 *     summary: Create new reservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carId, startDate, endDate]
 *             properties:
 *               carId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               pickupLocation:
 *                 type: string
 *               dropoffLocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reservation created
 */

/**
 * @swagger
 * /api/promotion/promotions:
 *   get:
 *     tags: [Promotions]
 *     summary: Get all promotions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of promotions
 *   post:
 *     tags: [Promotions]
 *     summary: Create promotion (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountType, discountValue]
 *             properties:
 *               code:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *     responses:
 *       201:
 *         description: Promotion created
 */

/**
 * @swagger
 * /api/feedback/feedbacks:
 *   get:
 *     tags: [Feedback]
 *     summary: Get all feedbacks (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of feedbacks
 *   post:
 *     tags: [Feedback]
 *     summary: Create feedback or complaint
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, subject, message]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [feedback, complaint]
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               rating:
 *                 type: number
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback created
 */

/**
 * @swagger
 * /api/assurance/claims:
 *   get:
 *     tags: [Insurance]
 *     summary: Get insurance claims
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of claims
 *   post:
 *     tags: [Insurance]
 *     summary: Create insurance claim
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Claim created
 */

/**
 * @swagger
 * /api/maintenance/records:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get maintenance records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance records
 *   post:
 *     tags: [Maintenance]
 *     summary: Create maintenance record (Agency/Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Record created
 */

app.use("/api/auth", createProxyRoute("auth"));
app.use("/api/fleet", createProxyRoute("fleet"));
app.use("/api/reservation", createProxyRoute("reservation"));
app.use("/api/promotion", createProxyRoute("promotion"));
app.use("/api/feedback", createProxyRoute("feedback"));
app.use("/api/assurance", createProxyRoute("assurance"));
app.use("/api/maintenance", createProxyRoute("maintenance"));

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Gateway health check
 *     responses:
 *       200:
 *         description: Gateway is healthy
 */
// Health check du gateway
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "gateway-service",
    timestamp: new Date().toISOString(),
  });
});

// Start gateway
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});