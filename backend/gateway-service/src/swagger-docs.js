/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and Authorization
 *   - name: User
 *     description: User Profile Management
 *   - name: Admin
 *     description: Administrative Operations
 *   - name: Fleet
 *     description: Vehicle and Category Management
 *   - name: Reservation
 *     description: Booking and Contract Management
 *   - name: Feedback
 *     description: User Feedback and Complaints
 *   - name: Promotion
 *     description: Promotions and Coupons
 *   - name: Maintenance
 *     description: Vehicle Maintenance
 *   - name: Assurance
 *     description: Insurance Management
 *   - name: Agency
 *     description: Agency Profile Management
 *   - name: Insurance
 *     description: Insurance Company Profile Management
 *   - name: Service Discovery
 *     description: Microservices Registry
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 * 
 * /api/auth/auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 * 
 * /api/auth/auth/login-2fa:
 *   post:
 *     summary: Login with 2FA
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 * 
 * /api/auth/auth/login-face:
 *   post:
 *     summary: Login with Face Authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image
 *     responses:
 *       200:
 *         description: Login successful
 * 
 * /api/auth/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 * 
 * /api/auth/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 * 
 * /api/auth/api/v1/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 * 
 * /api/auth/api/v1/users/profile/picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Picture uploaded
 * 
 * /api/auth/api/v1/admin/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 * 
 * /api/auth/api/v1/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     summary: Update user (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 * 
 * /api/auth/api/v1/admin/users/{userId}/ban:
 *   post:
 *     summary: Ban user (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User banned
 * 
 * /api/auth/api/v1/admin/users/{userId}/unban:
 *   post:
 *     summary: Unban user (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unbanned
 * 
 * /api/auth/api/v1/admin/users/{userId}/role:
 *   put:
 *     summary: Change user role (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, agency]
 *     responses:
 *       200:
 *         description: Role updated
 * 
 * /api/auth/api/v1/admin/agencies:
 *   get:
 *     summary: Get all agencies (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of agencies
 * 
 * /api/auth/api/v1/admin/agencies/{agencyId}/approve:
 *   post:
 *     summary: Approve agency (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agency approved
 * 
 * /api/auth/api/v1/admin/agencies/{agencyId}/reject:
 *   post:
 *     summary: Reject agency (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agency rejected
 * 
 * /api/auth/api/v1/kyc/submit:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idCardFront:
 *                 type: string
 *                 format: binary
 *               idCardBack:
 *                 type: string
 *                 format: binary
 *               drivingLicense:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: KYC submitted
 * 
 * /api/auth/api/v1/kyc/status:
 *   get:
 *     summary: Get KYC status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status
 * 
 * /api/auth/api/v1/kyc/admin/pending:
 *   get:
 *     summary: Get pending KYC requests (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending KYC
 * 
 * /api/auth/api/v1/kyc/admin/{userId}/review:
 *   post:
 *     summary: Review KYC (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC reviewed
 * 
 * /api/fleet/api/cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Fleet]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           description: Category ID
 *     responses:
 *       200:
 *         description: List of cars
 *   post:
 *     summary: Create a new car (Admin/Agency)
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - category
 *               - prixParJour
 *               - matricule
 *               - modele
 *               - marque
 *               - dernierMaintenance
 *             properties:
 *               nom:
 *                 type: string
 *               category:
 *                 type: string
 *                 description: Category ID
 *               prixParJour:
 *                 type: number
 *               matricule:
 *                 type: string
 *               modele:
 *                 type: string
 *               marque:
 *                 type: string
 *               dernierMaintenance:
 *                 type: string
 *                 format: date-time
 *               disponibilite:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Car created
 * 
 * /api/fleet/api/cars/{id}:
 *   get:
 *     summary: Get car by ID
 *     tags: [Fleet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car details
 *   patch:
 *     summary: Update car (Admin/Agency)
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car updated
 *   delete:
 *     summary: Delete car (Admin)
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted
 * 
 * /api/fleet/api/cars/search:
 *   get:
 *     summary: Search cars
 *     tags: [Fleet]
 *     parameters:
 *       - in: query
 *         name: make
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Search results
 * 
 * /api/fleet/api/cars/availability:
 *   post:
 *     summary: Check car availability
 *     tags: [Fleet]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               carIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Availability status
 * 
 * /api/fleet/api/categories:
 *   get:
 *     summary: Get all car categories
 *     tags: [Fleet]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create category (Admin/Agency)
 *     tags: [Fleet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 * 
 * /api/reservation/api/reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - carId
 *               - startDate
 *               - endDate
 *             properties:
 *               clientId:
 *                 type: string
 *               carId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               insuranceType:
 *                 type: string
 *                 enum: [basic, standard, premium, comprehensive]
 *               carModel:
 *                 type: string
 *               carBrand:
 *                 type: string
 *               dailyRate:
 *                 type: number
 *               promoCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reservation created
 * 
 * /api/reservation/api/contracts:
 *   post:
 *     summary: Create a contract
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *             properties:
 *               reservationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract created
 * 
 * /api/reservation/api/contracts/{contractId}:
 *   get:
 *     summary: Get contract details
 *     tags: [Reservation]
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract details
 * 
 * /api/reservation/api/contracts/{contractId}/sign:
 *   post:
 *     summary: Sign contract
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - signer
 *               - signature
 *             properties:
 *               signer:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contract signed
 * 
 * /api/feedback/:
 *   post:
 *     summary: Create feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - category
 *               - subject
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [feedback, complaint, report, suggestion]
 *               category:
 *                 type: string
 *                 enum: [service_quality, vehicle_issue, payment_issue, booking_issue, insurance_issue, customer_support, technical_issue, safety_concern, other]
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               relatedTo:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [reservation, vehicle, agency, insurance, payment, user, none]
 *                   referenceId:
 *                     type: string
 *               isAnonymous:
 *                 type: boolean
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       201:
 *         description: Feedback created
 *   get:
 *     summary: Get all feedback (Admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, closed, rejected]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [feedback, complaint, report, suggestion]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, priority, status]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of feedback
 * 
 * /api/feedback/{id}:
 *   get:
 *     summary: Get feedback by ID
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback details
 *   patch:
 *     summary: Update feedback (Admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Feedback updated
 *   delete:
 *     summary: Delete feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback deleted
 * 
 * /api/feedback/{id}/respond:
 *   post:
 *     summary: Respond to feedback (Admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response added
 * 
 * /api/feedback/{id}/resolve:
 *   post:
 *     summary: Resolve feedback (Admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: resolved
 *     responses:
 *       200:
 *         description: Feedback resolved
 * 
 * /api/feedback/{id}/rate:
 *   patch:
 *     summary: Rate feedback resolution
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating submitted
 * 
 * /api/feedback/admin/statistics:
 *   get:
 *     summary: Get feedback statistics (Admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedback statistics
 * 
 * /api/feedback/my-feedback:
 *   get:
 *     summary: Get my feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's feedback list
 * 
 * /api/promotion/api/promotions:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotion]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: categorie_voiture
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of promotions
 *   post:
 *     summary: Create promotion
 *     tags: [Promotion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - type
 *               - value
 *               - date_debut
 *               - date_fin
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, amount]
 *               value:
 *                 type: number
 *               categorie_voiture:
 *                 type: string
 *               id_voiture:
 *                 type: number
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *               actif:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Promotion created
 * 
 * /api/promotion/api/promotions/active/list:
 *   get:
 *     summary: Get active promotions
 *     tags: [Promotion]
 *     responses:
 *       200:
 *         description: List of active promotions
 * 
 * /api/promotion/api/coupons/verify:
 *   post:
 *     summary: Verify coupon
 *     tags: [Promotion]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon valid
 * 
 * /api/promotion/api/coupons/apply:
 *   post:
 *     summary: Apply coupon
 *     tags: [Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coupon applied
 * 
 * /api/promotion/api/coupons:
 *   get:
 *     summary: Get all coupons (Admin/Agency)
 *     tags: [Promotion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of coupons
 *   post:
 *     summary: Create coupon (Admin)
 *     tags: [Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - type
 *               - value
 *               - date_debut
 *               - date_fin
 *             properties:
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, amount]
 *               value:
 *                 type: number
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *               max_utilisation:
 *                 type: integer
 *               min_achat:
 *                 type: number
 *               actif:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Coupon created
 * 
 * /api/promotion/api/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID (Admin/Agency)
 *     tags: [Promotion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon details
 *   put:
 *     summary: Update coupon (Admin)
 *     tags: [Promotion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               value:
 *                 type: number
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *               max_utilisation:
 *                 type: integer
 *               min_achat:
 *                 type: number
 *               actif:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coupon updated
 *   delete:
 *     summary: Delete coupon (Admin)
 *     tags: [Promotion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted
 * 
 * /api/maintenance/api/maintenance/show:
 *   get:
 *     summary: Get all maintenance records
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance records
 * 
 * /api/maintenance/api/maintenance/add:
 *   post:
 *     summary: Add maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idVehicule
 *               - typeMaintenance
 *               - dateMaintenance
 *               - coutMainOeuvre
 *             properties:
 *               idVehicule:
 *                 type: string
 *               typeMaintenance:
 *                 type: string
 *                 enum: [Préventive, Corrective, Révision, Réparation, Vidange, Contrôle technique]
 *               dateMaintenance:
 *                 type: string
 *                 format: date-time
 *               coutMainOeuvre:
 *                 type: number
 *               description:
 *                 type: string
 *               etat:
 *                 type: string
 *                 enum: [planifiée, en cours, terminée, annulée]
 *               idMateriaux:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     materiel:
 *                       type: string
 *                     quantiteUtilisee:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Maintenance added
 * 
 * /api/maintenance/api/maintenance/showById/{id}:
 *   get:
 *     summary: Get maintenance by ID
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance details
 * 
 * /api/maintenance/api/maintenance/update/{id}:
 *   put:
 *     summary: Update maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coutMainOeuvre:
 *                 type: number
 *               description:
 *                 type: string
 *               etat:
 *                 type: string
 *                 enum: [planifiée, en cours, terminée, annulée]
 *               typeMaintenance:
 *                 type: string
 *               dateMaintenance:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Maintenance updated
 * 
 * /api/maintenance/api/maintenance/delete/{id}:
 *   delete:
 *     summary: Delete maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance deleted
 * 
 * /api/maintenance/api/maintenance/vehicule/{idVehicule}:
 *   get:
 *     summary: Get maintenance by vehicle ID
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idVehicule
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of maintenance records
 * 
 * /api/maintenance/api/maintenance/type/{type}:
 *   get:
 *     summary: Get maintenance by type
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of maintenance records
 * 
 * /api/maintenance/api/maintenance/historique/{idVehicule}:
 *   get:
 *     summary: Get maintenance history for vehicle
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idVehicule
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance history
 * 
 * /api/maintenance/api/maintenance/couts/{id}:
 *   get:
 *     summary: Get maintenance costs
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cost details
 * 
 * /api/assurance/api/assurances:
 *   get:
 *     summary: Get all insurance policies
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of policies
 *   post:
 *     summary: Create insurance policy
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyNumber
 *               - insuranceType
 *               - startDate
 *               - endDate
 *               - premiumAmount
 *               - coverageDetails
 *             properties:
 *               policyNumber:
 *                 type: string
 *               vehicleId:
 *                 type: string
 *               insuranceType:
 *                 type: string
 *                 enum: [comprehensive, collision, liability, theft, fire, third-party]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               premiumAmount:
 *                 type: number
 *               coverageDetails:
 *                 type: string
 *               coverageLimit:
 *                 type: number
 *               deductible:
 *                 type: number
 *     responses:
 *       201:
 *         description: Policy created
 * 
 * /api/assurance/api/assurances/{id}:
 *   get:
 *     summary: Get policy by ID
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy details
 *   put:
 *     summary: Update policy
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               insuranceType:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               premiumAmount:
 *                 type: number
 *               coverageDetails:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, expired, cancelled, pending]
 *     responses:
 *       200:
 *         description: Policy updated
 * 
 * /api/assurance/api/assurances/user/me:
 *   get:
 *     summary: Get my policies
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's policies
 * 
 * /api/assurance/api/assurances/expiring/{days}:
 *   get:
 *     summary: Get expiring policies
 *     tags: [Assurance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: days
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of expiring policies
 * 
 * /api/auth/api/v1/agency/profile:
 *   get:
 *     summary: Get agency profile
 *     tags: [Agency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agency profile
 *   post:
 *     summary: Create or update agency profile
 *     tags: [Agency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *   put:
 *     summary: Update agency profile
 *     tags: [Agency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 * 
 * /api/auth/api/v1/agency/documents:
 *   post:
 *     summary: Upload agency documents
 *     tags: [Agency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               license:
 *                 type: string
 *                 format: binary
 *               registration:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded
 * 
 * /api/auth/api/v1/agency/dashboard/stats:
 *   get:
 *     summary: Get agency dashboard stats
 *     tags: [Agency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 * 
 * /api/auth/api/v1/agency/all:
 *   get:
 *     summary: Get all agencies
 *     tags: [Agency]
 *     responses:
 *       200:
 *         description: List of agencies
 * 
 * /api/auth/api/v1/agency/{id}:
 *   get:
 *     summary: Get agency by ID
 *     tags: [Agency]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agency details
 * 
 * /api/auth/api/v1/insurance/profile:
 *   get:
 *     summary: Get insurance company profile
 *     tags: [Insurance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insurance profile
 *   post:
 *     summary: Create or update insurance profile
 *     tags: [Insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *   put:
 *     summary: Update insurance profile
 *     tags: [Insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 * 
 * /api/auth/api/v1/insurance/documents:
 *   post:
 *     summary: Upload insurance documents
 *     tags: [Insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               license:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded
 * 
 * /api/auth/api/v1/insurance/dashboard/stats:
 *   get:
 *     summary: Get insurance dashboard stats
 *     tags: [Insurance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 * 
 * /api/auth/api/v1/insurance/all:
 *   get:
 *     summary: Get all insurance companies
 *     tags: [Insurance]
 *     responses:
 *       200:
 *         description: List of insurance companies
 * 
 * /api/auth/api/v1/insurance/{id}:
 *   get:
 *     summary: Get insurance company by ID
 *     tags: [Insurance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insurance company details
 */
