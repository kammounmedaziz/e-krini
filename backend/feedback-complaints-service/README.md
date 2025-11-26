# Feedback & Complaints Service

Backend service for managing user feedback, complaints, and reports in the e-krini car rental platform.

## Features

- Submit feedback, complaints, reports, and suggestions
- Multiple categories (service quality, vehicle issues, payment, etc.)
- Priority levels (low, medium, high, urgent)
- Admin response and resolution workflow
- Internal notes for admin team
- User satisfaction rating
- Comprehensive statistics

## API Endpoints

### User Endpoints

#### Create Feedback/Complaint
```
POST /api/feedback
Authorization: Bearer <token>

Body:
{
  "type": "complaint",
  "category": "vehicle_issue",
  "priority": "high",
  "subject": "Car had mechanical issues",
  "description": "The car I rented had brake problems during my trip...",
  "relatedTo": {
    "type": "reservation",
    "referenceId": "reservation_id_here"
  },
  "isAnonymous": false,
  "contactInfo": {
    "email": "user@example.com",
    "phone": "+1234567890"
  }
}
```

#### Get My Feedback
```
GET /api/feedback/my-feedback?page=1&limit=10&status=pending&type=complaint
Authorization: Bearer <token>
```

#### Get Feedback by ID
```
GET /api/feedback/:id
Authorization: Bearer <token>
```

#### Rate Feedback Resolution
```
PATCH /api/feedback/:id/rate
Authorization: Bearer <token>

Body:
{
  "rating": 5
}
```

#### Delete Own Feedback (pending only)
```
DELETE /api/feedback/:id
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Feedback
```
GET /api/feedback?page=1&limit=10&status=pending&priority=high&type=complaint
Authorization: Bearer <admin_token>
```

#### Update Feedback
```
PATCH /api/feedback/:id
Authorization: Bearer <admin_token>

Body:
{
  "status": "in_progress",
  "priority": "urgent",
  "assignedTo": "admin_user_id"
}
```

#### Respond to Feedback
```
POST /api/feedback/:id/respond
Authorization: Bearer <admin_token>

Body:
{
  "message": "Thank you for bringing this to our attention. We are investigating..."
}
```

#### Resolve Feedback
```
POST /api/feedback/:id/resolve
Authorization: Bearer <admin_token>

Body:
{
  "message": "We have resolved your issue by replacing the vehicle..."
}
```

#### Add Internal Note
```
POST /api/feedback/:id/notes
Authorization: Bearer <admin_token>

Body:
{
  "note": "Contacted user via phone. Arranged compensation."
}
```

#### Get Statistics
```
GET /api/feedback/admin/statistics
Authorization: Bearer <admin_token>
```

## Data Models

### Feedback Types
- `feedback` - General feedback
- `complaint` - User complaints
- `report` - Reports of issues
- `suggestion` - Suggestions for improvement

### Categories
- `service_quality`
- `vehicle_issue`
- `payment_issue`
- `booking_issue`
- `insurance_issue`
- `customer_support`
- `technical_issue`
- `safety_concern`
- `other`

### Priority Levels
- `low`
- `medium`
- `high`
- `urgent`

### Status Values
- `pending` - Newly submitted
- `in_progress` - Being handled
- `resolved` - Issue resolved
- `closed` - Closed with rating
- `rejected` - Rejected/Invalid

## Installation

```bash
cd backend/feedback-complaints-service
npm install
```

## Configuration

Create a `.env` file:
```env
PORT=3007
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ekrini-feedback
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-jwt-secret-key-here
SERVICE_NAME=feedback-complaints-service
```

## Running the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Testing with Postman

1. Import the service endpoints into Postman
2. Set up environment variables for authentication tokens
3. Test user flow: Create → View → Rate
4. Test admin flow: View all → Respond → Resolve
5. Check statistics endpoint

## Port

This service runs on port **3007**
