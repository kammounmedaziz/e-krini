# Admin Dashboard - Data Flow Architecture

## Overview
The admin dashboard now fetches **real data** from the backend instead of using static mock data.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         AdminDashboard.jsx (Main Dashboard)             │   │
│  │                                                           │   │
│  │  State:                                                   │   │
│  │  - loading: boolean                                       │   │
│  │  - statistics: object                                     │   │
│  │  - recentUsers: array                                     │   │
│  │  - error: string                                          │   │
│  │                                                           │   │
│  │  Effects:                                                 │   │
│  │  useEffect(() => {                                        │   │
│  │    fetchDashboardData()  ─────────┐                      │   │
│  │  }, [])                            │                      │   │
│  └────────────────────────────────────┼──────────────────────┘   │
│                                       │                           │
│  ┌────────────────────────────────────▼──────────────────────┐   │
│  │           fetchDashboardData()                            │   │
│  │                                                            │   │
│  │  1. adminAPI.getUserStatistics()  ────┐                   │   │
│  │  2. adminAPI.getAllUsers({...})  ─────┼─┐                 │   │
│  │                                        │ │                 │   │
│  │  Sets: statistics, recentUsers        │ │                 │   │
│  └────────────────────────────────────────┼─┼─────────────────┘   │
└─────────────────────────────────────────┼─┼─────────────────────┘
                                          │ │
                    ┌─────────────────────┘ │
                    │  ┌────────────────────┘
                    │  │
┌───────────────────▼──▼─────────────────────────────────────────┐
│                    API LAYER (Axios)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /frontend/src/api/index.js                                     │
│                                                                   │
│  export const adminAPI = {                                       │
│    getUserStatistics: async () => {                             │
│      const response = await api.get('/admin/users/statistics'); │
│      return response.data;                                      │
│    },                                                            │
│                                                                   │
│    getAllUsers: async (params) => {                             │
│      const response = await api.get('/admin/users', { params });│
│      return response.data;                                      │
│    },                                                            │
│    ...                                                           │
│  }                                                               │
│                                                                   │
│  Interceptors:                                                   │
│  - Request: Adds Authorization Bearer token                     │
│  - Response: Handles 401 errors & token refresh                 │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                 BACKEND (Express.js + MongoDB)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /backend/auth-user-service/src/routes/admin.js                 │
│                                                                   │
│  router.get('/users/statistics', getUserStatistics);            │
│  router.get('/users', getAllUsers);                             │
│                                                                   │
│  Middleware Chain:                                               │
│  1. authMiddleware (verify JWT token)                           │
│  2. adminMiddleware (check role === 'admin')                    │
│  3. Controller function                                          │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│            CONTROLLERS (Business Logic)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /backend/auth-user-service/src/controllers/adminController.js  │
│                                                                   │
│  getUserStatistics():                                            │
│  ├─ Count total users                                            │
│  ├─ Count by role (client, admin, agency)                       │
│  ├─ Count by KYC status (pending, approved, rejected)           │
│  ├─ Count banned/active users                                    │
│  ├─ Count new users (last 30 days)                              │
│  └─ Calculate registration trend (last 7 days)                   │
│                                                                   │
│  getAllUsers():                                                  │
│  ├─ Build query filters (search, role, KYC, banned)             │
│  ├─ Apply pagination (skip/limit)                               │
│  ├─ Sort results                                                 │
│  ├─ Exclude sensitive fields (password, tokens)                 │
│  └─ Return with pagination metadata                              │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ MongoDB Queries
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Collection: users                                               │
│                                                                   │
│  Document Schema:                                                │
│  {                                                                │
│    _id: ObjectId,                                                │
│    username: String,                                             │
│    email: String,                                                │
│    role: String (client|admin|agency),                          │
│    kycStatus: String (pending|approved|rejected),               │
│    isBanned: Boolean,                                            │
│    isActive: Boolean,                                            │
│    createdAt: Date,                                              │
│    lastLoginAt: Date,                                            │
│    loginCount: Number,                                           │
│    ...                                                            │
│  }                                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## API Response Examples

### GET /api/v1/admin/users/statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 2,
      "totalClients": 1,
      "totalAdmins": 1,
      "totalAgencies": 0,
      "bannedUsers": 0,
      "activeUsers": 2,
      "newUsersLast30Days": 2
    },
    "kyc": {
      "pending": 2,
      "approved": 0,
      "rejected": 0
    },
    "registrationTrend": [
      { "date": "2025-11-14", "count": 0 },
      { "date": "2025-11-15", "count": 0 },
      { "date": "2025-11-16", "count": 0 },
      { "date": "2025-11-17", "count": 0 },
      { "date": "2025-11-18", "count": 0 },
      { "date": "2025-11-19", "count": 0 },
      { "date": "2025-11-20", "count": 2 }
    ]
  },
  "message": "Statistics retrieved successfully"
}
```

### GET /api/v1/admin/users?page=1&limit=5

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "691f1333232eb282c653d3d6",
        "username": "admin",
        "email": "admin@ekrini.com",
        "role": "admin",
        "kycStatus": "pending",
        "isBanned": false,
        "isActive": true,
        "lastLoginAt": "2025-11-20T13:27:03.691Z",
        "loginCount": 3,
        "createdAt": "2025-11-20T13:10:11.190Z",
        "updatedAt": "2025-11-20T13:27:03.691Z"
      },
      {
        "_id": "691eef4d8c2eea8466529c89",
        "username": "medazizkammoun",
        "email": "kammounaziz12@gmail.com",
        "role": "client",
        "kycStatus": "pending",
        "isBanned": false,
        "isActive": true,
        "faceAuthEnabled": true,
        "createdAt": "2025-11-20T11:45:17.123Z",
        "updatedAt": "2025-11-20T11:45:17.123Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalUsers": 2,
      "limit": 5,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "message": "Users retrieved successfully"
}
```

## Component Rendering Flow

```
AdminDashboard
├── Loading State (if loading && !statistics)
│   └── Skeleton Cards (4 cards with pulse animation)
│
├── Error State (if error)
│   └── Error Banner with retry option
│
└── Data Display (when loaded)
    ├── Welcome Header with Refresh Button
    │
    ├── Statistics Cards (4 cards)
    │   ├── Total Users → navigate('/admin/users')
    │   ├── Active Users → navigate('/admin/users')
    │   ├── Pending KYC → navigate('/admin/users?kycStatus=pending')
    │   └── Admin Users → navigate('/admin/users?role=admin')
    │
    ├── Main Content Grid
    │   ├── Recent User Registrations (left, 2 cols)
    │   │   ├── User card 1 (with avatar, role badge, KYC status)
    │   │   ├── User card 2
    │   │   ├── User card 3
    │   │   ├── User card 4
    │   │   └── User card 5
    │   │
    │   └── Sidebar (right, 1 col)
    │       ├── System Alerts
    │       │   ├── KYC Pending Alert (if any)
    │       │   ├── Banned Users Alert (if any)
    │       │   ├── Rejected KYC Alert (if any)
    │       │   └── "All Systems Operational" (if no alerts)
    │       │
    │       └── Quick Actions
    │           ├── Manage Users Button
    │           ├── View Statistics Button
    │           └── System Settings Button
    │
    └── Registration Trend Chart (full width)
        └── Bar chart showing last 7 days
```

## State Management

```javascript
// AdminDashboard Component State
const [loading, setLoading] = useState(true);
const [statistics, setStatistics] = useState(null);
const [recentUsers, setRecentUsers] = useState([]);
const [error, setError] = useState(null);

// Lifecycle
useEffect(() => {
  fetchDashboardData(); // Runs on component mount
}, []);

// Data Fetching Function
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Parallel API calls
    const [statsResponse, usersResponse] = await Promise.all([
      adminAPI.getUserStatistics(),
      adminAPI.getAllUsers({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
    ]);
    
    setStatistics(statsResponse.data);
    setRecentUsers(usersResponse.data.users || []);
  } catch (err) {
    setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};
```

## Security Flow

```
User Request
    │
    ├─► Request Interceptor (api/index.js)
    │   └─► Adds: Authorization: Bearer {accessToken}
    │
    ├─► Backend Middleware Chain
    │   ├─► authMiddleware
    │   │   ├─► Verify JWT token
    │   │   ├─► Check token expiration
    │   │   └─► Attach user to req.user
    │   │
    │   └─► adminMiddleware
    │       ├─► Check req.user.role === 'admin'
    │       └─► Reject if not admin (403 Forbidden)
    │
    └─► Controller Function
        └─► Process request & return data
```

## Error Handling

```
Try-Catch in fetchDashboardData()
    │
    ├─► Network Error
    │   └─► Display: "Failed to load dashboard data"
    │
    ├─► 401 Unauthorized
    │   ├─► Response Interceptor attempts token refresh
    │   ├─► If refresh fails:
    │   │   ├─► Clear localStorage
    │   │   ├─► Trigger 'authChange' event
    │   │   └─► Redirect to login
    │   └─► If refresh succeeds:
    │       └─► Retry original request
    │
    ├─► 403 Forbidden (Not Admin)
    │   └─► Display: "Access denied"
    │
    └─► Other Errors
        └─► Display error message from response
```

## Performance Optimizations

1. **Parallel API Calls**: Statistics and recent users fetched simultaneously
2. **Lazy Loading**: Charts only rendered when data is available
3. **Memoization**: Consider using `useMemo` for computed values
4. **Debouncing**: Search inputs debounced in UserManagement
5. **Pagination**: Only fetch limited records at a time
6. **Conditional Rendering**: Efficient rendering based on state

## Future Enhancements

1. **WebSocket Integration**: Real-time updates without refresh
2. **Caching**: Use React Query for smart caching
3. **Optimistic Updates**: Update UI before API confirmation
4. **Virtual Scrolling**: For large user lists
5. **Service Worker**: Offline support
6. **Analytics**: Track admin actions for audit logs
