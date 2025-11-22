# Agency & Fleet Service

## Purpose
Manage car rental agencies and their vehicle fleets.

## Responsibilities
- Agency registration and management
- Vehicle CRUD operations
- Fleet pricing models
- Vehicle availability management
- Agency dashboard data
- Emit events for search indexing

## Database
MongoDB collections: `agencies`, `vehicles`

## Key Features
- Multi-agency support
- Vehicle metadata management
- Dynamic pricing support
- Availability calendars
- Event publishing for search sync

## Environment Variables
See `.env.example` for required configuration.

## Local Development
```bash
npm install
npm run dev
```

## Docker Build
```bash
docker build -t car-rental/agency-fleet-service .
```
