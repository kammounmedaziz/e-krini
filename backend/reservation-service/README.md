# Reservation Service

## Purpose
Handle booking lifecycle, prevent double-booking, and manage rental policies.

## Responsibilities
- Create and manage reservations
- Prevent double-booking (distributed locks)
- Reservation hold and confirmation
- Cancellation and modification flows
- Digital contract generation
- Calendar synchronization (Google, Outlook)
- Booking policies (cancellation, mileage, fuel)

## Database
MongoDB collection: `reservations`

## Key Features
- Redis distributed locks for concurrency
- Idempotency key support
- Saga orchestration for complex flows
- PDF contract generation
- Calendar API integration
- Event-driven notifications

## Environment Variables
See `.env.example` for required configuration.

## Local Development
```bash
npm install
npm run dev
```

## Docker Build
```bash
docker build -t car-rental/reservation-service .
```
