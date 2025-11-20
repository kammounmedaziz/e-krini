#!/bin/bash

# Test Face Authentication Flow

BASE_URL="http://localhost:3001/api/v1"

echo "======================================"
echo "Testing Face Authentication System"
echo "======================================"
echo ""

# Step 1: Register a test user
echo "1. Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "facetest",
    "email": "facetest@test.com",
    "password": "Test123!@#",
    "role": "client"
  }')

echo "Register response:"
echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token. User might already exist. Trying login..."
  
  # Try to login instead
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "facetest",
      "password": "Test123!@#"
    }')
  
  echo "Login response:"
  echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
  echo ""
  
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null)
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to authenticate. Cannot continue test."
  exit 1
fi

echo "✅ Access token obtained"
echo ""

# Step 2: Enable face authentication
echo "2. Enabling face authentication..."
ENABLE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/enable-face-auth" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Enable face auth response:"
echo "$ENABLE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ENABLE_RESPONSE"
echo ""

# Step 3: Test face login
echo "3. Testing face login..."
FACE_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login-face" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "facetest",
    "imageData": "base64_fake_image_data_for_testing"
  }')

echo "Face login response:"
echo "$FACE_LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$FACE_LOGIN_RESPONSE"
echo ""

# Check if successful
if echo "$FACE_LOGIN_RESPONSE" | grep -q '"success".*:.*true'; then
  echo "✅ Face login test PASSED!"
else
  echo "❌ Face login test FAILED"
fi

echo ""
echo "======================================"
echo "Test Complete"
echo "======================================"
