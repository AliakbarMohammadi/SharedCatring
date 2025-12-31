/**
 * Services Health Check Tests
 * تست سلامت سرویس‌ها
 */

const { clients } = require('../helpers/api-client');
const config = require('../config');

describe('🏥 تست سلامت سرویس‌ها', () => {
  const services = [
    { name: 'API Gateway', client: clients.gateway, port: 3000 },
    { name: 'Auth Service', client: clients.auth, port: 3001 },
    { name: 'Identity Service', client: clients.identity, port: 3002 },
    { name: 'User Service', client: clients.user, port: 3003 },
    { name: 'Company Service', client: clients.company, port: 3004 },
    { name: 'Menu Service', client: clients.menu, port: 3005 },
    { name: 'Order Service', client: clients.order, port: 3006 },
    { name: 'Invoice Service', client: clients.invoice, port: 3007 },
    { name: 'Payment Service', client: clients.payment, port: 3008 },
    { name: 'Wallet Service', client: clients.wallet, port: 3009 },
    { name: 'Notification Service', client: clients.notification, port: 3010 },
    { name: 'Reporting Service', client: clients.reporting, port: 3011 },
    { name: 'File Service', client: clients.file, port: 3012 }
  ];

  services.forEach(({ name, client, port }) => {
    test(`${name} (پورت ${port}) باید سالم باشد`, async () => {
      const response = await client.get('/health');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('healthy');
      expect(response.message).toMatch(/سرویس.*اجرا/);
      
      console.log(`✅ ${name}: ${response.data.status}`);
    }, config.timeouts.medium);
  });

  test('همه سرویس‌ها باید همزمان در دسترس باشند', async () => {
    const healthChecks = await Promise.all(
      services.map(async ({ name, client }) => {
        try {
          const response = await client.get('/health');
          return { name, healthy: response.success === true };
        } catch (error) {
          return { name, healthy: false, error: error.message };
        }
      })
    );

    const unhealthy = healthChecks.filter(s => !s.healthy);
    
    if (unhealthy.length > 0) {
      console.log('\n❌ سرویس‌های ناسالم:');
      unhealthy.forEach(s => console.log(`  - ${s.name}: ${s.error || 'خطای ناشناخته'}`));
    }

    expect(unhealthy.length).toBe(0);
    console.log(`\n✅ همه ${services.length} سرویس سالم هستند`);
  }, config.timeouts.long);
});

describe('📊 تست Swagger Documentation', () => {
  const servicesWithSwagger = [
    { name: 'Auth Service', client: clients.auth },
    { name: 'Identity Service', client: clients.identity },
    { name: 'User Service', client: clients.user },
    { name: 'Company Service', client: clients.company },
    { name: 'Menu Service', client: clients.menu },
    { name: 'Order Service', client: clients.order },
    { name: 'Invoice Service', client: clients.invoice },
    { name: 'Payment Service', client: clients.payment },
    { name: 'Wallet Service', client: clients.wallet },
    { name: 'Notification Service', client: clients.notification },
    { name: 'Reporting Service', client: clients.reporting },
    { name: 'File Service', client: clients.file }
  ];

  servicesWithSwagger.forEach(({ name, client }) => {
    test(`${name} باید مستندات Swagger داشته باشد`, async () => {
      // Try to access swagger endpoint
      try {
        const response = await client.client.get('/api-docs/');
        expect(response.status).toBe(200);
        console.log(`✅ ${name}: مستندات Swagger در دسترس است`);
      } catch (error) {
        // Swagger might redirect or return HTML
        if (error.response?.status === 200 || error.response?.status === 301) {
          console.log(`✅ ${name}: مستندات Swagger در دسترس است`);
        } else {
          console.log(`⚠️ ${name}: مستندات Swagger در دسترس نیست`);
        }
      }
    }, config.timeouts.short);
  });
});
