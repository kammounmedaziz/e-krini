# E-Krini Car Rental Platform - Postman Testing Guide (Gateway Architecture)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- All services running: `docker compose up -d`
- Postman application installed

### Setup Steps

1. **Import Collection and Environment**
   - Open Postman
   - Click "Import" button
   - Import `postman_collection.json`
   - Import `postman_environment_local.json` as environment

2. **Select Environment**
   - Click the environment dropdown (top-right)
   - Choose "E-Krini Local Development"

3. **Verify Services are Running**
   - Run "Get Service Registry" request
   - Should return all 7 microservices with their Docker URLs

## 📋 Testing Flow

### 1. Service Discovery
**Start here to verify the microservices architecture:**
1. **Get Service Registry** → Returns all registered services
   - Shows how the discovery service works
   - Confirms all services are properly registered

### 2. Health Checks (via Gateway)
Verify all services are healthy through the gateway:
1. **Gateway Health** → Gateway service status
2. **Auth Service Health** → Authentication service status
3. **Fleet Service Health** → Car fleet service status
4. **Reservation Service Health** → Booking service status

### 3. Authentication (via Gateway)
Test user management through the API Gateway:
1. **Register User** → Create new user account
   - Use unique username/email each time
   - Password: 8+ chars, 1 letter, 1 number, 1 special char

2. **Login User** → Authenticate and get tokens
   - Uses existing test user (testuser3)
   - Automatically saves access_token and refresh_token
   - Console shows token preview

3. **Refresh Token** → Get new access token
   - Uses stored refresh_token
   - Updates access_token automatically

4. **Get User Profile** → Retrieve user information
   - Requires valid access_token

### 4. Fleet Management (via Gateway)
Test car inventory through the gateway:
1. **Get All Cars** → View available cars
   - Returns car list (may be empty initially)
   - Requires authentication

2. **Add New Car** → Add car to fleet
   - Creates new car and saves car_id
   - Console shows new car ID

3. **Get Car by ID** → View specific car details
   - Uses saved car_id

4. **Update Car** → Modify car information
   - Updates existing car data

### 5. Reservation Management (via Gateway)
Test booking system through the gateway:
1. **Create Reservation** → Book a car
   - Uses saved car_id
   - Saves reservation_id automatically

2. **Get User Reservations** → View user's bookings
   - Returns all reservations for current user

3. **Get Reservation by ID** → View specific booking
   - Uses saved reservation_id

### 6. Promotion Management (via Gateway)
Test discount system:
1. **Get All Promotions** → View active promotions
2. **Create Promotion** → Add new discount offer

## 🔧 Architecture Notes

### API Gateway Pattern
- **All API calls** go through `http://localhost:4000/api/*`
- Gateway routes requests to appropriate microservices:
  - `/api/auth/*` → auth-user-service
  - `/api/fleet/*` → fleet-service
  - `/api/reservation/*` → reservation-service
  - `/api/promotion/*` → promotion-coupon-service
- **Service Discovery** at `/services` shows internal Docker URLs

### Authentication Flow
- JWT tokens automatically managed by Postman scripts
- Access tokens expire in 15 minutes
- Refresh tokens valid for 7 days
- All protected endpoints require `Authorization: Bearer {{access_token}}`

## 📝 Sample Test Data

### User Registration
```json
{
  "username": "testuser4",
  "email": "test4@example.com",
  "password": "TestPass123!",
  "role": "client"
}
```

### Car Creation
```json
{
  "immatriculation": "TN5678XY",
  "marque": "BMW",
  "modele": "X3",
  "annee": 2022,
  "kilometrage": 5000,
  "typeCarburant": "Diesel",
  "prixParJour": 80,
  "description": "Luxury SUV",
  "images": [],
  "equipements": ["Leather seats", "Sunroof", "Navigation"],
  "etat": "Disponible"
}
```

### Reservation
```json
{
  "idVehicule": "{{car_id}}",
  "dateDebut": "2025-12-20T09:00:00.000Z",
  "dateFin": "2025-12-22T17:00:00.000Z",
  "lieuPriseEnCharge": "Tunis Downtown",
  "lieuRestitution": "Tunis Downtown",
  "optionsSupplementaires": ["GPS"],
  "prixTotal": 160
}
```

### Promotion
```json
{
  "titre": "Holiday Special",
  "description": "25% off for holiday bookings",
  "pourcentageReduction": 25,
  "dateDebut": "2025-12-20T00:00:00.000Z",
  "dateFin": "2025-12-31T23:59:59.000Z",
  "conditions": "Valid for bookings over 5 days",
  "estActive": true
}
```

## 🎯 Testing Checklist

- [ ] Service registry returns all 7 services
- [ ] All health checks pass (200 OK)
- [ ] User registration works
- [ ] User login saves tokens automatically
- [ ] Token refresh works
- [ ] Can create and retrieve cars
- [ ] Can create and retrieve reservations
- [ ] Can create and retrieve promotions
- [ ] All CRUD operations work through gateway

## 📊 Response Codes

- **200**: Success (GET, PUT, some POST)
- **201**: Created (POST with new resource)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (resource already exists)
- **500**: Internal Server Error

## 🔄 Automated Testing

For automated testing with Newman:

```bash
# Install Newman globally
npm install -g newman

# Run collection tests
newman run postman_collection.json -e postman_environment_local.json

# Run with detailed reporting
newman run postman_collection.json -e postman_environment_local.json \
  --reporters cli,json --reporter-json-export results.json
```

## 📞 Troubleshooting

### Common Issues
- **401 Unauthorized**: Check if access_token is set in environment
- **404 Not Found**: Verify endpoint URL and service is running
- **500 Internal Error**: Check Docker container logs
- **Empty responses**: Database might be empty, add test data first

### Debug Steps
1. Check Docker containers: `docker compose ps`
2. Check service logs: `docker compose logs [service-name]`
3. Verify gateway routing: Test direct service URLs vs gateway URLs
4. Check environment variables: Ensure JWT secrets are set

### Service URLs (Internal)
- Gateway: `http://localhost:4000`
- Auth Service: `http://auth-user-service:3001`
- Fleet Service: `http://fleet-service:3002`
- Reservation Service: `http://reservation-service:3003`
- Discovery Service: `http://discovery-service:3000`

Happy testing! 🎉🚗