# Backend Microservices

This directory contains all backend microservices for the Car Rental Platform.

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| gateway-service | 3000 | API Gateway, routing, auth enforcement |
| auth-user-service | 3001 | Authentication, user management |
| agency-fleet-service | 3002 | Agency & vehicle management |
| search-availability-service | 3003 | Search, filtering, availability |
| reservation-service | 3004 | Booking management |
| payment-billing-service | 3005 | Payments, invoicing |
| review-support-service | 3006 | Reviews, support tickets |

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- MongoDB, Redis, Elasticsearch (via Docker)

### Start All Services with Docker Compose
```bash
# Start infrastructure and all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Start Individual Services (Development)
```bash
# Start only infrastructure
docker-compose up -d mongo redis elasticsearch rabbitmq

# Run a service individually
cd auth-user-service
npm install
npm run dev
```

## Architecture Principles

### Service Independence
- Each service has its own database
- Services communicate via REST APIs
- Event-driven updates via RabbitMQ (optional)

### Shared Components
The `common/` directory contains shared utilities:
- Error handling middleware
- Logging utilities
- Constants and types
- Validation helpers

### Configuration
Each service uses environment variables for configuration.
Copy `.env.example` to `.env` in each service directory.

## Development Guidelines

### Adding a New Endpoint
1. Create route handler in `routes/`
2. Implement business logic in `services/`
3. Add data models in `models/`
4. Write tests in `tests/`
5. Update API documentation

### Error Handling
Use consistent error format:
```javascript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Logging
Use the shared logger from `common/`:
```javascript
import { logger } from '../common/utils/logger.js';

logger.info('User logged in', { userId: user.id });
logger.error('Payment failed', { error, reservationId });
```

## Testing

### Run Tests for All Services
```bash
# Run tests for a specific service
cd auth-user-service
npm test

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

## Deployment

### Build Docker Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build auth-user-service
```

### Push to Registry
```bash
docker tag car-rental/auth-user-service:latest your-registry/car-rental-auth:v1.0.0
docker push your-registry/car-rental-auth:v1.0.0
```

## Monitoring

### Health Checks
All services expose health endpoints:
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Metrics
Prometheus metrics available at:
- `GET /metrics`

### Logs
Structured JSON logs written to stdout.
Configure log aggregation in production.

## Common Issues

### Port Already in Use
```powershell
# PowerShell - Kill process on port
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Database Connection Failed
Ensure MongoDB is running:
```bash
docker-compose ps mongo
```

### Module Not Found
Install dependencies:
```bash
npm install
```

## Resources
- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [API Documentation](../docs/API.md)
- [Development Guide](../docs/DEVELOPMENT.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
