const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3011,
  serviceName: process.env.SERVICE_NAME || 'reporting-service',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'reporting_db',
    user: process.env.DB_USER || 'catering_user',
    password: process.env.DB_PASSWORD || 'catering_pass_123'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  cache: {
    ttl: {
      dashboard: parseInt(process.env.CACHE_TTL_DASHBOARD, 10) || 300,
      daily: parseInt(process.env.CACHE_TTL_DAILY, 10) || 3600,
      monthly: parseInt(process.env.CACHE_TTL_MONTHLY, 10) || 21600
    }
  }
};
