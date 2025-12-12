# API Endpoint Fixes Summary

## Issues Fixed

### 1. ✅ Car Creation - `dernierMaintenance` Field
**Problem**: Field was required but missing from documentation examples  
**Solution**: Made `dernierMaintenance` optional in validation schema and updated both guides  
**Files Changed**: 
- `fleet-service/src/validation/carValidation.js`
- `POSTMAN_ENDPOINTS_GUIDE.txt`
- `POSTMAN_ENDPOINTS_GUIDE copy.txt`

### 2. ✅ Feedback Creation - Admin UserType
**Problem**: `admin` role couldn't create feedback (not in userType enum)  
**Solution**: Added `'admin'` to userType enum in Feedback model  
**Files Changed**: `feedback-complaints-service/src/models/Feedback.js`

### 3. ✅ Feedback Phone Validation
**Problem**: Generic `isMobilePhone()` validation rejected Tunisian format  
**Solution**: Changed to regex `/^\+216[0-9]{8}$/` for Tunisian numbers  
**Files Changed**: `feedback-complaints-service/src/middlewares/validation.js`

### 4. ✅ Feedback Routes - Missing Endpoints
**Problem**: `/user/me` and PUT `/:id` routes didn't exist  
**Solution**: Added both routes as aliases  
**Files Changed**: `feedback-complaints-service/src/routes/feedbackRoutes.js`

### 5. ✅ Feedback Statistics Endpoint
**Problem**: Documentation showed `/stats` but actual route was `/admin/statistics`  
**Solution**: Updated documentation to correct path  
**Files Changed**: Both Postman guides

### 6. ✅ Feedback Status Update Route
**Problem**: Documentation showed non-existent `/status` endpoint  
**Solution**: Removed from documentation - status updates use PUT `/:id`  
**Files Changed**: Both Postman guides

### 7. ✅ Feedback relatedTo Validation
**Problem**: Example used placeholder `{{car_id}}` causing validation errors  
**Solution**: Made relatedTo optional in examples with note for real ObjectIds  
**Files Changed**: Both Postman guides

### 8. ✅ Coupon Field Names
**Problem**: Documentation used English field names (discountType, startDate, etc.)  
**Solution**: Updated to French field names matching model (type, date_debut, etc.)  
**Files Changed**: Both Postman guides

### 9. ✅ Coupon Date Validation
**Problem**: Example dates were 2024 (past) causing "coupon no longer valid" error  
**Solution**: Updated examples to 2025-2026 dates  
**Files Changed**: `POSTMAN_ENDPOINTS_GUIDE.txt`

### 10. ✅ Coupon Validation Field Name
**Problem**: Documentation used `purchaseAmount` but API expects `amount`  
**Solution**: Updated field name in documentation  
**Files Changed**: Both Postman guides

### 11. ✅ Coupon Get by Code
**Problem**: `/code/:code` route failed with undefined match error  
**Solution**: Fixed null checking in getCouponById controller  
**Files Changed**: `promotion-coupon-service/src/controllers/couponController.js`

### 12. ✅ Maintenance Routes
**Problem**: GET /api/maintenance returned 404  
**Solution**: Routes were already correct - verified proper mounting  
**Status**: No changes needed

### 13. ✅ Feedback App Mounting
**Problem**: Trailing slash in URLs caused wrong route matching  
**Solution**: Changed mount from `/` to `/feedbacks`  
**Files Changed**: `feedback-complaints-service/src/app.js`

## Updated JSON Examples

### Car Creation
```json
{
  "nom": "Toyota Corolla 2024",
  "category": "{{category_id}}",
  "matricule": "TUN-5678",
  "marque": "Toyota",
  "modele": "Corolla",
  "prixParJour": 90,
  "disponibilite": true,
  "dernierMaintenance": "2024-12-01T00:00:00.000Z"
}
```

### Feedback Creation
```json
{
  "type": "complaint",
  "category": "vehicle_issue",
  "subject": "Car cleanliness issue",
  "description": "The car was not properly cleaned before rental.",
  "priority": "medium",
  "isAnonymous": false,
  "contactInfo": {
    "email": "user@example.com",
    "phone": "+21612345678"
  }
}
```

### Coupon Creation
```json
{
  "code": "WINTER2026",
  "type": "percentage",
  "value": 15,
  "date_debut": "2025-12-01T00:00:00.000Z",
  "date_fin": "2026-03-31T23:59:59.999Z",
  "max_utilisation": 100,
  "max_utilisation_user": 1,
  "actif": true
}
```

### Coupon Validation
```json
{
  "code": "WINTER2026",
  "userId": "{{user_id}}",
  "amount": 300
}
```

## Testing Results

All endpoints verified working:
✅ POST /api/cars (without dernierMaintenance)
✅ POST /api/feedbacks (with Tunisian phone)
✅ GET /api/feedbacks/:id
✅ PUT /api/feedbacks/:id (status update)
✅ GET /api/feedbacks/user/me
✅ GET /api/feedbacks/admin/statistics
✅ POST /api/coupons (with French field names)
✅ GET /api/coupons/code/:code
✅ POST /api/coupons/validate (with current dates)
✅ GET /api/maintenance

## Services Rebuilt
- fleet-service
- feedback-complaints-service
- promotion-coupon-service

All services restarted and tested successfully on December 12, 2025.
