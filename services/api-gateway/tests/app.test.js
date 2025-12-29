const request = require('supertest');
const { createApp } = require('../src/app');

describe('API Gateway', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /health', () => {
    it('باید وضعیت سلامت سرویس را برگرداند', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toBe('api-gateway');
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.message).toBe('سرویس در حال اجرا است');
    });

    it('باید هدر X-Request-ID را برگرداند', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('باید هدرهای rate limit را برگرداند', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('باید برای مسیرهای محافظت شده بدون توکن خطا برگرداند', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_UNAUTHORIZED');
    });

    it('باید برای توکن نامعتبر خطا برگرداند', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_INVALID_TOKEN');
    });

    it('باید مسیرهای عمومی را بدون توکن اجازه دهد', async () => {
      // Note: This will fail with 503 if auth-service is not running
      // but it should not return 401
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: 'test@test.com', password: 'test' });

      expect(response.status).not.toBe(401);
    });
  });

  describe('404 Handler', () => {
    it('باید برای مسیرهای ناموجود خطای 404 برگرداند', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_NOT_FOUND');
      expect(response.body.error.message).toBe('مسیر درخواستی یافت نشد');
    });
  });

  describe('CORS', () => {
    it('باید هدرهای CORS را برگرداند', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3001')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
