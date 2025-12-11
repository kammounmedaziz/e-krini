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

// Custom Swagger specification with correct gateway paths
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-Krini Car Rental API Gateway",
    version: "1.0.0",
    description: "API Gateway for E-Krini microservices. All endpoints route through this gateway on port 4000.",
    contact: {
      name: "API Support",
      url: "https://github.com/kammounmedaziz/e-krini"
    }
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "API Gateway"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token from login"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "object" }
        }
      }
    }
  },
  tags: [
    { name: "Authentication", description: "User authentication endpoints" },
    { name: "User Profile", description: "User profile management" },
    { name: "Admin", description: "Admin management endpoints" },
    { name: "Fleet", description: "Vehicle and category management" },
    { name: "Reservations", description: "Reservation management" },
    { name: "Contracts", description: "Contract management" },
    { name: "Insurance", description: "Insurance policy management" },
    { name: "Claims", description: "Insurance claims management" },
    { name: "Feedback", description: "Feedback and complaints" },
    { name: "Promotions", description: "Promotion management" },
    { name: "Coupons", description: "Coupon management" },
    { name: "Maintenance", description: "Vehicle maintenance" }
  ],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        description: "Authenticate user and receive JWT tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "admin" },
                  password: { type: "string", example: "Admin@123" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password", "role"],
                properties: {
                  username: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                  role: { type: "string", enum: ["client", "agency", "insurance"] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "User registered" }
        }
      }
    },
    "/api/auth/refresh-token": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Token refreshed" }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Logged out" }
        }
      }
    },
    "/api/users/profile": {
      get: {
        tags: ["User Profile"],
        summary: "Get user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Profile retrieved" }
        }
      },
      put: {
        tags: ["User Profile"],
        summary: "Update user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Profile updated" }
        }
      }
    },
    "/api/cars": {
      get: {
        tags: ["Fleet"],
        summary: "Get all cars",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "disponibilite", in: "query", schema: { type: "boolean" } }
        ],
        responses: {
          200: { description: "Cars retrieved" }
        }
      },
      post: {
        tags: ["Fleet"],
        summary: "Create car",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Car created" }
        }
      }
    },
    "/api/cars/{id}": {
      get: {
        tags: ["Fleet"],
        summary: "Get car by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Car retrieved" }
        }
      },
      patch: {
        tags: ["Fleet"],
        summary: "Update car",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Car updated" }
        }
      },
      delete: {
        tags: ["Fleet"],
        summary: "Delete car",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Car deleted" }
        }
      }
    },
    "/api/categories": {
      get: {
        tags: ["Fleet"],
        summary: "Get all categories",
        responses: {
          200: { description: "Categories retrieved" }
        }
      },
      post: {
        tags: ["Fleet"],
        summary: "Create category",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Category created" }
        }
      }
    },
    "/api/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "Get all reservations",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Reservations retrieved" }
        }
      },
      post: {
        tags: ["Reservations"],
        summary: "Create reservation",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["carId", "startDate", "endDate"],
                properties: {
                  carId: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" },
                  pickupLocation: { type: "string" },
                  dropoffLocation: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Reservation created" }
        }
      }
    },
    "/api/reservations/{id}": {
      get: {
        tags: ["Reservations"],
        summary: "Get reservation by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Reservation retrieved" }
        }
      },
      put: {
        tags: ["Reservations"],
        summary: "Update reservation",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Reservation updated" }
        }
      }
    },
    "/api/reservations/{id}/cancel": {
      put: {
        tags: ["Reservations"],
        summary: "Cancel reservation",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Reservation cancelled" }
        }
      }
    },
    "/api/contracts": {
      get: {
        tags: ["Contracts"],
        summary: "Get all contracts",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Contracts retrieved" }
        }
      },
      post: {
        tags: ["Contracts"],
        summary: "Create contract",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Contract created" }
        }
      }
    },
    "/api/assurances": {
      get: {
        tags: ["Insurance"],
        summary: "Get all insurance policies",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Insurance policies retrieved" }
        }
      },
      post: {
        tags: ["Insurance"],
        summary: "Create insurance policy",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Insurance created" }
        }
      }
    },
    "/api/constats": {
      get: {
        tags: ["Claims"],
        summary: "Get all claims",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Claims retrieved" }
        }
      },
      post: {
        tags: ["Claims"],
        summary: "Create claim",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Claim created" }
        }
      }
    },
    "/api/feedbacks": {
      get: {
        tags: ["Feedback"],
        summary: "Get all feedback",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Feedback retrieved" }
        }
      },
      post: {
        tags: ["Feedback"],
        summary: "Create feedback",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Feedback created" }
        }
      }
    },
    "/api/promotions": {
      get: {
        tags: ["Promotions"],
        summary: "Get all promotions",
        responses: {
          200: { description: "Promotions retrieved" }
        }
      },
      post: {
        tags: ["Promotions"],
        summary: "Create promotion",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Promotion created" }
        }
      }
    },
    "/api/coupons/verify": {
      post: {
        tags: ["Coupons"],
        summary: "Verify coupon code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: {
                  code: { type: "string", example: "WELCOME10" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Coupon verified" }
        }
      }
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Get all users",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Users retrieved" }
        }
      }
    }
  }
};

// Swagger JSON endpoint (before any middleware)
app.get("/swagger.json", (req, res) => {
  console.log('Swagger JSON endpoint called');
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
const createProxyRoute = (serviceName, servicePrefix = "") => {
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

      const url = `${targetUrl}${servicePrefix}${req.url}`;
      
      console.log(`[Gateway] Proxying ${req.method} ${req.originalUrl} -> ${url}`);
      
      // Forward the request
      const headers = { ...req.headers };
      delete headers['content-length']; // Let axios calculate content length
      delete headers['host']; // Let axios set the host

      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: headers,
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
// Note: Each service may have different internal path structures
// Gateway strips /api/<service> and forwards remaining path + servicePrefix to target

// Auth service: Internal routes /auth/*, /api/v1/users/*, /api/v1/admin/*, etc.
app.use("/api/auth", createProxyRoute("auth", "/auth"));
app.use("/api/admin", createProxyRoute("auth", "/api/v1/admin"));
app.use("/api/users", createProxyRoute("auth", "/api/v1/users"));
app.use("/api/agency", createProxyRoute("auth", "/api/v1/agency"));
app.use("/api/insurance", createProxyRoute("auth", "/api/v1/insurance"));

// Fleet service: Internal routes /api/categories/*, /api/cars/*
app.use("/api/categories", createProxyRoute("fleet", "/api/categories"));
app.use("/api/cars", createProxyRoute("fleet", "/api/cars"));

// Reservation service: Internal routes /api/reservations/*, /api/contracts/*
app.use("/api/reservations", createProxyRoute("reservation", "/api/reservations"));
app.use("/api/contracts", createProxyRoute("reservation", "/api/contracts"));

// Assurance service: Internal routes /api/assurances/*, /api/constats/*
app.use("/api/assurances", createProxyRoute("assurence", "/api/assurances"));
app.use("/api/constats", createProxyRoute("assurence", "/api/constats"));

// Feedback service: Internal routes at root /feedbacks/*
app.use("/api/feedbacks", createProxyRoute("feedback", "/feedbacks"));

// Promotion service: Internal routes /api/promotions/*, /api/coupons/*
app.use("/api/promotions", createProxyRoute("promotion", "/api/promotions"));
app.use("/api/coupons", createProxyRoute("promotion", "/api/coupons"));

// Maintenance service: Internal routes /maintenance/*, /materiel/*, /vehicule/*
app.use("/api/maintenance", createProxyRoute("maintenance", "/maintenance"));
app.use("/api/materiel", createProxyRoute("maintenance", "/materiel"));
app.use("/api/vehicule", createProxyRoute("maintenance", "/vehicule"));

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
