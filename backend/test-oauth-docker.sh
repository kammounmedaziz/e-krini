#!/bin/bash

# Docker OAuth Test Script for Car Rental App
# This script helps test Google OAuth integration with Docker

echo "🔍 Testing Docker OAuth Setup for Car Rental App"
echo "================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in backend directory"
    echo "   Please copy .env.example to .env and fill in your credentials"
    exit 1
fi

# Check for required environment variables
echo "📋 Checking environment variables..."

REQUIRED_VARS=("GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "FRONTEND_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env || grep -q "^$var=your-" .env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing or placeholder values for:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please update your .env file with real Google OAuth credentials"
    echo "See DOCKER_OAUTH_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ Environment variables configured"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "✅ Docker is running"

# Test Docker Compose configuration
echo "🔧 Testing Docker Compose configuration..."
if ! docker-compose config >/dev/null 2>&1; then
    echo "❌ Docker Compose configuration is invalid"
    exit 1
fi

echo "✅ Docker Compose configuration is valid"

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check if auth service is running
if ! docker-compose ps auth-user-service | grep -q "Up"; then
    echo "❌ Auth service failed to start"
    echo "Check logs with: docker-compose logs auth-user-service"
    exit 1
fi

echo "✅ Auth service is running"

# Test OAuth endpoint accessibility
echo "🌐 Testing OAuth endpoints..."
AUTH_URL="http://localhost:3001/api/v1/auth"

# Test Google OAuth endpoint (should redirect)
if curl -s -o /dev/null -w "%{http_code}" "$AUTH_URL/google" | grep -q "302"; then
    echo "✅ Google OAuth endpoint responding (redirect as expected)"
else
    echo "⚠️  Google OAuth endpoint not responding as expected"
    echo "   This might be normal if credentials are not configured yet"
fi

# Check service logs for any OAuth-related errors
echo "📝 Checking for OAuth configuration in logs..."
if docker-compose logs auth-user-service 2>&1 | grep -q "GOOGLE_CLIENT_ID"; then
    echo "✅ OAuth environment variables loaded in container"
else
    echo "❌ OAuth environment variables not found in container logs"
fi

echo ""
echo "🎉 Docker OAuth setup test completed!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Try clicking 'Sign in with Google'"
echo "3. Check browser network tab for OAuth flow"
echo "4. Monitor logs: docker-compose logs -f auth-user-service"
echo ""
echo "If you encounter issues, check DOCKER_OAUTH_SETUP.md"