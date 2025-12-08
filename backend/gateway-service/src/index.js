import express from "express";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware global
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

const DISCOVERY_URL = "http://localhost:3000/services";

// Récupérer une URL de service depuis le Discovery service
async function getServiceURL(serviceName) {
  try {
    const response = await axios.get(DISCOVERY_URL);
    return response.data[serviceName];
  } catch (err) {
    console.error("❌ Error connecting to Discovery Service:", err.message);
    return null;
  }
}

// Service replace mappings
const serviceReplace = {
  auth: { from: "/api/auth", to: "/api/v1/auth" },
  fleet: { from: "/api/fleet", to: "/api" },
  reservation: { from: "/api/reservation", to: "/api" },
  promotion: { from: "/api/promotion", to: "/api" }
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

  try {
    const result = await axios({
      method: req.method,
      url: targetURL,
      data: req.body,
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Gateway error",
      details: error.message,
    });
  }
}

// Routes du gateway → basées sur le nom des services
app.use("/api/auth", (req, res) => proxyRequest(req, res, "auth"));
app.use("/api/fleet", (req, res) => proxyRequest(req, res, "fleet"));
app.use("/api/reservation", (req, res) => proxyRequest(req, res, "reservation"));
app.use("/api/promotion", (req, res) => proxyRequest(req, res, "promotion"));

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
});