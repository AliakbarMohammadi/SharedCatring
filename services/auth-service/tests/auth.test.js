const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../src/app');
const { Token, Session } = require('../src/models');
const tokenService = require('../src/services/token.service');
const authService = require('../src/services/auth.service');

let app;
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test
  await Token.deleteMany({});
  await Session.deleteMany({});
});

describe('Auth Service', () => {
  describe('GET /health', () => {
    it('باید وضعیت سلامت سرویس را برگرداند', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toBe('auth-service');
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.message).toBe('سرویس در حال اجرا است');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('باید کاربر جدید را ثبت‌نام کند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          phone: '09121234567',
          password: 'Test@123456',
          role: 'personal_user'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.userId).toBeDefined();
    });

    it('باید برای ایمیل نامعتبر خطا برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test@123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_VALIDATION');
    });

    it('باید برای رمز عبور ضعیف خطا برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_VALIDATION');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('باید برای اطلاعات نامعتبر خطا برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('باید برای ایمیل خالی خطای اعتبارسنجی برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'Test@123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_VALIDATION');
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('باید برای توکن نامعتبر خطا برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: 'invalid-token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_INVALID_REFRESH_TOKEN');
    });

    it('باید برای توکن خالی خطای اعتبارسنجی برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_VALIDATION');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('باید درخواست بازیابی رمز عبور را قبول کند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'test@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should always return success to prevent email enumeration
    });

    it('باید برای ایمیل نامعتبر خطا برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('باید برای توکن نامعتبر خطا برگرداند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewPass@123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_INVALID_RESET_TOKEN');
    });
  });

  describe('POST /api/v1/auth/verify-token', () => {
    it('باید توکن معتبر را تأیید کند', async () => {
      const accessToken = tokenService.generateAccessToken({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'personal_user'
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-token')
        .send({
          token: accessToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.userId).toBe('test-user-id');
    });

    it('باید توکن نامعتبر را رد کند', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-token')
        .send({
          token: 'invalid-token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('404 Handler', () => {
    it('باید برای مسیر ناموجود خطای 404 برگرداند', async () => {
      const response = await request(app)
        .get('/api/v1/auth/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ERR_NOT_FOUND');
    });
  });
});

describe('Token Service', () => {
  describe('generateAccessToken', () => {
    it('باید توکن JWT معتبر تولید کند', () => {
      const payload = { userId: 'test-id', email: 'test@test.com' };
      const token = tokenService.generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('باید توکن معتبر را تأیید کند', () => {
      const payload = { userId: 'test-id', email: 'test@test.com' };
      const token = tokenService.generateAccessToken(payload);
      const decoded = tokenService.verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('test-id');
      expect(decoded.email).toBe('test@test.com');
    });

    it('باید برای توکن نامعتبر null برگرداند', () => {
      const decoded = tokenService.verifyAccessToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('باید توکن تصادفی تولید کند', () => {
      const token1 = tokenService.generateRefreshToken();
      const token2 = tokenService.generateRefreshToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });
  });
});

describe('Auth Service', () => {
  describe('hashPassword', () => {
    it('باید رمز عبور را هش کند', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });
  });

  describe('comparePassword', () => {
    it('باید رمز عبور صحیح را تأیید کند', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.comparePassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('باید رمز عبور نادرست را رد کند', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.comparePassword('WrongPassword', hash);
      
      expect(isValid).toBe(false);
    });
  });
});
