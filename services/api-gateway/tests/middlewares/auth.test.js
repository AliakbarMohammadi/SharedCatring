const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../../src/middlewares/auth.middleware');
const config = require('../../src/config');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      path: '/api/v1/users',
      method: 'GET',
      ip: '127.0.0.1'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('باید برای مسیرهای عمومی next را فراخوانی کند', () => {
    mockReq.path = '/api/v1/auth/login';
    mockReq.method = 'POST';

    authMiddleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('باید برای درخواست بدون توکن خطای 401 برگرداند', () => {
    authMiddleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_UNAUTHORIZED'
        })
      })
    );
  });

  it('باید برای توکن نامعتبر خطای 401 برگرداند', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';

    authMiddleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_INVALID_TOKEN'
        })
      })
    );
  });

  it('باید برای توکن معتبر اطلاعات کاربر را به request اضافه کند', () => {
    const payload = {
      userId: '123',
      email: 'test@test.com',
      role: 'employee',
      companyId: '456'
    };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
    mockReq.headers.authorization = `Bearer ${token}`;

    authMiddleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.userId).toBe('123');
    expect(mockReq.headers['x-user-id']).toBe('123');
    expect(mockReq.headers['x-user-role']).toBe('employee');
    expect(mockReq.headers['x-company-id']).toBe('456');
  });

  it('باید برای توکن منقضی شده خطای مناسب برگرداند', () => {
    const payload = { userId: '123', email: 'test@test.com', role: 'employee' };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '-1h' });
    mockReq.headers.authorization = `Bearer ${token}`;

    authMiddleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ERR_TOKEN_EXPIRED'
        })
      })
    );
  });
});
