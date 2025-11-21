# Car Rental Platform - AI Coding Guidelines

## Architecture Overview
This is a microservices-based car rental platform with:
- **Frontend**: React + Vite + TailwindCSS (`frontend/`)
- **Backend Services**: Node.js Express microservices with individual MongoDB databases
- **API Gateway**: Routes requests to services (`backend/gateway-service/`)
- **AI Backend**: Python Flask for face authentication (`AI-backend/`)
- **Infrastructure**: MongoDB, Redis, Elasticsearch, RabbitMQ via Docker Compose

Services communicate via HTTP through the gateway. Each service owns its data.

## Service Structure Pattern
Follow `backend/auth-user-service/src/` as the template:
- `app.js`: Main Express app with middleware setup
- `config/`: Database connections, environment config
- `controllers/`: Route handlers
- `models/`: Mongoose schemas
- `routes/`: Express routes
- `services/`: Business logic
- `utils/`: Helper functions
- `middlewares/`: Custom middleware
- `tests/`: Jest unit tests

## Key Conventions
- **Modules**: ES modules (`"type": "module"` in package.json)
- **Error Handling**: Consistent JSON format `{success: false, message: "...", error: {...}}`
- **Logging**: Use winston from `backend/common/utils/logger.js`
- **Validation**: express-validator for input validation
- **Auth**: JWT tokens with refresh rotation; Passport.js for OAuth2
- **Database**: Mongoose for MongoDB; each service has isolated collections
- **Health Checks**: `/health` endpoints for all services

## Development Workflows
- **Start All Services**: `docker-compose up -d` (from `backend/`)
- **Individual Service Dev**: `cd backend/service-name && npm run dev` (nodemon)
- **Testing**: `npm test` (Jest with coverage)
- **Linting**: `npm run lint` (ESLint)
- **Formatting**: `npm run format` (Prettier)
- **Integration Tests**: `docker-compose -f docker-compose.test.yml up -d`

## Integration Points
- **Gateway Routing**: See `backend/gateway-service/src/index.js` for proxy setup
- **Cross-Service Calls**: Services call each other via gateway URLs (e.g., `AUTH_SERVICE_URL`)
- **Shared Code**: Import from `backend/common/` for utilities, middleware, types
- **Face Auth**: POST to `AI-backend` endpoints for registration/login
- **Frontend API**: Axios calls to gateway at `http://localhost:3000/api/*`

## Environment Setup
- Copy `.env.example` to `.env` in each service
- Required: MongoDB, Redis for gateway rate limiting
- Optional: Elasticsearch for search, RabbitMQ for events

Reference: `backend/docker-compose.yml` for full service dependencies.