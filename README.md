# E-Krini Car Rental Platform 🚗

A comprehensive microservices-based car rental platform with advanced features including face authentication, real-time reservations, insurance management, and fleet tracking.

## 🏗️ Architecture

E-Krini follows a **microservices architecture** with the following components:

### Services
- **Frontend**: React + Vite + TailwindCSS (Port: 5173)
- **API Gateway**: Request routing and rate limiting (Port: 4000)
- **Auth Service**: User authentication, JWT tokens, OAuth2 (Port: 3001)
- **Fleet Service**: Vehicle and category management (Port: 3002)
- **Reservation Service**: Booking and contract management (Port: 3003)
- **Assurance Service**: Insurance and accident reports (Port: 3004)
- **Feedback Service**: Customer feedback and complaints (Port: 3005)
- **Promotion Service**: Coupons and promotions (Port: 3006)
- **Maintenance Service**: Vehicle maintenance and parts inventory (Port: 3007)
- **Discovery Service**: Service registry (Port: 3500)
- **AI Backend**: Python Flask for face authentication (Port: 5000)

### Infrastructure
- **MongoDB**: Primary database for all services
- **Redis**: Rate limiting and caching


## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** 18+ (for local development)
- **Python** 3.9+ (for AI backend)
- **MongoDB** 6.0+
- **Redis** 7.0+

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/kammounmedaziz/e-krini.git
cd e-krini
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.example .env

# Setup each service
cd backend/auth-user-service && cp .env.example .env
cd ../fleet-service && cp .env.example .env
cd ../reservation-service && cp .env.example .env
# ... repeat for other services
```

### 3. Start All Services with Docker
```bash
cd backend
docker-compose up -d
```

This will start all 11 containers:
- MongoDB
- Redis
- Gateway Service
- Discovery Service
- 7 Microservices
- AI Backend

### 4. Verify Services
```bash
# Check all containers are running
docker-compose ps

# Check service health
./check-services.sh
```

### 5. Access the Platform
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:4000
- **Swagger UI**: http://localhost:4000/api-docs

## 📚 API Documentation

### Complete API Guide
See **[POSTMAN_ENDPOINTS_GUIDE.txt](backend/POSTMAN_ENDPOINTS_GUIDE.txt)** for comprehensive API documentation with 90+ endpoints across 16 service categories.

### Quick Reference

#### Authentication
```bash
# Login
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}
```

#### Create Car
```bash
POST http://localhost:4000/api/cars
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "nom": "Toyota Corolla 2024",
  "category": "{{category_id}}",
  "matricule": "TUN-5678",
  "marque": "Toyota",
  "modele": "Corolla",
  "prixParJour": 90,
  "disponibilite": true
}
```

#### Create Reservation
```bash
POST http://localhost:4000/api/reservations
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "clientId": "{{client_id}}",
  "carId": "{{car_id}}",
  "startDate": "2024-12-25T00:00:00.000Z",
  "endDate": "2024-12-30T00:00:00.000Z",
  "insuranceType": "premium",
  "carModel": "Corolla",
  "carBrand": "Toyota",
  "dailyRate": 90
}
```

### Service Categories

1. **Authentication** (8 endpoints): Register, login, 2FA, password reset
2. **User Profile** (4 endpoints): Profile management, password change, profile picture
3. **Admin** (6 endpoints): User management, KYC review
4. **Agency Profile** (4 endpoints): Agency registration and management
5. **Insurance Profile** (3 endpoints): Insurance company management
6. **Fleet/Cars** (10 endpoints): Vehicle CRUD, search, availability
7. **Categories** (5 endpoints): Vehicle category management
8. **Reservations** (14 endpoints): Booking, cancellation, statistics
9. **Contracts** (11 endpoints): Contract generation, signing, PDF download
10. **Assurance** (7 endpoints): Insurance policies
11. **Constat** (6 endpoints): Accident reports
12. **Feedback** (7 endpoints): Customer feedback and complaints
13. **Promotions** (6 endpoints): Marketing promotions
14. **Coupons** (7 endpoints): Discount coupons
15. **Maintenance** (6 endpoints): Vehicle maintenance tracking
16. **Materiel** (7 endpoints): Parts and materials inventory

## 🔧 Development

### Running Individual Services

```bash
# Auth Service
cd backend/auth-user-service
npm install
npm run dev

# Fleet Service
cd backend/fleet-service
npm install
npm run dev

# ... similar for other services
```

### Testing

```bash
# Run tests for a service
cd backend/auth-user-service
npm test

# Run with coverage
npm run test:coverage

# Integration tests
cd backend
docker-compose -f docker-compose.test.yml up -d
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🛠️ Project Structure

```
e-krini/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API client
│   │   └── context/         # React context
│   └── package.json
├── backend/
│   ├── gateway-service/     # API Gateway
│   ├── discovery-service/   # Service registry
│   ├── auth-user-service/   # Authentication
│   │   ├── src/
│   │   │   ├── controllers/ # Route handlers
│   │   │   ├── models/      # Mongoose schemas
│   │   │   ├── routes/      # Express routes
│   │   │   ├── services/    # Business logic
│   │   │   ├── middlewares/ # Custom middleware
│   │   │   └── utils/       # Helper functions
│   │   └── tests/           # Jest tests
│   ├── fleet-service/       # Vehicle management
│   ├── reservation-service/ # Booking management
│   ├── assurance-service/   # Insurance
│   ├── feedback-complaints-service/
│   ├── promotion-coupon-service/
│   ├── maintenance-service/ # Maintenance & materials
│   ├── docker-compose.yml
│   └── POSTMAN_ENDPOINTS_GUIDE.txt
└── AI-backend/              # Python Flask face auth
    ├── face_auth/
    └── face_auth_api.py
```

## 🔐 Authentication & Security

- **JWT Tokens**: Access tokens (15min) + Refresh tokens (7 days)
- **Passport.js**: OAuth2 integration (Google, Facebook)
- **Face Authentication**: AI-powered facial recognition
- **Rate Limiting**: Redis-based API rate limiting
- **CORS**: Configured for production origins
- **Helmet**: Security headers
- **Input Validation**: Express-validator + Yup

## 🗄️ Database Schema

Each service maintains its own MongoDB database:

- **auth-user-service**: Users, KYC documents, sessions
- **fleet-service**: Cars, categories, maintenance records
- **reservation-service**: Reservations, contracts
- **assurance-service**: Insurance policies, accident reports
- **feedback-complaints-service**: Feedback, complaints
- **promotion-coupon-service**: Promotions, coupons
- **maintenance-service**: Maintenance records, materials inventory

## 🌐 API Gateway Routes

The gateway proxies requests to microservices:

```
/api/auth/*         → auth-user-service:3001
/api/users/*        → auth-user-service:3001
/api/admin/*        → auth-user-service:3001
/api/cars/*         → fleet-service:3002
/api/categories/*   → fleet-service:3002
/api/reservations/* → reservation-service:3003
/api/contracts/*    → reservation-service:3003
/api/assurances/*   → assurance-service:3004
/api/constats/*     → assurance-service:3004
/api/feedbacks/*    → feedback-complaints-service:3005
/api/promotions/*   → promotion-coupon-service:3006
/api/coupons/*      → promotion-coupon-service:3006
/api/maintenance/*  → maintenance-service:3007
/api/materiel/*     → maintenance-service:3007
```

## 📊 Monitoring & Logging

- **Winston**: Structured logging across all services
- **Health Checks**: `/health` endpoint on every service
- **Service Discovery**: Automatic service registration
- **Error Tracking**: Centralized error logging

## 🧪 Testing

### API Testing with Postman

1. Import the Postman collection from `backend/POSTMAN_ENDPOINTS_GUIDE.txt`
2. Create environment with variables:
   - `base_url`: http://localhost:4000
   - `access_token`: [Set after login]
   - `admin_token`: [Set after admin login]

3. Test authentication flow:
   ```
   Login → Copy accessToken → Set as admin_token → Test protected endpoints
   ```

### Tested Endpoints (All Passing ✅)

- **Authentication**: Login, register, refresh, password reset
- **Fleet**: Car CRUD, categories, availability checking
- **Reservations**: Create, update, cancel, confirm
- **Feedback**: Create with Tunisian phone format, status updates
- **Coupons**: Create with French fields, validation
- **Maintenance**: Add records with past dates, correct enums
- **Materiel**: Full updates, stock replenishment

## 🐛 Common Issues & Solutions

### Issue: Services can't connect to MongoDB
**Solution**: Ensure MongoDB container is running and check connection strings in `.env`

### Issue: CORS errors from frontend
**Solution**: Verify `CORS_ORIGIN` in gateway service `.env` includes `http://localhost:5173`

### Issue: JWT token expired
**Solution**: Use the refresh token endpoint to get a new access token

### Issue: Car creation fails with "dernierMaintenance required"
**Solution**: `dernierMaintenance` is optional. Omit it or provide a valid ISO date

### Issue: Feedback phone validation fails
**Solution**: Use Tunisian format: `+216XXXXXXXX` (e.g., `+21612345678`)

### Issue: Coupon validation fails
**Solution**: Ensure coupon dates (`date_debut`, `date_fin`) include current date

### Issue: Materiel update requires all fields
**Solution**: Include all required fields (`nom`, `quantiteDisponible`, `prixUnitaire`) or use `/api/materiel/reapprovisionner/:id` for stock-only updates

## 🚀 Deployment

### Docker Production Build

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```env
NODE_ENV=production
MONGODB_URI=mongodb://production-host:27017
JWT_SECRET=<strong-secret-key>
REDIS_URL=redis://production-redis:6379
CORS_ORIGIN=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Coding Standards

- **ES Modules**: Use `import/export` syntax
- **Error Handling**: Consistent JSON format `{success: false, message: "...", error: {...}}`
- **Logging**: Use Winston logger from `backend/common/utils/logger.js`
- **Validation**: Express-validator for input, Mongoose for schema
- **Tests**: Jest with minimum 80% coverage
- **Linting**: ESLint + Prettier configuration

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Lead Developer**: Aziz Kammoun
- **Repository**: [github.com/kammounmedaziz/e-krini](https://github.com/kammounmedaziz/e-krini)

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the [API Documentation](backend/POSTMAN_ENDPOINTS_GUIDE.txt)
- Review the [API Fixes Summary](backend/API_FIXES_SUMMARY.md)

---

**Built with ❤️ for the E-Krini Car Rental Platform**
