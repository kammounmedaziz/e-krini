# Gateway Service

## Purpose
API Gateway for routing, authentication, rate limiting, and request/response transformation.

## Responsibilities
- Route requests to appropriate microservices
- JWT token validation
- Rate limiting (per user, per IP)
- Request logging and tracing
- CORS handling
- API versioning
- Response compression
- Health check aggregation

## Key Features
- Express-based HTTP server
- JWT middleware for protected routes
- Redis-based rate limiting
- OpenTelemetry integration for tracing
- Prometheus metrics endpoint

## Environment Variables
See `.env.example` for required configuration.

## Local Development
```bash
npm install
npm run dev
```

## Docker Build
```bash
docker build -t car-rental/gateway-service .
```
