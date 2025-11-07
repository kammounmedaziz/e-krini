# Review & Support Service

## Purpose
Manage customer reviews, content moderation, and support ticketing.

## Responsibilities
- User reviews and ratings
- Review moderation
- Support ticket management
- Ticket escalation workflows
- Email notifications
- Knowledge base (FAQ)
- Customer satisfaction tracking

## Database
MongoDB collections: `reviews`, `tickets`, `support_conversations`

## Key Features
- Star rating system
- Content moderation (auto and manual)
- Ticket priority and assignment
- Email integration (Nodemailer)
- Sentiment analysis (optional)
- Review verification

## Environment Variables
See `.env.example` for required configuration.

## Local Development
```bash
npm install
npm run dev
```

## Docker Build
```bash
docker build -t car-rental/review-support-service .
```
