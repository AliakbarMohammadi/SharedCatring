const { CompanyJoinRequest, Company, Employee } = require('../models');
const eventPublisher = require('../events/publisher');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const axios = require('axios');

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002';

class JoinRequestService {
  /**
   * Create a join request
   * ایجاد درخواست عضویت در شرکت
   */
  async create(userId, companyId, message = null) {
    // Check if company exists and is active
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw { statusCode: 404, code: 'ERR_COMPANY_NOT_FOUND', message: 'شرکت یافت نشد' };
    }
    if (company.status !== 'active') {
      throw { statusCode: 400, code: 'ERR_COMPANY_NOT_ACTIVE', message: 'این شرکت فعال نیست' };
    }

    // Check if user is already an employee of any company
    const existingEmployee = await Employee.findOne({ where: { userId } });
    if (existingEmployee) {
      throw { statusCode: 400, code: 'ERR_ALREADY_EMPLOYEE', message: 'شما در حال حاضر کارمند یک شرکت هستید' };
    }

    // Check if user has a pending request for this company
    const existingRequest = await CompanyJoinRequest.findOne({
      where: { userId, companyId, status: 'pending' }
    });
    if (existingRequest) {
      throw { statusCode: 400, code: 'ERR_REQUEST_EXISTS', message: 'شما قبلاً درخواست عضویت در این شرکت را ارسال کرده‌اید' };
    }

    // Check if user has any pending request
    const anyPendingRequest = await CompanyJoinRequest.findOne({
      where: { userId, status: 'pending' }
    });
    if (anyPendingRequest) {
      throw { statusCode: 400, code: 'ERR_PENDING_REQUEST_EXISTS', message: 'شما یک درخواست در انتظار بررسی دارید' };
    }

    const request = await CompanyJoinRequest.create({
      userId,
      companyId,
      message,
      status: 'pending'
    });

    await eventPublisher.publish('company.join_request.created', {
      requestId: request.id,
      userId,
      companyId,
      companyName: company.name
    });

    logger.info('درخواست عضویت ایجاد شد', { requestId: request.id, userId, companyId });

    return this.format(request, company);
  }

  /**
   * Get requests for a company (for company_admin)
   * دریافت درخواست‌های یک شرکت
   */
  async findByCompany(companyId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const where = { companyId };
    if (status) where.status = status;

    const { count, rows } = await CompanyJoinRequest.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'logoUrl'] }],
      order: [['created_at', 'DESC']]
    });

    // Fetch user details from Identity Service
    const userIds = [...new Set(rows.map(r => r.userId))];
    const usersMap = await this.fetchUsersInfo(userIds);

    return {
      requests: rows.map(r => this.formatWithUser(r, usersMap[r.userId])),
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
    };
  }

  /**
   * Fetch user info from Identity Service
   * دریافت اطلاعات کاربران از سرویس هویت
   */
  async fetchUsersInfo(userIds) {
    if (!userIds.length) return {};
    
    const usersMap = {};
    
    try {
      // Fetch each user's info
      const promises = userIds.map(async (userId) => {
        try {
          const response = await axios.get(
            `${IDENTITY_SERVICE_URL}/api/v1/identity/users/${userId}`,
            {
              headers: {
                'x-user-role': 'super_admin',
                'x-user-id': 'system'
              },
              timeout: 5000
            }
          );
          if (response.data?.success && response.data?.data) {
            usersMap[userId] = response.data.data;
          }
        } catch (err) {
          logger.warn('خطا در دریافت اطلاعات کاربر', { userId, error: err.message });
        }
      });
      
      await Promise.all(promises);
    } catch (error) {
      logger.error('خطا در دریافت اطلاعات کاربران', { error: error.message });
    }
    
    return usersMap;
  }

  /**
   * Get requests by user
   * دریافت درخواست‌های یک کاربر
   */
  async findByUser(userId) {
    const requests = await CompanyJoinRequest.findAll({
      where: { userId },
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'logoUrl'] }],
      order: [['created_at', 'DESC']]
    });

    return requests.map(r => this.format(r));
  }

  /**
   * Approve a join request
   * تأیید درخواست عضویت
   */
  async approve(requestId, reviewerId) {
    const request = await CompanyJoinRequest.findByPk(requestId, {
      include: [{ model: Company, as: 'company' }]
    });

    if (!request) {
      throw { statusCode: 404, code: 'ERR_REQUEST_NOT_FOUND', message: 'درخواست یافت نشد' };
    }
    if (request.status !== 'pending') {
      throw { statusCode: 400, code: 'ERR_REQUEST_PROCESSED', message: 'این درخواست قبلاً بررسی شده است' };
    }

    // Create employee record
    const employee = await Employee.create({
      userId: request.userId,
      companyId: request.companyId,
      status: 'active',
      joinedAt: new Date()
    });

    // Update request status
    await request.update({
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    });

    // Update user role in Identity Service
    try {
      await this.updateUserRole(request.userId, 'employee', request.companyId);
    } catch (error) {
      logger.error('خطا در تغییر نقش کاربر', { userId: request.userId, error: error.message });
      // Don't throw - employee is created, role update can be retried
    }

    await eventPublisher.publish('company.join_request.approved', {
      requestId: request.id,
      userId: request.userId,
      companyId: request.companyId,
      employeeId: employee.id
    });

    logger.info('درخواست عضویت تأیید شد', { requestId, userId: request.userId, companyId: request.companyId });

    return this.format(request);
  }

  /**
   * Reject a join request
   * رد درخواست عضویت
   */
  async reject(requestId, reviewerId, reason = null) {
    const request = await CompanyJoinRequest.findByPk(requestId, {
      include: [{ model: Company, as: 'company' }]
    });

    if (!request) {
      throw { statusCode: 404, code: 'ERR_REQUEST_NOT_FOUND', message: 'درخواست یافت نشد' };
    }
    if (request.status !== 'pending') {
      throw { statusCode: 400, code: 'ERR_REQUEST_PROCESSED', message: 'این درخواست قبلاً بررسی شده است' };
    }

    await request.update({
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: reason
    });

    await eventPublisher.publish('company.join_request.rejected', {
      requestId: request.id,
      userId: request.userId,
      companyId: request.companyId,
      reason
    });

    logger.info('درخواست عضویت رد شد', { requestId, userId: request.userId });

    return this.format(request);
  }

  /**
   * Cancel a pending request (by user)
   * لغو درخواست توسط کاربر
   */
  async cancel(requestId, userId) {
    const request = await CompanyJoinRequest.findOne({
      where: { id: requestId, userId, status: 'pending' }
    });

    if (!request) {
      throw { statusCode: 404, code: 'ERR_REQUEST_NOT_FOUND', message: 'درخواست یافت نشد یا قابل لغو نیست' };
    }

    await request.destroy();
    logger.info('درخواست عضویت لغو شد', { requestId, userId });

    return { id: requestId };
  }

  /**
   * Update user role in Identity Service
   * تغییر نقش کاربر در سرویس هویت
   */
  async updateUserRole(userId, role, companyId = null) {
    try {
      await axios.post(
        `${IDENTITY_SERVICE_URL}/api/v1/identity/users/${userId}/assign-role`,
        { role },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': 'super_admin', // Service-to-service call
            'x-user-id': 'system'
          },
          timeout: 5000
        }
      );

      // Also update companyId in user profile
      if (companyId) {
        await axios.patch(
          `${IDENTITY_SERVICE_URL}/api/v1/identity/users/${userId}`,
          { companyId },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'x-user-role': 'super_admin',
              'x-user-id': 'system'
            },
            timeout: 5000
          }
        );
      }

      logger.info('نقش کاربر تغییر کرد', { userId, role, companyId });
    } catch (error) {
      logger.error('خطا در تغییر نقش کاربر', { userId, role, error: error.message });
      throw error;
    }
  }

  format(r, company = null) {
    const comp = company || r.company;
    return {
      id: r.id,
      userId: r.userId,
      companyId: r.companyId,
      status: r.status,
      message: r.message,
      reviewedBy: r.reviewedBy,
      reviewedAt: r.reviewedAt,
      rejectionReason: r.rejectionReason,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      company: comp ? { id: comp.id, name: comp.name, logoUrl: comp.logoUrl } : null
    };
  }

  formatWithUser(r, user = null) {
    const result = this.format(r);
    result.user = user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    } : null;
    return result;
  }
}

module.exports = new JoinRequestService();
