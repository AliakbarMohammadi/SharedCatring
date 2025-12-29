-- Initialize PostgreSQL databases for each service

-- Auth Service Database
CREATE DATABASE auth_db;

-- Identity Service Database
CREATE DATABASE identity_db;

-- User Service Database
CREATE DATABASE user_db;

-- Company Service Database
CREATE DATABASE company_db;

-- Order Service Database
CREATE DATABASE order_db;

-- Invoice Service Database
CREATE DATABASE invoice_db;

-- Payment Service Database
CREATE DATABASE payment_db;

-- Wallet Service Database
CREATE DATABASE wallet_db;

-- Reporting Service Database
CREATE DATABASE reporting_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE auth_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE identity_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE user_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE company_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE order_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE wallet_db TO catering_user;
GRANT ALL PRIVILEGES ON DATABASE reporting_db TO catering_user;
