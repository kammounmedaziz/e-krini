# Auth & User Service

## Purpose
User management, authentication, authorization, and KYC handling.

## Responsibilities
- User registration and login
- JWT token generation and refresh
- OAuth2 integration (Google, Facebook)
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- KYC document upload and verification
- Password reset flows
- User profile management

## Database
MongoDB collection: `users`

## Key Features
- bcrypt password hashing
- JWT with refresh token rotation
- Passport.js for OAuth2
- File upload handling (Multer)
- Email verification

## Environment Variables
See `.env.example` for required configuration.

## Local Development
```bash
npm install
npm run dev
```

## Docker Build
```bash
docker build -t car-rental/auth-user-service .
```
