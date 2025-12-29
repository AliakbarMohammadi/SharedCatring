const ServiceClient = require('./ServiceClient');
const CircuitBreaker = require('./CircuitBreaker');

/**
 * Create pre-configured service clients
 * @returns {Object} Object containing all service clients
 */
const createServiceClients = (options = {}) => {
  const services = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    identity: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    company: process.env.COMPANY_SERVICE_URL || 'http://localhost:3004',
    menu: process.env.MENU_SERVICE_URL || 'http://localhost:3005',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3006',
    invoice: process.env.INVOICE_SERVICE_URL || 'http://localhost:3007',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3008',
    wallet: process.env.WALLET_SERVICE_URL || 'http://localhost:3009',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3010',
    reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3011',
    file: process.env.FILE_SERVICE_URL || 'http://localhost:3012'
  };

  const clients = {};
  for (const [name, url] of Object.entries(services)) {
    clients[name] = new ServiceClient(url, {
      timeout: options.timeout || 10000,
      retries: options.retries || 3,
      ...options
    });
  }

  return clients;
};

module.exports = {
  ServiceClient,
  CircuitBreaker,
  createServiceClients
};
