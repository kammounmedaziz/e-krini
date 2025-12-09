# Service Port Allocation

## Port Mapping (3001-3007)
- **3000**: API Gateway
- **3001**: Auth & User Service
- **3002**: Fleet Service (Agency & Fleet Management)
- **3003**: Reservation Service
- **3004**: Assurance & Claims Service
- **3005**: Feedback & Complaints Service
- **3006**: Promotion & Coupon Service
- **3007**: Maintenance Service

## Database Names
- `car-rental-auth` - Auth & User Service
- `car-rental-fleet` - Fleet Service
- `car-rental-reservations` - Reservation Service
- `assurance-claims-db` - Assurance & Claims Service
- `ekrini-feedback` - Feedback & Complaints Service
- `promotion-coupon_db` - Promotion & Coupon Service
- `maintenance` - Maintenance Service

## Service URLs (Development)
```
AUTH_SERVICE_URL=http://localhost:3001
FLEET_SERVICE_URL=http://localhost:3002
RESERVATION_SERVICE_URL=http://localhost:3003
ASSURANCE_SERVICE_URL=http://localhost:3004
FEEDBACK_SERVICE_URL=http://localhost:3005
PROMOTION_SERVICE_URL=http://localhost:3006
MAINTENANCE_SERVICE_URL=http://localhost:3007
```
