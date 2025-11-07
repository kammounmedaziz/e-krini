# Payment & Billing Service

## Purpose
Handle payments, invoicing, fraud detection, and revenue distribution.

## Responsibilities
- Payment processing (Stripe, PayPal)
- Pre-authorization and capture
- Refund management
- Invoice generation
- Fraud detection and scoring
- Revenue split (platform vs agency)
- Webhook handling for payment providers
- Payout management

## Database
MongoDB collections: `payments`, `invoices`, `payouts`

## Key Features
- Stripe and PayPal adapters
- PCI-compliant payment handling
- Automatic invoice generation (PDF)
- Fraud scoring rules
- Webhook verification
- Reconciliation reports

## Environment Variables
See `.env.example` for required configuration.

## Local Development
```bash
npm install
npm run dev
```

## Docker Build
```bash
docker build -t car-rental/payment-billing-service .
```
