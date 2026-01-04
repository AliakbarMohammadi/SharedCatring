const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3005,
  serviceName: process.env.SERVICE_NAME || 'menu-service',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/menu_db'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  cache: {
    ttl: {
      todayMenu: parseInt(process.env.CACHE_TTL_TODAY_MENU, 10) || 3600,
      weeklyMenu: parseInt(process.env.CACHE_TTL_WEEKLY_MENU, 10) || 21600,
      foodItem: parseInt(process.env.CACHE_TTL_FOOD_ITEM, 10) || 1800,
      categories: parseInt(process.env.CACHE_TTL_CATEGORIES, 10) || 3600
    }
  }
};
