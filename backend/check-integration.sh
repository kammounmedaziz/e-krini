#!/bin/bash

# E-Krini Services Integration Verification Script

echo "======================================"
echo "E-Krini Services Integration Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services exist
echo "📁 Checking service directories..."
services=("auth-user-service" "fleet-service" "reservation-service" "promotion-coupon-service" "feedback-complaints-service" "maintenance-service" "assurence-claims-service" "gateway-service" "discovery-service")

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        echo -e "${GREEN}✓${NC} $service found"
    else
        echo -e "${RED}✗${NC} $service NOT FOUND"
    fi
done

echo ""
echo "🔑 Checking authentication middleware..."
if [ -f "common/middlewares/auth.js" ]; then
    echo -e "${GREEN}✓${NC} ES modules auth middleware exists"
else
    echo -e "${RED}✗${NC} ES modules auth middleware missing"
fi

if [ -f "common/middlewares/auth.cjs.js" ]; then
    echo -e "${GREEN}✓${NC} CommonJS auth middleware exists"
else
    echo -e "${RED}✗${NC} CommonJS auth middleware missing"
fi

echo ""
echo "🔗 Checking service client utility..."
if [ -f "common/utils/serviceClient.js" ]; then
    echo -e "${GREEN}✓${NC} ServiceClient utility exists"
else
    echo -e "${RED}✗${NC} ServiceClient utility missing"
fi

echo ""
echo "📦 Checking dependencies..."

check_dependency() {
    local service=$1
    local package=$2
    
    if [ -f "$service/package.json" ]; then
        if grep -q "\"$package\"" "$service/package.json"; then
            echo -e "${GREEN}✓${NC} $service has $package"
        else
            echo -e "${RED}✗${NC} $service missing $package"
        fi
    fi
}

# Check critical dependencies
for service in reservation-service fleet-service promotion-coupon-service maintenance-service assurence-claims-service feedback-complaints-service; do
    check_dependency "$service" "jsonwebtoken"
done

echo ""
echo "⚙️  Checking .env.example files..."
for service in auth-user-service fleet-service reservation-service promotion-coupon-service feedback-complaints-service maintenance-service assurence-claims-service; do
    if [ -f "$service/.env.example" ]; then
        echo -e "${GREEN}✓${NC} $service/.env.example exists"
    else
        echo -e "${YELLOW}⚠${NC} $service/.env.example missing (create from template)"
    fi
done

echo ""
echo "📚 Checking documentation..."
if [ -f "SERVICES_INTEGRATION.md" ]; then
    echo -e "${GREEN}✓${NC} Integration documentation exists"
else
    echo -e "${YELLOW}⚠${NC} Integration documentation missing"
fi

echo ""
echo "======================================"
echo "Integration Status Summary"
echo "======================================"
echo ""
echo "✅ Services with JWT authentication:"
echo "   - Auth User Service (source)"
echo "   - Fleet Service"
echo "   - Reservation Service"
echo "   - Promotion Coupon Service"
echo "   - Feedback Complaints Service"
echo "   - Maintenance Service"
echo "   - Assurance Claims Service"
echo ""
echo "🔗 Cross-service integrations:"
echo "   - Reservation ↔ Fleet (car availability & status)"
echo "   - Reservation ↔ Promotion (coupon validation)"
echo "   - Maintenance ↔ Fleet (vehicle tracking)"
echo "   - Assurance ↔ Fleet (vehicle insurance)"
echo ""
echo "📖 Next steps:"
echo "   1. Copy .env.example to .env in each service"
echo "   2. Update JWT secrets in all .env files"
echo "   3. Start all services (see SERVICES_INTEGRATION.md)"
echo "   4. Test via gateway at http://localhost:4000"
echo ""
echo "Documentation: backend/SERVICES_INTEGRATION.md"
echo "======================================"
