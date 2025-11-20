#!/bin/bash

# Admin User Management Test Script
# This script tests all admin endpoints

echo "🧪 Testing Admin User Management Endpoints"
echo "=========================================="
echo ""

# Base URL
BASE_URL="http://localhost:3001/api/v1"

# First, we need to login as admin to get a token
echo "1️⃣  Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }')

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to login as admin. Please create an admin user first."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Admin login successful"
echo ""

# Test 1: Get all users
echo "2️⃣  Testing: Get all users with pagination"
curl -s -X GET "$BASE_URL/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.' || echo "Failed to get users"
echo ""

# Test 2: Get user statistics
echo "3️⃣  Testing: Get user statistics"
curl -s -X GET "$BASE_URL/admin/users/statistics" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.' || echo "Failed to get statistics"
echo ""

# Test 3: Search users
echo "4️⃣  Testing: Search users"
curl -s -X GET "$BASE_URL/admin/users?search=admin&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.' || echo "Failed to search users"
echo ""

# Test 4: Filter by role
echo "5️⃣  Testing: Filter users by role"
curl -s -X GET "$BASE_URL/admin/users?role=client&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.' || echo "Failed to filter by role"
echo ""

echo "✅ All tests completed!"
echo ""
echo "📝 Notes:"
echo "  - Make sure you have an admin user in your database"
echo "  - Update the login credentials if needed"
echo "  - For full testing, try the frontend at http://localhost:5173/admin/users"
