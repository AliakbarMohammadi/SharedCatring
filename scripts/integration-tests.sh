#!/bin/bash

# Integration Tests for Catering System
# Tests all business flows end-to-end

set -e

echo "🧪 Running Integration Tests..."
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Base URLs
API_GATEWAY="http://localhost:3000"
AUTH_SERVICE="http://localhost:3001"
IDENTITY_SERVICE="http://localhost:3002"
USER_SERVICE="http://localhost:3003"
COMPANY_SERVICE="http://localhost:3004"
MENU_SERVICE="http://localhost:3005"
ORDER_SERVICE="http://localhost:3006"
INVOICE_SERVICE="http://localhost:3007"
PAYMENT_SERVICE="http://localhost:3008"
WALLET_SERVICE="http://localhost:3009"
NOTIFICATION_SERVICE="http://localhost:3010"
REPORTING_SERVICE="http://localhost:3011"
FILE_SERVICE="http://localhost:3012"

# Test counters
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=$5
  local headers=$6
  
  echo -n "  Testing: $name... "
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" $headers "$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method -H "Content-Type: application/json" $headers -d "$data" "$url")
  fi
  
  status=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status" == "$expected_status" ]; then
    echo -e "${GREEN}PASSED${NC} (HTTP $status)"
    ((PASSED++))
    echo "$body" | head -1
  else
    echo -e "${RED}FAILED${NC} (Expected $expected_status, got $status)"
    ((FAILED++))
    echo "$body" | head -3
  fi
  echo ""
}

# Health check function
check_health() {
  local service=$1
  local url=$2
  
  echo -n "  $service: "
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" 2>/dev/null || echo "000")
  
  if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
    return 0
  else
    echo -e "${RED}✗ Not responding (HTTP $response)${NC}"
    return 1
  fi
}

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 1: Health Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

HEALTHY_COUNT=0
TOTAL_SERVICES=13

check_health "API Gateway" "$API_GATEWAY" && ((HEALTHY_COUNT++))
check_health "Auth Service" "$AUTH_SERVICE" && ((HEALTHY_COUNT++))
check_health "Identity Service" "$IDENTITY_SERVICE" && ((HEALTHY_COUNT++))
check_health "User Service" "$USER_SERVICE" && ((HEALTHY_COUNT++))
check_health "Company Service" "$COMPANY_SERVICE" && ((HEALTHY_COUNT++))
check_health "Menu Service" "$MENU_SERVICE" && ((HEALTHY_COUNT++))
check_health "Order Service" "$ORDER_SERVICE" && ((HEALTHY_COUNT++))
check_health "Invoice Service" "$INVOICE_SERVICE" && ((HEALTHY_COUNT++))
check_health "Payment Service" "$PAYMENT_SERVICE" && ((HEALTHY_COUNT++))
check_health "Wallet Service" "$WALLET_SERVICE" && ((HEALTHY_COUNT++))
check_health "Notification Service" "$NOTIFICATION_SERVICE" && ((HEALTHY_COUNT++))
check_health "Reporting Service" "$REPORTING_SERVICE" && ((HEALTHY_COUNT++))
check_health "File Service" "$FILE_SERVICE" && ((HEALTHY_COUNT++))

echo ""
echo -e "Health Check Summary: ${GREEN}$HEALTHY_COUNT${NC}/$TOTAL_SERVICES services healthy"
echo ""

if [ $HEALTHY_COUNT -lt $TOTAL_SERVICES ]; then
  echo -e "${RED}Not all services are healthy. Please start all services first.${NC}"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 2: User Registration & Login Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Generate unique test data
TIMESTAMP=$(date +%s)
TEST_PHONE="0912${TIMESTAMP: -7}"
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_PASSWORD="Test@123456"

echo "Test User: $TEST_EMAIL / $TEST_PHONE"
echo ""

# Register user
test_endpoint "Register User" "POST" "$AUTH_SERVICE/api/v1/auth/register" \
  "{\"phone\":\"$TEST_PHONE\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"firstName\":\"تست\",\"lastName\":\"کاربر\"}" \
  "201"

# Login
echo "  Testing: Login..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\",\"password\":\"$TEST_PASSWORD\"}" \
  "$AUTH_SERVICE/api/v1/auth/login")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "  ${GREEN}PASSED${NC} - Got access token"
  ((PASSED++))
else
  echo -e "  ${RED}FAILED${NC} - No access token received"
  ((FAILED++))
  echo "$LOGIN_RESPONSE"
fi
echo ""

# Get user profile
test_endpoint "Get User Profile" "GET" "$USER_SERVICE/api/v1/users/profile" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 3: Company Onboarding Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Create company
COMPANY_NAME="شرکت تست $TIMESTAMP"
test_endpoint "Create Company" "POST" "$COMPANY_SERVICE/api/v1/companies" \
  "{\"name\":\"$COMPANY_NAME\",\"nationalId\":\"${TIMESTAMP}1234\",\"phone\":\"021${TIMESTAMP: -8}\",\"address\":\"تهران، خیابان تست\"}" \
  "201" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\""

# List companies
test_endpoint "List Companies" "GET" "$COMPANY_SERVICE/api/v1/companies" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-Role: admin\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 4: Menu Management Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Create category
test_endpoint "Create Menu Category" "POST" "$MENU_SERVICE/api/v1/menu/categories" \
  "{\"name\":\"غذای اصلی\",\"description\":\"انواع غذاهای اصلی\"}" \
  "201" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-Role: admin\""

# List categories
test_endpoint "List Categories" "GET" "$MENU_SERVICE/api/v1/menu/categories" "" "200"

# Create food item
test_endpoint "Create Food Item" "POST" "$MENU_SERVICE/api/v1/menu/foods" \
  "{\"name\":\"چلوکباب کوبیده\",\"description\":\"کباب کوبیده با برنج ایرانی\",\"price\":185000,\"categoryId\":\"1\"}" \
  "201" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-Role: admin\""

# List foods
test_endpoint "List Foods" "GET" "$MENU_SERVICE/api/v1/menu/foods" "" "200"

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 5: Wallet Operations Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Get wallet balance
test_endpoint "Get Wallet Balance" "GET" "$WALLET_SERVICE/api/v1/wallets/balance" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

# Topup wallet
test_endpoint "Topup Wallet" "POST" "$WALLET_SERVICE/api/v1/wallets/topup" \
  "{\"amount\":500000,\"balanceType\":\"personal\"}" \
  "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

# Get transactions
test_endpoint "Get Wallet Transactions" "GET" "$WALLET_SERVICE/api/v1/wallets/transactions" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 6: Order Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Create order
test_endpoint "Create Order" "POST" "$ORDER_SERVICE/api/v1/orders" \
  "{\"items\":[{\"foodId\":\"1\",\"quantity\":2,\"unitPrice\":185000}],\"deliveryDate\":\"2024-01-15\",\"deliverySlot\":\"lunch\"}" \
  "201" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

# List orders
test_endpoint "List Orders" "GET" "$ORDER_SERVICE/api/v1/orders" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 7: Payment Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Create payment request
test_endpoint "Create Payment Request" "POST" "$PAYMENT_SERVICE/api/v1/payments/request" \
  "{\"orderId\":\"test-order-id\",\"amount\":370000,\"gateway\":\"zarinpal\"}" \
  "201" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

# Get payment history
test_endpoint "Get Payment History" "GET" "$PAYMENT_SERVICE/api/v1/payments/history" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 8: Invoice Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# List invoices
test_endpoint "List Invoices" "GET" "$INVOICE_SERVICE/api/v1/invoices" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 9: Notification Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Get notifications
test_endpoint "Get Notifications" "GET" "$NOTIFICATION_SERVICE/api/v1/notifications" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

# Get unread count
test_endpoint "Get Unread Count" "GET" "$NOTIFICATION_SERVICE/api/v1/notifications/unread-count" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 10: Reporting Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Get dashboard
test_endpoint "Get Dashboard" "GET" "$REPORTING_SERVICE/api/v1/reports/dashboard" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\" -H \"X-User-Role: admin\""

# Get daily report
test_endpoint "Get Daily Report" "GET" "$REPORTING_SERVICE/api/v1/reports/orders/daily" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\" -H \"X-User-Role: admin\""

# Get popular items
test_endpoint "Get Popular Items" "GET" "$REPORTING_SERVICE/api/v1/reports/popular-items" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: test-user-id\" -H \"X-User-Role: admin\""

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Phase 11: File Service Flow${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# List files
test_endpoint "List Files" "GET" "$FILE_SERVICE/api/v1/files" "" "200" \
  "-H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"X-User-ID: 550e8400-e29b-41d4-a716-446655440000\""

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Results Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC} $PASSED"
echo -e "  ${RED}Failed:${NC} $FAILED"
echo -e "  Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
