#!/bin/bash

################################################################################
# SERVICE HEALTH CHECKER
# Checks the health and status of all microservices
################################################################################

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service URLs
GATEWAY_URL="${GATEWAY_URL:-http://localhost:3000}"
AUTH_URL="${AUTH_URL:-http://localhost:3001}"
FLEET_URL="${FLEET_URL:-http://localhost:3002}"
RESERVATION_URL="${RESERVATION_URL:-http://localhost:3004}"
FEEDBACK_URL="${FEEDBACK_URL:-http://localhost:3007}"
PROMOTION_URL="${PROMOTION_URL:-http://localhost:3008}"

# Print header
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🏥  CAR RENTAL PLATFORM - HEALTH CHECK  🏥             ║"
echo "║                                                                ║"
echo "╔════════════════════════════════════════════════════════════════╝"
echo ""

# Function to check service health
check_service() {
    local service_name=$1
    local service_url=$2
    local health_endpoint="${service_url}/health"
    
    printf "Checking %-25s" "$service_name..."
    
    # Try to get health endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$health_endpoint" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    elif [ "$response" = "503" ]; then
        echo -e "${YELLOW}⚠ DEGRADED${NC}"
        return 1
    else
        echo -e "${RED}✗ UNHEALTHY (HTTP $response)${NC}"
        return 2
    fi
}

# Function to check if port is open
check_port() {
    local service_name=$1
    local port=$2
    
    if nc -z localhost "$port" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to get detailed service info from gateway
get_gateway_details() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊  DETAILED SERVICE STATUS (from Gateway)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    response=$(curl -s "$GATEWAY_URL/health" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "$response" | jq -r '
            .services | to_entries[] | 
            "
Service: \(.key)
  Status: \(.value.status)
  URL: \(.value.url)
  Last Check: \(.value.lastCheck // "N/A")
  Response Time: \(.value.responseTime // "N/A")ms
  Consecutive Failures: \(.value.consecutiveFailures)
  Availability: \(.value.availability)
  Total Requests: \(.value.totalRequests)
  Failed Requests: \(.value.failedRequests)
"'
    else
        echo -e "${RED}✗ Could not retrieve detailed status from gateway${NC}"
    fi
}

# Check Gateway
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐  API GATEWAY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
gateway_status=0
check_service "API Gateway" "$GATEWAY_URL" || gateway_status=$?

# Check all microservices
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌  MICROSERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

services_status=0

check_service "Auth Service (3001)" "$AUTH_URL" || services_status=$((services_status + 1))
check_service "Fleet Service (3002)" "$FLEET_URL" || services_status=$((services_status + 1))
check_service "Reservation Service (3004)" "$RESERVATION_URL" || services_status=$((services_status + 1))
check_service "Feedback Service (3007)" "$FEEDBACK_URL" || services_status=$((services_status + 1))
check_service "Promotion Service (3008)" "$PROMOTION_URL" || services_status=$((services_status + 1))

# Check Dependencies
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️   DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

deps_status=0

# MongoDB
printf "Checking %-25s" "MongoDB (27017)..."
if check_port "MongoDB" 27017; then
    # Try to ping MongoDB
    mongo_status=$(mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null)
    if [ "$mongo_status" = "1" ]; then
        echo -e "${GREEN}✓ RUNNING${NC}"
    else
        echo -e "${YELLOW}⚠ PORT OPEN (ping failed)${NC}"
        deps_status=$((deps_status + 1))
    fi
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    deps_status=$((deps_status + 1))
fi

# Redis
printf "Checking %-25s" "Redis (6379)..."
if check_port "Redis" 6379; then
    redis_status=$(redis-cli ping 2>/dev/null)
    if [ "$redis_status" = "PONG" ]; then
        echo -e "${GREEN}✓ RUNNING${NC}"
    else
        echo -e "${YELLOW}⚠ PORT OPEN (ping failed)${NC}"
        deps_status=$((deps_status + 1))
    fi
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    deps_status=$((deps_status + 1))
fi

# Get detailed status from gateway if available
if [ $gateway_status -eq 0 ]; then
    get_gateway_details
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋  SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

total_issues=$((gateway_status + services_status + deps_status))

if [ $gateway_status -eq 0 ]; then
    echo -e "Gateway:        ${GREEN}✓ Operational${NC}"
else
    echo -e "Gateway:        ${RED}✗ Issues Detected${NC}"
fi

healthy_services=$((5 - services_status))
echo -e "Microservices:  ${BLUE}$healthy_services/5 Healthy${NC}"

healthy_deps=$((2 - deps_status))
echo -e "Dependencies:   ${BLUE}$healthy_deps/2 Running${NC}"

echo ""
if [ $total_issues -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║              ✓ ALL SYSTEMS OPERATIONAL ✓                       ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}║              ⚠ ISSUES DETECTED ($total_issues) ⚠                            ║${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    echo ""
    echo "💡 Troubleshooting Tips:"
    echo ""
    
    if [ $gateway_status -ne 0 ]; then
        echo "  Gateway Issues:"
        echo "    • Start gateway: cd backend/gateway-service && npm run dev"
        echo "    • Check logs: tail -f backend/gateway-service/logs/combined.log"
        echo "    • Verify .env configuration"
        echo ""
    fi
    
    if [ $services_status -ne 0 ]; then
        echo "  Microservice Issues:"
        echo "    • Start all services: cd backend && docker-compose up"
        echo "    • Or start individually: cd backend/<service> && npm run dev"
        echo "    • Check service logs for errors"
        echo ""
    fi
    
    if [ $deps_status -ne 0 ]; then
        echo "  Dependency Issues:"
        echo "    • Start MongoDB: mongod --dbpath /path/to/data"
        echo "    • Start Redis: redis-server"
        echo "    • Or use Docker: docker-compose up mongo redis"
        echo ""
    fi
    
    exit 1
fi
