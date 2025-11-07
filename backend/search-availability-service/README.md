# Search & Availability Service

## Purpose
Full-text search, vehicle discovery, and availability queries.

## Responsibilities
- Index vehicles from agency-fleet-service
- Full-text search with filters
- Autocomplete and suggestions
- Location-based search
- Real-time availability checks
- Query caching (Redis)
- Search analytics

## Dependencies
- ElasticSearch for indexing
- Redis for caching
- MongoDB for auxiliary data

## Key Features
- ElasticSearch integration
- Redis-based query caching
- Geospatial search
- Advanced filtering (price, category, features)
- Search result ranking

## Environment Variables
See `.env.example` for required configuration.

## Local Development
```bash
npm install
npm run dev
```

## Docker Build
```bash
docker build -t car-rental/search-availability-service .
```
