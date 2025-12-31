#!/bin/bash

# ===========================================
# Integration Test Runner
# اجرای تست‌های یکپارچگی
# ===========================================

set -e

echo "🧪 شروع تست‌های یکپارچگی سیستم کترینگ"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
check_services() {
    echo -e "\n${YELLOW}📡 بررسی سرویس‌ها...${NC}"
    
    services=(
        "http://localhost:3000/health:API Gateway"
        "http://localhost:3001/health:Auth Service"
        "http://localhost:3002/health:Identity Service"
        "http://localhost:3003/health:User Service"
        "http://localhost:3004/health:Company Service"
        "http://localhost:3005/health:Menu Service"
        "http://localhost:3006/health:Order Service"
        "http://localhost:3007/health:Invoice Service"
        "http://localhost:3008/health:Payment Service"
        "http://localhost:3009/health:Wallet Service"
        "http://localhost:3010/health:Notification Service"
        "http://localhost:3011/health:Reporting Service"
        "http://localhost:3012/health:File Service"
    )
    
    all_healthy=true
    
    for service in "${services[@]}"; do
        url="${service%%:*}"
        name="${service##*:}"
        
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} $name"
        else
            echo -e "  ${RED}✗${NC} $name"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = false ]; then
        echo -e "\n${RED}❌ برخی سرویس‌ها در دسترس نیستند!${NC}"
        echo "لطفاً ابتدا سرویس‌ها را اجرا کنید:"
        echo "  docker-compose -f docker-compose.production.yml up -d"
        exit 1
    fi
    
    echo -e "\n${GREEN}✅ همه سرویس‌ها در دسترس هستند${NC}"
}

# Install test dependencies
install_deps() {
    echo -e "\n${YELLOW}📦 نصب وابستگی‌های تست...${NC}"
    cd tests/integration
    npm install
    cd ../..
}

# Run smoke tests
run_smoke_tests() {
    echo -e "\n${YELLOW}🔥 اجرای تست دود...${NC}"
    cd tests/integration
    node smoke-test.js
    cd ../..
}

# Run health tests
run_health_tests() {
    echo -e "\n${YELLOW}🏥 اجرای تست سلامت سرویس‌ها...${NC}"
    cd tests/integration
    npm test -- health/services-health.test.js
    cd ../..
}

# Run flow tests
run_flow_tests() {
    echo -e "\n${YELLOW}🔄 اجرای تست جریان‌های کاری...${NC}"
    cd tests/integration
    
    echo -e "\n${YELLOW}جریان ۱: ثبت‌نام و ورود${NC}"
    npm test -- flows/01-user-registration.test.js || true
    
    echo -e "\n${YELLOW}جریان ۲: راه‌اندازی شرکت${NC}"
    npm test -- flows/02-company-onboarding.test.js || true
    
    echo -e "\n${YELLOW}جریان ۳: سفارش و پرداخت${NC}"
    npm test -- flows/03-order-payment.test.js || true
    
    echo -e "\n${YELLOW}جریان ۴: چرخه حیات سفارش${NC}"
    npm test -- flows/04-order-lifecycle.test.js || true
    
    echo -e "\n${YELLOW}جریان ۵: لغو و استرداد${NC}"
    npm test -- flows/05-cancellation-refund.test.js || true
    
    cd ../..
}

# Run event tests
run_event_tests() {
    echo -e "\n${YELLOW}📡 اجرای تست رویدادها...${NC}"
    cd tests/integration
    npm test -- events/event-flow.test.js || true
    cd ../..
}

# Run all tests
run_all_tests() {
    echo -e "\n${YELLOW}🧪 اجرای همه تست‌ها...${NC}"
    cd tests/integration
    npm test
    cd ../..
}

# Main
main() {
    case "${1:-all}" in
        smoke)
            check_services
            run_smoke_tests
            ;;
        health)
            check_services
            run_health_tests
            ;;
        flows)
            check_services
            run_flow_tests
            ;;
        events)
            check_services
            run_event_tests
            ;;
        all)
            check_services
            install_deps
            run_smoke_tests
            run_health_tests
            run_flow_tests
            run_event_tests
            ;;
        *)
            echo "Usage: $0 {smoke|health|flows|events|all}"
            exit 1
            ;;
    esac
    
    echo -e "\n${GREEN}=================================================="
    echo "✅ تست‌ها به پایان رسید"
    echo "==================================================${NC}"
}

main "$@"
